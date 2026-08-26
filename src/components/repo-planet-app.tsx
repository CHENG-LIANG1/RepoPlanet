"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";

import { ActionControls } from "@/components/action-controls";
import { CommitTimeline } from "@/components/commit-timeline";
import { RepositoryForm } from "@/components/repository-form";
import { RepositoryInspector } from "@/components/repository-inspector";
import { TopNavigation } from "@/components/top-navigation";
import { demoRepoData } from "@/lib/demo-data";
import { parseRepositoryInput } from "@/lib/repository-url";
import type { RepoPlanetData } from "@/types/repository";

const PlanetCanvas = dynamic(
  () => import("@/components/planet/planet-canvas").then((module) => module.PlanetCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="planet-module-loading" role="status">
        <span />
        Preparing the world engine…
      </div>
    ),
  },
);

interface RepoPlanetAppProps {
  initialOwner?: string;
  initialRepo?: string;
}

export function RepoPlanetApp({ initialOwner, initialRepo }: RepoPlanetAppProps) {
  const router = useRouter();
  const initialKey = initialOwner && initialRepo ? `${initialOwner}/${initialRepo}` : null;
  const [requestedKey, setRequestedKey] = useState<string | null>(initialKey);
  const [input, setInput] = useState(
    initialOwner && initialRepo ? `https://github.com/${initialOwner}/${initialRepo}` : "",
  );
  const [generationVersion, setGenerationVersion] = useState(0);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [data, setData] = useState<RepoPlanetData>(demoRepoData);
  const [loading, setLoading] = useState(Boolean(initialKey));
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [activeCommitIndex, setActiveCommitIndex] = useState(
    Math.max(0, demoRepoData.commits.length - 1),
  );
  const [focusVersion, setFocusVersion] = useState(0);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!requestedKey) return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/github/${requestedKey}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as RepoPlanetData | { error?: string };
        if (!response.ok || !("repository" in payload)) {
          throw new Error("error" in payload && payload.error ? payload.error : "Unable to generate this planet.");
        }
        setData(payload);
        setGeneratedKey(requestedKey);
        setActiveCommitIndex(Math.max(0, payload.commits.length - 1));
        setFocusVersion((version) => version + 1);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Unable to generate this planet.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [generationVersion, requestedKey]);

  const inputRepository = useMemo(() => parseRepositoryInput(input), [input]);
  const inputKey = inputRepository ? `${inputRepository.owner}/${inputRepository.repo}` : null;

  const activeCommit = useMemo(
    () => data.commits[Math.min(activeCommitIndex, Math.max(0, data.commits.length - 1))] ?? null,
    [activeCommitIndex, data.commits],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseRepositoryInput(input);
    if (!parsed) {
      setError("Enter a complete public GitHub repository URL, such as https://github.com/facebook/react.");
      return;
    }
    const key = `${parsed.owner}/${parsed.repo}`;
    setRequestedKey(key);
    setGenerationVersion((version) => version + 1);
    router.push(`/r/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`);
  };

  const handleShare = async () => {
    const path = `/r/${data.repository.owner}/${data.repository.name}`;
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${data.repository.owner}/${data.repository.name} · RepoPlanet`,
          text: "Explore this living GitHub repository world.",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      setError("The share link could not be copied.");
    }
  };

  const handleExplore = () => setFocusVersion((version) => version + 1);

  return (
    <main className="app-shell">
      <TopNavigation onAbout={() => setAboutOpen(true)} />

      <section className="hero-copy" aria-labelledby="page-title">
        <h1 id="page-title">Any public GitHub repo can become a world.</h1>
        <p>
          Paste its full GitHub repository URL. RepoPlanet maps the code, contributors, issues, and
          releases into a living world you can explore.
        </p>
        <RepositoryForm
          value={input}
          loading={loading}
          error={error}
          generated={Boolean(generatedKey && inputKey === generatedKey)}
          onChange={(value) => {
            setInput(value);
            if (error) setError(null);
          }}
          onSubmit={handleSubmit}
        />
      </section>

      <section className="planet-stage" id="planet" aria-label="Repository planet viewport">
        <PlanetCanvas
          data={data}
          activeCommit={activeCommit}
          playing={playing}
          focusVersion={focusVersion}
        />
        {loading ? (
          <div className="generation-status" role="status">
            <Sparkles size={17} strokeWidth={1.8} aria-hidden="true" />
            Mapping {requestedKey} into districts and buildings…
          </div>
        ) : null}
      </section>

      <RepositoryInspector data={data} />

      <ActionControls
        playing={playing}
        shared={shared}
        onExplore={handleExplore}
        onTogglePlayback={() => setPlaying((current) => !current)}
        onShare={handleShare}
      />

      <CommitTimeline
        commits={data.commits}
        activeIndex={activeCommitIndex}
        playing={playing}
        referenceTime={data.generatedAt}
        onSelect={setActiveCommitIndex}
      />

      <div className="mobile-repo-strip" aria-hidden="true">
        <strong>{data.repository.owner}/{data.repository.name}</strong>
        <span>{data.repository.fileCount.toLocaleString()} files</span>
        <span>{data.repository.openIssues.toLocaleString()} issues</span>
      </div>

      {aboutOpen ? (
        <div className="about-backdrop" role="presentation" onMouseDown={() => setAboutOpen(false)}>
          <section
            className="about-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="about-close" type="button" onClick={() => setAboutOpen(false)} aria-label="Close about panel">
              <X size={20} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <h2 id="about-title">A repository that never stops growing.</h2>
            <p>
              RepoPlanet maps folders into districts, files into buildings, contributors into
              citizens, issues into beacons, and releases into celebrations. Click any building to
              open its source on GitHub.
            </p>
          </section>
        </div>
      ) : null}
    </main>
  );
}

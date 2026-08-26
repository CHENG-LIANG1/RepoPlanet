import {
  Activity,
  CircleAlert,
  ExternalLink,
  FileCode2,
  Tag,
  Users,
} from "lucide-react";

import { LANGUAGE_COLORS } from "@/lib/language";
import type { PlanetLanguage, RepoPlanetData } from "@/types/repository";

interface RepositoryInspectorProps {
  data: RepoPlanetData;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function RepositoryInspector({ data }: RepositoryInspectorProps) {
  const contributorLabel = data.repository.contributorCount
    ? formatNumber(data.repository.contributorCount)
    : `${data.contributors.length}+`;
  const releaseLabel = data.latestRelease?.tagName ?? "No releases";
  const visibleLanguages = ["JavaScript", "TypeScript", "Documentation"] as PlanetLanguage[];

  return (
    <aside className="repository-inspector" aria-label="Repository details">
      <a className="repository-title" href={data.repository.url} target="_blank" rel="noreferrer">
        <span className="repo-glyph" aria-hidden="true">
          {data.repository.name.slice(0, 1).toUpperCase()}
        </span>
        <span>
          {data.repository.owner} <b>/</b> {data.repository.name}
        </span>
        <ExternalLink size={15} strokeWidth={1.75} aria-hidden="true" />
      </a>

      <div className="inspector-stats">
        <div>
          <FileCode2 size={19} strokeWidth={1.75} aria-hidden="true" />
          <span>{formatNumber(data.repository.fileCount)} files</span>
        </div>
        <div>
          <Users size={19} strokeWidth={1.75} aria-hidden="true" />
          <span>{contributorLabel} contributors</span>
        </div>
        <div>
          <CircleAlert size={19} strokeWidth={1.75} aria-hidden="true" />
          <span>{formatNumber(data.repository.openIssues)} open issues</span>
        </div>
        <div>
          <Tag size={19} strokeWidth={1.75} aria-hidden="true" />
          <span>
            Latest release <strong>{releaseLabel}</strong>
          </span>
        </div>
      </div>

      <div className="language-legend" aria-label="Planet legend">
        {visibleLanguages.map((language) => (
          <div key={language}>
            <span className="legend-dot" style={{ backgroundColor: LANGUAGE_COLORS[language] }} />
            <span>{language === "Documentation" ? "Docs" : language}</span>
          </div>
        ))}
        <div>
          <Activity className="activity-icon" size={18} strokeWidth={2} aria-hidden="true" />
          <span>Recent activity</span>
        </div>
      </div>

      {data.truncated ? (
        <p className="simplified-note">
          Showing {formatNumber(data.repository.visualizedFileCount)} representative buildings.
        </p>
      ) : null}
    </aside>
  );
}

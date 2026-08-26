import { useEffect } from "react";

import type { PlanetCommit } from "@/types/repository";

interface CommitTimelineProps {
  commits: PlanetCommit[];
  activeIndex: number;
  playing: boolean;
  referenceTime: string;
  onSelect: (index: number) => void;
}

function relativeTime(date: string, referenceTime: string): string {
  const delta = Math.max(0, new Date(referenceTime).getTime() - new Date(date).getTime());
  const minutes = Math.max(1, Math.round(delta / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function CommitTimeline({ commits, activeIndex, playing, referenceTime, onSelect }: CommitTimelineProps) {
  useEffect(() => {
    if (!playing || commits.length < 2) return;
    const timer = window.setInterval(() => {
      onSelect((activeIndex + 1) % commits.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [activeIndex, commits.length, onSelect, playing]);

  if (!commits.length) return null;
  const active = commits[Math.min(activeIndex, commits.length - 1)];
  const progress = commits.length > 1 ? (activeIndex / (commits.length - 1)) * 100 : 100;

  return (
    <section className="commit-timeline" aria-label="Recent commit timeline">
      <div className="timeline-labels">
        <span>{commits.length} recent commits</span>
        <span>Now</span>
      </div>
      <div className="timeline-track">
        <div className="timeline-progress" style={{ width: `${progress}%` }} />
        {commits.map((commit, index) => (
          <button
            key={commit.sha}
            className={index === activeIndex ? "is-active" : ""}
            style={{ left: `${commits.length > 1 ? (index / (commits.length - 1)) * 100 : 100}%` }}
            type="button"
            onClick={() => onSelect(index)}
            title={commit.message}
            aria-label={`Commit ${index + 1}: ${commit.message}`}
          />
        ))}
      </div>
      <div className="commit-callout" style={{ left: `${Math.min(84, Math.max(27, progress))}%` }}>
        <span>{relativeTime(active.date, referenceTime)}</span>
        <strong>{active.message}</strong>
        <small>
          <b>+{active.additions}</b> <i>−{active.deletions}</i>
        </small>
      </div>
    </section>
  );
}

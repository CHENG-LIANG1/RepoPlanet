import { Compass, Copy, Pause, Play, Share2 } from "lucide-react";

interface ActionControlsProps {
  playing: boolean;
  shared: boolean;
  onExplore: () => void;
  onTogglePlayback: () => void;
  onShare: () => void;
}

export function ActionControls({
  playing,
  shared,
  onExplore,
  onTogglePlayback,
  onShare,
}: ActionControlsProps) {
  return (
    <div className="action-controls" aria-label="Planet controls">
      <button className="is-primary" type="button" onClick={onExplore} aria-label="Explore planet">
        <Compass size={19} strokeWidth={1.75} aria-hidden="true" />
        <span>Explore</span>
      </button>
      <button type="button" onClick={onTogglePlayback} aria-label={playing ? "Pause timeline" : "Play timeline"}>
        {playing ? (
          <Pause size={19} strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Play size={19} strokeWidth={1.75} aria-hidden="true" />
        )}
        <span>{playing ? "Pause" : "Play"}</span>
      </button>
      <button type="button" onClick={onShare} aria-label={shared ? "Share link copied" : "Share planet"}>
        {shared ? (
          <Copy size={19} strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Share2 size={19} strokeWidth={1.75} aria-hidden="true" />
        )}
        <span>{shared ? "Copied" : "Share"}</span>
      </button>
    </div>
  );
}

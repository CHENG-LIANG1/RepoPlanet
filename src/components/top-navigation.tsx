import { Info } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { GitHubMark } from "@/components/icons/github-mark";

interface TopNavigationProps {
  onAbout: () => void;
}

export function TopNavigation({ onAbout }: TopNavigationProps) {
  return (
    <header className="top-navigation">
      <BrandMark />
      <nav aria-label="Primary navigation">
        <a
          href="https://github.com/CHENG-LIANG1/RepoPlanet"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubMark width={18} height={18} />
          GitHub
        </a>
        <button type="button" onClick={onAbout}>
          <Info size={18} strokeWidth={1.75} aria-hidden="true" />
          About
        </button>
      </nav>
    </header>
  );
}

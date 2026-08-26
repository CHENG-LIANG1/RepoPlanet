import { Compass, Info } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";

interface TopNavigationProps {
  onExplore: () => void;
  onAbout: () => void;
}

export function TopNavigation({ onExplore, onAbout }: TopNavigationProps) {
  return (
    <header className="top-navigation">
      <BrandMark />
      <nav aria-label="Primary navigation">
        <button type="button" onClick={onExplore}>
          <Compass size={18} strokeWidth={1.75} aria-hidden="true" />
          Explore
        </button>
        <button type="button" onClick={onAbout}>
          <Info size={18} strokeWidth={1.75} aria-hidden="true" />
          About
        </button>
      </nav>
    </header>
  );
}

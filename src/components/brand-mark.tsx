import Link from "next/link";
import { Orbit } from "lucide-react";

export function BrandMark() {
  return (
    <Link className="brand-mark" href="/" aria-label="RepoPlanet home">
      <span className="brand-icon" aria-hidden="true">
        <Orbit size={29} strokeWidth={1.8} />
      </span>
      <span>
        Repo<span>Planet</span>
      </span>
    </Link>
  );
}

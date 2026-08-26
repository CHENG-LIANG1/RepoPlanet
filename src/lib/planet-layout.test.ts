import { describe, expect, it } from "vitest";

import { demoRepoData } from "./demo-data";
import { createPlanetLayout } from "./planet-layout";

describe("createPlanetLayout", () => {
  it("creates one stable building transform per visualized file", () => {
    const first = createPlanetLayout(demoRepoData.files);
    const second = createPlanetLayout(demoRepoData.files);

    expect(first.buildings).toHaveLength(demoRepoData.files.length);
    expect(first).toEqual(second);
    expect(first.districts.length).toBeGreaterThan(1);
    expect(first.districts.length).toBeLessThanOrEqual(8);
  });

  it("keeps all geometry finite and inside the planet footprint", () => {
    const layout = createPlanetLayout(demoRepoData.files);

    for (const building of layout.buildings) {
      expect(Number.isFinite(building.x)).toBe(true);
      expect(Number.isFinite(building.z)).toBe(true);
      expect(Number.isFinite(building.height)).toBe(true);
      expect(Math.hypot(building.x, building.z)).toBeLessThan(4.9);
      expect(building.height).toBeGreaterThan(0);
    }
  });
});

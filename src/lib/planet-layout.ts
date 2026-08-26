import { LANGUAGE_COLORS } from "@/lib/language";
import type { PlanetFile } from "@/types/repository";

export interface BuildingLayout {
  file: PlanetFile;
  x: number;
  z: number;
  height: number;
  width: number;
  depth: number;
  rotation: number;
  color: string;
}

export interface DistrictLayout {
  name: string;
  x: number;
  z: number;
  radius: number;
  color: string;
  fileCount: number;
}

export interface PlanetLayout {
  buildings: BuildingLayout[];
  districts: DistrictLayout[];
}

const DISTRICT_CENTERS = [
  [0, -2.65],
  [1.88, -1.88],
  [2.65, 0],
  [1.88, 1.88],
  [0, 2.65],
  [-1.88, 1.88],
  [-2.65, 0],
  [-1.88, -1.88],
] as const;

function hashString(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function topDirectory(path: string): string {
  const parts = path.split("/");
  if (parts.length === 1) return "root";
  if (parts[0] === "packages" && parts[1]) return parts[1];
  return parts[0];
}

export function createPlanetLayout(files: PlanetFile[]): PlanetLayout {
  const grouped = new Map<string, PlanetFile[]>();
  for (const file of files) {
    const key = topDirectory(file.path);
    grouped.set(key, [...(grouped.get(key) ?? []), file]);
  }

  const ranked = [...grouped.entries()].sort((a, b) => b[1].length - a[1].length);
  const primary = ranked.slice(0, 7);
  const overflow = ranked.slice(7).flatMap(([, groupFiles]) => groupFiles);
  if (overflow.length) primary.push(["other", overflow]);

  const largestDistrict = Math.max(1, ...primary.map(([, groupFiles]) => groupFiles.length));
  const districts: DistrictLayout[] = [];
  const buildings: BuildingLayout[] = [];

  primary.forEach(([name, groupFiles], districtIndex) => {
    const [centerX, centerZ] = DISTRICT_CENTERS[districtIndex] ?? [0, 0];
    const radius = 0.6 + Math.sqrt(groupFiles.length / largestDistrict) * 0.52;
    const dominantLanguage = groupFiles.reduce<Record<string, number>>((counts, file) => {
      counts[file.language] = (counts[file.language] ?? 0) + 1;
      return counts;
    }, {});
    const language = Object.entries(dominantLanguage).sort((a, b) => b[1] - a[1])[0]?.[0] as PlanetFile["language"] | undefined;

    districts.push({
      name,
      x: centerX,
      z: centerZ,
      radius,
      color: LANGUAGE_COLORS[language ?? "Other"],
      fileCount: groupFiles.length,
    });

    const largestFile = Math.max(1, ...groupFiles.map((file) => file.size));

    groupFiles
      .slice()
      .sort((a, b) => b.size - a.size || a.path.localeCompare(b.path))
      .forEach((file, fileIndex) => {
        const hash = hashString(file.path);
        const normalized = Math.sqrt((fileIndex + 0.65) / Math.max(1, groupFiles.length));
        const angle = fileIndex * 2.399963 + (hash % 360) * (Math.PI / 180) * 0.08;
        const localRadius = normalized * radius * 0.78;
        const sizeFactor = file.size / largestFile;
        const width = 0.075 + ((hash >>> 3) % 6) / 100 + Math.sqrt(sizeFactor) * 0.055;
        const depth = 0.075 + ((hash >>> 7) % 6) / 100 + Math.sqrt(sizeFactor) * 0.05;
        const height = 0.13 + Math.pow(sizeFactor, 1.22) * 1.35;

        buildings.push({
          file,
          x: centerX + Math.cos(angle) * localRadius,
          z: centerZ + Math.sin(angle) * localRadius,
          height,
          width,
          depth,
          rotation: ((hash % 13) - 6) * 0.025,
          color: file.recent ? "#d8ff3e" : LANGUAGE_COLORS[file.language],
        });
      });
  });

  return { buildings, districts };
}

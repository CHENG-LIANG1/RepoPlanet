import type { PlanetLanguage } from "@/types/repository";

const TYPESCRIPT = new Set(["ts", "tsx", "mts", "cts"]);
const JAVASCRIPT = new Set(["js", "jsx", "mjs", "cjs"]);
const CSS = new Set(["css", "scss", "sass", "less", "styl"]);
const HTML = new Set(["html", "htm", "vue", "svelte"]);
const DOCUMENTATION = new Set(["md", "mdx", "rst", "txt"]);
const DATA = new Set(["json", "jsonc", "yaml", "yml", "toml", "xml", "csv"]);

export function extensionForPath(path: string): string {
  const filename = path.split("/").at(-1) ?? path;
  const index = filename.lastIndexOf(".");
  return index > 0 ? filename.slice(index + 1).toLowerCase() : "";
}

export function classifyFile(path: string): PlanetLanguage {
  const extension = extensionForPath(path);
  if (TYPESCRIPT.has(extension)) return "TypeScript";
  if (JAVASCRIPT.has(extension)) return "JavaScript";
  if (CSS.has(extension)) return "CSS";
  if (HTML.has(extension)) return "HTML";
  if (DOCUMENTATION.has(extension)) return "Documentation";
  if (DATA.has(extension)) return "Data";
  return "Other";
}

export const LANGUAGE_COLORS: Record<PlanetLanguage, string> = {
  JavaScript: "#d8ff3e",
  TypeScript: "#45a3ff",
  CSS: "#43ccff",
  HTML: "#ff7a68",
  Documentation: "#9f73ff",
  Data: "#61e2b6",
  Other: "#728197",
};

import type { ParsedRepository } from "@/types/repository";

const PART_PATTERN = /^[A-Za-z0-9_.-]+$/;

export function parseRepositoryInput(input: string): ParsedRepository | null {
  const trimmed = input.trim().replace(/\/$/, "");
  if (!trimmed) return null;

  let path = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
        return null;
      }
      path = url.pathname;
    } catch {
      return null;
    }
  } else {
    path = path.replace(/^github\.com\//i, "");
  }

  const [owner, rawRepo, ...rest] = path.replace(/^\//, "").split("/");
  const repo = rawRepo?.replace(/\.git$/i, "");

  if (
    !owner ||
    !repo ||
    rest.length > 0 ||
    !PART_PATTERN.test(owner) ||
    !PART_PATTERN.test(repo)
  ) {
    return null;
  }

  return { owner, repo };
}

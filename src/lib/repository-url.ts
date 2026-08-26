import type { ParsedRepository } from "@/types/repository";

const PART_PATTERN = /^[A-Za-z0-9_.-]+$/;

export function parseRepositoryInput(input: string): ParsedRepository | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    (url.hostname !== "github.com" && url.hostname !== "www.github.com") ||
    url.username ||
    url.password ||
    url.port
  ) {
    return null;
  }

  const [owner, rawRepo, ...rest] = url.pathname.replace(/^\//, "").replace(/\/$/, "").split("/");
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

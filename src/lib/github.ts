import "server-only";

import { classifyFile, extensionForPath } from "@/lib/language";
import type {
  PlanetCommit,
  PlanetContributor,
  PlanetFile,
  PlanetIssue,
  PlanetRelease,
  RepoPlanetData,
} from "@/types/repository";

const GITHUB_API = "https://api.github.com";
const MAX_VISUALIZED_FILES = 1400;
const RECENT_COMMIT_DETAILS = 8;

interface GitHubRepository {
  name: string;
  owner: { login: string };
  description: string | null;
  html_url: string;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
}

interface GitHubTree {
  truncated: boolean;
  tree: Array<{
    path: string;
    type: "blob" | "tree";
    size?: number;
    sha: string;
  }>;
}

interface GitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

interface GitHubIssue {
  number: number;
  title: string;
  html_url: string;
  labels: Array<{ name?: string } | string>;
  created_at: string;
  pull_request?: unknown;
}

interface GitHubRelease {
  name: string | null;
  tag_name: string;
  html_url: string;
  published_at: string | null;
}

interface GitHubCommitListItem {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; date: string } | null;
  };
  author: { login: string; avatar_url: string } | null;
}

interface GitHubCommitDetail extends GitHubCommitListItem {
  stats?: { additions: number; deletions: number };
  files?: Array<{ filename: string }>;
}

export class GitHubRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly rateLimitRemaining: string | null,
  ) {
    super(message);
    this.name = "GitHubRequestError";
  }
}

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RepoPlanet",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function githubFetch<T>(path: string, revalidate = 900): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: githubHeaders(),
    next: { revalidate },
  });

  if (!response.ok) {
    let message = `GitHub request failed with status ${response.status}.`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // Keep the status-based message when GitHub does not return JSON.
    }
    throw new GitHubRequestError(
      message,
      response.status,
      response.headers.get("x-ratelimit-remaining"),
    );
  }

  return (await response.json()) as T;
}

async function optionalGithubFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    return await githubFetch<T>(path);
  } catch {
    return fallback;
  }
}

function selectVisualFiles(files: PlanetFile[]): PlanetFile[] {
  if (files.length <= MAX_VISUALIZED_FILES) return files;

  const largest = files.slice().sort((a, b) => b.size - a.size).slice(0, 180);
  const selectedPaths = new Set(largest.map((file) => file.path));
  const remaining = files
    .filter((file) => !selectedPaths.has(file.path))
    .sort((a, b) => a.path.localeCompare(b.path));
  const slots = MAX_VISUALIZED_FILES - largest.length;
  const stride = remaining.length / slots;
  const sampled = Array.from({ length: slots }, (_, index) => remaining[Math.floor(index * stride)]).filter(Boolean);

  return [...largest, ...sampled];
}

function issueLabels(issue: GitHubIssue): string[] {
  return issue.labels
    .map((label) => (typeof label === "string" ? label : label.name ?? ""))
    .filter(Boolean)
    .slice(0, 3);
}

export async function fetchRepositoryPlanet(owner: string, repo: string): Promise<RepoPlanetData> {
  const encodedOwner = encodeURIComponent(owner);
  const encodedRepo = encodeURIComponent(repo);
  const basePath = `/repos/${encodedOwner}/${encodedRepo}`;
  const repository = await githubFetch<GitHubRepository>(basePath);
  const encodedBranch = encodeURIComponent(repository.default_branch);

  const [tree, contributors, issues, releases, commitList] = await Promise.all([
    githubFetch<GitHubTree>(`${basePath}/git/trees/${encodedBranch}?recursive=1`, 1800),
    optionalGithubFetch<GitHubContributor[]>(`${basePath}/contributors?per_page=12&anon=1`, []),
    optionalGithubFetch<GitHubIssue[]>(`${basePath}/issues?state=open&sort=updated&per_page=30`, []),
    optionalGithubFetch<GitHubRelease[]>(`${basePath}/releases?per_page=1`, []),
    optionalGithubFetch<GitHubCommitListItem[]>(`${basePath}/commits?per_page=12`, []),
  ]);

  const commitDetails = await Promise.all(
    commitList.slice(0, RECENT_COMMIT_DETAILS).map((commit) =>
      optionalGithubFetch<GitHubCommitDetail>(`${basePath}/commits/${commit.sha}`, commit),
    ),
  );
  const detailsBySha = new Map(commitDetails.map((commit) => [commit.sha, commit]));
  const recentFiles = new Map<string, string>();
  for (const detail of commitDetails) {
    for (const file of detail.files ?? []) {
      recentFiles.set(file.filename, detail.sha);
    }
  }

  const allFiles: PlanetFile[] = tree.tree
    .filter((entry) => entry.type === "blob")
    .map((entry) => ({
      path: entry.path,
      size: entry.size ?? 0,
      extension: extensionForPath(entry.path),
      language: classifyFile(entry.path),
      recent: recentFiles.has(entry.path),
      lastCommitSha: recentFiles.get(entry.path),
    }));
  const visualFiles = selectVisualFiles(allFiles);

  const mappedContributors: PlanetContributor[] = contributors.map((contributor) => ({
    login: contributor.login,
    avatarUrl: contributor.avatar_url,
    contributions: contributor.contributions,
    url: contributor.html_url,
  }));

  const mappedIssues: PlanetIssue[] = issues
    .filter((issue) => !issue.pull_request)
    .slice(0, 8)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      labels: issueLabels(issue),
      createdAt: issue.created_at,
    }));

  const mappedRelease: PlanetRelease | null = releases[0]
    ? {
        name: releases[0].name || releases[0].tag_name,
        tagName: releases[0].tag_name,
        url: releases[0].html_url,
        publishedAt: releases[0].published_at,
      }
    : null;

  const mappedCommits: PlanetCommit[] = commitList
    .map((commit) => {
      const detail = detailsBySha.get(commit.sha);
      return {
        sha: commit.sha,
        message: commit.commit.message.split("\n")[0],
        author: commit.author?.login ?? commit.commit.author?.name ?? "Unknown",
        avatarUrl: commit.author?.avatar_url ?? null,
        date: commit.commit.author?.date ?? new Date().toISOString(),
        url: commit.html_url,
        files: detail?.files?.map((file) => file.filename).slice(0, 24) ?? [],
        additions: detail?.stats?.additions ?? 0,
        deletions: detail?.stats?.deletions ?? 0,
      };
    })
    .reverse();

  return {
    repository: {
      owner: repository.owner.login,
      name: repository.name,
      description: repository.description,
      url: repository.html_url,
      defaultBranch: repository.default_branch,
      stars: repository.stargazers_count,
      forks: repository.forks_count,
      fileCount: allFiles.length,
      visualizedFileCount: visualFiles.length,
      contributorCount: mappedContributors.length === 12 ? null : mappedContributors.length,
      openIssues: repository.open_issues_count,
      primaryLanguage: repository.language,
    },
    files: visualFiles,
    contributors: mappedContributors,
    issues: mappedIssues,
    latestRelease: mappedRelease,
    commits: mappedCommits,
    generatedAt: new Date().toISOString(),
    source: "github",
    truncated: tree.truncated || allFiles.length > visualFiles.length,
  };
}

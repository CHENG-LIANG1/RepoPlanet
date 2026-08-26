export type PlanetLanguage =
  | "JavaScript"
  | "TypeScript"
  | "CSS"
  | "HTML"
  | "Documentation"
  | "Data"
  | "Other";

export interface PlanetFile {
  path: string;
  size: number;
  extension: string;
  language: PlanetLanguage;
  recent: boolean;
  lastCommitSha?: string;
}

export interface RepositorySummary {
  owner: string;
  name: string;
  description: string | null;
  url: string;
  defaultBranch: string;
  stars: number;
  forks: number;
  fileCount: number;
  visualizedFileCount: number;
  contributorCount: number | null;
  openIssues: number;
  primaryLanguage: string | null;
}

export interface PlanetContributor {
  login: string;
  avatarUrl: string;
  contributions: number;
  url: string;
}

export interface PlanetIssue {
  number: number;
  title: string;
  url: string;
  labels: string[];
  createdAt: string;
}

export interface PlanetRelease {
  name: string;
  tagName: string;
  url: string;
  publishedAt: string | null;
}

export interface PlanetCommit {
  sha: string;
  message: string;
  author: string;
  avatarUrl: string | null;
  date: string;
  url: string;
  files: string[];
  additions: number;
  deletions: number;
}

export interface RepoPlanetData {
  repository: RepositorySummary;
  files: PlanetFile[];
  contributors: PlanetContributor[];
  issues: PlanetIssue[];
  latestRelease: PlanetRelease | null;
  commits: PlanetCommit[];
  generatedAt: string;
  source: "github" | "demo";
  truncated: boolean;
}

export interface ParsedRepository {
  owner: string;
  repo: string;
}

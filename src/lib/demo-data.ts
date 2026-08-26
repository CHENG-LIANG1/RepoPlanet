import { classifyFile, extensionForPath } from "@/lib/language";
import type { PlanetFile, RepoPlanetData } from "@/types/repository";

const DEMO_DISTRICTS = [
  { path: "packages/react/src", count: 72, extensions: ["js", "ts", "tsx"] },
  { path: "packages/react-dom/src", count: 84, extensions: ["js", "ts", "tsx"] },
  { path: "packages/scheduler/src", count: 44, extensions: ["js", "ts"] },
  { path: "compiler/packages/babel-plugin-react-compiler/src", count: 68, extensions: ["ts", "tsx"] },
  { path: "fixtures", count: 40, extensions: ["jsx", "css", "html"] },
  { path: "scripts", count: 34, extensions: ["js", "json"] },
  { path: "docs", count: 38, extensions: ["md", "mdx"] },
  { path: "packages/shared", count: 42, extensions: ["js", "ts"] },
] as const;

function createDemoFiles(): PlanetFile[] {
  return DEMO_DISTRICTS.flatMap((district, districtIndex) =>
    Array.from({ length: district.count }, (_, fileIndex) => {
      const extension = district.extensions[fileIndex % district.extensions.length];
      const path = `${district.path}/${district.path.split("/").at(-1)}-${String(fileIndex + 1).padStart(3, "0")}.${extension}`;
      return {
        path,
        size: 900 + ((fileIndex * 7919 + districtIndex * 3571) % 62000),
        extension: extensionForPath(path),
        language: classifyFile(path),
        recent: (fileIndex + districtIndex * 3) % 17 === 0,
        lastCommitSha: (fileIndex + districtIndex) % 17 === 0 ? `demo${districtIndex}${fileIndex}` : undefined,
      };
    }),
  );
}

const files = createDemoFiles();
const DEMO_GENERATED_AT = "2026-08-26T03:30:00.000Z";
const DEMO_GENERATED_AT_MS = new Date(DEMO_GENERATED_AT).getTime();

export const demoRepoData: RepoPlanetData = {
  repository: {
    owner: "facebook",
    name: "react",
    description: "The library for web and native user interfaces.",
    url: "https://github.com/facebook/react",
    defaultBranch: "main",
    stars: 240000,
    forks: 49000,
    fileCount: 6842,
    visualizedFileCount: files.length,
    contributorCount: 1812,
    openIssues: 43,
    primaryLanguage: "JavaScript",
  },
  files,
  contributors: [
    {
      login: "gaearon",
      avatarUrl: "https://avatars.githubusercontent.com/u/810438?v=4",
      contributions: 2654,
      url: "https://github.com/gaearon",
    },
    {
      login: "acdlite",
      avatarUrl: "https://avatars.githubusercontent.com/u/3624098?v=4",
      contributions: 1972,
      url: "https://github.com/acdlite",
    },
    {
      login: "sebmarkbage",
      avatarUrl: "https://avatars.githubusercontent.com/u/63648?v=4",
      contributions: 1830,
      url: "https://github.com/sebmarkbage",
    },
    {
      login: "bvaughn",
      avatarUrl: "https://avatars.githubusercontent.com/u/29597?v=4",
      contributions: 1118,
      url: "https://github.com/bvaughn",
    },
    {
      login: "lunaruan",
      avatarUrl: "https://avatars.githubusercontent.com/u/33301967?v=4",
      contributions: 514,
      url: "https://github.com/lunaruan",
    },
  ],
  issues: [
    {
      number: 34102,
      title: "Improve hydration error diagnostics",
      url: "https://github.com/facebook/react/issues",
      labels: ["Component: DOM"],
      createdAt: "2026-08-23T09:20:00Z",
    },
    {
      number: 34091,
      title: "Compiler output differs for nested memoization",
      url: "https://github.com/facebook/react/issues",
      labels: ["React Compiler"],
      createdAt: "2026-08-21T14:40:00Z",
    },
    {
      number: 34065,
      title: "Document the new transition tracing behavior",
      url: "https://github.com/facebook/react/issues",
      labels: ["Status: Unconfirmed"],
      createdAt: "2026-08-19T08:10:00Z",
    },
  ],
  latestRelease: {
    name: "React 19.1.1",
    tagName: "v19.1.1",
    url: "https://github.com/facebook/react/releases",
    publishedAt: "2026-07-28T00:00:00Z",
  },
  commits: Array.from({ length: 12 }, (_, index) => ({
    sha: `demo-commit-${index}`,
    message: [
      "Fix act() warning in tests",
      "Refine compiler pipeline diagnostics",
      "Update server components fixture",
      "Reduce hydration bookkeeping",
    ][index % 4],
    author: ["gaearon", "acdlite", "sebmarkbage", "lunaruan"][index % 4],
    avatarUrl: null,
    date: new Date(DEMO_GENERATED_AT_MS - (11 - index) * 3_600_000).toISOString(),
    url: "https://github.com/facebook/react/commits/main",
    files: files.slice(index * 3, index * 3 + 5).map((file) => file.path),
    additions: 8 + index * 3,
    deletions: 2 + (index % 4) * 2,
  })),
  generatedAt: DEMO_GENERATED_AT,
  source: "demo",
  truncated: false,
};

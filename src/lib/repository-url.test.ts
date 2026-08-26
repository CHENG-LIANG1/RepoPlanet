import { describe, expect, it } from "vitest";

import { parseRepositoryInput } from "./repository-url";

describe("parseRepositoryInput", () => {
  it.each([
    ["https://github.com/facebook/react", { owner: "facebook", repo: "react" }],
    ["http://github.com/mrdoob/three.js", { owner: "mrdoob", repo: "three.js" }],
    ["https://www.github.com/vercel/next.js.git/", { owner: "vercel", repo: "next.js" }],
    ["https://github.com/vuejs/core?tab=readme-ov-file", { owner: "vuejs", repo: "core" }],
  ])("parses %s", (input, expected) => {
    expect(parseRepositoryInput(input)).toEqual(expected);
  });

  it.each([
    "",
    "github.com/facebook/react",
    "vuejs/core",
    "https://gitlab.com/facebook/react",
    "github.com/facebook",
    "github.com/facebook/react/issues",
    "ftp://github.com/facebook/react",
    "not a repository",
  ])("rejects %s", (input) => {
    expect(parseRepositoryInput(input)).toBeNull();
  });
});

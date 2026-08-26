import { describe, expect, it } from "vitest";

import { parseRepositoryInput } from "./repository-url";

describe("parseRepositoryInput", () => {
  it.each([
    ["https://github.com/facebook/react", { owner: "facebook", repo: "react" }],
    ["github.com/mrdoob/three.js", { owner: "mrdoob", repo: "three.js" }],
    ["vuejs/core", { owner: "vuejs", repo: "core" }],
    ["https://www.github.com/vercel/next.js.git/", { owner: "vercel", repo: "next.js" }],
  ])("parses %s", (input, expected) => {
    expect(parseRepositoryInput(input)).toEqual(expected);
  });

  it.each([
    "",
    "https://gitlab.com/facebook/react",
    "github.com/facebook",
    "github.com/facebook/react/issues",
    "not a repository",
  ])("rejects %s", (input) => {
    expect(parseRepositoryInput(input)).toBeNull();
  });
});

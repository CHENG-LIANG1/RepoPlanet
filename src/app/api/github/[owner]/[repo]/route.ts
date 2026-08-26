import { NextResponse } from "next/server";
import { z } from "zod";

import { fetchRepositoryPlanet, GitHubRequestError } from "@/lib/github";

export const runtime = "nodejs";
export const maxDuration = 60;

const repositoryPart = z.string().min(1).max(100).regex(/^[A-Za-z0-9_.-]+$/);

interface RouteContext {
  params: Promise<{ owner: string; repo: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  const parsed = z
    .object({ owner: repositoryPart, repo: repositoryPart })
    .safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid GitHub owner and repository." },
      { status: 400 },
    );
  }

  try {
    const data = await fetchRepositoryPlanet(parsed.data.owner, parsed.data.repo);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    if (error instanceof GitHubRequestError) {
      const rateLimited = error.status === 403 && error.rateLimitRemaining === "0";
      return NextResponse.json(
        {
          error: rateLimited
            ? "GitHub API limit reached. Try again shortly or configure GITHUB_TOKEN."
            : error.status === 404
              ? "This public repository could not be found."
              : error.message,
        },
        { status: rateLimited ? 429 : error.status },
      );
    }

    console.error("RepoPlanet generation failed", error);
    return NextResponse.json(
      { error: "The planet could not be generated right now." },
      { status: 500 },
    );
  }
}

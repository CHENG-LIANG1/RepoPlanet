import type { Metadata } from "next";

import { RepoPlanetApp } from "@/components/repo-planet-app";

interface RepositoryPageProps {
  params: Promise<{ owner: string; repo: string }>;
}

export async function generateMetadata({ params }: RepositoryPageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo} · RepoPlanet`,
    description: `Explore ${owner}/${repo} as a living 3D repository world.`,
  };
}

export default async function RepositoryPage({ params }: RepositoryPageProps) {
  const { owner, repo } = await params;
  return <RepoPlanetApp key={`${owner}/${repo}`} initialOwner={owner} initialRepo={repo} />;
}

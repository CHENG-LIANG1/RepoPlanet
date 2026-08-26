# RepoPlanet

Turn any public GitHub repository into a living 3D miniature world.

Folders become districts, files become buildings, contributors appear as citizens, issues become beacons, recent commits pulse through the city, and releases trigger celebrations. Every building links back to its source file on GitHub.

## Current MVP

- Next.js App Router application ready for Vercel
- Public GitHub repository URL input and shareable `/r/:owner/:repo` routes
- Real GitHub file tree, recent commit, contributor, issue, and release data
- Interactive React Three Fiber world with orbit controls and file hover/click behavior
- Commit playback timeline, pause/play, camera reset, sharing, and About interactions
- Representative building sampling for large repositories
- Responsive desktop and mobile layouts
- Cached GitHub fetches with optional server-side authentication

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`GITHUB_TOKEN` is optional during development. Keep it server-side. Without authentication, GitHub applies a much smaller request limit.

## Validation

```bash
npm run lint
npm test
npm run build
```

## Vercel deployment

1. Import this repository into Vercel.
2. Add `GITHUB_TOKEN` as a server-side environment variable.
3. Deploy with the default Next.js settings.

The GitHub API route is configured for a maximum 60-second invocation. Individual GitHub responses and the generated API payload use revalidation/CDN caching so repeated visits to the same repository do not rebuild the world from scratch.

## Architecture

```text
GitHub URL
  → /api/github/:owner/:repo
  → GitHub REST API
  → RepoPlanetData snapshot
  → deterministic district/building layout
  → React Three Fiber renderer
```

The current MVP refreshes public repositories when requested. A future GitHub App can add webhook-driven push, issue, pull request, and release events for repository owners.

## Design

The visual source of truth and extracted design tokens are in [`docs/design`](./docs/design).

# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains Next.js App Router UI, with feature components in `app/components`, data helpers in `app/lib`, GraphQL schema/resolvers in `app/graphql`, and API routes under `app/api`.
- `public/` stores static assets; update paths via `app/globals.css` or component-level imports.
- `prisma/schema.prisma` defines the data model; generated client code lives in `prisma/generated`.
- Netlify deployment hooks use `netlify-build.js` and `netlify.toml`; update them alongside build pipeline tweaks.

## Build, Test, and Development Commands
- `pnpm install` syncs dependencies; the lockfile assumes pnpm 8+.
- `pnpm dev` launches Next on `http://localhost:8888` with hot reload.
- `pnpm build` runs `prisma generate` then produces the production bundle; `pnpm start` serves that bundle.
- `pnpm lint` runs `next lint`.
- Database utilities: `pnpm prisma:generate` refreshes the client, `pnpm prisma:push` syncs schema to the configured database, `pnpm prisma:studio` opens the data inspector.

## Coding Style & Naming Conventions
- Prefer TypeScript, React server components, and functional patterns; keep shared utilities in `app/lib`.
- Use two-space indentation, trailing commas, and descriptive prop names; run `pnpm lint` before committing.
- Components and React hooks follow PascalCase (`VideoLanding.tsx`) and camelCase (`useWalletConnection`); GraphQL schema files stay in `*.graphql`.

## Testing Guidelines
- No automated runner ships yet; document manual verification in PRs and include screenshots for UI-facing changes.
- When adding tests, colocate `*.test.ts` or `*.spec.ts` beside the subject file and configure the runner within the same change.
- Exercise critical flows via `pnpm dev`, especially Solana wallet interactions and Netlify-deployed routes.
- Re-run `pnpm build` before merging to ensure Prisma generation and Next compilation succeed.

## Commit & Pull Request Guidelines
- Match the repo’s sentence-case history (`Fixes for building`, `Some mobile fixes`); keep messages imperative and scoped to one concern.
- Reference related tasks or issues in commit bodies; explain schema or CSP adjustments explicitly.
- PRs should summarize intent, list testing evidence, call out schema or CSP changes, and attach UI captures when surfaces change.
- Request review for security-sensitive updates (GraphQL, CSP, wallet flows) and confirm Netlify build success before merge.

## Environment & Credentials
- Store secrets in `.env.local` (`DATABASE_URL`, Solana RPC URLs, third-party keys) and exclude them from commits.
- Update `next.config.js` CSP directives when introducing external assets or analytics domains.
- For Prisma migrations, use disposable development databases and note reset steps in the PR.

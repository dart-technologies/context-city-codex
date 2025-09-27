# Repository Guidelines

## Project Structure & Module Organization
Current assets sit at the repo root (`FEATURE_SOCIAL_FEEDS.md`, `TODO.md`, `DEMO.md`, `AGENTS.md`). As delivery begins, place the Expo client under `apps/`, Codex services under `services/`, and evolving specs in `docs/`. Shared TypeScript primitives live in `packages/ui/`, Python utilities in `packages/intel/`, and narrative assets (voice scripts, Dartagnan art) in `assets/codex/` with provenance notes (`assets/codex/dartagnan.png`).

## Build, Test, and Development Commands
Run `yarn install` once at the root to hydrate workspaces. Launch the ContextCity shell with `yarn expo start` in `apps/mobile`; run `yarn test` for TypeScript suites. Backend services use `npm run dev` (Codex orchestration) and `poetry run uvicorn src.main:app --reload` for Python workers. Before shipping doc edits, run `yarn lint:md`.

## Coding Style & Naming Conventions
TypeScript follows Prettier defaults (2-space indent, trailing commas) plus the repo ESLint config. Name React components in `PascalCase`, hooks in `useCamelCase`. Python code is formatted with `black` and `isort`; modules stay snake_case. Governance docs use sentence-case headings, minimal lore quotes, and ASCII text unless localization demands more.

## Testing Guidelines
Write Jest specs under `apps/**/__tests__` mirroring the component path (`poi-card.test.tsx`). Orchestrator integration tests live in `services/orchestrator/tests` and run via `npm run test:int`. Python workers rely on Pytest suites in `services/workers/tests`; cover summarization mocks and provenance logging. Target ≥80% branch coverage and include low-signal POI fixtures.

## Commit & Pull Request Guidelines
Adopt Conventional Commit prefixes (`feat:`, `fix:`, `docs:`) and scoped messages (`feat(orchestrator): emit rationale logs`). PRs must include a summary, linked ticket, UI/API evidence (screenshots or CLI), and tests-run notes. Tag Codex guild reviewers and highlight lore-impacting updates explicitly.

## Git Workflow & Repo Hygiene
Run `git status` before and after edits, stage granularly with `git add <path>`, and keep commits focused. Use branches like `feature/<slug>`; never commit secrets or generated assets without provenance notes. Push work to the public hackathon repo so judges can verify fresh code.

## Lore & Stewardship Reminders
Preserve the "One Codex to guide 'em all" voice across UI copy, comments, and fallbacks. Every change should clarify how the Codex narrates, filters, or protects user journeys. If a contribution diverges from the tenets in `FEATURE_SOCIAL_FEEDS.md`, propose an update to the spec within the same PR.

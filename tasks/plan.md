# Implementation Plan: Frontend Directory Organization

## Overview

Organize the existing Epochs Lab frontend so routed pages stay in `frontend/src/pages`, landing-specific components live under `frontend/src/components/landing`, and theme implementation files stay together under `frontend/src/theme`. This is a structure-only refactor: runtime behavior, routes, styling, and public APIs must remain unchanged.

## Architecture decisions

- Keep `frontend/` as the application boundary; do not move frontend source, tests, or configuration to the repository root.
- Keep routed screens in `src/pages/`.
- Move landing-only visual components out of `src/pages/` into `src/components/landing/`.
- Keep all theme implementation modules together in `src/theme/`.
- Preserve file names and import semantics where possible; update only the imports required by moves.
- Leave generated Playwright artifacts ignored under `frontend/artifacts/`.

## Task list

### Phase 1: Move landing components

- [x] Move `src/pages/hero.jsx` to `src/components/landing/Hero.jsx`.
- [x] Move `src/pages/ParticleNetwork.jsx` to `src/components/landing/ParticleNetwork.jsx`.
- [x] Update `Landing.jsx` and `Hero.jsx` imports.

### Phase 2: Group theme implementation

- [x] Move `src/theme.js` to `src/theme/theme.js`.
- [x] Move `src/AppRoutes.jsx` to `src/routes/AppRoutes.jsx`.
- [x] Update theme provider imports and confirm the theme module resolves without an index file.

### Checkpoint: Structure

- [x] No landing visual component remains directly under `src/pages`.
- [x] No theme implementation module remains directly under `src`.
- [x] Route composition lives under `src/routes/`.
- [x] No stale imports reference the old paths.

### Phase 3: Documentation and verification

- [x] Update README structure documentation.
- [x] Run typecheck, lint, unit tests, build, E2E tests, and whitespace validation.
- [x] Review the final diff for unrelated changes.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| A moved component keeps a stale relative import | Build failure | Update imports together and run typecheck/build. |
| A page/component boundary changes accidentally | Runtime or routing regression | Move files without changing implementation and run the full E2E suite. |
| Theme import resolution changes | Theme toggle or persistence regression | Verify theme tests and browser theme coverage. |

## Out of scope

- No behavior, styling, route, dependency, or test-assertion changes.
- No deletion of documentation, assets, or generated artifacts.
- No redesign of the component hierarchy beyond the requested folder organization.

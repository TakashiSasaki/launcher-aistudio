# WP01 — PWA Baseline

Status: **Implemented**

## Objective
Implement the minimal PWA baseline defined by the project documentation while preserving the existing WP00 application behavior.
The completed application has:
- A valid web app manifest.
- Installable application icons.
- A registered network-only pass-through Service Worker.
- No application-managed Cache Storage.
- Direct-route behavior compatible with the current Vite development and preview environments.
- Automated tests and runtime verification for the new PWA assets.

## Scope
- Preflight validation of WP00 was performed successfully.
- Added `manifest.json` configured with `start_url` as `/app` and `scope` as `/`.
- Created SVG icon and derived 192x192, 512x512 PNG icons (normal and maskable).
- Created a pass-through service worker `sw.js` without `fetch` intercepting and without Cache Storage use.
- Implemented `registerServiceWorker` only running in production (`import.meta.env.DEV` check).
- Updated `/dev` developer surface to display PWA status details.
- Direct routes tested and automatically handled by Vite fallback.
- Added Vitest cases validating manifest format, icon integrity, and service worker constraints.

## Deviations
None.

## Verification
- `npm run test -- --run`: All tests passed.
- `npm run build`: Successfully built PWA artifacts in `dist/`.
- `npm run preview`: Verified direct routing, service worker registration, and manifest validation.
- Starting commit SHA: 5cc9e083c27da25c342f1cf5b026027376c99c5f (Noted from imported state containing ADR-0006).

## Notes
- `vite-env.d.ts` was added to satisfy TypeScript for `import.meta.env.DEV`.
- The PWA tests use `@ts-ignore` on node's `fs` and `path` to test output files without requiring `@types/node` dependency addition.

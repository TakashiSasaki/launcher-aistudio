# Launcher

Launcher is a lightweight, mobile-first Progressive Web App that presents web destinations as a grid of colorful SVG icons, similar to a smartphone app drawer. Selecting an item opens its registered HTTPS URL.

The project is now in **incremental implementation controlled by explicitly approved work packages**. WP00 has been implemented; no later phase or Firebase capability is authorized merely because it appears in the roadmap.

## Product intent

The application should remain small, fast, and understandable. It is a web launcher rather than a native application launcher: each item is ultimately a link. Official service logos are not required; the application will use lightweight, recognizable, independently drawn color SVG icons.

The backend is Firebase:

- Cloud Firestore stores users, launcher items, settings, demo-derived data, and administrative metadata.
- Firebase Authentication supports only Google accounts and anonymous accounts.
- Anonymous users may link or merge into Google accounts.
- Inactive anonymous accounts are deleted after 183 days based on application activity.

## Interface surfaces

| Path | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page and development-time navigation to the other surfaces |
| `/app` | Google or anonymous authentication | Main launcher application |
| `/admin` | Sole administrator | Complete administration of all users and all data |
| `/dev` | Public | Developer-facing documentation, diagnostics, and non-secret technical information |
| `/demo` | Public to view; authentication required to write | Fixed demo experience and Firestore behavior verification |

The sole administrator is the verified Google-authenticated Firebase user corresponding to `takashi316@gmail.com`. Client-side email comparison is not sufficient authorization; privileged access must also be enforced by trusted backend logic and Firebase authorization claims.

## Core data principles

- Every persisted launcher-item instance, whether created by a user, loaded from demo data, imported, duplicated, or created by the administrator, has an immutable globally unique `itemId`.
- The current design decision is to use canonical lowercase UUIDv7 strings for `itemId` and to use the same value as the Firestore document ID.
- Item identity is independent of label, URL, icon, display order, owner, and provenance.
- Only `https:` launcher URLs are permitted.
- Demo provenance is represented by explicit metadata, not encoded into `itemId`.
- Import and export use a versioned JSON format.
- Import must support both `replace` and `merge` modes.
- Destructive or cross-account operations must be loss-averse, auditable, and retryable.

## Demo behavior

`/demo` displays fixed application-bundled demo data without authentication. A user may then choose Google or anonymous authentication and load a copy of that demo dataset into their own Firestore data. Loaded items retain demo provenance and a load-session identifier so that demo-derived data can be exercised, retained selectively, or deleted later.

## PWA strategy

The first PWA milestone uses a minimal web app manifest and a pass-through service worker. Application-managed caching and offline behavior are deferred until the base behavior is stable. Browser HTTP caching may still operate normally.

## Canonical repository and AI Studio workflow

`TakashiSasaki/launcher-aistudio/main` is the operational source of truth because Google AI Studio imports and publishes only `main`, and the application must remain runnable in its container.

The earlier `TakashiSasaki/launcher` repository is retained as pre-implementation specification history. It is not a second development authority and must not be bidirectionally synchronized.

All non-AI-Studio changes must start from the latest `main`, use a work branch, and be submitted as a draft pull request. While AI Studio is actively working from an imported `main`, external changes must not be merged into `main`. See [`docs/operations/google-ai-studio-workflow.md`](docs/operations/google-ai-studio-workflow.md).

## Repository guide

- [`AGENTS.md`](AGENTS.md): binding instructions for coding agents.
- [`docs/operations/google-ai-studio-workflow.md`](docs/operations/google-ai-studio-workflow.md): canonical source-of-truth, branch, and handoff workflow.
- [`docs/specification.md`](docs/specification.md): canonical product specification and confirmed requirements.
- [`docs/architecture.md`](docs/architecture.md): system boundaries and intended architecture.
- [`docs/data-model.md`](docs/data-model.md): Firestore-oriented logical data model and invariants.
- [`docs/authentication-and-authorization.md`](docs/authentication-and-authorization.md): authentication, administration, account linking, and account merging.
- [`docs/import-export.md`](docs/import-export.md): portable JSON and replace/merge semantics.
- [`docs/demo-data.md`](docs/demo-data.md): fixed demo datasets and provenance lifecycle.
- [`docs/decisions/`](docs/decisions/): architecture decision records.
- [`docs/roadmap.md`](docs/roadmap.md): phased work plan; this is not an implementation authorization by itself.

## Current status

**WP00 — Project Bootstrap and Static Surface Skeleton** has been implemented.

### Implementation notes

- **Technology stack**: Vanilla TypeScript with Vite and Vitest. No UI frameworks or external CSS libraries are used. Routing is handled by a custom lightweight History API router. See [ADR-0005](docs/decisions/0005-vanilla-ts-vite-stack.md).
- **Installation**: Run `npm install` to install dependencies.
- **Development**: Run `npm run dev` to start the local Vite development server.
- **Build**: Run `npm run build` to create a production build in the `dist` directory.
- **Tests**: Run `npm run test` to run Vitest unit tests, and `npm run type-check` for static type verification.
- **Out of scope and not implemented**: Firebase Authentication, Cloud Firestore, persistent demo data, PWA caching, account linking/merging, and import/export remain unimplemented placeholders.

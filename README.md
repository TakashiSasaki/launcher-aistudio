# Launcher

Launcher is a lightweight, mobile-first Progressive Web App that presents web destinations as a grid of colorful SVG icons, similar to a smartphone app drawer. Selecting an item opens its registered HTTPS URL.

The project is in incremental implementation controlled by explicitly approved work packages. WP00, WP01, and WP02 have been implemented. Later capabilities are not authorized merely because they appear in the roadmap.

## Product intent

The application should remain small, fast, and understandable. It is a web launcher rather than a native application launcher: each item is ultimately a link. Official service logos are not required; the application uses lightweight, recognizable, independently drawn color SVG icons.

The intended backend is Firebase:

- Cloud Firestore stores users, launcher items, settings, demo-derived data, and administrative metadata.
- Firebase Authentication supports only Google accounts and anonymous accounts.
- Anonymous users may later link or merge into Google accounts.
- Inactive anonymous accounts will be deleted after 183 days based on application activity.

WP02 currently implements owner-scoped user profiles and ordinary user-created launcher items. Account linking, administration, persistent demo data, and cleanup jobs remain unimplemented.

## Interface surfaces

| Path | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page and development-time navigation to the other surfaces |
| `/app` | Google or anonymous authentication | Main launcher application |
| `/admin` | Sole administrator | Future complete administration of all users and all data; currently unavailable |
| `/dev` | Public | Developer-facing documentation, diagnostics, and non-secret technical information |
| `/demo` | Public to view; authentication required for future persistence | Fixed in-memory demo experience |

The sole administrator is the verified Google-authenticated Firebase user corresponding to `takashi316@gmail.com`. Client-side email comparison is not sufficient authorization; privileged access must also be enforced by trusted backend logic and Firebase authorization claims.

## Core data principles

- Every persisted launcher-item instance has an immutable globally unique `itemId`.
- Canonical lowercase UUIDv7 strings are used for `itemId`, and the same value is the Firestore document ID.
- Item identity is independent of label, URL, icon, display order, owner, and provenance.
- Only parsed `https:` launcher URLs are permitted.
- Canonical 12-digit decimal strings are used for Firestore item ordering.
- Demo provenance is represented by explicit metadata, not encoded into `itemId`.
- Import and export will use a versioned JSON format supporting both `replace` and `merge`.
- Destructive or cross-account operations must be loss-averse, auditable, and retryable.

## Demo behavior

`/demo` currently displays fixed application-bundled data without authentication or Firestore writes. A later approved work package will allow authenticated users to copy versioned demo data into their own Firestore scope while preserving provenance and cleanup metadata.

## PWA strategy

The current PWA baseline uses a minimal web app manifest and a pass-through service worker. Application-managed caching and offline behavior are deferred. Browser HTTP caching may still operate normally.

## Canonical repository and AI Studio workflow

`TakashiSasaki/launcher-aistudio/main` is the operational source of truth because Google AI Studio imports and publishes only `main`, and the application must remain runnable in its container.

The earlier `TakashiSasaki/launcher` repository is retained as pre-implementation specification history. It is not a second development authority and must not be bidirectionally synchronized.

All non-AI-Studio changes must start from the latest `main`, use a work branch, and be submitted as a draft pull request. While AI Studio is actively working from an imported `main`, external changes must not be merged into `main`.

## Repository guide

- [`AGENTS.md`](AGENTS.md): binding instructions for coding agents.
- [`docs/operations/google-ai-studio-workflow.md`](docs/operations/google-ai-studio-workflow.md): source-of-truth, branch, and handoff workflow.
- [`docs/operations/repository-hygiene.md`](docs/operations/repository-hygiene.md): mandatory pre-publication repository-cleanliness rules.
- [`docs/specification.md`](docs/specification.md): canonical product specification and confirmed requirements.
- [`docs/architecture.md`](docs/architecture.md): system boundaries and intended architecture.
- [`docs/data-model.md`](docs/data-model.md): Firestore-oriented logical data model and invariants.
- [`docs/authentication-and-authorization.md`](docs/authentication-and-authorization.md): authentication, administration, account linking, and account merging.
- [`docs/import-export.md`](docs/import-export.md): portable JSON and replace/merge semantics.
- [`docs/demo-data.md`](docs/demo-data.md): fixed demo datasets and provenance lifecycle.
- [`docs/decisions/`](docs/decisions/): architecture decision records.
- [`docs/reviews/`](docs/reviews/): post-implementation findings and corrective validation requirements.
- [`docs/roadmap.md`](docs/roadmap.md): phased work plan; this is not authorization by itself.

## Current implementation

- **Technology stack**: Vanilla TypeScript, Vite, Vitest, plain CSS, and a lightweight History API router. See ADR-0005.
- **PWA baseline**: web app manifest, installation icons, and production-only pass-through service worker. See ADR-0007.
- **Firebase baseline**: explicit Google or anonymous authentication, owner-scoped Firestore profiles and launcher-item CRUD, emulator configuration, and Security Rules. See ADR-0008.
- **Repository state**: the WP02 post-implementation hardening is recorded in `docs/reviews/WP02-follow-up.md` and must pass command-capable validation before its corrective pull request is merged.

## Commands

```sh
npm ci
npm run dev
npm run type-check
npm run test
npm run test:rules
npm run build
npm run preview
```

`npm run test:rules` requires the Firebase Emulator Suite and runs it through the repository-pinned Firebase CLI.

## Not yet implemented

Persistent demo data, account linking and merging, administrator authorization, anonymous-account cleanup, import/export, application-managed caching, offline persistence, and production deployment remain outside the completed work packages.

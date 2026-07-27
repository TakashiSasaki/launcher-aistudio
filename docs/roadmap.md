# Roadmap

Status: sequencing guidance only. A roadmap entry is not implementation authorization.

## Phase 0 — Specification closure

Status: sufficiently complete to authorize scoped implementation work packages; documentation remains actively maintained.

Goals:

- maintain coherent product, architecture, data, authentication, import/export, demo, PWA, and security documentation;
- record material decisions as ADRs;
- identify unresolved choices without silently assuming them;
- define implementation work packages with acceptance criteria.

Exit criteria:

- no contradictory requirements across repository documentation;
- all blocking decisions for the first implementation work package are explicit;
- security boundaries and data invariants are testable;
- migration/import/delete completeness requirements are defined.

## Phase 1 — Minimal static surfaces

Status: implemented by WP00 — Project Bootstrap and Static Surface Skeleton.

Implemented scope:

- selected Vanilla TypeScript, Vite, npm-compatible package scripts, and Vitest;
- implemented `/`, `/app`, `/admin`, `/dev`, and static `/demo` route surfaces;
- implemented a responsive accessible icon grid with fixed local data;
- created lightweight application-defined color SVG icon primitives;
- added route, HTTPS-validation, UUIDv7-format, demo-data, and icon-safety tests;
- added build, test, type-check, and development scripts.

Firebase production connectivity remains outside WP00.

## Phase 2 — PWA baseline

Potential scope after explicit approval:

- minimal manifest;
- application installation icons;
- pass-through service worker;
- direct-route hosting fallback;
- installed-mode and ordinary-browser smoke testing.

No custom application cache is introduced in this phase.

## Phase 3 — Authentication and user Firestore data

Potential scope after explicit approval:

- explicit Google/anonymous choice;
- `/app` authentication guard;
- user profile and launcher-item CRUD;
- UUIDv7 item creation;
- HTTPS-only validation;
- ownership Security Rules;
- activity timestamp throttling;
- local emulator tests before production use.

## Phase 4 — Demo persistence lifecycle

Potential scope after explicit approval:

- authenticated demo load into Firestore;
- versioned fixed dataset;
- provenance and `demoLoadId`;
- demo-managed deletion;
- explicit promotion to ordinary management;
- account-upgrade preservation tests.

## Phase 5 — Import and export

Potential scope after explicit approval:

- versioned UTF-8 JSON export;
- complete schema validation;
- replace planning, recovery, application, and verification;
- merge planning with explicit conflict policy;
- `keep-both` ID remapping;
- deterministic ordering and completeness tests.

Both replace and merge are mandatory before this phase is complete.

## Phase 6 — Google linking and account merge

Potential scope after explicit approval:

- no-collision anonymous-to-Google linking;
- existing-Google collision detection;
- short-lived merge sessions;
- server-mediated data merge;
- settings precedence;
- source cleanup and Authentication deletion;
- retry and completeness tests.

## Phase 7 — Administration

Potential scope after explicit approval:

- administrator custom-claim bootstrap;
- `/admin` interface;
- complete user/data inspection and editing;
- privileged import/export;
- cleanup and merge monitoring;
- audit browsing;
- destructive-operation safeguards.

## Phase 8 — Anonymous-account cleanup

Potential scope after explicit approval:

- scheduled 183-day inactivity detection;
- provider-state recheck;
- complete user-data deletion;
- explicit application-prefixed backend function names;
- idempotent retries and audit results;
- deletion-manifest completeness tests.

## Phase 9 — Caching and offline design

Potential scope only after a separate ADR and explicit approval:

- static asset caching;
- navigation strategy;
- update UX;
- Firestore offline persistence evaluation;
- sign-out/account-switch clearing;
- pending-write and conflict semantics.

## Work-package requirement

Before an agent begins a phase, the requested work must state:

- exact phase/subset;
- files or components in scope;
- explicitly excluded work;
- chosen technologies where required;
- security and data invariants;
- tests and verification commands;
- whether Firebase emulator, staging, or production resources may be used;
- whether deployment is permitted.

For Google AI Studio work, the package must also state that AI Studio temporarily holds the `main` write lease described in `docs/operations/google-ai-studio-workflow.md`.

Agents must not treat the entire roadmap as one task.

# Roadmap

Status: sequencing guidance only. A roadmap entry is not implementation authorization.

## Phase 0 — Specification closure

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

Potential scope after explicit approval:

- select frontend language, framework, build tool, and package manager;
- implement `/`, `/dev`, and static `/demo` using fixed local data;
- implement responsive accessible icon grid;
- create independently drawn lightweight color SVG icon primitives;
- add route catalog/documentation;
- add test and lint foundations.

Must not yet require Firebase production connectivity unless the work package includes it.

## Phase 2 — PWA baseline

Potential scope:

- minimal manifest;
- application installation icons;
- pass-through service worker;
- direct-route hosting fallback;
- installed-mode and ordinary-browser smoke testing.

No custom application cache is introduced in this phase.

## Phase 3 — Authentication and user Firestore data

Potential scope:

- explicit Google/anonymous choice;
- `/app` authentication guard;
- user profile and launcher-item CRUD;
- UUIDv7 item creation;
- HTTPS-only validation;
- ownership Security Rules;
- activity timestamp throttling;
- local emulator tests before production use.

## Phase 4 — Demo persistence lifecycle

Potential scope:

- authenticated demo load into Firestore;
- versioned fixed dataset;
- provenance and `demoLoadId`;
- demo-managed deletion;
- explicit promotion to ordinary management;
- account-upgrade preservation tests.

## Phase 5 — Import and export

Potential scope:

- versioned UTF-8 JSON export;
- complete schema validation;
- replace planning, recovery, application, and verification;
- merge planning with explicit conflict policy;
- `keep-both` ID remapping;
- deterministic ordering and completeness tests.

Both replace and merge are mandatory before this phase is complete.

## Phase 6 — Google linking and account merge

Potential scope:

- no-collision anonymous-to-Google linking;
- existing-Google collision detection;
- short-lived merge sessions;
- server-mediated data merge;
- settings precedence;
- source cleanup and Authentication deletion;
- retry and completeness tests.

## Phase 7 — Administration

Potential scope:

- administrator custom-claim bootstrap;
- `/admin` interface;
- complete user/data inspection and editing;
- privileged import/export;
- cleanup and merge monitoring;
- audit browsing;
- destructive-operation safeguards.

## Phase 8 — Anonymous-account cleanup

Potential scope:

- scheduled 183-day inactivity detection;
- provider-state recheck;
- complete user-data deletion;
- explicit application-prefixed backend function names;
- idempotent retries and audit results;
- deletion-manifest completeness tests.

## Phase 9 — Caching and offline design

Potential scope only after a separate ADR:

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

Agents must not treat the entire roadmap as one task.

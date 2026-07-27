# Coding-agent contract

This file is the binding, agent-neutral onboarding contract for this repository. It applies to Codex, Gemini, Claude, GitHub Copilot, Jules, and other coding agents.

## Read before changing anything

Read these files in order:

1. `README.md`
2. `AGENTS.md`
3. `docs/operations/google-ai-studio-workflow.md`
4. `docs/specification.md`
5. `docs/architecture.md`
6. `docs/data-model.md`
7. `docs/authentication-and-authorization.md`
8. `docs/import-export.md`
9. `docs/demo-data.md`
10. Relevant records in `docs/decisions/`
11. `docs/roadmap.md`

Repository documentation is intended to be sufficient without prior conversational context. Do not rely on assumptions derived from other repositories.

## Current phase

The project is in incremental implementation controlled by explicitly approved work packages. WP00 — Project Bootstrap and Static Surface Skeleton — is implemented.

Do not implement a later feature, connect a Firebase project, deploy resources, create production data, or expand scope unless an explicitly approved implementation work package authorizes that exact work. A roadmap entry is not authorization.

Documentation improvements, consistency corrections, decision records, threat analysis, code review, and testable interface contracts are permitted when requested.

## Canonical repository and AI Studio constraint

`TakashiSasaki/launcher-aistudio/main` is the operational source of truth.

The earlier `TakashiSasaki/launcher` repository is retained as pre-implementation specification history. Do not treat it as an equal development source or synchronize both repositories bidirectionally.

Google AI Studio can import and publish only `main`, and the application must remain runnable in its container. Follow the single-writer lease and handoff procedure in `docs/operations/google-ai-studio-workflow.md`.

Outside Google AI Studio, every change must:

1. start from the latest `main`;
2. use a non-`main` work branch;
3. be submitted as a draft pull request targeting `main`;
4. remain unmerged until the repository owner decides to merge it.

Do not merge or commit to `main` while an AI Studio workspace is actively based on an older `main`.

## Product invariants

Preserve all of the following unless an explicit architecture decision supersedes them:

- The product is a lightweight, mobile-first PWA web launcher.
- The primary UI is a responsive grid of colorful, lightweight SVG icons.
- Launcher items open links; this is not a guaranteed native-application launcher.
- Only `https:` destination URLs are accepted.
- Firebase Authentication providers are limited to Google and anonymous authentication.
- Unauthenticated users choose between Google and anonymous authentication; anonymous sign-in is not created silently.
- Anonymous accounts may link to Google accounts.
- An anonymous user choosing an already-associated Google account requires server-mediated account/data merging.
- Anonymous accounts inactive for 183 days are deleted, along with owned application data, using an idempotent cleanup process.
- Firestore stores launcher data.
- Import and export are mandatory; import supports both `replace` and `merge`.
- The sole administrator is the verified Google-authenticated Firebase user initially identified by `takashi316@gmail.com`; authorization must not rely solely on client-side email comparison.
- The administrator may inspect, create, edit, migrate, export, import, or delete any user or application data.
- `/` and `/dev` are public.
- `/app` requires Google or anonymous authentication.
- `/admin` requires administrator authorization.
- `/demo` is publicly viewable, while Firestore writes require authentication.
- Fixed demo data may be copied into Firestore and must remain identifiable and removable by provenance metadata.
- Persisted launcher-item instances use immutable canonical lowercase UUIDv7 `itemId` values; the Firestore document ID uses the same value.
- Provenance, ownership, ordering, and content are separate from identity.
- The initial service worker is pass-through; application-managed caching is deferred.

## Implemented stack invariants

ADR-0005 selected the WP00 frontend foundation:

- Vanilla TypeScript;
- Vite;
- Vitest;
- plain CSS with CSS Grid;
- no UI framework or CSS framework;
- no third-party routing library;
- npm-compatible package scripts that may be executed by Bun without using Bun-specific APIs.

Do not replace this stack without a superseding accepted ADR and an approved work package.

## Change discipline

- Treat the documentation as a coherent specification, not independent notes.
- When changing one invariant, update every affected document and decision record in the same change.
- Distinguish confirmed requirements, design decisions, recommendations, and unresolved questions.
- Do not silently resolve ambiguity. Record it in the appropriate specification section or propose an ADR.
- Prefer loss-averse and retryable data operations.
- Cross-user, administrative, account-merge, cleanup, and replace-import operations require trusted backend enforcement and auditability.
- Never broaden authorization merely to make development easier.
- Never commit Firebase Admin credentials, service-account keys, private keys, access tokens, `.env` secrets, exported user data, or production datasets.
- Do not commit transient PR-helper files, review-reply payloads, scratch scripts, tool-failure artifacts, or generated temporary JSON.

## Branch and commit conventions

Use English work-branch names in the form:

`<type>/<short-description>`

Allowed work types are `feature`, `fix`, `chore`, `docs`, and `refactor`. Keep branch names under 50 characters when practical.

Immutable checkpoint branches may use:

`snapshot/<date>-<description>`

Snapshot branches are not work branches, must not be submitted as implementation pull requests, and must not be moved after creation.

Use focused commits. Do not mix implementation, schema changes, security-rule changes, and unrelated documentation cleanup without a documented reason.

## Verification expectations

Before declaring work complete:

- Verify internal consistency across the documentation and implementation.
- Verify that public pages expose no secrets or user data.
- Verify that authorization is enforced server-side or by Security Rules, not merely hidden in the UI.
- Verify that destructive operations have explicit scope, validation, failure handling, and recovery semantics.
- Verify migration and import/export completeness; completeness checking is mandatory, not optional.
- Report commands and checks actually run.
- Report checks unavailable in the current environment instead of claiming success.
- State whether Google AI Studio must perform a runtime follow-up before merge.

## Agent-specific files

`GEMINI.md`, `CLAUDE.md`, and `.github/copilot-instructions.md` are short entry points. They must defer to this file and must not diverge from it.

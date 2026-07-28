# Repository hygiene for coding agents

Status: binding operational instructions.

This document defines the minimum repository-cleanliness checks required before a coding agent publishes work. It applies equally to Google AI Studio, Codex, Gemini, Claude, GitHub Copilot, Jules, and other agents.

## Purpose

The repository must contain durable source code, configuration, tests, documentation, and intentionally maintained assets only. Files created merely to help an agent edit, inspect, test, patch, or report must not become project artifacts unless the approved work package explicitly requires them.

## Never commit transient work products

Do not commit any of the following unless an approved work package explicitly defines the file as a maintained repository artifact:

- patch or rewrite helpers such as `patch_*.js`, `patch_*.cjs`, `patch_*.mjs`, `patch_*.py`, or `update_*.sh`;
- temporary package files such as `package.tmp.json`, copied lockfiles, or intermediate manifests;
- command output and runtime logs such as `preview.log`, `dev.log`, emulator logs, test-output captures, or terminal transcripts;
- scratch files, empty placeholder files, one-off migration helpers, generated review payloads, or tool-failure artifacts;
- duplicate documentation fragments created only to assemble a final document;
- local exports, emulator data, production data, credentials, tokens, or environment files;
- generated build output, coverage output, dependency directories, and editor or operating-system metadata.

A script needed only once to modify repository files should be executed outside the repository or deleted before publication. If a script is intended to become a maintained development tool, place it in a deliberate location, document its purpose, add tests or verification where appropriate, and include it in the approved scope.

## Do not preserve intermediate editing state

Coding agents frequently create several fragments while constructing one final file. Only the final coherent artifact belongs in the repository.

For example, a review should normally be represented by one review document and an index entry—not separate files for scope, summary, merge note, validation checklist, owner action, and testing responsibility unless those files have independent long-term value.

Before publishing, consolidate or delete intermediate fragments.

## Required pre-publication inspection

Before committing or publishing to GitHub, inspect the complete repository change set rather than only the files intentionally edited.

At minimum:

1. review repository status and all untracked files;
2. inspect the complete diff against the starting commit;
3. identify files created by shell commands, test runs, preview servers, emulators, patching utilities, and AI tooling;
4. remove files that are not durable project artifacts;
5. confirm that generated files which must be committed are reproducible and intentionally referenced;
6. confirm that no secret, local configuration, user data, or production data is present;
7. confirm that documentation is not duplicated or contradicted;
8. verify that `.gitignore` covers newly observed classes of disposable files without hiding required source files;
9. run the approved validation commands after cleanup;
10. inspect repository status and the final diff again after validation.

Do not rely on `.gitignore` as the only safeguard. A file already tracked remains tracked even after an ignore rule is added.

## Google AI Studio requirements

Google AI Studio publishes directly to `launcher-aistudio/main`, so its final inspection is especially important.

Before AI Studio publishes:

- compare the complete workspace against the imported starting commit;
- delete all one-off patch scripts and temporary files used during the task;
- delete runtime and preview logs;
- remove duplicate or superseded documentation fragments;
- verify that package and lock files were produced by the package manager, not temporary manual rewrites;
- verify that the final report lists only files intentionally retained;
- stop publication if unexplained files remain.

The fact that a file helped AI Studio complete the task does not make it part of the application.

## Repository structure discipline

Place durable artifacts according to purpose:

- application code under `src/`;
- static public assets under `public/`;
- maintained tests under the established test locations;
- approved operational documentation under `docs/operations/`;
- work-package records under `docs/work-packages/`;
- architecture decisions under `docs/decisions/`;
- post-implementation reviews under `docs/reviews/`;
- maintained developer utilities only in an explicitly documented tools or scripts location.

Do not place temporary utilities in the repository root.

## Final-report requirement

Every coding agent final report must state:

- that the final diff was inspected;
- whether transient or generated files were removed;
- whether any unusual generated or utility file remains and why;
- which validation commands were run after cleanup;
- any repository-hygiene check that could not be performed.

Do not claim a clean repository without inspecting the complete final diff.

## Review expectation

Repository hygiene is part of correctness. A feature may be functionally correct and still be incomplete if it publishes temporary files, duplicated documentation, unexplained generated artifacts, or secrets.

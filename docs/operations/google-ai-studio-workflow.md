# Google AI Studio repository workflow

Status: binding repository operation for work performed through Google AI Studio.

## 1. Constraint

Google AI Studio creates its own GitHub repository, imports only the `main` branch into its execution container, and publishes its result back to `main`. Its working branch cannot be changed.

The application must remain runnable in that container. Therefore:

- `TakashiSasaki/launcher-aistudio` is the canonical development repository;
- `launcher-aistudio/main` is the operational source of truth;
- the earlier `TakashiSasaki/launcher` repository is retained only as pre-implementation specification history and is not a second development source of truth.

Do not maintain bidirectional synchronization between the two repositories.

## 2. Main-branch write lease

Only one workflow may mutate `main` at a time.

### AI Studio lease

While an AI Studio workspace is actively based on the current `main`:

- AI Studio is the only permitted writer to `main`;
- do not merge pull requests into `main`;
- do not commit directly to `main` through GitHub or another agent;
- do not change `main` and expect the existing AI Studio container to pull the change;
- other work may continue only on non-`main` branches.

The repository owner ends the lease by reporting that AI Studio has pushed its result and that external review or integration may resume.

### External integration lease

When no AI Studio workspace is actively writing from an older `main`:

- humans and other agents work from branches created from the latest `main`;
- every change is submitted as a draft pull request targeting `main`;
- the repository owner reviews and decides when to merge;
- after `main` changes, a new or refreshed AI Studio import must use that updated `main` before AI Studio resumes implementation.

## 3. Required non-AI-Studio workflow

For every change made outside Google AI Studio:

1. verify the latest `main` commit immediately before starting;
2. create a work branch from that `main`;
3. commit only to the work branch;
4. open a draft pull request targeting `main`;
5. report validation performed and validation unavailable in the current environment;
6. never merge the pull request without the repository owner's decision.

Permitted branch prefixes are defined in `AGENTS.md`.

## 4. AI Studio work-package cycle

Each AI Studio implementation cycle follows this sequence:

1. ensure all approved external pull requests required for the cycle are already merged into `main`;
2. import the resulting `main` into a new or explicitly refreshed AI Studio workspace;
3. provide one approved implementation work package with exact scope, exclusions, tests, resource permissions, and deployment permissions;
4. freeze external updates to `main` while AI Studio works;
5. allow AI Studio to run and publish its result to `main`;
6. record the resulting `main` commit;
7. review the result from a new branch based on that commit;
8. submit review corrections through draft pull requests;
9. merge accepted corrections before the next AI Studio import.

A work package authorizes only its listed scope. Roadmap entries alone are not authorization.

## 5. Snapshot branches

Immutable checkpoint branches are recommended at significant boundaries:

```text
snapshot/<date>-pre-<work-package>
snapshot/<date>-post-<work-package>
```

Examples:

```text
snapshot/2026-07-27-pre-wp01
snapshot/2026-07-27-post-wp01
```

A snapshot branch points to an existing commit and must not be used for ordinary work or subsequently moved. Snapshot branches are an exception to the ordinary work-branch prefix list.

Tags may be added later through a separate release/versioning decision. Snapshot branches do not imply a production release.

## 6. Stale-base handling

A branch or AI Studio workspace is stale when its base is not the current `main`.

- Do not merge or publish stale work without first comparing it with the current `main`.
- Rebase or merge the current `main` into an external work branch as appropriate, then revalidate.
- An AI Studio workspace that cannot pull current `main` must be replaced or re-imported after external changes.
- Never assume AI Studio will preserve commits added to GitHub after its workspace was imported.

## 7. Pull-request policy

Draft pull requests are the standard review boundary for all non-AI-Studio changes.

Each pull request must state:

- base commit or the time at which `main` was checked;
- approved scope;
- changed files;
- tests, builds, and reviews performed;
- checks not available in the authoring environment;
- whether AI Studio must perform a follow-up runtime check;
- whether merging the PR requires terminating or refreshing an active AI Studio workspace.

Code and documentation changes may be combined only when the documentation directly describes the same implementation change.

## 8. Branch protection

Do not configure `main` rules that prevent AI Studio from publishing its required output. In particular, verify compatibility before requiring pull requests, signed commits, or status checks for every `main` update.

Protection and immutability rules may be stricter for snapshot branches and ordinary review branches.

Because `main` cannot be protected through the usual pull-request-only model, safety comes from:

- single-writer lease discipline;
- explicit work packages;
- snapshot checkpoints;
- post-push review branches;
- draft pull requests for all external corrections;
- repository-owner-controlled merge decisions.

## 9. Source-of-truth rule

If documentation or code differs between `launcher` and `launcher-aistudio`, the corresponding content in `launcher-aistudio/main` is authoritative after migration.

Changes made only in `launcher` must not be treated as implemented or approved for the canonical application unless they are deliberately ported through a branch and merged into `launcher-aistudio/main`.

# ADR-0006: AI Studio `main` as the operational source of truth

Status: Accepted

## Context

Google AI Studio creates a new repository for its exported application, imports the `main` branch into its execution container, and writes completed work back to `main`. The branch used by AI Studio cannot be changed. The application must remain runnable in that container.

Maintaining `TakashiSasaki/launcher/main` and `TakashiSasaki/launcher-aistudio/main` as equal development authorities would create split-brain history and ambiguous implementation state. Applying ordinary pull-request-only protection to `launcher-aistudio/main` may also prevent AI Studio from publishing its output.

## Decision

`TakashiSasaki/launcher-aistudio/main` is the canonical operational source of truth for the application.

The earlier `TakashiSasaki/launcher` repository is retained as specification-history material and is not independently synchronized as a development authority.

Repository mutation uses a single-writer lease:

- while AI Studio works from an imported `main`, AI Studio is the only writer to `main`;
- while external review and integration occur, AI Studio must not continue from a stale workspace;
- every non-AI-Studio change starts from the latest `main`, uses a work branch, and is submitted as a draft pull request targeting `main`;
- significant AI Studio boundaries should be preserved with immutable snapshot branches;
- after external changes reach `main`, AI Studio must import or refresh from that updated `main` before continuing.

The detailed procedure is defined in `docs/operations/google-ai-studio-workflow.md`.

## Consequences

- The repository cannot rely solely on conventional pull-request-only protection for `main`.
- Work coordination must explicitly indicate whether AI Studio or external integration currently holds the write lease.
- External pull requests must not be merged while an AI Studio workspace is still based on the prior `main`.
- Snapshot branches and post-push reviews provide recovery and review boundaries around direct AI Studio updates.
- Changes made only in the old `launcher` repository have no effect on the canonical application until deliberately ported.
- Coding agents must inspect the latest `launcher-aistudio/main` rather than assuming context from previous conversations or repositories.

## Rejected alternatives

- Treat both repositories as equal sources of truth: creates conflicting histories and unclear implementation status.
- Keep `launcher/main` canonical and copy into AI Studio manually: prevents the AI Studio container repository from being the reliable runnable source required by the workflow.
- Require all `main` updates to arrive through pull requests: incompatible with AI Studio's fixed direct-publish behavior.
- Allow AI Studio and external agents to update `main` concurrently: risks overwriting or omitting changes made after the AI Studio workspace was imported.
- Use a non-`main` canonical branch: AI Studio cannot use it as its fixed working branch.

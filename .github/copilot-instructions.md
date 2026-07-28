# GitHub Copilot instructions

[`AGENTS.md`](../AGENTS.md) is the binding repository-wide contract. Read it and the linked canonical documentation before proposing changes, including:

- [`docs/operations/google-ai-studio-workflow.md`](../docs/operations/google-ai-studio-workflow.md)
- [`docs/operations/repository-hygiene.md`](../docs/operations/repository-hygiene.md)

The project is in incremental implementation controlled by explicitly approved work packages. WP00, WP01, and WP02 are implemented. Do not implement later features, connect or deploy to an unapproved Firebase project, add deployment configuration, or expand scope without explicit authorization.

Outside Google AI Studio, start from the latest `main`, use a non-`main` work branch, and submit a draft pull request. Preserve the documented product invariants, security boundaries, UUIDv7 item identity, demo provenance, account-merge behavior, and mandatory replace/merge import semantics. Surface ambiguities instead of guessing.

Before committing or proposing completion, inspect the complete repository status and diff. Remove one-off patch scripts, temporary package files, logs, scratch files, tool artifacts, duplicate documentation fragments, and unexplained generated files. A file created only to help complete the task is not a maintained project artifact unless the approved work package explicitly says otherwise.

Completion reports must state that the complete final diff was inspected and identify any unusual generated or utility file intentionally retained.

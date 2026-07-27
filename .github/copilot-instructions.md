# GitHub Copilot instructions

[`AGENTS.md`](../AGENTS.md) is the binding repository-wide contract. Read it and the linked canonical documentation before proposing changes, including [`docs/operations/google-ai-studio-workflow.md`](../docs/operations/google-ai-studio-workflow.md).

The project is in incremental implementation controlled by explicitly approved work packages. WP00 is implemented. Do not implement later features, connect Firebase, add deployment configuration, or expand scope without explicit authorization.

Outside Google AI Studio, start from the latest `main`, use a non-`main` work branch, and submit a draft pull request. Preserve the documented product invariants, security boundaries, UUIDv7 item identity, demo provenance, account-merge behavior, and mandatory replace/merge import semantics. Surface ambiguities instead of guessing.

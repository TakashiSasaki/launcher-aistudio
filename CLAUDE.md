# Claude entry point

Read and follow [`AGENTS.md`](AGENTS.md) as the binding agent-neutral contract, then read the repository documents in the order specified there, including:

- [`docs/operations/google-ai-studio-workflow.md`](docs/operations/google-ai-studio-workflow.md)
- [`docs/operations/repository-hygiene.md`](docs/operations/repository-hygiene.md)

The project is in incremental implementation controlled by explicitly approved work packages. WP00, WP01, and WP02 are implemented. Do not implement later features, connect or deploy to an unapproved Firebase project, deploy resources, or expand scope unless the current approved work package explicitly authorizes them.

Outside Google AI Studio, start from the latest `main`, work on a non-`main` branch, and submit a draft pull request. Record ambiguity rather than silently inventing requirements.

Before committing or publishing, inspect the complete repository status and diff. Remove one-off patch scripts, temporary package files, logs, scratch files, tool artifacts, duplicate documentation fragments, and unexplained generated files. Files created only to help complete the task are not maintained project artifacts unless the approved work package explicitly says otherwise.

The final report must confirm that the complete final diff was inspected and identify any unusual generated or utility file intentionally retained.

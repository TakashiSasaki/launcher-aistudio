# Gemini entry point

Read and follow [`AGENTS.md`](AGENTS.md) as the binding agent-neutral contract, then read the repository documents in the order specified there, including:

- [`docs/operations/google-ai-studio-workflow.md`](docs/operations/google-ai-studio-workflow.md)
- [`docs/operations/repository-hygiene.md`](docs/operations/repository-hygiene.md)

The project is in incremental implementation controlled by explicitly approved work packages. WP00, WP01, and WP02 are implemented. Do not implement later features, connect or deploy to an unapproved Firebase project, deploy resources, or expand scope unless the current approved work package explicitly authorizes them.

Google AI Studio works directly from and publishes to `launcher-aistudio/main`. While this workspace is active, treat AI Studio as the sole writer to `main`. Do not rely on prior AI Studio conversation context; repository documentation and the current approved work package are authoritative.

Before publishing to `main`, inspect the complete workspace diff against the imported starting commit. Remove one-off patch scripts, temporary package files, shell helpers, logs, scratch files, tool artifacts, duplicate documentation fragments, and unexplained generated files. Files used only to help complete the task are not project artifacts. Stop publication if unexplained files remain.

The final report must confirm that the complete final diff was inspected, list any unusual generated or utility file intentionally retained, and state which validation commands were run after cleanup.

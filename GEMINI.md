# Gemini entry point

Read and follow [`AGENTS.md`](AGENTS.md) as the binding agent-neutral contract, then read the repository documents in the order specified there, including [`docs/operations/google-ai-studio-workflow.md`](docs/operations/google-ai-studio-workflow.md).

The project is in incremental implementation controlled by explicitly approved work packages. WP00 is implemented. Do not implement later features, connect Firebase, deploy resources, or expand scope unless the current approved work package explicitly authorizes them.

Google AI Studio works directly from and publishes to `launcher-aistudio/main`. While this workspace is active, treat AI Studio as the sole writer to `main`. Do not rely on prior AI Studio conversation context; repository documentation and the current approved work package are authoritative.

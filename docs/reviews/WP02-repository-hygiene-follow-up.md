# WP02 repository-hygiene follow-up

Status: proposed documentation corrections in a draft pull request.

## Finding

The WP02 publication included transient editing artifacts and duplicated review fragments, including one-off patch scripts, a temporary package file, and helper shell output. The existing agent contract prohibited scratch artifacts only in general terms and did not define a mandatory final repository inspection.

## Proposed correction

- Add binding repository-hygiene instructions under `docs/operations/`.
- Require all coding agents to inspect the complete final status and diff.
- Require Google AI Studio to delete one-off patch scripts, logs, temporary package files, duplicate document fragments, and unexplained generated files before publishing to `main`.
- Require final reports to state that repository hygiene was checked.
- Reference the hygiene instructions from `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, and GitHub Copilot instructions.

This follow-up changes documentation only. Cleanup of artifacts already present on `main` should be performed in a separate corrective branch and draft pull request after this policy is merged or concurrently under an explicitly reviewed scope.

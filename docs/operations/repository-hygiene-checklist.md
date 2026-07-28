# Repository hygiene publication checklist

Use this checklist immediately before a coding agent publishes work.

- [ ] Compare the complete workspace with the starting commit.
- [ ] Review all tracked, modified, deleted, and untracked files.
- [ ] Remove one-off patch scripts and temporary shell helpers.
- [ ] Remove temporary package files, copied manifests, and intermediate lockfiles.
- [ ] Remove preview, development, emulator, test, and command-output logs.
- [ ] Remove scratch files, empty placeholders, tool-failure artifacts, and temporary JSON payloads.
- [ ] Consolidate duplicate documentation fragments.
- [ ] Confirm all retained generated files are intentional and reproducible.
- [ ] Confirm no secrets, local `.env`, tokens, user data, or production data are present.
- [ ] Update `.gitignore` for newly observed disposable file classes where appropriate.
- [ ] Run required tests, type checks, builds, and emulator checks after cleanup.
- [ ] Inspect the complete final diff again.
- [ ] State the hygiene result in the final report.

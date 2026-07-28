# WP02 — Authentication and User Firestore CRUD

Status: Implemented

## Scope
- Explicit Google or anonymous authentication.
- Authenticated `/app` launcher placeholder implementation replaced with actual grid.
- User profile persistence in Cloud Firestore.
- User-owned launcher-item CRUD.
- User-owned data enforcement through Firestore Security Rules.
- Automatic local-emulator support.
- Automated Security Rules tests.
- Application activity tracking for future anonymous-account cleanup.

## Implementation Notes
- Modular Firebase Web SDK used.
- Emulator defaults to `127.0.0.1:8080` for Firestore and `127.0.0.1:9099` for Auth.
- No offline persistence enabled in Firestore.
- Realtime listening to items ordered by `sortKey`.
- Throttled profile `lastActiveAt` updates to max once per 24 hours to reduce write usage.
- Strict security rules ensuring canonical UUIDv7 identity, item origin, and exact field structure constraints.

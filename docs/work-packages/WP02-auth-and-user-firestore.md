# WP02 — Authentication and User Firestore CRUD

Status: Implemented; post-implementation hardening is pending runtime validation in the corrective draft pull request recorded by `docs/reviews/WP02-follow-up.md`.

## Scope

- Explicit Google or anonymous authentication.
- Authenticated `/app` launcher grid.
- User profile persistence in Cloud Firestore.
- User-owned launcher-item CRUD.
- User-owned data enforcement through Firestore Security Rules.
- Local Authentication and Firestore emulator support.
- Automated Security Rules tests.
- Application activity tracking for future anonymous-account cleanup.

## Implementation decisions

- Modular Firebase Web SDK.
- Emulator defaults: Firestore `127.0.0.1:8080`, Authentication `127.0.0.1:9099`.
- No Firestore offline persistence.
- Realtime owner-scoped item listener ordered by canonical `sortKey`.
- Canonical lowercase UUIDv7 item identity.
- Canonical 12-digit decimal string order keys.
- Google and anonymous token providers only.
- Profile `accountType` bound to the authentication token provider.
- Stored Firestore activity time used for the rolling 24-hour write-throttle decision.

## Verification boundary

The source repository records unit tests, Firestore Rules tests, type checking, and production build commands. The current connector environment could inspect and modify repository files but could not execute the Node/Firebase toolchain because outbound repository download was unavailable.

Before the corrective pull request is merged, a command-capable environment must run:

```sh
npm ci
npm run type-check
npm run test
npm run test:rules
npm run build
```

Emulator CRUD and route-lifecycle smoke tests described in `docs/reviews/WP02-follow-up.md` are also required. A real Firebase-project smoke test has not been performed.

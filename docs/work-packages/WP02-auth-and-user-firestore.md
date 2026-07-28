# WP02 — Authentication and User Firestore CRUD

Status: Implemented. Post-implementation hardening passed automated validation; browser-level emulator verification remains after the corrective draft pull request is merged.

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
- Transaction-safe profile initialization and activity update.

## Automated verification

GitHub Actions run #8 passed on corrective branch head `15b0973b34f0a860096a04d68e9e2ad4ebca7a3e`.

Verified commands:

```sh
npm ci
npm run type-check
npm run test
npm run test:rules
npm run build
```

The unit suite reported 40 passing tests. The Firestore Emulator Rules suite completed successfully. The production build succeeded.

## Remaining verification boundary

The remaining checks require the Google AI Studio browser/container after the corrective pull request is merged into `main`:

- Authentication Emulator anonymous sign-in;
- complete launcher-item CRUD, enable/disable, and reorder workflow;
- repeated route transitions without duplicate listeners;
- stored `lastActiveAt` remaining unchanged during a second access within 24 hours;
- `/dev`, `/demo`, `/admin`, manifest, icons, and pass-through Service Worker smoke tests.

A real Firebase-project smoke test has not been performed. Production project activation, deployment, and WP03 remain separately authorized work.

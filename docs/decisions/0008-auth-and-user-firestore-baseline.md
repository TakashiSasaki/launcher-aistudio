# ADR-0008: Authentication and User Firestore Baseline

Status: Accepted

## Context

The application requires explicit user authentication and persistent owner-scoped launcher data while preserving the future account-linking, administrator, demo, and import/export designs.

## Decision

- Use the modular Firebase Web SDK.
- Provide only Google and anonymous authentication providers.
- Require an explicit authentication choice; never create an anonymous account merely by visiting the application.
- Use popup-based Google sign-in (`signInWithPopup`) for WP02.
- Scope ordinary data to `users/{uid}` and `users/{uid}/launcherItems/{itemId}`.
- Bind profile `accountType` to `request.auth.token.firebase.sign_in_provider` in Firestore Security Rules.
- Deny owner data access to authentication providers other than `anonymous` and `google.com`.
- Keep Firestore online-only; do not enable offline persistence.
- Validate Security Rules against local Firebase emulators before any production activation.
- Configure Firebase through Vite environment variables and remain functional in an explicit unconfigured mode.
- Use canonical 12-digit decimal strings for `sortKey` so Firestore's lexicographic string ordering matches intended numeric ordering.
- Keep administrator bypass, account linking, account merging, persistent demo data, scheduled cleanup, and import/export outside WP02.

## Consequences

- Client route guards remain a UX layer; Security Rules enforce the owner boundary.
- Production project activation requires manual provider enablement, reviewed Rules deployment, and an explicit smoke test.
- Activity throttling reads the stored Firestore timestamp before deciding whether a 24-hour update is due.
- Changing authentication providers during a future account-link operation will require a trusted and explicitly designed profile transition.
- Existing non-canonical sort keys require normalization before they can be updated under the corrected Rules.

## Rejected alternatives

- Automatically creating anonymous accounts on route entry.
- Trusting a client-selected `accountType` without checking the authentication token.
- Allowing every enabled Firebase Authentication provider to access user data.
- Using variable-width decimal strings as order keys.
- Enabling offline persistence before account-switch and synchronization semantics are defined.

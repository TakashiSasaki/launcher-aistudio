# Security requirements

Status: baseline security invariants with WP02 owner-scoped Firestore Rules implemented. The WP02 corrective review requires runtime validation before merge.

## Authorization

- UI visibility is not authorization.
- Ordinary users may access only their own UID-scoped data.
- WP02 ordinary-user access requires a Firebase token whose `firebase.sign_in_provider` is `anonymous` or `google.com`.
- Profile `accountType` must match the actual sign-in provider.
- Administrator access requires a trusted administrator claim tied to the verified Google-authenticated administrator UID.
- Cross-UID account merge, global administration, cleanup, and system export require trusted backend operations.
- Firestore Security Rules reject client attempts to assign administrator state or trusted-operation metadata.

## Secrets

Never commit or expose:

- service-account JSON;
- Firebase Admin credentials;
- private keys or signing keys;
- access, refresh, or session tokens;
- `.env` files containing secrets;
- production exports or personal data;
- administrator bootstrap secrets.

Public Firebase Web configuration is not an authorization secret, but it must not be confused with Admin SDK configuration. Production configuration still requires an explicitly approved project and deployment step.

## URL validation

Launcher destinations must parse as URLs whose protocol is exactly `https:`. Validation occurs at input boundaries, import boundaries, trusted backend boundaries where applicable, and before navigation if stored legacy data cannot be trusted.

Reject executable and local schemes. Do not validate through prefix matching alone. WP02 additionally enforces an `https://` prefix and a 2048-character bound in Firestore Rules as defense in depth.

Opening a new browsing context must use opener isolation such as `noopener`.

## SVG and icons

The WP02 persisted icon catalog is limited to `generic-web`, `link`, `book`, and `mail`. Each value selects application-maintained static SVG markup.

Do not inject user-supplied SVG strings into the DOM. Arbitrary SVG markup and arbitrary external image URLs remain prohibited. Icon colors are normalized lowercase six-digit hexadecimal strings and validated in both the client and Security Rules.

## Dynamic text rendering

Authentication profile values, item labels, error messages, and other external or user-derived strings must be assigned through text APIs such as `textContent`, not interpolated into HTML.

Static application-owned SVG markup may use `innerHTML` only after an allowlisted icon type selects a maintained constant.

## Public routes

`/`, `/dev`, and the public portion of `/demo` are intentionally public. They must not include:

- private user records;
- email lists or complete UIDs;
- administrator-only diagnostic output;
- operation payloads;
- security-rule bypass information;
- credentials or deployment secrets.

## Input and schema limits

WP02 enforces:

- label length from 1 through 100 characters after client trimming;
- URL length no greater than 2048 characters;
- canonical lowercase UUIDv7 item IDs;
- exactly 12 decimal digits for `sortKey`;
- lowercase six-digit hexadecimal icon colors;
- an allowlisted icon type;
- exact top-level and nested document fields;
- immutable item ID and creation timestamp;
- server-controlled update timestamps;
- ordinary origin `{ "type": "user" }` and `demoManaged: false`.

Future import, audit, operation, and user-count limits must be defined before those features are implemented.

## Activity tracking

`lastActiveAt` represents application activity and uses a server timestamp. The client reads the stored timestamp before deciding whether the rolling 24-hour update interval has elapsed. Browser-local storage is not authoritative for expiration eligibility.

Scheduled deletion remains outside WP02 and must re-check the authentication provider before deleting any account.

## Import and merge

- Parse and validate complete input before mutation.
- Reject duplicate incoming item IDs unless explicitly handled by the format.
- Do not infer identity from equal URLs or labels.
- Record conflict policy explicitly.
- Verify completeness after application.
- Avoid storing full import files in logs.
- Treat administrator import into another user's scope as a privileged operation.

## Account linking and merge

Merge sessions must be short-lived, single-use, server-validated, and bound to the authenticated source and target identities. Do not grant the client general permission to copy between arbitrary UIDs.

The existing Google account is the surviving account when an anonymous user selects a Google identity that is already registered. Source deletion occurs only after target writes and completeness verification succeed.

Account linking and merge are not implemented in WP02. Their future Rules and profile-transition design must not weaken the current provider binding.

## Administrator safety

The administrator can eventually perform any application operation. High privilege increases the need for explicit target display, destructive-action confirmation, operation IDs, append-only audit results, bounded exports, recovery artifacts, and separation from unrelated cloud-project privileges.

Administrator authorization is not implemented in WP02.

## Caching and local persistence

Before enabling service-worker caching or Firestore offline persistence, define sign-out and account-switch clearing behavior. Shared or public caches must never contain authenticated HTML responses, private Firestore payloads, administrator data, or exports.

WP02 uses online-only Firestore behavior.

## Logging and errors

Logs and audit records must minimize personal data. Do not log tokens, full exported datasets, complete URLs containing sensitive query strings, or unnecessary user content.

Recoverable authentication and Firestore failures must reach the UI without exposing credentials or privileged configuration. Silently converting failed reads into an empty-data state is prohibited.

## Dependency and supply-chain policy

The implemented stack uses the repository lockfile and a deliberately small dependency set. Changes must:

- use the package manager to update `package.json` and `package-lock.json` consistently;
- avoid dependencies for trivial functionality;
- review Firebase, UUIDv7, build, and testing updates before adoption;
- keep one-off editing tools outside the committed repository;
- use dependency and secret scanning where practical.

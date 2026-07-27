# Security requirements

Status: baseline security invariants.

## Authorization

- UI visibility is not authorization.
- Ordinary users may access only their own UID-scoped data.
- Administrator access requires a trusted administrator claim tied to the verified Google-authenticated administrator UID.
- Cross-UID account merge, global administration, cleanup, and system export require trusted backend operations.
- Firestore Security Rules must reject client attempts to assign administrator state or trusted-operation metadata.

## Secrets

Never commit or expose:

- service-account JSON;
- Firebase Admin credentials;
- private keys or signing keys;
- access, refresh, or session tokens;
- `.env` files containing secrets;
- production exports or personal data;
- administrator bootstrap secrets.

Public Firebase web configuration is not an authorization secret, but it must not be confused with Admin SDK configuration.

## URL validation

Launcher destinations must parse as URLs whose protocol is exactly `https:`. Validation occurs at input boundaries, import boundaries, trusted backend boundaries where applicable, and before navigation if stored legacy data cannot be trusted.

Reject executable and local schemes. Do not validate through prefix matching alone.

Opening a new browsing context must use opener isolation such as `noopener`; referrer behavior should be selected deliberately.

## SVG and icons

The initial design permits application-defined SVG icon types and validated color parameters. It does not permit arbitrary SVG markup or arbitrary external image URLs.

Do not inject unsanitized SVG strings into the DOM. Icon parameters must not allow script, URL, CSS, or markup injection.

## Public routes

`/`, `/dev`, and the public portion of `/demo` are intentionally public. They must not include:

- private user records;
- email lists or UIDs;
- administrator-only diagnostic output;
- operation payloads;
- security-rule bypass information;
- credentials or deployment secrets.

## Input limits

Define bounded lengths and counts for:

- labels;
- URLs;
- icon identifiers and color strings;
- item count per user or import operation;
- import file size and nesting depth;
- audit summaries;
- operation metadata.

Limits must be enforced at more than the UI layer where abuse would create cost or security exposure.

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

The existing Google account is the surviving account when an anonymous user selects a Google identity that is already registered.

Source deletion occurs only after target writes and completeness verification succeed.

## Anonymous cleanup

The 183-day cleanup job must:

- re-check current authentication-provider state;
- use application-managed activity time;
- be idempotent;
- enumerate all owned storage locations;
- tolerate retries and partial failure;
- record non-sensitive results;
- avoid deleting a user who has linked or merged to Google.

## Administrator safety

The administrator can perform any application operation. High privilege increases the need for:

- explicit target display;
- confirmation for destructive actions;
- operation IDs;
- append-only audit results;
- bounded exports;
- recovery artifacts for replace and migration operations;
- separation between application administration and unrelated cloud-project privileges.

## Caching and local persistence

Before enabling service-worker caching or Firestore offline persistence, define sign-out and account-switch clearing behavior. Shared or public caches must never contain authenticated HTML responses, private Firestore payloads, administrator data, or exports.

## Logging

Logs and audit records must minimize personal data. Do not log tokens, full exported datasets, complete URLs containing sensitive query strings, or unnecessary user content.

## Dependency and supply-chain policy

Framework and dependency selection is deferred. When implementation begins:

- minimize dependency count;
- pin and review lockfiles;
- avoid packages solely for trivial functionality;
- evaluate UUIDv7 and schema-validation libraries carefully;
- use automated dependency and secret scanning where practical.

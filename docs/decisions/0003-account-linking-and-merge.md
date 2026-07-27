# ADR-0003: Anonymous-to-Google link and merge

Status: Accepted

## Context

An anonymous user may later select Google authentication. Two materially different cases exist:

1. the Google credential is not yet associated with a Firebase user;
2. the Google credential already belongs to an existing Firebase user with its own Firestore data.

Treating both cases as simple sign-in risks losing the anonymous data or creating ambiguous ownership.

## Decision

### Unused Google identity

Link the Google credential to the current anonymous Firebase user. Preserve the UID and all existing data paths.

### Existing Google identity

Use the existing Google Firebase user as the surviving target account. Merge the anonymous source account into it through a trusted backend workflow using a short-lived, one-time merge session that proves control of both identities.

Launcher-item merge is loss-averse:

- source ID absent in target: preserve ID and copy;
- same ID and equivalent normalized content: retain one;
- same ID and different content: retain target ID and remap source copy to a new UUIDv7;
- different IDs with equal URL or label: retain both.

Target Google-account settings win when explicitly set; source anonymous settings fill missing values.

After complete write and verification, delete source-owned data and the source anonymous Authentication user.

## Consequences

- Ordinary clients must not receive general cross-UID permissions.
- Merge requires trusted backend state, idempotency, audit events, and completeness verification.
- Demo provenance and management state survive the merge.
- Partial failure must leave enough operation state for safe retry.
- The source account is not deleted until target completeness is verified.

## Rejected alternatives

- Always keep the anonymous UID: impossible when the selected Google credential is already bound to another Firebase user without displacing the established account.
- Always discard anonymous data: violates user expectations and loses work.
- Merge by equal URL or label: those fields do not define identity.
- Allow client cross-UID copy permissions: broadens the security boundary and is unsafe.
- Automatically overwrite target conflicts: unnecessarily destructive.

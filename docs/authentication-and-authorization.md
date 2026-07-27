# Authentication and authorization

Status: confirmed security model.

## 1. Allowed authentication providers

Firebase Authentication is limited to:

- Google authentication;
- anonymous authentication.

Email/password, phone, and additional OAuth providers are outside the initial scope.

Unauthenticated users must explicitly choose either Google or anonymous authentication. Visiting `/app` or `/demo` must not silently create an anonymous account.

## 2. Route policy

| Route | Policy |
| --- | --- |
| `/` | Public |
| `/app` | Authenticated Google or anonymous user |
| `/admin` | Authenticated administrator claim |
| `/dev` | Public; must contain no secrets or private user data |
| `/demo` | Public rendering; authentication required before Firestore writes |

A client route guard improves navigation but is not an authorization boundary. Firestore Security Rules and trusted backend checks must enforce the same policy.

## 3. Sole administrator

The administrator is the verified Google-authenticated Firebase user initially identified by `takashi316@gmail.com`.

Recommended bootstrap procedure:

1. sign in through the Google provider;
2. verify the email is verified and equals the configured administrator bootstrap email;
3. record the resulting Firebase UID through a trusted one-time administrative process;
4. set an `admin: true` custom claim through Firebase Admin SDK;
5. use the claim and stable UID as the continuing authorization basis;
6. force or request token refresh after claim changes.

Do not grant administrator authority based only on editable client state, route visibility, Firestore profile fields, or JavaScript email comparison.

The administrator has complete application authority over all users and all application data. This power must still be scoped to the application and must not imply unrelated GCP-project operations.

## 4. Ordinary user authorization

An ordinary authenticated user may operate only within their own UID scope, except through narrowly defined server-mediated workflows.

Expected rule principle:

```text
request.auth != null && request.auth.uid == targetUid
```

Rules should additionally validate:

- allowed fields;
- field types and bounds;
- immutable `itemId` and creation metadata;
- document ID equals `itemId`;
- `https:` URL representation where enforceable;
- no client assignment of administrator or trusted-operation fields.

## 5. Anonymous activity and expiration

A user profile stores application-managed `lastActiveAt`. Client activity updates should be throttled, initially to no more than once per 24 hours.

A periodic trusted cleanup process deletes accounts whose inactivity exceeds 183 days and whose Authentication identity remains anonymous.

Before deletion, cleanup must re-read current Authentication state. A linked or merged Google account is not eligible for anonymous expiration.

Cleanup must be idempotent and must test deletion completeness across all user-owned storage locations.

## 6. Anonymous-to-Google linking

### No existing Google Firebase user

When the selected Google credential is not associated with another Firebase user, link it to the current anonymous user. The UID remains unchanged and Firestore data remains in place.

After success:

- update trusted account-type metadata;
- remove anonymous-expiration eligibility;
- retain all item IDs and ownership paths;
- record a non-sensitive audit/operation result where appropriate.

### Existing Google Firebase user

When the selected Google credential is already associated with another Firebase user, direct linking cannot be the final operation. The existing Google UID is the target/surviving account and the current anonymous UID is the source account.

A trusted account-merge workflow must:

1. prove control of the source anonymous session;
2. create a short-lived one-time merge session;
3. authenticate the target Google account;
4. validate source and target states server-side;
5. compute a deterministic merge plan;
6. apply and verify target writes;
7. verify completeness;
8. remove source-owned data;
9. delete the source Authentication account;
10. mark the operation complete and audit the result.

The client must never receive general permission to read or write another UID scope.

## 7. Merge rules

Launcher-item merge behavior:

| Condition | Result |
| --- | --- |
| Source `itemId` absent from target | Preserve ID and copy item |
| Same `itemId`, equivalent normalized content | Keep one item |
| Same `itemId`, different content | Keep target item; assign a new UUIDv7 to the source copy and preserve conflict provenance |
| Different IDs but equal URL or label | Keep both |

User-setting merge behavior:

- existing explicit Google-account settings win;
- anonymous settings fill only missing target values;
- application defaults fill remaining gaps.

Demo provenance and `demoManaged` state survive account merge so demo cleanup remains possible after upgrade.

## 8. Administrator operations

Administrator operations may cross user scopes, but every operation must verify the administrator claim in trusted backend code or in Security Rules for direct Firestore access.

High-risk actions include:

- deleting a user;
- replace-importing another user's data;
- system-wide export;
- changing account type or administrator claims;
- merging accounts;
- modifying demo/system definitions;
- repairing or migrating documents.

These actions require audit events, explicit target scope, and failure reporting. UI confirmation alone is insufficient protection.

## 9. Public developer surface

`/dev` is intentionally public so other developers can understand and inspect the application. It may expose:

- architecture and schema documentation;
- build/version information;
- non-sensitive feature flags;
- sanitized diagnostics;
- links to source and public issue tracking.

It must not expose:

- Admin SDK credentials;
- service-account files;
- access or refresh tokens;
- unredacted user identifiers or content;
- administrator-only endpoints that rely on secrecy;
- export files;
- security-rule bypass instructions.

## 10. Account deletion ordering

Deletion must tolerate partial failure. The exact order may depend on retry strategy, but implementation must avoid leaving inaccessible orphaned user data merely because Authentication was deleted first.

A deletion operation record should track each cleanup component and permit safe re-entry until all required components are complete.

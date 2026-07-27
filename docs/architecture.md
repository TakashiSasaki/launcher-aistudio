# Architecture

Status: logical architecture. Technology selection remains intentionally incomplete.

## System context

Launcher consists of a public web/PWA client, Firebase Authentication, Cloud Firestore, and trusted backend operations for privileges that cannot safely be implemented by clients.

```text
Browser / installed PWA
  ├─ public surfaces: /, /dev, public portion of /demo
  ├─ authenticated surface: /app
  ├─ administrator surface: /admin
  └─ authenticated Firestore demo mode: /demo
         │
         ├─ Firebase Authentication
         │    ├─ Google
         │    └─ anonymous
         │
         ├─ Cloud Firestore
         │    ├─ user-owned launcher items and settings
         │    ├─ system/demo definitions as applicable
         │    └─ audit and operational metadata
         │
         └─ trusted backend
              ├─ administrator authorization/bootstrap
              ├─ cross-UID account merge
              ├─ anonymous-account cleanup
              ├─ privileged import/export and repair
              └─ audit recording
```

## Trust boundaries

### Public client

The web client is untrusted. It may validate inputs for usability, but client checks do not replace Firestore Security Rules or trusted backend authorization.

Publicly downloadable Firebase client configuration is not an administrator credential. Nevertheless, no private keys, Admin SDK credentials, tokens, user exports, or privileged operational values may be shipped to public assets.

### Firestore Security Rules

Rules enforce ordinary user ownership and administrator claims. They should validate allowed document shape, field types, immutable fields, path/field ID equality, and ownership boundaries where practical.

Rules must not be broadened merely to enable account merging, cleanup, or administrator bulk operations. Those operations belong in trusted backend code.

### Trusted backend

Trusted backend functions use Firebase Admin capabilities only for narrowly defined privileged operations. Function names should be application-prefixed if the Firebase/GCP project may host other applications, and deployment should target explicit function names rather than deploying unrelated functions.

Every privileged operation must have:

- authenticated actor or scheduled-system identity;
- authorization check;
- explicit target scope;
- validation before mutation;
- idempotency or safe retry semantics;
- non-sensitive audit event;
- clear partial-failure handling.

## Surface architecture

A single web application may serve all routes, but route visibility is not authorization.

- `/`: public landing page linking to the available surfaces during development.
- `/app`: authenticated launcher application.
- `/admin`: administrator interface; both route guard and backend authorization are required.
- `/dev`: public developer documentation and diagnostics. Never expose private data or secret configuration.
- `/demo`: renders static fixed data publicly; Firestore persistence actions require explicit authentication.

Hosting must support direct navigation and refresh of these paths, normally through a single-page-application fallback or equivalent route handling.

## Data ownership

The primary logical ownership boundary is the Firebase UID.

```text
users/{uid}
users/{uid}/launcherItems/{itemId}
```

Exact collection names may change through an ADR, but ordinary users must only access their own scope. Administrator and system operations may cross scopes only through validated privileged paths.

## Identity versus provenance

`itemId` identifies a persisted item instance. It does not encode:

- owner UID;
- demo origin;
- import source;
- URL;
- icon type;
- display order;
- creation time beyond the UUIDv7 representation itself.

Provenance is explicit structured metadata. The same item may move between UID scopes during account merge while retaining identity.

## Account-upgrade paths

### Link without collision

An anonymous Firebase user links a Google credential not associated with another Firebase user. The Firebase UID remains unchanged, so user data remains in place.

### Merge with existing Google account

An anonymous Firebase user selects a Google credential already attached to another Firebase user. The existing Google UID survives. A trusted merge session proves control of both source and target sessions, computes a merge plan, writes target data, verifies completeness, then removes source data and the source Authentication account.

The client must not be given general cross-UID write access.

## Import architecture

Ordinary user import operates within the authenticated user's scope. Administrator import may target other scopes but requires privileged backend authorization.

Import follows a staged model:

1. parse;
2. validate format version and complete document shape;
3. normalize data;
4. compute replace or merge plan;
5. show or record plan summary;
6. prepare recovery data;
7. apply mutations;
8. verify completeness and invariants;
9. finalize and audit.

A replace operation must not begin by irreversibly deleting the current dataset.

## Demo architecture

Fixed demo definitions are shipped as static application data. Public viewing does not depend on Firestore.

When an authenticated user loads the demo into Firestore:

- new UUIDv7 item instances are created;
- provenance records dataset, version, template item, and load session;
- items are initially demo-managed;
- ordinary CRUD is allowed for behavior verification;
- users may promote selected items to ordinary management;
- cleanup queries use management/provenance fields, not ID naming conventions.

## PWA architecture

The first service worker is pass-through and should not create a custom application cache. This avoids stale-cache complexity while routing, authentication, and Firestore behavior are being established.

The later caching design must be introduced through a separate ADR and must distinguish:

- application shell/navigation;
- fingerprinted JavaScript and CSS;
- local SVG assets;
- Firestore client offline persistence;
- data that must never be cached publicly;
- external launcher destinations, which are outside scope.

## Error and recovery model

Network loss, token refresh, permission denial, partial backend failure, duplicate requests, and stale merge sessions are expected conditions.

Destructive and cross-account workflows should expose explicit states such as:

- `pending`;
- `validated`;
- `applying`;
- `verifying`;
- `completed`;
- `failed-retryable`;
- `failed-terminal`.

Status records must avoid storing secrets or full user payloads.

## Deferred technology choices

The repository does not yet select:

- React, Vue, Svelte, or another UI framework;
- TypeScript versus another implementation language;
- Vite or another build system;
- Firebase Hosting or alternative hosting;
- Cloud Functions runtime and generation;
- schema-validation library;
- UUIDv7 library;
- test runner.

These decisions must be made deliberately in an implementation work package, with bundle size, browser support, Firebase integration, testability, and maintainability considered.

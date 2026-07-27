# Product specification

Status: confirmed requirements with explicitly marked open decisions. This document is the canonical product-level specification. WP00 implementation decisions are recorded in ADR-0005.

## 1. Product definition

Launcher is a lightweight, mobile-first Progressive Web App that displays web destinations as a responsive grid of colorful SVG icons. Its interaction model resembles a smartphone application drawer, but each item ultimately opens an HTTPS link.

The product prioritizes:

- fast startup and low transfer size;
- simple touch-first interaction with keyboard accessibility;
- clear visual recognition without depending on official service-logo assets;
- user-specific persistence through Firestore;
- portable, versioned import/export;
- secure separation of ordinary-user and administrator capabilities;
- an architecture that can add caching and offline behavior after the online baseline is stable.

## 2. Confirmed interface surfaces

| Route | Authentication | Authorization | Purpose |
| --- | --- | --- | --- |
| `/` | None | Public | Landing page and development-time navigation hub |
| `/app` | Required | Google or anonymous user | Main launcher interface |
| `/admin` | Required | Sole administrator | Complete user, data, migration, and system administration |
| `/dev` | None | Public | Developer documentation, public diagnostics, and non-secret implementation information |
| `/demo` | None to view; required to write | Authenticated user for Firestore operations | Fixed demo, CRUD verification, and demo-data lifecycle testing |

Public routes must not expose secrets, privileged endpoints, unredacted user data, or information that bypasses authorization.

## 3. Authentication and accounts

Allowed Firebase Authentication providers:

- Google;
- anonymous.

An unauthenticated user must explicitly choose Google or anonymous authentication. The application must not silently create anonymous accounts merely by visiting a route.

Anonymous accounts may be upgraded by linking Google credentials. If the selected Google identity is not already associated with another Firebase user, linking preserves the anonymous Firebase UID and existing Firestore paths.

If the selected Google identity already belongs to a Firebase user, the application must perform a trusted, server-mediated account/data merge. The existing Google account is the surviving account; the anonymous account is the source account.

## 4. Administrator

There is one administrator. The initial identifying Google email is `takashi316@gmail.com`.

Administrator authorization must use a trusted mechanism such as a Firebase custom claim bound to the verified Google-authenticated Firebase UID. Client-side email comparison may be used as a display or bootstrap check, but never as the only authorization boundary.

The administrator may perform any operation on application users and data, including:

- inspect and edit all user profiles and launcher items;
- create or delete users and user data;
- manage demo datasets, icon definitions, system configuration, and cleanup state;
- perform per-user or system-wide import/export and backup operations;
- repair, migrate, merge, or remove data;
- inspect audit records.

Privileged operations must be authenticated, authorized, auditable, and implemented in trusted backend code where Firestore Security Rules alone are insufficient.

## 5. Launcher items

Every persisted launcher-item instance has an immutable `itemId`.

Confirmed identity rules:

- `itemId` applies to ordinary user-created items, demo-derived items, imported items, duplicated items, and administrator-created items.
- `itemId` is a canonical lowercase hyphenated UUIDv7 string.
- The Firestore document ID equals `itemId`.
- The document body also stores `itemId`; writes must enforce equality between path ID and field value.
- Identity does not depend on URL, label, icon, content hash, owner, display order, or provenance.
- Editing an item does not change its ID.
- Duplicating an item creates a new ID.
- Moving or merging an item between account scopes normally preserves its ID unless an actual ID conflict requires `keep-both` behavior.

Each item must at least contain:

- `itemId`;
- short display label;
- HTTPS destination URL;
- icon reference and color parameters;
- independent display-order key;
- enabled/disabled state;
- provenance metadata;
- creation and update timestamps.

## 6. URLs

Only URLs whose parsed protocol is exactly `https:` are valid launcher destinations.

The application must reject at least:

- `http:`;
- `javascript:`;
- `data:`;
- `file:`;
- `mailto:`;
- `tel:`;
- custom application schemes.

Validation must use a URL parser rather than string-prefix matching. Certificate issuance is assumed for target services; browser TLS validation remains authoritative at navigation time.

The default navigation behavior is to open destinations in a new browsing context with appropriate opener isolation. Per-item navigation-mode configuration remains a non-blocking design question unless an implementation work package resolves it.

## 7. Icons and UI

The initial main UI is a responsive grid of icons and labels.

Icon requirements:

- lightweight SVG;
- independently drawn rather than copied official logos;
- colored rather than monochrome;
- recognizable at small mobile sizes;
- safe to render without arbitrary executable SVG input;
- generated from application-defined icon types and validated color parameters.

Initial persistence should store an icon type plus color parameters rather than arbitrary SVG strings or external image URLs.

UI requirements:

- mobile-first responsive layout;
- sufficiently large touch targets;
- visible focus state;
- keyboard activation;
- accessible labels independent of color and shape;
- long item labels constrained predictably, initially to no more than two visual lines.

## 8. Demo behavior

The base demo dataset is fixed application-bundled data.

`/demo` must support:

1. public viewing of the fixed dataset without Firestore;
2. explicit selection of Google or anonymous authentication before writing;
3. copying a demo dataset into the authenticated user's Firestore scope;
4. normal application operations against those copied items to verify Firestore behavior;
5. deletion of demo-managed items;
6. retention of selected demo-derived items as ordinary user-managed data.

Persisted demo-derived data must have provenance metadata and a unique load-session identifier. Historical demo origin and current demo-management state are separate concepts.

## 9. Import and export

Import and export are mandatory initial product capabilities, not optional future enhancements.

The portable format is UTF-8 versioned JSON. Authentication tokens, Firebase UID ownership, administrator claims, secrets, and audit logs are excluded from ordinary user exports.

Import modes:

- `replace`: replace the selected target dataset after complete validation and recovery preparation;
- `merge`: add and reconcile incoming items without deleting unrelated existing items.

Both modes are required.

The complete import file must be validated before any user-visible state change. Partial silent acceptance is prohibited unless a future format version explicitly defines it.

## 10. Anonymous-account expiration

Anonymous accounts inactive for 183 days are deleted.

Activity is based on application-managed `lastActiveAt`, not solely Firebase Authentication's last-sign-in metadata. To control write volume, activity updates may be throttled, initially to at most once per 24 hours per user.

Cleanup must:

- run periodically;
- re-check that the user is still anonymous;
- delete owned Firestore and other application data;
- delete the Firebase Authentication account;
- be idempotent and retryable;
- record non-sensitive audit results;
- exclude users successfully linked or merged into Google accounts.

## 11. PWA baseline

The first PWA implementation milestone consists of:

- minimal web app manifest;
- installable standalone presentation where supported;
- application icons appropriate for PWA installation;
- a registered pass-through service worker;
- no application-managed Cache Storage strategy yet.

Later caching may distinguish HTML, versioned static assets, generated icons, and Firestore offline persistence. External destination pages are outside the launcher's service-worker scope.

## 12. Initial exclusions

Unless separately approved, the first implementation should not include:

- folders or nested categories;
- multi-user sharing;
- organization or tenant administration;
- automatic favicon or service-logo retrieval;
- arbitrary uploaded SVG;
- arbitrary external image URLs;
- destination health monitoring;
- native-app launch guarantees;
- notification features;
- advanced offline synchronization;
- automatic conflict deletion based only on equal URLs or labels.

## 13. Open but non-blocking decisions

These choices may be resolved by explicit implementation work packages or ADRs:

- Firebase Hosting versus another static hosting target;
- exact Firestore collection names and indexing plan, provided the logical invariants remain intact;
- exact sortable-order key representation;
- whether navigation mode is global or configurable per item;
- exact visual design tokens and icon catalog beyond the WP00 foundation;
- exact server runtime for privileged functions;
- schema-validation library for persisted and portable data;
- exact cadence and operational tooling for cleanup;
- whether demo-load history is retained after all derived items are removed.

The frontend stack, build tool, test runner, CSS approach, and routing approach were resolved by ADR-0005. An agent must not infer remaining decisions from unrelated projects.

# ADR-0001: UUIDv7 launcher-item identity

Status: Accepted

## Context

Launcher items must survive label and URL edits, export/import, duplication, anonymous-to-Google account transitions, cross-UID merge, and future storage migration. URL, label, content hashes, Firestore-generated IDs, and owner-scoped compound identifiers each couple identity to mutable content or a specific backend.

## Decision

Every persisted launcher-item instance uses an immutable canonical lowercase hyphenated UUIDv7 string as `itemId`.

The Firestore document path is:

```text
users/{uid}/launcherItems/{itemId}
```

The body also stores `itemId`, and path ID must equal body ID.

This rule applies equally to:

- user-created items;
- demo-derived items;
- imported items;
- duplicated items;
- administrator-created items.

Display order is a separate `sortKey`. Provenance and ownership are separate fields/context.

## Consequences

- Items can be created client-side before Firestore writes.
- Exports are portable beyond Firestore.
- URL and label changes preserve identity.
- Duplicates receive distinct IDs even with identical content.
- Account merge can normally preserve IDs across owner scopes.
- UUID time ordering may aid diagnostics but must not define UI order.
- UUID generation and canonical-format validation require tested implementation support.

## Conflict rule

If a valid incoming/source item ID collides with different target content and both must be preserved, the target item retains the ID and the incoming/source copy receives a new UUIDv7 with conflict provenance and an old-to-new mapping.

## Rejected alternatives

- URL or URL hash: URLs are mutable and may intentionally appear more than once.
- Label or label hash: labels are mutable and not unique.
- Full-content hash: ordinary edits would change identity.
- Firestore automatic ID: sufficiently unique but unnecessarily backend-specific for a portable format.
- Owner UID embedded in ID: complicates account movement and exposes ownership coupling.
- UUID used as display order: identity and user-controlled ordering are separate concepts.

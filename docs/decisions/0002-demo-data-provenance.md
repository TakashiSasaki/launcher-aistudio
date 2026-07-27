# ADR-0002: Explicit demo-data provenance

Status: Accepted

## Context

The public demo uses fixed data, but authenticated users must be able to copy that data into Firestore, exercise real CRUD behavior, delete demo-derived records, and selectively retain useful records. Encoding demo state in item IDs or inferring it from labels/URLs would be fragile and would mix identity with lifecycle state.

## Decision

Persisted demo-derived items receive ordinary UUIDv7 `itemId` values and explicit provenance metadata containing at least:

- dataset ID;
- dataset version;
- template item ID;
- demo load ID;
- optional template hash.

A separate `demoManaged` boolean indicates whether demo cleanup may delete the item.

Historical origin and current cleanup status are deliberately separate:

- `origin.type == "demo"` remains historical truth;
- `demoManaged == true` means the item is currently managed by demo cleanup;
- promotion to ordinary management sets `demoManaged` to `false` without erasing origin.

## Consequences

- The same template may be loaded multiple times without ID collision.
- Demo cleanup can target all managed items or one load session.
- Edited demo items remain cleanup candidates until explicitly promoted.
- Account linking, account merge, export, and import can preserve demo lifecycle behavior.
- Queries and indexes may be needed for `demoManaged` and load-session fields.

## Rejected alternatives

- Prefixing item IDs with `demo`: violates the uniform UUID identity rule and couples identity to origin.
- Treating all edited demo items as ordinary automatically: editing does not clearly express retention intent.
- Inferring origin from URL, label, or icon: these fields are mutable and non-unique.
- Rewriting origin to `user` on promotion: destroys useful historical provenance.

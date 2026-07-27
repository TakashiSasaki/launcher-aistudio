# ADR-0004: Versioned JSON replace and merge import

Status: Accepted

## Context

Launcher data must be portable and recoverable. Import must support both complete restoration and combination with existing data. Without explicit format versioning and deterministic conflict behavior, import would be unsafe and difficult to evolve.

## Decision

Ordinary portable export uses UTF-8 JSON with:

- `format: "launcher-export"`;
- integer `formatVersion`;
- export metadata;
- portable launcher items and preferences;
- no Firebase UID ownership, credentials, administrator claims, or audit logs.

Import provides both mandatory modes:

- `replace`: make the target portable dataset equal the validated incoming dataset;
- `merge`: preserve unrelated existing data and reconcile incoming items by `itemId`.

The entire input is parsed and validated before mutation. Replace requires recovery preparation and post-write completeness verification. Merge requires an explicit conflict policy; the safe default is `keep-both`.

Equal URL or label never establishes identity.

## Consequences

- Every format version needs a defined validator and compatibility policy.
- Item IDs must be portable and immutable.
- Import requires operation planning, status, and verification rather than a simple loop of writes.
- Large imports may need bounded idempotent batches and operation-level completion semantics.
- Replace must not start by irreversibly deleting existing data.
- `keep-both` conflict resolution requires ID-remapping reports.

## Rejected alternatives

- CSV as the canonical format: poorly represents nested icon, provenance, and version metadata.
- Unversioned JSON: makes schema evolution ambiguous.
- Replace-only import: does not satisfy required consolidation workflows.
- Merge-only import: does not provide exact restoration semantics.
- Partial best-effort import by default: makes failures and completeness difficult to reason about.
- URL-based deduplication: URL is mutable and non-unique by design.

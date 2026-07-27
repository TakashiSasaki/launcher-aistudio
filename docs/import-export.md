# Import and export

Status: required capability and normative merge semantics.

## 1. Goals

The data-exchange format must support:

- backup and restoration;
- transfer between accounts and environments;
- deterministic `replace` and `merge` behavior;
- schema evolution;
- preservation of item identity;
- validation before mutation;
- recovery from failed destructive operations;
- reuse of merge logic for account consolidation where appropriate.

## 2. Portable format

The initial portable format is UTF-8 JSON.

Illustrative envelope:

```json
{
  "format": "launcher-export",
  "formatVersion": 1,
  "exportedAt": "2026-07-27T00:00:00.000Z",
  "applicationVersion": "0.1.0",
  "items": [],
  "preferences": {}
}
```

Required envelope rules:

- `format` is exactly `launcher-export`;
- `formatVersion` is a supported positive integer;
- timestamps use a defined UTC representation;
- unknown required semantics cause rejection rather than guessing;
- the format does not contain authentication credentials, tokens, Firebase ownership UID, administrator claims, or audit logs;
- ordinary user export contains only portable user data.

Administrator system backup is a separate privileged format and must not be confused with ordinary portable export.

## 3. Exported item

Illustrative shape:

```json
{
  "itemId": "019d2f63-8ea4-7c15-9b21-73cb07ad9210",
  "label": "Example",
  "url": "https://example.com/",
  "icon": {
    "type": "generic-web",
    "foreground": "#ffffff",
    "background": "#3367d6"
  },
  "sortKey": "1000",
  "openMode": "new-tab",
  "enabled": true,
  "origin": {
    "type": "user"
  },
  "demoManaged": false
}
```

Server timestamps used only for internal auditing may be excluded. If creation/update timestamps are exported, their restoration semantics must be defined rather than assumed.

## 4. Validation pipeline

Before changing Firestore:

1. enforce file-size and structural limits;
2. decode UTF-8 and parse JSON;
3. validate envelope and format version;
4. validate every item and preference;
5. reject duplicate `itemId` values within the incoming file unless the format explicitly permits them;
6. normalize URLs, colors, and other canonical fields;
7. verify every URL uses exactly `https:`;
8. compute an import plan;
9. verify projected limits and permissions;
10. present or record a complete summary.

A failure at any validation step must produce no user-data mutation.

## 5. Replace import

`replace` means the target portable dataset becomes exactly the validated incoming portable dataset, subject to regenerated server-owned metadata.

Required behavior:

- validate the entire file first;
- prepare an automatic recovery export or equivalent restorable snapshot;
- stage or write incoming data before irreversible removal where feasible;
- preserve valid incoming `itemId` values;
- remove target items not present in the incoming replacement set;
- verify item counts, IDs, field invariants, and preferences after application;
- mark the operation completed only after completeness verification;
- leave enough operation state for safe retry or recovery after partial failure.

The implementation must not simply delete all current documents and then begin parsing or writing the import.

## 6. Merge import

`merge` keeps unrelated existing items and reconciles incoming items by `itemId`.

Normative default behavior:

| Existing target | Incoming | Result |
| --- | --- | --- |
| No matching `itemId` | Valid item | Add with incoming ID |
| Matching ID and equivalent normalized content | Same logical state | No change |
| Matching ID and different content | Conflict policy applies |
| Different IDs but same URL or label | Both remain |

URL equality and label equality do not define identity.

## 7. Conflict policies

The import engine must support an explicit conflict policy. The safe default for general merge is `keep-both`.

Supported conceptual policies:

- `keep-both`: preserve existing item, assign a new UUIDv7 to the incoming conflicting copy, and record conflict provenance;
- `incoming-wins`: update the existing item from incoming portable fields;
- `existing-wins`: ignore conflicting incoming portable fields;
- `reject`: fail the import when a conflict exists.

The initial user interface may expose only a subset, but internal planning must name the policy. Account merging uses loss-averse `keep-both` semantics for same-ID/different-content conflicts.

When `keep-both` changes the incoming ID, the operation result must report the old-to-new ID mapping.

## 8. Ordering

Display order is not derived from UUID.

After import:

- preserve valid incoming `sortKey` values where possible;
- use stable tie-breaking when keys collide;
- normalize/rebalance order keys when required;
- report whether rebalancing occurred;
- never change item IDs merely to repair order.

The exact order-key algorithm requires a separate implementation decision.

## 9. Provenance

Import must not erase meaningful demo provenance by default.

A direct imported item may add import-operation provenance while retaining historical origin in a bounded representation. The model must avoid unbounded nested provenance chains.

At minimum, operation metadata should record:

- import operation ID;
- mode;
- format version;
- conflict policy;
- incoming item count;
- created, updated, unchanged, remapped, and rejected counts;
- completion status.

Do not store the complete imported file in general audit logs.

## 10. Atomicity and batching

Firestore write limits may prevent a whole import from being one atomic transaction. Therefore the system must provide operation-level atomicity semantics explicitly rather than claiming database-wide atomicity.

Acceptable strategy:

- validate completely;
- create operation record;
- stage intended state or deterministic plan;
- apply bounded batches idempotently;
- verify completeness;
- expose the old dataset until commit/switch when architecture permits;
- otherwise provide automatic recovery and a clearly marked non-final state.

The implementation work package must define the actual strategy and tests.

## 11. Completeness verification

Completeness checking is mandatory.

For replace:

- every intended incoming ID exists exactly once;
- no obsolete target item remains;
- preferences equal the normalized replacement state;
- all path IDs match body IDs;
- all URLs and icon references remain valid.

For merge:

- every incoming item maps to created, unchanged, updated, remapped, or explicitly rejected status;
- no incoming item silently disappears;
- remapped IDs are unique;
- unrelated existing items remain unchanged;
- conflict counts match the plan.

## 12. Export determinism

Exports should use deterministic ordering and normalized values so logically equivalent datasets produce reviewable output. Secret or environment-specific fields must be removed before serialization.

Canonical JSON signing is not currently required, but the format should not prevent future integrity metadata.

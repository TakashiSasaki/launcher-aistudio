# Logical data model

Status: canonical logical model. Exact Firestore paths and indexes may be refined, but the invariants in this document are binding.

## 1. Model goals

The model must support:

- ordinary user-created launcher items;
- demo-derived launcher items;
- item duplication;
- versioned export and replace/merge import;
- anonymous-to-Google linking;
- anonymous-to-existing-Google data merge;
- administrator access to every user scope;
- anonymous-account expiration and complete deletion;
- future migration without treating URL or label as identity.

## 2. Recommended Firestore shape

```text
users/{uid}
users/{uid}/launcherItems/{itemId}
users/{uid}/operations/{operationId}

system/config
system/iconDefinitions/{iconType}
system/demoDatasets/{datasetId}
system/demoDatasets/{datasetId}/versions/{version}

admin/auditLogs/{auditId}
admin/accountMergeSessions/{sessionId}
admin/cleanupRuns/{runId}
```

WP02 implements only `users/{uid}` and `users/{uid}/launcherItems/{itemId}`. The other paths remain approved logical design for later work packages.

Static demo definitions may instead be application-bundled files. Firestore system demo documents are optional unless runtime administration of demo definitions is approved.

## 3. User document

Current WP02 shape:

```json
{
  "schemaVersion": 1,
  "accountType": "anonymous",
  "createdAt": "server timestamp",
  "updatedAt": "server timestamp",
  "lastActiveAt": "server timestamp"
}
```

Required invariants:

- the document-path UID is authoritative ownership;
- `accountType` is exactly `anonymous` or `google.com`;
- Firestore Security Rules require `accountType` to match `request.auth.token.firebase.sign_in_provider`;
- providers other than anonymous and Google authentication cannot access ordinary user data;
- `createdAt` is immutable;
- `updatedAt` and `lastActiveAt` use server timestamps;
- the application reads the stored `lastActiveAt` value before deciding whether the rolling 24-hour activity update is due;
- linking or merging to Google changes expiration eligibility and requires a later explicitly designed profile transition;
- user export does not include Firebase UID as portable ownership identity.

Preferences are not embedded in the implemented WP02 profile. A later work package must define their path, schema, export behavior, and merge precedence before persistence.

## 4. Launcher item

Current logical shape:

```json
{
  "schemaVersion": 1,
  "itemId": "019d2f63-8ea4-7c15-9b21-73cb07ad9210",
  "label": "Example",
  "url": "https://example.com/",
  "icon": {
    "type": "generic-web",
    "foreground": "#ffffff",
    "background": "#3367d6"
  },
  "sortKey": "000000001000",
  "openMode": "new-tab",
  "enabled": true,
  "origin": {
    "type": "user"
  },
  "demoManaged": false,
  "createdAt": "server timestamp",
  "updatedAt": "server timestamp"
}
```

### Identity invariants

- Firestore document ID equals `itemId`.
- `itemId` is a canonical lowercase UUIDv7 string.
- `itemId` is immutable after creation.
- `itemId` is globally unique in normal operation, even though it is stored under a UID scope.
- URL, label, icon, order, enabled state, origin, and owner may change without changing `itemId`.
- A duplicate receives a new `itemId`.
- Imported IDs are preserved when valid and non-conflicting.
- Account moves preserve IDs unless `keep-both` conflict resolution assigns a new ID to one copy.

### Content invariants

- `schemaVersion` is integer `1` for the current document shape.
- `label` is trimmed, non-empty, and no longer than 100 characters.
- `url` is no longer than 2048 characters, parses successfully, and has protocol exactly `https:`.
- `icon.type` is one of `generic-web`, `link`, `book`, or `mail` in WP02.
- icon colors are normalized lowercase six-digit hexadecimal strings.
- `sortKey` is exactly 12 decimal digits and is independent of ID and creation time.
- fixed-width decimal keys preserve intended numeric ordering under Firestore string ordering.
- adjacent reordering swaps the two affected keys atomically.
- `openMode` is `new-tab` in WP02.
- `enabled` is boolean.
- ordinary WP02-created data has exactly `origin: { "type": "user" }` and `demoManaged: false`.
- unknown top-level and nested fields are rejected by Security Rules.
- `createdAt` is immutable and both timestamp fields are server-controlled.

Existing data with variable-width order keys such as `1000` is non-canonical and must be normalized before it can be updated under the corrected Rules. No production migration is authorized by WP02.

## 5. Provenance

Provenance records how an item instance originated. It is not ownership and not identity.

Recommended tagged-union variants:

### User-created

```json
{
  "type": "user"
}
```

### Demo-derived

```json
{
  "type": "demo",
  "datasetId": "default-demo",
  "datasetVersion": 1,
  "templateItemId": "cloud-storage",
  "templateHash": "sha256:...",
  "demoLoadId": "019d..."
}
```

### Imported

```json
{
  "type": "import",
  "format": "launcher-export",
  "formatVersion": 1,
  "importOperationId": "019d..."
}
```

### Duplicated

```json
{
  "type": "duplicate",
  "sourceItemId": "019d..."
}
```

### Account merge

```json
{
  "type": "account-merge",
  "mergeOperationId": "019d...",
  "previousOrigin": {
    "type": "user"
  }
}
```

WP02 permits only the user-created variant in persisted user writes. Later work packages must extend both the application schema and Security Rules together before writing other variants.

Provenance may require bounded nesting or a normalized event history if chains become deep. Initial implementation should retain the immediate origin plus operation references rather than an unbounded embedded history.

## 6. Demo management state

Historical demo origin and current deletion management are separate.

- `origin.type == "demo"` means the item historically came from a demo dataset.
- `demoManaged == true` means a demo-cleanup operation may delete it.
- promoting an item to ordinary user management sets `demoManaged` to `false` while retaining demo origin.
- editing a demo item does not automatically promote it.
- a user must explicitly choose to retain or promote a demo-derived item.

A load-session document may summarize one demo load:

```json
{
  "operationId": "019d...",
  "type": "demo-load",
  "datasetId": "default-demo",
  "datasetVersion": 1,
  "status": "completed",
  "createdItemIds": ["019d..."],
  "createdAt": "server timestamp",
  "completedAt": "server timestamp"
}
```

Large operations should not depend on an unbounded ID array; counts, pages, or queryable `demoLoadId` fields may be used.

## 7. Operation records

Long-running or destructive workflows use explicit operation records. Common fields:

```json
{
  "operationId": "019d...",
  "type": "import-merge",
  "status": "validated",
  "requestedByUid": "uid",
  "targetUid": "uid",
  "createdAt": "server timestamp",
  "updatedAt": "server timestamp",
  "summary": {
    "incoming": 10,
    "created": 8,
    "unchanged": 1,
    "conflicts": 1
  }
}
```

Do not store credentials, complete export payloads, or sensitive user content in audit summaries.

## 8. Account merge session

A short-lived server-managed record may bridge authentication state changes:

```json
{
  "sessionId": "019d...",
  "sourceUid": "anonymous uid",
  "targetUid": null,
  "status": "pending",
  "createdAt": "server timestamp",
  "expiresAt": "server timestamp",
  "used": false
}
```

Required properties:

- issued while authenticated as the source anonymous user;
- one-time use;
- short expiration;
- target must authenticate with Google;
- source must still be anonymous at finalization;
- target must be the Google account proven in the second authentication step;
- reusable tokens or generalized cross-UID permissions are prohibited.

## 9. Audit log

Audit events record administrator and system actions without storing full sensitive payloads.

```json
{
  "auditId": "019d...",
  "actor": {
    "type": "administrator",
    "uid": "admin uid"
  },
  "action": "launcherItem.update",
  "targetUid": "affected uid",
  "targetResource": "users/{uid}/launcherItems/{itemId}",
  "occurredAt": "server timestamp",
  "result": "success",
  "summary": {
    "changedFields": ["label", "url"]
  }
}
```

Audit records should be append-only to ordinary clients and inaccessible to non-administrators.

## 10. Deletion completeness

Deleting an account requires enumerating every owned data location. The implementation must maintain a deletion manifest or equivalent completeness test covering:

- user document;
- launcher items;
- preferences and operation records;
- user-owned storage objects, if introduced;
- pending merge/import/demo operations;
- Authentication account;
- references that must be anonymized or retained for audit.

Adding a new user-owned collection requires updating cleanup logic, export scope analysis, and completeness tests in the same change.

## 11. Schema versioning

Persisted documents and portable exports require explicit schema or format versions. Version fields must be integers with defined migration paths. An agent must not reinterpret an old shape as the current shape without an explicit migration or compatibility layer.

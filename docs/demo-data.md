# Demo data lifecycle

Status: confirmed behavior.

## 1. Purpose

The demo serves two distinct purposes:

1. allow unauthenticated visitors to understand the launcher using fixed local data;
2. allow authenticated users to copy that data into Firestore and exercise real persistence, editing, ordering, and deletion behavior.

These purposes must remain separable. A Firestore outage must not prevent the static public demo from rendering.

## 2. Fixed dataset

The base demo dataset is versioned application-bundled data.

Illustrative template item:

```json
{
  "templateItemId": "cloud-storage",
  "label": "Cloud Storage",
  "url": "https://example.com/storage",
  "icon": {
    "type": "cloud",
    "foreground": "#ffffff",
    "background": "#3367d6"
  },
  "sortKey": "1000"
}
```

Template items are not persisted launcher-item instances and therefore use stable `templateItemId` values rather than persisted `itemId` values.

The dataset has at least:

- `datasetId`;
- integer `datasetVersion`;
- ordered template items;
- optional deterministic content hash.

## 3. Public mode

Unauthenticated `/demo` renders the fixed dataset in memory. It may permit non-persistent UI interactions, but must clearly distinguish these from Firestore-backed operations.

A visitor choosing to persist demo data must explicitly select:

- Google authentication; or
- anonymous authentication.

No anonymous account is created solely by opening the demo.

## 4. Firestore load

Each demo-load action creates a unique `demoLoadId`, preferably using the same UUIDv7 generation standard used for other operation IDs.

For every template item:

- generate a new UUIDv7 `itemId`;
- write to the authenticated user's launcher collection;
- retain template and dataset provenance;
- set `demoManaged` to `true`;
- associate the item with `demoLoadId`.

Illustrative persisted provenance:

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

Loading the same dataset twice normally creates new item instances and a new load ID. It must not overwrite a prior load merely because template IDs are equal.

## 5. Editing

Demo-derived items use the same CRUD and ordering logic as ordinary items. This verifies real application behavior rather than a separate mock implementation.

Editing a demo-derived item does not automatically remove it from demo cleanup. The item remains `demoManaged: true` until the user explicitly promotes it.

This avoids ambiguous cleanup based on whether content happens to equal the original template.

## 6. Promotion

A user may choose “keep as my item” or equivalent for a demo-derived item.

Promotion:

- sets `demoManaged` to `false`;
- retains `origin.type == "demo"` and historical dataset/template metadata;
- preserves `itemId`;
- preserves user edits and order;
- excludes the item from later demo cleanup.

Historical origin must not be rewritten to `user` merely because management changed.

## 7. Deletion

The application must support:

- deletion of all currently demo-managed items for the user;
- deletion of items from a selected `demoLoadId`;
- ordinary deletion of a single item.

Cleanup queries use explicit fields such as `demoManaged` and `origin.demoLoadId`. They must not infer demo status from ID prefixes, labels, URLs, or template names.

Deletion results should report counts and partial failure. Large cleanups must be retryable and idempotent.

## 8. Account linking and merging

If an anonymous account links to a previously unused Google identity, demo-derived items remain in the same UID scope unchanged.

If anonymous data is merged into an existing Google account:

- preserve demo provenance;
- preserve `demoManaged` state;
- preserve source item IDs when non-conflicting;
- apply normal same-ID conflict rules;
- retain `demoLoadId` unless an actual identifier collision requires operation-level remapping.

After merge, the user must still be able to remove demo-managed data.

## 9. Import and export

Ordinary export includes demo origin and `demoManaged` state so backup/restore preserves cleanup behavior.

On import:

- valid demo provenance is retained;
- unknown demo dataset versions do not invalidate otherwise valid item identity, but the importer must not claim those items match a locally available template without evidence;
- replace and merge use ordinary `itemId` semantics;
- template equality never substitutes for item identity.

## 10. Dataset evolution

A new demo dataset version does not mutate already-loaded user items automatically.

Possible future operations include:

- load a newer version as a separate load;
- reset all demo-managed items to the newest version;
- compare local demo-derived items with their source templates.

These are not required for the first implementation unless explicitly approved.

## 11. Security

Fixed demo definitions must contain no secrets, private endpoints, personal data, or administrator-only resources.

Firestore demo writes are ordinary user-owned writes and must obey the same validation and ownership rules as manually created items.

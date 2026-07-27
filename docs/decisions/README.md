# Architecture decision records

Architecture decision records (ADRs) capture decisions that materially constrain implementation. Product requirements remain in `docs/specification.md`; ADRs explain why a particular design was selected.

## Status values

- `Accepted`: binding unless superseded by another ADR.
- `Proposed`: under consideration; not binding.
- `Superseded`: replaced by a newer ADR.
- `Rejected`: considered and not selected.

## Current records

- [ADR-0001: UUIDv7 launcher-item identity](0001-item-identifiers.md)
- [ADR-0002: Explicit demo-data provenance](0002-demo-data-provenance.md)
- [ADR-0003: Anonymous-to-Google link and merge](0003-account-linking-and-merge.md)
- [ADR-0004: Versioned JSON replace and merge import](0004-import-export-semantics.md)

## Creating a record

Use the next four-digit number. Include context, decision, consequences, rejected alternatives, and affected invariants. Do not edit an accepted ADR to conceal a changed decision; supersede it with a new record and update dependent documentation.

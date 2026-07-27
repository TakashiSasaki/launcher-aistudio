# ADR-0007: PWA baseline design

## Context

To support installation as a Progressive Web App (PWA) on mobile and desktop without immediately introducing the complexity of service worker caching and offline fallback, we need to establish the baseline metadata and service worker registration logic (WP01).

## Decision

1. **Manifest configuration**: The application manifest (`manifest.json`) defines `start_url` as `/app` and `scope` as `/`. This allows the application to capture navigation across all routes while ensuring installed users launch directly into the authenticated launcher surface (which will be implemented in a later phase).
2. **Service Worker registration**: The service worker is registered only in production builds. In development (`Vite` dev server), registration is intentionally bypassed to avoid interfering with Vite's HMR and fast refresh.
3. **Pass-through Service Worker**: The service worker (`sw.js`) handles lifecycle events (`install` and `activate`) using `skipWaiting()` and `clients.claim()` for immediate activation. It does not implement a `fetch` handler, nor does it use Cache Storage. Network requests remain entirely browser-managed.
4. **Tooling**: We avoid introducing PWA frameworks or Vite plugins (e.g. `vite-plugin-pwa`) to minimize build complexity, as the baseline requirements are small enough to implement manually.

## Consequences

- The application is recognized as installable by supporting browsers.
- No caching conflicts will occur while we implement authentication and Firestore data behavior in upcoming phases.
- PWA caching strategies (network-first, cache-first, offline fallback) remain deferred to a dedicated future phase and ADR.
- Developer experience is preserved during Vite development.

## Rejected alternatives

- **`vite-plugin-pwa`**: Rejected because it introduces unnecessary build-time complexity and cache generation for a phase that explicitly forbids application-managed caching.
- **Offline fallback**: Rejected because data invariants and offline synchronization (especially for Firestore) must be designed deliberately before introducing offline capabilities.

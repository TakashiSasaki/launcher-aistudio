# PWA strategy

Status: phased strategy; only the baseline is confirmed for the first implementation.

## Baseline milestone

The first PWA milestone must provide:

- a minimal web app manifest;
- installable metadata and application icons;
- a standalone display preference where supported;
- a registered service worker;
- pass-through network behavior;
- no application-managed Cache Storage population.

The purpose is to establish correct installation, routing, authentication, and Firestore behavior before introducing cache invalidation complexity.

## Manifest requirements

The manifest must define at least:

- `name`;
- `short_name`;
- `start_url`;
- `scope`;
- `display`;
- `background_color`;
- `theme_color`;
- application icons.

PWA installation icons are distinct from the launcher-item SVG icon catalog.

The exact start URL and shortcuts require an implementation decision that accounts for the public landing page and authenticated `/app` route.

## Initial service worker

The initial service worker may handle lifecycle events but must not claim offline support it does not provide.

Conceptual fetch behavior:

```text
request -> network
```

Browser-managed HTTP cache behavior is not disabled merely because the service worker is pass-through.

Development and release processes must make service-worker update state visible enough to diagnose stale clients.

## Direct-route navigation

Installed and browser modes must support direct navigation or refresh for `/`, `/app`, `/admin`, `/dev`, and `/demo`. Hosting rewrites or equivalent server behavior must return the application shell for client-managed routes without exposing protected data.

Authentication guards execute after the shell loads; protected data must still be denied independently by Security Rules/backend authorization.

## Deferred caching phase

Caching requires a separate ADR. It must classify at least:

- HTML/navigation requests;
- fingerprinted JavaScript and CSS;
- PWA icons and local launcher SVG assets;
- fixed demo dataset assets;
- public developer documentation assets;
- Firestore SDK offline persistence;
- administrator and private user data that must not enter shared caches;
- external destination pages outside service-worker scope.

Potential strategies may include network-first, cache-first, or stale-while-revalidate, but no strategy is approved merely by appearing in this document.

## Offline semantics

The application must not present Firestore mutations as committed when they are only queued or locally cached without a defined synchronization model.

Before enabling Firestore offline persistence, define:

- multiple-tab behavior;
- pending-write indication;
- conflict handling;
- account switch and sign-out data clearing;
- anonymous-to-Google merge interaction;
- administrator-session isolation;
- demo cleanup semantics while offline.

## External links

Launcher destinations are external origins and are not cached by the launcher's service worker. New-context navigation must isolate the opener appropriately.

## Install behavior

Install prompts are progressive enhancement. The application remains usable in browsers that do not expose a PWA installation prompt.

Installed-mode detection must not become an authorization mechanism or alter data ownership semantics.

## Performance goals

The eventual implementation should establish measurable budgets for:

- initial JavaScript transfer;
- critical CSS;
- icon assets;
- first usable render;
- number of Firestore reads required for the launcher grid.

Numeric budgets are deferred until framework and build-system selection.

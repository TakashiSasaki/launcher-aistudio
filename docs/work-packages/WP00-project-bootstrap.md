# WP00 — Project Bootstrap and Static Surface Skeleton

Status: Approved

## Objective

Create the initial lightweight frontend development foundation and static interface skeleton for the Launcher PWA.

The result must be a runnable, testable web application that establishes the public and protected route surfaces without implementing authentication, Firestore access, administration, import/export, account merging, or persistent demo behavior.

## Approved technology choices

Use the following stack:

- TypeScript
- Vite
- Vanilla TypeScript
- Standard npm-compatible `package.json`
- Plain CSS
- CSS Grid for the launcher layout
- Vitest for unit tests
- No React, Vue, Svelte, Angular, or other UI framework
- No component library
- No CSS framework
- No routing library unless a concrete technical limitation makes it necessary

The application must remain compatible with an environment that uses Bun to install and execute npm-compatible package scripts. Do not make the repository dependent on Bun-specific APIs.

## In scope

### 1. Project initialization

Create the minimum files required for a Vite and TypeScript application, including:

- `package.json`
- TypeScript configuration
- Vite configuration if required
- source directory
- test configuration
- development, build, preview, test, and type-check scripts
- an appropriate `.env.example` only if needed, containing no credentials

Do not replace or weaken the existing repository documentation or agent instructions.

### 2. Route surfaces

Implement client-side handling for the following paths:

- `/`
- `/app`
- `/admin`
- `/dev`
- `/demo`

Direct navigation and browser refresh must work in the Vite development environment.

At this stage:

- `/` is a public landing page linking to all interface surfaces.
- `/app` is a static placeholder for the future authenticated launcher.
- `/admin` is a static placeholder clearly stating that administrator authorization is not yet implemented.
- `/dev` is a public developer-facing page summarizing the application purpose, current build information, route catalog, and implementation status.
- `/demo` displays fixed in-memory demo launcher data.

Do not implement fake authentication. Do not imply that `/app` or `/admin` is securely protected yet. Clearly label unimplemented security boundaries.

### 3. Static launcher grid

Create a reusable launcher-grid implementation using plain TypeScript and CSS.

Requirements:

- responsive mobile-first grid;
- colored lightweight SVG icons;
- icons drawn from application-defined SVG primitives;
- no official service logos;
- visible labels;
- keyboard accessibility;
- visible focus states;
- sufficiently large touch targets;
- labels constrained to at most two visual lines;
- only fixed local demo data;
- no Firestore reads or writes.

Demo URLs must use `https:`.

### 4. Initial project structure

Use a clear modular structure that separates at least:

- route handling;
- page rendering;
- launcher item types;
- icon rendering;
- fixed demo data;
- shared styles;
- tests.

Do not introduce abstractions that are unnecessary for the current scope.

### 5. Validation and tests

Add tests for at least:

- route resolution;
- rejection or identification of unknown routes;
- HTTPS URL validation;
- UUIDv7 item-ID format validation utility, if introduced;
- demo data satisfying required item invariants;
- safe SVG icon-type selection without arbitrary SVG injection.

Tests must not require Firebase or network access.

### 6. Documentation updates

Update the repository documentation only where implementation status has materially changed.

Add a concise implementation note describing:

- the selected stack;
- how to install dependencies;
- how to run development mode;
- how to build;
- how to run tests;
- the fact that Firebase, authentication, persistent demo data, import/export, and PWA caching are not implemented in WP00.

Record the technology-stack selection as a new accepted ADR.

## Explicitly out of scope

Do not implement or configure:

- Firebase Authentication;
- Cloud Firestore;
- Firebase Admin SDK;
- Firebase Hosting;
- Google sign-in;
- anonymous sign-in;
- administrator custom claims;
- Firestore Security Rules;
- account linking;
- account merging;
- anonymous-account cleanup;
- import or export;
- persistent demo loading;
- persistent demo deletion;
- arbitrary user-created launcher items;
- application-managed caching;
- offline support;
- production deployment;
- GitHub Actions deployment;
- service-account credentials;
- environment-specific Firebase configuration.

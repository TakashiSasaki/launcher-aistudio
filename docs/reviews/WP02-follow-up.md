# WP02 follow-up review

Status: corrective changes proposed in draft pull request; automated validation passed and browser-level emulator verification remains.

## Repository hygiene outcome

The transient patch scripts, temporary package file, helper shell script, empty placeholder, and duplicated WP01 review fragments published with WP02 were removed when the repository-hygiene policy was merged into `main`.

The corrective branch extends `.gitignore` so the same classes of one-off editing helpers are not accidentally reintroduced. Its complete final diff was inspected before publication.

## Findings

The post-WP02 review identified correctness, security, and artifact issues:

1. Firestore profile writes accepted either allowed `accountType` value without requiring it to match the token's actual sign-in provider.
2. Providers other than Google and anonymous authentication could access owner-scoped data if enabled accidentally.
3. `lastActiveAt` throttling relied only on `sessionStorage`, so a new browser session could write again before 24 hours elapsed.
4. Google display names and email addresses were inserted into `innerHTML`.
5. authentication failures were logged and swallowed instead of reaching the recoverable UI error state.
6. Auth and Firestore listeners were not unsubscribed when leaving `/app` or `/dev`.
7. variable-width decimal strings were used as Firestore ordering keys, so lexicographic ordering diverged from numeric ordering after values reached five digits.
8. reorder controls computed new keys independently and could produce unstable or duplicate ordering.
9. persisted icon names did not match the actual SVG primitive catalog.
10. all four committed PWA PNG files contained corrupted binary data.
11. unit and Emulator Rules tests were not cleanly separated.
12. the ADR index, roadmap, data model, security document, developer page, and WP02 work-package record did not fully describe the implemented state and verification boundary.

## Corrective implementation

The associated branch:

- binds profile `accountType` to `firebase.sign_in_provider` and permits only `anonymous` and `google.com` tokens;
- uses Firestore's stored activity timestamp for the rolling 24-hour decision;
- uses a Firestore transaction for race-resistant profile initialization and activity updates;
- propagates authentication and Firestore failures to the UI;
- renders identity information as text rather than HTML;
- introduces route cleanup events and unsubscribes active listeners;
- uses canonical 12-digit decimal sort keys and atomic adjacent-key swaps;
- normalizes icon colors to lowercase and aligns the four persisted icon types with maintained SVG primitives;
- replaces the corrupted PWA icons with valid 192×192 and 512×512 regular and maskable PNGs;
- separates jsdom unit tests from Node-based Emulator Rules tests;
- adds repeatable GitHub Actions validation with failure diagnostics;
- updates the canonical documentation.

## Automated validation

GitHub Actions run #8 passed on branch head `15b0973b34f0a860096a04d68e9e2ad4ebca7a3e` using Node.js 22 and Java 21.

Successful commands:

```sh
npm ci
npm run type-check
npm run test
npm run test:rules
npm run build
```

The unit suite reported 40 passing tests. The Firestore Emulator Rules suite also completed successfully.

## Remaining browser-level verification

After the corrective pull request is merged, run the application in Google AI Studio against the Authentication and Firestore emulators and verify:

- explicit Google and anonymous choices remain visible while signed out;
- anonymous sign-in succeeds;
- a launcher item can be created, edited, reordered, disabled, enabled, and deleted;
- leaving and returning to `/app` and `/dev` does not duplicate realtime or status updates;
- profile `lastActiveAt` does not update again during a second access within 24 hours;
- `/demo`, `/dev`, `/admin`, the manifest, icons, and pass-through Service Worker remain functional.

A real Firebase-project smoke test remains unperformed unless a separately approved development project and configuration are supplied. Do not begin WP03 as part of this verification.

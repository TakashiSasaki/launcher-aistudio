# WP02 follow-up review

Status: corrective changes proposed in draft pull request; runtime validation pending.

## Repository hygiene outcome

The transient patch scripts, temporary package file, helper shell script, empty placeholder, and duplicated WP01 review fragments published with WP02 were removed when the repository-hygiene policy was merged into `main`.

The corrective branch extends `.gitignore` so the same classes of one-off editing helpers are not accidentally reintroduced.

## Static-review findings

The post-WP02 review identified additional correctness and security issues:

1. Firestore profile writes accepted either allowed `accountType` value without requiring it to match the token's actual sign-in provider.
2. Providers other than Google and anonymous authentication could access owner-scoped data if enabled accidentally.
3. `lastActiveAt` throttling relied only on `sessionStorage`, so a new browser session could write again before 24 hours elapsed.
4. Google display names and email addresses were inserted into `innerHTML`.
5. authentication failures were logged and swallowed instead of reaching the recoverable UI error state.
6. Auth and Firestore listeners were not unsubscribed when leaving `/app`.
7. variable-width decimal strings were used as Firestore ordering keys, so lexicographic ordering diverged from numeric ordering after values reached five digits.
8. reorder controls computed new keys independently and could produce unstable or duplicate ordering.
9. persisted icon names did not match the actual SVG primitive catalog.
10. the ADR index, roadmap, and WP02 work-package record did not fully describe the implemented state and verification boundary.

## Proposed corrections

The associated branch:

- binds profile `accountType` to `firebase.sign_in_provider` and permits only `anonymous` and `google.com` tokens;
- uses Firestore's stored activity timestamp for the rolling 24-hour decision;
- propagates authentication and Firestore failures to the UI;
- renders identity information as text rather than HTML;
- introduces route cleanup events and unsubscribes active listeners;
- uses canonical 12-digit decimal sort keys and atomic adjacent-key swaps;
- normalizes icon colors to lowercase and aligns the four persisted icon types with maintained SVG primitives;
- expands unit and Firestore Rules tests;
- updates the canonical documentation.

## Required validation before merge

Run in Google AI Studio or another command-capable environment:

```sh
npm ci
npm run type-check
npm run test
npm run test:rules
npm run build
```

Then run the application against the Firebase emulators and verify:

- explicit Google and anonymous choices remain visible while signed out;
- anonymous sign-in succeeds;
- a launcher item can be created, edited, reordered, disabled, enabled, and deleted;
- leaving and returning to `/app` does not duplicate realtime updates;
- profile activity does not update again within 24 hours;
- `/demo`, `/dev`, `/admin`, and the PWA baseline remain functional.

A real Firebase-project smoke test remains unperformed unless a separately approved development project and configuration are supplied.

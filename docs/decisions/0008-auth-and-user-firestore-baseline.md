# ADR-0008: Authentication and User Firestore Baseline

## Context
The application requires user authentication and persistent storage for launcher items to provide personalized experiences.

## Decision
- Use the **modular Firebase Web SDK**.
- Provide only **Google** and **Anonymous** authentication providers.
- Require an **explicit authentication choice** (no automatic silent anonymous sign-in).
- Use popup-based Google sign-in (`signInWithPopup`) for WP02.
- Data structures are scoped by owner path (`users/{uid}` and `users/{uid}/launcherItems/{itemId}`).
- **No offline persistence** is enabled to keep the baseline simple and predictable.
- Emulators are heavily prioritized for testing (emulator-first validation).
- No administrator bypass or custom claims in this phase.
- No account linking or cross-account merging in this phase.
- Firebase configuration relies strictly on environment variables (`.env`).

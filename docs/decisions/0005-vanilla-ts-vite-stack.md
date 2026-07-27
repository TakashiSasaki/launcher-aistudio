# 0005-vanilla-ts-vite-stack

## Status

Accepted

## Context

We need to establish the foundational frontend technology stack for the Launcher PWA. The application is designed to be a lightweight, mobile-first web launcher. It relies on standard browser capabilities and does not require complex state management out of the box.

## Decision

We will use **Vite** as the build tool and development server, and **Vanilla TypeScript** for the application code.
We will **not** use UI frameworks like React, Vue, Svelte, or Angular.
We will use **plain CSS** with CSS Grid for layout, avoiding component libraries and CSS frameworks like Tailwind CSS or Bootstrap.
We will use **Vitest** for unit testing.
We will avoid adding third-party routing libraries, instead implementing a lightweight router using the native browser History API and `window.location`.

## Consequences

- **Pros:**
  - Extremely lightweight bundle size, leading to fast loading times.
  - Minimal dependencies reduce security risks and maintenance overhead.
  - Direct use of DOM and native browser APIs provides maximum performance.
  - CSS Grid allows for robust, native responsive layouts without external abstractions.
- **Cons:**
  - We must manually implement DOM manipulation and UI reactivity.
  - We must write and maintain our own minimal routing logic.
  - Developer velocity for complex UI components might be slower compared to using component libraries, though our UI needs are minimal.

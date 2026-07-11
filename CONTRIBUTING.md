# Contributing to Campus Connect

Thanks for your interest in contributing! This document covers everything you need to get set up and submit a change.

## Getting Started

1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/<your-username>/campus-connect.git
   cd campus-connect
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template and point it at a running backend:
   ```bash
   cp .env.example .env
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Branching

Create a feature branch off `main` using a descriptive name:

```bash
git checkout -b feature/short-description
git checkout -b fix/short-description
```

## Making Changes

- Keep pull requests focused on a single feature or fix.
- Match the existing code style (functional components, hooks, the shared `api.js` helper for all HTTP calls instead of ad-hoc `axios`/`fetch` calls).
- Run the linter before committing:
  ```bash
  npm run lint
  ```
- Make sure the app still builds:
  ```bash
  npm run build
  ```
- If you add a new protected route, add the corresponding `allowedRoles` to `ProtectedRoute` in `App.jsx` and note which backend endpoint/role check it mirrors, following the existing inline-comment convention.

## Commit Messages

Write clear, imperative commit messages, e.g.:

```
Add venue capacity validation to CreateEvent form
Fix token refresh loop on expired refresh token
```

## Submitting a Pull Request

1. Push your branch and open a PR against `main`.
2. Fill out the PR template, describing what changed and why.
3. Link any related issues.
4. Be responsive to review feedback — small, iterative changes are easier to review than large rewrites.

## Reporting Bugs & Requesting Features

Please use the issue templates under **Issues → New Issue** so we get the information needed to reproduce or evaluate the request.

## Code of Conduct

This project follows a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

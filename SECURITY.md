# Security Policy

## Supported Versions

This project is under active development on `main`. Security fixes are applied to the latest commit only; there are no maintained release branches at this time.

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public issue. Instead:

1. Open a [GitHub Security Advisory](../../security/advisories/new) for this repository, or
2. Contact the maintainers directly with details of the issue.

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce (proof-of-concept code or requests, if applicable)
- Any suggested remediation, if known

We'll acknowledge your report as soon as possible and work with you on a fix and coordinated disclosure timeline.

## Notes for This Project

- Authentication tokens (`accessToken`, `refreshToken`) are currently stored in `localStorage` on the client — if you're deploying this in production, review whether that storage strategy fits your threat model (e.g. XSS exposure) versus alternatives like httpOnly cookies.
- All API calls should go through `src/services/api.js` so the auth headers, refresh logic, and error handling stay consistent — please flag any direct `fetch`/`axios` usage you find as a potential issue.

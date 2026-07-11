# Campus Connect 🎓

**Campus Connect** is a role-based event management platform for colleges and universities — students discover and register for events, organizers create and run them, and faculty/admins oversee venues, departments, clubs, and reporting.

🔗 **Live demo:** [event-two-ivory.vercel.app](https://event-two-ivory.vercel.app/)

> This repository contains the **frontend** (React + Vite). It talks to a separate Spring Boot backend via REST (see [Backend](#backend)).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Roles & Permissions](#roles--permissions)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Backend](#backend)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- 🔐 **JWT authentication** with automatic silent token refresh and session cleanup on expiry
- 🎫 **Event discovery & registration** — public event listing, calendar view, and detail pages
- 🧑‍💼 **Role-specific dashboards** — Student, Student Organizer, Faculty Coordinator / HOD, and Super Admin each get a tailored view
- 📝 **Event lifecycle management** — create, edit, publish, and roster/attendance tracking (with QR-style scan support)
- 🏫 **Admin tooling** — venue, department, club, and event-category management
- 📊 **Reports** for faculty/admin roles
- 🔔 **Notifications** scoped to the logged-in user
- ⌘ **Command palette** for fast keyboard-driven navigation
- 🛡️ **Route-level guards** — every protected route enforces the same role rules as the backend's `@PreAuthorize` checks, so the UI never promises access the API won't grant

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) (with the React Compiler enabled) |
| Build tool | [Vite](https://vite.dev/) |
| Routing | [React Router 7](https://reactrouter.com/) |
| HTTP client | [Axios](https://axios-http.com/) |
| Linting | ESLint 9 (flat config) |
| Deployment | [Vercel](https://vercel.com/) |

## Roles & Permissions

| Role | Can access |
|---|---|
| **Public / unauthenticated** | Home, event listing, calendar |
| **STUDENT** | Student dashboard, notifications |
| **STUDENT_ORGANIZER** | Organizer dashboard, create/edit events, event roster |
| **FACULTY_COORDINATOR** | Faculty dashboard, venues, clubs, event categories, reports, user management, event roster |
| **HOD** | Faculty-style dashboard, reports, event roster |
| **SUPER_ADMIN** | Full access — all of the above plus department management |

Route access is enforced client-side by [`ProtectedRoute`](./src/components/ProtectedRoute.jsx) and mirrors the backend's role checks (see the inline comments in [`App.jsx`](./src/App.jsx) for the exact controller/endpoint each guard corresponds to).

## Project Structure

```
src/
├── assets/            # Static images
├── components/        # Shared UI (Navbar, Footer, EventCard, CommandPalette, ProtectedRoute, ...)
├── pages/              # Route-level pages (one per screen/dashboard)
├── services/
│   └── api.js          # Axios instance, auth/token helpers, refresh interceptor, error formatting
├── styles/             # Additional stylesheets
├── App.jsx             # Route definitions
└── main.jsx             # App entry point
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- A running instance of the [backend API](#backend) (or access to a deployed one)

### Installation

```bash
git clone https://github.com/<your-username>/campus-connect.git
cd campus-connect
npm install
```

### Configure environment variables

Copy the example file and point it at your backend:

```bash
cp .env.example .env
```

See [Environment Variables](#environment-variables) for details.

### Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:8080` |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-/lint-safe production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint over the project |

## Backend

This frontend expects a REST API exposing endpoints such as `/api/auth/*`, `/api/events/*`, `/api/attendance/*`, and `/api/registrations/*`, protected with Spring Security role-based authorization (`STUDENT`, `STUDENT_ORGANIZER`, `FACULTY_COORDINATOR`, `HOD`, `SUPER_ADMIN`). Point `VITE_API_URL` at wherever that service is running.

## Deployment

The live demo is deployed on [Vercel](https://vercel.com/). Any static host that supports SPA rewrites (redirecting unknown paths to `index.html`) will work, since routing is handled client-side by React Router.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request, and note that this project follows a [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

This project is licensed under the [MIT License](./LICENSE).

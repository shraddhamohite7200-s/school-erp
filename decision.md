# 🧭 Architecture Decision Records — SchoolERP

This file documents significant architecture and technology decisions made during development.

---

## ADR-001: Monorepo with Independent Packages

**Date:** September 2026
**Status:** Accepted

### Context
The project needs both a React frontend and an Express backend. We considered:
- A single unified package
- Fully separate repositories
- Monorepo with independent packages

### Decision
Use a monorepo structure with `frontend/` and `backend/` as independent packages, each with their own `package.json`.

### Rationale
- Simplifies development workflow (single git repo)
- Independent dependency management prevents conflicts
- Each part can be deployed independently
- Clear separation of concerns

### Consequences
- Developers must run `npm install` in each subdirectory separately
- No shared `node_modules` at the root level

---

## ADR-002: React + Vite for Frontend

**Date:** September 2026
**Status:** Accepted

### Context
Needed a fast, modern build tool for the React frontend.

### Decision
Use Vite 8 as the build tool with React 19.

### Rationale
- Extremely fast HMR (Hot Module Replacement)
- Native ESM support
- Minimal configuration needed
- First-class React plugin support
- Smaller bundle sizes compared to CRA

---

## ADR-003: Tailwind CSS 4 for Styling

**Date:** September 2026
**Status:** Accepted

### Context
Needed a CSS strategy that enables rapid UI development.

### Decision
Use Tailwind CSS 4 with the Vite plugin.

### Rationale
- Utility-first approach speeds up development
- Excellent Vite integration via `@tailwindcss/vite`
- Small production bundles (purges unused styles)
- Consistent design system via configuration

---

## ADR-004: Controller-Service-Repository Pattern for Backend

**Date:** September 2026
**Status:** Accepted

### Context
Needed a scalable backend architecture pattern.

### Decision
Adopt the **Controller → Service → Repository** layered pattern.

### Rationale
- Clear separation of concerns (HTTP handling vs. business logic vs. data access)
- Each layer is independently testable
- Easy to swap data sources (e.g., from mock to MongoDB)
- Scales well as the application grows

### Consequences
- More files per feature (controller + service + repository + model + validator + route)
- Slight overhead for very simple CRUD — but worth it for maintainability

---

## ADR-005: JWT for Authentication

**Date:** September 2026
**Status:** Accepted

### Context
Needed a stateless authentication mechanism for the REST API.

### Decision
Use JSON Web Tokens (JWT) with Bearer scheme in the Authorization header.

### Rationale
- Stateless — no server-side session storage needed
- Frontend already implements JWT token handling in `api.js` interceptor
- Widely supported and well-understood
- Tokens stored in `localStorage` (acceptable for this application's security model)

### Risks
- Tokens in `localStorage` are vulnerable to XSS — mitigated by Content Security Policy and input sanitization
- No token refresh mechanism yet — tokens expire and require re-login

---

## ADR-006: Joi for Request Validation

**Date:** September 2026
**Status:** Accepted

### Context
Need server-side input validation to ensure data integrity.

### Decision
Use Joi for request body, params, and query validation.

### Rationale
- Declarative schema definitions
- Rich validation rules (types, formats, conditional logic)
- Clear, readable error messages
- Well-maintained and widely used in the Express ecosystem

---

> **Last Updated:** September 2026

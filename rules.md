# 📏 Rules — SchoolERP

Coding standards, conventions, and architectural rules that all contributors must follow.

---

## General Rules

1. **Keep frontend and backend independent.** They have separate `package.json` files and must never share `node_modules`.
2. **Never commit `.env` files.** Use `.env.example` as a template.
3. **Use semantic commit messages.** Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` — New feature
   - `fix:` — Bug fix
   - `docs:` — Documentation only
   - `refactor:` — Code change that neither fixes a bug nor adds a feature
   - `test:` — Adding or updating tests
   - `chore:` — Build process, tooling, or dependency updates

---

## Frontend Rules

### File Naming
- **Components:** PascalCase — `StudentDetails.jsx`, `KpiCard.jsx`
- **Services:** camelCase — `studentService.js`, `api.js`
- **Utilities:** camelCase — `formatters.js`
- **CSS:** kebab-case or use Tailwind utility classes

### Component Guidelines
- One component per file
- Use functional components with hooks (no class components)
- Keep components focused — extract reusable UI into `components/common/`
- Page-level components go in `pages/<domain>/`
- Layout components go in `components/layout/`

### State Management
- Use React Context for global state (auth, toasts)
- Use `useState` / `useReducer` for local component state
- Avoid prop drilling beyond 2 levels — use Context instead

### API Communication
- All HTTP calls go through the centralized Axios instance (`services/api.js`)
- Domain-specific services wrap `api.js` (e.g., `studentService.js`)
- Never call `axios` directly from components — always use a service

### Routing
- All routes defined in `routes/AppRoutes.jsx`
- Protected routes wrap with `ProtectedRoute` component
- Authenticated pages use `AppLayout` as their layout wrapper

---

## Backend Rules

### File Naming
- **Controllers:** `<domain>.controller.js` — e.g., `student.controller.js`
- **Models:** `<Domain>.model.js` (PascalCase) — e.g., `Student.model.js`
- **Routes:** `<domain>.routes.js` — e.g., `student.routes.js`
- **Services:** `<domain>.service.js` — e.g., `student.service.js`
- **Middleware:** `<name>.middleware.js` — e.g., `auth.middleware.js`
- **Validators:** `<domain>.validator.js` — e.g., `student.validator.js`

### Architecture Pattern
Follow the **Controller → Service → Repository** pattern:

```text
Route → Controller → Service → Repository → Model (Mongoose)
```

- **Controllers:** Parse request, call service, send response. No business logic.
- **Services:** Business logic. Call repositories for data access.
- **Repositories:** Direct database queries (Mongoose operations).
- **Models:** Schema definitions only. No business logic.

### API Conventions
- All endpoints prefixed with `/api/`
- Use RESTful naming: `GET /api/students`, `POST /api/students`, `PUT /api/students/:id`
- Return consistent JSON responses:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Optional message"
  }
  ```
- Use proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)

### Validation
- Use Joi schemas in `validators/` directory
- Validate request body, params, and query in the controller or via middleware
- Never trust client input

### Error Handling
- Use `next(error)` to propagate errors to the global error handler
- Custom errors should include `statusCode` and `message`
- Never expose stack traces in production

### Environment Variables
- All config from `.env` via `process.env`
- Document every variable in `.env.example`
- Never hardcode secrets, connection strings, or URLs

---

## Git Rules

- Do not commit `node_modules/`, `dist/`, `.env`, or IDE config files
- Write meaningful PR descriptions
- Keep commits atomic — one logical change per commit
- Branch naming: `feature/<name>`, `fix/<name>`, `docs/<name>`

---

> **Last Updated:** September 2026

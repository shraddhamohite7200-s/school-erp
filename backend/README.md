# ⚙️ SchoolERP — Backend

The Express.js REST API for SchoolERP.

---

## Architecture Overview

```text
backend/
├── src/
│   ├── config/           # Application configuration
│   │   └── db.js         # MongoDB connection via Mongoose
│   │
│   ├── controllers/      # HTTP request handlers
│   │   └── (empty — ready for development)
│   │
│   ├── middleware/        # Express middleware
│   │   ├── auth.middleware.js    # JWT verification
│   │   └── error.middleware.js   # 404 + global error handler
│   │
│   ├── models/           # Mongoose schema definitions
│   │   └── (empty — ready for development)
│   │
│   ├── repositories/     # Data access layer (Mongoose queries)
│   │   └── (empty — ready for development)
│   │
│   ├── routes/           # Express route definitions
│   │   └── (empty — ready for development)
│   │
│   ├── services/         # Business logic layer
│   │   └── (empty — ready for development)
│   │
│   ├── validators/       # Joi validation schemas
│   │   └── (empty — ready for development)
│   │
│   ├── utils/            # Shared utility functions
│   │   └── (empty — ready for development)
│   │
│   ├── constants/        # Application-wide constants
│   │   └── index.js      # Roles, statuses, enums
│   │
│   ├── docs/             # API documentation
│   │   └── (empty — ready for development)
│   │
│   └── app.js            # Express app setup and middleware pipeline
│
├── server.js             # Entry point (env, DB connect, listen)
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variable template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

---

## Folder Responsibilities

| Folder | Responsibility | Example |
|--------|---------------|---------|
| `config/` | Database connections, external service configs | `db.js` |
| `controllers/` | Parse HTTP request, call service, send response | `student.controller.js` |
| `middleware/` | Cross-cutting concerns (auth, logging, errors) | `auth.middleware.js` |
| `models/` | Mongoose schema + model definitions | `Student.model.js` |
| `repositories/` | Raw database queries, data access abstraction | `student.repository.js` |
| `routes/` | Map HTTP methods + paths to controllers | `student.routes.js` |
| `services/` | Business logic, orchestration between repos | `student.service.js` |
| `validators/` | Joi schemas for request validation | `student.validator.js` |
| `utils/` | Pure helper functions (pagination, date ops) | `paginate.js` |
| `constants/` | Enums, magic strings, config constants | `index.js` |
| `docs/` | Swagger/OpenAPI specs, API docs | `openapi.yaml` |

---

## Request Lifecycle

```text
Client Request
    │
    ▼
┌─────────────────┐
│  Express Router  │  ← Route matching (routes/)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Middleware     │  ← Auth, validation, rate limiting
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │  ← Parse req, call service, send res
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Service      │  ← Business logic, data transformation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Repository     │  ← Mongoose queries (find, save, update)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   MongoDB       │  ← Data persistence
└─────────────────┘
```

---

## Middleware Flow

Requests pass through middleware in this order:

1. **Helmet** — Sets security HTTP headers
2. **CORS** — Configures Cross-Origin Resource Sharing (allows `CLIENT_URL`)
3. **Morgan** — HTTP request logging (`dev` in development, `combined` in production)
4. **express.json** — Parses JSON request bodies (limit: 10MB)
5. **express.urlencoded** — Parses URL-encoded bodies
6. **Route-level middleware** — Auth, validation (per-route basis)
7. **404 Handler** — Catches unmatched routes
8. **Global Error Handler** — Catches all errors via `next(err)`

---

## JWT Authentication Flow

```text
┌──────────┐     POST /api/auth/login      ┌──────────┐
│  Client  │  ──────────────────────────▶   │  Server  │
│          │     { email, password }         │          │
│          │                                 │          │
│          │     ◀──────────────────────────  │          │
│          │     { token, user }             │          │
└──────────┘                                └──────────┘

Subsequent requests:
┌──────────┐     GET /api/students          ┌──────────┐
│  Client  │  ──────────────────────────▶   │  Server  │
│          │     Authorization: Bearer <JWT> │          │
│          │                                 │          │
│          │     auth.middleware.js           │          │
│          │     ├─ Extract token            │          │
│          │     ├─ jwt.verify(token)        │          │
│          │     ├─ Attach decoded → req.user│          │
│          │     └─ next()                   │          │
│          │                                 │          │
│          │     ◀──────────────────────────  │          │
│          │     { success: true, data: [...]}          │
└──────────┘                                └──────────┘
```

### Token Storage (Frontend)
- Token: `localStorage.getItem('schoolerp_token')`
- User: `localStorage.getItem('schoolerp_user')`

### Token Lifecycle
1. User logs in → server returns JWT
2. Frontend stores token in `localStorage`
3. Axios interceptor attaches `Authorization: Bearer <token>` to every request
4. Server middleware verifies token on protected routes
5. On 401 response → frontend clears token and redirects to `/login`

---

## Error Handling Strategy

### Custom Error Pattern
```javascript
// In a service or controller:
const error = new Error('Student not found');
error.statusCode = 404;
throw error;
// or: next(error);
```

### Global Error Handler Response
```json
{
  "success": false,
  "message": "Student not found",
  "stack": "Error: Student not found\n    at ..." // Only in development
}
```

### HTTP Status Code Usage
| Code | Meaning | When to Use |
|------|---------|-------------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST (resource created) |
| `400` | Bad Request | Validation errors, malformed input |
| `401` | Unauthorized | Missing or invalid JWT |
| `403` | Forbidden | Valid JWT but insufficient permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate resource (e.g., duplicate email) |
| `500` | Internal Server Error | Unhandled server errors |

---

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `5000` |
| `MONGODB_URI` | **Yes** | MongoDB connection string | — |
| `JWT_SECRET` | **Yes** | Secret key for JWT signing | — |
| `JWT_EXPIRES_IN` | No | Token expiration duration | `7d` |
| `CLIENT_URL` | No | Frontend URL for CORS | `http://localhost:3000` |
| `NODE_ENV` | No | Environment mode | `development` |

Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

---

## API Conventions

### Base URL
All API endpoints are prefixed with `/api/`:
```
http://localhost:5000/api/students
http://localhost:5000/api/auth/login
```

### Response Format
Every response follows a consistent structure:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Students retrieved successfully",
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is required" }
  ]
}
```

### RESTful Endpoints Pattern
```
GET    /api/<resource>           # List all (with pagination)
GET    /api/<resource>/:id       # Get single by ID
POST   /api/<resource>           # Create new
PUT    /api/<resource>/:id       # Update existing
DELETE /api/<resource>/:id       # Delete
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server with hot reload (nodemon)
npm run dev

# Start production server
npm start

# Run tests
npm test

# Lint
npm run lint
```

---

## Health Check

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-09-24T06:00:00.000Z",
  "uptime": 123.456
}
```

---

> **Last Updated:** September 2026

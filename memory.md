# 🧠 Memory — SchoolERP

This file serves as a persistent context log — key facts, decisions, and context the development team (or AI assistant) should remember across sessions.

---

## Project Identity

- **Project Name:** SchoolERP
- **Type:** Full-stack MERN web application
- **Domain:** School management for early childhood and play schools
- **Architecture:** Monorepo with independent `frontend/` and `backend/` packages

---

## Tech Stack Snapshot

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 19 |
| Build Tool | Vite | 8 |
| CSS Framework | Tailwind CSS | 4 |
| Routing | React Router | 7 |
| HTTP Client | Axios | 1.x |
| Animation | Motion (Framer Motion) | 12.x |
| Icons | Lucide React + Material Symbols | Latest |
| Backend Framework | Express | 4.x |
| Database | MongoDB + Mongoose | 8.x |
| Auth | JWT + bcryptjs | — |
| Validation | Joi | 17.x |

---

## Key Facts

1. **Frontend is complete.** All pages, components, routing, context providers, and service layer are implemented.
2. **Backend is scaffold-only.** Folder structure and middleware stubs exist; no APIs or business logic are implemented yet.
3. **Frontend uses mock data.** The `services/` layer currently uses `localStore.js` and `mockData.js` for data persistence — these will be replaced by real API calls in Phase 4.
4. **Authentication is mock.** `AuthContext.jsx` handles login/logout but uses local storage simulation — will connect to JWT-based auth API in Phase 3.
5. **The `@` path alias** maps to the project root (defined in `vite.config.ts` and `tsconfig.json`) but is **not currently used** in any imports. All imports are relative.
6. **Port assignments:** Frontend runs on `:3000`, Backend API on `:5000`.
7. **TypeScript is configured** but the codebase uses `.jsx` for components and `.js` for services. Entry files are `.tsx`.

---

## Module Summary

### Frontend Pages
| Page | Path | Description |
|------|------|-------------|
| Login | `/login` | Authentication page |
| Dashboard | `/dashboard` | KPI cards, recent activity |
| Students | `/students` | Student list with CRUD |
| Add Student | `/students/new` | Student registration form |
| Student Details | `/students/:id` | Individual student view |
| Edit Student | `/students/:id/edit` | Edit student form |
| Parents | `/parents` | Parent/guardian management |
| Classes | `/classes` | Class/section management |
| Attendance | `/attendance` | Daily attendance marking |
| Attendance History | `/attendance/history` | Historical attendance records |
| Fees | `/fees` | Fee structure management |
| Pending Fees | `/fees/pending` | Outstanding fee tracker |
| Collect Fee | `/fees/collect` | Fee collection form |
| Payments | `/payments` | Payment transaction log |
| Reports | `/reports` | Analytics and reports |
| Settings | `/settings` | System configuration |

### Frontend Services
| Service | Purpose |
|---------|---------|
| `api.js` | Centralized Axios instance with JWT interceptors |
| `studentService.js` | Student CRUD operations |
| `classService.js` | Class management operations |
| `parentService.js` | Parent management operations |
| `attendanceService.js` | Attendance operations |
| `feeService.js` | Fee structure operations |
| `paymentService.js` | Payment operations |
| `reportService.js` | Report generation |
| `settingsService.js` | Settings operations |
| `authService.js` | Authentication operations |
| `localStore.js` | Local storage data persistence |
| `mockData.js` | Seed data for development |

---

## Reminders

- Do **not** modify the frontend UI design — it is finalized.
- Backend APIs must match the contract expected by the frontend service layer.
- All API routes should be prefixed with `/api/`.
- JWT tokens are stored in `localStorage` under key `schoolerp_token`.
- User data is stored under key `schoolerp_user`.

---

> **Last Updated:** September 2026

# 🖥 SchoolERP — Frontend

The React-based client application for SchoolERP.

---

## Architecture Overview

```text
src/
├── components/           # Reusable UI building blocks
│   ├── common/           # Shared components (Button, Modal, Input, etc.)
│   └── layout/           # App shell (Sidebar, TopHeader, ProtectedRoute)
│
├── pages/                # Route-level page components
│   ├── auth/             # Login
│   ├── dashboard/        # Dashboard with KPI cards
│   ├── students/         # Student CRUD (list, add, edit, details)
│   ├── parents/          # Parent management
│   ├── classes/          # Class/section management
│   ├── attendance/       # Daily attendance + history
│   ├── fees/             # Fee structures, pending, collection
│   ├── payments/         # Payment transactions
│   ├── reports/          # Reports & analytics
│   └── settings/         # System configuration
│
├── context/              # React Context providers
│   ├── AuthContext.jsx   # Authentication state & methods
│   └── ToastContext.jsx  # Toast notification system
│
├── services/             # API service layer
│   ├── api.js            # Centralized Axios instance
│   ├── studentService.js # Student API calls
│   ├── classService.js   # Class API calls
│   ├── parentService.js  # Parent API calls
│   ├── attendanceService.js
│   ├── feeService.js
│   ├── paymentService.js
│   ├── reportService.js
│   ├── settingsService.js
│   ├── authService.js
│   ├── localStore.js     # LocalStorage persistence (mock)
│   └── mockData.js       # Seed data for development
│
├── routes/               # Route definitions
│   └── AppRoutes.jsx     # All route mappings
│
├── utils/                # Helper functions
│   └── formatters.js     # Date, currency, and number formatters
│
├── App.tsx               # Root component (BrowserRouter + Providers)
├── main.tsx              # ReactDOM entry point
└── index.css             # Global styles (Tailwind CSS 4)
```

---

## State Management Strategy

| Scope | Solution | Files |
|-------|----------|-------|
| Authentication | React Context | `context/AuthContext.jsx` |
| Toast Notifications | React Context | `context/ToastContext.jsx` |
| Page-level state | `useState` / `useReducer` | Individual page components |
| Server state | Service layer + local state | `services/*.js` + components |

**Design Principle:** Keep state as close to where it is used as possible. Only lift state into Context when it needs to be accessed across multiple unrelated components.

---

## API Service Layer

All HTTP communication is centralized through a layered service architecture:

```text
Component → Domain Service → api.js (Axios) → Backend API
```

### `api.js` — Centralized Axios Instance
- Base URL from `VITE_API_BASE_URL` environment variable (defaults to `/api`)
- **Request interceptor:** Attaches JWT Bearer token from `localStorage`
- **Response interceptor:** Handles 401 (auto-redirect to login, clear token)
- Timeout: 10 seconds

### Domain Services
Each service encapsulates API calls for a specific domain:
- `studentService.js` — `getStudents()`, `getStudent(id)`, `createStudent()`, `updateStudent()`, `deleteStudent()`
- `classService.js` — `getClasses()`, `createClass()`, `updateClass()`, `deleteClass()`
- `attendanceService.js` — `getAttendance()`, `markAttendance()`, `getHistory()`
- `feeService.js` — `getFeeStructures()`, `createFee()`, `getPendingFees()`
- `paymentService.js` — `getPayments()`, `collectPayment()`
- And more...

> **Note:** Services currently use `localStore.js` (localStorage) for data persistence. They will be connected to the real backend API in Phase 4.

---

## Route Structure

| Path | Component | Access |
|------|-----------|--------|
| `/login` | `Login` | Public |
| `/dashboard` | `Dashboard` | Protected |
| `/students` | `Students` | Protected |
| `/students/new` | `AddStudent` | Protected |
| `/students/:id` | `StudentDetails` | Protected |
| `/students/:id/edit` | `EditStudent` | Protected |
| `/parents` | `Parents` | Protected |
| `/classes` | `Classes` | Protected |
| `/attendance` | `Attendance` | Protected |
| `/attendance/history` | `AttendanceHistory` | Protected |
| `/fees` | `Fees` | Protected |
| `/fees/pending` | `PendingFees` | Protected |
| `/fees/collect` | `CollectFee` | Protected |
| `/payments` | `Payments` | Protected |
| `/reports` | `Reports` | Protected |
| `/settings` | `Settings` | Protected |
| `*` | Redirect to `/dashboard` | — |

**Protected routes** are wrapped with `ProtectedRoute`, which checks for authentication state from `AuthContext`. Authenticated pages use `AppLayout` (sidebar + top header).

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `/api` |

Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# TypeScript type-check
npm run lint
```

---

## Key Libraries

| Library | Purpose |
|---------|---------|
| `react` (v19) | UI framework |
| `react-router-dom` (v7) | Client-side routing |
| `axios` | HTTP client |
| `tailwindcss` (v4) | Utility-first CSS |
| `lucide-react` | Icon library |
| `motion` | Animations |
| `@google/genai` | Gemini AI integration |

---

> **Last Updated:** September 2026

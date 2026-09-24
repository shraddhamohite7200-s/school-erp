<div align="center">

# 🏫 SchoolERP

**Modern School Management System**

A full-stack MERN application for managing student admissions, class cohorts, daily attendance, fee ledger, payments, and reports — designed for early childhood and play schools.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📐 Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                     │
│  React 19 · React Router · Axios · Tailwind CSS · Vite     │
└────────────────────────────┬────────────────────────────────┘
                             │  HTTP / REST
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Server (Express)                    │
│  JWT Auth · Helmet · CORS · Morgan · Joi Validation        │
└────────────────────────────┬────────────────────────────────┘
                             │  Mongoose ODM
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database (MongoDB)                     │
│  Students · Classes · Attendance · Fees · Payments · Users  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```text
SchoolERP/
│
├── frontend/               # React + Vite client application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level page components
│   │   ├── context/        # React Context providers
│   │   ├── services/       # API service layer (Axios)
│   │   ├── routes/         # Route definitions
│   │   ├── utils/          # Helper / formatter functions
│   │   ├── App.tsx         # Root component
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles (Tailwind)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                # Express.js REST API
│   ├── src/
│   │   ├── config/         # DB connection, app config
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/      # Auth, error handling, validation
│   │   ├── models/         # Mongoose schemas
│   │   ├── repositories/   # Data-access layer
│   │   ├── routes/         # Express route definitions
│   │   ├── services/       # Business logic layer
│   │   ├── validators/     # Joi validation schemas
│   │   ├── utils/          # Shared utilities
│   │   ├── constants/      # Enums and magic values
│   │   ├── docs/           # API documentation
│   │   └── app.js          # Express app configuration
│   ├── server.js           # Server entry point
│   └── package.json
│
├── docs/                   # Project-wide documentation
│   ├── api/                # API endpoint documentation
│   ├── architecture/       # System design documents
│   ├── database/           # Schema & ERD documentation
│   └── deployment/         # Deployment guides
│
├── phases.md               # Development phases roadmap
├── memory.md               # Key decisions & context log
├── rules.md                # Coding standards & conventions
├── decision.md             # Architecture Decision Records
├── log.md                  # Development changelog
└── README.md               # This file
```

---

## 🛠 Tech Stack

| Layer       | Technology                                          |
|-------------|-----------------------------------------------------|
| Frontend    | React 19, React Router 7, Tailwind CSS 4, Vite 8   |
| Backend     | Node.js, Express 4, Mongoose 8                      |
| Database    | MongoDB                                              |
| Auth        | JWT (JSON Web Tokens) with bcrypt                    |
| Validation  | Joi                                                  |
| HTTP Client | Axios                                                |
| Icons       | Lucide React, Material Symbols                       |
| Animation   | Motion (Framer Motion)                               |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **MongoDB** (local or Atlas)
- **npm** or **bun**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/SchoolERP.git
cd SchoolERP
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs at **http://localhost:3000**.

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

The API runs at **http://localhost:5000**.

---

## 📦 Available Scripts

### Frontend (`/frontend`)

| Command           | Description                     |
|-------------------|---------------------------------|
| `npm run dev`     | Start Vite dev server (port 3000) |
| `npm run build`   | Production build to `dist/`     |
| `npm run preview` | Preview production build        |
| `npm run lint`    | TypeScript type-checking        |

### Backend (`/backend`)

| Command           | Description                     |
|-------------------|---------------------------------|
| `npm run dev`     | Start with nodemon (hot reload) |
| `npm start`       | Start production server         |
| `npm test`        | Run test suite (Jest)           |
| `npm run lint`    | ESLint checks                   |

---

## 🌐 Deployment Overview

| Component | Platform Options                           |
|-----------|--------------------------------------------|
| Frontend  | Vercel, Netlify, AWS S3 + CloudFront       |
| Backend   | Railway, Render, AWS EC2, DigitalOcean     |
| Database  | MongoDB Atlas                               |

Refer to `docs/deployment/` for detailed deployment guides.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

<div align="center">
  <b>Built with ❤️ for better school management</b>
</div>

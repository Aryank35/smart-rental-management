# TenantFlow

A modern, mobile-first property management SaaS for tenants and property owners.

TenantFlow is a **full-stack** app: a React frontend (this folder) and a Node/Express +
MongoDB API (in [`server/`](server)).

## Tech Stack

**Frontend**
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** (HSL CSS-variable theming, light/dark)
- **React Router** + **TanStack Query** (server state) + **Zustand** (client state)
- **Radix UI** + **class-variance-authority** (accessible components, shadcn-style)
- **React Hook Form** + **Zod**, **Recharts**, **Framer Motion**, **lucide-react**

**Backend** ([`server/`](server))
- **Node + Express** (TypeScript, ESM)
- **MongoDB** via **Mongoose**
- **JWT** auth + **bcrypt** password hashing, **Zod** request validation

## Getting Started

> **First time?** Follow the database setup guide: **[docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md)**.
> It walks you through MongoDB (Atlas or local), env config, seeding, and running both servers.
>
> **Deploying?** See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — frontend → Vercel, backend → Render,
> configured so local dev and production work from the same code (only env vars differ).

Quick version once MongoDB is configured (`server/.env` set):

```bash
# install (once)
npm install
cd server && npm install && cd ..

# seed demo data (once / to reset)
cd server && npm run seed && cd ..

# run — two terminals
cd server && npm run dev    # API  → http://localhost:4000
npm run dev                 # app  → http://localhost:5173
```

The app opens at `/login`. Sign in with the seeded demo accounts:

| Role   | Email                   | Password          |
| ------ | ----------------------- | ----------------- |
| Tenant | `tenant@tenantflow.app` | `TenantFlow@2026` |
| Admin  | `admin@tenantflow.app`  | `TenantFlow@2026` |

Registering creates a **landlord (admin) account + organization**; tenants are created by
an admin from the Tenants page. Visit `/components` for the **design system showcase**.

### Frontend-only scripts

```bash
npm run build      # typecheck + production build
npm run preview    # preview the production build
npm run typecheck  # type-check only
```

## Project Structure

```
src/                       # ── Frontend ──
├─ components/
│  ├─ ui/         # design system primitives (Button, Input, Modal, Table, …)
│  └─ layout/     # app shell (Sidebar, BottomNav, TopNavbar, layouts, Logo)
├─ config/        # navigation config (tenant + admin)
├─ features/      # feature-based domains (auth/, tenant/) — api calls, hooks, schemas
├─ hooks/         # reusable hooks (use-toast)
├─ lib/           # api-client + utils (cn, formatCurrency, daysUntil, …)
├─ pages/         # route pages (auth/, tenant/, showcase, placeholders)
├─ providers/     # React Query + theme providers
├─ stores/        # Zustand stores (auth, theme)
├─ router.tsx     # route definitions
└─ index.css      # Tailwind layers + theme tokens (HSL CSS variables)

server/                    # ── Backend (Express + MongoDB) ──
├─ src/
│  ├─ config/     # env loading, Mongo connection
│  ├─ models/     # Mongoose schemas (User, Tenancy, Bill, Notice)
│  ├─ middleware/ # JWT auth guard, error handler
│  ├─ controllers/# auth + tenant request handlers
│  ├─ routes/     # /api/auth, /api/tenant
│  ├─ validation/ # Zod request schemas
│  ├─ seed.ts     # demo data seeder (npm run seed)
│  └─ index.ts    # server bootstrap
└─ .env.example   # copy to .env and fill in MONGODB_URI, JWT_SECRET
```

### API endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | – | Create account → `{ token, user }` |
| POST | `/api/auth/login` | – | Sign in (email or phone) → `{ token, user }` |
| POST | `/api/auth/forgot-password` | – | Request reset (always 200) |
| GET | `/api/auth/me` | ✓ | Current user |
| PUT | `/api/auth/profile` | ✓ | Complete/update profile |
| GET | `/api/tenant/dashboard` | ✓ | Dashboard payload |
| GET | `/api/tenant/rent` | ✓ | Rent details |
| GET | `/api/tenant/rent/history` | ✓ | Rent payment history |

## Theming

Colors are defined as HSL CSS variables in [src/index.css](src/index.css) and exposed to
Tailwind via [tailwind.config.js](tailwind.config.js). Dark mode is class-based (`.dark` on
`<html>`), persisted in `localStorage`, and applied before first paint to avoid flicker.
Primary brand color is **Indigo**.

## Roadmap

The build follows a 22-phase roadmap (tenant portal → admin portal → SaaS/monetization).

- ✅ **Phase 1 — Design System Foundation**: components, layouts, theme, dark mode, responsive shell
- ✅ **Phase 2 — Authentication**: login (email/phone), register, forgot-password, profile setup; RHF + Zod validation, mock auth, persisted session, role-based protected routes, user menu + sign-out
- ✅ **Phase 3 — Tenant Dashboard**: welcome card, quick actions, 5 summary cards, upcoming-payments / recent-notices / recent-payments widgets; typed tenant mock-data layer + React Query with loading/error/empty states
- ✅ **Phase 4 — Rent Management (tenant)**: outstanding-balance/pay panel, rent/deposit/penalty/due-date stats, paginated payment-history table with status badges, downloadable HTML receipts, Pay Rent modal (method + mock gateway)
- ✅ **Backend migration** — replaced the in-memory mock layer with a real **MongoDB + Express API** (JWT auth, bcrypt, Mongoose models, seeded demo data). See [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md).
- ⬜ Phase 5+ — Utility bills, complaints, notices, documents, admin portal, analytics, SaaS features

Routes for all phases are scaffolded with placeholder pages so navigation works end-to-end today.
Phases 2–4 are now backed by MongoDB; later phases extend the same API + models.

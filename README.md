# TenantFlow

A modern, mobile-first property management SaaS for tenants and property owners.

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** (HSL CSS-variable theming, light/dark)
- **React Router** (data router)
- **TanStack Query** (server state) + **Zustand** (client state)
- **Radix UI** primitives + **class-variance-authority** (accessible component layer, shadcn-style)
- **React Hook Form** + **Zod**, **Recharts**, **Framer Motion**, **lucide-react**

## Getting Started

```bash
npm install
npm run dev        # start dev server at http://localhost:5173
npm run build      # typecheck + production build
npm run preview    # preview the production build
npm run typecheck  # type-check only
```

The app opens at `/login`. Sign in with the demo accounts:

| Role   | Email                   | Password    |
| ------ | ----------------------- | ----------- |
| Tenant | `tenant@tenantflow.app` | `password1` |
| Admin  | `admin@tenantflow.app`  | `password1` |

New registrations go through the profile-setup step. Visit `/components` for the
**design system showcase** — every Phase 1 component, light & dark.

## Project Structure

```
src/
├─ components/
│  ├─ ui/         # design system primitives (Button, Input, Modal, Table, …)
│  └─ layout/     # app shell (Sidebar, BottomNav, TopNavbar, layouts, Logo)
├─ config/        # navigation config (tenant + admin)
├─ hooks/         # reusable hooks (use-toast)
├─ lib/           # utils (cn, formatCurrency, formatDate, getInitials)
├─ pages/         # route pages (auth/, showcase, placeholders)
├─ providers/     # React Query + theme providers
├─ stores/        # Zustand stores (theme)
├─ router.tsx     # route definitions
└─ index.css      # Tailwind layers + theme tokens (HSL CSS variables)
```

## Theming

Colors are defined as HSL CSS variables in [src/index.css](src/index.css) and exposed to
Tailwind via [tailwind.config.js](tailwind.config.js). Dark mode is class-based (`.dark` on
`<html>`), persisted in `localStorage`, and applied before first paint to avoid flicker.
Primary brand color is **Indigo**.

## Roadmap

The build follows a 22-phase roadmap (tenant portal → admin portal → SaaS/monetization).

- ✅ **Phase 1 — Design System Foundation**: components, layouts, theme, dark mode, responsive shell
- ✅ **Phase 2 — Authentication**: login (email/phone), register, forgot-password, profile setup; RHF + Zod validation, mock auth, persisted session, role-based protected routes, user menu + sign-out
- ⬜ Phase 3 — Tenant Dashboard
- ⬜ Phase 4+ — Rent, bills, complaints, notices, documents, admin portal, analytics, SaaS features

Routes for all phases are scaffolded with placeholder pages so navigation works end-to-end today.
Data will run on a typed mock layer (swappable for a real API) as feature phases land.

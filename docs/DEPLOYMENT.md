# Deployment — Vercel (frontend) + Render (backend)

This project is built to run **the same way locally and in production**. The only thing
that changes between environments is a couple of environment variables.

```
            LOCAL                                    PRODUCTION
┌──────────────────────────┐            ┌────────────────────────────────────┐
│ Vite dev :5173           │            │ Vercel (static frontend)            │
│   fetch("/api/…")        │            │   fetch("https://…onrender.com/api")│
│   └─ proxy → :4000        │            │            │                        │
│ Express :4000  ──► Atlas │            │ Render (Express) ──► Atlas          │
└──────────────────────────┘            └────────────────────────────────────┘
```

**How the API URL is resolved** ([src/lib/api-client.ts](../src/lib/api-client.ts)):
`import.meta.env.VITE_API_URL ?? '/api'`.
- Locally `VITE_API_URL` is unset → calls go to `/api`, which Vite proxies to `localhost:4000`.
- On Vercel you set `VITE_API_URL` to the Render URL → calls go straight there.

So **local development never breaks** when you deploy — you only add env vars in the hosts.

---

## Prerequisites

1. Code pushed to a **GitHub repo** (Vercel + Render both deploy from GitHub).
2. A **MongoDB Atlas** cluster + connection string (see [DATABASE_SETUP.md](DATABASE_SETUP.md)).
3. Atlas **Network Access** must allow your servers. Render/Vercel use dynamic IPs, so add
   `0.0.0.0/0` (Allow from anywhere) under Atlas → Network Access.

> ⚠️ Your local `server/.env` and root `.env` are git-ignored — they are **not** uploaded.
> You re-enter those values as environment variables in Render/Vercel (below).

---

## Part 1 — Deploy the backend to Render

Render reads [`render.yaml`](../render.yaml) at the repo root (a "Blueprint").

1. Go to <https://dashboard.render.com> → **New** → **Blueprint**.
2. Connect your GitHub repo. Render detects `render.yaml` and proposes a web service
   named **tenantflow-api** (root directory `server/`).
3. Click **Apply**. When prompted, fill in the env vars that are marked "sync: false":
   - **`MONGODB_URI`** → your Atlas connection string (with `/tenantflow` before the `?`).
   - **`CLIENT_URL`** → leave blank for now; you'll set it after Vercel gives you a URL
     (Part 2). You can put a placeholder like `https://example.vercel.app` temporarily.
   - `JWT_SECRET` is auto-generated; `JWT_EXPIRES_IN`, `ALLOW_VERCEL_PREVIEWS`, `NODE_VERSION`
     come from the blueprint.
4. Wait for the first deploy. When it's live, note the URL, e.g.
   `https://tenantflow-api.onrender.com`.
5. Verify: open `https://tenantflow-api.onrender.com/api/health` → should return
   `{"status":"ok"}`.
6. **Seed the production database once** (from your machine, pointing at Atlas):
   ```bash
   cd server
   npm run seed     # uses your local server/.env MONGODB_URI (the Atlas one)
   ```
   (Render's shell can also run `npm run seed`, but running locally against the same Atlas
   cluster is simplest.)

> **Render free tier** spins the service down after ~15 min idle; the next request takes
> ~30–60s to wake. That's expected. The frontend shows a normal loading state meanwhile.

**Not using the blueprint?** Create the service manually with:
- Root directory: `server`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check path: `/api/health`
- Env vars: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `CLIENT_URL`, `ALLOW_VERCEL_PREVIEWS=true`
- Do **not** set `NODE_ENV=production` (the build needs devDependencies like TypeScript).

---

## Part 2 — Deploy the frontend to Vercel

Vercel reads [`vercel.json`](../vercel.json) (framework = Vite, SPA rewrites).

1. Go to <https://vercel.com> → **Add New** → **Project** → import your GitHub repo.
2. **Root Directory:** leave as the repo root (`.`). Vercel auto-detects Vite; the
   `.vercelignore` keeps the `server/` folder out of the build.
3. **Environment Variables** → add:
   - **`VITE_API_URL`** = `https://tenantflow-api.onrender.com/api`
     (your Render URL from Part 1, **with `/api` on the end**). Add it for
     **Production** and **Preview**.
4. **Deploy.** You'll get a URL like `https://tenantflow.vercel.app`.

---

## Part 3 — Connect the two (CORS)

Now tell the backend to trust the frontend:

1. In **Render** → your service → **Environment** → set
   **`CLIENT_URL`** = `https://tenantflow.vercel.app` (your real Vercel production URL).
   - Multiple origins? Comma-separate them, e.g.
     `https://tenantflow.vercel.app,http://localhost:5173`.
   - `ALLOW_VERCEL_PREVIEWS=true` (already set by the blueprint) lets every
     `*.vercel.app` preview deploy through CORS too.
2. Render redeploys automatically. Done.

Open your Vercel URL, sign in with `tenant@tenantflow.app` / `password1`, and you're live.

---

## Environment variable reference

### Render (backend)

| Variable | Example | Notes |
| --- | --- | --- |
| `MONGODB_URI` | `mongodb+srv://…/tenantflow?...` | Atlas string, secret |
| `JWT_SECRET` | (auto-generated) | Long random string |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLIENT_URL` | `https://tenantflow.vercel.app` | CORS allow-list (comma-separated ok) |
| `ALLOW_VERCEL_PREVIEWS` | `true` | Allow `*.vercel.app` previews |
| `PORT` | (provided by Render) | Don't hardcode — the app reads `process.env.PORT` |
| `DNS_SERVERS` | *(usually unset)* | Only if Atlas SRV fails on Render |

### Vercel (frontend)

| Variable | Example | Notes |
| --- | --- | --- |
| `VITE_API_URL` | `https://tenantflow-api.onrender.com/api` | Must include `/api`. Set for Production + Preview |

---

## Day-to-day workflow

- **Develop locally** exactly as before — two terminals (`cd server && npm run dev`, and
  `npm run dev`). No env changes needed; the Vite proxy handles `/api`.
- **Push to GitHub** → Render and Vercel auto-deploy their respective parts.
- **Production debugging:** check Render logs (build/runtime) and the browser Network tab
  (look for the request to `…onrender.com/api/…` and its CORS headers).

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| **Render build fails compiling `src/pages/...`, `src/router.tsx`, "Cannot find module 'react'", "Cannot find type definition file for 'node'"** | Render is building the **frontend** by mistake. Set the service's **Root Directory to `server`** (Settings → Build & Deploy → Root Directory), or redeploy via the Blueprint. The frontend belongs on Vercel, not Render. |
| Render build: `tsc: not found` / missing `@types/*` | `NODE_ENV=production` is stripping devDependencies. The blueprint build command uses `npm install --include=dev` to prevent this; apply the same if you configured the service manually. |
| Frontend loads but API calls fail with CORS error | `CLIENT_URL` on Render must equal your exact Vercel origin (no trailing slash). |
| `Cannot reach the server` on first load | Render free tier is waking up (~30–60s). Retry. |
| 401 right after deploy | `JWT_SECRET` changed → old tokens invalid. Sign in again. |
| "No tenancy found" after login | DB not seeded. Run `npm run seed` against the Atlas URI. |
| Build fails on Render: `tsc: not found` | `NODE_ENV=production` is set, skipping devDeps. Unset it, or use the blueprint. |
| Atlas connection refused from Render | Atlas → Network Access → add `0.0.0.0/0`. |

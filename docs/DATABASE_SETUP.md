# Database Setup — MongoDB

TenantFlow now stores data in **MongoDB**, accessed through a Node/Express API in
[`server/`](../server). The React app never talks to MongoDB directly — it calls the API,
and the API talks to the database. This guide gets you from zero to a running, seeded app.

```
┌────────────┐      HTTP /api      ┌──────────────┐     Mongoose      ┌───────────┐
│  React app │ ──────────────────► │  Express API │ ────────────────► │  MongoDB  │
│  (Vite)    │ ◄────────────────── │  (server/)   │ ◄──────────────── │           │
└────────────┘      JSON            └──────────────┘                   └───────────┘
   :5173                               :4000
```

You only need to do **Step 1** once. Pick **either** Option A (cloud, easiest) **or**
Option B (local install).

---

## Step 1 — Get a MongoDB database

### Option A — MongoDB Atlas (free cloud, recommended)

1. Go to <https://www.mongodb.com/cloud/atlas/register> and create a free account.
2. Create a **free M0 cluster** (any cloud/region near you).
3. **Database Access** → *Add New Database User* → create a username + password
   (e.g. `tenantflow`). Save the password.
4. **Network Access** → *Add IP Address* → **Allow Access from Anywhere** (`0.0.0.0/0`)
   for development. (Lock this down later for production.)
5. **Database** → *Connect* → *Drivers* → copy the connection string. It looks like:
   ```
   mongodb+srv://tenantflow:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your real password and add the database name `tenantflow`
   before the `?`:
   ```
   mongodb+srv://tenantflow:YOURPASS@cluster0.xxxxx.mongodb.net/tenantflow?retryWrites=true&w=majority
   ```
   That whole string is your `MONGODB_URI`.

### Option B — Local MongoDB (Windows)

1. Download **MongoDB Community Server** from
   <https://www.mongodb.com/try/download/community> and run the installer
   (choose *Complete*, and "Install MongoDB as a Service" so it starts automatically).
2. Optionally install **MongoDB Shell (mongosh)** to inspect data.
3. Your connection string is:
   ```
   mongodb://127.0.0.1:27017/tenantflow
   ```
   (No username/password by default on a local install.)

> Prefer Docker? `docker run -d -p 27017:27017 --name tenantflow-mongo mongo:7`
> gives you the same local URI.

---

## Step 2 — Configure the API

```bash
cd server
cp .env.example .env        # Windows PowerShell: copy .env.example .env
```

Open `server/.env` and set:

```ini
MONGODB_URI=<the connection string from Step 1>
JWT_SECRET=<a long random string>
PORT=4000
CLIENT_URL=http://localhost:5173
```

Generate a strong `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Step 3 — Install dependencies

From the project root:

```bash
npm install            # frontend (once)
cd server && npm install && cd ..   # backend (once)
```

---

## Step 4 — Seed demo data

This creates the demo tenant/admin users, a tenancy, bills, and notices:

```bash
cd server
npm run seed
```

You should see `✅ Seed complete.` Re-run any time to reset the data.

| Role   | Email                   | Password          |
| ------ | ----------------------- | ----------------- |
| Tenant | `tenant@tenantflow.app` | `TenantFlow@2026` |
| Admin  | `admin@tenantflow.app`  | `TenantFlow@2026` |

---

## Step 5 — Run both servers

Open **two terminals**:

**Terminal 1 — API**
```bash
cd server
npm run dev
# → 🚀 TenantFlow API listening on http://localhost:4000
```

**Terminal 2 — Frontend**
```bash
npm run dev
# → http://localhost:5173
```

Open <http://localhost:5173>, sign in with the demo tenant, and the dashboard/rent
pages now load **live data from MongoDB**. Register a new account to exercise the
full register → profile-setup → dashboard flow — those records persist in your database.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `❌ Could not connect to MongoDB` | Check `MONGODB_URI`. Atlas: confirm IP allow-list + password. Local: is the Mongo service running? |
| Login works but dashboard 404s "No tenancy found" | You logged in as a **freshly registered** user (no tenancy). Use the seeded `tenant@tenantflow.app`, or run `npm run seed`. |
| `Cannot reach the server. Is the API running?` in the browser | Start the API (Terminal 1). The frontend proxies `/api` → `localhost:4000`. |
| Atlas auth fails | The `<password>` in the URI must be URL-encoded if it has special characters. |
| Port 4000 in use | Change `PORT` in `server/.env` (the Vite proxy targets 4000 — update `vite.config.ts` if you change it). |

---

## How the pieces connect (for reference)

- **Models** — [`server/src/models`](../server/src/models): `User`, `Tenancy`, `Bill`, `Notice`.
- **Auth** — JWT (`Authorization: Bearer <token>`), passwords hashed with bcrypt.
  Routes in [`server/src/routes/auth.routes.ts`](../server/src/routes/auth.routes.ts).
- **Tenant data** — [`server/src/controllers/tenant.controller.ts`](../server/src/controllers/tenant.controller.ts)
  assembles the dashboard/rent payloads from `Tenancy` + `Bill` + `Notice`.
- **Frontend** — [`src/lib/api-client.ts`](../src/lib/api-client.ts) is the fetch wrapper
  (attaches the token, handles errors). Feature calls live in
  [`src/features/auth/api.ts`](../src/features/auth/api.ts) and
  [`src/features/tenant/api.ts`](../src/features/tenant/api.ts).
- The JWT token is stored in `localStorage` (Zustand `persist`, key `tenantflow-auth`).

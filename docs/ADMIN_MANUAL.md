# TenantFlow — Admin (Landlord) Manual

A plain-language guide to running your property business in TenantFlow. This is for
the **admin / property manager** — the person who owns properties and manages tenants.

> **Demo login:** `admin@tenantflow.app` / `TenantFlow@2026`

---

## 1. What the admin portal is

TenantFlow gives every landlord their own private **workspace** (organization). Inside it
you manage everything about your rentals:

- **Properties & units** — your buildings and the rooms/flats inside them
- **Tenants** — the people renting your units, and their logins
- **Billing & payments** — rent, electricity, water, penalties, and what's been collected
- **Complaints** — maintenance requests from tenants
- **Notices** — announcements you send to tenants
- **Documents** — files (agreements, receipts) you share with tenants

Everything you create is visible **only to you**. Other landlords on the same system never
see your data.

---

## 2. Getting started

### Create your workspace (first time)
1. Open the app and click **Create one** on the login screen.
2. Enter your name, a **business/organization name** (your tenants will see this), email,
   phone, and a password.
3. You're taken straight to your **admin dashboard**. Your workspace starts empty — the
   next steps fill it in.

### Sign in (returning)
- Go to **Sign in**, enter your email (or phone) and password.

---

## 3. The Dashboard

Your home screen shows the health of your business at a glance:

| Card | Meaning |
| --- | --- |
| **Collected this month** | Total payments received since the 1st |
| **Outstanding dues** | Money tenants still owe (with overdue amount highlighted) |
| **Occupancy** | % of units that are occupied |
| **Open complaints** | Requests still needing attention |
| **Properties / Tenants / Vacant units** | Portfolio counts |

You also get a **6-month collections chart** and a **recent payments** list.

---

## 4. Properties & Units

Think of it as: **Property** (a building) → contains **Units** (rooms/flats you rent out).

### Add a property
1. Sidebar → **Properties** → **Add property**.
2. Fill in name, type (apartment / house / PG / commercial), and address → **Add property**.

### Add units to a property
1. On the **Properties** page, click a property card to open it.
2. Click **Add unit** → set the unit label (e.g. "101"), floor, bedrooms, and the
   **monthly rent** + **deposit** → **Add unit**.
3. New units start as **Vacant**. A unit becomes **Occupied** automatically when you assign
   a tenant to it.

**Unit statuses:** 🟢 Occupied · 🟡 Vacant · ⚪ Maintenance.

> You can only delete a **vacant** unit or property. Offboard the tenant first (see below).

---

## 5. Tenants

### Onboard a new tenant
1. Sidebar → **Tenants** → **Add tenant**.
2. Enter their name, email, phone, and a **temporary password** (share this with them).
3. Pick a **vacant unit** to assign them to. (Rent defaults to the unit's rent — you can
   override it.) Set the agreement length in months.
4. Click **Add tenant**. This automatically:
   - creates their **login**,
   - marks the unit **Occupied**,
   - generates their **first month's rent bill**.
5. Give the tenant their email + temporary password. They can change the password later.

### View a tenant
- Click **View** on any tenant row to open a panel with their contact details, rent,
  deposit, agreement dates, **bills**, and **complaints**.

### Offboard (move out) a tenant
- In the tenant's panel, click **Offboard tenant**. This frees their unit (back to Vacant)
  and disables their login. Their history is kept.

---

## 6. Billing

Sidebar → **Billing**. This is where you raise and track every charge.

### Generate monthly rent (fastest)
- Click **Generate rent**. TenantFlow creates this month's rent bill for **every active
  tenant** who doesn't already have one. Safe to click again — it won't duplicate.

### Create a one-off bill
- Click **Create bill** → pick the tenant, choose the type (rent / electricity / water /
  penalty), enter the amount, period (e.g. "August 2026"), and due date.

### Record a payment
- On any unpaid bill, click **Mark paid** to record an offline/cash payment. It moves to
  **Paid** and appears in the Payments ledger.
- Use the **All / Pending / Overdue / Paid** tabs to filter.

> Bills a tenant hasn't paid become **Overdue** automatically once the due date passes.

---

## 7. Payments

Sidebar → **Payments** — a read-only ledger of every payment received (tenant self-pay or
your "mark paid"), with method, date, and receipt number. Includes totals and a
this-month figure.

---

## 8. Complaints

Sidebar → **Complaints** — the queue of maintenance requests your tenants raise.

1. Use the tabs to filter (Open / In progress / Resolved).
2. Click **Manage** on a complaint to:
   - change its **status**,
   - set who it's **assigned to** (e.g. "Maintenance team"),
   - add a **resolution note**.
3. Marking a complaint **Resolved** or **Closed** timestamps it and updates the tenant's view.

---

## 9. Notices

Sidebar → **Notices** — broadcast announcements to all your tenants.

1. Click **New notice** → set a title, category (maintenance / rent / community /
   emergency), a one-line summary, and optional details → **Publish**.
2. Tenants see it instantly in their portal. Each notice shows how many tenants have read it.
3. Delete a notice with the trash icon.

---

## 10. Documents

Sidebar → **Documents** — share files with tenants.

1. Click **Upload** → choose a file (up to **3 MB**), give it a title and category.
2. Choose **who sees it**: *All tenants* or *a specific tenant*.
3. Tenants download it from their **Documents** page. Use the download/trash icons to
   fetch or remove a file.

---

## 11. Settings

Sidebar → **Settings**:

- **Organization** — your business name and **billing defaults** (currency, rent due day,
  penalty per day, grace days, support contact). These defaults apply to new tenancies.
- **Change password** — update your admin login password.

---

## 12. Tips & FAQ

**How do tenants get access?** You create them (Tenants → Add tenant) and share the
temporary password. Tenants cannot sign themselves up.

**A tenant forgot their password.** Ask them to use their current password to change it in
their Settings. (A full self-service reset flow can be added later.)

**Why can't I delete a unit/property?** It's occupied. Offboard the tenant first.

**Do "Generate rent" clicks pile up?** No — it skips tenants who already have this month's
rent bill.

**Is money actually charged?** Not in this version — payments are **recorded** (marked
paid) and receipts generated. A real payment gateway can be added later.

---

*See also: [USER_MANUAL.md](USER_MANUAL.md) for the tenant-facing guide.*

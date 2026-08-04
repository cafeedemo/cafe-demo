# La Crest — deploy & operate

Next.js + Supabase Postgres + Vercel Blob (photos) + Razorpay (payments).

## 1. Push to GitHub

```bash
git add .
git commit -m "Update site"
git push
```

## 2. Vercel environment variables

In Vercel → Settings → Environment Variables:

| Name | Value |
|---|---|
| `DATABASE_URL` | Supabase **pooler** string (port 6543) with `?pgbouncer=true` |
| `AUTH_SECRET` | output of `openssl rand -base64 32` |
| `ADMIN_EMAIL` | admin login email |
| `ADMIN_PASSWORD` | a strong password |
| `BLOB_READ_WRITE_TOKEN` | Vercel → Storage → Blob store |
| `RAZORPAY_KEY_ID` | Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | Razorpay dashboard — **never commit** |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | same as `RAZORPAY_KEY_ID` |
| `GEMINI_API_KEY` | reserved for future AI features |

⚠️ The Razorpay keys currently in use are **live** keys — real money. Rotate them
in the Razorpay dashboard if they've ever been pasted into chat, docs, or a repo.

## 3. Database setup

Schema changes need the **direct** connection (port 5432), because Supabase's
transaction pooler can't run DDL:

```bash
DATABASE_URL="postgresql://USER:PASS@HOST:5432/postgres" npx prisma db push
DATABASE_URL="postgresql://USER:PASS@HOST:5432/postgres" npm run seed
```

The app itself uses the pooler (6543) — that's what belongs in Vercel.

Seeding creates the admin login, the La Crest menu with dish photos, ambience
gallery images, and a starter 10-table floor plan.

---

# How the system works

## Roles
One admin login. The sidebar has a **Viewing as** switch — Manager, Waiter, or
Chef — which filters the panel down to what that job needs (Chef sees the kitchen
queue; Waiter adds floor + reservations; Manager sees everything). Every signed-in
user still has full access; this is a focus tool, to be locked down per role later.

## Setup Cafe (`/admin/setup`)
Four tabs:
- **Branding** — name, tagline, hero copy, story, address, hours, map, logo.
- **Table Layout** — a rows × columns grid. Click an empty square to drop a table
  (pick seats and square/round first). Click a table to change it, take it out of
  service, or remove it. Grid size is set under Rules.
- **Rules & Features**
  - *Hold a reserved table for X minutes* — book 6:00 PM and the table is yours
    until 6:00 + X. After that it's bookable again.
  - *Minimum notice before a booking* — at 6:00 PM with 30 min notice, the first
    bookable slot is 6:30 PM.
  - *Slot size* — 15 min gives 6:00, 6:15, 6:30…
  - *Opening / closing hour* — bounds the slots offered.
  - *Let customers pick their own table* — on: guests see the floor plan and
    choose. Off: the server auto-assigns the smallest free table that fits.
  - *Online payments* — off means the bill only offers "Pay at Counter".
- **Table QR Codes** — one QR per table, downloadable as PNG. Print and stick on
  the table.

## Guest journey

**Booking** (`/book`) — pick date → pick a 15-min slot (full slots are struck
through) → pick a table if the floor plan is on → name + optional mobile.

**Ordering** — two ways in, both land on the same order pad:
- *Scan*: the table QR opens `/t/<token>` with the table already known; the guest
  only gives a name (+ optional mobile).
- *Manual*: `/order` — the guest picks their table number, then name (+ mobile).

Mobile number is optional. Skip it and the guest is tracked under a generated
`ANON-…` key — the order works, but it won't show under My Orders and earns no
rewards. That's the tradeoff shown on screen.

**Multiple rounds** — ordering again during the same visit adds another round to
the same tab. Nothing is billed separately. Each round shows its own order ID.
A guest can cancel a round themselves while it's still `PLACED`; once the kitchen
starts it, they're asked to speak to a server.

**The bill** (`/bill/<sessionId>`) — every round listed with customisation notes,
summed into one total, then Pay at Counter or Pay Here (if enabled).

**My Orders** (`/orders`) — look up past visits by mobile number, with order IDs.

## Staff journey
- **Live Floor** (`/admin/floor`) — colour-coded floor plan (available / reserved
  / occupied / free soon) plus every open tab with its running total and minutes
  seated. **Collect payment & free table** closes the tab, marks it paid, and
  releases the table for new bookings.
- **Orders** (`/admin/orders`) — the kitchen queue. Start cooking → Served, or
  Cancel a mistaken order. Customisation notes are highlighted.
- **Reservations** (`/admin/reservations`) — seat an arriving guest (which opens
  their tab), or mark no-show / cancel.
- **Menu** — dishes, prices, photos, and an availability switch per dish.
- **Media Library** — every photo in one place. Upload new ones to Blob or reuse
  the ones shipped in the repo; pick from it anywhere an image is needed.

## Two dine-in cases, both supported
1. **No reservation** — guest sits down, scans the QR, orders. A tab opens on the
   spot.
2. **With reservation** — the booking is picked up automatically when the guest
   scans (or when staff hit "Seat guest"), so the tab is linked to the booking and
   paying it frees the table.

# Deploying Brew & Bloom Cafe to Vercel

This project already uses Supabase Postgres, Vercel Blob (photo uploads), and
Razorpay (payments). Follow these steps.

## 1. Push to GitHub

```bash
git add .
git commit -m "Update cafe website"
git push
```

## 2. Import the project into Vercel

1. Go to https://vercel.com/new and sign in with GitHub.
2. Select your repo and click **Import**.
3. Before deploying, open **Environment Variables** and add these:

| Name | Value |
|---|---|
| `DATABASE_URL` | your Supabase pooler connection string, with `?pgbouncer=true` appended |
| `AUTH_SECRET` | run `openssl rand -base64 32` locally and paste the result |
| `ADMIN_EMAIL` | login email for the cafe admin account |
| `ADMIN_PASSWORD` | a strong password |
| `GEMINI_API_KEY` | your Gemini API key (reserved for future AI features) |
| `BLOB_READ_WRITE_TOKEN` | from Vercel → Storage → your Blob store |
| `RAZORPAY_KEY_ID` | from your Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | from your Razorpay dashboard — **never commit this** |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | same value as `RAZORPAY_KEY_ID` |

4. Click **Deploy**.

⚠️ **Your Razorpay keys are LIVE keys.** Real payments go through them. If you
ever paste them anywhere outside Vercel's environment variables (chat, docs,
a public repo), rotate them immediately in the Razorpay dashboard.

## 3. Set up database tables and starter data

Point `DATABASE_URL` at your Supabase database locally (in `.env`), then run:

```bash
npx prisma db push
npm run seed
```

This creates the tables, your admin account, sample menu items with photos,
a default 8-table floor plan, and the demo gallery images.

Note: for `db push` specifically, Supabase's pooled connection (port 6543)
doesn't support schema changes — use the direct/session connection (port 5432,
same host and credentials) just for this command.

## 4. You're live

Visit the URL Vercel gives you.

- Admin dashboard: `/admin` — log in with the admin credentials above
- Customers book tables at `/book`, place orders at `/order`, and look up
  past orders at `/orders` (just their name + mobile number, no login)
- Manage everything — menu, photos, table layout, bookings, orders, branding,
  and the payment gateway toggle — from the admin sidebar

## Making changes later

Any time you edit code and push to GitHub (`git push`), Vercel automatically
redeploys. Schema changes need `npx prisma db push` run against Supabase
manually (Vercel doesn't do this for you).

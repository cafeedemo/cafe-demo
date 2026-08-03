# Deploying Brew & Bloom Cafe to Vercel

Follow these steps in order. Copy-paste each command into your terminal.

## 1. Create a free Postgres database

We'll use Neon (free tier, works great with Vercel).

1. Go to https://neon.tech and sign up (free).
2. Create a new project (any name, e.g. "brew-and-bloom").
3. Copy the connection string it gives you — it looks like:
   `postgresql://user:password@ep-xxxx.neon.tech/neondb?sslmode=require`

## 2. Push this project to GitHub

```bash
git init
git add .
git commit -m "Initial cafe website"
```

Then create a new empty repo on https://github.com/new, and run the two commands it shows you (something like):

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## 3. Import the project into Vercel

1. Go to https://vercel.com/new and sign in with GitHub.
2. Select your repo and click **Import**.
3. Before deploying, open **Environment Variables** and add these:

| Name | Value |
|---|---|
| `DATABASE_URL` | the Neon connection string from step 1 |
| `AUTH_SECRET` | run `openssl rand -base64 32` locally and paste the result |
| `SUPERADMIN_EMAIL` | the login email for Quellflow (you) |
| `SUPERADMIN_PASSWORD` | a strong password |
| `ADMIN_EMAIL` | the login email for the cafe owner |
| `ADMIN_PASSWORD` | a strong password |

4. Click **Deploy**.

## 4. Set up the database tables and starter data

After the Neon database exists, run these once from your computer (with `DATABASE_URL`
pointed at your Neon database — you can temporarily put it in `.env` locally):

```bash
npx prisma migrate deploy
npm run seed
```

This creates the tables and your superadmin + admin accounts with the sample menu.

## 5. You're live

Visit the URL Vercel gives you. Log in at `/login` with the superadmin or admin
credentials you set above.

- Superadmin dashboard: `/superadmin`
- Admin dashboard: `/admin`

## Making changes later

Any time you edit code and push to GitHub (`git push`), Vercel automatically redeploys.

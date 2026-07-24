# Noor Quran Center — Operations Dashboard

A bilingual (English/Arabic) operations dashboard for a Quran learning center:
attendance & progress tracking, spaced-repetition revision queue, gamified
engagement (streaks, XP, badges), and admin tools for scheduling, teacher load,
and referrals.

This version is wired up to **Supabase** (real database + login) so it can be
deployed as a real, live website your staff can use from anywhere — not just a
local prototype.

---

## What you need (all free tiers work fine to start)

- A [Supabase](https://supabase.com) account — database + login
- A [GitHub](https://github.com) account — to hold the code
- A [Vercel](https://vercel.com) account — hosting
- [Node.js](https://nodejs.org) installed on your computer (v18+) — only needed
  to test locally before deploying; you can skip this and deploy straight from
  GitHub if you prefer

---

## Step 1 — Create your Supabase project

1. Go to supabase.com → **New project**. Pick any name/region, set a database
   password (save it somewhere), and wait ~2 minutes for it to provision.
2. In the left sidebar, go to **SQL Editor → New query**.
3. Open `supabase/schema.sql` from this project, copy all of it, paste it in,
   and click **Run**. This creates the tables, security rules, and a few demo
   students so you can see the dashboard working immediately.
4. Go to **Settings → API**. Copy two values, you'll need them next:
   - **Project URL**
   - **anon public** key

---

## Step 2 — Configure the app

1. In this project folder, copy `.env.example` to `.env.local`:
   ```
   cp .env.example .env.local
   ```
2. Open `.env.local` and paste in the Project URL and anon key from Step 1.

---

## Step 3 — Run it locally (recommended before going live)

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). You'll see a sign-in
screen — enter your email and click **Send magic link**. Supabase emails you a
link automatically (no setup needed); click it and you're in.

Try marking attendance, reviewing a surah, adding a student — refresh the page
and everything should still be there, because it's now saved in your real
database instead of just your browser.

---

## Step 4 — Put the code on GitHub

```bash
git init
git add .
git commit -m "Initial Quran center dashboard"
```
Create a new empty repository on GitHub, then follow the "push an existing
repository" instructions GitHub shows you.

---

## Step 5 — Deploy to Vercel

1. Go to vercel.com → **Add New → Project** → import your GitHub repo.
2. Vercel auto-detects Vite — leave the build settings as default.
3. Before deploying, open **Environment Variables** and add:
   - `VITE_SUPABASE_URL` → your Project URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
4. Click **Deploy**. In about a minute you'll get a live URL like
   `https://your-project.vercel.app` — that's your center's real, working
   dashboard, live on the internet.

Every time you push a change to GitHub, Vercel redeploys automatically.

### Optional: custom domain
In your Vercel project → **Settings → Domains**, add a domain you own and
follow the DNS instructions shown. Takes effect within a few hours usually.

---

## Who can sign in?

Right now, **anyone who requests a magic link can sign in and has full staff
access** (view/edit everything). That's fine while it's just you and one or
two trusted teachers. Before you hand this to a wider team:

- In Supabase → **Authentication → Providers → Email**, you can disable public
  sign-ups so only people you've manually added as users can log in.
- Or go to **Authentication → Users → Invite user** to add staff accounts
  directly rather than relying on open sign-up.

A future version can add proper **roles** (admin / teacher / parent-only, each
seeing different data) — flag it and we can build that next; it needs a
`role` column and tighter row-level security policies, which is a bit more
work than the current "any signed-in staff member sees everything" model.

---

## Editing the demo data

The seed data (4 students, 2 teachers, a weekly schedule, 2 referrals) is just
there so the dashboard isn't empty on first login. Delete the demo students
from the **Admin** tab and add your real ones through the same form — no SQL
required for day-to-day use.

To add/edit teachers, use the Supabase **Table Editor → teachers** table
directly for now (there's no in-app form for that yet).

---

## What's next (not included yet)

- Real tajweed AI integration (this dashboard tracks mistake counts and
  revision — plugging in an actual recitation-AI engine like the ones
  discussed earlier is a separate integration)
- Automatic WhatsApp sending of the weekly parent summary (currently you copy
  the generated text and send it yourself)
- Role-based access (parent view, teacher-only view)
- Teacher management UI

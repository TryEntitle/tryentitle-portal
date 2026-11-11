# TryEntitle Portal

Customer and admin portal for TryEntitle.

- **Live:** [tryentitle.tech/login](https://tryentitle.tech/login)
- **Stack:** Next.js 14 (App Router) · Supabase Auth + Postgres (RLS) · Sentry

## Who sees what

| Role | Home | Scope |
|------|------|--------|
| Admin | `/admin` | All customers, orders, products, messages, payouts, settings |
| Customer | `/dashboard` | Their own orders and help |

Access is checked in `middleware.ts` and enforced again by Postgres RLS.

**Flow:** unauthenticated users always hit **login** first. After sign-in they land on their home; a **Business info** popup may ask for name/company (skippable). It never blocks login.

## Quick start

```bash
npm install
cp .env.example .env.local   # Supabase URL, anon key, service role key
npm run dev
```

In the Supabase SQL editor:

1. Run `supabase/schema.sql`
2. Run `supabase/migrations/` in order (including `009_onboarding.sql`)
3. Create a user (Auth → Users, auto-confirm)
4. Promote yourself:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

Open [http://localhost:3000/login](http://localhost:3000/login).

## Project map

```
app/login            Sign in
app/signup           Sign up
app/reset-password   Request reset email
app/update-password  Set new password from email link
app/auth/callback    Supabase email-link code exchange
app/admin            Analytics, orders, products, messages, customers, payouts, settings, help
app/dashboard        Customer orders + help
components/          UI (AppShell, BusinessInfoModal, charts, settings, …)
lib/                 theme, nav, analytics helpers, Supabase clients
supabase/            schema + migrations
deploy/              Caddy reverse-proxy config
```

## Env vars

See `.env.example`. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Team invites). Optional: Sentry vars.

## Deploy

Self-managed VPS (PM2 + Caddy) or Vercel with the same env vars set:

```bash
cd ~/app && git pull && npm ci && npm run build && pm2 restart tryentitle
```

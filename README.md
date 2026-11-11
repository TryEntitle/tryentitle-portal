# TryEntitle Portal

Customer and admin portal for TryEntitle.

- **Live:** [tryentitle.tech/login](https://tryentitle.tech/login)
- **Stack:** Next.js 14 (App Router) · Supabase Auth + Postgres (RLS) · Sentry

## Who sees what

| Role | Home | Scope |
|------|------|--------|
| Admin | `/admin` | All customers, orders, products, messages, payouts, settings |
| Customer | `/dashboard` | Their own orders and help |

Access is checked in `middleware.ts` and enforced again by Postgres RLS. App checks are convenience; the database is the real boundary.

## Quick start

```bash
npm install
cp .env.example .env.local   # Supabase URL, anon key, service role key
npm run dev
```

In the Supabase SQL editor:

1. Run `supabase/schema.sql`
2. Run `supabase/migrations/` in order
3. Create a user (Auth → Users, auto-confirm)
4. Promote yourself:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

Open [http://localhost:3000/login](http://localhost:3000/login).

## Project map

```
app/login          Sign in
app/admin          Analytics, orders, products, messages, customers, payouts, settings, help
app/dashboard      Customer orders + help
components/        UI (AppShell, charts, settings tabs, …)
lib/               theme, nav, analytics helpers, Supabase clients
supabase/          schema + migrations
deploy/            Caddy reverse-proxy config
```

## Env vars

See `.env.example`. Required:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; Team invites)

Optional: Sentry (`NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_*`) for error reporting and source maps.

## Deploy

Self-managed VPS: PM2 runs Next.js, Caddy terminates HTTPS (`deploy/Caddyfile`).

```bash
cd ~/app && git pull && npm ci && npm run build && pm2 restart tryentitle
```

Vercel also works if the same env vars are set in the project settings — without them, `/login` will fail at runtime (and previously failed at build when the client was created during prerender).

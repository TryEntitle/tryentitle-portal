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
2. Run `supabase/migrations/` in order (including `009_onboarding.sql`, `010_profiles_grants.sql`, and `011_ops_incidents.sql`)
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

See `.env.example`. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Team invites). Optional: Sentry vars, and `SLACK_WEBHOOK_URL` for in-process outage alerts.

## When server configuration is missing

If the Supabase URL or anon key is missing at runtime, every page returns **503** with a short notice: the site is down because server configuration is incomplete. The page does not list variable names, secret values, or hostnames. Login is not shown, and the app does not throw a stack trace. Team invites missing only the service-role key stay up for everyone else and return that plain sentence to the admin who tried to invite someone.

Alerts, each a no-op when its secret is unset:

| Channel | How it fires | Secret |
|---|---|---|
| Sentry | The server captures one error event per process every 6 hours | Existing `SENTRY_DSN` or `NEXT_PUBLIC_SENTRY_DSN` |
| Slack | The server posts to `#vercel-alerts` on that same cooldown, and the scheduled GitHub Action posts once when it opens or closes an issue | `SLACK_WEBHOOK_URL` on the host (Vercel or the VPS) and, for the Action, the existing Actions secret of the same name |
| GitHub | `.github/workflows/portal-config-outage.yml` probes https://tryentitle.tech every 15 minutes. A configuration outage opens one issue and fails the run; recovery closes the issue | Built-in `GITHUB_TOKEN` (`issues: write`). No new token |
| Supabase | The server, or that Action, calls `record_config_outage()`. Rows land in `public.ops_incidents` (SQL editor only — no API access) | Host already has the service-role key. For the Action, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` under Settings → Secrets and variables → Actions. The key bypasses RLS; the job only calls that function. Skip both to leave Supabase out |

Run `011_ops_incidents.sql` before expecting a Supabase row. Do not paste secret values into the GitHub issue.

## Deploy

Self-managed VPS (PM2 + Caddy) or Vercel with the same env vars set:

```bash
cd ~/app && git pull && npm ci && npm run build && pm2 restart tryentitle
```

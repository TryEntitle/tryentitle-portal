# TryEntitle Portal: Setup (tryentitle.tech/demo)

Portal URLs once live:
- https://tryentitle.tech/demo/login
- https://tryentitle.tech/demo/admin (you)
- https://tryentitle.tech/demo/dashboard (customers)

Files drop into the root of your existing Next.js repo (App Router).
Merge `app/`, `lib/`, `components/`, `middleware.ts`. Don't overwrite your existing
`app/layout.tsx`. Add `basePath: '/demo'` to your next.config (see `next.config.example.mjs`).

## Part 1: Supabase (10 min)

1. Supabase project -> **SQL Editor** -> paste all of `supabase/schema.sql` -> Run.
2. **Authentication -> Users -> Add user** -> create your own account.
3. SQL Editor, with your email:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'YOUR_EMAIL');
   ```
4. **Authentication -> Sign In / Providers** -> turn OFF "Allow new users to sign up".
5. **Authentication -> URL Configuration**:
   - Site URL: `https://tryentitle.tech/demo`
   - Redirect URLs: add `https://tryentitle.tech/**`
6. **Project Settings -> API** -> copy Project URL and `anon` public key.
7. Turn on MFA for your own account.

## Part 2: Local code (5 min)

```bash
npm i @supabase/supabase-js @supabase/ssr
cp .env.example .env.local   # paste your URL and anon key
npm run dev
```
Test at http://localhost:3000/demo/login. Log in as yourself and you should land on `/demo/admin`.

Commit and push to GitHub.

## Part 3: DNS for tryentitle.tech

At the registrar / Hostinger DNS for tryentitle.tech:

1. **A record**: Host `@`, Value `YOUR_SERVER_IP`, TTL 300.
2. **A record**: Host `www`, Value `YOUR_SERVER_IP`, TTL 300.
3. Verify:
   ```bash
   dig +short tryentitle.tech
   ```
   Must print your server IP before you reload Caddy, or the SSL cert won't issue.

If tryentitle.tech already serves a website somewhere else, don't repoint `@` yet.
Tell me and we'll use a different path or subdomain.

## Part 4: Hostinger Ubuntu server

SSH in: `ssh root@YOUR_SERVER_IP`

1. **Non-root user + lock SSH**
   ```bash
   adduser deploy && usermod -aG sudo deploy
   mkdir -p /home/deploy/.ssh && cp ~/.ssh/authorized_keys /home/deploy/.ssh/
   chown -R deploy:deploy /home/deploy/.ssh
   ```
   In a NEW terminal confirm `ssh deploy@YOUR_SERVER_IP` works. Then set
   `PasswordAuthentication no` and `PermitRootLogin no` in `/etc/ssh/sshd_config`
   and run `sudo systemctl restart ssh`. Continue as `deploy`.

2. **Firewall**
   ```bash
   sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
   ```

3. **Node 20+ and PM2**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs git
   sudo npm i -g pm2
   ```

4. **Deploy the app**
   ```bash
   git clone https://github.com/YOUR_USER/YOUR_REPO.git app && cd app
   nano .env.local      # NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   npm ci && npm run build
   pm2 start npm --name tryentitle -- start
   pm2 save
   pm2 startup          # run the command it prints
   ```

5. **HTTPS with Caddy**
   ```bash
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update && sudo apt install -y caddy
   sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   ```

6. Visit **https://tryentitle.tech/demo/login**. You should get the login page with a valid padlock.

## Part 5: Add a customer

1. Supabase -> **Authentication -> Users -> Invite user** (or Add user).
2. Optionally:
   ```sql
   update public.profiles set company = 'Acme Dental'
   where id = (select id from auth.users where email = 'customer@acme.com');
   ```
3. Insert their data with `customer_id` = their user id. They only see their own rows.

## Updating later

```bash
cd ~/app && git pull && npm ci && npm run build && pm2 restart tryentitle
```

## Moving off /demo later

Remove `basePath` from next.config, change the Caddyfile to proxy `/` to localhost:3000,
set Supabase Site URL to `https://tryentitle.tech`, rebuild.

## Test checklist

- Customer logs in -> lands on `/demo/dashboard`.
- Customer visits `/demo/admin` -> bounced to `/demo/dashboard`.
- Two customers each see only their own rows.
- Logged out, visiting `/demo/dashboard` -> redirected to `/demo/login`.
- `http://YOUR_SERVER_IP:3000` unreachable from outside.

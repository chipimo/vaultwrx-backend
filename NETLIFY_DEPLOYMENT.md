# Netlify deployment

## Database connection (ETIMEDOUT)

If you see errors like:

```text
Cannot connect to database: connect ETIMEDOUT 52.x.x.x:5432
```

the app is running on Netlify but **cannot reach your PostgreSQL server**. Netlify Functions run on AWS; their outbound IPs are not fixed.

### Fix: allow database access from the internet

Your database (e.g. Azure PostgreSQL, Supabase, Neon, RDS) has a **firewall / allowlist** that must allow connections from Netlify (i.e. from the public internet).

1. **Open your database provider’s console** (Azure Portal, Supabase, Neon, AWS RDS, etc.).
2. **Find “Firewall rules”, “Network”, or “Allowed IPs”.**
3. **Add a rule that allows access from the internet**, for example:
   - **Start IP:** `0.0.0.0`  
   - **End IP:** `255.255.255.255`  
   - Or a single rule: `0.0.0.0/0`  
   This allows any IP (including Netlify’s) to connect. For production, prefer a private network or a fixed-egress solution if your provider supports it.
4. **Save** and redeploy or trigger a new request on Netlify.

### Azure PostgreSQL

- Go to your server → **Settings** → **Networking** (or **Connection security**).
- Add a firewall rule: **Rule name** e.g. `AllowAll`, **Start IP** `0.0.0.0`, **End IP** `255.255.255.255`.
- Ensure **“Allow Azure services and resources to access this server”** is **On** if you use Azure-only access; for Netlify you still need a public rule (e.g. `0.0.0.0/0`) as above.

### Supabase / Neon / other hosted Postgres

- In the project’s **Network** or **Settings**, disable “Restrict to specific IPs” or add `0.0.0.0/0` so the server can accept connections from anywhere (including Netlify).

### Environment variables on Netlify

In **Site settings → Environment variables**, set at least:

- `TYPEORM_HOST` – database host (e.g. `xxx.postgres.database.azure.com`)
- `TYPEORM_PORT` – usually `5432`
- `TYPEORM_DATABASE` – database name
- `TYPEORM_USERNAME` – database user
- `TYPEORM_PASSWORD` – database password  
- `NETLIFY` – can be set to `true` by the function; the app uses it to enable serverless behavior (shorter DB timeout, no sockets, etc.)

After fixing the firewall and env vars, redeploy and try again. The app uses a 10s connection timeout on Netlify so failures are reported sooner.

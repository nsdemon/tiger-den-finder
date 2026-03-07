# Daily analytics report (11:59 PM CST)

The cron job runs every day at **11:59 PM CST** and emails a summary to **sudopc@gmail.com**.

## Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, add:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL (same as `EXPO_PUBLIC_SUPABASE_URL` without the EXPO_ prefix). |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase Dashboard → Settings → API → **service_role** (secret). Used to read `site_visits`. |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) → API Keys. Free tier is enough. |
| `RESEND_FROM` | (Optional) Sender address, e.g. `Tiger Den Finder <reports@yourdomain.com>`. If omitted, uses Resend’s sandbox (onboarding@resend.dev); for production, verify a domain in Resend. |
| `CRON_SECRET` | (Optional) Random string. If set, Vercel sends it as `Authorization: Bearer <CRON_SECRET>`; the API rejects requests without it. |

## Resend setup

1. Sign up at [resend.com](https://resend.com).
2. Create an **API Key** and add it as `RESEND_API_KEY` in Vercel.
3. For testing, you can leave `RESEND_FROM` unset (Resend will use their sandbox and deliver to your sign-up email).
4. For production, add and verify your domain in Resend, then set `RESEND_FROM` to e.g. `Tiger Den Finder <reports@yourdomain.com>`.

## Cron schedule

- **Schedule:** `59 5 * * *` (05:59 UTC = 11:59 PM CST).
- **Endpoint:** `GET` or `POST` to `/api/daily-report`. Only production deployments run the cron.

## Manual test

After deploying, you can trigger the report once:

```bash
curl -X GET "https://YOUR_VERCEL_URL.vercel.app/api/daily-report" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

(If you didn’t set `CRON_SECRET`, omit the header.)

# Developer Setup Guide

This guide is for developers deploying the Arsi Platform starter app as a standalone project (developer mode). It covers everything you need to self-host and customize your own instance.

## Quick Start

1. Clone or fork this repository
2. Set mode to `'developer'` in `site.config.ts`
3. Set up environment variables
4. Deploy to Vercel (or self-host)

## Setting Developer Mode

Open `site.config.ts` and change the `arsiPlatform` section:

```typescript
arsiPlatform: {
  mode: 'developer',        // Switch from 'local-business' to 'developer'
  monitoringEnabled: false,  // No Command Center pings
  showPoweredBy: false,      // No "Built by Arsi" in footer
  commandCenterUrl: '',      // Not needed in developer mode
  developer: {
    selfHosted: true,
    customBranding: true,
    hideArsiFooter: true,
  },
},
```

### What Developer Mode Changes

| Feature | local-business | developer |
|---------|---------------|-----------|
| Command Center monitoring | Active | Disabled |
| "Built by Arsi" footer | Shown | Hidden |
| Discord notifications | Arsi's webhook | Your own webhook |
| Backup cron | R2 + monitoring ping | R2 only |
| Setup page | Hidden | Shows if env vars missing |

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Required - Email (Resend)
RESEND_API_KEY=re_...your-resend-key

# Required - Cron Security
CRON_SECRET=your-random-secret-string

# Required - Client Identifier
CLIENT_SLUG=my-business

# Optional - Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional - R2 Backups (Cloudflare)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name

# Optional - Discord Notifications (your own webhook)
DISCORD_WEBHOOK=https://discord.com/api/webhooks/...

# Optional - Command Center (local-business mode only)
COMMAND_CENTER_URL=https://arsi-platform-dashboard.vercel.app
```

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Open the **SQL Editor** and run the database schema (see `schema.sql` if available, or check the Supabase migrations folder)
4. Enable **Email Auth** under Authentication > Providers

## Deploying to Vercel

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the project
3. Set the **Root Directory** to `apps/starter-app` (if using the monorepo)
4. Add all environment variables from `.env.local` to the Vercel project settings
5. Deploy

### Cron Jobs

Set up a Vercel Cron Job for automated backups by adding to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/backup?secret=YOUR_CRON_SECRET",
      "schedule": "0 3 * * *"
    }
  ]
}
```

## R2 Backup Setup (Optional)

If you want automated database backups to Cloudflare R2:

1. Create a Cloudflare account and enable R2
2. Create an R2 bucket
3. Generate an API token with R2 read/write permissions
4. Add the R2 environment variables to `.env.local`

To skip backups entirely, simply don't set the R2 environment variables. The cron endpoint will still work but the upload will fail gracefully.

## Disabling Arsi Branding

All Arsi branding is controlled via `site.config.ts`:

```typescript
arsiPlatform: {
  mode: 'developer',
  showPoweredBy: false,
  developer: {
    hideArsiFooter: true,
    customBranding: true,
  },
},
```

This removes:
- "Built by Arsi Technology Group" from the footer
- Any Command Center integration
- Arsi Discord notifications (uses your own webhook instead)

## Customizing Your Site

All site configuration lives in `site.config.ts`:

- **Business info**: name, email, phone, address
- **Branding**: theme (`warm`, `corporate`, `bold`), colors, fonts
- **Modules**: toggle booking, ecommerce, blog, leads
- **Pages**: enable/disable individual pages
- **SEO**: titles, descriptions, OG images
- **Location**: address, hours, map embed

## Self-Hosting (Non-Vercel)

You can deploy to any platform that supports Next.js:

```bash
# Build
npm run build

# Start production server
npm start
```

Make sure all environment variables are set in your hosting platform. The app runs on port 3000 by default.

### Docker (example)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

**Setup page keeps showing**: Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set. These are checked at the middleware level.

**Backup cron returns 401**: Verify your `CRON_SECRET` env var matches the `?secret=` query parameter.

**Emails not sending**: Check that `RESEND_API_KEY` is valid and your sending domain is verified in Resend.

**Stripe not loading**: Set `payments.enabled: true` in `site.config.ts` and add your Stripe env vars.

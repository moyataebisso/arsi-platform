#!/usr/bin/env npx ts-node

import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve))
}

async function main() {
  console.log('\n===========================================')
  console.log('  ARSI PLATFORM -- Client Provisioning')
  console.log('===========================================\n')

  // 1. Gather client details
  const clientName = await ask('Business name: ')
  const clientSlug = await ask('URL slug (lowercase, no spaces): ')
  const clientEmail = await ask('Business email: ')
  const clientDomain = await ask('Domain (e.g., clientname.com): ')
  const city = await ask('City: ')
  const state = await ask('State: ')

  // Module selection
  console.log('\n-- Enable Modules --')
  const booking = (await ask('Enable booking module? (y/n): ')).toLowerCase() === 'y'
  const ecommerce = (await ask('Enable ecommerce module? (y/n): ')).toLowerCase() === 'y'
  const blog = (await ask('Enable blog module? (y/n): ')).toLowerCase() === 'y'
  const leads = (await ask('Enable leads module? (y/n): ')).toLowerCase() === 'y'

  // Supabase details
  console.log('\n-- Supabase Credentials --')
  const supabaseUrl = await ask('Supabase project URL: ')
  const supabaseAnonKey = await ask('Supabase anon key: ')
  const supabaseServiceKey = await ask('Supabase service role key: ')

  console.log('\nProvisioning...\n')

  // 2. Generate site.config.ts
  const siteConfigContent = `export const siteConfig = {
  business: {
    name: "${clientName}",
    tagline: "Welcome to ${clientName}",
    email: "${clientEmail}",
    phone: "",
    address: "",
    city: "${city}",
    state: "${state}",
    zip: "",
    logo: "/images/logo.png",
    favicon: "/images/favicon.ico",
  },
  branding: {
    theme: "warm" as "warm" | "corporate" | "bold",
    primaryColor: "#6366f1",
    accentColor: "#22c55e",
    fontHeading: "Inter",
    fontBody: "Inter",
  },
  modules: {
    booking: ${booking},
    ecommerce: ${ecommerce},
    blog: ${blog},
    leads: ${leads},
  },
  auth: {
    enabled: true,
    allowRegistration: true,
    requireEmailVerification: true,
    providers: ["email"] as ("email" | "google" | "facebook")[],
  },
  payments: {
    enabled: ${ecommerce},
    provider: "stripe" as "stripe" | "paypal" | "both",
    currency: "usd",
    testMode: true,
  },
  email: {
    fromName: "${clientName}",
    fromEmail: "hello@${clientDomain}",
    replyTo: "hello@${clientDomain}",
    templates: {
      welcome: true,
      bookingConfirmation: ${booking},
      orderConfirmation: ${ecommerce},
      passwordReset: true,
      adminNewLead: ${leads},
    },
  },
  pages: {
    home: { enabled: true, title: "Home" },
    about: { enabled: true, title: "About Us" },
    services: { enabled: true, title: "Services" },
    contact: { enabled: true, title: "Contact" },
    shop: { enabled: ${ecommerce}, title: "Shop" },
    book: { enabled: ${booking}, title: "Book Now" },
    blog: { enabled: ${blog}, title: "Blog" },
  },
  seo: {
    defaultTitle: "${clientName}",
    titleTemplate: "%s | ${clientName}",
    defaultDescription: "Welcome to ${clientName}",
    ogImage: "/images/og-image.png",
    googleAnalyticsId: "",
    facebookPixelId: "",
  },
  integrations: {
    googleMaps: "",
    facebookPage: "",
    instagram: "",
    twitter: "",
    linkedin: "",
  },
  notifications: {
    adminEmail: "${clientEmail}",
    notifyOnNewLead: ${leads},
    notifyOnNewBooking: ${booking},
    notifyOnNewOrder: ${ecommerce},
    notifyOnNewUser: true,
  },
} as const

export type SiteConfig = typeof siteConfig
`

  const configPath = path.join(__dirname, '..', 'site.config.ts')
  fs.writeFileSync(configPath, siteConfigContent)
  console.log('  site.config.ts generated')

  // 3. Generate .env.local
  const envContent = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@${clientDomain}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_ENDPOINT=
CLOUDFLARE_R2_BUCKET=arsi-backups
CLIENT_SLUG=${clientSlug}
CRON_SECRET=${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}
DISCORD_WEBHOOK_DAILY_REPORTS=
`
  const envPath = path.join(__dirname, '..', '.env.local')
  fs.writeFileSync(envPath, envContent)
  console.log('  .env.local generated')

  // 4. Output summary
  console.log('\n===========================================')
  console.log('  PROVISIONING COMPLETE')
  console.log('===========================================')
  console.log(`  site.config.ts generated`)
  console.log(`  .env.local generated`)
  console.log('')
  console.log('  Next steps:')
  console.log('  1. Run the SQL schema in the client Supabase SQL Editor:')
  console.log('     supabase/schema.sql')
  console.log('  2. Create an admin user in Supabase Auth')
  console.log('  3. Insert admin user row in users table with role=admin')
  console.log('  4. Add Resend API key to .env.local')
  console.log('  5. Deploy to Vercel: vercel --prod')
  console.log('  6. Connect custom domain in Vercel')
  console.log('  7. Register site in Command Center')
  console.log('===========================================\n')

  rl.close()
}

main().catch(console.error)

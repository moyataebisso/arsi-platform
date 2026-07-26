import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/sender'
import { getNotificationRecipients } from '@/lib/email/recipients'
import { getSiteSetting } from '@/lib/settings'
import { getEnabledModules } from '@/lib/enabled-modules'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const enabled = await getEnabledModules()
    if (!enabled.community_subscribe) {
      return NextResponse.json({ error: 'Not enabled' }, { status: 404 })
    }

    const body = await request.json()

    const honeypot = typeof body.website === 'string' ? body.website.trim() : ''
    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    const rawEmail = String(body.email || '').trim()
    if (!rawEmail) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    const email = rawEmail.toLowerCase()

    const ip = getClientIp(request)
    const rl = rateLimit(`newsletter_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // getAdminClient is scoped to SUPABASE_SCHEMA, so this hits the tenant
    // schema's newsletter_subscribers table — never public unless SUPABASE_SCHEMA
    // itself is misconfigured.
    const supabase = getAdminClient()

    let persisted = false
    let alreadySubscribed = false
    try {
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, source: '/newsletter' })

      if (!insertError) {
        persisted = true
      } else if (insertError.code === '23505') {
        alreadySubscribed = true
      } else if (insertError.code === '42P01') {
        // Missing table — Entrusted is live before migration ships. Degrade
        // to notify-only so the operator still gets the lead.
        console.error('newsletter_subscribers table missing:', insertError)
      } else {
        console.error('newsletter_subscribers insert failed:', insertError)
      }
    } catch (dbError) {
      console.error('newsletter_subscribers insert threw:', dbError)
    }

    if (alreadySubscribed) {
      return NextResponse.json({ success: true, message: 'Already subscribed' })
    }

    const businessNameRaw = await getSiteSetting('business_name')
    const brand = (businessNameRaw || '').trim() || 'our care community'

    if (persisted) {
      try {
        await sendEmail({
          to: email,
          subject: `You are subscribed to updates from ${brand}`,
          html: `<p>Thanks for subscribing to <strong>${brand}</strong>.</p><p>We will keep you in the loop with news and updates. If this was not you, please ignore this message.</p>`,
          text: `Thanks for subscribing to ${brand}. We will keep you in the loop with news and updates. If this was not you, please ignore this message.`,
        })
      } catch (emailError) {
        console.error('Failed to send subscriber confirmation:', emailError)
      }
    }

    try {
      const recipients = await getNotificationRecipients()
      await sendEmail({
        to: recipients,
        replyTo: email,
        subject: `New newsletter subscriber — ${brand}`,
        html: `<p>Someone subscribed to updates from <strong>${brand}</strong>.</p><p>Email: <a href="mailto:${email}">${email}</a></p>`,
        text: `Someone subscribed to updates from ${brand}. Email: ${email}`,
      })
    } catch (emailError) {
      console.error('Failed to send subscribe notification:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

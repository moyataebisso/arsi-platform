import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendEmail } from '@/lib/email/sender'
import { getNotificationRecipients } from '@/lib/email/recipients'
import { getSiteSetting } from '@/lib/settings'
import { getEnabledModules } from '@/lib/enabled-modules'

export async function POST(request: NextRequest) {
  try {
    const enabled = await getEnabledModules()
    if (!enabled.community_subscribe) {
      return NextResponse.json({ error: 'Not enabled' }, { status: 404 })
    }

    const body = await request.json()
    const email = String(body.email || '').trim()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Notify the tenant's operator inbox. getNotificationRecipients reads
    // notification_emails → contact_email → arsitechgroup@gmail.com from the
    // current SUPABASE_SCHEMA, so El Roi lands at furtuandfamily@yahoo.com
    // and Adama / Entrusted land at their own contact_email. No DB write —
    // the email address is not persisted anywhere.
    try {
      const [recipients, businessNameRaw] = await Promise.all([
        getNotificationRecipients(),
        getSiteSetting('business_name'),
      ])
      const brand = (businessNameRaw || '').trim() || 'our care community'
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

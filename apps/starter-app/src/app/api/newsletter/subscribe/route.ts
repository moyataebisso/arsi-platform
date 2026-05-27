import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendEmail } from '@/lib/email/sender'
import { siteConfig } from '@config'
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

    if (siteConfig.notifications.notifyOnNewLead) {
      try {
        const adminEmail = process.env.RESEND_FROM_EMAIL
          ? 'arsitechgroup@gmail.com'
          : siteConfig.notifications.adminEmail
        await sendEmail({
          to: adminEmail,
          replyTo: email,
          subject: `New care community subscriber: ${email}`,
          html: `<p>New subscriber to <strong>${siteConfig.business.name}</strong> care community:</p><p><a href="mailto:${email}">${email}</a></p>`,
          text: `New subscriber to ${siteConfig.business.name} care community: ${email}`,
        })
      } catch (emailError) {
        console.error('Failed to send subscribe notification:', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

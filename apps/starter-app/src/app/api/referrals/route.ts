import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/sender'
import { referralNotificationEmail } from '@/lib/email/templates/referral-notification'
import { siteConfig } from '@config'
import { getEnabledModules } from '@/lib/enabled-modules'

export async function POST(request: NextRequest) {
  try {
    const enabled = await getEnabledModules()
    if (!enabled.referrals) {
      return NextResponse.json({ error: 'Not enabled' }, { status: 404 })
    }

    const body = await request.json()
    const referrerName = String(body.referrerName || '').trim()
    const organization = String(body.organization || '').trim()
    const role = body.role ? String(body.role).trim() : ''
    const email = String(body.email || '').trim()
    const phone = body.phone ? String(body.phone).trim() : ''
    const residentName = body.residentName ? String(body.residentName).trim() : ''
    const notes = String(body.notes || '').trim()

    if (!referrerName || !organization || !email || !notes) {
      return NextResponse.json(
        { error: 'Referrer name, organization, email, and notes are required' },
        { status: 400 },
      )
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailValid) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Reuse existing form_submissions + leads tables (no new schema). The
    // source_page tag makes referrals findable in /admin/leads.
    const dataJson = { referrerName, organization, role, email, phone, residentName, notes }

    const { data: submission } = await supabase
      .from('form_submissions')
      .insert({ data_json: dataJson, source_page: '/referrals' })
      .select()
      .single()

    await supabase
      .from('leads')
      .insert({
        submission_id: submission?.id,
        name: referrerName,
        email,
        phone: phone || null,
        status: 'new',
      })

    if (siteConfig.notifications.notifyOnNewLead) {
      try {
        const adminEmail = process.env.RESEND_FROM_EMAIL
          ? 'arsitechgroup@gmail.com'
          : siteConfig.notifications.adminEmail
        const template = referralNotificationEmail({
          referrerName,
          organization,
          role: role || undefined,
          email,
          phone: phone || undefined,
          residentName: residentName || undefined,
          notes,
        })
        await sendEmail({ to: adminEmail, replyTo: email, ...template })
      } catch (emailError) {
        console.error('Failed to send referral notification email:', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Referral submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

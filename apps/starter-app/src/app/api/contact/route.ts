import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/sender'
import { leadNotificationEmail } from '@/lib/email/templates/lead-notification'
import { getNotificationRecipients } from '@/lib/email/recipients'
import { getSiteSetting } from '@/lib/settings'
import { siteConfig } from '@config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message, sourcePage } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Save form submission and lead FIRST
    const { data: submission } = await supabase
      .from('form_submissions')
      .insert({ data_json: { name, email, phone, message }, source_page: sourcePage || '/contact' })
      .select()
      .single()

    await supabase
      .from('leads')
      .insert({
        submission_id: submission?.id,
        name,
        email,
        phone: phone || null,
        status: 'new',
      })

    // Send admin notification — don't fail the request if email fails
    if (siteConfig.notifications.notifyOnNewLead) {
      try {
        const recipients = await getNotificationRecipients()
        // Prefer runtime site_settings.business_name so a tenant rename
        // (e.g. "Entrusted Home Healthcare" → "Entrusted Care Residence")
        // takes effect without a rebuild. Only falls back to the build-time
        // siteConfig constant when the DB row is unset.
        const businessNameRaw = await getSiteSetting('business_name')
        const business = (businessNameRaw || '').trim() || siteConfig.business.name
        const template = leadNotificationEmail({
          name,
          email,
          phone,
          message,
          sourcePage: sourcePage || '/contact',
          business,
        })
        // replyTo override: admin's reply goes straight to the lead.
        await sendEmail({ to: recipients, replyTo: email, ...template })
      } catch (emailError) {
        console.error('Failed to send lead notification email:', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

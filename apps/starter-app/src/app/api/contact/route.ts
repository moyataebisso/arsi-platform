import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/sender'
import { leadNotificationEmail } from '@/lib/email/templates/lead-notification'
import { getNotificationRecipients } from '@/lib/email/recipients'
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
        const template = leadNotificationEmail({ name, email, phone, message, sourcePage: sourcePage || '/contact' })
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

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/sender'
import { leadNotificationEmail } from '@/lib/email/templates/lead-notification'
import { siteConfig } from '@config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message, sourcePage } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Save form submission
    const { data: submission } = await supabase
      .from('form_submissions')
      .insert({ data_json: { name, email, phone, message }, source_page: sourcePage || '/contact' })
      .select()
      .single()

    // Create lead
    await supabase
      .from('leads')
      .insert({
        submission_id: submission?.id,
        name,
        email,
        phone: phone || null,
        status: 'new',
      })

    // Send admin notification
    if (siteConfig.notifications.notifyOnNewLead) {
      const template = leadNotificationEmail({ name, email, phone, message, sourcePage: sourcePage || '/contact' })
      await sendEmail({ to: siteConfig.notifications.adminEmail, ...template })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

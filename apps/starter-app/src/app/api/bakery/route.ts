import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/sender'
import { getNotificationRecipients, getNotificationBcc } from '@/lib/email/recipients'
import { getSiteSetting } from '@/lib/settings'
import { getEnabledModules } from '@/lib/enabled-modules'
import { siteConfig } from '@config'
import { renderRows } from '@/lib/email/templates/form-rows'
import { guard, SILENT_SUCCESS_BODY, escapeHtml, isValidEmail, stripHeaderValue } from '@/lib/security/form-guard'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'

const bakerySchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().max(254).optional().default(''),
  items: z.array(z.string().trim().max(60)).min(1).max(10),
  itemsOther: z.string().trim().max(200).optional().default(''),
  quantity: z.string().trim().max(80).optional().default(''),
  pickupDate: z.string().trim().regex(/^$|^\d{4}-\d{2}-\d{2}$/).refine((d) => {
    if (!d) return true
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(`${d}T00:00:00`) >= today
  }, 'Pickup date must be today or later').optional().default(''),
  notes: z.string().trim().max(2000).optional().default(''),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Guard: email is optional on the bakery form, so only run the
    // email-format check when a value was submitted.
    const emailProvided = typeof body.email === 'string' && body.email.trim().length > 0
    const decision = guard({
      body,
      nameFields: ['name'],
      emailField: emailProvided ? 'email' : undefined,
    })
    if (decision.action === 'silent-drop') return NextResponse.json(SILENT_SUCCESS_BODY)
    if (decision.action === 'reject') {
      return NextResponse.json({ error: decision.error }, { status: decision.status })
    }

    const enabled = await getEnabledModules()
    if (!enabled.bakery) {
      return NextResponse.json({ error: 'Not enabled' }, { status: 404 })
    }

    const ip = getClientIp(request)
    const rl = rateLimit(`bakery_${ip}`, 5, 60 * 60 * 1000)
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const parsed = bakerySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data

    // Normalize items → include the free-text "Other" when populated,
    // drop the literal "Other" token so the operator sees the actual value.
    const normalizedItems = data.items.filter((v) => v !== 'Other')
    if (data.items.includes('Other') && data.itemsOther.trim()) {
      normalizedItems.push(data.itemsOther.trim())
    }

    const persisted = { ...data, items: normalizedItems }
    const supabase = getAdminClient()

    const { data: submission } = await supabase
      .from('form_submissions')
      .insert({ data_json: persisted, source_page: '/bakery' })
      .select()
      .single()

    await supabase
      .from('leads')
      .insert({
        submission_id: submission?.id,
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        status: 'new',
      })

    try {
      const [recipients, bcc] = await Promise.all([
        getNotificationRecipients(),
        getNotificationBcc(),
      ])
      if (recipients.length > 0) {
        const businessNameRaw = await getSiteSetting('business_name')
        const brand = (businessNameRaw || '').trim() || siteConfig.business.name
        const rows: [string, string][] = [
          ['Name', data.name],
          ['Phone', data.phone],
          ['Email', data.email || '—'],
          ['Items', normalizedItems.length > 0 ? normalizedItems.join(', ') : '—'],
          ['Quantity', data.quantity || '—'],
          ['Pickup date', data.pickupDate || '—'],
          ['Notes', data.notes || '—'],
        ]
        const rendered = renderRows(rows)
        const safeBrand = escapeHtml(brand)
        const safeReplyTo = data.email ? stripHeaderValue(data.email) : ''
        const replyToArg = isValidEmail(safeReplyTo) ? safeReplyTo : undefined
        await sendEmail({
          to: recipients,
          bcc,
          replyTo: replyToArg,
          subject: `New bakery pre-order — ${brand}`,
          html: `<p>A new bakery pre-order was submitted to <strong>${safeBrand}</strong>.</p>${rendered.html}`,
          text: `A new bakery pre-order was submitted to ${brand}.\n\n${rendered.text}`,
        })
      }
    } catch (emailError) {
      console.error('Failed to send bakery operator notification:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Bakery submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

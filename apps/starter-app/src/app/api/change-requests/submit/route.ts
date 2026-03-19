import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'
import { Resend } from 'resend'

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { success } = rateLimit(`change_request_${ip}`, 5, 3_600_000)
  if (!success) {
    return Response.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429 }
    )
  }

  const { description, requestType, priority, clientEmail, businessName } =
    await request.json()

  if (!description || description.trim().length < 10) {
    return Response.json(
      { error: 'Please describe your request in more detail.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('change_requests')
    .insert({
      client_email: clientEmail,
      business_name: businessName,
      request_type: requestType || 'general',
      description: description.trim(),
      priority: priority || 'normal',
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return Response.json(
      { error: 'Failed to submit request. Please try again.' },
      { status: 500 }
    )
  }

  // Send email to Arsi Technology Group
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: `Cimaa Sites <${process.env.RESEND_FROM_EMAIL || 'noreply@arsitechgroup.com'}>`,
      to: 'arsitechgroup@gmail.com',
      subject: `🔧 Change Request: ${businessName} — ${requestType || 'General'}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1E3A5F">New Change Request</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:8px;background:#f5f5f5;font-weight:bold;width:140px">Business</td>
              <td style="padding:8px;border:1px solid #ddd">${businessName}</td>
            </tr>
            <tr>
              <td style="padding:8px;background:#f5f5f5;font-weight:bold">Email</td>
              <td style="padding:8px;border:1px solid #ddd">${clientEmail}</td>
            </tr>
            <tr>
              <td style="padding:8px;background:#f5f5f5;font-weight:bold">Type</td>
              <td style="padding:8px;border:1px solid #ddd">${requestType || 'General'}</td>
            </tr>
            <tr>
              <td style="padding:8px;background:#f5f5f5;font-weight:bold">Priority</td>
              <td style="padding:8px;border:1px solid #ddd;color:${priority === 'urgent' ? '#dc2626' : '#16a34a'};font-weight:bold">
                ${priority === 'urgent' ? '🚨 URGENT' : '✅ Normal'}
              </td>
            </tr>
            <tr>
              <td style="padding:8px;background:#f5f5f5;font-weight:bold">Request</td>
              <td style="padding:8px;border:1px solid #ddd">${description}</td>
            </tr>
          </table>
          <p style="margin-top:24px;color:#888;font-size:12px">
            Request ID: ${data.id}<br>
            Submitted: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    })
  } catch (emailError) {
    console.error('Failed to send notification email:', emailError)
  }

  // Send confirmation email to client
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: `Cimaa Sites <${process.env.RESEND_FROM_EMAIL || 'noreply@arsitechgroup.com'}>`,
      to: clientEmail,
      subject: `✅ We received your change request — ${businessName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1E3A5F">We got your request!</h2>
          <p>Hi there,</p>
          <p>We received your change request for
             <strong>${businessName}</strong> and will
             get back to you within 24 hours.</p>
          <div style="background:#f5f5f5;padding:16px;
                      border-radius:8px;margin:16px 0;
                      border-left:4px solid #2563EB">
            <strong>Your request:</strong><br>
            <p style="margin:8px 0 0">${description}</p>
          </div>
          ${priority === 'urgent' ? `
            <p style="color:#dc2626;font-weight:bold">
              🚨 You marked this as urgent.
              We will prioritize it.
            </p>
          ` : ''}
          <p>If you have any questions, reply to this
             email or contact us at
             arsitechgroup@gmail.com</p>
          <p style="color:#888;font-size:12px">
            Request ID: ${data.id}
          </p>
        </div>
      `,
    })
  } catch (emailError) {
    console.error('Failed to send client confirmation:', emailError)
  }

  return Response.json({
    success: true,
    requestId: data.id
  })
}

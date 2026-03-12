import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const { email } = await request.json()
  if (!email) return Response.json({ error: 'Email required' }, { status: 400 })

  const supabase = getAdminClient()
  await supabase.from('email_subscribers')
    .update({ status: 'unsubscribed' })
    .eq('email', email)

  return Response.json({ success: true })
}

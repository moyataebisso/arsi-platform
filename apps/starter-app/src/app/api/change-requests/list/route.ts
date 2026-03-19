import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return Response.json({ error: 'Email required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('change_requests')
    .select('id, request_type, description, status, priority, admin_notes, created_at, updated_at')
    .eq('client_email', email)
    .order('created_at', { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ requests: data })
}

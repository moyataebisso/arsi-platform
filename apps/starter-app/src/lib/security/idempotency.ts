import { getAdminClient } from '@/lib/supabase/admin'

export async function isAlreadyProcessed(eventId: string): Promise<boolean> {
  const supabase = getAdminClient()
  try {
    const { data } = await supabase
      .from('processed_webhooks')
      .select('id')
      .eq('stripe_event_id', eventId)
      .single()
    return !!data
  } catch { return false }
}

export async function markAsProcessed(eventId: string, eventType: string) {
  const supabase = getAdminClient()
  await supabase.from('processed_webhooks').insert({
    stripe_event_id: eventId,
    event_type: eventType,
    processed_at: new Date().toISOString()
  })
}

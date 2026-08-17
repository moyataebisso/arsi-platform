import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { guard, SILENT_SUCCESS_BODY } from '@/lib/security/form-guard'
import { resolveBaseUrl } from '@/lib/site-url'

// Never reveal whether an account exists. Guard rejects (invalid email
// format) return the same success shape as the happy path — the user's
// browser shows a generic "check your email" screen either way. Supabase
// itself does not leak existence via resetPasswordForEmail, but wrapping
// any thrown error with a success response keeps that guarantee even if
// the transport fails.

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(SILENT_SUCCESS_BODY)
  }

  const decision = guard({ body, emailField: 'email' })
  if (decision.action !== 'allow') {
    return NextResponse.json(SILENT_SUCCESS_BODY)
  }

  const email = String(body.email).trim()

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${resolveBaseUrl()}/reset-password`,
    })
  } catch (error) {
    console.error('forgot-password: resetPasswordForEmail failed:', error)
  }

  return NextResponse.json(SILENT_SUCCESS_BODY)
}

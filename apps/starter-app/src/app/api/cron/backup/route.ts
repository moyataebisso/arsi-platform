import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { uploadBackup, cleanOldBackups } from '@/lib/backup/r2'

const TABLES = [
  'users',
  'bookings',
  'orders',
  'leads',
  'products',
  'blog_posts',
  'site_settings',
  'form_submissions',
  'email_templates',
]

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getAdminClient()
    const clientSlug = process.env.CLIENT_SLUG || 'unknown'

    const backup: Record<string, unknown[]> = {}

    for (const table of TABLES) {
      const { data, error } = await supabase.from(table).select('*')
      if (!error && data) {
        // Strip sensitive fields from users
        if (table === 'users') {
          backup[table] = data.map(({ ...user }) => {
            delete (user as Record<string, unknown>)['password_hash']
            return user
          })
        } else {
          backup[table] = data
        }
      }
    }

    const backupData = JSON.stringify({
      timestamp: new Date().toISOString(),
      client: clientSlug,
      tables: backup,
    }, null, 2)

    const key = await uploadBackup(clientSlug, backupData)
    const deleted = await cleanOldBackups(clientSlug, 90)

    // Send Discord notification
    const discordWebhook = process.env.DISCORD_WEBHOOK_DAILY_REPORTS
    if (discordWebhook) {
      const totalRows = Object.values(backup).reduce((sum, rows) => sum + rows.length, 0)
      await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `Backup completed for **${clientSlug}**: ${totalRows} rows across ${TABLES.length} tables. Stored at \`${key}\`. Cleaned ${deleted} old backups.`,
        }),
      })
    }

    return NextResponse.json({ success: true, key, deleted })
  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 })
  }
}

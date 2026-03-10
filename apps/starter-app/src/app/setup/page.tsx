export default function SetupPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fed7aa 100%)',
      }}
    >
      <div
        className="max-w-xl w-full rounded-2xl p-8 sm:p-10 shadow-xl"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#fef3c7' }}
          >
            <span className="text-3xl">&#9881;</span>
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: '#1c0a00', fontFamily: 'Georgia, serif' }}
          >
            Almost ready!
          </h1>
          <p className="text-base" style={{ color: '#92400e' }}>
            Complete the setup below to launch your site.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#b45309' }}>
            Setup Checklist
          </h2>

          {[
            {
              label: 'Add NEXT_PUBLIC_SUPABASE_URL to .env.local',
              description: 'Your Supabase project URL from the API settings page.',
            },
            {
              label: 'Add NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local',
              description: 'The anon/public key from your Supabase API settings.',
            },
            {
              label: 'Add SUPABASE_SERVICE_ROLE_KEY to .env.local',
              description: 'The service_role key for server-side admin operations.',
            },
            {
              label: 'Run database schema in Supabase SQL Editor',
              description: 'Execute the schema.sql file to create all required tables.',
            },
            {
              label: 'Add RESEND_API_KEY for email sending',
              description: 'Sign up at resend.com and add your API key.',
            },
            {
              label: 'Deploy to Vercel',
              description: 'Push to GitHub and import the project in Vercel.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-xl border"
              style={{ borderColor: '#fed7aa', backgroundColor: '#fffbf5' }}
            >
              <div
                className="w-6 h-6 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center"
                style={{ borderColor: '#d97706' }}
              >
                <span className="text-xs" style={{ color: '#d97706' }}>
                  {i + 1}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1c0a00' }}>
                  {item.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#92400e' }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="p-4 rounded-xl text-sm"
          style={{ backgroundColor: '#fef3c7', color: '#92400e' }}
        >
          <p className="font-semibold mb-1">Need help?</p>
          <p>
            See <span className="font-mono text-xs px-1 py-0.5 rounded" style={{ backgroundColor: '#fed7aa' }}>DEVELOPER.md</span> in
            the project root for full setup instructions, environment variable reference, and
            self-hosting guide.
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#b45309' }}>
          This page only appears when Supabase environment variables are not configured.
        </p>
      </div>
    </div>
  )
}

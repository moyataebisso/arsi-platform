import Link from 'next/link'

export default function BookConfirmPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-4">&#10003;</div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Booking Confirmed!</h1>
      <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
        You will receive a confirmation email shortly.
      </p>
      <Link href="/" className="inline-block px-6 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--color-primary)' }}>
        Back to Home
      </Link>
    </div>
  )
}

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-semibold">Viara</h1>
      <p className="mt-4 max-w-2xl text-neutral-600">
        Archive meaningful trips, learn your travel taste, and discover better matches.
      </p>

      <div className="mt-8 flex gap-4">
        <Link href="/login" className="rounded-xl border px-4 py-3">
          Sign in
        </Link>
        <Link href="/my-trips" className="rounded-xl border px-4 py-3">
          My Trips
        </Link>
      </div>
    </main>
  )
}
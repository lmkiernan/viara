import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function MyTripsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  })

  if (profileError) {
    console.error('Profile upsert failed:', profileError.message)
  }

  const { data: trips, error: tripsError } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false })

  if (tripsError) {
    console.error('Trips fetch failed:', tripsError.message)
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">My Trips</h1>
          <p className="mt-2 text-neutral-600">
            Archive past trips and plan new ones.
          </p>
        </div>
      </div>

      {!trips || trips.length === 0 ? (
        <div className="mt-10 rounded-2xl border p-8">
          <h2 className="text-xl font-medium">No trips yet</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Start by adding a past trip so Viara can learn your taste.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {trips.map((trip) => (
            <div key={trip.id} className="rounded-2xl border p-5">
              <h2 className="text-lg font-medium">{trip.title}</h2>
              <p className="mt-1 text-sm text-neutral-600">{trip.destination}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-neutral-500">
                {trip.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
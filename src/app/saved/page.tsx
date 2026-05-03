import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const WARM_GRADIENTS = [
  { from: '#c8b09a', to: '#9a7a62' },
  { from: '#9ab0c8', to: '#6282a0' },
  { from: '#aac8a0', to: '#729a62' },
  { from: '#c8a0b0', to: '#9a6272' },
  { from: '#c8c0a0', to: '#9a9062' },
]

function formatTripDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

type Trip = {
  id: string
  title: string
  destination: string | null
  start_date: string | null
  status: string
}

function TripCard({ trip, gradientIndex }: { trip: Trip; gradientIndex: number }) {
  const grad = WARM_GRADIENTS[gradientIndex % WARM_GRADIENTS.length]
  const date = formatTripDate(trip.start_date)
  return (
    <div className="relative h-52 rounded-2xl overflow-hidden shadow-sm">
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(145deg, ${grad.from}, ${grad.to})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-semibold text-base leading-snug">{trip.title}</p>
        {date && <p className="text-white/70 text-sm mt-0.5">{date}</p>}
      </div>
    </div>
  )
}

export default async function SavedPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.username) redirect('/profile/setup')

  const { data: savedRows, error: savedError } = await supabase
    .from('saved')
    .select('trip_uuid')
    .eq('user_uuid', user.id)

  if (savedError) console.error('Saved fetch failed:', savedError.message)

  const tripIds = (savedRows ?? []).map((r) => r.trip_uuid)

  let trips: Trip[] = []

  if (tripIds.length > 0) {
    const { data, error: tripsError } = await supabase
      .from('trips')
      .select('id, title, destination, start_date, status')
      .in('id', tripIds)
      .order('created_at', { ascending: false })

    if (tripsError) console.error('Trips fetch failed:', tripsError.message)
    trips = data ?? []
  }

  return (
    <div className="flex min-h-screen bg-[#EBEBEF]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white flex flex-col gap-6 px-5 py-7 border-r border-gray-100">
        <Link href="/my-trips" className="text-xl font-bold text-gray-900">
          Viara
        </Link>

        <nav className="flex flex-col gap-0.5">
          {[
            { label: 'Discover', href: '/discover' },
            { label: 'Saved', href: '/saved', active: true },
            { label: 'My Trips', href: '/my-trips' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3 py-2 text-sm transition-colors rounded-lg ${
                item.active
                  ? 'font-semibold text-gray-900 underline underline-offset-4 decoration-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-10 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saved</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Trips you've saved from the community.
            </p>
          </div>
          <span className="text-sm text-gray-400 mt-1">@{profile.username}</span>
        </div>

        {trips.length === 0 ? (
          <div className="rounded-2xl bg-white/70 border border-gray-200 p-6 text-sm text-gray-400">
            No saved trips yet. Explore{' '}
            <Link href="/discover" className="text-indigo-600 hover:underline">
              Discover
            </Link>{' '}
            to find trips to save.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {trips.map((trip, i) => (
              <TripCard key={trip.id} trip={trip} gradientIndex={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DeleteTripButton } from './delete-trip-button'

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
      <DeleteTripButton tripId={trip.id} />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-semibold text-base leading-snug">{trip.title}</p>
        {date && <p className="text-white/70 text-sm mt-0.5">{date}</p>}
      </div>
    </div>
  )
}

export default async function MyTripsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  })

  if (profileError) console.error('Profile upsert failed:', profileError.message)

  const { data: trips, error: tripsError } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false })

  if (tripsError) console.error('Trips fetch failed:', tripsError.message)

  const upcomingTrips = trips?.filter((t) => t.status === 'upcoming') ?? []
  const pastTrips = trips?.filter((t) => t.status === 'past') ?? []

  return (
    <div className="flex min-h-screen bg-[#EBEBEF]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white flex flex-col gap-6 px-5 py-7 border-r border-gray-100">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Viara
        </Link>

        <nav className="flex flex-col gap-0.5">
          {[
            { label: 'Discover', href: '/discover' },
            { label: 'Saved', href: '/saved' },
            { label: 'My Trips', href: '/my-trips', active: true },
            { label: 'Profile', href: '/profile' },
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

        <div className="flex flex-col gap-2.5">
          <button className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors cursor-pointer">
            <span className="text-base leading-none">+</span>
            Plan a Trip
          </button>
          <Link
            href="/my-trips/add-past-trip/step-1"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <PinIcon />
            Add Past Trip
          </Link>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search trips..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-300"
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-10 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            View all of your upcoming and past trips in one place.
          </p>
        </div>

        {/* Upcoming Trips */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Upcoming Trips</h2>
          {upcomingTrips.length === 0 ? (
            <div className="rounded-2xl bg-white/70 border border-gray-200 p-6 text-sm text-gray-400">
              No upcoming trips yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {upcomingTrips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} gradientIndex={i} />
              ))}
            </div>
          )}
        </section>

        {/* Past Trips */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Past Trips</h2>
          {pastTrips.length === 0 ? (
            <div className="rounded-2xl bg-white/70 border border-gray-200 p-6 text-sm text-gray-400">
              No past trips yet.{' '}
              <Link
                href="/my-trips/add-past-trip/step-1"
                className="text-indigo-600 hover:underline"
              >
                Add one now →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {pastTrips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} gradientIndex={i + 2} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

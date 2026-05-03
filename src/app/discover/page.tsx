import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<{ tab?: string }>

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.username) redirect('/profile/setup')

  const params = await searchParams
  const tab = params.tab === 'all' ? 'all' : 'network'

  return (
    <div className="flex min-h-screen bg-[#EBEBEF]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white flex flex-col gap-6 px-5 py-7 border-r border-gray-100">
        <Link href="/my-trips" className="text-xl font-bold text-gray-900">
          Viara
        </Link>

        <nav className="flex flex-col gap-0.5">
          {[
            { label: 'Discover', href: '/discover', active: true },
            { label: 'Saved', href: '/saved' },
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
            <h1 className="text-3xl font-bold text-gray-900">Discover</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Explore trips from your network and the community.
            </p>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <Link href="/discover/find" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Find your friends
            </Link>
            <span className="text-sm text-gray-400">@{profile.username}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-8">
          <Link
            href="/discover?tab=network"
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'network'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            My Network
          </Link>
          <Link
            href="/discover?tab=all"
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'all'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            All Trips
          </Link>
        </div>

        {/* Tab content */}
        {tab === 'network' ? (
          <div className="rounded-2xl bg-white/70 border border-gray-200 p-10 text-center text-sm text-gray-400">
            Trips from people you follow will appear here.
          </div>
        ) : (
          <div className="rounded-2xl bg-white/70 border border-gray-200 p-10 text-center text-sm text-gray-400">
            Public and anonymous trips from the community will appear here.
          </div>
        )}
      </main>
    </div>
  )
}

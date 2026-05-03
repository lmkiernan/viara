import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<{ q?: string }>

async function followUser(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const followedUuid = String(formData.get('followed_uuid'))
  const q = String(formData.get('q') ?? '')

  const { data: existing } = await supabase
    .from('friends')
    .select('follower_uuid')
    .eq('follower_uuid', user.id)
    .eq('followed_uuid', followedUuid)
    .maybeSingle()

  if (!existing) {
    const { error } = await supabase.from('friends').insert({
      follower_uuid: user.id,
      followed_uuid: followedUuid,
    })
    if (error) console.error('Follow failed:', error.message)
  }

  redirect(`/discover/find?q=${q}`)
}

export default async function FindFriendsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.username) redirect('/profile/setup')

  const params = await searchParams
  const query = params.q?.trim() ?? ''

  let results: { id: string; username: string; full_name: string | null }[] = []
  let followingSet = new Set<string>()

  if (query.length >= 1) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .ilike('username', `%${query}%`)
      .neq('id', user.id)
      .not('username', 'is', null)
      .limit(50)

    if (error) console.error('Search failed:', error.message)

    results = (data ?? [])
      .sort((a, b) => (a.username?.length ?? 0) - (b.username?.length ?? 0))
      .slice(0, 15)

    if (results.length > 0) {
      const { data: following, error: friendsError } = await supabase
        .from('friends')
        .select('followed_uuid')
        .eq('follower_uuid', user.id)
        .in('followed_uuid', results.map((r) => r.id))

      if (friendsError) console.error('Friends fetch failed:', friendsError.message)

      followingSet = new Set((following ?? []).map((f) => f.followed_uuid))
    }
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
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/discover"
            className="flex items-center justify-center h-8 w-8 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            aria-label="Back to Discover"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Find your friends</h1>
        </div>

        {/* Search form */}
        <form method="GET" action="/discover/find" className="mb-8">
          <div className="flex items-center gap-3 rounded-2xl bg-white border border-gray-200 px-4 py-3 max-w-lg shadow-sm focus-within:border-gray-400 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              name="q"
              type="text"
              defaultValue={query}
              placeholder="Search by username..."
              autoFocus
              autoComplete="off"
              className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            {query && (
              <Link href="/discover/find" className="text-xs text-gray-400 hover:text-gray-600">
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* Results */}
        {query.length === 0 ? (
          <p className="text-sm text-gray-400">Start typing to search for users.</p>
        ) : results.length === 0 ? (
          <p className="text-sm text-gray-400">No users found for &ldquo;{query}&rdquo;.</p>
        ) : (
          <ul className="flex flex-col gap-2 max-w-lg">
            {results.map((r) => {
              const isFollowing = followingSet.has(r.id)
              return (
                <li key={r.id}>
                  <div className="flex items-center gap-4 rounded-2xl bg-white border border-gray-200 px-5 py-4 shadow-sm">
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-semibold shrink-0">
                      {r.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">@{r.username}</p>
                      {r.full_name && (
                        <p className="text-xs text-gray-400 truncate">{r.full_name}</p>
                      )}
                    </div>

                    {isFollowing ? (
                      /* Already following — checkmark, no action */
                      <div className="flex items-center justify-center h-8 w-8 rounded-full border border-green-200 bg-green-50 text-green-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    ) : (
                      /* Not following — plus button that follows */
                      <form action={followUser}>
                        <input type="hidden" name="followed_uuid" value={r.id} />
                        <input type="hidden" name="q" value={query} />
                        <button
                          type="submit"
                          aria-label="Follow"
                          className="flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 bg-white text-gray-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}

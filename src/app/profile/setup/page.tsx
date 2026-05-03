import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<{ error?: string }>

async function setUsername(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const raw = String(formData.get('username') ?? '').trim()
  const username = raw.toLowerCase()

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    redirect('/profile/setup?error=invalid')
  }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (existing) {
    redirect('/profile/setup?error=taken')
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email ?? null,
      full_name: user.user_metadata?.full_name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      username,
    })

  if (error) {
    redirect('/profile/setup?error=failed')
  }

  redirect('/my-trips')
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid: 'Username must be 3–20 characters and only contain letters, numbers, or underscores.',
  taken: 'That username is already taken. Please try another.',
  failed: 'Something went wrong. Please try again.',
}

export default async function ProfileSetupPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const params = await searchParams
  const error = params.error

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,rgba(247,241,237,0.85),rgba(239,231,226,0.88)),url('/images/hero/travel-bg.jpg')] bg-cover bg-center flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-3xl font-serif tracking-wide text-stone-800">Viara</p>
        </div>

        <div className="rounded-[28px] border border-stone-200/80 bg-white/90 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur px-8 py-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-serif text-stone-900">Choose a username</h1>
            <p className="mt-2 text-base text-stone-500">
              This is how others will find and recognize you.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.failed}
            </div>
          )}

          <form action={setUsername} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-stone-700 mb-2">
                Username
              </label>
              <div className="flex items-center rounded-xl border border-stone-200 bg-white px-4 py-3 focus-within:border-stone-400 transition">
                <span className="text-stone-400 text-sm mr-1">@</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={20}
                  placeholder="yourname"
                  className="flex-1 bg-transparent text-stone-900 outline-none placeholder:text-stone-300 text-sm"
                />
              </div>
              <p className="mt-2 text-xs text-stone-400">
                3–20 characters. Letters, numbers, and underscores only.
              </p>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-xl bg-stone-600 px-8 py-3 text-base font-medium text-white transition hover:bg-stone-700"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient()

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
      <div className="w-full rounded-2xl border p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Sign in to Viara</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Use Google to continue.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="mt-6 w-full rounded-xl border px-4 py-3 text-sm font-medium"
        >
          Continue with Google
        </button>
      </div>
    </main>
  )
}
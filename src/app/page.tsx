'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function HomePage() {
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
    <div className="flex flex-col min-h-screen bg-cream">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 bg-cream border-b border-border-warm">
        <Link href="/" className="text-2xl font-bold text-warm-brown tracking-tight">
          Viara
        </Link>
        <div className="flex items-center gap-8 text-sm text-warm-brown-mid">
          <Link href="/my-trips" className="hover:text-warm-brown transition-colors">My Trips</Link>
          <Link href="/discover" className="hover:text-warm-brown transition-colors">Discover</Link>
          <Link href="/saved" className="hover:text-warm-brown transition-colors">Saved Places</Link>
          <span className="font-semibold text-warm-brown">Log In</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex items-center bg-cream-dark px-12 py-20">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-16">

          {/* Left: branding */}
          <div className="flex-1 max-w-lg">
            <h1 className="font-display text-6xl font-light leading-tight text-warm-brown mb-6">
              Travel, tailored to you.
            </h1>
            <p className="text-warm-brown-mid text-lg leading-relaxed">
              Turn your past trips into personalized recommendations — so every experience fits your style.
            </p>
          </div>

          {/* Right: sign-in card */}
          <div className="bg-cream rounded-2xl shadow-sm border border-border-warm p-8 w-full max-w-sm">
            <h2 className="text-xl font-semibold text-warm-brown mb-1">Sign in to Viara</h2>
            <p className="text-sm text-warm-brown-light mb-6">Begin your travel archive.</p>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-terracotta text-white px-4 py-3 text-sm font-medium hover:bg-terracotta-dark transition-colors cursor-pointer"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="text-xs text-center text-warm-brown-light mt-5">
              Your trips are private by default. You choose what to share — and how.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

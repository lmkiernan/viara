'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

type Privacy = 'private' | 'anonymous' | 'public'

const PRIVACY_OPTIONS: {
  value: Privacy
  label: string
  badge?: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    value: 'private',
    label: 'Private',
    badge: 'Recommended',
    description: 'Only you can view this trip.',
    icon: <LockIcon />,
  },
  {
    value: 'anonymous',
    label: 'Anonymous',
    description: 'Appears in Discover without your identity.',
    icon: <EyeIcon />,
  },
  {
    value: 'public',
    label: 'Public',
    description: 'Visible with your name.',
    icon: <PersonIcon />,
  },
]

export default function AddPastTripStep4Page() {
  return (
    <Suspense>
      <Step4Content />
    </Suspense>
  )
}

function Step4Content() {
  const searchParams = useSearchParams()
  const tripId = searchParams.get('tripId') ?? undefined
  const router = useRouter()

  const [privacy, setPrivacy] = useState<Privacy>('private')
  const [allowPrivateData, setAllowPrivateData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!tripId) {
    router.replace('/my-trips')
    return null
  }

  async function handleFinish() {
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('trips')
      .update({
        privacy,
        allow_private_data_for_recommendations: allowPrivateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tripId!)

    if (updateError) {
      console.error('Privacy update failed:', updateError.message)
      setError('Something went wrong. Please try again.')
      setSaving(false)
      return
    }

    router.push('/my-trips')
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,rgba(247,241,237,0.85),rgba(239,231,226,0.88)),url('/images/hero/travel-bg.jpg')] bg-cover bg-center px-4 py-10 md:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <p className="text-3xl font-serif tracking-wide text-stone-800">Viara</p>
        </div>

        <div className="rounded-[28px] border border-stone-200/80 bg-white/90 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur">
          {/* Header */}
          <div className="border-b border-stone-200 px-6 py-5 md:px-8">
            <div className="relative flex items-center justify-center">
              <Link
                href={`/my-trips/add-past-trip/step-3?tripId=${tripId}`}
                className="absolute left-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
                aria-label="Back to step 3"
              >
                <span className="text-2xl leading-none">‹</span>
              </Link>
              <div className="text-center">
                <h1 className="text-2xl font-serif text-stone-900 md:text-3xl">Add a New Trip</h1>
                <p className="mt-1 text-sm text-stone-500">Step 4 of 4</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-8 md:px-10 md:py-10">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-serif text-stone-900">Privacy & Sharing</h2>
              <p className="mt-2 text-base text-stone-600">You control what others can see.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Privacy options */}
            <div className="rounded-2xl border border-stone-200 divide-y divide-stone-100 mb-4">
              {PRIVACY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPrivacy(option.value)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left transition hover:bg-stone-50 first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900">{option.label}</span>
                      {option.badge && (
                        <span className="text-xs text-stone-400">{option.badge}</span>
                      )}
                    </div>
                    <p className="text-sm text-stone-500 mt-0.5">{option.description}</p>
                  </div>
                  <div
                    className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
                      privacy === option.value
                        ? 'border-stone-600 bg-stone-600'
                        : 'border-stone-300 bg-white'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Allow private data toggle */}
            <div className="rounded-2xl border border-stone-200 px-5 py-4 flex items-center justify-between gap-4 mb-8">
              <p className="text-sm text-stone-700">
                Allow private data to improve recommendations
              </p>
              <button
                type="button"
                role="switch"
                aria-checked={allowPrivateData}
                onClick={() => setAllowPrivateData((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  allowPrivateData ? 'bg-stone-600' : 'bg-stone-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                    allowPrivateData ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-3">
              {/* Placeholder — wire this up when the preview page is built */}
              <button
                type="button"
                disabled
                className="w-full rounded-xl border border-stone-200 px-8 py-3 text-base font-medium text-stone-400 cursor-not-allowed"
              >
                Preview how others see this
              </button>

              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="w-full inline-flex items-center justify-center rounded-xl bg-stone-600 px-8 py-3 text-base font-medium text-white transition hover:bg-stone-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Finish & Save Trip'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

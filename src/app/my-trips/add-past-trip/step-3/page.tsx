import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<{ tripId?: string; error?: string }>

async function saveReflection(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const tripId = String(formData.get('tripId') ?? '').trim()
  if (!tripId) redirect('/my-trips')

  const whatWorked = String(formData.get('what_worked') ?? '').trim()
  const whatToChange = String(formData.get('what_to_change') ?? '').trim()
  const doInstead = String(formData.get('do_instead') ?? '').trim()

  const { error } = await supabase
    .from('trips')
    .update({
      reflection_what_worked: whatWorked || null,
      reflection_what_to_change: whatToChange || null,
      reflection_do_instead: doInstead || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tripId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Reflection update failed:', error.message)
    redirect(`/my-trips/add-past-trip/step-3?tripId=${tripId}&error=update-failed`)
  }

  redirect(`/my-trips/add-past-trip/step-4?tripId=${tripId}`)
}

export default async function AddPastTripStep3Page({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const tripId = params.tripId
  const error = params.error

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')
  if (!tripId) redirect('/my-trips')

  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('id, destination')
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single()

  if (tripError || !trip) redirect('/my-trips')

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
                href={`/my-trips/add-past-trip/step-2?tripId=${tripId}`}
                className="absolute left-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
                aria-label="Back to step 2"
              >
                <span className="text-2xl leading-none">‹</span>
              </Link>
              <div className="text-center">
                <h1 className="text-2xl font-serif text-stone-900 md:text-3xl">Add a New Trip</h1>
                <p className="mt-1 text-sm text-stone-500">Step 3 of 4</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-8 md:px-10 md:py-10">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-serif text-stone-900">Reflection</h2>
              <p className="mt-2 text-base text-stone-600">
                Capture what you learned — this helps others travel better.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Something went wrong while saving. Please try again.
              </div>
            )}

            <form action={saveReflection}>
              <input type="hidden" name="tripId" value={tripId} />

              <div className="rounded-2xl border border-stone-200 divide-y divide-stone-100">
                <div className="p-5 md:p-6">
                  <label
                    htmlFor="what_worked"
                    className="block text-base font-semibold text-stone-800 mb-3"
                  >
                    What worked especially well?{' '}
                    <span className="font-normal text-stone-400">(optional)</span>
                  </label>
                  <textarea
                    id="what_worked"
                    name="what_worked"
                    rows={3}
                    defaultValue=""
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-400 resize-none"
                  />
                </div>

                <div className="p-5 md:p-6">
                  <label
                    htmlFor="what_to_change"
                    className="block text-base font-semibold text-stone-800 mb-3"
                  >
                    What would you change next time?{' '}
                    <span className="font-normal text-stone-400">(optional)</span>
                  </label>
                  <textarea
                    id="what_to_change"
                    name="what_to_change"
                    rows={2}
                    defaultValue=""
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-400 resize-none"
                  />
                </div>

                <div className="p-5 md:p-6">
                  <label
                    htmlFor="do_instead"
                    className="block text-base font-semibold text-stone-800 mb-3"
                  >
                    If you went again, where would you stay or what would you do instead?{' '}
                    <span className="font-normal text-stone-400">(optional)</span>
                  </label>
                  <textarea
                    id="do_instead"
                    name="do_instead"
                    rows={3}
                    defaultValue=""
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-400 resize-none"
                  />
                </div>

                <div className="px-5 py-4 md:px-6">
                  <p className="text-sm text-stone-400">
                    This helps improve recommendations for travelers like you.
                  </p>
                </div>
              </div>

              <div className="pt-6 text-center">
                <button
                  type="submit"
                  className="inline-flex min-w-40 items-center justify-center rounded-xl bg-stone-600 px-8 py-3 text-base font-medium text-white transition hover:bg-stone-700"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

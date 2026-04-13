import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type BudgetRange = {
  min: number | null
  max: number | null
}

function parseBudgetRange(value: string): BudgetRange {
  switch (value) {
    case 'under-2000':
      return { min: 0, max: 2000 }
    case '2000-5000':
      return { min: 2000, max: 5000 }
    case '5000-8000':
      return { min: 5000, max: 8000 }
    case '8000-12000':
      return { min: 8000, max: 12000 }
    case '12000-plus':
      return { min: 12000, max: null }
    default:
      return { min: null, max: null }
  }
}

async function createTrip(formData: FormData) {
  'use server'

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const destination = String(formData.get('destination') ?? '').trim()
  const startDate = String(formData.get('start_date') ?? '').trim()
  const endDate = String(formData.get('end_date') ?? '').trim()
  const companions = String(formData.get('companions') ?? '').trim()
  const budget = String(formData.get('budget') ?? '').trim()

  if (!destination || !startDate || !endDate || !companions || !budget) {
    redirect('/my-trips/add-past-trip/step-1?error=missing-fields')
  }

  const { min: budgetMin, max: budgetMax } = parseBudgetRange(budget)

  // Keep title simple for now; you can make this editable later.
  const title = destination

  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: user.id,
      title,
      destination,
      start_date: startDate,
      end_date: endDate,
      companions,
      budget_min: budgetMin,
      budget_max: budgetMax,
      status: 'past',
      privacy: 'private',
      allow_private_data_for_recommendations: false,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('Trip creation failed:', error?.message)
    redirect('/my-trips/add-past-trip/step-1?error=create-failed')
  }

  redirect(`/my-trips/add-past-trip/step-2?tripId=${data.id}`)
}

export default async function AddPastTripStep1Page({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = (await searchParams) ?? {}
  const error = params.error

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,rgba(247,241,237,0.85),rgba(239,231,226,0.88)),url('/images/hero/travel-bg.jpg')] bg-cover bg-center px-4 py-10 md:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <p className="text-3xl font-serif tracking-wide text-stone-800">Viara</p>
        </div>

        <div className="rounded-[28px] border border-stone-200/80 bg-white/90 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="border-b border-stone-200 px-6 py-5 md:px-8">
            <div className="relative flex items-center justify-center">
              <Link
                href="/my-trips"
                className="absolute left-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
                aria-label="Back to My Trips"
              >
                <span className="text-2xl leading-none">‹</span>
              </Link>

              <div className="text-center">
                <h1 className="text-2xl font-serif text-stone-900 md:text-3xl">
                  Add a New Trip
                </h1>
                <p className="mt-1 text-sm text-stone-500">Step 1 of 4</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 md:px-10 md:py-10">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-serif text-stone-900">Trip Basics</h2>
              <p className="mt-2 text-base text-stone-600">
                Start planning with these details.
              </p>
            </div>

            {error ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error === 'missing-fields'
                  ? 'Please fill out every field before continuing.'
                  : 'Something went wrong while creating the trip. Please try again.'}
              </div>
            ) : null}

            <form action={createTrip} className="space-y-5">
              <section className="rounded-2xl border border-stone-200 p-4 md:p-5">
                <label
                  htmlFor="destination"
                  className="mb-2 block text-lg font-medium text-stone-800"
                >
                  Destination
                </label>
                <input
                  id="destination"
                  name="destination"
                  type="text"
                  placeholder="Florence, Italy"
                  required
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
                />
              </section>

              <section className="rounded-2xl border border-stone-200 p-4 md:p-5">
                <label className="mb-2 block text-lg font-medium text-stone-800">
                  Dates
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    id="start_date"
                    name="start_date"
                    type="date"
                    required
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-400"
                  />
                  <input
                    id="end_date"
                    name="end_date"
                    type="date"
                    required
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-400"
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-stone-200 p-4 md:p-5">
                <label
                  htmlFor="companions"
                  className="mb-2 block text-lg font-medium text-stone-800"
                >
                  Who went?
                </label>
                <select
                  id="companions"
                  name="companions"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-400"
                >
                  <option value="" disabled>
                    Select a group
                  </option>
                  <option value="solo">Solo</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                  <option value="friends">Friends</option>
                </select>
              </section>

              <section className="rounded-2xl border border-stone-200 p-4 md:p-5">
                <label
                  htmlFor="budget"
                  className="mb-2 block text-lg font-medium text-stone-800"
                >
                  Budget
                </label>
                <select
                  id="budget"
                  name="budget"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-400"
                >
                  <option value="" disabled>
                    Select a budget range
                  </option>
                  <option value="under-2000">Under $2,000</option>
                  <option value="2000-5000">$2,000 – $5,000</option>
                  <option value="5000-8000">$5,000 – $8,000</option>
                  <option value="8000-12000">$8,000 – $12,000</option>
                  <option value="12000-plus">$12,000+</option>
                </select>
              </section>

              <div className="pt-4 text-center">
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
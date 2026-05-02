import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<{
  tripId?: string
  error?: string
}>

function splitLines(value: FormDataEntryValue | null): string[] {
  if (typeof value !== 'string') return []

  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

async function updateTripHighlights(formData: FormData) {
  'use server'

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const tripId = String(formData.get('tripId') ?? '').trim()

  if (!tripId) {
    redirect('/my-trips')
  }

  const hotels = splitLines(formData.get('hotels'))
  const restaurants = splitLines(formData.get('restaurants'))
  const experiences = splitLines(formData.get('experiences'))
  const localFinds = splitLines(formData.get('local_finds'))
  const planningSupport = splitLines(formData.get('planning_support'))
  const booksPodcasts = splitLines(formData.get('books_podcasts'))

  const itineraryFile = formData.get('itinerary_file')
  let itineraryFileUrl: string | null = null

  if (itineraryFile instanceof File && itineraryFile.size > 0) {
    const fileExt = itineraryFile.name.split('.').pop()?.toLowerCase() ?? 'bin'
    const safeName = `${user.id}/${tripId}/itinerary-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('trip-assets')
      .upload(safeName, itineraryFile, {
        contentType: itineraryFile.type || 'application/octet-stream',
        upsert: true,
      })

    if (uploadError) {
      console.error('Itinerary upload failed:', uploadError.message)
      redirect(`/my-trips/add-past-trip/step-2?tripId=${tripId}&error=upload-failed`)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('trip-assets').getPublicUrl(safeName)

    itineraryFileUrl = publicUrl
  }

  const updatePayload: Record<string, unknown> = {
    hotels,
    restaurants,
    experiences,
    local_finds: localFinds,
    planning_support: planningSupport,
    books_podcasts: booksPodcasts,
    updated_at: new Date().toISOString(),
  }

  if (itineraryFileUrl) {
    updatePayload.itinerary_file_url = itineraryFileUrl
  }

  const { error } = await supabase
    .from('trips')
    .update(updatePayload)
    .eq('id', tripId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Trip update failed:', error.message)
    redirect(`/my-trips/add-past-trip/step-2?tripId=${tripId}&error=update-failed`)
  }

  redirect(`/my-trips/add-past-trip/step-3?tripId=${tripId}`)
}

export default async function AddPastTripStep2Page({
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

  if (!user) {
    redirect('/')
  }

  if (!tripId) {
    redirect('/my-trips')
  }

  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select(
      `
      id,
      destination,
      hotels,
      restaurants,
      experiences,
      local_finds,
      planning_support,
      books_podcasts,
      itinerary_file_url
    `
    )
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single()

  if (tripError || !trip) {
    redirect('/my-trips')
  }

  const hotelsValue = Array.isArray(trip.hotels) ? trip.hotels.join('\n') : ''
  const restaurantsValue = Array.isArray(trip.restaurants)
    ? trip.restaurants.join('\n')
    : ''
  const experiencesValue = Array.isArray(trip.experiences)
    ? trip.experiences.join('\n')
    : ''
  const localFindsValue = Array.isArray(trip.local_finds)
    ? trip.local_finds.join('\n')
    : ''
  const planningSupportValue = Array.isArray(trip.planning_support)
    ? trip.planning_support.join('\n')
    : ''
  const booksPodcastsValue = Array.isArray(trip.books_podcasts)
    ? trip.books_podcasts.join('\n')
    : ''

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
                href={`/my-trips/add-past-trip/step-1`}
                className="absolute left-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
                aria-label="Back to step 1"
              >
                <span className="text-2xl leading-none">‹</span>
              </Link>

              <div className="text-center">
                <h1 className="text-2xl font-serif text-stone-900 md:text-3xl">
                  Add a New Trip
                </h1>
                <p className="mt-1 text-sm text-stone-500">Step 2 of 4</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 md:px-10 md:py-10">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-serif text-stone-900">Highlights</h2>
              <p className="mt-2 text-base text-stone-600">
                Capture the best part of this trip.
              </p>
              <p className="mt-2 text-sm text-stone-500">
                Adding highlights for {trip.destination}
              </p>
            </div>

            {error ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error === 'upload-failed'
                  ? 'The itinerary file could not be uploaded. Please try again.'
                  : 'Something went wrong while saving highlights. Please try again.'}
              </div>
            ) : null}

            <form action={updateTripHighlights} className="space-y-4">
              <input type="hidden" name="tripId" value={tripId} />

              <HighlightBlock
                title="Hotels"
                subtitle="Which places were nice to stay?"
                name="hotels"
                placeholder={'Hotel Savoy\nFour Seasons Firenze'}
                defaultValue={hotelsValue}
              />

              <HighlightBlock
                title="Restaurants"
                subtitle="Where was the food best?"
                name="restaurants"
                placeholder={'Trattoria Sostanza\nLa Giostra'}
                defaultValue={restaurantsValue}
              />

              <HighlightBlock
                title="Experiences"
                subtitle="What activities were especially memorable?"
                name="experiences"
                placeholder={'Sunset wine tasting\nUffizi visit'}
                defaultValue={experiencesValue}
              />

              <HighlightBlock
                title="Local Finds"
                subtitle="Any hidden gems or off-the-beaten-path spots?"
                name="local_finds"
                placeholder={'Neighborhood cafe\nVintage shop'}
                defaultValue={localFindsValue}
              />

              <HighlightBlock
                title="Planning Support"
                subtitle="Tips or resources that were helpful?"
                name="planning_support"
                placeholder={'A saved itinerary\nA blog post\nA friend’s recs'}
                defaultValue={planningSupportValue}
              />

              <HighlightBlock
                title="Relevant Books Read / Podcasts Listened To"
                subtitle="What inspired you?"
                name="books_podcasts"
                placeholder={'The Layover podcast\nA Tuscany travel guide'}
                defaultValue={booksPodcastsValue}
              />

              <section className="rounded-2xl border border-stone-200 p-4 md:p-5">
                <label
                  htmlFor="itinerary_file"
                  className="mb-2 block text-lg font-medium text-stone-800"
                >
                  Upload Your Itinerary
                </label>
                <p className="mb-3 text-sm text-stone-600">
                  Upload a PDF or screenshot
                </p>

                <input
                  id="itinerary_file"
                  name="itinerary_file"
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                  className="block w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 file:mr-4 file:rounded-lg file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-200"
                />

                {trip.itinerary_file_url ? (
                  <p className="mt-3 text-sm text-stone-500">
                    Existing itinerary uploaded.
                  </p>
                ) : null}
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

function HighlightBlock({
  title,
  subtitle,
  name,
  placeholder,
  defaultValue,
}: {
  title: string
  subtitle: string
  name: string
  placeholder: string
  defaultValue?: string
}) {
  return (
    <section className="rounded-2xl border border-stone-200 p-4 md:p-5">
      <label htmlFor={name} className="mb-1 block text-lg font-medium text-stone-800">
        {title}
      </label>
      <p className="mb-3 text-sm text-stone-600">{subtitle}</p>
      <textarea
        id={name}
        name={name}
        rows={3}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
      />
      <p className="mt-2 text-xs text-stone-400">
        Enter one item per line.
      </p>
    </section>
  )
}
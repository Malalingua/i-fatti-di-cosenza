import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

interface WebhookPayload {
  _type: string
  slug?: { current: string }
  categorySlug?: string
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const body: WebhookPayload = await request.json()

  if (body._type === 'article') {
    revalidatePath('/')
    if (body.slug?.current) revalidatePath(`/articolo/${body.slug.current}`)
    if (body.categorySlug) revalidatePath(`/${body.categorySlug}`)
  }

  return NextResponse.json({ revalidated: true, now: Date.now() })
}

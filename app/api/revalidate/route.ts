import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

interface WebhookPayload {
  _type: string
  slug?: { current: string }
  categorySlug?: string
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const expected = process.env.SANITY_REVALIDATE_SECRET
  if (!expected || secret !== expected) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  let body: WebhookPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  if (body._type === 'article') {
    revalidatePath('/')
    if (body.slug?.current) revalidatePath(`/articolo/${body.slug.current}`)
    if (body.categorySlug) revalidatePath(`/${body.categorySlug}`)
    revalidatePath('/sitemap.xml')
  }

  if (body._type === 'category') {
    revalidatePath('/')
  }

  return NextResponse.json({ revalidated: true, now: Date.now() })
}

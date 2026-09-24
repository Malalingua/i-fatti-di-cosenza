import { Anthropic } from '@anthropic-ai/sdk'
import { type NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function getClientIp(request: NextRequest): string {
  return (request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown').trim()
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 })
    return true
  }

  if (limit.count >= 5) {
    return false
  }

  limit.count++
  return true
}

const COSENTINO_SYSTEM_PROMPT = `Sei un traduttore ironico che converte frasi dall'italiano standard al dialetto cosentino, usando una voce satirica e pungente.

Usa questi proverbi cosentini autentici come ispirazione per il tono e lo stile:
- Va coglia Riganu ara scisa i Paula
- Mina mo che è carne i puarcu
- U puarcu abbuttu nun crida aru diunu
- Si nannuzzu avia tri palle era nu flipper
- U cane muzzica sempre aru strazzatu
- Chi mi la fa me la paga
- I caruseddi i malu pani

Regole:
1. Rispondi SOLO con la traduzione in dialetto cosentino, senza spiegazioni
2. Mantieni il significato originale con aggiunta di ironia
3. Usa la cadenza e la musicalità del dialetto
4. Massimo 2-3 righe
5. Sii mordace e satirico come il tono di Malalingua`

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Troppi tentativi. Max 5 per minuto.' }, { status: 429 })
  }

  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Testo richiesto' }, { status: 400 })
    }

    if (text.length > 300) {
      return NextResponse.json({ error: 'Massimo 300 caratteri' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 150,
      system: COSENTINO_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: text,
        },
      ],
    })

    const translation = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    return NextResponse.json({ translation })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: 'Errore durante la traduzione' }, { status: 500 })
  }
}

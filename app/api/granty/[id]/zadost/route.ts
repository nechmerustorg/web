import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { ORGANIZACE_PROFIL } from '@/lib/organizace'

export const dynamic = 'force-dynamic'

async function volajAI(prompt: string): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL
  const apiKey = process.env.OLLAMA_API_KEY
  const model = process.env.OLLAMA_MODEL ?? 'qwen2.5:72b'

  if (!baseUrl || !apiKey) {
    throw new Error('OLLAMA_BASE_URL nebo OLLAMA_API_KEY není nastaven v env proměnných')
  }

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AI API chyba ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 })

    const { rows } = await sql`SELECT * FROM granty WHERE id = ${id}`
    if (!rows.length) return NextResponse.json({ error: 'Grant nenalezen' }, { status: 404 })

    const grant = rows[0]

    const prompt = `Jsi expert na psaní grantových žádostí pro české neziskové organizace.

PROFIL ORGANIZACE:
${ORGANIZACE_PROFIL}

GRANT:
Název: ${grant.nazev}
Poskytovatel: ${grant.poskytovatel}
Částka: ${grant.castka ?? 'neuvedena'}
Deadline: ${grant.deadline ?? 'neuvedeno'}
Výzva / co grant podporuje: ${grant.vyzva ?? grant.popis ?? 'viz název grantu'}
Požadavky na žadatele: ${grant.pozadavky ?? 'standardní požadavky pro NNO'}

ÚKOL:
Napiš kompletní grantovou žádost v češtině. Žádost musí být konkrétní, přesvědčivá a přizpůsobená výzvě.

Struktura žádosti:
# Žádost o grant: ${grant.nazev}

## 1. Představení organizace
(Kdo jsme, co děláme, proč existujeme)

## 2. Popis projektu / účel žádosti
(Co konkrétně chceme financovat, proč to potřebujeme)

## 3. Cílová skupina a dopad
(Komu projekt pomůže, jaký bude mít dopad)

## 4. Plán realizace
(Časový harmonogram, klíčové kroky)

## 5. Rozpočet (orientační)
(Hlavní položky, na co budou prostředky použity)

## 6. Udržitelnost
(Jak bude projekt financován v budoucnu)

## 7. Kontaktní informace
Tomáš Bahník, předseda | nechmerust@gmail.com | Nech mě růst, z.s., Dandova 2619/13, Praha 193 00

Piš přirozeně, konkrétně a přesvědčivě. Délka: 600–900 slov.`

    const zadostText = await volajAI(prompt)

    await sql`
      UPDATE granty
      SET zadost_text = ${zadostText}, aktualizovano = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ ok: true, zadost_text: zadostText })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 })

    const { rows } = await sql`SELECT zadost_text, aktualizovano FROM granty WHERE id = ${id}`
    if (!rows.length) return NextResponse.json({ error: 'Grant nenalezen' }, { status: 404 })

    return NextResponse.json(rows[0])
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

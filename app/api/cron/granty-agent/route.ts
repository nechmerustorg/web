import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { ORGANIZACE_PROFIL } from '@/lib/organizace'

export const dynamic = 'force-dynamic'

async function volajAI(prompt: string): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL
  const apiKey = process.env.OLLAMA_API_KEY
  const model = process.env.OLLAMA_MODEL ?? 'qwen2.5:72b'

  if (!baseUrl || !apiKey) {
    throw new Error('OLLAMA_BASE_URL nebo OLLAMA_API_KEY není nastaven')
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
      temperature: 0.5,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AI API chyba ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function GET(req: NextRequest) {
  // Autorizace cron jobu
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { rows: granty } = await sql`
      SELECT id, nazev, poskytovatel, castka, deadline, status, priorita, popis, ai_hodnoceni
      FROM granty
      ORDER BY CASE priorita WHEN 'vysoká' THEN 1 WHEN 'střední' THEN 2 ELSE 3 END, deadline ASC NULLS LAST
    `

    const dnes = new Date().toISOString().split('T')[0]
    const grantySeznam = granty.map(g =>
      `- [${g.status.toUpperCase()}] ${g.nazev} (${g.poskytovatel}) | Částka: ${g.castka ?? 'N/A'} | Deadline: ${g.deadline ?? 'N/A'} | Priorita: ${g.priorita}${g.ai_hodnoceni ? ` | AI: ${g.ai_hodnoceni.split('—')[0].trim()}` : ''}`
    ).join('\n')

    const prompt = `Jsi asistent pro fundraising neziskové organizace Nech mě růst, z.s.

PROFIL ORGANIZACE:
${ORGANIZACE_PROFIL}

DNEŠNÍ DATUM: ${dnes}

AKTUÁLNÍ GRANTY V DATABÁZI:
${grantySeznam}

ÚKOL:
Vygeneruj stručný denní přehled grantů pro tým. Přehled bude zobrazen v interním dashboardu každé ráno.

Struktura přehledu (markdown, stručně):

## Denní přehled grantů — ${dnes}

### Urgentní — deadline do 30 dní
(granty s blížícím se deadlinem, konkrétní doporučení co udělat)

### V přípravě — nutná akce
(granty ve stavu "v přípravě", co je potřeba dokončit)

### Doporučené k podání
(top 2–3 granty s hodnocením VHODNÉ, které ještě nebyly podány)

### Tip dne
(jeden konkrétní tip nebo připomínka pro tým — max 2 věty)

Piš stručně, konkrétně, v češtině. Bez zbytečného opakování. Celková délka max 300 slov.`

    const obsah = await volajAI(prompt)

    await sql`
      INSERT INTO prehled_grantu (datum, obsah)
      VALUES (${dnes}::date, ${obsah})
      ON CONFLICT (datum) DO UPDATE SET obsah = EXCLUDED.obsah, vytvoreno = NOW()
    `

    return NextResponse.json({ ok: true, datum: dnes, delka: obsah.length })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initDb } from '@/lib/db'
import { getCalendar } from '@/lib/google'

export async function GET() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Kalendář není nakonfigurován — nastavte GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN' }, { status: 503 })
  }
  try {
    await initDb()
    const calendar = getCalendar()

    const now = new Date()
    const za3mesice = new Date(now)
    za3mesice.setMonth(za3mesice.getMonth() + 3)

    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: za3mesice.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
      timeZone: 'Europe/Prague',
    })

    const events = res.data.items || []
    let synced = 0

    for (const event of events) {
      const googleId = event.id!
      const nazev = event.summary || '(bez názvu)'
      const zacatek = event.start?.dateTime || event.start?.date || ''
      const konec = event.end?.dateTime || event.end?.date || ''
      const misto = event.location || null
      const popis = event.description || null

      await sql`
        INSERT INTO kalendar (google_id, nazev, zacatek, konec, misto, popis)
        VALUES (${googleId}, ${nazev}, ${zacatek}, ${konec}, ${misto}, ${popis})
        ON CONFLICT (google_id) DO UPDATE SET
          nazev = EXCLUDED.nazev,
          zacatek = EXCLUDED.zacatek,
          konec = EXCLUDED.konec,
          misto = EXCLUDED.misto,
          popis = EXCLUDED.popis,
          aktualizovano = NOW()
      `
      synced++
    }

    return NextResponse.json({ ok: true, synced, celkem: events.length })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

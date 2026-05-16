import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initDb } from '@/lib/db'
import { getGmail, klasifikujPrioritu } from '@/lib/google'

export async function GET() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Gmail není nakonfigurován — nastavte GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN' }, { status: 503 })
  }
  try {
    await initDb()
    const gmail = getGmail()

    const listRes = await gmail.users.threads.list({
      userId: 'me',
      labelIds: ['INBOX'],
      maxResults: 30,
    })

    const threads = listRes.data.threads || []
    let synced = 0
    let preskoceno = 0

    for (const thread of threads) {
      const threadRes = await gmail.users.threads.get({
        userId: 'me',
        id: thread.id!,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date'],
      })

      const msg = threadRes.data.messages?.[0]
      if (!msg) continue

      const headers = msg.payload?.headers || []
      const get = (name: string) => headers.find(h => h.name === name)?.value || ''

      const gmailId = msg.id!
      const od = get('From').replace(/<[^>]+>/, '').trim()
      const predmet = get('Subject') || '(bez předmětu)'
      const datum = new Date(parseInt(msg.internalDate || '0')).toISOString().slice(0, 16).replace('T', ' ')
      const priorita = klasifikujPrioritu(od, predmet)
      const obsah = threadRes.data.messages?.[0]?.snippet || ''

      try {
        await sql`
          INSERT INTO emaily (gmail_id, od, predmet, priorita, obsah, datum)
          VALUES (${gmailId}, ${od}, ${predmet}, ${priorita}, ${obsah}, ${datum})
          ON CONFLICT (gmail_id) DO NOTHING
        `
        synced++
      } catch {
        preskoceno++
      }
    }

    return NextResponse.json({ ok: true, synced, preskoceno, celkem: threads.length })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

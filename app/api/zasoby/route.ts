import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initDb } from '@/lib/db'

export async function GET() {
  try {
    await initDb()
    const { rows } = await sql`
      SELECT * FROM zasoby
      ORDER BY CASE status WHEN 'kritický' THEN 1 WHEN 'dochází' THEN 2 ELSE 3 END, nazev
    `
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, mnozstvi } = await req.json()
    const { rows } = await sql`SELECT minimum FROM zasoby WHERE id = ${id}`
    if (!rows[0]) return NextResponse.json({ error: 'Nenalezeno' }, { status: 404 })

    const min = rows[0].minimum
    const status = mnozstvi <= 0 ? 'kritický' : mnozstvi < min ? 'dochází' : 'ok'
    await sql`UPDATE zasoby SET mnozstvi = ${mnozstvi}, status = ${status}, aktualizovano = NOW() WHERE id = ${id}`
    return NextResponse.json({ ok: true, status })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

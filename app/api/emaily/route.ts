import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initDb } from '@/lib/db'

export async function GET() {
  try {
    await initDb()
    const { rows } = await sql`
      SELECT * FROM emaily
      ORDER BY CASE priorita WHEN 'urgentní' THEN 1 WHEN 'vysoká' THEN 2 WHEN 'normální' THEN 3 ELSE 4 END, datum DESC
    `
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, precten, odpovezeno } = await req.json()
    if (precten !== undefined) await sql`UPDATE emaily SET precten = ${precten ? 1 : 0} WHERE id = ${id}`
    if (odpovezeno !== undefined) await sql`UPDATE emaily SET odpovezeno = ${odpovezeno ? 1 : 0} WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

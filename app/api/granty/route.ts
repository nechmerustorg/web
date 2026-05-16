import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await initDb()
    const { rows } = await sql`
      SELECT * FROM granty
      ORDER BY CASE priorita WHEN 'vysoká' THEN 1 WHEN 'střední' THEN 2 ELSE 3 END, vytvoreno DESC
    `
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const d = await req.json()
    const { rows } = await sql`
      INSERT INTO granty (nazev, poskytovatel, castka, deadline, status, popis, priorita)
      VALUES (${d.nazev}, ${d.poskytovatel}, ${d.castka}, ${d.deadline}, ${d.status ?? 'nový'}, ${d.popis}, ${d.priorita ?? 'střední'})
      RETURNING id
    `
    return NextResponse.json({ id: rows[0].id })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()
    await sql`UPDATE granty SET status = ${status} WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

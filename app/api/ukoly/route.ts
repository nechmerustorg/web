import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initDb } from '@/lib/db'

export async function GET() {
  try {
    await initDb()
    const { rows } = await sql`
      SELECT * FROM ukoly WHERE splneno = 0
      ORDER BY CASE priorita WHEN 'urgentní' THEN 1 WHEN 'vysoká' THEN 2 WHEN 'normální' THEN 3 ELSE 4 END
    `
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, splneno } = await req.json()
    await sql`UPDATE ukoly SET splneno = ${splneno ? 1 : 0} WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const d = await req.json()
    const { rows } = await sql`
      INSERT INTO ukoly (nazev, priorita, zodpovedna_osoba, datum_splneni, popis)
      VALUES (${d.nazev}, ${d.priorita ?? 'normální'}, ${d.zodpovedna_osoba}, ${d.datum_splneni}, ${d.popis})
      RETURNING id
    `
    return NextResponse.json({ id: rows[0].id })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

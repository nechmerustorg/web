import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await initDb()
    const { rows: zvirata } = await sql`SELECT * FROM zvirata ORDER BY datum_prijeti DESC`
    const { rows: stats } = await sql`SELECT druh, COUNT(*) as pocet FROM zvirata GROUP BY druh`
    return NextResponse.json({ zvirata, stats })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const d = await req.json()
    const dnes = new Date().toISOString().split('T')[0]
    const { rows } = await sql`
      INSERT INTO zvirata (jmeno, druh, status, popis, datum_prijeti)
      VALUES (${d.jmeno}, ${d.druh}, ${d.status ?? 'v azylu'}, ${d.popis}, ${d.datum_prijeti ?? dnes})
      RETURNING id
    `
    return NextResponse.json({ id: rows[0].id })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initDb } from '@/lib/db'

export async function GET() {
  try {
    await initDb()
    const { rows } = await sql`
      SELECT * FROM kalendar ORDER BY zacatek ASC LIMIT 20
    `
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

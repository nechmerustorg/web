import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT obsah, datum, vytvoreno
      FROM prehled_grantu
      ORDER BY datum DESC
      LIMIT 1
    `
    if (!rows.length) return NextResponse.json({ obsah: null })
    return NextResponse.json(rows[0])
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { initDb, seedDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await initDb()
    await seedDb()
    return NextResponse.json({ ok: true, message: 'Databáze inicializována' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

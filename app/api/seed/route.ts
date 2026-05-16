import { NextResponse } from 'next/server'
import { initDb, seedDb } from '@/lib/db'

export async function GET() {
  try {
    initDb()
    seedDb()
    return NextResponse.json({ ok: true, message: 'Databáze inicializována' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

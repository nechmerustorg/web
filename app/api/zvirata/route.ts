import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function GET() {
  try {
    initDb()
    const db = getDb()
    const zvirata = db.prepare('SELECT * FROM zvirata ORDER BY datum_prijeti DESC').all()
    const stats = db.prepare(`
      SELECT druh, COUNT(*) as pocet FROM zvirata GROUP BY druh
    `).all()
    db.close()
    return NextResponse.json({ zvirata, stats })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const db = getDb()
    const result = db.prepare(`
      INSERT INTO zvirata (jmeno, druh, status, popis, datum_prijeti) VALUES (?, ?, ?, ?, ?)
    `).run(data.jmeno, data.druh, data.status || 'v azylu', data.popis, data.datum_prijeti || new Date().toISOString().split('T')[0])
    db.close()
    return NextResponse.json({ id: result.lastInsertRowid })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function GET() {
  try {
    initDb()
    const db = getDb()
    const ukoly = db.prepare(`
      SELECT * FROM ukoly WHERE splneno = 0
      ORDER BY CASE priorita WHEN 'urgentní' THEN 1 WHEN 'vysoká' THEN 2 WHEN 'normální' THEN 3 ELSE 4 END
    `).all()
    db.close()
    return NextResponse.json(ukoly)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, splneno } = await req.json()
    const db = getDb()
    db.prepare('UPDATE ukoly SET splneno = ? WHERE id = ?').run(splneno ? 1 : 0, id)
    db.close()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const db = getDb()
    const result = db.prepare(`
      INSERT INTO ukoly (nazev, priorita, zodpovedna_osoba, datum_splneni, popis) VALUES (?, ?, ?, ?, ?)
    `).run(data.nazev, data.priorita || 'normální', data.zodpovedna_osoba, data.datum_splneni, data.popis)
    db.close()
    return NextResponse.json({ id: result.lastInsertRowid })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

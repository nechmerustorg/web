import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function GET() {
  try {
    initDb()
    const db = getDb()
    const granty = db.prepare('SELECT * FROM granty ORDER BY CASE priorita WHEN \'vysoká\' THEN 1 WHEN \'střední\' THEN 2 ELSE 3 END, vytvoreno DESC').all()
    db.close()
    return NextResponse.json(granty)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const db = getDb()
    const result = db.prepare(`
      INSERT INTO granty (nazev, poskytovatel, castka, deadline, status, popis, priorita)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(data.nazev, data.poskytovatel, data.castka, data.deadline, data.status || 'nový', data.popis, data.priorita || 'střední')
    db.close()
    return NextResponse.json({ id: result.lastInsertRowid })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()
    const db = getDb()
    db.prepare('UPDATE granty SET status = ? WHERE id = ?').run(status, id)
    db.close()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

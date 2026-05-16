import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function GET() {
  try {
    initDb()
    const db = getDb()
    const zasoby = db.prepare('SELECT * FROM zasoby ORDER BY CASE status WHEN \'kritický\' THEN 1 WHEN \'dochází\' THEN 2 ELSE 3 END, nazev').all()
    db.close()
    return NextResponse.json(zasoby)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, mnozstvi } = await req.json()
    const db = getDb()
    const zasoba = db.prepare('SELECT * FROM zasoby WHERE id = ?').get(id) as { minimum: number } | undefined
    if (!zasoba) { db.close(); return NextResponse.json({ error: 'Nenalezeno' }, { status: 404 }) }

    const status = mnozstvi <= 0 ? 'kritický' : mnozstvi < zasoba.minimum ? 'dochází' : 'ok'
    db.prepare('UPDATE zasoby SET mnozstvi = ?, status = ?, aktualizovano = datetime(\'now\') WHERE id = ?').run(mnozstvi, status, id)
    db.close()
    return NextResponse.json({ ok: true, status })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

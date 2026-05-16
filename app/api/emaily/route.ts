import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function GET() {
  try {
    initDb()
    const db = getDb()
    const emaily = db.prepare(`
      SELECT * FROM emaily
      ORDER BY CASE priorita WHEN 'urgentní' THEN 1 WHEN 'vysoká' THEN 2 WHEN 'normální' THEN 3 ELSE 4 END, datum DESC
    `).all()
    db.close()
    return NextResponse.json(emaily)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, precten, odpovezeno } = await req.json()
    const db = getDb()
    if (precten !== undefined) db.prepare('UPDATE emaily SET precten = ? WHERE id = ?').run(precten ? 1 : 0, id)
    if (odpovezeno !== undefined) db.prepare('UPDATE emaily SET odpovezeno = ? WHERE id = ?').run(odpovezeno ? 1 : 0, id)
    db.close()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

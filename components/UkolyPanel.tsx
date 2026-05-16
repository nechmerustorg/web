'use client'

import { useState, useEffect } from 'react'
import Badge from './Badge'
import { CheckSquare, Plus, Check } from 'lucide-react'

interface Ukol {
  id: number
  nazev: string
  priorita: string
  zodpovedna_osoba: string
  datum_splneni: string
}

export default function UkolyPanel() {
  const [ukoly, setUkoly] = useState<Ukol[]>([])
  const [adding, setAdding] = useState(false)
  const [novy, setNovy] = useState({ nazev: '', priorita: 'normální', zodpovedna_osoba: '', datum_splneni: '' })

  async function load() {
    const res = await fetch('/api/ukoly')
    if (res.ok) setUkoly(await res.json())
  }

  async function splnit(id: number) {
    await fetch('/api/ukoly', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, splneno: true }) })
    load()
  }

  async function pridat() {
    if (!novy.nazev.trim()) return
    await fetch('/api/ukoly', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novy) })
    setNovy({ nazev: '', priorita: 'normální', zodpovedna_osoba: '', datum_splneni: '' })
    setAdding(false)
    load()
  }

  useEffect(() => { load() }, [])

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-[#00d4ff]" />
          <h2 className="text-sm font-semibold text-[#00d4ff] uppercase tracking-wider">Úkoly</h2>
          <span className="text-xs text-gray-500">({ukoly.length})</span>
        </div>
        <button onClick={() => setAdding(!adding)} className="text-gray-600 hover:text-[#00d4ff] transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {adding && (
        <div className="flex flex-col gap-2 bg-[#0d1f35] border border-[#1e3a5f] rounded p-2">
          <input placeholder="Název úkolu" value={novy.nazev} onChange={e => setNovy({ ...novy, nazev: e.target.value })}
            className="bg-transparent border border-[#1e2d45] rounded px-2 py-1 text-xs text-white placeholder-gray-600 w-full" />
          <div className="flex gap-2">
            <select value={novy.priorita} onChange={e => setNovy({ ...novy, priorita: e.target.value })}
              className="bg-[#111827] border border-[#1e2d45] rounded px-2 py-1 text-xs text-gray-300 flex-1">
              <option value="urgentní">Urgentní</option>
              <option value="vysoká">Vysoká</option>
              <option value="normální">Normální</option>
              <option value="nízká">Nízká</option>
            </select>
            <input placeholder="Zodpovědná osoba" value={novy.zodpovedna_osoba} onChange={e => setNovy({ ...novy, zodpovedna_osoba: e.target.value })}
              className="bg-transparent border border-[#1e2d45] rounded px-2 py-1 text-xs text-white placeholder-gray-600 flex-1" />
          </div>
          <div className="flex gap-2">
            <input type="date" value={novy.datum_splneni} onChange={e => setNovy({ ...novy, datum_splneni: e.target.value })}
              className="bg-[#111827] border border-[#1e2d45] rounded px-2 py-1 text-xs text-gray-300 flex-1" />
            <button onClick={pridat} className="bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 rounded px-3 py-1 text-xs hover:bg-[#00d4ff]/30 transition-colors">
              Přidat
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {ukoly.map(u => (
          <div key={u.id} className="flex items-center gap-2 p-2 rounded border border-[#1e2d45] hover:border-[#2d3f5a] transition-colors group">
            <button onClick={() => splnit(u.id)} className="shrink-0 w-4 h-4 border border-[#1e2d45] rounded group-hover:border-[#00ff88] flex items-center justify-center transition-colors">
              <Check className="w-2.5 h-2.5 text-[#00ff88] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs text-gray-300 truncate">{u.nazev}</span>
              {u.zodpovedna_osoba && <span className="text-xs text-gray-600">{u.zodpovedna_osoba}</span>}
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <Badge label={u.priorita} />
              {u.datum_splneni && <span className="text-xs text-gray-700">{u.datum_splneni}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

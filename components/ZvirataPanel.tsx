'use client'

import { useState, useEffect } from 'react'
import { Heart, Plus } from 'lucide-react'

interface Zvire {
  id: number
  jmeno: string
  druh: string
  status: string
  popis: string
  datum_prijeti: string
}

interface Stat {
  druh: string
  pocet: number
}

const druhEmoji: Record<string, string> = {
  koza: '🐐', prase: '🐷', ovce: '🐑', kůň: '🐴', pes: '🐕',
  kočka: '🐱', kráva: '🐄', slepice: '🐓', králík: '🐰',
}

export default function ZvirataPanel() {
  const [zvirata, setZvirata] = useState<Zvire[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [adding, setAdding] = useState(false)
  const [novy, setNovy] = useState({ jmeno: '', druh: '', popis: '' })

  async function load() {
    const res = await fetch('/api/zvirata')
    if (res.ok) {
      const data = await res.json()
      setZvirata(data.zvirata)
      setStats(data.stats)
    }
  }

  async function pridat() {
    if (!novy.jmeno || !novy.druh) return
    await fetch('/api/zvirata', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novy) })
    setNovy({ jmeno: '', druh: '', popis: '' })
    setAdding(false)
    load()
  }

  useEffect(() => { load() }, [])

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#00d4ff]" />
          <h2 className="text-sm font-semibold text-[#00d4ff] uppercase tracking-wider">Zvířata</h2>
          <span className="text-xs text-gray-500">({zvirata.length} celkem)</span>
        </div>
        <button onClick={() => setAdding(!adding)} className="text-gray-600 hover:text-[#00d4ff] transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {stats.map(s => (
          <div key={s.druh} className="flex items-center gap-1 bg-[#1a2332] rounded px-2 py-1">
            <span>{druhEmoji[s.druh] || '🐾'}</span>
            <span className="text-xs text-gray-300">{s.druh}</span>
            <span className="text-xs text-[#00ff88] font-semibold">{s.pocet}</span>
          </div>
        ))}
      </div>

      {adding && (
        <div className="flex flex-col gap-2 bg-[#0d1f35] border border-[#1e3a5f] rounded p-2">
          <div className="flex gap-2">
            <input placeholder="Jméno" value={novy.jmeno} onChange={e => setNovy({ ...novy, jmeno: e.target.value })}
              className="bg-transparent border border-[#1e2d45] rounded px-2 py-1 text-xs text-white placeholder-gray-600 flex-1" />
            <input placeholder="Druh" value={novy.druh} onChange={e => setNovy({ ...novy, druh: e.target.value })}
              className="bg-transparent border border-[#1e2d45] rounded px-2 py-1 text-xs text-white placeholder-gray-600 flex-1" />
          </div>
          <div className="flex gap-2">
            <input placeholder="Popis" value={novy.popis} onChange={e => setNovy({ ...novy, popis: e.target.value })}
              className="bg-transparent border border-[#1e2d45] rounded px-2 py-1 text-xs text-white placeholder-gray-600 flex-1" />
            <button onClick={pridat} className="bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 rounded px-3 py-1 text-xs hover:bg-[#00d4ff]/30">
              Přidat
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
        {zvirata.map(z => (
          <div key={z.id} className="flex items-center gap-2 p-2 rounded border border-[#1e2d45]">
            <span className="text-lg">{druhEmoji[z.druh] || '🐾'}</span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm text-gray-200">{z.jmeno}</span>
              <span className="text-xs text-gray-600 truncate">{z.popis}</span>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded border ${z.status === 'adoptována' ? 'border-[#00ff88]/30 text-[#00ff88]' : 'border-[#1e2d45] text-gray-600'}`}>
              {z.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

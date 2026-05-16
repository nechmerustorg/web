'use client'

import { useState, useEffect } from 'react'
import Badge from './Badge'
import { Package, Edit2, Check, X } from 'lucide-react'

interface Zasoba {
  id: number
  nazev: string
  mnozstvi: number
  jednotka: string
  minimum: number
  status: string
  aktualizovano: string
}

export default function ZasobyPanel() {
  const [zasoby, setZasoby] = useState<Zasoba[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  async function load() {
    const res = await fetch('/api/zasoby')
    if (res.ok) setZasoby(await res.json())
  }

  async function saveEdit(id: number) {
    await fetch('/api/zasoby', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, mnozstvi: parseFloat(editValue) })
    })
    setEditing(null)
    load()
  }

  useEffect(() => { load() }, [])

  function getBarColor(status: string) {
    if (status === 'kritický') return 'bg-[#ff3355]'
    if (status === 'dochází') return 'bg-[#ff8800]'
    return 'bg-[#00ff88]'
  }

  function getPercent(mnozstvi: number, minimum: number) {
    const max = minimum * 3
    return Math.min(100, Math.max(0, (mnozstvi / max) * 100))
  }

  const kritickych = zasoby.filter(z => z.status === 'kritický' || z.status === 'dochází').length

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#00d4ff]" />
          <h2 className="text-sm font-semibold text-[#00d4ff] uppercase tracking-wider">Zásoby</h2>
          {kritickych > 0 && (
            <span className="text-xs bg-[#ff3355] text-white px-1.5 py-0.5 rounded-full font-bold">{kritickych}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {zasoby.map(z => (
          <div key={z.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">{z.nazev}</span>
                <Badge label={z.status} />
              </div>
              <div className="flex items-center gap-2">
                {editing === z.id ? (
                  <>
                    <input
                      type="number"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="w-16 bg-[#0d1f35] border border-[#00d4ff] rounded px-1 py-0.5 text-xs text-white text-right"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(z.id)} className="text-[#00ff88] hover:text-[#00ff88]/80"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditing(null)} className="text-gray-600 hover:text-gray-400"><X className="w-3.5 h-3.5" /></button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-gray-400">{z.mnozstvi} {z.jednotka}</span>
                    <button onClick={() => { setEditing(z.id); setEditValue(String(z.mnozstvi)) }} className="text-gray-700 hover:text-gray-500">
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="progress-bar">
              <div className={`progress-fill ${getBarColor(z.status)}`} style={{ width: `${getPercent(z.mnozstvi, z.minimum)}%` }} />
            </div>
            <span className="text-xs text-gray-700">minimum: {z.minimum} {z.jednotka}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

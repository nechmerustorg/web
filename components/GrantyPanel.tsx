'use client'

import { useState, useEffect } from 'react'
import Badge from './Badge'
import { Search, Plus, RefreshCw } from 'lucide-react'

interface Grant {
  id: number
  nazev: string
  poskytovatel: string
  castka: string
  deadline: string
  status: string
  popis: string
  priorita: string
}

export default function GrantyPanel() {
  const [granty, setGranty] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/granty')
    if (res.ok) setGranty(await res.json())
    setLoading(false)
  }

  async function updateStatus(id: number, status: string) {
    await fetch('/api/granty', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    load()
  }

  useEffect(() => { load() }, [])

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-[#00d4ff]" />
          <h2 className="text-sm font-semibold text-[#00d4ff] uppercase tracking-wider">Granty</h2>
          <span className="text-xs text-gray-500">({granty.length})</span>
        </div>
        <button onClick={load} className="text-gray-600 hover:text-gray-400 transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {granty.map(g => (
          <div key={g.id} className="border border-[#1e2d45] rounded-md overflow-hidden">
            <div
              className="p-3 cursor-pointer hover:bg-[#1a2332] transition-colors flex items-start justify-between gap-2"
              onClick={() => setExpanded(expanded === g.id ? null : g.id)}
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm text-gray-200 truncate">{g.nazev}</span>
                <span className="text-xs text-gray-500">{g.poskytovatel}</span>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge label={g.priorita} />
                <span className="text-xs text-gray-500">{g.castka}</span>
              </div>
            </div>
            {expanded === g.id && (
              <div className="px-3 pb-3 border-t border-[#1e2d45] pt-2 flex flex-col gap-2">
                <p className="text-xs text-gray-400">{g.popis}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Deadline: <span className="text-[#ff8800]">{g.deadline}</span></span>
                  <div className="flex gap-1">
                    {['nový', 'v přípravě', 'podán', 'sledovaný'].map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(g.id, s)}
                        className={`text-xs px-2 py-0.5 rounded border transition-colors ${g.status === s ? 'bg-[#1e3a5f] border-[#00d4ff] text-[#00d4ff]' : 'border-[#1e2d45] text-gray-600 hover:border-gray-500'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

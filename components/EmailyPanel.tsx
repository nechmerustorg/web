'use client'

import { useState, useEffect } from 'react'
import Badge from './Badge'
import { Mail, RefreshCw, CheckCircle } from 'lucide-react'

interface Email {
  id: number
  od: string
  predmet: string
  priorita: string
  obsah: string
  precten: number
  odpovezeno: number
  datum: string
  navrh_odpovedi: string | null
}

export default function EmailyPanel() {
  const [emaily, setEmaily] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/emaily')
    if (res.ok) setEmaily(await res.json())
    setLoading(false)
  }

  async function markRead(id: number) {
    await fetch('/api/emaily', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, precten: true }) })
    load()
  }

  async function markAnswered(id: number) {
    await fetch('/api/emaily', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, odpovezeno: true }) })
    load()
  }

  useEffect(() => { load() }, [])

  const neprectenych = emaily.filter(e => !e.precten).length

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#00d4ff]" />
          <h2 className="text-sm font-semibold text-[#00d4ff] uppercase tracking-wider">E-maily</h2>
          {neprectenych > 0 && (
            <span className="text-xs bg-[#ff3355] text-white px-1.5 py-0.5 rounded-full font-bold">{neprectenych}</span>
          )}
        </div>
        <button onClick={load} className="text-gray-600 hover:text-gray-400 transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {emaily.map(e => (
          <div key={e.id} className={`border rounded-md overflow-hidden ${!e.precten ? 'border-[#1e3a5f]' : 'border-[#1e2d45]'}`}>
            <div
              className={`p-3 cursor-pointer transition-colors flex items-start justify-between gap-2 ${!e.precten ? 'bg-[#0d1f35]' : 'hover:bg-[#1a2332]'}`}
              onClick={() => { setExpanded(expanded === e.id ? null : e.id); if (!e.precten) markRead(e.id) }}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  {!e.precten && <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] pulse-dot shrink-0" />}
                  <span className={`text-sm truncate ${!e.precten ? 'text-white font-medium' : 'text-gray-300'}`}>{e.predmet}</span>
                </div>
                <span className="text-xs text-gray-500">{e.od}</span>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge label={e.priorita} />
                <span className="text-xs text-gray-600">{e.datum.split(' ')[1]?.slice(0, 5)}</span>
              </div>
            </div>
            {expanded === e.id && (
              <div className="px-3 pb-3 border-t border-[#1e2d45] pt-2 flex flex-col gap-2">
                <p className="text-xs text-gray-400">{e.obsah}</p>
                {e.navrh_odpovedi && (
                  <div className="bg-[#0d1f35] border border-[#1e3a5f] rounded p-2">
                    <span className="text-xs text-[#00d4ff] font-medium">Návrh odpovědi:</span>
                    <p className="text-xs text-gray-400 mt-1">{e.navrh_odpovedi}</p>
                  </div>
                )}
                {!e.odpovezeno && (
                  <button onClick={() => markAnswered(e.id)} className="self-start flex items-center gap-1 text-xs text-[#00ff88] border border-[#00ff88]/30 px-2 py-1 rounded hover:bg-[#00ff88]/10 transition-colors">
                    <CheckCircle className="w-3 h-3" /> Označit jako odpovězeno
                  </button>
                )}
                {e.odpovezeno === 1 && <span className="text-xs text-gray-600 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-[#00ff88]" /> Odpovězeno</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Badge from './Badge'
import { Search, RefreshCw, FileText, Copy, Check, ChevronDown, ChevronUp, Bot } from 'lucide-react'

interface Grant {
  id: number
  nazev: string
  poskytovatel: string
  castka: string
  deadline: string
  status: string
  popis: string
  priorita: string
  url?: string
  vyzva?: string
  ai_hodnoceni?: string
  zadost_text?: string
}

interface Prehled {
  obsah: string | null
  datum: string
}

function aiHodnoceniBadge(hodnoceni?: string) {
  if (!hodnoceni) return null
  const text = hodnoceni.toUpperCase()
  if (text.startsWith('VHODNÉ')) return <span className="text-xs px-1.5 py-0.5 rounded bg-[#003322] text-[#00ff88] border border-[#00ff88]/30">vhodné</span>
  if (text.startsWith('ČÁSTEČNĚ')) return <span className="text-xs px-1.5 py-0.5 rounded bg-[#332200] text-[#ff8800] border border-[#ff8800]/30">částečně</span>
  if (text.startsWith('NEVHODNÉ')) return <span className="text-xs px-1.5 py-0.5 rounded bg-[#330011] text-[#ff3355] border border-[#ff3355]/30">nevhodné</span>
  return null
}

export default function GrantyPanel() {
  const [granty, setGranty] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [prehled, setPrehled] = useState<Prehled | null>(null)
  const [prehledOpen, setPrehledOpen] = useState(false)
  const [generuji, setGeneruji] = useState<Record<number, boolean>>({})
  const [zkopirovat, setZkopirovat] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    const [resG, resP] = await Promise.all([
      fetch('/api/granty'),
      fetch('/api/granty/prehled'),
    ])
    if (resG.ok) setGranty(await resG.json())
    if (resP.ok) {
      const p = await resP.json()
      if (p.obsah) setPrehled(p)
    }
    setLoading(false)
  }

  async function updateStatus(id: number, status: string) {
    await fetch('/api/granty', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  async function generujZadost(id: number) {
    setGeneruji(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch(`/api/granty/${id}/zadost`, { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setGranty(prev => prev.map(g => g.id === id ? { ...g, zadost_text: data.zadost_text } : g))
      } else {
        alert('Chyba při generování: ' + (data.error ?? 'neznámá chyba'))
      }
    } finally {
      setGeneruji(prev => ({ ...prev, [id]: false }))
    }
  }

  async function kopirujZadost(id: number, text: string) {
    await navigator.clipboard.writeText(text)
    setZkopirovat(id)
    setTimeout(() => setZkopirovat(null), 2000)
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

      {/* Denní přehled AI agenta */}
      {prehled && (
        <div className="border border-[#00d4ff]/20 rounded-md bg-[#0d1829] overflow-hidden">
          <button
            onClick={() => setPrehledOpen(!prehledOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#1a2332] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-[#00d4ff]" />
              <span className="text-xs text-[#00d4ff] font-medium">Denní přehled agenta</span>
              <span className="text-xs text-gray-600">{prehled.datum}</span>
            </div>
            {prehledOpen ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
          </button>
          {prehledOpen && (
            <div className="px-3 pb-3 border-t border-[#1e2d45]">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed pt-2">{prehled.obsah}</pre>
            </div>
          )}
        </div>
      )}

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
              <div className="px-3 pb-3 border-t border-[#1e2d45] pt-2 flex flex-col gap-3">
                {/* AI hodnocení */}
                {g.ai_hodnoceni && (
                  <div className="flex items-start gap-2">
                    {aiHodnoceniBadge(g.ai_hodnoceni)}
                    <p className="text-xs text-gray-500 leading-relaxed">{g.ai_hodnoceni.replace(/^(VHODNÉ|ČÁSTEČNĚ VHODNÉ|NEVHODNÉ)\s*—\s*/i, '')}</p>
                  </div>
                )}

                {/* Popis / výzva */}
                <p className="text-xs text-gray-400">{g.vyzva ?? g.popis}</p>

                {/* Deadline + status tlačítka */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-gray-600">
                    Deadline: <span className="text-[#ff8800]">{g.deadline ?? '–'}</span>
                  </span>
                  <div className="flex gap-1 flex-wrap">
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

                {/* URL */}
                {g.url && (
                  <a href={g.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#00d4ff] hover:underline truncate">
                    {g.url}
                  </a>
                )}

                {/* Tlačítko generovat žádost */}
                <div className="border-t border-[#1e2d45] pt-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generujZadost(g.id)}
                      disabled={generuji[g.id]}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-[#00ff88]/40 text-[#00ff88] hover:bg-[#003322] transition-colors disabled:opacity-50"
                    >
                      <FileText className="w-3 h-3" />
                      {generuji[g.id] ? 'Generuji...' : g.zadost_text ? 'Přegenerovat žádost' : 'Generovat žádost (AI)'}
                    </button>
                    {g.zadost_text && (
                      <button
                        onClick={() => kopirujZadost(g.id, g.zadost_text!)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {zkopirovat === g.id ? <Check className="w-3 h-3 text-[#00ff88]" /> : <Copy className="w-3 h-3" />}
                        {zkopirovat === g.id ? 'Zkopírováno' : 'Kopírovat'}
                      </button>
                    )}
                  </div>

                  {/* Vygenerovaná žádost */}
                  {g.zadost_text && (
                    <div className="bg-[#060d18] rounded border border-[#1e2d45] p-3 max-h-64 overflow-y-auto">
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{g.zadost_text}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

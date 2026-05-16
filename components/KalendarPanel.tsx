'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, RefreshCw } from 'lucide-react'

interface Akce {
  id: number
  nazev: string
  zacatek: string
  konec: string
  misto: string | null
  popis: string | null
}

function formatDatum(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const dnes = new Date()
  const zitra = new Date(dnes); zitra.setDate(zitra.getDate() + 1)
  const jeToday = d.toDateString() === dnes.toDateString()
  const jeZitra = d.toDateString() === zitra.toDateString()
  const den = jeToday ? 'Dnes' : jeZitra ? 'Zítra' : d.toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'short' })
  const cas = iso.includes('T') ? d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : ''
  return cas ? `${den} ${cas}` : den
}

function dnyDo(iso: string): number {
  const d = new Date(iso)
  const dnes = new Date()
  dnes.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - dnes.getTime()) / 86400000)
}

function getBorderColor(dni: number) {
  if (dni <= 0) return 'border-[#ff3355]'
  if (dni <= 2) return 'border-[#ff8800]'
  if (dni <= 7) return 'border-[#00d4ff]'
  return 'border-[#1e2d45]'
}

export default function KalendarPanel() {
  const [akce, setAkce] = useState<Akce[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [nenakonfigurovano, setNenakonfigurovano] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/kalendar')
    if (res.ok) {
      const data = await res.json()
      setAkce(Array.isArray(data) ? data : [])
    }
    setLoading(false)
  }

  async function sync() {
    setSyncing(true)
    const res = await fetch('/api/sync/calendar')
    if (res.status === 503) {
      setNenakonfigurovano(true)
    } else {
      await load()
    }
    setSyncing(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-[#00d4ff]" />
          <h2 className="text-sm font-semibold text-[#00d4ff] uppercase tracking-wider">Kalendář</h2>
          <span className="text-xs text-gray-500">({akce.length})</span>
        </div>
        <button onClick={sync} disabled={syncing} className="text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-40">
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {nenakonfigurovano && (
        <div className="bg-[#1a0d00] border border-[#ff8800]/30 rounded p-3 text-xs text-[#ff8800]">
          Google Calendar není propojen. Nastav env proměnné v Vercel:<br />
          <code className="text-[#ff8800]/80">GOOGLE_CLIENT_ID · GOOGLE_CLIENT_SECRET · GOOGLE_REFRESH_TOKEN</code>
        </div>
      )}

      {!nenakonfigurovano && akce.length === 0 && !loading && (
        <div className="text-xs text-gray-600 text-center py-4">
          Žádné nadcházející události.<br />
          <button onClick={sync} className="text-[#00d4ff] hover:underline mt-1">Synchronizovat z Google Kalendáře</button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {akce.map(a => {
          const dni = dnyDo(a.zacatek)
          return (
            <div key={a.id} className={`border-l-2 ${getBorderColor(dni)} pl-3 py-1 flex flex-col gap-0.5`}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm text-gray-200 leading-tight">{a.nazev}</span>
                {dni <= 2 && (
                  <span className={`text-xs shrink-0 ${dni <= 0 ? 'text-[#ff3355]' : 'text-[#ff8800]'}`}>
                    {dni <= 0 ? 'Dnes' : `za ${dni} d`}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{formatDatum(a.zacatek)}</span>
              {a.misto && <span className="text-xs text-gray-600">📍 {a.misto}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

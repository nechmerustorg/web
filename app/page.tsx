'use client'

import { useState, useEffect } from 'react'
import { Activity, AlertTriangle, TrendingUp, Users, Zap } from 'lucide-react'
import GrantyPanel from '@/components/GrantyPanel'
import EmailyPanel from '@/components/EmailyPanel'
import ZasobyPanel from '@/components/ZasobyPanel'
import UkolyPanel from '@/components/UkolyPanel'
import ZvirataPanel from '@/components/ZvirataPanel'
import KalendarPanel from '@/components/KalendarPanel'
import StatCard from '@/components/StatCard'

interface Stats {
  emaily_neprectene: number
  zasoby_kriticke: number
  granty_nove: number
  ukoly_aktivni: number
}

function Clock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])
  return <span className="text-[#00d4ff] font-mono tabular-nums">{time}</span>
}

export default function Dashboard() {
  const [seeded, setSeeded] = useState(false)
  const [stats, setStats] = useState<Stats>({ emaily_neprectene: 0, zasoby_kriticke: 0, granty_nove: 0, ukoly_aktivni: 0 })
  const [activeTab, setActiveTab] = useState<'prehled' | 'granty' | 'emaily' | 'zasoby' | 'kalendar' | 'zvirata' | 'ukoly'>('prehled')

  useEffect(() => {
    fetch('/api/seed').then(() => setSeeded(true))
  }, [])

  useEffect(() => {
    if (!seeded) return
    Promise.all([
      fetch('/api/emaily').then(r => r.json()),
      fetch('/api/zasoby').then(r => r.json()),
      fetch('/api/granty').then(r => r.json()),
      fetch('/api/ukoly').then(r => r.json()),
    ]).then(([emaily, zasoby, granty, ukoly]) => {
      setStats({
        emaily_neprectene: Array.isArray(emaily) ? emaily.filter((e: { precten: number }) => !e.precten).length : 0,
        zasoby_kriticke: Array.isArray(zasoby) ? zasoby.filter((z: { status: string }) => z.status === 'kritický' || z.status === 'dochází').length : 0,
        granty_nove: Array.isArray(granty) ? granty.filter((g: { status: string }) => g.status === 'nový').length : 0,
        ukoly_aktivni: Array.isArray(ukoly) ? ukoly.length : 0,
      })
    })
  }, [seeded, activeTab])

  const tabs = [
    { id: 'prehled', label: 'Přehled' },
    { id: 'granty', label: 'Granty', badge: stats.granty_nove },
    { id: 'emaily', label: 'E-maily', badge: stats.emaily_neprectene },
    { id: 'zasoby', label: 'Zásoby', badge: stats.zasoby_kriticke, badgeColor: 'bg-[#ff8800]' },
    { id: 'kalendar', label: 'Kalendář' },
    { id: 'zvirata', label: 'Zvířata' },
    { id: 'ukoly', label: 'Úkoly', badge: stats.ukoly_aktivni },
  ] as const

  return (
    <div className="min-h-screen" style={{ background: '#0a0e1a' }}>
      {/* Header */}
      <header className="border-b border-[#1e2d45] px-4 py-3 flex items-center justify-between sticky top-0 z-50" style={{ background: '#0a0e1a' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00ff88] pulse-dot" />
            <Zap className="w-4 h-4 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wider">LUČNÍ JARVIS</h1>
            <p className="text-xs text-gray-600">Nech mě růst, z.s.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {stats.zasoby_kriticke > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#ff8800]">
              <AlertTriangle className="w-3 h-3" />
              <span>{stats.zasoby_kriticke} zásoba</span>
            </div>
          )}
          <Clock />
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="border-b border-[#1e2d45] px-4 flex gap-1 overflow-x-auto" style={{ background: '#0d1526' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#00d4ff] text-[#00d4ff]'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {'badge' in tab && tab.badge > 0 && (
              <span className={`text-xs text-white px-1.5 py-0.5 rounded-full font-bold ${'badgeColor' in tab && tab.badgeColor ? tab.badgeColor : 'bg-[#ff3355]'}`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="p-4 max-w-7xl mx-auto">
        {activeTab === 'prehled' && (
          <div className="flex flex-col gap-4">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                title="Nové granty"
                value={stats.granty_nove}
                subtitle="k prozkoumání"
                color="accent"
                icon={<TrendingUp className="w-4 h-4" />}
              />
              <StatCard
                title="Nepřečtené e-maily"
                value={stats.emaily_neprectene}
                subtitle="čekají na odpověď"
                color={stats.emaily_neprectene > 2 ? 'red' : 'orange'}
                icon={<Activity className="w-4 h-4" />}
              />
              <StatCard
                title="Zásoby – alarm"
                value={stats.zasoby_kriticke}
                subtitle="kritické / dochází"
                color={stats.zasoby_kriticke > 0 ? 'orange' : 'green'}
              />
              <StatCard
                title="Aktivní úkoly"
                value={stats.ukoly_aktivni}
                subtitle="nesplněno"
                color="accent"
                icon={<Users className="w-4 h-4" />}
              />
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <EmailyPanel />
              <GrantyPanel />
              <ZasobyPanel />
              <UkolyPanel />
              <ZvirataPanel />
              <KalendarPanel />

              {/* Info panel */}
              <div className="card p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#00d4ff]" />
                  <h2 className="text-sm font-semibold text-[#00d4ff] uppercase tracking-wider">Organizace</h2>
                </div>
                <div className="flex flex-col gap-2 text-xs">
                  {[
                    { k: 'Název', v: 'Nech mě růst, z.s.' },
                    { k: 'IČO', v: '19602529' },
                    { k: 'Sídlo', v: 'Praha – Horní Počernice' },
                    { k: 'Provoz', v: 'Nová Ves u Leštiny' },
                    { k: 'Předseda', v: 'Tomáš Bahník' },
                    { k: 'Místopředseda', v: 'Kateřina Valešová' },
                    { k: 'Zvířata', v: '~70 kusů' },
                    { k: 'Email', v: 'info@nechmerust.org' },
                  ].map(r => (
                    <div key={r.k} className="flex gap-2">
                      <span className="text-gray-600 w-28 shrink-0">{r.k}:</span>
                      <span className="text-gray-300">{r.v}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#1e2d45] pt-2 flex flex-col gap-1">
                  <span className="text-xs text-gray-600 uppercase tracking-wider">Fundraising</span>
                  <div className="flex flex-wrap gap-1">
                    {['Darujme.cz', 'Fio banka', 'Kryptoměny', 'Virtuální adopce'].map(f => (
                      <span key={f} className="text-xs px-2 py-0.5 rounded border border-[#1e2d45] text-gray-500">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'granty' && <div className="max-w-2xl"><GrantyPanel /></div>}
        {activeTab === 'emaily' && <div className="max-w-2xl"><EmailyPanel /></div>}
        {activeTab === 'zasoby' && <div className="max-w-2xl"><ZasobyPanel /></div>}
        {activeTab === 'kalendar' && <div className="max-w-2xl"><KalendarPanel /></div>}
        {activeTab === 'zvirata' && <div className="max-w-2xl"><ZvirataPanel /></div>}
        {activeTab === 'ukoly' && <div className="max-w-2xl"><UkolyPanel /></div>}
      </main>
    </div>
  )
}

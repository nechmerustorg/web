'use client'

const prioritaMap: Record<string, string> = {
  'urgentní': 'badge-urgentni',
  'vysoká': 'badge-vysoka',
  'normální': 'badge-normalni',
  'nízká': 'badge-nizka',
  'ok': 'badge-ok',
  'dochází': 'badge-docházi',
  'kritický': 'badge-kritický',
  'nový': 'badge-normalni',
  'v přípravě': 'badge-vysoka',
  'sledovaný': 'badge-nizka',
  'podán': 'badge-ok',
  'zamítnut': 'badge-kritický',
}

export default function Badge({ label }: { label: string }) {
  const cls = prioritaMap[label] || 'badge-normalni'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}

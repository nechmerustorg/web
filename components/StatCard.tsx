'use client'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: 'accent' | 'green' | 'orange' | 'red'
  icon?: React.ReactNode
}

const colorMap = {
  accent: 'text-[#00d4ff]',
  green: 'text-[#00ff88]',
  orange: 'text-[#ff8800]',
  red: 'text-[#ff3355]',
}

export default function StatCard({ title, value, subtitle, color = 'accent', icon }: StatCardProps) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{title}</span>
        {icon && <span className="text-gray-600">{icon}</span>}
      </div>
      <span className={`text-2xl font-semibold ${colorMap[color]}`}>{value}</span>
      {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
    </div>
  )
}

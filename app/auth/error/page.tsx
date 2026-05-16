'use client'

import { signIn } from 'next-auth/react'
import { ShieldAlert } from 'lucide-react'

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
      <div className="card p-8 flex flex-col items-center gap-4 w-full max-w-sm text-center">
        <ShieldAlert className="w-10 h-10 text-[#ff3355]" />
        <h2 className="text-sm font-semibold text-white">Přístup zamítnut</h2>
        <p className="text-xs text-gray-500">
          Tento Google účet nemá přístup k Lučnímu Jarvisovi.<br />
          Kontaktuj správce pro přidání oprávnění.
        </p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="text-xs text-[#00d4ff] hover:underline mt-2"
        >
          Zkusit jiný účet
        </button>
      </div>
    </div>
  )
}

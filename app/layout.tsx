import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Luční Jarvis | Nech mě růst',
  description: 'Autonomní AI systém pro řízení organizace Nech mě růst',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className="antialiased">{children}</body>
    </html>
  )
}

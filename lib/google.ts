import { google } from 'googleapis'

function getOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return client
}

export function getGmail() {
  return google.gmail({ version: 'v1', auth: getOAuth2Client() })
}

export function getCalendar() {
  return google.calendar({ version: 'v3', auth: getOAuth2Client() })
}

export function klasifikujPrioritu(od: string, predmet: string): string {
  const o = od.toLowerCase()
  const p = predmet.toLowerCase()
  if (p.includes('urgentní') || p.includes('urgent') || p.includes('okamžitě') || p.includes('kritick')) return 'urgentní'
  if (o.includes('darujme') || o.includes('nadace') || p.includes('grant') || p.includes('dotace') ||
      p.includes('adopce') || p.includes('dar') || p.includes('veterinář') || p.includes('sponzor')) return 'vysoká'
  if (o.includes('noreply@accounts.google') || o.includes('newsletter') || o.includes('usetreno') ||
      o.includes('superzoo') || o.includes('dpd') || o.includes('slevov')) return 'nízká'
  return 'normální'
}

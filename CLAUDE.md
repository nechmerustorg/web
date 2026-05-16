# Luční Jarvis — CLAUDE.md

Automatizační dashboard pro neziskovou organizaci **Nech mě růst, z.s.** (záchranný azyl pro zvířata, ~70 kusů).

## Stack

- **Framework**: Next.js 14 App Router + TypeScript
- **Styling**: Tailwind CSS, vlastní dark "Jarvis" téma (#0a0e1a, #00d4ff, #00ff88)
- **DB**: Vercel Postgres (Neon) — `@vercel/postgres`
- **Auth**: NextAuth.js v4 s Google OAuth (pouze schválené e-maily)
- **Integrace**: Gmail API + Google Calendar API přes googleapis

## Vercel projekt

- **URL**: https://lucnizan.vercel.app
- **Tým**: `team_pLIGE2SRwHC61NARAkLufsc6`
- **Projekt ID**: `prj_DAu2Nzt08PA23jnB74bJq50dU8Uh`
- **GitHub repo**: `nechmerustorg/web` (branch `main` → production)

## Env proměnné (Vercel)

| Proměnná | Popis |
|---|---|
| `POSTGRES_URL` | Neon PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | OAuth client pro Gmail + Calendar + NextAuth |
| `GOOGLE_CLIENT_SECRET` | OAuth secret |
| `GOOGLE_REFRESH_TOKEN` | Refresh token pro nechmerust@gmail.com |
| `NEXTAUTH_URL` | `https://lucnizan.vercel.app` |
| `NEXTAUTH_SECRET` | Náhodný tajný klíč pro JWT |
| `OLLAMA_API_KEY` | API klíč pro Ollama-compatible AI service |
| `OLLAMA_BASE_URL` | Base URL AI API (OpenAI-compatible endpoint) |
| `OLLAMA_MODEL` | Model k použití (default: `qwen2.5:72b`) |
| `CRON_SECRET` | Token pro autorizaci `/api/cron/granty-agent` |

## Databázové tabulky

- `granty` — grantové příležitosti (reálné české granty)
- `prehled_grantu` — denní AI přehledy grantů (datum UNIQUE)
- `emaily` — Gmail zprávy (gmail_id UNIQUE, NULL = demo data)
- `kalendar` — Google Calendar události (google_id UNIQUE, NULL = demo data)
- `zasoby` — zásoby krmiva a materiálu
- `zvirata` — evidence zvířat
- `ukoly` — úkoly a připomínky

## API routes (všechny force-dynamic)

| Route | Popis |
|---|---|
| `GET /api/seed` | Inicializace DB + demo data (pokud prázdná) |
| `GET /api/emaily` | Seznam e-mailů dle priority |
| `GET /api/granty` | Seznam grantů (reálné + AI hodnocení) |
| `POST /api/granty` | Vytvoření nového grantu |
| `PATCH /api/granty` | Aktualizace statusu grantu |
| `GET /api/granty/prehled` | Nejnovější denní AI přehled |
| `GET /api/granty/[id]/zadost` | Načtení vygenerované žádosti |
| `POST /api/granty/[id]/zadost` | AI generování grantové žádosti |
| `GET /api/cron/granty-agent` | Denní cron agent (req. Authorization: Bearer CRON_SECRET) |
| `GET /api/zasoby` | Zásoby seřazené dle stavu |
| `GET /api/zvirata` | Zvířata + statistiky dle druhu |
| `GET /api/ukoly` | Nesplněné úkoly |
| `GET /api/kalendar` | Nadcházející události |
| `GET /api/sync/gmail` | Sync posledních 30 e-mailů z Gmailu |
| `GET /api/sync/calendar` | Sync událostí z primárního kalendáře (3 měsíce) |
| `GET /api/auth/[...nextauth]` | NextAuth handler |

## Autentizace

Povolené e-maily jsou v `lib/auth.ts` → `POVOLENE_EMAILY`. Přidání nového člena:
1. Edituj `lib/auth.ts`
2. Pushni na main → automatický redeploy

Google Cloud Console OAuth callback URI: `https://lucnizan.vercel.app/api/auth/callback/google`

## Klíčové lekce z implementace

- **force-dynamic**: Všechny API routes musí mít `export const dynamic = 'force-dynamic'`, jinak je Vercel staticky cachuje při buildu.
- **googleapis bundling**: V `next.config.js` musí být `serverComponentsExternalPackages: ['googleapis']`.
- **Migrace schématu**: `initDb()` v `lib/db.ts` používá `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` pro migrace existujících tabulek.
- **Demo data**: Seed data mají `gmail_id = NULL` / `google_id = NULL`. Sync routes je mažou po úspěšné synchronizaci reálných dat.

## Časté operace

```bash
# Spustit sync (manuálně)
curl https://lucnizan.vercel.app/api/sync/gmail
curl https://lucnizan.vercel.app/api/sync/calendar
```

Nebo použij `/sync` slash command.

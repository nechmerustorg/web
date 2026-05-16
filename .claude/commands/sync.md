# /sync — Synchronizace dat z Google

Spusť synchronizaci e-mailů a kalendáře přes Vercel MCP a reportuj výsledky.

## Postup

1. Použij `mcp__vercel__web_fetch_vercel_url` pro oba endpoints paralelně:
   - `https://lucnizan.vercel.app/api/sync/gmail`
   - `https://lucnizan.vercel.app/api/sync/calendar`

2. Zkontroluj výsledky:
   - `x-vercel-cache: MISS` = skutečné volání (správně)
   - `x-vercel-cache: HIT/PRERENDER` = cachovaná odpověď (problém — routes nejsou force-dynamic)
   - Status 200 s `ok: true` = úspěch
   - Status 503 = Google API není nakonfigurováno (chybí env vars)
   - Status 500 = chyba (zkontroluj `error` pole v odpovědi)

3. Reportuj česky: kolik e-mailů a událostí bylo synchronizováno/přeskočeno.

## Časté chyby

- `column "gmail_id" does not exist` → spusť `/api/seed` pro migraci (initDb přidá sloupec)
- `invalid_grant` → refresh token expiroval, je potřeba nový (GOOGLE_REFRESH_TOKEN v Vercel)
- `unauthorized_client` → aplikace není ověřena nebo e-mail není v test users

# /granty-agent — Denní grantový agent

Spusť denního AI agenta pro granty nebo zkontroluj výsledky.

## Postup

1. Spusť agenta manuálně přes `mcp__vercel__web_fetch_vercel_url`:
   - URL: `https://lucnizan.vercel.app/api/cron/granty-agent`
   - Přidej hlavičku `Authorization: Bearer {CRON_SECRET}`

2. Zkontroluj odpověď:
   - `ok: true` = agent úspěšně vygeneroval přehled
   - `error` = zkontroluj OLLAMA_BASE_URL, OLLAMA_API_KEY v Vercel env vars

3. Přehled je uložen v tabulce `prehled_grantu` a zobrazí se v dashboardu v sekci Granty.

## Ruční generování žádosti

Pro konkrétní grant (ID z databáze):
```
POST https://lucnizan.vercel.app/api/granty/{id}/zadost
```

## Cron schedule

Agent běží automaticky každý den v 6:00 UTC (= 8:00 CEST letní čas).
Konfigurace v `vercel.json` → `crons`.

## Env proměnné (Vercel)

| Proměnná | Popis |
|---|---|
| `OLLAMA_API_KEY` | API klíč pro Ollama-compatible service |
| `OLLAMA_BASE_URL` | Base URL (např. `https://api.example.com`) |
| `OLLAMA_MODEL` | Model (default: `qwen2.5:72b`) |
| `CRON_SECRET` | Token pro autorizaci cron endpointu |

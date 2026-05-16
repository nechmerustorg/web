# /deploy-check — Kontrola stavu Vercel deploye

Zkontroluj stav posledního deploye projektu lucnizan a počkej na READY.

## Postup

1. Použij `mcp__vercel__list_deployments` s:
   - `projectId: prj_DAu2Nzt08PA23jnB74bJq50dU8Uh`
   - `teamId: team_pLIGE2SRwHC61NARAkLufsc6`

2. Najdi nejnovější deploy (první v seznamu).

3. Pokud je stav `BUILDING`: opakuj kontrolu přes `mcp__vercel__get_deployment` dokud není `READY` nebo `ERROR`.

4. Pokud je `ERROR`: načti build logy přes `mcp__vercel__get_deployment_build_logs` a reportuj chybu.

5. Pokud je `READY`: reportuj úspěch a URL deploye.

## Po úspěšném deployi

Pokud byl deploy triggeren kvůli opravě sync funkcionality, automaticky spusť `/sync`.

# /add-member — Přidání člena týmu

Přidej nový e-mail do seznamu povolených přístupů do dashboardu.

## Postup

1. Zeptej se uživatele na e-mailovou adresu nového člena (pokud není v příkazu).

2. Edituj `lib/auth.ts` — přidej e-mail do pole `POVOLENE_EMAILY`.

3. Commitni změnu:
   ```
   git add lib/auth.ts
   git commit -m "Přidán přístup pro <email>"
   ```

4. Pushni na main přes `mcp__github__push_files` (nebo `git push`).

5. Počkej na dokončení deploye (`/deploy-check`) a potvrď úspěch.

## Soubor k editaci

`lib/auth.ts` — pole `POVOLENE_EMAILY` na začátku souboru.

## Poznámka

Nový člen se musí přihlásit přes Google účet se stejnou e-mailovou adresou na https://lucnizan.vercel.app.

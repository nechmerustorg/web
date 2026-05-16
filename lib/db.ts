import { sql } from '@vercel/postgres'

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS granty (
      id SERIAL PRIMARY KEY,
      nazev TEXT NOT NULL,
      poskytovatel TEXT NOT NULL,
      castka TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'nový',
      popis TEXT,
      url TEXT,
      priorita TEXT DEFAULT 'střední',
      vytvoreno TIMESTAMP DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS emaily (
      id SERIAL PRIMARY KEY,
      gmail_id TEXT UNIQUE,
      od TEXT NOT NULL,
      predmet TEXT NOT NULL,
      priorita TEXT DEFAULT 'normální',
      obsah TEXT,
      precten INTEGER DEFAULT 0,
      odpovezeno INTEGER DEFAULT 0,
      datum TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI'),
      navrh_odpovedi TEXT
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS kalendar (
      id SERIAL PRIMARY KEY,
      google_id TEXT UNIQUE,
      nazev TEXT NOT NULL,
      zacatek TEXT,
      konec TEXT,
      misto TEXT,
      popis TEXT,
      aktualizovano TIMESTAMP DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS zasoby (
      id SERIAL PRIMARY KEY,
      nazev TEXT NOT NULL UNIQUE,
      mnozstvi REAL DEFAULT 0,
      jednotka TEXT DEFAULT 'kg',
      minimum REAL DEFAULT 10,
      status TEXT DEFAULT 'ok',
      aktualizovano TIMESTAMP DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS zvirata (
      id SERIAL PRIMARY KEY,
      jmeno TEXT NOT NULL,
      druh TEXT NOT NULL,
      status TEXT DEFAULT 'v azylu',
      popis TEXT,
      foto_url TEXT,
      datum_prijeti TEXT,
      sponzor TEXT
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS ukoly (
      id SERIAL PRIMARY KEY,
      nazev TEXT NOT NULL,
      popis TEXT,
      priorita TEXT DEFAULT 'normální',
      splneno INTEGER DEFAULT 0,
      zodpovedna_osoba TEXT,
      datum_splneni TEXT,
      vytvoreno TIMESTAMP DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS prehled_grantu (
      id SERIAL PRIMARY KEY,
      datum DATE NOT NULL UNIQUE,
      obsah TEXT NOT NULL,
      vytvoreno TIMESTAMP DEFAULT NOW()
    )
  `
  // Migrace: přidej gmail_id pokud chybí (existující tabulky bez tohoto sloupce)
  await sql`ALTER TABLE emaily ADD COLUMN IF NOT EXISTS gmail_id TEXT`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS emaily_gmail_id_unique ON emaily(gmail_id)`
  // Migrace: nové sloupce pro granty
  await sql`ALTER TABLE granty ADD COLUMN IF NOT EXISTS vyzva TEXT`
  await sql`ALTER TABLE granty ADD COLUMN IF NOT EXISTS pozadavky TEXT`
  await sql`ALTER TABLE granty ADD COLUMN IF NOT EXISTS ai_hodnoceni TEXT`
  await sql`ALTER TABLE granty ADD COLUMN IF NOT EXISTS zadost_text TEXT`
  await sql`ALTER TABLE granty ADD COLUMN IF NOT EXISTS zdroj TEXT DEFAULT 'manual'`
  await sql`ALTER TABLE granty ADD COLUMN IF NOT EXISTS aktualizovano TIMESTAMP`
}

export async function seedDb() {
  const { rowCount: gc } = await sql`SELECT 1 FROM granty LIMIT 1`
  if (!gc) {
    await sql`INSERT INTO granty (nazev, poskytovatel, castka, deadline, status, popis, priorita, url, vyzva, pozadavky, ai_hodnoceni, zdroj) VALUES
      (
        'Podpora regionu – nadační příspěvek 2026',
        'Nadace ČEZ',
        '50 000 – 300 000 Kč',
        '2026-03-31',
        'nový',
        'Nadace ČEZ každoročně vypisuje výzvu Podpora regionu, která podporuje projekty zaměřené na péči o přírodu, zvířata a komunitní aktivity v regionech, kde působí ČEZ.',
        'vysoká',
        'https://www.nadacecez.cz/cs/granty/podpora-regionu.html',
        'Projekty zaměřené na péči o přírodu a krajinu, záchranu a ochranu zvířat, komunitní aktivity a ekologickou výchovu v regionech. Podporovány jsou provozní i investiční náklady.',
        'Spolek nebo obecně prospěšná společnost se sídlem nebo działalnością v ČR. Projekt musí probíhat v regionu, kde ČEZ provozuje svou činnost. Požadována závěrečná zpráva.',
        'VHODNÉ — Azyl pro zvířata v Kraji Vysočina přesně odpovídá zaměření výzvy. Doporučujeme žádat o provozní náklady azylu a veterinární péči.',
        'seed'
      ),
      (
        'Fond pro neziskové organizace – program Komunity',
        'Nadace Via',
        '20 000 – 100 000 Kč',
        '2026-04-30',
        'nový',
        'Nadace Via podporuje lokální komunity a neziskové organizace, které aktivně zapojují dobrovolníky a budují komunitu v místě svého působení.',
        'vysoká',
        'https://www.nadacevia.cz/granty',
        'Podpora komunitních projektů s aktivním zapojením veřejnosti a dobrovolníků. Financovány mohou být aktivity, vzdělávání, osvěta i provozní náklady.',
        'Registrovaný spolek nebo NNO působící v ČR. Projekt musí mít jasný komunitní dopad a zapojovat místní obyvatele nebo dobrovolníky.',
        'VHODNÉ — Azyl aktivně zapojuje dobrovolníky a pořádá osvětové akce. Silný příběh pro komunitní grant.',
        'seed'
      ),
      (
        'Dotace na welfare hospodářských zvířat',
        'Ministerstvo zemědělství ČR',
        '20 000 – 150 000 Kč',
        '2026-06-30',
        'nový',
        'Ministerstvo zemědělství vypisuje dotační tituly zaměřené na zlepšení podmínek chovu hospodářských zvířat a na projekty zvyšující povědomí o welfare zvířat.',
        'vysoká',
        'https://eagri.cz/public/web/mze/dotace/',
        'Projekty zaměřené na zlepšení podmínek chovu, veterinární péči, rehabilitaci zachráněných zvířat a osvětu o welfare. Možné i pro záchranné stanice.',
        'Právnická osoba s prokazatelnou činností v oblasti péče o zvířata. Nutné vedení evidence zvířat, spolupráce se Státní veterinární správou.',
        'VHODNÉ — Organizace přímo spolupracuje se SVS a pečuje o hospodářská zvířata. Doporučujeme zaměřit žádost na vybavení azylu a veterinární péči.',
        'seed'
      ),
      (
        'Dotace pro nestátní neziskové organizace',
        'Ministerstvo vnitra ČR',
        '50 000 – 500 000 Kč',
        '2026-01-31',
        'sledovaný',
        'MV ČR každoročně vyhlašuje dotační řízení pro NNO v oblasti prevence kriminality, dobrovolnictví a veřejně prospěšné činnosti.',
        'střední',
        'https://www.mvcr.cz/clanek/dotace-pro-nestani-neziskove-organizace.aspx',
        'Podpora dobrovolnictví, veřejně prospěšné činnosti, osvěty a vzdělávání. Možné i pro organizace zaměřené na etické zacházení se zvířaty.',
        'Registrovaný spolek nebo NNO v ČR. Žádost se podává elektronicky přes dotační portál MV. Nutná zpráva o hospodaření.',
        'ČÁSTEČNĚ VHODNÉ — Organizace by mohla žádat v oblasti dobrovolnictví a osvěty. Přímá péče o zvířata není primárním zaměřením výzvy.',
        'seed'
      ),
      (
        'Program na podporu NNO Kraje Vysočina',
        'Kraj Vysočina',
        '20 000 – 200 000 Kč',
        '2026-02-28',
        'nový',
        'Kraj Vysočina každoročně vyhlašuje grantový program na podporu nestátních neziskových organizací působících na území kraje v oblastech péče o přírodu, vzdělávání a sociálních služeb.',
        'vysoká',
        'https://www.kr-vysocina.cz/dotace-a-granty/ds-263251',
        'Podpora organizací přispívajících k rozvoji Kraje Vysočina — péče o přírodu, vzdělávání, dobrovolnictví, kulturní a komunitní aktivity.',
        'Sídlo nebo prokazatelná činnost na území Kraje Vysočina. Registrovaný spolek nebo NNO. Spolufinancování projektu alespoň 10 %.',
        'VHODNÉ — Organizace přímo působí v Kraji Vysočina. Krajský grant je jednou z nejdostupnějších možností financování. Priorita: podat žádost.',
        'seed'
      ),
      (
        'Zelená komunita – ekologické projekty',
        'Nadace Partnerství',
        '30 000 – 150 000 Kč',
        '2026-05-31',
        'nový',
        'Nadace Partnerství podporuje ekologické projekty zaměřené na ochranu přírody, krajiny, biodiverzity a ekologické zemědělství. Součástí jsou i projekty permakulturních zahrad a lesů.',
        'střední',
        'https://www.nadacepartnerstvi.cz/granty',
        'Projekty ochrany přírody a krajiny, permakultura, ekologické zemědělství, biodiverzita, osvěta. Možné i projekty kombinující ochranu zvířat s péčí o krajinu.',
        'Registrovaná NNO nebo spolek. Projekt musí mít prokazatelný ekologický dopad. Preferovány jsou inovativní přístupy a spolupráce s místními komunitami.',
        'VHODNÉ — Organizace vytváří permakulturní zahrady a pečuje o zemědělské pozemky. Silný projekt péče o krajinu v kombinaci s azylem pro zvířata.',
        'seed'
      ),
      (
        'Lidl – Srdce na dlani',
        'Nadace Lidl ČR',
        'do 30 000 Kč',
        '2026-03-15',
        'nový',
        'Nadace Lidl každoročně podporuje malé neziskové organizace a projekty v oblasti pomoci lidem, zvířatům a přírodě. Rychlý grant s jednoduchým procesem žádosti.',
        'střední',
        'https://www.lidl.cz/o-lidlu/nadace-lidl',
        'Podpora projektů zaměřených na pomoc lidem v nouzi, zvířatům a ochraně přírody. Malé granty s rychlým vyřízením vhodné pro konkrétní nákupy vybavení.',
        'Registrovaná NNO. Jednoduchý formulář, bez nutnosti spolufinancování. Projekt musí být realizován v ČR.',
        'VHODNÉ — Vhodné pro financování konkrétního vybavení azylu (klece, veterinární pomůcky, krmivo). Nízká administrativní náročnost.',
        'seed'
      ),
      (
        'Nadační fond Albert – vzdělávání a příroda',
        'Nadační fond Albert',
        '20 000 – 100 000 Kč',
        '2026-04-15',
        'nový',
        'Nadační fond Albert podporuje projekty v oblasti environmentálního vzdělávání, péče o životní prostředí a ochrany přírody pro školy, spolky a NNO.',
        'nízká',
        'https://www.albert.cz/nadacni-fond',
        'Projekty environmentálního vzdělávání pro děti a mládež, ochrana přírody, ekologické aktivity. Možné projekty kombinující péči o zvířata s environmentální výchovou.',
        'Registrovaná NNO nebo škola. Projekt musí mít vzdělávací nebo osvětový charakter s environmentálním zaměřením.',
        'ČÁSTEČNĚ VHODNÉ — Projekt by mohl být zaměřen na vzdělávací programy azylu pro školy a veřejnost. Samotný provoz azylu bez vzdělávací složky nestačí.',
        'seed'
      ),
      (
        'Nadace Veolia – životní prostředí a komunita',
        'Veolia CZ',
        '50 000 – 250 000 Kč',
        '2026-06-15',
        'sledovaný',
        'Nadace Veolia podporuje projekty zaměřené na ochranu životního prostředí, udržitelný rozvoj a komunitní aktivity v místech, kde Veolia působí v ČR.',
        'nízká',
        'https://www.veolia.cz/cs/nadace-veolia',
        'Ochrana životního prostředí, biodiverzita, udržitelné hospodaření s vodou a půdou, komunitní projekty. Možné i projekty péče o krajinu a zvířata.',
        'Registrovaná NNO. Projekt musí být realizován v regionu, kde Veolia provozuje svou infrastrukturu. Nutné ověřit pokrytí Kraje Vysočina.',
        'ČÁSTEČNĚ VHODNÉ — Závisí na přítomnosti Veolia v Kraji Vysočina. Doporučujeme ověřit geografické pokrytí před podáním žádosti.',
        'seed'
      )
    `
  }

  const { rowCount: ec } = await sql`SELECT 1 FROM emaily LIMIT 1`
  if (!ec) {
    await sql`INSERT INTO emaily (od, predmet, priorita, obsah, datum, navrh_odpovedi) VALUES
      ('veterina@praxe.cz', 'URGENTNÍ: Zdravotní kontrola – koza Bělka', 'urgentní', 'Dobrý den, je nutné co nejdříve provést veterinární prohlídku kozy Bělky. Vykazuje příznaky respiračního onemocnění.', '2025-05-16 08:15', 'Dobrý den, děkujeme za upozornění. Termín potvrdíme do dnešního odpoledne.'),
      ('darce@gmail.com', 'Zájem o virtuální adopci – ovce', 'vysoká', 'Dobrý den, rád bych adoptoval jednu z vašich ovcí. Jak probíhá virtuální adopce?', '2025-05-16 09:30', 'Dobrý den, velmi nás těší váš zájem! Virtuální adopce obnáší měsíční příspěvek 300 Kč...'),
      ('info@nadacecez.cz', 'Grant – výzva k podání žádosti 2025', 'vysoká', 'Vážení, připomínáme otevřenou výzvu k podání žádostí o grant. Deadline je 30. 6. 2025.', '2025-05-15 14:00', NULL),
      ('dobrovolnik@seznam.cz', 'Zájem o dobrovolnictví', 'normální', 'Zdravím, mám zájem přijít pomoci na ranč. Jsem k dispozici každý víkend.', '2025-05-15 11:20', 'Zdravím, skvělé! Přijďte kdykoliv v sobotu od 9:00...'),
      ('noviny@region.cz', 'Rozhovor pro regionální noviny', 'normální', 'Dobrý den, rádi bychom vás představili v naší rubrice Lidé regionu. Máte zájem?', '2025-05-14 16:45', NULL),
      ('krmivo@agro.cz', 'Potvrzení objednávky sena', 'nízká', 'Potvrzujeme přijetí objednávky 500 kg sena. Dodání do 3 pracovních dnů.', '2025-05-14 10:00', NULL)
    `
  }

  const { rowCount: zc } = await sql`SELECT 1 FROM zasoby LIMIT 1`
  if (!zc) {
    await sql`INSERT INTO zasoby (nazev, mnozstvi, jednotka, minimum, status) VALUES
      ('Seno', 45, 'kg', 100, 'kritický'),
      ('Pšenice', 120, 'kg', 50, 'ok'),
      ('Oves', 30, 'kg', 40, 'dochází'),
      ('Těstoviny', 25, 'kg', 20, 'ok'),
      ('Mrkev', 15, 'kg', 10, 'ok'),
      ('Jablka', 8, 'kg', 15, 'dochází')
    `
  }

  const { rowCount: zvc } = await sql`SELECT 1 FROM zvirata LIMIT 1`
  if (!zvc) {
    await sql`INSERT INTO zvirata (jmeno, druh, status, popis, datum_prijeti) VALUES
      ('Bělka', 'koza', 'v azylu', 'Bílá koza nalezená u silnice', '2024-03-15'),
      ('Ferda', 'prase', 'v azylu', 'Záchrana z farmy', '2024-01-20'),
      ('Lucie', 'ovce', 'adoptována', 'Virtuálně adoptována rodinou Novák', '2023-11-10'),
      ('Max', 'pes', 'v azylu', 'Nalezen bez majitele', '2024-05-01'),
      ('Kvítko', 'kůň', 'v azylu', 'Záchrana z týrání', '2023-09-05')
    `
  }

  const { rowCount: uc } = await sql`SELECT 1 FROM ukoly LIMIT 1`
  if (!uc) {
    await sql`INSERT INTO ukoly (nazev, priorita, zodpovedna_osoba, datum_splneni) VALUES
      ('Objednat seno – zásoby kritické', 'urgentní', 'Tomáš', '2025-05-17'),
      ('Veterinář pro Bělku', 'urgentní', 'Kateřina', '2025-05-17'),
      ('Odpovědět na grant ČEZ', 'vysoká', 'Tomáš', '2025-05-20'),
      ('Zveřejnit příspěvek na Instagram', 'normální', 'Kateřina', '2025-05-18'),
      ('Aktualizovat zásoby po dovozu', 'normální', 'Tomáš', '2025-05-19')
    `
  }
}

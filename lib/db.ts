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
}

export async function seedDb() {
  const { rowCount: gc } = await sql`SELECT 1 FROM granty LIMIT 1`
  if (!gc) {
    await sql`INSERT INTO granty (nazev, poskytovatel, castka, deadline, status, popis, priorita) VALUES
      ('Podpora azylu pro zvířata 2025', 'Nadace ČEZ', '150 000 Kč', '2025-06-30', 'nový', 'Grant na provozní náklady azylu, krmivo a veterinární péči.', 'vysoká'),
      ('Komunitní projekty – venkov', 'Ministerstvo zemědělství', '80 000 Kč', '2025-07-15', 'nový', 'Podpora komunitních projektů na venkově se zaměřením na soběstačnost.', 'vysoká'),
      ('Ekologické zemědělství', 'Kraj Vysočina', '50 000 Kč', '2025-08-01', 'v přípravě', 'Dotace na ekologické zemědělské postupy a chov zvířat.', 'střední'),
      ('Dobrovolnictví a komunita', 'Nadace Via', '30 000 Kč', '2025-09-01', 'nový', 'Podpora dobrovolnických aktivit a komunitního vzdělávání.', 'nízká'),
      ('Ochrana zvířat – EU LIFE', 'EU fond LIFE', '200 000 Kč', '2025-10-31', 'sledovaný', 'Evropský fond na ochranu zvířat a ekologické sanctuary projekty.', 'vysoká')
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

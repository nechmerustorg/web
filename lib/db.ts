import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'data', 'jarvis.db')

function getDb() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  return db
}

export function initDb() {
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS granty (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nazev TEXT NOT NULL,
      poskytovatel TEXT NOT NULL,
      castka TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'nový',
      popis TEXT,
      url TEXT,
      priorita TEXT DEFAULT 'střední',
      vytvoreno TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS emaily (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      od TEXT NOT NULL,
      predmet TEXT NOT NULL,
      priorita TEXT DEFAULT 'normální',
      obsah TEXT,
      precten INTEGER DEFAULT 0,
      odpovezeno INTEGER DEFAULT 0,
      datum TEXT DEFAULT (datetime('now')),
      navrh_odpovedi TEXT
    );

    CREATE TABLE IF NOT EXISTS zasoby (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nazev TEXT NOT NULL UNIQUE,
      mnozstvi REAL DEFAULT 0,
      jednotka TEXT DEFAULT 'kg',
      minimum REAL DEFAULT 10,
      status TEXT DEFAULT 'ok',
      aktualizovano TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS zvirata (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jmeno TEXT NOT NULL,
      druh TEXT NOT NULL,
      status TEXT DEFAULT 'v azylu',
      popis TEXT,
      foto_url TEXT,
      datum_prijeti TEXT,
      sponzor TEXT
    );

    CREATE TABLE IF NOT EXISTS ukoly (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nazev TEXT NOT NULL,
      popis TEXT,
      priorita TEXT DEFAULT 'normální',
      splneno INTEGER DEFAULT 0,
      zodpovedna_osoba TEXT,
      datum_splneni TEXT,
      vytvoreno TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS logy (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      modul TEXT NOT NULL,
      akce TEXT NOT NULL,
      detail TEXT,
      cas TEXT DEFAULT (datetime('now'))
    );
  `)

  db.close()
}

export function seedDb() {
  const db = getDb()

  const grantCount = (db.prepare('SELECT COUNT(*) as c FROM granty').get() as { c: number }).c
  if (grantCount === 0) {
    const insertGrant = db.prepare(`
      INSERT INTO granty (nazev, poskytovatel, castka, deadline, status, popis, priorita)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    insertGrant.run('Podpora azylu pro zvířata 2025', 'Nadace ČEZ', '150 000 Kč', '2025-06-30', 'nový',
      'Grant na provozní náklady azylu, krmivo a veterinární péči.', 'vysoká')
    insertGrant.run('Komunitní projekty – venkov', 'Ministerstvo zemědělství', '80 000 Kč', '2025-07-15', 'nový',
      'Podpora komunitních projektů na venkově se zaměřením na soběstačnost.', 'vysoká')
    insertGrant.run('Ekologické zemědělství', 'Kraj Vysočina', '50 000 Kč', '2025-08-01', 'v přípravě',
      'Dotace na ekologické zemědělské postupy a chov zvířat.', 'střední')
    insertGrant.run('Dobrovolnictví a komunita', 'Nadace Via', '30 000 Kč', '2025-09-01', 'nový',
      'Podpora dobrovolnických aktivit a komunitního vzdělávání.', 'nízká')
    insertGrant.run('Ochrana zvířat – SR', 'EU fond LIFE', '200 000 Kč', '2025-10-31', 'sledovaný',
      'Evropský fond na ochranu zvířat a ekologické sanctuary projekty.', 'vysoká')
  }

  const emailCount = (db.prepare('SELECT COUNT(*) as c FROM emaily').get() as { c: number }).c
  if (emailCount === 0) {
    const insertEmail = db.prepare(`
      INSERT INTO emaily (od, predmet, priorita, obsah, datum, navrh_odpovedi)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    insertEmail.run('veterina@praxe.cz', 'URGENTNÍ: Zdravotní kontrola – koza Bělka', 'urgentní',
      'Dobrý den, je nutné co nejdříve provést veterinární prohlídku kozy Bělky. Vykazuje příznaky respiračního onemocnění.',
      '2025-05-16 08:15', 'Dobrý den, děkujeme za upozornění. Termín potvrdíme do dnešního odpoledne. S pozdravem, Nech mě růst')
    insertEmail.run('darce@gmail.com', 'Zájem o virtuální adopci – ovce', 'vysoká',
      'Dobrý den, rád bych adoptoval jednu z vašich ovcí. Jak probíhá virtuální adopce a co obnáší?',
      '2025-05-16 09:30', 'Dobrý den, velmi nás těší váš zájem! Virtuální adopce obnáší měsíční příspěvek 300 Kč...')
    insertEmail.run('info@nadacecez.cz', 'Grant – výzva k podání žádosti 2025', 'vysoká',
      'Vážení, připomínáme otevřenou výzvu k podání žádostí o grant. Deadline je 30. 6. 2025.',
      '2025-05-15 14:00', null)
    insertEmail.run('dobrovolnik@seznam.cz', 'Zájem o dobrovolnictví', 'normální',
      'Zdravím, mám zájem přijít pomoci na ranč. Jsem k dispozici každý víkend.',
      '2025-05-15 11:20', 'Zdravím, skvělé! Přijďte kdykoliv v sobotu od 9:00...')
    insertEmail.run('noviny@region.cz', 'Rozhovor pro regionální noviny', 'normální',
      'Dobrý den, rádi bychom vás představili v naší rubrice "Lidé regionu". Máte zájem?',
      '2025-05-14 16:45', null)
    insertEmail.run('krmivo@agro.cz', 'Potvrzení objednávky sena', 'nízká',
      'Potvrzujeme přijetí objednávky 500 kg sena. Dodání do 3 pracovních dnů.',
      '2025-05-14 10:00', null)
  }

  const zasobyCount = (db.prepare('SELECT COUNT(*) as c FROM zasoby').get() as { c: number }).c
  if (zasobyCount === 0) {
    const insertZasoba = db.prepare(`
      INSERT INTO zasoby (nazev, mnozstvi, jednotka, minimum, status) VALUES (?, ?, ?, ?, ?)
    `)
    insertZasoba.run('Seno', 45, 'kg', 100, 'kritický')
    insertZasoba.run('Pšenice', 120, 'kg', 50, 'ok')
    insertZasoba.run('Oves', 30, 'kg', 40, 'dochází')
    insertZasoba.run('Těstoviny', 25, 'kg', 20, 'ok')
    insertZasoba.run('Mrkev', 15, 'kg', 10, 'ok')
    insertZasoba.run('Jablka', 8, 'kg', 15, 'dochází')
  }

  const zvirataCount = (db.prepare('SELECT COUNT(*) as c FROM zvirata').get() as { c: number }).c
  if (zvirataCount === 0) {
    const insertZvire = db.prepare(`
      INSERT INTO zvirata (jmeno, druh, status, popis, datum_prijeti) VALUES (?, ?, ?, ?, ?)
    `)
    insertZvire.run('Bělka', 'koza', 'v azylu', 'Bílá koza nalezená u silnice', '2024-03-15')
    insertZvire.run('Ferda', 'prase', 'v azylu', 'Záchrana z farmy', '2024-01-20')
    insertZvire.run('Lucie', 'ovce', 'adoptována', 'Virtuálně adoptována rodinou Novák', '2023-11-10')
    insertZvire.run('Max', 'pes', 'v azylu', 'Nalezen bez majitele', '2024-05-01')
    insertZvire.run('Kvítko', 'kůň', 'v azylu', 'Záchrana z týrání', '2023-09-05')
  }

  const ukolCount = (db.prepare('SELECT COUNT(*) as c FROM ukoly').get() as { c: number }).c
  if (ukolCount === 0) {
    const insertUkol = db.prepare(`
      INSERT INTO ukoly (nazev, priorita, zodpovedna_osoba, datum_splneni) VALUES (?, ?, ?, ?)
    `)
    insertUkol.run('Objednat seno – zásoby kritické', 'urgentní', 'Tomáš', '2025-05-17')
    insertUkol.run('Veterinář pro Bělku', 'urgentní', 'Kateřina', '2025-05-17')
    insertUkol.run('Odpovědět na grant ČEZ', 'vysoká', 'Tomáš', '2025-05-20')
    insertUkol.run('Zveřejnit příspěvek na Instagram', 'normální', 'Kateřina', '2025-05-18')
    insertUkol.run('Aktualizovat zásoby po dovozu', 'normální', 'Tomáš', '2025-05-19')
  }

  db.close()
}

export { getDb }

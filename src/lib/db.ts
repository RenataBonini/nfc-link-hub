import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'nfc-link-hub.db')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS businesses (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    slug TEXT UNIQUE NOT NULL,
    theme TEXT DEFAULT 'dark-glass',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS business_links (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
  );
`)

const businessColumns = db.prepare(`PRAGMA table_info(businesses)`).all() as Array<{
  name: string
}>

const hasTemplate = businessColumns.some((col) => col.name === 'template')
const hasLogoUrl = businessColumns.some((col) => col.name === 'logo_url')
const hasPublished = businessColumns.some((col) => col.name === 'is_published')

if (!hasTemplate) {
  db.exec(`ALTER TABLE businesses ADD COLUMN template TEXT DEFAULT 'classic-dark'`)
}

if (!hasLogoUrl) {
  db.exec(`ALTER TABLE businesses ADD COLUMN logo_url TEXT`)
}

if (!hasPublished) {
  db.exec(`ALTER TABLE businesses ADD COLUMN is_published INTEGER DEFAULT 0`)
}

export default db
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

export default db
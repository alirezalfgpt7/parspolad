import fs from 'fs';
import path from 'path';
import { buildCatalogSeed } from './seedCatalog.ts';
import { buildContentSeed } from './seedContent.ts';
import { buildCoreSeed } from './seedCore.ts';
import type { DatabaseSchema } from './types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

let memoryDb: DatabaseSchema | null = null;

export function createInitialDatabase(): DatabaseSchema {
  return {
    initialized: true,
    tokens: [],
    ...buildCoreSeed(),
    ...buildCatalogSeed(),
    ...buildContentSeed(),
  };
}

export function getDb(): DatabaseSchema {
  if (memoryDb) return memoryDb;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = createInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    memoryDb = initial;
    return memoryDb;
  }
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  memoryDb = JSON.parse(raw) as DatabaseSchema;
  return memoryDb;
}

export function saveDb(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  memoryDb = db;
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

export function nextId(items: Array<{ id: number }>): number {
  if (!items.length) return 1;
  return Math.max(...items.map((i) => i.id)) + 1;
}

export function logActivity(
  db: DatabaseSchema,
  user: { name: string; email: string } | null,
  action: string,
  subjectType: string,
  subjectLabel: string,
  ipAddress = '127.0.0.1'
): void {
  db.activity_logs.unshift({
    id: nextId(db.activity_logs),
    user_name: user?.name || 'بازدیدکننده مهمان',
    user_email: user?.email || 'guest@parspooladaghaei.ir',
    action,
    subject_type: subjectType,
    subject_label: subjectLabel,
    ip_address: ipAddress,
    created_at: new Date().toISOString(),
  });
  if (db.activity_logs.length > 500) {
    db.activity_logs = db.activity_logs.slice(0, 500);
  }
}

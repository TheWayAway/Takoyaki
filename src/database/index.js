const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production'
    ? '/app/data/takoyaki.db'
    : path.join(__dirname, '..', '..', 'takoyaki.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
function init() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_date TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            created_by TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_by TEXT,
            updated_at INTEGER,
            sort_order INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS guild_config (
            guild_id TEXT PRIMARY KEY,
            allowed_roles TEXT NOT NULL DEFAULT '[]'
        );

        CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
    `);

    // Migration: Add sort_order column if it doesn't exist
    const columns = db.pragma('table_info(events)');
    const hasSortOrder = columns.some(col => col.name === 'sort_order');
    if (!hasSortOrder) {
        db.exec('ALTER TABLE events ADD COLUMN sort_order INTEGER DEFAULT 0');
    }

    // Migration: Add event_time column if it doesn't exist
    const hasEventTime = columns.some(col => col.name === 'event_time');
    if (!hasEventTime) {
        db.exec('ALTER TABLE events ADD COLUMN event_time TEXT');
    }
}

init();

module.exports = db;

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'takoyaki.db');
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
            updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS guild_config (
            guild_id TEXT PRIMARY KEY,
            allowed_roles TEXT NOT NULL DEFAULT '[]'
        );

        CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
    `);
}

init();

module.exports = db;

const path = require('path');
const fs = require('fs');

/**
 * Singleton Database Class untuk SQLite menggunakan better-sqlite3.
 */
class Database {
  constructor() {
    if (!Database.instance) {
      const dbDir = path.join(__dirname, '../../data');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      this.dbPath = path.join(dbDir, 'database.sqlite');
      this.db = null;
      this._init();
      Database.instance = this;
    }
    return Database.instance;
  }

  _init() {
    const DatabaseDriver = require('better-sqlite3');
    this.db = new DatabaseDriver(this.dbPath);
    
    // Aktifkan WAL Mode (Write-Ahead Logging) & Foreign Keys untuk performa dan konkurensi maksimal
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    this._createTables();
  }

  _createTables() {
    // 1. Tabel variables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS variables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT DEFAULT '',
        createdAt TEXT NOT NULL,
        updatedAt TEXT
      );
    `);

    // 2. Tabel saldo_items (Composite Primary Key: id + group_type)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS saldo_items (
        id TEXT NOT NULL,
        label TEXT NOT NULL,
        description TEXT DEFAULT '',
        group_type TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT,
        PRIMARY KEY (id, group_type)
      );
    `);

    // Create indexes for quick query filtering
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_variables_key ON variables(key);
      CREATE INDEX IF NOT EXISTS idx_saldo_group ON saldo_items(group_type, sort_order);
    `);
  }

  getConnection() {
    return this.db;
  }
}

module.exports = new Database();

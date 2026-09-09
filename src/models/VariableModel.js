const dbInstance = require('../config/Database');

const DEFAULT_VARIABLES = [
  { key: 'idm', value: 'Informasi dari Mitra', description: 'Informasi dari Mitra' },
  { key: 'idi', value: 'Informasi dari Internal', description: 'Informasi dari Internal' },
  { key: 'idb', value: 'Informasi dari Biller', description: 'Informasi dari Biller' },
  { key: 'fvo', value: 'FU ke VSI OPS', description: 'FU ke VSI OPS' },
  { key: 'fms', value: 'FU ke MASA SAC', description: 'FU ke MASA SAC' },
  { key: 'fc', value: 'FU ke Ceria', description: 'FU ke Ceria' },
  { key: 'fb', value: 'Fu ke Biller', description: 'Fu ke Biller' },
  { key: 'mkm', value: 'Menyampaikan ke mitra', description: 'Menyampaikan ke mitra' }
];

/**
 * VariableModel
 * Model backend OOP untuk mengelola CRUD Variabel Cepat dengan database SQLite.
 */
class VariableModel {
  constructor() {
    this.db = dbInstance.getConnection();
    this._ensureVariablesExist();
  }

  _ensureVariablesExist() {
    const count = this.db.prepare('SELECT COUNT(*) AS count FROM variables').get().count;
    if (count === 0) {
      this.resetDefaults();
    }
  }

  _cleanText(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/<[^>]*>?/gm, '').trim();
  }

  getAll() {
    const stmt = this.db.prepare('SELECT * FROM variables ORDER BY id ASC');
    return stmt.all();
  }

  getMap() {
    const list = this.getAll();
    const map = {};
    list.forEach(item => {
      if (item.key && item.value) {
        map[item.key.toLowerCase()] = item.value;
      }
    });
    return map;
  }

  create({ key, value, description }) {
    const cleanKey = this._cleanText(key).toLowerCase().replace(/\s+/g, '');
    const cleanValue = this._cleanText(value);
    const cleanDesc = this._cleanText(description);

    if (!cleanKey || !cleanValue) {
      throw new Error('Nama variabel (kunci) dan nilai teks output wajib diisi');
    }

    const existing = this.db.prepare('SELECT * FROM variables WHERE LOWER(key) = ?').get(cleanKey);
    if (existing) {
      throw new Error(`Variabel "${cleanKey}" sudah ada! Kunci variabel harus unik.`);
    }

    const createdAt = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO variables (key, value, description, createdAt)
      VALUES (?, ?, ?, ?)
    `);

    const info = stmt.run(cleanKey, cleanValue, cleanDesc, createdAt);
    return {
      id: info.lastInsertRowid,
      key: cleanKey,
      value: cleanValue,
      description: cleanDesc,
      createdAt
    };
  }

  update(id, { key, value, description }) {
    const existing = this.db.prepare('SELECT * FROM variables WHERE id = ?').get(id);
    if (!existing) {
      throw new Error(`Variabel dengan ID ${id} tidak ditemukan`);
    }

    let newKey = existing.key;
    let newValue = existing.value;
    let newDesc = existing.description;

    if (key !== undefined) {
      const cleanKey = this._cleanText(key).toLowerCase().replace(/\s+/g, '');
      if (!cleanKey) throw new Error('Nama variabel tidak boleh kosong');

      const dup = this.db.prepare('SELECT * FROM variables WHERE id != ? AND LOWER(key) = ?').get(id, cleanKey);
      if (dup) {
        throw new Error(`Variabel "${cleanKey}" sudah digunakan! Kunci variabel harus unik.`);
      }
      newKey = cleanKey;
    }

    if (value !== undefined) {
      const cleanValue = this._cleanText(value);
      if (!cleanValue) throw new Error('Nilai teks output tidak boleh kosong');
      newValue = cleanValue;
    }

    if (description !== undefined) {
      newDesc = this._cleanText(description);
    }

    const updatedAt = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE variables
      SET key = ?, value = ?, description = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(newKey, newValue, newDesc, updatedAt, id);
    return {
      ...existing,
      key: newKey,
      value: newValue,
      description: newDesc,
      updatedAt
    };
  }

  delete(id) {
    const existing = this.db.prepare('SELECT * FROM variables WHERE id = ?').get(id);
    if (!existing) {
      throw new Error(`Variabel dengan ID ${id} tidak ditemukan`);
    }

    const stmt = this.db.prepare('DELETE FROM variables WHERE id = ?');
    stmt.run(id);
    return true;
  }

  resetDefaults() {
    const resetTx = this.db.transaction(() => {
      this.db.prepare('DELETE FROM variables').run();
      const insertStmt = this.db.prepare(`
        INSERT INTO variables (key, value, description, createdAt)
        VALUES (?, ?, ?, ?)
      `);

      const now = new Date().toISOString();
      DEFAULT_VARIABLES.forEach(v => {
        insertStmt.run(v.key, v.value, v.description, now);
      });
    });

    resetTx();
    return this.getAll();
  }
}

module.exports = VariableModel;

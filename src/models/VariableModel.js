const fs = require('fs');
const path = require('path');

const DEFAULT_VARIABLES = [
  { id: 1, key: 'idm', value: 'Informasi dari Mitra', description: 'Informasi dari Mitra', createdAt: new Date().toISOString() },
  { id: 2, key: 'idi', value: 'Informasi dari Internal', description: 'Informasi dari Internal', createdAt: new Date().toISOString() },
  { id: 3, key: 'idb', value: 'Informasi dari Biller', description: 'Informasi dari Biller', createdAt: new Date().toISOString() },
  { id: 4, key: 'fvo', value: 'FU ke VSI OPS', description: 'FU ke VSI OPS', createdAt: new Date().toISOString() },
  { id: 5, key: 'fms', value: 'FU ke MASA SAC', description: 'FU ke MASA SAC', createdAt: new Date().toISOString() },
  { id: 6, key: 'fc', value: 'FU ke Ceria', description: 'FU ke Ceria', createdAt: new Date().toISOString() },
  { id: 7, key: 'fb', value: 'Fu ke Biller', description: 'Fu ke Biller', createdAt: new Date().toISOString() },
  { id: 8, key: 'mkm', value: 'Menyampaikan ke mitra', description: 'Menyampaikan ke mitra', createdAt: new Date().toISOString() }
];

/**
 * VariableModel
 * Model backend OOP untuk mengelola CRUD Variabel Cepat dengan validasi constraint unique key.
 */
class VariableModel {
  constructor(dbPath) {
    this.dbPath = dbPath || path.join(__dirname, '../../data/database.json');
    this._ensureVariablesExist();
  }

  _readAll() {
    try {
      if (!fs.existsSync(this.dbPath)) return { internal: [], mitra: [], biller: [], variables: [...DEFAULT_VARIABLES] };
      const content = fs.readFileSync(this.dbPath, 'utf-8');
      const parsed = JSON.parse(content || '{}');
      if (!Array.isArray(parsed.variables) || parsed.variables.length === 0) {
        parsed.variables = [...DEFAULT_VARIABLES];
        fs.writeFileSync(this.dbPath, JSON.stringify(parsed, null, 2), 'utf-8');
      }
      return parsed;
    } catch (err) {
      console.error('Error reading variables from database:', err);
      return { variables: [...DEFAULT_VARIABLES] };
    }
  }

  _saveAll(data) {
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  _ensureVariablesExist() {
    const db = this._readAll();
    if (!Array.isArray(db.variables) || db.variables.length === 0) {
      db.variables = [...DEFAULT_VARIABLES];
      this._saveAll(db);
    }
  }

  _cleanText(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/<[^>]*>?/gm, '').trim();
  }

  getAll() {
    const db = this._readAll();
    return Array.isArray(db.variables) ? db.variables : [];
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

    const db = this._readAll();
    const variables = Array.isArray(db.variables) ? db.variables : [];

    const existing = variables.find(v => v.key.toLowerCase() === cleanKey);
    if (existing) {
      throw new Error(`Variabel "${cleanKey}" sudah ada! Kunci variabel harus unik.`);
    }

    const newItem = {
      id: Date.now(),
      key: cleanKey,
      value: cleanValue,
      description: cleanDesc,
      createdAt: new Date().toISOString()
    };

    variables.push(newItem);
    db.variables = variables;
    this._saveAll(db);
    return newItem;
  }

  update(id, { key, value, description }) {
    const db = this._readAll();
    const variables = Array.isArray(db.variables) ? db.variables : [];

    const idx = variables.findIndex(v => v.id == id);
    if (idx === -1) {
      throw new Error(`Variabel dengan ID ${id} tidak ditemukan`);
    }

    if (key !== undefined) {
      const cleanKey = this._cleanText(key).toLowerCase().replace(/\s+/g, '');
      if (!cleanKey) throw new Error('Nama variabel tidak boleh kosong');

      const dup = variables.find(v => v.id != id && v.key.toLowerCase() === cleanKey);
      if (dup) {
        throw new Error(`Variabel "${cleanKey}" sudah digunakan! Kunci variabel harus unik.`);
      }
      variables[idx].key = cleanKey;
    }

    if (value !== undefined) {
      const cleanValue = this._cleanText(value);
      if (!cleanValue) throw new Error('Nilai teks output tidak boleh kosong');
      variables[idx].value = cleanValue;
    }

    if (description !== undefined) {
      variables[idx].description = this._cleanText(description);
    }

    variables[idx].updatedAt = new Date().toISOString();
    db.variables = variables;
    this._saveAll(db);
    return variables[idx];
  }

  delete(id) {
    const db = this._readAll();
    const variables = Array.isArray(db.variables) ? db.variables : [];

    const idx = variables.findIndex(v => v.id == id);
    if (idx === -1) {
      throw new Error(`Variabel dengan ID ${id} tidak ditemukan`);
    }

    variables.splice(idx, 1);
    db.variables = variables;
    this._saveAll(db);
    return true;
  }

  resetDefaults() {
    const db = this._readAll();
    db.variables = [...DEFAULT_VARIABLES];
    this._saveAll(db);
    return db.variables;
  }
}

module.exports = VariableModel;

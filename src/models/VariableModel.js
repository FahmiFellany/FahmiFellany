const jsonDb = require('../config/JsonDatabase');

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
 * Model backend OOP untuk mengelola CRUD Variabel Cepat berbasis File JSON (database.json).
 */
class VariableModel {
  constructor() {
    this.jsonDb = jsonDb;
    this._ensureVariablesExist();
  }

  _ensureVariablesExist() {
    const data = this.jsonDb.read();
    if (!data.variables || data.variables.length === 0) {
      this.resetDefaults();
    }
  }

  _cleanText(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/<[^>]*>?/gm, '').trim();
  }

  getAll() {
    const data = this.jsonDb.read();
    return data.variables || [];
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

    const data = this.jsonDb.read();
    const existing = (data.variables || []).find(v => String(v.key).toLowerCase() === cleanKey);
    if (existing) {
      throw new Error(`Variabel "${cleanKey}" sudah ada! Kunci variabel harus unik.`);
    }

    const createdAt = new Date().toISOString();
    const newItem = {
      id: Date.now(),
      key: cleanKey,
      value: cleanValue,
      description: cleanDesc,
      createdAt
    };

    data.variables = data.variables || [];
    data.variables.push(newItem);
    this.jsonDb.write(data);

    return newItem;
  }

  update(id, { key, value, description }) {
    const data = this.jsonDb.read();
    const index = (data.variables || []).findIndex(v => String(v.id) === String(id));

    if (index === -1) {
      throw new Error(`Variabel dengan ID ${id} tidak ditemukan`);
    }

    const existing = data.variables[index];
    let newKey = existing.key;
    let newValue = existing.value;
    let newDesc = existing.description;

    if (key !== undefined) {
      const cleanKey = this._cleanText(key).toLowerCase().replace(/\s+/g, '');
      if (!cleanKey) throw new Error('Nama variabel tidak boleh kosong');

      const dupIndex = data.variables.findIndex(v => String(v.id) !== String(id) && String(v.key).toLowerCase() === cleanKey);
      if (dupIndex !== -1) {
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
    const updatedItem = {
      ...existing,
      key: newKey,
      value: newValue,
      description: newDesc,
      updatedAt
    };

    data.variables[index] = updatedItem;
    this.jsonDb.write(data);

    return updatedItem;
  }

  delete(id) {
    const data = this.jsonDb.read();
    const initialLength = (data.variables || []).length;
    data.variables = (data.variables || []).filter(v => String(v.id) !== String(id));

    if (data.variables.length === initialLength) {
      throw new Error(`Variabel dengan ID ${id} tidak ditemukan`);
    }

    this.jsonDb.write(data);
    return true;
  }

  resetDefaults() {
    const data = this.jsonDb.read();
    const now = new Date().toISOString();
    data.variables = DEFAULT_VARIABLES.map((v, idx) => ({
      id: idx + 1,
      key: v.key,
      value: v.value,
      description: v.description,
      createdAt: now
    }));

    this.jsonDb.write(data);
    return data.variables;
  }
}

module.exports = VariableModel;

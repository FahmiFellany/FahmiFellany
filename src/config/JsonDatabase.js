const fs = require('fs');
const path = require('path');

/**
 * JsonDatabase Class
 * Service Singleton untuk membaca dan menulis data ke data/database.json secara langsung.
 */
class JsonDatabase {
  constructor() {
    if (!JsonDatabase.instance) {
      this.dbDir = path.join(__dirname, '../../data');
      this.jsonPath = path.join(this.dbDir, 'database.json');
      this._ensureFileExists();
      JsonDatabase.instance = this;
    }
    return JsonDatabase.instance;
  }

  _ensureFileExists() {
    if (!fs.existsSync(this.dbDir)) {
      fs.mkdirSync(this.dbDir, { recursive: true });
    }
    if (!fs.existsSync(this.jsonPath)) {
      const defaultData = {
        variables: [],
        saldo_items_siang_sore: [],
        saldo_items_pagi_malam: []
      };
      fs.writeFileSync(this.jsonPath, JSON.stringify(defaultData, null, 2), 'utf-8');
    }
  }

  read() {
    try {
      this._ensureFileExists();
      const raw = fs.readFileSync(this.jsonPath, 'utf-8');
      const parsed = JSON.parse(raw || '{}');
      return {
        variables: Array.isArray(parsed.variables) ? parsed.variables : [],
        saldo_items_siang_sore: Array.isArray(parsed.saldo_items_siang_sore)
          ? parsed.saldo_items_siang_sore
          : (Array.isArray(parsed.saldo_items) ? parsed.saldo_items : []),
        saldo_items_pagi_malam: Array.isArray(parsed.saldo_items_pagi_malam) ? parsed.saldo_items_pagi_malam : []
      };
    } catch (err) {
      console.error('Error reading database.json:', err.message);
      return { variables: [], saldo_items_siang_sore: [], saldo_items_pagi_malam: [] };
    }
  }

  write(data) {
    try {
      this._ensureFileExists();
      const cleanData = {
        variables: data.variables || [],
        saldo_items_siang_sore: data.saldo_items_siang_sore || [],
        saldo_items_pagi_malam: data.saldo_items_pagi_malam || []
      };
      fs.writeFileSync(this.jsonPath, JSON.stringify(cleanData, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error writing database.json:', err.message);
      throw new Error(`Gagal menyimpan data ke database.json: ${err.message}`);
    }
  }
}

module.exports = new JsonDatabase();

const fs = require('fs');
const path = require('path');

const DEFAULT_SALDO_ITEMS_SIANG_SORE = [
  { id: 'pln_jatel', label: 'Saldo PLN - JATEL :', description: 'PLN JATEL' },
  { id: 'bimasakti_pdam', label: 'Saldo Bimasakti - PDAM  :', description: 'Bimasakti PDAM' },
  { id: 'teleanjar_pdam', label: 'Saldo Teleanjar - PDAM:', description: 'Teleanjar PDAM' },
  { id: 'delima_bpjs', label: 'Saldo DELIMA - BPJS-Kes & PayTV :', description: 'DELIMA BPJS-Kes & PayTV' },
  { id: 'dji_fif', label: 'Saldo DJI - FIF :', description: 'DJI FIF' },
  { id: 'pluslink_mf', label: 'Saldo Pluslink - MF :', description: 'Pluslink MF' },
  { id: 'mitracom_pbb', label: 'Saldo Mitracom - PBB :', description: 'Mitracom PBB' },
  { id: 'gsp', label: 'Saldo GSP :', description: 'GSP' },
  { id: 'ptpos_pdam', label: 'Saldo PT POS - PDAM :', description: 'PT POS PDAM' },
  { id: 'artajasa_mba', label: 'Saldo Artajasa - MBA :', description: 'Artajasa MBA' },
  { id: 'artajasa_vsi', label: 'Saldo Artajasa - VSI :', description: 'Artajasa VSI' },
  { id: 'arindo_pdam', label: 'Saldo Arindo - PDAM :', description: 'Arindo PDAM' },
  { id: 'dana_voucher', label: 'Saldo Dana - Voucher :', description: 'Dana Voucher' },
  { id: 'linkqu_transfer', label: 'Saldo LinkQU - Transfer Uang :', description: 'LinkQU Transfer Uang' },
  { id: 'ovo', label: 'Saldo Ovo :', description: 'Ovo' },
  { id: 'tokopedia_gopay', label: 'Saldo Tokopedia - Gopay :', description: 'Tokopedia Gopay' },
  { id: 'ajn_pdam', label: 'Saldo AJN - PDAM :', description: 'AJN PDAM' }
];

const DEFAULT_SALDO_ITEMS_PAGI_MALAM = [
  { id: 'pulsa_114', label: 'Saldo Pulsa-114 - Voucher :', description: 'Pulsa-114 Voucher' },
  { id: 'emoney_voucher', label: 'Saldo E-Money - Voucher :', description: 'E-Money Voucher' },
  { id: 'mmi_voucher', label: 'Saldo MMI - Voucher :', description: 'MMI Voucher' },
  { id: 'ppm_voucher', label: 'Saldo PPM - Voucher :', description: 'PPM Voucher' },
  { id: 'bimasakti_pdam', label: 'Saldo Bimasakti - PDAM  :', description: 'Bimasakti PDAM' },
  { id: 'teleanjar_pdam', label: 'Saldo Teleanjar - PDAM :', description: 'Teleanjar PDAM' },
  { id: 'delima_bpjs', label: 'Saldo DELIMA - BPJS-Kes & PayTV :', description: 'DELIMA BPJS-Kes & PayTV' },
  { id: 'dji_fif', label: 'Saldo DJI - FIF :', description: 'DJI FIF' },
  { id: 'pluslink_mf', label: 'Saldo Pluslink - MF :', description: 'Pluslink MF' },
  { id: 'mitracom_pbb', label: 'Saldo Mitracom - PBB :', description: 'Mitracom PBB' },
  { id: 'gsp', label: 'Saldo GSP :', description: 'GSP' },
  { id: 'ptpos_pdam', label: 'Saldo PT POS - PDAM :', description: 'PT POS PDAM' },
  { id: 'artajasa_mba', label: 'Saldo Artajasa - MBA :', description: 'Artajasa MBA' },
  { id: 'arindo_pdam', label: 'Saldo Arindo - PDAM :', description: 'Arindo PDAM' },
  { id: 'ewallet_dana', label: 'Saldo Ewallet - Dana :', description: 'E-Wallet Dana' },
  { id: 'linkqu_transfer', label: 'Saldo LinkQU - Transfer Uang :', description: 'LinkQU Transfer Uang' },
  { id: 'artajasa_vsi', label: 'Saldo Artajasa - VSI :', description: 'Artajasa VSI' },
  { id: 'ewallet_ovo', label: 'Saldo Ewallet - Ovo :', description: 'E-Wallet Ovo' },
  { id: 'tokopedia_gopay', label: 'Saldo Tokopedia - Gopay :', description: 'Tokopedia Gopay' },
  { id: 'ajn_pdam', label: 'Saldo AJN - PDAM :', description: 'AJN PDAM' },
  { id: 'pln_jatel', label: 'Saldo PLN - JATEL :', description: 'PLN JATEL' }
];

/**
 * SaldoItemModel
 * Model backend OOP untuk mengelola CRUD Item/Kategori Saldo Biller per Grup (Siang-Sore & Pagi-Malam).
 */
class SaldoItemModel {
  constructor(dbPath) {
    this.dbPath = dbPath || path.join(__dirname, '../../data/database.json');
    this._ensureItemsExist();
  }

  _readAll() {
    try {
      if (!fs.existsSync(this.dbPath)) {
        return {
          variables: [],
          saldo_items_siang_sore: [...DEFAULT_SALDO_ITEMS_SIANG_SORE],
          saldo_items_pagi_malam: [...DEFAULT_SALDO_ITEMS_PAGI_MALAM]
        };
      }
      const content = fs.readFileSync(this.dbPath, 'utf-8');
      const parsed = JSON.parse(content || '{}');
      let changed = false;

      if (!Array.isArray(parsed.saldo_items_siang_sore) || parsed.saldo_items_siang_sore.length === 0) {
        // Fallback backward compat if old saldo_items existed
        parsed.saldo_items_siang_sore = Array.isArray(parsed.saldo_items) && parsed.saldo_items.length === 17
          ? parsed.saldo_items
          : [...DEFAULT_SALDO_ITEMS_SIANG_SORE];
        changed = true;
      }

      if (!Array.isArray(parsed.saldo_items_pagi_malam) || parsed.saldo_items_pagi_malam.length === 0) {
        parsed.saldo_items_pagi_malam = [...DEFAULT_SALDO_ITEMS_PAGI_MALAM];
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(this.dbPath, JSON.stringify(parsed, null, 2), 'utf-8');
      }
      return parsed;
    } catch (err) {
      console.error('Error reading saldo_items from database:', err);
      return {
        saldo_items_siang_sore: [...DEFAULT_SALDO_ITEMS_SIANG_SORE],
        saldo_items_pagi_malam: [...DEFAULT_SALDO_ITEMS_PAGI_MALAM]
      };
    }
  }

  _saveAll(data) {
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  _ensureItemsExist() {
    this._readAll();
  }

  _cleanText(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/<[^>]*>?/gm, '').trim();
  }

  _getGroupKey(group) {
    if (group === 'pagi_malam' || group === 'pagi' || group === 'malam') {
      return 'saldo_items_pagi_malam';
    }
    return 'saldo_items_siang_sore';
  }

  _generateId(label) {
    const clean = this._cleanText(label)
      .toLowerCase()
      .replace(/^saldo\s*/i, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return clean || `item_${Date.now()}`;
  }

  getAll(group = 'siang_sore') {
    const db = this._readAll();
    const key = this._getGroupKey(group);
    return Array.isArray(db[key]) ? db[key] : [];
  }

  create({ label, description, group = 'siang_sore' }) {
    const cleanLabel = this._cleanText(label);
    const cleanDesc = this._cleanText(description);

    if (!cleanLabel) {
      throw new Error('Label / Nama Saldo wajib diisi');
    }

    const db = this._readAll();
    const key = this._getGroupKey(group);
    const items = Array.isArray(db[key]) ? db[key] : [];

    let baseId = this._generateId(cleanLabel);
    let finalId = baseId;
    let counter = 1;
    while (items.some(i => i.id === finalId)) {
      finalId = `${baseId}_${counter++}`;
    }

    const newItem = {
      id: finalId,
      label: cleanLabel,
      description: cleanDesc,
      createdAt: new Date().toISOString()
    };

    items.push(newItem);
    db[key] = items;
    this._saveAll(db);
    return newItem;
  }

  update(id, { label, description, group = 'siang_sore' }) {
    const db = this._readAll();
    const key = this._getGroupKey(group);
    const items = Array.isArray(db[key]) ? db[key] : [];

    const idx = items.findIndex(i => i.id == id);
    if (idx === -1) {
      throw new Error(`Item saldo dengan ID "${id}" tidak ditemukan pada grup ${group}`);
    }

    if (label !== undefined) {
      const cleanLabel = this._cleanText(label);
      if (!cleanLabel) throw new Error('Label tidak boleh kosong');
      items[idx].label = cleanLabel;
    }

    if (description !== undefined) {
      items[idx].description = this._cleanText(description);
    }

    items[idx].updatedAt = new Date().toISOString();
    db[key] = items;
    this._saveAll(db);
    return items[idx];
  }

  delete(id, group = 'siang_sore') {
    const db = this._readAll();
    const key = this._getGroupKey(group);
    const items = Array.isArray(db[key]) ? db[key] : [];

    const idx = items.findIndex(i => i.id == id);
    if (idx === -1) {
      throw new Error(`Item saldo dengan ID "${id}" tidak ditemukan pada grup ${group}`);
    }

    items.splice(idx, 1);
    db[key] = items;
    this._saveAll(db);
    return true;
  }

  resetDefaults(group = 'siang_sore') {
    const db = this._readAll();
    const key = this._getGroupKey(group);
    if (key === 'saldo_items_pagi_malam') {
      db.saldo_items_pagi_malam = [...DEFAULT_SALDO_ITEMS_PAGI_MALAM];
      this._saveAll(db);
      return db.saldo_items_pagi_malam;
    } else {
      db.saldo_items_siang_sore = [...DEFAULT_SALDO_ITEMS_SIANG_SORE];
      this._saveAll(db);
      return db.saldo_items_siang_sore;
    }
  }

  reorder(itemIds, group = 'siang_sore') {
    const db = this._readAll();
    const key = this._getGroupKey(group);
    const items = Array.isArray(db[key]) ? db[key] : [];
    if (!Array.isArray(itemIds)) {
      throw new Error('Daftar ID item harus berupa array');
    }

    const itemMap = new Map(items.map(item => [item.id, item]));
    const reordered = [];
    for (const id of itemIds) {
      if (itemMap.has(id)) {
        reordered.push(itemMap.get(id));
        itemMap.delete(id);
      }
    }
    for (const remaining of itemMap.values()) {
      reordered.push(remaining);
    }

    db[key] = reordered;
    this._saveAll(db);
    return reordered;
  }
}

module.exports = SaldoItemModel;

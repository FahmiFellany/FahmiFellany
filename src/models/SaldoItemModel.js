const jsonDb = require('../config/JsonDatabase');

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
 * Model backend OOP untuk mengelola CRUD Item Saldo Biller berbasis File JSON (database.json).
 */
class SaldoItemModel {
  constructor() {
    this.jsonDb = jsonDb;
    this._ensureItemsExist();
  }

  _getGroupKey(group) {
    if (group === 'pagi_malam' || group === 'pagi' || group === 'malam') {
      return 'saldo_items_pagi_malam';
    }
    return 'saldo_items_siang_sore';
  }

  _ensureItemsExist() {
    const data = this.jsonDb.read();
    let modified = false;

    if (!data.saldo_items_siang_sore || data.saldo_items_siang_sore.length === 0) {
      data.saldo_items_siang_sore = DEFAULT_SALDO_ITEMS_SIANG_SORE.map(item => ({ ...item }));
      modified = true;
    }

    if (!data.saldo_items_pagi_malam || data.saldo_items_pagi_malam.length === 0) {
      data.saldo_items_pagi_malam = DEFAULT_SALDO_ITEMS_PAGI_MALAM.map(item => ({ ...item }));
      modified = true;
    }

    if (modified) {
      this.jsonDb.write(data);
    }
  }

  _cleanText(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/<[^>]*>?/gm, '').trim();
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
    const groupKey = this._getGroupKey(group);
    const data = this.jsonDb.read();
    return data[groupKey] || [];
  }

  create({ label, description, group = 'siang_sore' }) {
    const cleanLabel = this._cleanText(label);
    const cleanDesc = this._cleanText(description);

    if (!cleanLabel) {
      throw new Error('Label / Nama Saldo wajib diisi');
    }

    const groupKey = this._getGroupKey(group);
    const data = this.jsonDb.read();
    const items = data[groupKey] || [];

    let baseId = this._generateId(cleanLabel);
    let finalId = baseId;
    let counter = 1;

    while (items.some(item => String(item.id) === finalId)) {
      finalId = `${baseId}_${counter++}`;
    }

    const createdAt = new Date().toISOString();
    const newItem = {
      id: finalId,
      label: cleanLabel,
      description: cleanDesc,
      createdAt
    };

    items.push(newItem);
    data[groupKey] = items;
    this.jsonDb.write(data);

    return newItem;
  }

  update(id, { label, description, group = 'siang_sore' }) {
    const groupKey = this._getGroupKey(group);
    const data = this.jsonDb.read();
    const items = data[groupKey] || [];

    const index = items.findIndex(item => String(item.id) === String(id));
    if (index === -1) {
      throw new Error(`Item saldo dengan ID "${id}" tidak ditemukan pada grup ${group}`);
    }

    const existing = items[index];
    let newLabel = existing.label;
    let newDesc = existing.description;

    if (label !== undefined) {
      const cleanLabel = this._cleanText(label);
      if (!cleanLabel) throw new Error('Label tidak boleh kosong');
      newLabel = cleanLabel;
    }

    if (description !== undefined) {
      newDesc = this._cleanText(description);
    }

    const updatedAt = new Date().toISOString();
    const updatedItem = {
      ...existing,
      label: newLabel,
      description: newDesc,
      updatedAt
    };

    items[index] = updatedItem;
    data[groupKey] = items;
    this.jsonDb.write(data);

    return updatedItem;
  }

  delete(id, group = 'siang_sore') {
    const groupKey = this._getGroupKey(group);
    const data = this.jsonDb.read();
    const items = data[groupKey] || [];

    const initialLength = items.length;
    data[groupKey] = items.filter(item => String(item.id) !== String(id));

    if (data[groupKey].length === initialLength) {
      throw new Error(`Item saldo dengan ID "${id}" tidak ditemukan pada grup ${group}`);
    }

    this.jsonDb.write(data);
    return true;
  }

  resetDefaults(group = 'siang_sore') {
    const groupKey = this._getGroupKey(group);
    const defaults = (groupKey === 'saldo_items_pagi_malam') ? DEFAULT_SALDO_ITEMS_PAGI_MALAM : DEFAULT_SALDO_ITEMS_SIANG_SORE;
    const data = this.jsonDb.read();

    data[groupKey] = defaults.map(item => ({ ...item }));
    this.jsonDb.write(data);

    return data[groupKey];
  }

  reorder(itemIds, group = 'siang_sore') {
    if (!Array.isArray(itemIds)) {
      throw new Error('Daftar ID item harus berupa array');
    }

    const groupKey = this._getGroupKey(group);
    const data = this.jsonDb.read();
    const items = data[groupKey] || [];

    const itemMap = new Map(items.map(item => [String(item.id), item]));
    const reordered = [];

    itemIds.forEach(id => {
      if (itemMap.has(String(id))) {
        reordered.push(itemMap.get(String(id)));
        itemMap.delete(String(id));
      }
    });

    // Masukkan sisa item yang mungkin tidak ada di itemIds (jika ada)
    itemMap.forEach(item => reordered.push(item));

    data[groupKey] = reordered;
    this.jsonDb.write(data);

    return data[groupKey];
  }
}

module.exports = SaldoItemModel;

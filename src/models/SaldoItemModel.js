const dbInstance = require('../config/Database');

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
 * Model backend OOP untuk mengelola CRUD Item Saldo Biller dengan database SQLite.
 */
class SaldoItemModel {
  constructor() {
    this.db = dbInstance.getConnection();
    this._ensureItemsExist();
  }

  _ensureItemsExist() {
    const count = this.db.prepare('SELECT COUNT(*) AS count FROM saldo_items').get().count;
    if (count === 0) {
      this.resetDefaults('siang_sore');
      this.resetDefaults('pagi_malam');
    }
  }

  _cleanText(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/<[^>]*>?/gm, '').trim();
  }

  _getGroupType(group) {
    if (group === 'pagi_malam' || group === 'pagi' || group === 'malam') {
      return 'pagi_malam';
    }
    return 'siang_sore';
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
    const groupType = this._getGroupType(group);
    const stmt = this.db.prepare(`
      SELECT id, label, description, createdAt, updatedAt
      FROM saldo_items
      WHERE group_type = ?
      ORDER BY sort_order ASC, rowid ASC
    `);
    return stmt.all(groupType);
  }

  create({ label, description, group = 'siang_sore' }) {
    const cleanLabel = this._cleanText(label);
    const cleanDesc = this._cleanText(description);

    if (!cleanLabel) {
      throw new Error('Label / Nama Saldo wajib diisi');
    }

    const groupType = this._getGroupType(group);
    let baseId = this._generateId(cleanLabel);
    let finalId = baseId;
    let counter = 1;

    while (this.db.prepare('SELECT id FROM saldo_items WHERE id = ? AND group_type = ?').get(finalId, groupType)) {
      finalId = `${baseId}_${counter++}`;
    }

    const maxSort = this.db.prepare('SELECT MAX(sort_order) AS max_sort FROM saldo_items WHERE group_type = ?').get(groupType);
    const nextSort = (maxSort && maxSort.max_sort !== null) ? maxSort.max_sort + 1 : 1;
    const createdAt = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO saldo_items (id, label, description, group_type, sort_order, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(finalId, cleanLabel, cleanDesc, groupType, nextSort, createdAt);
    return {
      id: finalId,
      label: cleanLabel,
      description: cleanDesc,
      createdAt
    };
  }

  update(id, { label, description, group = 'siang_sore' }) {
    const groupType = this._getGroupType(group);
    const existing = this.db.prepare('SELECT * FROM saldo_items WHERE id = ? AND group_type = ?').get(id, groupType);

    if (!existing) {
      throw new Error(`Item saldo dengan ID "${id}" tidak ditemukan pada grup ${group}`);
    }

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
    const stmt = this.db.prepare(`
      UPDATE saldo_items
      SET label = ?, description = ?, updatedAt = ?
      WHERE id = ? AND group_type = ?
    `);

    stmt.run(newLabel, newDesc, updatedAt, id, groupType);
    return {
      ...existing,
      label: newLabel,
      description: newDesc,
      updatedAt
    };
  }

  delete(id, group = 'siang_sore') {
    const groupType = this._getGroupType(group);
    const existing = this.db.prepare('SELECT * FROM saldo_items WHERE id = ? AND group_type = ?').get(id, groupType);

    if (!existing) {
      throw new Error(`Item saldo dengan ID "${id}" tidak ditemukan pada grup ${group}`);
    }

    const stmt = this.db.prepare('DELETE FROM saldo_items WHERE id = ? AND group_type = ?');
    stmt.run(id, groupType);
    return true;
  }

  resetDefaults(group = 'siang_sore') {
    const groupType = this._getGroupType(group);
    const defaults = (groupType === 'pagi_malam') ? DEFAULT_SALDO_ITEMS_PAGI_MALAM : DEFAULT_SALDO_ITEMS_SIANG_SORE;

    const resetTx = this.db.transaction(() => {
      this.db.prepare('DELETE FROM saldo_items WHERE group_type = ?').run(groupType);
      const insertStmt = this.db.prepare(`
        INSERT INTO saldo_items (id, label, description, group_type, sort_order, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const now = new Date().toISOString();
      defaults.forEach((item, index) => {
        insertStmt.run(item.id, item.label, item.description || '', groupType, index + 1, now);
      });
    });

    resetTx();
    return this.getAll(groupType);
  }

  reorder(itemIds, group = 'siang_sore') {
    if (!Array.isArray(itemIds)) {
      throw new Error('Daftar ID item harus berupa array');
    }

    const groupType = this._getGroupType(group);
    const updateStmt = this.db.prepare(`
      UPDATE saldo_items
      SET sort_order = ?
      WHERE id = ? AND group_type = ?
    `);

    const reorderTx = this.db.transaction(() => {
      itemIds.forEach((id, index) => {
        updateStmt.run(index + 1, id, groupType);
      });
    });

    reorderTx();
    return this.getAll(groupType);
  }
}

module.exports = SaldoItemModel;

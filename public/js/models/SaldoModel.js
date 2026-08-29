/**
 * SaldoModel (Client-Side)
 * Mengelola State, API CRUD Multi-Grup (Siang-Sore & Pagi-Malam), Pembuatan Template Pesan Broadcast,
 * serta Ekspor & Salin ke Excel (.xlsx / TSV) dan Ringkasan Status.
 */
export const DEFAULT_SALDO_ITEMS_SIANG_SORE = [
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

export const DEFAULT_SALDO_ITEMS_PAGI_MALAM = [
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

export const DEFAULT_PRESET_PAGI_MALAM = {
  'pulsa_114': '1.127.884',
  'emoney_voucher': '4.440.043',
  'ppm_voucher': '30.448.200',
  'arindo_pdam': '58.785.913',
  'linkqu_transfer': '6.391.065'
};

export const DEFAULT_PRESET_SIANG_SORE = {
  'arindo_pdam': '58.785.913',
  'linkqu_transfer': '6.391.065'
};

export class SaldoModel {
  constructor() {
    this.period = 'Siang'; // 'Pagi', 'Siang', 'Sore', 'Malam'

    // Group Items Cache
    this.groupItems = {
      'siang_sore': this._loadItemsLocal('siang_sore') || [...DEFAULT_SALDO_ITEMS_SIANG_SORE],
      'pagi_malam': this._loadItemsLocal('pagi_malam') || [...DEFAULT_SALDO_ITEMS_PAGI_MALAM]
    };

    // Dates per period
    this.dates = {
      'Pagi': this._getAutoDateWithTime(),
      'Siang': this._getAutoDateOnly(),
      'Sore': this._getAutoDateOnly(),
      'Malam': this._getAutoDateWithTime()
    };

    // Bersihkan draft lokal lama agar form saldo selalu bersih saat refresh
    this._clearLocalDrafts();

    // Drafts per period (dimulai bersih/kosong setiap refresh web)
    this.drafts = {
      'Pagi': {},
      'Siang': {},
      'Sore': {},
      'Malam': {}
    };
  }

  _getApiUrl(endpoint) {
    const isNodeServer = window.location.origin.includes(':3000');
    const baseUrl = isNodeServer ? '' : 'http://localhost:3000';
    return `${baseUrl}${endpoint}`;
  }

  _getAutoDateOnly() {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = String(now.getFullYear()).slice(-2);
    return `${d}-${m}-${y}`;
  }

  _getAutoDateWithTime() {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = String(now.getFullYear()).slice(-2);
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${d}-${m}-${y} ${hh}:${mm}`;
  }

  getGroup(period = this.period) {
    return (period === 'Pagi' || period === 'Malam') ? 'pagi_malam' : 'siang_sore';
  }

  _loadItemsLocal(group) {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(`app_saldo_items_${group}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  _saveItemsLocal(group, items) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`app_saldo_items_${group}`, JSON.stringify(items));
      }
    } catch (e) {
      // Ignore
    }
  }

  _clearLocalDrafts() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('app_saldo_Pagi');
        localStorage.removeItem('app_saldo_Siang');
        localStorage.removeItem('app_saldo_Sore');
        localStorage.removeItem('app_saldo_Malam');
      }
    } catch (e) {
      // Ignore
    }
  }

  _loadDraft(period) {
    return {};
  }

  _saveDraft(period, data) {
    // Menyimpan draft hanya di memory runtime, tidak perlu persist antar-refresh
  }

  async fetchItems(group = this.getGroup()) {
    try {
      const res = await fetch(this._getApiUrl(`/api/saldo-items?group=${group}`));
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          this.groupItems[group] = json.data;
          this._saveItemsLocal(group, this.groupItems[group]);
          return this.groupItems[group];
        }
      }
    } catch (e) {
      console.warn(`Gagal memuat item saldo (${group}) dari API:`, e);
    }
    return this.groupItems[group];
  }

  async fetchAllGroups() {
    await Promise.all([
      this.fetchItems('siang_sore'),
      this.fetchItems('pagi_malam')
    ]);
  }

  getItems(period = this.period) {
    const group = this.getGroup(period);
    return this.groupItems[group] || [];
  }

  getPeriod() {
    return this.period;
  }

  refreshPeriod(period = this.period) {
    // 1. Refresh tanggal & jam ke waktu sekarang
    this.dates[period] = (period === 'Pagi' || period === 'Malam')
      ? this._getAutoDateWithTime()
      : this._getAutoDateOnly();

    // 2. Refresh nilai default preset untuk periode ini
    if (period === 'Pagi' || period === 'Malam') {
      this.drafts[period] = { ...DEFAULT_PRESET_PAGI_MALAM };
    } else {
      this.drafts[period] = { ...DEFAULT_PRESET_SIANG_SORE };
    }
    this._saveDraft(period, this.drafts[period]);
  }

  setPeriod(period) {
    if (['Pagi', 'Siang', 'Sore', 'Malam'].includes(period)) {
      this.period = period;
      this.refreshPeriod(period);
    }
  }

  getDateStr(period = this.period) {
    return this.dates[period] || ((period === 'Pagi' || period === 'Malam') ? this._getAutoDateWithTime() : this._getAutoDateOnly());
  }

  setDateStr(dateStr, period = this.period) {
    this.dates[period] = dateStr;
  }

  getValues(period = this.period) {
    return this.drafts[period] || {};
  }

  setValue(id, val, period = this.period) {
    if (!this.drafts[period]) this.drafts[period] = {};
    this.drafts[period][id] = val;
    this._saveDraft(period, this.drafts[period]);
  }

  setValues(values, period = this.period) {
    this.drafts[period] = { ...values };
    this._saveDraft(period, this.drafts[period]);
  }

  clearValues(period = this.period) {
    this.drafts[period] = {};
    this._saveDraft(period, {});
  }

  // CRUD Methods per active group
  async createItem({ label, description }, group = this.getGroup()) {
    try {
      const res = await fetch(this._getApiUrl('/api/saldo-items'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, description, group })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menambahkan item saldo');
      }
      this.groupItems[group].push(data.data);
      this._saveItemsLocal(group, this.groupItems[group]);
      return data.data;
    } catch (err) {
      // Local fallback
      const cleanLabel = label ? label.trim() : '';
      if (!cleanLabel) throw new Error('Label wajib diisi');
      const baseId = cleanLabel.toLowerCase().replace(/^saldo\s*/i, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `item_${Date.now()}`;
      let finalId = baseId;
      let counter = 1;
      while (this.groupItems[group].some(i => i.id === finalId)) {
        finalId = `${baseId}_${counter++}`;
      }
      const newItem = { id: finalId, label: cleanLabel, description: description || '' };
      this.groupItems[group].push(newItem);
      this._saveItemsLocal(group, this.groupItems[group]);
      return newItem;
    }
  }

  async updateItem(id, { label, description }, group = this.getGroup()) {
    try {
      const res = await fetch(this._getApiUrl(`/api/saldo-items/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, description, group })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memperbarui item saldo');
      }
      const idx = this.groupItems[group].findIndex(i => i.id == id);
      if (idx !== -1) {
        this.groupItems[group][idx] = data.data;
        this._saveItemsLocal(group, this.groupItems[group]);
      }
      return data.data;
    } catch (err) {
      const idx = this.groupItems[group].findIndex(i => i.id == id);
      if (idx === -1) throw new Error('Item saldo tidak ditemukan');
      if (label) this.groupItems[group][idx].label = label.trim();
      if (description !== undefined) this.groupItems[group][idx].description = description.trim();
      this._saveItemsLocal(group, this.groupItems[group]);
      return this.groupItems[group][idx];
    }
  }

  async deleteItem(id, group = this.getGroup()) {
    try {
      await fetch(this._getApiUrl(`/api/saldo-items/${id}?group=${group}`), {
        method: 'DELETE'
      });
    } catch (err) {
      // Ignore
    }
    const idx = this.groupItems[group].findIndex(i => i.id == id);
    if (idx !== -1) {
      this.groupItems[group].splice(idx, 1);
      this._saveItemsLocal(group, this.groupItems[group]);
    }
    return true;
  }

  async resetDefaults(group = this.getGroup()) {
    try {
      const res = await fetch(this._getApiUrl(`/api/saldo-items/reset?group=${group}`), {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        this.groupItems[group] = data.data;
        this._saveItemsLocal(group, this.groupItems[group]);
        return this.groupItems[group];
      }
    } catch (err) {
      // Ignore
    }
    if (group === 'pagi_malam') {
      this.groupItems[group] = [...DEFAULT_SALDO_ITEMS_PAGI_MALAM];
    } else {
      this.groupItems[group] = [...DEFAULT_SALDO_ITEMS_SIANG_SORE];
    }
    this._saveItemsLocal(group, this.groupItems[group]);
    return this.groupItems[group];
  }

  // Generate Broadcast Message
  generateOutput(period = this.period, dateStr = this.getDateStr(period)) {
    const items = this.getItems(period);
    const values = this.drafts[period] || {};

    let msg = '';
    if (period === 'Pagi' || period === 'Malam') {
      msg += `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n`;
      msg += `Update Info Saldo ${period} ini Tanggal ${dateStr} sbb :\n\n`;
    } else {
      msg += `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n`;
      msg += `Update Info Saldo ${period} ini Tanggal ${dateStr} sbb :\n\n`;
    }

    items.forEach((item) => {
      const rawVal = values[item.id] !== undefined ? String(values[item.id]).trim() : '';
      msg += `${item.label}\n`;
      if (rawVal) {
        const cleanVal = rawVal.replace(/^rp\.?\s*/i, '').trim();
        msg += `Rp. ${cleanVal}\n\n`;
      } else {
        msg += `Rp.\n\n`;
      }
    });

    msg += `Demikian kami sampaikan.\nWassalammu'alaikum Warahmatullahi Wabarakatuh.`;
    return msg;
  }

  // Status & Summary Analytics (untuk Pagi / Malam & Siang / Sore)
  getStatusSummary(period = this.period) {
    const items = this.getItems(period);
    const values = this.drafts[period] || {};

    let filledCount = 0;
    let emptyCount = 0;
    let totalNominal = 0;

    const details = items.map((item, index) => {
      // Column letters A, B, C...
      const colLetter = String.fromCharCode(65 + (index % 26));
      const rawVal = values[item.id] !== undefined ? String(values[item.id]).trim() : '';
      const cleanNumeric = rawVal.replace(/[^0-9]/g, '');
      const num = parseInt(cleanNumeric, 10) || 0;
      const isFilled = cleanNumeric.length > 0;

      if (isFilled) {
        filledCount++;
        totalNominal += num;
      } else {
        emptyCount++;
      }

      return {
        id: item.id,
        col: colLetter,
        index: index + 1,
        label: item.label,
        cleanHeader: item.label.replace(/^saldo\s*/i, '').replace(/:\s*$/, '').trim(),
        formattedValue: isFilled ? `Rp. ${new Intl.NumberFormat('id-ID').format(num)}` : '-',
        rawValue: cleanNumeric,
        isFilled
      };
    });

    return {
      period,
      totalItems: items.length,
      filledCount,
      emptyCount,
      totalNominal,
      totalNominalFormatted: `Rp. ${new Intl.NumberFormat('id-ID').format(totalNominal)}`,
      details
    };
  }

  // TSV Generation untuk Salin ke Excel
  generateExcelTsv(period = this.period) {
    const summary = this.getStatusSummary(period);
    const headers = summary.details.map(d => d.cleanHeader).join('\t');
    const values = summary.details.map(d => d.rawValue ? `Rp. ${new Intl.NumberFormat('id-ID').format(d.rawValue)}` : '').join('\t');
    const rawNumbers = summary.details.map(d => d.rawValue || '').join('\t');

    return {
      headerRow: headers,
      valueRow: values,
      rawNumbersRow: rawNumbers,
      tsvFull: `${headers}\n${values}`,
      tsvRowOnly: values
    };
  }

  // Ekspor File Excel (.xlsx) menggunakan SheetJS
  exportExcelWorkbook(period = this.period) {
    if (typeof XLSX === 'undefined') {
      throw new Error('SheetJS library belum dimuat');
    }

    const summary = this.getStatusSummary(period);
    const dateStr = this.getDateStr(period);

    // Build Worksheet Rows
    const headerRow = summary.details.map(d => d.cleanHeader);
    const valueRow = summary.details.map(d => d.rawValue ? Number(d.rawValue) : '');

    const wsData = [
      [`Update Info Saldo ${period} - Tanggal ${dateStr}`],
      [],
      headerRow,
      valueRow
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = summary.details.map(() => ({ wch: 24 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Saldo_${period}`);

    const safeDate = dateStr.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `Update_Info_Saldo_${period}_${safeDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
    return fileName;
  }
}

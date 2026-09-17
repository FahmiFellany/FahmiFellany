/**
 * MbsbModel
 * Model data & logika bisnis untuk Form Monitoring MBSB (Helpdesk PIC).
 */
export class MbsbModel {
  constructor() {
    this.storageKey = 'mbsb_monitoring_logs';
  }

  /**
   * Mendapatkan tanggal hari ini dalam format standard (misal: 16-Sep-26 atau 2026-09-16)
   * @returns {string}
   */
  getTodayFormattedDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = monthNames[today.getMonth()];
    const year = String(today.getFullYear()).slice(-2); // Format e.g., 16-Sep-26 seperti spreadsheet
    return `${day}-${month}-${year}`;
  }

  /**
   * Menguji apakah salah satu modul berstatus "Gangguan"
   * @param {Object} data 
   * @returns {boolean}
   */
  hasGangguan(data) {
    const moduleFields = ['login', 'checkBalance', 'transferDana', 'fiturPembayaran'];
    return moduleFields.some(field => data[field] === 'Gangguan');
  }

  /**
   * Validasi Input Form MBSB
   * @param {Object} formData 
   * @returns {{ isValid: boolean, errors: string[], isKeteranganRequired: boolean }}
   */
  validate(formData) {
    const errors = [];
    const isKeteranganRequired = this.hasGangguan(formData);

    if (!formData.checkingTime) {
      errors.push('Checking Time (Waktu) wajib dipilih.');
    }
    if (!formData.login) {
      errors.push('Status Login wajib dipilih.');
    }
    if (!formData.checkBalance) {
      errors.push('Status Check Balance wajib dipilih.');
    }
    if (!formData.transferDana) {
      errors.push('Status Transfer Dana wajib dipilih.');
    }
    if (!formData.fiturPembayaran) {
      errors.push('Status Fitur Pembayaran wajib dipilih.');
    }
    if (!formData.pic) {
      errors.push('PIC Helpdesk wajib dipilih.');
    }

    if (isKeteranganRequired && (!formData.keterangan || formData.keterangan.trim() === '')) {
      errors.push('Kolom Keterangan WAJIB diisi karena terdapat modul berstatus "Gangguan".');
    }

    return {
      isValid: errors.length === 0,
      errors,
      isKeteranganRequired
    };
  }

  /**
   * Helper format status modul dengan emoji (misal: ✅ 3 DETIK atau ❌ GANGGUAN)
   * @param {string} val 
   * @returns {string}
   */
  formatModuleStatus(val) {
    if (!val || val === '-') return '✅ 3 DETIK';
    const clean = val.trim();
    if (clean.toLowerCase() === 'gangguan') {
      return '❌ GANGGUAN';
    }
    return `✅ ${clean.toUpperCase()}`;
  }

  /**
   * Membuat format teks rapi persis sesuai permintaan pengguna
   * @param {Object} formData 
   * @returns {string}
   */
  generateFormattedOutput(formData) {
    const time = formData.checkingTime || '13:00 WIB';
    const login = this.formatModuleStatus(formData.login);
    const checkBalance = this.formatModuleStatus(formData.checkBalance);
    const transferDana = this.formatModuleStatus(formData.transferDana);
    const fiturPembayaran = this.formatModuleStatus(formData.fiturPembayaran);

    let provider = formData.providerJaringan || 'WIFI / Kantor';
    if (provider === 'WIFI KANTOR') {
      provider = 'WIFI / Kantor';
    }

    const keterangan = formData.keterangan ? formData.keterangan.trim() : '';

    let output = `Berikut hasil Pengecekan M Banking BSB ${time}\n`;
    output += `Aktivity Keterangan \n`;
    output += `LOGIN : ${login}\n`;
    output += `Check Balance : ${checkBalance}\n`;
    output += `Transfer Dana (Sesama BSB) over booking, antar Bank, Transfer Online sama Transfer SK : ${transferDana}\n`;
    output += `Fitur pembayaran (PLN Prepaid) : ${fiturPembayaran}\n`;
    output += `Provider/Jaringan : ${provider}`;

    if (keterangan && keterangan !== '-') {
      // output += `\nKeterangan : ${keterangan}`;
    }

    return output;
  }

  /**
   * Menyimpan log monitoring baru ke LocalStorage
   * @param {Object} logData 
   * @returns {Array}
   */
  saveLog(logData) {
    const existing = this.getLogs();
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      ...logData
    };
    existing.unshift(newEntry);
    const updated = existing.slice(0, 50); // Simpan maksimal 50 log terakhir
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
    return updated;
  }

  /**
   * Mengambil seluruh log monitoring dari LocalStorage
   * @returns {Array}
   */
  getLogs() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Hapus seluruh log lokal
   */
  clearLogs() {
    localStorage.removeItem(this.storageKey);
  }
}

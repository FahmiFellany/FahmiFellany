/**
 * MbsbController
 * Controller OOP yang menjembatani MbsbModel & MbsbView.
 */
export class MbsbController {
  /**
   * @param {MbsbModel} model 
   * @param {MbsbView} view 
   */
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.init();
  }

  init() {
    // 1. Set tanggal otomatis hari ini pada input Checking Date
    const todayDate = this.model.getTodayFormattedDate();
    this.view.setCheckingDate(todayDate);

    // 2. Load tersimpan Spreadsheet ID dari LocalStorage atau Backend .env (Secured)
    const savedSpreadsheetId = localStorage.getItem('mbsb_spreadsheet_id') || '';
    if (savedSpreadsheetId) {
      this.view.setSpreadsheetId(savedSpreadsheetId);
    } else {
      this.loadConfigFromEnv();
    }

    // 3. Render log history yang sudah ada di LocalStorage
    const logs = this.model.getLogs();
    this.view.renderLogsTable(logs);

    // 4. Bind Event Listeners
    this.view.bindSubmit(() => this.handleSubmit());
    this.view.bindSendGsheet(() => this.handleSendGsheet());
    this.view.bindCopyFormatted(() => this.handleCopyFormatted());
    this.view.bindClearLogs(() => this.handleClearLogs());
  }

  async loadConfigFromEnv() {
    try {
      const res = await fetch('/api/mbsb/config');
      const data = await res.json();
      if (data.success && data.spreadsheetId) {
        this.view.setSpreadsheetId(data.spreadsheetId);
      }
    } catch (e) {
      console.warn('Gagal memuat MBSB_SPREADSHEET_ID dari backend env:', e);
    }
  }

  handleSubmit() {
    const formData = this.view.getFormData();
    const validation = this.model.validate(formData);

    if (!validation.isValid) {
      this.view.showValidationErrors(validation.errors);
      this.view.showToast('⚠️ Mohon lengkapi form sesuai aturan validasi!');
      return;
    }

    // Hilangkan banner error jika valid
    this.view.hideValidationBanner();

    // Generate teks hasil rekap
    const formattedText = this.model.generateFormattedOutput(formData);
    this.view.setOutputText(formattedText);

    // Simpan ke LocalStorage & update tabel
    const updatedLogs = this.model.saveLog(formData);
    this.view.renderLogsTable(updatedLogs);

    this.view.showToast('💾 Data Monitoring MBSB Berhasil Disimpan & Diformat!');
  }

  async handleSendGsheet() {
    const formData = this.view.getFormData();
    const validation = this.model.validate(formData);

    if (!validation.isValid) {
      this.view.showValidationErrors(validation.errors);
      this.view.showToast('⚠️ Mohon lengkapi form sebelum mengirim ke Google Sheets!');
      return;
    }

    const spreadsheetId = this.view.getSpreadsheetId();
    if (spreadsheetId) {
      localStorage.setItem('mbsb_spreadsheet_id', spreadsheetId);
    }

    this.view.showToast('⏳ Mengirim data ke Google Sheets...');

    try {
      const response = await fetch('/api/mbsb/send-gsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId, data: formData })
      });

      const resData = await response.json();
      if (resData.success) {
        this.view.showToast('✅ Data berhasil dikirim ke baris baru Google Sheets!');
      } else {
        alert(`❌ Gagal mengirim ke Google Sheets:\n${resData.error}`);
        this.view.showToast('❌ Gagal mengirim ke Google Sheets!');
      }
    } catch (err) {
      console.error('Network Error Google Sheets:', err);
      alert(`❌ Terjadi kesalahan jaringan/server:\n${err.message}`);
    }
  }

  handleCopyFormatted() {
    const formData = this.view.getFormData();
    const validation = this.model.validate(formData);

    if (!validation.isValid) {
      this.view.showValidationErrors(validation.errors);
      this.view.showToast('⚠️ Mohon lengkapi form sebelum menyalin!');
      return;
    }

    const formattedText = this.model.generateFormattedOutput(formData);
    this.view.setOutputText(formattedText);

    navigator.clipboard.writeText(formattedText).then(() => {
      this.view.showToast('📋 Hasil Monitoring MBSB disalin ke clipboard!');
    }).catch(err => {
      console.error('Gagal menyalin:', err);
    });
  }

  handleClearLogs() {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh log monitoring MBSB lokal?')) {
      this.model.clearLogs();
      this.view.renderLogsTable([]);
      this.view.showToast('🗑️ Log monitoring lokal telah dibersihkan!');
    }
  }
}

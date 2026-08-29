/**
 * SaldoController (Client-Side OOP)
 * Menghubungkan SaldoModel dan SaldoView untuk mengelola 4 Periode Saldo (Pagi, Siang, Sore, Malam),
 * Ekspor/Salin ke Excel (.xlsx/TSV), Ringkasan Status Realtime, serta CRUD Multi-Grup.
 */
export class SaldoController {
  /**
   * @param {SaldoModel} model 
   * @param {SaldoView} view 
   */
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this._init();
    this._bindEvents();
  }

  async _init() {
    // 1. Fetch data item saldo semua grup dari API/lokal
    await this.model.fetchAllGroups();

    const period = this.model.getPeriod();
    const group = this.model.getGroup(period);
    const dateStr = this.model.getDateStr(period);
    const items = this.model.getItems(period);
    const values = this.model.getValues(period);

    this.view.setDate(dateStr);
    this.view.setPeriodUI(period);
    this.view.setModalGroupActive(group);

    // Render input form items
    this.view.renderInputs(items, values, (id, val) => {
      this.model.setValue(id, val);
      this.updateOutputAndSummary();
    });

    // Render CRUD Table
    this.renderCrudTable(group);

    this.updateOutputAndSummary();
  }

  _bindEvents() {
    // Nav Tab switch
    if (this.view.navTabConverter) {
      this.view.navTabConverter.addEventListener('click', () => {
        this.view.switchTab('converter');
      });
    }

    if (this.view.navTabOcr) {
      this.view.navTabOcr.addEventListener('click', () => {
        this.view.switchTab('ocr');
      });
    }

    if (this.view.navTabExcel) {
      this.view.navTabExcel.addEventListener('click', () => {
        this.view.switchTab('excel');
      });
    }

    if (this.view.navTabSaldo) {
      this.view.navTabSaldo.addEventListener('click', () => {
        this.view.switchTab('saldo');
        this.updateOutputAndSummary();
      });
    }

    // Period Change (Pagi, Siang, Sore, Malam)
    this.view.bindPeriodChange((period) => {
      this.model.setPeriod(period);
      const group = this.model.getGroup(period);
      const dateStr = this.model.getDateStr(period);
      const items = this.model.getItems(period);
      const values = this.model.getValues(period);

      this.view.setPeriodUI(period);
      this.view.setDate(dateStr);
      this.view.setModalGroupActive(group);

      this.view.renderInputs(items, values, (id, val) => {
        this.model.setValue(id, val);
        this.updateOutputAndSummary();
      });

      this.renderCrudTable(group);
      this.updateOutputAndSummary();
      this.view.showToast(`🔄 Info Saldo ${period} diperbarui`);
    });

    // Date Change
    this.view.bindDateChange((dateStr) => {
      this.model.setDateStr(dateStr);
      this.updateOutputAndSummary();
    });

    // Copy Broadcast Format Output
    this.view.bindCopy(async () => {
      const output = this.view.getOutputText();
      if (!output) {
        this.view.showToast('⚠️ Belum ada hasil output untuk disalin');
        return;
      }
      try {
        await navigator.clipboard.writeText(output);
        this.view.showToast('📋 Format Pesan Broadcast berhasil disalin ke clipboard!');
      } catch (e) {
        const textarea = document.createElement('textarea');
        textarea.value = output;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.view.showToast('📋 Format Pesan Broadcast berhasil disalin!');
      }
    });

    // Copy Excel Format (TSV Baris 2)
    this.view.bindCopyExcel(async () => {
      const period = this.model.getPeriod();
      const tsvData = this.model.generateExcelTsv(period);

      if (!tsvData.valueRow || tsvData.valueRow.replace(/\t/g, '').trim() === '') {
        this.view.showToast('⚠️ Tidak ada data saldo terisi untuk disalin ke Excel');
        return;
      }

      try {
        await navigator.clipboard.writeText(tsvData.valueRow);
        this.view.showToast('📋 Nilai Saldo (Baris 2) tersalin! Tempel langsung di Excel (Ctrl+V).');
      } catch (e) {
        const textarea = document.createElement('textarea');
        textarea.value = tsvData.valueRow;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.view.showToast('📋 Nilai Saldo (Baris 2) tersalin ke clipboard!');
      }
    });

    // Export .XLSX Workbook
    this.view.bindExportExcel(() => {
      const period = this.model.getPeriod();
      try {
        const fileName = this.model.exportExcelWorkbook(period);
        this.view.showToast(`📥 File "${fileName}" berhasil diunduh!`);
      } catch (err) {
        console.error('Error exporting Excel file:', err);
        this.view.showToast(`❌ Gagal mengekspor file Excel: ${err.message || err}`);
      }
    });

    // Clear Form
    this.view.bindClear(() => {
      const period = this.model.getPeriod();
      if (confirm(`Apakah Anda yakin ingin mengosongkan semua isian Saldo ${period}?`)) {
        this.model.clearValues(period);
        const items = this.model.getItems(period);
        this.view.setInputValues(items, {});
        this.updateOutputAndSummary();
        this.view.showToast(`🗑️ Form Saldo ${period} berhasil dibersihkan`);
      }
    });

    // Modal Group Tab switch inside CRUD modal
    this.view.bindModalGroupTab((group) => {
      this.view.resetCrudForm();
      this.renderCrudTable(group);
    });

    // CRUD: Form Submit (Tambah / Edit)
    this.view.bindCrudFormSubmit(async (formData, isEditing, group) => {
      try {
        if (!formData.label) {
          this.view.showToast('⚠️ Label / Nama Saldo wajib diisi');
          return;
        }

        if (isEditing) {
          await this.model.updateItem(formData.id, {
            label: formData.label,
            description: formData.description
          }, group);
          this.view.showToast('✅ Item saldo berhasil diperbarui');
        } else {
          await this.model.createItem({
            label: formData.label,
            description: formData.description
          }, group);
          this.view.showToast('✅ Item saldo baru berhasil ditambahkan');
        }

        this.view.resetCrudForm();
        this.syncInputsAndOutput();
        this.renderCrudTable(group);
      } catch (err) {
        this.view.showToast(`❌ ${err.message || 'Gagal menyimpan item saldo'}`);
      }
    });

    // CRUD: Cancel Edit
    this.view.bindCrudCancel(() => {
      // Form reset handled in view
    });

    // CRUD: Search Filter
    this.view.bindCrudSearchInput(() => {
      this.renderCrudTable(this.view.activeModalGroup);
    });

    // CRUD: Reset Defaults
    this.view.bindCrudResetDefaults(async (group) => {
      try {
        await this.model.resetDefaults(group);
        this.view.resetCrudForm();
        this.syncInputsAndOutput();
        this.renderCrudTable(group);
        this.view.showToast(`🔄 Item saldo (${group}) berhasil di-reset ke default`);
      } catch (err) {
        this.view.showToast(`❌ ${err.message || 'Gagal me-reset item default'}`);
      }
    });
  }

  renderCrudTable(group = this.view.activeModalGroup) {
    const items = this.model.groupItems[group] || [];
    this.view.renderCrudTable(
      items,
      (item) => this.handleEditItem(item),
      (item) => this.handleDeleteItem(item, group)
    );
  }

  handleEditItem(item) {
    this.view.setCrudEditMode(item);
  }

  async handleDeleteItem(item, group = this.view.activeModalGroup) {
    if (confirm(`Apakah Anda yakin ingin menghapus "${item.label}" dari grup ini?`)) {
      try {
        await this.model.deleteItem(item.id, group);
        this.view.resetCrudForm();
        this.syncInputsAndOutput();
        this.renderCrudTable(group);
        this.view.showToast(`🗑️ "${item.label}" berhasil dihapus`);
      } catch (err) {
        this.view.showToast(`❌ ${err.message || 'Gagal menghapus item saldo'}`);
      }
    }
  }

  syncInputsAndOutput() {
    const period = this.model.getPeriod();
    const items = this.model.getItems(period);
    const values = this.model.getValues(period);

    this.view.renderInputs(items, values, (id, val) => {
      this.model.setValue(id, val);
      this.updateOutputAndSummary();
    });

    this.updateOutputAndSummary();
  }

  updateOutputAndSummary() {
    const period = this.model.getPeriod();
    const text = this.model.generateOutput(period);
    this.view.setOutputText(text);

    // Update Status Summary
    const summary = this.model.getStatusSummary(period);
    this.view.renderSummary(summary);
  }

  /**
   * Menerima teks yang dialihkan dari tab lain secara otomatis
   * @param {string} text 
   */
  receiveTransferredText(text) {
    this.view.switchTab('saldo');
    this.view.showToast('✨ Beralih ke menu Update Info Saldo!');
  }
}


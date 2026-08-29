/**
 * ExcelConverterController
 * Menghubungkan ExcelConverterModel dan ExcelConverterView serta menangani event UI.
 */
export class ExcelConverterController {
  /**
   * @param {ExcelConverterModel} model
   * @param {ExcelConverterView} view
   */
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.initEvents();
    // Render initial empty state
    this.convertAndRender();
  }

  initEvents() {
    // 1. Tab Navigasi
    if (this.view.navTabExcel) {
      this.view.navTabExcel.addEventListener('click', () => {
        this.view.switchTab('excel');
      });
    }

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

    if (this.view.navTabSaldo) {
      this.view.navTabSaldo.addEventListener('click', () => {
        this.view.switchTab('saldo');
      });
    }

    // 2. Real-Time Typing & Input
    if (this.view.inputText) {
      this.view.inputText.addEventListener('input', () => {
        if (this.view.isAutoConvert()) {
          this.convertAndRender();
        }
      });
    }

    // 3. Opsi Perubahan Format (Dropdown)
    if (this.view.valueFormat) {
      this.view.valueFormat.addEventListener('change', () => {
        this.convertAndRender();
      });
    }

    if (this.view.headerFormat) {
      this.view.headerFormat.addEventListener('change', () => {
        this.convertAndRender();
      });
    }

    // 4. Tombol Konversi Manual
    if (this.view.btnConvert) {
      this.view.btnConvert.addEventListener('click', () => {
        this.convertAndRender();
        this.view.showToast('Data berhasil dikonversi ke format Excel!');
      });
    }

    // 5. Tombol Muat Contoh Data
    if (this.view.btnSample) {
      this.view.btnSample.addEventListener('click', () => {
        const sample = this.model.getSampleInput();
        this.view.setInputText(sample);
        this.convertAndRender();
        this.view.showToast('Contoh teks saldo berhasil dimuat!');
      });
    }

    // 6. Tombol Bersihkan Form
    if (this.view.btnClear) {
      this.view.btnClear.addEventListener('click', () => {
        this.view.clearAll();
        this.convertAndRender();
        this.view.showToast('Form berhasil dibersihkan');
      });
    }

    // 7. Tombol Salin Format Excel (Baris 2 saja - Nilai Saldo)
    if (this.view.btnCopyTsv) {
      this.view.btnCopyTsv.addEventListener('click', () => {
        const text = this.view.getInputText();
        const options = this.view.getOptions();
        const result = this.model.parseText(text, options);

        if (!result.tsvRow2Only || result.matchedCount === 0) {
          this.view.showToast('Tidak ada data saldo untuk disalin', true);
          return;
        }

        navigator.clipboard.writeText(result.tsvRow2Only).then(() => {
          this.view.showToast('Nilai Saldo (Baris 2) tersalin! Tempel langsung di Excel (Ctrl+V).');
        }).catch(err => {
          console.error('Gagal menyalin:', err);
          this.view.showToast('Gagal menyalin data ke clipboard', true);
        });
      });
    }

    // 9. Modal CRUD Kolom Excel
    if (this.view.btnManageColumns) {
      this.view.btnManageColumns.addEventListener('click', () => {
        this.openColumnsModal();
      });
    }

    if (this.view.btnCloseColumnsModal) {
      this.view.btnCloseColumnsModal.addEventListener('click', () => {
        this.view.closeColumnsModal();
      });
    }

    if (this.view.columnsBackdrop) {
      this.view.columnsBackdrop.addEventListener('click', () => {
        this.view.closeColumnsModal();
      });
    }

    // 10. Form Submit Tambah / Edit Kolom
    if (this.view.columnForm) {
      this.view.columnForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleColumnFormSubmit();
      });
    }

    // 11. Tombol Batal Edit
    if (this.view.btnCancelEdit) {
      this.view.btnCancelEdit.addEventListener('click', () => {
        this.view.resetColumnForm();
      });
    }

    // 12. Tombol Reset ke Default
    if (this.view.btnResetColumns) {
      this.view.btnResetColumns.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin mereset daftar kolom ke 21 kolom default bawaan?')) {
          this.model.resetColumnsToDefault();
          this.refreshColumnsTable();
          this.convertAndRender();
          this.view.showToast('Kolom berhasil direset ke 21 kolom default!');
        }
      });
    }

    // Keyboard ESC to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.view.columnsModal && this.view.columnsModal.style.display !== 'none') {
        this.view.closeColumnsModal();
      }
    });

    // 13. Tombol Download File .XLSX
    if (this.view.btnDownloadXlsx) {
      this.view.btnDownloadXlsx.addEventListener('click', () => {
        this.downloadXlsx();
      });
    }

    // 10. Tombol Download File .CSV
    if (this.view.btnDownloadCsv) {
      this.view.btnDownloadCsv.addEventListener('click', () => {
        this.downloadCsv();
      });
    }
  }

  convertAndRender() {
    const text = this.view.getInputText();
    const options = this.view.getOptions();
    const result = this.model.parseText(text, options);
    this.view.renderResults(result);
  }

  downloadXlsx() {
    const text = this.view.getInputText();
    const options = this.view.getOptions();
    const result = this.model.parseText(text, options);

    if (result.matchedCount === 0) {
      this.view.showToast('Masukkan atau konversi teks saldo terlebih dahulu', true);
      return;
    }

    const dataMatrix = [
      result.row1Headers,
      result.row2Values
    ];

    if (typeof XLSX !== 'undefined') {
      try {
        const ws = XLSX.utils.aoa_to_sheet(dataMatrix);
        
        // Auto adjust column widths
        const colWidths = result.row1Headers.map((h, i) => {
          const v = result.row2Values[i] || '';
          return { wch: Math.max(h.length, v.length, 15) };
        });
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Saldo Broadcast');

        const fileName = `Laporan_Saldo_Excel_${this.formatDateForFileName(new Date())}.xlsx`;
        XLSX.writeFile(wb, fileName);
        this.view.showToast('File Excel (.xlsx) berhasil diunduh!');
      } catch (e) {
        console.error('Error XLSX export:', e);
        this.downloadCsvFallback(result.csv);
      }
    } else {
      this.downloadCsvFallback(result.csv);
    }
  }

  downloadCsv() {
    const text = this.view.getInputText();
    const options = this.view.getOptions();
    const result = this.model.parseText(text, options);

    if (result.matchedCount === 0) {
      this.view.showToast('Masukkan atau konversi teks saldo terlebih dahulu', true);
      return;
    }

    this.downloadCsvFallback(result.csv);
  }

  downloadCsvFallback(csvContent) {
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Saldo_${this.formatDateForFileName(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.view.showToast('File .csv berhasil diunduh!');
  }

  formatDateForFileName(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}${mm}${dd}_${hh}${min}`;
  }

  // =========================================================
  // COLUMN CRUD CONTROLLER METHODS
  // =========================================================

  openColumnsModal() {
    this.refreshColumnsTable();
    this.view.openColumnsModal();
  }

  refreshColumnsTable() {
    const columns = this.model.getAllColumns();
    this.view.renderColumnsTable(
      columns,
      (colItem) => this.handleEditColumn(colItem),
      (colItem) => this.handleDeleteColumn(colItem)
    );
  }

  handleColumnFormSubmit() {
    const formData = this.view.getColumnFormData();
    if (!formData.cleanHeader || !formData.keywords) {
      this.view.showToast('Header bersih dan kata kunci wajib diisi!', true);
      return;
    }

    if (formData.id) {
      // Update
      const success = this.model.updateColumn(formData.id, formData);
      if (success) {
        this.view.showToast(`Kolom "${formData.cleanHeader}" berhasil diperbarui!`);
      } else {
        this.view.showToast('Gagal memperbarui kolom', true);
      }
    } else {
      // Add New
      const newCol = this.model.addColumn(formData);
      this.view.showToast(`Kolom "${newCol.cleanHeader}" berhasil ditambahkan!`);
    }

    this.view.resetColumnForm();
    this.refreshColumnsTable();
    this.convertAndRender();
  }

  handleEditColumn(colItem) {
    this.view.fillColumnFormForEdit(colItem);
    if (this.view.colCleanHeader) {
      this.view.colCleanHeader.focus();
    }
  }

  handleDeleteColumn(colItem) {
    if (confirm(`Apakah Anda yakin ingin menghapus Kolom ${colItem.col} (${colItem.cleanHeader})?`)) {
      this.model.deleteColumn(colItem.id);
      this.refreshColumnsTable();
      this.convertAndRender();
      this.view.showToast(`Kolom "${colItem.cleanHeader}" berhasil dihapus!`);
    }
  }
}

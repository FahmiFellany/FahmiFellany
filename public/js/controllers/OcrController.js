/**
 * OcrController
 * Menghubungkan OcrModel dan OcrView serta menangani event UI.
 */
export class OcrController {
  /**
   * @param {OcrModel} model 
   * @param {OcrView} view 
   */
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Bersihkan form OCR / Pengecekan Transaksi saat inisialisasi / refresh
    this.view.clearAll();

    this.initEvents();
  }

  initEvents() {
    // 1. Tab Navigasi Navbar
    if (this.view.navTabConverter) {
      this.view.navTabConverter.addEventListener('click', () => {
        this.view.clearAll();
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
        this.view.clearAll();
        this.view.switchTab('excel');
      });
    }

    if (this.view.navTabSaldo) {
      this.view.navTabSaldo.addEventListener('click', () => {
        this.view.clearAll();
        this.view.switchTab('saldo');
      });
    }

    // 1b. Change Event Kategori Transaksi
    if (this.view.categorySelect) {
      this.view.categorySelect.addEventListener('change', () => {
        const isAuto = this.view.categorySelect.value === 'auto';
        this.extractAndRender(isAuto);
      });
    }

    // 2. Browse File & File Input Change
    if (this.view.btnBrowse && this.view.fileInput) {
      this.view.btnBrowse.addEventListener('click', () => {
        this.view.fileInput.click();
      });

      this.view.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.processImageFile(file);
        }
      });
    }

    // 3. Drag & Drop Gambar
    if (this.view.dropzone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        this.view.dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.view.dropzone.classList.add('drag-over');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        this.view.dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.view.dropzone.classList.remove('drag-over');
        });
      });

      this.view.dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          const file = files[0];
          if (file.type.startsWith('image/')) {
            this.processImageFile(file);
          } else {
            this.view.showToast('Harap unggah file gambar (PNG, JPG, JPEG, WebP)', true);
          }
        }
      });
    }

    // 4. Paste dari Clipboard (Ctrl + V)
    document.addEventListener('paste', (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            this.view.switchTab('ocr');
            this.processImageFile(file);
            this.view.showToast('Gambar dari Clipboard terdeteksi!');
            break;
          }
        }
      }
    });

    // 5. Remove Image Preview
    if (this.view.btnRemoveImage) {
      this.view.btnRemoveImage.addEventListener('click', () => {
        this.view.setImagePreview(null);
        if (this.view.fileInput) this.view.fileInput.value = '';
      });
    }

    // 5b. Zoom Fullscreen Modal Event Handlers
    if (this.view.btnZoomModal) {
      this.view.btnZoomModal.addEventListener('click', () => {
        this.view.openZoomModal();
      });
    }

    if (this.view.previewBoxClick) {
      this.view.previewBoxClick.addEventListener('click', () => {
        this.view.openZoomModal();
      });
    }

    if (this.view.btnCloseZoom) {
      this.view.btnCloseZoom.addEventListener('click', () => {
        this.view.closeZoomModal();
      });
    }

    if (this.view.zoomBackdrop) {
      this.view.zoomBackdrop.addEventListener('click', () => {
        this.view.closeZoomModal();
      });
    }

    if (this.view.btnZoomIn) {
      this.view.btnZoomIn.addEventListener('click', () => {
        this.view.setZoomScale(this.view.zoomScale + 0.3);
      });
    }

    if (this.view.btnZoomOut) {
      this.view.btnZoomOut.addEventListener('click', () => {
        this.view.setZoomScale(this.view.zoomScale - 0.3);
      });
    }

    if (this.view.btnZoomReset) {
      this.view.btnZoomReset.addEventListener('click', () => {
        this.view.setZoomScale(1);
      });
    }

    // 6. Typing / Input / Paste di Raw Textarea (Auto-detect & Real-time update)
    if (this.view.rawTextarea) {
      this.view.rawTextarea.addEventListener('input', () => {
        this.extractAndRender(true);
      });
      this.view.rawTextarea.addEventListener('paste', () => {
        setTimeout(() => {
          this.extractAndRender(true);
        }, 30);
      });
    }

    // 7. Tombol Ekstrak Data
    if (this.view.btnExtract) {
      this.view.btnExtract.addEventListener('click', () => {
        this.extractAndRender(true);
        this.view.showToast('Data berhasil diekstrak!');
      });
    }

    // 8. Tombol Salin (Copy)
    if (this.view.btnCopy) {
      this.view.btnCopy.addEventListener('click', () => {
        const text = this.view.formattedTextarea ? this.view.formattedTextarea.value : '';
        if (!text.trim()) {
          this.view.showToast('Tidak ada teks hasil konversi untuk disalin', true);
          return;
        }

        navigator.clipboard.writeText(text).then(() => {
          this.view.showToast('Hasil konversi tersalin ke clipboard!');
        }).catch(err => {
          console.error('Gagal menyalin:', err);
          this.view.showToast('Gagal menyalin teks', true);
        });
      });
    }

    // 9. Tombol Download (.txt)
    if (this.view.btnDownload) {
      this.view.btnDownload.addEventListener('click', () => {
        const text = this.view.formattedTextarea ? this.view.formattedTextarea.value : '';
        if (!text.trim()) {
          this.view.showToast('Tidak ada data untuk diunduh', true);
          return;
        }

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hasil_ekstraksi_${this.view.getCategory()}_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.view.showToast('File hasil (.txt) berhasil diunduh!');
      });
    }

    // 10. Tombol Hapus (Clear)
    if (this.view.btnClear) {
      this.view.btnClear.addEventListener('click', () => {
        this.view.clearAll();
        this.view.showToast('Form berhasil dibersihkan');
      });
    }
  }

  /**
   * Memproses file gambar melalui OCR Tesseract.js
   * @param {File} file 
   */
  async processImageFile(file) {
    if (!file.type.startsWith('image/')) {
      this.view.showToast('File yang dipilih harus berupa gambar', true);
      return;
    }

    // Preview Gambar
    const reader = new FileReader();
    reader.onload = (e) => {
      this.view.setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Jalankan OCR
    try {
      this.view.showProgress(0, 'Menyiapkan mesin OCR...');
      const rawText = await this.model.recognizeImage(file, (percent, statusMsg) => {
        this.view.showProgress(percent, statusMsg);
      });

      this.view.hideProgress();
      this.view.setRawText(rawText);
      this.extractAndRender(true);
      this.view.showToast('OCR Selesai! Data transaksi terdeteksi.');
    } catch (error) {
      this.view.hideProgress();
      console.error(error);
      this.view.showToast(`Error OCR: ${error.message || 'Gagal membaca gambar'}`, true);
    }
  }

  /**
   * Mengambil teks mentah dan mengurai field target berdasarkan kategori transaksi aktif atau auto-detect
   * @param {boolean} autoDetect - Apakah menjalankan auto-detect kategori
   */
  extractAndRender(autoDetect = true) {
    const rawText = this.view.getRawText();
    let currentCategory = this.view.getCategory();

    if (autoDetect || currentCategory === 'auto') {
      const detected = this.model.detectCategory(rawText);
      if (detected) {
        currentCategory = detected;
        const title = this.model.getCategoryTitle(detected);
        this.view.setCategoryValue(detected, true, title);
      } else if (currentCategory === 'auto') {
        currentCategory = 'prepaid';
        this.view.hideAutoBadge();
      }
    } else {
      this.view.hideAutoBadge();
    }

    const result = this.model.parseText(rawText, currentCategory);
    this.view.renderResults(result);
  }

  /**
   * Menerima teks yang dialihkan dari tab lain secara otomatis
   * @param {string} text 
   */
  receiveTransferredText(text) {
    this.view.switchTab('ocr');
    this.view.setRawText(text);
    this.extractAndRender(true);
    this.view.showToast('✨ Data transaksi dialihkan & diurai otomatis!');
  }
}


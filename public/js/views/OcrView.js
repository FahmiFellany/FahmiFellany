/**
 * OcrView
 * Menangani rendering UI, pratinjau gambar HD Zoom, progress bar OCR, dan komponen hasil ekstraksi.
 */
export class OcrView {
  constructor() {
    this.dropzone = document.getElementById('ocrDropzone');
    this.fileInput = document.getElementById('ocrFileInput');
    this.btnBrowse = document.getElementById('ocrBtnBrowse');
    this.categorySelect = document.getElementById('ocrCategorySelect');
    this.autoBadge = document.getElementById('ocrAutoBadge');
    this.autoBadgeText = document.getElementById('ocrAutoBadgeText');

    // Pratinjau & Zoom Elements
    this.previewContainer = document.getElementById('ocrPreviewContainer');
    this.previewImg = document.getElementById('ocrPreviewImg');
    this.previewBoxClick = document.getElementById('ocrPreviewBoxClick');
    this.btnZoomModal = document.getElementById('ocrBtnZoomModal');
    this.btnRemoveImage = document.getElementById('ocrBtnRemoveImg');

    // Modal Zoom Fullscreen
    this.zoomModal = document.getElementById('ocrZoomModal');
    this.zoomBackdrop = document.getElementById('ocrZoomBackdrop');
    this.zoomImg = document.getElementById('ocrZoomImg');
    this.btnZoomIn = document.getElementById('ocrBtnZoomIn');
    this.btnZoomOut = document.getElementById('ocrBtnZoomOut');
    this.btnZoomReset = document.getElementById('ocrBtnZoomReset');
    this.btnCloseZoom = document.getElementById('ocrBtnCloseZoom');
    this.zoomScale = 1;

    // Progress Elements
    this.progressContainer = document.getElementById('ocrProgressContainer');
    this.progressBar = document.getElementById('ocrProgressBar');
    this.progressStatus = document.getElementById('ocrProgressStatus');

    // Form Elements
    this.rawTextarea = document.getElementById('ocrRawText');
    this.formattedTextarea = document.getElementById('ocrFormattedText');
    this.fieldCardsContainer = document.getElementById('ocrFieldCards');
    this.badgeCount = document.getElementById('ocrBadge');

    this.btnExtract = document.getElementById('ocrBtnExtract');
    this.btnCopy = document.getElementById('ocrBtnCopy');
    this.btnDownload = document.getElementById('ocrBtnDownload');
    this.btnClear = document.getElementById('ocrBtnClear');

    // Tab Navigasi Navbar
    this.navTabConverter = document.getElementById('navTabConverter');
    this.navTabOcr = document.getElementById('navTabOcr');
    this.navTabExcel = document.getElementById('navTabExcel');
    this.navTabSaldo = document.getElementById('navTabSaldo');
    this.viewConverter = document.getElementById('viewConverter');
    this.viewOcr = document.getElementById('viewOcr');
    this.viewExcel = document.getElementById('viewExcel');
    this.viewSaldo = document.getElementById('viewSaldo');
  }

  getCategory() {
    return this.categorySelect ? this.categorySelect.value : 'auto';
  }

  setCategoryValue(category, isAuto = false, title = '') {
    if (this.categorySelect) {
      this.categorySelect.value = category;
    }
    if (isAuto && this.autoBadge) {
      this.autoBadge.style.display = 'inline-flex';
      if (this.autoBadgeText) {
        this.autoBadgeText.textContent = title || category;
      }
    } else {
      this.hideAutoBadge();
    }
  }

  showAutoBadge(title) {
    if (this.autoBadge) {
      this.autoBadge.style.display = 'inline-flex';
      if (this.autoBadgeText) {
        this.autoBadgeText.textContent = title;
      }
    }
  }

  hideAutoBadge() {
    if (this.autoBadge) {
      this.autoBadge.style.display = 'none';
    }
  }

  switchTab(tabName) {
    const tabs = [
      { name: 'converter', tab: this.navTabConverter, view: this.viewConverter, display: 'flex' },
      { name: 'ocr', tab: this.navTabOcr, view: this.viewOcr, display: 'block' },
      { name: 'saldo', tab: this.navTabSaldo, view: this.viewSaldo, display: 'block' }
    ];

    tabs.forEach(item => {
      if (item.name === tabName) {
        if (item.tab) item.tab.classList.add('active');
        if (item.view) item.view.style.display = item.display;
      } else {
        if (item.tab) item.tab.classList.remove('active');
        if (item.view) item.view.style.display = 'none';
      }
    });

    // Otomatis bersihkan form Pengecekan Transaksi (Salin Teks) jika berpindah ke form lain
    if (tabName !== 'ocr') {
      this.clearAll();
    }
  }

  showProgress(percent, statusText) {
    if (this.progressContainer) this.progressContainer.style.display = 'flex';
    if (this.progressBar) this.progressBar.style.width = `${percent}%`;
    if (this.progressStatus) this.progressStatus.textContent = statusText;
  }

  hideProgress() {
    if (this.progressContainer) this.progressContainer.style.display = 'none';
    if (this.progressBar) this.progressBar.style.width = '0%';
  }

  setImagePreview(src) {
    if (src) {
      if (this.previewImg) this.previewImg.src = src;
      if (this.previewContainer) this.previewContainer.style.display = 'block';
    } else {
      if (this.previewImg) this.previewImg.src = '';
      if (this.previewContainer) this.previewContainer.style.display = 'none';
      this.closeZoomModal();
    }
  }

  openZoomModal() {
    if (this.previewImg && this.previewImg.src && this.zoomModal && this.zoomImg) {
      this.zoomImg.src = this.previewImg.src;
      this.zoomScale = 1;
      this.zoomImg.style.transform = `scale(1)`;
      this.zoomModal.style.display = 'flex';
    }
  }

  closeZoomModal() {
    if (this.zoomModal) {
      this.zoomModal.style.display = 'none';
    }
  }

  setZoomScale(scale) {
    this.zoomScale = Math.min(4, Math.max(0.5, scale));
    if (this.zoomImg) {
      this.zoomImg.style.transform = `scale(${this.zoomScale})`;
    }
  }

  renderResults(parsedResult) {
    const { formattedOutput, items, totalExpected } = parsedResult;

    if (this.formattedTextarea) {
      this.formattedTextarea.value = formattedOutput;
    }

    // Render badge count
    const foundCount = items.filter(i => i.found && i.value).length;
    const maxCount = totalExpected || 11;
    if (this.badgeCount) {
      this.badgeCount.textContent = `${foundCount} / ${maxCount} field terdeteksi`;
    }

    // Render Field Cards (jika container ada)
    if (this.fieldCardsContainer) {
      this.fieldCardsContainer.innerHTML = '';
      items.forEach(item => {
        const card = document.createElement('div');
        const isFound = item.found && item.value;
        card.className = `field-card ${isFound ? 'found' : 'missing'}`;
        card.innerHTML = `
          <div class="field-card-header">
            <span class="field-label">${this.escapeHtml(item.labelName)} :</span>
            <span class="field-key-tag">${this.escapeHtml(item.key)}</span>
          </div>
          <div class="field-value">${isFound ? this.escapeHtml(item.value) : '<span class="empty-val">(tidak terdeteksi)</span>'}</div>
        `;
        this.fieldCardsContainer.appendChild(card);
      });
    }
  }

  getRawText() {
    return this.rawTextarea ? this.rawTextarea.value : '';
  }

  setRawText(text) {
    if (this.rawTextarea) {
      this.rawTextarea.value = text;
    }
  }

  clearAll() {
    if (this.rawTextarea) this.rawTextarea.value = '';
    if (this.formattedTextarea) this.formattedTextarea.value = '';
    if (this.fileInput) this.fileInput.value = '';
    if (this.categorySelect) this.categorySelect.value = 'auto';
    this.hideAutoBadge();
    this.setImagePreview(null);
    this.hideProgress();
    if (this.badgeCount) this.badgeCount.textContent = '0 field terdeteksi';
    if (this.fieldCardsContainer) this.fieldCardsContainer.innerHTML = '';
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  showToast(message, isError = false) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.background = isError ? '#ef4444' : '#10b981';
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
}

/**
 * ConverterView
 * View Client-Side OOP untuk mengelola interaksi DOM, Badge Status, Smart Suggestions,
 * Drag & Drop File Log, Smart Rephrase, dan Integrasi Lintas Menu.
 */
export class ConverterView {
  constructor() {
    // Area Input & Kontrol
    this.inputText = document.getElementById('inputText');
    this.outputText = document.getElementById('outputText');
    this.btnConvert = document.getElementById('btnConvert');
    this.btnClear = document.getElementById('btnClear');
    this.btnCopy = document.getElementById('btnCopy');
    this.btnCopyAndReset = document.getElementById('btnCopyAndReset');
    this.autoClearOnCopy = document.getElementById('autoClearOnCopy');
    this.btnDownload = document.getElementById('btnDownload');
    this.btnPreset1 = document.getElementById('btnPreset1');
    this.btnPreset2 = document.getElementById('btnPreset2');
    this.timezoneOffset = document.getElementById('timezoneOffset');
    this.wrapperStyle = document.getElementById('wrapperStyle');
    this.autoConvert = document.getElementById('autoConvert');
    this.autoCleanDuplicates = document.getElementById('autoCleanDuplicates');
    this.matchBadge = document.getElementById('matchBadge');
    this.toast = document.getElementById('toast');
    this.toastTimer = null;

    // Drag & Drop & Upload File Components
    this.converterDropzone = document.getElementById('converterDropzone');
    this.converterFileInput = document.getElementById('converterFileInput');
    this.btnUploadLogFile = document.getElementById('btnUploadLogFile');

    // AI Components & Panels
    this.aiWarningBanner = document.getElementById('aiWarningBanner');
    this.smartSuggestionsPanel = document.getElementById('smartSuggestionsPanel');
    this.smartSuggestionsChips = document.getElementById('smartSuggestionsChips');

    // Cross-Menu Navigation Banner
    this.crossMenuBanner = document.getElementById('crossMenuBanner');
    this.crossMenuTitle = document.getElementById('crossMenuTitle');
    this.crossMenuDesc = document.getElementById('crossMenuDesc');
    this.btnCrossMenuSwitch = document.getElementById('btnCrossMenuSwitch');
    this.btnCrossMenuDismiss = document.getElementById('btnCrossMenuDismiss');
    this.crossMenuHandler = null;

    // Tab Navigasi Navbar & Views
    this.navTabConverter = document.getElementById('navTabConverter');
    this.navTabOcr = document.getElementById('navTabOcr');
    this.navTabSaldo = document.getElementById('navTabSaldo');
    this.viewConverter = document.getElementById('viewConverter');
    this.viewOcr = document.getElementById('viewOcr');
    this.viewSaldo = document.getElementById('viewSaldo');

    this._initBannerEvents();
  }

  _initBannerEvents() {
    if (this.btnCrossMenuDismiss) {
      this.btnCrossMenuDismiss.addEventListener('click', () => {
        this.hideCrossMenuBanner();
      });
    }
  }

  clearAll() {
    this.setInputText('');
    this.setOutputText('');
    this.updateMatchBadge(0);
    this.hideWarningBanner();
    this.hideSmartSuggestions();
    this.hideCrossMenuBanner();
  }

  // Getters
  getInputText() {
    return this.inputText ? this.inputText.value : '';
  }

  getTimezoneOffset() {
    return this.timezoneOffset ? this.timezoneOffset.value : '1s';
  }

  getWrapperStyle() {
    return this.wrapperStyle ? this.wrapperStyle.value : 'symbol';
  }

  isAutoConvertChecked() {
    return this.autoConvert ? this.autoConvert.checked : true;
  }

  isAutoCleanDuplicatesChecked() {
    return this.autoCleanDuplicates ? this.autoCleanDuplicates.checked : true;
  }

  isAutoClearOnCopyChecked() {
    return this.autoClearOnCopy ? this.autoClearOnCopy.checked : false;
  }

  // Setters
  setInputText(text) {
    if (this.inputText) this.inputText.value = text;
  }

  setOutputText(text) {
    if (this.outputText) this.outputText.value = text;
  }

  /**
   * Update Badge Status Tanggal Terkonversi & Pembersihan Chat
   * @param {number} count
   * @param {number} cleanedDupCount
   */
  updateMatchBadge(count = 0, cleanedDupCount = 0) {
    if (this.matchBadge) {
      let badgeText = `${count} tanggal dikonversi`;
      if (cleanedDupCount > 0) {
        badgeText += ` • ✨ ${cleanedDupCount} duplikat dibersihkan`;
      }
      this.matchBadge.textContent = badgeText;
      this.matchBadge.className = 'match-count-badge';
    }
  }

  updateAiBadge(info = {}) {
    const count = typeof info === 'number' ? info : (info.count || 0);
    const cleanedDupCount = typeof info === 'object' ? (info.cleanedDupCount || 0) : 0;
    this.updateMatchBadge(count, cleanedDupCount);
  }

  hideWarningBanner() {
    if (this.aiWarningBanner) {
      this.aiWarningBanner.style.display = 'none';
      this.aiWarningBanner.innerHTML = '';
    }
  }

  renderWarnings() {
    this.hideWarningBanner();
  }

  /**
   * Render Smart Quick-Actions Suggestions (Chip Rekomendasi Template)
   * @param {Array<{ key: string, label: string, reason: string }>} suggestions 
   * @param {Function} onSelect 
   */
  renderSmartSuggestions(suggestions = [], onSelect = null) {
    if (!this.smartSuggestionsPanel || !this.smartSuggestionsChips) return;

    if (!suggestions || suggestions.length === 0) {
      this.hideSmartSuggestions();
      return;
    }

    this.smartSuggestionsChips.innerHTML = '';
    suggestions.forEach(item => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'smart-action-chip';
      chip.title = `${item.reason} -> Terapkan ${item.key}: ${item.label}`;
      chip.innerHTML = `
        <span class="smart-chip-sparkle">✨</span>
        <span class="smart-chip-label">Terapkan Template: <strong>${this._escapeHtml(item.key)}</strong> (${this._escapeHtml(item.label)})</span>
      `;
      chip.addEventListener('click', () => {
        if (onSelect) onSelect(item.key);
      });
      this.smartSuggestionsChips.appendChild(chip);
    });

    this.smartSuggestionsPanel.style.display = 'block';
  }

  hideSmartSuggestions() {
    if (this.smartSuggestionsPanel) {
      this.smartSuggestionsPanel.style.display = 'none';
      if (this.smartSuggestionsChips) this.smartSuggestionsChips.innerHTML = '';
    }
  }

  /**
   * Tampilkan banner floating navigasi lintas menu
   * @param {{ targetTab: string, title: string, description: string }} info 
   * @param {Function} onSwitch 
   */
  showCrossMenuBanner(info, onSwitch) {
    if (!this.crossMenuBanner || !info) return;

    if (this.crossMenuTitle) this.crossMenuTitle.textContent = info.title;
    if (this.crossMenuDesc) this.crossMenuDesc.textContent = info.description;

    if (this.btnCrossMenuSwitch) {
      const newBtn = this.btnCrossMenuSwitch.cloneNode(true);
      this.btnCrossMenuSwitch.parentNode.replaceChild(newBtn, this.btnCrossMenuSwitch);
      this.btnCrossMenuSwitch = newBtn;

      this.btnCrossMenuSwitch.addEventListener('click', () => {
        this.hideCrossMenuBanner();
        if (onSwitch) onSwitch(info.targetTab);
      });
    }

    this.crossMenuBanner.style.display = 'flex';
  }

  hideCrossMenuBanner() {
    if (this.crossMenuBanner) {
      this.crossMenuBanner.style.display = 'none';
    }
  }

  showToast(message) {
    if (!this.toast) return;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toast.textContent = message;
    this.toast.classList.add('show');
    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2500);
  }

  _escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Helper membaca isi file text (.txt / .php / .log)
   * @private
   */
  _readFileContent(file, handler) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (handler) {
        handler({
          content,
          fileName: file.name,
          fileSize: file.size
        });
      }
    };
    reader.onerror = () => {
      this.showToast('❌ Gagal membaca file log!');
    };
    reader.readAsText(file, 'UTF-8');
  }

  // Event Handlers Binding
  bindFileDrop(handler) {
    const dropzone = this.converterDropzone || this.inputText;
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-active');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-active');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt ? dt.files : null;
      if (files && files.length > 0) {
        this._readFileContent(files[0], handler);
      }
    });
  }

  bindFileBrowse(handler) {
    if (this.btnUploadLogFile && this.converterFileInput) {
      this.btnUploadLogFile.addEventListener('click', () => {
        this.converterFileInput.click();
      });

      this.converterFileInput.addEventListener('change', (e) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
          this._readFileContent(file, handler);
          this.converterFileInput.value = '';
        }
      });
    }
  }

  bindConvert(handler) {
    if (this.btnConvert) this.btnConvert.addEventListener('click', handler);
  }

  bindInputChange(handler) {
    if (this.inputText) this.inputText.addEventListener('input', handler);
  }

  bindPasteInput(handler) {
    if (this.inputText) {
      this.inputText.addEventListener('paste', (e) => {
        setTimeout(() => {
          if (handler) handler(e);
        }, 10);
      });
    }
  }

  bindOptionChange(handler) {
    if (this.timezoneOffset) this.timezoneOffset.addEventListener('change', handler);
    if (this.wrapperStyle) this.wrapperStyle.addEventListener('change', handler);
    if (this.autoCleanDuplicates) this.autoCleanDuplicates.addEventListener('change', handler);
  }

  bindVariableChips(handler) {
    const chips = document.querySelectorAll('.var-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const varName = chip.getAttribute('data-var');
        if (varName && this.inputText) {
          const start = this.inputText.selectionStart || this.inputText.value.length;
          const end = this.inputText.selectionEnd || this.inputText.value.length;
          const val = this.inputText.value;

          const prefix = (start > 0 && val[start - 1] !== ' ' && val[start - 1] !== '\n') ? ' ' : '';
          const suffix = (end < val.length && val[end] !== ' ' && val[end] !== '\n') ? ' ' : ' ';
          const insertText = `${prefix}${varName}${suffix}`;

          this.inputText.value = val.substring(0, start) + insertText + val.substring(end);
          this.inputText.focus();
          const newPos = start + insertText.length;
          this.inputText.setSelectionRange(newPos, newPos);

          if (handler) handler();
        }
      });
    });
  }

  bindAutoConvertToggle(handler) {
    if (this.autoConvert) this.autoConvert.addEventListener('change', handler);
  }

  bindClear(handler) {
    if (this.btnClear) this.btnClear.addEventListener('click', handler);
  }

  bindPreset1(handler) {
    if (this.btnPreset1) this.btnPreset1.addEventListener('click', handler);
  }

  bindPreset2(handler) {
    if (this.btnPreset2) this.btnPreset2.addEventListener('click', handler);
  }

  bindCopy(handler) {
    if (this.btnCopy) this.btnCopy.addEventListener('click', handler);
  }

  bindCopyAndReset(handler) {
    if (this.btnCopyAndReset) this.btnCopyAndReset.addEventListener('click', handler);
  }

  bindDownload(handler) {
    if (this.btnDownload) this.btnDownload.addEventListener('click', handler);
  }
}

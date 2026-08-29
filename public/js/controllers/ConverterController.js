/**
 * ConverterController
 * Controller Client-Side OOP yang menghubungkan Model dan View Konverter,
 * menangani Auto-Convert on Paste, Smart Quick-Actions, Smart Tone Rephrase,
 * One-Click Copy & Reset, serta Smart Cross-Menu Navigation.
 */
export class ConverterController {
  /**
   * @param {ConverterModel} model
   * @param {ConverterView} view
   * @param {Object} crossMenuControllers
   */
  constructor(model, view, crossMenuControllers = {}) {
    this.model = model;
    this.view = view;
    this.crossMenuControllers = crossMenuControllers;

    // Bersihkan form input & output saat inisialisasi / refresh
    this.view.setInputText('');
    this.view.setOutputText('');
    this.view.updateAiBadge({ count: 0, warnings: [], detectedPatterns: [], hasInput: false });
    this.model.setInputText('');

    this._initEvents();
  }

  setCrossMenuControllers(controllers) {
    this.crossMenuControllers = { ...this.crossMenuControllers, ...controllers };
  }

  clearForm() {
    this.view.clearAll();
    this.model.setInputText('');
  }

  updateVariables(variables) {
    this.model.setVariables(variables);
    if (this.view.getInputText().trim()) {
      this.executeConversion();
    }
  }

  _initEvents() {
    // Auto-clear form DateTime Converter saat berpindah ke tab lain
    if (this.view.navTabOcr) {
      this.view.navTabOcr.addEventListener('click', () => {
        this.clearForm();
      });
    }

    if (this.view.navTabSaldo) {
      this.view.navTabSaldo.addEventListener('click', () => {
        this.clearForm();
      });
    }

    // 1. Tombol Konversi Manual
    this.view.bindConvert(() => this.executeConversion());

    // 2. Input Change (Real-time Auto-Convert & Smart Suggestions)
    this.view.bindInputChange(() => {
      if (this.view.isAutoConvertChecked()) {
        this.executeConversion();
      }
    });

    // 3. Paste Event (Zero-Click Workflow: Instant Convert + Cross-Menu Intent Detection)
    this.view.bindPasteInput(() => {
      const rawText = this.view.getInputText();
      
      // Auto-convert langsung saat paste
      if (this.view.isAutoConvertChecked()) {
        this.executeConversion();
      }

      // Deteksi lintas menu
      const crossIntent = this.model.detectCrossMenuIntent(rawText);
      if (crossIntent) {
        this.view.showCrossMenuBanner(crossIntent, (targetTab) => {
          this.handleCrossMenuSwitch(targetTab, rawText);
        });
      } else {
        this.view.hideCrossMenuBanner();
      }
    });

    // 3b. Drag & Drop File Log (.txt / .php / .log)
    this.view.bindFileDrop(({ content, fileName, fileSize }) => {
      this.handleLoadedFile(content, fileName, fileSize);
    });

    // 3c. Browse & Upload File Log (.txt / .php / .log)
    this.view.bindFileBrowse(({ content, fileName, fileSize }) => {
      this.handleLoadedFile(content, fileName, fileSize);
    });

    // 4. Perubahan Option (Offset & Wrapper Style)
    this.view.bindOptionChange(() => this.executeConversion());

    // 5. Toggle Auto-Convert
    this.view.bindAutoConvertToggle(() => {
      this.model.setAutoConvert(this.view.isAutoConvertChecked());
    });

    // 6. Binding Klik Chip Variabel Standar
    this.view.bindVariableChips(() => {
      if (this.view.isAutoConvertChecked()) {
        this.executeConversion();
      }
    });

    // 7. Clear Form
    this.view.bindClear(() => {
      this.clearForm();
    });

    // 9. Presets
    this.view.bindPreset1(() => {
      const presetText = '[8:25 PM, 8/11/2026] idm Kendala gangguan timeout biller';
      this.view.setInputText(presetText);
      this.executeConversion();
    });

    this.view.bindPreset2(() => {
      const presetText = `Status Log Penanganan Tiket & Transaksi:
1. 19/08/2026 14:02:00 idm Kendala gangguan transaksi agen
2. 14.02 19-Aug-2026 idi Eskalasi tiket ke tim teknis
3. 2026-08-19T07:02:00Z fvo Cek status jaringan
4. [21.48, 11/8/2026] fms FU ke tim SAC
5. [21.49, 11/8/2026] idb Konfirmasi kendala biller timeout
6. [21.50, 11/8/2026] mkm Masalah telah terselesaikan`;
      this.view.setInputText(presetText);
      this.executeConversion();
    });

    // 10. Copy to Clipboard (dengan opsi Auto-Clear)
    this.view.bindCopy(async () => {
      await this.handleCopy(this.view.isAutoClearOnCopyChecked());
    });

    // 11. One-Click Copy & Reset
    this.view.bindCopyAndReset(async () => {
      await this.handleCopy(true);
    });

    // 12. Download TXT
    this.view.bindDownload(() => {
      const textToDownload = this.view.outputText.value;
      if (!textToDownload.trim()) {
        this.view.showToast('Tidak ada hasil untuk diunduh!');
        return;
      }

      const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hasil_konversi_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.view.showToast('File TXT berhasil diunduh! 📥');
    });
  }

  async handleCopy(shouldClear = false) {
    const textToCopy = this.view.outputText.value;
    if (!textToCopy.trim()) {
      this.view.showToast('Tidak ada teks untuk disalin!');
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      if (shouldClear) {
        this.clearForm();
        this.view.showToast('Tersalin & Form Dibersihkan untuk Tiket Baru! ⚡');
      } else {
        this.view.showToast('Hasil berhasil disalin ke clipboard! 📋');
      }
    } catch (err) {
      this.view.outputText.select();
      document.execCommand('copy');
      if (shouldClear) {
        this.clearForm();
        this.view.showToast('Tersalin & Form Dibersihkan untuk Tiket Baru! ⚡');
      } else {
        this.view.showToast('Hasil berhasil disalin ke clipboard! 📋');
      }
    }
  }

  handleCrossMenuSwitch(targetTab, rawText) {
    if (targetTab === 'ocr') {
      if (this.crossMenuControllers.ocrController) {
        this.crossMenuControllers.ocrController.receiveTransferredText(rawText);
      } else if (this.view.navTabOcr) {
        this.view.navTabOcr.click();
      }
    } else if (targetTab === 'saldo') {
      if (this.crossMenuControllers.saldoController) {
        this.crossMenuControllers.saldoController.receiveTransferredText(rawText);
      } else if (this.view.navTabSaldo) {
        this.view.navTabSaldo.click();
      }
    }
  }

  executeConversion() {
    const rawInput = this.view.getInputText();
    const hasInput = Boolean(rawInput.trim());

    // Sinkronisasi data dari View ke Model
    this.model.setInputText(rawInput);
    this.model.setHourOffset(this.view.getTimezoneOffset());
    this.model.setWrapperStyle(this.view.getWrapperStyle());

    // Eksekusi Konversi via Model
    const { resultText, matchCount } = this.model.convert();

    // Render ulang UI Output & Badge
    this.view.setOutputText(resultText);
    this.view.updateMatchBadge(matchCount);

    // Render Smart Suggestions berdasarkan konteks
    if (hasInput) {
      const suggestions = this.model.analyzeContext(rawInput);
      this.view.renderSmartSuggestions(suggestions, (selectedKey) => {
        this.applySmartShortcut(selectedKey);
      });
    } else {
      this.view.hideSmartSuggestions();
      this.view.hideCrossMenuBanner();
    }
  }

  applySmartShortcut(varKey) {
    const input = this.view.inputText;
    if (!input) return;

    const val = input.value;
    const start = input.selectionStart || val.length;
    const end = input.selectionEnd || val.length;

    const prefix = (start > 0 && val[start - 1] !== ' ' && val[start - 1] !== '\n') ? ' ' : '';
    const suffix = (end < val.length && val[end] !== ' ' && val[end] !== '\n') ? ' ' : ' ';
    const insertText = `${prefix}${varKey}${suffix}`;

    input.value = val.substring(0, start) + insertText + val.substring(end);
    input.focus();
    const newPos = start + insertText.length;
    input.setSelectionRange(newPos, newPos);

    this.executeConversion();
    this.view.showToast(`Template '${varKey}' berhasil diterapkan! ✨`);
  }

  handleLoadedFile(content, fileName, fileSize) {
    if (typeof content !== 'string') return;
    this.view.setInputText(content);
    this.executeConversion();

    const sizeKb = (fileSize / 1024).toFixed(1);
    this.view.showToast(`📄 File "${fileName}" (${sizeKb} KB) berhasil dimuat & dikonversi! ⚡`);

    // Deteksi lintas menu jika file mengandung receipt/saldo
    const crossIntent = this.model.detectCrossMenuIntent(content);
    if (crossIntent) {
      this.view.showCrossMenuBanner(crossIntent, (targetTab) => {
        this.handleCrossMenuSwitch(targetTab, content);
      });
    } else {
      this.view.hideCrossMenuBanner();
    }
  }
}


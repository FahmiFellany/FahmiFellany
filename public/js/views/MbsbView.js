/**
 * MbsbView
 * View Client-Side OOP untuk mengelola interaksi DOM form monitoring MBSB.
 */
export class MbsbView {
  constructor() {
    this.form = document.getElementById('mbsbForm');
    this.checkingDate = document.getElementById('mbsbCheckingDate');
    this.checkingTime = document.getElementById('mbsbCheckingTime');
    this.login = document.getElementById('mbsbLogin');
    this.checkBalance = document.getElementById('mbsbCheckBalance');
    this.transferDana = document.getElementById('mbsbTransferDana');
    this.fiturPembayaran = document.getElementById('mbsbFiturPembayaran');
    this.providerJaringan = document.getElementById('mbsbProviderJaringan');
    this.pic = document.getElementById('mbsbPic');
    this.keterangan = document.getElementById('mbsbKeterangan');
    this.spreadsheetIdInput = document.getElementById('mbsbSpreadsheetId');

    this.keteranganBadge = document.getElementById('mbsbKeteranganRequirementBadge');
    this.validationBanner = document.getElementById('mbsbValidationBanner');
    this.outputText = document.getElementById('mbsbOutputText');
    this.logsTableBody = document.getElementById('mbsbLogsTableBody');

    this.btnSubmit = document.getElementById('mbsbBtnSubmit');
    this.btnSendGsheet = document.getElementById('mbsbBtnSendGsheet');
    this.btnCopyFormatted = document.getElementById('mbsbBtnCopyFormatted');
    this.btnReset = document.getElementById('mbsbBtnReset');
    this.btnClearLogs = document.getElementById('mbsbBtnClearLogs');

    this.toast = document.getElementById('toast');

    // Navigation Tabs
    this.navTabMbsb = document.getElementById('navTabMbsb');
    this.viewMbsb = document.getElementById('viewMbsb');

    this.initEvents();
  }

  initEvents() {
    // Dynamic Validation Check on Module Dropdowns
    const moduleSelects = [this.login, this.checkBalance, this.transferDana, this.fiturPembayaran];
    moduleSelects.forEach(select => {
      if (select) {
        select.addEventListener('change', () => this.updateKeteranganRequirementState());
      }
    });

    if (this.navTabMbsb) {
      this.navTabMbsb.addEventListener('click', () => {
        this.switchTab('mbsb');
      });
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => this.resetForm());
    }
  }

  /**
   * Pindah tab navigasi utama
   * @param {string} targetTab 
   */
  switchTab(targetTab) {
    const tabMapping = [
      { id: 'navTabConverter', viewId: 'viewConverter', display: 'flex' },
      { id: 'navTabOcr', viewId: 'viewOcr', display: 'block' },
      { id: 'navTabSaldo', viewId: 'viewSaldo', display: 'block' },
      { id: 'navTabCidEks', viewId: 'viewCidEks', display: 'block' },
      { id: 'navTabMbsb', viewId: 'viewMbsb', display: 'block' }
    ];

    tabMapping.forEach(item => {
      const tabEl = document.getElementById(item.id);
      const viewEl = document.getElementById(item.viewId);
      if (item.id === `navTab${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}` ||
          (targetTab === 'mbsb' && item.id === 'navTabMbsb')) {
        if (tabEl) tabEl.classList.add('active');
        if (viewEl) viewEl.style.display = item.display;
      } else {
        if (tabEl) tabEl.classList.remove('active');
        if (viewEl) viewEl.style.display = 'none';
      }
    });
  }

  /**
   * Mengambil data form input
   * @returns {Object}
   */
  getFormData() {
    return {
      checkingDate: this.checkingDate ? this.checkingDate.value : '',
      checkingTime: this.checkingTime ? this.checkingTime.value : '',
      login: this.login ? this.login.value : '',
      checkBalance: this.checkBalance ? this.checkBalance.value : '',
      transferDana: this.transferDana ? this.transferDana.value : '',
      fiturPembayaran: this.fiturPembayaran ? this.fiturPembayaran.value : '',
      providerJaringan: this.providerJaringan ? this.providerJaringan.value : 'WIFI KANTOR',
      pic: this.pic ? this.pic.value : '',
      keterangan: this.keterangan ? this.keterangan.value : ''
    };
  }

  setCheckingDate(dateStr) {
    if (this.checkingDate) {
      this.checkingDate.value = dateStr;
    }
  }

  /**
   * Update tampilan badge Keterangan (Wajib / Opsional)
   */
  updateKeteranganRequirementState() {
    const data = this.getFormData();
    const hasGangguan = [data.login, data.checkBalance, data.transferDana, data.fiturPembayaran].some(v => v === 'Gangguan');

    if (this.keteranganBadge) {
      if (hasGangguan) {
        this.keteranganBadge.textContent = 'WAJIB DIISI (Ada Modul Gangguan)';
        this.keteranganBadge.style.background = 'rgba(239, 68, 68, 0.25)';
        this.keteranganBadge.style.color = '#fca5a5';
        this.keteranganBadge.style.border = '1px solid rgba(239, 68, 68, 0.4)';
      } else {
        this.keteranganBadge.textContent = 'Opsional';
        this.keteranganBadge.style.background = 'rgba(148, 163, 184, 0.2)';
        this.keteranganBadge.style.color = '#94a3b8';
        this.keteranganBadge.style.border = 'none';
      }
    }
  }

  /**
   * Tampilkan pesan validasi/error banner
   * @param {string[]} errors 
   */
  showValidationErrors(errors) {
    if (!this.validationBanner) return;
    if (errors && errors.length > 0) {
      this.validationBanner.style.display = 'block';
      this.validationBanner.style.background = 'rgba(239, 68, 68, 0.15)';
      this.validationBanner.style.border = '1px solid rgba(239, 68, 68, 0.4)';
      this.validationBanner.style.color = '#fca5a5';
      this.validationBanner.innerHTML = `⚠️ <strong>Peringatan Validasi:</strong><br><ul style="margin: 0.4rem 0 0 1.2rem; padding: 0;">${errors.map(err => `<li>${err}</li>`).join('')}</ul>`;
    } else {
      this.validationBanner.style.display = 'none';
      this.validationBanner.innerHTML = '';
    }
  }

  hideValidationBanner() {
    if (this.validationBanner) {
      this.validationBanner.style.display = 'none';
      this.validationBanner.innerHTML = '';
    }
  }

  setOutputText(formattedText) {
    if (this.outputText) {
      this.outputText.value = formattedText;
    }
  }

  resetForm() {
    if (this.checkingTime) this.checkingTime.value = '';
    if (this.login) this.login.value = '';
    if (this.checkBalance) this.checkBalance.value = '';
    if (this.transferDana) this.transferDana.value = '';
    if (this.fiturPembayaran) this.fiturPembayaran.value = '';
    if (this.pic) this.pic.value = '';
    if (this.keterangan) this.keterangan.value = '';

    this.updateKeteranganRequirementState();
    this.hideValidationBanner();
    this.setOutputText('');
    this.showToast('🧹 Form MBSB telah dibersihkan!');
  }

  /**
   * Render tabel riwayat log di UI
   * @param {Array} logs 
   */
  renderLogsTable(logs) {
    if (!this.logsTableBody) return;
    if (!logs || logs.length === 0) {
      this.logsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 1.5rem; color: #64748b;">Belum ada data monitoring tersimpan.</td></tr>`;
      return;
    }

    this.logsTableBody.innerHTML = logs.map(item => {
      const hasGangguan = [item.login, item.checkBalance, item.transferDana, item.fiturPembayaran].some(v => v === 'Gangguan');
      const badgeStyle = hasGangguan 
        ? 'background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4);' 
        : 'background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4);';
      const statusText = hasGangguan ? '⚠️ Ada Gangguan' : '✅ Normal';

      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 0.5rem 0.6rem; color: #94a3b8;">${item.timestamp || '-'}</td>
          <td style="padding: 0.5rem 0.6rem; font-weight: 600; color: #38bdf8;">${item.checkingTime || '-'}</td>
          <td style="padding: 0.5rem 0.6rem;">
            <span style="padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.72rem; ${badgeStyle}">
              ${statusText}
            </span>
          </td>
          <td style="padding: 0.5rem 0.6rem; color: #e2e8f0;">${item.pic || '-'}</td>
        </tr>
      `;
    }).join('');
  }

  getSpreadsheetId() {
    return this.spreadsheetIdInput ? this.spreadsheetIdInput.value.trim() : '';
  }

  setSpreadsheetId(idStr) {
    if (this.spreadsheetIdInput) {
      this.spreadsheetIdInput.value = idStr;
    }
  }

  showToast(message) {
    if (!this.toast) return;
    this.toast.textContent = message;
    this.toast.classList.add('show');
    setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2500);
  }

  // Event Listeners Binding
  bindSubmit(handler) {
    if (this.btnSubmit) {
      this.btnSubmit.addEventListener('click', handler);
    }
  }

  bindSendGsheet(handler) {
    if (this.btnSendGsheet) {
      this.btnSendGsheet.addEventListener('click', handler);
    }
  }

  bindCopyFormatted(handler) {
    if (this.btnCopyFormatted) {
      this.btnCopyFormatted.addEventListener('click', handler);
    }
  }

  bindClearLogs(handler) {
    if (this.btnClearLogs) {
      this.btnClearLogs.addEventListener('click', handler);
    }
  }
}

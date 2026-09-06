/**
 * SaldoView (Client-Side OOP)
 * Mengelola DOM Interaksi Form Saldo 4 Periode (Pagi, Siang, Sore, Malam),
 * Format Input Rupiah, Tab Navigasi, Ekspor/Salin Excel, Ringkasan Status, dan Modal CRUD Multi-Grup.
 */
export class SaldoView {
  constructor() {
    this.container = document.getElementById('saldoInputsContainer');
    this.periodPagiBtn = document.getElementById('saldoBtnPagi');
    this.periodSiangBtn = document.getElementById('saldoBtnSiang');
    this.periodSoreBtn = document.getElementById('saldoBtnSore');
    this.periodMalamBtn = document.getElementById('saldoBtnMalam');
    this.dateInput = document.getElementById('saldoDateInput');
    this.outputText = document.getElementById('saldoOutputText');
    this.btnCopy = document.getElementById('saldoBtnCopy');
    this.btnCopyExcel = document.getElementById('saldoBtnCopyExcel');
    this.btnExportExcel = document.getElementById('saldoBtnExportExcel');
    this.btnClear = document.getElementById('saldoBtnClear');
    this.badgePeriod = document.getElementById('saldoBadgePeriod');

    // Summary Section
    this.summarySection = document.getElementById('saldoSummarySection');
    this.summaryCount = document.getElementById('saldoSummaryCount');
    this.statFilled = document.getElementById('saldoStatFilled');
    this.statEmpty = document.getElementById('saldoStatEmpty');
    this.statTotal = document.getElementById('saldoStatTotal');
    this.summaryCards = document.getElementById('saldoSummaryCards');

    // CRUD Modal Elements
    this.crudModal = document.getElementById('saldoCrudModal');
    this.btnOpenCrudModal = document.getElementById('btnOpenSaldoCrudModal');
    this.btnCloseCrudModal = document.getElementById('btnCloseSaldoCrudModal');
    this.btnFooterCloseCrudModal = document.getElementById('btnFooterCloseSaldoCrudModal');
    this.modalGroupPagiMalam = document.getElementById('saldoModalGroupPagiMalam');
    this.modalGroupSiangSore = document.getElementById('saldoModalGroupSiangSore');
    this.crudForm = document.getElementById('saldoCrudForm');
    this.crudItemId = document.getElementById('saldoCrudItemId');
    this.crudItemLabel = document.getElementById('saldoCrudItemLabel');
    this.crudItemDesc = document.getElementById('saldoCrudItemDesc');
    this.btnSaveCrudItem = document.getElementById('btnSaveSaldoCrudItem');
    this.btnCancelCrudEdit = document.getElementById('btnCancelSaldoCrudEdit');
    this.btnResetDefaults = document.getElementById('btnResetSaldoDefaults');
    this.crudSearchInput = document.getElementById('saldoCrudSearchInput');
    this.crudTableBody = document.getElementById('saldoCrudTableBody');
    this.crudEmptyMsg = document.getElementById('saldoCrudEmptyMsg');
    this.crudEntriesInfo = document.getElementById('saldoCrudEntriesInfo');
    this.isEditingCrud = false;
    this.activeModalGroup = 'siang_sore';

    // Tab Navigasi Navbar
    this.navTabConverter = document.getElementById('navTabConverter');
    this.navTabOcr = document.getElementById('navTabOcr');
    this.navTabExcel = document.getElementById('navTabExcel');
    this.navTabSaldo = document.getElementById('navTabSaldo');
    this.navTabCidEks = document.getElementById('navTabCidEks');

    this.viewConverter = document.getElementById('viewConverter');
    this.viewOcr = document.getElementById('viewOcr');
    this.viewExcel = document.getElementById('viewExcel');
    this.viewSaldo = document.getElementById('viewSaldo');
    this.viewCidEks = document.getElementById('viewCidEks');

    this.toast = document.getElementById('toast');
    this.toastTimer = null;

    this._initModalEvents();
  }

  _initModalEvents() {
    if (this.btnOpenCrudModal) {
      this.btnOpenCrudModal.addEventListener('click', () => this.openCrudModal());
    }
    if (this.btnCloseCrudModal) {
      this.btnCloseCrudModal.addEventListener('click', () => this.closeCrudModal());
    }
    if (this.btnFooterCloseCrudModal) {
      this.btnFooterCloseCrudModal.addEventListener('click', () => this.closeCrudModal());
    }
    if (this.crudModal) {
      this.crudModal.addEventListener('click', (e) => {
        if (e.target === this.crudModal) {
          this.closeCrudModal();
        }
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.crudModal && this.crudModal.classList.contains('active')) {
        this.closeCrudModal();
      }
    });
  }

  openCrudModal() {
    if (this.crudModal) {
      this.crudModal.classList.add('active');
      document.body.classList.add('modal-open');
      if (this.crudItemLabel) {
        setTimeout(() => this.crudItemLabel.focus(), 150);
      }
    }
  }

  closeCrudModal() {
    if (this.crudModal) {
      this.crudModal.classList.remove('active');
      document.body.classList.remove('modal-open');
      this.resetCrudForm();
    }
  }

  setModalGroupActive(group) {
    this.activeModalGroup = group;
    if (group === 'pagi_malam') {
      if (this.modalGroupPagiMalam) this.modalGroupPagiMalam.classList.add('active');
      if (this.modalGroupSiangSore) this.modalGroupSiangSore.classList.remove('active');
    } else {
      if (this.modalGroupSiangSore) this.modalGroupSiangSore.classList.add('active');
      if (this.modalGroupPagiMalam) this.modalGroupPagiMalam.classList.remove('active');
    }
  }

  resetCrudForm() {
    if (this.crudForm) this.crudForm.reset();
    if (this.crudItemId) this.crudItemId.value = '';
    this.isEditingCrud = false;
    if (this.btnSaveCrudItem) this.btnSaveCrudItem.textContent = 'Tambah Item Saldo';
    if (this.btnCancelCrudEdit) this.btnCancelCrudEdit.style.display = 'none';
  }

  setCrudEditMode(item) {
    if (!item) return;
    this.isEditingCrud = true;
    if (this.crudItemId) this.crudItemId.value = item.id;
    if (this.crudItemLabel) this.crudItemLabel.value = item.label;
    if (this.crudItemDesc) this.crudItemDesc.value = item.description || '';
    if (this.btnSaveCrudItem) this.btnSaveCrudItem.textContent = 'Simpan Perubahan';
    if (this.btnCancelCrudEdit) this.btnCancelCrudEdit.style.display = 'inline-flex';

    if (this.crudItemLabel) {
      this.crudItemLabel.focus();
      this.crudItemLabel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  getCrudFormData() {
    return {
      id: this.crudItemId ? this.crudItemId.value : '',
      label: this.crudItemLabel ? this.crudItemLabel.value.trim() : '',
      description: this.crudItemDesc ? this.crudItemDesc.value.trim() : ''
    };
  }

  getCrudSearchQuery() {
    return this.crudSearchInput ? this.crudSearchInput.value.trim().toLowerCase() : '';
  }

  // Render CRUD Table
  renderCrudTable(items, onEdit, onDelete) {
    if (!this.crudTableBody) return;
    this.crudTableBody.innerHTML = '';

    const query = this.getCrudSearchQuery();
    let filtered = items || [];

    if (query) {
      filtered = items.filter(i =>
        (i.label && i.label.toLowerCase().includes(query)) ||
        (i.description && i.description.toLowerCase().includes(query))
      );
    }

    if (this.crudEntriesInfo) {
      this.crudEntriesInfo.textContent = `Menampilkan ${filtered.length} dari ${items.length} item saldo`;
    }

    if (filtered.length === 0) {
      if (this.crudEmptyMsg) this.crudEmptyMsg.style.display = 'block';
      return;
    }

    if (this.crudEmptyMsg) this.crudEmptyMsg.style.display = 'none';

    filtered.forEach((item, index) => {
      const tr = document.createElement('tr');

      // No / Order column
      const tdNo = document.createElement('td');
      tdNo.style.width = '65px';
      tdNo.innerHTML = `<span class="chip-code" style="font-weight: 700;">#${index + 1}</span>`;

      // Label column
      const tdLabel = document.createElement('td');
      tdLabel.className = 'var-val-cell';
      tdLabel.textContent = item.label;

      // Description column
      const tdDesc = document.createElement('td');
      tdDesc.className = 'var-desc-cell';
      tdDesc.textContent = item.description || '-';

      // Actions column
      const tdActions = document.createElement('td');
      tdActions.className = 'table-actions';
      tdActions.style.justifyContent = 'center';

      // Edit Button
      const btnEdit = document.createElement('button');
      btnEdit.type = 'button';
      btnEdit.className = 'btn-icon-action btn-edit';
      btnEdit.title = 'Edit Item';
      btnEdit.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      `;
      btnEdit.addEventListener('click', () => onEdit(item));

      // Delete Button
      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.className = 'btn-icon-action btn-delete';
      btnDelete.title = 'Hapus Item';
      btnDelete.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      `;
      btnDelete.addEventListener('click', () => onDelete(item));

      tdActions.appendChild(btnEdit);
      tdActions.appendChild(btnDelete);

      tr.appendChild(tdNo);
      tr.appendChild(tdLabel);
      tr.appendChild(tdDesc);
      tr.appendChild(tdActions);

      this.crudTableBody.appendChild(tr);
    });
  }

  // Format angka ke format ribuan Indonesia dengan auto Rp. (contoh: 1127884 -> Rp. 1.127.884)
  formatRupiah(value) {
    if (!value && value !== 0) return '';
    const str = String(value).trim();
    if (!str) return '';
    const cleanDigits = str.replace(/[^0-9]/g, '');
    if (!cleanDigits) {
      return str.toLowerCase().includes('rp') ? 'Rp. ' : '';
    }
    const formattedNum = new Intl.NumberFormat('id-ID').format(cleanDigits);
    return `Rp. ${formattedNum}`;
  }

  // Render form item inputs
  renderInputs(items, initialValues = {}, onInputChange) {
    if (!this.container) return;
    this.container.innerHTML = '';

    if (!items || items.length === 0) {
      this.container.innerHTML = `
        <div class="empty-msg" style="padding: 2rem; text-align: center;">
          Belum ada item saldo terdaftar. Klik tombol <strong>Kelola Item Saldo</strong> di atas untuk menambahkan.
        </div>
      `;
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'saldo-input-card';

      const label = document.createElement('label');
      label.setAttribute('for', `saldo_input_${item.id}`);
      label.className = 'saldo-input-label';
      label.innerHTML = `
        <span class="saldo-index">${index + 1}.</span>
        <span class="saldo-title" title="${item.label}">${item.label}</span>
      `;

      const input = document.createElement('input');
      input.type = 'text';
      input.id = `saldo_input_${item.id}`;
      input.className = 'saldo-field-input';
      input.placeholder = 'Rp. ';
      input.autocomplete = 'off';

      const currentVal = initialValues[item.id] || '';
      input.value = this.formatRupiah(currentVal);

      // Event input: auto maintains "Rp. " prefix while typing/editing
      input.addEventListener('input', (e) => {
        const raw = e.target.value;
        const formatted = this.formatRupiah(raw);
        e.target.value = formatted;
        if (onInputChange) {
          onInputChange(item.id, formatted);
        }
      });

      // Saat fokus pada input kosong, sediakan "Rp. " agar praktis
      input.addEventListener('focus', (e) => {
        if (!e.target.value) {
          e.target.value = 'Rp. ';
        }
      });

      // Saat blur tanpa angka, kosongkan form
      input.addEventListener('blur', (e) => {
        const clean = e.target.value.replace(/[^0-9]/g, '');
        if (!clean) {
          e.target.value = '';
          if (onInputChange) {
            onInputChange(item.id, '');
          }
        }
      });

      card.appendChild(label);
      card.appendChild(input);

      this.container.appendChild(card);
    });
  }

  // Update input values
  setInputValues(items, values = {}) {
    if (!items) return;
    items.forEach(item => {
      const input = document.getElementById(`saldo_input_${item.id}`);
      if (input) {
        input.value = this.formatRupiah(values[item.id] || '');
      }
    });
  }

  // Set Period Tab Active (Pagi, Siang, Sore, Malam)
  setPeriodUI(period) {
    const isPagiOrMalam = (period === 'Pagi' || period === 'Malam');

    // Dynamic Multi-Column grid: 3 kolom untuk Pagi/Malam (21 item), 2 kolom untuk Siang/Sore (17 item)
    if (this.container) {
      this.container.style.setProperty('--saldo-cols', isPagiOrMalam ? '3' : '2');
    }

    // Update Period Pills
    const pills = [
      { name: 'Pagi', btn: this.periodPagiBtn },
      { name: 'Siang', btn: this.periodSiangBtn },
      { name: 'Sore', btn: this.periodSoreBtn },
      { name: 'Malam', btn: this.periodMalamBtn }
    ];

    pills.forEach(p => {
      if (p.btn) {
        if (p.name === period) {
          p.btn.classList.add('active');
        } else {
          p.btn.classList.remove('active');
        }
      }
    });

    if (this.badgePeriod) {
      this.badgePeriod.textContent = period;
      this.badgePeriod.className = `saldo-badge ${period.toLowerCase()}`;
    }

    // Visibility of Excel buttons & Summary Section for all periods (Pagi, Siang, Sore, Malam)
    if (this.btnCopyExcel) {
      this.btnCopyExcel.style.display = 'inline-flex';
    }
    if (this.btnExportExcel) {
      this.btnExportExcel.style.display = 'inline-flex';
    }
    if (this.summarySection) {
      this.summarySection.style.display = 'block';
    }

    // Adjust date input placeholder
    if (this.dateInput) {
      this.dateInput.placeholder = isPagiOrMalam ? 'dd-mm-yy hh:mm' : 'dd-mm-yy';
    }
  }

  setDate(dateStr) {
    if (this.dateInput) {
      this.dateInput.value = dateStr;
    }
  }

  getDate() {
    return this.dateInput ? this.dateInput.value.trim() : '';
  }

  setOutputText(text) {
    if (this.outputText) {
      this.outputText.value = text;
    }
  }

  getOutputText() {
    return this.outputText ? this.outputText.value : '';
  }

  // Render Status Summary
  renderSummary(summaryData) {
    if (!summaryData) return;

    if (this.summaryCount) this.summaryCount.textContent = summaryData.totalItems;
    if (this.statFilled) this.statFilled.textContent = summaryData.filledCount;
    if (this.statEmpty) this.statEmpty.textContent = summaryData.emptyCount;
    if (this.statTotal) this.statTotal.textContent = summaryData.totalNominalFormatted;

    if (this.summaryCards) {
      this.summaryCards.innerHTML = '';
      summaryData.details.forEach(item => {
        const chip = document.createElement('div');
        chip.className = `excel-item-card ${item.isFilled ? 'found' : 'missing'}`;
        chip.innerHTML = `
          <div class="card-col-badge">Kolom ${item.col} (#${item.index})</div>
          <div class="card-title" title="${item.cleanHeader}">${item.cleanHeader}</div>
          <div class="card-amount">${item.isFilled ? item.formattedValue : '<span class="empty-hint">Rp. 0 (Kosong)</span>'}</div>
        `;
        this.summaryCards.appendChild(chip);
      });
    }
  }

  showToast(message) {
    if (!this.toast) return;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast.textContent = message;
    this.toast.classList.add('show');
    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2500);
  }

  switchTab(tabName) {
    const tabs = [
      { name: 'converter', tab: this.navTabConverter, view: this.viewConverter, display: 'flex' },
      { name: 'ocr', tab: this.navTabOcr, view: this.viewOcr, display: 'block' },
      { name: 'saldo', tab: this.navTabSaldo, view: this.viewSaldo, display: 'block' },
      { name: 'cidEks', tab: this.navTabCidEks, view: this.viewCidEks, display: 'block' }
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
  }

  // Event Listeners Binding
  bindPeriodChange(handler) {
    if (this.periodPagiBtn) {
      this.periodPagiBtn.addEventListener('click', () => handler('Pagi'));
    }
    if (this.periodSiangBtn) {
      this.periodSiangBtn.addEventListener('click', () => handler('Siang'));
    }
    if (this.periodSoreBtn) {
      this.periodSoreBtn.addEventListener('click', () => handler('Sore'));
    }
    if (this.periodMalamBtn) {
      this.periodMalamBtn.addEventListener('click', () => handler('Malam'));
    }
  }

  bindDateChange(handler) {
    if (this.dateInput) {
      this.dateInput.addEventListener('input', () => handler(this.getDate()));
    }
  }

  bindCopy(handler) {
    if (this.btnCopy) {
      this.btnCopy.addEventListener('click', handler);
    }
  }

  bindCopyExcel(handler) {
    if (this.btnCopyExcel) {
      this.btnCopyExcel.addEventListener('click', handler);
    }
  }

  bindExportExcel(handler) {
    if (this.btnExportExcel) {
      this.btnExportExcel.addEventListener('click', handler);
    }
  }

  bindClear(handler) {
    if (this.btnClear) {
      this.btnClear.addEventListener('click', handler);
    }
  }

  bindModalGroupTab(handler) {
    if (this.modalGroupPagiMalam) {
      this.modalGroupPagiMalam.addEventListener('click', () => {
        this.setModalGroupActive('pagi_malam');
        handler('pagi_malam');
      });
    }
    if (this.modalGroupSiangSore) {
      this.modalGroupSiangSore.addEventListener('click', () => {
        this.setModalGroupActive('siang_sore');
        handler('siang_sore');
      });
    }
  }

  bindCrudFormSubmit(handler) {
    if (this.crudForm) {
      this.crudForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handler(this.getCrudFormData(), this.isEditingCrud, this.activeModalGroup);
      });
    }
  }

  bindCrudCancel(handler) {
    if (this.btnCancelCrudEdit) {
      this.btnCancelCrudEdit.addEventListener('click', () => {
        this.resetCrudForm();
        if (handler) handler();
      });
    }
  }

  bindCrudResetDefaults(handler) {
    if (this.btnResetDefaults) {
      this.btnResetDefaults.addEventListener('click', () => {
        if (confirm(`Apakah Anda yakin ingin me-reset daftar item saldo grup "${this.activeModalGroup === 'pagi_malam' ? 'Pagi & Malam (21 Item)' : 'Siang & Sore (17 Item)'}" ke bawaan default?`)) {
          handler(this.activeModalGroup);
        }
      });
    }
  }

  bindCrudSearchInput(handler) {
    if (this.crudSearchInput) {
      this.crudSearchInput.addEventListener('input', handler);
    }
  }

  bindNavTab(handler) {
    if (this.navTabSaldo) {
      this.navTabSaldo.addEventListener('click', () => {
        this.switchTab('saldo');
        if (handler) handler();
      });
    }
  }
}

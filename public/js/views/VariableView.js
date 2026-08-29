/**
 * VariableView
 * View Client-Side OOP untuk mengelola interaksi Form CRUD Variabel, Tabel Variabel, dan Render Tombol Chip Pintasan.
 */
export class VariableView {
  constructor() {
    this.modal = document.getElementById('variableCrudModal');
    this.btnOpenModal = document.getElementById('btnOpenVarModal');
    this.btnCloseModal = document.getElementById('btnCloseVarModal');
    this.btnFooterClose = document.getElementById('btnFooterCloseVarModal');
    this.form = document.getElementById('varForm');
    this.idInput = document.getElementById('varId');
    this.keyInput = document.getElementById('varKey');
    this.valInput = document.getElementById('varVal');
    this.descInput = document.getElementById('varDesc');
    this.btnSave = document.getElementById('btnSaveVar');
    this.btnCancel = document.getElementById('btnCancelVar');
    this.btnReset = document.getElementById('btnResetVar');
    this.tableBody = document.getElementById('varTableBody');
    this.emptyMsg = document.getElementById('varEmptyMsg');
    this.entriesLimit = document.getElementById('varEntriesLimit');
    this.entriesInfo = document.getElementById('varEntriesInfo');
    this.searchInput = document.getElementById('varSearchInput');
    this.chipsContainer = document.getElementById('variablesChipsContainer');
    this.isEditing = false;

    this._initModalEvents();
  }

  _initModalEvents() {
    if (this.btnOpenModal) {
      this.btnOpenModal.addEventListener('click', () => this.openModal());
    }
    if (this.btnCloseModal) {
      this.btnCloseModal.addEventListener('click', () => this.closeModal());
    }
    if (this.btnFooterClose) {
      this.btnFooterClose.addEventListener('click', () => this.closeModal());
    }
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  openModal() {
    if (this.modal) {
      this.modal.classList.add('active');
      document.body.classList.add('modal-open');
      if (this.keyInput) {
        setTimeout(() => this.keyInput.focus(), 150);
      }
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.classList.remove('modal-open');
      this.resetForm();
    }
  }

  // Getters
  getFormData() {
    return {
      id: this.idInput ? this.idInput.value : '',
      key: this.keyInput ? this.keyInput.value.trim() : '',
      value: this.valInput ? this.valInput.value.trim() : '',
      description: this.descInput ? this.descInput.value.trim() : ''
    };
  }

  getEntriesLimit() {
    return this.entriesLimit ? this.entriesLimit.value : 'all';
  }

  getSearchQuery() {
    return this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';
  }

  // Form Reset & Populate
  resetForm() {
    if (this.form) this.form.reset();
    if (this.idInput) this.idInput.value = '';
    this.isEditing = false;
    if (this.btnSave) this.btnSave.textContent = 'Tambah Variabel';
    if (this.btnCancel) this.btnCancel.style.display = 'none';
  }

  setEditMode(item) {
    if (!item) return;
    this.isEditing = true;
    if (this.idInput) this.idInput.value = item.id;
    if (this.keyInput) this.keyInput.value = item.key;
    if (this.valInput) this.valInput.value = item.value;
    if (this.descInput) this.descInput.value = item.description || '';
    if (this.btnSave) this.btnSave.textContent = 'Simpan Perubahan';
    if (this.btnCancel) this.btnCancel.style.display = 'inline-flex';

    if (this.keyInput) {
      this.keyInput.focus();
      this.keyInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Render Table
  renderTable(variables, onEdit, onDelete) {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = '';

    const query = this.getSearchQuery();
    let filtered = variables;

    if (query) {
      filtered = variables.filter(v =>
        (v.key && v.key.toLowerCase().includes(query)) ||
        (v.value && v.value.toLowerCase().includes(query)) ||
        (v.description && v.description.toLowerCase().includes(query))
      );
    }

    const totalCount = filtered.length;
    const limitVal = this.getEntriesLimit();
    let displayList = filtered;

    if (limitVal !== 'all') {
      const limitNum = parseInt(limitVal, 10);
      displayList = filtered.slice(0, limitNum);
    }

    if (this.entriesInfo) {
      this.entriesInfo.textContent = `Menampilkan ${displayList.length} dari ${totalCount} variabel`;
    }

    if (displayList.length === 0) {
      if (this.emptyMsg) this.emptyMsg.style.display = 'block';
      return;
    }

    if (this.emptyMsg) this.emptyMsg.style.display = 'none';

    displayList.forEach(item => {
      const tr = document.createElement('tr');

      // Key column
      const tdKey = document.createElement('td');
      const keyBadge = document.createElement('span');
      keyBadge.className = 'chip-code';
      keyBadge.textContent = item.key;
      tdKey.appendChild(keyBadge);

      // Value column
      const tdVal = document.createElement('td');
      tdVal.className = 'var-val-cell';
      tdVal.textContent = item.value;

      // Description column
      const tdDesc = document.createElement('td');
      tdDesc.className = 'var-desc-cell';
      tdDesc.textContent = item.description || '-';

      // Actions column
      const tdActions = document.createElement('td');
      tdActions.className = 'table-actions';

      const btnEdit = document.createElement('button');
      btnEdit.type = 'button';
      btnEdit.className = 'btn-icon-action btn-edit';
      btnEdit.title = 'Edit Variabel';
      btnEdit.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      `;
      btnEdit.addEventListener('click', () => onEdit(item));

      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.className = 'btn-icon-action btn-delete';
      btnDelete.title = 'Hapus Variabel';
      btnDelete.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      `;
      btnDelete.addEventListener('click', () => onDelete(item));

      tdActions.appendChild(btnEdit);
      tdActions.appendChild(btnDelete);

      tr.appendChild(tdKey);
      tr.appendChild(tdVal);
      tr.appendChild(tdDesc);
      tr.appendChild(tdActions);

      this.tableBody.appendChild(tr);
    });
  }

  // Render Shortcut Chips in Converter Section
  renderQuickChips(variables, onChipClick) {
    if (!this.chipsContainer) return;
    this.chipsContainer.innerHTML = '';

    if (!variables || variables.length === 0) {
      this.chipsContainer.innerHTML = '<span class="text-dim text-xs">Belum ada variabel terdaftar.</span>';
      return;
    }

    variables.forEach(v => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'var-chip';
      btn.setAttribute('data-var', v.key);
      btn.title = `${v.key} = ${v.value}${v.description ? ' (' + v.description + ')' : ''}`;

      btn.innerHTML = `
        <span class="chip-code">${v.key}</span>
        <span class="chip-arrow">→</span>
        <span class="chip-label">${v.value}</span>
      `;

      btn.addEventListener('click', () => onChipClick(v.key));
      this.chipsContainer.appendChild(btn);
    });
  }

  // Event Listeners Binding
  bindFormSubmit(handler) {
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        handler(this.getFormData(), this.isEditing);
      });
    }
  }

  bindCancel(handler) {
    if (this.btnCancel) {
      this.btnCancel.addEventListener('click', () => {
        this.resetForm();
        if (handler) handler();
      });
    }
  }

  bindResetDefaults(handler) {
    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin me-reset semua variabel ke nilai default?')) {
          handler();
        }
      });
    }
  }

  bindEntriesChange(handler) {
    if (this.entriesLimit) {
      this.entriesLimit.addEventListener('change', handler);
    }
  }

  bindSearchInput(handler) {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', handler);
    }
  }
}

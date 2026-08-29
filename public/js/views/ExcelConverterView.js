/**
 * ExcelConverterView
 * View Client-Side OOP untuk mengelola UI konversi Teks Saldo ke Microsoft Excel & rendering spreadsheet preview.
 */
export class ExcelConverterView {
  constructor() {
    // Inputs & Form Controls
    this.inputText = document.getElementById('excelInputText');
    this.valueFormat = document.getElementById('excelValueFormat');
    this.headerFormat = document.getElementById('excelHeaderFormat');
    this.autoConvert = document.getElementById('excelAutoConvert');

    // Buttons
    this.btnConvert = document.getElementById('excelBtnConvert');
    this.btnClear = document.getElementById('excelBtnClear');
    this.btnSample = document.getElementById('excelBtnSample');
    this.btnCopyTsv = document.getElementById('excelBtnCopyTsv');
    this.btnCopyRow2 = document.getElementById('excelBtnCopyRow2');
    this.btnDownloadXlsx = document.getElementById('excelBtnDownloadXlsx');
    this.btnDownloadCsv = document.getElementById('excelBtnDownloadCsv');

    // Output & Preview Elements
    this.matchBadge = document.getElementById('excelMatchBadge');
    this.spreadsheetHeaderRow = document.getElementById('excelSpreadsheetHeaders');
    this.spreadsheetDataRow = document.getElementById('excelSpreadsheetValues');
    this.summaryCards = document.getElementById('excelSummaryCards');
    this.tsvPreview = document.getElementById('excelTsvPreview');

    // Tab Navigation Elements
    this.navTabConverter = document.getElementById('navTabConverter');
    this.navTabOcr = document.getElementById('navTabOcr');
    this.navTabExcel = document.getElementById('navTabExcel');
    this.navTabSaldo = document.getElementById('navTabSaldo');
    this.viewConverter = document.getElementById('viewConverter');
    this.viewOcr = document.getElementById('viewOcr');
    this.viewExcel = document.getElementById('viewExcel');
    this.viewSaldo = document.getElementById('viewSaldo');

    // Column CRUD Modal Elements
    this.btnManageColumns = document.getElementById('excelBtnManageColumns');
    this.columnsModal = document.getElementById('excelColumnsModal');
    this.columnsBackdrop = document.getElementById('excelColumnsBackdrop');
    this.btnCloseColumnsModal = document.getElementById('excelBtnCloseColumnsModal');
    this.columnForm = document.getElementById('excelColumnForm');
    this.crudFormTitle = document.getElementById('excelCrudFormTitle');
    this.colId = document.getElementById('excelColId');
    this.colLetter = document.getElementById('excelColLetter');
    this.colCleanHeader = document.getElementById('excelColCleanHeader');
    this.colHeader = document.getElementById('excelColHeader');
    this.colKeywords = document.getElementById('excelColKeywords');
    this.btnCancelEdit = document.getElementById('excelBtnCancelEdit');
    this.btnResetColumns = document.getElementById('excelBtnResetColumns');
    this.columnsTableBody = document.getElementById('excelColumnsTableBody');
    this.colCount = document.getElementById('excelColCount');
  }

  getInputText() {
    return this.inputText ? this.inputText.value : '';
  }

  setInputText(text) {
    if (this.inputText) {
      this.inputText.value = text;
    }
  }

  getOptions() {
    return {
      valueFormat: this.valueFormat ? this.valueFormat.value : 'rp',
      headerFormat: this.headerFormat ? this.headerFormat.value : 'clean'
    };
  }

  isAutoConvert() {
    return this.autoConvert ? this.autoConvert.checked : true;
  }

  switchTab(tabName) {
    const tabs = [
      { name: 'converter', tab: this.navTabConverter, view: this.viewConverter, display: 'flex' },
      { name: 'ocr', tab: this.navTabOcr, view: this.viewOcr, display: 'block' },
      { name: 'excel', tab: this.navTabExcel, view: this.viewExcel, display: 'block' },
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
  }

  renderResults(parsedResult) {
    const { columns, row1Headers, row2Values, matchedCount, tsv, tableData } = parsedResult;

    // 1. Update Match Badge
    const totalColumns = columns.length;
    if (this.matchBadge) {
      this.matchBadge.textContent = `${matchedCount} / ${totalColumns} saldo terdeteksi`;
      if (matchedCount === totalColumns && totalColumns > 0) {
        this.matchBadge.className = 'match-count-badge badge-success';
      } else if (matchedCount > 0) {
        this.matchBadge.className = 'match-count-badge badge-warning';
      } else {
        this.matchBadge.className = 'match-count-badge';
      }
    }

    // 2. Update TSV Preview Textarea
    if (this.tsvPreview) {
      this.tsvPreview.value = tsv;
    }

    // 3. Render Live Spreadsheet Table
    if (this.spreadsheetHeaderRow && this.spreadsheetDataRow) {
      this.spreadsheetHeaderRow.innerHTML = '';
      this.spreadsheetDataRow.innerHTML = '';

      tableData.forEach(item => {
        // Header Cell
        const th = document.createElement('th');
        th.className = item.found ? 'cell-found' : 'cell-empty';
        th.innerHTML = `
          <div class="col-letter">${item.col}</div>
          <div class="col-name" title="${this.escapeHtml(item.header)}">${this.escapeHtml(item.header || `(Kolom ${item.col})`)}</div>
        `;
        this.spreadsheetHeaderRow.appendChild(th);

        // Data Value Cell
        const td = document.createElement('td');
        td.className = item.found ? 'cell-found' : 'cell-empty';
        td.title = item.found ? `Kolom ${item.col}: ${item.value}` : `Kolom ${item.col} kosong`;
        td.innerHTML = item.found
          ? `<span class="val-text">${this.escapeHtml(item.value)}</span>`
          : `<span class="val-empty">-</span>`;
        this.spreadsheetDataRow.appendChild(td);
      });
    }

    // 4. Render Summary Chip Grid
    if (this.summaryCards) {
      this.summaryCards.innerHTML = '';
      tableData.forEach(item => {
        if (!item.cleanHeader) return;

        const chip = document.createElement('div');
        chip.className = `excel-item-card ${item.found ? 'found' : 'missing'}`;
        chip.innerHTML = `
          <div class="card-col-badge">Kolom ${item.col}</div>
          <div class="card-title" title="${this.escapeHtml(item.cleanHeader)}">${this.escapeHtml(item.cleanHeader)}</div>
          <div class="card-amount">${item.found ? this.escapeHtml(item.value) : '<span class="empty-hint">Tidak ditemukan</span>'}</div>
        `;
        this.summaryCards.appendChild(chip);
      });
    }
  }

  // =========================================================
  // MODAL CRUD COLUMN METHODS
  // =========================================================

  openColumnsModal() {
    if (this.columnsModal) {
      this.columnsModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  closeColumnsModal() {
    if (this.columnsModal) {
      this.columnsModal.style.display = 'none';
      document.body.style.overflow = '';
      this.resetColumnForm();
    }
  }

  renderColumnsTable(columns, onEditClick, onDeleteClick) {
    if (this.colCount) {
      this.colCount.textContent = columns.length;
    }

    if (!this.columnsTableBody) return;
    this.columnsTableBody.innerHTML = '';

    if (columns.length === 0) {
      this.columnsTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-dim); padding: 2rem;">
            Belum ada kolom yang dikonfigurasi. Silakan tambah kolom baru atau reset ke bawaan.
          </td>
        </tr>
      `;
      return;
    }

    columns.forEach(colItem => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="col-badge-pill">${this.escapeHtml(colItem.col)}</span></td>
        <td><strong>${this.escapeHtml(colItem.cleanHeader)}</strong></td>
        <td><small style="color: var(--text-muted);">${this.escapeHtml(colItem.keywords)}</small></td>
        <td style="text-align: center;">
          <div class="crud-action-btns">
            <button type="button" class="btn-action-edit" data-id="${colItem.id}">✏️ Edit</button>
            <button type="button" class="btn-action-delete" data-id="${colItem.id}">🗑️ Hapus</button>
          </div>
        </td>
      `;

      const editBtn = tr.querySelector('.btn-action-edit');
      if (editBtn) {
        editBtn.addEventListener('click', () => onEditClick(colItem));
      }

      const deleteBtn = tr.querySelector('.btn-action-delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => onDeleteClick(colItem));
      }

      this.columnsTableBody.appendChild(tr);
    });
  }

  fillColumnFormForEdit(colItem) {
    if (this.crudFormTitle) this.crudFormTitle.textContent = `✏️ Edit Kolom: ${colItem.col} (${colItem.cleanHeader})`;
    if (this.colId) this.colId.value = colItem.id;
    if (this.colLetter) this.colLetter.value = colItem.col;
    if (this.colCleanHeader) this.colCleanHeader.value = colItem.cleanHeader;
    if (this.colHeader) this.colHeader.value = colItem.header;
    if (this.colKeywords) this.colKeywords.value = colItem.keywords;
    if (this.btnCancelEdit) this.btnCancelEdit.style.display = 'inline-block';
  }

  resetColumnForm() {
    if (this.crudFormTitle) this.crudFormTitle.textContent = '➕ Tambah Kolom Excel Baru';
    if (this.colId) this.colId.value = '';
    if (this.columnForm) this.columnForm.reset();
    if (this.btnCancelEdit) this.btnCancelEdit.style.display = 'none';
  }

  getColumnFormData() {
    const rawHeader = this.colHeader ? this.colHeader.value.trim() : '';
    const cleanHeader = rawHeader.replace(/[*:]/g, '').trim();
    return {
      id: this.colId ? this.colId.value : '',
      col: this.colLetter ? this.colLetter.value.trim() : '',
      cleanHeader: cleanHeader,
      header: rawHeader,
      keywords: this.colKeywords ? this.colKeywords.value.trim() : ''
    };
  }

  clearAll() {
    this.setInputText('');
    if (this.tsvPreview) this.tsvPreview.value = '';
    if (this.matchBadge) this.matchBadge.textContent = '0 / 21 saldo terdeteksi';
    if (this.spreadsheetHeaderRow) this.spreadsheetHeaderRow.innerHTML = '';
    if (this.spreadsheetDataRow) this.spreadsheetDataRow.innerHTML = '';
    if (this.summaryCards) this.summaryCards.innerHTML = '';
  }

  escapeHtml(str) {
    if (!str) return '';
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

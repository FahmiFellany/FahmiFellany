/**
 * VariableController
 * Controller Client-Side OOP untuk mengelola siklus hidup CRUD Variabel dan sinkronisasi ke Converter.
 */
export class VariableController {
  /**
   * @param {VariableModel} model
   * @param {VariableView} view
   * @param {ConverterView} toastView
   * @param {Function} onVariablesChange - Callback ke ConverterController saat variabel berubah
   */
  constructor(model, view, toastView, onVariablesChange) {
    this.model = model;
    this.view = view;
    this.toastView = toastView;
    this.onVariablesChange = onVariablesChange;

    this._initEvents();
    this.loadData();
  }

  async loadData() {
    try {
      const variables = await this.model.fetchAll();
      this._renderAll(variables);
      if (typeof this.onVariablesChange === 'function') {
        this.onVariablesChange(this.model.getMap());
      }
    } catch (err) {
      console.error('Gagal memuat variabel:', err);
      if (this.toastView) this.toastView.showToast('Gagal memuat data variabel');
    }
  }

  _renderAll(variables) {
    // 1. Render Tabel CRUD
    this.view.renderTable(
      variables,
      (item) => this.handleEdit(item),
      (item) => this.handleDelete(item)
    );

    // 2. Render Tombol Chip Pintasan di panel converter
    this.view.renderQuickChips(variables, (varKey) => {
      this.handleChipInsert(varKey);
    });
  }

  handleChipInsert(varKey) {
    if (!this.toastView || !this.toastView.inputText) return;
    const textarea = this.toastView.inputText;
    const start = textarea.selectionStart || textarea.value.length;
    const end = textarea.selectionEnd || textarea.value.length;
    const val = textarea.value;

    const prefix = (start > 0 && val[start - 1] !== ' ' && val[start - 1] !== '\n') ? ' ' : '';
    const suffix = (end < val.length && val[end] !== ' ' && val[end] !== '\n') ? ' ' : ' ';
    const insertText = `${prefix}${varKey}${suffix}`;

    textarea.value = val.substring(0, start) + insertText + val.substring(end);
    textarea.focus();
    const newPos = start + insertText.length;
    textarea.setSelectionRange(newPos, newPos);

    // Trigger auto-conversion
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
  }

  _initEvents() {
    // Form Submit (Tambah / Edit)
    this.view.bindFormSubmit(async (formData, isEditing) => {
      try {
        if (isEditing) {
          await this.model.update(formData.id, formData.key, formData.value, formData.description);
          if (this.toastView) this.toastView.showToast(`Variabel "${formData.key}" berhasil diperbarui! ✨`);
        } else {
          await this.model.create(formData.key, formData.value, formData.description);
          if (this.toastView) this.toastView.showToast(`Variabel "${formData.key}" berhasil ditambahkan! 🚀`);
        }

        this.view.resetForm();
        const updated = await this.model.fetchAll();
        this._renderAll(updated);

        if (typeof this.onVariablesChange === 'function') {
          this.onVariablesChange(this.model.getMap());
        }
      } catch (err) {
        if (this.toastView) this.toastView.showToast(`⚠️ ${err.message}`);
      }
    });

    // Reset Defaults
    this.view.bindResetDefaults(async () => {
      try {
        const resetData = await this.model.resetDefaults();
        this.view.resetForm();
        this._renderAll(resetData);
        if (this.toastView) this.toastView.showToast('Semua variabel berhasil di-reset ke default! 🔄');

        if (typeof this.onVariablesChange === 'function') {
          this.onVariablesChange(this.model.getMap());
        }
      } catch (err) {
        if (this.toastView) this.toastView.showToast(`⚠️ ${err.message}`);
      }
    });

    // Entries limit / search change
    this.view.bindEntriesChange(() => {
      this.view.renderTable(
        this.model.getVariables(),
        (item) => this.handleEdit(item),
        (item) => this.handleDelete(item)
      );
    });

    this.view.bindSearchInput(() => {
      this.view.renderTable(
        this.model.getVariables(),
        (item) => this.handleEdit(item),
        (item) => this.handleDelete(item)
      );
    });
  }

  handleEdit(item) {
    this.view.setEditMode(item);
  }

  async handleDelete(item) {
    if (!confirm(`Apakah Anda yakin ingin menghapus variabel "${item.key}" (${item.value})?`)) {
      return;
    }

    try {
      await this.model.delete(item.id);
      if (this.toastView) this.toastView.showToast(`Variabel "${item.key}" berhasil dihapus 🗑️`);

      const updated = await this.model.fetchAll();
      this._renderAll(updated);

      if (typeof this.onVariablesChange === 'function') {
        this.onVariablesChange(this.model.getMap());
      }
    } catch (err) {
      if (this.toastView) this.toastView.showToast(`⚠️ ${err.message}`);
    }
  }
}

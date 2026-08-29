/**
 * SaldoItemController
 * Controller backend untuk endpoint CRUD Item/Kategori Saldo Biller dengan dukungan Multi-Grup.
 */
class SaldoItemController {
  /**
   * @param {SaldoItemModel} model 
   */
  constructor(model) {
    this.model = model;
    this.getAll = this.getAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.reorder = this.reorder.bind(this);
    this.resetDefaults = this.resetDefaults.bind(this);
  }

  getAll(req, res) {
    try {
      const group = req.query.group || 'siang_sore';
      const items = this.model.getAll(group);
      return res.json({ success: true, group, data: items });
    } catch (err) {
      console.error('Error in SaldoItemController.getAll:', err);
      return res.status(500).json({ success: false, error: 'Gagal mengambil data item saldo' });
    }
  }

  create(req, res) {
    try {
      const { label, description, group = 'siang_sore' } = req.body;
      const created = this.model.create({ label, description, group });
      return res.status(201).json({ success: true, data: created, message: 'Item saldo berhasil ditambahkan' });
    } catch (err) {
      console.error('Error in SaldoItemController.create:', err);
      return res.status(400).json({ success: false, error: err.message || 'Gagal menambahkan item saldo' });
    }
  }

  update(req, res) {
    try {
      const { id } = req.params;
      const { label, description, group = 'siang_sore' } = req.body;
      const updated = this.model.update(id, { label, description, group });
      return res.json({ success: true, data: updated, message: 'Item saldo berhasil diperbarui' });
    } catch (err) {
      console.error('Error in SaldoItemController.update:', err);
      return res.status(400).json({ success: false, error: err.message || 'Gagal memperbarui item saldo' });
    }
  }

  delete(req, res) {
    try {
      const { id } = req.params;
      const group = req.query.group || req.body.group || 'siang_sore';
      this.model.delete(id, group);
      return res.json({ success: true, message: 'Item saldo berhasil dihapus' });
    } catch (err) {
      console.error('Error in SaldoItemController.delete:', err);
      return res.status(400).json({ success: false, error: err.message || 'Gagal menghapus item saldo' });
    }
  }

  reorder(req, res) {
    try {
      const { items, group = 'siang_sore' } = req.body;
      const reordered = this.model.reorder(items, group);
      return res.json({ success: true, data: reordered, message: 'Urutan item saldo berhasil diperbarui' });
    } catch (err) {
      console.error('Error in SaldoItemController.reorder:', err);
      return res.status(400).json({ success: false, error: err.message || 'Gagal mengubah urutan item saldo' });
    }
  }

  resetDefaults(req, res) {
    try {
      const group = req.query.group || req.body.group || 'siang_sore';
      const items = this.model.resetDefaults(group);
      return res.json({ success: true, group, data: items, message: `Item saldo (${group}) berhasil di-reset ke default` });
    } catch (err) {
      console.error('Error in SaldoItemController.resetDefaults:', err);
      return res.status(500).json({ success: false, error: 'Gagal me-reset item saldo' });
    }
  }
}

module.exports = SaldoItemController;

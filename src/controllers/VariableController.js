/**
 * VariableController
 * Controller backend untuk endpoint CRUD Variabel Cepat.
 */
class VariableController {
  constructor(variableModel) {
    this.variableModel = variableModel;
    this.getAll = this.getAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.reset = this.reset.bind(this);
  }

  getAll(req, res) {
    try {
      const data = this.variableModel.getAll();
      return res.json({ success: true, data });
    } catch (err) {
      console.error('Error fetching variables:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  create(req, res) {
    try {
      const { key, value, description } = req.body;
      const created = this.variableModel.create({ key, value, description });
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      console.error('Error creating variable:', err);
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  update(req, res) {
    try {
      const { id } = req.params;
      const { key, value, description } = req.body;
      const updated = this.variableModel.update(id, { key, value, description });
      return res.json({ success: true, data: updated });
    } catch (err) {
      console.error('Error updating variable:', err);
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  delete(req, res) {
    try {
      const { id } = req.params;
      this.variableModel.delete(id);
      return res.json({ success: true, message: `Variabel dengan ID ${id} berhasil dihapus` });
    } catch (err) {
      console.error('Error deleting variable:', err);
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  reset(req, res) {
    try {
      const resetList = this.variableModel.resetDefaults();
      return res.json({ success: true, data: resetList, message: 'Variabel berhasil di-reset ke nilai default' });
    } catch (err) {
      console.error('Error resetting variables:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = VariableController;

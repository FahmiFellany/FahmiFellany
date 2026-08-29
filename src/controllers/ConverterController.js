/**
 * ConverterController
 * Controller backend untuk endpoint konversi tanggal & jam dengan pengayaan id_nama.
 */
class ConverterController {
  /**
   * @param {DateTimeConverterModel} model 
   * @param {VariableModel} variableModel
   */
  constructor(model, variableModel) {
    this.model = model;
    this.variableModel = variableModel;
    this.handleConvert = this.handleConvert.bind(this);
  }

  handleConvert(req, res) {
    try {
      const { input, hourOffset = '1s', wrapperStyle = 'symbol', variables: customVars } = req.body;

      if (!input || typeof input !== 'string' || !input.trim()) {
        return res.status(400).json({ error: 'Input teks tidak boleh kosong' });
      }

      // Ambil daftar variabel terdaftar di DB
      const dbVariables = this.variableModel ? this.variableModel.getMap() : {};
      const variables = customVars && typeof customVars === 'object' ? { ...dbVariables, ...customVars } : dbVariables;

      const { result, count } = this.model.convert(input, hourOffset, wrapperStyle, variables);

      return res.json({
        success: true,
        result,
        matchCount: count
      });
    } catch (err) {
      console.error('Error handling convert request:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
  }
}

module.exports = ConverterController;

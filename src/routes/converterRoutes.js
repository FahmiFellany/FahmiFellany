const express = require('express');

/**
 * ConverterRoutes
 * Mengatur routing API untuk fitur konversi pada POST /api/convert.
 */
class ConverterRoutes {
  /**
   * @param {ConverterController} controller - Instansi ConverterController
   */
  constructor(controller) {
    this.controller = controller;
    this.router = express.Router();
    this._initializeRoutes();
  }

  _initializeRoutes() {
    // Sesuai standar REST API: POST /api/convert
    this.router.post('/', this.controller.handleConvert);
  }

  getRouter() {
    return this.router;
  }
}

module.exports = ConverterRoutes;

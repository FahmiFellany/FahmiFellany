const express = require('express');

/**
 * VariableRoutes
 * Router Express untuk rute API CRUD Variabel Cepat.
 */
class VariableRoutes {
  constructor(variableController) {
    this.router = express.Router();
    this.controller = variableController;
    this._initRoutes();
  }

  _initRoutes() {
    this.router.get('/', this.controller.getAll);
    this.router.post('/', this.controller.create);
    this.router.post('/reset', this.controller.reset);
    this.router.put('/:id', this.controller.update);
    this.router.delete('/:id', this.controller.delete);
  }

  getRouter() {
    return this.router;
  }
}

module.exports = VariableRoutes;

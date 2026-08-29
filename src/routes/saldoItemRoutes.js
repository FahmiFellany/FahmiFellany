const express = require('express');

/**
 * SaldoItemRoutes
 * Router Express OOP untuk rute CRUD Item Saldo.
 */
class SaldoItemRoutes {
  /**
   * @param {SaldoItemController} controller 
   */
  constructor(controller) {
    this.controller = controller;
    this.router = express.Router();
    this._initRoutes();
  }

  _initRoutes() {
    this.router.get('/', this.controller.getAll);
    this.router.post('/', this.controller.create);
    this.router.put('/reorder', this.controller.reorder);
    this.router.put('/:id', this.controller.update);
    this.router.delete('/:id', this.controller.delete);
    this.router.post('/reset', this.controller.resetDefaults);
  }

  getRouter() {
    return this.router;
  }
}

module.exports = SaldoItemRoutes;

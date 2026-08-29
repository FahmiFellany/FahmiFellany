const express = require('express');

/**
 * GitlabWebhookRoutes
 * Router Express OOP untuk endpoint webhook GitLab (POST).
 */
class GitlabWebhookRoutes {
  /**
   * @param {GitlabWebhookController} controller 
   */
  constructor(controller) {
    this.controller = controller;
    this.router = express.Router();
    this._initRoutes();
  }

  _initRoutes() {
    // Sesuai standar webhook: POST / (atau mounted di /api/webhook/gitlab)
    this.router.post('/', this.controller.handleWebhook);
    this.router.post('/webhook', this.controller.handleWebhook);
  }

  getRouter() {
    return this.router;
  }
}

module.exports = GitlabWebhookRoutes;

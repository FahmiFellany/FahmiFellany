require('dotenv').config({ quiet: true });
const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const DateTimeConverterModel = require('./src/models/DateTimeConverterModel');
const VariableModel = require('./src/models/VariableModel');
const SaldoItemModel = require('./src/models/SaldoItemModel');
const ConverterController = require('./src/controllers/ConverterController');
const VariableController = require('./src/controllers/VariableController');
const SaldoItemController = require('./src/controllers/SaldoItemController');
const GitlabWebhookController = require('./src/controllers/GitlabWebhookController');
const ConverterRoutes = require('./src/routes/converterRoutes');
const VariableRoutes = require('./src/routes/variableRoutes');
const SaldoItemRoutes = require('./src/routes/saldoItemRoutes');
const GitlabWebhookRoutes = require('./src/routes/gitlabWebhookRoutes');

/**
 * ServerApp
 * Server Express OOP MVC dengan Dukungan CORS, HTTP Method Complete (GET, POST, PUT, DELETE, OPTIONS), dan API JSON Guard.
 */
class ServerApp {
  constructor(port = 3000, host = '0.0.0.0') {
    this.app = express();
    this.port = process.env.PORT || port;
    this.host = process.env.HOST || host;

    // Inisialisasi Models & Controllers
    this.variableModel = new VariableModel();
    this.saldoItemModel = new SaldoItemModel();
    this.converterModel = new DateTimeConverterModel();

    this.converterController = new ConverterController(this.converterModel, this.variableModel);
    this.variableController = new VariableController(this.variableModel);
    this.saldoItemController = new SaldoItemController(this.saldoItemModel);
    this.gitlabWebhookController = new GitlabWebhookController();

    this.converterRoutes = new ConverterRoutes(this.converterController);
    this.variableRoutes = new VariableRoutes(this.variableController);
    this.saldoItemRoutes = new SaldoItemRoutes(this.saldoItemController);
    this.gitlabWebhookRoutes = new GitlabWebhookRoutes(this.gitlabWebhookController);

    this._configureMiddlewares();
    this._configureRoutes();
  }

  _configureMiddlewares() {
    // 1. CORS Middleware & Preflight Handling (Mencegah error HTTP OPTIONS/PUT/DELETE dari beda port/origin)
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Gitlab-Event, X-Gitlab-Token');

      // Respon langsung untuk Preflight OPTIONS request
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });

    // 2. Parser Body Body Request JSON & URL-Encoded
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 3. Static File Middleware
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  _configureRoutes() {
    // Mount rute API secara simetris dan teratur sesuai standar RESTful:
    // - POST   /api/convert
    // - GET    /api/variables
    // - POST   /api/variables
    // - PUT    /api/variables/:id
    // - DELETE /api/variables/:id
    // - POST   /api/variables/reset
    // - GET    /api/saldo-items
    // - POST   /api/saldo-items
    // - PUT    /api/saldo-items/:id
    // - DELETE /api/saldo-items/:id
    // - POST   /api/saldo-items/reset
    // - POST   /api/webhook/gitlab
    // - POST   /webhook/gitlab
    this.app.use('/api/convert', this.converterRoutes.getRouter());
    this.app.use('/api/variables', this.variableRoutes.getRouter());
    this.app.use('/api/saldo-items', this.saldoItemRoutes.getRouter());
    this.app.use('/api/webhook/gitlab', this.gitlabWebhookRoutes.getRouter());
    this.app.use('/webhook/gitlab', this.gitlabWebhookRoutes.getRouter());
    this.app.use('/api/gitlab', this.gitlabWebhookRoutes.getRouter());

    // API 404 Fallback - Selalu mengembalikan JSON (mencegah HTML <!DOCTYPE ...>)
    this.app.use('/api/*', (req, res) => {
      res.status(404).json({
        success: false,
        error: `Endpoint API [${req.method}] "${req.originalUrl}" tidak ditemukan`
      });
    });

    // Global Error Middleware
    this.app.use((err, req, res, next) => {
      console.error('API Error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Terjadi kesalahan internal pada server'
      });
    });
  }

  _getLocalIP() {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        // Skip internal (loopback) dan non-IPv4
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  }

  _openBrowser(url) {
    const startCmd = process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;

    exec(startCmd, (err) => {
      if (err) {
        console.error(`Gagal membuka browser secara otomatis: ${err.message}`);
      }
    });
  }

  start() {
    this.app.listen(this.port, this.host, () => {
      const localUrl = `http://localhost:${this.port}`;
      const networkIP = this._getLocalIP();
      const networkUrl = `http://${networkIP}:${this.port}`;
      console.log(`==================================================`);
      console.log(` Web Server OOP MVC (REST API & CORS Ready)`);
      console.log(` Berjalan di host: ${this.host}`);
      console.log(``);
      console.log(`   Local:   ${localUrl}`);
      console.log(`   Network: ${networkUrl}`);
      console.log(``);
      console.log(` Membuka browser otomatis ke ${localUrl}...`);
      console.log(`==================================================`);

      this._openBrowser(localUrl);
    });
  }
}

// Start Server
if (require.main === module) {
  const server = new ServerApp(3000);
  server.start();
}

module.exports = ServerApp;

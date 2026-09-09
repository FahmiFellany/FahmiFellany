import { ComponentLoader } from './utils/ComponentLoader.js';

import { ConverterModel } from './models/ConverterModel.js';
import { ConverterView } from './views/ConverterView.js';
import { ConverterController } from './controllers/ConverterController.js';

import { VariableModel } from './models/VariableModel.js';
import { VariableView } from './views/VariableView.js';
import { VariableController } from './controllers/VariableController.js';

import { OcrModel } from './models/OcrModel.js';
import { OcrView } from './views/OcrView.js';
import { OcrController } from './controllers/OcrController.js';

import { SaldoModel } from './models/SaldoModel.js';
import { SaldoView } from './views/SaldoView.js';
import { SaldoController } from './controllers/SaldoController.js';

import { CidEksModel } from './models/CidEksModel.js';
import { CidEksView } from './views/CidEksView.js';
import { CidEksController } from './controllers/CidEksController.js';

/**
 * Main Application Bootstrap (OOP MVC Modular)
 */
document.addEventListener('DOMContentLoaded', async () => {
  // 0. Memuat seluruh komponen HTML partials terpisah secara dinamis
  await ComponentLoader.loadAll();

  // 1. Inisialisasi Converter Component
  const converterModel = new ConverterModel();
  const converterView = new ConverterView();
  const converterController = new ConverterController(converterModel, converterView);

  // 2. Inisialisasi Variabel Cepat CRUD Component
  const variableModel = new VariableModel();
  const variableView = new VariableView();
  const variableController = new VariableController(
    variableModel,
    variableView,
    converterView, // reuse toast & input textarea
    (variablesMap) => {
      // Callback realtime: saat variabel berubah, update konverter
      converterController.updateVariables(variablesMap);
    }
  );

  // 3. Inisialisasi OCR Image to Text Component
  const ocrModel = new OcrModel();
  const ocrView = new OcrView();
  const ocrController = new OcrController(ocrModel, ocrView);

  // 4. Inisialisasi Update Info Saldo Component (Pagi, Siang, Sore, Malam + Excel Export & CRUD)
  const saldoModel = new SaldoModel();
  const saldoView = new SaldoView();
  const saldoController = new SaldoController(saldoModel, saldoView);

  // 5. Inisialisasi CID EKS Search & Comparison Component
  const cidEksModel = new CidEksModel();
  const cidEksView = new CidEksView();
  const cidEksController = new CidEksController(cidEksModel, cidEksView);

  // 6. Hubungkan Controller Lintas Menu (Cross-Menu Navigation)
  converterController.setCrossMenuControllers({
    ocrController,
    saldoController,
    cidEksController
  });
});

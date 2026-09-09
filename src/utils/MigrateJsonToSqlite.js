const fs = require('fs');
const path = require('path');
const dbInstance = require('../config/Database');

/**
 * Utility Service untuk Memindahkan (Migrasi) Data dari database.json ke SQLite database.sqlite
 */
class MigrateJsonToSqlite {
  static runMigration() {
    const db = dbInstance.getConnection();
    const jsonPath = path.join(__dirname, '../../data/database.json');

    if (!fs.existsSync(jsonPath)) {
      console.log('ℹ️ Tidak ditemukan database.json. Skema SQLite baru diinisialisasi.');
      return;
    }

    try {
      const rawContent = fs.readFileSync(jsonPath, 'utf-8');
      const jsonData = JSON.parse(rawContent || '{}');

      // Cek jumlah data yang sudah ada di SQLite
      const varCount = db.prepare('SELECT COUNT(*) AS count FROM variables').get().count;
      const saldoCount = db.prepare('SELECT COUNT(*) AS count FROM saldo_items').get().count;

      if (varCount > 0 && saldoCount > 0) {
        console.log(`ℹ️ Data SQLite sudah ada (${varCount} variabel, ${saldoCount} item saldo). Migrasi dilewati.`);
        return;
      }

      console.log('🔄 Memulai proses migrasi data dari database.json ke SQLite database.sqlite...');

      const insertVar = db.prepare(`
        INSERT OR IGNORE INTO variables (id, key, value, description, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `);

      const insertSaldo = db.prepare(`
        INSERT OR IGNORE INTO saldo_items (id, label, description, group_type, sort_order, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      // Gunakan Transaction SQLite untuk memastikan kecepatan dan atomisitas (ACID)
      const migrateTx = db.transaction(() => {
        let migratedVars = 0;
        let migratedSaldo = 0;

        // 1. Migrasi Variables
        if (Array.isArray(jsonData.variables)) {
          jsonData.variables.forEach((v, index) => {
            if (v.key && v.value) {
              const cleanKey = String(v.key).toLowerCase().trim();
              const createdAt = v.createdAt || new Date().toISOString();
              // Gunakan ID numerik valid atau fallback
              const id = typeof v.id === 'number' ? v.id : (index + 1);
              insertVar.run(id, cleanKey, String(v.value), String(v.description || ''), createdAt);
              migratedVars++;
            }
          });
        }

        // 2. Migrasi Saldo Items (Siang-Sore)
        const siangSoreItems = Array.isArray(jsonData.saldo_items_siang_sore)
          ? jsonData.saldo_items_siang_sore
          : (Array.isArray(jsonData.saldo_items) ? jsonData.saldo_items : []);

        siangSoreItems.forEach((item, index) => {
          if (item.id && item.label) {
            insertSaldo.run(
              String(item.id),
              String(item.label),
              String(item.description || ''),
              'siang_sore',
              index + 1,
              new Date().toISOString()
            );
            migratedSaldo++;
          }
        });

        // 3. Migrasi Saldo Items (Pagi-Malam)
        if (Array.isArray(jsonData.saldo_items_pagi_malam)) {
          jsonData.saldo_items_pagi_malam.forEach((item, index) => {
            if (item.id && item.label) {
              insertSaldo.run(
                String(item.id),
                String(item.label),
                String(item.description || ''),
                'pagi_malam',
                index + 1,
                new Date().toISOString()
              );
              migratedSaldo++;
            }
          });
        }

        return { migratedVars, migratedSaldo };
      });

      const result = migrateTx();
      console.log(`✅ Migrasi Sukses! Berhasil memindahkan ${result.migratedVars} variabel dan ${result.migratedSaldo} item saldo ke SQLite.`);
    } catch (err) {
      console.error('❌ Gagal melakukan migrasi data JSON ke SQLite:', err.message);
    }
  }
}

module.exports = MigrateJsonToSqlite;

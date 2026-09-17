const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

/**
 * GoogleSheetService
 * Service Node.js untuk pencocokan & pengisian data otomatis ke Google Sheets.
 * Mendukung ekstraksi URL, pemilihan Tab berdasarkan GID, dan Smart Matching Template Row (misal: 16-Sep-26 jam 13:00 WIB).
 */
class GoogleSheetService {
  constructor() {
    this.credentialsPath = path.join(__dirname, '../../service_account.json');
    this.scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  }

  /**
   * Ekstraksi Spreadsheet ID dan GID Tab jika pengguna memasukkan URL lengkap
   * @param {string} input 
   * @returns {{ spreadsheetId: string, gid: string|null }}
   */
  extractSpreadsheetIdAndGid(input) {
    if (!input) return { spreadsheetId: '', gid: null };
    const str = input.trim();

    let spreadsheetId = str;
    const matchId = str.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (matchId) {
      spreadsheetId = matchId[1];
    }

    let gid = null;
    const matchGid = str.match(/gid=([0-9]+)/);
    if (matchGid) {
      gid = matchGid[1];
    }

    return { spreadsheetId, gid };
  }

  /**
   * Helper membandingkan format tanggal fleksibel (misal: 16-Sep-26 vs 16-Sep-2026 vs 16/09/26)
   */
  matchDate(cellDateStr, targetDateStr) {
    if (!cellDateStr || !targetDateStr) return true;
    const c = cellDateStr.trim().toLowerCase();
    const t = targetDateStr.trim().toLowerCase();

    if (c === t) return true;

    // Normalisasi format tahun 4 digit ke 2 digit (2026 -> 26)
    const cleanC = c.replace(/20(\d{2})$/, '$1');
    const cleanT = t.replace(/20(\d{2})$/, '$1');
    if (cleanC === cleanT) return true;

    // Bandingkan bagian hari & bulan (misal: "16-sep")
    const partC = cleanC.split(/[-/\s]/).slice(0, 2).join('-');
    const partT = cleanT.split(/[-/\s]/).slice(0, 2).join('-');
    return partC === partT;
  }

  /**
   * Smart Update atau Append data monitoring ke Google Sheets
   * @param {string} rawSpreadsheetInput 
   * @param {Object} formData 
   */
  async updateOrAppendMbsb(rawSpreadsheetInput, formData = {}) {
    if (!fs.existsSync(this.credentialsPath)) {
      throw new Error(
        `File credentials service_account.json tidak ditemukan di folder root project!\n` +
        `Pastikan Anda meletakkan file JSON Service Account di folder root aplikasi.`
      );
    }

    const { spreadsheetId, gid } = this.extractSpreadsheetIdAndGid(rawSpreadsheetInput);
    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID tidak valid atau kosong.');
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: this.credentialsPath,
      scopes: this.scopes
    });

    const sheets = google.sheets({ version: 'v4', auth });

    try {
      // 1. Dapatkan metadata spreadsheet
      const meta = await sheets.spreadsheets.get({ spreadsheetId });
      if (!meta.data || !meta.data.sheets || meta.data.sheets.length === 0) {
        throw new Error('Google Sheet tidak memiliki worksheet aktif.');
      }

      // 2. Pilih Tab Sheet yang tepat berdasarkan GID (misal: tab "September 2026")
      let targetSheet = meta.data.sheets[0];
      if (gid) {
        const found = meta.data.sheets.find(s => String(s.properties.sheetId) === String(gid));
        if (found) {
          targetSheet = found;
        }
      }

      const sheetTitle = targetSheet.properties.title;
      const sheetNameRange = `'${sheetTitle}'`;

      // 3. Baca 200 baris pertama pada tab sheet yang tepat
      const readRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetNameRange}!A1:I200`
      });

      const existingRows = (readRes.data && readRes.data.values) ? readRes.data.values : [];
      
      const targetDate = (formData.checkingDate || '').trim();
      const targetTime = (formData.checkingTime || '').trim();

      let matchedRowIndex = -1; // 1-indexed row number in Google Sheet
      let currentDateInBlock = '';

      // Scan seluruh baris template pada sheet untuk mencari baris jam yang tepat di bawah tanggal yang cocok
      for (let i = 0; i < existingRows.length; i++) {
        const row = existingRows[i];
        const cellA = (row[0] || '').toString().trim();
        const cellB = (row[1] || '').toString().trim();

        if (cellA) {
          currentDateInBlock = cellA;
        }

        // Cek jika jam di kolom B cocok (misal: "13:00 WIB")
        if (cellB === targetTime) {
          if (this.matchDate(currentDateInBlock, targetDate)) {
            matchedRowIndex = i + 1; // Nomor baris 1-indexed
            break;
          }
        }
      }

      const rowValuesColsCtoI = [
        formData.login || '',
        formData.checkBalance || '',
        formData.transferDana || '',
        formData.fiturPembayaran || '',
        formData.providerJaringan || 'WIFI KANTOR',
        formData.pic || '',
        formData.keterangan || '-'
      ];

      // 4. Jika baris template (misal: Row 49 untuk 16-Sep-26 jam 13:00 WIB) ditemukan, UPDATE KOLOM C s/d I
      if (matchedRowIndex > 0) {
        const updateRange = `${sheetNameRange}!C${matchedRowIndex}:I${matchedRowIndex}`;
        const updateRes = await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: updateRange,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [rowValuesColsCtoI]
          }
        });

        return {
          action: 'UPDATE',
          rowIndex: matchedRowIndex,
          sheetTitle,
          updatedRange: updateRange,
          data: updateRes.data
        };
      }

      // 5. Fallback: Jika tidak ditemukan di template, append baris baru lengkap (A s/d I) di bawah
      const fullRowValues = [
        formData.checkingDate || '',
        formData.checkingTime || '',
        ...rowValuesColsCtoI
      ];

      const appendRange = `${sheetNameRange}!A:I`;
      const appendRes = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: appendRange,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [fullRowValues]
        }
      });

      return {
        action: 'APPEND',
        sheetTitle,
        data: appendRes.data
      };

    } catch (err) {
      if (err.code === 404 || (err.message && err.message.includes('Requested entity was not found'))) {
        throw new Error(
          `Google Sheet (ID: ${spreadsheetId}) tidak ditemukan atau BELUM DIBAGIKAN (Share).\n\n` +
          `Langkah Solusi:\n` +
          `1. Buka Google Sheet Anda di browser.\n` +
          `2. Klik tombol "Share" (Bagikan) di pojok kanan atas.\n` +
          `3. Tambahkan email Service Account ini sebagai EDITOR:\n` +
          `   sheets-mbsb@mbsb-508804.iam.gserviceaccount.com`
        );
      }
      throw err;
    }
  }
}

module.exports = new GoogleSheetService();

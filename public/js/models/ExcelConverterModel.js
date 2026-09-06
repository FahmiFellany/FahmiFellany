/**
 * ExcelConverterModel
 * Menangani parsing teks saldo broadcast/laporan menjadi format terstruktur Excel (Kolom A s/d Kolom V).
 */
export class ExcelConverterModel {
  constructor() {
    this.storageKey = 'app_excel_columns';
    this.columnDefs = [];
    this.loadColumns();
  }

  /**
   * Mengembalikan daftar 21 kolom default bawaan sistem
   */
  getDefaultColumns() {
    return [
      {
        id: 1,
        col: 'A',
        header: '*Saldo Pulsa-114 - Voucher:*',
        cleanHeader: 'Saldo Pulsa-114 - Voucher',
        keywords: 'saldo pulsa-114, pulsa-114'
      },
      {
        id: 2,
        col: 'B',
        header: '*Saldo E-Money - Voucher:*',
        cleanHeader: 'Saldo E-Money - Voucher',
        keywords: 'saldo e-money, e-money - voucher'
      },
      {
        id: 3,
        col: 'C',
        header: '*Saldo MMI - Voucher:*',
        cleanHeader: 'Saldo MMI - Voucher',
        keywords: 'saldo mmi, mmi - voucher'
      },
      {
        id: 4,
        col: 'D',
        header: '*Saldo PPM - Voucher:*',
        cleanHeader: 'Saldo PPM - Voucher',
        keywords: 'saldo ppm, ppm - voucher'
      },
      {
        id: 5,
        col: 'E',
        header: '*Saldo Bimasakti - PDAM:*',
        cleanHeader: 'Saldo Bimasakti - PDAM',
        keywords: 'saldo bimasakti, bimasakti'
      },
      {
        id: 6,
        col: 'F',
        header: '*Saldo Teleanjar - PDAM:*',
        cleanHeader: 'Saldo Teleanjar - PDAM',
        keywords: 'saldo teleanjar, teleanjar'
      },
      {
        id: 7,
        col: 'G',
        header: '*Saldo DELIMA - BPJS & PayTV:*',
        cleanHeader: 'Saldo DELIMA - BPJS & PayTV',
        keywords: 'saldo delima, delima'
      },
      {
        id: 8,
        col: 'H',
        header: '*Saldo DJI - FIF:*',
        cleanHeader: 'Saldo DJI - FIF',
        keywords: 'saldo dji, dji - fif'
      },
      {
        id: 9,
        col: 'I',
        header: '*Saldo Pluslink - MF:*',
        cleanHeader: 'Saldo Pluslink - MF',
        keywords: 'saldo pluslink, pluslink'
      },
      {
        id: 10,
        col: 'J',
        header: '*Saldo Mitracom - PBB:*',
        cleanHeader: 'Saldo Mitracom - PBB',
        keywords: 'saldo mitracom, mitracom'
      },
      {
        id: 11,
        col: 'K',
        header: '*Saldo GSP:*',
        cleanHeader: 'Saldo GSP',
        keywords: 'saldo gsp, gsp'
      },
      {
        id: 12,
        col: 'L',
        header: '*Saldo PT POS - PDAM:*',
        cleanHeader: 'Saldo PT POS - PDAM',
        keywords: 'saldo pt pos, pt pos'
      },
      {
        id: 13,
        col: 'M',
        header: '*Saldo Artajasa - MBA:*',
        cleanHeader: 'Saldo Artajasa - MBA',
        keywords: 'artajasa - mba, saldo artajasa - mba'
      },
      {
        id: 14,
        col: 'N',
        header: '*Saldo Arindo - PDAM:*',
        cleanHeader: 'Saldo Arindo - PDAM',
        keywords: 'saldo arindo, arindo'
      },
      {
        id: 15,
        col: 'O',
        header: '*Saldo Ewallet - Dana:*',
        cleanHeader: 'Saldo Ewallet - Dana',
        keywords: 'ewallet - dana, saldo dana, dana'
      },
      {
        id: 16,
        col: 'P',
        header: '*Saldo LinkQU - Transfer Uang:*',
        cleanHeader: 'Saldo LinkQU - Transfer Uang',
        keywords: 'saldo linkqu, linkqu'
      },
      {
        id: 17,
        col: 'Q',
        header: '*Saldo Artajasa - VSI:*',
        cleanHeader: 'Saldo Artajasa - VSI',
        keywords: 'artajasa - vsi, saldo artajasa - vsi'
      },
      {
        id: 18,
        col: 'R',
        header: '*Saldo Ewallet - Ovo:*',
        cleanHeader: 'Saldo Ewallet - Ovo',
        keywords: 'ewallet - ovo, saldo ovo, ovo'
      },
      {
        id: 19,
        col: 'S',
        header: '*Saldo Tokopedia - Gopay:*',
        cleanHeader: 'Saldo Tokopedia - Gopay',
        keywords: 'tokopedia - gopay, tokopedia, gopay'
      },
      {
        id: 20,
        col: 'T',
        header: '*Saldo AJN - PDAM:*',
        cleanHeader: 'Saldo AJN - PDAM',
        keywords: 'saldo ajn, ajn - pdam'
      },
      {
        id: 21,
        col: 'U',
        header: '*Saldo JATELINDO - PLN:*',
        cleanHeader: 'Saldo JATELINDO - PLN',
        keywords: 'saldo jatelindo, jatelindo'
      }
    ];
  }

  /**
   * Konversi kata kunci menjadi ekspresi reguler (RegExp) dengan pembatas boundary kata/digit yang akurat
   */
  _buildPatterns(keywords) {
    if (!keywords) return [];
    const list = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim()).filter(Boolean);
    return list.map(kw => {
      // Bersihkan simbol pembuka/penutup seperti * dan :
      const cleanKw = kw.replace(/^[*:\s]+|[*:\s]+$/g, '').trim();
      const escaped = cleanKw.replace(/[-[\]{}()+?.,\\^$|#]/g, '\\$&').replace(/\s+/g, '[\\s_\\-–—]*');
      // Pastikan boundary di awal dan akhir jika alfanumerik agar tidak salah mencocokkan prefix (misal pulsa-1 vs pulsa-114)
      const prefix = /^[a-zA-Z0-9]/.test(cleanKw) ? '(?:^|[^a-zA-Z0-9])' : '';
      const suffix = /[a-zA-Z0-9]$/.test(cleanKw) ? '(?![a-zA-Z0-9])' : '';
      return new RegExp(`${prefix}${escaped}${suffix}`, 'i');
    });
  }

  /**
   * Memuat konfigurasi kolom dari localStorage atau default
   */
  loadColumns() {
    let rawData = this._memoryColumns || null;
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) rawData = JSON.parse(stored);
      } catch (e) {
        console.warn('Gagal membaca kolom dari localStorage:', e);
      }
    }

    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      rawData = this.getDefaultColumns();
      this.saveColumns(rawData);
    }

    this._memoryColumns = rawData;
    this.columnDefs = rawData.map(item => ({
      ...item,
      patterns: this._buildPatterns(item.keywords)
    }));

    return this.columnDefs;
  }

  /**
   * Menyimpan konfigurasi kolom ke localStorage
   */
  saveColumns(columns) {
    const toSave = columns.map(({ id, col, header, cleanHeader, keywords }) => ({
      id: id || Date.now() + Math.random(),
      col: col || '',
      header: header || '',
      cleanHeader: cleanHeader || '',
      keywords: keywords || ''
    }));
    this._memoryColumns = toSave;

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(toSave));
      } catch (e) {
        console.error('Gagal menyimpan kolom ke localStorage:', e);
      }
    }
  }

  /**
   * Mengambil semua definisi kolom
   */
  getAllColumns() {
    return this.columnDefs;
  }

  /**
   * Tambah kolom baru
   */
  addColumn(colData) {
    const rawList = this.getAllColumns().map(({ id, col, header, cleanHeader, keywords }) => ({
      id, col, header, cleanHeader, keywords
    }));

    const newId = Date.now();
    const rawHeader = colData.header ? colData.header.trim() : `*${(colData.cleanHeader || 'Saldo').trim()}:*`;
    const cleanHeader = colData.cleanHeader ? colData.cleanHeader.trim() : rawHeader.replace(/[*:]/g, '').trim();

    const newCol = {
      id: newId,
      col: (colData.col || this._getNextColumnLetter(rawList.length)).toUpperCase().trim(),
      header: rawHeader,
      cleanHeader: cleanHeader,
      keywords: colData.keywords || cleanHeader.toLowerCase()
    };

    rawList.push(newCol);
    this.saveColumns(rawList);
    this.loadColumns();
    return newCol;
  }

  /**
   * Update kolom yang sudah ada
   */
  updateColumn(id, updatedData) {
    const rawList = this.getAllColumns().map(({ id: itemIdx, col, header, cleanHeader, keywords }) => ({
      id: itemIdx, col, header, cleanHeader, keywords
    }));

    const idx = rawList.findIndex(item => String(item.id) === String(id));
    if (idx === -1) return false;

    const rawHeader = updatedData.header ? updatedData.header.trim() : rawList[idx].header;
    const cleanHeader = updatedData.cleanHeader ? updatedData.cleanHeader.trim() : rawHeader.replace(/[*:]/g, '').trim();

    rawList[idx] = {
      ...rawList[idx],
      col: (updatedData.col || rawList[idx].col).toUpperCase().trim(),
      header: rawHeader,
      cleanHeader: cleanHeader,
      keywords: updatedData.keywords !== undefined ? updatedData.keywords : rawList[idx].keywords
    };

    this.saveColumns(rawList);
    this.loadColumns();
    return true;
  }

  /**
   * Hapus kolom berdasarkan ID
   */
  deleteColumn(id) {
    let rawList = this.getAllColumns().map(({ id: itemIdx, col, header, cleanHeader, keywords }) => ({
      id: itemIdx, col, header, cleanHeader, keywords
    }));

    rawList = rawList.filter(item => String(item.id) !== String(id));

    // Auto-reindex huruf kolom (A, B, C...) jika diinginkan
    rawList = rawList.map((item, index) => ({
      ...item,
      col: this._getColumnLetterFromIndex(index)
    }));

    this.saveColumns(rawList);
    this.loadColumns();
    return true;
  }

  /**
   * Reset kolom ke 21 kolom bawaan
   */
  resetColumnsToDefault() {
    const defaults = this.getDefaultColumns();
    this.saveColumns(defaults);
    this.loadColumns();
    return this.columnDefs;
  }

  _getNextColumnLetter(index) {
    return this._getColumnLetterFromIndex(index);
  }

  _getColumnLetterFromIndex(index) {
    let letter = '';
    let temp = index;
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  }

  /**
   * Mengurai teks input mentah menjadi data matriks 2 baris (Baris 1: Header, Baris 2: Nilai)
   * @param {string} rawText
   * @param {Object} options { valueFormat: 'rp'|'clean'|'number', headerFormat: 'original'|'clean' }
   * @returns {{
   *   columns: Array,
   *   row1Headers: Array<string>,
   *   row2Values: Array<string>,
   *   matchedCount: number,
   *   tsv: string,
   *   csv: string,
   *   tableData: Array<{ col: string, header: string, cleanHeader: string, value: string, numeric: number, raw: string, found: boolean }>
   * }}
   */
  parseText(rawText, options = {}) {
    const valueFormat = options.valueFormat || 'rp'; // 'rp' (Rp. 1.127.884) | 'clean' (1127884) | 'formatted' (1.127.884)
    const headerFormat = options.headerFormat || 'clean'; // 'clean' (Saldo...) | 'original' (*Saldo...*)

    if (!rawText || !rawText.trim()) {
      return this.getEmptyResult();
    }

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const extracted = {};
    const usedLineIndices = new Set();

    for (let i = 0; i < lines.length; i++) {
      if (usedLineIndices.has(i)) continue;
      const line = lines[i];

      for (const colDef of this.columnDefs) {
        if (!colDef.patterns || colDef.patterns.length === 0) continue;
        if (colDef.col in extracted) continue;

        const isMatched = colDef.patterns.some(p => p.test(line));
        if (isMatched) {
          let amountStr = '';
          let lineOffset = 0;

          // 1. Cek jika nominal ada di baris yang sama (misal: *Saldo PPM:* Rp. 30.448.200)
          const sameLineMatch = line.match(/(?:Rp\.?|IDR)?\s*([\d.,]+)\s*$/i);
          if (sameLineMatch && sameLineMatch[1] && /\d/.test(sameLineMatch[1]) && sameLineMatch[1].length >= 3) {
            amountStr = sameLineMatch[0].trim();
          } else if (i + 1 < lines.length) {
            // 2. Cek baris berikutnya
            const nextLine = lines[i + 1];
            const nextMatch = nextLine.match(/^(?:Rp\.?|IDR)?\s*([\d.,]+)/i);
            if (nextMatch) {
              amountStr = nextLine.trim();
              lineOffset = 1;
            }
          }

          if (amountStr) {
            const digitsOnly = amountStr.replace(/[^\d]/g, '');
            const parsedNum = parseInt(digitsOnly, 10) || 0;

            // Ekstrak Header Asli & Header Bersih secara dinamis dari baris teks input
            const rawHeaderFromLine = line.replace(/(?:Rp\.?|IDR)?\s*[\d.,]+\s*$/i, '').trim();
            const activeHeader = rawHeaderFromLine || colDef.header;
            const activeCleanHeader = activeHeader.replace(/[*:]/g, '').trim() || colDef.cleanHeader;

            extracted[colDef.col] = {
              raw: amountStr,
              numeric: parsedNum,
              formattedRp: `Rp. ${parsedNum.toLocaleString('id-ID')}`,
              numberFormatted: parsedNum.toLocaleString('id-ID'),
              digitsOnly: digitsOnly,
              header: activeHeader,
              cleanHeader: activeCleanHeader
            };

            usedLineIndices.add(i);
            if (lineOffset > 0) usedLineIndices.add(i + lineOffset);
            break;
          }
        }
      }
    }

    // Bangun baris 1 (Headers) dan baris 2 (Values)
    const row1Headers = [];
    const row2Values = [];
    const tableData = [];
    let matchedCount = 0;

    this.columnDefs.forEach(colDef => {
      const data = extracted[colDef.col];
      const isFound = Boolean(data);
      if (isFound) matchedCount++;

      // Header Text (Otomatis dari teks input jika terdeteksi, atau default konfigurasi)
      const cleanH = data ? data.cleanHeader : colDef.cleanHeader;
      const rawH = data ? data.header : colDef.header;

      let headerText = '';
      if (headerFormat === 'clean') {
        headerText = cleanH;
      } else {
        headerText = rawH;
      }

      // Value Text
      let valueText = '';
      if (data) {
        if (valueFormat === 'clean') {
          valueText = String(data.numeric);
        } else if (valueFormat === 'formatted') {
          valueText = data.numberFormatted;
        } else {
          valueText = data.formattedRp;
        }
      }

      row1Headers.push(headerText);
      row2Values.push(valueText);

      tableData.push({
        col: colDef.col,
        header: headerText,
        cleanHeader: cleanH,
        value: valueText,
        numeric: data ? data.numeric : 0,
        raw: data ? data.raw : '',
        found: isFound
      });
    });

    // TSV (Tab Separated Values) -> Sempurna untuk Copy & Paste langsung ke Microsoft Excel
    const tsv = `${row1Headers.join('\t')}\n${row2Values.join('\t')}`;

    // Nilai baris 2 saja (TSV)
    const tsvRow2Only = row2Values.join('\t');

    // CSV format
    const csv = `${row1Headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',')}\n${row2Values.map(v => `"${v.replace(/"/g, '""')}"`).join(',')}`;

    return {
      columns: this.columnDefs,
      row1Headers,
      row2Values,
      matchedCount,
      tsv,
      tsvRow2Only,
      csv,
      tableData
    };
  }

  getEmptyResult() {
    const row1Headers = this.columnDefs.map(c => c.header);
    const row2Values = this.columnDefs.map(() => '');
    const tableData = this.columnDefs.map(c => ({
      col: c.col,
      header: c.header,
      cleanHeader: c.cleanHeader,
      value: '',
      numeric: 0,
      raw: '',
      found: false
    }));

    return {
      columns: this.columnDefs,
      row1Headers,
      row2Values,
      matchedCount: 0,
      tsv: `${row1Headers.join('\t')}\n${row2Values.join('\t')}`,
      tsvRow2Only: row2Values.join('\t'),
      csv: `${row1Headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',')}\n${row2Values.map(v => `"${v.replace(/"/g, '""')}"`).join(',')}`,
      tableData
    };
  }

  /**
   * Menghasilkan teks contoh input untuk pengujian cepat pengguna
   */
  getSampleInput() {
    return `*Saldo Pulsa-114 - Voucher:*
Rp. 1.127.884

*Saldo PPM - Voucher:*
Rp. 30.448.200

*Saldo MMI - Voucher:*
Rp. 54.460.334

*Saldo E-Money - Voucher:*
Rp. 14.361.843

*Saldo Ewallet - Dana:*
Rp. 3.007.055.010

*Saldo JATELINDO - PLN:*
Rp. 1.370.169.077

*Saldo Bimasakti - PDAM:*
Rp. 111.204.920

*Saldo Teleanjar - PDAM:*
Rp. 103.615.614

*Saldo DELIMA - BPJS & PayTV:*
Rp. 507.411.753

*Saldo DJI - FIF:*
Rp. 456.343.728

*Saldo Pluslink - MF:*
Rp. 1.109.547

*Saldo Mitracom - PBB:*
Rp. 12.166.149

*Saldo AJN - PDAM:*
Rp. 287.883.395

*Saldo GSP:*
Rp. 115.681.928

*Saldo PT POS - PDAM:*
Rp. 727.285.736

*Saldo Artajasa - MBA:*
Rp. 183.719.368

*Saldo Artajasa - VSI:*
Rp. 84.419.577

*Saldo LinkQU - Transfer Uang:*
Rp. 6.391.065

*Saldo Ewallet - Ovo:*
Rp. 144.076.038

*Saldo Tokopedia - Gopay:*
Rp. 115.191.621

*Saldo Arindo - PDAM:*
Rp. 58.785.913`;
  }
}

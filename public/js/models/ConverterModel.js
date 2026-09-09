/**
 * ConverterModel
 * Model Client-Side OOP untuk mengelola State, Logika Konversi Tanggal Terstruktur (Hanya dalam format kurung []),
 * Variabel Shortcut, serta Rephrase Tiket Helpdesk & Deteksi Lintas Menu.
 */
export class ConverterModel {
  constructor() {
    this.inputText = '';
    this.hourOffset = '1s'; // Default +1 Detik
    this.wrapperStyle = 'symbol'; // 'symbol', 'clean', 'brackets'
    this.autoConvert = true;
    this.resultText = '';
    this.matchCount = 0;

    // Shortcut variables dictionary
    this.variables = {
      'idm': 'Informasi dari Mitra',
      'idi': 'Informasi dari Internal',
      'idb': 'Informasi dari Biller',
      'fvo': 'FU ke VSI OPS',
      'fms': 'FU ke MASA SAC',
      'fc': 'FU ke Ceria',
      'fb': 'Fu ke Biller',
      'mkm': 'Menyampaikan ke mitra'
    };

    // Pattern 1: Format Kurung [Waktu, Tanggal] — contoh: [17.13, 19/8/2026], [8:25 PM, 8/11/2026]
    this.patternTimeFirst = /\[\s*(\d{1,2})[\.:](\d{1,2})(?::(\d{1,2}))?\s*(AM|PM|am|pm)?\s*,\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\s*\]/gi;

    // Pattern 2: Format Kurung [Tanggal Waktu] — contoh: [19/08/2026 17:13], [12/08/2026 13:10:00]
    this.patternDateFirst = /\[\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\s+(\d{1,2})[\.:](\d{1,2})(?::(\d{1,2}))?\s*(AM|PM|am|pm)?\s*\]/gi;

    // Pattern 3: Format Kurung ISO [YYYY-MM-DD HH:mm:ss] — contoh: [2026-08-19 17:13:00]
    this.patternIsoBracket = /\[\s*(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s+(\d{1,2})[\.:](\d{1,2})(?::(\d{1,2}))?\s*(AM|PM|am|pm)?\s*\]/gi;
  }

  _getApiUrl(endpoint) {
    const isNodeServer = window.location.origin.includes(':3000');
    const baseUrl = isNodeServer ? '' : 'http://localhost:3000';
    return `${baseUrl}${endpoint}`;
  }

  setInputText(text) {
    this.inputText = text || '';
  }

  setHourOffset(offset) {
    this.hourOffset = offset || '1s';
  }

  setWrapperStyle(style) {
    this.wrapperStyle = style || 'symbol';
  }

  setAutoConvert(enabled) {
    this.autoConvert = Boolean(enabled);
  }

  setAutoCleanDuplicates(enabled) {
    this.autoCleanDuplicates = Boolean(enabled);
  }

  setVariables(variables) {
    if (variables && typeof variables === 'object') {
      this.variables = { ...variables };
    }
  }

  /**
   * Helper format hasil konversi tanggal ke wrapper style terpilih
   * @private
   */
  _formatResult(y, mo, d, h, m, s, offset, wrapper, dupExtraSeconds = 0) {
    const dateObj = new Date(y, mo, d, h, m, s);

    if (typeof offset === 'string' && offset.endsWith('s')) {
      const secOffset = parseInt(offset, 10) || 0;
      dateObj.setSeconds(dateObj.getSeconds() + secOffset);
    } else {
      const hourOffset = parseInt(offset, 10) || 0;
      if (hourOffset !== 0) {
        dateObj.setHours(dateObj.getHours() + hourOffset);
      }
    }

    if (dupExtraSeconds > 0) {
      dateObj.setSeconds(dateObj.getSeconds() + dupExtraSeconds);
    }

    const resY = dateObj.getFullYear();
    const resM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const resD = String(dateObj.getDate()).padStart(2, '0');
    const resH = String(dateObj.getHours()).padStart(2, '0');
    const resMin = String(dateObj.getMinutes()).padStart(2, '0');
    const resSec = String(dateObj.getSeconds()).padStart(2, '0');

    const formatted = `${resY}-${resM}-${resD} ${resH}:${resMin}:${resSec}`;

    if (wrapper === 'brackets') {
      return `[${formatted}]`;
    } else if (wrapper === 'clean') {
      return formatted;
    } else {
      return `^${formatted}~`;
    }
  }

  /**
   * Helper parsing waktu 12h AM/PM atau 24h
   * @private
   */
  _parseTime(hh, mm, ss, ampm) {
    let h = parseInt(hh, 10);
    let m = parseInt(mm, 10);
    let s = ss ? parseInt(ss, 10) : 0;

    if (ampm) {
      const isPM = ampm.toUpperCase() === 'PM';
      const isAM = ampm.toUpperCase() === 'AM';

      if (isPM && h < 12) {
        h += 12;
      } else if (isAM && h === 12) {
        h = 0;
      }
    }

    return { h, m, s };
  }

  /**
   * Helper parsing D/M vs M/D
   * @private
   */
  _parseDate(part1, part2) {
    const p1 = parseInt(part1, 10);
    const p2 = parseInt(part2, 10);

    let d, mo;
    if (p1 > 12 && p2 <= 12) {
      d = p1;
      mo = p2 - 1;
    } else if (p1 <= 12 && p2 > 12) {
      d = p2;
      mo = p1 - 1;
    } else {
      d = p1;
      mo = p2 - 1;
    }

    return { d, mo };
  }

  /**
   * Menganalisis konteks teks untuk memberikan saran template shortcut
   * @param {string} text 
   * @returns {Array<{ key: string, label: string, reason: string }>}
   */
  analyzeContext(text) {
    if (!text || typeof text !== 'string' || !text.trim()) return [];
    const lower = text.toLowerCase();
    const suggestions = [];
    const addedKeys = new Set();

    const addSuggestion = (key, label, reason) => {
      if (!addedKeys.has(key) && this.variables[key]) {
        suggestions.push({
          key,
          label: this.variables[key] || label,
          reason
        });
        addedKeys.add(key);
      }
    };

    if (/(?:biller|timeout|rc\s*(?:68|05|91|88)|suspect|gangguan\s*biller)/i.test(lower)) {
      addSuggestion('idb', 'Informasi dari Biller', 'Kendala Biller/Timeout');
      addSuggestion('fb', 'Fu ke Biller', 'Tindak lanjut ke Biller');
    }

    if (/(?:mitra|agen|pelanggan|member|komplain|keluhan)/i.test(lower)) {
      addSuggestion('idm', 'Informasi dari Mitra', 'Laporan dari Mitra');
      addSuggestion('mkm', 'Menyampaikan ke mitra', 'Kirim update ke Mitra');
    }

    if (/(?:sukses|berhasil|terpotong|saldo\s*terpotong|vsi|sac|masa\s*sac)/i.test(lower)) {
      addSuggestion('fms', 'FU ke MASA SAC', 'Koordinasi status MASA SAC');
      addSuggestion('fvo', 'FU ke VSI OPS', 'Eskalasi tim VSI OPS');
    }

    if (/(?:internal|database|cek\s*db|log\s*server|eskalasi)/i.test(lower)) {
      addSuggestion('idi', 'Informasi dari Internal', 'Pemeriksaan Internal');
    }

    if (/(?:ceria|bank\s*ceria)/i.test(lower)) {
      addSuggestion('fc', 'FU ke Ceria', 'Tindak lanjut Bank Ceria');
    }

    return suggestions;
  }

  /**
   * Deteksi otomatis lintas menu (Smart Cross-Menu Navigation Prompt)
   * @param {string} text 
   * @returns {{ targetTab: string, title: string, description: string }|null}
   */
  detectCrossMenuIntent(text) {
    if (!text || typeof text !== 'string' || text.length < 15) return null;

    // A. Deteksi Struktur Data Transaksi (Pengecekan Transaksi)
    const isOcrTransaction = (
      /(?:\[?(?:CSM_TM|CPM_TRANS)_[A-Z0-9_]+\]?)/i.test(text) ||
      /(?:IDPEL|PPID|TRXID|TOTAL_PERIOD|DST_RCV_NAME|TAX_NAME|NOP_NPWP)\s*[:=]/i.test(text) ||
      /(?:Transaksi\s*:\s*FIF|Jenis\s*Transaksi\s*:\s*PBB|Token\s*Listrik\s*PLN)/i.test(text)
    );

    if (isOcrTransaction) {
      let typeLabel = 'Transaksi';
      if (/FIF|PT_NAME/i.test(text)) typeLabel = 'FIF / Multi Finance';
      else if (/NOP|AREA_NAME|TAX_YEAR/i.test(text)) typeLabel = 'PBB';
      else if (/TOKEN|KWH|MSN|PUBLIC_LIGHTING/i.test(text)) typeLabel = 'Prepaid PLN';
      else if (/BILL_PERIOD|AIR/i.test(text)) typeLabel = 'PDAM';
      else if (/INFO_TEXT|DETAIL_DATA/i.test(text)) typeLabel = 'General Payment';
      else if (/BPJS/i.test(text)) typeLabel = 'BPJS';

      return {
        targetTab: 'ocr',
        title: `Struktur Data Transaksi (${typeLabel})`,
        description: `Teks mengandung parameter transaksi ${typeLabel}. Beralih ke formulir Pengecekan Transaksi?`
      };
    }

    // B. Deteksi Struktur Info Saldo (Update Info Saldo)
    const isSaldoReport = (
      /(?:UPDATE\s*INFO\s*SALDO|SALDO\s*AWAL|DEPOSIT|PEMAKAIAN|SISA\s*SALDO|LIMIT\s*SALDO)/i.test(text) &&
      /(?:Rp\.?|IDR|\d{1,3}(?:\.\d{3})+)/i.test(text)
    );

    if (isSaldoReport) {
      return {
        targetTab: 'saldo',
        title: 'Laporan Update Info Saldo',
        description: 'Teks terdeteksi sebagai format rekap saldo. Beralih ke menu Update Info Saldo?'
      };
    }

    return null;
  }

  /**
   * Pembersihan Teks Chat Duplikat/Berulang (Multi-Line, Sender Header & History Line Skipping)
   * Memecah teks ke dalam blok pesan chat berdasarkan pola timestamp & pengirim pesan,
   * lalu menghapus baris-baris kuotasi yang sudah pernah muncul pada blok-blok pesan sebelumnya.
   * Jika suatu blok pesan 100% berisi kuotasi/duplikat (kosong setelah dibersihkan), blok tersebut tidak ditampilkan.
   * @param {string} inputText Teks mentah dari input textarea
   * @returns {{ cleanedText: string, cleanedDupCount: number }} Teks yang sudah dibersihkan dan jumlah duplikasi terdeteksi
   */
  cleanDuplicateChatText(inputText) {
    if (!inputText || typeof inputText !== 'string' || !inputText.trim()) {
      return { cleanedText: inputText, cleanedDupCount: 0 };
    }

    // Regex untuk mencocokkan header timestamp + opsional nama pengirim pesan chat (mendukung : maupun - pengirim)
    // Contoh: "[2:21 PM, 9/7/2026] IT DCO-VSI Baru: " atau "9/8/2026, 09.45 - Nama:" atau "[09.33, 8/9/2026] +62 858-9158-7045: "
    const timestampHeaderRegex = /(?:(?:\d+[\.\)]\s*)?(?:\[\s*[^\]]+\s*\]|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}\s+\d{1,2}[\.:]\d{1,2}(?::\d{1,2})?|\d{1,2}[\.:]\d{1,2}\s+\d{1,2}[\/\-\.][A-Za-z]{3}[\/\-\.]\d{4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}T\d{1,2}[\.:]\d{1,2}(?::\d{1,2})?Z?)(?:\s*[^:\n]+:|\s*-\s+[^:\n]+:?)?)/gi;

    // Cari semua lokasi header timestamp dalam teks
    const matches = [...inputText.matchAll(timestampHeaderRegex)];

    // Jika tidak ada header timestamp yang cocok, kembalikan teks asli
    if (matches.length === 0) {
      return { cleanedText: inputText, cleanedDupCount: 0 };
    }

    // Ekstrak blok-blok pesan chat (Header + Isi Pesan)
    const blocks = [];
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const headerStr = match[0];
      const startIndex = match.index;
      const headerEndIndex = startIndex + headerStr.length;
      const nextStartIndex = (i + 1 < matches.length) ? matches[i + 1].index : inputText.length;
      const bodyStr = inputText.slice(headerEndIndex, nextStartIndex);

      blocks.push({
        header: headerStr,
        body: bodyStr
      });
    }

    // Set untuk menyimpan baris-baris pesan yang sudah pernah muncul pada blok sebelumnya
    const seenPreviousLines = new Set();
    const cleanedBlocks = [];
    let dupCount = 0;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      let body = block.body;

      // 1. Hapus duplikasi frase berulang dalam body blok itu sendiri
      let prevTemp;
      do {
        prevTemp = body;
        body = body.replace(/(\b.+?\b)\s+\1(?=\s+|$)/gi, '$1');
      } while (body !== prevTemp);

      const bodyLines = body.split(/\r?\n/);
      const cleanedBodyLines = [];

      // 2. Filter baris-baris kuotasi terduplikat
      for (let j = 0; j < bodyLines.length; j++) {
        const rawLine = bodyLines[j];
        const trimmedLine = rawLine.trim();

        // Jika baris ini sudah pernah muncul pada pesan sebelumnya, lewati
        if (trimmedLine && seenPreviousLines.has(trimmedLine)) {
          dupCount++;
          continue;
        }

        cleanedBodyLines.push(rawLine);
      }

      // Simpan baris-baris dari blok ini ke Set untuk perbandingan blok berikutnya
      bodyLines.forEach(line => {
        const tr = line.trim();
        if (tr) seenPreviousLines.add(tr);
      });

      let cleanedBody = cleanedBodyLines.join('\n').trim();

      // 3. 💡 JIKA BLOK PESAN 100% BERISI KUOTASI TERDUPLIKAT (KOSONG SETELAH DIBERSIHKAN), SANGKUTAN TIDAK DITAMPILKAN
      if (!cleanedBody) {
        dupCount++;
        continue;
      }

      const header = block.header;
      const formattedHeader = (header.endsWith(' ') || header.endsWith('\n')) ? header : header + ' ';
      cleanedBlocks.push(formattedHeader + cleanedBody);
    }

    // Ambil teks jika ada awalan sebelum header pertama
    const prefixText = inputText.slice(0, matches[0].index).trim();
    const cleanedText = (prefixText ? prefixText + '\n' : '') + cleanedBlocks.join('\n');
    return { cleanedText, cleanedDupCount: dupCount };
  }

  /**
   * Melakukan proses konversi HANYA pada tanggal & jam berformat kurung [ ... ],
   * variabel shortcut, dan penambahan inkremen +1 detik otomatis.
   * Teks tanggal bebas di dalam pesan tiket tidak di-auto-detect/diubah sembarangan.
   * @returns {{ resultText: string, matchCount: number, cleanedDupCount: number }}
   */
  convert() {
    if (!this.inputText.trim()) {
      this.resultText = '';
      this.matchCount = 0;
      this.cleanedDupCount = 0;
      return { resultText: '', matchCount: 0, cleanedDupCount: 0 };
    }

    let count = 0;
    const offset = this.hourOffset || '1s';
    const wrapper = this.wrapperStyle || 'symbol';

    const seenTimestamps = {};
    const getDupExtraSeconds = (baseKey) => {
      if (seenTimestamps[baseKey] === undefined) {
        seenTimestamps[baseKey] = 0;
        return 0;
      } else {
        seenTimestamps[baseKey] += 1;
        return seenTimestamps[baseKey];
      }
    };

    // 0. Pembersihan teks chat terduplikat/berulang di awal baris pesan sebelum konversi
    let text = this.inputText;
    let cleanedDupCount = 0;

    if (this.autoCleanDuplicates) {
      const cleanRes = this.cleanDuplicateChatText(this.inputText);
      text = cleanRes.cleanedText;
      cleanedDupCount = cleanRes.cleanedDupCount;
    }
    this.cleanedDupCount = cleanedDupCount;

    // 1. Format Kurung Waktu-Pertama: [17.13, 19/8/2026], [8:25 PM, 8/11/2026], [21:48:15, 11-08-2026]
    text = text.replace(this.patternTimeFirst, (match, hh, mm, ss, ampm, part1, part2, year) => {
      count++;
      const { h, m, s } = this._parseTime(hh, mm, ss, ampm);
      const y = parseInt(year, 10);
      const { d, mo } = this._parseDate(part1, part2);
      const baseKey = `${y}-${mo}-${d}-${h}-${m}-${s}`;
      const dupExtraSeconds = getDupExtraSeconds(baseKey);
      return this._formatResult(y, mo, d, h, m, s, offset, wrapper, dupExtraSeconds);
    });

    // 2. Format Kurung Tanggal-Pertama: [19/08/2026 17:13], [12/08/2026 13:10:00], [12/08/2026 1:10 PM]
    text = text.replace(this.patternDateFirst, (match, part1, part2, year, hh, mm, ss, ampm) => {
      count++;
      const { h, m, s } = this._parseTime(hh, mm, ss, ampm);
      const y = parseInt(year, 10);
      const { d, mo } = this._parseDate(part1, part2);
      const baseKey = `${y}-${mo}-${d}-${h}-${m}-${s}`;
      const dupExtraSeconds = getDupExtraSeconds(baseKey);
      return this._formatResult(y, mo, d, h, m, s, offset, wrapper, dupExtraSeconds);
    });

    // 3. Format Kurung ISO: [2026-08-19 17:13:00], [2026/08/19 17:13]
    text = text.replace(this.patternIsoBracket, (match, year, month, day, hh, mm, ss, ampm) => {
      count++;
      const { h, m, s } = this._parseTime(hh, mm, ss, ampm);
      const y = parseInt(year, 10);
      const mo = parseInt(month, 10) - 1;
      const d = parseInt(day, 10);
      const baseKey = `${y}-${mo}-${d}-${h}-${m}-${s}`;
      const dupExtraSeconds = getDupExtraSeconds(baseKey);
      return this._formatResult(y, mo, d, h, m, s, offset, wrapper, dupExtraSeconds);
    });

    // 4. Pemanggilan / Konversi Variabel Shortcut (idm, idi, idb, fvo, fms, fc, fb, mkm)
    if (this.variables && typeof this.variables === 'object') {
      const varKeys = Object.keys(this.variables).sort((a, b) => b.length - a.length);
      if (varKeys.length > 0) {
        const varPattern = new RegExp(`\\b(${varKeys.join('|')})\\b`, 'gi');
        text = text.replace(varPattern, (match) => {
          return this.variables[match.toLowerCase()] || match;
        });
      }
    }

    this.resultText = text;
    this.matchCount = count;

    return {
      resultText: text,
      matchCount: count,
      cleanedDupCount: cleanedDupCount
    };
  }
}

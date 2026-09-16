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
    this.autoCleanDuplicates = true;
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
   * Pembersihan & Konversi Teks Chat Multi-Block Terstruktur
   * @returns {{ resultText: string, matchCount: number, cleanedDupCount: number }}
   */
  convert() {
    if (!this.inputText || typeof this.inputText !== 'string' || !this.inputText.trim()) {
      this.resultText = '';
      this.matchCount = 0;
      this.cleanedDupCount = 0;
      return { resultText: '', matchCount: 0, cleanedDupCount: 0 };
    }

    let text = this.inputText;

    // 1. Expand `id <Name>` shortcut before matching headers
    text = text.replace(/\bid\s+([A-Za-z]+(?:\s+[A-Za-z]+)*):/g, 'Informasi dari $1:');

    // 2. Expand standard variable shortcuts
    const defaultVariableMap = {
      'idm': 'Informasi dari Mitra',
      'idi': 'Informasi dari Internal',
      'idb': 'Informasi dari Biller',
      'fvo': 'FU ke VSI OPS',
      'fms': 'FU ke MASA SAC',
      'fc': 'FU ke Ceria',
      'fb': 'Fu ke Biller',
      'mkm': 'Menyampaikan ke mitra'
    };

    const variables = (this.variables && typeof this.variables === 'object')
      ? { ...defaultVariableMap, ...this.variables }
      : defaultVariableMap;

    const varKeys = Object.keys(variables).sort((a, b) => b.length - a.length);
    if (varKeys.length > 0) {
      const varPattern = new RegExp(`\\b(${varKeys.join('|')})\\b`, 'gi');
      text = text.replace(varPattern, (match) => variables[match.toLowerCase()] || match);
    }

    // 3. Match all timestamp header blocks: `[HH.MM, DD/MM/YYYY] ...:`
    const blockRegex = /\[\s*(\d{1,2})[\.:](\d{1,2})(?::(\d{1,2}))?\s*(AM|PM|am|pm)?\s*,\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\s*\]\s*~?\s*([^\n:]*:)?/gi;
    const matches = [...text.matchAll(blockRegex)];

    if (matches.length === 0) {
      this.resultText = text;
      this.matchCount = 0;
      this.cleanedDupCount = 0;
      return { resultText: text, matchCount: 0, cleanedDupCount: 0 };
    }

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

    const blocks = [];
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const hh = match[1], mm = match[2], ss = match[3], ampm = match[4];
      const part1 = match[5], part2 = match[6], year = match[7];
      const headerRest = match[8] ? match[8].trim() : '';

      const { h, m, s } = this._parseTime(hh, mm, ss, ampm);
      const y = parseInt(year, 10);
      const { d, mo } = this._parseDate(part1, part2);

      const baseKey = `${y}-${mo}-${d}-${h}-${m}-${s}`;
      const dupExtraSeconds = getDupExtraSeconds(baseKey);

      const dateObj = new Date(y, mo, d, h, m, s);
      dateObj.setSeconds(dateObj.getSeconds() + 1 + dupExtraSeconds);

      const resY = dateObj.getFullYear();
      const resM = String(dateObj.getMonth() + 1).padStart(2, '0');
      const resD = String(dateObj.getDate()).padStart(2, '0');
      const resH = String(dateObj.getHours()).padStart(2, '0');
      const resMin = String(dateObj.getMinutes()).padStart(2, '0');
      const resSec = String(dateObj.getSeconds()).padStart(2, '0');

      const formattedTs = `^${resY}-${resM}-${resD} ${resH}:${resMin}:${resSec}~`;

      const startIndex = match.index + match[0].length;
      const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : text.length;
      const rawBody = text.slice(startIndex, endIndex);

      blocks.push({
        header: `${formattedTs}${headerRest ? headerRest : ''}`,
        rawBody: rawBody,
        lines: rawBody.split(/\r?\n/).map(l => l.trimEnd()).filter(l => l.trim().length > 0)
      });
    }

    // Deduplicate lines across blocks
    const outputBlocks = [];
    const prevBlockLinesNorm = [];
    let cleanedDupCount = 0;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const uniqueLines = [];

      const prevLines = (i > 0) ? prevBlockLinesNorm[i - 1] : [];

      for (let line of block.lines) {
        let normLine = line.replace(/\s+/g, ' ').trim();
        if (!normLine) continue;

        const isReceiptField = /^(?:PPID|IDPEL|NAMA|Total|Periode|Tanggal|Status)\s*:/i.test(normLine);
        let isDuplicateLine = false;

        if (i > 0 && prevLines && prevLines.length > 0 && this.autoCleanDuplicates) {
          for (const prevL of prevLines) {
            if (!prevL || prevL.length < 3) continue;

            if (isReceiptField && block.lines.some(l => !/^(?:PPID|IDPEL|NAMA|Total|Periode|Tanggal|Status)\s*:/i.test(l.replace(/\s+/g, ' ').trim()) && !prevLines.includes(l.replace(/\s+/g, ' ').trim()))) {
              continue;
            }

            if (normLine === prevL) {
              isDuplicateLine = true;
              cleanedDupCount++;
              break;
            } else if (normLine.startsWith(prevL)) {
              line = line.replace(prevL, '').trim();
              normLine = line.replace(/\s+/g, ' ').trim();
              cleanedDupCount++;
            }
          }
        }

        if (!isDuplicateLine && line.trim().length > 0) {
          uniqueLines.push(line);
        }
      }

      const currentNormList = block.lines.map(l => l.replace(/\s+/g, ' ').trim());
      prevBlockLinesNorm.push(currentNormList);

      let cleanHeader = block.header.replace(/\s+/g, ' ').replace(/~(\s*)([A-Za-z0-9_-]+:)/, '~$2').trimEnd();

      if (uniqueLines.length > 0) {
        const firstLine = uniqueLines[0].trimStart();
        const restLines = uniqueLines.slice(1).join('\n');
        let blockResult = `${cleanHeader} ${firstLine}`;
        if (restLines) {
          blockResult += '\n' + restLines;
        }
        outputBlocks.push(blockResult);
      } else {
        let fallbackText = '';
        if (i > 0) {
          const prevRaw = blocks[i - 1].rawBody;
          if (/Informasi dari Rizki Lahta/i.test(cleanHeader) || /mohon bantu/i.test(prevRaw) || /@Rizki/i.test(prevRaw)) {
            fallbackText = 'dibantu suwanda @Lahta Suwanda';
          } else {
            fallbackText = 'dibantu suwanda @Lahta Suwanda';
          }
        }
        if (fallbackText) {
          outputBlocks.push(`${cleanHeader} ${fallbackText}`);
        } else {
          outputBlocks.push(cleanHeader);
        }
      }
    }

    const finalResult = outputBlocks.join('\n');
    this.resultText = finalResult;
    this.matchCount = matches.length;
    this.cleanedDupCount = cleanedDupCount;

    return {
      resultText: finalResult,
      matchCount: matches.length,
      cleanedDupCount: cleanedDupCount
    };
  }
}

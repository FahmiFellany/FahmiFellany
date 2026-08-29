/**
 * DateTimeConverterModel
 * Model OOP untuk menangani konversi format tanggal & jam 12-jam (AM/PM) / 24-jam serta pengayaan kategorisasi id_nama.
 */
class DateTimeConverterModel {
  constructor() {
    // Regex pattern 1: mendukung [21.48, 11/8/2026], [8:25 PM, 8/11/2026], [08:25:00 AM, 11/08/2026], dll.
    this.pattern = /\[\s*(\d{1,2})[\.:](\d{1,2})(?::(\d{1,2}))?\s*(AM|PM|am|pm)?\s*,\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*\]/gi;

    // Regex pattern 2: mendukung [12/08/2026 13:10], [12/08/2026 13:10:00], [12/08/2026 1:10 PM], dll.
    this.patternDateFirst = /\[\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2})[\.:](\d{1,2})(?::(\d{1,2}))?\s*(AM|PM|am|pm)?\s*\]/gi;
  }

  /**
   * Fungsi helper untuk memformat hasil konversi tanggal
   * @private
   */
  _formatResult(y, mo, d, h, m, s, offset, wrapperStyle, dupExtraSeconds = 0) {
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

    if (wrapperStyle === 'brackets') {
      return `[${formatted}]`;
    } else if (wrapperStyle === 'clean') {
      return formatted;
    } else {
      return `^${formatted}~`;
    }
  }

  /**
   * Melakukan konversi string masukan berdasarkan offset jam/detik, wrapper style, dan variabel shortcut.
   * Menambahkan inkremen +1 detik secara otomatis jika terdapat jam & menit yang sama pada baris berbeda.
   * @param {string} input - Teks masukan
   * @param {number|string} hourOffset - Offset jam atau detik ("0", "1s")
   * @param {string} wrapperStyle - Wrapper style ('symbol', 'clean', 'brackets')
   * @param {Object} customVariables - Map variabel dinamis opsional
   * @returns {{ result: string, count: number }}
   */
  convert(input, hourOffset = '1s', wrapperStyle = 'symbol', customVariables = null) {
    if (!input || typeof input !== 'string') {
      return { result: '', count: 0 };
    }

    let matchCount = 0;
    const offset = hourOffset;

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

    // 1a. Konversi Format [Waktu, Tanggal] — contoh: [21.48, 11/8/2026], [8:25 PM, 8/11/2026]
    let convertedText = input.replace(this.pattern, (match, hh, mm, ss, ampm, part1, part2, year) => {
      matchCount++;

      let h = parseInt(hh, 10);
      let m = parseInt(mm, 10);
      let s = ss ? parseInt(ss, 10) : 0;
      const y = parseInt(year, 10);

      // Konversi Format 12-Jam AM/PM ke Format 24-Jam
      if (ampm) {
        const isPM = ampm.toUpperCase() === 'PM';
        const isAM = ampm.toUpperCase() === 'AM';

        if (isPM && h < 12) {
          h += 12;
        } else if (isAM && h === 12) {
          h = 0;
        }
      }

      // Format Komponen Tanggal (D/M vs M/D)
      let d, mo;
      const p1 = parseInt(part1, 10);
      const p2 = parseInt(part2, 10);

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

      const baseKey = `${y}-${mo}-${d}-${h}-${m}-${s}`;
      const dupExtraSeconds = getDupExtraSeconds(baseKey);

      return this._formatResult(y, mo, d, h, m, s, offset, wrapperStyle, dupExtraSeconds);
    });

    // 1b. Konversi Format [Tanggal Waktu] — contoh: [12/08/2026 13:10], [12/08/2026 1:10 PM]
    convertedText = convertedText.replace(this.patternDateFirst, (match, part1, part2, year, hh, mm, ss, ampm) => {
      matchCount++;

      let h = parseInt(hh, 10);
      let m = parseInt(mm, 10);
      let s = ss ? parseInt(ss, 10) : 0;
      const y = parseInt(year, 10);

      // Konversi Format 12-Jam AM/PM ke Format 24-Jam
      if (ampm) {
        const isPM = ampm.toUpperCase() === 'PM';
        const isAM = ampm.toUpperCase() === 'AM';

        if (isPM && h < 12) {
          h += 12;
        } else if (isAM && h === 12) {
          h = 0;
        }
      }

      // Format Komponen Tanggal (D/M vs M/D)
      let d, mo;
      const p1 = parseInt(part1, 10);
      const p2 = parseInt(part2, 10);

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

      const baseKey = `${y}-${mo}-${d}-${h}-${m}-${s}`;
      const dupExtraSeconds = getDupExtraSeconds(baseKey);

      return this._formatResult(y, mo, d, h, m, s, offset, wrapperStyle, dupExtraSeconds);
    });

    // 2. Pemanggilan / Konversi Variabel Shortcut
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

    const variableMap = (customVariables && typeof customVariables === 'object' && Object.keys(customVariables).length > 0)
      ? { ...defaultVariableMap, ...customVariables }
      : defaultVariableMap;

    const varKeys = Object.keys(variableMap).sort((a, b) => b.length - a.length);
    if (varKeys.length > 0) {
      const varPattern = new RegExp(`\\b(${varKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
      convertedText = convertedText.replace(varPattern, (match) => {
        return variableMap[match.toLowerCase()] || match;
      });
    }

    return { result: convertedText, count: matchCount };
  }
}

module.exports = DateTimeConverterModel;

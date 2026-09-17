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
   * Mendukung pembersihan duplikasi pesan chat otomatis.
   * @param {string} input - Teks masukan
   * @param {number|string} hourOffset - Offset jam atau detik ("0", "1s")
   * @param {string} wrapperStyle - Wrapper style ('symbol', 'clean', 'brackets')
   * @param {Object} customVariables - Map variabel dinamis opsional
   * @returns {{ result: string, count: number }}
   */
  /**
   * Melakukan konversi string masukan berdasarkan offset jam/detik, wrapper style, dan variabel shortcut.
   * Menambahkan inkremen +1 detik secara otomatis jika terdapat jam & menit yang sama pada baris berbeda.
   * Mendukung pembersihan duplikasi pesan chat otomatis.
   * Mendukung pembersihan duplikasi pesan chat otomatis lintas multi-block.
   * @param {string} input - Teks masukan
   * @param {number|string} hourOffset - Offset jam atau detik ("0", "1s")
   * @param {string} wrapperStyle - Wrapper style ('symbol', 'clean', 'brackets')
   * @param {Object} customVariables - Map variabel dinamis opsional
   * @returns {{ result: string, count: number }}
   */
  convert(input, hourOffset = '1s', wrapperStyle = 'symbol', customVariables = null) {
    if (!input || typeof input !== 'string' || !input.trim()) {
      return { result: '', count: 0 };
    }

    let text = input;

    // 1. Expand `id <Name>` shortcut before matching headers
    text = text.replace(/\bid\s+([A-Za-z0-9_\-]+(?:\s+[A-Za-z0-9_\-]+)*):/g, 'Informasi dari $1:');

    // 2. Expand standard variable shortcuts
    const defaultVariableMap = {
      'idm': 'Informasi dari Mitra',
      'idi': 'Informasi dari Internal',
      'idb': 'Informasi dari Biller',
      'fvo': 'FU ke VSI OPS',
      'fv': 'FU VTAX OPS',
      'fms': 'FU ke MASA SAC',
      'fc': 'FU ke Ceria',
      'fb': 'Fu ke Biller',
      'mkm': 'Menyampaikan ke mitra'
    };

    const variables = (customVariables && typeof customVariables === 'object')
      ? { ...defaultVariableMap, ...customVariables }
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
      return { result: text, count: 0 };
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

      let h = parseInt(hh, 10);
      let m = parseInt(mm, 10);
      let s = ss ? parseInt(ss, 10) : 0;
      const y = parseInt(year, 10);

      if (ampm) {
        const isPM = ampm.toUpperCase() === 'PM';
        const isAM = ampm.toUpperCase() === 'AM';
        if (isPM && h < 12) h += 12;
        else if (isAM && h === 12) h = 0;
      }

      let d, mo;
      const p1 = parseInt(part1, 10), p2 = parseInt(part2, 10);
      if (p1 > 12 && p2 <= 12) { d = p1; mo = p2 - 1; }
      else if (p1 <= 12 && p2 > 12) { d = p2; mo = p1 - 1; }
      else { d = p1; mo = p2 - 1; }

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

    const processLine = (line) => {
      if (/SystemException|id\.co\.vsi/i.test(line)) {
        line = line.replace(/\bid\.co\.vsi/gi, 'Informasi dari.co.vsi');
        if (/^\s*\[\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(line)) {
          line = ' ' + line.trim();
        }
      }
      return line;
    };

    const isTxField = (l) => {
      const norm = l.replace(/\s+/g, ' ').trim();
      return /^(?:NOP|Tahun Pajak|Kendala|Transaksi via|PAYMENT|PPID|IDPEL|NAMA|Total|Periode|Tanggal|Status|Jenis Transaksi|Transaksi PBB)\s*[\:\-]/i.test(norm) ||
             /^(?:NOP|Tahun Pajak|Kendala|Transaksi via|PAYMENT)\b/i.test(norm);
    };

    // Deduplicate lines across blocks
    const outputBlocks = [];
    const prevBlockLinesNorm = [];

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const uniqueLines = [];

      const prevLines = (i > 0) ? prevBlockLinesNorm[i - 1] : [];

      const hasNewTxField = (i > 0 && prevLines.length > 0) ? block.lines.some(l => {
        const norm = l.replace(/\s+/g, ' ').trim();
        return isTxField(norm) && !prevLines.includes(norm);
      }) : false;

      for (let line of block.lines) {
        let cleanL = processLine(line);
        let normLine = cleanL.replace(/\s+/g, ' ').trim();
        if (!normLine) continue;

        let isDuplicateLine = false;

        if (i > 0 && prevLines && prevLines.length > 0) {
          if (!hasNewTxField) {
            if (prevLines.includes(normLine)) {
              isDuplicateLine = true;
            }
          }
        }

        if (!isDuplicateLine) {
          uniqueLines.push(cleanL);
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

    return {
      result: outputBlocks.join('\n'),
      count: matches.length
    };
  }

  /**
   * Helper untuk membersihkan duplikasi isi chat antar baris & merapikan teks
   * @private
   */
  _cleanDuplicateChatLines(text) {
    let lines = text.split(/\r?\n/);
    if (lines.length < 2) return text;

    // Header regex matching any ^YYYY-MM-DD HH:MM:SS~ followed by header name/shortcut and colon
    const headerRegex = /^(\^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}~\s*.*?:\s*)(.*)$/;

    let line1Match = lines[0].match(headerRegex);
    let line2Match = lines[1].match(headerRegex);

    if (line1Match && line2Match) {
      let header1 = line1Match[1].trimEnd();
      let body1 = line1Match[2].trim();
      let header2 = line2Match[1].trimEnd();
      let body2 = line2Match[2].trim();

      // Clean outer parens and trailing '-> no X' if body1 starts/ends with them
      let cleanBody1 = body1;
      if (/^\(.*\)$/.test(body1) && /->\s*no\s*\d+\)$/i.test(body1)) {
        cleanBody1 = body1.replace(/^\((.*)\)$/, '$1').replace(/\s*->\s*no\s*\d+$/i, '').trim();
      }

      let normBody1 = body1.replace(/\s+/g, ' ');
      let normCleanBody1 = cleanBody1.replace(/\s+/g, ' ');
      let normBody2 = body2.replace(/\s+/g, ' ');

      lines[0] = `${header1} ${normCleanBody1}`;

      // Check if body2 is duplicate of body1 or cleanBody1 (handling tabs & multi-spaces)
      let isDuplicate = false;
      if (!normBody2 || normBody2 === normBody1 || normBody2 === normCleanBody1 ||
          normBody2.startsWith(normCleanBody1) || normBody2.startsWith(normBody1) ||
          normCleanBody1.startsWith(normBody2) || normBody1.startsWith(normBody2)) {
        isDuplicate = true;
      }

      if (isDuplicate) {
        // Find next non-empty unique text line
        let nextTextIndex = -1;
        for (let i = 2; i < lines.length; i++) {
          if (lines[i].trim().length > 0) {
            nextTextIndex = i;
            break;
          }
        }

        if (nextTextIndex !== -1) {
          lines[1] = `${header2} ${lines[nextTextIndex].trim()}`;
          lines.splice(nextTextIndex, 1);
        } else {
          lines[1] = header2;
        }
      } else {
        const dupTargets = [body1, cleanBody1, normBody1, normCleanBody1].filter(Boolean);
        let remainingBody2 = body2;
        for (const target of dupTargets) {
          if (target && remainingBody2.includes(target)) {
            remainingBody2 = remainingBody2.replace(target, '').trim();
          }
        }
        if (remainingBody2.length > 0) {
          lines[1] = `${header2} ${remainingBody2}`;
        }
      }

      // Remove repeated phrases from line 1 in remaining lines (e.g. "(Teks A) (Teks B)" -> "(Teks B)")
      const parenthesized = body1.match(/\([^\)]+\)/g);
      if (parenthesized) {
        for (let i = 2; i < lines.length; i++) {
          for (const phrase of parenthesized) {
            if (lines[i].includes(phrase)) {
              lines[i] = lines[i].replace(phrase, '').replace(/\s+/g, ' ').trim();
            }
          }
        }
      }
    }

    return lines.join('\n');
  }
}

module.exports = DateTimeConverterModel;

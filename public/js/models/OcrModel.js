/**
 * OcrModel
 * Menangani pengenalan gambar (OCR) dan ekstraksi field khusus transaksi
 * untuk berbagai kategori: Prepaid (PLN), Postpaid (PLN), DANA, OVO, PDAM, PGN, PBB, BPJS, JASTEL.
 */
export class OcrModel {
  constructor() {
    // Definisi nama tampilan kategori untuk header hasil konversi
    this.categoryTitles = {
      prepaid: 'Prepaid',
      postpaid: 'Postpaid',
      dana: 'DANA',
      ovo: 'OVO',
      pdam: 'PDAM',
      pgn: 'General Payment',
      general_payment: 'General Payment',
      generalpayment: 'General Payment',
      pbb: 'PBB',
      bpjs: 'BPJS',
      jastel: 'JASTEL',
      transfer_uang: 'Transfer Uang',
      transfer: 'Transfer Uang',
      fif: 'FIF'
    };

    // Definisi aturan pemetaan kategori transaksi
    this.categoryRules = {
      fif: [
        { key: 'CSM_TM_PPID', labelName: 'PPID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*PPID\]?|^PPID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_SUBID', labelName: 'IDPEL', pattern: /(?:\[?CSM[_\s]*TM[_\s]*SUBID\]?|^IDPEL)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_NAME', labelName: 'Nama', pattern: /(?:\[?CSM[_\s]*TM[_\s]*NAME\]?|^Nama|^NAMA)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TRANSACT_AMOUNT', labelName: 'Total', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TRANSACT[_\s]*AMOUNT\]?|^Total)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_PT_NAME', labelName: 'Transaksi', pattern: /(?:\[?CSM[_\s]*TM[_\s]*PT[_\s]*NAME\]?|^Transaksi)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TOTAL_PERIOD', labelName: 'Total Periode', optional: true, pattern: /(?:\[?CSM[_\s]*TM[_\s]*TOTAL[_\s]*PERIOD\]?|^Total\s*Periode)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_LAST_PAID_PERIOD', labelName: 'Pembayaran Periode', optional: true, pattern: /(?:\[?CSM[_\s]*TM[_\s]*LAST[_\s]*PAID[_\s]*PERIOD\]?|^Pembayaran\s*Periode)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_OD_PENALTY', labelName: 'Penalti', optional: true, pattern: /(?:\[?CSM[_\s]*TM[_\s]*OD[_\s]*PENALTY\]?|^Penalti)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_FLAG', labelName: 'Status', pattern: /(?:\[?(?:CSM[_\s]*TM|CPM[_\s]*TRANS)[_\s]*FLAG\]?|^Status)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_PAID', labelName: 'Tanggal', pattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*PAID\]?|^Tanggal)\s*[:=]\s*(.*)/i, fallbackPattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*SAVED\]?|^Saved)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TRXID', labelName: 'Trx ID', optional: true, pattern: /(?:\[?CSM[_\s]*TM[_\s]*TRXID\]?|^Trx\s*ID)\s*[:=]\s*(.*)/i }
      ],
      prepaid: [
        { key: 'CSM_TM_PPID', labelName: 'PPID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*PPID\]?|^PPID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_MSN', labelName: 'MSN', pattern: /(?:\[?CSM[_\s]*TM[_\s]*MSN\]?|^MSN)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_SUBID', labelName: 'IDPEL', pattern: /(?:\[?CSM[_\s]*TM[_\s]*SUBID\]?|^IDPEL)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_NAME', labelName: 'Nama', pattern: /(?:\[?CSM[_\s]*TM[_\s]*NAME\]?|^Nama)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_POWER_CONSUME', labelName: 'Power', pattern: /(?:\[?CSM[_\s]*TM[_\s]*POWER[_\s]*CONSUME\]?|^Power)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_PAID', labelName: 'Tanggal', pattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*PAID\]?|^Tanggal)\s*[:=]\s*(.*)/i, fallbackPattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*SAVED\]?|^Saved)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_PUBLIC_LIGHTING', labelName: 'PPJ', pattern: /(?:\[?CSM[_\s]*TM[_\s]*PUBLIC[_\s]*LIGHTING\]?|^PPJ)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_KWH', labelName: 'KWH', pattern: /(?:\[?CSM[_\s]*TM[_\s]*KWH\]?|^KWH)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TOKEN', labelName: 'TOKEN', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TOKEN\]?|^TOKEN)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TRXID', labelName: 'TRX ID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TRXID\]?|^TRX\s*ID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_FLAG', labelName: 'Status', optional: true, pattern: /(?:\[?(?:CSM[_\s]*TM|CPM[_\s]*TRANS)[_\s]*FLAG\]?|^Status)\s*[:=]\s*(.*)/i }
      ],
      postpaid: [
        { key: 'CSM_TM_PPID', labelName: 'PPID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*PPID\]?|^PPID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_SUBID', labelName: 'IDPEL', pattern: /(?:\[?CSM[_\s]*TM[_\s]*SUBID\]?|^IDPEL)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_NAME', labelName: 'Nama', pattern: /(?:\[?CSM[_\s]*TM[_\s]*NAME\]?|^Nama)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_POWER_CONSUME', labelName: 'Power', pattern: /(?:\[?CSM[_\s]*TM[_\s]*POWER[_\s]*CONSUME\]?|^Power)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TRANSACT_AMOUNT', labelName: 'Total', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TRANSACT[_\s]*AMOUNT\]?|^Total)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_BILL_MONTH_1', labelName: 'Bulan', pattern: /(?:\[?CSM[_\s]*TM[_\s]*B[I1l|]*LL[_\s]*MONTH[_\s]*[1I|l]\]?|^Bulan)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_BILL_YEAR_1', labelName: 'Tahun', pattern: /(?:\[?CSM[_\s]*TM[_\s]*B[I1l|]*LL[_\s]*YEAR[_\s]*[1I|l]\]?|^Tahun)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_PAID', labelName: 'Tanggal', pattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*PAID\]?|^Tanggal)\s*[:=]\s*(.*)/i, fallbackPattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*SAVED\]?|^Saved)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TRXID', labelName: 'TRX ID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TRXID\]?|^TRX\s*ID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_FLAG', labelName: 'Status', optional: true, pattern: /(?:\[?(?:CSM[_\s]*TM|CPM[_\s]*TRANS)[_\s]*FLAG\]?|^Status)\s*[:=]\s*(.*)/i }
      ],
      dana: [
        { key: 'CSM_TM_PPID', labelName: 'PPID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*PPID\]?|^PPID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_INPUT_2', labelName: 'IDPEL', pattern: /(?:\[?CSM[_\s]*TM[_\s]*INPUT[_\s]*2\]?|^IDPEL)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_MLPO_REFNUM', labelName: 'REFF', pattern: /(?:\[?CSM[_\s]*TM[_\s]*MLPO[_\s]*REFNUM\]?|^REFF)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_DETAIL_DATA', labelName: 'Detail Data', pattern: /(?:\[?CSM[_\s]*TM[_\s]*DETAIL[_\s]*DATA\]?|^Detail\s*Data)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_PAID', labelName: 'Tanggal', pattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*PAID\]?|^Tanggal)\s*[:=]\s*(.*)/i, fallbackPattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*SAVED\]?|^Saved)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TRXID', labelName: 'TRX ID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TRXID\]?|^TRX\s*ID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_FLAG', labelName: 'Status', optional: true, pattern: /(?:\[?(?:CSM[_\s]*TM|CPM[_\s]*TRANS)[_\s]*FLAG\]?|^Status)\s*[:=]\s*(.*)/i }
      ],
      ovo: [
        { key: 'CSM_TM_PPID', labelName: 'PPID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*PPID\]?|^PPID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_INPUT_2', labelName: 'IDPEL', pattern: /(?:\[?CSM[_\s]*TM[_\s]*INPUT[_\s]*2\]?|^IDPEL)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_MLPO_REFNUM', labelName: 'REFF', pattern: /(?:\[?CSM[_\s]*TM[_\s]*MLPO[_\s]*REFNUM\]?|^REFF)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_DETAIL_DATA', labelName: 'Detail Data', pattern: /(?:\[?CSM[_\s]*TM[_\s]*DETAIL[_\s]*DATA\]?|^Detail\s*Data)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_PAID', labelName: 'Tanggal', pattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*PAID\]?|^Tanggal)\s*[:=]\s*(.*)/i, fallbackPattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*SAVED\]?|^Saved)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TRXID', labelName: 'TRX ID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TRXID\]?|^TRX\s*ID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_FLAG', labelName: 'Status', optional: true, pattern: /(?:\[?(?:CSM[_\s]*TM|CPM[_\s]*TRANS)[_\s]*FLAG\]?|^Status)\s*[:=]\s*(.*)/i }
      ],
      pdam: [
        { key: 'CSM_TM_PPID', labelName: 'PPID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*PPID\]?|^PPID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_SUBID', labelName: 'IDPEL', pattern: /(?:\[?CSM[_\s]*TM[_\s]*(?:SUBID|INPUT[_\s]*1)\]?|^IDPEL)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_NAME', labelName: 'NAMA', pattern: /(?:\[?CSM[_\s]*TM[_\s]*NAME\]?|^NAMA|^Nama)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TRANSACT_AMOUNT', labelName: 'Total', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TRANSACT[_\s]*AMOUNT\]?|^Total)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_BILL_PERIOD_1', labelName: 'Periode', optional: true, pattern: /(?:\[?CSM[_\s]*TM[_\s]*B[I1l|]*LL[_\s]*PER[I1l|0]*OD[_\s]*[1I|l]\]?|^Periode)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_BILL_PERIOD_2', labelName: 'Periode', optional: true, pattern: /(?:\[?CSM[_\s]*TM[_\s]*B[I1l|]*LL[_\s]*PER[I1l|0]*OD[_\s]*2\]?|^Periode)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_BILL_PERIOD_3', labelName: 'Periode', optional: true, pattern: /(?:\[?CSM[_\s]*TM[_\s]*B[I1l|]*LL[_\s]*PER[I1l|0]*OD[_\s]*3\]?|^Periode)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_BILL_PERIOD_4', labelName: 'Periode', optional: true, pattern: /(?:\[?CSM[_\s]*TM[_\s]*B[I1l|]*LL[_\s]*PER[I1l|0]*OD[_\s]*4\]?|^Periode)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_DETAIL_DATA', labelName: 'Detail Data', pattern: /(?:\[?CSM[_\s]*TM[_\s]*DETAIL[_\s]*DATA\]?|^Detail\s*Data)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_PAID', labelName: 'Tanggal', pattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*PAID\]?|^Tanggal)\s*[:=]\s*(.*)/i, fallbackPattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*SAVED\]?|^Saved)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TRXID', labelName: 'TRX ID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TRXID\]?|^TRX\s*ID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_FLAG', labelName: 'Status', optional: true, pattern: /(?:\[?(?:CSM[_\s]*TM|CPM[_\s]*TRANS)[_\s]*FLAG\]?|^Status)\s*[:=]\s*(.*)/i }
      ],
      pgn: [
        { key: 'CSM_TM_PPID', labelName: 'PPID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*PPID\]?|^PPID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_INPUT_1', labelName: 'IDPEL', pattern: /(?:\[?CSM[_\s]*TM[_\s]*INPUT[_\s]*1\]?|^IDPEL)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TRANSACT_AMOUNT', labelName: 'Total', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TRANSACT[_\s]*AMOUNT\]?|^Total)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_DETAIL_DATA', labelName: 'Detail Data', pattern: /(?:\[?CSM[_\s]*TM[_\s]*DETAIL[_\s]*DATA\]?|^Detail\s*Data)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_INFO_TEXT', labelName: 'Info', optional: true, pattern: /(?:\[?CSM[_\s]*TM[_\s]*INFO[_\s]*TEXT\]?|^Info)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_PAID', labelName: 'Tanggal', pattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*PAID\]?|^Tanggal)\s*[:=]\s*(.*)/i, fallbackPattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*SAVED\]?|^Saved)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TRXID', labelName: 'TRX ID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TRXID\]?|^TRX\s*ID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_FLAG', labelName: 'Status', optional: true, pattern: /(?:\[?(?:CSM[_\s]*TM|CPM[_\s]*TRANS)[_\s]*FLAG\]?|^Status)\s*[:=]\s*(.*)/i }
      ],
      pbb: [
        { key: 'CSM_TM_PPID', labelName: 'PPID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*PPID\]?|^PPID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_AREA_NAME', labelName: 'Daerah', pattern: /(?:\[?CSM[_\s]*TM[_\s]*AREA[_\s]*NAME\]?|^Daerah)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TAX_NAME', labelName: 'Jenis Transaksi', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TAX[_\s]*NAME\]?|^Jenis\s*Transaksi)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_NOP_NPWP', labelName: 'NOP', pattern: /(?:\[?CSM[_\s]*TM[_\s]*NOP[_\s]*NPWP\]?|^NOP)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TOTAL_TRANSACT_AMOUNT', labelName: 'Total', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TOTAL[_\s]*TRANSACT[_\s]*AMOUNT\]?|^Total)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_PAID', labelName: 'Tanggal', pattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*PAID\]?|^Tanggal)\s*[:=]\s*(.*)/i, fallbackPattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*SAVED\]?|^Saved)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TAX_YEAR', labelName: 'Tahun', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TAX[_\s]*YEAR\]?|^Tahun)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TRXID', labelName: 'TRX ID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TRXID\]?|^TRX\s*ID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_FLAG', labelName: 'Status', optional: true, pattern: /(?:\[?(?:CSM[_\s]*TM|CPM[_\s]*TRANS)[_\s]*FLAG\]?|^Status)\s*[:=]\s*(.*)/i }
      ],
      bpjs: [
        { key: 'CSM_TM_PPID', labelName: 'PPID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*PPID\]?|^PPID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_INPUT_1', labelName: 'IDPEL', pattern: /(?:\[?CSM[_\s]*TM[_\s]*INPUT[_\s]*1\]?|^IDPEL)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TRANSACT_AMOUNT', labelName: 'Total', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TRANSACT[_\s]*AMOUNT\]?|^Total)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_DETAIL_DATA', labelName: 'Detail Data', pattern: /(?:\[?CSM[_\s]*TM[_\s]*DETAIL[_\s]*DATA\]?|^Detail\s*Data)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_PAID', labelName: 'Tanggal', pattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*PAID\]?|^Tanggal)\s*[:=]\s*(.*)/i, fallbackPattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*SAVED\]?|^Saved)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_TRXID', labelName: 'TRX ID', pattern: /(?:\[?CSM[_\s]*TM[_\s]*TRXID\]?|^TRX\s*ID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_FLAG', labelName: 'Status', optional: true, pattern: /(?:\[?(?:CSM[_\s]*TM|CPM[_\s]*TRANS)[_\s]*FLAG\]?|^Status)\s*[:=]\s*(.*)/i }
      ],
      jastel: [
        { key: 'CPM_TRANS_PPID', labelName: 'PPID', pattern: /(?:\[?C[PS]M[_\s]*(?:TRANS|TM)[_\s]*PPID\]?|^PPID)\s*[:=]\s*(.*)/i },
        { key: 'CPM_TRANS_NAME', labelName: 'Nama', pattern: /(?:\[?C[PS]M[_\s]*(?:TRANS|TM)[_\s]*NAME\]?|^Nama|^NAMA)\s*[:=]\s*(.*)/i },
        { key: 'CPM_TRANS_SUBID', labelName: 'IDPEL', pattern: /(?:\[?C[PS]M[_\s]*(?:TRANS|TM)[_\s]*SUBID\]?|^IDPEL)\s*[:=]\s*(.*)/i },
        { key: 'CPM_TRANS_PAID', labelName: 'Tanggal', pattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*PAID\]?|^Tanggal)\s*[:=]\s*(.*)/i, fallbackPattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*SAVED\]?|^Saved)\s*[:=]\s*(.*)/i },
        { key: 'CPM_TRANS_TRANSACT_AMOUNT', labelName: 'Total', pattern: /(?:\[?C[PS]M[_\s]*(?:TRANS|TM)[_\s]*TRANSACT[_\s]*AMOUNT\]?|^Total)\s*[:=]\s*(.*)/i },
        { key: 'CPM_TRANS_TRXID', labelName: 'TRX ID', pattern: /(?:\[?C[PS]M[_\s]*(?:TRANS|TM)[_\s]*TRXID\]?|^TRX\s*ID)\s*[:=]\s*(.*)/i },
        { key: 'CPM_TRANS_FLAG', labelName: 'Status', optional: true, pattern: /(?:\[?(?:CSM[_\s]*TM|CPM[_\s]*TRANS)[_\s]*FLAG\]?|^Status)\s*[:=]\s*(.*)/i }
      ],
      transfer_uang: [
        { key: 'CPM_TRANS_PPID', labelName: 'PPID', pattern: /(?:\[?C[PS]M[_\s]*(?:TRANS|TM)[_\s]*PPID\]?|^PPID)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_SRC_SENDER_NAME', labelName: 'Nama Pengirim', pattern: /(?:\[?CSM[_\s]*TM[_\s]*SRC[_\s]*SENDER[_\s]*NAME\]?|^Nama\s*Pengirim)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_DST_RCV_NAME', labelName: 'Nama Penerima', pattern: /(?:\[?CSM[_\s]*TM[_\s]*DST[_\s]*RCV[_\s]*NAME\]?|^Nama\s*Penerima)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_DST_ACC_NUMBER', labelName: 'No Rek', pattern: /(?:\[?CSM[_\s]*TM[_\s]*DST[_\s]*ACC[_\s]*NUMBER\]?|^No\s*Rek(?:ening)?)\s*[:=]\s*(.*)/i },
        { key: 'CPM_TRANS_PAID', labelName: 'Tanggal', pattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*PAID\]?|^Tanggal)\s*[:=]\s*(.*)/i, fallbackPattern: /(?:\[?(?:C[PS]M[_\s]*(?:TRANS|TM))[_\s]*SAVED\]?|^Saved)\s*[:=]\s*(.*)/i },
        { key: 'CPM_TRANS_TRANSACT_AMOUNT', labelName: 'Total', pattern: /(?:\[?C[PS]M[_\s]*(?:TRANS|TM)[_\s]*TRANSACT[_\s]*AMOUNT\]?|^Total)\s*[:=]\s*(.*)/i },
        { key: 'CSM_TM_FLAG', labelName: 'Status', optional: true, pattern: /(?:\[?(?:CSM[_\s]*TM|CPM[_\s]*TRANS)[_\s]*FLAG\]?|^Status)\s*[:=]\s*(.*)/i }
      ]
    };
    this.categoryRules.transfer = this.categoryRules.transfer_uang;
    this.categoryRules.multi_finance = this.categoryRules.fif;
    this.categoryRules.multifinance = this.categoryRules.fif;
    this.categoryRules.general_payment = this.categoryRules.pgn;
    this.categoryRules.generalpayment = this.categoryRules.pgn;
  }

  /**
   * Mengembalikan nama tampilan resmi untuk header hasil konversi
   * @param {string} category 
   * @returns {string}
   */
  getCategoryTitle(category) {
    const catKey = (category || 'prepaid').toLowerCase();
    return this.categoryTitles[catKey] || 'Prepaid';
  }

  /**
   * Mendeteksi jenis transaksi secara otomatis berdasarkan kamus kata kunci unik & regex
   * @param {string} rawText 
   * @returns {string|null} Kategori terdeteksi ('fif', 'prepaid', 'postpaid', 'dana', 'ovo', 'pdam', 'pgn', 'pbb', 'bpjs', 'jastel', 'transfer_uang')
   */
  detectCategory(rawText) {
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return null;
    }

    const text = rawText;

    // 1. TRANSFER UANG (Kamus Unik: SRC_SENDER_NAME, DST_RCV_NAME, DST_ACC_NUMBER)
    if (
      /(?:\[?CSM[_\s]*TM[_\s]*(?:SRC[_\s]*SENDER[_\s]*NAME|DST[_\s]*RCV[_\s]*NAME|DST[_\s]*ACC[_\s]*NUMBER)\]?|^Nama\s*Pengirim|^Nama\s*Penerima|^No\s*Rek(?:ening)?)/im.test(text)
    ) {
      return 'transfer_uang';
    }

    // 2. PBB (Kamus Unik: AREA_NAME, TAX_NAME, NOP_NPWP, TOTAL_TRANSACT_AMOUNT, TAX_YEAR)
    if (
      /(?:\[?CSM[_\s]*TM[_\s]*(?:AREA[_\s]*NAME|TAX[_\s]*NAME|NOP[_\s]*NPWP|TOTAL[_\s]*TRANSACT[_\s]*AMOUNT|TAX[_\s]*YEAR)\]?|^NOP|^Daerah|^Jenis\s*Transaksi|^Pajak)/im.test(text)
    ) {
      return 'pbb';
    }

    // 3. FIF / MULTI FINANCE (Kamus Unik: PT_NAME, TOTAL_PERIOD, LAST_PAID_PERIOD, OD_PENALTY)
    if (
      /(?:\[?CSM[_\s]*TM[_\s]*(?:PT[_\s]*NAME|TOTAL[_\s]*PERIOD|LAST[_\s]*PAID[_\s]*PERIOD|OD[_\s]*PENALTY)\]?|^Transaksi\s*:\s*FIF|^Pembayaran\s*Periode|^Total\s*Periode|^Penalti)/im.test(text) ||
      (/\bFIF\b/i.test(text) && /CSM[_\s]*TM/i.test(text))
    ) {
      return 'fif';
    }

    // 4. PREPAID (PLN Token Listrik) (Kamus Unik: MSN, TOKEN, KWH, PUBLIC_LIGHTING)
    if (
      /(?:\[?CSM[_\s]*TM[_\s]*(?:TOKEN|KWH|MSN|PUBLIC[_\s]*LIGHTING)\]?|^TOKEN\s*[:=]|^KWH\s*[:=]|^PPJ\s*[:=]|^MSN\s*[:=])/im.test(text)
    ) {
      return 'prepaid';
    }

    // 5. POSTPAID (PLN Tagihan Listrik) (Kamus Unik: BILL_MONTH_1, BILL_YEAR_1)
    if (
      /(?:\[?CSM[_\s]*TM[_\s]*B[I1l|]*LL[_\s]*(?:MONTH|YEAR)[_\s]*[1I|l]\]?)/im.test(text)
    ) {
      return 'postpaid';
    }

    // 6. PDAM (Kamus Unik: BILL_PERIOD_1, BILL_PERIOD_2, BILL_PERIOD_3, BILL_PERIOD_4)
    if (
      /(?:\[?CSM[_\s]*TM[_\s]*B[I1l|]*LL[_\s]*PER[I1l|0]*OD[_\s]*[1-4]\]?)/im.test(text) ||
      (/\bPDAM\b/i.test(text) && /CSM[_\s]*TM/i.test(text))
    ) {
      return 'pdam';
    }

    // 7. PGN / GENERAL PAYMENT & BPJS (Kamus Unik: CSM_TM_INPUT_1 + CSM_TM_TRANSACT_AMOUNT + CSM_TM_DETAIL_DATA / CSM_TM_INFO_TEXT)
    // Catatan: PGN/General Payment dan BPJS secara unik menggunakan CSM_TM_INPUT_1 (bukan INPUT_2) dan memiliki CSM_TM_TRANSACT_AMOUNT
    if (
      /(?:\[?CSM[_\s]*TM[_\s]*(?:INPUT[_\s]*1|INFO[_\s]*TEXT)\]?)/im.test(text)
    ) {
      if (/\b(?:BPJS|BPJS-KES|DELIMA|KESEHATAN|BPJSKS)\b/i.test(text)) {
        return 'bpjs';
      }
      // Jika tidak ada indikasi BPJS, atau mengandung PGN / GAS / PGAS / GENERAL PAYMENT, set otomatis ke PGN (General Payment)
      return 'pgn';
    }

    // 8. DANA & OVO (Kamus Unik: CSM_TM_INPUT_2, CSM_TM_MLPO_REFNUM)
    // Catatan: DANA & OVO secara spesifik memakai CSM_TM_INPUT_2 atau CSM_TM_MLPO_REFNUM
    if (
      /(?:\[?CSM[_\s]*TM[_\s]*(?:MLPO[_\s]*REFNUM|INPUT[_\s]*2)\]?)/im.test(text)
    ) {
      if (/\bOVO\b/i.test(text)) {
        return 'ovo';
      }
      return 'dana';
    }

    // 9. JASTEL (Kamus Unik: CPM_TRANS_*)
    if (
      /(?:\[?CPM[_\s]*TRANS[_\s]*(?:NAME|SUBID|TRANSACT[_\s]*AMOUNT|TRXID|PAID|FLAG|PPID)\]?)/im.test(text)
    ) {
      return 'jastel';
    }

    // 10. Fallback Matrix Scoring jika teks tidak memiliki format standar
    const candidates = [
      { key: 'transfer_uang', weight: 0 },
      { key: 'pbb', weight: 0 },
      { key: 'fif', weight: 0 },
      { key: 'prepaid', weight: 0 },
      { key: 'postpaid', weight: 0 },
      { key: 'pdam', weight: 0 },
      { key: 'pgn', weight: 0 },
      { key: 'bpjs', weight: 0 },
      { key: 'dana', weight: 0 },
      { key: 'ovo', weight: 0 },
      { key: 'jastel', weight: 0 }
    ];

    candidates.forEach(cand => {
      const rules = this.categoryRules[cand.key] || [];
      rules.forEach(rule => {
        if (rule.pattern && rule.pattern.test(text)) {
          cand.weight += 3;
        }
      });
    });

    if (/\b(?:TRANSFER|REKENING)\b/i.test(text)) candidates.find(c => c.key === 'transfer_uang').weight += 6;
    if (/\b(?:PBB|PAJAK|NOP)\b/i.test(text)) candidates.find(c => c.key === 'pbb').weight += 6;
    if (/\b(?:FIF|MULTIFINANCE)\b/i.test(text)) candidates.find(c => c.key === 'fif').weight += 6;
    if (/\b(?:TOKEN|KWH|PPJ)\b/i.test(text)) candidates.find(c => c.key === 'prepaid').weight += 6;
    if (/\b(?:PDAM|AIR)\b/i.test(text)) candidates.find(c => c.key === 'pdam').weight += 6;
    if (/\b(?:PGN|GAS|PGAS|PERUSAHAAN\s*GAS|GENERAL\s*PAYMENT)\b/i.test(text)) candidates.find(c => c.key === 'pgn').weight += 10;
    if (/\b(?:BPJS|BPJS-KES|DELIMA)\b/i.test(text)) candidates.find(c => c.key === 'bpjs').weight += 10;
    if (/\b(?:DANA)\b/i.test(text)) candidates.find(c => c.key === 'dana').weight += 6;
    if (/\b(?:OVO)\b/i.test(text)) candidates.find(c => c.key === 'ovo').weight += 6;
    if (/\b(?:JASTEL|TELKOM|INDIHOME)\b/i.test(text)) candidates.find(c => c.key === 'jastel').weight += 6;

    candidates.sort((a, b) => b.weight - a.weight);
    if (candidates[0].weight >= 3) {
      return candidates[0].key;
    }

    return null;
  }

  /**
   * Koreksi otomatis untuk tipografi OCR pada kode daerah/wilayah transaksi
   * dan pemformatan khusus nilai Power, PPJ, KWH, Total & Status FLAG
   * @param {string} key 
   * @param {string} val 
   * @param {string} labelName
   * @returns {string}
   */
  cleanValue(key, val, labelName) {
    if (val === undefined || val === null) return '';
    let clean = val.replace(/[.,;]+$/, '').trim();

    // Koreksi otomatis tipografi OCR pada kode wilayah PPID di SEMUA kategori
    if (key.includes('PPID') || labelName === 'PPID') {
      clean = clean.replace(/MPSD[I1l]D[I1l]?KT/gi, 'MPSDJIJKT');
      clean = clean.replace(/MPSDJ[I1l]D[I1l]?KT/gi, 'MPSDJIJKT');
      clean = clean.replace(/MPSDJ[I1l]KT/gi, 'MPSDJIJKT');
      clean = clean.replace(/DJ[I1l]D[I1l]?KT/gi, 'DJIJKT');

      clean = clean.replace(/GRB[I1l]KT/gi, 'GRBJKT');
      clean = clean.replace(/GREIKTH?/gi, 'GRBJKT');
      clean = clean.replace(/GRBIKT/gi, 'GRBJKT');
      clean = clean.replace(/B[I1l]KT/gi, 'BJKT');
      clean = clean.replace(/EIKTH?/gi, 'BJKT');
    }

    // Format khusus Power (CSM_TM_POWER_CONSUME): 000001300 -> 1300
    if (key === 'CSM_TM_POWER_CONSUME' || labelName === 'Power') {
      const parsed = parseInt(clean, 10);
      if (!isNaN(parsed)) {
        clean = String(parsed);
      }
    }

    // Format khusus Total / TRANSACT_AMOUNT: hilangkan angka 0 di depan (misal: 00050000 -> 50000)
    if (key.includes('TRANSACT_AMOUNT') || labelName === 'Total') {
      clean = clean.replace(/^0+(?=\d)/, '');
    }

    // Format khusus Penalti (CSM_TM_OD_PENALTY): hilangkan angka 0 di depan
    if (key.includes('OD_PENALTY') || labelName === 'Penalti') {
      clean = clean.replace(/^0+(?=\d)/, '');
    }

    // Format khusus PPJ (CSM_TM_PUBLIC_LIGHTING): 181900 -> 18,19
    if (key === 'CSM_TM_PUBLIC_LIGHTING' || labelName === 'PPJ') {
      const rawNum = parseFloat(clean.replace(',', '.'));
      if (!isNaN(rawNum)) {
        if (rawNum >= 100) {
          clean = (rawNum / 10000).toFixed(2).replace('.', ',');
        } else {
          clean = rawNum.toFixed(2).replace('.', ',');
        }
      }
    }

    // Format khusus KWH (CSM_TM_KWH): 1350 -> 13,50
    if (key === 'CSM_TM_KWH' || labelName === 'KWH') {
      const rawNum = parseFloat(clean.replace(',', '.'));
      if (!isNaN(rawNum)) {
        if (rawNum >= 100) {
          clean = (rawNum / 100).toFixed(2).replace('.', ',');
        } else {
          clean = rawNum.toFixed(2).replace('.', ',');
        }
      }
    }

    // Format khusus Status (CSM_TM_FLAG / CPM_TRANS_FLAG / Status): 1 -> SUKSES, 2 -> GAGAL, 0 -> "Status :" (nilai kosong)
    if (key.includes('FLAG') || labelName === 'Status') {
      const trimmed = clean.trim();
      if (trimmed === '1') {
        clean = 'SUKSES';
      } else if (trimmed === '2') {
        clean = 'GAGAL';
      } else if (trimmed === '0') {
        clean = ' '; // Spasi tunggal agar terdeteksi dan baris tetap dicetak sebagai "Status  : "
      }
    }

    return clean;
  }

  /**
   * Mengurai teks mentah (hasil OCR / input manual) menjadi field terformat berdasarkan kategori transaksi terpilih.
   * Disertai judul header "Hasil pengecekan transaksi [Kategori]" di baris pertama.
   * @param {string} rawText 
   * @param {string} category ('prepaid', 'postpaid', 'dana', 'ovo', 'pdam', 'pgn', 'pbb', 'bpjs', 'jastel', 'fif', 'transfer_uang')
   * @returns {{ extractedMap: Object, formattedOutput: string, items: Array, totalExpected: number }}
   */
  parseText(rawText, category = 'prepaid') {
    if (!rawText) return { extractedMap: {}, formattedOutput: '', items: [], totalExpected: 0 };

    const catKey = (category || 'prepaid').toLowerCase();
    const rules = this.categoryRules[catKey] || this.categoryRules.prepaid;
    const lines = rawText.split(/\r?\n/);
    const extractedMap = {};

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      rules.forEach(rule => {
        if (!(rule.key in extractedMap)) {
          const match = cleanLine.match(rule.pattern);
          if (match) {
            let cleanVal = this.cleanValue(rule.key, match[1], rule.labelName);

            // Khusus Tanggal (CSM_TM_PAID / Tanggal):
            // Jika bernilai '0', '00000000', '0000-00-00', atau '-', anggap tidak ada data agar fallback CSM_TM_SAVED bisa dipakai
            if (rule.key === 'CSM_TM_PAID' || rule.labelName === 'Tanggal') {
              const isZeroDate = cleanVal === '0' || cleanVal === '00000000' || cleanVal === '0000-00-00' || cleanVal === '-';
              if (isZeroDate) {
                cleanVal = ''; // Kosongkan agar ditangani oleh fallbackPattern (CSM_TM_SAVED)
              }
            }

            if (cleanVal !== '') {
              extractedMap[rule.key] = cleanVal;
            }
          }
        }
      });
    });

    // Fallback pass (jika key utama tidak ditemukan/kosong, misal jika CSM_TM_PAID tidak ada atau bernilai 0, gunakan CSM_TM_SAVED untuk Tanggal)
    rules.forEach(rule => {
      if ((!(rule.key in extractedMap) || extractedMap[rule.key] === '') && rule.fallbackPattern) {
        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;
          const match = cleanLine.match(rule.fallbackPattern);
          if (match) {
            const cleanVal = this.cleanValue(rule.key, match[1], rule.labelName);
            if (cleanVal !== '' && cleanVal !== '0') {
              extractedMap[rule.key] = cleanVal;
              break;
            }
          }
        }
      }
    });

    const items = [];
    const formattedLines = [];
    const maxLabelLen = Math.max(...rules.map(r => r.labelName.length));

    rules.forEach(rule => {
      const val = extractedMap[rule.key];
      const isFound = rule.key in extractedMap && val !== undefined && val !== null;
      const paddedLabel = rule.labelName.padEnd(maxLabelLen, ' ');
      const isStatusField = rule.key.includes('FLAG') || rule.labelName === 'Status';
      const displayVal = typeof val === 'string' ? val.trim() : (val || '');

      items.push({
        key: rule.key,
        labelName: rule.labelName,
        paddedLabel: paddedLabel,
        value: isStatusField && displayVal === '' ? '' : displayVal,
        found: isFound,
        optional: Boolean(rule.optional)
      });

      // Format baris jika field terdeteksi
      if (isFound) {
        let shouldInclude = true;

        // Khusus MULTI FINANCE / FIF: jika [CSM_TM_TOTAL_PERIOD] dan [CSM_TM_OD_PENALTY] bernilai 0 tidak dimunculkan di ocrFormattedText
        if (catKey === 'fif' || catKey === 'multi_finance' || catKey === 'multifinance') {
          if (rule.key === 'CSM_TM_TOTAL_PERIOD' || rule.key === 'CSM_TM_OD_PENALTY') {
            const cleanDigits = displayVal.replace(/[^0-9]/g, '');
            if (cleanDigits === '0' || cleanDigits === '' || displayVal === '0') {
              shouldInclude = false;
            }
          }
        }

        if (shouldInclude) {
          if (isStatusField) {
            // Jika Status terdeteksi: jika SUKSES/GAGAL cetak nilainya, jika bernilai 0 cetak "Status              : "
            if (displayVal === 'SUKSES' || displayVal === 'GAGAL') {
              formattedLines.push(`${paddedLabel} : ${displayVal}`);
            } else {
              formattedLines.push(`${paddedLabel} : `);
            }
          } else if (displayVal.length > 0) {
            formattedLines.push(`${paddedLabel} : ${displayVal}`);
          }
        }
      }
    });

    const totalExpected = rules.filter(r => !r.optional).length;
    const categoryTitle = this.getCategoryTitle(catKey);
    const isNoCategorySuffix = (
      catKey === 'fif' ||
      catKey === 'multi_finance' ||
      catKey === 'multifinance' ||
      catKey === 'pgn' ||
      catKey === 'general_payment' ||
      catKey === 'generalpayment'
    );
    const headerLine = isNoCategorySuffix
      ? 'Hasil pengecekan transaksi'
      : `Hasil pengecekan transaksi ${categoryTitle}`;

    const formattedOutput = formattedLines.length > 0
      ? `${headerLine}\n${formattedLines.join('\n')}`
      : headerLine;

    return {
      extractedMap,
      formattedOutput,
      items,
      totalExpected
    };
  }

  /**
   * Mengembalikan gambar beresolusi tinggi tanpa merusak piksel warna asli
   * @param {File|Blob|string} imageSource 
   * @returns {Promise<string>}
   */
  async preprocessImage(imageSource) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Scale 2x untuk kejernihan teks
          const scale = 2;
          canvas.width = Math.floor(img.width * scale);
          canvas.height = Math.floor(img.height * scale);

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          console.warn('Gagal pra-pemrosesan gambar, menggunakan gambar asli:', e);
          resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource));
        }
      };
      img.onerror = () => {
        resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource));
      };

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else {
        img.src = URL.createObjectURL(imageSource);
      }
    });
  }

  /**
   * Menjalankan OCR menggunakan Tesseract.js client side
   * @param {File|Blob|string} imageSource 
   * @param {Function} progressCallback 
   * @returns {Promise<string>}
   */
  async recognizeImage(imageSource, progressCallback) {
    if (typeof Tesseract === 'undefined') {
      throw new Error('Library Tesseract.js belum dimuat. Pastikan terhubung ke internet atau CDN.');
    }

    try {
      if (progressCallback) progressCallback(5, 'Menyiapkan gambar...');
      const processedSrc = await this.preprocessImage(imageSource);

      const result = await Tesseract.recognize(
        processedSrc,
        'eng',
        {
          logger: m => {
            if (progressCallback) {
              if (m.status === 'recognizing text') {
                const percent = Math.round((m.progress || 0) * 100);
                progressCallback(percent, `Membaca teks dari gambar (${percent}%)...`);
              } else {
                progressCallback(10, `Status: ${m.status}...`);
              }
            }
          }
        }
      );
      return result.data.text || '';
    } catch (error) {
      console.error('Error saat proses OCR:', error);
      throw error;
    }
  }
}

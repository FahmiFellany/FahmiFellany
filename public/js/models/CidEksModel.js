/**
 * CidEksModel
 * Mengelola Master Data CID EKS (Baris 2 s/d 27 dari Tabel Master Excel)
 * serta pencarian & validasi kombinasi (Nama Agent + Admin).
 */
export const MASTER_CID_EKS_DATA = [
  {
    agent: 'AMANAH BERKAH CANDRIKA (ABC)',
    admin: '5000',
    agentAdmin: 'AMANAH BERKAH CANDRIKA (ABC) 5000',
    cid: '0170016 | MASAGO - BDI - CV AMANAH BERKAH CANDRIKA )',
    referal: '0000081336730109',
    theme: '82 - AMANAH BERKAH CANDRIKA',
    ea: 'MASAGO_ABC - MASAGO ABC'
  },
  {
    agent: 'AMANAH BERKAH CANDRIKA (ABC)',
    admin: '3000',
    agentAdmin: 'AMANAH BERKAH CANDRIKA (ABC) 3000',
    cid: '0170019 | MASAGO - BDI - CV AMANAH BERKAH CANDRIKA 3000)',
    referal: '0000081336891322',
    theme: '82 - AMANAH BERKAH CANDRIKA',
    ea: 'MASAGO_ABC_3000 - MASAGO ABC 3000'
  },
  {
    agent: 'AMANAH BERKAH CANDRIKA (ABC)',
    admin: 'MASAGO',
    agentAdmin: 'AMANAH BERKAH CANDRIKA (ABC) MASAGO',
    cid: '0170001 - MASAGO - BDI - MASAGO',
    referal: 'MASAGO',
    theme: 'MASAGO',
    ea: 'MASAGO'
  },
  {
    agent: 'BETTA IKASINDO (BI)',
    admin: '3000',
    agentAdmin: 'BETTA IKASINDO (BI) 3000',
    cid: '0170030 - MASAGO - BDI - CV BETTA IKASINDO (BI) 3000',
    referal: '0000008122769191',
    theme: '89 - BETTA IKASINDO 3000',
    ea: 'MASAGO_BETTA - MASAGO BETTA IKASINDO 3000'
  },
  {
    agent: 'BETTA IKASINDO (BI)',
    admin: '3000 NS',
    agentAdmin: 'BETTA IKASINDO (BI) 3000 NS',
    cid: '0170031 - MASAGO - BDI - CV BETTA IKASINDO (BI) 3000NS',
    referal: '0000082241915566',
    theme: '90 - BETTA IKASINDO 3000 NS',
    ea: 'MASAGO_BETTANS - MASAGO BETTA IKASINDO 3000 NS'
  },
  {
    agent: 'BETTA IKASINDO (BI)',
    admin: '3500',
    agentAdmin: 'BETTA IKASINDO (BI) 3500',
    cid: '0170032 - MASAGO - BDI - CV BETTA IKASINDO (BI) 3500',
    referal: '0000085643724121',
    theme: '91 - BETTA IKASINDO 3500',
    ea: 'MASAGO_BETTA_3500 - MASAGO BETTA IKASINDO 3500'
  },
  {
    agent: 'BETTA IKASINDO (BI)',
    admin: '5000',
    agentAdmin: 'BETTA IKASINDO (BI) 5000',
    cid: '0170033 - MASAGO - BDI - CV BETTA IKASINDO (BI) 5000',
    referal: '0000082328849191',
    theme: '92 - BETTA IKASINDO 5000',
    ea: 'MASAGO_BETTA_5000 - MASAGO BETTA IKASINDO 5000'
  },
  {
    agent: 'BETTA IKASINDO (BI)',
    admin: '3500 3000 4000',
    agentAdmin: 'BETTA IKASINDO (BI) 3500 3000 4000',
    cid: '0170035 - MASAGO - BDI - CV BETTA IKASINDO (BI) 3500 3000 4000',
    referal: '0000895327524620',
    theme: '93 - BETTA IKASINDO',
    ea: 'MASAGO_BETTA_3500_3000_4000 - MASAGO BETTA IKASINDO 3500 3000 4000'
  },
  {
    agent: 'BETTA IKASINDO (BI)',
    admin: '5000 3000 5000',
    agentAdmin: 'BETTA IKASINDO (BI) 5000 3000 5000',
    cid: '0170036 - MASAGO - BDI - CV BETTA IKASINDO (BI) 5000 3000 5000',
    referal: '0000895327524622',
    theme: '94 - BETTA IKASINDO',
    ea: 'MASAGO_BETTA_5000_3000_5000 - MASAGO BETTA IKASINDO 5000 3000 5000'
  },
  {
    agent: 'BETTA IKASINDO (BI)',
    admin: '4000 4000 4000',
    agentAdmin: 'BETTA IKASINDO (BI) 4000 4000 4000',
    cid: '0170037 - MASAGO - BDI - CV BETTA IKASINDO (BI) 4000 4000 4000',
    referal: '0000895327524623',
    theme: '95 - BETTA IKASINDO',
    ea: 'MASAGO_BETTA_4000 - MASAGO BETTA IKASINDO 4000 4000 4000'
  },
  {
    agent: 'BETTA IKASINDO (BI)',
    admin: 'MASAGO',
    agentAdmin: 'BETTA IKASINDO (BI) MASAGO',
    cid: '0170001 - MASAGO - BDI - MASAGO',
    referal: 'MASAGO',
    theme: 'MASAGO',
    ea: 'MASAGO'
  },
  {
    agent: 'Dian Malindo Utama (DMU)',
    admin: '3000',
    agentAdmin: 'Dian Malindo Utama (DMU) 3000',
    cid: '0170027 - MASAGO - BDI - CV Dian Malindo Utama (DMU) 3000',
    referal: '0000082135057176',
    theme: '85 - DIAN MALINDO UTAMA DMU - 3000',
    ea: 'MASAGO_DIAN_MALINDO_UTAMA_3000 - MASAGO DIAN MALINDO UTAMA 3000'
  },
  {
    agent: 'Dian Malindo Utama (DMU)',
    admin: '2750',
    agentAdmin: 'Dian Malindo Utama (DMU) 2750',
    cid: '0170028 - MASAGO - BDI - CV Dian Malindo Utama (DMU) 2750',
    referal: '0000895631255445',
    theme: '86 - DIAN MALINDO UTAMA DMU - 2750',
    ea: 'MASAGO_DIAN_MALINDO_UTAMA_2750 - MASAGO DIAN MALINDO UTAMA 2750'
  },
  {
    agent: 'Dian Malindo Utama (DMU)',
    admin: 'MASAGO',
    agentAdmin: 'Dian Malindo Utama (DMU) MASAGO',
    cid: '0170001 - MASAGO - BDI - MASAGO',
    referal: 'MASAGO',
    theme: 'MASAGO',
    ea: 'MASAGO'
  },
  {
    agent: 'MITRA SEJAHTERA',
    admin: '3000',
    agentAdmin: 'MITRA SEJAHTERA 3000',
    cid: '0170039 - MASAGO - BDI - CV MITRA SEJAHTERA (3000) 3000 3000',
    referal: '0000008112902727',
    theme: '96 - CV MITRA SEJAHTERA 3000',
    ea: 'MASAGO_MITRA_SEJAHTERA_3000_3000_3000 - MASAGO MITRA SEJAHTERA 3000 3000 3000'
  },
  {
    agent: 'MITRA SEJAHTERA',
    admin: '2750',
    agentAdmin: 'MITRA SEJAHTERA 2750',
    cid: '0170040 - MASAGO - BDI - CV MITRA SEJAHTERA (2750) 2750 2750',
    referal: '0000008161111633',
    theme: '97 - CV MITRA SEJAHTERA 2750',
    ea: 'MASAGO_MITRA_SEJAHTERA_2750_2750_2750 - MASAGO MITRA SEJAHTERA 2750 2750 2750'
  },
  {
    agent: 'MITRA SEJAHTERA',
    admin: '2500',
    agentAdmin: 'MITRA SEJAHTERA 2500',
    cid: '0170041 - MASAGO - BDI - CV MITRA SEJAHTERA (2500) 2500 2500',
    referal: '0000008197896994',
    theme: '98 - CV MITRA SEJAHTERA 2500',
    ea: 'MASAGO_MITRA_SEJAHTERA_2500_2500_2500 - MASAGO MITRA SEJAHTERA 2500 2500 2500'
  },
  {
    agent: 'MITRA SEJAHTERA',
    admin: '3500',
    agentAdmin: 'MITRA SEJAHTERA 3500',
    cid: '0170042 - MASAGO - BDI - CV MITRA SEJAHTERA (3500) 3500 3500',
    referal: '0000085748799980',
    theme: '99 - CV MITRA SEJAHTERA 3500',
    ea: 'MASAGO_MITRA_SEJAHTERA_3500_3500_3500 - MASAGO MITRA SEJAHTERA 3500 3500 3500'
  },
  {
    agent: 'MITRA SEJAHTERA',
    admin: 'MASAGO',
    agentAdmin: 'MITRA SEJAHTERA MASAGO',
    cid: '0170001 - MASAGO - BDI - MASAGO',
    referal: 'MASAGO',
    theme: 'MASAGO',
    ea: 'MASAGO'
  },
  {
    agent: 'ENTRI-NRY',
    admin: '2050',
    agentAdmin: 'ENTRI-NRY 2050',
    cid: '0170043 - MASAGO - BDI - ENTRI-NRY (2050)',
    referal: '0000085222226532',
    theme: '101 - ENTRI-NRY 2050',
    ea: 'MASAGO_ENTRI_NRY_2050_2050_2050'
  },
  {
    agent: 'ENTRI-NRY',
    admin: '2250',
    agentAdmin: 'ENTRI-NRY 2250',
    cid: '0170044 - MASAGO - BDI - ENTRI-NRY (2250)',
    referal: '0000081333588893',
    theme: '102 - ENTRI-NRY 2250',
    ea: 'MASAGO_ENTRI_NRY_2250_2250_2250'
  },
  {
    agent: 'ENTRI-NRY',
    admin: '2500',
    agentAdmin: 'ENTRI-NRY 2500',
    cid: '0170045 - MASAGO - BDI - ENTRI-NRY (2500)',
    referal: '0000081573725111',
    theme: '103 - ENTRI-NRY 2500',
    ea: 'MASAGO_ENTRI_NRY_2500_2500_2500'
  },
  {
    agent: 'ENTRI-NRY',
    admin: '2750',
    agentAdmin: 'ENTRI-NRY 2750',
    cid: '0170046 - MASAGO - BDI - ENTRI-NRY (2750)',
    referal: '0000081223855583',
    theme: '104 - ENTRI-NRY 2750',
    ea: 'MASAGO_ENTRI_NRY_2750_2750_2750'
  },
  {
    agent: 'ENTRI-NRY',
    admin: '3000',
    agentAdmin: 'ENTRI-NRY 3000',
    cid: '0170047 - MASAGO - BDI - ENTRI-NRY (3000)',
    referal: '0000087777794042',
    theme: '105 - ENTRI-NRY 3000',
    ea: 'MASAGO_ENTRI_NRY_3000_3000_3000'
  },
  {
    agent: 'ENTRI-NRY',
    admin: '3250',
    agentAdmin: 'ENTRI-NRY 3250',
    cid: '0170048 - MASAGO - BDI - ENTRI-NRY (3250)',
    referal: '0000081222556654',
    theme: '106 - ENTRI-NRY 3250',
    ea: 'MASAGO_ENTRI_NRY_3250_3250_3250'
  },
  {
    agent: 'ENTRI-NRY',
    admin: 'MASAGO',
    agentAdmin: 'ENTRI-NRY MASAGO',
    cid: '0170001 - MASAGO - BDI - MASAGO',
    referal: 'MASAGO',
    theme: 'MASAGO',
    ea: 'MASAGO'
  }
];

export class CidEksModel {
  constructor() {
    this.masterData = [...MASTER_CID_EKS_DATA];
  }

  /**
   * Mengambil semua daftar Nama Agent unik dari master data
   */
  getUniqueAgents() {
    const agents = this.masterData.map(item => item.agent);
    return [...new Set(agents)];
  }

  /**
   * Mengambil semua daftar Admin unik untuk Agent tertentu
   */
  getAdminsForAgent(agentName = '') {
    const filtered = agentName
      ? this.masterData.filter(item => item.agent.toLowerCase() === agentName.toLowerCase())
      : this.masterData;
    const admins = filtered.map(item => item.admin);
    return [...new Set(admins)];
  }

  /**
   * Cari baris data berdasarkan Nama Agent & Admin
   */
  /**
   * Cari baris data berdasarkan Nama Agent & Admin
   * Jika adminVal kosong, mengembalikan baris pertama yang cocok untuk agentName tersebut.
   */
  findRow(agentName, adminVal) {
    if (!agentName || !agentName.trim()) return null;
    const cleanAgent = agentName.trim().toLowerCase();
    const cleanAdmin = adminVal ? adminVal.trim().toLowerCase() : '';

    return this.masterData.find(item => {
      const matchAgent = item.agent.trim().toLowerCase() === cleanAgent;
      if (!matchAgent) return false;
      if (cleanAdmin) {
        return item.admin.trim().toLowerCase() === cleanAdmin;
      }
      return true;
    }) || null;
  }

  /**
   * Format PPID menjadi 16 digit dengan angka 0 di depan
   */
  formatPpid(ppidInput) {
    if (!ppidInput) return '';
    const clean = String(ppidInput).trim();
    if (!clean) return '';
    const digits = clean.replace(/\D/g, '');
    const targetDigits = digits || clean;
    return targetDigits.padStart(16, '0');
  }

  /**
   * Proses pencarian perbandingan CID Lama & Baru
   */
  compareCidEks(agentName, adminLama, adminBaru, ppidVal = '') {
    const cleanAgent = agentName ? agentName.trim() : '';
    const cleanAdminLama = adminLama ? adminLama.trim() : '';
    const cleanAdminBaru = adminBaru ? adminBaru.trim() : '';

    const rowLama = this.findRow(cleanAgent, cleanAdminLama);
    const rowBaru = this.findRow(cleanAgent, cleanAdminBaru);

    // Keabsahan admin: dianggap invalid hanya jika admin diisi tetapi row tidak ditemukan
    const isLamaValid = cleanAdminLama ? !!rowLama : true;
    const isBaruValid = cleanAdminBaru ? !!rowBaru : true;

    const formattedOutput = this.formatAllDataOutput(rowLama, rowBaru, ppidVal, cleanAgent, cleanAdminLama, cleanAdminBaru);

    return {
      agentName: cleanAgent,
      adminLama: cleanAdminLama,
      adminBaru: cleanAdminBaru,
      ppidVal,
      rowLama,
      rowBaru,
      isLamaValid,
      isBaruValid,
      isValid: isLamaValid && isBaruValid,
      formattedOutput
    };
  }

  /**
   * Format teks ALL DATA (Output Merah)
   */
  formatAllDataOutput(rowLama, rowBaru, ppidVal = '', agentName = '', adminLama = '', adminBaru = '') {
    const formattedPpid = this.formatPpid(ppidVal);
    const ppidLine = `PPID        : ${formattedPpid || '-'}`;

    // Guard clause: Jika Agent belum dipilih sama sekali, tampilkan semua "-"
    if (!agentName) {
      return [
        ppidLine,
        `CID Lama    : -`,
        `Referal Lama: -`,
        `Theme Lama  : -`,
        `EA Lama     : -`,
        ``,
        `CID Baru    : -`,
        `Referal Baru: -`,
        `Theme Baru  : -`,
        `EA Baru     : -`
      ].join('\n');
    }

    const cidLama = rowLama ? rowLama.cid : (adminLama ? '(Data Admin Lama Tidak Ditemukan)' : '-');
    const refLama = rowLama ? rowLama.referal : '-';
    const themeLama = rowLama ? rowLama.theme : '-';
    const eaLama = rowLama ? rowLama.ea : '-';

    const cidBaru = rowBaru ? rowBaru.cid : (adminBaru ? '(Data Admin Baru Tidak Ditemukan)' : '-');
    const refBaru = rowBaru ? rowBaru.referal : '-';
    const themeBaru = rowBaru ? rowBaru.theme : '-';
    const eaBaru = rowBaru ? rowBaru.ea : '-';

    return [
      ppidLine,
      `CID Lama    : ${cidLama}`,
      `Referal Lama: ${refLama}`,
      `Theme Lama  : ${themeLama}`,
      `EA Lama     : ${eaLama}`,
      ``,
      `CID Baru    : ${cidBaru}`,
      `Referal Baru: ${refBaru}`,
      `Theme Baru  : ${themeBaru}`,
      `EA Baru     : ${eaBaru}`
    ].join('\n');
  }
}

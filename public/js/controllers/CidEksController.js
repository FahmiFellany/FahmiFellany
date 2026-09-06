/**
 * CidEksController
 * Pengendali logika interaksi antara CidEksModel dan CidEksView.
 */
export class CidEksController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.init();
  }

  init() {
    // 1. Dapatkan semua agent unik & tampilkan di dropdown Green
    const agentList = this.model.getUniqueAgents();
    this.view.populateAgentOptions(agentList);

    // 2. Pilih default Agent (BETTA IKASINDO (BI) atau agent pertama)
    const defaultAgent = agentList.includes('BETTA IKASINDO (BI)') ? 'BETTA IKASINDO (BI)' : (agentList[0] || '');
    if (this.view.selectAgent) {
      this.view.selectAgent.value = defaultAgent;
    }

    // 4. Update daftar Admin berdasarkan Agent terpilih
    this.updateAdminDropdowns(defaultAgent);

    // 5. Set Nilai Default Contoh (PPID: 082216130101, Admin Lama: 4000 4000 4000, Admin Baru: 5000)
    this.view.setPpidValue('082216130101');
    this.view.setAdminLamaValue('4000 4000 4000');
    this.view.setAdminBaruValue('5000');

    // 6. Hubungkan Event Listener
    this.view.bindAgentChange((selectedAgent) => {
      this.updateAdminDropdowns(selectedAgent);
      this.onInputChange();
    });

    this.view.bindPpidChange(() => this.onInputChange());
    this.view.bindAdminLamaChange(() => this.onInputChange());
    this.view.bindAdminBaruChange(() => this.onInputChange());

    // 7. Jalankan pencarian pertama kali
    this.onInputChange();
  }

  updateAdminDropdowns(agentName) {
    const adminList = this.model.getAdminsForAgent(agentName);
    this.view.populateAdminLamaOptions(adminList);
    this.view.populateAdminBaruOptions(adminList);
  }

  onInputChange() {
    const agentName = this.view.getSelectedAgent();
    const ppidVal = this.view.getPpid();
    const adminLama = this.view.getAdminLama();
    const adminBaru = this.view.getAdminBaru();

    const compareResult = this.model.compareCidEks(agentName, adminLama, adminBaru, ppidVal);
    this.view.renderResult(compareResult);
  }
}

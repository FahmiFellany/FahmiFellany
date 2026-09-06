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
    // 1. Dapatkan semua agent unik & tampilkan di dropdown Green (Default Kosong "")
    const agentList = this.model.getUniqueAgents();
    this.view.populateAgentOptions(agentList);
    if (this.view.selectAgent) {
      this.view.selectAgent.value = '';
    }

    // 2. Inisialisasi daftar Admin (Default Kosong "")
    this.updateAdminDropdowns('');

    // 3. Pastikan semua field input bertipe default kosong ""
    this.view.setPpidValue('');
    this.view.setAdminLamaValue('');
    this.view.setAdminBaruValue('');

    // 4. Hubungkan Event Listener
    this.view.bindAgentChange((selectedAgent) => {
      this.updateAdminDropdowns(selectedAgent);
      this.onInputChange();
    });

    this.view.bindPpidChange(() => this.onInputChange());
    this.view.bindAdminLamaChange(() => this.onInputChange());
    this.view.bindAdminBaruChange(() => this.onInputChange());

    // 5. Jalankan pemicu tampilan awal (Guard Clause)
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

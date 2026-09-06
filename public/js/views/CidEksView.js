/**
 * CidEksView
 * Menangani rendering UI & Event Listener untuk menu CID EKS.
 * Mengimplementasikan tata letak warna:
 * - Green Theme: Dropdown & Input Nama Agent
 * - Blue Theme: Dropdown & Input Admin Lama & Admin Baru
 * - Red Theme: Kontainer & Teks Hasil ALL DATA
 */
export class CidEksView {
  constructor() {
    this.selectAgent = document.getElementById('cidSelectAgent');
    this.selectPpid = document.getElementById('cidSelectPpid');
    this.inputPpid = document.getElementById('cidInputPpid');
    this.selectAdminLama = document.getElementById('cidSelectAdminLama');
    this.inputAdminLama = document.getElementById('cidInputAdminLama');
    this.selectAdminBaru = document.getElementById('cidSelectAdminBaru');
    this.inputAdminBaru = document.getElementById('cidInputAdminBaru');
    this.outputContainer = document.getElementById('cidAllDataOutput');
    this.warningBanner = document.getElementById('cidWarningBanner');
    this.btnCopyOutput = document.getElementById('cidBtnCopyOutput');
    this.toast = document.getElementById('toast');

    // Navigation Tabs
    this.navTabConverter = document.getElementById('navTabConverter');
    this.navTabOcr = document.getElementById('navTabOcr');
    this.navTabSaldo = document.getElementById('navTabSaldo');
    this.navTabCidEks = document.getElementById('navTabCidEks');

    this.viewConverter = document.getElementById('viewConverter');
    this.viewOcr = document.getElementById('viewOcr');
    this.viewSaldo = document.getElementById('viewSaldo');
    this.viewCidEks = document.getElementById('viewCidEks');

    this.initEvents();
  }

  switchTab(tabName) {
    const tabs = [
      { name: 'converter', tab: this.navTabConverter, view: this.viewConverter, display: 'flex' },
      { name: 'ocr', tab: this.navTabOcr, view: this.viewOcr, display: 'block' },
      { name: 'saldo', tab: this.navTabSaldo, view: this.viewSaldo, display: 'block' },
      { name: 'cidEks', tab: this.navTabCidEks, view: this.viewCidEks, display: 'block' }
    ];

    tabs.forEach(item => {
      if (item.name === tabName) {
        if (item.tab) item.tab.classList.add('active');
        if (item.view) item.view.style.display = item.display;
      } else {
        if (item.tab) item.tab.classList.remove('active');
        if (item.view) item.view.style.display = 'none';
      }
    });
  }

  initEvents() {
    if (this.navTabCidEks) {
      this.navTabCidEks.addEventListener('click', () => {
        this.switchTab('cidEks');
      });
    }
    // Tombol Copy Output
    if (this.btnCopyOutput && this.outputContainer) {
      this.btnCopyOutput.addEventListener('click', () => {
        const text = this.outputContainer.value || this.outputContainer.innerText;
        if (!text || text.trim() === '') return;

        navigator.clipboard.writeText(text).then(() => {
          this.showToast('📋 Hasil ALL DATA berhasil disalin ke clipboard!');
        }).catch(err => {
          console.error('Gagal menyalin:', err);
        });
      });
    }
  }

  populateAgentOptions(agentList) {
    if (!this.selectAgent) return;
    this.selectAgent.innerHTML = '';
    agentList.forEach(agent => {
      const opt = document.createElement('option');
      opt.value = agent;
      opt.textContent = agent;
      this.selectAgent.appendChild(opt);
    });
  }

  populatePpidOptions(ppidList) {
    if (!this.selectPpid) return;
    const currentVal = this.selectPpid.value;
    this.selectPpid.innerHTML = '<option value="">-- Pilih / Ketik PPID --</option>';
    ppidList.forEach(ppid => {
      const opt = document.createElement('option');
      opt.value = ppid;
      opt.textContent = ppid;
      this.selectPpid.appendChild(opt);
    });
    if (currentVal && ppidList.includes(currentVal)) {
      this.selectPpid.value = currentVal;
    }
  }

  bindPpidChange(handler) {
    if (this.selectPpid) {
      this.selectPpid.addEventListener('change', () => {
        if (this.inputPpid) {
          this.inputPpid.value = this.selectPpid.value;
        }
        handler();
      });
    }
    if (this.inputPpid) {
      this.inputPpid.addEventListener('input', () => {
        if (this.selectPpid) {
          this.selectPpid.value = this.inputPpid.value;
        }
        handler();
      });
    }
  }

  getPpid() {
    return (this.inputPpid ? this.inputPpid.value : '') || (this.selectPpid ? this.selectPpid.value : '');
  }

  setPpidValue(val) {
    if (this.inputPpid) this.inputPpid.value = val;
    if (this.selectPpid) this.selectPpid.value = val;
  }

  populateAdminLamaOptions(adminList) {
    if (!this.selectAdminLama) return;
    const currentVal = this.selectAdminLama.value;
    this.selectAdminLama.innerHTML = '<option value="">-- Pilih / Ketik Admin Lama --</option>';
    adminList.forEach(admin => {
      const opt = document.createElement('option');
      opt.value = admin;
      opt.textContent = admin;
      this.selectAdminLama.appendChild(opt);
    });
    if (currentVal && adminList.includes(currentVal)) {
      this.selectAdminLama.value = currentVal;
    }
  }

  populateAdminBaruOptions(adminList) {
    if (!this.selectAdminBaru) return;
    const currentVal = this.selectAdminBaru.value;
    this.selectAdminBaru.innerHTML = '<option value="">-- Pilih / Ketik Admin Baru --</option>';
    adminList.forEach(admin => {
      const opt = document.createElement('option');
      opt.value = admin;
      opt.textContent = admin;
      this.selectAdminBaru.appendChild(opt);
    });
    if (currentVal && adminList.includes(currentVal)) {
      this.selectAdminBaru.value = currentVal;
    }
  }

  bindAgentChange(handler) {
    if (this.selectAgent) {
      this.selectAgent.addEventListener('change', () => handler(this.selectAgent.value));
    }
  }

  bindAdminLamaChange(handler) {
    if (this.selectAdminLama) {
      this.selectAdminLama.addEventListener('change', () => {
        if (this.inputAdminLama) {
          this.inputAdminLama.value = this.selectAdminLama.value;
        }
        handler();
      });
    }
    if (this.inputAdminLama) {
      this.inputAdminLama.addEventListener('input', () => {
        if (this.selectAdminLama) {
          this.selectAdminLama.value = this.inputAdminLama.value;
        }
        handler();
      });
    }
  }

  bindAdminBaruChange(handler) {
    if (this.selectAdminBaru) {
      this.selectAdminBaru.addEventListener('change', () => {
        if (this.inputAdminBaru) {
          this.inputAdminBaru.value = this.selectAdminBaru.value;
        }
        handler();
      });
    }
    if (this.inputAdminBaru) {
      this.inputAdminBaru.addEventListener('input', () => {
        if (this.selectAdminBaru) {
          this.selectAdminBaru.value = this.inputAdminBaru.value;
        }
        handler();
      });
    }
  }

  getSelectedAgent() {
    return this.selectAgent ? this.selectAgent.value : '';
  }

  getAdminLama() {
    return (this.inputAdminLama ? this.inputAdminLama.value : '') || (this.selectAdminLama ? this.selectAdminLama.value : '');
  }

  getAdminBaru() {
    return (this.inputAdminBaru ? this.inputAdminBaru.value : '') || (this.selectAdminBaru ? this.selectAdminBaru.value : '');
  }

  setAdminLamaValue(val) {
    if (this.inputAdminLama) this.inputAdminLama.value = val;
    if (this.selectAdminLama) this.selectAdminLama.value = val;
  }

  setAdminBaruValue(val) {
    if (this.inputAdminBaru) this.inputAdminBaru.value = val;
    if (this.selectAdminBaru) this.selectAdminBaru.value = val;
  }

  renderResult(compareResult) {
    const { isLamaValid, isBaruValid, adminLama, adminBaru, formattedOutput } = compareResult;

    if (this.outputContainer) {
      this.outputContainer.value = formattedOutput;
    }

    // Peringatan / Warning Banner
    if (this.warningBanner) {
      const warnings = [];
      if (adminLama && !isLamaValid) {
        warnings.push(`⚠️ Data Admin Lama "${adminLama}" tidak ditemukan di tabel master!`);
      }
      if (adminBaru && !isBaruValid) {
        warnings.push(`⚠️ Data Admin Baru "${adminBaru}" tidak ditemukan di tabel master!`);
      }

      if (warnings.length > 0) {
        this.warningBanner.style.display = 'block';
        this.warningBanner.innerHTML = warnings.join('<br>');
      } else {
        this.warningBanner.style.display = 'none';
        this.warningBanner.innerHTML = '';
      }
    }
  }

  showToast(message) {
    if (!this.toast) return;
    this.toast.textContent = message;
    this.toast.classList.add('show');
    setTimeout(() => {
      this.toast.classList.remove('show');
    }, 3000);
  }
}

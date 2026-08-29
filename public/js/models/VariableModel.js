/**
 * VariableModel (Client-Side)
 * Mengelola data CRUD Variabel Cepat dengan validasi unique key dan sinkronisasi LocalStorage & Backend API.
 */
export class VariableModel {
  constructor() {
    this.variables = [];
    this.defaultVariables = [
      { id: 1, key: 'idm', value: 'Informasi dari Mitra', description: 'Informasi dari Mitra', createdAt: new Date().toISOString() },
      { id: 2, key: 'idi', value: 'Informasi dari Internal', description: 'Informasi dari Internal', createdAt: new Date().toISOString() },
      { id: 3, key: 'idb', value: 'Informasi dari Biller', description: 'Informasi dari Biller', createdAt: new Date().toISOString() },
      { id: 4, key: 'fvo', value: 'FU ke VSI OPS', description: 'FU ke VSI OPS', createdAt: new Date().toISOString() },
      { id: 5, key: 'fms', value: 'FU ke MASA SAC', description: 'FU ke MASA SAC', createdAt: new Date().toISOString() },
      { id: 6, key: 'fc', value: 'FU ke Ceria', description: 'FU ke Ceria', createdAt: new Date().toISOString() },
      { id: 7, key: 'fb', value: 'Fu ke Biller', description: 'Fu ke Biller', createdAt: new Date().toISOString() },
      { id: 8, key: 'mkm', value: 'Menyampaikan ke mitra', description: 'Menyampaikan ke mitra', createdAt: new Date().toISOString() }
    ];
    this._initLocalStorage();
  }

  _initLocalStorage() {
    if (!localStorage.getItem('app_variables')) {
      localStorage.setItem('app_variables', JSON.stringify(this.defaultVariables));
    }
  }

  _getApiUrl(endpoint) {
    const isNodeServer = window.location.origin.includes(':3000');
    const baseUrl = isNodeServer ? '' : 'http://localhost:3000';
    return `${baseUrl}${endpoint}`;
  }

  _getLocalVariables() {
    try {
      const data = JSON.parse(localStorage.getItem('app_variables') || '[]');
      return Array.isArray(data) && data.length > 0 ? data : [...this.defaultVariables];
    } catch (e) {
      return [...this.defaultVariables];
    }
  }

  _saveLocalVariables(data) {
    localStorage.setItem('app_variables', JSON.stringify(data));
  }

  _stripHtml(html) {
    if (!html || typeof html !== 'string') return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || doc.body.innerText || '').trim();
  }

  getVariables() {
    return this.variables;
  }

  getMap() {
    const map = {};
    const list = this.variables.length > 0 ? this.variables : this._getLocalVariables();
    list.forEach(item => {
      if (item.key && item.value) {
        map[item.key.toLowerCase()] = item.value;
      }
    });
    return map;
  }

  async fetchAll() {
    try {
      const url = this._getApiUrl('/api/variables');
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const text = await res.text();
        if (text.trim().startsWith('{')) {
          const data = JSON.parse(text);
          if (data.success && Array.isArray(data.data)) {
            this.variables = data.data;
            this._saveLocalVariables(data.data);
            return this.variables;
          }
        }
      }
    } catch (err) {
      console.warn('Backend API tidak merespon, menggunakan LocalStorage fallback:', err);
    }

    this.variables = this._getLocalVariables();
    return this.variables;
  }

  async create(key, value, description = '') {
    const cleanKey = this._stripHtml(key).toLowerCase().replace(/\s+/g, '');
    const cleanValue = this._stripHtml(value);
    const cleanDesc = this._stripHtml(description);

    if (!cleanKey || !cleanValue) {
      throw new Error('Nama variabel (kunci) dan nilai teks output wajib diisi!');
    }

    const currentList = this._getLocalVariables();
    const existing = currentList.find(item => item.key.toLowerCase() === cleanKey);
    if (existing) {
      throw new Error(`Variabel "${cleanKey}" sudah terdaftar! Kunci variabel harus unik.`);
    }

    try {
      const url = this._getApiUrl('/api/variables');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          key: cleanKey,
          value: cleanValue,
          description: cleanDesc
        })
      });

      if (res.ok) {
        const text = await res.text();
        if (text.trim().startsWith('{')) {
          const data = JSON.parse(text);
          if (data.success && data.data) {
            await this.fetchAll();
            return data.data;
          }
        }
      } else if (res.status === 400) {
        const text = await res.text();
        if (text.startsWith('{')) {
          const jsonErr = JSON.parse(text);
          if (jsonErr.error) throw new Error(jsonErr.error);
        }
      }
    } catch (err) {
      if (err.message.includes('sudah terdaftar') || err.message.includes('unik')) {
        throw err;
      }
      console.warn('Gagal menghubungi backend API, menyimpan ke LocalStorage:', err);
    }

    const newItem = {
      id: Date.now(),
      key: cleanKey,
      value: cleanValue,
      description: cleanDesc,
      createdAt: new Date().toISOString()
    };

    currentList.push(newItem);
    this._saveLocalVariables(currentList);
    this.variables = currentList;
    return newItem;
  }

  async update(id, key, value, description = '') {
    const cleanKey = this._stripHtml(key).toLowerCase().replace(/\s+/g, '');
    const cleanValue = this._stripHtml(value);
    const cleanDesc = this._stripHtml(description);

    if (!cleanKey || !cleanValue) {
      throw new Error('Nama variabel dan nilai teks output wajib diisi!');
    }

    const currentList = this._getLocalVariables();
    const duplicate = currentList.find(item => item.id != id && item.key.toLowerCase() === cleanKey);
    if (duplicate) {
      throw new Error(`Variabel "${cleanKey}" sudah digunakan! Kunci variabel harus unik.`);
    }

    try {
      const url = this._getApiUrl(`/api/variables/${id}`);
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          key: cleanKey,
          value: cleanValue,
          description: cleanDesc
        })
      });

      if (res.ok) {
        const text = await res.text();
        if (text.trim().startsWith('{')) {
          const data = JSON.parse(text);
          if (data.success && data.data) {
            await this.fetchAll();
            return data.data;
          }
        }
      }
    } catch (err) {
      if (err.message.includes('sudah digunakan') || err.message.includes('unik')) {
        throw err;
      }
      console.warn('Gagal update via backend API, memperbarui LocalStorage:', err);
    }

    const idx = currentList.findIndex(item => item.id == id);
    if (idx === -1) {
      throw new Error(`Variabel dengan ID ${id} tidak ditemukan`);
    }

    currentList[idx].key = cleanKey;
    currentList[idx].value = cleanValue;
    currentList[idx].description = cleanDesc;
    currentList[idx].updatedAt = new Date().toISOString();

    this._saveLocalVariables(currentList);
    this.variables = currentList;
    return currentList[idx];
  }

  async delete(id) {
    try {
      const url = this._getApiUrl(`/api/variables/${id}`);
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const text = await res.text();
        if (text.trim().startsWith('{')) {
          const data = JSON.parse(text);
          if (data.success) {
            await this.fetchAll();
            return true;
          }
        }
      }
    } catch (err) {
      console.warn('Gagal delete via backend API, menghapus dari LocalStorage:', err);
    }

    const currentList = this._getLocalVariables();
    const filtered = currentList.filter(item => item.id != id);
    this._saveLocalVariables(filtered);
    this.variables = filtered;
    return true;
  }

  async resetDefaults() {
    try {
      const url = this._getApiUrl('/api/variables/reset');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const text = await res.text();
        if (text.trim().startsWith('{')) {
          const data = JSON.parse(text);
          if (data.success && Array.isArray(data.data)) {
            this.variables = data.data;
            this._saveLocalVariables(data.data);
            return this.variables;
          }
        }
      }
    } catch (err) {
      console.warn('Gagal reset via backend API, reset LocalStorage:', err);
    }

    this._saveLocalVariables(this.defaultVariables);
    this.variables = [...this.defaultVariables];
    return this.variables;
  }
}

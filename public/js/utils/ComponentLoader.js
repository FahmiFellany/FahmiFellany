/**
 * ComponentLoader Utility
 * Memuat file HTML component/partial secara asynchronous untuk arsitektur front-end modular.
 */
export class ComponentLoader {
  /**
   * Load all front-end partial components into their target containers
   * @returns {Promise<void>}
   */
  static async loadAll() {
    const components = [
      { id: 'viewConverterContainer', path: 'components/converter.html' },
      { id: 'viewOcrContainer', path: 'components/ocr.html' },
      { id: 'viewSaldoContainer', path: 'components/saldo.html' },
      { id: 'viewCidEksContainer', path: 'components/cid-eks.html' },
      { id: 'variableCrudModalContainer', path: 'components/modals/variable-crud.html' },
      { id: 'saldoCrudModalContainer', path: 'components/modals/saldo-crud.html' }
    ];

    try {
      await Promise.all(
        components.map(async (item) => {
          const el = document.getElementById(item.id);
          if (!el) return;
          const res = await fetch(item.path);
          if (res.ok) {
            const html = await res.text();
            // Menyuntikkan HTML partial dan mengganti elemen pembungkus container agar DOM ID tetap presisi
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html.trim();
            const firstChild = tempDiv.firstElementChild;
            if (firstChild) {
              el.replaceWith(firstChild);
            } else {
              el.innerHTML = html;
            }
          } else {
            console.error(`Gagal memuat komponen HTML: ${item.path} (HTTP ${res.status})`);
          }
        })
      );
    } catch (err) {
      console.error('Terjadi kesalahan saat memuat komponen front-end:', err);
    }
  }
}

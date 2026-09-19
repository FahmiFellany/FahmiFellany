/**
 * TabManager Utility
 * Pengelola Navigasi Tab Global agar seluruh menu (Converter, OCR, Saldo, CID EKS, MBSB)
 * dapat berpindah secara mulus tanpa bentrok.
 */
export class TabManager {
  static init() {
    // Sembunyikan menu MBSB jika berjalan di domain GitHub Pages (github.io)
    const isGitHubPages = window.location.hostname.includes('github.io');
    const mbsbBtn = document.getElementById('navTabMbsb');
    if (mbsbBtn) {
      if (isGitHubPages) {
        mbsbBtn.style.display = 'none';
      } else {
        mbsbBtn.style.display = 'flex';
      }
    }

    const tabs = [
      { tabId: 'navTabConverter', viewId: 'viewConverter', display: 'flex' },
      { tabId: 'navTabOcr', viewId: 'viewOcr', display: 'block' },
      { tabId: 'navTabSaldo', viewId: 'viewSaldo', display: 'block' },
      { tabId: 'navTabCidEks', viewId: 'viewCidEks', display: 'block' },
      { tabId: 'navTabMbsb', viewId: 'viewMbsb', display: 'block' }
    ];

    tabs.forEach(item => {
      const tabBtn = document.getElementById(item.tabId);
      if (tabBtn) {
        tabBtn.addEventListener('click', () => {
          tabs.forEach(other => {
            const btn = document.getElementById(other.tabId);
            const view = document.getElementById(other.viewId);
            if (other.tabId === item.tabId) {
              if (btn) btn.classList.add('active');
              if (view) view.style.display = other.display;
            } else {
              if (btn) btn.classList.remove('active');
              if (view) view.style.display = 'none';
            }
          });
        });
      }
    });
  }
}

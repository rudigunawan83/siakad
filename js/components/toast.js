/**
 * SIAKAD Cakrawala — Toast Notifications Component
 */

const container = (() => {
  let el = document.getElementById('toast-container');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast-container';
    el.className = 'toast-container';
    document.body.appendChild(el);
  }
  return el;
})();

const ICONS = {
  success: 'bi-check-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  danger:  'bi-x-circle-fill',
  info:    'bi-info-circle-fill',
  gold:    'bi-star-fill',
};

export function showToast(message, type = 'info', title = '', duration = 4000) {
  const typeTitle = title || { success: 'Berhasil', warning: 'Perhatian', danger: 'Gagal', info: 'Info', gold: 'Simulasi' }[type] || 'Info';
  const icon = ICONS[type] || ICONS.info;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="bi ${icon} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${typeTitle}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close" aria-label="Tutup"><i class="bi bi-x"></i></button>
  `;

  const close = () => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector('.toast-close').addEventListener('click', close);
  container.appendChild(toast);

  if (duration > 0) setTimeout(close, duration);
  return toast;
}

export function showConfirm({ title = 'Konfirmasi', message, confirmText = 'Ya, Lanjutkan', cancelText = 'Batal', type = 'danger' } = {}) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay confirm-dialog';
    overlay.innerHTML = `
      <div class="modal-box" style="max-width:420px;text-align:center;padding:2rem">
        <div class="confirm-icon ${type === 'danger' ? 'text-danger' : type === 'warning' ? 'text-warning' : 'text-navy'}">
          <i class="bi ${type === 'danger' ? 'bi-exclamation-circle' : type === 'warning' ? 'bi-exclamation-triangle' : 'bi-question-circle'}"></i>
        </div>
        <div class="confirm-title">${title}</div>
        <div class="confirm-msg">${message}</div>
        <div style="display:flex;gap:0.75rem;justify-content:center;margin-top:1.5rem">
          <button class="btn btn-secondary" id="confirm-cancel">${cancelText}</button>
          <button class="btn btn-${type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'primary'}" id="confirm-ok">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    const close = (result) => {
      overlay.classList.remove('open');
      setTimeout(() => { overlay.remove(); resolve(result); }, 250);
    };

    overlay.querySelector('#confirm-ok').addEventListener('click', () => close(true));
    overlay.querySelector('#confirm-cancel').addEventListener('click', () => close(false));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
  });
}

/**
 * SIAKAD Cakrawala — Modal Component
 */

export function openModal(config = {}) {
  const { id = 'app-modal', title, body, footer, size = '', onOpen } = config;

  // Remove existing modal
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const sizeClass = size === 'lg' ? 'modal-box-lg' : size === 'xl' ? 'modal-box-xl' : '';
  const footerHTML = footer || `<button class="btn btn-secondary" data-modal-close>Tutup</button>`;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = id;
  overlay.innerHTML = `
    <div class="modal-box ${sizeClass}">
      <div class="modal-header">
        <h5 class="modal-title">${title || ''}</h5>
        <button class="modal-close" aria-label="Tutup" data-modal-close><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="modal-body">${body || ''}</div>
      ${footer !== false ? `<div class="modal-footer">${footerHTML}</div>` : ''}
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));

  const close = () => {
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 250);
  };

  overlay.querySelectorAll('[data-modal-close]').forEach(btn => btn.addEventListener('click', close));
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function onEsc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
  });

  if (onOpen) setTimeout(() => onOpen(overlay), 50);
  return { overlay, close };
}

export function closeModal(id = 'app-modal') {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 250);
  }
}

// ---- Generic CRUD Form Modal ----
export function openFormModal({ title, fields, values = {}, onSave, size = '' }) {
  const fieldHTML = fields.map(f => {
    const val = values[f.key] !== undefined ? values[f.key] : (f.default || '');
    const required = f.required ? '<span class="required">*</span>' : '';
    const readonly = f.readonly ? 'readonly' : '';

    if (f.type === 'select') {
      const opts = f.options.map(o =>
        `<option value="${o.value}" ${String(o.value) === String(val) ? 'selected' : ''}>${o.label}</option>`
      ).join('');
      return `
        <div class="form-group">
          <label class="form-label">${f.label}${required}</label>
          <select class="form-control form-select" name="${f.key}" ${f.required ? 'required' : ''}>
            <option value="">Pilih ${f.label}...</option>
            ${opts}
          </select>
          ${f.hint ? `<div class="form-hint">${f.hint}</div>` : ''}
        </div>`;
    }

    if (f.type === 'textarea') {
      return `
        <div class="form-group">
          <label class="form-label">${f.label}${required}</label>
          <textarea class="form-control" name="${f.key}" rows="3" ${f.required ? 'required' : ''} ${readonly}>${val}</textarea>
          ${f.hint ? `<div class="form-hint">${f.hint}</div>` : ''}
        </div>`;
    }

    return `
      <div class="form-group">
        <label class="form-label">${f.label}${required}</label>
        <input type="${f.type || 'text'}" class="form-control" name="${f.key}"
          value="${val}" ${f.required ? 'required' : ''} ${readonly}
          placeholder="${f.placeholder || ''}">
        ${f.hint ? `<div class="form-hint">${f.hint}</div>` : ''}
      </div>`;
  }).join('');

  const body = `<form id="crud-form" novalidate>${fieldHTML}</form>`;
  const footer = `
    <button class="btn btn-secondary" data-modal-close>Batal</button>
    <button class="btn btn-primary" id="modal-save-btn">
      <i class="bi bi-check2"></i> Simpan
    </button>`;

  const { overlay, close } = openModal({ title, body, footer, size });

  overlay.querySelector('#modal-save-btn').addEventListener('click', () => {
    const form = overlay.querySelector('#crud-form');
    const data = {};
    let valid = true;

    fields.forEach(f => {
      const el = form.querySelector(`[name="${f.key}"]`);
      if (!el) return;
      const v = el.value.trim();
      data[f.key] = v;
      // Validate required
      if (f.required && !v) {
        el.classList.add('is-invalid');
        valid = false;
      } else {
        el.classList.remove('is-invalid');
      }
    });

    if (!valid) {
      const { showToast } = window._siakad?.toast || {};
      if (showToast) showToast('Harap lengkapi semua field yang wajib diisi.', 'warning');
      return;
    }

    onSave(data, close);
  });

  return { overlay, close };
}

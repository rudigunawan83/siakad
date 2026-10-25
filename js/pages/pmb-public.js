/**
 * SIAKAD — Halaman Publik PMB (Daftar Online Calon Mahasiswa)
 * Route: #/pmb, #/pmb/daftar, #/pmb/status
 */

import { DB } from '../data/seed.js';
import { formatDate, generateId, today, statusBadge } from '../utils.js';
import { showToast } from '../components/toast.js';

const PATHS = ['Jalur Reguler', 'Jalur Prestasi', 'Jalur Beasiswa'];
const DOCS = [
  { id: 'ktp', label: 'KTP / Kartu Identitas' },
  { id: 'ijazah', label: 'Ijazah / Surat Keterangan Lulus' },
  { id: 'foto', label: 'Pas foto 3×4' },
  { id: 'prestasi', label: 'Sertifikat prestasi (opsional untuk jalur prestasi)' },
];

const formState = {
  step: 1,
  name: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  campusId: '',
  prodiId: '',
  path: 'Jalur Reguler',
  docs: { ktp: false, ijazah: false, foto: false, prestasi: false },
  agree: false,
};

export function renderPmbPublic(path, container) {
  document.getElementById('app-shell')?.classList.add('public-shell');

  const clean = (path || '/pmb').split('?')[0].replace(/\/$/, '') || '/pmb';

  if (clean.includes('/status')) {
    renderStatusPage(container);
    return;
  }
  if (clean.includes('/daftar')) {
    renderRegisterPage(container);
    return;
  }
  // #/pmb atau #/pmb/ → beranda informasi (bukan formulir)
  renderLanding(container);
}

function renderPublicChrome(active) {
  return `
  <header class="pmb-public-header">
    <div class="pmb-public-brand">
      <img src="assets/logo.svg" alt="" width="36" height="36" aria-hidden="true">
      <div>
        <div class="pmb-public-brand-title">SIAKAD Cakrawala</div>
        <div class="pmb-public-brand-sub">Penerimaan Mahasiswa Baru 2026/2027</div>
      </div>
    </div>
    <nav class="pmb-public-nav" aria-label="Navigasi PMB">
      <a href="#/pmb" class="${active === 'home' ? 'active' : ''}">Beranda</a>
      <a href="#/pmb/daftar" class="${active === 'daftar' ? 'active' : ''}">Daftar Online</a>
      <a href="#/pmb/status" class="${active === 'status' ? 'active' : ''}">Cek Status</a>
      <a href="#/dashboard/foundation" class="pmb-public-nav-app">Masuk Aplikasi Demo</a>
    </nav>
  </header>`;
}

function renderLanding(container) {
  const campuses = DB.getAll('campuses');
  const foundation = DB.get('foundation') || { name: 'Yayasan Cakrawala Pendidikan', shortName: 'YCP' };
  container.innerHTML = `
<div class="pmb-public">
  ${renderPublicChrome('home')}
  <section class="pmb-hero">
    <div class="pmb-hero-inner">
      <p class="pmb-eyebrow">${escHtml(foundation.name)} · Periode PMB 2026/2027</p>
      <h1 class="pmb-hero-title">SIAKAD Cakrawala</h1>
      <p class="pmb-hero-lead">Penerimaan Mahasiswa Baru</p>
      <p class="pmb-hero-desc">Daftar online, simpan nomor pendaftaran, lalu pantau status verifikasi. Prototype demo — tanpa pembayaran atau unggah berkas sungguhan.</p>
      <div class="pmb-hero-actions">
        <a href="#/pmb/daftar" class="btn btn-accent btn-lg"><i class="bi bi-pencil-square"></i> Mulai Daftar</a>
        <a href="#/pmb/status" class="btn btn-secondary btn-lg"><i class="bi bi-search"></i> Cek Status</a>
      </div>
    </div>
  </section>
  <section class="pmb-section">
    <h2 class="pmb-section-title">Kampus yang dibuka</h2>
    <p class="pmb-section-desc">Pilih kampus pada formulir Daftar Online sesuai minat Anda.</p>
    <div class="pmb-campus-grid">
      ${campuses.map(c => `
        <article class="pmb-campus-card">
          <div class="pmb-campus-code">${escHtml(c.code)}</div>
          <h3>${escHtml(c.name)}</h3>
          <p>${escHtml(c.city)} · Akreditasi ${escHtml(c.accreditation)}</p>
        </article>`).join('')}
    </div>
  </section>
  <section class="pmb-section">
    <h2 class="pmb-section-title">Alur singkat</h2>
    <ol class="pmb-steps-list">
      <li>Isi data diri dan pilihan program studi</li>
      <li>Konfirmasi berkas (simulasi checklist)</li>
      <li>Terima nomor pendaftaran unik</li>
      <li>Petugas memverifikasi di modul PMB</li>
    </ol>
  </section>
  <footer class="pmb-public-footer">
    Prototype SIAKAD Cakrawala · Data fiktif · Tidak ada transaksi nyata
  </footer>
</div>`;
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderRegisterPage(container) {
  formState.step = Math.min(Math.max(formState.step, 1), 4);
  container.innerHTML = `
<div class="pmb-public">
  ${renderPublicChrome('daftar')}
  <div class="pmb-form-wrap">
    <div class="pmb-form-card">
      <h1 class="pmb-form-title">Formulir Daftar Online</h1>
      <p class="pmb-form-desc">Tahun Akademik 2026/2027 · Gelombang demo terbuka</p>
      ${renderStepper(formState.step)}
      <div id="pmb-error-summary" class="pmb-error-summary" role="alert" tabindex="-1" hidden></div>
      <div id="pmb-form-body">${renderStepBody(formState.step)}</div>
      <div class="pmb-form-actions">
        ${formState.step > 1 ? `<button type="button" class="btn btn-secondary" id="pmb-prev"><i class="bi bi-arrow-left"></i> Kembali</button>` : `<span></span>`}
        ${formState.step < 4
          ? `<button type="button" class="btn btn-accent" id="pmb-next">Lanjut <i class="bi bi-arrow-right"></i></button>`
          : `<button type="button" class="btn btn-accent" id="pmb-submit"><i class="bi bi-send"></i> Kirim Pendaftaran</button>`}
      </div>
    </div>
  </div>
  <footer class="pmb-public-footer">Prototype demo · Berkas tidak diunggah ke server</footer>
</div>`;
  bindRegisterEvents(container);
}

function renderStepper(step) {
  const items = [
    { n: 1, label: 'Data Diri' },
    { n: 2, label: 'Pilihan Prodi' },
    { n: 3, label: 'Berkas' },
    { n: 4, label: 'Konfirmasi' },
  ];
  return `
  <ol class="pmb-stepper" aria-label="Tahapan formulir">
    ${items.map(i => `
      <li class="pmb-stepper-item ${i.n < step ? 'done' : ''} ${i.n === step ? 'active' : ''}">
        <span class="pmb-stepper-num" aria-hidden="true">${i.n < step ? '<i class="bi bi-check2"></i>' : i.n}</span>
        <span class="pmb-stepper-label">${i.label}</span>
      </li>`).join('')}
  </ol>`;
}

function renderStepBody(step) {
  if (step === 1) return renderStepIdentity();
  if (step === 2) return renderStepProgram();
  if (step === 3) return renderStepDocs();
  return renderStepReview();
}

function renderStepIdentity() {
  return `
  <fieldset class="pmb-fieldset">
    <legend class="visually-hidden">Data diri</legend>
    <div class="pmb-field-grid">
      <div class="pmb-field">
        <label for="pmb-name">Nama lengkap <span aria-hidden="true">*</span></label>
        <input id="pmb-name" name="name" type="text" autocomplete="name" required value="${esc(formState.name)}" placeholder="Sesuai ijazah">
      </div>
      <div class="pmb-field">
        <label for="pmb-email">Email <span aria-hidden="true">*</span></label>
        <input id="pmb-email" name="email" type="email" autocomplete="email" required value="${esc(formState.email)}" placeholder="nama@email.com">
      </div>
      <div class="pmb-field">
        <label for="pmb-phone">Nomor HP / WhatsApp <span aria-hidden="true">*</span></label>
        <input id="pmb-phone" name="phone" type="tel" autocomplete="tel" required value="${esc(formState.phone)}" placeholder="08xxxxxxxxxx">
      </div>
      <div class="pmb-field">
        <label for="pmb-dob">Tanggal lahir <span aria-hidden="true">*</span></label>
        <input id="pmb-dob" name="dob" type="date" required value="${esc(formState.dob)}">
      </div>
      <div class="pmb-field">
        <label for="pmb-gender">Jenis kelamin <span aria-hidden="true">*</span></label>
        <select id="pmb-gender" name="gender" required>
          <option value="">Pilih</option>
          <option value="L" ${formState.gender === 'L' ? 'selected' : ''}>Laki-laki</option>
          <option value="P" ${formState.gender === 'P' ? 'selected' : ''}>Perempuan</option>
        </select>
      </div>
    </div>
  </fieldset>`;
}

function renderStepProgram() {
  const campuses = DB.getAll('campuses');
  const prodis = DB.getAll('studyPrograms').filter(p => !formState.campusId || p.campusId === formState.campusId);
  return `
  <fieldset class="pmb-fieldset">
    <legend class="visually-hidden">Pilihan program</legend>
    <div class="pmb-field-grid">
      <div class="pmb-field">
        <label for="pmb-campus">Kampus <span aria-hidden="true">*</span></label>
        <select id="pmb-campus" name="campusId" required>
          <option value="">Pilih kampus</option>
          ${campuses.map(c => `<option value="${c.id}" ${formState.campusId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="pmb-field">
        <label for="pmb-prodi">Program studi <span aria-hidden="true">*</span></label>
        <select id="pmb-prodi" name="prodiId" required ${formState.campusId ? '' : 'disabled'}>
          <option value="">${formState.campusId ? 'Pilih program studi' : 'Pilih kampus terlebih dahulu'}</option>
          ${prodis.map(p => `<option value="${p.id}" ${formState.prodiId === p.id ? 'selected' : ''}>${p.degree} ${p.name} (${p.code})</option>`).join('')}
        </select>
      </div>
      <div class="pmb-field pmb-field-full">
        <span class="pmb-label">Jalur masuk <span aria-hidden="true">*</span></span>
        <div class="pmb-path-options" role="radiogroup" aria-label="Jalur masuk">
          ${PATHS.map(p => `
            <label class="pmb-path-option ${formState.path === p ? 'selected' : ''}">
              <input type="radio" name="path" value="${p}" ${formState.path === p ? 'checked' : ''}>
              <span>${p}</span>
            </label>`).join('')}
        </div>
      </div>
    </div>
  </fieldset>`;
}

function renderStepDocs() {
  return `
  <fieldset class="pmb-fieldset">
    <legend class="pmb-legend">Konfirmasi berkas (simulasi)</legend>
    <p class="pmb-hint">Prototype tidak mengunggah file. Centang berkas yang siap Anda siapkan. Unggah sungguhan akan tersedia pada sistem produksi.</p>
    <div class="pmb-doc-list">
      ${DOCS.map(d => `
        <label class="pmb-doc-item">
          <input type="checkbox" data-doc="${d.id}" ${formState.docs[d.id] ? 'checked' : ''}>
          <span>${d.label}</span>
        </label>`).join('')}
    </div>
    <div class="info-box" style="margin-top:1rem">
      <i class="bi bi-info-circle"></i>
      Biaya pendaftaran demo: <strong>Rp 250.000</strong> (simulasi). Status pembayaran awal: belum bayar.
    </div>
  </fieldset>`;
}

function renderStepReview() {
  const campus = DB.getById('campuses', formState.campusId);
  const prodi = DB.getById('studyPrograms', formState.prodiId);
  const docsReady = DOCS.filter(d => formState.docs[d.id]).map(d => d.label);
  return `
  <div class="pmb-review">
    <h2 class="pmb-review-title">Periksa data sebelum dikirim</h2>
    <dl class="pmb-review-list">
      <div><dt>Nama</dt><dd>${esc(formState.name)}</dd></div>
      <div><dt>Email</dt><dd>${esc(formState.email)}</dd></div>
      <div><dt>HP</dt><dd>${esc(formState.phone)}</dd></div>
      <div><dt>Tanggal lahir</dt><dd>${formState.dob ? formatDate(formState.dob) : '-'}</dd></div>
      <div><dt>Jenis kelamin</dt><dd>${formState.gender === 'L' ? 'Laki-laki' : formState.gender === 'P' ? 'Perempuan' : '-'}</dd></div>
      <div><dt>Kampus</dt><dd>${campus?.name || '-'}</dd></div>
      <div><dt>Program studi</dt><dd>${prodi ? `${prodi.degree} ${prodi.name}` : '-'}</dd></div>
      <div><dt>Jalur</dt><dd>${esc(formState.path)}</dd></div>
      <div><dt>Berkas siap</dt><dd>${docsReady.length ? docsReady.join(', ') : 'Belum ada yang dicentang'}</dd></div>
    </dl>
    <label class="pmb-agree">
      <input type="checkbox" id="pmb-agree" ${formState.agree ? 'checked' : ''}>
      <span>Saya menyatakan data di atas benar dan memahami ini adalah pendaftaran demo prototype.</span>
    </label>
  </div>`;
}

function bindRegisterEvents(container) {
  container.querySelector('#pmb-campus')?.addEventListener('change', (e) => {
    collectForm(container);
    formState.campusId = e.target.value;
    formState.prodiId = '';
    container.querySelector('#pmb-form-body').innerHTML = renderStepBody(2);
    bindRegisterEvents(container);
  });

  container.querySelectorAll('input[name="path"]').forEach(el => {
    el.addEventListener('change', () => {
      formState.path = el.value;
      container.querySelectorAll('.pmb-path-option').forEach(opt => {
        opt.classList.toggle('selected', opt.querySelector('input')?.checked);
      });
    });
  });

  container.querySelector('#pmb-prev')?.addEventListener('click', () => {
    collectForm(container);
    formState.step = Math.max(1, formState.step - 1);
    renderRegisterPage(container);
  });

  container.querySelector('#pmb-next')?.addEventListener('click', () => {
    collectForm(container);
    const errors = validateStep(formState.step);
    if (errors.length) {
      showErrors(container, errors);
      return;
    }
    clearErrors(container);
    formState.step = Math.min(4, formState.step + 1);
    renderRegisterPage(container);
  });

  container.querySelector('#pmb-submit')?.addEventListener('click', () => {
    collectForm(container);
    const errors = [...validateStep(1), ...validateStep(2), ...validateStep(3), ...validateStep(4)];
    if (errors.length) {
      showErrors(container, errors);
      return;
    }
    const record = submitApplication();
    renderSuccess(container, record);
  });
}

function collectForm(container) {
  const g = (id) => container.querySelector(`#${id}`)?.value?.trim() ?? '';
  if (container.querySelector('#pmb-name')) {
    formState.name = g('pmb-name');
    formState.email = g('pmb-email');
    formState.phone = g('pmb-phone');
    formState.dob = g('pmb-dob');
    formState.gender = g('pmb-gender');
  }
  if (container.querySelector('#pmb-campus')) {
    formState.campusId = g('pmb-campus');
    formState.prodiId = g('pmb-prodi');
    const path = container.querySelector('input[name="path"]:checked')?.value;
    if (path) formState.path = path;
  }
  container.querySelectorAll('[data-doc]').forEach(cb => {
    formState.docs[cb.dataset.doc] = cb.checked;
  });
  if (container.querySelector('#pmb-agree')) {
    formState.agree = container.querySelector('#pmb-agree').checked;
  }
}

function validateStep(step) {
  const errors = [];
  if (step === 1) {
    if (!formState.name) errors.push({ id: 'pmb-name', msg: 'Nama lengkap wajib diisi.' });
    if (!formState.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      errors.push({ id: 'pmb-email', msg: 'Email tidak valid.' });
    }
    if (!formState.phone || formState.phone.replace(/\D/g, '').length < 10) {
      errors.push({ id: 'pmb-phone', msg: 'Nomor HP minimal 10 digit.' });
    }
    if (!formState.dob) errors.push({ id: 'pmb-dob', msg: 'Tanggal lahir wajib diisi.' });
    if (!formState.gender) errors.push({ id: 'pmb-gender', msg: 'Jenis kelamin wajib dipilih.' });
  }
  if (step === 2) {
    if (!formState.campusId) errors.push({ id: 'pmb-campus', msg: 'Kampus wajib dipilih.' });
    if (!formState.prodiId) errors.push({ id: 'pmb-prodi', msg: 'Program studi wajib dipilih.' });
    if (!formState.path) errors.push({ id: 'pmb-campus', msg: 'Jalur masuk wajib dipilih.' });
  }
  if (step === 3) {
    if (!formState.docs.ktp || !formState.docs.ijazah || !formState.docs.foto) {
      errors.push({ id: null, msg: 'Centang minimal KTP, ijazah/SKL, dan pas foto.' });
    }
    if (formState.path === 'Jalur Prestasi' && !formState.docs.prestasi) {
      errors.push({ id: null, msg: 'Jalur Prestasi memerlukan konfirmasi sertifikat prestasi.' });
    }
  }
  if (step === 4) {
    if (!formState.agree) errors.push({ id: 'pmb-agree', msg: 'Anda harus menyetujui pernyataan data benar.' });
  }
  return errors;
}

function showErrors(container, errors) {
  const box = container.querySelector('#pmb-error-summary');
  if (!box) return;
  box.hidden = false;
  box.innerHTML = `
    <h2 id="pmb-error-title">Periksa isian berikut</h2>
    <ul>${errors.map(e => `<li>${e.id ? `<a href="#${e.id}">${e.msg}</a>` : e.msg}</li>`).join('')}</ul>`;
  box.focus();
  showToast(errors[0].msg, 'warning');
}

function clearErrors(container) {
  const box = container.querySelector('#pmb-error-summary');
  if (box) {
    box.hidden = true;
    box.innerHTML = '';
  }
}

function nextRegNum() {
  const list = DB.getAll('admissions');
  let max = 0;
  list.forEach(a => {
    const m = String(a.regNum || '').match(/PMB-2026-(\d+)/i);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return `PMB-2026-${String(max + 1).padStart(4, '0')}`;
}

function submitApplication() {
  const prodi = DB.getById('studyPrograms', formState.prodiId);
  const record = {
    id: generateId('adm'),
    regNum: nextRegNum(),
    name: formState.name,
    email: formState.email,
    phone: formState.phone,
    dob: formState.dob,
    gender: formState.gender,
    campusId: formState.campusId,
    prodiId: formState.prodiId,
    prodiName: prodi?.name || '',
    path: formState.path,
    date: today(),
    docStatus: 'menunggu verifikasi',
    selectionStatus: '-',
    paymentStatus: 'belum bayar',
    status: 'dikirim',
    source: 'daftar-online',
    docsConfirmed: { ...formState.docs },
  };
  DB.add('admissions', record);
  DB.log('PMB: Daftar Online', 'PMB', `${record.name} (${record.regNum})`);
  const notifs = DB.getAll('notifications');
  notifs.unshift({
    id: generateId('notif'),
    type: 'pmb',
    title: 'Pendaftar baru dari Daftar Online',
    message: `${record.name} (${record.regNum}) menunggu verifikasi.`,
    time: new Date().toISOString(),
    read: false,
    link: '#/admissions/applicants',
    role: ['Staf PMB', 'Admin Yayasan', 'Admin Kampus'],
  });
  DB.save('notifications', notifs.slice(0, 50));

  Object.assign(formState, {
    step: 1, name: '', email: '', phone: '', dob: '', gender: '',
    campusId: '', prodiId: '', path: 'Jalur Reguler',
    docs: { ktp: false, ijazah: false, foto: false, prestasi: false }, agree: false,
  });
  showToast(`Pendaftaran berhasil. Nomor: ${record.regNum}`, 'success');
  return record;
}

function renderSuccess(container, record) {
  container.innerHTML = `
<div class="pmb-public">
  ${renderPublicChrome('daftar')}
  <div class="pmb-form-wrap">
    <div class="pmb-form-card pmb-success-card">
      <div class="pmb-success-icon" aria-hidden="true"><i class="bi bi-check-circle-fill"></i></div>
      <h1 class="pmb-form-title">Pendaftaran terkirim</h1>
      <p class="pmb-form-desc">Simpan nomor pendaftaran berikut untuk cek status.</p>
      <div class="pmb-regnum" role="status">${record.regNum}</div>
      <dl class="pmb-review-list">
        <div><dt>Nama</dt><dd>${esc(record.name)}</dd></div>
        <div><dt>Program studi</dt><dd>${esc(record.prodiName)}</dd></div>
        <div><dt>Jalur</dt><dd>${esc(record.path)}</dd></div>
        <div><dt>Status</dt><dd>${statusBadge(record.status)}</dd></div>
      </dl>
      <div class="pmb-form-actions" style="justify-content:center;gap:0.75rem">
        <a href="#/pmb/status?no=${encodeURIComponent(record.regNum)}" class="btn btn-accent"><i class="bi bi-search"></i> Cek Status</a>
        <a href="#/pmb/daftar" class="btn btn-secondary">Daftar lagi</a>
      </div>
      <p class="pmb-hint" style="text-align:center;margin-top:1rem">Petugas dapat melihat data ini di menu PMB → Daftar Pendaftar.</p>
    </div>
  </div>
</div>`;
}

function renderStatusPage(container) {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const initial = params.get('no') || '';
  container.innerHTML = `
<div class="pmb-public">
  ${renderPublicChrome('status')}
  <div class="pmb-form-wrap">
    <div class="pmb-form-card">
      <h1 class="pmb-form-title">Cek Status Pendaftaran</h1>
      <p class="pmb-form-desc">Masukkan nomor pendaftaran (contoh: PMB-2026-0001)</p>
      <form id="pmb-status-form" class="pmb-status-form" novalidate>
        <div class="pmb-field">
          <label for="pmb-status-no">Nomor pendaftaran</label>
          <input id="pmb-status-no" type="text" value="${esc(initial)}" placeholder="PMB-2026-xxxx" autocomplete="off" required>
        </div>
        <button type="submit" class="btn btn-accent"><i class="bi bi-search"></i> Cari</button>
      </form>
      <div id="pmb-status-result"></div>
    </div>
  </div>
  <footer class="pmb-public-footer">Prototype demo</footer>
</div>`;

  const form = container.querySelector('#pmb-status-form');
  const result = container.querySelector('#pmb-status-result');
  const run = (no) => {
    const q = (no || '').trim().toUpperCase();
    if (!q) {
      result.innerHTML = `<div class="pmb-error-summary" role="alert"><p>Masukkan nomor pendaftaran.</p></div>`;
      return;
    }
    const item = DB.getAll('admissions').find(a => String(a.regNum).toUpperCase() === q);
    if (!item) {
      result.innerHTML = `<div class="empty-state" style="padding:2rem 0">
        <div class="empty-state-icon"><i class="bi bi-search"></i></div>
        <div class="empty-state-title">Tidak ditemukan</div>
        <div class="empty-state-desc">Nomor ${esc(q)} tidak ada di data demo.</div>
      </div>`;
      return;
    }
    const campus = DB.getById('campuses', item.campusId);
    result.innerHTML = `
      <div class="pmb-status-card">
        <div class="pmb-regnum" style="font-size:1.25rem">${item.regNum}</div>
        <dl class="pmb-review-list">
          <div><dt>Nama</dt><dd>${esc(item.name)}</dd></div>
          <div><dt>Kampus</dt><dd>${campus?.name || '-'}</dd></div>
          <div><dt>Program studi</dt><dd>${esc(item.prodiName)}</dd></div>
          <div><dt>Jalur</dt><dd>${esc(item.path)}</dd></div>
          <div><dt>Tanggal daftar</dt><dd>${formatDate(item.date)}</dd></div>
          <div><dt>Status dokumen</dt><dd>${statusBadge(item.docStatus)}</dd></div>
          <div><dt>Status seleksi</dt><dd>${statusBadge(item.selectionStatus)}</dd></div>
          <div><dt>Pembayaran</dt><dd>${statusBadge(item.paymentStatus)}</dd></div>
          <div><dt>Status pendaftaran</dt><dd>${statusBadge(item.status)}</dd></div>
        </dl>
      </div>`;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run(container.querySelector('#pmb-status-no').value);
  });
  if (initial) run(initial);
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

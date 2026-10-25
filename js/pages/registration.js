/**
 * SIAKAD â€” Registrasi Semester
 * Portal mahasiswa (8.2) + antrean BAAK (7.7)
 */

import { DB } from '../data/seed.js';
import { AppState } from '../state.js?v=20261025ab';
import { formatDate, formatDateTime, generateId, statusBadge } from '../utils.js';
import { showToast, showConfirm } from '../components/toast.js';
import { openModal, openFormModal } from '../components/modal.js';
import { DataTable } from '../components/data-table.js';
import { scopeRows, scopeStudyPrograms } from '../campus-scope.js';

const SEM_ID = 'sem-1';

const DEFAULT_POLICY = {
  requireRegistrationBeforeKrs: true,
  financeRule: 'none',
  requireStaffValidation: true,
  allowRetryAfterReject: true,
  allowStaffCancel: true,
  allowRetryAfterCancel: false,
  periodOpen: true,
  periodStart: '2026-08-01',
  periodEnd: '2026-09-15',
};

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getPolicy() {
  return { ...DEFAULT_POLICY, ...(DB.get('registrationPolicy') || {}) };
}

function savePolicy(policy) {
  DB.save('registrationPolicy', policy);
}

function getStudent() {
  const role = AppState.currentRole;
  return DB.getAll('students').find(s => s.id === (role.studentId || 'stu-1'));
}

function getSemester(id = SEM_ID) {
  return DB.getById('semesters', id);
}

function getOrCreateReg(studentId, semesterId = SEM_ID) {
  const list = DB.getAll('semesterRegistrations');
  let reg = list.find(r => r.studentId === studentId && r.semesterId === semesterId);
  if (!reg) {
    reg = {
      id: generateId('sreg'),
      studentId,
      semesterId,
      status: 'Belum Registrasi',
      submittedAt: null,
      updatedAt: null,
      note: '',
      staffId: null,
      dispensationRef: null,
      history: [],
    };
    list.push(reg);
    DB.save('semesterRegistrations', list);
  }
  if (!reg.history) reg.history = [];
  return reg;
}

function saveReg(reg) {
  const list = DB.getAll('semesterRegistrations');
  const idx = list.findIndex(r => r.id === reg.id);
  if (idx >= 0) list[idx] = reg;
  else list.push(reg);
  DB.save('semesterRegistrations', list);
}

function pushHistory(reg, from, to, by, note = '') {
  reg.history = reg.history || [];
  reg.history.push({ at: new Date().toISOString(), from, to, by, note });
  reg.updatedAt = new Date().toISOString();
}

function financeCheck(student, policy, reg) {
  const rule = policy.financeRule || 'none';
  if (rule === 'none') {
    return { ok: true, label: 'Tidak diwajibkan', tone: 'muted', detail: 'Kebijakan demo tidak mewajibkan kewajiban keuangan.' };
  }
  if (reg?.dispensationRef) {
    return { ok: true, label: 'Dispensasi tercatat', tone: 'success', detail: `Rujukan: ${reg.dispensationRef}` };
  }
  const invoices = DB.getAll('invoices').filter(i => i.studentId === student.id);
  if (!invoices.length) {
    return { ok: false, label: 'Belum dapat diperiksa', tone: 'muted', detail: 'Belum ada catatan tagihan untuk diperiksa.' };
  }
  const unpaid = invoices.filter(i => (i.remaining || 0) > 0 && i.status !== 'dibatalkan');
  if (rule === 'paid') {
    if (unpaid.length) {
      return {
        ok: false,
        label: 'Belum terpenuhi',
        tone: 'danger',
        detail: `${unpaid.length} tagihan belum lunas.`,
        link: '#/portal/student/finance/invoices',
      };
    }
    return { ok: true, label: 'Terpenuhi', tone: 'success', detail: 'Kewajiban keuangan tercatat lunas.' };
  }
  if (rule === 'dispensation') {
    if (!unpaid.length) {
      return { ok: true, label: 'Terpenuhi', tone: 'success', detail: 'Kewajiban keuangan tercatat lunas.' };
    }
    return {
      ok: false,
      label: 'Belum terpenuhi',
      tone: 'danger',
      detail: 'Perlu pelunasan atau dispensasi tercatat.',
      link: '#/portal/student/finance/invoices',
    };
  }
  return { ok: false, label: 'Belum dapat diperiksa', tone: 'muted', detail: 'Aturan keuangan tidak dikenali.' };
}

function academicCheck(student) {
  if (!student) {
    return { ok: false, label: 'Belum dapat diperiksa', tone: 'muted', detail: 'Data mahasiswa tidak ditemukan.' };
  }
  if (student.status === 'aktif') {
    return { ok: true, label: 'Terpenuhi', tone: 'success', detail: 'Status akademik Aktif.' };
  }
  return {
    ok: false,
    label: 'Belum terpenuhi',
    tone: 'danger',
    detail: `Status akademik "${student.status}" tidak mengizinkan registrasi (demo: hanya Aktif).`,
  };
}

function buildRequirements(student, policy, reg) {
  const acad = academicCheck(student);
  const fin = financeCheck(student, policy, reg);
  const period = {
    ok: !!policy.periodOpen,
    label: policy.periodOpen ? 'Terpenuhi' : 'Belum terpenuhi',
    tone: policy.periodOpen ? 'success' : 'danger',
    detail: policy.periodOpen
      ? `Periode terbuka (${formatDate(policy.periodStart)} – ${formatDate(policy.periodEnd)}).`
      : `Periode ditutup (${formatDate(policy.periodStart)} – ${formatDate(policy.periodEnd)}).`,
  };
  return [
    { id: 'academic', name: 'Status akademik Aktif', ...acad },
    { id: 'finance', name: 'Kewajiban keuangan', ...fin },
    { id: 'period', name: 'Periode registrasi terbuka', ...period },
  ];
}

function canSubmit(student, policy, reg) {
  const reqs = buildRequirements(student, policy, reg);
  const blocking = reqs.filter(r => !r.ok);
  const status = reg.status;
  if (['Menunggu Validasi', 'Teregistrasi', 'Menunggu Pembayaran'].includes(status)) {
    return { ok: false, reason: `Status saat ini: ${status}`, blocking };
  }
  if (status === 'Dibatalkan' && !policy.allowRetryAfterCancel) {
    return { ok: false, reason: 'Ajuan ulang setelah batal tidak diizinkan kebijakan demo.', blocking };
  }
  if (status === 'Ditolak' && !policy.allowRetryAfterReject) {
    return { ok: false, reason: 'Ajuan ulang setelah ditolak tidak diizinkan kebijakan demo.', blocking };
  }
  if (!policy.periodOpen) {
    return { ok: false, reason: 'Periode registrasi ditutup.', blocking };
  }
  if (blocking.length) {
    return { ok: false, reason: 'Masih ada syarat yang belum terpenuhi.', blocking };
  }
  return { ok: true, reason: '', blocking: [] };
}

function nextStatusOnSubmit(policy, financeOk) {
  const rule = policy.financeRule || 'none';
  if (rule !== 'none' && !financeOk) return 'Menunggu Pembayaran';
  if (policy.requireStaffValidation) return 'Menunggu Validasi';
  return 'Teregistrasi';
}

function policySummary(policy) {
  const finLabel = { none: 'tidak diwajibkan', paid: 'wajib lunas', dispensation: 'lunas atau dispensasi' };
  return [
    `Registrasi sebelum KRS: ${policy.requireRegistrationBeforeKrs ? 'wajib' : 'tidak wajib'}`,
    `Keuangan: ${finLabel[policy.financeRule] || policy.financeRule}`,
    `Validasi petugas: ${policy.requireStaffValidation ? 'wajib' : 'tidak wajib'}`,
    `Ajuan ulang setelah ditolak: ${policy.allowRetryAfterReject ? 'diizinkan' : 'tidak diizinkan'}`,
    `Batal oleh petugas: ${policy.allowStaffCancel ? 'diizinkan' : 'tidak diizinkan'}`,
  ];
}

function krsBlocksCancel(studentId, semesterId) {
  const plan = DB.getAll('krsPlans').find(p => p.studentId === studentId && p.semesterId === semesterId);
  if (!plan) return false;
  return !['Belum Dibuat', 'Draft'].includes(plan.status);
}

// ===================== PORTAL MAHASISWA =====================

export function renderStudentRegistration(path, container) {
  const historyOnly = path.includes('/history');
  const student = getStudent();
  if (!student) {
    container.innerHTML = '<div class="page-container"><p>Data mahasiswa tidak ditemukan.</p></div>';
    return;
  }

  const policy = getPolicy();
  const semester = getSemester();
  const prodi = DB.getById('studyPrograms', student.prodiId);
  const campus = DB.getById('campuses', student.campusId);
  const reg = getOrCreateReg(student.id);
  const reqs = buildRequirements(student, policy, reg);
  const submitGate = canSubmit(student, policy, reg);
  const fin = financeCheck(student, policy, reg);

  if (historyOnly) {
    renderHistoryPage(container, student, prodi, campus);
    return;
  }

  const primaryBtn = buildPrimaryButton(reg, policy, submitGate, fin);

  container.innerHTML = `
<div class="page-container reg-page">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Registrasi Semester</h1>
      <p class="page-desc">Periksa syarat dan ajukan registrasi untuk semester berjalan</p>
    </div>
    <div class="page-actions">
      <a href="#/portal/student/registration/history" class="btn btn-secondary"><i class="bi bi-clock-history"></i> Riwayat</a>
      <a href="#/portal/student" class="btn btn-secondary"><i class="bi bi-house"></i> Portal</a>
    </div>
  </div>

  <div class="reg-identity card" style="margin-bottom:1rem">
    <div class="card-body" style="display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;justify-content:space-between">
      <div>
        <div class="reg-identity-name">${esc(student.name)}</div>
        <div class="reg-identity-sub">${esc(student.nim)} · ${esc(prodi?.name || '-')} · ${esc(campus?.code || '-')}</div>
        <div style="margin-top:0.5rem;display:flex;flex-wrap:wrap;gap:0.4rem">
          ${statusBadge(student.status)}
          <span class="badge badge-navy">Angkatan ${student.angkatan}</span>
          <span class="badge badge-gold">Semester ${student.semester}</span>
        </div>
      </div>
      <div class="reg-context">
        <div class="reg-context-label">Semester aktif</div>
        <div class="reg-context-value">${esc(semester?.name || 'Ganjil 2026/2027')}</div>
        <div class="reg-context-meta">Periode: ${formatDate(policy.periodStart)} – ${formatDate(policy.periodEnd)}
          ${policy.periodOpen ? '<span class="badge badge-success ms-1">Terbuka</span>' : '<span class="badge badge-danger ms-1">Ditutup</span>'}
        </div>
      </div>
      <div class="reg-status-block">
        <div class="reg-context-label">Status registrasi</div>
        <div>${statusBadge(reg.status)}</div>
        ${reg.note && ['Ditolak', 'Dibatalkan'].includes(reg.status) ? `<div class="reg-note-alert" role="alert">${esc(reg.note)}</div>` : ''}
      </div>
    </div>
  </div>

  <div class="reg-layout">
    <div>
      <div class="card" style="margin-bottom:1rem">
        <div class="card-header"><h3 class="card-title">Daftar syarat</h3></div>
        <div class="card-body-sm">
          ${reqs.map(r => `
            <div class="reg-req-row">
              <div class="reg-req-main">
                <div class="reg-req-name">${esc(r.name)}</div>
                <div class="reg-req-detail">${esc(r.detail)}${r.link ? ` <a href="${r.link}">Buka halaman terkait</a>` : ''}</div>
              </div>
              <span class="badge badge-${r.tone === 'success' ? 'success' : r.tone === 'danger' ? 'danger' : 'muted'}">${esc(r.label)}</span>
            </div>`).join('')}
        </div>
      </div>

      ${submitGate.blocking.length ? `
      <div class="card" style="margin-bottom:1rem" role="alert">
        <div class="card-header"><h3 class="card-title">Yang masih perlu dilakukan</h3></div>
        <div class="card-body-sm">
          <ul class="reg-todo-list">
            ${submitGate.blocking.map(b => `<li>${esc(b.name)} â€” ${esc(b.detail)}${b.link ? ` (<a href="${b.link}">selesaikan</a>)` : ''}</li>`).join('')}
          </ul>
        </div>
      </div>` : ''}

      <div class="card">
        <div class="card-header"><h3 class="card-title">Riwayat status semester ini</h3></div>
        <div class="scroll-x">
          <table class="data-table">
            <thead><tr><th>Waktu</th><th>Dari</th><th>Ke</th><th>Oleh</th><th>Catatan</th></tr></thead>
            <tbody>
              ${(reg.history || []).length
                ? [...reg.history].reverse().map(h => `<tr>
                    <td>${formatDateTime(h.at)}</td>
                    <td>${esc(h.from)}</td>
                    <td>${esc(h.to)}</td>
                    <td>${esc(h.by)}</td>
                    <td>${esc(h.note || 'â€”')}</td>
                  </tr>`).join('')
                : `<tr><td colspan="5"><div class="empty-state" style="padding:1rem"><div class="empty-state-desc">Belum ada perubahan status.</div></div></td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <aside class="reg-aside">
      <div class="card" style="margin-bottom:1rem">
        <div class="card-header"><h3 class="card-title">Kewajiban keuangan</h3></div>
        <div class="card-body">
          <div style="margin-bottom:0.5rem">${statusBadge(fin.label)}</div>
          <p style="font-size:var(--text-sm);color:var(--color-muted);margin:0">${esc(fin.detail)}</p>
        </div>
      </div>

      <div class="card" style="margin-bottom:1rem">
        <div class="card-header"><h3 class="card-title">Kebijakan demo aktif</h3></div>
        <div class="card-body-sm">
          <ul class="reg-policy-list">
            ${policySummary(policy).map(t => `<li>${esc(t)}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3 class="card-title">Aksi</h3></div>
        <div class="card-body reg-actions">
          ${primaryBtn.html}
          ${['Belum Registrasi', 'Draft', 'Ditolak'].includes(reg.status) && policy.periodOpen ? `
            <button type="button" class="btn btn-secondary btn-block" id="reg-draft-btn" ${reg.status === 'Ditolak' && !policy.allowRetryAfterReject ? 'disabled' : ''}>
              <i class="bi bi-floppy"></i> Simpan Draft
            </button>` : ''}
          ${reg.status === 'Teregistrasi' ? `
            <a href="#/portal/student/krs/edit" class="btn btn-accent btn-block"><i class="bi bi-pencil-square"></i> Lanjut isi KRS</a>` : ''}
          ${!primaryBtn.enabled && primaryBtn.reason ? `<p class="reg-action-hint">${esc(primaryBtn.reason)}</p>` : ''}
        </div>
      </div>
    </aside>
  </div>
</div>`;

  bindStudentActions(container, student, reg, policy);
}

function buildPrimaryButton(reg, policy, submitGate, fin) {
  const st = reg.status;
  if (st === 'Menunggu Pembayaran') {
    return {
      enabled: true,
      reason: '',
      html: `<a href="#/portal/student/finance/invoices" class="btn btn-danger btn-block"><i class="bi bi-cash"></i> Buka Tagihan</a>`,
    };
  }
  if (st === 'Menunggu Validasi') {
    return {
      enabled: false,
      reason: 'Menunggu validasi petugas BAAK.',
      html: `<button type="button" class="btn btn-secondary btn-block" disabled><i class="bi bi-hourglass-split"></i> Menunggu validasi petugas</button>`,
    };
  }
  if (st === 'Teregistrasi') {
    return {
      enabled: false,
      reason: 'Anda sudah teregistrasi untuk semester ini.',
      html: `<button type="button" class="btn btn-success btn-block" disabled><i class="bi bi-check2-circle"></i> Sudah teregistrasi</button>`,
    };
  }
  if (st === 'Dibatalkan' && !policy.allowRetryAfterCancel) {
    return {
      enabled: false,
      reason: 'Ajuan ulang setelah batal tidak diizinkan.',
      html: `<button type="button" class="btn btn-secondary btn-block" disabled>Registrasi dibatalkan</button>`,
    };
  }
  if (!policy.periodOpen) {
    return {
      enabled: false,
      reason: `Registrasi ditutup (${formatDate(policy.periodStart)} – ${formatDate(policy.periodEnd)}).`,
      html: `<button type="button" class="btn btn-secondary btn-block" disabled><i class="bi bi-lock"></i> Registrasi ditutup</button>`,
    };
  }
  if (st === 'Ditolak' && policy.allowRetryAfterReject) {
    return {
      enabled: true,
      reason: '',
      html: `<button type="button" class="btn btn-accent btn-block" id="reg-retry-btn"><i class="bi bi-arrow-clockwise"></i> Perbaiki dan ajukan ulang</button>`,
    };
  }
  if (!submitGate.ok) {
    return {
      enabled: false,
      reason: submitGate.reason,
      html: `<button type="button" class="btn btn-accent btn-block" disabled title="${esc(submitGate.reason)}"><i class="bi bi-send"></i> Registrasi Semester</button>`,
    };
  }
  return {
    enabled: true,
    reason: '',
    html: `<button type="button" class="btn btn-accent btn-block" id="reg-submit-btn"><i class="bi bi-send"></i> Registrasi Semester</button>`,
  };
}

function bindStudentActions(container, student, reg, policy) {
  document.getElementById('reg-draft-btn')?.addEventListener('click', () => {
    const from = reg.status;
    if (from === 'Ditolak' && !policy.allowRetryAfterReject) {
      showToast('Ajuan ulang tidak diizinkan.', 'warning');
      return;
    }
    if (!['Belum Registrasi', 'Draft', 'Ditolak', 'Dibatalkan'].includes(from)) {
      showToast('Draft tidak tersedia untuk status ini.', 'warning');
      return;
    }
    pushHistory(reg, from, 'Draft', 'Mahasiswa', 'Simpan draft');
    reg.status = 'Draft';
    saveReg(reg);
    DB.log('Simpan Draft Registrasi', 'Registrasi Semester', `${student.nim} ? Draft`);
    showToast('Draft registrasi disimpan.', 'success');
    renderStudentRegistration('/portal/student/registration', container);
  });

  document.getElementById('reg-retry-btn')?.addEventListener('click', () => {
    pushHistory(reg, reg.status, 'Draft', 'Mahasiswa', 'Perbaiki setelah ditolak');
    reg.status = 'Draft';
    saveReg(reg);
    showToast('Status dikembalikan ke Draft. Silakan ajukan ulang.', 'info');
    renderStudentRegistration('/portal/student/registration', container);
  });

  document.getElementById('reg-submit-btn')?.addEventListener('click', async () => {
    const fresh = getOrCreateReg(student.id);
    const pol = getPolicy();
    const gate = canSubmit(student, pol, fresh);
    if (!gate.ok) {
      showToast(gate.reason || 'Syarat belum terpenuhi.', 'warning');
      return;
    }
    const fin = financeCheck(student, pol, fresh);
    const next = nextStatusOnSubmit(pol, fin.ok);
    const ok = await showConfirm({
      title: 'Ajukan Registrasi Semester',
      message: `Ajukan registrasi untuk <strong>${esc(getSemester()?.name || 'semester aktif')}</strong>?<br>Status selanjutnya: <strong>${esc(next)}</strong>.`,
      type: 'primary',
      confirmText: 'Ya, Ajukan',
    });
    if (!ok) return;
    const from = fresh.status;
    pushHistory(fresh, from, next, 'Mahasiswa', 'Pengajuan registrasi');
    fresh.status = next;
    fresh.submittedAt = new Date().toISOString();
    if (next === 'Teregistrasi') fresh.staffId = 'auto';
    saveReg(fresh);
    DB.log('Ajukan Registrasi', 'Registrasi Semester', `${student.nim}: ${from} ? ${next}`);
    DB.addNotif('info', 'Registrasi diajukan', `Pengajuan registrasi ${student.nim} berstatus ${next}.`, '#/students/registration', ['baak', 'admin']);
    showToast(`Pengajuan berhasil. Status: ${next}.`, 'success');
    renderStudentRegistration('/portal/student/registration', container);
  });
}

function renderHistoryPage(container, student, prodi, campus) {
  const all = DB.getAll('semesterRegistrations').filter(r => r.studentId === student.id);
  const semesters = DB.getAll('semesters');
  const years = DB.getAll('academicYears');

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Riwayat Registrasi</h1>
      <p class="page-desc">${esc(student.name)} · ${esc(student.nim)} · ${esc(prodi?.name || '-')}</p>
    </div>
    <div class="page-actions">
      <a href="#/portal/student/registration" class="btn btn-secondary"><i class="bi bi-arrow-left"></i> Kembali</a>
    </div>
  </div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead>
          <tr>
            <th>Tahun akademik</th>
            <th>Semester</th>
            <th>Waktu pengajuan</th>
            <th>Perubahan status</th>
            <th>Status</th>
            <th>Catatan</th>
          </tr>
        </thead>
        <tbody>
          ${all.length ? all.map(r => {
            const sem = semesters.find(s => s.id === r.semesterId);
            const ay = years.find(y => y.id === sem?.academicYearId);
            return `<tr>
              <td>${esc(ay?.name || '-')}</td>
              <td>${esc(sem?.name || r.semesterId)}</td>
              <td>${r.submittedAt ? formatDateTime(r.submittedAt) : 'â€”'}</td>
              <td>${r.updatedAt ? formatDateTime(r.updatedAt) : 'â€”'}</td>
              <td>${statusBadge(r.status)}</td>
              <td>${esc(r.note || 'â€”')}</td>
            </tr>`;
          }).join('') : `<tr><td colspan="6"><div class="empty-state" style="padding:1.5rem"><div class="empty-state-desc">Belum ada registrasi pada semester sebelumnya.</div></div></td></tr>`}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
}

// ===================== BAAK / ANTREAN =====================

export function renderStaffRegistration(path, container) {
  const policy = getPolicy();
  const semester = getSemester();
  const students = scopeRows(DB.getAll('students'));
  const allowedStudentIds = new Set(students.map(item => item.id));
  const regs = DB.getAll('semesterRegistrations').filter(item => allowedStudentIds.has(item.studentId));
  const studyPrograms = scopeStudyPrograms(DB.getAll('studyPrograms'));
  const pending = regs.filter(r => r.status === 'Menunggu Validasi').length;

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Registrasi Semester</h1>
      <p class="page-desc">Antrean validasi · ${esc(semester?.name || 'Ganjil 2026/2027')} · ${pending} menunggu validasi</p>
    </div>
    <div class="page-actions">
      <button type="button" class="btn btn-secondary" id="reg-policy-btn"><i class="bi bi-sliders"></i> Kebijakan Demo</button>
    </div>
  </div>

  <div class="kpi-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:1.25rem">
    ${[
      ['Total', regs.length, 'navy', 'bi-people'],
      ['Menunggu', pending, 'warning', 'bi-hourglass-split'],
      ['Teregistrasi', regs.filter(r => r.status === 'Teregistrasi').length, 'success', 'bi-check2-circle'],
      ['Ditolak', regs.filter(r => r.status === 'Ditolak').length, 'danger', 'bi-x-circle'],
      ['Belum / Draft', regs.filter(r => ['Belum Registrasi', 'Draft'].includes(r.status)).length, 'muted', 'bi-circle'],
    ].map(([k, v, c, ic]) => `
      <div class="kpi-card kpi-card-${c}">
        <div class="kpi-icon" style="width:36px;height:36px;font-size:1rem"><i class="bi ${ic}"></i></div>
        <div class="kpi-value">${v}</div>
        <div class="kpi-label">${k}</div>
      </div>`).join('')}
  </div>

  <div class="info-box" style="margin-bottom:1rem">
    <i class="bi bi-info-circle"></i>
    Kebijakan: keuangan <strong>${esc(policy.financeRule)}</strong>,
    validasi petugas <strong>${policy.requireStaffValidation ? 'wajib' : 'tidak wajib'}</strong>,
    periode <strong>${policy.periodOpen ? 'terbuka' : 'ditutup'}</strong>.
  </div>

  <div class="filter-bar" style="margin-bottom:0;border-radius:var(--radius-lg) var(--radius-lg) 0 0">
    <div class="search-input" style="min-width:200px;flex:1">
      <i class="bi bi-search"></i>
      <input type="text" id="reg-staff-search" placeholder="Cari NIM atau nama...">
    </div>
    <select class="filter-select" id="reg-status-filter">
      <option value="all">Semua status</option>
      ${['Belum Registrasi','Draft','Menunggu Pembayaran','Menunggu Validasi','Teregistrasi','Ditolak','Dibatalkan']
        .map(s => `<option value="${s}">${s}</option>`).join('')}
    </select>
  </div>
  <div id="reg-staff-table"></div>
</div>`;

  const rows = regs.map(r => {
    const s = students.find(x => x.id === r.studentId);
    return {
      ...r,
      nim: s?.nim || '',
      name: s?.name || '',
      prodiId: s?.prodiId || '',
      studentStatus: s?.status || '',
    };
  });

  const table = new DataTable({
    containerId: 'reg-staff-table',
    columns: [
      { key: 'nim', label: 'NIM', render: r => `<strong>${esc(r.nim)}</strong>` },
      { key: 'name', label: 'Nama', render: r => esc(r.name) },
      {
        key: 'prodiId',
        label: 'Program Studi',
        render: r => esc(studyPrograms.find(p => p.id === r.prodiId)?.name || '-'),
      },
      { key: 'studentStatus', label: 'Status Akademik', render: r => statusBadge(r.studentStatus) },
      { key: 'status', label: 'Registrasi', render: r => statusBadge(r.status) },
      {
        key: 'submittedAt',
        label: 'Diajukan',
        render: r => (r.submittedAt ? formatDateTime(r.submittedAt) : 'â€”'),
      },
      {
        key: '_act',
        label: 'Aksi',
        sortable: false,
        render: r => `
          <div class="row-actions">
            <button class="btn btn-secondary btn-icon btn-sm" data-action="view" data-id="${r.id}" title="Detail"><i class="bi bi-eye"></i></button>
            ${r.status === 'Menunggu Validasi' ? `
              <button class="btn btn-success btn-sm" data-action="confirm" data-id="${r.id}"><i class="bi bi-check2"></i> Konfirmasi</button>
              <button class="btn btn-danger btn-sm" data-action="reject" data-id="${r.id}">Tolak</button>` : ''}
            ${r.status === 'Teregistrasi' && policy.allowStaffCancel ? `
              <button class="btn btn-warning btn-sm" data-action="cancel" data-id="${r.id}">Batalkan</button>` : ''}
          </div>`,
      },
    ],
    data: rows,
    searchFields: ['nim', 'name'],
    defaultSort: 'submittedAt',
    onRowAction: (action, row) => handleStaffAction(action, row.id, container),
  });

  let deb;
  document.getElementById('reg-staff-search')?.addEventListener('input', e => {
    clearTimeout(deb);
    deb = setTimeout(() => table.search(e.target.value), 200);
  });
  document.getElementById('reg-status-filter')?.addEventListener('change', e => {
    table.filter('status', e.target.value);
  });
  document.getElementById('reg-policy-btn')?.addEventListener('click', () => openPolicyEditor(container));
}

function handleStaffAction(action, regId, container) {
  const reg = DB.getById('semesterRegistrations', regId);
  if (!reg) return;
  const student = DB.getById('students', reg.studentId);
  const policy = getPolicy();

  if (action === 'view') {
    const reqs = buildRequirements(student, policy, reg);
    openModal({
      title: `Registrasi â€” ${student?.nim || reg.studentId}`,
      size: 'lg',
      body: `
        <div style="margin-bottom:1rem;display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center">
          <strong>${esc(student?.name || '-')}</strong>
          ${statusBadge(reg.status)}
        </div>
        <h6 style="font-size:var(--text-sm);margin-bottom:0.5rem">Syarat</h6>
        ${reqs.map(r => `<div class="stat-row"><span class="stat-row-label">${esc(r.name)}</span><span class="stat-row-value">${esc(r.label)}</span></div>`).join('')}
        ${reg.note ? `<div class="info-box info-box-danger" style="margin-top:1rem"><i class="bi bi-chat-left-text"></i> ${esc(reg.note)}</div>` : ''}
        <h6 style="font-size:var(--text-sm);margin:1rem 0 0.5rem">Riwayat</h6>
        <div class="scroll-x">
          <table class="data-table">
            <thead><tr><th>Waktu</th><th>Dari</th><th>Ke</th><th>Oleh</th><th>Catatan</th></tr></thead>
            <tbody>
              ${(reg.history || []).length
                ? [...reg.history].reverse().map(h => `<tr>
                    <td>${formatDateTime(h.at)}</td><td>${esc(h.from)}</td><td>${esc(h.to)}</td>
                    <td>${esc(h.by)}</td><td>${esc(h.note || 'â€”')}</td>
                  </tr>`).join('')
                : '<tr><td colspan="5">Belum ada riwayat.</td></tr>'}
            </tbody>
          </table>
        </div>`,
    });
    return;
  }

  if (action === 'confirm') {
    const acad = academicCheck(student);
    const fin = financeCheck(student, policy, reg);
    if (!acad.ok || !fin.ok) {
      showToast('Konfirmasi ditolak: syarat wajib belum terpenuhi dan tidak ada dispensasi.', 'danger');
      return;
    }
    showConfirm({
      title: 'Konfirmasi Registrasi',
      message: `Setujui registrasi <strong>${esc(student?.name || '')}</strong> (${esc(student?.nim || '')})?`,
      type: 'primary',
      confirmText: 'Ya, Konfirmasi',
    }).then(ok => {
      if (!ok) return;
      const from = reg.status;
      pushHistory(reg, from, 'Teregistrasi', AppState.currentRole?.user || 'Staf TU', 'Disetujui petugas');
      reg.status = 'Teregistrasi';
      reg.staffId = AppState.currentRole?.id || 'staff';
      saveReg(reg);
      DB.log('Konfirmasi Registrasi', 'Registrasi Semester', `${student?.nim}: ${from} ? Teregistrasi`);
      DB.addNotif('success', 'Registrasi disetujui', `Registrasi semester Anda telah disetujui.`, '#/portal/student/registration', ['student']);
      showToast('Registrasi dikonfirmasi.', 'success');
      renderStaffRegistration('/students/registration', container);
    });
    return;
  }

  if (action === 'reject') {
    openFormModal({
      title: 'Tolak Registrasi',
      fields: [
        { key: 'note', label: 'Alasan penolakan', type: 'textarea', required: true, placeholder: 'Jelaskan alasan penolakan...' },
      ],
      onSave: (data, close) => {
        const from = reg.status;
        pushHistory(reg, from, 'Ditolak', AppState.currentRole?.user || 'Staf TU', data.note);
        reg.status = 'Ditolak';
        reg.note = data.note;
        reg.staffId = AppState.currentRole?.id || 'staff';
        saveReg(reg);
        DB.log('Tolak Registrasi', 'Registrasi Semester', `${student?.nim}: ${from} ? Ditolak`);
        DB.addNotif('warning', 'Registrasi ditolak', data.note, '#/portal/student/registration', ['student']);
        close();
        showToast('Registrasi ditolak.', 'warning');
        renderStaffRegistration('/students/registration', container);
      },
    });
    return;
  }

  if (action === 'cancel') {
    if (!policy.allowStaffCancel) {
      showToast('Pembatalan tidak diizinkan kebijakan demo.', 'warning');
      return;
    }
    if (krsBlocksCancel(reg.studentId, reg.semesterId)) {
      showToast('Tidak dapat dibatalkan: KRS sudah diajukan. Dampak pembatalan belum ditetapkan di prototype.', 'danger');
      return;
    }
    openFormModal({
      title: 'Batalkan Registrasi',
      fields: [
        { key: 'note', label: 'Alasan pembatalan', type: 'textarea', required: true },
      ],
      onSave: (data, close) => {
        const from = reg.status;
        pushHistory(reg, from, 'Dibatalkan', AppState.currentRole?.user || 'Staf TU', data.note);
        reg.status = 'Dibatalkan';
        reg.note = data.note;
        saveReg(reg);
        DB.log('Batalkan Registrasi', 'Registrasi Semester', `${student?.nim}: ${from} ? Dibatalkan`);
        close();
        showToast('Registrasi dibatalkan.', 'warning');
        renderStaffRegistration('/students/registration', container);
      },
    });
  }
}

function openPolicyEditor(container) {
  const policy = getPolicy();
  openFormModal({
    title: 'Kebijakan Registrasi (Demo)',
    fields: [
      {
        key: 'financeRule',
        label: 'Aturan keuangan',
        type: 'select',
        options: [
          { value: 'none', label: 'Tidak diwajibkan (none)' },
          { value: 'paid', label: 'Wajib lunas (paid)' },
          { value: 'dispensation', label: 'Lunas atau dispensasi' },
        ],
      },
      {
        key: 'requireStaffValidation',
        label: 'Validasi petugas',
        type: 'select',
        options: [
          { value: 'true', label: 'Wajib' },
          { value: 'false', label: 'Tidak wajib' },
        ],
      },
      {
        key: 'periodOpen',
        label: 'Periode registrasi',
        type: 'select',
        options: [
          { value: 'true', label: 'Terbuka' },
          { value: 'false', label: 'Ditutup' },
        ],
      },
      {
        key: 'allowRetryAfterReject',
        label: 'Ajuan ulang setelah ditolak',
        type: 'select',
        options: [
          { value: 'true', label: 'Diizinkan' },
          { value: 'false', label: 'Tidak diizinkan' },
        ],
      },
      {
        key: 'allowStaffCancel',
        label: 'Batal oleh petugas',
        type: 'select',
        options: [
          { value: 'true', label: 'Diizinkan' },
          { value: 'false', label: 'Tidak diizinkan' },
        ],
      },
      {
        key: 'requireRegistrationBeforeKrs',
        label: 'Registrasi wajib sebelum KRS',
        type: 'select',
        options: [
          { value: 'true', label: 'Wajib' },
          { value: 'false', label: 'Tidak wajib' },
        ],
      },
    ],
    values: {
      financeRule: policy.financeRule,
      requireStaffValidation: String(!!policy.requireStaffValidation),
      periodOpen: String(!!policy.periodOpen),
      allowRetryAfterReject: String(!!policy.allowRetryAfterReject),
      allowStaffCancel: String(!!policy.allowStaffCancel),
      requireRegistrationBeforeKrs: String(!!policy.requireRegistrationBeforeKrs),
    },
    onSave: (data, close) => {
      const next = {
        ...policy,
        financeRule: data.financeRule,
        requireStaffValidation: data.requireStaffValidation === 'true',
        periodOpen: data.periodOpen === 'true',
        allowRetryAfterReject: data.allowRetryAfterReject === 'true',
        allowStaffCancel: data.allowStaffCancel === 'true',
        requireRegistrationBeforeKrs: data.requireRegistrationBeforeKrs === 'true',
      };
      savePolicy(next);
      const krs = DB.get('krsPolicy') || {};
      krs.requireRegistrationBeforeKrs = next.requireRegistrationBeforeKrs;
      DB.save('krsPolicy', krs);
      DB.log('Ubah Kebijakan Registrasi', 'Registrasi Semester', JSON.stringify({
        financeRule: next.financeRule,
        staff: next.requireStaffValidation,
        period: next.periodOpen,
      }));
      close();
      showToast('Kebijakan demo diperbarui.', 'success');
      renderStaffRegistration('/students/registration', container);
    },
  });
}

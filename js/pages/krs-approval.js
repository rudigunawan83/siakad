/**
 * SIAKAD â€” Persetujuan KRS
 * 9.1 Portal dosen wali + antrean BAAK (lihat / kunci Final)
 */

import { DB } from '../data/seed.js';
import { AppState } from '../state.js?v=20261025ab';
import { formatDate, formatDateTime, generateId, statusBadge } from '../utils.js';
import { showToast, showConfirm } from '../components/toast.js';
import { openModal, openFormModal } from '../components/modal.js';
import { DataTable } from '../components/data-table.js';
import { scopeRows, scopeStudyPrograms } from '../campus-scope.js';
import {
  getPolicy,
  savePlan,
  pushHistory,
  syncEnrollments,
  validateSubmit,
  calcIpsLast,
  maxSksFromIps,
} from './student-krs.js';

const WAITING = 'Menunggu Persetujuan Dosen Wali';

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getLecturer() {
  const role = AppState.currentRole;
  return scopeRows(DB.getAll('lecturers')).find(l => l.id === (role.lecturerId || 'lec-1'));
}

function adviseesOf(lecturerId) {
  return scopeRows(DB.getAll('students')).filter(s => s.advisor === lecturerId);
}

function planOf(studentId, semesterId = 'sem-1') {
  return DB.getAll('krsPlans').find(p => p.studentId === studentId && p.semesterId === semesterId);
}

function hardErrors(student, plan, policy) {
  // Validasi keras untuk Setujui (tanpa cek "boleh edit")
  const shadow = { ...plan, status: 'Draft' };
  return validateSubmit(student, shadow, { ...policy, periodOpen: true }).filter(e =>
    !/Status KRS tidak mengizinkan|Registrasi semester|Dosen wali belum|Periode pengisian/i.test(e.msg)
  );
}

function totalSks(plan) {
  return (plan?.items || []).reduce((s, i) => s + (i.sks || 0), 0);
}

function notifyStudent(student, title, message) {
  const notifs = DB.getAll('notifications');
  notifs.unshift({
    id: generateId('notif'),
    type: 'krs',
    title,
    message,
    time: new Date().toISOString(),
    read: false,
    link: '#/portal/student/krs',
    role: ['Mahasiswa'],
    studentId: student.id,
  });
  DB.save('notifications', notifs.slice(0, 50));
}

function buildAdviseeRows(lecturerId) {
  const students = adviseesOf(lecturerId);
  const studyPrograms = scopeStudyPrograms(DB.getAll('studyPrograms'));
  return students.map(s => {
    const plan = planOf(s.id);
    const ips = calcIpsLast(s.id);
    const max = maxSksFromIps(ips);
    return {
      id: s.id,
      planId: plan?.id || null,
      nim: s.nim,
      name: s.name,
      prodiId: s.prodiId,
      prodiName: studyPrograms.find(p => p.id === s.prodiId)?.name || '-',
      angkatan: s.angkatan,
      semester: s.semester,
      academicStatus: s.status,
      krsStatus: plan?.status || 'Belum Dibuat',
      totalSks: plan ? totalSks(plan) : 0,
      maxSks: max,
      submittedAt: plan?.submittedAt || null,
      plan,
      student: s,
    };
  });
}

// ===================== PORTAL DOSEN WALI =====================

export function renderAdvisorKrsApproval(path, container) {
  const lecturer = getLecturer();
  if (!lecturer) {
    container.innerHTML = '<div class="page-container"><p>Data dosen tidak ditemukan.</p></div>';
    return;
  }

  // path like /portal/lecturer/krs/stu-2
  const studentDetailId = path.includes('/krs/') && !path.endsWith('/krs')
    ? path.split('/krs/')[1]?.split('/')[0]
    : null;

  if (studentDetailId) {
    return renderAdvisorDetail(container, lecturer, studentDetailId);
  }

  const policy = getPolicy();
  const rows = buildAdviseeRows(lecturer.id);
  const pending = rows.filter(r => r.krsStatus === WAITING).length;

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Persetujuan KRS</h1>
      <p class="page-desc">Mahasiswa bimbingan · ${esc(lecturer.name)} · ${pending} menunggu persetujuan</p>
    </div>
    <div class="page-actions">
      <a href="#/portal/lecturer" class="btn btn-secondary"><i class="bi bi-house"></i> Portal</a>
    </div>
  </div>

  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:1.25rem">
    ${[
      ['Bimbingan', rows.length, 'navy', 'bi-people'],
      ['Menunggu', pending, 'warning', 'bi-hourglass-split'],
      ['Disetujui', rows.filter(r => r.krsStatus === 'Disetujui').length, 'success', 'bi-check2-circle'],
      ['Perlu Revisi', rows.filter(r => r.krsStatus === 'Perlu Revisi').length, 'danger', 'bi-arrow-counterclockwise'],
    ].map(([k, v, c, ic]) => `
      <div class="kpi-card kpi-card-${c}">
        <div class="kpi-icon" style="width:36px;height:36px;font-size:1rem"><i class="bi ${ic}"></i></div>
        <div class="kpi-value">${v}</div>
        <div class="kpi-label">${k}</div>
      </div>`).join('')}
  </div>

  <div class="info-box" style="margin-bottom:1rem">
    <i class="bi bi-info-circle"></i>
    Hanya mahasiswa dengan dosen wali <strong>${esc(lecturer.name)}</strong>.
    Persetujuan ${policy.advisorApprovalRequired ? 'wajib' : 'tidak wajib'} · Finalisasi: <strong>${esc(policy.finalizeOn || 'period_lock')}</strong>.
  </div>

  <div class="filter-bar" style="margin-bottom:0;border-radius:var(--radius-lg) var(--radius-lg) 0 0">
    <div class="search-input" style="min-width:200px;flex:1">
      <i class="bi bi-search"></i>
      <input type="text" id="adv-krs-search" placeholder="Cari NIM atau nama...">
    </div>
    <select class="filter-select" id="adv-krs-status">
      <option value="all">Semua status KRS</option>
      ${['Belum Dibuat','Draft','Menunggu Persetujuan Dosen Wali','Disetujui','Perlu Revisi','Final']
        .map(s => `<option value="${s}" ${s === WAITING ? 'selected' : ''}>${s}</option>`).join('')}
    </select>
  </div>
  <div id="adv-krs-table"></div>
</div>`;

  const table = new DataTable({
    containerId: 'adv-krs-table',
    columns: [
      { key: 'nim', label: 'NIM', render: r => `<strong>${esc(r.nim)}</strong>` },
      { key: 'name', label: 'Nama' },
      { key: 'prodiName', label: 'Program Studi' },
      { key: 'angkatan', label: 'Angk.' },
      { key: 'semester', label: 'Sem.' },
      { key: 'academicStatus', label: 'Status', render: r => statusBadge(r.academicStatus) },
      { key: 'krsStatus', label: 'Status KRS', render: r => statusBadge(r.krsStatus) },
      {
        key: 'totalSks',
        label: 'SKS',
        render: r => `<strong>${r.totalSks}</strong><span style="color:var(--color-muted);font-size:10px"> / ${r.maxSks}</span>`,
      },
      {
        key: '_act',
        label: 'Aksi',
        sortable: false,
        render: r => `
          <div class="row-actions">
            <a class="btn btn-secondary btn-sm" href="#/portal/lecturer/krs/${r.id}"><i class="bi bi-eye"></i> Detail</a>
            ${r.krsStatus === WAITING ? `
              <button class="btn btn-success btn-sm" data-action="approve" data-id="${r.id}"><i class="bi bi-check2"></i> Setujui</button>
              <button class="btn btn-warning btn-sm" data-action="revise" data-id="${r.id}">Revisi</button>` : ''}
          </div>`,
      },
    ],
    data: rows,
    searchFields: ['nim', 'name'],
    defaultSort: 'nim',
    onRowAction: (action, row) => {
      if (action === 'approve') approvePlan(row.student, row.plan, lecturer, () => renderAdvisorKrsApproval('/portal/lecturer/krs', container));
      if (action === 'revise') revisePlan(row.student, row.plan, lecturer, () => renderAdvisorKrsApproval('/portal/lecturer/krs', container));
    },
  });

  table.filter('krsStatus', WAITING);

  let deb;
  document.getElementById('adv-krs-search')?.addEventListener('input', e => {
    clearTimeout(deb);
    deb = setTimeout(() => table.search(e.target.value), 200);
  });
  document.getElementById('adv-krs-status')?.addEventListener('change', e => {
    table.filter('krsStatus', e.target.value);
  });
}

function renderAdvisorDetail(container, lecturer, studentId) {
  const student = DB.getById('students', studentId);
  if (!student || student.advisor !== lecturer.id) {
    container.innerHTML = `
<div class="page-container">
  <div class="empty-state" style="padding:3rem">
    <div class="empty-state-title">KRS tidak ditemukan</div>
    <div class="empty-state-desc">Mahasiswa ini bukan bimbingan Anda, atau data tidak tersedia.</div>
    <a href="#/portal/lecturer/krs" class="btn btn-secondary mt-3">Kembali ke daftar</a>
  </div>
</div>`;
    return;
  }

  const policy = getPolicy();
  const plan = planOf(student.id) || { status: 'Belum Dibuat', items: [], history: [] };
  const prodi = DB.getById('studyPrograms', student.prodiId);
  const ips = calcIpsLast(student.id);
  const max = maxSksFromIps(ips);
  const total = totalSks(plan);
  const errors = plan.status === WAITING ? hardErrors(student, plan, policy) : [];
  const canApprove = plan.status === WAITING && errors.length === 0;

  container.innerHTML = `
<div class="page-container krs-advisor-detail">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Detail KRS â€” ${esc(student.nim)}</h1>
      <p class="page-desc">${esc(student.name)} · ${esc(prodi?.name || '-')} · Angkatan ${student.angkatan}</p>
    </div>
    <div class="page-actions">
      <a href="#/portal/lecturer/krs" class="btn btn-secondary"><i class="bi bi-arrow-left"></i> Daftar</a>
    </div>
  </div>

  <div class="reg-layout">
    <div>
      <div class="card" style="margin-bottom:1rem">
        <div class="card-header">
          <h3 class="card-title">Mata kuliah diajukan</h3>
          <div style="display:flex;gap:0.5rem;align-items:center">${statusBadge(plan.status)}
            <span class="badge badge-navy">${total} / ${max} SKS</span>
          </div>
        </div>
        <div class="scroll-x">
          <table class="data-table">
            <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Kelas</th><th>Dosen</th><th>Jadwal</th><th>Ruang</th></tr></thead>
            <tbody>
              ${(plan.items || []).length ? plan.items.map(i => `<tr>
                <td><code>${esc(i.code)}</code></td>
                <td><strong>${esc(i.name)}</strong></td>
                <td>${i.sks}</td>
                <td>${esc(i.classCode || '-')}</td>
                <td>${esc(i.lecturerName || DB.getById('lecturers', i.lecturerId)?.name || '-')}</td>
                <td>${esc(i.day || '-')} ${esc(i.startTime || '')}–${esc(i.endTime || '')}</td>
                <td>${esc(i.room || '-')}</td>
              </tr>`).join('') : `<tr><td colspan="7"><div class="empty-state" style="padding:1rem"><div class="empty-state-desc">Belum ada mata kuliah.</div></div></td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      ${errors.length ? `
      <div class="info-box info-box-danger" role="alert" style="margin-bottom:1rem">
        <i class="bi bi-exclamation-triangle"></i>
        <strong>Tidak dapat disetujui â€” ada pelanggaran:</strong>
        <ul style="margin:0.5rem 0 0;padding-left:1.1rem">
          ${errors.map(e => `<li>${esc(e.msg)}</li>`).join('')}
        </ul>
        <p style="margin:0.5rem 0 0;font-size:var(--text-sm)">Kembalikan untuk revisi. Override dosen wali tidak tersedia di demo.</p>
      </div>` : ''}

      <div class="card">
        <div class="card-header"><h3 class="card-title">Riwayat keputusan</h3></div>
        <div class="scroll-x">
          <table class="data-table">
            <thead><tr><th>Waktu</th><th>Dari</th><th>Ke</th><th>Oleh</th><th>Catatan</th></tr></thead>
            <tbody>
              ${(plan.history || []).length
                ? [...plan.history].reverse().map(h => `<tr>
                    <td>${formatDateTime(h.at)}</td>
                    <td>${esc(h.from)}</td><td>${esc(h.to)}</td>
                    <td>${esc(h.by)}</td><td>${esc(h.note || 'â€”')}</td>
                  </tr>`).join('')
                : '<tr><td colspan="5">Belum ada riwayat.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <aside>
      <div class="card" style="margin-bottom:1rem">
        <div class="card-header"><h3 class="card-title">Profil mahasiswa</h3></div>
        <div class="card-body">
          ${[
            ['NIM', student.nim],
            ['IPK', student.ipk?.toFixed(2)],
            ['IPS terakhir', ips != null ? ips.toFixed(2) : 'Belum ada'],
            ['Batas SKS', String(max)],
            ['Diajukan', plan.submittedAt ? formatDateTime(plan.submittedAt) : 'â€”'],
          ].map(([k, v]) => `<div class="stat-row"><span class="stat-row-label">${k}</span><span class="stat-row-value">${esc(v)}</span></div>`).join('')}
        </div>
      </div>

      ${plan.advisorNote ? `
      <div class="info-box info-box-warning" style="margin-bottom:1rem">
        <i class="bi bi-chat-left-text"></i> <strong>Catatan terakhir:</strong> ${esc(plan.advisorNote)}
      </div>` : ''}

      <div class="card">
        <div class="card-header"><h3 class="card-title">Aksi dosen wali</h3></div>
        <div class="card-body reg-actions">
          ${plan.status === WAITING ? `
            <button type="button" class="btn btn-success btn-block" id="adv-approve" ${canApprove ? '' : 'disabled'}
              title="${canApprove ? '' : 'Ada pelanggaran â€” hanya bisa kembalikan revisi'}">
              <i class="bi bi-check2"></i> Setujui KRS
            </button>
            <button type="button" class="btn btn-warning btn-block" id="adv-revise">
              <i class="bi bi-arrow-counterclockwise"></i> Kembalikan untuk Revisi
            </button>
          ` : `<p class="reg-action-hint">Status saat ini tidak membutuhkan keputusan.</p>`}
        </div>
      </div>
    </aside>
  </div>
</div>`;

  document.getElementById('adv-approve')?.addEventListener('click', () => {
    approvePlan(student, plan, lecturer, () => renderAdvisorDetail(container, lecturer, studentId));
  });
  document.getElementById('adv-revise')?.addEventListener('click', () => {
    revisePlan(student, plan, lecturer, () => renderAdvisorDetail(container, lecturer, studentId));
  });
}

async function approvePlan(student, plan, lecturer, refresh) {
  if (!plan || plan.status !== WAITING) {
    showToast('KRS tidak dalam status menunggu persetujuan.', 'warning');
    return;
  }
  if (student.advisor !== lecturer.id) {
    showToast('Mahasiswa ini bukan bimbingan Anda.', 'danger');
    return;
  }
  const policy = getPolicy();
  const errors = hardErrors(student, plan, policy);
  if (errors.length) {
    showToast('Tidak dapat disetujui: masih ada pelanggaran. Kembalikan untuk revisi.', 'danger');
    return;
  }

  const finalizeNow = policy.finalizeOn === 'on_approve';
  const next = finalizeNow ? 'Final' : 'Disetujui';
  const ok = await showConfirm({
    title: 'Setujui KRS?',
    message: finalizeNow
      ? `Menyetujui dan <strong>mengunci Final</strong> KRS ${esc(student.name)} (${totalSks(plan)} SKS) sesuai kebijakan finalizeOn=on_approve.`
      : `Menyetujui KRS ${esc(student.name)} (${totalSks(plan)} SKS). Status menjadi <strong>Disetujui</strong>.`,
    confirmText: 'Ya, Setujui',
    type: 'primary',
  });
  if (!ok) return;

  const from = plan.status;
  pushHistory(plan, from, next, lecturer.name || 'Dosen Wali', 'Disetujui dosen wali');
  plan.status = next;
  plan.decidedAt = new Date().toISOString();
  plan.advisorNote = '';
  savePlan(plan);
  syncEnrollments(plan);
  DB.log('KRS: Setujui', 'Persetujuan KRS', `${student.nim}: ${from} ? ${next}`);
  notifyStudent(student, 'KRS disetujui', `Dosen wali menyetujui KRS Anda. Status: ${next}.`);
  showToast(`KRS disetujui (${next}).`, 'success');
  refresh();
}

function revisePlan(student, plan, lecturer, refresh) {
  if (!plan || plan.status !== WAITING) {
    showToast('KRS tidak dalam status menunggu persetujuan.', 'warning');
    return;
  }
  if (student.advisor !== lecturer.id) {
    showToast('Mahasiswa ini bukan bimbingan Anda.', 'danger');
    return;
  }
  openFormModal({
    title: 'Kembalikan untuk Revisi',
    fields: [
      { key: 'note', label: 'Alasan / catatan revisi', type: 'textarea', required: true, placeholder: 'Jelaskan yang perlu diperbaiki...' },
    ],
    onSave: (data, close) => {
      if (!String(data.note || '').trim()) {
        showToast('Catatan revisi wajib diisi.', 'warning');
        return;
      }
      const from = plan.status;
      pushHistory(plan, from, 'Perlu Revisi', lecturer.name || 'Dosen Wali', data.note);
      plan.status = 'Perlu Revisi';
      plan.decidedAt = new Date().toISOString();
      plan.advisorNote = data.note;
      savePlan(plan);
      syncEnrollments(plan);
      DB.log('KRS: Revisi', 'Persetujuan KRS', `${student.nim}: ${from} ? Perlu Revisi`);
      notifyStudent(student, 'KRS perlu revisi', data.note);
      close();
      showToast('KRS dikembalikan untuk revisi.', 'warning');
      refresh();
    },
  });
}

// ===================== BAAK / STAF =====================

export function renderStaffKrsApproval(path, container) {
  const policy = getPolicy();
  const students = scopeRows(DB.getAll('students'));
  const lecturers = scopeRows(DB.getAll('lecturers'));
  const studyPrograms = scopeStudyPrograms(DB.getAll('studyPrograms'));
  const allowedStudentIds = new Set(students.map(item => item.id));
  const plans = DB.getAll('krsPlans').filter(item => allowedStudentIds.has(item.studentId));
  const waiting = plans.filter(p => p.status === WAITING).length;
  const approved = plans.filter(p => p.status === 'Disetujui').length;

  const rows = plans.map(p => {
    const s = students.find(x => x.id === p.studentId);
    const adv = s ? lecturers.find(l => l.id === s.advisor) : null;
    return {
      ...p,
      nim: s?.nim || '',
      name: s?.name || '',
      prodiName: studyPrograms.find(pr => pr.id === s?.prodiId)?.name || '-',
      advisorName: adv?.name || 'â€”',
      totalSks: totalSks(p),
    };
  });

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Persetujuan KRS</h1>
      <p class="page-desc">Antrean BAAK · keputusan dosen wali ada di portal dosen · ${waiting} menunggu wali</p>
    </div>
    <div class="page-actions">
      ${approved > 0 && (policy.finalizeOn || 'period_lock') === 'period_lock' ? `
        <button type="button" class="btn btn-accent" id="krs-lock-period">
          <i class="bi bi-lock"></i> Kunci KRS periode ini (${approved})
        </button>` : ''}
    </div>
  </div>

  <div class="info-box" style="margin-bottom:1rem">
    <i class="bi bi-shield-check"></i>
    Petugas <strong>tidak menyetujui atas nama dosen wali</strong>. Gunakan portal dosen untuk Setujui / Revisi.
    Aksi BAAK: lihat detail dan kunci periode menjadi Final.
  </div>

  <div class="filter-bar" style="margin-bottom:0;border-radius:var(--radius-lg) var(--radius-lg) 0 0">
    <div class="search-input" style="min-width:200px;flex:1">
      <i class="bi bi-search"></i>
      <input type="text" id="staff-krs-search" placeholder="Cari NIM atau nama...">
    </div>
    <select class="filter-select" id="staff-krs-status">
      <option value="all">Semua status</option>
      ${['Draft','Menunggu Persetujuan Dosen Wali','Disetujui','Perlu Revisi','Final']
        .map(s => `<option value="${s}">${s}</option>`).join('')}
    </select>
  </div>
  <div id="staff-krs-table"></div>
</div>`;

  const table = new DataTable({
    containerId: 'staff-krs-table',
    columns: [
      { key: 'nim', label: 'NIM', render: r => `<strong>${esc(r.nim)}</strong>` },
      { key: 'name', label: 'Nama' },
      { key: 'prodiName', label: 'Program Studi' },
      { key: 'totalSks', label: 'SKS', render: r => `<strong>${r.totalSks}</strong>` },
      { key: 'status', label: 'Status KRS', render: r => statusBadge(r.status) },
      { key: 'advisorName', label: 'Dosen Wali' },
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
          <button class="btn btn-secondary btn-sm" data-action="view" data-id="${r.id}"><i class="bi bi-eye"></i> Detail</button>`,
      },
    ],
    data: rows,
    searchFields: ['nim', 'name'],
    defaultSort: 'submittedAt',
    onRowAction: (action, row) => {
      if (action === 'view') openStaffDetail(row);
    },
  });

  let deb;
  document.getElementById('staff-krs-search')?.addEventListener('input', e => {
    clearTimeout(deb);
    deb = setTimeout(() => table.search(e.target.value), 200);
  });
  document.getElementById('staff-krs-status')?.addEventListener('change', e => {
    table.filter('status', e.target.value);
  });

  document.getElementById('krs-lock-period')?.addEventListener('click', async () => {
    const toLock = DB.getAll('krsPlans').filter(p => allowedStudentIds.has(p.studentId) && p.status === 'Disetujui');
    if (!toLock.length) {
      showToast('Tidak ada KRS berstatus Disetujui.', 'info');
      return;
    }
    const ok = await showConfirm({
      title: 'Kunci KRS periode ini?',
      message: `${toLock.length} KRS berstatus Disetujui akan menjadi <strong>Final</strong> dan terkunci.`,
      confirmText: 'Ya, Kunci',
      type: 'warning',
    });
    if (!ok) return;
    toLock.forEach(p => {
      pushHistory(p, 'Disetujui', 'Final', AppState.currentRole?.user || 'Staf BAAK', 'Kunci periode');
      p.status = 'Final';
      p.decidedAt = p.decidedAt || new Date().toISOString();
      savePlan(p);
      syncEnrollments(p);
    });
    DB.log('KRS: Kunci Periode', 'Persetujuan KRS', `${toLock.length} rencana ? Final`);
    showToast(`${toLock.length} KRS dikunci menjadi Final.`, 'success');
    renderStaffKrsApproval(path, container);
  });
}

function openStaffDetail(row) {
  openModal({
    title: `KRS â€” ${row.nim} ${row.name}`,
    size: 'lg',
    body: `
      <div style="margin-bottom:1rem;display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center">
        ${statusBadge(row.status)}
        <span class="badge badge-navy">${row.totalSks} SKS</span>
        <span style="font-size:var(--text-sm);color:var(--color-muted)">Dosen wali: ${esc(row.advisorName)}</span>
      </div>
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Kelas</th><th>Jadwal</th></tr></thead>
          <tbody>
            ${(row.items || []).map(i => `<tr>
              <td><code>${esc(i.code)}</code></td>
              <td>${esc(i.name)}</td>
              <td>${i.sks}</td>
              <td>${esc(i.classCode || '-')}</td>
              <td>${esc(i.day || '-')} ${esc(i.startTime || '')}–${esc(i.endTime || '')}</td>
            </tr>`).join('') || '<tr><td colspan="5">Kosong</td></tr>'}
          </tbody>
        </table>
      </div>
      ${row.advisorNote ? `<div class="info-box info-box-warning" style="margin-top:1rem">${esc(row.advisorNote)}</div>` : ''}
      <p style="margin-top:1rem;font-size:var(--text-sm);color:var(--color-muted)">
        Untuk menyetujui atau mengembalikan revisi, buka portal dosen wali mahasiswa ini.
      </p>`,
  });
}

/** Jumlah KRS menunggu untuk dosen wali tertentu */
export function countPendingForAdvisor(lecturerId) {
  const ids = new Set(adviseesOf(lecturerId).map(s => s.id));
  return DB.getAll('krsPlans').filter(p => ids.has(p.studentId) && p.status === WAITING).length;
}

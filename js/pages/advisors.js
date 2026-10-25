/**
 * SIAKAD — Master Dosen Wali (design.md 7.6)
 * Route: #/academic/advisors
 */

import { DB } from '../data/seed.js';
import { formatDate, generateId, statusBadge, today } from '../utils.js';
import { DataTable } from '../components/data-table.js';
import { openFormModal, openModal } from '../components/modal.js';
import { showToast, showConfirm } from '../components/toast.js';

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Pastikan koleksi penugasan ada; sinkron dari student.advisor bila kosong */
export function ensureAdvisorAssignments() {
  let list = DB.getAll('advisorAssignments');
  if (!Array.isArray(list)) list = [];
  if (list.length === 0) {
    const students = DB.getAll('students').filter(s => s.advisor);
    list = students.map(s => ({
      id: generateId('adv'),
      studentId: s.id,
      lecturerId: s.advisor,
      prodiId: s.prodiId,
      angkatan: s.angkatan,
      startDate: `${s.angkatan}-09-01`,
      endDate: null,
      status: 'aktif',
      note: 'Seed dari data mahasiswa',
    }));
    DB.save('advisorAssignments', list);
  }
  return list;
}

function activeAssignment(studentId) {
  return ensureAdvisorAssignments().find(a => a.studentId === studentId && a.status === 'aktif');
}

function endAssignment(assignment, endDate, note = '') {
  DB.update('advisorAssignments', assignment.id, {
    status: 'berakhir',
    endDate: endDate || today(),
    note: note || assignment.note || '',
  });
  const stu = DB.getById('students', assignment.studentId);
  if (stu && stu.advisor === assignment.lecturerId) {
    DB.update('students', stu.id, { advisor: null });
  }
}

function assignAdvisor({ studentId, lecturerId, startDate, note = '' }) {
  const student = DB.getById('students', studentId);
  const lecturer = DB.getById('lecturers', lecturerId);
  if (!student || !lecturer) return { ok: false, msg: 'Mahasiswa atau dosen tidak ditemukan.' };

  const prev = activeAssignment(studentId);
  if (prev) {
    if (prev.lecturerId === lecturerId) {
      return { ok: false, msg: 'Dosen wali ini sudah aktif untuk mahasiswa tersebut.' };
    }
    endAssignment(prev, today(), 'Diganti penugasan baru');
  }

  const row = {
    id: generateId('adv'),
    studentId,
    lecturerId,
    prodiId: student.prodiId,
    angkatan: student.angkatan,
    startDate: startDate || today(),
    endDate: null,
    status: 'aktif',
    note,
  };
  DB.add('advisorAssignments', row);
  DB.update('students', studentId, { advisor: lecturerId });
  DB.log('Penugasan Dosen Wali', 'Akademik', `${student.nim} → ${lecturer.name}`);
  return { ok: true, msg: `${student.name} ditugaskan ke ${lecturer.name}.`, row };
}

export function renderAdvisors(path, container) {
  ensureAdvisorAssignments();
  const assignments = DB.getAll('advisorAssignments');
  const students = DB.getAll('students');
  const lecturers = DB.getAll('lecturers');
  const programs = DB.getAll('studyPrograms');
  const campuses = DB.getAll('campuses');

  const active = assignments.filter(a => a.status === 'aktif');
  const without = students.filter(s => ['aktif', 'cuti'].includes(s.status) && !s.advisor);
  const byLec = {};
  active.forEach(a => { byLec[a.lecturerId] = (byLec[a.lecturerId] || 0) + 1; });

  const rows = assignments.map(a => {
    const s = students.find(x => x.id === a.studentId);
    const l = lecturers.find(x => x.id === a.lecturerId);
    const p = programs.find(x => x.id === (a.prodiId || s?.prodiId));
    return {
      ...a,
      nim: s?.nim || '—',
      studentName: s?.name || '—',
      studentStatus: s?.status || '—',
      nidn: l?.nidn || '—',
      lecturerName: l?.name || '—',
      prodiName: p?.name || '—',
      prodiCode: p?.code || '—',
      campusId: s?.campusId || l?.campusId,
      angkatan: a.angkatan || s?.angkatan || '—',
    };
  });

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Dosen Wali</h1>
      <p class="page-desc">Penugasan dosen wali · satu mahasiswa satu wali aktif · ${active.length} penugasan aktif</p>
    </div>
    <div class="page-actions">
      <button type="button" class="btn btn-accent" id="adv-assign-btn"><i class="bi bi-person-plus"></i> Tetapkan Dosen Wali</button>
      <a href="#/portal/lecturer/krs" class="btn btn-secondary"><i class="bi bi-journal-check"></i> Persetujuan KRS</a>
    </div>
  </div>

  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:1.25rem">
    ${[
      ['Penugasan aktif', active.length, 'navy', 'bi-link-45deg'],
      ['Dosen membimbing', Object.keys(byLec).length, 'success', 'bi-person-workspace'],
      ['Tanpa wali', without.length, 'warning', 'bi-person-x'],
      ['Riwayat berakhir', assignments.filter(a => a.status === 'berakhir').length, 'muted', 'bi-clock-history'],
    ].map(([k, v, c, ic]) => `
      <div class="kpi-card kpi-card-${c}">
        <div class="kpi-icon" style="width:36px;height:36px;font-size:1rem"><i class="bi ${ic}"></i></div>
        <div class="kpi-value">${v}</div>
        <div class="kpi-label">${k}</div>
      </div>`).join('')}
  </div>

  ${without.length ? `
  <div class="info-box info-box-warning" style="margin-bottom:1rem">
    <i class="bi bi-exclamation-triangle"></i>
    <strong>${without.length} mahasiswa</strong> aktif/cuti belum punya dosen wali.
    Tanpa wali, pengajuan KRS ditolak jika kebijakan mewajibkan persetujuan.
  </div>` : ''}

  <div class="info-box" style="margin-bottom:1rem">
    <i class="bi bi-info-circle"></i>
    Mengganti dosen wali tidak menghapus riwayat keputusan KRS.
    Dosen hanya melihat mahasiswa pada penugasan aktifnya di portal Persetujuan KRS.
  </div>

  <div class="filter-bar" style="margin-bottom:0;border-radius:var(--radius-lg) var(--radius-lg) 0 0">
    <div class="search-input" style="min-width:200px;flex:1">
      <i class="bi bi-search"></i>
      <input type="text" id="adv-search" placeholder="Cari NIM, nama mahasiswa, atau dosen...">
    </div>
    <select class="filter-select" id="adv-status">
      <option value="aktif">Aktif</option>
      <option value="berakhir">Berakhir</option>
      <option value="all">Semua status</option>
    </select>
    <select class="filter-select" id="adv-prodi">
      <option value="all">Semua prodi</option>
      ${programs.map(p => `<option value="${p.id}">${esc(p.code)} — ${esc(p.name)}</option>`).join('')}
    </select>
    <select class="filter-select" id="adv-campus">
      <option value="all">Semua kampus</option>
      ${campuses.map(c => `<option value="${c.id}">${esc(c.code)}</option>`).join('')}
    </select>
  </div>
  <div id="adv-table"></div>
</div>`;

  const table = new DataTable({
    containerId: 'adv-table',
    columns: [
      { key: 'nidn', label: 'NIDN', render: r => `<code>${esc(r.nidn)}</code>` },
      { key: 'lecturerName', label: 'Dosen Wali', render: r => `<strong>${esc(r.lecturerName)}</strong>` },
      { key: 'prodiCode', label: 'Prodi', render: r => esc(r.prodiCode) },
      { key: 'angkatan', label: 'Angk.' },
      { key: 'nim', label: 'NIM', render: r => `<strong>${esc(r.nim)}</strong>` },
      { key: 'studentName', label: 'Mahasiswa' },
      {
        key: 'startDate',
        label: 'Berlaku',
        render: r => `${formatDate(r.startDate)}${r.endDate ? ` – ${formatDate(r.endDate)}` : ' – sekarang'}`,
      },
      { key: 'status', label: 'Status', render: r => statusBadge(r.status === 'aktif' ? 'aktif' : 'selesai') },
      {
        key: '_act',
        label: 'Aksi',
        sortable: false,
        render: r => `
          <div class="row-actions">
            <button class="btn btn-secondary btn-icon btn-sm" data-action="view" data-id="${r.id}" title="Detail"><i class="bi bi-eye"></i></button>
            ${r.status === 'aktif' ? `
              <button class="btn btn-warning btn-sm" data-action="end" data-id="${r.id}">Akhiri</button>
              <button class="btn btn-secondary btn-sm" data-action="change" data-id="${r.id}">Ganti</button>` : ''}
          </div>`,
      },
    ],
    data: rows,
    searchFields: ['nim', 'studentName', 'lecturerName', 'nidn'],
    defaultSort: 'lecturerName',
    onRowAction: (action, row) => handleRow(action, row, container),
  });

  table.filter('status', 'aktif');

  let deb;
  document.getElementById('adv-search')?.addEventListener('input', e => {
    clearTimeout(deb);
    deb = setTimeout(() => table.search(e.target.value), 200);
  });
  document.getElementById('adv-status')?.addEventListener('change', e => table.filter('status', e.target.value));
  document.getElementById('adv-prodi')?.addEventListener('change', e => table.filter('prodiId', e.target.value));
  document.getElementById('adv-campus')?.addEventListener('change', e => table.filter('campusId', e.target.value));

  document.getElementById('adv-assign-btn')?.addEventListener('click', () => openAssignModal(container));
}

function handleRow(action, row, container) {
  if (action === 'view') {
    const lec = DB.getById('lecturers', row.lecturerId);
    const advisees = ensureAdvisorAssignments().filter(a => a.lecturerId === row.lecturerId && a.status === 'aktif');
    const pendingKrs = DB.getAll('krsPlans').filter(p =>
      advisees.some(a => a.studentId === p.studentId) && p.status === 'Menunggu Persetujuan Dosen Wali'
    ).length;
    openModal({
      title: `Penugasan — ${row.nim}`,
      size: 'lg',
      body: `
        <div class="stat-row"><span class="stat-row-label">Mahasiswa</span><span class="stat-row-value">${esc(row.studentName)} (${esc(row.nim)})</span></div>
        <div class="stat-row"><span class="stat-row-label">Dosen wali</span><span class="stat-row-value">${esc(row.lecturerName)}</span></div>
        <div class="stat-row"><span class="stat-row-label">NIDN</span><span class="stat-row-value">${esc(row.nidn)}</span></div>
        <div class="stat-row"><span class="stat-row-label">Prodi</span><span class="stat-row-value">${esc(row.prodiName)}</span></div>
        <div class="stat-row"><span class="stat-row-label">Periode</span><span class="stat-row-value">${formatDate(row.startDate)}${row.endDate ? ` – ${formatDate(row.endDate)}` : ' – sekarang'}</span></div>
        <div class="stat-row"><span class="stat-row-label">Status</span><span class="stat-row-value">${statusBadge(row.status === 'aktif' ? 'aktif' : 'selesai')}</span></div>
        ${row.note ? `<div class="info-box" style="margin-top:1rem">${esc(row.note)}</div>` : ''}
        <div class="info-box" style="margin-top:1rem">
          <i class="bi bi-people"></i> Beban bimbingan aktif dosen ini: <strong>${advisees.length}</strong> mahasiswa
          · KRS menunggu: <strong>${pendingKrs}</strong>
          ${lec ? ` · <a href="#/portal/lecturer/krs">Buka antrean KRS</a> (setelah ganti peran ke Dosen)` : ''}
        </div>`,
    });
    return;
  }

  if (action === 'end') {
    openFormModal({
      title: 'Akhiri penugasan dosen wali',
      fields: [
        { key: 'endDate', label: 'Tanggal berakhir', type: 'date', required: true, default: today() },
        { key: 'note', label: 'Alasan / catatan', type: 'textarea', required: true, placeholder: 'Contoh: Pindah dosen wali / mahasiswa lulus...' },
      ],
      onSave: (data, close) => {
        if (!String(data.note || '').trim()) {
          showToast('Catatan wajib diisi.', 'warning');
          return;
        }
        endAssignment(row, data.endDate, data.note);
        DB.log('Akhiri Dosen Wali', 'Akademik', `${row.nim} lepas dari ${row.lecturerName}`);
        close();
        showToast('Penugasan diakhiri.', 'warning');
        renderAdvisors('/academic/advisors', container);
      },
    });
    return;
  }

  if (action === 'change') {
    openAssignModal(container, { studentId: row.studentId, excludeLecturerId: row.lecturerId });
  }
}

function openAssignModal(container, preset = {}) {
  const students = DB.getAll('students').filter(s => ['aktif', 'cuti'].includes(s.status));
  const lecturers = DB.getAll('lecturers').filter(l => l.status === 'aktif');
  const programs = DB.getAll('studyPrograms');

  openFormModal({
    title: preset.studentId ? 'Ganti dosen wali' : 'Tetapkan dosen wali',
    fields: [
      {
        key: 'studentId',
        label: 'Mahasiswa',
        type: 'select',
        required: true,
        options: students.map(s => {
          const p = programs.find(x => x.id === s.prodiId);
          const cur = s.advisor ? DB.getById('lecturers', s.advisor)?.name : 'belum ada wali';
          return { value: s.id, label: `${s.nim} — ${s.name} (${p?.code || '-'}) · ${cur}` };
        }),
        default: preset.studentId || '',
      },
      {
        key: 'lecturerId',
        label: 'Dosen wali',
        type: 'select',
        required: true,
        options: lecturers
          .filter(l => l.id !== preset.excludeLecturerId)
          .map(l => {
            const n = ensureAdvisorAssignments().filter(a => a.lecturerId === l.id && a.status === 'aktif').length;
            const p = programs.find(x => x.id === l.prodiId);
            return { value: l.id, label: `${l.name} · ${p?.code || '-'} · bimbingan ${n}` };
          }),
      },
      { key: 'startDate', label: 'Tanggal mulai berlaku', type: 'date', required: true, default: today() },
      { key: 'note', label: 'Catatan', type: 'textarea', placeholder: 'Opsional' },
    ],
    values: { studentId: preset.studentId || '', startDate: today() },
    onSave: (data, close) => {
      const result = assignAdvisor({
        studentId: data.studentId,
        lecturerId: data.lecturerId,
        startDate: data.startDate,
        note: data.note || '',
      });
      showToast(result.msg, result.ok ? 'success' : 'danger');
      if (result.ok) {
        close();
        renderAdvisors('/academic/advisors', container);
      }
    },
  });
}

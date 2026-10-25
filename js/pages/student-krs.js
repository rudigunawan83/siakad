/**
 * SIAKAD â€” Portal Mahasiswa: Isi KRS, KRS Saya, Cetak KRS
 * Sesuai design.md bagian 8.3–8.7
 */

import { DB } from '../data/seed.js';
import { AppState } from '../state.js?v=20261025ab';
import { formatDate, formatDateTime, generateId, statusBadge } from '../utils.js';
import { showToast, showConfirm } from '../components/toast.js';
import { openModal } from '../components/modal.js';
import { scopeRows } from '../campus-scope.js';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const EDITABLE = ['Draft', 'Perlu Revisi', 'Belum Dibuat'];

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getStudent() {
  const role = AppState.currentRole;
  return scopeRows(DB.getAll('students')).find(s => s.id === (role.studentId || 'stu-1'));
}

export function getPolicy() {
  return DB.get('krsPolicy') || {
    requireRegistrationBeforeKrs: true,
    advisorApprovalRequired: true,
    allowCancelSubmission: true,
    allowPrintBeforeFinal: true,
    allowCrossProdi: false,
    allowRetake: null,
    holdSeatOn: 'submit',
    finalizeOn: 'period_lock',
    periodOpen: true,
    changePeriodOpen: false,
  };
}

function getRegistration(studentId, semesterId = 'sem-1') {
  return DB.getAll('semesterRegistrations').find(r => r.studentId === studentId && r.semesterId === semesterId);
}

export function calcIpsLast(studentId) {
  const grades = DB.getAll('grades').filter(g => g.studentId === studentId && g.status === 'final' && g.mutu != null);
  if (!grades.length) return null;
  const bySem = {};
  grades.forEach(g => {
    if (!bySem[g.semesterId]) bySem[g.semesterId] = [];
    bySem[g.semesterId].push(g);
  });
  const semIds = Object.keys(bySem).sort();
  const last = bySem[semIds[semIds.length - 1]];
  const sks = last.reduce((s, g) => s + (g.sks || 0), 0);
  const mutu = last.reduce((s, g) => s + (g.mutu || 0) * (g.sks || 0), 0);
  return sks ? Math.round((mutu / sks) * 100) / 100 : null;
}

export function maxSksFromIps(ips) {
  if (ips == null) return 20;
  if (ips >= 3) return 24;
  if (ips >= 2.5) return 21;
  if (ips >= 2) return 18;
  return 15;
}

function passedCourseIds(studentId) {
  return new Set(
    DB.getAll('grades')
      .filter(g => g.studentId === studentId && g.status === 'final' && (g.mutu ?? 0) > 0)
      .map(g => g.courseId)
  );
}

function getOrCreatePlan(studentId, semesterId = 'sem-1') {
  let plans = DB.getAll('krsPlans');
  let plan = plans.find(p => p.studentId === studentId && p.semesterId === semesterId);
  if (!plan) {
    plan = {
      id: generateId('krs'),
      studentId,
      semesterId,
      status: 'Belum Dibuat',
      items: [],
      submittedAt: null,
      decidedAt: null,
      advisorNote: '',
      history: [],
    };
    plans.push(plan);
    DB.save('krsPlans', plans);
  }
  return plan;
}

export function savePlan(plan) {
  const plans = DB.getAll('krsPlans');
  const idx = plans.findIndex(p => p.id === plan.id);
  if (idx >= 0) plans[idx] = plan;
  else plans.push(plan);
  DB.save('krsPlans', plans);
}

export function pushHistory(plan, from, to, by, note = '') {
  plan.history = plan.history || [];
  plan.history.push({ at: new Date().toISOString(), from, to, by, note });
}

function timeToMin(t) {
  const [h, m] = String(t || '0:0').split(':').map(Number);
  return h * 60 + m;
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return timeToMin(aStart) < timeToMin(bEnd) && timeToMin(bStart) < timeToMin(aEnd);
}

function heldSeats(classId, excludePlanId) {
  const policy = getPolicy();
  return DB.getAll('krsPlans').reduce((n, p) => {
    if (p.id === excludePlanId) return n;
    const counts = ['Menunggu Persetujuan Dosen Wali', 'Disetujui', 'Final'];
    if (policy.holdSeatOn === 'draft') counts.push('Draft', 'Perlu Revisi');
    if (!counts.includes(p.status)) return n;
    return n + (p.items || []).filter(i => i.classId === classId).length;
  }, 0);
}

function seatsLeft(cls, excludePlanId) {
  return Math.max(0, (cls.capacity || 0) - (cls.enrolled || 0) - heldSeats(cls.id, excludePlanId));
}

function seatLabel(left, capacity) {
  if (left <= 0) return { text: 'Penuh', cls: 'badge-danger' };
  const almost = left <= 3 || left <= Math.ceil(capacity * 0.1);
  if (almost) return { text: `Hampir penuh (${left})`, cls: 'badge-warning' };
  return { text: `Tersedia (${left})`, cls: 'badge-success' };
}

function prereqStatus(course, passed) {
  if (!course) return { ok: false, text: 'Belum dapat diperiksa', icon: 'bi-question-circle', tone: 'muted' };
  if (!course.prerequisite) return { ok: true, text: 'Tidak ada prasyarat', icon: 'bi-dash-circle', tone: 'muted' };
  if (passed.has(course.prerequisite)) return { ok: true, text: 'Terpenuhi', icon: 'bi-check-circle-fill', tone: 'success' };
  const pre = DB.getById('courses', course.prerequisite);
  return { ok: false, text: `Belum terpenuhi${pre ? ` (${pre.code})` : ''}`, icon: 'bi-x-circle-fill', tone: 'danger' };
}

function canEditPlan(plan, policy) {
  if (!policy.periodOpen && plan.status !== 'Final') return false;
  if (plan.status === 'Final') return !!policy.changePeriodOpen;
  return EDITABLE.includes(plan.status) || plan.status === 'Belum Dibuat';
}

function validateAdd(student, plan, cls, course, policy) {
  const errors = [];
  if (student.status !== 'aktif') {
    errors.push({ msg: 'Status akademik tidak mengizinkan pengisian KRS (demo: hanya Aktif).' });
  }
  if (policy.requireRegistrationBeforeKrs) {
    const reg = getRegistration(student.id, plan.semesterId);
    if (!reg) errors.push({ msg: 'Data registrasi semester belum dapat diperiksa.' });
    else if (reg.status !== 'Teregistrasi') {
      errors.push({ msg: `Registrasi semester belum memenuhi syarat (status: ${reg.status}).`, link: '#/portal/student/registration' });
    }
  }
  if (!policy.periodOpen && plan.status !== 'Final') {
    errors.push({ msg: 'Periode pengisian KRS sedang ditutup.' });
  }
  if (!canEditPlan(plan, policy)) {
    errors.push({ msg: `Status KRS "${plan.status}" tidak mengizinkan perubahan isi.` });
  }
  if (course?.prodiId && course.prodiId !== student.prodiId && !policy.allowCrossProdi) {
    errors.push({ msg: `Mata kuliah ${course.code} di luar kurikulum program studi Anda.` });
  }

  const passed = passedCourseIds(student.id);
  const pre = prereqStatus(course, passed);
  if (course?.prerequisite && !pre.ok) {
    errors.push({ msg: `Prasyarat ${course.code} belum terpenuhi.`, id: course.id });
  }

  if (passed.has(course?.id)) {
    if (policy.allowRetake == null) {
      errors.push({ msg: `Mata kuliah ${course.code} pernah ditempuh. Aturan mengulang belum dikonfigurasi (belum dapat diperiksa).` });
    } else if (!policy.allowRetake) {
      errors.push({ msg: `Mata kuliah ${course.code} tidak boleh diulang.` });
    }
  }

  const ips = calcIpsLast(student.id);
  const maxSks = maxSksFromIps(ips);
  const current = (plan.items || []).reduce((s, i) => s + (i.sks || 0), 0);
  if (current + (course?.sks || 0) > maxSks) {
    errors.push({ msg: `Total SKS akan ${current + (course?.sks || 0)}, melebihi batas ${maxSks} SKS.` });
  }

  const left = seatsLeft(cls, plan.id);
  if (left <= 0) errors.push({ msg: `Kelas ${cls.code} penuh.` });

  if ((plan.items || []).some(i => i.classId === cls.id)) {
    errors.push({ msg: `Kelas ${cls.code} sudah ada di draft KRS.` });
  }
  if ((plan.items || []).some(i => i.courseId === course.id)) {
    errors.push({ msg: `Mata kuliah ${course.code} sudah ada di draft (kelas lain).` });
  }

  for (const item of plan.items || []) {
    if (item.day === cls.day && rangesOverlap(item.startTime, item.endTime, cls.startTime, cls.endTime)) {
      errors.push({
        msg: `Bentrok jadwal dengan ${item.code} (${item.day} ${item.startTime}–${item.endTime}) dan ${course.code} (${cls.day} ${cls.startTime}–${cls.endTime}).`,
      });
    }
  }

  return errors;
}

export function validateSubmit(student, plan, policy) {
  const errors = [];
  if (!(plan.items || []).length) errors.push({ msg: 'Draft KRS masih kosong.' });
  if (!canEditPlan(plan, policy) && plan.status !== 'Perlu Revisi' && plan.status !== 'Draft') {
    errors.push({ msg: 'Status KRS tidak mengizinkan pengajuan.' });
  }
  if (policy.requireRegistrationBeforeKrs) {
    const reg = getRegistration(student.id, plan.semesterId);
    if (!reg || reg.status !== 'Teregistrasi') {
      errors.push({ msg: 'Registrasi semester belum Teregistrasi; pengajuan KRS ditolak.' });
    }
  }
  if (!policy.periodOpen) errors.push({ msg: 'Periode pengisian KRS ditutup.' });
  if (policy.advisorApprovalRequired && !student.advisor) {
    errors.push({ msg: 'Dosen wali belum ditetapkan; pengajuan tidak dapat dikirim.' });
  }

  for (const item of plan.items || []) {
    const cls = DB.getById('classes', item.classId);
    const course = DB.getById('courses', item.courseId);
    if (!cls || !course) {
      errors.push({ msg: `Item ${item.code} tidak valid.` });
      continue;
    }
    const addErr = validateAdd(student, { ...plan, items: plan.items.filter(i => i.classId !== item.classId) }, cls, course, policy);
    // Re-validate each item against others; simpler: check seats and prereq again
    const passed = passedCourseIds(student.id);
    const pre = prereqStatus(course, passed);
    if (course.prerequisite && !pre.ok) errors.push({ msg: `Prasyarat ${course.code} belum terpenuhi.` });
    if (seatsLeft(cls, plan.id) <= 0 && policy.holdSeatOn === 'submit') {
      // seats for own plan not counted in held until submit â€” check raw
      const rawLeft = Math.max(0, cls.capacity - cls.enrolled - heldSeats(cls.id, plan.id));
      if (rawLeft <= 0) errors.push({ msg: `Kelas ${cls.code} sudah penuh.` });
    }
  }

  // Conflict among items
  const items = plan.items || [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]; const b = items[j];
      if (a.day === b.day && rangesOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
        errors.push({ msg: `Bentrok antara ${a.code} dan ${b.code} (${a.day}).` });
      }
    }
  }

  const ips = calcIpsLast(student.id);
  const maxSks = maxSksFromIps(ips);
  const total = items.reduce((s, i) => s + (i.sks || 0), 0);
  if (total > maxSks) errors.push({ msg: `Total ${total} SKS melebihi batas ${maxSks}.` });

  return errors;
}

export function syncEnrollments(plan) {
  const all = DB.getAll('enrollments').filter(
    e => !(e.studentId === plan.studentId && e.semesterId === plan.semesterId)
  );
  const statusMap = {
    'Menunggu Persetujuan Dosen Wali': 'diajukan',
    Disetujui: 'disetujui',
    Final: 'disetujui',
    Draft: 'draft',
    'Perlu Revisi': 'perlu revisi',
  };
  const st = statusMap[plan.status] || 'draft';
  (plan.items || []).forEach(item => {
    all.push({
      id: generateId('enr'),
      studentId: plan.studentId,
      classId: item.classId,
      semesterId: plan.semesterId,
      status: st,
      approvedBy: ['Disetujui', 'Final'].includes(plan.status) ? plan.studentId && DB.getById('students', plan.studentId)?.advisor : null,
      approvedAt: plan.decidedAt ? String(plan.decidedAt).slice(0, 10) : null,
    });
  });
  DB.save('enrollments', all);
}

function sksMeter(total, max) {
  const pct = max ? (total / max) * 100 : 0;
  let tone = 'ok';
  if (pct >= 100) tone = 'over';
  else if (pct >= 80) tone = 'warn';
  return { pct: Math.min(pct, 100), tone, label: `${total} dari ${max} SKS` };
}

// ===================== RENDER EDIT =====================
export function renderStudentKrsEdit(path, container) {
  const student = getStudent();
  if (!student) {
    container.innerHTML = '<div class="page-container"><p>Data mahasiswa tidak ditemukan untuk kampus yang sedang dipilih.</p></div>';
    return;
  }

  const policy = getPolicy();
  const plan = getOrCreatePlan(student.id);
  const prodi = DB.getById('studyPrograms', student.prodiId);
  const advisor = DB.getById('lecturers', student.advisor);
  const reg = getRegistration(student.id);
  const ips = calcIpsLast(student.id);
  const maxSks = maxSksFromIps(ips);
  const totalSks = (plan.items || []).reduce((s, i) => s + (i.sks || 0), 0);
  const meter = sksMeter(totalSks, maxSks);
  const editable = canEditPlan(plan, policy);
  const semester = DB.getById('semesters', plan.semesterId);

  const filters = window._krsFilters || { q: '', sem: 'all', type: 'all', prereq: 'all', seat: 'all' };
  window._krsFilters = filters;

  container.innerHTML = `
<div class="page-container portal-container krs-page">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Isi KRS</h1>
      <p class="page-desc">${semester?.name || 'Semester aktif'} · Prototype demo</p>
    </div>
    <div class="page-actions">
      <a href="#/portal/student/krs" class="btn btn-secondary"><i class="bi bi-journal-text"></i> KRS Saya</a>
      <a href="#/portal/student" class="btn btn-secondary"><i class="bi bi-house"></i> Portal</a>
    </div>
  </div>

  <div class="krs-summary sticky-summary" role="status" aria-live="polite">
    <div class="krs-summary-grid">
      <div><span class="krs-sum-label">Mahasiswa</span><strong>${esc(student.name)}</strong><div class="krs-sum-sub">${esc(student.nim)}</div></div>
      <div><span class="krs-sum-label">Program studi</span><strong>${esc(prodi?.name || '-')}</strong></div>
      <div><span class="krs-sum-label">Dosen wali</span><strong>${esc(advisor?.name || 'Dosen wali belum ditetapkan')}</strong></div>
      <div><span class="krs-sum-label">IPK / IPS terakhir</span><strong>${student.ipk.toFixed(2)} / ${ips == null ? 'â€”' : ips.toFixed(2)}</strong></div>
      <div><span class="krs-sum-label">Status registrasi</span>${reg ? statusBadge(reg.status) : '<span class="badge badge-muted">Belum dapat diperiksa</span>'}</div>
      <div><span class="krs-sum-label">Status KRS</span><span class="badge badge-info" id="krs-status-badge">${esc(plan.status)}</span></div>
    </div>
    <div class="krs-sks-block">
      <div class="krs-sks-text">${esc(meter.label)} · Batas berdasarkan IPS demo</div>
      <div class="krs-sks-bar"><div class="krs-sks-fill krs-sks-${meter.tone}" style="width:${meter.pct}%"></div></div>
    </div>
    ${plan.advisorNote ? `<div class="info-box info-box-warning" style="margin-top:0.75rem"><i class="bi bi-chat-left-text"></i> <strong>Catatan dosen wali:</strong> ${esc(plan.advisorNote)}</div>` : ''}
  </div>

  <div id="krs-error-summary" class="pmb-error-summary" role="alert" tabindex="-1" hidden></div>

  <div class="krs-layout">
    <div class="krs-main">
      <div class="card" style="margin-bottom:1rem">
        <div class="card-header"><h3 class="card-title">Mata kuliah tersedia</h3></div>
        <div class="card-body-sm">
          <div class="filter-bar" style="margin:0;border:0;padding:0 0 0.75rem;flex-wrap:wrap">
            <div class="search-input" style="flex:1;min-width:160px">
              <i class="bi bi-search"></i>
              <input type="text" id="krs-search" placeholder="Cari kode atau nama..." value="${esc(filters.q)}">
            </div>
            <select class="filter-select" id="krs-f-sem">
              <option value="all">Semua semester</option>
              ${[1,2,3,4,5,6,7,8].map(n => `<option value="${n}" ${filters.sem === String(n) ? 'selected' : ''}>Sem. ${n}</option>`).join('')}
            </select>
            <select class="filter-select" id="krs-f-type">
              <option value="all">Semua jenis</option>
              <option value="wajib" ${filters.type === 'wajib' ? 'selected' : ''}>Wajib</option>
              <option value="pilihan" ${filters.type === 'pilihan' ? 'selected' : ''}>Pilihan</option>
            </select>
            <select class="filter-select" id="krs-f-prereq">
              <option value="all">Semua prasyarat</option>
              <option value="ok" ${filters.prereq === 'ok' ? 'selected' : ''}>Terpenuhi</option>
              <option value="no" ${filters.prereq === 'no' ? 'selected' : ''}>Belum terpenuhi</option>
            </select>
            <select class="filter-select" id="krs-f-seat">
              <option value="all">Semua kursi</option>
              <option value="open" ${filters.seat === 'open' ? 'selected' : ''}>Masih tersedia</option>
            </select>
          </div>
          <div class="scroll-x" id="krs-course-table"></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3 class="card-title">Jadwal mingguan (draft)</h3></div>
        <div class="card-body-sm" id="krs-week-grid"></div>
      </div>
    </div>

    <aside class="krs-side">
      <div class="card">
        <div class="card-header"><h3 class="card-title">Draft KRS</h3><span class="badge badge-navy">${(plan.items || []).length} MK</span></div>
        <div class="card-body-sm" id="krs-draft-list"></div>
        <div class="krs-actions">
          <button type="button" class="btn btn-secondary btn-block" id="krs-save-draft" ${editable ? '' : 'disabled'}><i class="bi bi-save"></i> Simpan Draft</button>
          <button type="button" class="btn btn-accent btn-block" id="krs-submit" ${editable ? '' : 'disabled'}><i class="bi bi-send"></i> Ajukan KRS</button>
          <button type="button" class="btn btn-warning btn-block" id="krs-cancel" ${plan.status === 'Menunggu Persetujuan Dosen Wali' && policy.allowCancelSubmission ? '' : 'disabled'} title="${policy.allowCancelSubmission ? '' : 'Kebijakan demo tidak mengizinkan batal pengajuan'}"><i class="bi bi-x-circle"></i> Batalkan Pengajuan</button>
          <a class="btn btn-secondary btn-block ${['Disetujui', 'Final'].includes(plan.status) || (policy.allowPrintBeforeFinal && plan.status === 'Disetujui') ? '' : 'disabled'}" href="#/portal/student/krs/print" id="krs-print-link"><i class="bi bi-printer"></i> Cetak KRS</a>
        </div>
        <p class="krs-policy-note">Kebijakan demo: registrasi ${policy.requireRegistrationBeforeKrs ? 'wajib' : 'tidak wajib'} sebelum KRS · persetujuan dosen wali ${policy.advisorApprovalRequired ? 'wajib' : 'tidak wajib'}.</p>
      </div>
    </aside>
  </div>
</div>`;

  renderCourseTable(container, student, plan, policy, filters);
  renderDraftList(container, student, plan, policy);
  renderWeekGrid(container, plan);
  bindKrsEdit(container, student, plan, policy);
}

function availableClasses(student, policy) {
  return scopeRows(DB.getAll('classes')).filter(cl => {
    if (cl.semesterId !== 'sem-1' || cl.status !== 'aktif') return false;
    if (cl.campusId && cl.campusId !== student.campusId) return false;
    if (!policy.allowCrossProdi && cl.prodiId && cl.prodiId !== student.prodiId) return false;
    return true;
  });
}

function renderCourseTable(container, student, plan, policy, filters) {
  const passed = passedCourseIds(student.id);
  const lecturers = scopeRows(DB.getAll('lecturers'));
  let rows = availableClasses(student, policy).map(cl => {
    const course = DB.getById('courses', cl.courseId);
    const lec = lecturers.find(l => l.id === cl.lecturerId);
    const pre = prereqStatus(course, passed);
    const left = seatsLeft(cl, plan.id);
    const seat = seatLabel(left, cl.capacity);
    return { cl, course, lec, pre, left, seat };
  });

  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(r =>
      (r.course?.code || '').toLowerCase().includes(q) ||
      (r.course?.name || '').toLowerCase().includes(q) ||
      (r.cl.code || '').toLowerCase().includes(q)
    );
  }
  if (filters.sem !== 'all') rows = rows.filter(r => String(r.course?.semester) === filters.sem);
  if (filters.type !== 'all') rows = rows.filter(r => r.course?.type === filters.type);
  if (filters.prereq === 'ok') rows = rows.filter(r => r.pre.ok);
  if (filters.prereq === 'no') rows = rows.filter(r => !r.pre.ok && r.course?.prerequisite);
  if (filters.seat === 'open') rows = rows.filter(r => r.left > 0);

  const el = container.querySelector('#krs-course-table');
  if (!rows.length) {
    el.innerHTML = `<div class="empty-state" style="padding:1.5rem"><div class="empty-state-title">Tidak ada kelas</div><div class="empty-state-desc">Ubah filter atau pastikan kelas dibuka untuk prodi Anda.</div></div>`;
    return;
  }

  const editable = canEditPlan(plan, policy);
  el.innerHTML = `
<table class="data-table krs-table">
  <thead>
    <tr>
      <th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Sem.</th><th>Kelas</th><th>Dosen</th>
      <th>Jadwal</th><th>Ruang</th><th>Kursi</th><th>Prasyarat</th><th>Aksi</th>
    </tr>
  </thead>
  <tbody>
    ${rows.map(r => {
      const inDraft = (plan.items || []).some(i => i.classId === r.cl.id);
      const full = r.left <= 0;
      return `<tr id="krs-row-${r.cl.id}">
        <td><code>${esc(r.course?.code)}</code></td>
        <td><strong>${esc(r.course?.name)}</strong><div style="font-size:10px;color:var(--color-muted)">${esc(r.course?.type || '')}</div></td>
        <td>${r.course?.sks ?? '-'}</td>
        <td>${r.course?.semester ?? '-'}</td>
        <td>${esc(r.cl.code)}</td>
        <td>${esc(r.lec?.name || '-')}</td>
        <td>${esc(r.cl.day)} ${esc(r.cl.startTime)}–${esc(r.cl.endTime)}</td>
        <td>${esc(r.cl.room)}</td>
        <td><span class="badge ${r.seat.cls}">${esc(r.seat.text)}</span></td>
        <td><span class="krs-prereq krs-prereq-${r.pre.tone}"><i class="bi ${r.pre.icon}" aria-hidden="true"></i> ${esc(r.pre.text)}</span></td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" data-detail="${r.cl.id}" title="Detail"><i class="bi bi-info-circle"></i></button>
          <button type="button" class="btn btn-accent btn-sm" data-add="${r.cl.id}"
            ${!editable || inDraft || full ? 'disabled' : ''}
            title="${inDraft ? 'Sudah di draft' : full ? 'Kelas penuh' : 'Tambah ke KRS'}">
            <i class="bi bi-plus-lg"></i>
          </button>
        </td>
      </tr>`;
    }).join('')}
  </tbody>
</table>`;
}

function renderDraftList(container, student, plan, policy) {
  const el = container.querySelector('#krs-draft-list');
  const editable = canEditPlan(plan, policy);
  const items = plan.items || [];
  if (!items.length) {
    el.innerHTML = `<div class="empty-state" style="padding:1rem"><div class="empty-state-desc">Belum ada mata kuliah. Tambah dari daftar kiri.</div></div>`;
    return;
  }
  el.innerHTML = items.map(i => `
    <div class="krs-draft-item" id="draft-${i.classId}">
      <div>
        <strong>${esc(i.code)}</strong> · ${esc(i.name)}
        <div class="krs-draft-meta">${i.sks} SKS · ${esc(i.classCode)} · ${esc(i.day)} ${esc(i.startTime)}–${esc(i.endTime)}</div>
      </div>
      <button type="button" class="btn btn-danger btn-sm" data-remove="${i.classId}" ${editable ? '' : 'disabled'} title="Hapus"><i class="bi bi-trash"></i></button>
    </div>`).join('');
}

function renderWeekGrid(container, plan) {
  const el = container.querySelector('#krs-week-grid');
  const items = plan.items || [];
  if (!items.length) {
    el.innerHTML = `<p class="krs-policy-note" style="margin:0">Jadwal muncul setelah ada mata kuliah di draft.</p>`;
    return;
  }
  const conflictIds = new Set();
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (items[i].day === items[j].day && rangesOverlap(items[i].startTime, items[i].endTime, items[j].startTime, items[j].endTime)) {
        conflictIds.add(items[i].classId);
        conflictIds.add(items[j].classId);
      }
    }
  }
  el.innerHTML = `
<div class="krs-week">
  ${DAYS.map(day => {
    const dayItems = items.filter(i => i.day === day).sort((a, b) => timeToMin(a.startTime) - timeToMin(b.startTime));
    return `<div class="krs-week-col">
      <div class="krs-week-day">${day}</div>
      ${dayItems.length ? dayItems.map(i => `
        <div class="krs-week-slot ${conflictIds.has(i.classId) ? 'conflict' : ''}">
          <strong>${esc(i.code)}</strong>
          <span>${esc(i.startTime)}–${esc(i.endTime)}</span>
          <span>${esc(i.room)}</span>
          ${conflictIds.has(i.classId) ? '<span class="krs-conflict-label">Bentrok</span>' : ''}
        </div>`).join('') : '<div class="krs-week-empty">â€”</div>'}
    </div>`;
  }).join('')}
</div>`;
}

function showKrsErrors(container, errors) {
  const box = container.querySelector('#krs-error-summary');
  if (!box) return;
  box.hidden = false;
  box.innerHTML = `<h2>Tidak dapat melanjutkan</h2><ul>${errors.map(e => `<li>${e.link ? `<a href="${e.link}">${esc(e.msg)}</a>` : esc(e.msg)}</li>`).join('')}</ul>`;
  box.focus();
  showToast(errors[0].msg, 'warning');
}

function clearKrsErrors(container) {
  const box = container.querySelector('#krs-error-summary');
  if (box) { box.hidden = true; box.innerHTML = ''; }
}

function refreshEdit(container, student, plan, policy) {
  savePlan(plan);
  const filters = window._krsFilters || { q: '', sem: 'all', type: 'all', prereq: 'all', seat: 'all' };
  const totalSks = (plan.items || []).reduce((s, i) => s + (i.sks || 0), 0);
  const ips = calcIpsLast(student.id);
  const maxSks = maxSksFromIps(ips);
  const meter = sksMeter(totalSks, maxSks);
  const fill = container.querySelector('.krs-sks-fill');
  const text = container.querySelector('.krs-sks-text');
  if (fill) {
    fill.style.width = `${meter.pct}%`;
    fill.className = `krs-sks-fill krs-sks-${meter.tone}`;
  }
  if (text) text.textContent = `${meter.label} · Batas berdasarkan IPS demo`;
  const badge = container.querySelector('#krs-status-badge');
  if (badge) badge.textContent = plan.status;
  renderCourseTable(container, student, plan, policy, filters);
  renderDraftList(container, student, plan, policy);
  renderWeekGrid(container, plan);
  bindRowActions(container, student, plan, policy);
}

function bindRowActions(container, student, plan, policy) {
  container.querySelectorAll('[data-add]').forEach(btn => {
    btn.onclick = () => {
      const classId = btn.getAttribute('data-add');
      const cls = DB.getById('classes', classId);
      const course = DB.getById('courses', cls?.courseId);
      const errors = validateAdd(student, plan, cls, course, policy);
      if (errors.length) {
        showKrsErrors(container, errors);
        return;
      }
      clearKrsErrors(container);
      if (plan.status === 'Belum Dibuat') {
        pushHistory(plan, 'Belum Dibuat', 'Draft', 'Mahasiswa', 'Mulai draft');
        plan.status = 'Draft';
      }
      const lec = DB.getById('lecturers', cls.lecturerId);
      plan.items.push({
        classId: cls.id,
        courseId: course.id,
        code: course.code,
        name: course.name,
        sks: course.sks,
        classCode: cls.code,
        day: cls.day,
        startTime: cls.startTime,
        endTime: cls.endTime,
        room: cls.room,
        lecturerId: cls.lecturerId,
        lecturerName: lec?.name || '',
      });
      savePlan(plan);
      showToast(`${course.code} ditambahkan ke draft.`, 'success');
      refreshEdit(container, student, plan, policy);
    };
  });

  container.querySelectorAll('[data-remove]').forEach(btn => {
    btn.onclick = () => {
      const classId = btn.getAttribute('data-remove');
      plan.items = (plan.items || []).filter(i => i.classId !== classId);
      savePlan(plan);
      showToast('Mata kuliah dihapus dari draft.', 'info');
      refreshEdit(container, student, plan, policy);
    };
  });

  container.querySelectorAll('[data-detail]').forEach(btn => {
    btn.onclick = () => {
      const cls = DB.getById('classes', btn.getAttribute('data-detail'));
      const course = DB.getById('courses', cls?.courseId);
      const lec = DB.getById('lecturers', cls?.lecturerId);
      const passed = passedCourseIds(student.id);
      const pre = prereqStatus(course, passed);
      const preCourse = course?.prerequisite ? DB.getById('courses', course.prerequisite) : null;
      openModal({
        title: `Detail â€” ${course?.code || ''}`,
        body: `
          <div class="stat-row"><span class="stat-row-label">Nama</span><span class="stat-row-value">${esc(course?.name)}</span></div>
          <div class="stat-row"><span class="stat-row-label">SKS</span><span class="stat-row-value">${course?.sks} (teori ${course?.sksTeori}, praktik ${course?.sksPraktik})</span></div>
          <div class="stat-row"><span class="stat-row-label">Jenis</span><span class="stat-row-value">${esc(course?.type)}</span></div>
          <div class="stat-row"><span class="stat-row-label">Prasyarat</span><span class="stat-row-value">${preCourse ? `${preCourse.code} â€” ${pre.text}` : pre.text}</span></div>
          <div class="stat-row"><span class="stat-row-label">Kelas</span><span class="stat-row-value">${esc(cls?.code)}</span></div>
          <div class="stat-row"><span class="stat-row-label">Dosen</span><span class="stat-row-value">${esc(lec?.name)}</span></div>
          <div class="stat-row"><span class="stat-row-label">Jadwal</span><span class="stat-row-value">${esc(cls?.day)} ${esc(cls?.startTime)}–${esc(cls?.endTime)}</span></div>
          <div class="stat-row"><span class="stat-row-label">Ruang</span><span class="stat-row-value">${esc(cls?.room)}</span></div>
          <div class="stat-row"><span class="stat-row-label">Kapasitas</span><span class="stat-row-value">${cls?.enrolled}/${cls?.capacity} · sisa ${seatsLeft(cls, plan.id)}</span></div>`,
      });
    };
  });
}

function bindKrsEdit(container, student, plan, policy) {
  const applyFilters = () => {
    window._krsFilters = {
      q: container.querySelector('#krs-search')?.value || '',
      sem: container.querySelector('#krs-f-sem')?.value || 'all',
      type: container.querySelector('#krs-f-type')?.value || 'all',
      prereq: container.querySelector('#krs-f-prereq')?.value || 'all',
      seat: container.querySelector('#krs-f-seat')?.value || 'all',
    };
    renderCourseTable(container, student, plan, policy, window._krsFilters);
    bindRowActions(container, student, plan, policy);
  };

  let t;
  container.querySelector('#krs-search')?.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(applyFilters, 200);
  });
  ['krs-f-sem', 'krs-f-type', 'krs-f-prereq', 'krs-f-seat'].forEach(id => {
    container.querySelector(`#${id}`)?.addEventListener('change', applyFilters);
  });

  bindRowActions(container, student, plan, policy);

  container.querySelector('#krs-save-draft')?.addEventListener('click', () => {
    if (plan.status === 'Belum Dibuat') {
      pushHistory(plan, 'Belum Dibuat', 'Draft', 'Mahasiswa', 'Simpan draft');
      plan.status = 'Draft';
    }
    savePlan(plan);
    showToast('Draft KRS disimpan.', 'success');
    refreshEdit(container, student, plan, policy);
  });

  container.querySelector('#krs-submit')?.addEventListener('click', async () => {
    const errors = validateSubmit(student, plan, policy);
    if (errors.length) {
      showKrsErrors(container, errors);
      return;
    }
    const total = (plan.items || []).reduce((s, i) => s + i.sks, 0);
    const ok = await showConfirm({
      title: 'Ajukan KRS?',
      message: `Mengajukan <strong>${plan.items.length}</strong> mata kuliah (<strong>${total} SKS</strong>) kepada dosen wali.`,
      confirmText: 'Ya, Ajukan',
      type: 'warning',
    });
    if (!ok) return;
    const from = plan.status;
    const next = policy.advisorApprovalRequired ? 'Menunggu Persetujuan Dosen Wali' : 'Disetujui';
    pushHistory(plan, from, next, 'Mahasiswa', 'Mengajukan KRS');
    plan.status = next;
    plan.submittedAt = new Date().toISOString();
    if (next === 'Disetujui') plan.decidedAt = plan.submittedAt;
    savePlan(plan);
    syncEnrollments(plan);
    DB.log('KRS: Ajukan', 'KRS', `${student.nim} ? ${next}`);
    const notifs = DB.getAll('notifications');
    notifs.unshift({
      id: generateId('notif'),
      type: 'krs',
      title: 'KRS diajukan mahasiswa',
      message: `${student.name} (${student.nim}) mengajukan KRS ${total} SKS.`,
      time: new Date().toISOString(),
      read: false,
      link: '#/portal/lecturer/krs',
      role: ['Dosen', 'Staf TU Akademik'],
    });
    DB.save('notifications', notifs.slice(0, 50));
    clearKrsErrors(container);
    showToast(`KRS diajukan. Status: ${next}`, 'success');
    location.hash = '#/portal/student/krs';
  });

  container.querySelector('#krs-cancel')?.addEventListener('click', async () => {
    if (!policy.allowCancelSubmission || plan.status !== 'Menunggu Persetujuan Dosen Wali') {
      showToast('Pembatalan pengajuan tidak diizinkan.', 'warning');
      return;
    }
    const ok = await showConfirm({
      title: 'Batalkan pengajuan?',
      message: 'Status kembali ke Draft. Item mata kuliah tetap tersimpan.',
      confirmText: 'Ya, Batalkan',
      type: 'warning',
    });
    if (!ok) return;
    pushHistory(plan, plan.status, 'Draft', 'Mahasiswa', 'Membatalkan pengajuan');
    plan.status = 'Draft';
    plan.submittedAt = null;
    savePlan(plan);
    syncEnrollments(plan);
    showToast('Pengajuan dibatalkan. KRS kembali Draft.', 'info');
    refreshEdit(container, student, plan, policy);
  });
}

// ===================== KRS SAYA =====================
export function renderStudentKrsView(path, container) {
  const student = getStudent();
  if (!student) {
    container.innerHTML = '<div class="page-container"><p>Data mahasiswa tidak ditemukan untuk kampus yang sedang dipilih.</p></div>';
    return;
  }
  const plan = getOrCreatePlan(student.id);
  const policy = getPolicy();
  const advisor = DB.getById('lecturers', student.advisor);
  const prodi = DB.getById('studyPrograms', student.prodiId);
  const semester = DB.getById('semesters', plan.semesterId);
  const total = (plan.items || []).reduce((s, i) => s + (i.sks || 0), 0);
  const canPrint = plan.status === 'Final' || (policy.allowPrintBeforeFinal && plan.status === 'Disetujui');
  const canEdit = canEditPlan(plan, policy) || plan.status === 'Belum Dibuat';

  container.innerHTML = `
<div class="page-container portal-container krs-page">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">KRS Saya</h1>
      <p class="page-desc">${esc(student.name)} · ${esc(student.nim)} · ${esc(prodi?.name || '')}</p>
    </div>
    <div class="page-actions">
      <a href="#/portal/student/krs/edit" class="btn btn-accent ${canEdit ? '' : 'disabled'}"><i class="bi bi-pencil-square"></i> Isi / Ubah KRS</a>
      <button type="button" class="btn btn-secondary" id="krs-view-print" ${canPrint ? '' : 'disabled'} title="${canPrint ? '' : 'Cetak hanya untuk status Disetujui/Final (kebijakan demo)'}"><i class="bi bi-printer"></i> Cetak</button>
      <a href="#/portal/student" class="btn btn-secondary">Portal</a>
    </div>
  </div>

  <div class="card" style="margin-bottom:1rem">
    <div class="card-body">
      <div class="krs-summary-grid">
        <div><span class="krs-sum-label">Semester</span><strong>${esc(semester?.name || '-')}</strong></div>
        <div><span class="krs-sum-label">Status</span>${statusBadge(plan.status)}</div>
        <div><span class="krs-sum-label">Total SKS</span><strong>${total}</strong></div>
        <div><span class="krs-sum-label">Dosen wali</span><strong>${esc(advisor?.name || 'â€”')}</strong></div>
        <div><span class="krs-sum-label">Diajukan</span><strong>${plan.submittedAt ? formatDateTime(plan.submittedAt) : 'â€”'}</strong></div>
        <div><span class="krs-sum-label">Keputusan</span><strong>${plan.decidedAt ? formatDateTime(plan.decidedAt) : 'â€”'}</strong></div>
      </div>
      ${plan.advisorNote ? `<div class="info-box info-box-warning" style="margin-top:1rem"><i class="bi bi-chat-left-text"></i> ${esc(plan.advisorNote)}</div>` : ''}
    </div>
  </div>

  <div class="card" style="margin-bottom:1rem">
    <div class="card-header"><h3 class="card-title">Mata kuliah</h3></div>
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Kode</th><th>Nama</th><th>SKS</th><th>Kelas</th><th>Dosen</th><th>Jadwal</th><th>Ruang</th></tr></thead>
        <tbody>
          ${(plan.items || []).length ? plan.items.map(i => {
            const lec = i.lecturerName || DB.getById('lecturers', i.lecturerId)?.name || '-';
            return `<tr>
              <td><code>${esc(i.code)}</code></td>
              <td>${esc(i.name)}</td>
              <td>${i.sks}</td>
              <td>${esc(i.classCode)}</td>
              <td>${esc(lec)}</td>
              <td>${esc(i.day)} ${esc(i.startTime)}–${esc(i.endTime)}</td>
              <td>${esc(i.room)}</td>
            </tr>`;
          }).join('') : `<tr><td colspan="7"><div class="empty-state" style="padding:1.5rem"><div class="empty-state-title">Belum ada mata kuliah</div><div class="empty-state-desc"><a href="#/portal/student/krs/edit">Isi KRS</a> untuk menambah kelas.</div></div></td></tr>`}
        </tbody>
        ${(plan.items || []).length ? `<tfoot><tr><td colspan="2"><strong>Total</strong></td><td><strong>${total}</strong></td><td colspan="4"></td></tr></tfoot>` : ''}
      </table>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><h3 class="card-title">Riwayat status</h3></div>
    <div class="card-body-sm">
      ${(plan.history || []).length ? [...plan.history].reverse().map(h => `
        <div class="activity-item">
          <div class="activity-icon" style="background:var(--color-navy-100);color:var(--color-navy-800)"><i class="bi bi-clock-history"></i></div>
          <div class="activity-body">
            <div class="activity-text"><strong>${esc(h.from)}</strong> ? <strong>${esc(h.to)}</strong> · ${esc(h.by)}${h.note ? ` â€” ${esc(h.note)}` : ''}</div>
            <div class="activity-time">${formatDateTime(h.at)}</div>
          </div>
        </div>`).join('') : `<p class="krs-policy-note">Belum ada riwayat.</p>`}
    </div>
  </div>
</div>`;

  container.querySelector('#krs-view-print')?.addEventListener('click', () => {
    if (!canPrint) return;
    location.hash = '#/portal/student/krs/print';
  });
}

// ===================== CETAK =====================
export function renderStudentKrsPrint(path, container) {
  const student = getStudent();
  if (!student) {
    container.innerHTML = '<div class="page-container"><p>Data mahasiswa tidak ditemukan untuk kampus yang sedang dipilih.</p></div>';
    return;
  }
  const plan = getOrCreatePlan(student.id);
  const policy = getPolicy();
  const canPrint = plan.status === 'Final' || (policy.allowPrintBeforeFinal && plan.status === 'Disetujui');
  if (!canPrint) {
    container.innerHTML = `
<div class="page-container">
  <div class="info-box info-box-warning"><i class="bi bi-printer"></i> Cetak KRS belum tersedia untuk status <strong>${esc(plan.status)}</strong>.
  <a href="#/portal/student/krs" class="btn btn-secondary btn-sm ms-2">Kembali</a></div>
</div>`;
    return;
  }
  const foundation = DB.get('foundation') || { name: 'Yayasan Cakrawala Pendidikan' };
  const campus = DB.getById('campuses', student.campusId);
  const prodi = DB.getById('studyPrograms', student.prodiId);
  const advisor = DB.getById('lecturers', student.advisor);
  const semester = DB.getById('semesters', plan.semesterId);
  const total = (plan.items || []).reduce((s, i) => s + (i.sks || 0), 0);

  container.innerHTML = `
<div class="page-container krs-print-page">
  <div class="no-print page-actions" style="margin-bottom:1rem;display:flex;gap:0.5rem">
    <button type="button" class="btn btn-accent" id="do-print"><i class="bi bi-printer"></i> Cetak</button>
    <a href="#/portal/student/krs" class="btn btn-secondary">Kembali</a>
  </div>
  <div class="krs-print-sheet">
    <header class="krs-print-head">
      <img src="assets/logo.svg" alt="" width="48" height="48">
      <div>
        <div class="krs-print-org">${esc(foundation.name || foundation.shortName)}</div>
        <div class="krs-print-campus">${esc(campus?.name)}</div>
        <div class="krs-print-doc">Kartu Rencana Studi (KRS)</div>
      </div>
    </header>
    <dl class="krs-print-meta">
      <div><dt>NIM</dt><dd>${esc(student.nim)}</dd></div>
      <div><dt>Nama</dt><dd>${esc(student.name)}</dd></div>
      <div><dt>Program studi</dt><dd>${esc(prodi?.name)}</dd></div>
      <div><dt>Angkatan</dt><dd>${student.angkatan}</dd></div>
      <div><dt>Semester</dt><dd>${esc(semester?.name)}</dd></div>
      <div><dt>Status KRS</dt><dd>${esc(plan.status)}</dd></div>
    </dl>
    <table class="krs-print-table">
      <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Kelas</th><th>Dosen</th><th>Jadwal</th></tr></thead>
      <tbody>
        ${(plan.items || []).map(i => `<tr>
          <td>${esc(i.code)}</td><td>${esc(i.name)}</td><td>${i.sks}</td><td>${esc(i.classCode)}</td>
          <td>${esc(i.lecturerName || DB.getById('lecturers', i.lecturerId)?.name || '-')}</td>
          <td>${esc(i.day)} ${esc(i.startTime)}–${esc(i.endTime)} · ${esc(i.room)}</td>
        </tr>`).join('')}
      </tbody>
      <tfoot><tr><td colspan="2">Total SKS</td><td colspan="4">${total}</td></tr></tfoot>
    </table>
    <p>Dosen wali: <strong>${esc(advisor?.name || 'â€”')}</strong>
      ${plan.decidedAt ? ` · Disetujui: ${formatDate(plan.decidedAt)}` : ''}</p>
    <div class="krs-print-sign">
      <div>Mahasiswa<br><br><br><u>${esc(student.name)}</u></div>
      <div>Dosen Wali<br><br><br><u>${esc(advisor?.name || '………………')}</u></div>
      <div>BAAK<br><br><br><u>………………</u></div>
    </div>
    <p class="krs-print-foot">Dokumen prototype SIAKAD Cakrawala â€” bukan dokumen resmi kampus. Dicetak ${formatDateTime(new Date().toISOString())}.</p>
  </div>
</div>`;

  container.querySelector('#do-print')?.addEventListener('click', () => window.print());
}

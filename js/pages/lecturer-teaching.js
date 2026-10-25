/**
 * Portal Dosen — fitur mengajar yang tersimpan ke data demo
 * Mata kuliah, jadwal pengganti, materi, tugas, nilai, presensi, jurnal, ujian, TA, sidang.
 */

import { DB } from '../data/seed.js';
import { formatDate, generateId, statusBadge, today, escapeHtml } from '../utils.js';
import { showToast } from '../components/toast.js';
import { openFormModal, openModal } from '../components/modal.js';
import { Router } from '../router.js?v=20261025aa';
import {
  getLecturerClasses,
  canAccessClass,
  getOfficialRoster,
  lectureAudit,
} from './lecturer-ops.js?v=20261025ab';

const esc = escapeHtml;
const STAGES = ['Pengajuan Topik', 'Proposal', 'Seminar', 'Bimbingan', 'Sidang', 'Selesai'];
const DEFAULT_WEIGHTS = [
  { key: 'tugas', label: 'Tugas', weight: 20 },
  { key: 'kuis', label: 'Kuis', weight: 10 },
  { key: 'praktikum', label: 'Praktikum', weight: 15 },
  { key: 'uts', label: 'UTS', weight: 25 },
  { key: 'uas', label: 'UAS', weight: 30 },
];

function refresh(hash) {
  if (hash && location.hash.replace(/^#/, '') !== hash.replace(/^#/, '')) {
    location.hash = hash.startsWith('#') ? hash : `#${hash}`;
    return;
  }
  Router.refresh();
}

function courseOf(id) {
  return DB.getById('courses', id);
}

function classLabel(cl) {
  const co = courseOf(cl?.courseId);
  return cl ? `${cl.code} · ${co?.name || '-'}` : '-';
}

function rosterStudents(classId) {
  const map = new Map(DB.getAll('students').map(s => [s.id, s]));
  return getOfficialRoster(classId).map(e => map.get(e.studentId)).filter(Boolean);
}

function letterOf(score) {
  const n = Number(score);
  if (Number.isNaN(n)) return { letter: '-', mutu: 0 };
  if (n >= 85) return { letter: 'A', mutu: 4 };
  if (n >= 80) return { letter: 'A-', mutu: 3.7 };
  if (n >= 75) return { letter: 'B+', mutu: 3.3 };
  if (n >= 70) return { letter: 'B', mutu: 3 };
  if (n >= 65) return { letter: 'B-', mutu: 2.7 };
  if (n >= 60) return { letter: 'C+', mutu: 2.3 };
  if (n >= 55) return { letter: 'C', mutu: 2 };
  if (n >= 45) return { letter: 'D', mutu: 1 };
  return { letter: 'E', mutu: 0 };
}

function weightsFor(classId) {
  const row = DB.getAll('gradeComponents').find(item => item.classId === classId);
  return row?.items?.length ? row.items : DEFAULT_WEIGHTS;
}

function saveWeights(classId, items) {
  const list = DB.getAll('gradeComponents');
  const idx = list.findIndex(item => item.classId === classId);
  const row = { id: idx >= 0 ? list[idx].id : generateId('gcmp'), classId, items };
  if (idx >= 0) list[idx] = row;
  else list.push(row);
  DB.save('gradeComponents', list);
}

function gradeFor(studentId, courseId, classId) {
  return DB.getAll('grades').find(g =>
    g.studentId === studentId && g.courseId === courseId && (g.classId ? g.classId === classId : true) && g.semesterId === 'sem-1'
  );
}

function upsertGrade(payload) {
  const list = DB.getAll('grades');
  const idx = list.findIndex(g => g.id === payload.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...payload };
  else list.push(payload);
  DB.save('grades', list);
}

function assertClass(lecturerId, classId) {
  if (!canAccessClass(lecturerId, classId)) {
    showToast('Akses ditolak: kelas di luar penugasan Anda.', 'danger');
    return false;
  }
  return true;
}

function emptyBox(text) {
  return `<div class="empty-state" style="padding:1.5rem"><div class="empty-state-desc">${esc(text)}</div></div>`;
}

function classOptions(classes) {
  return classes.map(cl => ({ value: cl.id, label: classLabel(cl) }));
}

function meetingDates(classId) {
  const fromAtt = [...new Set(DB.getAll('attendances').filter(a => a.classId === classId).map(a => a.date))];
  const fallback = ['2026-09-16', '2026-09-23', '2026-09-30', '2026-10-07', today()];
  return [...new Set([...fromAtt, ...fallback])].sort();
}

/* ===================== COURSES ===================== */

export function buildCoursesPage(lecturer, classes, rest = []) {
  const classId = rest[0];
  if (classId) return buildClassDetail(lecturer, classId, rest[1] === 'students');

  return `
  <div class="lec-page" data-lec-ops="teaching">
    <div class="lec-page-header">
      <h2><i class="bi bi-book"></i> Mata Kuliah Saya</h2>
      <span class="text-muted">Semester Ganjil 2026/2027</span>
    </div>
    <div class="card">
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr><th>Kode Kelas</th><th>Mata Kuliah</th><th>Jadwal</th><th>Ruang</th><th>Roster</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            ${classes.length ? classes.map(cl => {
              const co = courseOf(cl.courseId);
              const roster = rosterStudents(cl.id).length;
              return `<tr>
                <td><strong>${esc(cl.code)}</strong></td>
                <td>${esc(co?.name || '-')} <span class="badge badge-info">${co?.sks || 0} SKS</span></td>
                <td>${esc(cl.day)}, ${esc(cl.startTime)}–${esc(cl.endTime)}</td>
                <td>${esc(cl.room)}</td>
                <td><strong>${roster}</strong> / ${cl.capacity}</td>
                <td>${statusBadge(cl.status)}</td>
                <td style="white-space:nowrap">
                  <a class="btn btn-secondary btn-sm" href="#/portal/lecturer/courses/${cl.id}"><i class="bi bi-eye"></i></a>
                  <a class="btn btn-secondary btn-sm" href="#/portal/lecturer/attendance/${cl.id}" title="Presensi"><i class="bi bi-check2-square"></i></a>
                  <a class="btn btn-secondary btn-sm" href="#/portal/lecturer/grading/${cl.id}" title="Nilai"><i class="bi bi-bar-chart-line"></i></a>
                </td>
              </tr>`;
            }).join('') : `<tr><td colspan="7">${emptyBox('Tidak ada kelas yang diampu pada kampus/semester ini.')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function buildClassDetail(lecturer, classId, showRosterOnly) {
  const cl = DB.getById('classes', classId);
  if (!cl || !canAccessClass(lecturer.id, classId)) {
    return `<div class="lec-page">${emptyBox('Kelas tidak ditemukan atau di luar penugasan Anda.')} <a href="#/portal/lecturer/courses">Kembali</a></div>`;
  }
  const co = courseOf(cl.courseId);
  const students = rosterStudents(classId);
  return `
  <div class="lec-page" data-lec-ops="teaching">
    <div class="lec-page-header">
      <h2><i class="bi bi-collection"></i> ${esc(cl.code)} — ${esc(co?.name || '')}</h2>
      <a href="#/portal/lecturer/courses" class="btn btn-secondary btn-sm"><i class="bi bi-arrow-left"></i> Daftar kelas</a>
    </div>
    <div class="card" style="margin-bottom:1rem">
      <div class="card-body">
        ${[
          ['Mata kuliah', `${co?.code || '-'} · ${co?.name || '-'}`],
          ['SKS', String(co?.sks || 0)],
          ['Jadwal', `${cl.day} ${cl.startTime}–${cl.endTime}`],
          ['Ruang', cl.room],
          ['Kapasitas', `${students.length} roster / ${cl.capacity}`],
        ].map(([k, v]) => `<div class="stat-row"><span class="stat-row-label">${k}</span><span class="stat-row-value">${esc(v)}</span></div>`).join('')}
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.75rem">
          <a class="btn btn-secondary btn-sm" href="#/portal/lecturer/materials/${cl.id}">Materi</a>
          <a class="btn btn-secondary btn-sm" href="#/portal/lecturer/attendance/${cl.id}">Presensi</a>
          <a class="btn btn-secondary btn-sm" href="#/portal/lecturer/grading/${cl.id}">Nilai</a>
          <a class="btn btn-secondary btn-sm" href="#/portal/lecturer/journal/${cl.id}">Jurnal</a>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">${showRosterOnly ? 'Daftar Mahasiswa Kelas' : 'Roster resmi'}</h3></div>
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr><th>NIM</th><th>Nama</th><th>Angkatan</th><th>Status</th><th>IPK</th></tr></thead>
          <tbody>
            ${students.length ? students.map(s => `<tr>
              <td><code>${esc(s.nim)}</code></td><td>${esc(s.name)}</td><td>${s.angkatan}</td>
              <td>${statusBadge(s.status)}</td><td>${s.ipk?.toFixed(2) ?? '—'}</td>
            </tr>`).join('') : `<tr><td colspan="5">${emptyBox('Belum ada enrollment resmi pada kelas ini.')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

/* ===================== SCHEDULE ===================== */

export function buildSchedulePage(lecturer, classes, rest = []) {
  const replacements = DB.getAll('scheduleReplacements').filter(r => r.lecturerId === lecturer.id)
    .sort((a, b) => String(b.createdAt).localeCompare(a.createdAt));
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayName = ['Minggu', ...days][new Date().getDay()];

  return `
  <div class="lec-page" data-lec-ops="teaching">
    <div class="lec-page-header">
      <h2><i class="bi bi-calendar3"></i> ${rest[0] === 'replacement' ? 'Pengajuan Jadwal Pengganti' : 'Jadwal Mengajar'}</h2>
      <button type="button" class="btn btn-primary btn-sm" data-lec="repl-add" ${classes.length ? '' : 'disabled'}><i class="bi bi-plus"></i> Ajukan Pengganti</button>
    </div>
    ${rest[0] !== 'replacement' ? `
    <div class="card" style="margin-bottom:1rem">
      <div class="card-header"><h3 class="card-title">Jadwal Mingguan</h3></div>
      <div class="card-body">
        <div class="weekly-schedule">
          ${days.map(d => {
            const dayClasses = classes.filter(c => c.day === d);
            return `<div class="schedule-day-col ${d === todayName ? 'today' : ''}">
              <div class="schedule-day-header">${d}</div>
              ${dayClasses.length ? dayClasses.map(cl => {
                const co = courseOf(cl.courseId);
                return `<div class="schedule-block">
                  <div class="schedule-block-time">${esc(cl.startTime)} – ${esc(cl.endTime)}</div>
                  <div class="schedule-block-course">${esc(co?.name || '-')}</div>
                  <div class="schedule-block-meta">${esc(cl.code)} · ${esc(cl.room)}</div>
                </div>`;
              }).join('') : '<div class="schedule-empty">—</div>'}
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>` : ''}
    <div class="card">
      <div class="card-header"><h3 class="card-title">Pengajuan jadwal pengganti</h3></div>
      ${replacements.length ? `
      <div class="scroll-x"><table class="data-table">
        <thead><tr><th>Kelas</th><th>Tanggal semula</th><th>Usulan</th><th>Alasan</th><th>Status</th></tr></thead>
        <tbody>${replacements.map(r => {
          const cl = DB.getById('classes', r.classId);
          return `<tr>
            <td>${esc(cl?.code || r.classId)}</td>
            <td>${formatDate(r.originalDate)} ${esc(r.originalTime || '')}</td>
            <td>${formatDate(r.proposedDate)} ${esc(r.proposedTime || '')} · ${esc(r.proposedRoom || '-')}</td>
            <td>${esc(r.reason)}</td>
            <td>${statusBadge(r.status)}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>` : `<div class="card-body">${emptyBox('Belum ada pengajuan jadwal pengganti.')}</div>`}
    </div>
  </div>`;
}

/* ===================== MATERIALS ===================== */

export function buildMaterialsPage(lecturer, classes, rest = []) {
  const filterClass = rest[0];
  const items = DB.getAll('lectureMaterials')
    .filter(m => m.lecturerId === lecturer.id && (!filterClass || m.classId === filterClass))
    .sort((a, b) => (a.meeting || 0) - (b.meeting || 0));
  const visibleClasses = filterClass ? classes.filter(c => c.id === filterClass) : classes;

  return `
  <div class="lec-page" data-lec-ops="teaching">
    <div class="lec-page-header">
      <h2><i class="bi bi-folder2-open"></i> Materi & Modul</h2>
      <button type="button" class="btn btn-primary btn-sm" data-lec="mat-add" ${classes.length ? '' : 'disabled'}><i class="bi bi-upload"></i> Unggah metadata</button>
    </div>
    <div class="info-box" style="margin-bottom:1rem"><i class="bi bi-info-circle"></i> Prototype menyimpan metadata file saja (LEC-014), bukan isi file.</div>
    ${visibleClasses.map(cl => {
      const rows = items.filter(m => m.classId === cl.id);
      const co = courseOf(cl.courseId);
      return `<div class="card" style="margin-bottom:1rem">
        <div class="card-header"><h3 class="card-title">${esc(co?.name || '-')} — ${esc(cl.code)}</h3></div>
        ${rows.length ? `<div class="scroll-x"><table class="data-table">
          <thead><tr><th>Pertemuan</th><th>Judul</th><th>Jenis</th><th>File</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>${rows.map(m => `<tr>
            <td>${m.meeting}</td><td><strong>${esc(m.title)}</strong></td>
            <td>${esc(m.kind)}</td><td>${esc(m.fileName || '—')}</td>
            <td>${statusBadge(m.status)}</td>
            <td style="white-space:nowrap">
              <button type="button" class="btn btn-secondary btn-sm" data-lec="mat-view" data-id="${m.id}"><i class="bi bi-eye"></i></button>
              <button type="button" class="btn btn-secondary btn-sm" data-lec="mat-edit" data-id="${m.id}"><i class="bi bi-pencil"></i></button>
            </td>
          </tr>`).join('')}</tbody>
        </table></div>` : `<div class="card-body">${emptyBox('Belum ada materi. Unggah metadata untuk kelas ini.')}</div>`}
      </div>`;
    }).join('') || emptyBox('Tidak ada kelas.')}
  </div>`;
}

/* ===================== ASSIGNMENTS ===================== */

export function buildAssignmentsPage(lecturer, classes, rest = []) {
  const assignments = DB.getAll('classAssignments').filter(a => a.lecturerId === lecturer.id);
  const assignmentId = rest[0] && rest[0] !== 'create' ? rest[0] : null;
  if (assignmentId) return buildAssignmentDetail(lecturer, assignmentId);

  return `
  <div class="lec-page" data-lec-ops="teaching">
    <div class="lec-page-header">
      <h2><i class="bi bi-clipboard-check"></i> Tugas & Kuis</h2>
      <button type="button" class="btn btn-primary btn-sm" data-lec="asg-add" ${classes.length ? '' : 'disabled'}><i class="bi bi-plus"></i> Buat Tugas</button>
    </div>
    <div class="card">
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr><th>Judul</th><th>Kelas</th><th>Deadline</th><th>Pengumpulan</th><th>Dinilai</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            ${assignments.length ? assignments.map(a => {
              const cl = DB.getById('classes', a.classId);
              const subs = DB.getAll('assignmentSubmissions').filter(s => s.assignmentId === a.id);
              const roster = getOfficialRoster(a.classId).length;
              const graded = subs.filter(s => s.score != null).length;
              return `<tr>
                <td><strong>${esc(a.title)}</strong></td>
                <td>${esc(cl?.code || '-')}</td>
                <td>${formatDate(a.deadline)}</td>
                <td>${subs.length}/${roster}</td>
                <td>${graded}/${subs.length}</td>
                <td>${statusBadge(a.status)}</td>
                <td style="white-space:nowrap">
                  <a class="btn btn-secondary btn-sm" href="#/portal/lecturer/assignments/${a.id}"><i class="bi bi-eye"></i></a>
                  <button type="button" class="btn btn-primary btn-sm" data-lec="asg-grade" data-id="${a.id}"><i class="bi bi-pencil"></i> Nilai</button>
                </td>
              </tr>`;
            }).join('') : `<tr><td colspan="7">${emptyBox('Belum ada tugas. Buat tugas untuk kelas yang Anda ampu.')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function buildAssignmentDetail(lecturer, assignmentId) {
  const a = DB.getById('classAssignments', assignmentId);
  if (!a || a.lecturerId !== lecturer.id) {
    return `<div class="lec-page">${emptyBox('Tugas tidak ditemukan.')} <a href="#/portal/lecturer/assignments">Kembali</a></div>`;
  }
  const cl = DB.getById('classes', a.classId);
  const students = rosterStudents(a.classId);
  const subs = DB.getAll('assignmentSubmissions').filter(s => s.assignmentId === a.id);
  return `
  <div class="lec-page" data-lec-ops="teaching">
    <div class="lec-page-header">
      <h2>${esc(a.title)}</h2>
      <a href="#/portal/lecturer/assignments" class="btn btn-secondary btn-sm">Kembali</a>
    </div>
    <div class="card" style="margin-bottom:1rem"><div class="card-body">
      <div class="stat-row"><span>Kelas</span><span>${esc(classLabel(cl))}</span></div>
      <div class="stat-row"><span>Deadline</span><span>${formatDate(a.deadline)}</span></div>
      <div class="stat-row"><span>Status</span><span>${statusBadge(a.status)}</span></div>
    </div></div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">Pengumpulan</h3>
        <button type="button" class="btn btn-primary btn-sm" data-lec="asg-save-scores" data-id="${a.id}">Simpan nilai</button>
      </div>
      <div class="scroll-x"><table class="data-table">
        <thead><tr><th>NIM</th><th>Nama</th><th>Status</th><th>Dikirim</th><th>Nilai</th></tr></thead>
        <tbody>
          ${students.map(s => {
            const sub = subs.find(x => x.studentId === s.id);
            return `<tr>
              <td><code>${esc(s.nim)}</code></td><td>${esc(s.name)}</td>
              <td>${sub ? statusBadge(sub.status) : '<span class="badge badge-muted">Belum</span>'}</td>
              <td>${sub?.submittedAt ? formatDate(sub.submittedAt) : '—'}</td>
              <td><input type="number" min="0" max="100" class="form-control form-control-sm" style="width:80px"
                data-asg-score="${s.id}" value="${sub?.score ?? ''}"></td>
            </tr>`;
          }).join('') || `<tr><td colspan="5">${emptyBox('Roster kelas kosong.')}</td></tr>`}
        </tbody>
      </table></div>
    </div>
  </div>`;
}

/* ===================== GRADING ===================== */

export function buildGradingPage(lecturer, classes, rest = []) {
  const classId = rest[0];
  const focus = classId ? classes.filter(c => c.id === classId) : classes;
  return `
  <div class="lec-page" data-lec-ops="teaching">
    <div class="lec-page-header"><h2><i class="bi bi-bar-chart-line"></i> Penilaian</h2></div>
    <div class="info-box" style="margin-bottom:1rem"><i class="bi bi-info-circle"></i> Bobot per kelas bisa diubah. Total harus 100%. Simpan draft atau finalisasi nilai.</div>
    ${focus.map(cl => {
      const co = courseOf(cl.courseId);
      const weights = weightsFor(cl.id);
      const students = rosterStudents(cl.id);
      return `<div class="card" style="margin-bottom:1rem">
        <div class="card-header">
          <h3 class="card-title">${esc(co?.name || '-')} — ${esc(cl.code)}</h3>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            <button type="button" class="btn btn-secondary btn-sm" data-lec="grd-weights" data-class="${cl.id}"><i class="bi bi-gear"></i> Komponen</button>
            <button type="button" class="btn btn-primary btn-sm" data-lec="grd-save" data-class="${cl.id}" data-final="0"><i class="bi bi-save"></i> Simpan Draft</button>
            <button type="button" class="btn btn-accent btn-sm" data-lec="grd-save" data-class="${cl.id}" data-final="1"><i class="bi bi-lock"></i> Finalisasi</button>
          </div>
        </div>
        <div class="card-body"><div class="text-muted" style="font-size:0.8rem">Komponen: ${weights.map(w => `${w.label} (${w.weight}%)`).join(' · ')}</div></div>
        <div class="scroll-x"><table class="data-table">
          <thead><tr><th>NIM</th><th>Nama</th>${weights.map(w => `<th>${esc(w.label)}</th>`).join('')}<th>Akhir</th><th>Huruf</th></tr></thead>
          <tbody>
            ${students.length ? students.map(s => {
              const g = gradeFor(s.id, cl.courseId, cl.id) || {};
              return `<tr data-grade-row="${s.id}">
                <td><code>${esc(s.nim)}</code></td><td>${esc(s.name)}</td>
                ${weights.map(w => `<td><input type="number" min="0" max="100" class="form-control form-control-sm" style="width:70px"
                  data-gfield="${w.key}" value="${g[w.key] ?? 0}"></td>`).join('')}
                <td><strong data-gfinal>—</strong></td>
                <td data-gletter>—</td>
              </tr>`;
            }).join('') : `<tr><td colspan="${weights.length + 4}">${emptyBox('Roster resmi kosong. Tidak dapat mengisi nilai.')}</td></tr>`}
          </tbody>
        </table></div>
      </div>`;
    }).join('') || emptyBox('Tidak ada kelas.')}
  </div>`;
}

/* ===================== ATTENDANCE ===================== */

export function buildAttendancePage(lecturer, classes, rest = []) {
  const classId = rest[0];
  const focus = classId ? classes.filter(c => c.id === classId) : classes;
  return `
  <div class="lec-page" data-lec-ops="teaching">
    <div class="lec-page-header"><h2><i class="bi bi-check2-square"></i> Presensi Mahasiswa</h2></div>
    ${focus.map(cl => {
      const co = courseOf(cl.courseId);
      const students = rosterStudents(cl.id);
      const dates = meetingDates(cl.id);
      const current = dates[dates.length - 1];
      return `<div class="card" style="margin-bottom:1rem" data-att-card="${cl.id}">
        <div class="card-header">
          <h3 class="card-title">${esc(co?.name || '-')} — ${esc(cl.code)}</h3>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center">
            <select class="form-select form-select-sm" data-att-date="${cl.id}">
              ${dates.map(d => `<option value="${d}" ${d === current ? 'selected' : ''}>${formatDate(d)}</option>`).join('')}
            </select>
            <button type="button" class="btn btn-primary btn-sm" data-lec="att-save" data-class="${cl.id}"><i class="bi bi-save"></i> Simpan</button>
          </div>
        </div>
        <div class="scroll-x"><table class="data-table">
          <thead><tr><th>NIM</th><th>Nama</th><th>Status</th></tr></thead>
          <tbody>
            ${students.length ? students.map(s => {
              const att = DB.getAll('attendances').find(a => a.classId === cl.id && a.studentId === s.id && a.date === current);
              const st = att?.status || 'hadir';
              return `<tr>
                <td><code>${esc(s.nim)}</code></td><td>${esc(s.name)}</td>
                <td>
                  <select class="form-select form-select-sm" data-att-status="${s.id}" style="width:auto">
                    ${['hadir', 'izin', 'sakit', 'alpa'].map(v => `<option value="${v}" ${st === v ? 'selected' : ''}>${v}</option>`).join('')}
                  </select>
                </td>
              </tr>`;
            }).join('') : `<tr><td colspan="3">${emptyBox('Roster resmi kosong.')}</td></tr>`}
          </tbody>
        </table></div>
      </div>`;
    }).join('') || emptyBox('Tidak ada kelas.')}
  </div>`;
}

/* ===================== JOURNAL ===================== */

export function buildJournalPage(lecturer, classes, rest = []) {
  const filterClass = rest[0];
  const journals = DB.getAll('lectureJournals').filter(j => j.lecturerId === lecturer.id);
  const focus = filterClass ? classes.filter(c => c.id === filterClass) : classes;
  return `
  <div class="lec-page" data-lec-ops="teaching">
    <div class="lec-page-header">
      <h2><i class="bi bi-journal-text"></i> Jurnal Perkuliahan</h2>
      <button type="button" class="btn btn-primary btn-sm" data-lec="jrn-add" ${classes.length ? '' : 'disabled'}><i class="bi bi-plus"></i> Isi jurnal</button>
    </div>
    ${focus.map(cl => {
      const co = courseOf(cl.courseId);
      const rows = journals.filter(j => j.classId === cl.id).sort((a, b) => (a.meeting || 0) - (b.meeting || 0));
      return `<div class="card" style="margin-bottom:1rem">
        <div class="card-header"><h3 class="card-title">${esc(co?.name || '-')} — ${esc(cl.code)}</h3></div>
        ${rows.length ? `<div class="scroll-x"><table class="data-table">
          <thead><tr><th>Pertemuan</th><th>Tanggal</th><th>Topik</th><th>Capaian</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>${rows.map(j => `<tr>
            <td>${j.meeting}</td><td>${formatDate(j.date)}</td><td>${esc(j.topic)}</td>
            <td>${esc(j.outcome || '—')}</td><td>${statusBadge(j.status)}</td>
            <td><button type="button" class="btn btn-secondary btn-sm" data-lec="jrn-edit" data-id="${j.id}"><i class="bi bi-pencil"></i></button></td>
          </tr>`).join('')}</tbody>
        </table></div>` : `<div class="card-body">${emptyBox('Belum ada jurnal. Isi pertemuan pertama.')}</div>`}
      </div>`;
    }).join('')}
  </div>`;
}

/* ===================== EXAM ===================== */

export function buildExamPage(lecturer, classes) {
  const exams = DB.getAll('lectureExams').filter(e => e.lecturerId === lecturer.id);
  return `
  <div class="lec-page" data-lec-ops="teaching">
    <div class="lec-page-header">
      <h2><i class="bi bi-pencil-square"></i> Ujian</h2>
      <button type="button" class="btn btn-primary btn-sm" data-lec="ex-add" ${classes.length ? '' : 'disabled'}><i class="bi bi-plus"></i> Tambah jadwal</button>
    </div>
    <div class="card">
      <div class="scroll-x"><table class="data-table">
        <thead><tr><th>Mata Kuliah</th><th>Kelas</th><th>Jenis</th><th>Tanggal</th><th>Jam</th><th>Ruang</th><th>Berita acara</th><th>Aksi</th></tr></thead>
        <tbody>
          ${(exams.length ? exams : classes.map(cl => ({
            id: null, classId: cl.id, type: 'UTS', date: '2026-11-10', startTime: '08:00', endTime: '10:00', room: cl.room, minutes: '',
          }))).map(ex => {
            const cl = DB.getById('classes', ex.classId) || classes.find(c => c.id === ex.classId);
            const co = courseOf(cl?.courseId);
            return `<tr>
              <td>${esc(co?.name || '-')}</td><td>${esc(cl?.code || '-')}</td>
              <td><span class="badge badge-warning">${esc(ex.type || 'UTS')}</span></td>
              <td>${formatDate(ex.date)}</td>
              <td>${esc(ex.startTime || '')}–${esc(ex.endTime || '')}</td>
              <td>${esc(ex.room || cl?.room || '-')}</td>
              <td>${ex.minutes ? 'Ada' : 'Belum'}</td>
              <td>${ex.id
                ? `<button type="button" class="btn btn-secondary btn-sm" data-lec="ex-minutes" data-id="${ex.id}"><i class="bi bi-file-earmark-text"></i> Berita Acara</button>`
                : `<button type="button" class="btn btn-primary btn-sm" data-lec="ex-add" data-class="${cl?.id}">Simpan jadwal</button>`}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>
    </div>
  </div>`;
}

/* ===================== THESIS ===================== */

export function buildThesisPage(lecturer, rest = []) {
  const theses = DB.getAll('theses').filter(t => t.supervisorId === lecturer.id || t.coSupervisorId === lecturer.id);
  const studentId = rest[0];
  if (studentId) return buildThesisDetail(lecturer, studentId, theses);
  const students = DB.getAll('students');
  return `
  <div class="lec-page" data-lec-ops="teaching">
    <div class="lec-page-header"><h2><i class="bi bi-file-earmark-text"></i> Skripsi / Tugas Akhir</h2></div>
    <div class="card">
      <div class="scroll-x"><table class="data-table">
        <thead><tr><th>NIM</th><th>Nama</th><th>Judul</th><th>Tahap</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>
          ${theses.length ? theses.map(t => {
            const s = students.find(st => st.id === t.studentId);
            return `<tr>
              <td><code>${esc(s?.nim || '-')}</code></td><td>${esc(s?.name || '-')}</td>
              <td style="max-width:280px">${esc(t.title)}</td>
              <td>${statusBadge(t.stage)}</td><td>${statusBadge(t.status)}</td>
              <td style="white-space:nowrap">
                <a class="btn btn-secondary btn-sm" href="#/portal/lecturer/thesis/${t.studentId}"><i class="bi bi-chat-left-dots"></i></a>
                <button type="button" class="btn btn-primary btn-sm" data-lec="th-advance" data-id="${t.id}"><i class="bi bi-check-circle"></i> Majukan tahap</button>
              </td>
            </tr>`;
          }).join('') : `<tr><td colspan="6">${emptyBox('Belum ada mahasiswa bimbingan TA.')}</td></tr>`}
        </tbody>
      </table></div>
    </div>
  </div>`;
}

function buildThesisDetail(lecturer, studentId, theses) {
  const t = theses.find(x => x.studentId === studentId);
  const s = DB.getById('students', studentId);
  if (!t) return `<div class="lec-page">${emptyBox('Bimbingan TA tidak ditemukan.')} <a href="#/portal/lecturer/thesis">Kembali</a></div>`;
  const notes = DB.getAll('thesisNotes').filter(n => n.thesisId === t.id).sort((a, b) => String(b.date).localeCompare(a.date));
  return `
  <div class="lec-page" data-lec-ops="teaching">
    <div class="lec-page-header">
      <h2>Bimbingan TA — ${esc(s?.name || '')}</h2>
      <a href="#/portal/lecturer/thesis" class="btn btn-secondary btn-sm">Kembali</a>
    </div>
    <div class="card" style="margin-bottom:1rem"><div class="card-body">
      <h3 style="font-size:1rem">${esc(t.title)}</h3>
      <div class="stat-row"><span>Tahap</span><span>${statusBadge(t.stage)}</span></div>
      <div class="stat-row"><span>Status</span><span>${statusBadge(t.status)}</span></div>
      <p class="text-muted" style="margin-top:0.75rem">${esc(t.notes || '')}</p>
      <button type="button" class="btn btn-primary btn-sm" data-lec="th-note" data-id="${t.id}"><i class="bi bi-plus"></i> Catat bimbingan</button>
    </div></div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">Riwayat bimbingan</h3></div>
      ${notes.length ? `<div class="scroll-x"><table class="data-table">
        <thead><tr><th>Tanggal</th><th>Catatan</th><th>Tindak lanjut</th></tr></thead>
        <tbody>${notes.map(n => `<tr><td>${formatDate(n.date)}</td><td>${esc(n.notes)}</td><td>${esc(n.followUp || '—')}</td></tr>`).join('')}</tbody>
      </table></div>` : `<div class="card-body">${emptyBox('Belum ada catatan bimbingan.')}</div>`}
    </div>
  </div>`;
}

/* ===================== EXAMINATION ===================== */

export function buildExaminationPage(lecturer, rest = []) {
  const defenses = DB.getAll('lectureDefenses').filter(d => d.lecturerId === lecturer.id);
  const id = rest[0];
  if (id) {
    const row = DB.getById('lectureDefenses', id);
    const thesis = row ? DB.getById('theses', row.thesisId) : null;
    const student = thesis ? DB.getById('students', thesis.studentId) : null;
    if (!row) return `<div class="lec-page">${emptyBox('Jadwal sidang tidak ditemukan.')}</div>`;
    return `
    <div class="lec-page" data-lec-ops="teaching">
      <div class="lec-page-header">
        <h2>Detail Sidang</h2>
        <a href="#/portal/lecturer/examination" class="btn btn-secondary btn-sm">Kembali</a>
      </div>
      <div class="card"><div class="card-body">
        <div class="stat-row"><span>Mahasiswa</span><span>${esc(student?.name || '-')}</span></div>
        <div class="stat-row"><span>Judul</span><span>${esc(thesis?.title || '-')}</span></div>
        <div class="stat-row"><span>Peran Anda</span><span>${esc(row.role)}</span></div>
        <div class="stat-row"><span>Jadwal</span><span>${formatDate(row.date)} ${esc(row.time)} · ${esc(row.room)}</span></div>
        <div class="stat-row"><span>Keputusan</span><span>${row.decision ? statusBadge(row.decision) : 'Belum ada'}</span></div>
        <p style="margin-top:1rem">${esc(row.minutes || 'Berita acara belum diisi.')}</p>
        <button type="button" class="btn btn-primary btn-sm" data-lec="def-decide" data-id="${row.id}">Isi keputusan</button>
      </div></div>
    </div>`;
  }
  return `
  <div class="lec-page" data-lec-ops="teaching">
    <div class="lec-page-header">
      <h2><i class="bi bi-shield-check"></i> Sidang & Penguji</h2>
      <button type="button" class="btn btn-primary btn-sm" data-lec="def-add"><i class="bi bi-plus"></i> Catat jadwal sidang</button>
    </div>
    <div class="card">
      ${defenses.length ? `<div class="scroll-x"><table class="data-table">
        <thead><tr><th>Tanggal</th><th>Mahasiswa</th><th>Peran</th><th>Ruang</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>${defenses.map(d => {
          const thesis = DB.getById('theses', d.thesisId);
          const student = thesis ? DB.getById('students', thesis.studentId) : null;
          return `<tr>
            <td>${formatDate(d.date)} ${esc(d.time || '')}</td>
            <td>${esc(student?.name || '-')}</td>
            <td>${esc(d.role)}</td>
            <td>${esc(d.room)}</td>
            <td>${statusBadge(d.decision || d.status)}</td>
            <td><a class="btn btn-secondary btn-sm" href="#/portal/lecturer/examination/${d.id}"><i class="bi bi-eye"></i></a></td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>` : `<div class="card-body">${emptyBox('Belum ada jadwal sidang. Catat jadwal jika Anda ditugaskan sebagai penguji/pembimbing.')}</div>`}
    </div>
  </div>`;
}

/* ===================== BIND ===================== */

export function bindLecturerTeaching(lecturer) {
  const root = document.getElementById('lec-main');
  if (!root || !lecturer) return;
  const classes = getLecturerClasses(lecturer.id);

  root.querySelectorAll('[data-lec]').forEach(btn => {
    btn.addEventListener('click', () => handleTeachingAction(lecturer, classes, btn));
  });

  root.querySelectorAll('[data-att-date]').forEach(sel => {
    sel.addEventListener('change', () => {
      const classId = sel.getAttribute('data-att-date');
      const date = sel.value;
      const card = sel.closest('[data-att-card]');
      if (!card) return;
      const rows = DB.getAll('attendances');
      card.querySelectorAll('[data-att-status]').forEach(st => {
        const studentId = st.getAttribute('data-att-status');
        const att = rows.find(a => a.classId === classId && a.studentId === studentId && a.date === date);
        st.value = att?.status || 'hadir';
      });
    });
  });
}

function handleTeachingAction(lecturer, classes, btn) {
  const act = btn.dataset.lec;
  if (act === 'repl-add') return openReplacementForm(lecturer, classes);
  if (act === 'mat-add') return openMaterialForm(lecturer, classes);
  if (act === 'mat-edit') return openMaterialForm(lecturer, classes, DB.getById('lectureMaterials', btn.dataset.id));
  if (act === 'mat-view') {
    const row = DB.getById('lectureMaterials', btn.dataset.id);
    if (!row) return;
    openModal({ title: row.title, body: `<p>${esc(row.description || 'Metadata materi demo.')}</p><div class="stat-row"><span>File</span><span>${esc(row.fileName || '—')}</span></div>` });
    return;
  }
  if (act === 'asg-add') return openAssignmentForm(lecturer, classes);
  if (act === 'asg-grade') { location.hash = `#/portal/lecturer/assignments/${btn.dataset.id}`; return; }
  if (act === 'asg-save-scores') return saveAssignmentScores(lecturer, btn.dataset.id);
  if (act === 'grd-weights') return openWeightsForm(lecturer, btn.dataset.class);
  if (act === 'grd-save') return saveGrades(lecturer, btn.dataset.class, btn.dataset.final === '1');
  if (act === 'att-save') return saveAttendance(lecturer, btn.dataset.class);
  if (act === 'jrn-add') return openJournalForm(lecturer, classes);
  if (act === 'jrn-edit') return openJournalForm(lecturer, classes, DB.getById('lectureJournals', btn.dataset.id));
  if (act === 'ex-add') return openExamForm(lecturer, classes, btn.dataset.class);
  if (act === 'ex-minutes') return openExamMinutes(lecturer, btn.dataset.id);
  if (act === 'th-advance') return advanceThesis(lecturer, btn.dataset.id);
  if (act === 'th-note') return openThesisNote(lecturer, btn.dataset.id);
  if (act === 'def-add') return openDefenseForm(lecturer);
  if (act === 'def-decide') return openDefenseDecision(lecturer, btn.dataset.id);
}

function openReplacementForm(lecturer, classes) {
  openFormModal({
    title: 'Pengajuan Jadwal Pengganti',
    fields: [
      { key: 'classId', label: 'Kelas', type: 'select', required: true, options: classOptions(classes) },
      { key: 'originalDate', label: 'Tanggal semula', type: 'date', required: true, default: today() },
      { key: 'proposedDate', label: 'Tanggal usulan', type: 'date', required: true },
      { key: 'proposedTime', label: 'Jam usulan', type: 'text', placeholder: '13:00–15:30', required: true },
      { key: 'proposedRoom', label: 'Ruang usulan', type: 'text' },
      { key: 'reason', label: 'Alasan', type: 'textarea', required: true },
    ],
    onSave: (data, close) => {
      if (!assertClass(lecturer.id, data.classId)) return;
      DB.add('scheduleReplacements', {
        id: generateId('srep'),
        lecturerId: lecturer.id,
        classId: data.classId,
        originalDate: data.originalDate,
        originalTime: '',
        proposedDate: data.proposedDate,
        proposedTime: data.proposedTime,
        proposedRoom: data.proposedRoom,
        reason: data.reason,
        status: 'Diajukan',
        createdAt: new Date().toISOString(),
      });
      lectureAudit('Ajukan jadwal pengganti', data.classId, data.reason);
      showToast('Pengajuan jadwal pengganti tersimpan.', 'success');
      close();
      refresh('#/portal/lecturer/schedule/replacement');
    },
  });
}

function openMaterialForm(lecturer, classes, existing = null) {
  openFormModal({
    title: existing ? 'Ubah materi' : 'Unggah metadata materi',
    values: existing || { status: 'Dipublikasikan', meeting: 1 },
    fields: [
      { key: 'classId', label: 'Kelas', type: 'select', required: true, options: classOptions(classes), default: existing?.classId },
      { key: 'meeting', label: 'Pertemuan', type: 'number', required: true, default: existing?.meeting || 1 },
      { key: 'title', label: 'Judul', type: 'text', required: true, default: existing?.title },
      { key: 'kind', label: 'Jenis', type: 'select', required: true, options: [
        { value: 'RPS', label: 'RPS' }, { value: 'Modul', label: 'Modul' }, { value: 'Slide', label: 'Slide' }, { value: 'Lainnya', label: 'Lainnya' },
      ], default: existing?.kind || 'Modul' },
      { key: 'fileName', label: 'Nama file (simulasi)', type: 'text', default: existing?.fileName },
      { key: 'status', label: 'Status', type: 'select', required: true, options: [
        { value: 'Draft', label: 'Draft' }, { value: 'Dipublikasikan', label: 'Dipublikasikan' },
      ], default: existing?.status || 'Dipublikasikan' },
      { key: 'description', label: 'Deskripsi', type: 'textarea', default: existing?.description },
    ],
    onSave: (data, close) => {
      if (!assertClass(lecturer.id, data.classId)) return;
      const row = {
        id: existing?.id || generateId('lmat'),
        lecturerId: lecturer.id,
        classId: data.classId,
        meeting: Number(data.meeting) || 1,
        title: data.title,
        kind: data.kind,
        fileName: data.fileName,
        status: data.status,
        description: data.description,
        updatedAt: new Date().toISOString(),
      };
      if (existing) DB.update('lectureMaterials', existing.id, row);
      else DB.add('lectureMaterials', row);
      lectureAudit(existing ? 'Ubah materi' : 'Unggah materi', row.classId, row.title);
      showToast('Materi disimpan (metadata).', 'success');
      close();
      refresh('#/portal/lecturer/materials');
    },
  });
}

function openAssignmentForm(lecturer, classes) {
  openFormModal({
    title: 'Buat Tugas / Kuis',
    fields: [
      { key: 'classId', label: 'Kelas', type: 'select', required: true, options: classOptions(classes) },
      { key: 'title', label: 'Judul', type: 'text', required: true },
      { key: 'deadline', label: 'Deadline', type: 'date', required: true, default: today() },
      { key: 'weight', label: 'Bobot (%)', type: 'number', default: 10 },
      { key: 'status', label: 'Status', type: 'select', required: true, options: [
        { value: 'Draft', label: 'Draft' }, { value: 'Dipublikasikan', label: 'Dipublikasikan' },
      ], default: 'Dipublikasikan' },
    ],
    onSave: (data, close) => {
      if (!assertClass(lecturer.id, data.classId)) return;
      const row = {
        id: generateId('cass'),
        lecturerId: lecturer.id,
        classId: data.classId,
        title: data.title,
        deadline: data.deadline,
        status: data.status,
        weight: Number(data.weight) || 0,
      };
      DB.add('classAssignments', row);
      lectureAudit('Buat tugas', row.classId, row.title);
      showToast('Tugas disimpan.', 'success');
      close();
      refresh('#/portal/lecturer/assignments');
    },
  });
}

function saveAssignmentScores(lecturer, assignmentId) {
  const a = DB.getById('classAssignments', assignmentId);
  if (!a || a.lecturerId !== lecturer.id) return;
  const root = document.getElementById('lec-main');
  const subs = DB.getAll('assignmentSubmissions');
  root.querySelectorAll('[data-asg-score]').forEach(input => {
    const studentId = input.getAttribute('data-asg-score');
    const score = input.value === '' ? null : Number(input.value);
    const idx = subs.findIndex(s => s.assignmentId === assignmentId && s.studentId === studentId);
    if (idx >= 0) {
      subs[idx] = { ...subs[idx], score };
    } else if (score != null) {
      subs.push({
        id: generateId('asub'),
        assignmentId,
        studentId,
        submittedAt: new Date().toISOString(),
        status: 'Tepat waktu',
        score,
      });
    }
  });
  DB.save('assignmentSubmissions', subs);
  lectureAudit('Nilai tugas', assignmentId, a.title);
  showToast('Nilai pengumpulan disimpan.', 'success');
  refresh();
}

function openWeightsForm(lecturer, classId) {
  if (!assertClass(lecturer.id, classId)) return;
  const current = weightsFor(classId);
  openFormModal({
    title: 'Komponen & Bobot',
    fields: current.map(w => ({ key: w.key, label: `${w.label} (%)`, type: 'number', required: true, default: w.weight })),
    onSave: (data, close) => {
      const items = current.map(w => ({ ...w, weight: Number(data[w.key]) || 0 }));
      const total = items.reduce((s, w) => s + w.weight, 0);
      if (total !== 100) {
        showToast(`Total bobot harus 100% (sekarang ${total}%).`, 'warning');
        return;
      }
      saveWeights(classId, items);
      lectureAudit('Ubah bobot nilai', classId, items.map(i => `${i.key}:${i.weight}`).join(','));
      showToast('Bobot disimpan.', 'success');
      close();
      refresh();
    },
  });
}

function saveGrades(lecturer, classId, finalize) {
  if (!assertClass(lecturer.id, classId)) return;
  const cl = DB.getById('classes', classId);
  const weights = weightsFor(classId);
  const card = document.querySelector(`#lec-main button[data-lec="grd-save"][data-class="${classId}"]`)?.closest('.card');
  const rows = card ? card.querySelectorAll('[data-grade-row]') : [];
  if (!rows.length) {
    showToast('Tidak ada mahasiswa pada roster.', 'warning');
    return;
  }
  if (finalize && !confirm(`Finalisasi nilai ${cl?.code}? Nilai terkunci di prototype sampai diubah lagi.`)) return;
  rows.forEach(tr => {
    const studentId = tr.getAttribute('data-grade-row');
    const student = DB.getById('students', studentId);
    const values = {};
    let total = 0;
    weights.forEach(w => {
      const v = Number(tr.querySelector(`[data-gfield="${w.key}"]`)?.value) || 0;
      values[w.key] = v;
      total += v * (w.weight / 100);
    });
    const finalScore = Math.round(total * 10) / 10;
    const { letter, mutu } = letterOf(finalScore);
    const existing = gradeFor(studentId, cl.courseId, classId);
    upsertGrade({
      id: existing?.id || generateId('grd'),
      studentId,
      courseId: cl.courseId,
      classId,
      semesterId: 'sem-1',
      ...values,
      finalScore,
      letterGrade: letter,
      mutu,
      sks: courseOf(cl.courseId)?.sks || 0,
      status: finalize ? 'final' : 'draft',
      lecturerId: lecturer.id,
    });
    const finalEl = tr.querySelector('[data-gfinal]');
    const letterEl = tr.querySelector('[data-gletter]');
    if (finalEl) finalEl.textContent = finalScore.toFixed(1);
    if (letterEl) letterEl.textContent = letter;
    void student;
    void card;
  });
  lectureAudit(finalize ? 'Finalisasi nilai' : 'Simpan draft nilai', classId, cl?.code);
  showToast(finalize ? 'Nilai difinalisasi.' : 'Draft nilai disimpan.', finalize ? 'gold' : 'success');
}

function saveAttendance(lecturer, classId) {
  if (!assertClass(lecturer.id, classId)) return;
  const card = document.querySelector(`[data-att-card="${classId}"]`);
  if (!card) return;
  const date = card.querySelector(`[data-att-date="${classId}"]`)?.value || today();
  const list = DB.getAll('attendances');
  card.querySelectorAll('[data-att-status]').forEach(sel => {
    const studentId = sel.getAttribute('data-att-status');
    const status = sel.value;
    const idx = list.findIndex(a => a.classId === classId && a.studentId === studentId && a.date === date);
    if (idx >= 0) list[idx] = { ...list[idx], status };
    else list.push({ id: generateId('att'), classId, studentId, date, status });
  });
  DB.save('attendances', list);
  lectureAudit('Simpan presensi', classId, date);
  showToast('Presensi disimpan.', 'success');
}

function openJournalForm(lecturer, classes, existing = null) {
  openFormModal({
    title: existing ? 'Ubah jurnal' : 'Isi jurnal pertemuan',
    values: existing || { date: today(), status: 'Terisi', meeting: 1 },
    fields: [
      { key: 'classId', label: 'Kelas', type: 'select', required: true, options: classOptions(classes), default: existing?.classId },
      { key: 'meeting', label: 'Pertemuan', type: 'number', required: true, default: existing?.meeting || 1 },
      { key: 'date', label: 'Tanggal', type: 'date', required: true, default: existing?.date || today() },
      { key: 'topic', label: 'Topik', type: 'text', required: true, default: existing?.topic },
      { key: 'outcome', label: 'Capaian', type: 'text', default: existing?.outcome },
      { key: 'status', label: 'Status', type: 'select', required: true, options: [
        { value: 'Terisi', label: 'Terisi' }, { value: 'Belum Diisi', label: 'Belum Diisi' },
      ], default: existing?.status || 'Terisi' },
    ],
    onSave: (data, close) => {
      if (!assertClass(lecturer.id, data.classId)) return;
      const row = {
        id: existing?.id || generateId('ljrn'),
        lecturerId: lecturer.id,
        classId: data.classId,
        meeting: Number(data.meeting) || 1,
        date: data.date,
        topic: data.topic,
        outcome: data.outcome,
        status: data.status,
      };
      if (existing) DB.update('lectureJournals', existing.id, row);
      else DB.add('lectureJournals', row);
      lectureAudit(existing ? 'Ubah jurnal' : 'Isi jurnal', row.classId, row.topic);
      showToast('Jurnal disimpan.', 'success');
      close();
      refresh('#/portal/lecturer/journal');
    },
  });
}

function openExamForm(lecturer, classes, classId) {
  openFormModal({
    title: 'Jadwal ujian',
    fields: [
      { key: 'classId', label: 'Kelas', type: 'select', required: true, options: classOptions(classes), default: classId },
      { key: 'type', label: 'Jenis', type: 'select', required: true, options: [
        { value: 'UTS', label: 'UTS' }, { value: 'UAS', label: 'UAS' },
      ] },
      { key: 'date', label: 'Tanggal', type: 'date', required: true, default: '2026-11-10' },
      { key: 'startTime', label: 'Mulai', type: 'text', required: true, default: '08:00' },
      { key: 'endTime', label: 'Selesai', type: 'text', required: true, default: '10:00' },
      { key: 'room', label: 'Ruang', type: 'text' },
    ],
    onSave: (data, close) => {
      if (!assertClass(lecturer.id, data.classId)) return;
      const cl = DB.getById('classes', data.classId);
      DB.add('lectureExams', {
        id: generateId('lexm'),
        lecturerId: lecturer.id,
        classId: data.classId,
        type: data.type,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room || cl?.room,
        minutes: '',
      });
      lectureAudit('Tambah jadwal ujian', data.classId, data.type);
      showToast('Jadwal ujian disimpan.', 'success');
      close();
      refresh('#/portal/lecturer/exam');
    },
  });
}

function openExamMinutes(lecturer, examId) {
  const exam = DB.getById('lectureExams', examId);
  if (!exam || exam.lecturerId !== lecturer.id) return;
  openFormModal({
    title: 'Berita acara ujian',
    fields: [
      { key: 'minutes', label: 'Catatan berita acara', type: 'textarea', required: true, default: exam.minutes },
    ],
    values: { minutes: exam.minutes || '' },
    onSave: (data, close) => {
      DB.update('lectureExams', examId, { minutes: data.minutes });
      lectureAudit('Berita acara ujian', exam.classId, exam.type);
      showToast('Berita acara disimpan.', 'success');
      close();
      refresh();
    },
  });
}

function advanceThesis(lecturer, thesisId) {
  const t = DB.getById('theses', thesisId);
  if (!t || (t.supervisorId !== lecturer.id && t.coSupervisorId !== lecturer.id)) return;
  const idx = STAGES.indexOf(t.stage);
  const next = STAGES[Math.min(idx + 1, STAGES.length - 1)];
  DB.update('theses', thesisId, {
    stage: next,
    status: next === 'Selesai' ? 'selesai' : t.status,
    notes: `${t.notes || ''} [Demo: maju ke ${next}]`.trim(),
    updatedAt: today(),
  });
  lectureAudit('Majukan tahap TA', t.studentId, `${t.stage} → ${next}`);
  showToast(`Tahap TA menjadi ${next}.`, 'success');
  refresh();
}

function openThesisNote(lecturer, thesisId) {
  const t = DB.getById('theses', thesisId);
  if (!t) return;
  openFormModal({
    title: 'Catatan bimbingan TA',
    fields: [
      { key: 'date', label: 'Tanggal', type: 'date', required: true, default: today() },
      { key: 'notes', label: 'Catatan', type: 'textarea', required: true },
      { key: 'followUp', label: 'Tindak lanjut', type: 'text' },
    ],
    onSave: (data, close) => {
      DB.add('thesisNotes', {
        id: generateId('thn'),
        thesisId,
        lecturerId: lecturer.id,
        date: data.date,
        notes: data.notes,
        followUp: data.followUp,
      });
      lectureAudit('Catat bimbingan TA', t.studentId, data.notes);
      showToast('Catatan bimbingan disimpan.', 'success');
      close();
      refresh();
    },
  });
}

function openDefenseForm(lecturer) {
  const theses = DB.getAll('theses').filter(t => t.supervisorId === lecturer.id || t.coSupervisorId === lecturer.id);
  if (!theses.length) {
    showToast('Tidak ada TA bimbingan untuk dijadwalkan.', 'warning');
    return;
  }
  openFormModal({
    title: 'Catat jadwal sidang',
    fields: [
      { key: 'thesisId', label: 'Mahasiswa / TA', type: 'select', required: true, options: theses.map(t => {
        const s = DB.getById('students', t.studentId);
        return { value: t.id, label: `${s?.nim || ''} — ${s?.name || t.title}` };
      }) },
      { key: 'role', label: 'Peran', type: 'select', required: true, options: [
        { value: 'Pembimbing', label: 'Pembimbing' },
        { value: 'Penguji', label: 'Penguji' },
        { value: 'Ketua Sidang', label: 'Ketua Sidang' },
      ] },
      { key: 'date', label: 'Tanggal', type: 'date', required: true, default: today() },
      { key: 'time', label: 'Jam', type: 'text', required: true, default: '09:00' },
      { key: 'room', label: 'Ruang', type: 'text', required: true, default: 'Ruang Sidang 1' },
    ],
    onSave: (data, close) => {
      DB.add('lectureDefenses', {
        id: generateId('ldef'),
        lecturerId: lecturer.id,
        thesisId: data.thesisId,
        role: data.role,
        date: data.date,
        time: data.time,
        room: data.room,
        status: 'Terjadwal',
        decision: null,
        minutes: '',
      });
      lectureAudit('Catat sidang', data.thesisId, data.role);
      showToast('Jadwal sidang disimpan.', 'success');
      close();
      refresh('#/portal/lecturer/examination');
    },
  });
}

function openDefenseDecision(lecturer, id) {
  const row = DB.getById('lectureDefenses', id);
  if (!row || row.lecturerId !== lecturer.id) return;
  openFormModal({
    title: 'Keputusan sidang',
    fields: [
      { key: 'decision', label: 'Keputusan', type: 'select', required: true, options: [
        { value: 'Lulus', label: 'Lulus' },
        { value: 'Lulus dengan Revisi', label: 'Lulus dengan Revisi' },
        { value: 'Tidak Lulus', label: 'Tidak Lulus' },
        { value: 'Ditunda', label: 'Ditunda' },
      ] },
      { key: 'minutes', label: 'Berita acara / catatan', type: 'textarea', required: true, default: row.minutes },
    ],
    onSave: (data, close) => {
      DB.update('lectureDefenses', id, { decision: data.decision, minutes: data.minutes, status: data.decision });
      lectureAudit('Keputusan sidang', row.thesisId, data.decision);
      showToast('Keputusan sidang disimpan.', 'success');
      close();
      refresh();
    },
  });
}

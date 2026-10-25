/**
 * Portal Dosen — LEC-031 s/d LEC-037
 * Wali monitoring, konsultasi, pengumuman, laporan, administrasi,
 * integrasi akses kanonis, audit trail.
 */

import { DB } from '../data/seed.js';
import { formatDate, generateId, statusBadge, today, escapeHtml } from '../utils.js';
import { showToast } from '../components/toast.js';
import { openFormModal, openModal } from '../components/modal.js';
import { countPendingForAdvisor } from './krs-approval.js?v=20261025z';
import { Router } from '../router.js?v=20261025aa';
import { scopeRows, scopeStudyPrograms, scopeCourses } from '../campus-scope.js';

const esc = escapeHtml;
const RISK_IPK = 2.0;
const RISK_ATTEND = 75;

/* ═══════════════ LEC-036 — akses & sumber kanonis ═══════════════ */

export function getLecturerClasses(lecturerId) {
  return scopeRows(DB.getAll('classes')).filter(c => c.lecturerId === lecturerId);
}

export function canAccessClass(lecturerId, classId) {
  const cl = DB.getById('classes', classId);
  return !!(cl && cl.lecturerId === lecturerId);
}

/** Roster resmi: enrollment disetujui/aktif pada kelas yang diampu */
export function getOfficialRoster(classId) {
  return DB.getAll('enrollments').filter(e =>
    e.classId === classId && ['disetujui', 'aktif', 'final'].includes(String(e.status || '').toLowerCase())
  );
}

export function getActiveAdvisees(lecturerId) {
  const allowedStudentIds = new Set(scopeRows(DB.getAll('students')).map(item => item.id));
  return DB.getAll('advisorAssignments').filter(a => a.lecturerId === lecturerId && a.status === 'aktif' && allowedStudentIds.has(a.studentId));
}

export function assertAdvisee(lecturerId, studentId) {
  return getActiveAdvisees(lecturerId).some(a => a.studentId === studentId);
}

export function lectureAudit(action, object, detail = '') {
  DB.log(action, 'Portal Dosen', detail ? `${object} — ${detail}` : object);
}

function courseName(id) {
  return DB.getById('courses', id)?.name || scopeCourses(DB.getAll('courses'), DB.getAll('studyPrograms')).find(c => c.id === id)?.name || '-';
}
function prodiName(id) {
  return scopeStudyPrograms(DB.getAll('studyPrograms')).find(p => p.id === id)?.name || '-';
}
function classLabel(cl) {
  if (!cl) return '-';
  return `${cl.code} · ${courseName(cl.courseId)}`;
}

function krsStatusForStudent(studentId) {
  const plan = DB.getAll('krsPlans').find(p => p.studentId === studentId && p.semesterId === 'sem-1');
  return plan?.status || 'Belum Dibuat';
}

function registrationStatusForStudent(studentId) {
  const reg = DB.getAll('semesterRegistrations').find(r => r.studentId === studentId && r.semesterId === 'sem-1');
  return reg?.status || 'Belum Registrasi';
}

function attendancePctForStudent(studentId, classIds) {
  const rows = DB.getAll('attendances').filter(a => a.studentId === studentId && classIds.includes(a.classId));
  if (!rows.length) return null;
  const hadir = rows.filter(a => a.status === 'hadir').length;
  return Math.round((hadir / rows.length) * 100);
}

function isAtRisk(student, attendPct) {
  const lowIpk = (student.ipk ?? 4) < RISK_IPK;
  const lowAtt = attendPct != null && attendPct < RISK_ATTEND;
  return lowIpk || lowAtt;
}

function refreshPortal(hash) {
  if (hash && location.hash.replace(/^#/, '') !== hash.replace(/^#/, '')) {
    location.hash = hash.startsWith('#') ? hash : `#${hash}`;
    return;
  }
  Router.refresh();
}

/* ═══════════════ LEC-031 + LEC-035 — Wali & konsultasi ═══════════════ */

export function buildAcademicAdvisorPage(lecturer) {
  const assignments = getActiveAdvisees(lecturer.id);
  const students = scopeRows(DB.getAll('students'));
  const pending = countPendingForAdvisor(lecturer.id);
  const classIds = getLecturerClasses(lecturer.id).map(c => c.id);
  const consultations = DB.getAll('advisingConsultations').filter(c => c.lecturerId === lecturer.id);

  const rows = assignments.map(a => {
    const s = students.find(st => st.id === a.studentId);
    if (!s) return null;
    const att = attendancePctForStudent(s.id, classIds);
    const risk = isAtRisk(s, att);
    const consCount = consultations.filter(c => c.studentId === s.id).length;
    return { s, att, risk, consCount, krs: krsStatusForStudent(s.id), reg: registrationStatusForStudent(s.id) };
  }).filter(Boolean);

  const riskCount = rows.filter(r => r.risk).length;

  return `
  <div class="lec-page" data-lec-ops="academic-advisor">
    <div class="lec-page-header">
      <h2><i class="bi bi-person-badge"></i> Wali Akademik</h2>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <a href="#/portal/lecturer/advising" class="btn btn-secondary btn-sm"><i class="bi bi-people"></i> Bimbingan Akademik</a>
        <a href="#/portal/lecturer/advising/krs" class="btn btn-primary btn-sm"><i class="bi bi-journal-check"></i> Persetujuan KRS ${pending ? `(${pending})` : ''}</a>
      </div>
    </div>
    <p class="text-muted" style="margin-bottom:1rem;font-size:0.85rem">
      Monitoring penugasan wali aktif saja (LEC-031). Threshold demo: IPK &lt; ${RISK_IPK.toFixed(1)} atau kehadiran &lt; ${RISK_ATTEND}%.
    </p>
    <div class="lec-kpi-grid" style="margin-bottom:1rem">
      <div class="lec-kpi-card"><div class="lec-kpi-val">${rows.length}</div><div class="lec-kpi-label">Mahasiswa Bimbingan</div></div>
      <a href="#/portal/lecturer/advising/krs" class="lec-kpi-card kpi-warning"><div class="lec-kpi-val">${pending}</div><div class="lec-kpi-label">KRS Menunggu</div></a>
      <div class="lec-kpi-card kpi-danger"><div class="lec-kpi-val">${riskCount}</div><div class="lec-kpi-label">Berisiko Akademik</div></div>
      <div class="lec-kpi-card"><div class="lec-kpi-val">${consultations.length}</div><div class="lec-kpi-label">Catatan Konsultasi</div></div>
    </div>
    ${!rows.length ? `
    <div class="card"><div class="card-body">
      <div class="empty-state" style="padding:2rem">
        <div class="empty-state-desc">Belum ada penugasan dosen wali aktif untuk Anda.</div>
        <p class="text-muted" style="font-size:0.8rem">Penugasan dikelola di Akademik → Dosen Wali.</p>
      </div>
    </div></div>` : `
    <div class="card">
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr>
            <th>NIM</th><th>Nama</th><th>Angkatan</th><th>IPK</th><th>IPS</th>
            <th>Registrasi</th><th>KRS</th><th>Kehadiran</th><th>Risiko</th><th>Konsultasi</th><th>Aksi</th>
          </tr></thead>
          <tbody>
            ${rows.map(({ s, att, risk, consCount, krs, reg }) => `
            <tr>
              <td><code>${esc(s.nim)}</code></td>
              <td>${esc(s.name)}</td>
              <td>${s.angkatan}</td>
              <td><strong style="color:${(s.ipk ?? 4) < RISK_IPK ? 'var(--color-danger)' : 'var(--color-success)'}">${s.ipk?.toFixed(2) ?? '—'}</strong></td>
              <td>${s.ips?.toFixed(2) ?? '—'}</td>
              <td>${statusBadge(reg)}</td>
              <td>${statusBadge(krs)}</td>
              <td>${att == null ? '—' : `${att}%`}</td>
              <td>${risk ? '<span class="badge badge-danger">Berisiko</span>' : '<span class="badge badge-success">Aman</span>'}</td>
              <td>${consCount}</td>
              <td style="white-space:nowrap">
                <button type="button" class="btn btn-secondary btn-sm" data-cons-list="${s.id}" title="Riwayat konsultasi"><i class="bi bi-chat-left-text"></i></button>
                <button type="button" class="btn btn-primary btn-sm" data-cons-add="${s.id}" title="Catat konsultasi"><i class="bi bi-plus"></i></button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`}
  </div>`;
}

export function buildAdvisingPage(lecturer) {
  const assignments = getActiveAdvisees(lecturer.id);
  const students = scopeRows(DB.getAll('students'));
  const consultations = DB.getAll('advisingConsultations').filter(c => c.lecturerId === lecturer.id);
  const pending = countPendingForAdvisor(lecturer.id);

  return `
  <div class="lec-page" data-lec-ops="advising">
    <div class="lec-page-header">
      <h2><i class="bi bi-people"></i> Bimbingan Akademik</h2>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <a href="#/portal/lecturer/academic-advisor" class="btn btn-secondary btn-sm"><i class="bi bi-person-badge"></i> Monitoring Wali</a>
        <a href="#/portal/lecturer/advising/krs" class="btn btn-primary btn-sm"><i class="bi bi-journal-check"></i> Persetujuan KRS ${pending ? `(${pending})` : ''}</a>
      </div>
    </div>
    <div class="card" style="margin-bottom:1rem">
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr><th>NIM</th><th>Nama</th><th>Program Studi</th><th>Angkatan</th><th>IPK</th><th>Status</th><th>Konsultasi</th><th>Aksi</th></tr></thead>
          <tbody>
            ${assignments.length ? assignments.map(a => {
              const s = students.find(st => st.id === a.studentId);
              if (!s) return '';
              const n = consultations.filter(c => c.studentId === s.id).length;
              return `<tr>
                <td><code>${esc(s.nim)}</code></td><td>${esc(s.name)}</td><td>${esc(prodiName(s.prodiId))}</td>
                <td>${s.angkatan}</td><td><strong>${s.ipk?.toFixed(2) || '—'}</strong></td>
                <td>${statusBadge(s.status)}</td><td>${n}</td>
                <td style="white-space:nowrap">
                  <button type="button" class="btn btn-secondary btn-sm" data-cons-list="${s.id}"><i class="bi bi-eye"></i></button>
                  <button type="button" class="btn btn-primary btn-sm" data-cons-add="${s.id}"><i class="bi bi-plus-lg"></i> Konsultasi</button>
                </td>
              </tr>`;
            }).join('') : '<tr><td colspan="8"><div class="empty-state" style="padding:1rem"><div class="empty-state-desc">Belum ada mahasiswa bimbingan pada penugasan aktif.</div></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">Riwayat konsultasi terbaru (LEC-035)</h3></div>
      <div class="card-body">
        ${consultations.length ? `
        <div class="scroll-x"><table class="data-table">
          <thead><tr><th>Tanggal</th><th>Mahasiswa</th><th>Topik</th><th>Tindak lanjut</th></tr></thead>
          <tbody>
            ${[...consultations].sort((a, b) => String(b.date).localeCompare(a.date)).slice(0, 8).map(c => {
              const s = students.find(st => st.id === c.studentId);
              return `<tr>
                <td>${formatDate(c.date)}</td>
                <td>${esc(s?.name || c.studentId)}</td>
                <td>${esc(c.topic)}</td>
                <td>${esc(c.followUp || '—')}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table></div>` : '<div class="text-muted">Belum ada catatan konsultasi.</div>'}
      </div>
    </div>
  </div>`;
}

function openConsultationForm(lecturer, studentId) {
  if (!assertAdvisee(lecturer.id, studentId)) {
    showToast('Akses ditolak: mahasiswa di luar penugasan wali Anda.', 'danger');
    lectureAudit('Akses ditolak', 'Konsultasi', `studentId=${studentId}`);
    return;
  }
  const student = DB.getById('students', studentId);
  openFormModal({
    title: `Catat konsultasi — ${student?.nim || ''} ${student?.name || ''}`,
    fields: [
      { key: 'date', label: 'Tanggal', type: 'date', required: true, default: today() },
      { key: 'topic', label: 'Topik', type: 'text', required: true },
      { key: 'notes', label: 'Catatan', type: 'textarea', required: true },
      { key: 'followUp', label: 'Tindak lanjut', type: 'text' },
    ],
    onSave: (data, close) => {
      const row = {
        id: generateId('acons'),
        lecturerId: lecturer.id,
        studentId,
        date: data.date,
        topic: data.topic.trim(),
        notes: data.notes.trim(),
        followUp: (data.followUp || '').trim(),
        createdAt: new Date().toISOString(),
      };
      DB.add('advisingConsultations', row);
      lectureAudit('Catat konsultasi', student?.nim || studentId, row.topic);
      showToast('Catatan konsultasi disimpan.', 'success');
      close?.();
      refreshPortal();
    },
  });
}

function openConsultationList(lecturer, studentId) {
  if (!assertAdvisee(lecturer.id, studentId)) {
    showToast('Akses ditolak: mahasiswa di luar penugasan wali Anda.', 'danger');
    return;
  }
  const student = DB.getById('students', studentId);
  const list = DB.getAll('advisingConsultations')
    .filter(c => c.lecturerId === lecturer.id && c.studentId === studentId)
    .sort((a, b) => String(b.date).localeCompare(a.date));

  openModal({
    title: `Konsultasi — ${student?.nim} ${student?.name || ''}`,
    size: 'lg',
    body: list.length ? `
      <div class="scroll-x"><table class="data-table">
        <thead><tr><th>Tanggal</th><th>Topik</th><th>Catatan</th><th>Tindak lanjut</th></tr></thead>
        <tbody>
          ${list.map(c => `<tr>
            <td>${formatDate(c.date)}</td>
            <td>${esc(c.topic)}</td>
            <td>${esc(c.notes)}</td>
            <td>${esc(c.followUp || '—')}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>` : '<div class="empty-state" style="padding:1.5rem"><div class="empty-state-desc">Belum ada catatan konsultasi.</div></div>',
    footer: `
      <button type="button" class="btn btn-secondary" data-modal-close>Tutup</button>
      <button type="button" class="btn btn-primary" id="cons-add-from-list"><i class="bi bi-plus"></i> Catat Baru</button>`,
    onOpen: (overlay) => {
      overlay.querySelector('#cons-add-from-list')?.addEventListener('click', () => {
        overlay.querySelector('[data-modal-close]')?.click();
        openConsultationForm(lecturer, studentId);
      });
    },
  });
}

/* ═══════════════ LEC-032 — Pengumuman kelas ═══════════════ */

export function buildAnnouncementsPage(lecturer, classes) {
  const list = DB.getAll('classAnnouncements')
    .filter(a => a.lecturerId === lecturer.id)
    .sort((a, b) => String(b.createdAt || '').localeCompare(a.createdAt || ''));

  return `
  <div class="lec-page" data-lec-ops="announcements">
    <div class="lec-page-header">
      <h2><i class="bi bi-megaphone"></i> Pengumuman Kelas</h2>
      <button type="button" class="btn btn-primary btn-sm" id="ann-create" ${classes.length ? '' : 'disabled'}>
        <i class="bi bi-plus"></i> Buat Pengumuman
      </button>
    </div>
    <div class="info-box" style="margin-bottom:1rem">
      <i class="bi bi-info-circle"></i>
      Lampiran disimpan sebagai <strong>metadata simulasi</strong> (LEC-014). File tidak diunggah sebagai base64.
    </div>
    <div class="card">
      ${!list.length ? `
      <div class="card-body"><div class="empty-state" style="padding:2rem">
        <div class="empty-state-desc">Belum ada pengumuman. Buat pengumuman untuk kelas yang Anda ampu.</div>
      </div></div>` : `
      <div class="scroll-x"><table class="data-table">
        <thead><tr><th>Judul</th><th>Kelas</th><th>Status</th><th>Publikasi</th><th>Lampiran</th><th>Aksi</th></tr></thead>
        <tbody>
          ${list.map(a => {
            const labels = (a.classIds || []).map(id => {
              const cl = DB.getById('classes', id);
              return cl ? cl.code : id;
            }).join(', ');
            return `<tr>
              <td><strong>${esc(a.title)}</strong></td>
              <td>${esc(labels || '—')}</td>
              <td>${statusBadge(a.status)}</td>
              <td>${a.publishAt ? formatDate(a.publishAt) : '—'}</td>
              <td>${a.attachmentMeta ? esc(a.attachmentMeta.name) : '—'}</td>
              <td style="white-space:nowrap">
                <button type="button" class="btn btn-secondary btn-sm" data-ann-view="${a.id}"><i class="bi bi-eye"></i></button>
                ${a.status === 'Draft' ? `<button type="button" class="btn btn-accent btn-sm" data-ann-publish="${a.id}">Publikasi</button>` : ''}
                <button type="button" class="btn btn-secondary btn-sm" data-ann-edit="${a.id}"><i class="bi bi-pencil"></i></button>
                <button type="button" class="btn btn-danger btn-sm" data-ann-delete="${a.id}" title="Nonaktifkan"><i class="bi bi-trash"></i></button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>`}
    </div>
  </div>`;
}

function announcementForm(lecturer, classes, existing = null) {
  const classOpts = classes.map(c => ({ value: c.id, label: classLabel(c) }));
  openFormModal({
    title: existing ? 'Ubah Pengumuman' : 'Buat Pengumuman Kelas',
    size: 'lg',
    values: existing ? {
      classId: (existing.classIds || [])[0] || '',
      title: existing.title,
      body: existing.body,
      status: existing.status === 'Dipublikasikan' ? 'Dipublikasikan' : 'Draft',
      fileName: existing.attachmentMeta?.name || '',
    } : { status: 'Draft' },
    fields: [
      { key: 'classId', label: 'Kelas', type: 'select', required: true, options: classOpts },
      { key: 'title', label: 'Judul', type: 'text', required: true },
      { key: 'body', label: 'Isi', type: 'textarea', required: true },
      {
        key: 'status', label: 'Status', type: 'select', required: true,
        options: [
          { value: 'Draft', label: 'Draft' },
          { value: 'Dipublikasikan', label: 'Dipublikasikan' },
        ],
      },
      { key: 'fileName', label: 'Nama file lampiran (simulasi)', type: 'text', hint: 'Kosongkan jika tanpa lampiran. Produksi: object storage.' },
    ],
    onSave: (data, close) => {
      if (!canAccessClass(lecturer.id, data.classId)) {
        showToast('Akses ditolak: kelas di luar penugasan.', 'danger');
        lectureAudit('Akses ditolak', 'Pengumuman', data.classId);
        return;
      }
      const meta = data.fileName?.trim()
        ? { name: data.fileName.trim(), sizeKb: 100, type: 'application/octet-stream' }
        : null;
      const now = new Date().toISOString();
      if (existing) {
        DB.update('classAnnouncements', existing.id, {
          classIds: [data.classId],
          title: data.title.trim(),
          body: data.body.trim(),
          status: data.status,
          publishAt: data.status === 'Dipublikasikan' ? (existing.publishAt || today()) : null,
          updatedAt: now,
          attachmentMeta: meta,
        });
        lectureAudit('Ubah pengumuman', existing.id, data.title);
        showToast('Pengumuman diperbarui.', 'success');
      } else {
        const row = {
          id: generateId('cann'),
          lecturerId: lecturer.id,
          classIds: [data.classId],
          courseId: DB.getById('classes', data.classId)?.courseId || null,
          title: data.title.trim(),
          body: data.body.trim(),
          status: data.status,
          publishAt: data.status === 'Dipublikasikan' ? today() : null,
          createdAt: now,
          updatedAt: now,
          attachmentMeta: meta,
        };
        DB.add('classAnnouncements', row);
        lectureAudit('Buat pengumuman', row.id, row.title);
        showToast('Pengumuman disimpan.', 'success');
      }
      close?.();
      refreshPortal('#/portal/lecturer/announcements');
    },
  });
}

/* ═══════════════ LEC-033 — Laporan akademik ═══════════════ */

export function buildReportsPage(lecturer, classes) {
  const attendances = DB.getAll('attendances');
  const allowedStudentIds = new Set(scopeRows(DB.getAll('students')).map(item => item.id));
  const grades = DB.getAll('grades').filter(item => allowedStudentIds.has(item.studentId));
  const assignments = DB.getAll('classAssignments').filter(a => a.lecturerId === lecturer.id);
  const submissions = DB.getAll('assignmentSubmissions');

  const attendanceRows = classes.map(cl => {
    const roster = getOfficialRoster(cl.id);
    const rows = attendances.filter(a => a.classId === cl.id);
    const hadir = rows.filter(a => a.status === 'hadir').length;
    const pct = rows.length ? Math.round((hadir / rows.length) * 100) : 0;
    return { cl, roster: roster.length, meetings: new Set(rows.map(r => r.date)).size, pct, total: rows.length };
  });

  const gradeRows = classes.map(cl => {
    const gs = grades.filter(g => g.courseId === cl.courseId && g.semesterId === 'sem-1');
    const scored = gs.filter(g => g.finalScore != null);
    const avg = scored.length
      ? (scored.reduce((s, g) => s + g.finalScore, 0) / scored.length)
      : null;
    const draft = gs.filter(g => g.status === 'draft').length;
    const fin = gs.filter(g => g.status === 'final').length;
    return { cl, avg, draft, fin, n: gs.length };
  });

  const submitRows = assignments.map(a => {
    const cl = DB.getById('classes', a.classId);
    if (!cl || cl.lecturerId !== lecturer.id) return null;
    const roster = getOfficialRoster(a.classId);
    const subs = submissions.filter(s => s.assignmentId === a.id);
    const onTime = subs.filter(s => s.status === 'Tepat waktu').length;
    const late = subs.filter(s => s.status === 'Terlambat').length;
    const missing = Math.max(0, roster.length - subs.length);
    return { a, cl, onTime, late, missing, total: roster.length };
  }).filter(Boolean);

  const visibleCourses = scopeCourses(DB.getAll('courses'), DB.getAll('studyPrograms'));
  const totalSks = classes.reduce((s, cl) => s + (visibleCourses.find(c => c.id === cl.courseId)?.sks || 0), 0);
  const totalMhs = classes.reduce((s, cl) => s + getOfficialRoster(cl.id).length, 0);

  return `
  <div class="lec-page" data-lec-ops="reports">
    <div class="lec-page-header">
      <h2><i class="bi bi-graph-up"></i> Laporan Akademik</h2>
      <div style="display:flex;gap:0.5rem">
        <button type="button" class="btn btn-secondary btn-sm" id="rep-print"><i class="bi bi-printer"></i> Cetak</button>
        <button type="button" class="btn btn-secondary btn-sm" id="rep-csv"><i class="bi bi-download"></i> Ekspor CSV</button>
      </div>
    </div>
    <p class="text-muted" style="font-size:0.85rem;margin-bottom:1rem">
      Data dibatasi kelas penugasan Anda (LEC-033 / LEC-036). Roster memakai enrollment resmi.
    </p>
    <div class="lec-grid-2">
      <div class="card">
        <div class="card-header"><h3 class="card-title">Rekap Presensi</h3></div>
        <div class="card-body" id="rep-att">
          ${attendanceRows.map(({ cl, roster, meetings, pct }) => `
            <div class="stat-row">
              <span>${esc(courseName(cl.courseId))} (${esc(cl.code)}) · ${roster} mhs · ${meetings} tgl</span>
              <span>
                <div class="progress" style="height:6px;width:100px;display:inline-block;vertical-align:middle">
                  <div class="progress-bar bg-success" style="width:${pct}%"></div>
                </div> ${pct}%
              </span>
            </div>`).join('') || '<div class="text-muted">Tidak ada kelas.</div>'}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">Rekap Nilai</h3></div>
        <div class="card-body">
          ${gradeRows.map(({ cl, avg, draft, fin }) => `
            <div class="stat-row">
              <span>${esc(courseName(cl.courseId))} (${esc(cl.code)})</span>
              <span>Rata-rata: <strong>${avg == null ? '—' : avg.toFixed(1)}</strong> · Final ${fin} · Draft ${draft}</span>
            </div>`).join('') || '<div class="text-muted">Tidak ada kelas.</div>'}
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:1rem">
      <div class="card-header"><h3 class="card-title">Pengumpulan Tugas</h3></div>
      <div class="card-body">
        ${submitRows.length ? `
        <div class="scroll-x"><table class="data-table">
          <thead><tr><th>Tugas</th><th>Kelas</th><th>Tepat waktu</th><th>Terlambat</th><th>Belum</th><th>Roster</th></tr></thead>
          <tbody>
            ${submitRows.map(({ a, cl, onTime, late, missing, total }) => `
            <tr>
              <td>${esc(a.title)}</td><td>${esc(cl.code)}</td>
              <td>${onTime}</td><td>${late}</td><td>${missing}</td><td>${total}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>` : '<div class="text-muted">Belum ada tugas pada kelas Anda.</div>'}
      </div>
    </div>
    <div class="card" style="margin-top:1rem">
      <div class="card-header"><h3 class="card-title">Beban Mengajar</h3></div>
      <div class="card-body">
        <div class="stat-row"><span>Total Kelas</span><span><strong>${classes.length}</strong></span></div>
        <div class="stat-row"><span>Total SKS Mengajar</span><span><strong>${totalSks}</strong></span></div>
        <div class="stat-row"><span>Total Mahasiswa (roster resmi)</span><span><strong>${totalMhs}</strong></span></div>
      </div>
    </div>
    <div class="card" style="margin-top:1rem" id="rep-audit-wrap">
      <div class="card-header"><h3 class="card-title"><i class="bi bi-shield-check"></i> Audit Trail Portal Dosen (LEC-037)</h3></div>
      <div class="card-body">${buildAuditTable(lecturer)}</div>
    </div>
  </div>`;
}

function buildAuditTable(lecturer) {
  const nameHint = (lecturer.name || '').split(',')[0];
  const logs = DB.getAll('auditLogs')
    .filter(l => l.module === 'Portal Dosen' || (l.user && nameHint && String(l.user).includes(nameHint.split(' ')[0])))
    .slice(0, 25);
  if (!logs.length) {
    return '<div class="text-muted">Belum ada jejak audit portal dosen. Aksi di modul ini akan tercatat di sini.</div>';
  }
  return `
  <div class="scroll-x"><table class="data-table">
    <thead><tr><th>Waktu</th><th>Aktivitas</th><th>Objek</th><th>Hasil</th><th>Pelaku</th></tr></thead>
    <tbody>
      ${logs.map(l => `<tr>
        <td>${formatDate(l.time)}</td>
        <td>${esc(l.activity)}</td>
        <td>${esc(l.object)}</td>
        <td>${esc(l.result)}</td>
        <td>${esc(l.user)}</td>
      </tr>`).join('')}
    </tbody>
  </table></div>`;
}

function exportReportsCsv(lecturer, classes) {
  const allowedStudentIds = new Set(scopeRows(DB.getAll('students')).map(item => item.id));
  const lines = [['Kelas', 'Mata Kuliah', 'Roster', 'PresensiHadir%', 'NilaiRata2']];
  classes.forEach(cl => {
    if (!canAccessClass(lecturer.id, cl.id)) return;
    const rows = DB.getAll('attendances').filter(a => a.classId === cl.id);
    const hadir = rows.filter(a => a.status === 'hadir').length;
    const pct = rows.length ? Math.round((hadir / rows.length) * 100) : 0;
    const gs = DB.getAll('grades').filter(g => allowedStudentIds.has(g.studentId) && g.courseId === cl.courseId && g.finalScore != null);
    const avg = gs.length ? (gs.reduce((s, g) => s + g.finalScore, 0) / gs.length).toFixed(1) : '';
    lines.push([cl.code, courseName(cl.courseId), String(getOfficialRoster(cl.id).length), String(pct), avg]);
  });
  const csv = lines.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan-dosen-${lecturer.id}-${today()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  lectureAudit('Ekspor laporan CSV', lecturer.id, `${classes.length} kelas`);
  showToast('CSV laporan diunduh.', 'success');
}

/* ═══════════════ LEC-034 — Pengajuan administrasi ═══════════════ */

export function buildAdministrationPage(lecturer) {
  const list = DB.getAll('lecturerAdminRequests')
    .filter(r => r.lecturerId === lecturer.id)
    .sort((a, b) => String(b.createdAt).localeCompare(a.createdAt));

  return `
  <div class="lec-page" data-lec-ops="administration">
    <div class="lec-page-header">
      <h2><i class="bi bi-envelope-paper"></i> Pengajuan Administrasi</h2>
      <button type="button" class="btn btn-primary btn-sm" id="adm-create"><i class="bi bi-plus"></i> Buat Pengajuan</button>
    </div>
    <div class="info-box" style="margin-bottom:1rem">
      <i class="bi bi-info-circle"></i>
      Status Diproses/Selesai biasanya diubah BAAK. Tombol demo memungkinkan simulasi pemrosesan.
      Pengajuan jadwal pengganti: <a href="#/portal/lecturer/schedule/replacement">form khusus</a>.
    </div>
    <div class="card">
      <div class="scroll-x"><table class="data-table">
        <thead><tr><th>No</th><th>Jenis</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>
          ${list.length ? list.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${esc(r.type)}</td>
            <td>${formatDate(r.createdAt)}</td>
            <td>${statusBadge(r.status)}</td>
            <td style="white-space:nowrap">
              <button type="button" class="btn btn-secondary btn-sm" data-adm-view="${r.id}"><i class="bi bi-eye"></i></button>
              ${r.status === 'Diajukan' ? `<button type="button" class="btn btn-secondary btn-sm" data-adm-advance="${r.id}" title="Simulasi BAAK: Diproses">Proses</button>` : ''}
              ${r.status === 'Diproses' ? `
                <button type="button" class="btn btn-accent btn-sm" data-adm-done="${r.id}">Selesai</button>
                <button type="button" class="btn btn-danger btn-sm" data-adm-reject="${r.id}">Tolak</button>` : ''}
            </td>
          </tr>`).join('') : '<tr><td colspan="5"><div class="empty-state" style="padding:1.5rem"><div class="empty-state-desc">Belum ada pengajuan.</div></div></td></tr>'}
        </tbody>
      </table></div>
    </div>
  </div>`;
}

function createAdminRequest(lecturer) {
  openFormModal({
    title: 'Pengajuan Administrasi',
    fields: [
      {
        key: 'type', label: 'Jenis', type: 'select', required: true,
        options: [
          { value: 'Surat Tugas Mengajar', label: 'Surat Tugas Mengajar' },
          { value: 'Surat Keterangan Aktif Mengajar', label: 'Surat Keterangan Aktif Mengajar' },
          { value: 'Permohonan Cuti Mengajar', label: 'Permohonan Cuti Mengajar' },
          { value: 'Permohonan Penggantian Jadwal', label: 'Permohonan Penggantian Jadwal' },
        ],
      },
      { key: 'detail', label: 'Detail', type: 'textarea', required: true },
      { key: 'fileName', label: 'Nama lampiran (simulasi)', type: 'text' },
    ],
    onSave: (data, close) => {
      const now = new Date().toISOString();
      const row = {
        id: generateId('lareq'),
        lecturerId: lecturer.id,
        type: data.type,
        detail: data.detail.trim(),
        status: 'Diajukan',
        createdAt: now,
        updatedAt: now,
        attachmentMeta: data.fileName?.trim()
          ? { name: data.fileName.trim(), sizeKb: 50, type: 'application/octet-stream' }
          : null,
        history: [{ at: now, from: null, to: 'Diajukan', by: lecturer.name, note: 'Pengajuan awal' }],
      };
      DB.add('lecturerAdminRequests', row);
      lectureAudit('Ajukan administrasi', row.type, row.id);
      showToast('Pengajuan dikirim (status Diajukan).', 'success');
      close?.();
      refreshPortal('#/portal/lecturer/administration');
    },
  });
}

function advanceAdminRequest(id, toStatus, note) {
  const row = DB.getById('lecturerAdminRequests', id);
  if (!row) return;
  const now = new Date().toISOString();
  const history = [...(row.history || []), { at: now, from: row.status, to: toStatus, by: 'BAAK (demo)', note }];
  DB.update('lecturerAdminRequests', id, { status: toStatus, updatedAt: now, history });
  lectureAudit(`Administrasi → ${toStatus}`, row.type, note);
  showToast(`Status pengajuan: ${toStatus}.`, toStatus === 'Ditolak' ? 'warning' : 'success');
  refreshPortal('#/portal/lecturer/administration');
}

function viewAdminRequest(id) {
  const row = DB.getById('lecturerAdminRequests', id);
  if (!row) return;
  openModal({
    title: row.type,
    size: 'lg',
    body: `
      <div class="stat-row"><span>Status</span><span>${statusBadge(row.status)}</span></div>
      <div class="stat-row"><span>Diajukan</span><span>${formatDate(row.createdAt)}</span></div>
      <div class="stat-row"><span>Lampiran</span><span>${row.attachmentMeta ? esc(row.attachmentMeta.name) : '—'}</span></div>
      <p style="margin-top:1rem">${esc(row.detail)}</p>
      <h6 style="margin-top:1.25rem">Riwayat</h6>
      <div class="scroll-x"><table class="data-table">
        <thead><tr><th>Waktu</th><th>Dari</th><th>Ke</th><th>Oleh</th><th>Catatan</th></tr></thead>
        <tbody>
          ${(row.history || []).map(h => `<tr>
            <td>${formatDate(h.at)}</td><td>${esc(h.from || '—')}</td><td>${esc(h.to)}</td>
            <td>${esc(h.by)}</td><td>${esc(h.note || '')}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>`,
  });
}

/* ═══════════════ Bind events ═══════════════ */

export function bindLecturerOps(lecturer) {
  const root = document.getElementById('lec-main');
  if (!root || !lecturer) return;
  const classes = getLecturerClasses(lecturer.id);

  root.querySelectorAll('[data-cons-add]').forEach(btn => {
    btn.addEventListener('click', () => openConsultationForm(lecturer, btn.getAttribute('data-cons-add')));
  });
  root.querySelectorAll('[data-cons-list]').forEach(btn => {
    btn.addEventListener('click', () => openConsultationList(lecturer, btn.getAttribute('data-cons-list')));
  });

  root.querySelector('#ann-create')?.addEventListener('click', () => announcementForm(lecturer, classes));
  root.querySelectorAll('[data-ann-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = DB.getById('classAnnouncements', btn.getAttribute('data-ann-edit'));
      if (!row || row.lecturerId !== lecturer.id) {
        showToast('Akses ditolak.', 'danger');
        return;
      }
      announcementForm(lecturer, classes, row);
    });
  });
  root.querySelectorAll('[data-ann-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = DB.getById('classAnnouncements', btn.getAttribute('data-ann-view'));
      if (!row || row.lecturerId !== lecturer.id) return;
      openModal({
        title: row.title,
        body: `<p>${esc(row.body)}</p>
          <div class="stat-row"><span>Status</span><span>${statusBadge(row.status)}</span></div>
          <div class="stat-row"><span>Lampiran</span><span>${row.attachmentMeta ? esc(row.attachmentMeta.name) : '—'}</span></div>`,
      });
    });
  });
  root.querySelectorAll('[data-ann-publish]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-ann-publish');
      const row = DB.getById('classAnnouncements', id);
      if (!row || row.lecturerId !== lecturer.id) return;
      DB.update('classAnnouncements', id, { status: 'Dipublikasikan', publishAt: today(), updatedAt: new Date().toISOString() });
      lectureAudit('Publikasi pengumuman', id, row.title);
      showToast('Pengumuman dipublikasikan.', 'success');
      refreshPortal('#/portal/lecturer/announcements');
    });
  });
  root.querySelectorAll('[data-ann-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-ann-delete');
      const row = DB.getById('classAnnouncements', id);
      if (!row || row.lecturerId !== lecturer.id) return;
      if (!confirm('Nonaktifkan pengumuman ini? (soft-delete demo)')) return;
      DB.update('classAnnouncements', id, { status: 'Nonaktif', updatedAt: new Date().toISOString() });
      lectureAudit('Nonaktifkan pengumuman', id, row.title);
      showToast('Pengumuman dinonaktifkan.', 'info');
      refreshPortal('#/portal/lecturer/announcements');
    });
  });

  root.querySelector('#rep-csv')?.addEventListener('click', () => exportReportsCsv(lecturer, classes));
  root.querySelector('#rep-print')?.addEventListener('click', () => {
    lectureAudit('Cetak laporan', lecturer.id, 'window.print');
    window.print();
  });

  root.querySelector('#adm-create')?.addEventListener('click', () => createAdminRequest(lecturer));
  root.querySelectorAll('[data-adm-view]').forEach(btn => {
    btn.addEventListener('click', () => viewAdminRequest(btn.getAttribute('data-adm-view')));
  });
  root.querySelectorAll('[data-adm-advance]').forEach(btn => {
    btn.addEventListener('click', () => advanceAdminRequest(btn.getAttribute('data-adm-advance'), 'Diproses', 'Simulasi BAAK'));
  });
  root.querySelectorAll('[data-adm-done]').forEach(btn => {
    btn.addEventListener('click', () => advanceAdminRequest(btn.getAttribute('data-adm-done'), 'Selesai', 'Selesai (demo)'));
  });
  root.querySelectorAll('[data-adm-reject]').forEach(btn => {
    btn.addEventListener('click', () => {
      const reason = prompt('Alasan penolakan:');
      if (!reason?.trim()) return;
      advanceAdminRequest(btn.getAttribute('data-adm-reject'), 'Ditolak', reason.trim());
    });
  });

  root.querySelector('#lec-prefs-save')?.addEventListener('click', () => {
    const notifKrs = !!root.querySelector('#notif-toggle')?.checked;
    const notifTa = !!root.querySelector('#notif-ta')?.checked;
    DB.update('lecturers', lecturer.id, { prefs: { notifKrs, notifTa } });
    lectureAudit('Simpan preferensi', lecturer.id, `notifKrs=${notifKrs};notifTa=${notifTa}`);
    showToast('Preferensi disimpan.', 'success');
  });
}

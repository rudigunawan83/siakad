/**
 * SIAKAD — Portal Dosen (design.md bagian 9)
 * 17 menu; LEC-031–037 di lecturer-ops.js
 */
import { DB } from '../data/seed.js';
import { AppState } from '../state.js?v=20261025ab';
import { formatDate, statusBadge } from '../utils.js';
import { scopeRows, scopeStudyPrograms, scopeCampuses, scopeCourses } from '../campus-scope.js';
import { renderAdvisorKrsApproval, countPendingForAdvisor } from './krs-approval.js?v=20261025z';
import {
  getLecturerClasses as getAssignedClasses,
  getOfficialRoster,
  getActiveAdvisees,
  buildAcademicAdvisorPage,
  buildAdvisingPage,
  buildAnnouncementsPage,
  buildReportsPage,
  buildAdministrationPage,
  bindLecturerOps,
} from './lecturer-ops.js?v=20261025ab';
import {
  buildCoursesPage,
  buildSchedulePage,
  buildMaterialsPage,
  buildAssignmentsPage,
  buildGradingPage,
  buildAttendancePage,
  buildJournalPage,
  buildExamPage,
  buildThesisPage,
  buildExaminationPage,
  bindLecturerTeaching,
} from './lecturer-teaching.js?v=20261025ab';

/* -- helpers ---------------------------------------- */
function getLecturer() {
  const role = AppState.currentRole;
  return scopeRows(DB.getAll('lecturers')).find(l => l.id === (role.lecturerId || 'lec-1'));
}
function getLecturerClasses(lecId) { return getAssignedClasses(lecId); }
function courseObj(courseId) { return scopeCourses(DB.getAll('courses'), DB.getAll('studyPrograms')).find(c => c.id === courseId); }
function prodiName(prodiId) { return scopeStudyPrograms(DB.getAll('studyPrograms')).find(p => p.id === prodiId)?.name || '-'; }
function campusName(campusId) { return scopeCampuses(DB.getAll('campuses')).find(c => c.id === campusId)?.name || '-'; }
function scopedStudents() { return scopeRows(DB.getAll('students')); }
function studentsForClass(cl) {
  const studentMap = new Map(scopedStudents().map(item => [item.id, item]));
  return getOfficialRoster(cl.id).map(item => studentMap.get(item.studentId)).filter(Boolean);
}

/* -- main entry ------------------------------------ */
export function renderLecturerPortal(path, container) {
  // Sub-routes
  if (path.includes('/advising/krs') || path.includes('/portal/lecturer/krs'))
    return renderAdvisorKrsApproval(path, container);

  const lecturer = getLecturer();
  if (!lecturer) {
    const hasAny = DB.getAll('lecturers').length > 0;
    container.innerHTML = `
<div class="page-container">
  <div class="empty-state" style="padding:2.5rem 1rem;text-align:center">
    <div class="empty-state-title">${hasAny ? 'Profil dosen tidak cocok dengan peran atau kampus aktif' : 'Data demo belum tersedia di perangkat ini'}</div>
    <p class="text-muted" style="max-width:28rem;margin:0.75rem auto 1.25rem">
      ${hasAny
        ? 'Ganti peran di pojok kanan atas ke <strong>Dosen</strong> atau sesuaikan filter kampus di header.'
        : 'Prototype menyimpan data di localStorage browser HP (bukan server). Storage kosong/rusak sering terjadi di mode privat, browser dalam aplikasi (WhatsApp/Instagram), atau kuota penuh.'}
    </p>
    <button type="button" class="btn btn-primary" id="lec-reseed-btn">
      <i class="bi bi-arrow-clockwise"></i> Muat ulang data demo
    </button>
  </div>
</div>`;
    container.querySelector('#lec-reseed-btn')?.addEventListener('click', async () => {
      const { initSeed } = await import('../data/seed.js?v=20261025ak');
      initSeed(true);
      location.reload();
    });
    return;
  }

  // determine active sub-page from path
  const sub = path.replace('/portal/lecturer', '').replace(/^\//, '') || 'dashboard';
  const page = sub.split('/')[0];

  // Nav 17 menu ada di sidebar shell kiri (sidebar.js) — hindari sidebar ganda
  const content = buildPageContent(page, sub, lecturer);

  container.innerHTML = `
<div class="page-container portal-container lec-portal-shell">
  <div class="lecturer-main" id="lec-main">${content}</div>
</div>`;

  if (page === 'dashboard') initDashboardCharts(lecturer);
  bindLecturerOps(lecturer);
  bindLecturerTeaching(lecturer);
}

/* -- page router ----------------------------------- */
function buildPageContent(page, sub, lecturer) {
  const classes = getLecturerClasses(lecturer.id);
  const rest = sub.split('/').slice(1).filter(Boolean);
  switch (page) {
    case 'dashboard': return buildDashboard(lecturer, classes);
    case 'courses': return buildCoursesPage(lecturer, classes, rest);
    case 'schedule': return buildSchedulePage(lecturer, classes, rest);
    case 'materials': return buildMaterialsPage(lecturer, classes, rest);
    case 'assignments': return buildAssignmentsPage(lecturer, classes, rest);
    case 'grading': return buildGradingPage(lecturer, classes, rest);
    case 'attendance': return buildAttendancePage(lecturer, classes, rest);
    case 'journal': return buildJournalPage(lecturer, classes, rest);
    case 'exam': return buildExamPage(lecturer, classes);
    case 'advising': return buildAdvisingPage(lecturer);
    case 'thesis': return buildThesisPage(lecturer, rest);
    case 'examination': return buildExaminationPage(lecturer, rest);
    case 'academic-advisor': return buildAcademicAdvisorPage(lecturer);
    case 'announcements': return buildAnnouncementsPage(lecturer, classes);
    case 'reports': return buildReportsPage(lecturer, classes);
    case 'administration': return buildAdministrationPage(lecturer);
    case 'profile': return buildProfile(lecturer);
    default: return buildDashboard(lecturer, classes);
  }
}

/* --------------------------------------------------
   1. DASHBOARD (9.0.1)
   -------------------------------------------------- */
function buildDashboard(lecturer, classes) {
  const campus = campusName(lecturer.campusId);
  const totalMhs = classes.reduce((s, c) => s + (c.enrolled || 0), 0);
  const theses = scopeRows(DB.getAll('theses')).filter(t => t.supervisorId === lecturer.id);
  const pendingKRS = countPendingForAdvisor(lecturer.id);
  const pendingAssignments = DB.getAll('classAssignments').filter(a =>
    a.lecturerId === lecturer.id && classes.some(cl => cl.id === a.classId)
  ).filter(a => {
    const roster = studentsForClass(classes.find(cl => cl.id === a.classId) || { id: a.classId }).length;
    const graded = DB.getAll('assignmentSubmissions').filter(s => s.assignmentId === a.id && s.score != null).length;
    return graded < roster;
  }).length;
  const filledJournals = DB.getAll('lectureJournals').filter(j => j.lecturerId === lecturer.id && j.status === 'Terisi').length;
  const expectedJournals = Math.max(classes.length * 4, filledJournals);
  const unfinalGrades = classes.filter(cl => {
    const rosterStudentIds = new Set(studentsForClass(cl).map(item => item.id));
    const gs = DB.getAll('grades').filter(g => rosterStudentIds.has(g.studentId) && g.courseId === cl.courseId);
    return gs.length === 0 || gs.some(g => g.status !== 'final');
  });

  // Attendance completeness
  const attendances = DB.getAll('attendances');
  const totalMeetings = classes.length * 16; // ~16 pertemuan per kelas
  const filledAttendance = attendances.filter(a => classes.some(cl => cl.id === a.classId)).length;
  const unfilledAttendance = Math.max(0, totalMeetings - filledAttendance);

  // Today's schedule
  const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const today = days[new Date().getDay()];
  const todayClasses = classes.filter(c => c.day === today);

  return `
  <div class="lec-page">
    <div class="lec-page-header">
      <h2><i class="bi bi-speedometer2"></i> Dashboard Dosen</h2>
      <span class="text-muted">${campus} Â· Semester Ganjil 2026/2027</span>
    </div>

    <!-- Profile Banner -->
    <div class="lec-profile-banner">
      <div class="lec-profile-avatar">${lecturer.name.charAt(0)}</div>
      <div class="lec-profile-info">
        <h3>${lecturer.name}</h3>
        <p>NIDN: ${lecturer.nidn} Â· ${lecturer.position} Â· ${campus}</p>
        <div class="lec-profile-badges">
          ${statusBadge(lecturer.status)}
          <span class="badge badge-info">${lecturer.position}</span>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="lec-kpi-grid">
      <a href="#/portal/lecturer/courses" class="lec-kpi-card">
        <div class="lec-kpi-icon"><i class="bi bi-book"></i></div>
        <div class="lec-kpi-val">${classes.length}</div>
        <div class="lec-kpi-label">Kelas Aktif</div>
      </a>
      <a href="#/portal/lecturer/courses" class="lec-kpi-card">
        <div class="lec-kpi-icon"><i class="bi bi-people"></i></div>
        <div class="lec-kpi-val">${totalMhs}</div>
        <div class="lec-kpi-label">Total Mahasiswa</div>
      </a>
      <a href="#/portal/lecturer/assignments" class="lec-kpi-card kpi-warning">
        <div class="lec-kpi-icon"><i class="bi bi-clipboard-check"></i></div>
        <div class="lec-kpi-val">${pendingAssignments}</div>
        <div class="lec-kpi-label">Tugas Belum Dinilai</div>
      </a>
      <a href="#/portal/lecturer/grading" class="lec-kpi-card kpi-danger">
        <div class="lec-kpi-icon"><i class="bi bi-bar-chart-line"></i></div>
        <div class="lec-kpi-val">${unfinalGrades.length}</div>
        <div class="lec-kpi-label">Nilai Belum Final</div>
      </a>
      <a href="#/portal/lecturer/attendance" class="lec-kpi-card kpi-warning">
        <div class="lec-kpi-icon"><i class="bi bi-check2-square"></i></div>
        <div class="lec-kpi-val">${Math.min(unfilledAttendance, classes.length * 3)}</div>
        <div class="lec-kpi-label">Presensi Belum Lengkap</div>
      </a>
      <a href="#/portal/lecturer/journal" class="lec-kpi-card kpi-warning">
        <div class="lec-kpi-icon"><i class="bi bi-journal-text"></i></div>
        <div class="lec-kpi-val">${Math.max(0, expectedJournals - filledJournals)}</div>
        <div class="lec-kpi-label">Jurnal Belum Diisi</div>
      </a>
    </div>

    ${pendingKRS > 0 ? `
    <div class="info-box info-box-warning" style="margin-bottom:1rem">
      <i class="bi bi-clock-history"></i>
      <strong>${pendingKRS} KRS mahasiswa bimbingan</strong> menunggu persetujuan Anda.
      <a href="#/portal/lecturer/advising/krs" class="btn btn-warning btn-sm ms-2">Proses Sekarang</a>
    </div>` : ''}

    <!-- Two column layout -->
    <div class="lec-grid-2">
      <!-- Today's Schedule -->
      <div class="card">
        <div class="card-header"><h3 class="card-title"><i class="bi bi-calendar-day"></i> Jadwal Hari Ini — ${today}</h3></div>
        <div class="card-body">
          ${todayClasses.length === 0
            ? '<div class="empty-state" style="padding:1rem"><div class="empty-state-desc">Tidak ada kelas hari ini</div></div>'
            : todayClasses.map(cl => {
              const co = courseObj(cl.courseId);
              return `
              <div class="schedule-item">
                <div class="schedule-time">${cl.startTime} â€“ ${cl.endTime}</div>
                <div class="schedule-detail">
                  <strong>${co?.name || '-'}</strong>
                  <span class="text-muted">${cl.code} Â· ${cl.room} Â· ${cl.enrolled}/${cl.capacity} mhs</span>
                </div>
              </div>`;
            }).join('')}
        </div>
      </div>

      <!-- Bimbingan Panel -->
      <div class="card">
        <div class="card-header"><h3 class="card-title"><i class="bi bi-people"></i> Bimbingan</h3></div>
        <div class="card-body">
          <div class="bimbingan-stats">
            <div class="bimbingan-stat">
              <span class="bimbingan-val">${pendingKRS}</span>
              <span class="bimbingan-label">KRS Menunggu</span>
            </div>
            <div class="bimbingan-stat">
              <span class="bimbingan-val">${theses.length}</span>
              <span class="bimbingan-label">Bimbingan TA</span>
            </div>
            <div class="bimbingan-stat">
              <span class="bimbingan-val">${getActiveAdvisees(lecturer.id).length}</span>
              <span class="bimbingan-label">Mhs. Wali</span>
            </div>
          </div>
          <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap">
            <a href="#/portal/lecturer/advising" class="btn btn-secondary btn-sm"><i class="bi bi-journal-check"></i> Bimbingan Akademik</a>
            <a href="#/portal/lecturer/thesis" class="btn btn-secondary btn-sm"><i class="bi bi-file-earmark-text"></i> Bimbingan TA</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Announcements -->
    <div class="card" style="margin-top:1rem">
      <div class="card-header"><h3 class="card-title"><i class="bi bi-megaphone"></i> Pengumuman Terbaru</h3></div>
      <div class="card-body">
        ${scopeRows(DB.getAll('notifications')).filter(n => n.role?.includes('Dosen')).slice(0, 3).map(n => `
          <div class="notif-row">
            <div><strong>${n.title}</strong><br><small class="text-muted">${n.message}</small></div>
            <small class="text-muted">${formatDate(n.time)}</small>
          </div>`).join('') || '<div class="text-muted">Tidak ada pengumuman terbaru.</div>'}
      </div>
    </div>
  </div>`;
}

function initDashboardCharts() { /* Chart.js init if needed */ }


/* --------------------------------------------------
   17. PROFIL & PENGATURAN (9.0.17)
   -------------------------------------------------- */
function buildProfile(lecturer) {
  const campus = campusName(lecturer.campusId);
  const prodi = prodiName(lecturer.prodiId);

  return `
  <div class="lec-page">
    <div class="lec-page-header"><h2><i class="bi bi-person-circle"></i> Profil & Pengaturan</h2></div>
    <div class="lec-grid-2">
      <div class="card">
        <div class="card-header"><h3 class="card-title">Data Diri</h3></div>
        <div class="card-body">
          ${[
            ['Nama Lengkap', lecturer.name],
            ['NIDN', lecturer.nidn],
            ['Email', lecturer.email],
            ['Telepon', lecturer.phone],
            ['Kampus', campus],
            ['Program Studi', prodi],
            ['Jabatan Akademik', lecturer.position],
            ['Status', lecturer.status],
          ].map(([k,v]) => `<div class="stat-row"><span class="stat-row-label">${k}</span><span class="stat-row-value">${v || '-'}</span></div>`).join('')}
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:1rem">
          <div class="card-header"><h3 class="card-title">Riwayat Pendidikan</h3></div>
          <div class="card-body">
            <div class="stat-row"><span>S3</span><span>Universitas Demo (2020)</span></div>
            <div class="stat-row"><span>S2</span><span>Institut Teknologi Demo (2015)</span></div>
            <div class="stat-row"><span>S1</span><span>Universitas Demo (2010)</span></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Pengaturan</h3></div>
          <div class="card-body">
            <div class="form-check form-switch mb-2">
              <input class="form-check-input" type="checkbox" ${lecturer.prefs?.notifKrs !== false ? 'checked' : ''} id="notif-toggle">
              <label class="form-check-label" for="notif-toggle">Notifikasi KRS</label>
            </div>
            <div class="form-check form-switch mb-2">
              <input class="form-check-input" type="checkbox" ${lecturer.prefs?.notifTa !== false ? 'checked' : ''} id="notif-ta">
              <label class="form-check-label" for="notif-ta">Notifikasi Bimbingan TA</label>
            </div>
            <button class="btn btn-primary btn-sm mt-2" id="lec-prefs-save"><i class="bi bi-save"></i> Simpan</button>
            <a href="#/portal/lecturer/reports" class="btn btn-secondary btn-sm mt-2"><i class="bi bi-shield-check"></i> Lihat Audit Trail</a>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

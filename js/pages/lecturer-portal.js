/**
 * SIAKAD — Portal Dosen (design.md bagian 9)
 * 17 menu; LEC-031–037 di lecturer-ops.js
 */
import { DB } from '../data/seed.js';
import { AppState } from '../state.js';
import { formatDate, statusBadge } from '../utils.js';
import { showToast } from '../components/toast.js';
import { renderAdvisorKrsApproval, countPendingForAdvisor } from './krs-approval.js';
import {
  getLecturerClasses as getAssignedClasses,
  buildAcademicAdvisorPage,
  buildAdvisingPage,
  buildAnnouncementsPage,
  buildReportsPage,
  buildAdministrationPage,
  bindLecturerOps,
} from './lecturer-ops.js';

/* ── helpers ──────────────────────────────────────── */
function getLecturer() {
  const role = AppState.currentRole;
  return DB.getAll('lecturers').find(l => l.id === (role.lecturerId || 'lec-1'));
}
function getLecturerClasses(lecId) { return getAssignedClasses(lecId); }
function courseName(courseId) { return DB.getAll('courses').find(c => c.id === courseId)?.name || '-'; }
function courseObj(courseId) { return DB.getAll('courses').find(c => c.id === courseId); }
function prodiName(prodiId) { return DB.getAll('studyPrograms').find(p => p.id === prodiId)?.name || '-'; }
function campusName(campusId) { return DB.getAll('campuses').find(c => c.id === campusId)?.name || '-'; }

/* ── main entry ──────────────────────────────────── */
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
    <div class="empty-state-title">${hasAny ? 'Profil dosen tidak cocok dengan peran aktif' : 'Data demo belum tersedia di perangkat ini'}</div>
    <p class="text-muted" style="max-width:28rem;margin:0.75rem auto 1.25rem">
      ${hasAny
        ? 'Ganti peran di pojok kanan atas ke <strong>Dosen</strong>.'
        : 'Prototype menyimpan data di localStorage browser HP (bukan server). Storage kosong/rusak sering terjadi di mode privat, browser dalam aplikasi (WhatsApp/Instagram), atau kuota penuh.'}
    </p>
    <button type="button" class="btn btn-primary" id="lec-reseed-btn">
      <i class="bi bi-arrow-clockwise"></i> Muat ulang data demo
    </button>
  </div>
</div>`;
    container.querySelector('#lec-reseed-btn')?.addEventListener('click', async () => {
      const { initSeed } = await import('../data/seed.js');
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
}

/* ── page router ─────────────────────────────────── */
function buildPageContent(page, sub, lecturer) {
  const classes = getLecturerClasses(lecturer.id);
  switch (page) {
    case 'dashboard': return buildDashboard(lecturer, classes);
    case 'courses': return buildCourses(lecturer, classes, sub);
    case 'schedule': return buildSchedule(lecturer, classes);
    case 'materials': return buildMaterials(lecturer, classes);
    case 'assignments': return buildAssignments(lecturer, classes);
    case 'grading': return buildGrading(lecturer, classes);
    case 'attendance': return buildAttendance(lecturer, classes);
    case 'journal': return buildJournal(lecturer, classes);
    case 'exam': return buildExam(lecturer, classes);
    case 'advising': return buildAdvisingPage(lecturer);
    case 'thesis': return buildThesis(lecturer);
    case 'examination': return buildExamination(lecturer);
    case 'academic-advisor': return buildAcademicAdvisorPage(lecturer);
    case 'announcements': return buildAnnouncementsPage(lecturer, classes);
    case 'reports': return buildReportsPage(lecturer, classes);
    case 'administration': return buildAdministrationPage(lecturer);
    case 'profile': return buildProfile(lecturer);
    default: return buildDashboard(lecturer, classes);
  }
}

/* ══════════════════════════════════════════════════
   1. DASHBOARD (9.0.1)
   ══════════════════════════════════════════════════ */
function buildDashboard(lecturer, classes) {
  const campus = campusName(lecturer.campusId);
  const totalMhs = classes.reduce((s, c) => s + (c.enrolled || 0), 0);
  const theses = DB.getAll('theses').filter(t => t.supervisorId === lecturer.id);
  const pendingKRS = countPendingForAdvisor(lecturer.id);
  const grades = DB.getAll('grades').filter(g => classes.some(cl => cl.courseId === g.courseId) && g.lecturerId === lecturer.id);
  const unfinalGrades = classes.filter(cl => {
    const gs = DB.getAll('grades').filter(g => g.courseId === cl.courseId);
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
      <span class="text-muted">${campus} · Semester Ganjil 2026/2027</span>
    </div>

    <!-- Profile Banner -->
    <div class="lec-profile-banner">
      <div class="lec-profile-avatar">${lecturer.name.charAt(0)}</div>
      <div class="lec-profile-info">
        <h3>${lecturer.name}</h3>
        <p>NIDN: ${lecturer.nidn} · ${lecturer.position} · ${campus}</p>
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
        <div class="lec-kpi-val">${classes.length * 2}</div>
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
        <div class="lec-kpi-val">${classes.length * 2}</div>
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
                <div class="schedule-time">${cl.startTime} – ${cl.endTime}</div>
                <div class="schedule-detail">
                  <strong>${co?.name || '-'}</strong>
                  <span class="text-muted">${cl.code} · ${cl.room} · ${cl.enrolled}/${cl.capacity} mhs</span>
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
              <span class="bimbingan-val">${DB.getAll('advisorAssignments').filter(a => a.lecturerId === lecturer.id && a.status === 'aktif').length}</span>
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
        ${DB.getAll('notifications').filter(n => n.role?.includes('Dosen')).slice(0, 3).map(n => `
          <div class="notif-row">
            <div><strong>${n.title}</strong><br><small class="text-muted">${n.message}</small></div>
            <small class="text-muted">${formatDate(n.time)}</small>
          </div>`).join('') || '<div class="text-muted">Tidak ada pengumuman terbaru.</div>'}
      </div>
    </div>
  </div>`;
}

function initDashboardCharts() { /* Chart.js init if needed */ }

/* ══════════════════════════════════════════════════
   2. MATA KULIAH SAYA (9.0.2)
   ══════════════════════════════════════════════════ */
function buildCourses(lecturer, classes, sub) {
  // Group by course
  const courseMap = {};
  classes.forEach(cl => {
    const co = courseObj(cl.courseId);
    if (!co) return;
    if (!courseMap[co.id]) courseMap[co.id] = { course: co, classes: [] };
    courseMap[co.id].classes.push(cl);
  });
  const courseList = Object.values(courseMap);

  return `
  <div class="lec-page">
    <div class="lec-page-header">
      <h2><i class="bi bi-book"></i> Mata Kuliah Saya</h2>
      <span class="text-muted">Semester Ganjil 2026/2027</span>
    </div>
    <div class="card">
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr>
            <th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Program Studi</th>
            <th>Jumlah Kelas</th><th>Total Mahasiswa</th><th>Status</th>
          </tr></thead>
          <tbody>
            ${courseList.map(({ course: co, classes: cls }) => `
            <tr>
              <td><code>${co.code}</code></td>
              <td><strong>${co.name}</strong></td>
              <td>${co.sks}</td>
              <td>${prodiName(co.prodiId)}</td>
              <td>${cls.length}</td>
              <td>${cls.reduce((s, c) => s + c.enrolled, 0)}</td>
              <td>${statusBadge(co.status)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <h3 style="margin-top:1.5rem;font-size:1rem"><i class="bi bi-collection"></i> Daftar Kelas</h3>
    <div class="card">
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr>
            <th>Kode Kelas</th><th>Mata Kuliah</th><th>Hari & Jam</th><th>Ruang</th>
            <th>Peserta</th><th>Status</th><th>Aksi</th>
          </tr></thead>
          <tbody>
            ${classes.map(cl => {
              const co = courseObj(cl.courseId);
              return `
              <tr>
                <td><strong>${cl.code}</strong></td>
                <td>${co?.name || '-'} <span class="badge badge-info">${co?.sks || 0} SKS</span></td>
                <td>${cl.day}, ${cl.startTime}–${cl.endTime}</td>
                <td>${cl.room}</td>
                <td><strong>${cl.enrolled}</strong>/${cl.capacity}</td>
                <td>${statusBadge(cl.status)}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="showToast('Detail kelas ${cl.code}','info')"><i class="bi bi-eye"></i></button>
                  <a href="#/portal/lecturer/attendance" class="btn btn-secondary btn-sm"><i class="bi bi-check2-square"></i></a>
                  <a href="#/portal/lecturer/grading" class="btn btn-secondary btn-sm"><i class="bi bi-bar-chart-line"></i></a>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════
   3. JADWAL MENGAJAR (9.0.3)
   ══════════════════════════════════════════════════ */
function buildSchedule(lecturer, classes) {
  const days = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const todayIdx = new Date().getDay();
  const todayName = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][todayIdx];

  return `
  <div class="lec-page">
    <div class="lec-page-header">
      <h2><i class="bi bi-calendar3"></i> Jadwal Mengajar</h2>
    </div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">Jadwal Mingguan</h3></div>
      <div class="card-body">
        <div class="weekly-schedule">
          ${days.map(d => {
            const dayClasses = classes.filter(c => c.day === d);
            return `
            <div class="schedule-day-col ${d === todayName ? 'today' : ''}">
              <div class="schedule-day-header">${d} ${d === todayName ? '<span class="badge badge-gold">Hari Ini</span>' : ''}</div>
              ${dayClasses.length === 0
                ? '<div class="schedule-empty">—</div>'
                : dayClasses.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(cl => {
                  const co = courseObj(cl.courseId);
                  return `
                  <div class="schedule-block">
                    <div class="schedule-block-time">${cl.startTime} – ${cl.endTime}</div>
                    <div class="schedule-block-course">${co?.name || '-'}</div>
                    <div class="schedule-block-meta">${cl.code} · ${cl.room}</div>
                    <div class="schedule-block-meta">${cl.enrolled}/${cl.capacity} mhs</div>
                  </div>`;
                }).join('')}
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Pengajuan Jadwal Pengganti -->
    <div class="card" style="margin-top:1rem">
      <div class="card-header">
        <h3 class="card-title"><i class="bi bi-arrow-repeat"></i> Pengajuan Jadwal Pengganti</h3>
        <button class="btn btn-primary btn-sm" onclick="showToast('Form pengajuan jadwal pengganti akan tersedia di versi lengkap.','info')"><i class="bi bi-plus"></i> Ajukan</button>
      </div>
      <div class="card-body">
        <div class="empty-state" style="padding:1rem"><div class="empty-state-desc">Belum ada pengajuan jadwal pengganti.</div></div>
      </div>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════
   4. MATERI & MODUL (9.0.4)
   ══════════════════════════════════════════════════ */
function buildMaterials(lecturer, classes) {
  return `
  <div class="lec-page">
    <div class="lec-page-header">
      <h2><i class="bi bi-folder2-open"></i> Materi & Modul</h2>
      <button class="btn btn-primary btn-sm" onclick="showToast('Form upload materi — pada prototype hanya metadata yang disimpan (LEC-014).','info')"><i class="bi bi-upload"></i> Upload Materi</button>
    </div>
    <div class="info-box" style="margin-bottom:1rem"><i class="bi bi-info-circle"></i> <strong>Batasan prototype:</strong> File tidak disimpan sebagai base64 di localStorage. Hanya metadata yang disimpan. Pada produksi, file disimpan di object storage (S3/GCS/Azure Blob) dengan signed URL dan enkripsi.</div>
    ${classes.map(cl => {
      const co = courseObj(cl.courseId);
      return `
      <div class="card" style="margin-bottom:1rem">
        <div class="card-header"><h3 class="card-title">${co?.name || '-'} — ${cl.code}</h3></div>
        <div class="scroll-x">
          <table class="data-table">
            <thead><tr><th>Pertemuan</th><th>Judul</th><th>Jenis</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              ${[1,2,3].map(i => `
              <tr>
                <td>Pertemuan ${i}</td>
                <td>${i === 1 ? 'RPS ' + (co?.name || '') : i === 2 ? 'Modul ' + i : 'Slide Presentasi ' + i}</td>
                <td><span class="badge badge-info">${i === 1 ? 'RPS' : i === 2 ? 'Modul' : 'Slide'}</span></td>
                <td>${statusBadge(i <= 2 ? 'dipublikasikan' : 'draft')}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="showToast('Preview materi (simulasi)','info')"><i class="bi bi-eye"></i></button>
                  <button class="btn btn-secondary btn-sm" onclick="showToast('Edit materi (simulasi)','info')"><i class="bi bi-pencil"></i></button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

/* ══════════════════════════════════════════════════
   5. TUGAS & KUIS (9.0.5)
   ══════════════════════════════════════════════════ */
function buildAssignments(lecturer, classes) {
  const demoAssignments = classes.flatMap(cl => {
    const co = courseObj(cl.courseId);
    return [
      { id: `asg-${cl.id}-1`, title: `Tugas 1 - ${co?.name}`, classCode: cl.code, courseName: co?.name, deadline: '2026-11-15', submitted: Math.floor(cl.enrolled * 0.7), total: cl.enrolled, graded: Math.floor(cl.enrolled * 0.3), status: 'Dipublikasikan' },
      { id: `asg-${cl.id}-2`, title: `Kuis 1 - ${co?.name}`, classCode: cl.code, courseName: co?.name, deadline: '2026-11-20', submitted: Math.floor(cl.enrolled * 0.5), total: cl.enrolled, graded: 0, status: 'Draft' },
    ];
  });

  return `
  <div class="lec-page">
    <div class="lec-page-header">
      <h2><i class="bi bi-clipboard-check"></i> Tugas & Kuis</h2>
      <button class="btn btn-primary btn-sm" onclick="showToast('Form buat tugas baru akan tersedia.','info')"><i class="bi bi-plus"></i> Buat Tugas</button>
    </div>
    <div class="card">
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr>
            <th>Judul</th><th>Kelas</th><th>Deadline</th><th>Pengumpulan</th><th>Dinilai</th><th>Status</th><th>Aksi</th>
          </tr></thead>
          <tbody>
            ${demoAssignments.map(a => `
            <tr>
              <td><strong>${a.title}</strong></td>
              <td>${a.classCode}</td>
              <td>${formatDate(a.deadline)}</td>
              <td>${a.submitted}/${a.total}</td>
              <td>${a.graded}/${a.submitted}</td>
              <td>${statusBadge(a.status)}</td>
              <td>
                <button class="btn btn-secondary btn-sm" onclick="showToast('Lihat pengumpulan (simulasi)','info')"><i class="bi bi-eye"></i></button>
                <button class="btn btn-primary btn-sm" onclick="showToast('Mulai penilaian (simulasi)','info')"><i class="bi bi-pencil"></i> Nilai</button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════
   6. PENILAIAN (9.0.6)
   ══════════════════════════════════════════════════ */
function buildGrading(lecturer, classes) {
  const components = ['Tugas (20%)', 'Kuis (10%)', 'Praktikum (15%)', 'UTS (25%)', 'UAS (30%)'];

  return `
  <div class="lec-page">
    <div class="lec-page-header">
      <h2><i class="bi bi-bar-chart-line"></i> Penilaian</h2>
    </div>
    <div class="info-box" style="margin-bottom:1rem"><i class="bi bi-info-circle"></i> Bobot penilaian per mata kuliah dapat dikonfigurasi. Jangan hardcode bobot secara global (LEC-019). Total bobot harus 100%.</div>

    ${classes.map(cl => {
      const co = courseObj(cl.courseId);
      const students = DB.getAll('students').filter(s => s.prodiId === cl.prodiId).slice(0, 5);
      return `
      <div class="card" style="margin-bottom:1rem">
        <div class="card-header">
          <h3 class="card-title">${co?.name || '-'} — ${cl.code}</h3>
          <div style="display:flex;gap:0.5rem">
            <button class="btn btn-secondary btn-sm" onclick="showToast('Pengaturan komponen & bobot','info')"><i class="bi bi-gear"></i> Komponen</button>
            <button class="btn btn-primary btn-sm" onclick="showToast('Nilai disimpan sebagai draft (simulasi).','gold')"><i class="bi bi-save"></i> Simpan Draft</button>
            <button class="btn btn-accent btn-sm" onclick="if(confirm('Finalisasi nilai ${cl.code}?')) showToast('Nilai ${cl.code} telah difinalisasi (simulasi).','gold')"><i class="bi bi-lock"></i> Finalisasi</button>
          </div>
        </div>
        <div class="card-body">
          <div class="text-muted mb-2" style="font-size:0.8rem">Komponen: ${components.join(' · ')}</div>
        </div>
        <div class="scroll-x">
          <table class="data-table">
            <thead><tr><th>NIM</th><th>Nama</th><th>Tugas</th><th>Kuis</th><th>Praktikum</th><th>UTS</th><th>UAS</th><th>Nilai Akhir</th><th>Huruf</th></tr></thead>
            <tbody>
              ${students.map(s => {
                const t = 70+Math.floor(Math.random()*20), k = 65+Math.floor(Math.random()*25),
                      p = 70+Math.floor(Math.random()*20), u = 60+Math.floor(Math.random()*30),
                      f = 55+Math.floor(Math.random()*35);
                const na = (t*0.2 + k*0.1 + p*0.15 + u*0.25 + f*0.3).toFixed(1);
                const huruf = na >= 85 ? 'A' : na >= 80 ? 'A-' : na >= 75 ? 'B+' : na >= 70 ? 'B' : na >= 65 ? 'B-' : na >= 60 ? 'C+' : na >= 55 ? 'C' : 'D';
                return `<tr>
                  <td><code>${s.nim}</code></td><td>${s.name}</td>
                  <td><input type="number" class="form-control form-control-sm" value="${t}" min="0" max="100" style="width:60px"></td>
                  <td><input type="number" class="form-control form-control-sm" value="${k}" min="0" max="100" style="width:60px"></td>
                  <td><input type="number" class="form-control form-control-sm" value="${p}" min="0" max="100" style="width:60px"></td>
                  <td><input type="number" class="form-control form-control-sm" value="${u}" min="0" max="100" style="width:60px"></td>
                  <td><input type="number" class="form-control form-control-sm" value="${f}" min="0" max="100" style="width:60px"></td>
                  <td><strong>${na}</strong></td>
                  <td><span class="badge badge-${parseFloat(na)>=70?'success':'danger'}">${huruf}</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

/* ══════════════════════════════════════════════════
   7. PRESENSI (9.0.7)
   ══════════════════════════════════════════════════ */
function buildAttendance(lecturer, classes) {
  return `
  <div class="lec-page">
    <div class="lec-page-header">
      <h2><i class="bi bi-check2-square"></i> Presensi Mahasiswa</h2>
    </div>
    ${classes.map(cl => {
      const co = courseObj(cl.courseId);
      const students = DB.getAll('students').filter(s => s.prodiId === cl.prodiId).slice(0, 5);
      return `
      <div class="card" style="margin-bottom:1rem">
        <div class="card-header">
          <h3 class="card-title">${co?.name || '-'} — ${cl.code}</h3>
          <div style="display:flex;gap:0.5rem">
            <select class="form-select form-select-sm" style="width:auto"><option>Pertemuan 1</option><option>Pertemuan 2</option><option selected>Pertemuan 3</option></select>
            <button class="btn btn-primary btn-sm" onclick="showToast('Presensi ${cl.code} disimpan (simulasi).','gold')"><i class="bi bi-save"></i> Simpan</button>
          </div>
        </div>
        <div class="scroll-x">
          <table class="data-table">
            <thead><tr><th>NIM</th><th>Nama</th><th>Status</th><th>Kehadiran</th></tr></thead>
            <tbody>
              ${students.map(s => {
                const pct = 75 + Math.floor(Math.random() * 25);
                return `<tr>
                  <td><code>${s.nim}</code></td><td>${s.name}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-success btn-sm active">H</button>
                      <button class="btn btn-outline-secondary btn-sm">I</button>
                      <button class="btn btn-outline-secondary btn-sm">S</button>
                      <button class="btn btn-outline-secondary btn-sm">A</button>
                    </div>
                  </td>
                  <td><div class="progress" style="height:6px;width:80px"><div class="progress-bar ${pct>=75?'bg-success':'bg-danger'}" style="width:${pct}%"></div></div> <small>${pct}%</small></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

/* ══════════════════════════════════════════════════
   8. JURNAL (9.0.8)
   ══════════════════════════════════════════════════ */
function buildJournal(lecturer, classes) {
  return `
  <div class="lec-page">
    <div class="lec-page-header"><h2><i class="bi bi-journal-text"></i> Jurnal Perkuliahan</h2></div>
    ${classes.map(cl => {
      const co = courseObj(cl.courseId);
      return `
      <div class="card" style="margin-bottom:1rem">
        <div class="card-header"><h3 class="card-title">${co?.name || '-'} — ${cl.code}</h3></div>
        <div class="scroll-x">
          <table class="data-table">
            <thead><tr><th>Pertemuan</th><th>Tanggal</th><th>Topik</th><th>Capaian</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              ${[1,2,3].map(i => `
              <tr>
                <td>Pertemuan ${i}</td>
                <td>${formatDate(`2026-09-0${i}`)}</td>
                <td>${i <= 2 ? 'Topik pertemuan ' + i : '-'}</td>
                <td>${i <= 2 ? 'CPL-' + i : '-'}</td>
                <td>${statusBadge(i <= 2 ? 'Terisi' : 'Belum Diisi')}</td>
                <td><button class="btn btn-secondary btn-sm" onclick="showToast('Isi jurnal pertemuan ${i} (simulasi)','info')"><i class="bi bi-pencil"></i></button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

/* ══════════════════════════════════════════════════
   9. UJIAN (9.0.9)
   ══════════════════════════════════════════════════ */
function buildExam(lecturer, classes) {
  return `
  <div class="lec-page">
    <div class="lec-page-header"><h2><i class="bi bi-pencil-square"></i> Ujian</h2></div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">Jadwal UTS/UAS</h3></div>
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr><th>Mata Kuliah</th><th>Kelas</th><th>Jenis</th><th>Tanggal</th><th>Jam</th><th>Ruang</th><th>Peserta</th><th>Aksi</th></tr></thead>
          <tbody>
            ${classes.map(cl => {
              const co = courseObj(cl.courseId);
              return `
              <tr><td>${co?.name}</td><td>${cl.code}</td><td><span class="badge badge-warning">UTS</span></td><td>2026-11-10</td><td>08:00–10:00</td><td>${cl.room}</td><td>${cl.enrolled}</td>
              <td><button class="btn btn-secondary btn-sm" onclick="showToast('Berita acara ujian (simulasi)','info')"><i class="bi bi-file-earmark-text"></i> Berita Acara</button></td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════
   11. SKRIPSI / TA (9.0.11)
   ══════════════════════════════════════════════════ */
function buildThesis(lecturer) {
  const theses = DB.getAll('theses').filter(t => t.supervisorId === lecturer.id);
  const students = DB.getAll('students');

  return `
  <div class="lec-page">
    <div class="lec-page-header"><h2><i class="bi bi-file-earmark-text"></i> Skripsi / Tugas Akhir</h2></div>
    <div class="card">
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr><th>NIM</th><th>Nama</th><th>Judul</th><th>Tahap</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            ${theses.length ? theses.map(t => {
              const s = students.find(st => st.id === t.studentId);
              return `<tr>
                <td><code>${s?.nim||'-'}</code></td><td>${s?.name||'-'}</td>
                <td style="max-width:300px">${t.title}</td>
                <td>${statusBadge(t.stage)}</td><td>${statusBadge(t.status)}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="showToast('Riwayat bimbingan (simulasi)','info')"><i class="bi bi-chat-left-dots"></i></button>
                  <button class="btn btn-primary btn-sm" onclick="showToast('Persetujuan seminar/sidang (simulasi)','info')"><i class="bi bi-check-circle"></i></button>
                </td>
              </tr>`;
            }).join('') : '<tr><td colspan="6"><div class="empty-state" style="padding:1rem"><div class="empty-state-desc">Belum ada mahasiswa bimbingan TA.</div></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════
   12. SIDANG & PENGUJI (9.0.12)
   ══════════════════════════════════════════════════ */
function buildExamination(lecturer) {
  return `
  <div class="lec-page">
    <div class="lec-page-header"><h2><i class="bi bi-shield-check"></i> Sidang & Penguji</h2></div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">Jadwal Sidang</h3></div>
      <div class="card-body">
        <div class="empty-state" style="padding:2rem">
          <i class="bi bi-calendar-x" style="font-size:2rem;color:var(--color-muted)"></i>
          <div class="empty-state-desc">Tidak ada jadwal sidang yang melibatkan Anda saat ini.</div>
          <p class="text-muted" style="font-size:0.8rem">Menu ini tampil jika Anda ditugaskan sebagai penguji atau ketua sidang.</p>
        </div>
      </div>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════
   17. PROFIL & PENGATURAN (9.0.17)
   ══════════════════════════════════════════════════ */
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

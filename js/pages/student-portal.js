/**
 * SIAKAD — Portal Mahasiswa (design.md 8.1 + dashboard D)
 * Subhalaman selain Registrasi & KRS (sudah di modul terpisah)
 */

import { DB } from '../data/seed.js';
import { AppState } from '../state.js';
import { formatRupiah, formatDate, formatDateTime, statusBadge } from '../utils.js';
import { createBarChart } from '../components/charts.js';
import { calcIpsLast, maxSksFromIps, getPolicy as getKrsPolicy } from './student-krs.js';

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getStudent() {
  const role = AppState.currentRole;
  return DB.getAll('students').find(s => s.id === (role.studentId || 'stu-1'));
}

function getReg(studentId) {
  return DB.getAll('semesterRegistrations').find(r => r.studentId === studentId && r.semesterId === 'sem-1');
}

function getPlan(studentId) {
  return DB.getAll('krsPlans').find(p => p.studentId === studentId && p.semesterId === 'sem-1');
}

function getRegPolicy() {
  return DB.get('registrationPolicy') || { periodOpen: true, periodEnd: '2026-09-15', requireRegistrationBeforeKrs: true };
}

function emptyPage(title, desc, hint = '') {
  return `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">${esc(title)}</h1>
      <p class="page-desc">${esc(desc)}</p>
    </div>
    <div class="page-actions">
      <a href="#/portal/student" class="btn btn-secondary"><i class="bi bi-house"></i> Dashboard</a>
    </div>
  </div>
  <div class="empty-state" style="padding:2.5rem">
    <div class="empty-state-title">${esc(title)}</div>
    <div class="empty-state-desc">${esc(hint || 'Fitur ini belum tersedia di prototype demo. Data akan ditampilkan di sini jika sudah diaktifkan.')}</div>
  </div>
</div>`;
}

function pageShell(title, desc, body, actions = '') {
  return `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">${esc(title)}</h1>
      <p class="page-desc">${esc(desc)}</p>
    </div>
    <div class="page-actions">
      ${actions}
      <a href="#/portal/student" class="btn btn-secondary"><i class="bi bi-house"></i> Dashboard</a>
    </div>
  </div>
  ${body}
</div>`;
}

/** Dispatch sub-route portal mahasiswa (selain registration & krs) */
export function renderStudentPortalExtra(path, container) {
  const student = getStudent();
  if (!student) {
    container.innerHTML = '<div class="page-container"><p>Data mahasiswa tidak ditemukan.</p></div>';
    return;
  }

  if (path.includes('/profile') || path.includes('/profil')) return renderProfile(container, student);
  if (path.includes('/khs')) return renderKhs(container, student);
  if (path.includes('/transcript')) return renderTranscript(container, student);
  if (path.includes('/schedule')) return renderSchedule(container, student);
  if (path.includes('/calendar')) return renderCalendar(container, student);
  if (path.includes('/advisor')) return renderAdvisor(container, student);
  if (path.includes('/finance/invoices') || path.endsWith('/finance/invoices')) return renderInvoices(container, student);
  if (path.includes('/finance/payments') || path.endsWith('/finance/payments')) return renderPayments(container, student);
  if (path.includes('/finance')) return renderInvoices(container, student);
  if (path.includes('/scholarship') || path.includes('/beasiswa')) return renderScholarship(container, student);
  if (path.includes('/letters') || path.includes('/surat')) {
    container.innerHTML = emptyPage('Surat Akademik', 'Permohonan surat keterangan dan dokumen akademik', 'Belum ada surat yang dapat diajukan di prototype ini.');
    return;
  }
  if (path.includes('/announcements') || path.includes('/pengumuman')) return renderAnnouncements(container, student);
  if (path.includes('/notifications') || path.includes('/notifikasi')) return renderNotifications(container, student);
  if (path.includes('/settings') || path.includes('/akun')) {
    container.innerHTML = emptyPage('Pengaturan Akun', 'Preferensi tampilan dan keamanan akun demo', 'Pengaturan akun belum diaktifkan. Gunakan pemilih peran di topbar untuk ganti identitas demo.');
    return;
  }

  // Default: dashboard
  return renderStudentDashboard(container, student);
}

// ===================== DASHBOARD =====================

export function renderStudentDashboard(container, student) {
  if (!student) student = getStudent();
  if (!student) {
    container.innerHTML = '<div class="page-container"><p>Data mahasiswa tidak ditemukan.</p></div>';
    return;
  }

  const prodi = DB.getById('studyPrograms', student.prodiId);
  const campus = DB.getById('campuses', student.campusId);
  const advisor = DB.getById('lecturers', student.advisor);
  const reg = getReg(student.id);
  const plan = getPlan(student.id);
  const regPol = getRegPolicy();
  const krsPol = getKrsPolicy();
  const ips = calcIpsLast(student.id);
  const maxSks = maxSksFromIps(ips);
  const totalSks = (plan?.items || []).reduce((s, i) => s + (i.sks || 0), 0);
  const invoices = DB.getAll('invoices').filter(i => i.studentId === student.id);
  const unpaid = invoices.filter(i => (i.remaining || 0) > 0);
  const nextDue = unpaid.slice().sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))[0];
  const notifs = DB.getAll('notifications').filter(n =>
    !n.studentId || n.studentId === student.id || (n.role || []).includes('Mahasiswa')
  ).slice(0, 5);
  const theses = DB.getAll('theses').filter(t => t.studentId === student.id);
  const semester = DB.getById('semesters', 'sem-1');
  const nextClass = nextApprovedClass(plan);

  const regStatus = reg?.status || 'Belum Registrasi';
  const krsStatus = plan?.status || 'Belum Dibuat';
  const quick = buildQuickActions(reg, plan, regPol, krsPol);

  container.innerHTML = `
<div class="page-container portal-container">
  <div class="portal-header-card">
    <div class="portal-header-avatar">${esc(student.name.charAt(0))}</div>
    <div class="portal-header-info">
      <div class="portal-header-name">${esc(student.name)}</div>
      <div class="portal-header-sub">${esc(student.nim)} · ${esc(prodi?.name || '-')} · ${esc(campus?.code || '-')}</div>
      <div class="portal-header-badges">
        ${statusBadge(student.status)}
        <span class="badge badge-gold">Semester ${student.semester}</span>
        <span class="badge badge-navy">Angkatan ${student.angkatan}</span>
      </div>
    </div>
    <div class="portal-header-ipk">
      <div class="portal-ipk-value">${student.ipk.toFixed(2)}</div>
      <div class="portal-ipk-label">IPK</div>
    </div>
  </div>

  ${unpaid.length ? `
  <div class="info-box info-box-danger" style="margin-bottom:1rem">
    <i class="bi bi-exclamation-triangle-fill"></i>
    <strong>${unpaid.length} tagihan</strong> belum lunas
    (${formatRupiah(unpaid.reduce((s, i) => s + i.remaining, 0))}).
    <a href="#/portal/student/finance/invoices" class="btn btn-danger btn-sm ms-2">Lihat Tagihan</a>
  </div>` : ''}

  ${plan?.advisorNote && plan.status === 'Perlu Revisi' ? `
  <div class="info-box info-box-warning" style="margin-bottom:1rem">
    <i class="bi bi-chat-left-text"></i>
    <strong>Catatan dosen wali:</strong> ${esc(plan.advisorNote)}
    <a href="#/portal/student/krs/edit" class="btn btn-warning btn-sm ms-2">Perbaiki KRS</a>
  </div>` : ''}

  <div class="portal-status-grid">
    <div class="portal-status-card">
      <div class="portal-status-label">Registrasi semester</div>
      <div>${statusBadge(regStatus)}</div>
      <div class="portal-status-meta">Batas: ${formatDate(regPol.periodEnd || '2026-09-15')}</div>
    </div>
    <div class="portal-status-card">
      <div class="portal-status-label">Status KRS</div>
      <div>${statusBadge(krsStatus)}</div>
      <div class="portal-status-meta" role="status">${totalSks} dari ${maxSks} SKS</div>
    </div>
    <div class="portal-status-card">
      <div class="portal-status-label">IPK / IPS terakhir</div>
      <div class="portal-status-nums"><strong>${student.ipk.toFixed(2)}</strong> / ${ips != null ? ips.toFixed(2) : '—'}</div>
      <div class="portal-status-meta">IPS dari semester yang sudah dipublikasikan</div>
    </div>
    <div class="portal-status-card">
      <div class="portal-status-label">Tagihan aktif</div>
      <div class="portal-status-nums">${unpaid.length ? formatRupiah(unpaid.reduce((s, i) => s + i.remaining, 0)) : 'Lunas'}</div>
      <div class="portal-status-meta">${nextDue ? `Jatuh tempo ${formatDate(nextDue.dueDate)}` : 'Tidak ada tunggakan'}</div>
    </div>
  </div>

  <div class="portal-quick-actions" style="margin:1rem 0">
    <div class="portal-quick-label">Aksi cepat</div>
    <div class="portal-quick-row">
      ${quick.map(q => q.html).join('')}
    </div>
  </div>

  <div class="portal-kpi-row" style="margin-bottom:1rem">
    <div class="portal-kpi" onclick="location.hash='#/portal/student/krs'">
      <div class="portal-kpi-val">${(plan?.items || []).length}</div>
      <div class="portal-kpi-lbl"><i class="bi bi-journal-check"></i> MK di KRS</div>
    </div>
    <div class="portal-kpi">
      <div class="portal-kpi-val">${totalSks}</div>
      <div class="portal-kpi-lbl"><i class="bi bi-stack"></i> SKS semester</div>
    </div>
    <div class="portal-kpi" onclick="location.hash='#/portal/student/transcript'">
      <div class="portal-kpi-val">${DB.getAll('grades').filter(g => g.studentId === student.id && g.status === 'final').reduce((s, g) => s + (g.sks || 0), 0)}</div>
      <div class="portal-kpi-lbl"><i class="bi bi-award"></i> SKS lulus</div>
    </div>
    <div class="portal-kpi" onclick="location.hash='#/portal/student/advisor'">
      <div class="portal-kpi-val" style="font-size:0.95rem">${esc((advisor?.name || '—').split(',')[0])}</div>
      <div class="portal-kpi-lbl"><i class="bi bi-person-badge"></i> Dosen wali</div>
    </div>
  </div>

  <div class="portal-grid">
    <div>
      <div class="card" style="margin-bottom:1rem">
        <div class="card-header">
          <h3 class="card-title">Jadwal kuliah berikutnya</h3>
          <a href="#/portal/student/schedule" class="btn btn-secondary btn-sm">Semua jadwal</a>
        </div>
        <div class="card-body">
          ${nextClass ? `
            <div class="stat-row"><span class="stat-row-label">Mata kuliah</span><span class="stat-row-value">${esc(nextClass.name)}</span></div>
            <div class="stat-row"><span class="stat-row-label">Waktu</span><span class="stat-row-value">${esc(nextClass.day)} ${esc(nextClass.startTime)}–${esc(nextClass.endTime)}</span></div>
            <div class="stat-row"><span class="stat-row-label">Ruang</span><span class="stat-row-value">${esc(nextClass.room || '-')}</span></div>
          ` : `<div class="empty-state" style="padding:1rem"><div class="empty-state-desc">Belum ada jadwal dari KRS Disetujui/Final. <a href="#/portal/student/krs">Lihat KRS</a></div></div>`}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3 class="card-title">Batas waktu akademik</h3></div>
        <div class="card-body">
          <div class="stat-row"><span class="stat-row-label">Registrasi</span><span class="stat-row-value">${formatDate(regPol.periodStart)} – ${formatDate(regPol.periodEnd)}</span></div>
          <div class="stat-row"><span class="stat-row-label">Pengisian KRS</span><span class="stat-row-value">${formatDate(semester?.krsStart)} – ${formatDate(semester?.krsEnd)}</span></div>
          <div class="stat-row"><span class="stat-row-label">Perubahan KRS</span><span class="stat-row-value">${krsPol.changePeriodOpen ? 'Terbuka (demo)' : 'Ditutup'}</span></div>
        </div>
      </div>
    </div>

    <div>
      <div class="card" style="margin-bottom:1rem">
        <div class="card-header">
          <h3 class="card-title">Notifikasi</h3>
          <a href="#/portal/student/notifications" class="btn btn-secondary btn-sm">Semua</a>
        </div>
        <div class="card-body-sm">
          ${notifs.length ? notifs.map(n => `
            <div class="notif-item">
              <div class="notif-body">
                <div class="notif-text"><strong>${esc(n.title)}</strong><br>${esc(n.message)}</div>
                <div class="notif-time">${formatDate(n.time)}</div>
              </div>
            </div>`).join('') : '<p style="font-size:var(--text-sm);color:var(--color-muted);padding:0.5rem">Belum ada notifikasi.</p>'}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Pengumuman</h3>
          <a href="#/portal/student/announcements" class="btn btn-secondary btn-sm">Semua</a>
        </div>
        <div class="card-body-sm">
          ${DB.getAll('academicCalendar').slice(0, 4).map(e => `
            <div class="stat-row">
              <span class="stat-row-label" style="font-size:10px">${esc(e.event)}</span>
              <span class="stat-row-value" style="font-size:10px">${formatDate(e.startDate)}</span>
            </div>`).join('')}
        </div>
      </div>

      ${theses.length ? `
      <div class="card" style="margin-top:1rem">
        <div class="card-header"><h3 class="card-title">Tugas akhir</h3></div>
        <div class="card-body">
          <div style="font-weight:600;margin-bottom:0.35rem">${esc(theses[0].title)}</div>
          ${statusBadge(theses[0].status)} <span class="badge badge-navy">${esc(theses[0].stage)}</span>
        </div>
      </div>` : ''}
    </div>
  </div>
</div>`;
}

function nextApprovedClass(plan) {
  if (!plan || !['Disetujui', 'Final'].includes(plan.status)) return null;
  const items = [...(plan.items || [])];
  const order = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  items.sort((a, b) => {
    const d = order.indexOf(a.day) - order.indexOf(b.day);
    return d !== 0 ? d : String(a.startTime).localeCompare(String(b.startTime));
  });
  return items[0] || null;
}

function buildQuickActions(reg, plan, regPol, krsPol) {
  const regStatus = reg?.status || 'Belum Registrasi';
  const krsStatus = plan?.status || 'Belum Dibuat';
  const actions = [];

  // Registrasi / Buka Tagihan
  if (regStatus === 'Menunggu Pembayaran') {
    actions.push({
      html: `<a href="#/portal/student/finance/invoices" class="btn btn-danger btn-sm"><i class="bi bi-cash"></i> Buka Tagihan</a>`,
    });
  } else {
    const canReg = !!regPol.periodOpen && ['Belum Registrasi', 'Draft', 'Ditolak', 'Dibatalkan'].includes(regStatus);
    const reason = !regPol.periodOpen
      ? 'Periode registrasi ditutup'
      : regStatus === 'Menunggu Validasi'
        ? 'Menunggu validasi petugas'
        : regStatus === 'Teregistrasi'
          ? 'Sudah teregistrasi'
          : 'Tidak dapat diajukan';
    actions.push({
      html: canReg
        ? `<a href="#/portal/student/registration" class="btn btn-accent btn-sm"><i class="bi bi-clipboard-check"></i> Registrasi Semester</a>`
        : `<button type="button" class="btn btn-secondary btn-sm" disabled title="${esc(reason)}"><i class="bi bi-clipboard-check"></i> Registrasi Semester</button>`,
    });
  }

  // Isi KRS
  const regOk = !krsPol.requireRegistrationBeforeKrs || regStatus === 'Teregistrasi';
  const krsEditable = ['Draft', 'Perlu Revisi', 'Belum Dibuat'].includes(krsStatus)
    || (krsStatus === 'Final' && krsPol.changePeriodOpen);
  const canEdit = !!krsPol.periodOpen && regOk && krsEditable;
  let krsReason = '';
  if (!krsPol.periodOpen) krsReason = 'Periode pengisian KRS ditutup';
  else if (!regOk) krsReason = 'Registrasi belum Teregistrasi';
  else if (!krsEditable) krsReason = `Status KRS "${krsStatus}" terkunci`;
  actions.push({
    html: canEdit
      ? `<a href="#/portal/student/krs/edit" class="btn btn-accent btn-sm"><i class="bi bi-pencil-square"></i> Isi KRS</a>`
      : `<button type="button" class="btn btn-secondary btn-sm" disabled title="${esc(krsReason)}"><i class="bi bi-pencil-square"></i> Isi KRS</button>`,
  });

  actions.push({
    html: `<a href="#/portal/student/krs" class="btn btn-secondary btn-sm"><i class="bi bi-journal-text"></i> Lihat KRS</a>`,
  });
  actions.push({
    html: `<a href="#/portal/student/khs" class="btn btn-secondary btn-sm"><i class="bi bi-card-list"></i> Lihat KHS</a>`,
  });
  actions.push({
    html: `<a href="#/portal/student/finance/invoices" class="btn btn-secondary btn-sm"><i class="bi bi-receipt"></i> Lihat Tagihan</a>`,
  });

  return actions;
}

// ===================== SUB PAGES =====================

function renderProfile(container, student) {
  const prodi = DB.getById('studyPrograms', student.prodiId);
  const campus = DB.getById('campuses', student.campusId);
  const advisor = DB.getById('lecturers', student.advisor);
  const body = `
<div class="card">
  <div class="card-body">
    ${[
      ['NIM', student.nim],
      ['Nama', student.name],
      ['Email', student.email],
      ['No. HP', student.phone],
      ['Jenis kelamin', student.gender === 'L' ? 'Laki-laki' : 'Perempuan'],
      ['Tanggal lahir', formatDate(student.dob)],
      ['Alamat', student.address || '—'],
      ['Kampus', campus?.name || '-'],
      ['Program studi', prodi?.name || '-'],
      ['Angkatan', String(student.angkatan)],
      ['Semester', String(student.semester)],
      ['Status akademik', student.status],
      ['Dosen wali', advisor?.name || 'Belum ditetapkan'],
      ['IPK', student.ipk?.toFixed(2)],
    ].map(([k, v]) => `<div class="stat-row"><span class="stat-row-label">${esc(k)}</span><span class="stat-row-value">${esc(v)}</span></div>`).join('')}
  </div>
</div>`;
  container.innerHTML = pageShell('Profil Saya', 'Data diri dan identitas akademik', body);
}

function renderKhs(container, student) {
  const grades = DB.getAll('grades').filter(g => g.studentId === student.id && g.status === 'final');
  const courses = DB.getAll('courses');
  const semesters = DB.getAll('semesters');
  const bySem = {};
  grades.forEach(g => {
    if (!bySem[g.semesterId]) bySem[g.semesterId] = [];
    bySem[g.semesterId].push(g);
  });
  const semIds = Object.keys(bySem);
  if (!semIds.length) {
    container.innerHTML = emptyPage('Kartu Hasil Studi (KHS)', 'Nilai per semester yang sudah dipublikasikan', 'Nilai belum dipublikasikan untuk Anda.');
    return;
  }
  const body = semIds.map(sid => {
    const sem = semesters.find(s => s.id === sid);
    const list = bySem[sid];
    const sks = list.reduce((s, g) => s + (g.sks || 0), 0);
    const mutu = list.reduce((s, g) => s + (g.mutu || 0) * (g.sks || 0), 0);
    const ips = sks ? (mutu / sks) : 0;
    return `
<div class="card" style="margin-bottom:1rem">
  <div class="card-header">
    <h3 class="card-title">${esc(sem?.name || sid)}</h3>
    <span class="badge badge-navy">IPS ${ips.toFixed(2)}</span>
  </div>
  <div class="scroll-x">
    <table class="data-table">
      <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Nilai</th><th>Huruf</th><th>Mutu</th></tr></thead>
      <tbody>
        ${list.map(g => {
          const co = courses.find(c => c.id === g.courseId);
          return `<tr>
            <td><code>${esc(co?.code || '-')}</code></td>
            <td>${esc(co?.name || '-')}</td>
            <td>${g.sks}</td>
            <td>${g.finalScore?.toFixed(1) ?? '—'}</td>
            <td><strong>${esc(g.letterGrade || '-')}</strong></td>
            <td>${(g.mutu || 0).toFixed(1)}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
</div>`;
  }).join('');
  container.innerHTML = pageShell('Kartu Hasil Studi (KHS)', 'Nilai per semester yang sudah dipublikasikan', body,
    '<button class="btn btn-secondary" onclick="window.print()"><i class="bi bi-printer"></i> Cetak</button>');
}

function renderTranscript(container, student) {
  const grades = DB.getAll('grades').filter(g => g.studentId === student.id && g.status === 'final');
  const courses = DB.getAll('courses');
  if (!grades.length) {
    container.innerHTML = emptyPage('Transkrip Nilai', 'Rekap nilai kumulatif', 'Belum ada nilai final untuk ditampilkan.');
    return;
  }
  const body = `
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Transkrip sementara</h3>
    <span class="badge badge-gold">IPK ${student.ipk.toFixed(2)}</span>
  </div>
  <div class="scroll-x">
    <table class="data-table">
      <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Nilai</th><th>Huruf</th><th>Mutu</th></tr></thead>
      <tbody>
        ${grades.map(g => {
          const co = courses.find(c => c.id === g.courseId);
          return `<tr>
            <td><code>${esc(co?.code || '-')}</code></td>
            <td>${esc(co?.name || '-')}</td>
            <td>${g.sks}</td>
            <td>${g.finalScore?.toFixed(1) ?? '—'}</td>
            <td><strong>${esc(g.letterGrade || '-')}</strong></td>
            <td>${(g.mutu || 0).toFixed(1)}</td>
          </tr>`;
        }).join('')}
        <tr style="background:var(--color-gold-50);font-weight:700">
          <td colspan="2">Total / IPK</td>
          <td>${grades.reduce((s, g) => s + g.sks, 0)}</td>
          <td colspan="2"></td>
          <td>${student.ipk.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
<div class="chart-card" style="margin-top:1rem">
  <div class="chart-card-header"><h3 class="chart-card-title">Distribusi nilai</h3></div>
  <div class="chart-wrapper" style="height:200px"><canvas id="student-transcript-chart"></canvas></div>
</div>`;
  container.innerHTML = pageShell('Transkrip Nilai', 'Rekap nilai kumulatif', body,
    '<button class="btn btn-secondary" onclick="window.print()"><i class="bi bi-printer"></i> Cetak</button>');
  requestAnimationFrame(() => {
    const dist = { A: 0, 'A-': 0, 'B+': 0, B: 0, 'B-': 0, 'C+': 0, C: 0, D: 0, E: 0 };
    grades.forEach(g => { if (dist[g.letterGrade] !== undefined) dist[g.letterGrade]++; });
    createBarChart('student-transcript-chart', {
      labels: Object.keys(dist),
      datasets: [{ label: 'MK', data: Object.values(dist), color: '#213550' }],
      height: 200,
    });
  });
}

function renderSchedule(container, student) {
  const plan = getPlan(student.id);
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const usePlan = plan && ['Disetujui', 'Final', 'Menunggu Persetujuan Dosen Wali', 'Draft', 'Perlu Revisi'].includes(plan.status);
  const items = usePlan ? (plan.items || []) : [];
  const schedule = {};
  days.forEach(d => { schedule[d] = []; });
  items.forEach(i => {
    if (schedule[i.day]) schedule[i.day].push(i);
  });

  const note = !plan || !['Disetujui', 'Final'].includes(plan.status)
    ? `<div class="info-box" style="margin-bottom:1rem"><i class="bi bi-info-circle"></i> Jadwal resmi memakai KRS Disetujui/Final. Saat ini status: <strong>${esc(plan?.status || 'Belum Dibuat')}</strong>.</div>`
    : '';

  const body = `
${note}
<div class="portal-schedule">
  ${days.map(d => `
    <div class="schedule-day">
      <div class="schedule-day-name">${d}</div>
      ${schedule[d].length === 0
        ? '<div style="font-size:var(--text-xs);color:var(--color-muted);padding:0.5rem">Tidak ada kelas</div>'
        : schedule[d].map(cl => `
          <div class="schedule-class-card">
            <div class="schedule-class-time">${esc(cl.startTime)}–${esc(cl.endTime)}</div>
            <div class="schedule-class-name">${esc(cl.name)}</div>
            <div class="schedule-class-meta">${esc(cl.classCode || '')} · ${esc(cl.room || '-')} · ${cl.sks || 0} SKS</div>
          </div>`).join('')}
    </div>`).join('')}
</div>`;
  container.innerHTML = pageShell('Jadwal Kuliah', 'Jadwal dari KRS semester berjalan', body,
    '<a href="#/portal/student/krs" class="btn btn-secondary"><i class="bi bi-journal-text"></i> KRS Saya</a>');
}

function renderCalendar(container, student) {
  const events = DB.getAll('academicCalendar');
  const body = `
<div class="card">
  <div class="scroll-x">
    <table class="data-table">
      <thead><tr><th>Kegiatan</th><th>Mulai</th><th>Selesai</th><th>Jenis</th></tr></thead>
      <tbody>
        ${events.map(e => `<tr>
          <td><strong>${esc(e.event)}</strong></td>
          <td>${formatDate(e.startDate)}</td>
          <td>${formatDate(e.endDate)}</td>
          <td><span class="badge badge-navy">${esc(e.type)}</span></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>`;
  container.innerHTML = pageShell('Kalender Akademik', 'Agenda akademik semester berjalan', body);
}

function renderAdvisor(container, student) {
  const advisor = DB.getById('lecturers', student.advisor);
  const plan = getPlan(student.id);
  const plans = DB.getAll('krsPlans').filter(p => p.studentId === student.id);

  if (!advisor) {
    container.innerHTML = emptyPage('Dosen Wali', 'Informasi dosen pembimbing akademik', 'Dosen wali belum ditetapkan untuk Anda.');
    return;
  }

  const body = `
<div class="reg-layout">
  <div>
    <div class="card" style="margin-bottom:1rem">
      <div class="card-header"><h3 class="card-title">${esc(advisor.name)}</h3>${statusBadge(advisor.status)}</div>
      <div class="card-body">
        ${[
          ['NIDN', advisor.nidn],
          ['Email', advisor.email],
          ['Telepon', advisor.phone || '—'],
          ['Jabatan', advisor.position],
        ].map(([k, v]) => `<div class="stat-row"><span class="stat-row-label">${k}</span><span class="stat-row-value">${esc(v)}</span></div>`).join('')}
      </div>
    </div>
    ${plan?.advisorNote ? `
    <div class="info-box info-box-warning"><i class="bi bi-chat-left-text"></i> <strong>Catatan KRS:</strong> ${esc(plan.advisorNote)}</div>` : ''}
  </div>
  <div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">Riwayat keputusan KRS</h3></div>
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr><th>Waktu</th><th>Status</th><th>Catatan</th></tr></thead>
          <tbody>
            ${plans.flatMap(p => (p.history || []).filter(h => /Dosen|wali|Revisi|Disetujui/i.test(h.by + h.to + h.note)))
              .sort((a, b) => String(b.at).localeCompare(String(a.at)))
              .slice(0, 10)
              .map(h => `<tr>
                <td>${formatDateTime(h.at)}</td>
                <td>${esc(h.to)}</td>
                <td>${esc(h.note || '—')}</td>
              </tr>`).join('') || '<tr><td colspan="3">Belum ada keputusan dosen wali.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    <div class="info-box" style="margin-top:1rem">
      <i class="bi bi-calendar3"></i> Jadwal konsultasi demo: Senin 13:00–15:00 (simulasi).
    </div>
  </div>
</div>`;
  container.innerHTML = pageShell('Dosen Wali', 'Kontak dan catatan pembimbing akademik', body);
}

function renderInvoices(container, student) {
  const invoices = DB.getAll('invoices').filter(i => i.studentId === student.id);
  if (!invoices.length) {
    container.innerHTML = emptyPage('Tagihan', 'Tagihan UKT dan biaya lain', 'Tidak ada tagihan untuk akun demo ini.');
    return;
  }
  const body = `
<div class="card">
  <div class="scroll-x">
    <table class="data-table">
      <thead><tr><th>No.</th><th>Jenis</th><th>Periode</th><th>Total</th><th>Terbayar</th><th>Sisa</th><th>Jatuh tempo</th><th>Status</th></tr></thead>
      <tbody>
        ${invoices.map(i => `<tr>
          <td><strong>${esc(i.number)}</strong></td>
          <td>${esc(i.type)}</td>
          <td>${esc(i.period)}</td>
          <td>${formatRupiah(i.amount)}</td>
          <td style="color:var(--color-success)">${formatRupiah(i.paid)}</td>
          <td style="color:${i.remaining > 0 ? 'var(--color-danger)' : 'inherit'}">${formatRupiah(i.remaining)}</td>
          <td>${formatDate(i.dueDate)}</td>
          <td>${statusBadge(i.status)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>
<div class="info-box info-box-warning" style="margin-top:1rem">
  <i class="bi bi-lightning-fill"></i> Pembayaran bersifat simulasi. Hubungi keuangan kampus untuk proses nyata.
</div>`;
  container.innerHTML = pageShell('Tagihan', 'Tagihan mahasiswa semester berjalan', body,
    '<a href="#/portal/student/finance/payments" class="btn btn-secondary"><i class="bi bi-clock-history"></i> Riwayat bayar</a>');
}

function renderPayments(container, student) {
  const payments = DB.getAll('payments').filter(p => p.studentId === student.id);
  if (!payments.length) {
    container.innerHTML = emptyPage('Riwayat Pembayaran', 'Transaksi pembayaran yang tercatat', 'Belum ada riwayat pembayaran.');
    return;
  }
  const body = `
<div class="card">
  <div class="scroll-x">
    <table class="data-table">
      <thead><tr><th>No. TRX</th><th>Tanggal</th><th>Metode</th><th>Jumlah</th><th>Status</th><th>Catatan</th></tr></thead>
      <tbody>
        ${payments.map(p => `<tr>
          <td><strong>${esc(p.txNum)}</strong></td>
          <td>${formatDate(p.date)}</td>
          <td>${esc(p.method)}</td>
          <td>${formatRupiah(p.amount)}</td>
          <td>${statusBadge(p.status)}</td>
          <td style="font-size:var(--text-xs)">${esc(p.note || '—')}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>`;
  container.innerHTML = pageShell('Riwayat Pembayaran', 'Transaksi pembayaran yang tercatat', body,
    '<a href="#/portal/student/finance/invoices" class="btn btn-secondary"><i class="bi bi-receipt"></i> Tagihan</a>');
}

function renderScholarship(container, student) {
  const list = DB.getAll('scholarships').filter(s => s.studentId === student.id);
  if (!list.length) {
    container.innerHTML = emptyPage('Beasiswa', 'Beasiswa dan keringanan yang terkait akun Anda', 'Belum ada beasiswa aktif untuk Anda.');
    return;
  }
  const body = `
<div class="card">
  <div class="scroll-x">
    <table class="data-table">
      <thead><tr><th>Nama</th><th>Jenis</th><th>Periode</th><th>Nominal</th><th>Status</th></tr></thead>
      <tbody>
        ${list.map(s => `<tr>
          <td><strong>${esc(s.name)}</strong></td>
          <td>${esc(s.type)}</td>
          <td>${esc(s.period)}</td>
          <td>${formatRupiah(s.amount)}</td>
          <td>${statusBadge(s.status)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>`;
  container.innerHTML = pageShell('Beasiswa', 'Beasiswa dan keringanan terkait akun Anda', body);
}

function renderAnnouncements(container) {
  const events = DB.getAll('academicCalendar');
  const body = `
<div class="card">
  <div class="card-body-sm">
    ${events.map(e => `
      <div class="notif-item">
        <div class="notif-body">
          <div class="notif-text"><strong>${esc(e.event)}</strong><br>Jenis: ${esc(e.type)}</div>
          <div class="notif-time">${formatDate(e.startDate)}${e.endDate && e.endDate !== e.startDate ? ` – ${formatDate(e.endDate)}` : ''}</div>
        </div>
      </div>`).join('')}
  </div>
</div>`;
  container.innerHTML = pageShell('Pengumuman', 'Pengumuman dan agenda akademik', body);
}

function renderNotifications(container, student) {
  const notifs = DB.getAll('notifications').filter(n =>
    !n.studentId || n.studentId === student.id || (n.role || []).includes('Mahasiswa')
  );
  if (!notifs.length) {
    container.innerHTML = emptyPage('Notifikasi', 'Pemberitahuan untuk akun Anda', 'Belum ada notifikasi.');
    return;
  }
  const body = `
<div class="card">
  <div class="card-body-sm">
    ${notifs.map(n => `
      <div class="notif-item">
        <div class="notif-body">
          <div class="notif-text">
            <strong>${esc(n.title)}</strong><br>${esc(n.message)}
            ${n.link ? `<div style="margin-top:0.35rem"><a href="${esc(n.link)}">Buka terkait</a></div>` : ''}
          </div>
          <div class="notif-time">${formatDateTime(n.time)}</div>
        </div>
      </div>`).join('')}
  </div>
</div>`;
  container.innerHTML = pageShell('Notifikasi', 'Pemberitahuan untuk akun Anda', body);
}

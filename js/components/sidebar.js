/**
 * SIAKAD Cakrawala — Sidebar Component
 */

import { AppState, ROLES } from '../state.js';
import { showToast } from './toast.js';
import { DB } from '../data/seed.js';

const MENU_ITEMS = [
  {
    key: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard',
    route: null, // dynamic
    submenu: [
      { label: 'Dashboard Yayasan', route: '#/dashboard/foundation', key: 'dashboard' },
      { label: 'Dashboard Kampus', route: '#/dashboard/campus', key: 'dashboard' },
      { label: 'Dashboard Fakultas/Prodi', route: '#/dashboard/faculty', key: 'dashboard' },
    ]
  },
  {
    key: 'organization', icon: 'bi-diagram-3', label: 'Organisasi',
    submenu: [
      { label: 'Profil Yayasan', route: '#/organization/profile', key: 'organization' },
      { label: 'Daftar Kampus', route: '#/organization/campuses', key: 'organization' },
      { label: 'Fakultas', route: '#/organization/faculties', key: 'organization' },
      { label: 'Program Studi', route: '#/organization/study-programs', key: 'organization' },
      { label: 'Tahun Akademik', route: '#/organization/academic-years', key: 'organization' },
      { label: 'Semester', route: '#/organization/semesters', key: 'organization' },
      { label: 'Kalender Akademik', route: '#/organization/calendar', key: 'organization' },
    ]
  },
  {
    key: 'admissions', icon: 'bi-person-plus', label: 'PMB',
    submenu: [
      { label: 'Dashboard PMB', route: '#/admissions/dashboard', key: 'admissions' },
      { label: 'Periode & Jalur', route: '#/admissions/periods', key: 'admissions' },
      { label: 'Portal Publik PMB', route: '#/pmb', key: 'admissions' },
      { label: 'Daftar Online (Publik)', route: '#/pmb/daftar', key: 'admissions' },
      { label: 'Daftar Pendaftar', route: '#/admissions/applicants', key: 'admissions' },
      { label: 'Verifikasi Dokumen', route: '#/admissions/verification', key: 'admissions' },
      { label: 'Seleksi & Hasil', route: '#/admissions/selection', key: 'admissions' },
      { label: 'Daftar Ulang', route: '#/admissions/re-registration', key: 'admissions' },
      { label: 'Konversi ke Mahasiswa', route: '#/admissions/convert', key: 'admissions' },
      { label: 'Laporan PMB', route: '#/admissions/reports', key: 'admissions' },
    ]
  },
  {
    key: 'students', icon: 'bi-mortarboard', label: 'Mahasiswa',
    submenu: [
      { label: 'Data Mahasiswa', route: '#/students', key: 'students' },
      { label: 'Status Akademik', route: '#/students/academic-status', key: 'students' },
      { label: 'Registrasi Semester', route: '#/students/registration', key: 'students' },
      { label: 'Cuti & Aktif Kembali', route: '#/students/leave', key: 'students' },
      { label: 'Beasiswa & Keringanan', route: '#/students/scholarships', key: 'students' },
      { label: 'Surat Akademik', route: '#/students/letters', key: 'students' },
      { label: 'Yudisium', route: '#/students/graduation', key: 'students' },
      { label: 'Wisuda', route: '#/students/commencement', key: 'students' },
      { label: 'Alumni', route: '#/students/alumni', key: 'students' },
    ]
  },
  {
    key: 'lecturers', icon: 'bi-person-workspace', label: 'Dosen & SDM Akademik',
    submenu: [
      { label: 'Data Dosen', route: '#/lecturers', key: 'lecturers' },
      { label: 'Penugasan Mengajar', route: '#/lecturers/assignments', key: 'lecturers' },
      { label: 'Beban Kerja Dosen', route: '#/lecturers/workload', key: 'lecturers' },
      { label: 'Evaluasi Kinerja', route: '#/lecturers/evaluation', key: 'lecturers' },
      { label: 'Sertifikasi', route: '#/lecturers/certification', key: 'lecturers' },
      { label: 'Tenaga Kependidikan', route: '#/lecturers/staff', key: 'lecturers' },
    ]
  },
  {
    key: 'academic', icon: 'bi-journal-bookmark', label: 'Akademik',
    submenu: [
      { label: 'Kelas Kuliah', route: '#/academic/classes', key: 'academic' },
      { label: 'Penjadwalan', route: '#/academic/schedule', key: 'academic' },
      { label: 'Dosen Wali', route: '#/academic/advisors', key: 'academic' },
      { label: 'Mata Kuliah', route: '#/academic/courses', key: 'academic' },
      { label: 'Kurikulum', route: '#/academic/curriculum', key: 'academic' },
      { label: 'Prasyarat MK', route: '#/academic/prerequisites', key: 'academic' },
      { label: 'Evaluasi Akademik', route: '#/academic/evaluation', key: 'academic' },
    ]
  },
  {
    key: 'learning', icon: 'bi-book', label: 'Pembelajaran',
    submenu: [
      { label: 'Registrasi Semester', route: '#/learning/registration', key: 'learning' },
      { label: 'KRS', route: '#/learning/krs', key: 'learning' },
      { label: 'Persetujuan KRS', route: '#/learning/krs-approval', key: 'learning' },
      { label: 'Presensi', route: '#/learning/attendance', key: 'learning' },
      { label: 'Tugas & Ujian', route: '#/learning/assignments', key: 'learning' },
      { label: 'Input Nilai', route: '#/learning/grades', key: 'learning' },
      { label: 'KHS', route: '#/learning/khs', key: 'learning' },
      { label: 'Transkrip', route: '#/learning/transcript', key: 'learning' },
      { label: 'Evaluasi Dosen', route: '#/learning/evaluation', key: 'learning' },
    ]
  },
  {
    key: 'thesis', icon: 'bi-file-earmark-text', label: 'Skripsi & Tugas Akhir',
    submenu: [
      { label: 'Daftar Tugas Akhir', route: '#/thesis', key: 'thesis' },
      { label: 'Pengajuan Topik', route: '#/thesis/topics', key: 'thesis' },
      { label: 'Bimbingan', route: '#/thesis/supervision', key: 'thesis' },
      { label: 'Seminar & Sidang', route: '#/thesis/defense', key: 'thesis' },
    ]
  },
  {
    key: 'finance', icon: 'bi-cash-stack', label: 'Keuangan',
    submenu: [
      { label: 'Dashboard Keuangan', route: '#/finance/dashboard', key: 'finance' },
      { label: 'Tagihan Mahasiswa', route: '#/finance/invoices', key: 'finance' },
      { label: 'Pembayaran', route: '#/finance/payments', key: 'finance' },
      { label: 'Piutang', route: '#/finance/receivables', key: 'finance' },
      { label: 'Cicilan', route: '#/finance/installments', key: 'finance' },
      { label: 'Beasiswa & Potongan', route: '#/finance/discounts', key: 'finance' },
      { label: 'Komponen Biaya', route: '#/finance/fee-components', key: 'finance' },
      { label: 'Jurnal Umum', route: '#/finance/journals', key: 'finance' },
      { label: 'Buku Besar', route: '#/finance/ledger', key: 'finance' },
      { label: 'Bagan Akun (COA)', route: '#/finance/coa', key: 'finance' },
      { label: 'Laporan Keuangan', route: '#/finance/reports', key: 'finance' },
      { label: 'Konsolidasi Yayasan', route: '#/finance/consolidation', key: 'finance' },
    ]
  },
  {
    key: 'budget', icon: 'bi-pie-chart', label: 'Anggaran',
    submenu: [
      { label: 'Perencanaan Anggaran', route: '#/budget/overview', key: 'budget' },
      { label: 'Anggaran per Kampus', route: '#/budget/campus', key: 'budget' },
      { label: 'Pengajuan Anggaran', route: '#/budget/submission', key: 'budget' },
      { label: 'Persetujuan', route: '#/budget/approval', key: 'budget' },
      { label: 'Realisasi', route: '#/budget/realization', key: 'budget' },
      { label: 'Analisis Varians', route: '#/budget/variance', key: 'budget' },
    ]
  },
  {
    key: 'hr', icon: 'bi-people', label: 'SDM & Payroll',
    submenu: [
      { label: 'Data Pegawai', route: '#/hr/employees', key: 'hr' },
      { label: 'Struktur Jabatan', route: '#/hr/positions', key: 'hr' },
      { label: 'Kehadiran Pegawai', route: '#/hr/attendance', key: 'hr' },
      { label: 'Cuti', route: '#/hr/leave', key: 'hr' },
      { label: 'Komponen Gaji', route: '#/hr/salary-components', key: 'hr' },
      { label: 'Proses Payroll Demo', route: '#/hr/payroll', key: 'hr' },
      { label: 'Slip Gaji Demo', route: '#/hr/payslip', key: 'hr' },
      { label: 'Laporan SDM', route: '#/hr/reports', key: 'hr' },
    ]
  },
  {
    key: 'assets', icon: 'bi-box-seam', label: 'Aset & Pengadaan',
    submenu: [
      { label: 'Master Aset', route: '#/assets', key: 'assets' },
      { label: 'Pemeliharaan', route: '#/assets/maintenance', key: 'assets' },
      { label: 'Pengajuan Pengadaan', route: '#/procurement', key: 'assets' },
      { label: 'Persetujuan Pengadaan', route: '#/procurement/approval', key: 'assets' },
      { label: 'Penerimaan Barang', route: '#/procurement/receipt', key: 'assets' },
      { label: 'Kategori Aset', route: '#/assets/categories', key: 'assets' },
      { label: 'Laporan Aset', route: '#/assets/reports', key: 'assets' },
    ]
  },
  {
    key: 'pddikti', icon: 'bi-cloud-upload', label: 'PDDIKTI',
    submenu: [
      { label: 'Dashboard Validasi', route: '#/pddikti/validation', key: 'pddikti' },
      { label: 'Validasi Mahasiswa', route: '#/pddikti/students', key: 'pddikti' },
      { label: 'Validasi Dosen', route: '#/pddikti/lecturers', key: 'pddikti' },
      { label: 'Validasi Nilai & KRS', route: '#/pddikti/grades', key: 'pddikti' },
      { label: 'Antrean Sinkronisasi', route: '#/pddikti/queue', key: 'pddikti' },
      { label: 'Riwayat Sinkronisasi', route: '#/pddikti/history', key: 'pddikti' },
    ]
  },
  {
    key: 'reports', icon: 'bi-file-bar-graph', label: 'Laporan',
    route: '#/reports',
  },
  {
    key: 'settings', icon: 'bi-gear', label: 'Pengguna & Pengaturan',
    submenu: [
      { label: 'Pengguna', route: '#/settings/users', key: 'settings' },
      { label: 'Role & Hak Akses', route: '#/settings/roles', key: 'settings' },
      { label: 'Preferensi', route: '#/settings/preferences', key: 'settings' },
      { label: 'Reset Data Demo', route: '#/settings/reset', key: 'settings' },
    ]
  },
  {
    key: 'audit', icon: 'bi-shield-check', label: 'Audit Log',
    route: '#/audit-logs',
  },
];

const ROLE_SUBMENU_ROUTE_SCOPE = {
  foundation: {
    dashboard: [
      '#/dashboard/foundation',
    ],
    organization: [
      '#/organization/profile',
      '#/organization/campuses',
      '#/organization/faculties',
      '#/organization/study-programs',
      '#/organization/academic-years',
      '#/organization/semesters',
    ],
    admissions: [
      '#/admissions/dashboard',
      '#/admissions/applicants',
      '#/admissions/selection',
      '#/admissions/re-registration',
      '#/admissions/reports',
    ],
    finance: [
      '#/finance/dashboard',
      '#/finance/receivables',
      '#/finance/ledger',
      '#/finance/reports',
      '#/finance/consolidation',
    ],
    budget: [
      '#/budget/overview',
      '#/budget/campus',
      '#/budget/realization',
      '#/budget/variance',
    ],
    hr: [
      '#/hr/employees',
      '#/hr/payroll',
      '#/hr/reports',
    ],
    assets: [
      '#/assets',
      '#/assets/reports',
    ],
    pddikti: [
      '#/pddikti/validation',
      '#/pddikti/queue',
      '#/pddikti/history',
    ],
  },
};

function isSubmenuVisibleForRole(roleId, menuKey, route) {
  const roleScope = ROLE_SUBMENU_ROUTE_SCOPE[roleId];
  if (!roleScope || !roleScope[menuKey]) return true;
  return roleScope[menuKey].includes(route);
}

/** Navigasi portal dosen (design.md 9.0) — menempel di sidebar kiri shell */
function buildLecturerPortalNav(h) {
  const lecId = AppState.currentRole?.lecturerId || 'lec-1';
  const pending = DB.getAll('krsPlans').filter(p => {
    if (p.status !== 'Menunggu Persetujuan Dosen Wali') return false;
    const a = DB.getAll('advisorAssignments').find(x => x.studentId === p.studentId && x.status === 'aktif');
    return a?.lecturerId === lecId;
  }).length;
  const theses = DB.getAll('theses').filter(t => t.supervisorId === lecId).length;

  const items = [
    { label: 'Dashboard', icon: 'bi-speedometer2', route: '#/portal/lecturer', match: (x) => x === '#/portal/lecturer' || x === '#/portal/lecturer/' },
    { label: 'Mata Kuliah Saya', icon: 'bi-book', route: '#/portal/lecturer/courses', match: (x) => x.includes('/courses') },
    { label: 'Jadwal Mengajar', icon: 'bi-calendar3', route: '#/portal/lecturer/schedule', match: (x) => x.includes('/schedule') },
    { label: 'Materi & Modul', icon: 'bi-folder2-open', route: '#/portal/lecturer/materials', match: (x) => x.includes('/materials') },
    { label: 'Tugas & Kuis', icon: 'bi-clipboard-check', route: '#/portal/lecturer/assignments', match: (x) => x.includes('/assignments') },
    { label: 'Penilaian', icon: 'bi-bar-chart-line', route: '#/portal/lecturer/grading', match: (x) => x.includes('/grading') },
    { label: 'Presensi Mahasiswa', icon: 'bi-check2-square', route: '#/portal/lecturer/attendance', match: (x) => x.includes('/attendance') },
    { label: 'Jurnal Perkuliahan', icon: 'bi-journal-text', route: '#/portal/lecturer/journal', match: (x) => x.includes('/journal') },
    { label: 'Ujian', icon: 'bi-pencil-square', route: '#/portal/lecturer/exam', match: (x) => x.includes('/exam') && !x.includes('/examination') },
    { label: 'Bimbingan Akademik', icon: 'bi-people', route: '#/portal/lecturer/advising', match: (x) => x.includes('/advising') || x.includes('/lecturer/krs'), badge: pending || null },
    { label: 'Skripsi / Tugas Akhir', icon: 'bi-file-earmark-text', route: '#/portal/lecturer/thesis', match: (x) => x.includes('/thesis'), badge: theses || null },
    { label: 'Sidang & Penguji', icon: 'bi-shield-check', route: '#/portal/lecturer/examination', match: (x) => x.includes('/examination') },
    { label: 'Wali Akademik', icon: 'bi-person-badge', route: '#/portal/lecturer/academic-advisor', match: (x) => x.includes('/academic-advisor') },
    { label: 'Pengumuman Kelas', icon: 'bi-megaphone', route: '#/portal/lecturer/announcements', match: (x) => x.includes('/announcements') },
    { label: 'Laporan Akademik', icon: 'bi-graph-up', route: '#/portal/lecturer/reports', match: (x) => x.includes('/reports') },
    { label: 'Pengajuan Administrasi', icon: 'bi-envelope-paper', route: '#/portal/lecturer/administration', match: (x) => x.includes('/administration') },
    { label: 'Profil & Pengaturan', icon: 'bi-person-circle', route: '#/portal/lecturer/profile', match: (x) => x.includes('/profile') },
  ];

  return items.map(item => {
    const active = item.match(h);
    const badge = item.badge
      ? `<span class="nav-badge">${item.badge > 9 ? '9+' : item.badge}</span>`
      : '';
    return `
      <div class="nav-item-wrapper">
        <a class="nav-link ${active ? 'active' : ''}" href="${item.route}" data-label="${item.label}">
          <i class="bi ${item.icon} nav-icon"></i>
          <span class="nav-label">${item.label}</span>
          ${badge}
        </a>
      </div>`;
  }).join('');
}

/** Navigasi portal mahasiswa (design.md 8.1) */
function buildStudentPortalNav(h) {
  const items = [
    { label: 'Dashboard', icon: 'bi-house', route: '#/portal/student', match: (x) => x === '#/portal/student' || x === '#/portal/student/' },
    { label: 'Profil Saya', icon: 'bi-person', route: '#/portal/student/profile', match: (x) => x.includes('/profile') },
    {
      label: 'Registrasi Akademik', icon: 'bi-clipboard-check',
      children: [
        { label: 'Registrasi Semester', route: '#/portal/student/registration', match: (x) => x.includes('/registration') && !x.includes('/history') },
        { label: 'Riwayat Registrasi', route: '#/portal/student/registration/history', match: (x) => x.includes('/registration/history') },
      ],
    },
    {
      label: 'Kartu Rencana Studi', icon: 'bi-journal-check',
      children: [
        { label: 'Isi KRS', route: '#/portal/student/krs/edit', match: (x) => x.includes('/krs/edit') },
        { label: 'KRS Saya', route: '#/portal/student/krs', match: (x) => x.includes('/krs') && !x.includes('/edit') && !x.includes('/print') },
        { label: 'Cetak KRS', route: '#/portal/student/krs/print', match: (x) => x.includes('/krs/print') },
      ],
    },
    {
      label: 'Hasil Studi', icon: 'bi-bar-chart',
      children: [
        { label: 'KHS', route: '#/portal/student/khs', match: (x) => x.includes('/khs') },
        { label: 'Transkrip Nilai', route: '#/portal/student/transcript', match: (x) => x.includes('/transcript') },
      ],
    },
    {
      label: 'Perkuliahan', icon: 'bi-calendar3',
      children: [
        { label: 'Jadwal Kuliah', route: '#/portal/student/schedule', match: (x) => x.includes('/schedule') },
        { label: 'Kalender Akademik', route: '#/portal/student/calendar', match: (x) => x.includes('/calendar') },
      ],
    },
    { label: 'Dosen Wali', icon: 'bi-person-badge', route: '#/portal/student/advisor', match: (x) => x.includes('/advisor') },
    {
      label: 'Keuangan', icon: 'bi-cash-stack',
      children: [
        { label: 'Tagihan', route: '#/portal/student/finance/invoices', match: (x) => x.includes('/finance/invoices') || x.endsWith('/finance') },
        { label: 'Riwayat Pembayaran', route: '#/portal/student/finance/payments', match: (x) => x.includes('/finance/payments') },
      ],
    },
    { label: 'Beasiswa', icon: 'bi-award', route: '#/portal/student/scholarship', match: (x) => x.includes('/scholarship') },
    { label: 'Surat Akademik', icon: 'bi-envelope-paper', route: '#/portal/student/letters', match: (x) => x.includes('/letters') },
    { label: 'Pengumuman', icon: 'bi-megaphone', route: '#/portal/student/announcements', match: (x) => x.includes('/announcements') },
    { label: 'Notifikasi', icon: 'bi-bell', route: '#/portal/student/notifications', match: (x) => x.includes('/notifications') },
    { label: 'Pengaturan Akun', icon: 'bi-gear', route: '#/portal/student/settings', match: (x) => x.includes('/settings') },
  ];

  return items.map((item, idx) => {
    if (item.children) {
      const isAny = item.children.some(c => c.match(h));
      const sid = `submenu-student-${idx}`;
      return `
        <div class="nav-item-wrapper">
          <a class="nav-link ${isAny ? 'active' : ''}" href="#"
            data-bs-toggle="collapse" data-bs-target="#${sid}" aria-expanded="${isAny}">
            <i class="bi ${item.icon} nav-icon"></i>
            <span class="nav-label">${item.label}</span>
            <i class="bi bi-chevron-right nav-expand"></i>
          </a>
          <div id="${sid}" class="nav-submenu collapse ${isAny ? 'show' : ''}">
            ${item.children.map(c => `
              <div class="nav-item-wrapper">
                <a class="nav-link ${c.match(h) ? 'active' : ''}" href="${c.route}">
                  <i class="bi bi-dot nav-icon"></i>
                  <span class="nav-label">${c.label}</span>
                </a>
              </div>`).join('')}
          </div>
        </div>`;
    }
    const active = item.match(h);
    return `
      <div class="nav-item-wrapper">
        <a class="nav-link ${active ? 'active' : ''}" href="${item.route}">
          <i class="bi ${item.icon} nav-icon"></i>
          <span class="nav-label">${item.label}</span>
        </a>
      </div>`;
  }).join('');
}

export function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const role = AppState.currentRole;

  let navHTML = '';

  MENU_ITEMS.forEach(item => {
    if (!AppState.hasAccess(item.key)) return;

    if (item.submenu) {
      const subItems = item.submenu.filter(s =>
        AppState.hasAccess(s.key) &&
        isSubmenuVisibleForRole(role.id, item.key, s.route)
      );
      if (!subItems.length) return;

      const submenuId = `submenu-${item.key}`;
      const isAnyActive = subItems.some(s => location.hash.startsWith(s.route?.split('?')[0] || ''));
      const expanded = isAnyActive;

      navHTML += `
        <div class="nav-item-wrapper">
          <a class="nav-link ${isAnyActive ? 'active' : ''}" href="#"
            data-label="${item.label}"
            data-bs-toggle="collapse" data-bs-target="#${submenuId}"
            aria-expanded="${expanded}">
            <i class="bi ${item.icon} nav-icon"></i>
            <span class="nav-label">${item.label}</span>
            <i class="bi bi-chevron-right nav-expand"></i>
          </a>
          <div id="${submenuId}" class="nav-submenu collapse ${expanded ? 'show' : ''}">
            ${subItems.map(s => {
              const isActive = location.hash.startsWith(s.route?.split('?')[0] || '~');
              return `<div class="nav-item-wrapper">
                <a class="nav-link ${isActive ? 'active' : ''}" href="${s.route}" data-label="${s.label}">
                  <i class="bi bi-dot nav-icon"></i>
                  <span class="nav-label">${s.label}</span>
                </a>
              </div>`;
            }).join('')}
          </div>
        </div>`;
    } else {
      const isActive = location.hash.startsWith(item.route?.split('?')[0] || '~');
      navHTML += `
        <div class="nav-item-wrapper">
          <a class="nav-link ${isActive ? 'active' : ''}" href="${item.route || '#'}" data-label="${item.label}">
            <i class="bi ${item.icon} nav-icon"></i>
            <span class="nav-label">${item.label}</span>
          </a>
        </div>`;
    }
  });

  // Portal links for specific roles
  if (['lecturer'].includes(role.id)) {
    navHTML = buildLecturerPortalNav(location.hash || '');
  } else if (['student'].includes(role.id)) {
    navHTML = buildStudentPortalNav(location.hash || '');
  } else if (['parent'].includes(role.id)) {
    navHTML = `
      <div class="nav-item-wrapper">
        <a class="nav-link ${location.hash.startsWith('#/portal/parent') ? 'active' : ''}" href="#/portal/parent">
          <i class="bi bi-house nav-icon"></i><span class="nav-label">Beranda</span>
        </a>
      </div>`;
  }

  sidebar.innerHTML = `
    <a class="sidebar-brand" href="${role.dashboardRoute}">
      <img src="assets/logo.svg" alt="SIAKAD" class="sidebar-brand-logo">
      <div class="sidebar-brand-text">
        <span class="sidebar-brand-name">SIAKAD</span>
        <span class="sidebar-brand-sub">Cakrawala</span>
      </div>
    </a>
    <nav class="sidebar-nav">${navHTML}</nav>
    <div class="sidebar-footer">
      <div class="user-avatar">${role.avatar}</div>
      <div class="sidebar-footer-text">
        <div style="font-size:var(--text-xs);color:rgba(255,255,255,0.8);font-weight:var(--font-medium);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px">${role.user}</div>
        <div class="demo-mode-chip"><i class="bi bi-lightning-fill"></i> Mode Demo</div>
      </div>
    </div>
    <button id="sidebar-toggle" title="Ciutkan sidebar">
      <i class="bi bi-chevron-left"></i>
    </button>
  `;

  // Sidebar toggle
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    AppState.toggleSidebar();
    const btn = document.getElementById('sidebar-toggle');
    if (btn) {
      btn.querySelector('i').className = AppState.sidebarCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left';
    }
  });

  // Apply collapsed state
  if (AppState.sidebarCollapsed) {
    sidebar.classList.add('collapsed');
    const btn = sidebar.querySelector('#sidebar-toggle i');
    if (btn) btn.className = 'bi bi-chevron-right';
  }

  const closeMobileSidebar = () => {
    if (window.innerWidth > 991.98) return;
    sidebar.classList.remove('mobile-open');
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.style.display = 'none';
  };

  sidebar.querySelectorAll('a[href^="#/"]').forEach(link => {
    link.addEventListener('click', closeMobileSidebar);
  });
}

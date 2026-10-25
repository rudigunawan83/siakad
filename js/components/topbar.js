/**
 * SIAKAD Cakrawala — Topbar Component
 */

import { AppState, ROLES, canSwitchCampus } from '../state.js?v=20261025ab';
import { DB } from '../data/seed.js';
import { renderSidebar } from './sidebar.js';
import { showToast } from './toast.js';
import { Router } from '../router.js';

let campusCompactMqBound = false;

function ensureCampusCompactListener() {
  if (campusCompactMqBound) return;
  campusCompactMqBound = true;
  const mq = window.matchMedia('(max-width: 991.98px)');
  const onChange = () => renderTopbar();
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);
  else if (typeof mq.addListener === 'function') mq.addListener(onChange);
}

export function renderTopbar() {
  ensureCampusCompactListener();
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  const role = AppState.currentRole;
  const campuses = DB.getAll('campuses');
  const notifs = DB.getAll('notifications');
  const unread = notifs.filter(n => !n.read).length;
  const isMobileTopbar = window.matchMedia('(max-width: 767.98px)').matches;

  // Desktop: nama lengkap. Tablet/mobile: kode saja agar tidak terpotong di tengah kata.
  const campusCompact = window.matchMedia('(max-width: 991.98px)').matches;
  const campusUnlocked = canSwitchCampus(role);
  const selectableCampuses = campusUnlocked
    ? campuses
    : campuses.filter(campus => campus.id === role.campusId);
  const campusOptions = [
    ...(campusUnlocked
      ? [`<option value="all" ${AppState.currentCampusFilter === 'all' ? 'selected' : ''}>${campusCompact ? 'Semua' : 'Semua Kampus'}</option>`]
      : []),
    ...selectableCampuses.map(c => {
      const label = campusCompact ? c.code : `${c.code} — ${c.name}`;
      return `<option value="${c.id}" title="${c.code} — ${c.name}" ${AppState.currentCampusFilter === c.id ? 'selected' : ''}>${label}</option>`;
    }),
  ].join('');

  const breadcrumb = buildBreadcrumb();
  const roleSwitcherHTML = `
      <div class="topbar-role-slot${isMobileTopbar ? ' topbar-role-slot-mobile' : ''}" style="position:relative">
        <button class="btn role-badge" id="role-switcher-btn" title="Ganti Role Demo — ${role.label}">
          <i class="bi bi-shuffle"></i> <span class="role-badge-label">${role.label}</span>
        </button>
        <div id="role-switcher-panel" class="topbar-dropdown-panel topbar-dropdown-panel--role" style="display:none"></div>
      </div>`;
  const notifHTML = `
      <div style="position:relative">
        <button class="topbar-icon-btn" id="notif-btn" title="Notifikasi">
          <i class="bi bi-bell"></i>
          <span class="topbar-badge" id="notif-badge" style="${unread === 0 ? 'display:none' : ''}">${unread > 9 ? '9+' : unread}</span>
        </button>
        <div id="notif-panel" class="topbar-dropdown-panel" style="display:none"></div>
      </div>`;
  const userMenuHTML = `
      <div style="position:relative">
        <button class="d-flex align-items-center gap-2 btn btn-secondary btn-sm" id="user-menu-btn" style="border-radius:var(--radius-full)">
          <div class="user-avatar">${role.avatar}</div>
          <span class="d-none d-md-inline" style="font-size:var(--text-xs);font-weight:var(--font-medium)">${role.user.split(' ').slice(-1)[0]}</span>
          <i class="bi bi-chevron-down" style="font-size:0.65rem"></i>
        </button>
        <div id="user-menu-panel" class="topbar-dropdown-panel user-menu-dropdown" style="display:none">
          <div class="user-menu-header">
            <div class="user-menu-name">${role.user}</div>
            <div class="user-menu-meta">${role.label}</div>
            <div class="user-menu-meta">${role.scopeLabel}</div>
          </div>
          <a href="${role.dashboardRoute}" class="user-menu-item">
            <i class="bi bi-house"></i> Dashboard
          </a>
          <button id="reset-demo-btn" class="user-menu-item user-menu-item--warning">
            <i class="bi bi-arrow-counterclockwise"></i> Reset Data Demo
          </button>
          <hr class="user-menu-divider">
          <button id="logout-demo-btn" class="user-menu-item user-menu-item--danger">
            <i class="bi bi-box-arrow-right"></i> Keluar Demo
          </button>
        </div>
      </div>`;
  const filterHTML = `
      <select class="topbar-select topbar-select--campus" id="campus-filter" title="${campusUnlocked ? 'Filter Kampus' : 'Kampus terikat pada peran aktif'}" ${campusUnlocked ? '' : 'disabled'}>
        ${campusOptions}
      </select>`;

  topbar.innerHTML = isMobileTopbar ? `
    <div class="topbar-mobile-row">
      <div class="topbar-left">
        <button class="topbar-icon-btn d-lg-none" id="mobile-menu-btn" title="Menu">
          <i class="bi bi-list"></i>
        </button>
        ${roleSwitcherHTML}
      </div>
      <div class="topbar-mobile-header-actions">
        ${notifHTML}
        ${userMenuHTML}
      </div>
    </div>
    <div class="topbar-right topbar-right-mobile-selects">
      ${filterHTML}
    </div>
  ` : `
    <div class="topbar-left">
      <button class="topbar-icon-btn d-lg-none" id="mobile-menu-btn" title="Menu">
        <i class="bi bi-list"></i>
      </button>
      <nav class="topbar-breadcrumb" aria-label="Breadcrumb">
        ${breadcrumb}
      </nav>
    </div>
    <div class="topbar-spacer"></div>
    <div class="topbar-right">
      ${filterHTML}
      ${notifHTML}
      ${roleSwitcherHTML}
      ${userMenuHTML}
    </div>
  `;

  bindTopbarEvents();
}

function buildBreadcrumb() {
  const hash = location.hash || '#/dashboard/foundation';
  const parts = hash.replace('#/', '').split('/');
  const labels = {
    dashboard: 'Dashboard', organization: 'Organisasi', campuses: 'Kampus',
    faculties: 'Fakultas', 'study-programs': 'Program Studi', 'academic-years': 'Tahun Akademik',
    semesters: 'Semester', calendar: 'Kalender', admissions: 'PMB', applicants: 'Pendaftar',
    students: 'Mahasiswa', lecturers: 'Dosen', academic: 'Akademik', courses: 'Mata Kuliah',
    curriculum: 'Kurikulum', classes: 'Kelas', learning: 'Pembelajaran', krs: 'KRS',
    grades: 'Nilai', attendance: 'Presensi', transcript: 'Transkrip', khs: 'KHS',
    thesis: 'Skripsi/TA', finance: 'Keuangan', invoices: 'Tagihan', payments: 'Pembayaran',
    receivables: 'Piutang', reports: 'Laporan', budget: 'Anggaran', overview: 'Ringkasan',
    hr: 'SDM & Payroll', employees: 'Pegawai', payroll: 'Payroll', assets: 'Aset',
    procurement: 'Pengadaan', pddikti: 'PDDIKTI', validation: 'Validasi', settings: 'Pengaturan',
    users: 'Pengguna', preferences: 'Preferensi', 'audit-logs': 'Audit Log',
    portal: 'Portal', student: 'Mahasiswa', lecturer: 'Dosen', parent: 'Orang Tua',
    foundation: 'Yayasan', campus: 'Kampus', faculty: 'Fakultas/Prodi',
    profile: 'Profil', periods: 'Periode', selection: 'Seleksi', 'coa': 'Bagan Akun',
    journals: 'Jurnal', ledger: 'Buku Besar', dashboard: 'Dashboard',
  };

  let html = `<span class="topbar-breadcrumb-item"><i class="bi bi-house-door"></i></span>`;
  parts.forEach((p, i) => {
    const label = labels[p] || p;
    html += `<span class="topbar-breadcrumb-sep">/</span>`;
    if (i === parts.length - 1) {
      html += `<span class="topbar-breadcrumb-item current">${label}</span>`;
    } else {
      html += `<span class="topbar-breadcrumb-item">${label}</span>`;
    }
  });
  return html;
}

function bindTopbarEvents() {
  // Campus filter
  document.getElementById('campus-filter')?.addEventListener('change', e => {
    AppState.setCampusFilter(e.target.value);
    Router.refresh();
  });

  // Year filter
  document.getElementById('year-filter')?.addEventListener('change', e => {
    AppState.currentAcademicYear = e.target.value;
    Router.refresh();
  });

  // Notification panel
  document.getElementById('notif-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    toggleNotifPanel();
  });

  // Role switcher
  document.getElementById('role-switcher-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    toggleRoleSwitcher();
  });

  // User menu
  document.getElementById('user-menu-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    const panel = document.getElementById('user-menu-panel');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });

  // Reset demo
  document.getElementById('reset-demo-btn')?.addEventListener('click', async () => {
    const { showConfirm } = await import('./toast.js');
    const ok = await showConfirm({
      title: 'Reset Data Demo',
      message: 'Seluruh perubahan data demo akan dikembalikan ke kondisi awal. Tindakan ini tidak dapat dibatalkan.',
      type: 'warning',
      confirmText: 'Ya, Reset Data',
    });
    if (ok) {
      const { initSeed } = await import('../data/seed.js');
      initSeed(true);
      showToast('Data demo berhasil direset ke kondisi awal.', 'success');
      setTimeout(() => location.reload(), 800);
    }
  });

  // Logout (just reload / reset role)
  document.getElementById('logout-demo-btn')?.addEventListener('click', () => {
    localStorage.removeItem('siakad-role');
    showToast('Keluar dari mode demo. Memuat ulang…', 'info');
    setTimeout(() => location.reload(), 800);
  });

  // Mobile sidebar toggle
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar?.classList.toggle('mobile-open');
    if (overlay) overlay.style.display = sidebar?.classList.contains('mobile-open') ? 'block' : 'none';
  });

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    document.getElementById('notif-panel')?.style.setProperty('display', 'none');
    document.getElementById('role-switcher-panel')?.style.setProperty('display', 'none');
    document.getElementById('user-menu-panel')?.style.setProperty('display', 'none');
  });
}

function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  if (panel.style.display !== 'none') { panel.style.display = 'none'; return; }

  const notifs = DB.getAll('notifications').slice(0, 10);
  const role = AppState.currentRole.label;
  const relevant = notifs.filter(n => n.role.length === 0 || n.role.includes(role));
  const icons = { krs: 'bi-journal', finance: 'bi-cash', pmb: 'bi-person-plus', budget: 'bi-pie-chart', pddikti: 'bi-cloud', academic: 'bi-book' };
  const colors = { krs: '#0d6efd', finance: '#198754', pmb: '#d97706', budget: '#b88a2b', pddikti: '#6f42c1', academic: '#0d6efd' };

  panel.innerHTML = `
    <div class="notif-panel">
      <div class="notif-header">
        <h6 class="notif-title">Notifikasi</h6>
        <button id="mark-all-read" style="font-size:var(--text-xs);color:var(--color-info);background:none;border:none;cursor:pointer">Tandai semua dibaca</button>
      </div>
      <div class="notif-list">
        ${relevant.length === 0 ? '<div style="padding:2rem;text-align:center;color:var(--color-muted);font-size:var(--text-sm)"><i class="bi bi-bell-slash d-block mb-2" style="font-size:1.5rem"></i>Tidak ada notifikasi</div>' :
          relevant.map(n => `
            <div class="notif-item ${n.read ? '' : 'unread'}" data-notif="${n.id}" data-link="${n.link}">
              <div class="notif-icon-wrap" style="background:${colors[n.type] || '#6b7280'}20;color:${colors[n.type] || '#6b7280'}">
                <i class="bi ${icons[n.type] || 'bi-bell'}"></i>
              </div>
              <div class="notif-body">
                <div class="notif-text"><strong>${n.title}</strong><br>${n.message}</div>
                <div class="notif-time">${new Date(n.time).toLocaleString('id-ID', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
              </div>
              ${!n.read ? '<div class="notif-dot"></div>' : ''}
            </div>`).join('')}
      </div>
    </div>`;

  panel.style.display = 'block';

  panel.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const id = el.dataset.notif;
      const link = el.dataset.link;
      const notifs = DB.getAll('notifications');
      const n = notifs.find(x => x.id === id);
      if (n) { n.read = true; DB.save('notifications', notifs); }
      AppState.updateNotifCount();
      panel.style.display = 'none';
      if (link) location.hash = link.replace('#', '');
    });
  });

  panel.querySelector('#mark-all-read')?.addEventListener('click', e => {
    e.stopPropagation();
    const notifs = DB.getAll('notifications');
    notifs.forEach(n => n.read = true);
    DB.save('notifications', notifs);
    AppState.updateNotifCount();
    panel.style.display = 'none';
    showToast('Semua notifikasi ditandai sudah dibaca.', 'success');
  });
}

function toggleRoleSwitcher() {
  const panel = document.getElementById('role-switcher-panel');
  if (!panel) return;
  if (panel.style.display !== 'none') { panel.style.display = 'none'; return; }
  const isMobile = window.matchMedia('(max-width: 767.98px)').matches;

  panel.innerHTML = `
    <div class="role-switcher-dropdown" style="position:static;width:${isMobile ? '100%' : 'min(360px, calc(100vw - 1rem))'};max-width:100%;max-height:${isMobile ? 'min(80vh, 40rem)' : 'calc(100vh - 80px)'}">
      <div class="role-switcher-header">
        <div style="font-size:var(--text-xs);font-weight:var(--font-semibold);color:var(--color-muted)">GANTI ROLE DEMO</div>
      </div>
      <div class="role-switcher-list">
        ${ROLES.map(r => `
          <div class="role-option ${r.id === AppState.currentRole.id ? 'active' : ''}" data-role="${r.id}">
            <div class="role-option-icon"><i class="bi ${r.icon}"></i></div>
            <div class="role-option-content" style="flex:1;min-width:0">
              <div class="role-option-name" style="${isMobile ? 'word-break:normal;overflow-wrap:break-word;line-height:1.45;' : ''}">${r.label}</div>
              <div class="role-option-scope" style="${isMobile ? 'word-break:normal;overflow-wrap:break-word;line-height:1.45;' : ''}">${r.scopeLabel}</div>
            </div>
            ${r.id === AppState.currentRole.id ? '<i class="bi bi-check2 ms-auto text-gold"></i>' : ''}
          </div>`).join('')}
      </div>
    </div>`;

  if (isMobile) {
    panel.style.position = 'fixed';
    panel.style.left = '0.75rem';
    panel.style.right = '0.75rem';
    panel.style.top = '5.25rem';
    panel.style.width = 'auto';
    panel.style.zIndex = '1070';
  } else {
    panel.style.position = '';
    panel.style.left = '';
    panel.style.right = '';
    panel.style.top = '';
    panel.style.width = '';
    panel.style.zIndex = '';
  }

  panel.style.display = 'block';

  panel.querySelectorAll('.role-option').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const roleId = el.dataset.role;
      if (roleId === AppState.currentRole.id) { panel.style.display = 'none'; return; }
      AppState.setRole(roleId);
      panel.style.display = 'none';
      renderSidebar();
      renderTopbar();
      showToast(`Role diubah ke: ${AppState.currentRole.label}`, 'gold');
      const role = AppState.currentRole;
      setTimeout(() => { location.hash = role.dashboardRoute.replace('#', ''); }, 300);
    });
  });
}

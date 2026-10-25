/**
 * SIAKAD Cakrawala — Application State
 * Reactive state management for demo
 */

import { DB } from './data/seed.js';

// ---- Role Definitions ----
export const ROLES = [
  {
    id: 'foundation',
    label: 'Pengurus Yayasan',
    user: 'Prof. Dr. H. Ahmad Fauzi',
    avatar: 'AF',
    scopeLabel: 'Semua Kampus',
    campusId: null,  // null = all campuses
    icon: 'bi-building',
    dashboardRoute: '#/dashboard/foundation',
  },
  {
    id: 'admin-foundation',
    label: 'Admin Yayasan',
    user: 'Ir. Teguh Santoso',
    avatar: 'TS',
    scopeLabel: 'Semua Kampus',
    campusId: null,
    icon: 'bi-gear',
    dashboardRoute: '#/dashboard/foundation',
  },
  {
    id: 'rector',
    label: 'Rektor/Pimpinan Kampus',
    user: 'Prof. Dr. Siti Rahayu',
    avatar: 'SR',
    scopeLabel: 'Universitas Cakrawala Jakarta',
    campusId: 'campus-1',
    icon: 'bi-mortarboard',
    dashboardRoute: '#/dashboard/campus',
  },
  {
    id: 'dean',
    label: 'Dekan',
    user: 'Dr. Ir. Hendra Wijaya',
    avatar: 'HW',
    scopeLabel: 'Fakultas Teknik – UCJ',
    campusId: 'campus-1',
    facultyId: 'fac-1',
    icon: 'bi-person-badge',
    dashboardRoute: '#/dashboard/faculty',
  },
  {
    id: 'kaprodi',
    label: 'Ketua Program Studi',
    user: 'Dr. Rizki Pratama',
    avatar: 'RP',
    scopeLabel: 'Teknik Informatika – UCJ',
    campusId: 'campus-1',
    facultyId: 'fac-1',
    prodiId: 'prodi-1',
    icon: 'bi-diagram-3',
    dashboardRoute: '#/dashboard/faculty',
  },
  {
    id: 'pmb-staff',
    label: 'Staf PMB',
    user: 'Susi Indriani',
    avatar: 'SI',
    scopeLabel: 'UCJ – PMB',
    campusId: 'campus-1',
    icon: 'bi-person-plus',
    dashboardRoute: '#/admissions',
  },
  {
    id: 'academic-staff',
    label: 'Staf TU Akademik',
    user: 'Drs. H. Suparman',
    avatar: 'SP',
    scopeLabel: 'UCJ – Akademik',
    campusId: 'campus-1',
    icon: 'bi-journal-bookmark',
    dashboardRoute: '#/students',
  },
  {
    id: 'finance-staff',
    label: 'Staf Keuangan',
    user: 'Ratih Suci',
    avatar: 'RS',
    scopeLabel: 'UCJ – Keuangan',
    campusId: 'campus-1',
    icon: 'bi-cash-stack',
    dashboardRoute: '#/finance/dashboard',
  },
  {
    id: 'hr',
    label: 'HR',
    user: 'Agus Riyanto',
    avatar: 'AR',
    scopeLabel: 'ITC – SDM',
    campusId: 'campus-2',
    icon: 'bi-people',
    dashboardRoute: '#/hr/employees',
  },
  {
    id: 'lecturer',
    label: 'Dosen',
    user: 'Dr. Rizki Pratama',
    avatar: 'RP',
    scopeLabel: 'Teknik Informatika – UCJ',
    campusId: 'campus-1',
    lecturerId: 'lec-1',
    icon: 'bi-person-workspace',
    dashboardRoute: '#/portal/lecturer',
  },
  {
    id: 'student',
    label: 'Mahasiswa',
    user: 'Andi Firmansyah',
    avatar: 'AN',
    scopeLabel: 'NIM: 2022TIF001',
    campusId: 'campus-1',
    studentId: 'stu-1',
    icon: 'bi-person-circle',
    dashboardRoute: '#/portal/student',
  },
  {
    id: 'parent',
    label: 'Orang Tua/Wali',
    user: 'Ibu Rosalinda',
    avatar: 'RL',
    scopeLabel: 'Wali: Andi Firmansyah',
    campusId: 'campus-1',
    studentId: 'stu-1',
    icon: 'bi-person-heart',
    dashboardRoute: '#/portal/parent',
  },
];

// ---- Menu Permissions per Role ----
const MENU_ACCESS = {
  'foundation':       ['dashboard','organization','admissions','finance','budget','hr','assets','pddikti','reports','audit'],
  'admin-foundation': ['dashboard','organization','admissions','students','lecturers','academic','learning','thesis','finance','budget','hr','assets','pddikti','reports','settings','audit'],
  'rector':           ['dashboard','admissions','students','lecturers','academic','learning','thesis','finance','budget','hr','assets','pddikti','reports','audit'],
  'dean':             ['dashboard','students','lecturers','academic','learning','thesis','reports'],
  'kaprodi':          ['dashboard','students','lecturers','academic','learning','thesis','reports'],
  'pmb-staff':        ['admissions','reports'],
  'academic-staff':   ['students','academic','learning','thesis','reports'],
  'finance-staff':    ['finance','budget','reports','audit'],
  'hr':               ['hr','assets','reports'],
  'lecturer':         ['portal-lecturer'],
  'student':          ['portal-student'],
  'parent':           ['portal-parent'],
};

export function canSwitchCampus(role = AppState.currentRole) {
  return !role?.campusId;
}

export function resolveCampusFilter(preferred, role = AppState.currentRole) {
  if (role?.campusId) return role.campusId;
  return preferred || 'all';
}

// ---- AppState ----
export const AppState = {
  currentRole: ROLES[0],
  currentCampusFilter: 'all',
  currentAcademicYear: 'ay-3',
  currentSemester: 'sem-1',
  sidebarCollapsed: false,
  unreadNotifications: 0,

  init() {
    // Restore role from storage
    const savedRoleId = localStorage.getItem('siakad-role');
    if (savedRoleId) {
      const r = ROLES.find(x => x.id === savedRoleId);
      if (r) this.currentRole = r;
    }
    const savedCampusFilter = localStorage.getItem('siakad-campus-filter');
    this.currentCampusFilter = resolveCampusFilter(savedCampusFilter, this.currentRole);
    localStorage.setItem('siakad-campus-filter', this.currentCampusFilter);
    // Restore sidebar state
    const collapsed = localStorage.getItem('siakad-sidebar-collapsed');
    this.sidebarCollapsed = collapsed === 'true';
    // Count unread notifications
    this.updateNotifCount();
  },

  setRole(roleId) {
    const role = ROLES.find(r => r.id === roleId);
    if (!role) return;
    this.currentRole = role;
    localStorage.setItem('siakad-role', roleId);
    this.currentCampusFilter = resolveCampusFilter(role.campusId || 'all', role);
    localStorage.setItem('siakad-campus-filter', this.currentCampusFilter);
    this.updateNotifCount();
  },

  setCampusFilter(campusId) {
    this.currentCampusFilter = resolveCampusFilter(campusId, this.currentRole);
    localStorage.setItem('siakad-campus-filter', this.currentCampusFilter);
  },

  updateNotifCount() {
    const notifs = DB.getAll('notifications');
    const role = this.currentRole.label;
    this.unreadNotifications = notifs.filter(n => !n.read && (n.role.length === 0 || n.role.includes(role))).length;
    // Update badge in DOM
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.textContent = this.unreadNotifications > 9 ? '9+' : this.unreadNotifications;
      badge.style.display = this.unreadNotifications > 0 ? '' : 'none';
    }
  },

  hasAccess(menuKey) {
    const allowed = MENU_ACCESS[this.currentRole.id] || [];
    return allowed.includes(menuKey);
  },

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('siakad-sidebar-collapsed', this.sidebarCollapsed);
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
  },
};

// Make AppState accessible globally (for DB.log)
window._siakad = { AppState, DB };

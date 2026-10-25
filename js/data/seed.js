/**
 * SIAKAD Cakrawala — Data Seed & Storage Bootstrap
 * Loads all seed data into localStorage on first run
 */

import { Storage } from '../storage.js';
import { foundation, campuses, faculties, studyPrograms, academicYears, semesters, academicCalendar } from './organization.js?v=20261025aj';
import { students, admissions, scholarships } from './students.js?v=20261025aj';
import {
  lecturers, courses, curricula, classes, enrollments, attendances, grades, theses,
  notifications, auditLogs, krsPolicy, registrationPolicy, semesterRegistrations, krsPlans,
} from './academic.js?v=20261025aj';
import { invoices, payments, chartOfAccounts, journals, budgets, employees, payrollRuns, assets, procurementRequests, pddiktiJobs, demoUsers } from './finance.js?v=20261025aj';
import {
  classAnnouncements, advisingConsultations, lecturerAdminRequests,
  classAssignments, assignmentSubmissions,
  lectureMaterials, lectureJournals, lectureExams, scheduleReplacements,
  gradeComponents, thesisNotes, lectureDefenses,
} from './lecturer-portal-data.js?v=20261025aj';

const SEED_VERSION = 'v1.7';

/** Koleksi wajib — jika kosong padahal versi cocok, seed dianggap rusak (sering di HP / kuota penuh). */
const CRITICAL_COLLECTIONS = [
  'lecturers', 'students', 'campuses', 'classes', 'courses', 'studyPrograms',
];

/** Penugasan dosen wali awal dari field student.advisor */
function buildAdvisorAssignments() {
  return students
    .filter(s => s.advisor)
    .map((s, i) => ({
      id: `adv-${i + 1}`,
      studentId: s.id,
      lecturerId: s.advisor,
      prodiId: s.prodiId,
      angkatan: s.angkatan,
      startDate: `${s.angkatan}-09-01`,
      endDate: null,
      status: 'aktif',
      note: 'Penugasan awal demo',
    }));
}

function isSeedIntact() {
  return CRITICAL_COLLECTIONS.every(key => {
    const data = Storage.get(key);
    return Array.isArray(data) && data.length > 0;
  });
}

export function initSeed(force = false) {
  const currentVersion = Storage.get('seed-version');
  if (currentVersion === SEED_VERSION && !force && isSeedIntact()) return;

  if (currentVersion === SEED_VERSION && !force && !isSeedIntact()) {
    console.warn('[SIAKAD] Seed rusak/kosong — reseeding (perangkat mungkin kehabisan kuota localStorage).');
  }

  // Clear existing demo data
  Storage.clearAll();

  const writes = [];
  const put = (key, value) => { writes.push([key, Storage.set(key, value)]); };

  // Seed all collections
  put('foundation', foundation);
  put('campuses', campuses);
  put('faculties', faculties);
  put('studyPrograms', studyPrograms);
  put('academicYears', academicYears);
  put('semesters', semesters);
  put('academicCalendar', academicCalendar);

  put('students', students);
  put('admissions', admissions);
  put('scholarships', scholarships);

  put('lecturers', lecturers);
  put('courses', courses);
  put('curricula', curricula);
  put('classes', classes);
  put('enrollments', enrollments);
  put('attendances', attendances);
  put('grades', grades);
  put('theses', theses);
  put('notifications', notifications);
  put('auditLogs', auditLogs);
  put('krsPolicy', krsPolicy);
  put('registrationPolicy', registrationPolicy);
  put('semesterRegistrations', semesterRegistrations);
  put('krsPlans', krsPlans);
  put('advisorAssignments', buildAdvisorAssignments());

  // Portal Dosen LEC-031–037
  put('classAnnouncements', classAnnouncements);
  put('advisingConsultations', advisingConsultations);
  put('lecturerAdminRequests', lecturerAdminRequests);
  put('classAssignments', classAssignments);
  put('assignmentSubmissions', assignmentSubmissions);
  put('lectureMaterials', lectureMaterials);
  put('lectureJournals', lectureJournals);
  put('lectureExams', lectureExams);
  put('scheduleReplacements', scheduleReplacements);
  put('gradeComponents', gradeComponents);
  put('thesisNotes', thesisNotes);
  put('lectureDefenses', lectureDefenses);

  put('invoices', invoices);
  put('payments', payments);
  put('chartOfAccounts', chartOfAccounts);
  put('journals', journals);
  put('budgets', budgets);
  put('employees', employees);
  put('payrollRuns', payrollRuns);
  put('assets', assets);
  put('procurementRequests', procurementRequests);
  put('pddiktiJobs', pddiktiJobs);
  put('demoUsers', demoUsers);

  // App settings
  put('settings', {
    foundationName: 'Yayasan Cakrawala Pendidikan',
    defaultAcademicYear: 'ay-3',
    defaultSemester: 'sem-1',
    maxSks: 24,
    gradeWeights: { tugas: 20, kuis: 20, uts: 30, uas: 30 },
    docNumberFormat: '{TYPE}/{YEAR}/{SEQ}',
    theme: 'light',
  });

  const failed = writes.filter(([, ok]) => !ok).map(([k]) => k);
  if (failed.length) {
    console.error('[SIAKAD] Gagal menulis seed (kuota localStorage?):', failed.join(', '));
    // Jangan set versi agar boot berikutnya mencoba seed ulang
    return;
  }

  if (!isSeedIntact()) {
    console.error('[SIAKAD] Seed tidak utuh setelah write — versi tidak disimpan.');
    return;
  }

  Storage.set('seed-version', SEED_VERSION);
  console.info('[SIAKAD] Demo data seeded successfully.');
}

// ---- Getters (always from storage, support CRUD) ----
export const DB = {
  // Generic
  get: (key) => Storage.get(key),          // single object
  getAll: (key) => Storage.get(key) || [],
  getById: (key, id) => (Storage.get(key) || []).find(x => x.id === id),
  save: (key, items) => Storage.set(key, items),

  add(key, item) {
    const items = this.getAll(key);
    items.push(item);
    this.save(key, items);
    return item;
  },

  update(key, id, updates) {
    const items = this.getAll(key);
    const idx = items.findIndex(x => x.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates };
    this.save(key, items);
    return items[idx];
  },

  delete(key, id) {
    const items = this.getAll(key).filter(x => x.id !== id);
    this.save(key, items);
  },

  // Audit log helper
  log(action, module, object, result = 'Berhasil') {
    const logs = this.getAll('auditLogs');
    const { AppState } = window._siakad || {};
    const role = AppState?.currentRole?.label || 'Demo';
    const user = AppState?.currentRole?.user || 'Pengguna Demo';
    logs.unshift({
      id: `aud-${Date.now()}`,
      time: new Date().toISOString(),
      user: `${user} (demo)`,
      role,
      module,
      activity: action,
      object,
      result,
    });
    this.save('auditLogs', logs.slice(0, 200)); // keep latest 200
  },

  // Notification helper
  addNotif(type, title, message, link = '#/dashboard', roles = []) {
    const notifs = this.getAll('notifications');
    notifs.unshift({
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      time: new Date().toISOString(),
      read: false,
      link,
      role: roles,
    });
    this.save('notifications', notifs.slice(0, 100));
  },
};

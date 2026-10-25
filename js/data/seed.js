/**
 * SIAKAD Cakrawala — Data Seed & Storage Bootstrap
 * Loads all seed data into localStorage on first run
 */

import { Storage } from '../storage.js';
import { foundation, campuses, faculties, studyPrograms, academicYears, semesters, academicCalendar } from './organization.js';
import { students, admissions, scholarships } from './students.js';
import {
  lecturers, courses, curricula, classes, enrollments, attendances, grades, theses,
  notifications, auditLogs, krsPolicy, registrationPolicy, semesterRegistrations, krsPlans,
} from './academic.js';
import { invoices, payments, chartOfAccounts, journals, budgets, employees, payrollRuns, assets, procurementRequests, pddiktiJobs, demoUsers } from './finance.js';
import {
  classAnnouncements, advisingConsultations, lecturerAdminRequests,
  classAssignments, assignmentSubmissions,
} from './lecturer-portal-data.js';

const SEED_VERSION = 'v1.6';

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

export function initSeed(force = false) {
  const currentVersion = Storage.get('seed-version');
  if (currentVersion === SEED_VERSION && !force) return;

  // Clear existing demo data
  Storage.clearAll();

  // Seed all collections
  Storage.set('foundation', foundation);
  Storage.set('campuses', campuses);
  Storage.set('faculties', faculties);
  Storage.set('studyPrograms', studyPrograms);
  Storage.set('academicYears', academicYears);
  Storage.set('semesters', semesters);
  Storage.set('academicCalendar', academicCalendar);

  Storage.set('students', students);
  Storage.set('admissions', admissions);
  Storage.set('scholarships', scholarships);

  Storage.set('lecturers', lecturers);
  Storage.set('courses', courses);
  Storage.set('curricula', curricula);
  Storage.set('classes', classes);
  Storage.set('enrollments', enrollments);
  Storage.set('attendances', attendances);
  Storage.set('grades', grades);
  Storage.set('theses', theses);
  Storage.set('notifications', notifications);
  Storage.set('auditLogs', auditLogs);
  Storage.set('krsPolicy', krsPolicy);
  Storage.set('registrationPolicy', registrationPolicy);
  Storage.set('semesterRegistrations', semesterRegistrations);
  Storage.set('krsPlans', krsPlans);
  Storage.set('advisorAssignments', buildAdvisorAssignments());

  // Portal Dosen LEC-031–037
  Storage.set('classAnnouncements', classAnnouncements);
  Storage.set('advisingConsultations', advisingConsultations);
  Storage.set('lecturerAdminRequests', lecturerAdminRequests);
  Storage.set('classAssignments', classAssignments);
  Storage.set('assignmentSubmissions', assignmentSubmissions);

  Storage.set('invoices', invoices);
  Storage.set('payments', payments);
  Storage.set('chartOfAccounts', chartOfAccounts);
  Storage.set('journals', journals);
  Storage.set('budgets', budgets);
  Storage.set('employees', employees);
  Storage.set('payrollRuns', payrollRuns);
  Storage.set('assets', assets);
  Storage.set('procurementRequests', procurementRequests);
  Storage.set('pddiktiJobs', pddiktiJobs);
  Storage.set('demoUsers', demoUsers);

  // App settings
  Storage.set('settings', {
    foundationName: 'Yayasan Cakrawala Pendidikan',
    defaultAcademicYear: 'ay-3',
    defaultSemester: 'sem-1',
    maxSks: 24,
    gradeWeights: { tugas: 20, kuis: 20, uts: 30, uas: 30 },
    docNumberFormat: '{TYPE}/{YEAR}/{SEQ}',
    theme: 'light',
  });

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

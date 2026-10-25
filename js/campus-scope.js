import { AppState } from './state.js?v=20261025ab';
import { DB } from './data/seed.js';

export function getCampusScope() {
  return AppState.currentCampusFilter || 'all';
}

export function isAllCampuses() {
  return getCampusScope() === 'all';
}

export function isCampusInScope(campusId) {
  return isAllCampuses() || !campusId || campusId === getCampusScope();
}

export function scopeRows(rows, campusSelector = 'campusId') {
  if (isAllCampuses()) return rows;
  const selector = typeof campusSelector === 'function'
    ? campusSelector
    : (row) => row?.[campusSelector];
  return rows.filter(row => isCampusInScope(selector(row)));
}

export function scopeCampuses(campuses = DB.getAll('campuses')) {
  return isAllCampuses() ? campuses : campuses.filter(campus => campus.id === getCampusScope());
}

export function scopeStudyPrograms(programs = DB.getAll('studyPrograms')) {
  return scopeRows(programs, 'campusId');
}

export function scopeFaculties(faculties = DB.getAll('faculties'), programs = DB.getAll('studyPrograms')) {
  if (isAllCampuses()) return faculties;
  const allowedFacultyIds = new Set(scopeStudyPrograms(programs).map(program => program.facultyId));
  return faculties.filter(faculty => allowedFacultyIds.has(faculty.id));
}

export function scopeCourses(courses = DB.getAll('courses'), programs = DB.getAll('studyPrograms')) {
  if (isAllCampuses()) return courses;
  const allowedProgramIds = new Set(scopeStudyPrograms(programs).map(program => program.id));
  return courses.filter(course => course.prodiId === null || allowedProgramIds.has(course.prodiId));
}

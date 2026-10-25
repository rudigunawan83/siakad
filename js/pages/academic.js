/**
 * SIAKAD — Academic, Learning, Thesis, Organization Pages
 */

import { DB } from '../data/seed.js';
import { formatDate, statusBadge } from '../utils.js';
import { DataTable } from '../components/data-table.js';
import { showToast } from '../components/toast.js';
import { renderStaffRegistration } from './registration.js';
import { renderStaffKrsApproval } from './krs-approval.js';
import { renderAdvisors } from './advisors.js';

// ===================== ORGANIZATION =====================
export function renderOrganization(path, container) {
  if (path.includes('/campuses'))      return renderCampuses(container);
  if (path.includes('/faculties'))     return renderFaculties(container);
  if (path.includes('/study-programs'))return renderStudyPrograms(container);
  if (path.includes('/calendar'))      return renderCalendar(container);
  if (path.includes('/semesters'))     return renderSemesters(container);
  if (path.includes('/academic-years'))return renderAcademicYears(container);
  renderOrgProfile(container);
}

function renderOrgProfile(container) {
  const f = DB.get('foundation');
  if (!f) { container.innerHTML = '<div class="page-container"><p>Data tidak tersedia.</p></div>'; return; }
  const campuses = DB.getAll('campuses');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Profil Yayasan</h1></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
    <div class="card">
      <div class="card-header"><h3 class="card-title">Informasi Yayasan</h3></div>
      <div class="card-body">
        ${[['Nama',f.name],['Nama Singkat',f.shortName],['Ketua',f.chairman],['Alamat',f.address],['Telepon',f.phone],['Email',f.email],['Website',f.website],['Tahun Berdiri',f.established],['NPWP',f.npwp],['Status',statusBadge(f.status)]].map(([k,v])=>`<div class="stat-row"><span class="stat-row-label">${k}</span><span class="stat-row-value">${v}</span></div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">Daftar Kampus</h3><a href="#/organization/campuses" class="btn btn-secondary btn-sm">Lihat Semua</a></div>
      <div class="card-body">
        ${campuses.map(c=>`
          <div style="display:flex;align-items:center;gap:1rem;padding:0.75rem 0;border-bottom:1px solid var(--color-border)">
            <div style="width:40px;height:40px;border-radius:8px;background:${c.color};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.8rem;flex-shrink:0">${c.code}</div>
            <div><div style="font-weight:var(--font-semibold)">${c.name}</div><div style="font-size:var(--text-xs);color:var(--color-muted)">${c.type} · ${c.city} · Akreditasi ${c.accreditation}</div></div>
          </div>`).join('')}
      </div>
    </div>
  </div>
</div>`;
}

function renderCampuses(container) {
  const campuses = DB.getAll('campuses');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Daftar Kampus</h1><p class="page-desc">${campuses.length} kampus di bawah naungan yayasan</p></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem">
    ${campuses.map(c=>`
      <div class="card" style="border-top:4px solid ${c.color}">
        <div class="card-body">
          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
            <div style="width:48px;height:48px;border-radius:10px;background:${c.color};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.9rem">${c.code}</div>
            <div><div style="font-weight:var(--font-bold)">${c.name}</div><div style="font-size:var(--text-xs);color:var(--color-muted)">${c.type}</div></div>
          </div>
          ${[['Kota',c.city],['Rektor',c.rector],['Berdiri',c.established],['Akreditasi',`<span class="badge badge-${c.accreditation==='A'?'success':'warning'}">${c.accreditation}</span>`],['Mahasiswa',c.studentCount.toLocaleString('id-ID')],['Dosen',c.lecturerCount],['Status',statusBadge(c.status)]].map(([k,v])=>`<div class="stat-row"><span class="stat-row-label">${k}</span><span class="stat-row-value">${v}</span></div>`).join('')}
        </div>
      </div>`).join('')}
  </div>
</div>`;
}

function renderFaculties(container) {
  const faculties = DB.getAll('faculties');
  const campuses  = DB.getAll('campuses');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Fakultas</h1></div><div class="page-actions"><button class="btn btn-accent" id="add-fac"><i class="bi bi-plus-lg"></i> Tambah Fakultas</button></div></div>
  <div id="fac-table"></div>
</div>`;
  new DataTable({
    containerId:'fac-table',
    columns:[
      {key:'code',label:'Kode',render:r=>`<span class="badge badge-navy">${r.code}</span>`},
      {key:'name',label:'Nama Fakultas'},
      {key:'campusId',label:'Kampus',render:r=>campuses.find(c=>c.id===r.campusId)?.name||'-'},
      {key:'dean',label:'Dekan'},
      {key:'programCount',label:'Prodi'},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
      {key:'_act',label:'Aksi',sortable:false,render:r=>`<button class="btn btn-secondary btn-icon btn-sm" title="Edit"><i class="bi bi-pencil"></i></button>`},
    ],
    data:faculties, searchFields:['name','code','dean'],
  });
}

function renderStudyPrograms(container) {
  const prodi = DB.getAll('studyPrograms');
  const campuses = DB.getAll('campuses');
  const faculties = DB.getAll('faculties');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Program Studi</h1><p class="page-desc">${prodi.length} program studi aktif</p></div><div class="page-actions"><button class="btn btn-accent" id="add-prodi"><i class="bi bi-plus-lg"></i> Tambah Prodi</button></div></div>
  <div id="prodi-table"></div>
</div>`;
  new DataTable({
    containerId:'prodi-table',
    columns:[
      {key:'code',label:'Kode',render:r=>`<span class="badge badge-navy">${r.code}</span>`},
      {key:'name',label:'Nama Program Studi'},
      {key:'degree',label:'Jenjang',render:r=>`<span class="badge badge-info">${r.degree}</span>`},
      {key:'campusId',label:'Kampus',render:r=>campuses.find(c=>c.id===r.campusId)?.code||'-'},
      {key:'facultyId',label:'Fakultas',render:r=>faculties.find(f=>f.id===r.facultyId)?.code||'-'},
      {key:'head',label:'Ketua Prodi'},
      {key:'accreditation',label:'Akreditasi',render:r=>`<span class="badge badge-${r.accreditation==='A'?'success':r.accreditation==='B'?'warning':'danger'}">${r.accreditation}</span>`},
      {key:'studentCount',label:'Mhs.',render:r=>r.studentCount.toLocaleString('id-ID')},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:prodi, searchFields:['name','code','head'],
  });
}

function renderCalendar(container) {
  const calendar = DB.getAll('academicCalendar');
  const typeColors = { akademik:'#213550', ujian:'#dc3545', nilai:'#d97706', yudisium:'#198754', pmb:'#6f42c1' };
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Kalender Akademik</h1><p class="page-desc">Semester Ganjil 2026/2027</p></div></div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Kegiatan</th><th>Tipe</th><th>Mulai</th><th>Selesai</th></tr></thead>
        <tbody>${calendar.map(c=>`<tr>
          <td><strong>${c.event}</strong></td>
          <td><span class="badge" style="background:${typeColors[c.type]||'#6b7280'}22;color:${typeColors[c.type]||'#6b7280'}">${c.type}</span></td>
          <td>${formatDate(c.startDate)}</td>
          <td>${formatDate(c.endDate)}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>
  </div>
</div>`;
}

function renderSemesters(container) {
  const semesters = DB.getAll('semesters');
  const years = DB.getAll('academicYears');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Semester</h1></div></div>
  <div id="sem-table"></div>
</div>`;
  new DataTable({
    containerId:'sem-table',
    columns:[
      {key:'name',label:'Nama Semester'},
      {key:'academicYearId',label:'Tahun Akademik',render:r=>years.find(y=>y.id===r.academicYearId)?.name||'-'},
      {key:'startDate',label:'Mulai',render:r=>formatDate(r.startDate)},
      {key:'endDate',label:'Selesai',render:r=>formatDate(r.endDate)},
      {key:'krsStart',label:'KRS Buka',render:r=>formatDate(r.krsStart)},
      {key:'krsEnd',label:'KRS Tutup',render:r=>formatDate(r.krsEnd)},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:semesters, searchFields:['name'],
  });
}

function renderAcademicYears(container) {
  const years = DB.getAll('academicYears');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Tahun Akademik</h1></div></div>
  <div id="ay-table"></div>
</div>`;
  new DataTable({
    containerId:'ay-table',
    columns:[
      {key:'name',label:'Tahun Akademik'},
      {key:'startDate',label:'Mulai',render:r=>formatDate(r.startDate)},
      {key:'endDate',label:'Berakhir',render:r=>formatDate(r.endDate)},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:years, searchFields:['name'],
  });
}

// ===================== ACADEMIC =====================
export function renderAcademic(path, container) {
  if (path.includes('/advisors'))     return renderAdvisors(path, container);
  if (path.includes('/courses'))      return renderCourses(container);
  if (path.includes('/classes'))      return renderClasses(container);
  if (path.includes('/curriculum'))   return renderCurriculum(container);
  if (path.includes('/prerequisites')) return renderCoursePrerequisites(container);
  if (path.includes('/schedule')) return renderAcademicSchedule(container);
  if (path.includes('/evaluation')) return renderAcademicEvaluation(container);
  renderCourses(container);
}

function renderAcademicEmptyState(title, description, detail) {
  return `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">${title}</h1><p class="page-desc">${description}</p></div></div>
  <div class="card" style="max-width:760px">
    <div class="card-body" style="padding:2rem;text-align:center">
      <div style="width:64px;height:64px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--color-gold-50);color:var(--color-gold-600);font-size:1.5rem;margin-bottom:1rem">
        <i class="bi bi-journal-text"></i>
      </div>
      <div style="font-weight:var(--font-semibold);margin-bottom:.5rem">Belum ada data aktif</div>
      <div style="font-size:var(--text-sm);color:var(--color-muted)">${detail}</div>
    </div>
  </div>
</div>`;
}

function renderCourses(container) {
  const courses = DB.getAll('courses');
  const prodi   = DB.getAll('studyPrograms');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Mata Kuliah</h1><p class="page-desc">${courses.length} mata kuliah terdaftar</p></div><div class="page-actions"><button class="btn btn-accent" id="add-mk"><i class="bi bi-plus-lg"></i> Tambah MK</button></div></div>
  <div id="crs-table"></div>
</div>`;
  new DataTable({
    containerId:'crs-table',
    columns:[
      {key:'code',label:'Kode',render:r=>`<code>${r.code}</code>`},
      {key:'name',label:'Nama Mata Kuliah'},
      {key:'prodiId',label:'Prodi',render:r=>prodi.find(p=>p.id===r.prodiId)?.code||'Umum'},
      {key:'sks',label:'SKS',render:r=>`<strong>${r.sks}</strong>`},
      {key:'semester',label:'Sem.'},
      {key:'type',label:'Tipe',render:r=>`<span class="badge badge-${r.type==='wajib'?'navy':'info'}">${r.type}</span>`},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
      {key:'_act',label:'Aksi',sortable:false,render:r=>`<button class="btn btn-secondary btn-icon btn-sm" title="Edit"><i class="bi bi-pencil"></i></button>`},
    ],
    data:courses, searchFields:['name','code'],
  });
}

function renderClasses(container) {
  const classes   = DB.getAll('classes');
  const courses   = DB.getAll('courses');
  const lecturers = DB.getAll('lecturers');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Kelas Kuliah</h1></div><div class="page-actions"><button class="btn btn-accent"><i class="bi bi-plus-lg"></i> Buka Kelas</button></div></div>
  <div id="cls-table"></div>
</div>`;
  new DataTable({
    containerId:'cls-table',
    columns:[
      {key:'code',label:'Kode Kelas',render:r=>`<strong>${r.code}</strong>`},
      {key:'courseId',label:'Mata Kuliah',render:r=>courses.find(c=>c.id===r.courseId)?.name||'-'},
      {key:'lecturerId',label:'Dosen',render:r=>lecturers.find(l=>l.id===r.lecturerId)?.name||'-'},
      {key:'day',label:'Hari'},
      {key:'startTime',label:'Waktu',render:r=>`${r.startTime}–${r.endTime}`},
      {key:'room',label:'Ruang'},
      {key:'enrolled',label:'Peserta',render:r=>`<strong>${r.enrolled}</strong>/${r.capacity}`},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:classes, searchFields:['code','room'],
  });
}

function renderCurriculum(container) {
  const prodi = DB.getAll('studyPrograms');
  const courses = DB.getAll('courses');
  const selected = prodi[0];
  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Kurikulum</h1></div>
    <div class="page-actions">
      <select class="filter-select" id="prodi-sel">${prodi.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select>
    </div>
  </div>
  <div id="curriculum-content">${buildCurriculumView(selected, courses)}</div>
</div>`;
  document.getElementById('prodi-sel')?.addEventListener('change', e=>{
    const p = prodi.find(x=>x.id===e.target.value);
    document.getElementById('curriculum-content').innerHTML = buildCurriculumView(p, courses);
  });
}

function buildCurriculumView(prodi, allCourses) {
  if (!prodi) return '';
  const pCourses = allCourses.filter(c=>c.prodiId===prodi.id||c.prodiId===null);
  const semesters = [...new Set(pCourses.map(c=>c.semester))].sort();
  const totalSks = pCourses.reduce((s,c)=>s+c.sks,0);
  return `
    <div class="info-box info-box-success" style="margin-bottom:1rem"><i class="bi bi-info-circle"></i> Total SKS Kurikulum <strong>${prodi.name}</strong>: <strong>${totalSks} SKS</strong></div>
    ${semesters.map(sem=>`
      <div class="curriculum-semester">
        <div class="curriculum-semester-title">Semester ${sem}</div>
        ${pCourses.filter(c=>c.semester===sem).map(c=>`
          <div class="curriculum-course-row">
            <code style="min-width:80px">${c.code}</code>
            <span style="flex:1">${c.name}</span>
            <span class="course-sks">${c.sks} SKS</span>
            <span class="badge badge-${c.type==='wajib'?'navy':'info'} course-type-badge">${c.type}</span>
          </div>`).join('')}
      </div>`).join('')}`;
}

function renderCoursePrerequisites(container) {
  const courses = DB.getAll('courses');
  const lookup = new Map(courses.map(item => [item.id, item]));
  const rows = courses
    .filter(item => item.prerequisite)
    .map(item => ({
      code: item.code,
      name: item.name,
      prerequisite: lookup.get(item.prerequisite)
        ? `${lookup.get(item.prerequisite).code} - ${lookup.get(item.prerequisite).name}`
        : item.prerequisite,
      semester: item.semester,
    }));
  if (!rows.length) {
    container.innerHTML = renderAcademicEmptyState('Prasyarat Mata Kuliah', 'Daftar aturan prasyarat antar mata kuliah.', 'Belum ada mata kuliah dengan prasyarat pada data demo.');
    return;
  }
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Prasyarat Mata Kuliah</h1><p class="page-desc">Hubungan prasyarat antar mata kuliah pada kurikulum aktif</p></div></div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>Prasyarat</th><th>Semester</th></tr></thead>
        <tbody>${rows.map(row => `
          <tr>
            <td><code>${row.code}</code></td>
            <td>${row.name}</td>
            <td>${row.prerequisite}</td>
            <td>${row.semester}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
}

function renderAcademicSchedule(container) {
  const classes = DB.getAll('classes');
  const courses = DB.getAll('courses');
  const lecturers = DB.getAll('lecturers');
  const rows = classes.map(item => ({
    code: item.code,
    course: courses.find(course => course.id === item.courseId)?.name || '-',
    lecturer: lecturers.find(lecturer => lecturer.id === item.lecturerId)?.name || '-',
    day: item.day,
    time: `${item.startTime} - ${item.endTime}`,
    room: item.room,
  }));
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Penjadwalan</h1><p class="page-desc">Jadwal kelas aktif perkuliahan semester berjalan</p></div></div>
  <div id="academic-schedule-table"></div>
</div>`;
  new DataTable({
    containerId:'academic-schedule-table',
    columns:[
      {key:'code',label:'Kelas',render:r=>`<strong>${r.code}</strong>`},
      {key:'course',label:'Mata Kuliah'},
      {key:'lecturer',label:'Dosen'},
      {key:'day',label:'Hari'},
      {key:'time',label:'Jam'},
      {key:'room',label:'Ruang'},
    ],
    data:rows,
    searchFields:['code','course','lecturer','room'],
  });
}

function renderAcademicEvaluation(container) {
  const students = DB.getAll('students');
  const campuses = DB.getAll('campuses');
  const rows = campuses.map(campus => {
    const members = students.filter(item => item.campusId === campus.id);
    const avgIpk = members.reduce((sum, item) => sum + (item.ipk || 0), 0) / (members.length || 1);
    const atRisk = members.filter(item => (item.ipk || 0) < 2.75 || item.status !== 'aktif').length;
    return {
      campus: campus.code,
      students: members.length,
      avgIpk,
      atRisk,
      note: atRisk > 0 ? 'Perlu monitoring' : 'Stabil',
    };
  });
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Evaluasi Akademik</h1><p class="page-desc">Ringkasan performa akademik mahasiswa per kampus</p></div></div>
  <div id="academic-evaluation-table"></div>
</div>`;
  new DataTable({
    containerId:'academic-evaluation-table',
    columns:[
      {key:'campus',label:'Kampus'},
      {key:'students',label:'Mahasiswa'},
      {key:'avgIpk',label:'Rata-rata IPK',render:r=>r.avgIpk.toFixed(2)},
      {key:'atRisk',label:'Perlu Perhatian'},
      {key:'note',label:'Catatan'},
    ],
    data:rows,
    searchFields:['campus','note'],
  });
}

// ===================== LECTURERS =====================
export function renderLecturers(path, container) {
  if (path.includes('/staff')) return renderAcademicStaff(container);
  if (path.includes('/assignments')) return renderLecturerAssignments(container);
  if (path.includes('/workload')) return renderLecturerWorkload(container);
  if (path.includes('/certification')) return renderLecturerCertification(container);
  if (path.includes('/evaluation')) return renderLecturerEvaluation(container);

  const lecturers = DB.getAll('lecturers');
  const campuses  = DB.getAll('campuses');
  const prodi     = DB.getAll('studyPrograms');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Data Dosen</h1><p class="page-desc">${lecturers.length} dosen aktif</p></div><div class="page-actions"><button class="btn btn-accent"><i class="bi bi-plus-lg"></i> Tambah Dosen</button></div></div>
  <div id="lec-table"></div>
</div>`;
  new DataTable({
    containerId:'lec-table',
    columns:[
      {key:'nidn',label:'NIDN',render:r=>`<code>${r.nidn}</code>`},
      {key:'name',label:'Nama Dosen'},
      {key:'campusId',label:'Kampus',render:r=>campuses.find(c=>c.id===r.campusId)?.code||'-'},
      {key:'prodiId',label:'Prodi',render:r=>prodi.find(p=>p.id===r.prodiId)?.name||'-'},
      {key:'position',label:'Jabatan'},
      {key:'classCount',label:'Kelas'},
      {key:'email',label:'Email'},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:lecturers, searchFields:['name','nidn','email'],
  });
}

function renderAcademicStaff(container) {
  const employees = DB.getAll('employees').filter(item => /akademik|baak|registrar/i.test(`${item.unit} ${item.position}`));
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Tenaga Kependidikan</h1><p class="page-desc">Staf operasional akademik dan administrasi kampus</p></div></div>
  <div id="academic-staff-table"></div>
</div>`;
  new DataTable({
    containerId:'academic-staff-table',
    columns:[
      {key:'empId',label:'ID',render:r=>`<code>${r.empId}</code>`},
      {key:'name',label:'Nama'},
      {key:'unit',label:'Unit'},
      {key:'position',label:'Jabatan'},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:employees,
    searchFields:['name','unit','position'],
  });
}

function renderLecturerAssignments(container) {
  const lecturers = DB.getAll('lecturers');
  const classes = DB.getAll('classes');
  const courses = DB.getAll('courses');
  const rows = lecturers.map(lecturer => {
    const teaching = classes.filter(item => item.lecturerId === lecturer.id);
    return {
      name: lecturer.name,
      nidn: lecturer.nidn,
      assignmentCount: teaching.length,
      assignments: teaching.map(item => {
        const course = courses.find(courseItem => courseItem.id === item.courseId);
        return `${item.code} - ${course?.name || '-'}`;
      }).join('<br>') || '<span style="color:var(--color-muted)">Belum ada penugasan</span>',
    };
  });
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Penugasan Mengajar</h1><p class="page-desc">Distribusi kelas aktif per dosen</p></div></div>
  <div id="lecturer-assign-table"></div>
</div>`;
  new DataTable({
    containerId:'lecturer-assign-table',
    columns:[
      {key:'nidn',label:'NIDN',render:r=>`<code>${r.nidn}</code>`},
      {key:'name',label:'Dosen'},
      {key:'assignmentCount',label:'Jumlah Kelas'},
      {key:'assignments',label:'Mata Kuliah',sortable:false,render:r=>r.assignments},
    ],
    data:rows,
    searchFields:['name','nidn'],
  });
}

function renderLecturerWorkload(container) {
  const lecturers = DB.getAll('lecturers');
  const classes = DB.getAll('classes');
  const rows = lecturers.map(lecturer => {
    const teaching = classes.filter(item => item.lecturerId === lecturer.id);
    const totalStudents = teaching.reduce((sum, item) => sum + (item.enrolled || 0), 0);
    return {
      name: lecturer.name,
      position: lecturer.position,
      classes: teaching.length,
      students: totalStudents,
      load: teaching.length >= 4 ? 'tinggi' : teaching.length >= 2 ? 'normal' : 'rendah',
    };
  });
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Beban Kerja Dosen</h1><p class="page-desc">Monitoring jumlah kelas dan mahasiswa yang ditangani</p></div></div>
  <div id="lecturer-workload-table"></div>
</div>`;
  new DataTable({
    containerId:'lecturer-workload-table',
    columns:[
      {key:'name',label:'Dosen'},
      {key:'position',label:'Jabatan'},
      {key:'classes',label:'Kelas Aktif'},
      {key:'students',label:'Total Mahasiswa'},
      {key:'load',label:'Status Beban',render:r=>statusBadge(r.load)},
    ],
    data:rows,
    searchFields:['name','position'],
  });
}

function renderLecturerCertification(container) {
  const lecturers = DB.getAll('lecturers');
  const rows = lecturers.map((lecturer, index) => ({
    name: lecturer.name,
    nidn: lecturer.nidn,
    level: lecturer.position,
    certification: index % 3 === 0 ? 'Serdos aktif' : index % 3 === 1 ? 'Perpanjangan 2027' : 'Belum diajukan',
    dueDate: index % 3 === 2 ? '-' : index % 3 === 0 ? '2027-12-31' : '2027-06-30',
  }));
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Sertifikasi Dosen</h1><p class="page-desc">Status sertifikasi dan kebutuhan tindak lanjut</p></div></div>
  <div id="lecturer-cert-table"></div>
</div>`;
  new DataTable({
    containerId:'lecturer-cert-table',
    columns:[
      {key:'nidn',label:'NIDN',render:r=>`<code>${r.nidn}</code>`},
      {key:'name',label:'Dosen'},
      {key:'level',label:'Jabatan'},
      {key:'certification',label:'Status Sertifikasi'},
      {key:'dueDate',label:'Masa Berlaku',render:r=>r.dueDate === '-' ? '-' : formatDate(r.dueDate)},
    ],
    data:rows,
    searchFields:['name','nidn','certification'],
  });
}

function renderLecturerEvaluation(container) {
  const lecturers = DB.getAll('lecturers');
  const rows = lecturers.map((lecturer, index) => ({
    name: lecturer.name,
    nidn: lecturer.nidn,
    score: 84 + (index % 5) * 3,
    studentFeedback: ['Sangat baik', 'Baik', 'Baik', 'Perlu coaching ringan', 'Sangat baik'][index % 5],
    followUp: index % 4 === 0 ? 'Observasi kelas semester depan' : 'Tidak ada',
  }));
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Evaluasi Kinerja Dosen</h1><p class="page-desc">Ringkasan skor evaluasi per dosen untuk semester berjalan</p></div></div>
  <div id="lecturer-eval-table"></div>
</div>`;
  new DataTable({
    containerId:'lecturer-eval-table',
    columns:[
      {key:'name',label:'Dosen'},
      {key:'nidn',label:'NIDN',render:r=>`<code>${r.nidn}</code>`},
      {key:'score',label:'Skor'},
      {key:'studentFeedback',label:'Feedback Mahasiswa'},
      {key:'followUp',label:'Tindak Lanjut'},
    ],
    data:rows,
    searchFields:['name','nidn','studentFeedback'],
  });
}

// ===================== LEARNING =====================
export function renderLearning(path, container) {
  if (path.includes('/registration')) return renderStaffRegistration(path, container);
  if (path.includes('/krs-approval')) return renderStaffKrsApproval(path, container);
  if (path.includes('/krs'))          return renderKRS(container);
  if (path.includes('/attendance'))   return renderAttendance(container);
  if (path.includes('/assignments'))  return renderLearningAssignments(container);
  if (path.includes('/grades'))       return renderGrades(container);
  if (path.includes('/transcript'))   return renderTranscript(container);
  if (path.includes('/khs'))          return renderKHS(container);
  if (path.includes('/evaluation'))   return renderLearningEvaluation(container);
  renderKRS(container);
}

function renderKRS(container) {
  const enrollments = DB.getAll('enrollments');
  const students    = DB.getAll('students');
  const classes     = DB.getAll('classes');
  const courses     = DB.getAll('courses');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">KRS — Semester Ganjil 2026/2027</h1><p class="page-desc">Kartu Rencana Studi</p></div></div>
  <div class="krs-sks-counter" style="margin-bottom:1rem">
    <i class="bi bi-info-circle text-navy"></i>
    <span>Periode KRS: <strong>20 Agustus – 7 September 2026</strong></span>
    <span class="badge badge-success ms-2">Aktif</span>
    <span style="margin-left:auto;font-size:var(--text-xs);color:var(--color-muted)">Maks. 24 SKS per semester</span>
  </div>
  <div id="krs-table"></div>
</div>`;
  new DataTable({
    containerId:'krs-table',
    columns:[
      {key:'studentId',label:'Mahasiswa',render:r=>{const s=students.find(x=>x.id===r.studentId);return s?`<div>${s.name}</div><div style="font-size:10px;color:var(--color-muted)">${s.nim}</div>`:'-';}},
      {key:'classId',label:'Kelas',render:r=>{const cl=classes.find(x=>x.id===r.classId);const co=cl?courses.find(x=>x.id===cl.courseId):null;return cl?`<div>${cl.code}</div><div style="font-size:10px;color:var(--color-muted)">${co?.name||''}</div>`:'-';}},
      {key:'status',label:'Status KRS',render:r=>statusBadge(r.status)},
      {key:'approvedAt',label:'Tgl Setuju',render:r=>r.approvedAt?formatDate(r.approvedAt):'-'},
      {key:'_act',label:'Aksi',sortable:false,render:r=>r.status==='diajukan'?`
        <button class="btn btn-success btn-sm" data-action="approve" data-id="${r.id}"><i class="bi bi-check2"></i> Setujui</button>
        <button class="btn btn-warning btn-sm" data-action="revise" data-id="${r.id}">Revisi</button>`:
        `<span style="font-size:10px;color:var(--color-muted)">—</span>`},
    ],
    data:enrollments, searchFields:[],
    onRowAction:(action,item)=>{
      if(action==='approve'){DB.update('enrollments',item.id,{status:'disetujui',approvedBy:'lec-1',approvedAt:new Date().toISOString().slice(0,10)});showToast('KRS disetujui.','success');renderKRS(container);}
      if(action==='revise'){DB.update('enrollments',item.id,{status:'perlu revisi'});showToast('KRS dikembalikan untuk revisi.','warning');renderKRS(container);}
    },
  });
}

function renderAttendance(container) {
  const classes   = DB.getAll('classes');
  const students  = DB.getAll('students');
  const attendances = DB.getAll('attendances');
  const cls = classes[0];
  if(!cls){container.innerHTML='<div class="page-container"><p>Tidak ada kelas.</p></div>';return;}
  const enrolled = students.slice(0,6);
  const dates = ['2026-09-15','2026-09-22','2026-09-29','2026-10-06','2026-10-13','2026-10-20'];
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Presensi Mahasiswa</h1></div></div>
  <div class="filter-bar" style="margin-bottom:1rem;border-radius:var(--radius-md)">
    <select class="filter-select"><option>${cls.code} — ${DB.getAll('courses').find(c=>c.id===cls.courseId)?.name||''}</option></select>
    <button class="btn btn-success btn-sm ms-auto" id="save-att"><i class="bi bi-check2"></i> Simpan Presensi (Simulasi)</button>
  </div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead>
          <tr>
            <th>Mahasiswa</th>
            ${dates.map(d=>`<th style="min-width:100px">${new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short'})}</th>`).join('')}
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          ${enrolled.map(s=>{
            const attMap = {};
            attendances.filter(a=>a.classId===cls.id&&a.studentId===s.id).forEach(a=>attMap[a.date]=a.status);
            const hadir = dates.filter(d=>attMap[d]==='hadir').length;
            const pct = Math.round(hadir/dates.length*100);
            return `<tr>
              <td><strong>${s.name}</strong><br><span style="font-size:10px;color:var(--color-muted)">${s.nim}</span></td>
              ${dates.map(d=>`<td>
                <select class="filter-select" style="min-width:80px" data-std="${s.id}" data-date="${d}">
                  <option value="hadir" ${attMap[d]==='hadir'?'selected':''}>Hadir</option>
                  <option value="izin"  ${attMap[d]==='izin' ?'selected':''}>Izin</option>
                  <option value="sakit" ${attMap[d]==='sakit'?'selected':''}>Sakit</option>
                  <option value="alpha" ${!attMap[d]||attMap[d]==='alpha'?'selected':''}>Alpha</option>
                </select></td>`).join('')}
              <td><strong style="color:${pct>=80?'var(--color-success)':pct>=60?'var(--color-warning)':'var(--color-danger)'}">${pct}%</strong></td>
            </tr>`;}).join('')}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
  document.getElementById('save-att')?.addEventListener('click',()=>{showToast('Presensi berhasil disimpan (simulasi).','success');});
}

function renderGrades(container) {
  const classes   = DB.getAll('classes');
  const courses   = DB.getAll('courses');
  const students  = DB.getAll('students');
  const grades    = DB.getAll('grades');
  const cls = classes[0];
  const course = courses.find(c=>c.id===cls?.courseId);
  const enrolled = students.slice(0,5);
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Input Nilai</h1><p class="page-desc">Kelas: ${cls?.code||'-'} — ${course?.name||'-'}</p></div><div class="page-actions"><button class="btn btn-success" id="finalize-grades"><i class="bi bi-check-all"></i> Finalisasi Nilai (Simulasi)</button></div></div>
  <div class="info-box info-box-warning" style="margin-bottom:1rem"><i class="bi bi-info-circle"></i> Bobot: Tugas 20% | Kuis 20% | UTS 30% | UAS 30%</div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Mahasiswa</th><th>Tugas (20%)</th><th>Kuis (20%)</th><th>UTS (30%)</th><th>UAS (30%)</th><th>Nilai Akhir</th><th>Huruf</th><th>Status</th></tr></thead>
        <tbody>
          ${enrolled.map(s=>{
            const g = grades.find(x=>x.studentId===s.id&&x.courseId===cls?.courseId);
            const tugas=g?.tugas||0,kuis=g?.kuis||0,uts=g?.uts||0,uas=g?.uas||0;
            const final=g?.finalScore||(tugas*0.2+kuis*0.2+uts*0.3+uas*0.3).toFixed(1);
            const getL=v=>{if(v>=85)return'A';if(v>=80)return'A-';if(v>=75)return'B+';if(v>=70)return'B';if(v>=65)return'B-';if(v>=60)return'C+';if(v>=55)return'C';if(v>=50)return'D';return'E';};
            return `<tr>
              <td><strong>${s.name}</strong><br><span style="font-size:10px;color:var(--color-muted)">${s.nim}</span></td>
              ${['tugas','kuis','uts','uas'].map(f=>`<td class="grade-input-cell"><input type="number" min="0" max="100" value="${f==='tugas'?tugas:f==='kuis'?kuis:f==='uts'?uts:uas}" data-std="${s.id}" data-field="${f}" class="form-control" style="width:60px;text-align:center;padding:4px"></td>`).join('')}
              <td class="grade-final">${final}</td>
              <td><span class="badge badge-${parseFloat(final)>=70?'success':'danger'}">${getL(parseFloat(final))}</span></td>
              <td>${statusBadge(g?.status||'draft')}</td>
            </tr>`;}).join('')}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
  document.getElementById('finalize-grades')?.addEventListener('click',()=>showToast('Nilai berhasil difinalisasi dan dikunci (simulasi).','success'));
}

function renderTranscript(container) {
  const students = DB.getAll('students');
  const grades   = DB.getAll('grades').filter(g=>g.status==='final');
  const courses  = DB.getAll('courses');
  const s = students.find(x=>x.id==='stu-1');
  if(!s){container.innerHTML='<div class="page-container"><p>Mahasiswa tidak ditemukan.</p></div>';return;}
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Transkrip Nilai</h1></div><div class="page-actions"><button class="btn btn-secondary" onclick="window.print()"><i class="bi bi-printer"></i> Cetak</button></div></div>
  <div class="card" style="max-width:800px;margin:0 auto">
    <div class="card-header">
      <div><div class="page-title" style="font-size:1.1rem">TRANSKRIP NILAI SEMENTARA</div><div style="font-size:var(--text-xs);color:var(--color-muted)">${s.name} — ${s.nim}</div></div>
      <div class="text-right"><div style="font-size:var(--text-xs);color:var(--color-muted)">IPK Kumulatif</div><div style="font-size:1.5rem;font-weight:var(--font-bold);color:var(--color-navy-900)">${s.ipk.toFixed(2)}</div></div>
    </div>
    <div class="card-body">
      <div class="info-box info-box-warning" style="margin-bottom:1rem"><i class="bi bi-exclamation-triangle"></i> Dokumen ini bersifat sementara dan merupakan simulasi demo.</div>
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Nilai</th><th>Huruf</th><th>Poin Mutu</th></tr></thead>
          <tbody>
            ${grades.filter(g=>g.studentId===s.id).map(g=>{const co=courses.find(c=>c.id===g.courseId);return`<tr><td><code>${co?.code||'-'}</code></td><td>${co?.name||'-'}</td><td>${g.sks}</td><td>${g.finalScore?.toFixed(1)||'-'}</td><td><strong>${g.letterGrade||'-'}</strong></td><td>${(g.mutu||0).toFixed(1)}</td></tr>`;}).join('')}
            <tr style="background:var(--color-navy-50);font-weight:var(--font-bold)"><td colspan="2">Total / IPK</td><td>${grades.filter(g=>g.studentId===s.id).reduce((t,g)=>t+g.sks,0)}</td><td colspan="2"></td><td>${s.ipk.toFixed(2)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>`;
}

function renderKHS(container) {
  const students = DB.getAll('students');
  const grades   = DB.getAll('grades').filter(g=>g.semesterId==='sem-3');
  const courses  = DB.getAll('courses');
  const s = students.find(x=>x.id==='stu-1');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Kartu Hasil Studi (KHS)</h1></div><div class="page-actions"><button class="btn btn-secondary" onclick="window.print()"><i class="bi bi-printer"></i> Cetak</button></div></div>
  <div class="card" style="max-width:700px">
    <div class="card-header"><h3 class="card-title">KHS Semester Ganjil 2025/2026 — ${s?.name||''}</h3></div>
    <div class="card-body">
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Nilai</th><th>Huruf</th><th>Mutu</th></tr></thead>
          <tbody>
            ${grades.filter(g=>g.studentId==='stu-1').map(g=>{const co=courses.find(c=>c.id===g.courseId);return`<tr><td><code>${co?.code||'-'}</code></td><td>${co?.name||'-'}</td><td>${g.sks}</td><td>${g.finalScore?.toFixed(1)||'-'}</td><td><strong>${g.letterGrade||'-'}</strong></td><td>${(g.mutu||0).toFixed(1)}</td></tr>`;}).join('')}
            <tr style="background:var(--color-gold-50);font-weight:var(--font-bold)"><td colspan="2">IP Semester</td><td>6</td><td colspan="2"></td><td>3.5</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>`;
}

function renderLearningAssignments(container) {
  const classes = DB.getAll('classes');
  const courses = DB.getAll('courses');
  const upcoming = classes.slice(0, 4).map((item, index) => ({
    classCode: item.code,
    course: courses.find(course => course.id === item.courseId)?.name || '-',
    type: index % 2 === 0 ? 'Tugas' : 'Ujian',
    dueDate: ['2026-10-28', '2026-11-02', '2026-11-05', '2026-11-12'][index],
    status: index === 2 ? 'draft' : 'terjadwal',
  }));
  if (!upcoming.length) {
    container.innerHTML = renderAcademicEmptyState('Tugas & Ujian', 'Jadwal tugas, kuis, dan ujian per kelas.', 'Belum ada agenda tugas atau ujian pada data demo.');
    return;
  }
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Tugas & Ujian</h1><p class="page-desc">Agenda penugasan dan evaluasi kelas yang akan berjalan</p></div></div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Kelas</th><th>Mata Kuliah</th><th>Tipe</th><th>Jadwal</th><th>Status</th></tr></thead>
        <tbody>${upcoming.map(item => `
          <tr>
            <td><strong>${item.classCode}</strong></td>
            <td>${item.course}</td>
            <td>${statusBadge(item.type.toLowerCase())}</td>
            <td>${formatDate(item.dueDate)}</td>
            <td>${statusBadge(item.status)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
}

function renderLearningEvaluation(container) {
  const lecturers = DB.getAll('lecturers');
  const rows = lecturers.slice(0, 6).map((lecturer, index) => ({
    lecturer: lecturer.name,
    courseLoad: lecturer.classCount,
    responseRate: 68 + index * 4,
    score: (4.1 + (index % 3) * 0.2).toFixed(1),
    status: index === 4 ? 'perlu tindak lanjut' : 'normal',
  }));
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Evaluasi Dosen</h1><p class="page-desc">Ringkasan evaluasi pembelajaran berdasarkan respon mahasiswa</p></div></div>
  <div id="learning-evaluation-table"></div>
</div>`;
  new DataTable({
    containerId:'learning-evaluation-table',
    columns:[
      {key:'lecturer',label:'Dosen'},
      {key:'courseLoad',label:'Kelas Aktif'},
      {key:'responseRate',label:'Response Rate',render:r=>`${r.responseRate}%`},
      {key:'score',label:'Skor Rata-rata'},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:rows,
    searchFields:['lecturer','status'],
  });
}

// ===================== THESIS =====================
export function renderThesis(path, container) {
  if (path.includes('/topics')) return renderThesisTopics(container);
  if (path.includes('/supervision')) return renderThesisSupervision(container);
  if (path.includes('/defense')) return renderThesisDefense(container);
  return renderThesisOverview(container);
}

function renderThesisOverview(container) {
  const theses    = DB.getAll('theses');
  const students  = DB.getAll('students');
  const lecturers = DB.getAll('lecturers');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Skripsi & Tugas Akhir</h1><p class="page-desc">${theses.length} tugas akhir aktif</p></div><div class="page-actions"><button class="btn btn-accent"><i class="bi bi-plus-lg"></i> Ajukan Topik</button></div></div>
  ${theses.map(t=>{
    const s = students.find(x=>x.id===t.studentId);
    const sup = lecturers.find(l=>l.id===t.supervisorId);
    const stages = ['Pengajuan Topik','Proposal','Seminar','Bimbingan','Sidang','Selesai'];
    const stageIdx = stages.indexOf(t.stage);
    return`
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-header">
        <div><div style="font-weight:var(--font-bold)">${s?.name||'-'} (${s?.nim||'-'})</div><div style="font-size:var(--text-xs);color:var(--color-muted)">Pembimbing: ${sup?.name||'-'}</div></div>
        <span class="badge badge-${t.status==='aktif'?'active':'warning'}">${t.status}</span>
      </div>
      <div class="card-body">
        <p style="font-size:var(--text-sm);font-style:italic;margin-bottom:1rem">"${t.title}"</p>
        <div class="workflow-steps" style="margin-bottom:1rem">
          ${stages.map((st,i)=>`<div class="workflow-step ${i<stageIdx?'done':i===stageIdx?'active':''}">
            <div class="workflow-step-icon">${i<stageIdx?'<i class="bi bi-check2"></i>':(i+1)}</div>
            <div class="workflow-step-label">${st}</div>
          </div>`).join('')}
        </div>
        <p style="font-size:var(--text-xs);color:var(--color-muted)">${t.notes}</p>
        <div style="margin-top:0.75rem;display:flex;gap:0.5rem">
          <button class="btn btn-secondary btn-sm"><i class="bi bi-chat-left-dots"></i> Catatan Bimbingan</button>
          <button class="btn btn-primary btn-sm" onclick="showToast('Status diperbarui (simulasi).','gold')"><i class="bi bi-arrow-right-circle"></i> Update Status</button>
        </div>
      </div>
    </div>`;}).join('')}
</div>`;
}

function renderThesisTopics(container) {
  const theses = DB.getAll('theses');
  const students = DB.getAll('students');
  const prodi = DB.getAll('studyPrograms');
  const rows = theses
    .filter(item => ['Pengajuan Topik', 'Proposal'].includes(item.stage) || item.status === 'menunggu review')
    .map(item => ({
      student: students.find(student => student.id === item.studentId)?.name || '-',
      nim: students.find(student => student.id === item.studentId)?.nim || '-',
      prodi: prodi.find(program => program.id === item.prodiId)?.name || '-',
      title: item.title,
      submittedAt: item.topicDate,
      status: item.status,
    }));
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Pengajuan Topik</h1><p class="page-desc">Daftar topik yang baru diajukan atau masih dalam tahap proposal</p></div></div>
  <div id="thesis-topic-table"></div>
</div>`;
  new DataTable({
    containerId:'thesis-topic-table',
    columns:[
      {key:'nim',label:'NIM',render:r=>`<code>${r.nim}</code>`},
      {key:'student',label:'Mahasiswa'},
      {key:'prodi',label:'Prodi'},
      {key:'title',label:'Topik'},
      {key:'submittedAt',label:'Tgl. Pengajuan',render:r=>formatDate(r.submittedAt)},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:rows,
    searchFields:['student','nim','prodi','title'],
  });
}

function renderThesisSupervision(container) {
  const theses = DB.getAll('theses');
  const students = DB.getAll('students');
  const lecturers = DB.getAll('lecturers');
  const rows = theses
    .filter(item => ['Bimbingan', 'Seminar'].includes(item.stage))
    .map(item => ({
      student: students.find(student => student.id === item.studentId)?.name || '-',
      supervisor: lecturers.find(lecturer => lecturer.id === item.supervisorId)?.name || '-',
      stage: item.stage,
      updatedAt: item.updatedAt,
      note: item.notes,
    }));
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Bimbingan Tugas Akhir</h1><p class="page-desc">Progress mahasiswa yang sedang aktif dibimbing</p></div></div>
  <div id="thesis-supervision-table"></div>
</div>`;
  new DataTable({
    containerId:'thesis-supervision-table',
    columns:[
      {key:'student',label:'Mahasiswa'},
      {key:'supervisor',label:'Pembimbing'},
      {key:'stage',label:'Tahap',render:r=>statusBadge(r.stage)},
      {key:'updatedAt',label:'Update Terakhir',render:r=>formatDate(r.updatedAt)},
      {key:'note',label:'Catatan',sortable:false},
    ],
    data:rows,
    searchFields:['student','supervisor','note'],
  });
}

function renderThesisDefense(container) {
  const theses = DB.getAll('theses');
  const students = DB.getAll('students');
  const lecturers = DB.getAll('lecturers');
  const rows = theses
    .filter(item => ['Seminar', 'Sidang', 'Selesai'].includes(item.stage))
    .map(item => ({
      student: students.find(student => student.id === item.studentId)?.name || '-',
      supervisor: lecturers.find(lecturer => lecturer.id === item.supervisorId)?.name || '-',
      stage: item.stage,
      seminarDate: item.seminarDate,
      defenseDate: item.defenseDate,
      status: item.status,
    }));
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Seminar & Sidang</h1><p class="page-desc">Jadwal dan status tahapan seminar hasil maupun sidang akhir</p></div></div>
  <div id="thesis-defense-table"></div>
</div>`;
  new DataTable({
    containerId:'thesis-defense-table',
    columns:[
      {key:'student',label:'Mahasiswa'},
      {key:'supervisor',label:'Pembimbing'},
      {key:'stage',label:'Tahap',render:r=>statusBadge(r.stage)},
      {key:'seminarDate',label:'Seminar',render:r=>r.seminarDate ? formatDate(r.seminarDate) : '-'},
      {key:'defenseDate',label:'Sidang',render:r=>r.defenseDate ? formatDate(r.defenseDate) : '-'},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:rows,
    searchFields:['student','supervisor','stage'],
  });
}

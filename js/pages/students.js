/**
 * SIAKAD — Mahasiswa Page (Data Mahasiswa + CRUD Demo)
 */

import { DB } from '../data/seed.js';
import { AppState } from '../state.js';
import { formatDate, statusBadge, exportCSV, generateId, today } from '../utils.js';
import { DataTable } from '../components/data-table.js';
import { openFormModal } from '../components/modal.js';
import { showToast, showConfirm } from '../components/toast.js';
import { renderComingSoon } from '../ui-helpers.js';
import { renderStaffRegistration } from './registration.js';

let _table;


export function renderStudents(path, container) {
  if (path.includes('/registration')) {
    return renderStaffRegistration(path, container);
  }

  // Sub-route dispatch
  const subRoutes = ['/academic-status','/leave','/scholarships','/letters','/graduation','/commencement','/alumni'];
  const sub = subRoutes.find(r => path.includes(r));
  if (sub) {
    const labels = {
      '/academic-status':'Status Akademik','/leave':'Cuti & Aktif Kembali',
      '/scholarships':'Beasiswa & Keringanan','/letters':'Surat Akademik','/graduation':'Yudisium',
      '/commencement':'Wisuda','/alumni':'Alumni',
    };
    container.innerHTML = renderComingSoon(labels[sub] || 'Mahasiswa', 'Mahasiswa', path);
    return;
  }

  const campuses     = DB.getAll('campuses');
  const faculties    = DB.getAll('faculties');
  const studyPrograms= DB.getAll('studyPrograms');

  const campusOpts = [{ value: 'all', label: 'Semua Kampus' }, ...campuses.map(c => ({ value: c.id, label: c.name }))];
  const statusOpts = [{ value: 'all', label: 'Semua Status' }, ...['aktif','cuti','nonaktif','lulus','dropout'].map(s => ({ value: s, label: s.charAt(0).toUpperCase()+s.slice(1) }))];
  const prodiOpts  = [{ value: 'all', label: 'Semua Prodi' }, ...studyPrograms.map(p => ({ value: p.id, label: p.name }))];
  const yearOpts   = [{ value: 'all', label: 'Semua Angkatan' }, ...[2021,2022,2023,2024,2025].map(y => ({ value: String(y), label: String(y) }))];

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Data Mahasiswa</h1>
      <p class="page-desc">Kelola data seluruh mahasiswa lintas kampus dan program studi</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-secondary" id="exp-csv"><i class="bi bi-download"></i> Export CSV</button>
      <button class="btn btn-accent" id="add-student-btn"><i class="bi bi-plus-lg"></i> Tambah Mahasiswa</button>
    </div>
  </div>

  <!-- Stats -->
  <div class="kpi-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:1.5rem">
    ${buildStatusKPIs(DB.getAll('students'))}
  </div>

  <!-- Filter Bar -->
  <div class="filter-bar" style="margin-bottom:0;border-radius:var(--radius-lg) var(--radius-lg) 0 0">
    <div class="search-input" style="min-width:200px;flex:1">
      <i class="bi bi-search"></i>
      <input type="text" id="student-search" placeholder="Cari nama, NIM, email...">
    </div>
    <select class="filter-select" id="campus-filter">${campusOpts.map(o=>`<option value="${o.value}">${o.label}</option>`).join('')}</select>
    <select class="filter-select" id="prodi-filter">${prodiOpts.map(o=>`<option value="${o.value}">${o.label}</option>`).join('')}</select>
    <select class="filter-select" id="status-filter">${statusOpts.map(o=>`<option value="${o.value}">${o.label}</option>`).join('')}</select>
    <select class="filter-select" id="year-filter">${yearOpts.map(o=>`<option value="${o.value}">${o.label}</option>`).join('')}</select>
    <button class="btn btn-secondary btn-sm" id="clear-filters">Reset</button>
  </div>

  <div id="students-table"></div>
</div>`;

  buildTable(studyPrograms, campuses, faculties);
  bindEvents(studyPrograms, campuses);
}

function buildStatusKPIs(students) {
  const counts = {
    'Total': students.length,
    'Aktif': students.filter(s=>s.status==='aktif').length,
    'Cuti': students.filter(s=>s.status==='cuti').length,
    'Nonaktif': students.filter(s=>s.status==='nonaktif').length,
    'Lulus': students.filter(s=>s.status==='lulus').length,
  };
  const colors = { 'Total':'navy','Aktif':'success','Cuti':'warning','Nonaktif':'danger','Lulus':'muted' };
  const icons  = { 'Total':'bi-people','Aktif':'bi-person-check','Cuti':'bi-pause-circle','Nonaktif':'bi-person-x','Lulus':'bi-mortarboard' };
  return Object.entries(counts).map(([k,v]) => `
    <div class="kpi-card kpi-card-${colors[k]}">
      <div class="kpi-icon" style="width:36px;height:36px;font-size:1rem"><i class="bi ${icons[k]}"></i></div>
      <div class="kpi-value">${v}</div>
      <div class="kpi-label">${k}</div>
    </div>`).join('');
}

function buildTable(studyPrograms, campuses, faculties) {
  const students = DB.getAll('students');

  const columns = [
    { key: 'nim', label: 'NIM', render: r => `<strong>${r.nim}</strong>` },
    { key: 'name', label: 'Nama Mahasiswa', render: r => `<div>${r.name}</div><div style="font-size:10px;color:var(--color-muted)">${r.email}</div>` },
    { key: 'campusId', label: 'Kampus', render: r => campuses.find(c=>c.id===r.campusId)?.code || '-' },
    { key: 'prodiId', label: 'Program Studi', render: r => {
      const p = studyPrograms.find(x=>x.id===r.prodiId);
      return p ? `<div>${p.name}</div><span class="badge badge-navy" style="font-size:9px">${p.degree}</span>` : '-';
    }},
    { key: 'angkatan', label: 'Angk.' },
    { key: 'semester', label: 'Sem.' },
    { key: 'ipk', label: 'IPK', render: r => `<strong style="color:${r.ipk>=3.5?'var(--color-success)':r.ipk>=2.5?'var(--color-warning)':'var(--color-danger)'}">${r.ipk?.toFixed(2)||'-'}</strong>` },
    { key: 'status', label: 'Status', render: r => statusBadge(r.status) },
    { key: 'paymentStatus', label: 'Tagihan', render: r => statusBadge(r.paymentStatus) },
    { key: '_actions', label: 'Aksi', sortable: false, render: r => `
      <div class="row-actions">
        <button class="btn btn-secondary btn-icon btn-sm" data-action="view" data-id="${r.id}" title="Detail"><i class="bi bi-eye"></i></button>
        <button class="btn btn-secondary btn-icon btn-sm" data-action="edit" data-id="${r.id}" title="Edit"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-outline-danger btn-icon btn-sm" data-action="delete" data-id="${r.id}" title="Hapus"><i class="bi bi-trash"></i></button>
      </div>` },
  ];

  _table = new DataTable({
    containerId: 'students-table',
    columns,
    data: students,
    searchFields: ['nim','name','email'],
    defaultSort: 'nim',
    onRowAction: handleRowAction,
  });
}

function handleRowAction(action, student) {
  const studyPrograms = DB.getAll('studyPrograms');
  const campuses = DB.getAll('campuses');
  const lecturers = DB.getAll('lecturers');
  const invoices  = DB.getAll('invoices').filter(i=>i.studentId===student.id);
  const prodi = studyPrograms.find(p=>p.id===student.prodiId);
  const campus = campuses.find(c=>c.id===student.campusId);
  const advisor = lecturers.find(l=>l.id===student.advisor);

  if (action === 'view') {
    const { openModal } = window._siakad?.modal || {};
    import('../components/modal.js').then(({ openModal }) => {
      openModal({
        title: `Detail Mahasiswa — ${student.nim}`, size: 'lg',
        body: `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            <div>
              <div style="background:linear-gradient(135deg,var(--color-navy-900),var(--color-navy-700));border-radius:12px;padding:1.5rem;color:white;margin-bottom:1rem">
                <div class="student-nim">${student.nim}</div>
                <div class="student-name">${student.name}</div>
                <div class="student-prodi">${prodi?.name || '-'} · ${campus?.code || '-'}</div>
                <div style="margin-top:1rem;display:flex;gap:1.5rem">
                  <div><div style="font-size:1.5rem;font-weight:700;font-family:var(--font-heading);color:#ffffff">${student.ipk?.toFixed(2)||'-'}</div><div style="font-size:10px;opacity:0.55;letter-spacing:0.5px">IPK</div></div>
                  <div><div style="font-size:1.5rem;font-weight:700;font-family:var(--font-heading);color:#ffffff">Sem. ${student.semester}</div><div style="font-size:10px;opacity:0.55;letter-spacing:0.5px">Semester</div></div>
                  <div><div style="font-size:1.5rem;font-weight:700;font-family:var(--font-heading);color:#ffffff">${student.angkatan}</div><div style="font-size:10px;opacity:0.55;letter-spacing:0.5px">Angkatan</div></div>
                </div>
              </div>
              <div class="stat-row"><span class="stat-row-label">Status</span><span class="stat-row-value">${statusBadge(student.status)}</span></div>
              <div class="stat-row"><span class="stat-row-label">Gender</span><span class="stat-row-value">${student.gender==='L'?'Laki-laki':'Perempuan'}</span></div>
              <div class="stat-row"><span class="stat-row-label">Tgl Lahir</span><span class="stat-row-value">${formatDate(student.dob)}</span></div>
              <div class="stat-row"><span class="stat-row-label">Email</span><span class="stat-row-value">${student.email}</span></div>
              <div class="stat-row"><span class="stat-row-label">No. HP</span><span class="stat-row-value">${student.phone}</span></div>
              <div class="stat-row"><span class="stat-row-label">Dosen Wali</span><span class="stat-row-value">${advisor?.name||'-'}</span></div>
            </div>
            <div>
              <div class="info-box info-box-success" style="margin-bottom:1rem">
                <i class="bi bi-info-circle"></i> Status Keuangan: <strong>${student.paymentStatus}</strong>
              </div>
              <h6 style="font-size:var(--text-sm);font-weight:var(--font-semibold);margin-bottom:0.75rem">Tagihan Terbaru</h6>
              ${invoices.length ? invoices.slice(0,3).map(i=>`
                <div class="stat-row">
                  <span class="stat-row-label">${i.period}</span>
                  <span class="stat-row-value">${statusBadge(i.status)}</span>
                </div>`).join('') : '<p style="font-size:var(--text-xs);color:var(--color-muted)">Tidak ada tagihan.</p>'}
              <div style="margin-top:1rem">
                <button class="btn btn-secondary btn-sm" onclick="location.hash='#/finance/invoices'">Lihat Semua Tagihan</button>
                <button class="btn btn-secondary btn-sm" onclick="location.hash='#/learning/krs'">Lihat KRS</button>
              </div>
            </div>
          </div>`,
      });
    });
  }

  if (action === 'edit') {
    const studyPrograms = DB.getAll('studyPrograms');
    const campuses = DB.getAll('campuses');
    openFormModal({
      title: `Edit Mahasiswa — ${student.nim}`,
      fields: [
        { key: 'nim', label: 'NIM', required: true },
        { key: 'name', label: 'Nama Lengkap', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'phone', label: 'No. HP', required: true },
        { key: 'status', label: 'Status', type: 'select', required: true, options: ['aktif','cuti','nonaktif','lulus','dropout'].map(s=>({value:s,label:s.charAt(0).toUpperCase()+s.slice(1)})) },
        { key: 'semester', label: 'Semester', type: 'number', required: true },
        { key: 'ipk', label: 'IPK', type: 'number', hint: 'Otomatis dihitung dari nilai, field ini hanya untuk demo' },
      ],
      values: student,
      onSave: (data, close) => {
        DB.update('students', student.id, { ...data, semester: parseInt(data.semester), ipk: parseFloat(data.ipk)||student.ipk });
        DB.log('Edit Data', 'Mahasiswa', `${data.name} (${data.nim})`);
        close();
        showToast(`Data mahasiswa ${data.name} berhasil diperbarui.`, 'success');
        _table?.setData(DB.getAll('students'));
      },
    });
  }

  if (action === 'delete') {
    showConfirm({
      title: 'Hapus Mahasiswa',
      message: `Yakin ingin menghapus data mahasiswa <strong>${student.name}</strong>? Tindakan ini tidak dapat dibatalkan (demo).`,
      type: 'danger', confirmText: 'Ya, Hapus',
    }).then(ok => {
      if (ok) {
        DB.delete('students', student.id);
        DB.log('Hapus Data', 'Mahasiswa', `${student.name} (${student.nim})`);
        showToast(`Mahasiswa ${student.name} berhasil dihapus (simulasi demo).`, 'warning');
        _table?.setData(DB.getAll('students'));
      }
    });
  }
}

function bindEvents(studyPrograms, campuses) {
  const search = document.getElementById('student-search');
  const campusF = document.getElementById('campus-filter');
  const prodiF  = document.getElementById('prodi-filter');
  const statusF = document.getElementById('status-filter');
  const yearF   = document.getElementById('year-filter');

  let debTimer;
  search?.addEventListener('input', e => {
    clearTimeout(debTimer);
    debTimer = setTimeout(() => _table?.search(e.target.value), 250);
  });

  campusF?.addEventListener('change', () => { _table?.filter('campusId', campusF.value); });
  prodiF?.addEventListener('change',  () => { _table?.filter('prodiId',  prodiF.value);  });
  statusF?.addEventListener('change', () => { _table?.filter('status',   statusF.value); });
  yearF?.addEventListener('change',   () => { _table?.filter('angkatan', yearF.value);   });

  document.getElementById('clear-filters')?.addEventListener('click', () => {
    [search, campusF, prodiF, statusF, yearF].forEach(el => { if(el) el.value = el.tagName==='SELECT'?el.options[0].value:''; });
    _table?.clearFilters();
  });

  document.getElementById('exp-csv')?.addEventListener('click', () => {
    exportCSV(DB.getAll('students'), 'mahasiswa', [
      {key:'nim',label:'NIM'},{key:'name',label:'Nama'},{key:'email',label:'Email'},
      {key:'campusId',label:'Kampus'},{key:'angkatan',label:'Angkatan'},
      {key:'semester',label:'Semester'},{key:'status',label:'Status'},{key:'ipk',label:'IPK'},
    ]);
    showToast('File CSV mahasiswa berhasil diekspor.', 'success');
  });

  document.getElementById('add-student-btn')?.addEventListener('click', () => {
    openFormModal({
      title: 'Tambah Mahasiswa Baru',
      fields: [
        { key: 'nim', label: 'NIM', required: true, placeholder: 'Contoh: 2024TIF001' },
        { key: 'name', label: 'Nama Lengkap', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'phone', label: 'No. HP', required: true },
        { key: 'dob', label: 'Tanggal Lahir', type: 'date', required: true },
        { key: 'gender', label: 'Jenis Kelamin', type: 'select', required: true, options: [{value:'L',label:'Laki-laki'},{value:'P',label:'Perempuan'}] },
        { key: 'campusId', label: 'Kampus', type: 'select', required: true, options: campuses.map(c=>({value:c.id,label:c.name})) },
        { key: 'prodiId', label: 'Program Studi', type: 'select', required: true, options: studyPrograms.map(p=>({value:p.id,label:p.name})) },
        { key: 'angkatan', label: 'Angkatan', type: 'number', required: true, default: new Date().getFullYear() },
        { key: 'status', label: 'Status', type: 'select', required: true, options: [{value:'aktif',label:'Aktif'}], default: 'aktif' },
      ],
      onSave: (data, close) => {
        const newStudent = {
          ...data,
          id: generateId('stu'),
          angkatan: parseInt(data.angkatan),
          semester: 1, ipk: 0,
          paymentStatus: 'belum bayar',
          advisor: null,
        };
        DB.add('students', newStudent);
        DB.log('Tambah Data', 'Mahasiswa', `${data.name} (${data.nim})`);
        close();
        showToast(`Mahasiswa ${data.name} berhasil ditambahkan.`, 'success');
        _table?.setData(DB.getAll('students'));
      },
    });
  });
}

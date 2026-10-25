/**
 * SIAKAD — PMB (Penerimaan Mahasiswa Baru) Pages
 */

import { DB } from '../data/seed.js';
import { AppState } from '../state.js?v=20261025ab';
import { formatDate, statusBadge, exportCSV, generateId, today } from '../utils.js';
import { DataTable } from '../components/data-table.js';
import { openFormModal } from '../components/modal.js';
import { showToast, showConfirm } from '../components/toast.js';
import { createBarChart, createDoughnutChart } from '../components/charts.js';
import { scopeRows, scopeCampuses, scopeStudyPrograms } from '../campus-scope.js';

let _table;

const getScopedAdmissions = () => scopeRows(DB.getAll('admissions'));
const getScopedCampuses = () => scopeCampuses(DB.getAll('campuses'));
const getScopedPrograms = () => scopeStudyPrograms(DB.getAll('studyPrograms'));

export function renderAdmissions(path, container) {
  if (path.includes('/dashboard')) return renderPmbDashboard(container);
  if (path.includes('/periods')) return renderPeriods(container);
  if (path.includes('/verification')) return renderVerification(container);
  if (path.includes('/selection')) return renderSelection(container);
  if (path.includes('/re-registration')) return renderReRegistration(container);
  if (path.includes('/convert')) return renderConvert(container);
  if (path.includes('/reports')) return renderPmbReports(container);
  renderApplicants(path, container);
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Kode NIM demo: {tahun}{kodeProdi}{seq 3 digit} */
function generateNim(prodiId, angkatan = 2026) {
  const prodi = DB.getById('studyPrograms', prodiId);
  const code = (prodi?.code || 'XX').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 4);
  const prefix = `${angkatan}${code}`;
  const students = DB.getAll('students');
  let maxSeq = 0;
  students.forEach(s => {
    if (!s.nim?.startsWith(prefix)) return;
    const seq = parseInt(s.nim.slice(prefix.length), 10);
    if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq;
  });
  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
}

function defaultAdvisor(prodiId) {
  const lec = DB.getAll('lecturers').find(l => l.prodiId === prodiId && l.status === 'aktif');
  return lec?.id || null;
}

function campusEmailDomain(campusId) {
  const map = { 'campus-1': 'mhs.ucj.ac.id', 'campus-2': 'mhs.itc.ac.id', 'campus-3': 'mhs.stbc.ac.id' };
  return map[campusId] || 'mhs.demo.ac.id';
}

function slugName(name) {
  return String(name || 'mhs')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '')
    .slice(0, 40) || 'mhs';
}

/**
 * Konversi pendaftar ? mahasiswa (PMB-010).
 * @returns {{ ok: boolean, student?: object, msg: string }}
 */
export function convertApplicantToStudent(admission, opts = {}) {
  if (!admission) return { ok: false, msg: 'Pendaftar tidak ditemukan.' };
  if (admission.status !== 'daftar ulang' && !opts.force) {
    return { ok: false, msg: `Status harus "daftar ulang" (saat ini: ${admission.status}).` };
  }
  if (admission.studentId) {
    const existing = DB.getById('students', admission.studentId);
    if (existing) return { ok: false, msg: `Sudah dikonversi menjadi ${existing.nim}.`, student: existing };
  }
  if (admission.paymentStatus !== 'lunas' && opts.requirePayment !== false) {
    return { ok: false, msg: 'Pembayaran daftar ulang / UKT belum lunas (demo).' };
  }

  const prodiId = opts.prodiId || admission.finalProdiId || admission.prodiId;
  const prodi = DB.getById('studyPrograms', prodiId);
  if (!prodi) return { ok: false, msg: 'Program studi tidak valid.' };

  const angkatan = opts.angkatan || 2026;
  const nim = opts.nim || generateNim(prodiId, angkatan);
  if (DB.getAll('students').some(s => s.nim === nim)) {
    return { ok: false, msg: `NIM ${nim} sudah dipakai.` };
  }

  const student = {
    id: generateId('stu'),
    nim,
    name: admission.name,
    campusId: admission.campusId || prodi.campusId,
    facultyId: prodi.facultyId,
    prodiId,
    angkatan,
    semester: 1,
    status: 'aktif',
    ipk: 0,
    advisor: defaultAdvisor(prodiId),
    email: `${slugName(admission.name)}@${campusEmailDomain(admission.campusId || prodi.campusId)}`,
    phone: admission.phone || '',
    paymentStatus: 'lunas',
    dob: admission.dob || '2007-01-01',
    gender: admission.gender || 'L',
    address: admission.address || '',
    admissionId: admission.id,
    createdAt: today(),
  };

  DB.add('students', student);

  // Registrasi semester awal (Belum Registrasi) agar alur portal siap
  const regs = DB.getAll('semesterRegistrations');
  if (!regs.some(r => r.studentId === student.id && r.semesterId === 'sem-1')) {
    regs.push({
      id: generateId('sreg'),
      studentId: student.id,
      semesterId: 'sem-1',
      status: 'Belum Registrasi',
      submittedAt: null,
      updatedAt: null,
      note: '',
      staffId: null,
      dispensationRef: null,
      history: [],
    });
    DB.save('semesterRegistrations', regs);
  }

  DB.update('admissions', admission.id, {
    status: 'menjadi mahasiswa',
    studentId: student.id,
    nim,
    convertedAt: new Date().toISOString(),
    finalProdiId: prodiId,
    prodiId,
    prodiName: prodi.name,
  });

  DB.log('PMB: Konversi Mahasiswa', 'PMB', `${admission.regNum} ? ${nim} (${student.name})`);
  DB.addNotif(
    'success',
    'Mahasiswa baru dari PMB',
    `${student.name} dikonversi dengan NIM ${nim}.`,
    '#/students',
    ['admin', 'baak', 'academic-staff']
  );

  return { ok: true, student, msg: `Berhasil: ${student.name} ? NIM ${nim}` };
}

function confirmReRegistration(admission, { finalProdiId, note = '' } = {}) {
  if (!admission) return { ok: false, msg: 'Pendaftar tidak ditemukan.' };
  if (admission.status !== 'lulus seleksi') {
    return { ok: false, msg: `Hanya status "lulus seleksi" yang dapat daftar ulang (saat ini: ${admission.status}).` };
  }
  const prodiId = finalProdiId || admission.prodiId;
  const prodi = DB.getById('studyPrograms', prodiId);
  if (!prodi) return { ok: false, msg: 'Program studi tidak valid.' };
  if (admission.paymentStatus !== 'lunas') {
    return { ok: false, msg: 'Biaya pendaftaran belum lunas. Selesaikan pembayaran simulasi dulu.' };
  }

  DB.update('admissions', admission.id, {
    status: 'daftar ulang',
    finalProdiId: prodiId,
    prodiId,
    prodiName: prodi.name,
    reRegisteredAt: new Date().toISOString(),
    reRegisterNote: note || 'Daftar ulang dicatat petugas PMB (demo).',
  });
  DB.log('PMB: Daftar Ulang', 'PMB', `${admission.regNum} — ${admission.name} ? ${prodi.name}`);
  return { ok: true, msg: `Daftar ulang ${admission.name} tercatat.` };
}

// ---- Applicants List ----
function renderApplicants(path, container) {
  const campuses = getScopedCampuses();
  const admissions = getScopedAdmissions();

  const statusOpts = ['all','draft','dikirim','menunggu verifikasi','terverifikasi','perlu perbaikan','menunggu seleksi','lulus seleksi','tidak lulus','daftar ulang','menjadi mahasiswa'].map(s=>({value:s,label:s==='all'?'Semua Status':s.charAt(0).toUpperCase()+s.slice(1)}));
  const campusOpts = [{value:'all',label:'Semua Kampus'}, ...campuses.map(c=>({value:c.id,label:c.name}))];

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">PMB — Daftar Pendaftar</h1>
      <p class="page-desc">Kelola data calon mahasiswa baru Tahun Akademik 2026/2027</p>
    </div>
    <div class="page-actions">
      <a href="#/admissions/dashboard" class="btn btn-secondary"><i class="bi bi-speedometer2"></i> Dashboard PMB</a>
      <a href="#/pmb" class="btn btn-secondary" target="_self"><i class="bi bi-globe"></i> Portal Publik PMB</a>
      <button class="btn btn-secondary" id="exp-csv"><i class="bi bi-download"></i> Export</button>
      <button class="btn btn-accent" id="add-btn"><i class="bi bi-plus-lg"></i> Tambah Pendaftar</button>
    </div>
  </div>

  <!-- Workflow Steps -->
  <div class="card" style="margin-bottom:1.5rem">
    <div class="card-body-sm">
      <div class="workflow-steps">
        ${[
          {label:'Daftar Online',step:1,done:true},
          {label:'Bayar Biaya Daftar',step:2,done:true},
          {label:'Upload Dokumen',step:3,done:true},
          {label:'Verifikasi Admin',step:4,active:true},
          {label:'Tes Seleksi',step:5},
          {label:'Pengumuman',step:6},
          {label:'Daftar Ulang',step:7},
          {label:'Menjadi Mahasiswa',step:8},
        ].map(s=>`
          <div class="workflow-step ${s.done?'done':s.active?'active':''}">
            <div class="workflow-step-icon">${s.done?'<i class="bi bi-check2"></i>':s.step}</div>
            <div class="workflow-step-label">${s.label}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- KPIs -->
  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:1.5rem">
    ${buildPmbKPIs(admissions)}
  </div>

  <!-- Filters -->
  <div class="filter-bar" style="border-radius:var(--radius-lg) var(--radius-lg) 0 0;margin-bottom:0">
    <div class="search-input" style="flex:1;min-width:180px">
      <i class="bi bi-search"></i>
      <input type="text" id="adm-search" placeholder="Cari nama, no. daftar...">
    </div>
    <select class="filter-select" id="campus-f">${campusOpts.map(o=>`<option value="${o.value}">${o.label}</option>`).join('')}</select>
    <select class="filter-select" id="status-f">${statusOpts.map(o=>`<option value="${o.value}">${o.label}</option>`).join('')}</select>
    <button class="btn btn-secondary btn-sm" id="clear-f">Reset</button>
  </div>
  <div id="adm-table"></div>
</div>`;

  buildAdmTable(campuses);
  bindAdmEvents(campuses);
}

function buildPmbKPIs(admissions) {
  const data = [
    { label: 'Total Pendaftar', value: admissions.length, icon: 'bi-people', color: 'navy' },
    { label: 'Menunggu Verifikasi', value: admissions.filter(a=>['menunggu verifikasi','dikirim'].includes(a.status)).length, icon: 'bi-clock-history', color: 'warning' },
    { label: 'Lulus Seleksi', value: admissions.filter(a=>['lulus seleksi','daftar ulang','menjadi mahasiswa'].includes(a.status)).length, icon: 'bi-patch-check', color: 'success' },
    { label: 'Sudah Jadi Mahasiswa', value: admissions.filter(a=>a.status==='menjadi mahasiswa').length, icon: 'bi-mortarboard', color: 'gold' },
  ];
  return data.map(d=>`
    <div class="kpi-card kpi-card-${d.color}">
      <div class="kpi-icon" style="width:36px;height:36px;font-size:1rem"><i class="bi ${d.icon}"></i></div>
      <div class="kpi-value">${d.value}</div>
      <div class="kpi-label">${d.label}</div>
    </div>`).join('');
}

function renderPeriods(container) {
  const admissions = getScopedAdmissions();
  const pathSummary = Object.entries(admissions.reduce((acc, item) => {
    acc[item.path] = (acc[item.path] || 0) + 1;
    return acc;
  }, {}));
  const activePeriod = {
    name: 'PMB Ganjil 2026/2027',
    wave: 'Gelombang 2',
    registration: '1 Juli 2026 - 31 Agustus 2026',
    selection: '5 September 2026 - 12 September 2026',
    announcement: '15 September 2026',
    reRegistration: '16 September 2026 - 30 September 2026',
  };

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Periode & Jalur PMB</h1><p class="page-desc">Konfigurasi periode aktif dan distribusi jalur pendaftaran</p></div>
  </div>
  <div style="display:grid;grid-template-columns:1.2fr .8fr;gap:1.5rem">
    <div class="card">
      <div class="card-header"><h3 class="card-title">Periode Aktif</h3></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem">
          <div><div style="font-size:var(--text-xs);color:var(--color-muted)">Nama Periode</div><strong>${activePeriod.name}</strong></div>
          <div><div style="font-size:var(--text-xs);color:var(--color-muted)">Gelombang</div><strong>${activePeriod.wave}</strong></div>
          <div><div style="font-size:var(--text-xs);color:var(--color-muted)">Pendaftaran</div><strong>${activePeriod.registration}</strong></div>
          <div><div style="font-size:var(--text-xs);color:var(--color-muted)">Seleksi</div><strong>${activePeriod.selection}</strong></div>
          <div><div style="font-size:var(--text-xs);color:var(--color-muted)">Pengumuman</div><strong>${activePeriod.announcement}</strong></div>
          <div><div style="font-size:var(--text-xs);color:var(--color-muted)">Daftar Ulang</div><strong>${activePeriod.reRegistration}</strong></div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">Jalur Pendaftaran</h3></div>
      <div class="card-body">
        ${pathSummary.map(([label, count]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:.75rem 0;border-bottom:1px solid var(--color-border)">
            <div><strong>${label}</strong></div>
            <span class="badge badge-navy">${count} pendaftar</span>
          </div>`).join('')}
      </div>
    </div>
  </div>
</div>`;
}

function renderPmbReports(container) {
  const admissions = getScopedAdmissions();
  const campuses = getScopedCampuses();
  const converted = admissions.filter(item => item.status === 'menjadi mahasiswa').length;
  const reRegistered = admissions.filter(item => item.status === 'daftar ulang').length;
  const passed = admissions.filter(item => item.selectionStatus === 'lulus seleksi').length;
  const rows = campuses.map(campus => {
    const items = admissions.filter(item => item.campusId === campus.id);
    return {
      campus: campus.code,
      applicants: items.length,
      verified: items.filter(item => item.docStatus === 'terverifikasi').length,
      passed: items.filter(item => item.selectionStatus === 'lulus seleksi').length,
      converted: items.filter(item => item.status === 'menjadi mahasiswa').length,
    };
  });

  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Laporan PMB</h1><p class="page-desc">Ringkasan funnel pendaftaran mahasiswa baru</p></div></div>
  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:1.5rem">
    <div class="kpi-card kpi-card-navy"><div class="kpi-value">${admissions.length}</div><div class="kpi-label">Total Pendaftar</div></div>
    <div class="kpi-card kpi-card-info"><div class="kpi-value">${passed}</div><div class="kpi-label">Lulus Seleksi</div></div>
    <div class="kpi-card kpi-card-warning"><div class="kpi-value">${reRegistered}</div><div class="kpi-label">Daftar Ulang</div></div>
    <div class="kpi-card kpi-card-success"><div class="kpi-value">${converted}</div><div class="kpi-label">Menjadi Mahasiswa</div></div>
  </div>
  <div id="pmb-report-table"></div>
</div>`;

  new DataTable({
    containerId:'pmb-report-table',
    columns:[
      {key:'campus',label:'Kampus'},
      {key:'applicants',label:'Pendaftar'},
      {key:'verified',label:'Terverifikasi'},
      {key:'passed',label:'Lulus Seleksi'},
      {key:'converted',label:'Konversi Mahasiswa'},
    ],
    data:rows,
    searchFields:['campus'],
  });
}

function buildAdmTable(campuses) {
  const admissions = getScopedAdmissions();
  const studyPrograms = getScopedPrograms();
  const STATUS_ACTIONS = {
    'menunggu verifikasi': [
      { label: 'Verifikasi', action: 'verify', cls: 'btn-success' },
      { label: 'Perbaikan', action: 'revision', cls: 'btn-warning' },
    ],
    'terverifikasi': [{ label: 'Ke Seleksi', action: 'to-selection', cls: 'btn-primary' }],
    'menunggu seleksi': [
      { label: 'Lulus', action: 'pass', cls: 'btn-success' },
      { label: 'Tidak Lulus', action: 'fail', cls: 'btn-danger' },
    ],
    'lulus seleksi': [{ label: 'Daftar Ulang ?', action: 're-register', cls: 'btn-accent' }],
    'daftar ulang': [{ label: 'Jadi Mahasiswa', action: 'convert', cls: 'btn-primary' }],
  };

  const columns = [
    { key: 'regNum', label: 'No. Daftar', render: r => `<strong>${r.regNum}</strong>` },
    { key: 'name', label: 'Nama' },
    { key: 'campusId', label: 'Kampus', render: r => campuses.find(c=>c.id===r.campusId)?.code||'-' },
    { key: 'prodiName', label: 'Program Studi' },
    { key: 'path', label: 'Jalur' },
    { key: 'date', label: 'Tgl Daftar', render: r => formatDate(r.date) },
    { key: 'docStatus', label: 'Dokumen', render: r => statusBadge(r.docStatus) },
    { key: 'status', label: 'Status', render: r => statusBadge(r.status) },
    { key: '_actions', label: 'Aksi', sortable: false, render: r => {
      const acts = STATUS_ACTIONS[r.status] || [];
      return `<div class="row-actions">
        <button class="btn btn-secondary btn-icon btn-sm" data-action="view" data-id="${r.id}" title="Detail"><i class="bi bi-eye"></i></button>
        ${acts.map(a=>`<button class="btn ${a.cls} btn-sm" data-action="${a.action}" data-id="${r.id}">${a.label}</button>`).join('')}
      </div>`;
    }},
  ];

  _table = new DataTable({
    containerId: 'adm-table',
    columns, data: admissions,
    searchFields: ['name','regNum'],
    defaultSort: 'date',
    onRowAction: (action, item) => handleAdmAction(action, item),
  });
}

function handleAdmAction(action, item) {
  const statusMap = {
    'verify':       { status: 'terverifikasi', docStatus: 'terverifikasi', msg: 'Dokumen berhasil diverifikasi.' },
    'revision':     { status: 'perlu perbaikan', docStatus: 'perlu perbaikan', msg: 'Status diubah ke "Perlu Perbaikan".' },
    'to-selection': { status: 'menunggu seleksi', msg: 'Pendaftar masuk ke tahap seleksi.' },
    'pass':         { status: 'lulus seleksi', selectionStatus: 'lulus seleksi', msg: 'Pendaftar dinyatakan LULUS seleksi.' },
    'fail':         { status: 'tidak lulus', selectionStatus: 'tidak lulus', msg: 'Pendaftar dinyatakan tidak lulus seleksi.' },
  };

  if (action === 'view') {
    import('../components/modal.js').then(({ openModal }) => {
      openModal({
        title: `Detail Pendaftar — ${item.regNum}`,
        body: `
          <div class="stat-row"><span class="stat-row-label">Nama</span><span class="stat-row-value">${item.name}</span></div>
          <div class="stat-row"><span class="stat-row-label">No. HP</span><span class="stat-row-value">${item.phone}</span></div>
          <div class="stat-row"><span class="stat-row-label">Program Studi</span><span class="stat-row-value">${item.prodiName}</span></div>
          <div class="stat-row"><span class="stat-row-label">Jalur</span><span class="stat-row-value">${item.path}</span></div>
          <div class="stat-row"><span class="stat-row-label">Tgl Daftar</span><span class="stat-row-value">${formatDate(item.date)}</span></div>
          <div class="stat-row"><span class="stat-row-label">Status Dokumen</span><span class="stat-row-value">${statusBadge(item.docStatus)}</span></div>
          <div class="stat-row"><span class="stat-row-label">Status Seleksi</span><span class="stat-row-value">${statusBadge(item.selectionStatus)}</span></div>
          <div class="stat-row"><span class="stat-row-label">Status</span><span class="stat-row-value">${statusBadge(item.status)}</span></div>
          <div class="info-box" style="margin-top:1rem"><i class="bi bi-info-circle"></i> Dokumen: KTP, Ijazah, Foto 3x4, Sertifikat Prestasi (simulasi)</div>`,
      });
    });
    return;
  }

  if (action === 're-register') {
    const result = confirmReRegistration(item);
    showToast(result.msg, result.ok ? 'success' : 'warning');
    if (result.ok) _table?.setData(getScopedAdmissions());
    return;
  }

  if (action === 'convert') {
    showConfirm({
      title: 'Konversi menjadi mahasiswa?',
      message: `Membuat data mahasiswa untuk <strong>${esc(item.name)}</strong> dengan NIM otomatis.`,
      confirmText: 'Ya, Konversi',
      type: 'primary',
    }).then(ok => {
      if (!ok) return;
      const result = convertApplicantToStudent(item);
      showToast(result.msg, result.ok ? 'success' : 'danger');
      if (result.ok) _table?.setData(getScopedAdmissions());
    });
    return;
  }

  const mapping = statusMap[action];
  if (!mapping) return;

  DB.update('admissions', item.id, mapping);
  DB.log(`PMB: ${action}`, 'PMB', `Pendaftar: ${item.name} (${item.regNum})`);
  showToast(mapping.msg, action==='fail'?'warning':'success');
  _table?.setData(getScopedAdmissions());
}

function bindAdmEvents(campuses) {
  const search = document.getElementById('adm-search');
  const campusF = document.getElementById('campus-f');
  const statusF = document.getElementById('status-f');

  let t;
  search?.addEventListener('input', e => { clearTimeout(t); t=setTimeout(()=>_table?.search(e.target.value),250); });
  campusF?.addEventListener('change', () => _table?.filter('campusId', campusF.value));
  statusF?.addEventListener('change', () => _table?.filter('status', statusF.value));
  document.getElementById('clear-f')?.addEventListener('click', () => {
    [search,campusF,statusF].forEach(el=>{if(el)el.value=el.tagName==='SELECT'?el.options[0].value:'';});
    _table?.clearFilters();
  });
  document.getElementById('exp-csv')?.addEventListener('click', () => {
    exportCSV(getScopedAdmissions(),'pmb-pendaftar',[
      {key:'regNum',label:'No Daftar'},{key:'name',label:'Nama'},{key:'prodiName',label:'Prodi'},
      {key:'path',label:'Jalur'},{key:'date',label:'Tgl Daftar'},{key:'status',label:'Status'},
    ]);
  });
}

// ---- PMB Dashboard ----
function renderPmbDashboard(container) {
  const admissions = getScopedAdmissions();
  const campuses = getScopedCampuses();
  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Dashboard PMB 2026/2027</h1>
      <p class="page-desc">Ringkasan proses penerimaan mahasiswa baru</p>
    </div>
    <div class="page-actions">
      <a href="#/admissions/applicants" class="btn btn-accent"><i class="bi bi-people"></i> Daftar Pendaftar</a>
    </div>
  </div>
  <div class="kpi-grid" style="margin-bottom:1.5rem">${buildPmbKPIs(admissions)}</div>
  <div class="chart-grid">
    <div class="chart-card">
      <div class="chart-card-header"><h3 class="chart-card-title">Status Pendaftar</h3></div>
      <div class="chart-wrapper" style="height:240px"><canvas id="pmb-status-chart"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header"><h3 class="chart-card-title">Pendaftar per Kampus</h3></div>
      <div class="chart-wrapper" style="height:240px"><canvas id="pmb-campus-chart"></canvas></div>
    </div>
  </div>
</div>`;

  requestAnimationFrame(() => {
    const statusGroups = {};
    admissions.forEach(a => { statusGroups[a.status] = (statusGroups[a.status]||0)+1; });
    createDoughnutChart('pmb-status-chart', {
      labels: Object.keys(statusGroups),
      data: Object.values(statusGroups),
      height: 240,
    });
    createBarChart('pmb-campus-chart', {
      labels: campuses.map(c=>c.code),
      datasets: [{ label: 'Pendaftar', data: campuses.map(c=>admissions.filter(a=>a.campusId===c.id).length), color:'#213550' }],
      height: 240,
    });
  });
}

// ---- Verification Page ----
function renderVerification(container) {
  const pending = getScopedAdmissions().filter(a=>a.docStatus==='menunggu verifikasi'||a.status==='dikirim');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Verifikasi Dokumen PMB</h1>
      <p class="page-desc">${pending.length} pendaftar menunggu verifikasi dokumen</p>
    </div>
  </div>
  ${pending.length === 0 ? '<div class="empty-state"><div class="empty-state-icon"><i class="bi bi-check-circle"></i></div><div class="empty-state-title">Semua Terverifikasi</div><div class="empty-state-desc">Tidak ada dokumen yang menunggu verifikasi.</div></div>' :
  pending.map(a=>`
    <div class="card" style="margin-bottom:1rem">
      <div class="card-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem">
          <div>
            <div style="font-weight:var(--font-semibold)">${a.name} <span class="badge badge-info">${a.regNum}</span></div>
            <div style="font-size:var(--text-xs);color:var(--color-muted)">${a.prodiName} � ${a.path}</div>
            <div style="margin-top:0.5rem">
              ${['KTP/NIK','Ijazah/SKL','Foto 3x4','Sertifikat Prestasi'].map(d=>`<span class="badge badge-success" style="margin-right:4px"><i class="bi bi-check2"></i> ${d}</span>`).join('')}
            </div>
          </div>
          <div style="display:flex;gap:0.5rem">
            <button class="btn btn-success btn-sm" onclick='handleVerify("${a.id}","verify")'>
              <i class="bi bi-check2-circle"></i> Verifikasi
            </button>
            <button class="btn btn-warning btn-sm" onclick='handleVerify("${a.id}","revision")'>
              <i class="bi bi-pencil"></i> Minta Perbaikan
            </button>
          </div>
        </div>
      </div>
    </div>`).join('')}
</div>`;

  window.handleVerify = (id, action) => {
    const updates = action === 'verify'
      ? { status: 'terverifikasi', docStatus: 'terverifikasi' }
      : { status: 'perlu perbaikan', docStatus: 'perlu perbaikan' };
    DB.update('admissions', id, updates);
    showToast(action==='verify'?'Dokumen berhasil diverifikasi.':'Status perbaikan dikirim.', action==='verify'?'success':'warning');
    renderVerification(container);
  };
}

// ---- Selection Page ----
function renderSelection(container) {
  const eligible = getScopedAdmissions().filter(a=>['terverifikasi','menunggu seleksi'].includes(a.status));
  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Seleksi & Pengumuman</h1>
      <p class="page-desc">${eligible.length} pendaftar siap untuk proses seleksi</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-accent" id="batch-select">
        <i class="bi bi-lightning-fill"></i> Proses Seleksi Batch (Simulasi)
      </button>
    </div>
  </div>
  ${eligible.length === 0 ? `<div class="info-box"><i class="bi bi-info-circle"></i> Tidak ada pendaftar yang siap untuk proses seleksi saat ini.</div>` : `
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>No. Daftar</th><th>Nama</th><th>Prodi</th><th>Jalur</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>${eligible.map(a=>`
          <tr>
            <td><strong>${a.regNum}</strong></td>
            <td>${a.name}</td>
            <td>${a.prodiName}</td>
            <td>${a.path}</td>
            <td>${statusBadge(a.status)}</td>
            <td>
              <button class="btn btn-success btn-sm" onclick='selectionAction("${a.id}","pass")'><i class="bi bi-check2"></i> Lulus</button>
              <button class="btn btn-danger btn-sm" onclick='selectionAction("${a.id}","fail")'><i class="bi bi-x"></i> TL</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`}
</div>`;

  window.selectionAction = (id, result) => {
    const updates = result==='pass'
      ? { status: 'lulus seleksi', selectionStatus: 'lulus seleksi' }
      : { status: 'tidak lulus', selectionStatus: 'tidak lulus' };
    DB.update('admissions', id, updates);
    showToast(result==='pass'?'Dinyatakan LULUS seleksi.':'Dinyatakan tidak lulus.', result==='pass'?'success':'danger');
    renderSelection(container);
  };

  document.getElementById('batch-select')?.addEventListener('click', () => {
    eligible.forEach(a => {
      if(a.status==='menunggu seleksi') {
        DB.update('admissions', a.id, { status:'lulus seleksi', selectionStatus:'lulus seleksi' });
      } else {
        DB.update('admissions', a.id, { status:'menunggu seleksi', selectionStatus:'-' });
      }
    });
    showToast(`${eligible.length} pendaftar diproses dalam batch seleksi (simulasi).`, 'gold');
    renderSelection(container);
  });
}

// ---- Daftar Ulang (PMB-010) ----
function renderReRegistration(container) {
  const campuses = getScopedCampuses();
  const programs = getScopedPrograms();
  const queue = getScopedAdmissions().filter(a => a.status === 'lulus seleksi');
  const done = getScopedAdmissions().filter(a => ['daftar ulang', 'menjadi mahasiswa'].includes(a.status));

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Daftar Ulang</h1>
      <p class="page-desc">Konfirmasi prodi, verifikasi pembayaran, dan catat daftar ulang � ${queue.length} menunggu</p>
    </div>
    <div class="page-actions">
      <a href="#/admissions/convert" class="btn btn-accent"><i class="bi bi-person-plus"></i> Konversi ke Mahasiswa</a>
      <a href="#/admissions" class="btn btn-secondary"><i class="bi bi-people"></i> Pendaftar</a>
    </div>
  </div>

  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.25rem">
    <div class="kpi-card kpi-card-warning">
      <div class="kpi-icon" style="width:36px;height:36px;font-size:1rem"><i class="bi bi-hourglass-split"></i></div>
      <div class="kpi-value">${queue.length}</div>
      <div class="kpi-label">Siap daftar ulang</div>
    </div>
    <div class="kpi-card kpi-card-gold">
      <div class="kpi-icon" style="width:36px;height:36px;font-size:1rem"><i class="bi bi-clipboard-check"></i></div>
      <div class="kpi-value">${done.filter(a => a.status === 'daftar ulang').length}</div>
      <div class="kpi-label">Sudah daftar ulang</div>
    </div>
    <div class="kpi-card kpi-card-success">
      <div class="kpi-icon" style="width:36px;height:36px;font-size:1rem"><i class="bi bi-mortarboard"></i></div>
      <div class="kpi-value">${done.filter(a => a.status === 'menjadi mahasiswa').length}</div>
      <div class="kpi-label">Sudah jadi mahasiswa</div>
    </div>
  </div>

  <div class="info-box" style="margin-bottom:1rem">
    <i class="bi bi-info-circle"></i>
    Syarat demo: status <strong>lulus seleksi</strong> dan biaya pendaftaran <strong>lunas</strong>.
    Setelah daftar ulang, lanjutkan di <a href="#/admissions/convert">Konversi ke Mahasiswa</a>.
  </div>

  ${queue.length === 0 ? `
  <div class="empty-state" style="padding:2rem">
    <div class="empty-state-title">Tidak ada antrean daftar ulang</div>
    <div class="empty-state-desc">Pendaftar lulus seleksi akan muncul di sini. Proses seleksi di <a href="#/admissions/selection">Seleksi</a>.</div>
  </div>` : `
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead>
          <tr>
            <th>No. Daftar</th><th>Nama</th><th>Kampus</th><th>Prodi pilihan</th>
            <th>Jalur</th><th>Bayar</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${queue.map(a => `
            <tr>
              <td><strong>${esc(a.regNum)}</strong></td>
              <td>${esc(a.name)}<div style="font-size:10px;color:var(--color-muted)">${esc(a.phone || '')}</div></td>
              <td>${esc(campuses.find(c => c.id === a.campusId)?.code || '-')}</td>
              <td>${esc(a.prodiName)}</td>
              <td>${esc(a.path)}</td>
              <td>${statusBadge(a.paymentStatus)}</td>
              <td>
                <button class="btn btn-accent btn-sm" data-rr="${a.id}" ${a.paymentStatus !== 'lunas' ? 'disabled title="Pembayaran belum lunas"' : ''}>
                  <i class="bi bi-clipboard-check"></i> Proses Daftar Ulang
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`}
</div>`;

  container.querySelectorAll('[data-rr]').forEach(btn => {
    btn.addEventListener('click', () => {
      const adm = DB.getById('admissions', btn.getAttribute('data-rr'));
      if (!adm) return;
      const campusProdis = programs.filter(p => p.campusId === adm.campusId && p.status === 'aktif');
      openFormModal({
        title: `Daftar Ulang — ${adm.regNum}`,
        fields: [
          {
            key: 'finalProdiId',
            label: 'Program studi final',
            type: 'select',
            required: true,
            options: campusProdis.map(p => ({ value: p.id, label: `${p.code} — ${p.name}` })),
            default: adm.prodiId,
          },
          {
            key: 'checklist',
            label: 'Konfirmasi (centang semua)',
            type: 'textarea',
            required: true,
            placeholder: 'Contoh: Prodi dikonfirmasi, berkas lengkap, biaya daftar lunas (simulasi).',
            hint: 'Catatan petugas wajib diisi sebagai bukti demo.',
          },
        ],
        values: { finalProdiId: adm.prodiId, checklist: '' },
        onSave: (data, close) => {
          if (!String(data.checklist || '').trim()) {
            showToast('Catatan konfirmasi wajib diisi.', 'warning');
            return;
          }
          const result = confirmReRegistration(adm, {
            finalProdiId: data.finalProdiId,
            note: data.checklist,
          });
          showToast(result.msg, result.ok ? 'success' : 'danger');
          if (result.ok) {
            close();
            renderReRegistration(container);
          }
        },
      });
    });
  });
}

// ---- Konversi ke Mahasiswa (PMB-010) ----
function renderConvert(container) {
  const campuses = getScopedCampuses();
  const queue = getScopedAdmissions().filter(a => a.status === 'daftar ulang');
  const converted = getScopedAdmissions().filter(a => a.status === 'menjadi mahasiswa');

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Konversi ke Mahasiswa</h1>
      <p class="page-desc">Bentuk data mahasiswa dan NIM dari pendaftar yang sudah daftar ulang � ${queue.length} antrean</p>
    </div>
    <div class="page-actions">
      <a href="#/admissions/re-registration" class="btn btn-secondary"><i class="bi bi-clipboard-check"></i> Daftar Ulang</a>
      <a href="#/students" class="btn btn-secondary"><i class="bi bi-mortarboard"></i> Data Mahasiswa</a>
    </div>
  </div>

  <div class="kpi-grid" style="grid-template-columns:repeat(2,1fr);margin-bottom:1.25rem">
    <div class="kpi-card kpi-card-warning">
      <div class="kpi-icon" style="width:36px;height:36px;font-size:1rem"><i class="bi bi-person-plus"></i></div>
      <div class="kpi-value">${queue.length}</div>
      <div class="kpi-label">Siap dikonversi</div>
    </div>
    <div class="kpi-card kpi-card-success">
      <div class="kpi-icon" style="width:36px;height:36px;font-size:1rem"><i class="bi bi-check2-circle"></i></div>
      <div class="kpi-value">${converted.length}</div>
      <div class="kpi-label">Sudah dikonversi</div>
    </div>
  </div>

  <div class="info-box" style="margin-bottom:1rem">
    <i class="bi bi-shield-check"></i>
    Konversi membuat record di <strong>Data Mahasiswa</strong>, NIM unik, dosen wali default (jika ada),
    dan registrasi semester awal berstatus Belum Registrasi.
  </div>

  ${queue.length === 0 ? `
  <div class="empty-state" style="padding:2rem">
    <div class="empty-state-title">Tidak ada pendaftar siap konversi</div>
    <div class="empty-state-desc">Selesaikan <a href="#/admissions/re-registration">Daftar Ulang</a> terlebih dahulu.</div>
  </div>` : `
  <div class="card" style="margin-bottom:1.5rem">
    <div class="card-header"><h3 class="card-title">Antrean konversi</h3></div>
    <div class="scroll-x">
      <table class="data-table">
        <thead>
          <tr>
            <th>No. Daftar</th><th>Nama</th><th>Kampus</th><th>Prodi final</th>
            <th>NIM preview</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${queue.map(a => {
            const nimPreview = generateNim(a.finalProdiId || a.prodiId, 2026);
            return `<tr>
              <td><strong>${esc(a.regNum)}</strong></td>
              <td>${esc(a.name)}</td>
              <td>${esc(campuses.find(c => c.id === a.campusId)?.code || '-')}</td>
              <td>${esc(a.prodiName)}</td>
              <td><code>${esc(nimPreview)}</code></td>
              <td>
                <button class="btn btn-primary btn-sm" data-cv="${a.id}">
                  <i class="bi bi-person-check"></i> Konversi
                </button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`}

  ${converted.length ? `
  <div class="card">
    <div class="card-header"><h3 class="card-title">Sudah dikonversi (demo)</h3></div>
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>No. Daftar</th><th>Nama</th><th>NIM</th><th>Prodi</th><th>Waktu</th></tr></thead>
        <tbody>
          ${converted.map(a => {
            const stu = a.studentId ? DB.getById('students', a.studentId) : null;
            return `<tr>
              <td>${esc(a.regNum)}</td>
              <td>${esc(a.name)}</td>
              <td><strong>${esc(a.nim || stu?.nim || '—')}</strong></td>
              <td>${esc(a.prodiName)}</td>
              <td>${a.convertedAt ? formatDate(a.convertedAt) : '—'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>` : ''}
</div>`;

  container.querySelectorAll('[data-cv]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const adm = DB.getById('admissions', btn.getAttribute('data-cv'));
      if (!adm) return;
      const nimPreview = generateNim(adm.finalProdiId || adm.prodiId, 2026);
      const ok = await showConfirm({
        title: 'Konversi menjadi mahasiswa?',
        message: `Pendaftar <strong>${esc(adm.name)}</strong> (${esc(adm.regNum)}) akan mendapat NIM <strong>${esc(nimPreview)}</strong> dan masuk Data Mahasiswa.`,
        confirmText: 'Ya, Buat Mahasiswa',
        type: 'primary',
      });
      if (!ok) return;
      const result = convertApplicantToStudent(adm);
      showToast(result.msg, result.ok ? 'success' : 'danger');
      if (result.ok) renderConvert(container);
    });
  });
}

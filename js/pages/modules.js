/**
 * SIAKAD — HR, Budget, Assets, PDDIKTI, Reports, Settings Pages
 */
import { DB } from '../data/seed.js';
import { AppState } from '../state.js';
import { formatRupiah, formatDate, statusBadge, exportCSV, generateId } from '../utils.js';
import { DataTable } from '../components/data-table.js';
import { showToast, showConfirm } from '../components/toast.js';
import { createBarChart, createDoughnutChart, formatRupiahShort } from '../components/charts.js';
import { renderComingSoon } from '../ui-helpers.js';

// ===================== HR & PAYROLL =====================
export function renderHR(path, container) {
  const hrSubs = { '/recruitment':'Rekrutmen', '/contracts':'Kontrak SDM', '/training':'Pelatihan & Pengembangan', '/performance':'Penilaian Kinerja', '/leave-hr':'Cuti SDM', '/structure':'Struktur Organisasi' };
  const hsub = Object.keys(hrSubs).find(r => path.includes(r));
  if (hsub) { container.innerHTML = renderComingSoon(hrSubs[hsub], 'SDM & HR', path); return; }

  if (path.includes('/positions')) return renderHrPositions(container);
  if (path.includes('/attendance')) return renderHrAttendance(container, path);
  if (path.includes('/leave')) return renderHrLeave(container, path);
  if (path.includes('/salary-components')) return renderHrSalaryComponents(container);
  if (path.includes('/reports')) return renderHrReports(container);
  if (path.includes('/payroll') || path.includes('/payslip')) return renderPayroll(container);
  renderEmployees(container);
}

function renderEmployees(container) {
  const employees = DB.getAll('employees');
  const campuses  = DB.getAll('campuses');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Data Pegawai</h1><p class="page-desc">${employees.length} pegawai terdaftar</p></div>
    <div class="page-actions">
      <button class="btn btn-secondary" id="exp-emp"><i class="bi bi-download"></i> Export</button>
      <a href="#/hr/payroll" class="btn btn-accent"><i class="bi bi-cash-stack"></i> Proses Payroll</a>
    </div>
  </div>
  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:1.5rem">
    ${[
      { label:'Total Pegawai', value: employees.length, icon:'bi-people', color:'navy' },
      { label:'Tetap', value: employees.filter(e=>e.type==='tetap').length, icon:'bi-person-check', color:'success' },
      { label:'Kontrak', value: employees.filter(e=>e.type==='kontrak').length, icon:'bi-person-dash', color:'warning' },
      { label:'Honorer', value: employees.filter(e=>e.type==='honorer').length, icon:'bi-person', color:'info' },
    ].map(k=>`<div class="kpi-card kpi-card-${k.color}"><div class="kpi-icon" style="width:36px;height:36px;font-size:1rem"><i class="bi ${k.icon}"></i></div><div class="kpi-value">${k.value}</div><div class="kpi-label">${k.label}</div></div>`).join('')}
  </div>
  <div id="emp-table"></div>
</div>`;
  new DataTable({
    containerId:'emp-table',
    columns:[
      {key:'empId',label:'ID Pegawai',render:r=>`<code>${r.empId}</code>`},
      {key:'name',label:'Nama'},
      {key:'campusId',label:'Kampus',render:r=>campuses.find(c=>c.id===r.campusId)?.code||'-'},
      {key:'unit',label:'Unit'},
      {key:'position',label:'Jabatan'},
      {key:'type',label:'Tipe',render:r=>statusBadge(r.type)},
      {key:'salary',label:'Gaji Pokok',render:r=>formatRupiah(r.salary)},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:employees, searchFields:['name','empId','position'],
  });
  document.getElementById('exp-emp')?.addEventListener('click',()=>exportCSV(employees,'pegawai',[{key:'empId',label:'ID'},{key:'name',label:'Nama'},{key:'unit',label:'Unit'},{key:'position',label:'Jabatan'},{key:'type',label:'Tipe'},{key:'status',label:'Status'}]));
}

function renderHrPositions(container) {
  const employees = DB.getAll('employees');
  const rows = Object.values(employees.reduce((acc, employee) => {
    const key = employee.position;
    if (!acc[key]) acc[key] = { position: key, unit: employee.unit, count: 0, avgSalary: 0, totalSalary: 0 };
    acc[key].count += 1;
    acc[key].totalSalary += employee.salary || 0;
    acc[key].avgSalary = Math.round(acc[key].totalSalary / acc[key].count);
    return acc;
  }, {}));

  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Struktur Jabatan</h1><p class="page-desc">Ringkasan jabatan aktif berdasarkan data pegawai demo</p></div></div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Jabatan</th><th>Unit</th><th>Jumlah Pegawai</th><th>Rata-rata Gaji Pokok</th></tr></thead>
        <tbody>${rows.map(row => `
          <tr>
            <td><strong>${row.position}</strong></td>
            <td>${row.unit}</td>
            <td>${row.count}</td>
            <td>${formatRupiah(row.avgSalary)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
}

function renderHrAttendance(container, path) {
  container.innerHTML = renderComingSoon('Kehadiran Pegawai', 'SDM & Payroll', path);
}

function renderHrLeave(container, path) {
  container.innerHTML = renderComingSoon('Cuti Pegawai', 'SDM & Payroll', path);
}

function renderHrSalaryComponents(container) {
  const components = [
    { name: 'Gaji Pokok', type: 'pendapatan', taxable: 'Ya', note: 'Komponen tetap bulanan' },
    { name: 'Tunjangan Jabatan', type: 'pendapatan', taxable: 'Ya', note: 'Sesuai struktur jabatan demo' },
    { name: 'Tunjangan Transportasi', type: 'pendapatan', taxable: 'Ya', note: 'Bersifat tetap (simulasi)' },
    { name: 'BPJS Kesehatan', type: 'potongan', taxable: 'Tidak', note: 'Potongan payroll demo' },
    { name: 'BPJS Ketenagakerjaan', type: 'potongan', taxable: 'Tidak', note: 'Potongan payroll demo' },
    { name: 'PPh 21', type: 'potongan', taxable: 'Ya', note: 'Estimasi untuk prototype' },
  ];
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Komponen Gaji</h1><p class="page-desc">Komponen pendapatan dan potongan payroll demo</p></div></div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Komponen</th><th>Tipe</th><th>Kena Pajak</th><th>Keterangan</th></tr></thead>
        <tbody>${components.map(row => `
          <tr>
            <td><strong>${row.name}</strong></td>
            <td>${statusBadge(row.type === 'pendapatan' ? 'aktif' : 'diperiksa', { aktif:'badge-success', diperiksa:'badge-warning' })}</td>
            <td>${row.taxable}</td>
            <td>${row.note}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
}

function renderHrReports(container) {
  const employees = DB.getAll('employees');
  const payrollRuns = DB.getAll('payrollRuns');
  const totalNet = payrollRuns.reduce((sum, row) => sum + (row.totalNet || 0), 0);
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Laporan SDM</h1><p class="page-desc">Ringkasan tenaga kerja dan payroll lintas kampus</p></div></div>
  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi-card kpi-card-navy"><div class="kpi-value">${employees.length}</div><div class="kpi-label">Pegawai Aktif</div></div>
    <div class="kpi-card kpi-card-success"><div class="kpi-value">${payrollRuns.length}</div><div class="kpi-label">Batch Payroll</div></div>
    <div class="kpi-card kpi-card-warning"><div class="kpi-value">${formatRupiah(totalNet)}</div><div class="kpi-label">Total Gaji Bersih</div></div>
  </div>
</div>`;
}

function renderPayroll(container) {
  const runs    = DB.getAll('payrollRuns');
  const campuses= DB.getAll('campuses');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Proses Payroll — Simulasi</h1></div>
    <div class="page-actions"><button class="btn btn-accent" id="run-payroll"><i class="bi bi-play-fill"></i> Proses Payroll Baru (Simulasi)</button></div>
  </div>
  <div class="info-box info-box-warning" style="margin-bottom:1.5rem"><i class="bi bi-lightning-fill"></i> Semua proses payroll bersifat simulasi. Tidak ada data keuangan nyata yang terproses.</div>
  <div id="payroll-table"></div>
</div>`;
  new DataTable({
    containerId:'payroll-table',
    columns:[
      {key:'period',label:'Periode',render:r=>`<strong>${r.period}</strong>`},
      {key:'campusId',label:'Kampus',render:r=>campuses.find(c=>c.id===r.campusId)?.name||'-'},
      {key:'totalEmployee',label:'Pegawai'},
      {key:'totalGross',label:'Total Bruto',render:r=>formatRupiah(r.totalGross)},
      {key:'totalDeductions',label:'Total Potongan',render:r=>`<span style="color:var(--color-danger)">${formatRupiah(r.totalDeductions)}</span>`},
      {key:'totalNet',label:'Total Bersih',render:r=>`<strong style="color:var(--color-success)">${formatRupiah(r.totalNet)}</strong>`},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
      {key:'_act',label:'Aksi',sortable:false,render:r=>`
        <button class="btn btn-secondary btn-sm" onclick="viewPayslip('${r.id}')"><i class="bi bi-file-person"></i> Slip Gaji</button>
        ${r.status==='diperiksa'?`<button class="btn btn-success btn-sm" onclick="approvePayroll('${r.id}')"><i class="bi bi-check2"></i> Setujui</button>`:''}`},
    ],
    data:runs, searchFields:['period'],
  });

  document.getElementById('run-payroll')?.addEventListener('click',()=>{
    const newRun = {id:generateId('prl'),period:`Oktober 2026 (Simulasi)`,campusId:'campus-1',totalEmployee:215,totalGross:1855000000,totalDeductions:212000000,totalNet:1643000000,status:'diperiksa',processedBy:`${AppState.currentRole.user} (demo)`,approvedBy:null,processedAt:new Date().toISOString().slice(0,10)};
    DB.add('payrollRuns',newRun);
    DB.log('Proses Payroll Demo','SDM','Periode: Oktober 2026','Berhasil (Simulasi)');
    showToast('Payroll Oktober 2026 berhasil diproses (simulasi).','gold');
    renderPayroll(container);
  });

  window.approvePayroll = id=>{
    DB.update('payrollRuns',id,{status:'disetujui',approvedBy:`${AppState.currentRole.user} (demo)`});
    showToast('Payroll berhasil disetujui (simulasi).','success');
    renderPayroll(container);
  };

  window.viewPayslip = id=>{
    const run = DB.getAll('payrollRuns').find(r=>r.id===id);
    if(!run) return;
    import('./components/modal.js').catch(()=>import('../components/modal.js')).then(({openModal})=>{
      openModal({
        title:'Contoh Slip Gaji (Simulasi)',
        body:`<div class="payslip">
          <div class="payslip-header"><div style="font-size:1.1rem;font-weight:700">SIAKAD Cakrawala</div><div style="font-size:0.8rem;opacity:0.7">Slip Gaji — ${run.period}</div></div>
          <div style="margin-bottom:1rem"><div class="stat-row"><span class="stat-row-label">Nama</span><span class="stat-row-value">Dr. Rizki Pratama, M.T.</span></div><div class="stat-row"><span class="stat-row-label">Jabatan</span><span class="stat-row-value">Lektor Kepala</span></div><div class="stat-row"><span class="stat-row-label">Unit</span><span class="stat-row-value">Teknik Informatika – UCJ</span></div></div>
          <div class="payslip-section-title">Pendapatan</div>
          ${[['Gaji Pokok','Rp 15.000.000'],['Tunjangan Jabatan','Rp 3.500.000'],['Tunjangan Fungsional','Rp 2.800.000'],['Tunjangan Transportasi','Rp 1.200.000']].map(([k,v])=>`<div class="payslip-row"><span>${k}</span><span style="color:var(--color-success)">${v}</span></div>`).join('')}
          <div class="payslip-section-title">Potongan</div>
          ${[['BPJS Kesehatan (1%)','Rp 225.000'],['BPJS Ketenagakerjaan (2%)','Rp 450.000'],['PPh 21 (Est.)','Rp 750.000']].map(([k,v])=>`<div class="payslip-row"><span>${k}</span><span style="color:var(--color-danger)">${v}</span></div>`).join('')}
          <div class="payslip-total"><span>Gaji Bersih</span><span>Rp 21.075.000</span></div>
          <div class="info-box info-box-warning" style="margin-top:1rem;font-size:10px"><i class="bi bi-lightning-fill"></i> SIMULASI DEMO — Data tidak mencerminkan penggajian sesungguhnya.</div>
        </div>`,
        size:'',
      });
    });
  };
}

// ===================== ASSETS =====================
export function renderAssets(path, container) {
  if (path.includes('/categories')) return renderAssetCategories(container);
  if (path.includes('/maintenance')) return renderAssetMaintenance(container);
  if (path.includes('/approval')) return renderProcurementApproval(container);
  if (path.includes('/receipt')) return renderProcurementReceipt(container);
  if (path.includes('/reports')) return renderAssetReports(container);
  if (path.includes('/procurement')) return renderProcurement(container);
  renderAssetList(container);
}

function renderAssetList(container) {
  const assets   = DB.getAll('assets');
  const campuses = DB.getAll('campuses');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Master Aset</h1><p class="page-desc">${assets.length} aset terdaftar</p></div><div class="page-actions"><a href="#/procurement" class="btn btn-secondary"><i class="bi bi-cart-plus"></i> Pengadaan</a><button class="btn btn-accent"><i class="bi bi-plus-lg"></i> Tambah Aset</button></div></div>
  <div id="ast-table"></div>
</div>`;
  new DataTable({
    containerId:'ast-table',
    columns:[
      {key:'code',label:'Kode',render:r=>`<code>${r.code}</code>`},
      {key:'name',label:'Nama Aset'},
      {key:'category',label:'Kategori'},
      {key:'campusId',label:'Kampus',render:r=>campuses.find(c=>c.id===r.campusId)?.code||'-'},
      {key:'location',label:'Lokasi'},
      {key:'acquiredValue',label:'Nilai Perolehan',render:r=>formatRupiah(r.acquiredValue)},
      {key:'acquiredDate',label:'Tgl. Perolehan',render:r=>formatDate(r.acquiredDate)},
      {key:'condition',label:'Kondisi',render:r=>`<span class="badge asset-condition-badge-${r.condition}">${r.condition}</span>`},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:assets, searchFields:['name','code','location'],
  });
}

function renderProcurement(container) {
  const procs    = DB.getAll('procurementRequests');
  const campuses = DB.getAll('campuses');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Pengajuan Pengadaan</h1></div><div class="page-actions"><button class="btn btn-accent" id="add-proc"><i class="bi bi-plus-lg"></i> Ajukan Pengadaan</button></div></div>
  <div id="proc-table"></div>
</div>`;
  new DataTable({
    containerId:'proc-table',
    columns:[
      {key:'reqNum',label:'No. Pengajuan',render:r=>`<strong>${r.reqNum}</strong>`},
      {key:'campusId',label:'Kampus',render:r=>campuses.find(c=>c.id===r.campusId)?.code||'-'},
      {key:'unit',label:'Unit'},
      {key:'itemName',label:'Item'},
      {key:'quantity',label:'Qty'},
      {key:'estimatedCost',label:'Estimasi Biaya',render:r=>formatRupiah(r.estimatedCost)},
      {key:'requestDate',label:'Tgl. Ajuan',render:r=>formatDate(r.requestDate)},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
      {key:'_act',label:'Aksi',sortable:false,render:r=>r.status==='menunggu persetujuan'?`<button class="btn btn-success btn-sm" onclick="approveProcurement('${r.id}')"><i class="bi bi-check2"></i> Setujui</button><button class="btn btn-danger btn-sm" onclick="rejectProcurement('${r.id}')"><i class="bi bi-x"></i> Tolak</button>`:`<span style="font-size:10px;color:var(--color-muted)">—</span>`},
    ],
    data:procs, searchFields:['reqNum','itemName','unit'],
  });
  window.approveProcurement = id=>{DB.update('procurementRequests',id,{status:'disetujui',approvedBy:`${AppState.currentRole.user} (demo)`,approvedDate:new Date().toISOString().slice(0,10)});showToast('Pengadaan disetujui (simulasi).','success');renderProcurement(container);};
  window.rejectProcurement  = id=>{DB.update('procurementRequests',id,{status:'ditolak'});showToast('Pengadaan ditolak (simulasi).','warning');renderProcurement(container);};
}

function renderAssetCategories(container) {
  const assets = DB.getAll('assets');
  const rows = Object.values(assets.reduce((acc, asset) => {
    if (!acc[asset.category]) acc[asset.category] = { category: asset.category, count: 0, value: 0 };
    acc[asset.category].count += 1;
    acc[asset.category].value += asset.acquiredValue || 0;
    return acc;
  }, {}));
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Kategori Aset</h1><p class="page-desc">Ringkasan aset berdasarkan kategori</p></div></div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Kategori</th><th>Jumlah Aset</th><th>Nilai Perolehan</th></tr></thead>
        <tbody>${rows.map(row => `
          <tr>
            <td><strong>${row.category}</strong></td>
            <td>${row.count}</td>
            <td>${formatRupiah(row.value)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
}

function renderAssetMaintenance(container) {
  const assets = DB.getAll('assets').filter(asset => asset.condition !== 'baik' || asset.status !== 'aktif');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Pemeliharaan Aset</h1><p class="page-desc">Aset yang perlu perhatian berdasarkan kondisi atau status</p></div></div>
  <div id="asset-maint-table"></div>
</div>`;
  new DataTable({
    containerId:'asset-maint-table',
    columns:[
      {key:'code',label:'Kode',render:r=>`<code>${r.code}</code>`},
      {key:'name',label:'Nama Aset'},
      {key:'category',label:'Kategori'},
      {key:'location',label:'Lokasi'},
      {key:'condition',label:'Kondisi',render:r=>statusBadge(r.condition)},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:assets, searchFields:['code','name','location','category'],
  });
}

function renderProcurementApproval(container) {
  const procs = DB.getAll('procurementRequests').filter(item => ['diajukan', 'menunggu persetujuan'].includes(item.status));
  const campuses = DB.getAll('campuses');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Persetujuan Pengadaan</h1><p class="page-desc">Pengajuan yang sedang menunggu keputusan</p></div></div>
  <div id="proc-approval-table"></div>
</div>`;
  new DataTable({
    containerId:'proc-approval-table',
    columns:[
      {key:'reqNum',label:'No. Pengajuan',render:r=>`<strong>${r.reqNum}</strong>`},
      {key:'campusId',label:'Kampus',render:r=>campuses.find(c=>c.id===r.campusId)?.code||'-'},
      {key:'itemName',label:'Item'},
      {key:'estimatedCost',label:'Estimasi',render:r=>formatRupiah(r.estimatedCost)},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:procs, searchFields:['reqNum','itemName'],
  });
}

function renderProcurementReceipt(container) {
  const procs = DB.getAll('procurementRequests').filter(item => ['disetujui', 'terima barang'].includes(item.status));
  const campuses = DB.getAll('campuses');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Penerimaan Barang</h1><p class="page-desc">Pengadaan yang sudah disetujui atau diterima</p></div></div>
  <div id="proc-receipt-table"></div>
</div>`;
  new DataTable({
    containerId:'proc-receipt-table',
    columns:[
      {key:'reqNum',label:'No. Pengajuan',render:r=>`<strong>${r.reqNum}</strong>`},
      {key:'campusId',label:'Kampus',render:r=>campuses.find(c=>c.id===r.campusId)?.code||'-'},
      {key:'itemName',label:'Item'},
      {key:'approvedDate',label:'Tgl. Approval',render:r=>formatDate(r.approvedDate)},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:procs, searchFields:['reqNum','itemName'],
  });
}

function renderAssetReports(container) {
  const assets = DB.getAll('assets');
  const totalValue = assets.reduce((sum, item) => sum + (item.acquiredValue || 0), 0);
  const activeCount = assets.filter(item => item.status === 'aktif').length;
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Laporan Aset</h1><p class="page-desc">Ringkasan nilai perolehan dan kondisi aset</p></div></div>
  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi-card kpi-card-navy"><div class="kpi-value">${assets.length}</div><div class="kpi-label">Total Aset</div></div>
    <div class="kpi-card kpi-card-success"><div class="kpi-value">${activeCount}</div><div class="kpi-label">Aset Aktif</div></div>
    <div class="kpi-card kpi-card-warning"><div class="kpi-value">${formatRupiah(totalValue)}</div><div class="kpi-label">Nilai Perolehan</div></div>
  </div>
</div>`;
}

// ===================== BUDGET =====================
export function renderBudget(path, container) {
  if (path.includes('/campus')) return renderBudgetByCampus(container);
  if (path.includes('/submission')) return renderBudgetSubmission(container);
  if (path.includes('/approval')) return renderBudgetApproval(container);
  if (path.includes('/realization')) return renderBudgetRealization(container);
  if (path.includes('/variance')) return renderBudgetVariance(container);
  return renderBudgetOverview(container);
}

function getFilteredBudgets() {
  const budgets = DB.getAll('budgets');
  const campusFilter = AppState.currentCampusFilter;
  return campusFilter === 'all' ? budgets : budgets.filter(b => b.campusId === campusFilter);
}

function getBudgetCampuses() {
  const campuses = DB.getAll('campuses');
  return AppState.currentCampusFilter === 'all'
    ? campuses
    : campuses.filter(c => c.id === AppState.currentCampusFilter);
}

function mountBudgetTable(containerId, data, campuses, onApprove) {
  new DataTable({
    containerId,
    columns:[
      {key:'year',label:'Tahun'},
      {key:'campusId',label:'Kampus',render:r=>campuses.find(c=>c.id===r.campusId)?.code||'-'},
      {key:'unitName',label:'Unit'},
      {key:'category',label:'Kategori'},
      {key:'approved',label:'Disetujui',render:r=>formatRupiah(r.approved)},
      {key:'realized',label:'Realisasi',render:r=>`<span style="color:var(--color-success)">${formatRupiah(r.realized)}</span>`},
      {key:'remaining',label:'Sisa',render:r=>formatRupiah(r.remaining)},
      {key:'percent',label:'%',render:r=>`<div style="display:flex;align-items:center;gap:0.5rem"><div class="progress-bar-wrap" style="width:60px"><div class="progress-bar-fill ${r.percent>90?'fill-danger':r.percent>70?'fill-warning':'fill-success'}" style="width:${r.percent}%"></div></div><span>${r.percent}%</span></div>`},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
      {key:'_act',label:'Aksi',sortable:false,render:r=>onApprove && r.status==='diajukan anggaran' ? `<button class="btn btn-success btn-sm" data-approve="${r.id}"><i class="bi bi-check2"></i> Setujui</button>` : '-'},
    ],
    data,
    searchFields:['unitName','campusId','category'],
  });

  if (onApprove) {
    document.querySelectorAll(`[data-approve]`).forEach(btn => {
      btn.addEventListener('click', () => onApprove(btn.dataset.approve));
    });
  }
}

function renderBudgetOverview(container) {
  const budgets = getFilteredBudgets();
  const campuses = getBudgetCampuses();
  const total2026 = budgets.filter(b=>b.year===2026&&b.status==='disetujui');
  const totalApproved = total2026.reduce((s,b)=>s+b.approved,0);
  const totalRealized = total2026.reduce((s,b)=>s+b.realized,0);
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Perencanaan Anggaran</h1><p class="page-desc">Ringkasan anggaran lintas unit dan kampus</p></div><div class="page-actions"><a href="#/budget/submission" class="btn btn-accent"><i class="bi bi-plus-lg"></i> Pengajuan Anggaran</a></div></div>
  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.5rem">
    <div class="kpi-card kpi-card-navy"><div class="kpi-value">${formatRupiah(totalApproved)}</div><div class="kpi-label">Total Anggaran Disetujui 2026</div></div>
    <div class="kpi-card kpi-card-success"><div class="kpi-value">${formatRupiah(totalRealized)}</div><div class="kpi-label">Total Realisasi</div><div class="kpi-trend up"><i class="bi bi-arrow-up-short"></i> ${totalApproved ? Math.round(totalRealized/totalApproved*100) : 0}% dari total anggaran</div></div>
    <div class="kpi-card kpi-card-warning"><div class="kpi-value">${formatRupiah(totalApproved-totalRealized)}</div><div class="kpi-label">Sisa Anggaran</div></div>
  </div>
  <div class="chart-grid" style="margin-bottom:1.5rem">
    <div class="chart-card"><div class="chart-card-header"><h3 class="chart-card-title">Anggaran vs Realisasi per Unit</h3></div><div class="chart-wrapper" style="height:240px"><canvas id="bud-chart"></canvas></div></div>
    <div class="chart-card"><div class="chart-card-header"><h3 class="chart-card-title">Alokasi per Kampus</h3></div><div class="chart-wrapper" style="height:240px"><canvas id="bud-campus"></canvas></div></div>
  </div>
  <div id="bud-table"></div>
</div>`;
  mountBudgetTable('bud-table', budgets, campuses, (id) => {
    DB.update('budgets',id,{status:'disetujui',approvedBy:`${AppState.currentRole.user} (demo)`});
    showToast('Anggaran disetujui (simulasi).','success');
    renderBudgetOverview(container);
  });
  requestAnimationFrame(()=>{
    const units = total2026.map(b=>b.unitName.split(' ').slice(-1)[0]);
    createBarChart('bud-chart',{labels:units,datasets:[{label:'Disetujui',data:total2026.map(b=>b.approved),color:'#213550'},{label:'Realisasi',data:total2026.map(b=>b.realized),color:'#198754'}],height:240,formatY:formatRupiahShort});
    createDoughnutChart('bud-campus',{labels:campuses.map(c=>c.code),data:campuses.map(c=>budgets.filter(b=>b.campusId===c.id&&b.year===2026).reduce((s,b)=>s+b.approved,0)),height:240});
  });
}

function renderBudgetByCampus(container) {
  const budgets = getFilteredBudgets().filter(b => b.year === 2026);
  const campuses = getBudgetCampuses();
  const rows = campuses.map(campus => {
    const items = budgets.filter(b => b.campusId === campus.id);
    const approved = items.reduce((sum, item) => sum + item.approved, 0);
    const realized = items.reduce((sum, item) => sum + item.realized, 0);
    return { code: campus.code, name: campus.name, unitCount: items.length, approved, realized, remaining: approved - realized };
  });
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Anggaran per Kampus</h1><p class="page-desc">Perbandingan alokasi dan realisasi antar kampus</p></div></div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Kampus</th><th>Unit</th><th>Disetujui</th><th>Realisasi</th><th>Sisa</th></tr></thead>
        <tbody>${rows.map(row => `
          <tr>
            <td><strong>${row.code}</strong><div style="font-size:10px;color:var(--color-muted)">${row.name}</div></td>
            <td>${row.unitCount}</td>
            <td>${formatRupiah(row.approved)}</td>
            <td style="color:var(--color-success)">${formatRupiah(row.realized)}</td>
            <td style="color:${row.remaining > 0 ? 'var(--color-warning)' : 'var(--color-success)'}">${formatRupiah(row.remaining)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
}

function renderBudgetSubmission(container) {
  const budgets = getFilteredBudgets().filter(b => ['diajukan anggaran', 'perlu revisi'].includes(b.status));
  const campuses = getBudgetCampuses();
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Pengajuan Anggaran</h1><p class="page-desc">Daftar anggaran yang masih diajukan atau perlu revisi</p></div></div>
  <div id="budget-submission-table"></div>
</div>`;
  mountBudgetTable('budget-submission-table', budgets, campuses, null);
}

function renderBudgetApproval(container) {
  const budgets = getFilteredBudgets().filter(b => b.status === 'diajukan anggaran');
  const campuses = getBudgetCampuses();
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Persetujuan Anggaran</h1><p class="page-desc">Pengajuan yang menunggu persetujuan pimpinan/pengurus</p></div></div>
  <div id="budget-approval-table"></div>
</div>`;
  mountBudgetTable('budget-approval-table', budgets, campuses, (id) => {
    DB.update('budgets',id,{status:'disetujui',approvedBy:`${AppState.currentRole.user} (demo)`});
    showToast('Pengajuan anggaran disetujui (simulasi).','success');
    renderBudgetApproval(container);
  });
}

function renderBudgetRealization(container) {
  const budgets = getFilteredBudgets().filter(b => b.status === 'disetujui');
  const campuses = getBudgetCampuses();
  const totalRealized = budgets.reduce((sum, item) => sum + item.realized, 0);
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Realisasi Anggaran</h1><p class="page-desc">Total realisasi tercatat: <strong style="color:var(--color-success)">${formatRupiah(totalRealized)}</strong></p></div></div>
  <div id="budget-realization-table"></div>
</div>`;
  mountBudgetTable('budget-realization-table', budgets, campuses, null);
}

function renderBudgetVariance(container) {
  const budgets = getFilteredBudgets().filter(b => b.status === 'disetujui').map(item => ({
    ...item,
    variance: (item.approved || 0) - (item.realized || 0),
  }));
  const campuses = getBudgetCampuses();
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Analisis Varians</h1><p class="page-desc">Analisis selisih antara anggaran disetujui dan realisasi</p></div></div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Tahun</th><th>Kampus</th><th>Unit</th><th>Disetujui</th><th>Realisasi</th><th>Varians</th><th>% Pakai</th></tr></thead>
        <tbody>${budgets.map(row => `
          <tr>
            <td>${row.year}</td>
            <td>${campuses.find(c => c.id === row.campusId)?.code || '-'}</td>
            <td><strong>${row.unitName}</strong></td>
            <td>${formatRupiah(row.approved)}</td>
            <td style="color:var(--color-success)">${formatRupiah(row.realized)}</td>
            <td style="color:${row.variance < 0 ? 'var(--color-danger)' : 'var(--color-warning)'}">${formatRupiah(Math.abs(row.variance))}</td>
            <td>${row.percent}%</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
}

// ===================== PDDIKTI =====================
export function renderPDDIKTI(path, container) {
  if (path.includes('/students')) return renderPddiktiList(container, 'Batch Mahasiswa', 'Antrian data mahasiswa untuk validasi dan sinkronisasi.', job => job.type === 'Mahasiswa');
  if (path.includes('/lecturers')) return renderPddiktiList(container, 'Batch Dosen', 'Daftar sinkronisasi data dosen ke feeder PDDIKTI.', job => job.type === 'Dosen');
  if (path.includes('/grades')) return renderPddiktiList(container, 'Batch Nilai & KRS', 'Monitoring pengiriman data akademik perkuliahan.', job => ['Nilai', 'KRS'].includes(job.type));
  if (path.includes('/queue')) return renderPddiktiList(container, 'Antrean Sinkronisasi', 'Batch yang masih menunggu proses atau perlu dibenahi.', job => ['siap disinkronkan', 'perlu perbaikan'].includes(job.status));
  if (path.includes('/history')) return renderPddiktiList(container, 'Riwayat Sinkronisasi', 'Seluruh riwayat batch PDDIKTI lintas kampus.', () => true, true);
  return renderPddiktiDashboard(path, container);
}

function renderPddiktiDashboard(path, container) {
  const jobs     = DB.getAll('pddiktiJobs');
  const campuses = DB.getAll('campuses');
  const statusColors = {'simulasi berhasil':'#198754','simulasi gagal sebagian':'#dc3545','perlu perbaikan':'#d97706','siap disinkronkan':'#0d6efd','simulasi berhasil sebagian':'#d97706'};
  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">PDDIKTI — Validasi & Sinkronisasi</h1><p class="page-desc">Sinkronisasi data feeder PDDIKTI (Simulasi)</p></div>
    <div class="page-actions"><button class="btn btn-accent" id="sync-all"><i class="bi bi-cloud-upload"></i> Sinkronisasi Semua (Simulasi)</button></div>
  </div>
  <div class="info-box info-box-warning" style="margin-bottom:1.5rem">
    <i class="bi bi-exclamation-triangle"></i> <strong>SIMULASI:</strong> Tidak ada koneksi ke server PDDIKTI Kemdikbud yang sesungguhnya. Semua proses sinkronisasi hanya untuk keperluan demonstrasi.
  </div>
  <!-- Status Summary -->
  <div class="pddikti-status-bar">
    ${[
      {label:'Total Batch',val:jobs.length,icon:'bi-collection',color:'#213550'},
      {label:'Berhasil',val:jobs.filter(j=>j.status==='simulasi berhasil').length,icon:'bi-check-circle',color:'#198754'},
      {label:'Sebagian Berhasil',val:jobs.filter(j=>j.status.includes('sebagian')).length,icon:'bi-exclamation-circle',color:'#d97706'},
      {label:'Perlu Perbaikan',val:jobs.filter(j=>j.status==='perlu perbaikan').length,icon:'bi-wrench',color:'#dc3545'},
      {label:'Siap Sync',val:jobs.filter(j=>j.status==='siap disinkronkan').length,icon:'bi-cloud-arrow-up',color:'#0d6efd'},
    ].map(s=>`<div class="pddikti-status-card"><div style="font-size:1.5rem;color:${s.color}"><i class="bi ${s.icon}"></i></div><div style="font-size:1.5rem;font-weight:700;color:${s.color}">${s.val}</div><div style="font-size:10px;color:var(--color-muted)">${s.label}</div></div>`).join('')}
  </div>
  <div id="pdd-table"></div>
</div>`;
  new DataTable({
    containerId:'pdd-table',
    columns:[
      {key:'batch',label:'Batch',render:r=>`<code>${r.batch}</code>`},
      {key:'type',label:'Tipe Data'},
      {key:'campusId',label:'Kampus',render:r=>campuses.find(c=>c.id===r.campusId)?.code||'-'},
      {key:'total',label:'Total'},
      {key:'valid',label:'Valid',render:r=>`<span style="color:var(--color-success)">${r.valid}</span>`},
      {key:'needFix',label:'Perlu Perbaikan',render:r=>r.needFix>0?`<span style="color:var(--color-danger)">${r.needFix}</span>`:r.needFix},
      {key:'synced',label:'Tersinkron',render:r=>`<strong>${r.synced}</strong>`},
      {key:'date',label:'Tanggal',render:r=>formatDate(r.date)},
      {key:'status',label:'Status',render:r=>`<span class="badge" style="background:${statusColors[r.status]||'#6b7280'}22;color:${statusColors[r.status]||'#6b7280'}">${r.status}</span>`},
      {key:'_act',label:'Aksi',sortable:false,render:r=>r.status==='siap disinkronkan'||r.status==='perlu perbaikan'?`<button class="btn btn-primary btn-sm" onclick="syncBatch('${r.id}')"><i class="bi bi-cloud-upload"></i> Sync (Sim.)</button>`:'-'},
    ],
    data:jobs, searchFields:['batch','type'],
  });
  window.syncBatch = id=>{
    const job = DB.getAll('pddiktiJobs').find(j=>j.id===id);
    if(!job) return;
    DB.update('pddiktiJobs',id,{status:'simulasi berhasil',synced:job.valid,failed:job.needFix,date:new Date().toISOString().slice(0,10)});
    DB.log('Simulasi Sinkronisasi PDDIKTI','PDDIKTI',`Batch: ${job.batch}`,'Simulasi Berhasil');
    showToast(`Sinkronisasi batch ${job.batch} selesai (simulasi). ${job.valid} data berhasil.`,'gold');
    renderPddiktiDashboard(path,container);
  };
  document.getElementById('sync-all')?.addEventListener('click',()=>{
    const allJobs = DB.getAll('pddiktiJobs');
    allJobs.forEach(j=>DB.update('pddiktiJobs',j.id,{status:'simulasi berhasil',synced:j.valid,date:new Date().toISOString().slice(0,10)}));
    showToast(`Semua ${allJobs.length} batch berhasil disinkronkan (simulasi).`,'gold');
    renderPddiktiDashboard(path,container);
  });
}

function renderPddiktiList(container, title, desc, predicate, sortByDateDesc = false) {
  const campuses = DB.getAll('campuses');
  const statusColors = {'simulasi berhasil':'#198754','simulasi gagal sebagian':'#dc3545','perlu perbaikan':'#d97706','siap disinkronkan':'#0d6efd','simulasi berhasil sebagian':'#d97706'};
  const jobs = DB.getAll('pddiktiJobs').filter(predicate);
  if (sortByDateDesc) jobs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">${title}</h1><p class="page-desc">${desc}</p></div></div>
  <div id="pddikti-list-table"></div>
</div>`;
  new DataTable({
    containerId:'pddikti-list-table',
    columns:[
      {key:'batch',label:'Batch',render:r=>`<code>${r.batch}</code>`},
      {key:'type',label:'Tipe Data'},
      {key:'campusId',label:'Kampus',render:r=>campuses.find(c=>c.id===r.campusId)?.code||'-'},
      {key:'total',label:'Total'},
      {key:'valid',label:'Valid',render:r=>`<span style="color:var(--color-success)">${r.valid}</span>`},
      {key:'needFix',label:'Perlu Perbaikan',render:r=>r.needFix>0?`<span style="color:var(--color-danger)">${r.needFix}</span>`:r.needFix},
      {key:'synced',label:'Tersinkron',render:r=>`<strong>${r.synced}</strong>`},
      {key:'date',label:'Tanggal',render:r=>formatDate(r.date)},
      {key:'status',label:'Status',render:r=>`<span class="badge" style="background:${statusColors[r.status]||'#6b7280'}22;color:${statusColors[r.status]||'#6b7280'}">${r.status}</span>`},
    ],
    data:jobs,
    searchFields:['batch','type'],
  });
}

// ===================== REPORTS =====================
export function renderReports(path, container) {
  if (path.includes('/academic')) return renderAcademicReports(container);
  if (path.includes('/admissions')) return renderAdmissionsReports(container);
  if (path.includes('/finance')) return renderFinanceReportsSummary(container);
  if (path.includes('/hr')) return renderHrReports(container);
  if (path.includes('/assets')) return renderAssetReports(container);
  if (path.includes('/budget')) return renderBudgetReportsSummary(container);
  if (path.includes('/pddikti')) return renderPddiktiReportsSummary(container);
  if (path.includes('/consolidation')) return renderConsolidationReportsSummary(container);

  const reportCategories = [
    { icon:'bi-mortarboard', title:'Laporan Akademik', desc:'Transkrip, KHS, statistik mahasiswa, IPK', color:'#213550', route:'#/reports/academic' },
    { icon:'bi-cash-stack', title:'Laporan Keuangan', desc:'Penerimaan, piutang, laporan L/R', color:'#198754', route:'#/reports/finance' },
    { icon:'bi-person-plus', title:'Laporan PMB', desc:'Statistik pendaftaran, konversi, sumber', color:'#d97706', route:'#/reports/admissions' },
    { icon:'bi-people', title:'Laporan SDM', desc:'Data pegawai, payroll, absensi', color:'#0d6efd', route:'#/reports/hr' },
    { icon:'bi-box-seam', title:'Laporan Aset', desc:'Inventaris, kondisi, penyusutan', color:'#6f42c1', route:'#/reports/assets' },
    { icon:'bi-pie-chart', title:'Laporan Anggaran', desc:'Realisasi, varians, forecast', color:'#d1a84b', route:'#/reports/budget' },
    { icon:'bi-cloud-upload', title:'Laporan PDDIKTI', desc:'Riwayat sinkronisasi dan validasi', color:'#20c997', route:'#/reports/pddikti' },
    { icon:'bi-building', title:'Laporan Konsolidasi', desc:'Ringkasan lintas kampus untuk yayasan', color:'#fd7e14', route:'#/reports/consolidation' },
  ];
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Pusat Laporan</h1><p class="page-desc">Akses semua laporan sistem SIAKAD Cakrawala</p></div></div>
  <div class="reports-grid">
    ${reportCategories.map(r=>`
      <div class="report-card" onclick="location.hash='${r.route}'">
        <div class="report-icon-wrap" style="background:${r.color}15;color:${r.color}"><i class="bi ${r.icon}"></i></div>
        <div class="report-info"><div class="report-title">${r.title}</div><div class="report-desc">${r.desc}</div></div>
        <i class="bi bi-chevron-right" style="color:var(--color-muted)"></i>
      </div>`).join('')}
  </div>
  <div class="chart-grid" style="margin-top:1.5rem">
    <div class="chart-card"><div class="chart-card-header"><h3 class="chart-card-title">Trend Mahasiswa Aktif</h3></div><div class="chart-wrapper" style="height:220px"><canvas id="rpt-trend"></canvas></div></div>
    <div class="chart-card"><div class="chart-card-header"><h3 class="chart-card-title">Distribusi Status Tagihan</h3></div><div class="chart-wrapper" style="height:220px"><canvas id="rpt-inv"></canvas></div></div>
  </div>
</div>`;
  requestAnimationFrame(()=>{
    import('./charts.js').catch(()=>import('../components/charts.js')).then(({createBarChart:cB,createDoughnutChart:cD,formatRupiahShort:fR})=>{
      const students = DB.getAll('students');
      const campuses = DB.getAll('campuses');
      const invoices = DB.getAll('invoices');
      cB('rpt-trend',{labels:campuses.map(c=>c.code),datasets:[{label:'Aktif',data:campuses.map(c=>students.filter(s=>s.campusId===c.id&&s.status==='aktif').length),color:'#213550'}],height:220});
      const statusG={};invoices.forEach(i=>{statusG[i.status]=(statusG[i.status]||0)+1;});
      cD('rpt-inv',{labels:Object.keys(statusG),data:Object.values(statusG),colors:['#198754','#d97706','#dc3545','#0d6efd','#9ca3af'],height:220});
    });
  });
}

function renderAcademicReports(container) {
  const students = DB.getAll('students');
  const grades = DB.getAll('grades').filter(item => item.status === 'final');
  const active = students.filter(item => item.status === 'aktif').length;
  const avgGpa = students.reduce((sum, item) => sum + (item.ipk || 0), 0) / (students.length || 1);
  const passedCourses = grades.filter(item => (item.finalScore || 0) >= 60).length;
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Laporan Akademik</h1><p class="page-desc">Ringkasan performa akademik mahasiswa aktif</p></div></div>
  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi-card kpi-card-navy"><div class="kpi-value">${active}</div><div class="kpi-label">Mahasiswa Aktif</div></div>
    <div class="kpi-card kpi-card-success"><div class="kpi-value">${avgGpa.toFixed(2)}</div><div class="kpi-label">Rata-rata IPK</div></div>
    <div class="kpi-card kpi-card-info"><div class="kpi-value">${passedCourses}</div><div class="kpi-label">Nilai Final Lulus</div></div>
  </div>
</div>`;
}

function renderAdmissionsReports(container) {
  const admissions = DB.getAll('admissions');
  const converted = admissions.filter(item => item.status === 'menjadi mahasiswa').length;
  const passed = admissions.filter(item => item.selectionStatus === 'lulus seleksi').length;
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Laporan PMB</h1><p class="page-desc">Funnel pendaftaran, seleksi, dan konversi mahasiswa baru</p></div></div>
  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi-card kpi-card-warning"><div class="kpi-value">${admissions.length}</div><div class="kpi-label">Total Pendaftar</div></div>
    <div class="kpi-card kpi-card-info"><div class="kpi-value">${passed}</div><div class="kpi-label">Lulus Seleksi</div></div>
    <div class="kpi-card kpi-card-success"><div class="kpi-value">${converted}</div><div class="kpi-label">Jadi Mahasiswa</div></div>
  </div>
</div>`;
}

function renderFinanceReportsSummary(container) {
  const invoices = DB.getAll('invoices');
  const paid = invoices.reduce((sum, item) => sum + (item.paid || 0), 0);
  const remaining = invoices.reduce((sum, item) => sum + (item.remaining || 0), 0);
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Laporan Keuangan</h1><p class="page-desc">Ringkasan penerimaan dan saldo piutang mahasiswa</p></div></div>
  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi-card kpi-card-success"><div class="kpi-value">${formatRupiah(paid)}</div><div class="kpi-label">Pembayaran Tercatat</div></div>
    <div class="kpi-card kpi-card-warning"><div class="kpi-value">${formatRupiah(remaining)}</div><div class="kpi-label">Sisa Piutang</div></div>
    <div class="kpi-card kpi-card-navy"><div class="kpi-value">${invoices.length}</div><div class="kpi-label">Total Tagihan</div></div>
  </div>
</div>`;
}

function renderBudgetReportsSummary(container) {
  const budgetItems = DB.getAll('budgets').filter(item => item.status === 'disetujui');
  const totalBudget = budgetItems.reduce((sum, item) => sum + (item.approved || 0), 0);
  const realized = budgetItems.reduce((sum, item) => sum + (item.realized || 0), 0);
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Laporan Anggaran</h1><p class="page-desc">Monitoring pagu, realisasi, dan sisa anggaran</p></div></div>
  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi-card kpi-card-gold"><div class="kpi-value">${formatRupiah(totalBudget)}</div><div class="kpi-label">Total Anggaran</div></div>
    <div class="kpi-card kpi-card-success"><div class="kpi-value">${formatRupiah(realized)}</div><div class="kpi-label">Realisasi</div></div>
    <div class="kpi-card kpi-card-warning"><div class="kpi-value">${formatRupiah(totalBudget - realized)}</div><div class="kpi-label">Sisa Anggaran</div></div>
  </div>
</div>`;
}

function renderPddiktiReportsSummary(container) {
  const jobs = DB.getAll('pddiktiJobs');
  const synced = jobs.reduce((sum, item) => sum + (item.synced || 0), 0);
  const needFix = jobs.reduce((sum, item) => sum + (item.needFix || 0), 0);
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Laporan PDDIKTI</h1><p class="page-desc">Ringkasan validasi, antrean, dan sinkronisasi feeder</p></div></div>
  <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
    <div class="kpi-card kpi-card-info"><div class="kpi-value">${jobs.length}</div><div class="kpi-label">Total Batch</div></div>
    <div class="kpi-card kpi-card-success"><div class="kpi-value">${synced}</div><div class="kpi-label">Data Tersinkron</div></div>
    <div class="kpi-card kpi-card-danger"><div class="kpi-value">${needFix}</div><div class="kpi-label">Perlu Perbaikan</div></div>
  </div>
</div>`;
}

function renderConsolidationReportsSummary(container) {
  const campuses = DB.getAll('campuses');
  const students = DB.getAll('students');
  const invoices = DB.getAll('invoices');
  const rows = campuses.map(campus => ({
    campus: campus.code,
    students: students.filter(item => item.campusId === campus.id && item.status === 'aktif').length,
    paid: invoices.filter(item => item.campusId === campus.id).reduce((sum, item) => sum + (item.paid || 0), 0),
    receivables: invoices.filter(item => item.campusId === campus.id).reduce((sum, item) => sum + (item.remaining || 0), 0),
  }));
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Laporan Konsolidasi</h1><p class="page-desc">Perbandingan ringkas performa lintas kampus</p></div></div>
  <div id="report-consolidation-table"></div>
</div>`;
  new DataTable({
    containerId:'report-consolidation-table',
    columns:[
      {key:'campus',label:'Kampus'},
      {key:'students',label:'Mahasiswa Aktif'},
      {key:'paid',label:'Pembayaran',render:r=>formatRupiah(r.paid)},
      {key:'receivables',label:'Piutang',render:r=>formatRupiah(r.receivables)},
    ],
    data:rows,
    searchFields:['campus'],
  });
}

// ===================== SETTINGS =====================
export function renderSettings(path, container) {
  if (path.includes('/users')) return renderUsers(container);
  if (path.includes('/roles')) return renderRoles(container);
  if (path.includes('/reset')) return renderReset(container);
  renderPreferences(container);
}

function renderUsers(container) {
  const users = DB.getAll('demoUsers');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Pengguna Sistem</h1><p class="page-desc">${users.length} pengguna terdaftar (demo)</p></div><div class="page-actions"><button class="btn btn-accent"><i class="bi bi-plus-lg"></i> Tambah Pengguna</button></div></div>
  <div id="usr-table"></div>
</div>`;
  new DataTable({
    containerId:'usr-table',
    columns:[
      {key:'name',label:'Nama'},
      {key:'email',label:'Email'},
      {key:'role',label:'Role',render:r=>`<span class="badge badge-navy">${r.role}</span>`},
      {key:'scope',label:'Scope'},
      {key:'lastLogin',label:'Login Terakhir',render:r=>formatDate(r.lastLogin)},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
      {key:'_act',label:'Aksi',sortable:false,render:r=>`<button class="btn btn-secondary btn-icon btn-sm" title="Edit"><i class="bi bi-pencil"></i></button><button class="btn btn-outline-danger btn-icon btn-sm" title="Nonaktifkan"><i class="bi bi-person-x"></i></button>`},
    ],
    data:users, searchFields:['name','email','role'],
  });
}

function renderRoles(container) {
  const rolePermissions = [
    {role:'Pengurus Yayasan',access:'Semua modul',level:'Full Access'},
    {role:'Admin Yayasan',access:'Semua modul kecuali portal',level:'Full Access'},
    {role:'Rektor/Pimpinan Kampus',access:'Kampus sendiri — semua modul kecuali pengaturan sistem',level:'Campus Level'},
    {role:'Dekan',access:'Akademik, Mahasiswa, Dosen di fakultasnya',level:'Faculty Level'},
    {role:'Ketua Program Studi',access:'Kurikulum, Kelas, Mahasiswa di prodinya',level:'Prodi Level'},
    {role:'Staf PMB',access:'Modul PMB saja',level:'Limited'},
    {role:'Staf TU Akademik',access:'Mahasiswa, Akademik, KRS',level:'Limited'},
    {role:'Staf Keuangan',access:'Keuangan, Anggaran',level:'Limited'},
    {role:'HR',access:'SDM, Payroll, Aset',level:'Limited'},
    {role:'Dosen',access:'Portal Dosen saja',level:'Portal Only'},
    {role:'Mahasiswa',access:'Portal Mahasiswa saja',level:'Portal Only'},
    {role:'Orang Tua/Wali',access:'Portal Orang Tua saja',level:'Portal Only'},
  ];
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Role & Hak Akses</h1></div></div>
  <div class="card">
    <div class="scroll-x"><table class="data-table"><thead><tr><th>Role</th><th>Hak Akses</th><th>Level</th></tr></thead><tbody>
    ${rolePermissions.map(r=>`<tr><td><span class="badge badge-navy">${r.role}</span></td><td style="font-size:var(--text-xs);color:var(--color-muted)">${r.access}</td><td>${r.level}</td></tr>`).join('')}
    </tbody></table></div>
  </div>
</div>`;
}

function renderPreferences(container) {
  const settings = DB.get('settings')||{};
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Preferensi Sistem</h1></div></div>
  <div class="card" style="max-width:600px">
    <div class="card-body">
      <div class="form-group"><label class="form-label">Nama Yayasan</label><input type="text" class="form-control" value="${settings.foundationName||''}" id="pref-foundation"></div>
      <div class="form-group"><label class="form-label">Maksimum SKS per Semester</label><input type="number" class="form-control" value="${settings.maxSks||24}" id="pref-maxsks" style="max-width:100px"></div>
      <div class="form-group"><label class="form-label">Bobot Tugas (%)</label><input type="number" class="form-control" value="${settings.gradeWeights?.tugas||20}" id="pref-tugas" style="max-width:100px"></div>
      <div class="form-group"><label class="form-label">Bobot UAS (%)</label><input type="number" class="form-control" value="${settings.gradeWeights?.uas||30}" id="pref-uas" style="max-width:100px"></div>
      <button class="btn btn-primary" id="save-pref"><i class="bi bi-check2"></i> Simpan Pengaturan</button>
    </div>
  </div>
</div>`;
  document.getElementById('save-pref')?.addEventListener('click',()=>{
    DB.save('settings',{...settings,foundationName:document.getElementById('pref-foundation').value,maxSks:parseInt(document.getElementById('pref-maxsks').value)||24});
    showToast('Preferensi berhasil disimpan.','success');
  });
}

function renderReset(container) {
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Reset Data Demo</h1></div></div>
  <div class="card" style="max-width:500px;border-top:4px solid var(--color-danger)">
    <div class="card-body" style="text-align:center;padding:2rem">
      <div style="font-size:3rem;color:var(--color-danger);margin-bottom:1rem"><i class="bi bi-exclamation-triangle"></i></div>
      <h3>Reset Seluruh Data Demo</h3>
      <p style="color:var(--color-muted);font-size:var(--text-sm)">Semua perubahan yang Anda buat akan dikembalikan ke kondisi awal. Tindakan ini tidak dapat dibatalkan.</p>
      <button class="btn btn-danger" id="do-reset" style="margin-top:1rem"><i class="bi bi-arrow-counterclockwise"></i> Reset Data Demo Sekarang</button>
    </div>
  </div>
</div>`;
  document.getElementById('do-reset')?.addEventListener('click',async()=>{
    const {showConfirm} = await import('../components/toast.js');
    const ok = await showConfirm({title:'Reset Data Demo',message:'Yakin ingin mereset semua data ke kondisi awal?',type:'danger',confirmText:'Ya, Reset'});
    if(ok){const{initSeed}=await import('../data/seed.js');initSeed(true);showToast('Data direset.','success');setTimeout(()=>location.reload(),800);}
  });
}

// ===================== AUDIT LOG =====================
export function renderAuditLog(path, container) {
  const logs = DB.getAll('auditLogs');
  container.innerHTML = `
<div class="page-container">
  <div class="page-header"><div class="page-header-info"><h1 class="page-title">Audit Log</h1><p class="page-desc">Riwayat aktivitas pengguna dalam sistem (${logs.length} entri)</p></div><div class="page-actions"><button class="btn btn-secondary" id="exp-log"><i class="bi bi-download"></i> Export</button></div></div>
  <div id="log-table"></div>
</div>`;
  new DataTable({
    containerId:'log-table',
    columns:[
      {key:'time',label:'Waktu',render:r=>formatDate(r.time)},
      {key:'user',label:'Pengguna'},
      {key:'role',label:'Role',render:r=>`<span class="badge badge-navy">${r.role}</span>`},
      {key:'module',label:'Modul',render:r=>`<span class="audit-module-badge">${r.module}</span>`},
      {key:'activity',label:'Aktivitas'},
      {key:'object',label:'Objek',render:r=>`<span style="font-size:var(--text-xs);color:var(--color-muted)">${r.object}</span>`},
      {key:'result',label:'Hasil',render:r=>statusBadge(r.result.toLowerCase().includes('gagal')?'gagal':r.result.toLowerCase().includes('simulasi')?'simulasi':r.result.toLowerCase())},
    ],
    data:logs, searchFields:['user','module','activity','object'],
  });
  document.getElementById('exp-log')?.addEventListener('click',()=>exportCSV(logs,'audit-log',[{key:'time',label:'Waktu'},{key:'user',label:'User'},{key:'role',label:'Role'},{key:'module',label:'Modul'},{key:'activity',label:'Aktivitas'},{key:'object',label:'Objek'},{key:'result',label:'Hasil'}]));
}

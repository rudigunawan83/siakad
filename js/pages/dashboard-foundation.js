/**
 * SIAKAD — Dashboard Yayasan / Kampus / Fakultas
 */

import { DB } from '../data/seed.js';
import { AppState } from '../state.js?v=20261025ab';
import { formatRupiah, formatNumber, formatDateRelative, abbreviateNum } from '../utils.js';
import { createBarChart, createLineChart, createDoughnutChart, formatRupiahShort } from '../components/charts.js';
import { showToast } from '../components/toast.js';

export function renderDashboard(path, container) {
  const role = AppState.currentRole;
  if (['lecturer','student','parent'].includes(role.id)) {
    location.hash = role.dashboardRoute.replace('#','');
    return;
  }

  const campuses   = DB.getAll('campuses');
  const students   = DB.getAll('students');
  const admissions = DB.getAll('admissions');
  const invoices   = DB.getAll('invoices');
  const notifs     = DB.getAll('notifications');
  const lecturers  = DB.getAll('lecturers');
  const theses     = DB.getAll('theses');
  const budgets    = DB.getAll('budgets');

  // Compute KPIs
  const campusFilter = AppState.currentCampusFilter;
  const filtStudents = campusFilter === 'all' ? students : students.filter(s => s.campusId === campusFilter);
  const activeStudents = filtStudents.filter(s => s.status === 'aktif').length;
  const newApplicants  = admissions.filter(a => !a.status.includes('mahasiswa')).length;
  const totalRevenue   = invoices.filter(i => i.status === 'lunas').reduce((s, i) => s + i.paid, 0);
  const overdue        = invoices.filter(i => i.status === 'jatuh tempo').length;
  const activeLecturers = lecturers.filter(l => campusFilter === 'all' || l.campusId === campusFilter).length;

  const campusSummary = campuses.map(c => {
    const stu = students.filter(s => s.campusId === c.id);
    const rev = invoices.filter(i => i.campusId === c.id && i.status === 'lunas').reduce((s,i) => s+i.paid,0);
    return { ...c, stuCount: stu.length, revenue: rev };
  });

  const pendingApprovals = [
    { title: 'KRS Menunggu Persetujuan', count: 3, icon: 'bi-journal-check', color: '#0d6efd', route: '#/learning/krs-approval' },
    { title: 'Verifikasi Dokumen PMB', count: 2, icon: 'bi-file-earmark-check', color: '#d97706', route: '#/admissions/verification' },
    { title: 'Pengajuan Anggaran', count: 1, icon: 'bi-pie-chart', color: '#6f42c1', route: '#/budget/approval' },
    { title: 'Pengajuan Pengadaan', count: 2, icon: 'bi-box-seam', color: '#198754', route: '#/procurement/approval' },
  ];

  container.innerHTML = `
<div class="page-container">
  <div class="demo-banner">
    <i class="bi bi-lightning-fill"></i>
    <span>Mode Demo Aktif — Data fiktif untuk keperluan demonstrasi. Semua operasi disimulasikan.</span>
    <span class="simulasi-label ms-auto"><i class="bi bi-eye"></i> Simulasi</span>
  </div>

  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Dashboard ${campusFilter === 'all' ? 'Yayasan' : campuses.find(c=>c.id===campusFilter)?.name || ''}</h1>
      <p class="page-desc">Ringkasan operasional ${new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})}</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-secondary" onclick="window.print()"><i class="bi bi-printer"></i> Cetak</button>
      <button class="btn btn-accent" id="quick-report-btn"><i class="bi bi-file-bar-graph"></i> Laporan Cepat</button>
    </div>
  </div>

  <!-- KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi-card kpi-card-navy" onclick="location.hash='#/students'">
      <div class="kpi-icon" style="background:#21355015;color:var(--color-navy-800)"><i class="bi bi-mortarboard-fill"></i></div>
      <div class="kpi-value">${formatNumber(activeStudents)}</div>
      <div class="kpi-label">Total Mahasiswa Aktif</div>
      <div class="kpi-trend up"><i class="bi bi-arrow-up-short"></i> +128 semester ini</div>
    </div>
    <div class="kpi-card kpi-card-success" onclick="location.hash='#/admissions'">
      <div class="kpi-icon" style="background:#19875415;color:var(--color-success)"><i class="bi bi-person-plus-fill"></i></div>
      <div class="kpi-value">${formatNumber(admissions.length)}</div>
      <div class="kpi-label">Pendaftar PMB 2026/2027</div>
      <div class="kpi-trend up"><i class="bi bi-arrow-up-short"></i> ${newApplicants} sedang diproses</div>
    </div>
    <div class="kpi-card kpi-card-gold" onclick="location.hash='#/finance/dashboard'">
      <div class="kpi-icon" style="background:#d1a84b15;color:var(--color-gold-600)"><i class="bi bi-cash-coin"></i></div>
      <div class="kpi-value">Rp ${abbreviateNum(totalRevenue)}</div>
      <div class="kpi-label">Total Penerimaan UKT</div>
      <div class="kpi-trend up"><i class="bi bi-arrow-up-short"></i> Semester Ganjil 2026/2027</div>
    </div>
    <div class="kpi-card kpi-card-danger" onclick="location.hash='#/finance/receivables'">
      <div class="kpi-icon" style="background:#dc354515;color:var(--color-danger)"><i class="bi bi-exclamation-circle-fill"></i></div>
      <div class="kpi-value">${overdue}</div>
      <div class="kpi-label">Tagihan Jatuh Tempo</div>
      <div class="kpi-trend down"><i class="bi bi-arrow-down-short"></i> Perlu tindakan segera</div>
    </div>
  </div>

  <!-- Second KPI Row -->
  <div class="kpi-grid" style="margin-bottom:1.5rem">
    <div class="kpi-card kpi-card-info" onclick="location.hash='#/lecturers'">
      <div class="kpi-icon" style="background:#0d6efd15;color:var(--color-info)"><i class="bi bi-person-workspace"></i></div>
      <div class="kpi-value">${formatNumber(activeLecturers)}</div>
      <div class="kpi-label">Dosen Aktif</div>
      <div class="kpi-trend neutral"><i class="bi bi-dash"></i> Stabil</div>
    </div>
    <div class="kpi-card kpi-card-success" onclick="location.hash='#/thesis'">
      <div class="kpi-icon" style="background:#19875415;color:var(--color-success)"><i class="bi bi-file-earmark-text"></i></div>
      <div class="kpi-value">${theses.length}</div>
      <div class="kpi-label">Tugas Akhir Aktif</div>
      <div class="kpi-trend up"><i class="bi bi-arrow-up-short"></i> Semester ini</div>
    </div>
    <div class="kpi-card kpi-card-gold" onclick="location.hash='#/budget/overview'">
      <div class="kpi-icon" style="background:#d1a84b15;color:var(--color-gold-600)"><i class="bi bi-pie-chart-fill"></i></div>
      <div class="kpi-value">73%</div>
      <div class="kpi-label">Realisasi Anggaran 2026</div>
      <div class="kpi-trend up"><i class="bi bi-arrow-up-short"></i> On track</div>
    </div>
    <div class="kpi-card kpi-card-navy" onclick="location.hash='#/pddikti/validation'">
      <div class="kpi-icon" style="background:#21355015;color:var(--color-navy-800)"><i class="bi bi-cloud-check-fill"></i></div>
      <div class="kpi-value">94%</div>
      <div class="kpi-label">Validitas Data PDDIKTI</div>
      <div class="kpi-trend down"><i class="bi bi-arrow-down-short"></i> 5 data perlu perbaikan</div>
    </div>
  </div>

  <!-- Charts & Tables -->
  <div class="dashboard-grid">
    <!-- Left: charts -->
    <div style="display:flex;flex-direction:column;gap:1rem">
      <!-- Enrollment Trend -->
      <div class="chart-card">
        <div class="chart-card-header">
          <div>
            <h3 class="chart-card-title">Tren Mahasiswa Aktif</h3>
            <div class="chart-card-subtitle">3 semester terakhir per kampus</div>
          </div>
          <select class="filter-select" id="trend-chart-filter">
            <option value="bar">Bar</option>
            <option value="line">Line</option>
          </select>
        </div>
        <div class="chart-wrapper" style="height:240px">
          <canvas id="enrollment-chart"></canvas>
        </div>
      </div>

      <!-- Revenue Chart -->
      <div class="chart-grid">
        <div class="chart-card">
          <div class="chart-card-header">
            <h3 class="chart-card-title">Penerimaan UKT</h3>
          </div>
          <div class="chart-wrapper" style="height:200px">
            <canvas id="revenue-chart"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card-header">
            <h3 class="chart-card-title">Status Mahasiswa</h3>
          </div>
          <div class="chart-wrapper" style="height:200px">
            <canvas id="status-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Campus Comparison Table -->
      ${campusFilter === 'all' ? `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Perbandingan Antar Kampus</h3>
        </div>
        <div class="scroll-x">
          <table class="data-table campus-compare-table">
            <thead><tr>
              <th>Kampus</th><th>Jenis</th><th>Akreditasi</th>
              <th>Mahasiswa</th><th>Dosen</th><th>Penerimaan</th><th>Status</th>
            </tr></thead>
            <tbody>
              ${campusSummary.map(c => `<tr>
                <td><strong>${c.code}</strong><br><span style="font-size:10px;color:var(--color-muted)">${c.name}</span></td>
                <td>${c.type}</td>
                <td><span class="badge badge-${c.accreditation === 'A' ? 'success' : 'warning'}">${c.accreditation}</span></td>
                <td>${formatNumber(c.stuCount)}</td>
                <td>${formatNumber(c.lecturerCount)}</td>
                <td>${formatRupiah(c.revenue)}</td>
                <td><span class="badge badge-active">${c.status}</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>` : ''}
    </div>

    <!-- Right: sidepanel -->
    <div style="display:flex;flex-direction:column;gap:1rem">
      <!-- Pending Approvals -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Perlu Persetujuan</h3>
          <span class="badge badge-danger">${pendingApprovals.reduce((s,x)=>s+x.count,0)}</span>
        </div>
        <div class="card-body-sm">
          ${pendingApprovals.map(p => `
            <div class="approval-item" onclick="location.hash='${p.route}'" style="cursor:pointer">
              <div class="kpi-icon" style="background:${p.color}15;color:${p.color};width:36px;height:36px;border-radius:8px;font-size:1rem">
                <i class="bi ${p.icon}"></i>
              </div>
              <div class="approval-info">
                <div class="approval-title">${p.title}</div>
                <div class="approval-meta">${p.count} item menunggu</div>
              </div>
              <span class="badge badge-warning">${p.count}</span>
            </div>`).join('')}
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Aktivitas Terbaru</h3>
          <a href="#/audit-logs" class="btn btn-secondary btn-sm">Lihat Semua</a>
        </div>
        <div class="card-body-sm">
          <ul class="activity-list">
            ${DB.getAll('auditLogs').slice(0,6).map(l => `
              <li class="activity-item">
                <div class="activity-icon" style="background:var(--color-navy-100);color:var(--color-navy-800)">
                  <i class="bi bi-shield-check"></i>
                </div>
                <div class="activity-body">
                  <div class="activity-text"><strong>${l.user}</strong> � ${l.activity}: ${l.object}</div>
                  <div class="activity-time">${formatDateRelative(l.time)}</div>
                </div>
              </li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- PMB Funnel -->
      <div class="card">
        <div class="chart-card-header" style="padding:1rem 1.25rem">
          <div>
            <h3 class="chart-card-title">Funnel PMB 2026/2027</h3>
            <div class="chart-card-subtitle">Status pendaftar saat ini</div>
          </div>
        </div>
        <div class="card-body-sm">
          ${buildPmbFunnel(admissions)}
        </div>
      </div>
    </div>
  </div>
</div>`;

  // Init charts
  requestAnimationFrame(() => {
    initCharts(campusSummary, students, invoices);

    document.getElementById('quick-report-btn')?.addEventListener('click', () => {
      showToast('Membuka laporan ringkasan...', 'info');
      setTimeout(() => { location.hash = '#/reports'; }, 500);
    });
  });
}

function buildPmbFunnel(admissions) {
  const stages = [
    { label: 'Mendaftar', count: admissions.length, color: '#0d6efd' },
    { label: 'Terverifikasi', count: admissions.filter(a => ['terverifikasi','menunggu seleksi','lulus seleksi','tidak lulus','daftar ulang','menjadi mahasiswa'].includes(a.status)).length, color: '#6f42c1' },
    { label: 'Lulus Seleksi', count: admissions.filter(a => ['lulus seleksi','daftar ulang','menjadi mahasiswa'].includes(a.status)).length, color: '#198754' },
    { label: 'Daftar Ulang', count: admissions.filter(a => ['daftar ulang','menjadi mahasiswa'].includes(a.status)).length, color: '#d1a84b' },
    { label: 'Jadi Mahasiswa', count: admissions.filter(a => a.status === 'menjadi mahasiswa').length, color: '#213550' },
  ];
  const max = stages[0].count || 1;
  return stages.map(s => `
    <div style="margin-bottom:0.75rem">
      <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);margin-bottom:4px">
        <span style="color:var(--color-muted)">${s.label}</span>
        <strong>${s.count}</strong>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" style="width:${Math.round(s.count/max*100)}%;background:${s.color}"></div>
      </div>
    </div>`).join('');
}

function initCharts(campusSummary, students, invoices) {
  // Enrollment trend (stacked bar by campus)
  createBarChart('enrollment-chart', {
    labels: ['Genap 2025/2026', 'Ganjil 2026/2027'],
    datasets: campusSummary.map(c => ({
      label: c.code,
      data: [Math.round(c.stuCount * 0.95), c.stuCount],
      color: c.color,
    })),
    stacked: true,
    height: 240,
  });

  // Revenue line
  createLineChart('revenue-chart', {
    labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt'],
    datasets: [{
      label: 'Penerimaan (Rp)',
      data: [580,620,540,490,680,720,850,780,920,610].map(v => v * 1_000_000),
      color: '#d1a84b',
    }],
    height: 200,
    fill: true,
    formatY: formatRupiahShort,
  });

  // Status donut
  const statusCount = {
    aktif: students.filter(s=>s.status==='aktif').length,
    cuti: students.filter(s=>s.status==='cuti').length,
    nonaktif: students.filter(s=>s.status==='nonaktif').length,
    lulus: students.filter(s=>s.status==='lulus').length,
  };
  createDoughnutChart('status-chart', {
    labels: ['Aktif','Cuti','Nonaktif','Lulus'],
    data: Object.values(statusCount),
    colors: ['#213550','#d97706','#dc3545','#198754'],
    height: 200,
  });
}

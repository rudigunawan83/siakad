/**
 * SIAKAD Cakrawala — Hash Router
 */

import { AppState } from './state.js?v=20261025ab';
import { renderSidebar } from './components/sidebar.js';
import { renderTopbar } from './components/topbar.js?v=20261025af';

const routes = {};
let _currentRoute = null;

export const Router = {
  register(path, handler) { routes[path] = handler; },

  init() {
    window.addEventListener('hashchange', () => this._resolve());
    this._resolve();
  },

  navigate(path) { location.hash = path; },

  refresh() { this._resolve(); },

  _resolve() {
    const hash = location.hash || '#/dashboard/foundation';
    const path = hash.replace('#', '').split('?')[0];
    const isPublic = path === '/pmb' || path.startsWith('/pmb/');
    document.getElementById('app-shell')?.classList.toggle('public-shell', isPublic);

    // Re-render nav elements (hidden on public PMB pages via CSS)
    if (!isPublic) {
      renderTopbar();
      renderSidebar();
    }

    const content = document.getElementById('content');
    if (!content) return;

    // Find best matching route (longest prefix match)
    let matchedHandler = null;
    let matchedPath = '';
    for (const [route, handler] of Object.entries(routes)) {
      if (path.startsWith(route) && route.length > matchedPath.length) {
        matchedHandler = handler;
        matchedPath = route;
      }
    }

    if (matchedHandler) {
      _currentRoute = matchedPath;
      content.innerHTML = '<div class="page-container"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-card"></div></div>';
      setTimeout(() => {
        try { matchedHandler(path, content); }
        catch (e) { console.error('[Router]', e); content.innerHTML = errorPage(e); }
      }, 80);
    } else {
      // Check if this is a known namespace (segera hadir)
      const knownNamespaces = ['/organization', '/admissions', '/students', '/lecturers', '/academic',
        '/learning', '/thesis', '/finance', '/budget', '/hr', '/assets', '/procurement',
        '/pddikti', '/reports', '/settings', '/audit', '/portal', '/dashboard', '/pmb'];
      const isKnown = knownNamespaces.some(ns => path.startsWith(ns));
      // /pmb harus selalu punya handler; jika tidak, beri petunjuk cache
      if (path === '/pmb' || path.startsWith('/pmb/')) {
        content.innerHTML = `<div class="page-container">
          <div class="info-box info-box-warning">
            <i class="bi bi-arrow-clockwise"></i>
            Route PMB publik belum termuat (kemungkinan cache browser).
            Muat ulang paksa dengan <strong>Ctrl+F5</strong>, lalu buka lagi
            <a href="#/pmb/daftar"><code>#/pmb/daftar</code></a>.
          </div>
        </div>`;
      } else {
        content.innerHTML = isKnown ? comingSoonPage(path) : notFoundPage();
      }
    }

    // Scroll to top
    content.scrollTop = 0;
  },
};

function notFoundPage() {
  return `<div class="page-container">
    <div class="not-found-page">
      <div class="not-found-code">404</div>
      <h1 class="not-found-title">Halaman Tidak Ditemukan</h1>
      <p class="not-found-desc">Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
      <a href="${AppState.currentRole.dashboardRoute}" class="btn btn-primary mt-4">
        <i class="bi bi-house"></i> Kembali ke Dashboard
      </a>
    </div>
  </div>`;
}

function errorPage(e) {
  return `<div class="page-container">
    <div class="not-found-page">
      <div style="font-size:3rem;color:var(--color-danger)"><i class="bi bi-exclamation-triangle"></i></div>
      <h1 class="not-found-title">Terjadi Kesalahan</h1>
      <p class="not-found-desc">${e.message}</p>
      <a href="${AppState.currentRole.dashboardRoute}" class="btn btn-primary mt-4">
        <i class="bi bi-house"></i> Kembali ke Dashboard
      </a>
    </div>
  </div>`;
}

function comingSoonPage(path) {
  const labels = {
    '/organization/profile': 'Profil Yayasan',
    '/admissions/periods': 'Periode & Jalur PMB',
    '/admissions/re-registration': 'Daftar Ulang',
    '/admissions/convert': 'Konversi ke Mahasiswa',
    '/admissions/reports': 'Laporan PMB',
    '/students/registration': 'Registrasi Semester',
    '/students/academic-status': 'Status Akademik',
    '/students/leave': 'Cuti & Aktif Kembali',
    '/students/scholarships': 'Beasiswa & Keringanan',
    '/students/letters': 'Surat Akademik',
    '/students/graduation': 'Yudisium',
    '/students/commencement': 'Wisuda',
    '/students/alumni': 'Alumni',
    '/lecturers/staff': 'Tenaga Kependidikan',
    '/lecturers/assignments': 'Penugasan Mengajar',
    '/lecturers/workload': 'Beban Kerja Dosen',
    '/lecturers/certification': 'Sertifikasi',
    '/lecturers/evaluation': 'Evaluasi Kinerja',
    '/academic/prerequisites': 'Prasyarat Mata Kuliah',
    '/academic/advisors': 'Dosen Wali',
    '/academic/evaluation': 'Evaluasi Akademik',
    '/academic/schedule': 'Penjadwalan',
    '/learning/assignments': 'Tugas & Ujian',
    '/learning/evaluation': 'Evaluasi Dosen',
    '/thesis/topics': 'Pengajuan Topik',
    '/thesis/supervision': 'Bimbingan',
    '/thesis/defense': 'Seminar & Sidang',
    '/finance/fee-components': 'Komponen Biaya',
    '/finance/installments': 'Cicilan',
    '/finance/discounts': 'Beasiswa & Potongan',
    '/finance/ledger': 'Buku Besar',
    '/finance/consolidation': 'Konsolidasi Yayasan',
    '/budget/campus': 'Anggaran per Kampus',
    '/budget/submission': 'Pengajuan Anggaran',
    '/budget/approval': 'Persetujuan Anggaran',
    '/budget/realization': 'Realisasi Anggaran',
    '/budget/variance': 'Analisis Varians',
    '/hr/positions': 'Struktur Jabatan',
    '/hr/attendance': 'Kehadiran Pegawai',
    '/hr/leave': 'Cuti Pegawai',
    '/hr/salary-components': 'Komponen Gaji',
    '/hr/reports': 'Laporan SDM',
    '/assets/categories': 'Kategori Aset',
    '/assets/maintenance': 'Pemeliharaan Aset',
    '/assets/reports': 'Laporan Aset',
    '/procurement/approval': 'Persetujuan Pengadaan',
    '/procurement/receipt': 'Penerimaan Barang',
    '/pddikti/students': 'Validasi Mahasiswa PDDIKTI',
    '/pddikti/lecturers': 'Validasi Dosen PDDIKTI',
    '/pddikti/grades': 'Validasi Nilai & KRS',
    '/pddikti/queue': 'Antrean Sinkronisasi',
    '/pddikti/history': 'Riwayat Sinkronisasi',
    '/settings/preferences': 'Preferensi Sistem',
  };
  const title = Object.entries(labels).find(([k]) => path.startsWith(k))?.[1] || 'Halaman Ini';
  const segment = path.split('/').slice(1, 2)[0] || '';
  const moduleLabels = { organization:'Organisasi', admissions:'PMB', students:'Mahasiswa', lecturers:'Dosen',
    academic:'Akademik', learning:'Pembelajaran', thesis:'Tugas Akhir', finance:'Keuangan',
    budget:'Anggaran', hr:'SDM & Payroll', assets:'Aset', pddikti:'PDDIKTI', settings:'Pengaturan' };
  const moduleLabel = moduleLabels[segment] || '';
  return `<div class="page-container">
    <div class="not-found-page">
      <div style="font-size:3.5rem;color:var(--color-gold-500);margin-bottom:0.5rem"><i class="bi bi-tools"></i></div>
      <h1 class="not-found-title" style="font-size:1.5rem">${title}</h1>
      <p class="not-found-desc">Halaman ini sedang dalam pengembangan.${moduleLabel ? `<br>Modul: <strong>${moduleLabel}</strong>` : ''}<br><span style="font-size:0.8rem;color:var(--color-muted)">Path: <code>${path}</code></span></p>
      <div class="info-box info-box-warning" style="max-width:400px;margin:1rem auto;text-align:left">
        <i class="bi bi-lightning-fill"></i> Prototype Demo — Fitur ini akan tersedia di iterasi berikutnya.
      </div>
      <a href="${AppState.currentRole.dashboardRoute}" class="btn btn-secondary mt-2">
        <i class="bi bi-house"></i> Kembali ke Dashboard
      </a>
    </div>
  </div>`;
}

/**
 * SIAKAD Cakrawala — Utility Functions
 * Format angka, tanggal, CSV, generate ID, dll.
 */

// ---- Format Rupiah ----
export function formatRupiah(amount) {
  if (amount == null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

// ---- Format Angka ----
export function formatNumber(num) {
  if (num == null || isNaN(num)) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
}

// ---- Format Tanggal Indonesia ----
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatDateRelative(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  return formatDateShort(dateStr);
}

// ---- Generate Demo ID ----
let _idCounter = 1000;
export function generateId(prefix = 'id') {
  _idCounter++;
  return `${prefix}-${Date.now()}-${_idCounter}`;
}

// ---- Slugify ----
export function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ---- Search / Filter ----
export function searchFilter(items, query, fields) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(item =>
    fields.some(f => {
      const val = getNestedValue(item, f);
      return val && String(val).toLowerCase().includes(q);
    })
  );
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
}

// ---- Multi-field Filter ----
export function applyFilters(items, filters) {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === 'all' || value === '') return true;
      const itemVal = getNestedValue(item, key);
      return String(itemVal) === String(value);
    });
  });
}

// ---- Sort ----
export function sortItems(items, key, direction = 'asc') {
  if (!key) return items;
  return [...items].sort((a, b) => {
    const va = getNestedValue(a, key);
    const vb = getNestedValue(b, key);
    if (va == null) return 1;
    if (vb == null) return -1;
    const cmp = typeof va === 'number' && typeof vb === 'number'
      ? va - vb
      : String(va).localeCompare(String(vb), 'id');
    return direction === 'asc' ? cmp : -cmp;
  });
}

// ---- Pagination ----
export function paginate(items, page, perPage = 10) {
  const total = items.length;
  const totalPages = Math.ceil(total / perPage);
  const safeP = Math.max(1, Math.min(page, totalPages || 1));
  const start = (safeP - 1) * perPage;
  const end = start + perPage;
  return {
    items: items.slice(start, end),
    total,
    page: safeP,
    totalPages,
    perPage,
    start: start + 1,
    end: Math.min(end, total),
  };
}

// ---- Export CSV ----
export function exportCSV(data, filename, headers) {
  if (!data || !data.length) {
    showAlert('Data kosong, tidak ada yang dapat diekspor.', 'warning');
    return;
  }
  const keys = headers ? headers.map(h => h.key) : Object.keys(data[0]);
  const labels = headers ? headers.map(h => h.label) : keys;
  const rows = [
    labels.join(','),
    ...data.map(row =>
      keys.map(k => {
        const val = getNestedValue(row, k) ?? '';
        const s = String(val).replace(/"/g, '""');
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
      }).join(',')
    )
  ];
  const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---- Print ----
export function printContent(htmlContent, title = 'SIAKAD Cakrawala') {
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><title>${title}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12pt; color: #000; margin: 20mm; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #999; padding: 6pt 8pt; text-align: left; }
  th { background: #eee; font-weight: bold; }
  h1 { font-size: 16pt; text-align: center; }
  h2 { font-size: 13pt; }
  .no-print { display: none; }
  @media print { .no-print { display: none; } }
</style>
</head><body>${htmlContent}</body></html>`);
  win.document.close();
  setTimeout(() => { win.print(); }, 400);
}

// ---- Debounce ----
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ---- Truncate ----
export function truncate(str, max = 40) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// ---- Capitalize ----
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ---- Escape HTML ----
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---- IPK Grading ----
export function getGradeFromScore(score) {
  if (score >= 85) return { letter: 'A',  points: 4.0 };
  if (score >= 80) return { letter: 'A-', points: 3.7 };
  if (score >= 75) return { letter: 'B+', points: 3.3 };
  if (score >= 70) return { letter: 'B',  points: 3.0 };
  if (score >= 65) return { letter: 'B-', points: 2.7 };
  if (score >= 60) return { letter: 'C+', points: 2.3 };
  if (score >= 55) return { letter: 'C',  points: 2.0 };
  if (score >= 50) return { letter: 'D',  points: 1.0 };
  return { letter: 'E', points: 0.0 };
}

export function calcIPK(grades) {
  // grades: [{sks, mutu}]
  if (!grades || !grades.length) return 0;
  const totalSks = grades.reduce((s, g) => s + g.sks, 0);
  const totalMutu = grades.reduce((s, g) => s + g.sks * g.mutu, 0);
  return totalSks > 0 ? Math.round((totalMutu / totalSks) * 100) / 100 : 0;
}

// ---- Calculate Final Grade ----
export function calcFinalGrade(tugas, kuis, uts, uas, weights = { tugas: 20, kuis: 20, uts: 30, uas: 30 }) {
  const score = (tugas * weights.tugas + kuis * weights.kuis + uts * weights.uts + uas * weights.uas) / 100;
  return Math.round(score * 10) / 10;
}

// ---- Date helpers ----
export function today() { return new Date().toISOString().slice(0, 10); }
export function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ---- Simple alert helper (used before toast is ready) ----
function showAlert(msg, type = 'info') {
  console.warn(`[SIAKAD][${type.toUpperCase()}]`, msg);
}

// ---- Number abbreviation ----
export function abbreviateNum(num) {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + ' M';
  if (num >= 1_000_000)     return (num / 1_000_000).toFixed(1) + ' Jt';
  if (num >= 1_000)         return (num / 1_000).toFixed(1) + ' Rb';
  return String(num);
}

// ---- Build pagination HTML ----
export function buildPaginationHTML(pag) {
  const { page, totalPages, total, start, end } = pag;
  if (totalPages <= 1) return `<div class="pagination-info">Menampilkan ${total} data</div>`;

  let pages = '';
  const range = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - range && i <= page + range)) {
      pages += `<button class="page-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === page - range - 1 || i === page + range + 1) {
      pages += `<span style="padding:0 4px;color:var(--color-muted)">…</span>`;
    }
  }

  return `
    <div class="pagination-info">Menampilkan ${start}–${end} dari ${formatNumber(total)} data</div>
    <div class="pagination-controls">
      <button class="page-btn" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>
        <i class="bi bi-chevron-left"></i>
      </button>
      ${pages}
      <button class="page-btn" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>
  `;
}

// ---- Status Badge HTML ----
export function statusBadge(status, customMap = {}) {
  const map = {
    // Academic status
    'aktif':           'badge-active',
    'cuti':            'badge-warning',
    'nonaktif':        'badge-danger',
    'lulus':           'badge-success',
    'alumni':          'badge-muted',
    'dropout':         'badge-danger',
    'drop out':        'badge-danger',
    'mengundurkan diri':'badge-muted',
    // PMB status
    'draft':           'badge-info',
    'dikirim':         'badge-info',
    'terverifikasi':   'badge-active',
    'menunggu verifikasi': 'badge-warning',
    'perlu perbaikan': 'badge-warning',
    'menunggu seleksi':'badge-info',
    'lulus seleksi':   'badge-success',
    'tidak lulus':     'badge-danger',
    'daftar ulang':    'badge-gold',
    'menjadi mahasiswa':'badge-success',
    // Finance
    'lunas':           'badge-success',
    'dibayar sebagian':'badge-warning',
    'terbit':          'badge-info',
    'jatuh tempo':     'badge-danger',
    'dibatalkan':      'badge-muted',
    'pending':         'badge-warning',
    // KRS
    'diajukan':        'badge-info',
    'disetujui':       'badge-success',
    'perlu revisi':    'badge-warning',
    'final':           'badge-success',
    'belum dibuat':    'badge-muted',
    'menunggu persetujuan dosen wali': 'badge-info',
    // Registrasi semester
    'belum registrasi': 'badge-warning',
    'menunggu pembayaran': 'badge-warning',
    'menunggu validasi': 'badge-info',
    'teregistrasi':    'badge-success',
    // Budget
    'diajukan anggaran':'badge-info',
    'perlu revisi':    'badge-warning',
    'ditolak':         'badge-danger',
    // Payroll
    'diperiksa':       'badge-warning',
    // PDDIKTI
    'valid':           'badge-success',
    'perlu perbaikan': 'badge-warning',
    'belum divalidasi':'badge-info',
    'siap disinkronkan':'badge-navy',
    'simulasi berhasil':'badge-success',
    'simulasi gagal':  'badge-danger',
    'antrean':         'badge-info',
    // Asset
    'baik':            'badge-success',
    'rusak':           'badge-danger',
    'sedang':          'badge-warning',
    // Employee
    'tetap':           'badge-active',
    'kontrak':         'badge-warning',
    'honorer':         'badge-info',
    // General
    'selesai':         'badge-muted',
    'aktif':           'badge-active',
    'nonaktif':        'badge-danger',
    ...customMap,
  };
  const cls = map[status?.toLowerCase()] || 'badge-muted';
  return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}


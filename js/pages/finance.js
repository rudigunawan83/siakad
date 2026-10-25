/**
 * SIAKAD â€” Finance Pages
 */
import { DB } from '../data/seed.js';
import { AppState } from '../state.js?v=20261025ab';
import { formatRupiah, formatDate, statusBadge, exportCSV, generateId, today } from '../utils.js';
import { DataTable } from '../components/data-table.js';
import { openFormModal } from '../components/modal.js';
import { showToast, showConfirm } from '../components/toast.js';
import { createBarChart, createLineChart, createDoughnutChart, formatRupiahShort } from '../components/charts.js';

let _table;

function parseDateOnly(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isPastDue(invoice, referenceDate = today()) {
  if (!invoice || (invoice.remaining || 0) <= 0 || invoice.status === 'dibatalkan') return false;
  const due = parseDateOnly(invoice.dueDate);
  const ref = parseDateOnly(referenceDate) || new Date();
  return !!due && due < ref;
}

function getFilteredInvoices() {
  const invoices = DB.getAll('invoices');
  const campusFilter = AppState.currentCampusFilter;
  return campusFilter === 'all' ? invoices : invoices.filter(i => i.campusId === campusFilter);
}

function getFilteredPayments() {
  const payments = DB.getAll('payments');
  const invoiceMap = new Map(DB.getAll('invoices').map(i => [i.id, i]));
  const campusFilter = AppState.currentCampusFilter;
  if (campusFilter === 'all') return payments;
  return payments.filter(p => p.campusId === campusFilter || invoiceMap.get(p.invoiceId)?.campusId === campusFilter);
}

function getFilteredJournals() {
  const journals = DB.getAll('journals');
  const campusFilter = AppState.currentCampusFilter;
  return campusFilter === 'all' ? journals : journals.filter(j => j.campusId === campusFilter);
}

function getSemesterMonths() {
  return [
    { key: '2026-07', label: 'Jul' },
    { key: '2026-08', label: 'Agu' },
    { key: '2026-09', label: 'Sep' },
    { key: '2026-10', label: 'Okt' },
    { key: '2026-11', label: 'Nov' },
    { key: '2026-12', label: 'Des' },
  ];
}

function buildMonthlyTotals(rows, dateField, amountField, months = getSemesterMonths()) {
  const byMonth = Object.fromEntries(months.map(m => [m.key, 0]));
  rows.forEach((row) => {
    const key = String(row?.[dateField] || '').slice(0, 7);
    if (byMonth[key] !== undefined) byMonth[key] += Number(row?.[amountField] || 0);
  });
  return months.map(m => byMonth[m.key]);
}

function getExpenseJournalRows(journals) {
  const expenseAccountIds = new Set(
    DB.getAll('chartOfAccounts')
      .filter(account => account.type === 'Beban')
      .map(account => account.id)
  );
  return journals.filter(journal => expenseAccountIds.has(journal.debit));
}

function buildAgingBuckets(invoices, referenceDate = today()) {
  const ref = parseDateOnly(referenceDate) || new Date();
  const buckets = [
    { label: '0–30 hari', amount: 0, count: 0, color: 'var(--color-success)' },
    { label: '31–60 hari', amount: 0, count: 0, color: 'var(--color-warning)' },
    { label: '61–90 hari', amount: 0, count: 0, color: 'var(--color-warning)' },
    { label: '>90 hari', amount: 0, count: 0, color: 'var(--color-danger)' },
  ];

  invoices
    .filter(i => (i.remaining || 0) > 0 && i.status !== 'dibatalkan')
    .forEach((invoice) => {
      const due = parseDateOnly(invoice.dueDate);
      const daysPastDue = due ? Math.max(0, Math.floor((ref - due) / 86400000)) : 0;
      const balance = invoice.remaining || 0;

      let bucketIndex = 0;
      if (daysPastDue > 90) bucketIndex = 3;
      else if (daysPastDue > 60) bucketIndex = 2;
      else if (daysPastDue > 30) bucketIndex = 1;

      buckets[bucketIndex].amount += balance;
      buckets[bucketIndex].count += 1;
    });

  const totalBalance = buckets.reduce((sum, bucket) => sum + bucket.amount, 0);
  const totalCount = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

  return [
    ...buckets,
    { label: 'Total', amount: totalBalance, count: totalCount, color: 'var(--color-navy-800)' },
  ];
}

export function renderFinance(path, container) {
  if (path.includes('/fee-components')) return renderFeeComponents(container);
  if (path.includes('/payments'))    return renderPayments(container);
  if (path.includes('/receivables')) return renderReceivables(container);
  if (path.includes('/installments')) return renderInstallments(container);
  if (path.includes('/discounts'))   return renderDiscounts(container);
  if (path.includes('/journals'))    return renderJournals(container);
  if (path.includes('/ledger'))      return renderLedger(container);
  if (path.includes('/coa'))         return renderCOA(container);
  if (path.includes('/consolidation')) return renderConsolidation(container);
  if (path.includes('/reports'))     return renderFinanceReports(container);
  if (path.includes('/invoices'))    return renderInvoices(container);
  // Default: dashboard
  renderFinanceDashboard(container);
}

// ---- Finance Dashboard ----
function renderFinanceDashboard(container) {
  const filtInv = getFilteredInvoices();
  const filtPayments = getFilteredPayments();
  const agingBuckets = buildAgingBuckets(filtInv);

  const totalBilled   = filtInv.reduce((s,i)=>s+i.amount,0);
  const totalPaid     = filtInv.reduce((s,i)=>s+i.paid,0);
  const totalOverdue  = filtInv.filter(i=>isPastDue(i)).reduce((s,i)=>s+i.remaining,0);
  const totalPartial  = filtInv.filter(i=>i.status==='dibayar sebagian').reduce((s,i)=>s+i.remaining,0);
  const collectRate   = totalBilled>0 ? Math.round(totalPaid/totalBilled*100) : 0;
  const months = getSemesterMonths();
  const monthlyReceipts = buildMonthlyTotals(filtPayments, 'date', 'amount', months);

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info">
      <h1 class="page-title">Dashboard Keuangan</h1>
      <p class="page-desc">Ringkasan keuangan Semester Ganjil 2026/2027</p>
    </div>
    <div class="page-actions">
      <a href="#/finance/invoices" class="btn btn-secondary"><i class="bi bi-receipt"></i> Tagihan</a>
      <a href="#/finance/payments" class="btn btn-secondary"><i class="bi bi-cash"></i> Pembayaran</a>
      <a href="#/finance/reports" class="btn btn-accent"><i class="bi bi-file-earmark-bar-graph"></i> Laporan</a>
    </div>
  </div>
  <div class="kpi-grid">
    <div class="kpi-card kpi-card-navy"><div class="kpi-icon" style="background:#21355015;color:var(--color-navy-800)"><i class="bi bi-receipt-cutoff"></i></div><div class="kpi-value">${formatRupiah(totalBilled)}</div><div class="kpi-label">Total Tagihan</div></div>
    <div class="kpi-card kpi-card-success"><div class="kpi-icon" style="background:#19875415;color:var(--color-success)"><i class="bi bi-cash-coin"></i></div><div class="kpi-value">${formatRupiah(totalPaid)}</div><div class="kpi-label">Total Terbayar</div><div class="kpi-trend up"><i class="bi bi-arrow-up-short"></i> Collection Rate: ${collectRate}%</div></div>
    <div class="kpi-card kpi-card-danger"><div class="kpi-icon" style="background:#dc354515;color:var(--color-danger)"><i class="bi bi-exclamation-circle"></i></div><div class="kpi-value">${formatRupiah(totalOverdue)}</div><div class="kpi-label">Tagihan Jatuh Tempo</div></div>
    <div class="kpi-card kpi-card-warning"><div class="kpi-icon" style="background:#d9770615;color:var(--color-warning)"><i class="bi bi-hourglass-split"></i></div><div class="kpi-value">${formatRupiah(totalPartial)}</div><div class="kpi-label">Sisa Cicilan</div></div>
  </div>

  <!-- Collection Rate -->
  <div class="card" style="margin-bottom:1.5rem">
    <div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
        <span style="font-size:var(--text-sm);font-weight:var(--font-semibold)">Tingkat Kolektibilitas</span>
        <strong style="color:${collectRate>=80?'var(--color-success)':'var(--color-warning)'}">${collectRate}%</strong>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill ${collectRate>=80?'fill-success':'fill-warning'}" style="width:${collectRate}%"></div>
      </div>
    </div>
  </div>

  <div class="chart-grid">
    <div class="chart-card">
      <div class="chart-card-header"><h3 class="chart-card-title">Tren Penerimaan Bulanan</h3></div>
      <div class="chart-wrapper" style="height:240px"><canvas id="rev-monthly"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header"><h3 class="chart-card-title">Status Tagihan</h3></div>
      <div class="chart-wrapper" style="height:240px"><canvas id="inv-status"></canvas></div>
    </div>
  </div>

  <!-- Aging Analysis -->
  <div class="card" style="margin-top:1.5rem">
    <div class="card-header"><h3 class="card-title">Analisis Piutang (Aging)</h3></div>
    <div class="card-body">
      <div class="aging-grid">
        ${agingBuckets.map(b=>`
          <div class="aging-bucket">
            <div class="aging-bucket-label">${b.label}</div>
            <div class="aging-bucket-value" style="color:${b.color}">${formatRupiah(b.amount)}</div>
            <div class="aging-bucket-count">${b.count} tagihan</div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Quick Access COA -->
  <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-top:1.5rem">
    <a href="#/finance/journals" class="btn btn-secondary"><i class="bi bi-journal-text"></i> Jurnal Umum</a>
    <a href="#/finance/ledger" class="btn btn-secondary"><i class="bi bi-book"></i> Buku Besar</a>
    <a href="#/finance/coa" class="btn btn-secondary"><i class="bi bi-list-nested"></i> Bagan Akun (COA)</a>
    <a href="#/finance/consolidation" class="btn btn-secondary"><i class="bi bi-building"></i> Konsolidasi Yayasan</a>
  </div>
</div>`;

  requestAnimationFrame(() => {
    createLineChart('rev-monthly', {
      labels: months.map(month => month.label),
      datasets:[{ label:'Penerimaan', data: monthlyReceipts, color:'#213550' }],
      height:240, fill:true, formatY: formatRupiahShort,
    });
    const statusGroups = {};
    filtInv.forEach(i=>{ statusGroups[i.status]=(statusGroups[i.status]||0)+1; });
    createDoughnutChart('inv-status', {
      labels: Object.keys(statusGroups),
      data: Object.values(statusGroups),
      colors:['#198754','#d97706','#dc3545','#0d6efd','#9ca3af'],
      height: 240,
    });
  });
}

// ---- Invoices ----
function renderInvoices(container) {
  const campuses = DB.getAll('campuses');
  const statusOpts = ['all','lunas','dibayar sebagian','terbit','jatuh tempo','dibatalkan'].map(s=>({value:s,label:s==='all'?'Semua Status':s}));
  const typeOpts = ['all','UKT','Biaya Pendaftaran','Biaya Wisuda'].map(s=>({value:s,label:s==='all'?'Semua Jenis':s}));

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Tagihan Mahasiswa</h1><p class="page-desc">Kelola tagihan UKT dan biaya akademik</p></div>
    <div class="page-actions">
      <button class="btn btn-secondary" id="exp-csv"><i class="bi bi-download"></i> Export</button>
      <button class="btn btn-accent" id="add-inv"><i class="bi bi-plus-lg"></i> Buat Tagihan</button>
    </div>
  </div>
  <div class="filter-bar" style="border-radius:var(--radius-lg) var(--radius-lg) 0 0;margin-bottom:0">
    <div class="search-input" style="flex:1;min-width:160px"><i class="bi bi-search"></i><input type="text" id="inv-search" placeholder="Cari nama, NIM, no. tagihan..."></div>
    <select class="filter-select" id="status-f">${statusOpts.map(o=>`<option value="${o.value}">${o.label}</option>`).join('')}</select>
    <select class="filter-select" id="type-f">${typeOpts.map(o=>`<option value="${o.value}">${o.label}</option>`).join('')}</select>
    <button class="btn btn-secondary btn-sm" id="clear-f">Reset</button>
  </div>
  <div id="inv-table"></div>
</div>`;

  const invoices = getFilteredInvoices();

  _table = new DataTable({
    containerId: 'inv-table',
    columns: [
      { key: 'number', label: 'No. Tagihan', render: r=>`<strong>${r.number}</strong>` },
      { key: 'studentName', label: 'Mahasiswa', render: r=>`<div>${r.studentName}</div><div style="font-size:10px;color:var(--color-muted)">${r.nim}</div>` },
      { key: 'type', label: 'Jenis' },
      { key: 'period', label: 'Periode' },
      { key: 'amount', label: 'Tagihan', render: r=>`<strong>${formatRupiah(r.amount)}</strong>` },
      { key: 'paid', label: 'Terbayar', render: r=>`<span style="color:var(--color-success)">${formatRupiah(r.paid)}</span>` },
      { key: 'remaining', label: 'Sisa', render: r=>`<span style="color:${r.remaining>0?'var(--color-danger)':'var(--color-success)'}">${formatRupiah(r.remaining)}</span>` },
      { key: 'dueDate', label: 'Jatuh Tempo', render: r=>formatDate(r.dueDate) },
      { key: 'status', label: 'Status', render: r=>statusBadge(r.status) },
      { key: '_actions', label: 'Aksi', sortable: false, render: r=>`
        <div class="row-actions">
          ${r.status!=='lunas'?`<button class="btn btn-success btn-sm" data-action="pay" data-id="${r.id}"><i class="bi bi-cash-coin"></i> Bayar</button>`:''}
          <button class="btn btn-secondary btn-icon btn-sm" data-action="print" data-id="${r.id}" title="Cetak"><i class="bi bi-printer"></i></button>
        </div>` },
    ],
    data: invoices,
    searchFields: ['studentName','nim','number'],
    defaultSort: 'dueDate',
    onRowAction: (action, item) => {
      if (action === 'pay') handlePayment(item);
      if (action === 'print') showToast(`Mencetak tagihan ${item.number} (simulasi)...`, 'info');
    },
  });

  // Bind events
  const search = document.getElementById('inv-search');
  let t;
  search?.addEventListener('input', e=>{clearTimeout(t);t=setTimeout(()=>_table?.search(e.target.value),250);});
  document.getElementById('status-f')?.addEventListener('change', e=>_table?.filter('status',e.target.value));
  document.getElementById('type-f')?.addEventListener('change',   e=>_table?.filter('type',e.target.value));
  document.getElementById('clear-f')?.addEventListener('click',   ()=>{ [search,document.getElementById('status-f'),document.getElementById('type-f')].forEach(el=>{if(el)el.value=el.tagName==='SELECT'?el.options[0].value:'';}); _table?.clearFilters(); });
  document.getElementById('exp-csv')?.addEventListener('click', () => exportCSV(invoices,'tagihan',[{key:'number',label:'No Tagihan'},{key:'studentName',label:'Nama'},{key:'type',label:'Jenis'},{key:'amount',label:'Tagihan'},{key:'paid',label:'Terbayar'},{key:'remaining',label:'Sisa'},{key:'status',label:'Status'}]));
}

function handlePayment(invoice) {
  import('../components/modal.js').then(({ openModal }) => {
    openModal({
      title: `Catat Pembayaran â€” ${invoice.number}`,
      body: `
        <div class="info-box info-box-warning" style="margin-bottom:1rem">
          <i class="bi bi-lightning-fill"></i> <strong>Mode Simulasi:</strong> Pembayaran ini hanya dicatat dalam sistem demo.
        </div>
        <div class="stat-row"><span class="stat-row-label">Mahasiswa</span><span class="stat-row-value">${invoice.studentName}</span></div>
        <div class="stat-row"><span class="stat-row-label">Periode</span><span class="stat-row-value">${invoice.period}</span></div>
        <div class="stat-row"><span class="stat-row-label">Sisa Tagihan</span><span class="stat-row-value" style="color:var(--color-danger)">${formatRupiah(invoice.remaining)}</span></div>
        <hr class="divider">
        <div class="form-group">
          <label class="form-label">Jumlah Bayar <span class="required">*</span></label>
          <input type="number" id="pay-amount" class="form-control" value="${invoice.remaining}" min="1" max="${invoice.remaining}">
        </div>
        <div class="form-group">
          <label class="form-label">Metode Pembayaran</label>
          <select class="form-control form-select" id="pay-method">
            <option>Transfer Bank (Simulasi)</option>
            <option>Virtual Account (Simulasi)</option>
            <option>QRIS (Simulasi)</option>
            <option>Tunai (Simulasi)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Catatan</label>
          <input type="text" id="pay-note" class="form-control" placeholder="Catatan opsional">
        </div>`,
      footer: `
        <button class="btn btn-secondary" data-modal-close>Batal</button>
        <button class="btn btn-success" id="confirm-pay">
          <i class="bi bi-cash-coin"></i> Catat Pembayaran (Simulasi)
        </button>`,
    });

    document.getElementById('confirm-pay')?.addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('pay-amount').value);
      const method = document.getElementById('pay-method').value;
      const note   = document.getElementById('pay-note').value;
      if (!amount || amount<=0) { showToast('Jumlah bayar harus lebih dari 0.','warning'); return; }
      if (amount > invoice.remaining) { showToast('Jumlah bayar tidak boleh melebihi sisa tagihan.','warning'); return; }
      const newPaid = invoice.paid + amount;
      const newRemaining = Math.max(0, invoice.remaining - amount);
      const newStatus = newRemaining===0 ? 'lunas' : 'dibayar sebagian';
      DB.update('invoices', invoice.id, { paid: newPaid, remaining: newRemaining, status: newStatus });
      const txNum = `TRX-${Date.now()}`;
      DB.add('payments', { id: generateId('pay'), txNum, date: today(), studentId: invoice.studentId, studentName: invoice.studentName, campusId: invoice.campusId, invoiceId: invoice.id, method, amount, status: 'berhasil', officer: `${AppState.currentRole.user} (demo)`, note: `[SIMULASI] ${note}` });
      DB.log('Catat Pembayaran Demo', 'Keuangan', `Tagihan: ${invoice.number}`);
      import('../components/modal.js').then(m=>m.closeModal());
      showToast(`Pembayaran ${formatRupiah(amount)} untuk ${invoice.studentName} berhasil dicatat (simulasi).`, 'success');
      _table?.setData(DB.getAll('invoices'));
    });
  });
}

// ---- Payments ----
function renderPayments(container) {
  const payments = getFilteredPayments();
  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Riwayat Pembayaran</h1><p class="page-desc">Semua transaksi pembayaran mahasiswa</p></div>
    <div class="page-actions"><button class="btn btn-secondary" id="exp-csv"><i class="bi bi-download"></i> Export</button></div>
  </div>
  <div id="pay-table"></div>
</div>`;

  const table = new DataTable({
    containerId: 'pay-table',
    columns: [
      { key:'txNum', label:'No. Transaksi', render:r=>`<strong>${r.txNum}</strong>` },
      { key:'date', label:'Tanggal', render:r=>formatDate(r.date) },
      { key:'studentName', label:'Mahasiswa' },
      { key:'method', label:'Metode' },
      { key:'amount', label:'Jumlah', render:r=>`<strong style="color:var(--color-success)">${formatRupiah(r.amount)}</strong>` },
      { key:'status', label:'Status', render:r=>statusBadge(r.status) },
      { key:'officer', label:'Dicatat Oleh' },
      { key:'note', label:'Catatan', render:r=>`<span style="font-size:10px;color:var(--color-muted)">${r.note||'-'}</span>` },
    ],
    data: payments,
    searchFields: ['txNum','studentName'],
    defaultSort: 'date',
  });
  document.getElementById('exp-csv')?.addEventListener('click', ()=>exportCSV(payments,'pembayaran',[{key:'txNum',label:'No TRX'},{key:'date',label:'Tgl'},{key:'studentName',label:'Mahasiswa'},{key:'method',label:'Metode'},{key:'amount',label:'Jumlah'},{key:'status',label:'Status'}]));
}

// ---- Receivables ----
function renderReceivables(container) {
  const invoices = getFilteredInvoices().filter(i=>i.remaining>0 && i.status !== 'dibatalkan');
  const total = invoices.reduce((s,i)=>s+i.remaining,0);
  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Piutang Mahasiswa</h1><p class="page-desc">Total piutang: <strong style="color:var(--color-danger)">${formatRupiah(total)}</strong> dari ${invoices.length} tagihan</p></div>
    <div class="page-actions"><button class="btn btn-accent" id="send-reminder"><i class="bi bi-bell"></i> Kirim Reminder (Simulasi)</button></div>
  </div>
  <div id="rcv-table"></div>
</div>`;

  new DataTable({
    containerId:'rcv-table',
    columns:[
      {key:'number',label:'No. Tagihan',render:r=>`<strong>${r.number}</strong>`},
      {key:'studentName',label:'Mahasiswa',render:r=>`<div>${r.studentName}</div><div style="font-size:10px;color:var(--color-muted)">${r.nim}</div>`},
      {key:'period',label:'Periode'},
      {key:'amount',label:'Total',render:r=>formatRupiah(r.amount)},
      {key:'paid',label:'Terbayar',render:r=>`<span style="color:var(--color-success)">${formatRupiah(r.paid)}</span>`},
      {key:'remaining',label:'Piutang',render:r=>`<strong style="color:var(--color-danger)">${formatRupiah(r.remaining)}</strong>`},
      {key:'dueDate',label:'Jatuh Tempo',render:r=>formatDate(r.dueDate)},
      {key:'status',label:'Status',render:r=>statusBadge(r.status)},
    ],
    data:invoices, searchFields:['studentName','number'], defaultSort:'remaining',
  });

  document.getElementById('send-reminder')?.addEventListener('click',()=>showToast(`Reminder dikirim ke ${invoices.length} mahasiswa via email/SMS (simulasi).`,'gold'));
}

// ---- Journals ----
function renderJournals(container) {
  const journals = getFilteredJournals();
  const coa = DB.getAll('chartOfAccounts');
  const getAccName = id => coa.find(c=>c.id===id)?.name||id;
  container.innerHTML=`
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Jurnal Umum</h1><p class="page-desc">Pencatatan transaksi akuntansi (simulasi)</p></div>
    <div class="page-actions"><a href="#/finance/coa" class="btn btn-secondary">Bagan Akun (COA)</a><a href="#/finance/ledger" class="btn btn-secondary">Buku Besar</a></div>
  </div>
  <div class="info-box" style="margin-bottom:1rem"><i class="bi bi-lightning-fill"></i> Jurnal di bawah ini merupakan simulasi pencatatan akuntansi double-entry untuk keperluan demo.</div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>No. Jurnal</th><th>Tanggal</th><th>Keterangan</th><th>Debit</th><th>Kredit</th><th>Jumlah</th><th>Status</th></tr></thead>
        <tbody>${journals.map(j=>`<tr>
          <td><strong>${j.number}</strong></td>
          <td>${formatDate(j.date)}</td>
          <td style="max-width:300px">${j.description}</td>
          <td style="color:var(--color-success)">${getAccName(j.debit)}</td>
          <td style="color:var(--color-danger)">${getAccName(j.credit)}</td>
          <td><strong>${formatRupiah(j.amount)}</strong></td>
          <td>${statusBadge(j.status==='posted'?'lunas':j.status)}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>
  </div>
</div>`;
}

// ---- COA ----
function renderCOA(container) {
  const coa = DB.getAll('chartOfAccounts');
  container.innerHTML=`
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Bagan Akun (COA)</h1><p class="page-desc">Daftar kode akun keuangan yayasan</p></div>
  </div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Kode</th><th>Nama Akun</th><th>Tipe</th><th>Kategori</th><th>Level</th><th>Status</th></tr></thead>
        <tbody>${coa.map(c=>`<tr>
          <td><code>${c.code}</code></td>
          <td style="padding-left:${(c.level-1)*1.5}rem">${c.name}</td>
          <td>${c.type}</td>
          <td>${c.category}</td>
          <td>${c.level}</td>
          <td>${statusBadge(c.status)}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>
  </div>
</div>`;
}

function renderFeeComponents(container) {
  const grouped = Object.values(getFilteredInvoices().reduce((acc, invoice) => {
    const key = invoice.type || 'Lainnya';
    if (!acc[key]) acc[key] = { type: key, invoiceCount: 0, billed: 0, paid: 0, remaining: 0 };
    acc[key].invoiceCount += 1;
    acc[key].billed += invoice.amount || 0;
    acc[key].paid += invoice.paid || 0;
    acc[key].remaining += invoice.remaining || 0;
    return acc;
  }, {}));

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Komponen Biaya</h1><p class="page-desc">Ringkasan jenis tagihan yang aktif di modul keuangan</p></div>
  </div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Komponen</th><th>Jumlah Tagihan</th><th>Nilai Tagihan</th><th>Terbayar</th><th>Balance</th></tr></thead>
        <tbody>${grouped.map(row => `
          <tr>
            <td><strong>${row.type}</strong></td>
            <td>${row.invoiceCount}</td>
            <td>${formatRupiah(row.billed)}</td>
            <td style="color:var(--color-success)">${formatRupiah(row.paid)}</td>
            <td style="color:${row.remaining > 0 ? 'var(--color-danger)' : 'var(--color-success)'}">${formatRupiah(row.remaining)}</td>
          </tr>`).join('') || '<tr><td colspan="5">Belum ada komponen biaya.</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
}

function renderInstallments(container) {
  const invoices = getFilteredInvoices().filter(i => i.status === 'dibayar sebagian' && (i.remaining || 0) > 0);
  const totalRemaining = invoices.reduce((sum, invoice) => sum + (invoice.remaining || 0), 0);
  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Cicilan</h1><p class="page-desc">Monitoring tagihan yang sedang dibayar sebagian. Total balance: <strong style="color:var(--color-warning)">${formatRupiah(totalRemaining)}</strong></p></div>
  </div>
  <div id="installment-table"></div>
</div>`;

  new DataTable({
    containerId: 'installment-table',
    columns: [
      { key:'number', label:'No. Tagihan', render:r=>`<strong>${r.number}</strong>` },
      { key:'studentName', label:'Mahasiswa', render:r=>`<div>${r.studentName}</div><div style="font-size:10px;color:var(--color-muted)">${r.nim}</div>` },
      { key:'type', label:'Jenis' },
      { key:'amount', label:'Total', render:r=>formatRupiah(r.amount) },
      { key:'paid', label:'Terbayar', render:r=>`<span style="color:var(--color-success)">${formatRupiah(r.paid)}</span>` },
      { key:'remaining', label:'Sisa Cicilan', render:r=>`<strong style="color:var(--color-warning)">${formatRupiah(r.remaining)}</strong>` },
      { key:'dueDate', label:'Jatuh Tempo', render:r=>formatDate(r.dueDate) },
    ],
    data: invoices,
    searchFields: ['number', 'studentName', 'nim'],
    defaultSort: 'remaining',
  });
}

function renderDiscounts(container) {
  const students = DB.getAll('students');
  const campusFilter = AppState.currentCampusFilter;
  const scholarships = DB.getAll('scholarships').filter((item) => {
    const student = students.find(s => s.id === item.studentId);
    return campusFilter === 'all' || student?.campusId === campusFilter;
  }).map((item) => {
    const student = students.find(s => s.id === item.studentId);
    return { ...item, studentName: student?.name || '-', nim: student?.nim || '-', campusId: student?.campusId || null };
  });
  const totalScholarship = scholarships.reduce((sum, item) => sum + (item.amount || 0), 0);

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Beasiswa & Potongan</h1><p class="page-desc">Total nilai keringanan aktif: <strong style="color:var(--color-success)">${formatRupiah(totalScholarship)}</strong></p></div>
  </div>
  <div id="discount-table"></div>
</div>`;

  new DataTable({
    containerId: 'discount-table',
    columns: [
      { key:'name', label:'Program', render:r=>`<strong>${r.name}</strong>` },
      { key:'studentName', label:'Mahasiswa', render:r=>`<div>${r.studentName}</div><div style="font-size:10px;color:var(--color-muted)">${r.nim}</div>` },
      { key:'type', label:'Jenis' },
      { key:'period', label:'Periode' },
      { key:'amount', label:'Nominal', render:r=>`<span style="color:var(--color-success)">${formatRupiah(r.amount)}</span>` },
      { key:'status', label:'Status', render:r=>statusBadge(r.status) },
    ],
    data: scholarships,
    searchFields: ['name', 'studentName', 'nim', 'period'],
    defaultSort: 'amount',
  });
}

function renderLedger(container) {
  const journals = getFilteredJournals();
  const coa = DB.getAll('chartOfAccounts');
  const rows = coa.map((account) => {
    const debit = journals.filter(j => j.debit === account.id).reduce((sum, row) => sum + (row.amount || 0), 0);
    const credit = journals.filter(j => j.credit === account.id).reduce((sum, row) => sum + (row.amount || 0), 0);
    const normalDebit = ['Aset', 'Beban'].includes(account.type);
    const balance = normalDebit ? debit - credit : credit - debit;
    return { ...account, debit, credit, balance };
  }).filter(row => row.debit > 0 || row.credit > 0);

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Buku Besar</h1><p class="page-desc">Ringkasan saldo akun berdasarkan jurnal yang tercatat</p></div>
    <div class="page-actions"><a href="#/finance/journals" class="btn btn-secondary">Jurnal Umum</a><a href="#/finance/coa" class="btn btn-secondary">Bagan Akun</a></div>
  </div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Kode</th><th>Akun</th><th>Tipe</th><th>Total Debit</th><th>Total Kredit</th><th>Balance</th></tr></thead>
        <tbody>${rows.map(row => `
          <tr>
            <td><code>${row.code}</code></td>
            <td>${row.name}</td>
            <td>${row.type}</td>
            <td style="color:var(--color-success)">${formatRupiah(row.debit)}</td>
            <td style="color:var(--color-danger)">${formatRupiah(row.credit)}</td>
            <td><strong style="color:${row.balance < 0 ? 'var(--color-danger)' : 'var(--color-navy-900)'}">${formatRupiah(Math.abs(row.balance))}</strong></td>
          </tr>`).join('') || '<tr><td colspan="6">Belum ada mutasi jurnal.</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
}

function renderConsolidation(container) {
  const campuses = DB.getAll('campuses');
  const invoices = getFilteredInvoices();
  const rows = (AppState.currentCampusFilter === 'all' ? campuses : campuses.filter(c => c.id === AppState.currentCampusFilter)).map((campus) => {
    const items = invoices.filter(invoice => invoice.campusId === campus.id);
    return {
      campus: campus.name,
      billed: items.reduce((sum, invoice) => sum + (invoice.amount || 0), 0),
      paid: items.reduce((sum, invoice) => sum + (invoice.paid || 0), 0),
      remaining: items.reduce((sum, invoice) => sum + (invoice.remaining || 0), 0),
      invoiceCount: items.length,
    };
  });

  container.innerHTML = `
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Konsolidasi Yayasan</h1><p class="page-desc">Ringkasan keuangan lintas kampus berdasarkan tagihan dan pembayaran</p></div>
  </div>
  <div class="card">
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Kampus</th><th>Jumlah Tagihan</th><th>Total Tagihan</th><th>Total Terbayar</th><th>Balance</th></tr></thead>
        <tbody>${rows.map(row => `
          <tr>
            <td><strong>${row.campus}</strong></td>
            <td>${row.invoiceCount}</td>
            <td>${formatRupiah(row.billed)}</td>
            <td style="color:var(--color-success)">${formatRupiah(row.paid)}</td>
            <td style="color:${row.remaining > 0 ? 'var(--color-danger)' : 'var(--color-success)'}">${formatRupiah(row.remaining)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
</div>`;
}

// ---- Finance Reports ----
function renderFinanceReports(container) {
  const invoices = getFilteredInvoices();
  const payments = getFilteredPayments();
  const journals = getFilteredJournals();
  const campuses = DB.getAll('campuses');
  const filteredCampuses = AppState.currentCampusFilter === 'all'
    ? campuses
    : campuses.filter(c => c.id === AppState.currentCampusFilter);
  const totalRev = invoices.reduce((s,i)=>s+(i.paid||0),0);
  const paidUKT = invoices.filter(i => i.type === 'UKT').reduce((s, i) => s + (i.paid || 0), 0);
  const paidRegistration = invoices.filter(i => i.type === 'Biaya Pendaftaran').reduce((s, i) => s + (i.paid || 0), 0);
  const otherIncome = invoices
    .filter(i => !['UKT', 'Biaya Pendaftaran'].includes(i.type))
    .reduce((s, i) => s + (i.paid || 0), 0);
  const expenseRows = getExpenseJournalRows(journals);
  const totalExpense = expenseRows.reduce((s, row) => s + (row.amount || 0), 0);
  const months = getSemesterMonths();
  const monthlyRevenue = buildMonthlyTotals(payments, 'date', 'amount', months);
  const monthlyExpense = buildMonthlyTotals(expenseRows, 'date', 'amount', months);
  container.innerHTML=`
<div class="page-container">
  <div class="page-header">
    <div class="page-header-info"><h1 class="page-title">Laporan Keuangan</h1></div>
    <div class="page-actions"><button class="btn btn-secondary" onclick="window.print()"><i class="bi bi-printer"></i> Cetak</button></div>
  </div>
  <div class="info-box info-box-warning" style="margin-bottom:1.5rem"><i class="bi bi-exclamation-triangle"></i> Laporan ini adalah <strong>simulasi demo</strong>. Data tidak mencerminkan kondisi keuangan sesungguhnya.</div>
  <div class="chart-grid">
    <div class="chart-card">
      <div class="chart-card-header"><h3 class="chart-card-title">Pendapatan per Kampus</h3></div>
      <div class="chart-wrapper" style="height:220px"><canvas id="rpt-campus"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header"><h3 class="chart-card-title">Pendapatan vs Beban</h3></div>
      <div class="chart-wrapper" style="height:220px"><canvas id="rpt-pnl"></canvas></div>
    </div>
  </div>
  <div class="card" style="margin-top:1.5rem">
    <div class="card-header"><h3 class="card-title">Laporan Laba Rugi â€” Simulasi Q3 2026</h3></div>
    <div class="card-body">
      ${[
        { label: 'Pendapatan UKT', amount: paidUKT, type: 'income' },
        { label: 'Pendapatan Biaya Pendaftaran', amount: paidRegistration, type: 'income' },
        { label: 'Pendapatan Lain-lain', amount: otherIncome, type: 'income' },
        { label: 'Total Beban Tercatat', amount: -totalExpense, type: 'expense' },
      ].map(r=>`
        <div class="stat-row">
          <span class="stat-row-label" style="color:${r.type==='expense'?'var(--color-danger)':'inherit'}">${r.label}</span>
          <span class="stat-row-value" style="color:${r.type==='expense'?'var(--color-danger)':'var(--color-success)'}">${formatRupiah(Math.abs(r.amount))}</span>
        </div>`).join('')}
      <div class="stat-row" style="border-top:2px solid var(--color-navy-900);margin-top:0.5rem;padding-top:0.5rem">
        <span class="stat-row-label" style="font-weight:700;color:var(--color-navy-900)">Surplus / (Defisit)</span>
        <span class="stat-row-value" style="font-weight:700;font-size:1rem;color:var(--color-navy-900)">${formatRupiah(totalRev-totalExpense)}</span>
      </div>
    </div>
  </div>
</div>`;
  requestAnimationFrame(()=>{
    createBarChart('rpt-campus',{
      labels: filteredCampuses.map(c=>c.code),
      datasets:[{
        label:'Penerimaan',
        data: filteredCampuses.map(c=>invoices.filter(i=>i.campusId===c.id).reduce((s,i)=>s+(i.paid||0),0)),
        color:'#213550'
      }],
      height:220,
      formatY:formatRupiahShort
    });
    createBarChart('rpt-pnl',{
      labels: months.slice(0, 4).map(month => month.label),
      datasets:[
        {label:'Pendapatan',data:monthlyRevenue.slice(0, 4),color:'#198754'},
        {label:'Beban',data:monthlyExpense.slice(0, 4),color:'#dc3545'}
      ],
      height:220,
      formatY:formatRupiahShort
    });
  });
}

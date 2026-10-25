/**
 * SIAKAD — Portal Mahasiswa, Dosen, Orang Tua
 */
import { DB } from '../data/seed.js';
import { AppState } from '../state.js';
import { formatRupiah, formatDate, statusBadge } from '../utils.js';
import { showToast } from '../components/toast.js';
import { createDoughnutChart, createBarChart } from '../components/charts.js';
import {
  renderStudentKrsEdit,
  renderStudentKrsView,
  renderStudentKrsPrint,
} from './student-krs.js';
import { renderStudentRegistration } from './registration.js';
import { renderStudentPortalExtra, renderStudentDashboard } from './student-portal.js';
export { renderLecturerPortal } from './lecturer-portal.js';

// ===================== STUDENT PORTAL =====================
export function renderStudentPortal(path, container) {
  if (path.includes('/registration')) return renderStudentRegistration(path, container);
  if (path.includes('/krs/edit')) return renderStudentKrsEdit(path, container);
  if (path.includes('/krs/print')) return renderStudentKrsPrint(path, container);
  if (path.includes('/krs')) return renderStudentKrsView(path, container);

  // Subhalaman 8.1 (profil, KHS, jadwal, keuangan, dll.) atau dashboard
  const isRoot = path === '/portal/student' || path === '/portal/student/';
  if (!isRoot) return renderStudentPortalExtra(path, container);
  return renderStudentDashboard(container);
}

function buildStudentBeranda(student, advisor, notifs, campus) {
  const calendar = DB.getAll('academicCalendar').slice(0, 5);
  return `
<div class="portal-grid">
  <div>
    <div class="card" style="margin-bottom:1rem">
      <div class="card-header"><h3 class="card-title">Informasi Pribadi</h3></div>
      <div class="card-body">
        ${[
          ['NIM', student.nim],
          ['Nama', student.name],
          ['Email', student.email],
          ['No. HP', student.phone],
          ['Jenis Kelamin', student.gender==='L'?'Laki-laki':'Perempuan'],
          ['Tgl. Lahir', formatDate(student.dob)],
          ['Alamat', student.address],
          ['Dosen Wali', advisor?.name||'-'],
        ].map(([k,v])=>`<div class="stat-row"><span class="stat-row-label">${k}</span><span class="stat-row-value">${v}</span></div>`).join('')}
      </div>
    </div>
  </div>
  <div>
    <div class="card" style="margin-bottom:1rem">
      <div class="card-header"><h3 class="card-title">Notifikasi Terbaru</h3></div>
      <div class="card-body-sm">
        ${notifs.map(n=>`<div class="notif-item"><div class="notif-body"><div class="notif-text"><strong>${n.title}</strong><br>${n.message}</div><div class="notif-time">${formatDate(n.time)}</div></div></div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">Kalender Akademik</h3></div>
      <div class="card-body-sm">
        ${calendar.map(e=>`<div class="stat-row"><span class="stat-row-label" style="font-size:10px">${e.event}</span><span class="stat-row-value" style="font-size:10px">${formatDate(e.startDate)}</span></div>`).join('')}
      </div>
    </div>
  </div>
</div>`;
}

function buildStudentKRS(student, enrolls, classes, courses) {
  const plan = DB.getAll('krsPlans').find(p => p.studentId === student.id && p.semesterId === 'sem-1');
  const items = plan?.items?.length
    ? plan.items
    : enrolls.filter(e => e.status === 'disetujui' || e.status === 'diajukan').map(e => {
        const cl = classes.find(c => c.id === e.classId);
        const co = cl ? courses.find(c => c.id === cl.courseId) : null;
        const lec = cl ? DB.getAll('lecturers').find(l => l.id === cl.lecturerId) : null;
        return {
          code: co?.code, name: co?.name, sks: co?.sks || 0,
          classCode: cl?.code, day: cl?.day, startTime: cl?.startTime, endTime: cl?.endTime,
          room: cl?.room, lecturerName: lec?.name, status: e.status,
        };
      });
  const totalSks = items.reduce((s, i) => s + (i.sks || 0), 0);
  return `
<div class="card">
  <div class="card-header">
    <h3 class="card-title">KRS Semester Ganjil 2026/2027</h3>
    <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
      ${plan ? statusBadge(plan.status) : ''}
      <span class="badge badge-success">${totalSks} SKS</span>
      <a href="#/portal/student/krs/edit" class="btn btn-accent btn-sm"><i class="bi bi-pencil-square"></i> Isi KRS</a>
      <a href="#/portal/student/krs" class="btn btn-secondary btn-sm">Detail</a>
    </div>
  </div>
  <div class="scroll-x">
    <table class="data-table">
      <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Dosen</th><th>Jadwal</th><th>Ruang</th><th>Status</th></tr></thead>
      <tbody>
        ${items.length ? items.map(i => `<tr>
            <td><code>${i.code || '-'}</code></td>
            <td><strong>${i.name || '-'}</strong></td>
            <td><strong>${i.sks || 0}</strong></td>
            <td>${i.lecturerName || '-'}</td>
            <td>${i.day || '-'} ${i.startTime || ''}-${i.endTime || ''}</td>
            <td>${i.room || '-'}</td>
            <td>${statusBadge(i.status || plan?.status || '-')}</td>
          </tr>`).join('') : `<tr><td colspan="7"><div class="empty-state" style="padding:1.25rem"><div class="empty-state-desc">Belum ada mata kuliah. <a href="#/portal/student/krs/edit">Isi KRS</a></div></div></td></tr>`}
      </tbody>
    </table>
  </div>
</div>`;
}

function buildStudentGrades(student, grades, courses) {
  const finalGrades = grades.filter(g => g.status === 'final');
  return `
<div class="portal-grid">
  <div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">Transkrip Nilai Sementara</h3><button class="btn btn-secondary btn-sm" onclick="window.print()"><i class="bi bi-printer"></i> Cetak</button></div>
      <div class="scroll-x">
        <table class="data-table">
          <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Nilai</th><th>Huruf</th><th>Mutu</th></tr></thead>
          <tbody>
            ${finalGrades.map(g=>{const co=courses.find(c=>c.id===g.courseId);return`<tr><td><code>${co?.code||'-'}</code></td><td>${co?.name||'-'}</td><td>${g.sks}</td><td>${g.finalScore?.toFixed(1)||'-'}</td><td><strong style="color:${parseFloat(g.finalScore)>=70?'var(--color-success)':'var(--color-danger)'}">${g.letterGrade||'-'}</strong></td><td>${(g.mutu||0).toFixed(1)}</td></tr>`;}).join('')}
            <tr style="background:var(--color-gold-50);font-weight:var(--font-bold)">
              <td colspan="2">IPK Kumulatif</td>
              <td>${finalGrades.reduce((s,g)=>s+g.sks,0)}</td>
              <td colspan="2"></td>
              <td>${student.ipk.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div>
    <div class="chart-card">
      <div class="chart-card-header"><h3 class="chart-card-title">Distribusi Nilai</h3></div>
      <div class="chart-wrapper" style="height:200px"><canvas id="student-grade-chart"></canvas></div>
    </div>
  </div>
</div>`;
}

function initStudentGradeChart(grades) {
  const final = grades.filter(g=>g.status==='final');
  const dist = {A:0,'A-':0,'B+':0,B:0,'B-':0,'C+':0,C:0,D:0,E:0};
  final.forEach(g=>{ if(dist[g.letterGrade]!==undefined) dist[g.letterGrade]++; });
  createBarChart('student-grade-chart',{labels:Object.keys(dist),datasets:[{label:'Mata Kuliah',data:Object.values(dist),color:'#213550'}],height:200});
}

function buildStudentFinance(student, invoices) {
  const total = invoices.reduce((s,i)=>s+i.amount,0);
  const paid  = invoices.reduce((s,i)=>s+i.paid,0);
  return `
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Tagihan & Pembayaran</h3>
    <span class="badge badge-${student.paymentStatus==='lunas'?'success':'danger'}">${student.paymentStatus}</span>
  </div>
  <div class="card-body" style="display:flex;gap:1.5rem;margin-bottom:1rem;flex-wrap:wrap">
    <div><div style="font-size:var(--text-xs);color:var(--color-muted)">Total Tagihan</div><div style="font-size:1.2rem;font-weight:700">${formatRupiah(total)}</div></div>
    <div><div style="font-size:var(--text-xs);color:var(--color-muted)">Sudah Dibayar</div><div style="font-size:1.2rem;font-weight:700;color:var(--color-success)">${formatRupiah(paid)}</div></div>
    <div><div style="font-size:var(--text-xs);color:var(--color-muted)">Sisa</div><div style="font-size:1.2rem;font-weight:700;color:${total-paid>0?'var(--color-danger)':'var(--color-success)'}">${formatRupiah(total-paid)}</div></div>
  </div>
  <div class="scroll-x">
    <table class="data-table">
      <thead><tr><th>No. Tagihan</th><th>Jenis</th><th>Periode</th><th>Total</th><th>Terbayar</th><th>Sisa</th><th>Jatuh Tempo</th><th>Status</th></tr></thead>
      <tbody>${invoices.map(i=>`<tr>
        <td><strong>${i.number}</strong></td>
        <td>${i.type}</td>
        <td>${i.period}</td>
        <td>${formatRupiah(i.amount)}</td>
        <td style="color:var(--color-success)">${formatRupiah(i.paid)}</td>
        <td style="color:${i.remaining>0?'var(--color-danger)':'inherit'}">${formatRupiah(i.remaining)}</td>
        <td>${formatDate(i.dueDate)}</td>
        <td>${statusBadge(i.status)}</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>
  <div class="info-box info-box-warning" style="margin-top:1rem"><i class="bi bi-lightning-fill"></i> Untuk membayar, hubungi bagian keuangan atau gunakan kode virtual account (simulasi).</div>
</div>`;
}

function buildStudentSchedule(enrolls, classes, courses) {
  const days = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const approved = enrolls.filter(e=>e.status==='disetujui');
  const schedule = {};
  days.forEach(d => schedule[d] = []);
  approved.forEach(e => {
    const cl = classes.find(c=>c.id===e.classId);
    if (cl && schedule[cl.day]) {
      const co = courses.find(c=>c.id===cl.courseId);
      schedule[cl.day].push({ ...cl, courseName: co?.name||'-', sks: co?.sks||0 });
    }
  });
  return `
<div class="portal-schedule">
  ${days.map(d=>`
    <div class="schedule-day">
      <div class="schedule-day-name">${d}</div>
      ${schedule[d].length===0 ? '<div style="font-size:var(--text-xs);color:var(--color-muted);padding:0.5rem">Tidak ada kelas</div>' :
        schedule[d].map(cl=>`
          <div class="schedule-class-card">
            <div class="schedule-class-time">${cl.startTime}–${cl.endTime}</div>
            <div class="schedule-class-name">${cl.courseName}</div>
            <div class="schedule-class-meta">${cl.code} · ${cl.room} · ${cl.sks} SKS</div>
          </div>`).join('')}
    </div>`).join('')}
</div>`;
}

function buildStudentThesis(theses) {
  if (!theses.length) return `<div class="info-box"><i class="bi bi-info-circle"></i> Belum ada pengajuan tugas akhir.</div>`;
  const t = theses[0];
  const lec = DB.getAll('lecturers').find(l=>l.id===t.supervisorId);
  const stages = ['Pengajuan Topik','Proposal','Seminar','Bimbingan','Sidang','Selesai'];
  const stageIdx = stages.indexOf(t.stage);
  return `
<div class="card">
  <div class="card-body">
    <h3 style="font-size:var(--text-md);font-weight:var(--font-semibold);margin-bottom:0.5rem">${t.title}</h3>
    <div class="stat-row"><span class="stat-row-label">Pembimbing</span><span class="stat-row-value">${lec?.name||'-'}</span></div>
    <div class="stat-row"><span class="stat-row-label">Status</span><span class="stat-row-value">${statusBadge(t.status)}</span></div>
    <div class="workflow-steps" style="margin:1.5rem 0">
      ${stages.map((s,i)=>`<div class="workflow-step ${i<stageIdx?'done':i===stageIdx?'active':''}">
        <div class="workflow-step-icon">${i<stageIdx?'<i class="bi bi-check2"></i>':(i+1)}</div>
        <div class="workflow-step-label">${s}</div>
      </div>`).join('')}
    </div>
    <div class="info-box" style="margin-bottom:0"><i class="bi bi-chat-dots"></i> Catatan: ${t.notes}</div>
  </div>
</div>`;
}

// Portal Dosen penuh: lihat lecturer-portal.js (re-export di atas)

// ===================== PARENT PORTAL =====================
export function renderParentPortal(path, container) {
  const role    = AppState.currentRole;
  const student = DB.getAll('students').find(s => s.id === (role.studentId || 'stu-1'));
  if (!student) { container.innerHTML = '<div class="page-container"><p>Data tidak ditemukan.</p></div>'; return; }

  const prodi   = DB.getAll('studyPrograms').find(p=>p.id===student.prodiId);
  const campus  = DB.getAll('campuses').find(c=>c.id===student.campusId);
  const invoices= DB.getAll('invoices').filter(i=>i.studentId===student.id);
  const grades  = DB.getAll('grades').filter(g=>g.studentId===student.id&&g.status==='final');
  const courses = DB.getAll('courses');

  container.innerHTML = `
<div class="page-container portal-container">
  <div class="portal-header-card" style="background:linear-gradient(135deg,#4a2c6b,#6f42c1)">
    <div class="portal-header-avatar"><i class="bi bi-person-heart" style="font-size:1.5rem"></i></div>
    <div class="portal-header-info">
      <div style="font-size:var(--text-xs);opacity:0.7;margin-bottom:4px">Portal Orang Tua/Wali</div>
      <div class="portal-header-name">Pemantauan: ${student.name}</div>
      <div class="portal-header-sub">${student.nim} · ${prodi?.name||'-'} · ${campus?.code||'-'}</div>
    </div>
  </div>

  <!-- Status Cards -->
  <div class="portal-kpi-row">
    <div class="portal-kpi"><div class="portal-kpi-val">${student.status.charAt(0).toUpperCase()+student.status.slice(1)}</div><div class="portal-kpi-lbl"><i class="bi bi-person-check"></i> Status</div></div>
    <div class="portal-kpi"><div class="portal-kpi-val">${student.ipk.toFixed(2)}</div><div class="portal-kpi-lbl"><i class="bi bi-bar-chart"></i> IPK</div></div>
    <div class="portal-kpi"><div class="portal-kpi-val">Sem. ${student.semester}</div><div class="portal-kpi-lbl"><i class="bi bi-calendar"></i> Semester</div></div>
    <div class="portal-kpi" style="${student.paymentStatus==='lunas'?'':'color:var(--color-danger)'}">
      <div class="portal-kpi-val"><i class="bi ${student.paymentStatus==='lunas'?'bi-check-circle-fill':'bi-exclamation-circle-fill'}"></i></div>
      <div class="portal-kpi-lbl">${student.paymentStatus==='lunas'?'UKT Lunas':'Ada Tunggakan'}</div>
    </div>
  </div>

  <!-- Finance Summary -->
  <div class="card" style="margin-bottom:1.5rem">
    <div class="card-header"><h3 class="card-title"><i class="bi bi-cash"></i> Status Keuangan</h3></div>
    <div class="card-body">
      ${invoices.map(i=>`
        <div class="stat-row">
          <div>
            <div style="font-weight:var(--font-semibold)">${i.type} — ${i.period}</div>
            <div style="font-size:10px;color:var(--color-muted)">Jatuh tempo: ${formatDate(i.dueDate)}</div>
          </div>
          <div style="text-align:right">
            <div>${statusBadge(i.status)}</div>
            ${i.remaining>0?`<div style="font-size:10px;color:var(--color-danger)">Sisa: ${formatRupiah(i.remaining)}</div>`:''}
          </div>
        </div>`).join('')}
    </div>
  </div>

  <!-- Academic Summary -->
  <div class="card">
    <div class="card-header"><h3 class="card-title"><i class="bi bi-mortarboard"></i> Ringkasan Nilai</h3><span class="badge badge-gold">IPK ${student.ipk.toFixed(2)}</span></div>
    <div class="scroll-x">
      <table class="data-table">
        <thead><tr><th>Mata Kuliah</th><th>SKS</th><th>Nilai</th><th>Huruf</th></tr></thead>
        <tbody>${grades.map(g=>{const co=courses.find(c=>c.id===g.courseId);return`<tr><td>${co?.name||'-'}</td><td>${g.sks}</td><td>${g.finalScore?.toFixed(1)||'-'}</td><td><strong style="color:${parseFloat(g.finalScore)>=70?'var(--color-success)':'var(--color-danger)'}">${g.letterGrade||'-'}</strong></td></tr>`;}).join('')}</tbody>
      </table>
    </div>
    <div class="info-box info-box-warning" style="margin:0;border-radius:0 0 var(--radius-lg) var(--radius-lg)"><i class="bi bi-shield-check"></i> Data bersifat terbatas sesuai kebijakan privasi mahasiswa.</div>
  </div>
</div>`;
}

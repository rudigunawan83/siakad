/**
 * SIAKAD Cakrawala — Finance, HR & Assets Data Seed
 */

// ===================== FINANCE =====================

export const invoices = [
  { id: 'inv-1', number: 'INV-2026-0001', studentId: 'stu-1', studentName: 'Andi Firmansyah', nim: '2022TIF001', campusId: 'campus-1', type: 'UKT', period: 'Ganjil 2026/2027', dueDate: '2026-09-15', amount: 6500000, paid: 6500000, remaining: 0, status: 'lunas', createdAt: '2026-08-20' },
  { id: 'inv-2', number: 'INV-2026-0002', studentId: 'stu-2', studentName: 'Siti Nurhaliza', nim: '2022TIF002', campusId: 'campus-1', type: 'UKT', period: 'Ganjil 2026/2027', dueDate: '2026-09-15', amount: 6500000, paid: 6500000, remaining: 0, status: 'lunas', createdAt: '2026-08-20' },
  { id: 'inv-3', number: 'INV-2026-0003', studentId: 'stu-3', studentName: 'Budi Prasetyo', nim: '2023TIF001', campusId: 'campus-1', type: 'UKT', period: 'Ganjil 2026/2027', dueDate: '2026-09-15', amount: 5500000, paid: 3000000, remaining: 2500000, status: 'dibayar sebagian', createdAt: '2026-08-20' },
  { id: 'inv-4', number: 'INV-2026-0004', studentId: 'stu-4', studentName: 'Dewi Anggraini', nim: '2023TIF002', campusId: 'campus-1', type: 'UKT', period: 'Ganjil 2026/2027', dueDate: '2026-09-15', amount: 5500000, paid: 5500000, remaining: 0, status: 'lunas', createdAt: '2026-08-20' },
  { id: 'inv-5', number: 'INV-2026-0005', studentId: 'stu-9', studentName: 'Ivan Kurniawan', nim: '2021TIF001', campusId: 'campus-1', type: 'UKT', period: 'Ganjil 2026/2027', dueDate: '2026-09-15', amount: 6500000, paid: 0, remaining: 6500000, status: 'jatuh tempo', createdAt: '2026-08-20' },
  { id: 'inv-6', number: 'INV-2026-0006', studentId: 'stu-6', studentName: 'Fitriani Rahayu', nim: '2022MAN001', campusId: 'campus-1', type: 'UKT', period: 'Ganjil 2026/2027', dueDate: '2026-09-15', amount: 6000000, paid: 6000000, remaining: 0, status: 'lunas', createdAt: '2026-08-20' },
  { id: 'inv-7', number: 'INV-2026-0007', studentId: 'stu-11', studentName: 'Krisna Putra', nim: '2022TI001', campusId: 'campus-2', type: 'UKT', period: 'Ganjil 2026/2027', dueDate: '2026-09-15', amount: 5000000, paid: 5000000, remaining: 0, status: 'lunas', createdAt: '2026-08-20' },
  { id: 'inv-8', number: 'INV-2026-0008', studentId: 'stu-13', studentName: 'Muhamad Rizal', nim: '2024TM001', campusId: 'campus-2', type: 'UKT', period: 'Ganjil 2026/2027', dueDate: '2026-09-15', amount: 4500000, paid: 2000000, remaining: 2500000, status: 'dibayar sebagian', createdAt: '2026-08-20' },
  { id: 'inv-9', number: 'INV-2026-0009', studentId: 'stu-16', studentName: 'Prita Utami', nim: '2022MB001', campusId: 'campus-3', type: 'UKT', period: 'Ganjil 2026/2027', dueDate: '2026-09-15', amount: 4800000, paid: 4800000, remaining: 0, status: 'lunas', createdAt: '2026-08-20' },
  { id: 'inv-10', number: 'INV-2026-0010', studentId: 'stu-19', studentName: 'Surya Pratama', nim: '2022AK001', campusId: 'campus-3', type: 'UKT', period: 'Ganjil 2026/2027', dueDate: '2026-09-15', amount: 4800000, paid: 0, remaining: 4800000, status: 'jatuh tempo', createdAt: '2026-08-20' },
  { id: 'inv-11', number: 'INV-2026-PMB-001', studentId: 'adm-1', studentName: 'Umar Faruq', nim: '-', campusId: 'campus-1', type: 'Biaya Pendaftaran', period: 'PMB 2026/2027', dueDate: '2026-07-10', amount: 350000, paid: 350000, remaining: 0, status: 'lunas', createdAt: '2026-07-05' },
  { id: 'inv-12', number: 'INV-2026-PMB-002', studentId: 'adm-8', studentName: 'Badriyah Khusna', nim: '-', campusId: 'campus-1', type: 'Biaya Pendaftaran', period: 'PMB 2026/2027', dueDate: '2026-07-25', amount: 350000, paid: 0, remaining: 350000, status: 'terbit', createdAt: '2026-07-20' },
];

export const payments = [
  { id: 'pay-1', txNum: 'TRX-2026-0001', date: '2026-09-10', studentId: 'stu-1', studentName: 'Andi Firmansyah', invoiceId: 'inv-1', method: 'Transfer Bank (Simulasi)', amount: 6500000, status: 'berhasil', officer: 'Staf Keuangan (demo)', note: '[SIMULASI] Pembayaran via transfer bank BCA' },
  { id: 'pay-2', txNum: 'TRX-2026-0002', date: '2026-09-11', studentId: 'stu-2', studentName: 'Siti Nurhaliza', invoiceId: 'inv-2', method: 'Virtual Account (Simulasi)', amount: 6500000, status: 'berhasil', officer: 'Sistem (demo)', note: '[SIMULASI] Pembayaran via VA BNI' },
  { id: 'pay-3', txNum: 'TRX-2026-0003', date: '2026-09-08', studentId: 'stu-3', studentName: 'Budi Prasetyo', invoiceId: 'inv-3', method: 'Tunai (Simulasi)', amount: 3000000, status: 'berhasil', officer: 'Staf Keuangan (demo)', note: '[SIMULASI] Pembayaran sebagian, sisa cicil' },
  { id: 'pay-4', txNum: 'TRX-2026-0004', date: '2026-09-12', studentId: 'stu-4', studentName: 'Dewi Anggraini', invoiceId: 'inv-4', method: 'QRIS (Simulasi)', amount: 5500000, status: 'berhasil', officer: 'Sistem (demo)', note: '[SIMULASI] Pembayaran via QRIS' },
  { id: 'pay-5', txNum: 'TRX-2026-0005', date: '2026-09-09', studentId: 'stu-6', studentName: 'Fitriani Rahayu', invoiceId: 'inv-6', method: 'Virtual Account (Simulasi)', amount: 6000000, status: 'berhasil', officer: 'Sistem (demo)', note: '[SIMULASI] Pembayaran via VA Mandiri' },
  { id: 'pay-6', txNum: 'TRX-2026-0006', date: '2026-09-13', studentId: 'stu-11', studentName: 'Krisna Putra', invoiceId: 'inv-7', method: 'Transfer Bank (Simulasi)', amount: 5000000, status: 'berhasil', officer: 'Staf Keuangan (demo)', note: '[SIMULASI] Transfer ke rekening kampus' },
];

export const chartOfAccounts = [
  { id: 'coa-1', code: '1-1100', name: 'Kas dan Setara Kas', type: 'Aset', category: 'Aset Lancar', level: 1, status: 'aktif' },
  { id: 'coa-2', code: '1-1110', name: 'Kas Tunai', type: 'Aset', category: 'Aset Lancar', level: 2, parentId: 'coa-1', status: 'aktif' },
  { id: 'coa-3', code: '1-1120', name: 'Bank BCA', type: 'Aset', category: 'Aset Lancar', level: 2, parentId: 'coa-1', status: 'aktif' },
  { id: 'coa-4', code: '1-1130', name: 'Bank Mandiri', type: 'Aset', category: 'Aset Lancar', level: 2, parentId: 'coa-1', status: 'aktif' },
  { id: 'coa-5', code: '1-1200', name: 'Piutang Mahasiswa', type: 'Aset', category: 'Aset Lancar', level: 1, status: 'aktif' },
  { id: 'coa-6', code: '1-2000', name: 'Aset Tetap', type: 'Aset', category: 'Aset Tidak Lancar', level: 1, status: 'aktif' },
  { id: 'coa-7', code: '2-1000', name: 'Utang Usaha', type: 'Kewajiban', category: 'Kewajiban Lancar', level: 1, status: 'aktif' },
  { id: 'coa-8', code: '3-1000', name: 'Modal/Dana Yayasan', type: 'Ekuitas', category: 'Ekuitas', level: 1, status: 'aktif' },
  { id: 'coa-9', code: '4-1000', name: 'Pendapatan UKT', type: 'Pendapatan', category: 'Pendapatan Operasional', level: 1, status: 'aktif' },
  { id: 'coa-10', code: '4-1100', name: 'Pendapatan Biaya Pendaftaran', type: 'Pendapatan', category: 'Pendapatan Operasional', level: 2, parentId: 'coa-9', status: 'aktif' },
  { id: 'coa-11', code: '5-1000', name: 'Biaya Gaji dan Tunjangan', type: 'Beban', category: 'Beban Operasional', level: 1, status: 'aktif' },
  { id: 'coa-12', code: '5-2000', name: 'Biaya Operasional', type: 'Beban', category: 'Beban Operasional', level: 1, status: 'aktif' },
  { id: 'coa-13', code: '5-3000', name: 'Biaya Penyusutan Aset', type: 'Beban', category: 'Beban Operasional', level: 1, status: 'aktif' },
];

export const journals = [
  { id: 'jrn-1', number: 'JRN-2026-0001', date: '2026-09-10', description: '[SIMULASI] Penerimaan UKT – Andi Firmansyah', debit: 'coa-3', credit: 'coa-9', amount: 6500000, campusId: 'campus-1', status: 'posted', createdBy: 'Sistem (demo)' },
  { id: 'jrn-2', number: 'JRN-2026-0002', date: '2026-09-11', description: '[SIMULASI] Penerimaan UKT – Siti Nurhaliza', debit: 'coa-3', credit: 'coa-9', amount: 6500000, campusId: 'campus-1', status: 'posted', createdBy: 'Sistem (demo)' },
  { id: 'jrn-3', number: 'JRN-2026-0003', date: '2026-09-08', description: '[SIMULASI] Penerimaan UKT Sebagian – Budi Prasetyo', debit: 'coa-2', credit: 'coa-9', amount: 3000000, campusId: 'campus-1', status: 'posted', createdBy: 'Staf Keuangan (demo)' },
  { id: 'jrn-4', number: 'JRN-2026-0004', date: '2026-09-30', description: '[SIMULASI] Biaya Gaji Dosen – September 2026', debit: 'coa-11', credit: 'coa-3', amount: 450000000, campusId: 'campus-1', status: 'posted', createdBy: 'HR (demo)' },
  { id: 'jrn-5', number: 'JRN-2026-0005', date: '2026-09-30', description: '[SIMULASI] Biaya Operasional Kantor – September 2026', debit: 'coa-12', credit: 'coa-3', amount: 85000000, campusId: 'campus-1', status: 'posted', createdBy: 'Staf Keuangan (demo)' },
];

export const budgets = [
  { id: 'bud-1', year: 2026, campusId: 'campus-1', unitName: 'Fakultas Teknik', category: 'Biaya Operasional', approved: 850000000, realized: 620000000, remaining: 230000000, percent: 72.9, status: 'disetujui', submittedBy: 'Dekan FT', approvedBy: 'Rektor UCJ' },
  { id: 'bud-2', year: 2026, campusId: 'campus-1', unitName: 'Fakultas Ekonomi dan Bisnis', category: 'Biaya Operasional', approved: 720000000, realized: 530000000, remaining: 190000000, percent: 73.6, status: 'disetujui', submittedBy: 'Dekan FEB', approvedBy: 'Rektor UCJ' },
  { id: 'bud-3', year: 2026, campusId: 'campus-1', unitName: 'Bagian Kemahasiswaan', category: 'Kegiatan Mahasiswa', approved: 350000000, realized: 180000000, remaining: 170000000, percent: 51.4, status: 'disetujui', submittedBy: 'Kepala Kemahasiswaan', approvedBy: 'Rektor UCJ' },
  { id: 'bud-4', year: 2026, campusId: 'campus-2', unitName: 'Rektorat ITC', category: 'Biaya Operasional', approved: 650000000, realized: 490000000, remaining: 160000000, percent: 75.4, status: 'disetujui', submittedBy: 'Rektor ITC', approvedBy: 'Pengurus Yayasan' },
  { id: 'bud-5', year: 2027, campusId: 'campus-1', unitName: 'Fakultas Teknik', category: 'Biaya Operasional', approved: 0, realized: 0, remaining: 0, percent: 0, status: 'diajukan anggaran', submittedBy: 'Dekan FT', approvedBy: null },
  { id: 'bud-6', year: 2026, campusId: 'campus-3', unitName: 'Rektorat STBC', category: 'Biaya Operasional', approved: 580000000, realized: 420000000, remaining: 160000000, percent: 72.4, status: 'disetujui', submittedBy: 'Ketua STBC', approvedBy: 'Pengurus Yayasan' },
];

// ===================== HR =====================

export const employees = [
  { id: 'emp-1', empId: 'EMP-001-DEMO', name: 'Drs. H. Suparman, M.Pd.', campusId: 'campus-1', unit: 'Rektorat', position: 'Kepala Bagian Akademik', type: 'tetap', joinDate: '2005-08-01', salary: 12000000, status: 'aktif' },
  { id: 'emp-2', empId: 'EMP-002-DEMO', name: 'Ratih Suci, S.E.', campusId: 'campus-1', unit: 'Keuangan', position: 'Staf Keuangan Senior', type: 'tetap', joinDate: '2010-03-15', salary: 8500000, status: 'aktif' },
  { id: 'emp-3', empId: 'EMP-003-DEMO', name: 'Hendro Basuki, S.T.', campusId: 'campus-1', unit: 'TI', position: 'Staf IT', type: 'kontrak', joinDate: '2020-01-10', salary: 6500000, status: 'aktif' },
  { id: 'emp-4', empId: 'EMP-004-DEMO', name: 'Susi Indriani, S.Pd.', campusId: 'campus-1', unit: 'PMB', position: 'Staf PMB', type: 'kontrak', joinDate: '2022-07-01', salary: 5500000, status: 'aktif' },
  { id: 'emp-5', empId: 'EMP-005-DEMO', name: 'Agus Riyanto, S.H.', campusId: 'campus-2', unit: 'SDM', position: 'Kepala SDM', type: 'tetap', joinDate: '2008-05-20', salary: 11000000, status: 'aktif' },
  { id: 'emp-6', empId: 'EMP-006-DEMO', name: 'Wati Kusumawati, S.Kom.', campusId: 'campus-2', unit: 'TI', position: 'Staf IT', type: 'kontrak', joinDate: '2021-09-01', salary: 6000000, status: 'aktif' },
  { id: 'emp-7', empId: 'EMP-007-DEMO', name: 'Bambang Irawan, S.E.', campusId: 'campus-3', unit: 'Keuangan', position: 'Kepala Keuangan', type: 'tetap', joinDate: '2012-04-01', salary: 10500000, status: 'aktif' },
  { id: 'emp-8', empId: 'EMP-008-DEMO', name: 'Nur Fitria, S.Pd.', campusId: 'campus-3', unit: 'Kemahasiswaan', position: 'Staf Kemahasiswaan', type: 'honorer', joinDate: '2023-01-15', salary: 4500000, status: 'aktif' },
];

export const payrollRuns = [
  { id: 'prl-1', period: 'September 2026', campusId: 'campus-1', totalEmployee: 215, totalGross: 1850000000, totalDeductions: 210000000, totalNet: 1640000000, status: 'disetujui', processedBy: 'HR (demo)', approvedBy: 'Rektor UCJ (demo)', processedAt: '2026-09-25' },
  { id: 'prl-2', period: 'Oktober 2026', campusId: 'campus-1', totalEmployee: 215, totalGross: 1855000000, totalDeductions: 212000000, totalNet: 1643000000, status: 'diperiksa', processedBy: 'HR (demo)', approvedBy: null, processedAt: '2026-10-24' },
  { id: 'prl-3', period: 'September 2026', campusId: 'campus-2', totalEmployee: 98, totalGross: 720000000, totalDeductions: 82000000, totalNet: 638000000, status: 'disetujui', processedBy: 'HR ITC (demo)', approvedBy: 'Rektor ITC (demo)', processedAt: '2026-09-25' },
  { id: 'prl-4', period: 'September 2026', campusId: 'campus-3', totalEmployee: 78, totalGross: 580000000, totalDeductions: 65000000, totalNet: 515000000, status: 'disetujui', processedBy: 'HR STBC (demo)', approvedBy: 'Ketua STBC (demo)', processedAt: '2026-09-25' },
];

// ===================== ASSETS =====================

export const assets = [
  { id: 'ast-1', code: 'AST-2020-0001', name: 'Server Dell PowerEdge R750', category: 'Perangkat IT', campusId: 'campus-1', location: 'Gedung A - Server Room', acquiredDate: '2020-03-15', acquiredValue: 85000000, condition: 'baik', status: 'aktif', assignedTo: 'Bagian IT' },
  { id: 'ast-2', code: 'AST-2019-0002', name: 'Proyektor Epson EB-X51', category: 'Peralatan Kelas', campusId: 'campus-1', location: 'Ruang 301', acquiredDate: '2019-08-20', acquiredValue: 7500000, condition: 'baik', status: 'aktif', assignedTo: 'Sarana Prasarana' },
  { id: 'ast-3', code: 'AST-2021-0003', name: 'AC Split Daikin 2PK', category: 'Peralatan Gedung', campusId: 'campus-1', location: 'Lab Komputer 1', acquiredDate: '2021-01-10', acquiredValue: 6800000, condition: 'sedang', status: 'aktif', assignedTo: 'Sarana Prasarana' },
  { id: 'ast-4', code: 'AST-2018-0004', name: 'Laptop Dell Latitude 5420', category: 'Perangkat IT', campusId: 'campus-2', location: 'Lab IT-1', acquiredDate: '2018-06-01', acquiredValue: 12000000, condition: 'rusak', status: 'nonaktif', assignedTo: 'Fakultas TK' },
  { id: 'ast-5', code: 'AST-2022-0005', name: 'Mesin Fotokopi Canon iR2425', category: 'Peralatan Kantor', campusId: 'campus-3', location: 'Kantor TU', acquiredDate: '2022-09-15', acquiredValue: 22000000, condition: 'baik', status: 'aktif', assignedTo: 'TU STBC' },
  { id: 'ast-6', code: 'AST-2023-0006', name: 'Smart TV Samsung 75"', category: 'Peralatan Kelas', campusId: 'campus-1', location: 'Ruang Seminar', acquiredDate: '2023-02-28', acquiredValue: 18000000, condition: 'baik', status: 'aktif', assignedTo: 'Sarana Prasarana' },
];

export const procurementRequests = [
  { id: 'proc-1', reqNum: 'PR-2026-0001', campusId: 'campus-1', unit: 'Fakultas Teknik', itemName: 'Laptop Lenovo ThinkPad L15 (5 unit)', category: 'Perangkat IT', quantity: 5, estimatedCost: 55000000, requestedBy: 'Dekan FT', requestDate: '2026-10-10', status: 'disetujui', approvedBy: 'Rektor UCJ', approvedDate: '2026-10-15' },
  { id: 'proc-2', reqNum: 'PR-2026-0002', campusId: 'campus-2', unit: 'Lab IT', itemName: 'Switch Cisco Catalyst 2960 (2 unit)', category: 'Perangkat Jaringan', quantity: 2, estimatedCost: 24000000, requestedBy: 'Kepala Lab IT', requestDate: '2026-10-12', status: 'menunggu persetujuan', approvedBy: null, approvedDate: null },
  { id: 'proc-3', reqNum: 'PR-2026-0003', campusId: 'campus-1', unit: 'Perpustakaan', itemName: 'Rak Buku Baja (10 unit)', category: 'Perabot', quantity: 10, estimatedCost: 15000000, requestedBy: 'Kepala Perpustakaan', requestDate: '2026-09-20', status: 'terima barang', approvedBy: 'Rektor UCJ', approvedDate: '2026-09-25' },
  { id: 'proc-4', reqNum: 'PR-2026-0004', campusId: 'campus-3', unit: 'Keuangan', itemName: 'Brankas Safety Box', category: 'Peralatan Kantor', quantity: 1, estimatedCost: 8500000, requestedBy: 'Kepala Keuangan', requestDate: '2026-10-18', status: 'diajukan', approvedBy: null, approvedDate: null },
];

export const pddiktiJobs = [
  { id: 'pdd-1', batch: 'BTH-2026-001', type: 'Mahasiswa', campusId: 'campus-1', total: 210, valid: 205, needFix: 5, synced: 200, failed: 5, status: 'simulasi berhasil sebagian', date: '2026-10-20', note: '5 data NIM tidak sesuai format PDDIKTI (simulasi)' },
  { id: 'pdd-2', batch: 'BTH-2026-002', type: 'Dosen', campusId: 'campus-1', total: 48, valid: 48, needFix: 0, synced: 48, failed: 0, status: 'simulasi berhasil', date: '2026-10-20', note: 'Semua data NIDN valid (simulasi)' },
  { id: 'pdd-3', batch: 'BTH-2026-003', type: 'KRS', campusId: 'campus-1', total: 380, valid: 375, needFix: 5, synced: 0, failed: 0, status: 'siap disinkronkan', date: '2026-10-22', note: '5 KRS belum disetujui dosen wali (simulasi)' },
  { id: 'pdd-4', batch: 'BTH-2026-004', type: 'Nilai', campusId: 'campus-2', total: 150, valid: 140, needFix: 10, synced: 140, failed: 10, status: 'simulasi gagal sebagian', date: '2026-10-18', note: '10 nilai belum final di sistem (simulasi)' },
  { id: 'pdd-5', batch: 'BTH-2026-005', type: 'Mahasiswa', campusId: 'campus-2', total: 95, valid: 95, needFix: 0, synced: 95, failed: 0, status: 'simulasi berhasil', date: '2026-10-15', note: 'Sinkronisasi berhasil (simulasi)' },
  { id: 'pdd-6', batch: 'BTH-2026-006', type: 'Kurikulum', campusId: 'campus-3', total: 14, valid: 12, needFix: 2, synced: 0, failed: 0, status: 'perlu perbaikan', date: '2026-10-23', note: '2 kode mata kuliah tidak sesuai referensi PDDIKTI (simulasi)' },
];

// Demo Users (for Users & Access module)
export const demoUsers = [
  { id: 'usr-1', name: 'Prof. Dr. H. Ahmad Fauzi, M.Pd.', email: 'ahmad.fauzi@cakrawala.ac.id', role: 'Pengurus Yayasan', scope: 'Semua Kampus', status: 'aktif', lastLogin: '2026-10-24T08:00:00' },
  { id: 'usr-2', name: 'Ir. Teguh Santoso, M.T.', email: 'teguh.santoso@cakrawala.ac.id', role: 'Admin Yayasan', scope: 'Semua Kampus', status: 'aktif', lastLogin: '2026-10-24T09:30:00' },
  { id: 'usr-3', name: 'Prof. Dr. Siti Rahayu, M.T.', email: 'siti.rahayu@ucj.ac.id', role: 'Rektor/Pimpinan Kampus', scope: 'Universitas Cakrawala Jakarta', status: 'aktif', lastLogin: '2026-10-23T14:00:00' },
  { id: 'usr-4', name: 'Dr. Ir. Hendra Wijaya, M.T.', email: 'hendra.wijaya@ucj.ac.id', role: 'Dekan', scope: 'Fakultas Teknik – UCJ', status: 'aktif', lastLogin: '2026-10-22T10:00:00' },
  { id: 'usr-5', name: 'Dr. Rizki Pratama, M.T.', email: 'rizki.pratama@ucj.ac.id', role: 'Ketua Program Studi', scope: 'Teknik Informatika – UCJ', status: 'aktif', lastLogin: '2026-10-24T11:00:00' },
  { id: 'usr-6', name: 'Susi Indriani, S.Pd.', email: 'susi.indriani@ucj.ac.id', role: 'Staf PMB', scope: 'Universitas Cakrawala Jakarta', status: 'aktif', lastLogin: '2026-10-24T08:45:00' },
  { id: 'usr-7', name: 'Drs. H. Suparman, M.Pd.', email: 'suparman@ucj.ac.id', role: 'Staf TU Akademik', scope: 'Universitas Cakrawala Jakarta', status: 'aktif', lastLogin: '2026-10-23T09:00:00' },
  { id: 'usr-8', name: 'Ratih Suci, S.E.', email: 'ratih.suci@ucj.ac.id', role: 'Staf Keuangan', scope: 'Universitas Cakrawala Jakarta', status: 'aktif', lastLogin: '2026-10-24T10:00:00' },
  { id: 'usr-9', name: 'Agus Riyanto, S.H.', email: 'agus.riyanto@itc.ac.id', role: 'HR', scope: 'Institut Teknologi Cakrawala', status: 'aktif', lastLogin: '2026-10-22T14:30:00' },
  { id: 'usr-10', name: 'Dr. Rizki Pratama, M.T.', email: 'rizki.pratama@ucj.ac.id', role: 'Dosen', scope: 'Teknik Informatika – UCJ', status: 'aktif', lastLogin: '2026-10-24T07:30:00' },
  { id: 'usr-11', name: 'Andi Firmansyah', email: 'andi.firmansyah@mhs.ucj.ac.id', role: 'Mahasiswa', scope: 'NIM: 2022TIF001', status: 'aktif', lastLogin: '2026-10-24T12:00:00' },
  { id: 'usr-12', name: 'Ibu Rosalinda (ortu Andi)', email: 'rosalinda@gmail.com', role: 'Orang Tua/Wali', scope: 'Mahasiswa: Andi Firmansyah', status: 'aktif', lastLogin: '2026-10-20T19:00:00' },
];

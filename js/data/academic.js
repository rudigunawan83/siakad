/**
 * SIAKAD Cakrawala — Academic Data Seed
 * Lecturers, Courses, Curricula, Classes, KRS, Grades, Thesis
 */

export const lecturers = [
  { id: 'lec-1', nidn: 'NIDN-0001-DEMO', name: 'Dr. Rizki Pratama, M.T.', campusId: 'campus-1', facultyId: 'fac-1', prodiId: 'prodi-1', position: 'Lektor Kepala', status: 'aktif', email: 'rizki.pratama@ucj.ac.id', phone: '081234700001', classCount: 3 },
  { id: 'lec-2', nidn: 'NIDN-0002-DEMO', name: 'Dr. Rina Susanti, M.Kom.', campusId: 'campus-1', facultyId: 'fac-1', prodiId: 'prodi-1', position: 'Lektor', status: 'aktif', email: 'rina.susanti@ucj.ac.id', phone: '081234700002', classCount: 4 },
  { id: 'lec-3', nidn: 'NIDN-0003-DEMO', name: 'Dr. Hendra Wijaya, M.T.', campusId: 'campus-1', facultyId: 'fac-1', prodiId: 'prodi-1', position: 'Lektor', status: 'aktif', email: 'hendra.wijaya@ucj.ac.id', phone: '081234700003', classCount: 3 },
  { id: 'lec-4', nidn: 'NIDN-0004-DEMO', name: 'Dr. Fatimah Zahra, M.M.', campusId: 'campus-1', facultyId: 'fac-2', prodiId: 'prodi-3', position: 'Lektor Kepala', status: 'aktif', email: 'fatimah.zahra@ucj.ac.id', phone: '081234700004', classCount: 3 },
  { id: 'lec-5', nidn: 'NIDN-0005-DEMO', name: 'Dr. Joko Susilo, M.Ak.', campusId: 'campus-1', facultyId: 'fac-2', prodiId: 'prodi-4', position: 'Lektor', status: 'aktif', email: 'joko.susilo@ucj.ac.id', phone: '081234700005', classCount: 3 },
  { id: 'lec-6', nidn: 'NIDN-0006-DEMO', name: 'Dr. Wulandari, M.Kom.', campusId: 'campus-1', facultyId: 'fac-3', prodiId: 'prodi-5', position: 'Lektor', status: 'aktif', email: 'wulandari@ucj.ac.id', phone: '081234700006', classCount: 2 },
  { id: 'lec-7', nidn: 'NIDN-0007-DEMO', name: 'Dr. Ir. Satrio, M.T.', campusId: 'campus-2', facultyId: 'fac-4', prodiId: 'prodi-7', position: 'Lektor Kepala', status: 'aktif', email: 'satrio@itc.ac.id', phone: '081234700007', classCount: 4 },
  { id: 'lec-8', nidn: 'NIDN-0008-DEMO', name: 'Dr. Nanda Putri, M.Kom.', campusId: 'campus-2', facultyId: 'fac-5', prodiId: 'prodi-9', position: 'Lektor', status: 'aktif', email: 'nanda.putri@itc.ac.id', phone: '081234700008', classCount: 3 },
  { id: 'lec-9', nidn: 'NIDN-0009-DEMO', name: 'Dr. Taufik Hidayat, M.Kom.', campusId: 'campus-2', facultyId: 'fac-5', prodiId: 'prodi-10', position: 'Lektor', status: 'aktif', email: 'taufik.hidayat@itc.ac.id', phone: '081234700009', classCount: 3 },
  { id: 'lec-10', nidn: 'NIDN-0010-DEMO', name: 'Dr. Sari Dewi, M.M.', campusId: 'campus-3', facultyId: 'fac-6', prodiId: 'prodi-11', position: 'Lektor Kepala', status: 'aktif', email: 'sari.dewi@stbc.ac.id', phone: '081234700010', classCount: 4 },
  { id: 'lec-11', nidn: 'NIDN-0011-DEMO', name: 'Dr. Hadi Santosa, M.Ak.', campusId: 'campus-3', facultyId: 'fac-7', prodiId: 'prodi-13', position: 'Lektor', status: 'aktif', email: 'hadi.santosa@stbc.ac.id', phone: '081234700011', classCount: 3 },
  { id: 'lec-12', nidn: 'NIDN-0012-DEMO', name: 'Dr. Indra Lesmana, M.Ak.', campusId: 'campus-3', facultyId: 'fac-7', prodiId: 'prodi-14', position: 'Lektor', status: 'aktif', email: 'indra.lesmana@stbc.ac.id', phone: '081234700012', classCount: 2 },
];

export const courses = [
  // Prodi Teknik Informatika
  { id: 'crs-1', code: 'TIF101', name: 'Algoritma dan Pemrograman', prodiId: 'prodi-1', sks: 3, sksTeori: 2, sksPraktik: 1, semester: 1, type: 'wajib', prerequisite: null, status: 'aktif' },
  { id: 'crs-2', code: 'TIF102', name: 'Matematika Diskrit', prodiId: 'prodi-1', sks: 3, sksTeori: 3, sksPraktik: 0, semester: 1, type: 'wajib', prerequisite: null, status: 'aktif' },
  { id: 'crs-3', code: 'TIF201', name: 'Struktur Data', prodiId: 'prodi-1', sks: 3, sksTeori: 2, sksPraktik: 1, semester: 2, type: 'wajib', prerequisite: 'crs-1', status: 'aktif' },
  { id: 'crs-4', code: 'TIF202', name: 'Basis Data', prodiId: 'prodi-1', sks: 3, sksTeori: 2, sksPraktik: 1, semester: 2, type: 'wajib', prerequisite: 'crs-1', status: 'aktif' },
  { id: 'crs-5', code: 'TIF301', name: 'Pemrograman Web', prodiId: 'prodi-1', sks: 3, sksTeori: 2, sksPraktik: 1, semester: 3, type: 'wajib', prerequisite: 'crs-3', status: 'aktif' },
  { id: 'crs-6', code: 'TIF302', name: 'Kecerdasan Buatan', prodiId: 'prodi-1', sks: 3, sksTeori: 3, sksPraktik: 0, semester: 5, type: 'wajib', prerequisite: 'crs-3', status: 'aktif' },
  { id: 'crs-7', code: 'TIF401', name: 'Machine Learning', prodiId: 'prodi-1', sks: 3, sksTeori: 2, sksPraktik: 1, semester: 6, type: 'pilihan', prerequisite: 'crs-6', status: 'aktif' },
  // Manajemen
  { id: 'crs-8', code: 'MAN101', name: 'Pengantar Manajemen', prodiId: 'prodi-3', sks: 3, sksTeori: 3, sksPraktik: 0, semester: 1, type: 'wajib', prerequisite: null, status: 'aktif' },
  { id: 'crs-9', code: 'MAN201', name: 'Manajemen Pemasaran', prodiId: 'prodi-3', sks: 3, sksTeori: 3, sksPraktik: 0, semester: 3, type: 'wajib', prerequisite: 'crs-8', status: 'aktif' },
  { id: 'crs-10', code: 'MAN301', name: 'Perilaku Organisasi', prodiId: 'prodi-3', sks: 3, sksTeori: 3, sksPraktik: 0, semester: 5, type: 'wajib', prerequisite: 'crs-8', status: 'aktif' },
  // Akuntansi
  { id: 'crs-11', code: 'AKT101', name: 'Pengantar Akuntansi I', prodiId: 'prodi-4', sks: 3, sksTeori: 2, sksPraktik: 1, semester: 1, type: 'wajib', prerequisite: null, status: 'aktif' },
  { id: 'crs-12', code: 'AKT201', name: 'Akuntansi Keuangan Menengah', prodiId: 'prodi-4', sks: 3, sksTeori: 2, sksPraktik: 1, semester: 3, type: 'wajib', prerequisite: 'crs-11', status: 'aktif' },
  // General
  { id: 'crs-13', code: 'UNV001', name: 'Bahasa Indonesia', prodiId: null, sks: 2, sksTeori: 2, sksPraktik: 0, semester: 1, type: 'wajib', prerequisite: null, status: 'aktif' },
  { id: 'crs-14', code: 'UNV002', name: 'Pendidikan Pancasila', prodiId: null, sks: 2, sksTeori: 2, sksPraktik: 0, semester: 1, type: 'wajib', prerequisite: null, status: 'aktif' },
  { id: 'crs-15', code: 'UNV003', name: 'Bahasa Inggris', prodiId: null, sks: 2, sksTeori: 2, sksPraktik: 0, semester: 2, type: 'wajib', prerequisite: null, status: 'aktif' },
];

export const curricula = [
  { id: 'cur-1', code: 'KUR-TIF-2022', name: 'Kurikulum 2022 – Teknik Informatika', prodiId: 'prodi-1', year: 2022, totalSks: 144, status: 'aktif' },
  { id: 'cur-2', code: 'KUR-MAN-2022', name: 'Kurikulum 2022 – Manajemen', prodiId: 'prodi-3', year: 2022, totalSks: 144, status: 'aktif' },
  { id: 'cur-3', code: 'KUR-AKT-2022', name: 'Kurikulum 2022 – Akuntansi', prodiId: 'prodi-4', year: 2022, totalSks: 144, status: 'aktif' },
];

export const classes = [
  { id: 'cls-1', code: 'TIF301-A', courseId: 'crs-5', semesterId: 'sem-1', lecturerId: 'lec-2', day: 'Senin', startTime: '08:00', endTime: '10:30', room: 'Lab Komputer 1', capacity: 35, enrolled: 28, prodiId: 'prodi-1', campusId: 'campus-1', status: 'aktif' },
  { id: 'cls-2', code: 'TIF301-B', courseId: 'crs-5', semesterId: 'sem-1', lecturerId: 'lec-3', day: 'Rabu', startTime: '10:00', endTime: '12:30', room: 'Lab Komputer 2', capacity: 35, enrolled: 30, prodiId: 'prodi-1', campusId: 'campus-1', status: 'aktif' },
  { id: 'cls-3', code: 'TIF302-A', courseId: 'crs-6', semesterId: 'sem-1', lecturerId: 'lec-1', day: 'Selasa', startTime: '13:00', endTime: '15:30', room: 'Ruang 301', capacity: 40, enrolled: 35, prodiId: 'prodi-1', campusId: 'campus-1', status: 'aktif' },
  { id: 'cls-4', code: 'MAN301-A', courseId: 'crs-10', semesterId: 'sem-1', lecturerId: 'lec-4', day: 'Senin', startTime: '10:00', endTime: '12:30', room: 'Ruang 201', capacity: 40, enrolled: 38, prodiId: 'prodi-3', campusId: 'campus-1', status: 'aktif' },
  { id: 'cls-5', code: 'AKT201-A', courseId: 'crs-12', semesterId: 'sem-1', lecturerId: 'lec-5', day: 'Kamis', startTime: '08:00', endTime: '10:30', room: 'Ruang 202', capacity: 40, enrolled: 32, prodiId: 'prodi-4', campusId: 'campus-1', status: 'aktif' },
  { id: 'cls-6', code: 'IF2301-A', courseId: 'crs-5', semesterId: 'sem-1', lecturerId: 'lec-8', day: 'Selasa', startTime: '08:00', endTime: '10:30', room: 'Lab IT-1', capacity: 30, enrolled: 25, prodiId: 'prodi-9', campusId: 'campus-2', status: 'aktif' },
  { id: 'cls-7', code: 'MB301-A', courseId: 'crs-9', semesterId: 'sem-1', lecturerId: 'lec-10', day: 'Rabu', startTime: '13:00', endTime: '15:30', room: 'Ruang A201', capacity: 45, enrolled: 40, prodiId: 'prodi-11', campusId: 'campus-3', status: 'aktif' },
  // Kelas tambahan untuk demo Isi KRS (bentrok, kapasitas, pilihan)
  { id: 'cls-8', code: 'TIF201-A', courseId: 'crs-3', semesterId: 'sem-1', lecturerId: 'lec-2', day: 'Senin', startTime: '09:00', endTime: '11:30', room: 'Lab Komputer 3', capacity: 35, enrolled: 20, prodiId: 'prodi-1', campusId: 'campus-1', status: 'aktif' },
  { id: 'cls-9', code: 'UNV001-A', courseId: 'crs-13', semesterId: 'sem-1', lecturerId: 'lec-3', day: 'Jumat', startTime: '08:00', endTime: '09:40', room: 'Aula 1', capacity: 50, enrolled: 42, prodiId: 'prodi-1', campusId: 'campus-1', status: 'aktif' },
  { id: 'cls-10', code: 'TIF401-A', courseId: 'crs-7', semesterId: 'sem-1', lecturerId: 'lec-1', day: 'Kamis', startTime: '13:00', endTime: '15:30', room: 'Lab AI', capacity: 30, enrolled: 30, prodiId: 'prodi-1', campusId: 'campus-1', status: 'aktif' },
  { id: 'cls-11', code: 'TIF302-B', courseId: 'crs-6', semesterId: 'sem-1', lecturerId: 'lec-2', day: 'Kamis', startTime: '10:00', endTime: '12:30', room: 'Ruang 302', capacity: 40, enrolled: 12, prodiId: 'prodi-1', campusId: 'campus-1', status: 'aktif' },
];

/** Kebijakan KRS demo (bukan kebijakan resmi kampus) */
export const krsPolicy = {
  requireRegistrationBeforeKrs: true,
  advisorApprovalRequired: true,
  allowCancelSubmission: true,
  allowPrintBeforeFinal: true,
  allowCrossProdi: false,
  allowRetake: null, // null = belum dikonfigurasi
  holdSeatOn: 'submit', // draft | submit
  finalizeOn: 'period_lock',
  periodOpen: true,
  changePeriodOpen: false,
};

/**
 * Kebijakan registrasi semester demo (design.md 7.7).
 * financeRule: none | paid | dispensation
 */
export const registrationPolicy = {
  requireRegistrationBeforeKrs: true,
  financeRule: 'none',
  requireStaffValidation: true,
  allowRetryAfterReject: true,
  allowStaffCancel: true,
  allowRetryAfterCancel: false,
  periodOpen: true,
  periodStart: '2026-08-01',
  periodEnd: '2026-09-15',
};

/** Registrasi semester demo — stu-1 Belum Registrasi agar alur portal dapat diuji */
export const semesterRegistrations = [
  {
    id: 'sreg-1', studentId: 'stu-1', semesterId: 'sem-1', status: 'Belum Registrasi',
    submittedAt: null, updatedAt: null, note: '', staffId: null, dispensationRef: null,
    history: [],
  },
  {
    id: 'sreg-2', studentId: 'stu-2', semesterId: 'sem-1', status: 'Teregistrasi',
    submittedAt: '2026-08-25T11:00:00', updatedAt: '2026-08-26T09:00:00', note: '',
    staffId: 'demo-staff', dispensationRef: null,
    history: [
      { at: '2026-08-25T11:00:00', from: 'Belum Registrasi', to: 'Menunggu Validasi', by: 'Mahasiswa', note: 'Pengajuan' },
      { at: '2026-08-26T09:00:00', from: 'Menunggu Validasi', to: 'Teregistrasi', by: 'Staf TU', note: 'Disetujui' },
    ],
  },
  {
    id: 'sreg-3', studentId: 'stu-3', semesterId: 'sem-1', status: 'Menunggu Validasi',
    submittedAt: '2026-08-28T10:00:00', updatedAt: '2026-08-28T10:00:00', note: '',
    staffId: null, dispensationRef: null,
    history: [
      { at: '2026-08-28T10:00:00', from: 'Draft', to: 'Menunggu Validasi', by: 'Mahasiswa', note: 'Pengajuan' },
    ],
  },
  {
    id: 'sreg-4', studentId: 'stu-5', semesterId: 'sem-1', status: 'Belum Registrasi',
    submittedAt: null, updatedAt: null, note: '', staffId: null, dispensationRef: null, history: [],
  },
  {
    id: 'sreg-5', studentId: 'stu-4', semesterId: 'sem-1', status: 'Ditolak',
    submittedAt: '2026-08-20T09:00:00', updatedAt: '2026-08-21T14:00:00',
    note: 'Data status akademik perlu diverifikasi ulang di BAAK.',
    staffId: 'demo-staff', dispensationRef: null,
    history: [
      { at: '2026-08-20T09:00:00', from: 'Belum Registrasi', to: 'Menunggu Validasi', by: 'Mahasiswa', note: 'Pengajuan' },
      { at: '2026-08-21T14:00:00', from: 'Menunggu Validasi', to: 'Ditolak', by: 'Staf TU', note: 'Data status akademik perlu diverifikasi ulang di BAAK.' },
    ],
  },
];

/** Rencana KRS header (Isi KRS). Item disimpan di dalam plans.items */
export const krsPlans = [
  {
    id: 'krs-1',
    studentId: 'stu-1',
    semesterId: 'sem-1',
    status: 'Draft',
    items: [],
    submittedAt: null,
    decidedAt: null,
    advisorNote: '',
    history: [
      { at: '2026-08-27T08:00:00', from: 'Belum Dibuat', to: 'Draft', by: 'Mahasiswa', note: 'Mulai mengisi KRS' },
    ],
  },
  {
    id: 'krs-2',
    studentId: 'stu-2',
    semesterId: 'sem-1',
    status: 'Menunggu Persetujuan Dosen Wali',
    items: [
      { classId: 'cls-1', courseId: 'crs-5', code: 'TIF301', name: 'Pemrograman Web', sks: 3, classCode: 'TIF301-A', day: 'Senin', startTime: '08:00', endTime: '10:30', room: 'Lab Komputer 1', lecturerId: 'lec-2', lecturerName: 'Dr. Rina Susanti, M.Kom.' },
      { classId: 'cls-3', courseId: 'crs-6', code: 'TIF302', name: 'Kecerdasan Buatan', sks: 3, classCode: 'TIF302-A', day: 'Selasa', startTime: '13:00', endTime: '15:30', room: 'R. 301', lecturerId: 'lec-1', lecturerName: 'Dr. Rizki Pratama, M.T.' },
    ],
    submittedAt: '2026-09-02T09:30:00',
    decidedAt: null,
    advisorNote: '',
    history: [
      { at: '2026-08-28T10:00:00', from: 'Belum Dibuat', to: 'Draft', by: 'Mahasiswa', note: 'Mulai mengisi' },
      { at: '2026-09-02T09:30:00', from: 'Draft', to: 'Menunggu Persetujuan Dosen Wali', by: 'Mahasiswa', note: 'Mengajukan KRS' },
    ],
  },
  {
    id: 'krs-3',
    studentId: 'stu-3',
    semesterId: 'sem-1',
    status: 'Menunggu Persetujuan Dosen Wali',
    items: [
      { classId: 'cls-2', courseId: 'crs-5', code: 'TIF301', name: 'Pemrograman Web', sks: 3, classCode: 'TIF301-B', day: 'Rabu', startTime: '10:00', endTime: '12:30', room: 'Lab Komputer 2', lecturerId: 'lec-3', lecturerName: 'Dr. Hendra Wijaya, M.T.' },
    ],
    submittedAt: '2026-09-01T10:00:00',
    decidedAt: null,
    advisorNote: '',
    history: [
      { at: '2026-09-01T10:00:00', from: 'Draft', to: 'Menunggu Persetujuan Dosen Wali', by: 'Mahasiswa', note: 'Mengajukan KRS' },
    ],
  },
];

export const enrollments = [
  // stu-1 enrollments
  { id: 'enr-1', studentId: 'stu-1', classId: 'cls-1', semesterId: 'sem-1', status: 'disetujui', approvedBy: 'lec-1', approvedAt: '2026-09-05' },
  { id: 'enr-2', studentId: 'stu-1', classId: 'cls-3', semesterId: 'sem-1', status: 'disetujui', approvedBy: 'lec-1', approvedAt: '2026-09-05' },
  // stu-2 enrollments
  { id: 'enr-3', studentId: 'stu-2', classId: 'cls-1', semesterId: 'sem-1', status: 'disetujui', approvedBy: 'lec-1', approvedAt: '2026-09-05' },
  { id: 'enr-4', studentId: 'stu-2', classId: 'cls-3', semesterId: 'sem-1', status: 'disetujui', approvedBy: 'lec-1', approvedAt: '2026-09-05' },
  // stu-3 enrollments
  { id: 'enr-5', studentId: 'stu-3', classId: 'cls-2', semesterId: 'sem-1', status: 'diajukan', approvedBy: null, approvedAt: null },
  // stu-6 enrollments
  { id: 'enr-6', studentId: 'stu-6', classId: 'cls-4', semesterId: 'sem-1', status: 'disetujui', approvedBy: 'lec-4', approvedAt: '2026-09-06' },
  // cls-10 — Metode Penelitian (lec-1)
  { id: 'enr-7', studentId: 'stu-1', classId: 'cls-10', semesterId: 'sem-1', status: 'disetujui', approvedBy: 'lec-1', approvedAt: '2026-09-05' },
  { id: 'enr-8', studentId: 'stu-2', classId: 'cls-10', semesterId: 'sem-1', status: 'disetujui', approvedBy: 'lec-1', approvedAt: '2026-09-05' },
  { id: 'enr-9', studentId: 'stu-4', classId: 'cls-10', semesterId: 'sem-1', status: 'disetujui', approvedBy: 'lec-1', approvedAt: '2026-09-06' },
  { id: 'enr-10', studentId: 'stu-9', classId: 'cls-10', semesterId: 'sem-1', status: 'disetujui', approvedBy: 'lec-1', approvedAt: '2026-09-06' },
];

export const attendances = [
  { id: 'att-1', classId: 'cls-1', studentId: 'stu-1', date: '2026-09-15', status: 'hadir' },
  { id: 'att-2', classId: 'cls-1', studentId: 'stu-1', date: '2026-09-22', status: 'hadir' },
  { id: 'att-3', classId: 'cls-1', studentId: 'stu-1', date: '2026-09-29', status: 'izin' },
  { id: 'att-4', classId: 'cls-1', studentId: 'stu-2', date: '2026-09-15', status: 'hadir' },
  { id: 'att-5', classId: 'cls-1', studentId: 'stu-2', date: '2026-09-22', status: 'hadir' },
  { id: 'att-6', classId: 'cls-1', studentId: 'stu-2', date: '2026-09-29', status: 'hadir' },
  { id: 'att-7', classId: 'cls-3', studentId: 'stu-1', date: '2026-09-16', status: 'hadir' },
  { id: 'att-8', classId: 'cls-3', studentId: 'stu-1', date: '2026-09-23', status: 'sakit' },
  { id: 'att-9', classId: 'cls-4', studentId: 'stu-6', date: '2026-09-15', status: 'hadir' },
  { id: 'att-10', classId: 'cls-4', studentId: 'stu-6', date: '2026-09-22', status: 'hadir' },
  { id: 'att-11', classId: 'cls-3', studentId: 'stu-2', date: '2026-09-16', status: 'hadir' },
  { id: 'att-12', classId: 'cls-3', studentId: 'stu-2', date: '2026-09-23', status: 'hadir' },
  { id: 'att-13', classId: 'cls-10', studentId: 'stu-1', date: '2026-09-18', status: 'hadir' },
  { id: 'att-14', classId: 'cls-10', studentId: 'stu-2', date: '2026-09-18', status: 'hadir' },
  { id: 'att-15', classId: 'cls-10', studentId: 'stu-4', date: '2026-09-18', status: 'izin' },
  { id: 'att-16', classId: 'cls-10', studentId: 'stu-9', date: '2026-09-18', status: 'hadir' },
];

export const grades = [
  // stu-1 grades in previous semester
  { id: 'grd-1', studentId: 'stu-1', courseId: 'crs-3', semesterId: 'sem-3', tugas: 85, kuis: 80, uts: 82, uas: 88, finalScore: 84.4, letterGrade: 'A-', mutu: 3.7, sks: 3, status: 'final' },
  { id: 'grd-2', studentId: 'stu-1', courseId: 'crs-4', semesterId: 'sem-3', tugas: 78, kuis: 75, uts: 79, uas: 82, finalScore: 79.6, letterGrade: 'B+', mutu: 3.3, sks: 3, status: 'final' },
  { id: 'grd-3', studentId: 'stu-2', courseId: 'crs-3', semesterId: 'sem-3', tugas: 90, kuis: 92, uts: 88, uas: 91, finalScore: 90.4, letterGrade: 'A', mutu: 4.0, sks: 3, status: 'final' },
  // Current semester draft grades
  { id: 'grd-4', studentId: 'stu-1', courseId: 'crs-5', semesterId: 'sem-1', tugas: 80, kuis: 75, uts: 0, uas: 0, finalScore: null, letterGrade: null, mutu: null, sks: 3, status: 'draft' },
  { id: 'grd-5', studentId: 'stu-2', courseId: 'crs-5', semesterId: 'sem-1', tugas: 85, kuis: 90, uts: 0, uas: 0, finalScore: null, letterGrade: null, mutu: null, sks: 3, status: 'draft' },
  { id: 'grd-6', studentId: 'stu-1', courseId: 'crs-6', classId: 'cls-3', semesterId: 'sem-1', lecturerId: 'lec-1', tugas: 82, kuis: 80, praktikum: 85, uts: 0, uas: 0, finalScore: null, letterGrade: null, mutu: null, sks: 3, status: 'draft' },
  { id: 'grd-7', studentId: 'stu-2', courseId: 'crs-6', classId: 'cls-3', semesterId: 'sem-1', lecturerId: 'lec-1', tugas: 88, kuis: 90, praktikum: 86, uts: 0, uas: 0, finalScore: null, letterGrade: null, mutu: null, sks: 3, status: 'draft' },
];

export const theses = [
  {
    id: 'ths-1', studentId: 'stu-9', prodiId: 'prodi-1', campusId: 'campus-1',
    title: 'Implementasi Deep Learning untuk Deteksi Penyakit Tanaman pada Citra Digital',
    supervisorId: 'lec-1', coSupervisorId: 'lec-2',
    stage: 'Bimbingan', status: 'aktif',
    topicDate: '2026-03-15', proposalDate: '2026-05-10', seminarDate: '2026-07-20',
    defenseDate: null, completedDate: null,
    updatedAt: '2026-10-01',
    notes: 'Sudah melewati seminar proposal, sedang dalam proses penulisan BAB III–IV.'
  },
  {
    id: 'ths-2', studentId: 'stu-15', prodiId: 'prodi-7', campusId: 'campus-2',
    title: 'Optimasi Tata Letak Fasilitas Pabrik dengan Metode Systematic Layout Planning',
    supervisorId: 'lec-7', coSupervisorId: null,
    stage: 'Seminar', status: 'aktif',
    topicDate: '2026-02-10', proposalDate: '2026-04-15', seminarDate: null,
    defenseDate: null, completedDate: null,
    updatedAt: '2026-09-28',
    notes: 'Menunggu jadwal seminar hasil dari program studi.'
  },
  {
    id: 'ths-3', studentId: 'stu-1', prodiId: 'prodi-1', campusId: 'campus-1',
    title: 'Pengembangan Sistem Rekomendasi Akademik Berbasis Collaborative Filtering',
    supervisorId: 'lec-1', coSupervisorId: null,
    stage: 'Pengajuan Topik', status: 'menunggu review',
    topicDate: '2026-10-10', proposalDate: null, seminarDate: null,
    defenseDate: null, completedDate: null,
    updatedAt: '2026-10-10',
    notes: 'Topik baru diajukan, menunggu persetujuan ketua program studi.'
  },
];

export const notifications = [
  { id: 'notif-1', type: 'krs', title: 'KRS Menunggu Persetujuan', message: 'KRS mahasiswa Siti Nurhaliza (2022TIF002) menunggu persetujuan Anda.', time: '2026-10-24T09:00:00', read: false, link: '#/portal/lecturer/krs', role: ['Dosen', 'Staf TU Akademik'] },
  { id: 'notif-2', type: 'finance', title: 'Tagihan Mendekati Jatuh Tempo', message: '3 mahasiswa memiliki tagihan yang jatuh tempo dalam 7 hari.', time: '2026-10-24T08:30:00', read: false, link: '#/finance/invoices', role: ['Staf Keuangan', 'Rektor/Pimpinan Kampus'] },
  { id: 'notif-3', type: 'pmb', title: 'Pendaftar Perlu Verifikasi', message: '2 dokumen pendaftar PMB perlu diverifikasi segera.', time: '2026-10-23T14:00:00', read: false, link: '#/admissions', role: ['Staf PMB'] },
  { id: 'notif-4', type: 'budget', title: 'Pengajuan Anggaran Menunggu', message: 'Pengajuan anggaran Fakultas Teknik untuk Q1 2027 menunggu persetujuan.', time: '2026-10-22T10:00:00', read: true, link: '#/budget/overview', role: ['Pengurus Yayasan', 'Rektor/Pimpinan Kampus'] },
  { id: 'notif-5', type: 'pddikti', title: 'Data PDDIKTI Perlu Perbaikan', message: '5 data mahasiswa perlu perbaikan sebelum sinkronisasi PDDIKTI.', time: '2026-10-21T16:00:00', read: false, link: '#/pddikti/validation', role: ['Admin Yayasan', 'Staf TU Akademik'] },
  { id: 'notif-6', type: 'academic', title: 'Nilai Belum Difinalisasi', message: 'Kelas TIF301-A belum memiliki nilai final untuk semester ini.', time: '2026-10-20T09:00:00', read: true, link: '#/learning/grades', role: ['Dosen', 'Staf TU Akademik'] },
];

export const auditLogs = [
  { id: 'aud-1', time: '2026-10-24T10:30:00', user: 'Admin Yayasan (demo)', role: 'Admin Yayasan', module: 'Mahasiswa', activity: 'Edit Data', object: 'Mahasiswa: Andi Firmansyah (2022TIF001)', result: 'Berhasil' },
  { id: 'aud-2', time: '2026-10-24T09:15:00', user: 'Staf Keuangan (demo)', role: 'Staf Keuangan', module: 'Keuangan', activity: 'Catat Pembayaran Demo', object: 'Tagihan: INV-2026-0001', result: 'Berhasil (Simulasi)' },
  { id: 'aud-3', time: '2026-10-23T14:00:00', user: 'Staf PMB (demo)', role: 'Staf PMB', module: 'PMB', activity: 'Ubah Status', object: 'Pendaftar: Umar Faruq (PMB-2026-0001)', result: 'Status: Daftar Ulang' },
  { id: 'aud-4', time: '2026-10-23T11:00:00', user: 'Rektor UCJ (demo)', role: 'Rektor/Pimpinan Kampus', module: 'Anggaran', activity: 'Setujui Anggaran', object: 'Anggaran Fakultas Teknik 2027', result: 'Disetujui (Simulasi)' },
  { id: 'aud-5', time: '2026-10-22T16:30:00', user: 'Admin Yayasan (demo)', role: 'Admin Yayasan', module: 'PDDIKTI', activity: 'Simulasi Sinkronisasi', object: 'Batch Mahasiswa – 2026/2027 Ganjil', result: '48 berhasil, 5 gagal (Simulasi)' },
  { id: 'aud-6', time: '2026-10-22T09:00:00', user: 'Staf TU Akademik (demo)', role: 'Staf TU Akademik', module: 'Mahasiswa', activity: 'Tambah Data', object: 'Mahasiswa baru dari PMB: Vina Agustina', result: 'Berhasil' },
];

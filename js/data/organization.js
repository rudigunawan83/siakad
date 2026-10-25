/**
 * SIAKAD Cakrawala — Organization Data Seed
 * Yayasan, Kampus, Fakultas, Program Studi, Tahun Akademik, Semester
 */

export const foundation = {
  id: 'foundation-1',
  name: 'Yayasan Cakrawala Pendidikan',
  shortName: 'YCP',
  address: 'Jl. Pendidikan No. 1, Jakarta Pusat 10110',
  phone: '(021) 555-0001',
  email: 'info@cakrawala.ac.id',
  website: 'www.cakrawala.ac.id',
  established: '1985',
  chairman: 'Prof. Dr. H. Ahmad Fauzi, M.Pd.',
  logo: 'assets/logo.svg',
  npwp: '01.234.567.8-901.000',
  status: 'aktif',
};

export const campuses = [
  {
    id: 'campus-1',
    code: 'UCJ',
    name: 'Universitas Cakrawala Jakarta',
    type: 'Universitas',
    city: 'Jakarta Selatan',
    address: 'Jl. Margonda Raya No. 100, Jakarta Selatan 12610',
    phone: '(021) 555-1001',
    email: 'rektorat@ucj.ac.id',
    rector: 'Prof. Dr. Siti Rahayu, M.T.',
    established: '1990',
    accreditation: 'A',
    studentCount: 8420,
    lecturerCount: 210,
    status: 'aktif',
    color: '#213550',
  },
  {
    id: 'campus-2',
    code: 'ITC',
    name: 'Institut Teknologi Cakrawala',
    type: 'Institut',
    city: 'Depok',
    address: 'Jl. Raya Bogor Km 30, Depok 16514',
    phone: '(021) 555-2001',
    email: 'pimpinan@itc.ac.id',
    rector: 'Dr. Ir. Bambang Santoso, M.T.',
    established: '1995',
    accreditation: 'B',
    studentCount: 3150,
    lecturerCount: 95,
    status: 'aktif',
    color: '#0d6efd',
  },
  {
    id: 'campus-3',
    code: 'STBC',
    name: 'Sekolah Tinggi Bisnis Cakrawala',
    type: 'Sekolah Tinggi',
    city: 'Bekasi',
    address: 'Jl. Ahmad Yani No. 55, Bekasi 17148',
    phone: '(021) 555-3001',
    email: 'ketua@stbc.ac.id',
    rector: 'Dr. Dewi Kusuma, M.M.',
    established: '2000',
    accreditation: 'B',
    studentCount: 2870,
    lecturerCount: 75,
    status: 'aktif',
    color: '#198754',
  },
];

export const faculties = [
  { id: 'fac-1', campusId: 'campus-1', code: 'FT', name: 'Fakultas Teknik', dean: 'Dr. Ir. Hendra Wijaya, M.T.', status: 'aktif', programCount: 2 },
  { id: 'fac-2', campusId: 'campus-1', code: 'FEB', name: 'Fakultas Ekonomi dan Bisnis', dean: 'Dr. Lestari Handayani, M.M.', status: 'aktif', programCount: 2 },
  { id: 'fac-3', campusId: 'campus-1', code: 'FIKM', name: 'Fakultas Ilmu Komputer dan Manajemen', dean: 'Dr. Andi Pranata, M.Kom.', status: 'aktif', programCount: 2 },
  { id: 'fac-4', campusId: 'campus-2', code: 'FTI', name: 'Fakultas Teknologi Industri', dean: 'Dr. Ir. Rudi Hermawan, M.T.', status: 'aktif', programCount: 2 },
  { id: 'fac-5', campusId: 'campus-2', code: 'FTK', name: 'Fakultas Teknologi Komputer', dean: 'Dr. Maya Sari, M.Kom.', status: 'aktif', programCount: 2 },
  { id: 'fac-6', campusId: 'campus-3', code: 'MB', name: 'Manajemen Bisnis', dean: 'Dr. Putri Aryani, M.M.', status: 'aktif', programCount: 2 },
  { id: 'fac-7', campusId: 'campus-3', code: 'AKT', name: 'Akuntansi dan Keuangan', dean: 'Dr. Budi Santoso, M.Ak.', status: 'aktif', programCount: 2 },
];

export const studyPrograms = [
  { id: 'prodi-1', campusId: 'campus-1', facultyId: 'fac-1', code: 'TIF', name: 'Teknik Informatika', degree: 'S1', head: 'Dr. Rizki Pratama, M.T.', accreditation: 'A', studentCount: 1240, status: 'aktif' },
  { id: 'prodi-2', campusId: 'campus-1', facultyId: 'fac-1', code: 'TIN', name: 'Teknik Industri', degree: 'S1', head: 'Dr. Yuni Hartati, M.T.', accreditation: 'B', studentCount: 890, status: 'aktif' },
  { id: 'prodi-3', campusId: 'campus-1', facultyId: 'fac-2', code: 'MAN', name: 'Manajemen', degree: 'S1', head: 'Dr. Fatimah Zahra, M.M.', accreditation: 'A', studentCount: 1560, status: 'aktif' },
  { id: 'prodi-4', campusId: 'campus-1', facultyId: 'fac-2', code: 'AKT', name: 'Akuntansi', degree: 'S1', head: 'Dr. Joko Susilo, M.Ak.', accreditation: 'A', studentCount: 980, status: 'aktif' },
  { id: 'prodi-5', campusId: 'campus-1', facultyId: 'fac-3', code: 'SI', name: 'Sistem Informasi', degree: 'S1', head: 'Dr. Wulandari, M.Kom.', accreditation: 'B', studentCount: 750, status: 'aktif' },
  { id: 'prodi-6', campusId: 'campus-1', facultyId: 'fac-3', code: 'MMT', name: 'Manajemen Teknologi', degree: 'S2', head: 'Prof. Dr. Agus Prabowo, M.T.', accreditation: 'B', studentCount: 320, status: 'aktif' },
  { id: 'prodi-7', campusId: 'campus-2', facultyId: 'fac-4', code: 'TI', name: 'Teknik Industri', degree: 'S1', head: 'Dr. Ir. Satrio, M.T.', accreditation: 'B', studentCount: 860, status: 'aktif' },
  { id: 'prodi-8', campusId: 'campus-2', facultyId: 'fac-4', code: 'TM', name: 'Teknik Mesin', degree: 'S1', head: 'Dr. Ir. Wahyu, M.T.', accreditation: 'B', studentCount: 640, status: 'aktif' },
  { id: 'prodi-9', campusId: 'campus-2', facultyId: 'fac-5', code: 'IF2', name: 'Informatika', degree: 'S1', head: 'Dr. Nanda Putri, M.Kom.', accreditation: 'B', studentCount: 950, status: 'aktif' },
  { id: 'prodi-10', campusId: 'campus-2', facultyId: 'fac-5', code: 'SI2', name: 'Sistem Informasi', degree: 'S1', head: 'Dr. Taufik Hidayat, M.Kom.', accreditation: 'B', studentCount: 700, status: 'aktif' },
  { id: 'prodi-11', campusId: 'campus-3', facultyId: 'fac-6', code: 'MB1', name: 'Manajemen Bisnis', degree: 'S1', head: 'Dr. Sari Dewi, M.M.', accreditation: 'B', studentCount: 1200, status: 'aktif' },
  { id: 'prodi-12', campusId: 'campus-3', facultyId: 'fac-6', code: 'PM', name: 'Pemasaran Digital', degree: 'S1', head: 'Dr. Rani Wijaya, M.M.', accreditation: 'B', studentCount: 670, status: 'aktif' },
  { id: 'prodi-13', campusId: 'campus-3', facultyId: 'fac-7', code: 'AK3', name: 'Akuntansi', degree: 'S1', head: 'Dr. Hadi Santosa, M.Ak.', accreditation: 'B', studentCount: 720, status: 'aktif' },
  { id: 'prodi-14', campusId: 'campus-3', facultyId: 'fac-7', code: 'KU', name: 'Keuangan', degree: 'S1', head: 'Dr. Indra Lesmana, M.Ak.', accreditation: 'C', studentCount: 280, status: 'aktif' },
];

export const academicYears = [
  { id: 'ay-1', name: '2024/2025', startDate: '2024-09-01', endDate: '2025-08-31', status: 'selesai' },
  { id: 'ay-2', name: '2025/2026', startDate: '2025-09-01', endDate: '2026-08-31', status: 'selesai' },
  { id: 'ay-3', name: '2026/2027', startDate: '2026-09-01', endDate: '2027-08-31', status: 'aktif' },
];

export const semesters = [
  { id: 'sem-1', academicYearId: 'ay-3', name: 'Ganjil 2026/2027', term: 1, startDate: '2026-09-01', endDate: '2027-01-31', krsStart: '2026-08-20', krsEnd: '2026-09-07', status: 'aktif' },
  { id: 'sem-2', academicYearId: 'ay-3', name: 'Genap 2026/2027', term: 2, startDate: '2027-02-01', endDate: '2027-07-31', krsStart: '2027-01-25', krsEnd: '2027-02-10', status: 'akan datang' },
  { id: 'sem-3', academicYearId: 'ay-2', name: 'Ganjil 2025/2026', term: 1, startDate: '2025-09-01', endDate: '2026-01-31', krsStart: '2025-08-20', krsEnd: '2025-09-07', status: 'selesai' },
  { id: 'sem-4', academicYearId: 'ay-2', name: 'Genap 2025/2026', term: 2, startDate: '2026-02-01', endDate: '2026-07-31', krsStart: '2026-01-25', krsEnd: '2026-02-10', status: 'selesai' },
];

export const academicCalendar = [
  { id: 'cal-1', semesterId: 'sem-1', event: 'KRS Online', startDate: '2026-08-20', endDate: '2026-09-07', type: 'akademik', campusId: 'all' },
  { id: 'cal-2', semesterId: 'sem-1', event: 'Perkuliahan Semester Ganjil', startDate: '2026-09-08', endDate: '2026-12-20', type: 'akademik', campusId: 'all' },
  { id: 'cal-3', semesterId: 'sem-1', event: 'UTS', startDate: '2026-10-27', endDate: '2026-11-07', type: 'ujian', campusId: 'all' },
  { id: 'cal-4', semesterId: 'sem-1', event: 'UAS', startDate: '2027-01-05', endDate: '2027-01-25', type: 'ujian', campusId: 'all' },
  { id: 'cal-5', semesterId: 'sem-1', event: 'Input Nilai', startDate: '2027-01-26', endDate: '2027-02-07', type: 'nilai', campusId: 'all' },
  { id: 'cal-6', semesterId: 'sem-1', event: 'Yudisium Semester Ganjil', startDate: '2027-02-15', endDate: '2027-02-15', type: 'yudisium', campusId: 'all' },
  { id: 'cal-7', semesterId: 'sem-1', event: 'PMB Gelombang I', startDate: '2026-07-01', endDate: '2026-08-15', type: 'pmb', campusId: 'all' },
  { id: 'cal-8', semesterId: 'sem-1', event: 'PMB Gelombang II', startDate: '2026-08-16', endDate: '2026-08-30', type: 'pmb', campusId: 'all' },
];

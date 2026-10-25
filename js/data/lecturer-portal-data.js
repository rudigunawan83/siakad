/**
 * Seed data Portal Dosen — LEC-031 s/d LEC-037
 * Metadata file saja; tidak ada base64.
 */

export const classAnnouncements = [
  {
    id: 'cann-1',
    lecturerId: 'lec-1',
    classIds: ['cls-3'],
    courseId: 'crs-6',
    title: 'Perubahan ruang pertemuan ke-8',
    body: 'Pertemuan ke-8 dipindah ke Lab Komputasi 2. Hadir tepat waktu.',
    status: 'Dipublikasikan',
    publishAt: '2026-10-18',
    createdAt: '2026-10-18T08:00:00',
    updatedAt: '2026-10-18T08:00:00',
    attachmentMeta: { name: 'pengumuman-ruang.pdf', sizeKb: 120, type: 'application/pdf' },
  },
  {
    id: 'cann-2',
    lecturerId: 'lec-1',
    classIds: ['cls-10'],
    courseId: 'crs-7',
    title: 'Draft — Reminder pengumpulan tugas 2',
    body: 'Deadline tugas 2 Senin depan pukul 23.59. Format PDF.',
    status: 'Draft',
    publishAt: null,
    createdAt: '2026-10-22T10:00:00',
    updatedAt: '2026-10-22T10:00:00',
    attachmentMeta: null,
  },
];

export const advisingConsultations = [
  {
    id: 'acons-1',
    lecturerId: 'lec-1',
    studentId: 'stu-1',
    date: '2026-10-05',
    topic: 'Perencanaan SKS semester depan',
    notes: 'Mahasiswa disarankan menjaga IPK di atas 3,0. Fokus MK wajib.',
    followUp: 'Review KRS draft sebelum pengajuan',
    createdAt: '2026-10-05T14:00:00',
  },
  {
    id: 'acons-2',
    lecturerId: 'lec-1',
    studentId: 'stu-2',
    date: '2026-10-12',
    topic: 'Kehadiran rendah pada MK inti',
    notes: 'Diskusi penyebab izin berulang. Mahasiswa akan mengejar materi.',
    followUp: 'Cek kehadiran minggu depan',
    createdAt: '2026-10-12T09:30:00',
  },
];

export const lecturerAdminRequests = [
  {
    id: 'lareq-1',
    lecturerId: 'lec-1',
    type: 'Surat Tugas Mengajar',
    detail: 'Permohonan surat tugas mengajar semester Ganjil 2026/2027.',
    status: 'Selesai',
    createdAt: '2026-09-01T09:00:00',
    updatedAt: '2026-09-03T11:00:00',
    attachmentMeta: { name: 'draft-surat.docx', sizeKb: 45, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    history: [
      { at: '2026-09-01T09:00:00', from: null, to: 'Diajukan', by: 'Dosen', note: 'Pengajuan awal' },
      { at: '2026-09-02T10:00:00', from: 'Diajukan', to: 'Diproses', by: 'BAAK', note: 'Dokumen dicek' },
      { at: '2026-09-03T11:00:00', from: 'Diproses', to: 'Selesai', by: 'BAAK', note: 'Surat diterbitkan (demo)' },
    ],
  },
  {
    id: 'lareq-2',
    lecturerId: 'lec-1',
    type: 'Surat Keterangan Aktif Mengajar',
    detail: 'Untuk keperluan administrasi eksternal.',
    status: 'Diproses',
    createdAt: '2026-10-10T08:00:00',
    updatedAt: '2026-10-11T09:00:00',
    attachmentMeta: null,
    history: [
      { at: '2026-10-10T08:00:00', from: null, to: 'Diajukan', by: 'Dosen', note: 'Pengajuan awal' },
      { at: '2026-10-11T09:00:00', from: 'Diajukan', to: 'Diproses', by: 'BAAK', note: 'Menunggu tanda tangan' },
    ],
  },
];

/** Tugas kelas (ringkas) untuk laporan pengumpulan — LEC-033 */
export const classAssignments = [
  {
    id: 'cass-1',
    lecturerId: 'lec-1',
    classId: 'cls-3',
    title: 'Tugas 1 — Makalah AI',
    deadline: '2026-10-01',
    status: 'Dipublikasikan',
    weight: 10,
  },
  {
    id: 'cass-2',
    lecturerId: 'lec-1',
    classId: 'cls-3',
    title: 'Tugas 2 — Implementasi Proyek Mini',
    deadline: '2026-10-20',
    status: 'Dipublikasikan',
    weight: 15,
  },
  {
    id: 'cass-3',
    lecturerId: 'lec-1',
    classId: 'cls-10',
    title: 'Latihan Skripsi Proposal Outline',
    deadline: '2026-10-08',
    status: 'Dipublikasikan',
    weight: 10,
  },
];

export const assignmentSubmissions = [
  { id: 'asub-1', assignmentId: 'cass-1', studentId: 'stu-1', submittedAt: '2026-09-30T20:00:00', status: 'Tepat waktu', score: 85 },
  { id: 'asub-2', assignmentId: 'cass-1', studentId: 'stu-2', submittedAt: '2026-10-01T22:10:00', status: 'Terlambat', score: 78 },
  { id: 'asub-3', assignmentId: 'cass-2', studentId: 'stu-1', submittedAt: '2026-10-19T18:00:00', status: 'Tepat waktu', score: null },
  { id: 'asub-4', assignmentId: 'cass-3', studentId: 'stu-1', submittedAt: '2026-10-07T12:00:00', status: 'Tepat waktu', score: 90 },
];

# SIAKAD Cakrawala — Campus ERP Prototype

Sistem Informasi Akademik multi-kampus untuk Yayasan Cakrawala Pendidikan.  
Prototype berbasis browser tanpa backend — semua data menggunakan localStorage.

---

## Cara Menjalankan

### Opsi 1 — Python HTTP Server (Disarankan)

cd ke folder Prototype, lalu:

`
python -m http.server 5500
`

Buka browser: http://127.0.0.1:5500

**Portal publik PMB:**  
Beranda: http://127.0.0.1:5500/#/pmb  
Daftar Online: http://127.0.0.1:5500/#/pmb/daftar  
Cek status: http://127.0.0.1:5500/#/pmb/status

**Isi KRS (role Mahasiswa):**  
http://127.0.0.1:5500/#/portal/student/krs/edit  
KRS Saya: http://127.0.0.1:5500/#/portal/student/krs  

Jika data lama, gunakan **Reset Data Demo** agar seed v1.5 termuat.

Dosen Wali (master): http://127.0.0.1:5500/#/academic/advisors

Daftar Ulang PMB: http://127.0.0.1:5500/#/admissions/re-registration  
Konversi ke Mahasiswa: http://127.0.0.1:5500/#/admissions/convert

Registrasi Semester (mahasiswa): http://127.0.0.1:5500/#/portal/student/registration  
Antrean BAAK: http://127.0.0.1:5500/#/students/registration  
Persetujuan KRS (dosen wali): http://127.0.0.1:5500/#/portal/lecturer/advising/krs  
Antrean KRS BAAK: http://127.0.0.1:5500/#/learning/krs-approval  

Portal mahasiswa (menu 8.1): http://127.0.0.1:5500/#/portal/student  
Profil / KHS / Jadwal / Dosen Wali / Tagihan: `#/portal/student/profile`, `/khs`, `/schedule`, `/advisor`, `/finance/invoices`

Portal dosen (17 menu, `design.md` §9): http://127.0.0.1:5500/#/portal/lecturer  
MK / Jadwal / Materi / Tugas / Nilai / Presensi / Jurnal / Ujian / Bimbingan / TA / Sidang / Wali / Laporan / Profil:  
`#/portal/lecturer/courses`, `/schedule`, `/materials`, `/assignments`, `/grading`, `/attendance`, `/journal`, `/exam`, `/advising`, `/thesis`, `/examination`, `/academic-advisor`, `/reports`, `/profile`

### Opsi 2 — Node.js

`
npx serve .
`

### Opsi 3 — VS Code Live Server

Klik kanan index.html > Open with Live Server

> Penting: Jangan buka index.html langsung via file:// karena ES Modules tidak didukung.

---

## Role Demo yang Tersedia

Gunakan tombol role switcher (ikon shuffle) di topbar untuk berganti role:

- Admin Yayasan — semua modul
- Admin Kampus — modul kampus tertentu
- Dekan — Akademik, Mahasiswa, Dosen
- Kemahasiswaan — PMB, Mahasiswa, Beasiswa
- Staf Keuangan — Keuangan, Tagihan, Pembayaran
- Staf Akademik — Akademik, Nilai, KRS
- Staf SDM — SDM & Payroll
- Dosen — Portal Dosen (kelas, materi, tugas, nilai, presensi, jurnal, wali/KRS, TA/sidang — sesuai penugasan)
- Mahasiswa — Portal Mahasiswa (KRS, nilai, tagihan)
- Orang Tua — Portal Orang Tua (pemantauan)

---

## Reset Data Demo

Klik avatar user di topbar > Reset Data Demo

---

*SIAKAD Cakrawala Prototype v1.0 — Data fiktif untuk demonstrasi*

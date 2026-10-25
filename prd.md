# PRD.md — Business Requirements Document (BRD) & Product Requirements Document (PRD)
# Sistem Informasi Akademik Terintegrasi (SIAKAD) Multi-Kampus

> **Status:** Draft v1.4 untuk discovery dan validasi stakeholder  
> **Tanggal:** 25 Oktober 2026  
> **Pemilik produk:** Yayasan (ditetapkan kemudian)  
> **Model institusi:** Satu yayasan yang mengelola beberapa kampus/perguruan tinggi, fakultas, jurusan/departemen, dan program studi  
> **Skala awal:** 5.000–20.000 mahasiswa secara agregat; jumlah kampus dan unit belum ditetapkan  
> **Deployment:** Cloud  
> **Bahasa utama:** Bahasa Indonesia  
> **Dokumen ini:** Menggabungkan BRD (kebutuhan bisnis) dan PRD (kebutuhan produk). Ini bukan dokumen desain teknis final atau nasihat hukum/akuntansi.

---

## 1. Ringkasan Eksekutif

Yayasan membutuhkan satu platform SIAKAD terintegrasi yang dibangun dari awal dan digunakan bersama oleh seluruh kampus di bawah naungannya. Sistem harus mengelola siklus hidup mahasiswa dari promosi dan pendaftaran mahasiswa baru (PMB), seleksi, registrasi, proses akademik, pembayaran, kelulusan, wisuda, hingga alumni. Sistem juga harus mendukung operasi organisasi, pengelolaan dosen dan pegawai, akuntansi, anggaran, pengadaan, aset, pelaporan manajemen, integrasi PDDIKTI, serta konsolidasi laporan pada tingkat yayasan.

Sistem memiliki **satu yayasan sebagai induk organisasi**, dengan banyak kampus/institusi. Setiap kampus dapat memiliki fakultas, jurusan/departemen, program studi, jenjang, lokasi, kelas, dan struktur tambahan sesuai kebutuhannya. Struktur tidak boleh mengasumsikan bahwa setiap kampus harus memakai susunan organisasi yang identik.

Platform menyediakan portal dan izin yang sesuai untuk calon mahasiswa, mahasiswa, wali/orang tua, dosen, dosen wali, tenaga kependidikan, petugas PMB, BAAK/TU, keuangan, ketua program studi, dekan, pimpinan kampus/rektorat, pengurus yayasan, auditor, dan administrator sistem.

### 1.1 Sasaran utama

1. Menyatukan data dan proses akademik seluruh kampus dalam satu sumber data terkelola.
2. Menstandarkan proses lintas kampus sambil memungkinkan konfigurasi lokal yang sah.
3. Mengintegrasikan transaksi akademik dengan billing, pembayaran, akuntansi, anggaran, dan laporan.
4. Menyediakan informasi operasional per kampus/unit dan laporan konsolidasi yayasan.
5. Menyediakan integrasi PDDIKTI melalui mekanisme resmi yang tersedia dan dapat diaudit.
6. Meningkatkan keamanan, ketertelusuran perubahan, kualitas data, dan kepatuhan.
7. Mengurangi pekerjaan manual, duplikasi spreadsheet, dan rekonsiliasi yang tidak terkontrol.

### 1.2 Prinsip produk

- **Satu yayasan, satu platform:** bukan multi-yayasan pada fase awal.
- **Multi-kampus dan multi-unit:** kampus, fakultas, jurusan, program studi, lokasi, dan pusat biaya dapat dikonfigurasi.
- **Satu sumber data:** data master tidak diduplikasi tanpa alasan dan kepemilikan data yang jelas.
- **Konfigurasi sebelum kustomisasi:** tarif, kalender, alur approval, template, dan kebijakan yang berubah-ubah harus dapat dikonfigurasi.
- **Hak akses berdasarkan peran dan lingkup organisasi:** role saja tidak cukup; pengguna juga dibatasi pada kampus/unit/mahasiswa yang menjadi tanggung jawabnya.
- **Financial-grade controls:** transaksi keuangan memiliki jejak audit, persetujuan, rekonsiliasi, dan koreksi yang terkendali.
- **API-first dan integrasi terpisah:** sistem eksternal diakses melalui adapter/service yang terdokumentasi.
- **Security and privacy by design:** minimisasi data, least privilege, enkripsi, audit, backup, dan pengujian keamanan sejak awal.
- **Modular monolith sebagai awal:** domain dipisahkan secara logis tanpa kompleksitas microservices yang tidak diperlukan.

---

## 2. Latar Belakang dan Masalah Bisnis

Proses kampus sering tersebar di berbagai aplikasi, file spreadsheet, formulir manual, aplikasi pembayaran, sistem kepegawaian, dan proses pelaporan terpisah. Akibatnya, informasi jumlah mahasiswa, status akademik, piutang, pendapatan, anggaran, dan kinerja setiap kampus dapat berbeda antara satu laporan dan laporan lain.

Masalah yang ingin diselesaikan:

- Data mahasiswa, dosen, program studi, dan transaksi tersebar atau berulang.
- Proses PMB belum selalu terhubung langsung dengan pembentukan data mahasiswa dan tagihan.
- KRS, nilai, presensi, dan status akademik memerlukan koordinasi manual.
- Pembayaran mahasiswa tidak selalu langsung terhubung dengan piutang dan jurnal akuntansi.
- Anggaran unit dan realisasi pengeluaran sulit dipantau secara konsisten.
- Yayasan memerlukan laporan agregat dari semua kampus dengan drill-down yang terkontrol.
- Pengiriman atau koreksi data PDDIKTI membutuhkan validasi, rekonsiliasi, dan tindak lanjut.
- Hak akses antar-kampus dan antar-fakultas perlu dibatasi secara konsisten.
- Perubahan data penting harus dapat ditelusuri untuk audit dan penyelesaian sengketa.

### 2.1 Pernyataan kebutuhan bisnis

Yayasan membutuhkan platform cloud terintegrasi yang menghubungkan proses akademik dan administratif dengan keuangan institusi, menyediakan kontrol operasional lintas kampus, dan menghasilkan laporan yang dapat ditelusuri sampai data atau transaksi sumbernya.

---

## 3. Tujuan, Sasaran, dan Indikator Keberhasilan

Target angka di bawah merupakan **target awal untuk divalidasi** selama discovery, bukan SLA yang sudah disepakati.

| ID | Sasaran | Indikator keberhasilan awal |
|---|---|---|
| OBJ-01 | Satu sumber data akademik | 100% mahasiswa aktif pilot memiliki satu identitas utama dan status yang konsisten |
| OBJ-02 | Proses PMB lebih efisien | Seluruh tahap PMB pilot dapat ditelusuri dari pendaftar sampai registrasi |
| OBJ-03 | Keuangan terintegrasi | Setiap pembayaran yang terkonfirmasi dapat ditautkan ke invoice dan transaksi akuntansi yang relevan |
| OBJ-04 | Laporan yayasan | Dashboard agregat dapat difilter per periode, kampus, fakultas, prodi, dan pusat biaya sesuai hak akses |
| OBJ-05 | PDDIKTI terkontrol | Setiap proses sinkronisasi memiliki status, hasil validasi, log, dan prosedur penanganan gagal |
| OBJ-06 | Keamanan | Tidak ada temuan kritis/tinggi yang belum dimitigasi saat go-live |
| OBJ-07 | Kualitas operasional | UAT ditandatangani pemilik proses untuk setiap domain dalam ruang lingkup go-live |
| OBJ-08 | Pemulihan | Backup dipulihkan dalam latihan berkala dan target RPO/RTO disetujui sebelum produksi |
| OBJ-09 | Adopsi | Pengguna pilot dilatih dan aktivitas inti dapat dilakukan tanpa bantuan tim pengembang |
| OBJ-10 | Auditabilitas | Perubahan data sensitif, approval, jurnal, dan tindakan administratif memiliki audit trail |

### 3.1 KPI bisnis yang disarankan

- Jumlah pendaftar, rasio seleksi, rasio daftar ulang, dan sumber kampanye PMB.
- Mahasiswa aktif/nonaktif/cuti/lulus/dropout per kampus, fakultas, prodi, angkatan, dan semester.
- Tingkat kelulusan mata kuliah, IPS/IPK agregat, masa studi, dan tingkat retensi.
- Persentase presensi, pengisian nilai tepat waktu, dan penyelesaian proses akademik.
- Tagihan terbit, penerimaan kas, piutang, tunggakan, umur piutang, dan rasio penagihan.
- Anggaran, komitmen, realisasi, sisa anggaran, dan deviasi per unit.
- Arus kas, pendapatan, biaya, aset, utang, dan hasil konsolidasi sesuai kebijakan akuntansi.
- Status sinkronisasi PDDIKTI, jumlah data gagal, umur antrean, dan waktu penyelesaian.
- Ketersediaan sistem, waktu respons, error rate, dan keberhasilan job terjadwal.

---

## 4. Ruang Lingkup

### 4.1 Termasuk dalam cakupan produk

1. Foundation/platform administration dan struktur organisasi yayasan.
2. Master data kampus, fakultas, jurusan/departemen, prodi, lokasi, dan unit.
3. Identity and Access Management (IAM), role, permission, scope, dan audit.
4. PMB end-to-end.
5. Administrasi mahasiswa dan akademik.
6. Kurikulum, kalender akademik, registrasi semester, jadwal, KRS/KHS, presensi, penilaian, dan kelulusan.
7. Skripsi/tugas akhir, bimbingan, yudisium, wisuda, alumni, dan tracer study.
8. Billing mahasiswa, beasiswa, diskon, cicilan, pembayaran, piutang, dan rekonsiliasi.
9. Akuntansi, anggaran, kas/bank, utang, aset, pengadaan, dan laporan keuangan.
10. SDM, dosen, pegawai, beban kerja, honorarium, dan payroll sesuai fase yang disetujui.
11. Portal mahasiswa, dosen, wali/orang tua, staf, pimpinan, dan yayasan.
12. Pelaporan manajemen, dashboard, ekspor, dan audit.
13. Integrasi PDDIKTI/Neo Feeder melalui jalur resmi yang berlaku.
14. Integrasi bank/VA/payment gateway, email/SMS/WhatsApp provider, LMS, dan sistem lain yang disetujui.
15. Infrastruktur cloud, CI/CD, observability, backup, disaster recovery, dan keamanan.
16. Migrasi data, pelatihan, UAT, pilot, dan rollout bertahap.

### 4.2 Di luar cakupan awal kecuali disetujui terpisah

- Multi-yayasan sebagai SaaS komersial.
- Marketplace pendidikan publik.
- Learning Management System (LMS) lengkap jika sudah ada LMS eksternal; integrasi diprioritaskan.
- Sistem rumah sakit/klinik kampus yang kompleks.
- Sistem asrama, transportasi, kantin/POS, atau e-commerce kampus.
- Aplikasi mobile native terpisah untuk iOS dan Android; fase awal dapat menggunakan web responsif/PWA.
- Penggajian dengan semua skema perpajakan/benefit kompleks sebelum kebijakan HR disepakati.
- Pengganti penuh sistem perpajakan, perbankan, atau aplikasi pemerintah.
- Analitik AI prediktif untuk keputusan akademik/keuangan tanpa evaluasi etika, akurasi, dan tata kelola tersendiri.

### 4.3 Asumsi awal

- Satu yayasan adalah pemilik tata kelola dan konsolidasi.
- Yayasan menaungi lebih dari satu kampus/institusi.
- Setiap kampus dapat memiliki banyak fakultas, jurusan/departemen, dan prodi.
- Total populasi mahasiswa awal sekitar 5.000–20.000, dengan beban puncak pada KRS, ujian, PMB, dan pengumuman nilai.
- Bahasa dan format utama adalah Bahasa Indonesia, mata uang Rupiah, dan zona waktu operasional Indonesia.
- Sistem menggunakan cloud; penyedia dan region belum ditetapkan.
- Data historis tersedia dalam kualitas dan format yang perlu dianalisis.
- Ketersediaan API/akses integrasi PDDIKTI, bank, dan vendor lain harus dikonfirmasi sebelum desain final.
- Kebijakan akademik, tarif, akuntansi, retensi data, dan kewenangan persetujuan ditetapkan oleh pemilik proses yayasan/kampus.
- Aturan registrasi sebelum KRS, syarat keuangan, rumus batas SKS, penguncian kuota, dan saat KRS menjadi final berbeda antar kampus serta belum ditetapkan. Lihat DEC-017 sampai DEC-027.

### 4.4 Ketergantungan dan kendala

- Akses, dokumentasi, versi, dan prosedur resmi PDDIKTI/Neo Feeder.
- Perjanjian dan spesifikasi bank, VA, payment gateway, serta biaya transaksi.
- Keputusan struktur organisasi dan identitas institusi.
- Kebijakan akademik setiap kampus dan variasi kurikulum.
- Kebijakan pengakuan pendapatan, anggaran, aset, payroll, dan konsolidasi.
- Ketersediaan tim internal untuk validasi, migrasi, UAT, dan pelatihan.
- Ketentuan hukum yang berlaku, termasuk perlindungan data pribadi dan kewajiban sistem elektronik.

---

## 5. Pemangku Kepentingan dan Persona

| Persona | Kebutuhan utama | Lingkup akses yang diharapkan |
|---|---|---|
| Pengurus yayasan | Kinerja seluruh kampus, konsolidasi, risiko, anggaran, audit | Semua kampus sesuai kewenangan yayasan; data pribadi dibatasi sesuai kebutuhan |
| Keuangan yayasan | Konsolidasi, COA, anggaran, arus kas, jurnal, pembayaran lintas unit | Entitas/unit keuangan yang ditugaskan |
| Pimpinan kampus/rektorat | Kinerja kampus, akademik, PMB, pendapatan, biaya, risiko | Kampus yang dipimpin |
| Dekan | Kinerja fakultas, prodi, dosen, mahasiswa, anggaran | Fakultas yang dipimpin |
| Ketua jurusan/kaprodi | Kurikulum, jadwal, dosen, mahasiswa, capaian akademik | Jurusan/prodi yang ditugaskan |
| BAAK/TU | Registrasi, status mahasiswa, jadwal, nilai, surat, kelulusan | Fungsi dan unit kerja yang ditugaskan |
| Petugas PMB | Pendaftar, dokumen, seleksi, pengumuman, daftar ulang | Jalur/gelombang/kampus yang ditugaskan |
| Keuangan kampus | Tagihan, pembayaran, piutang, kas/bank, rekonsiliasi | Kampus/unit yang ditugaskan |
| Dosen | Kelas, presensi, materi, nilai, bimbingan | Kelas dan mahasiswa terkait |
| Dosen wali | Persetujuan KRS dan pemantauan mahasiswa bimbingan | Mahasiswa bimbingan |
| Mahasiswa | KRS/KHS, jadwal, nilai, tagihan, pembayaran, layanan | Data diri dan riwayat akademik sendiri |
| Wali/orang tua | Informasi pembayaran dan perkembangan yang diizinkan | Mahasiswa yang telah terhubung dan aksesnya sah |
| Auditor internal | Bukti, transaksi, log, approval, laporan | Read-only sesuai penugasan audit |
| Administrator TI | Konfigurasi teknis, akun, integrasi, operasi | Administrasi teknis; tidak otomatis berwenang menyetujui transaksi bisnis |
| Admin akademik | Kalender, kurikulum, aturan akademik, referensi | Lingkup kampus/unit sesuai tugas |
| Petugas HR | Data pegawai, kontrak, absensi, payroll | Data HR sesuai fungsi dan lingkup |
| Pustakawan/lab | Peminjaman, koleksi, alat, inventaris | Modul dan unit terkait |

### 5.1 Aturan wali/orang tua

Akses wali bukan akses otomatis terhadap semua data mahasiswa dewasa. Hubungan wali harus diverifikasi, cakupan informasi harus dapat dikonfigurasi, persetujuan/landasan akses harus tercatat, dan akses dapat dicabut sesuai kebijakan serta hukum yang berlaku.

---

## 6. Struktur Organisasi dan Domain Master

### 6.1 Hierarki yang didukung

`Yayasan → Kampus/Institusi → Fakultas (opsional) → Jurusan/Departemen (opsional) → Program Studi → Kurikulum → Angkatan/Kelas`

Struktur operasional lain yang perlu didukung:
- Lokasi kampus, gedung, ruang, laboratorium, dan fasilitas.
- Unit administratif dan pusat biaya.
- Periode akademik, semester, gelombang PMB, dan tahun anggaran.
- Program/jenjang pendidikan dan bentuk kelas.
- Unit organisasi non-akademik.
- Hubungan dosen/pegawai dengan satu atau beberapa unit.

Hierarki organisasi tidak harus menjadi hierarki tunggal untuk semua proses. Misalnya, pusat biaya keuangan, unit HR, dan unit akademik dapat memiliki pemetaan yang berbeda tetapi saling terhubung.

### 6.2 Master data inti

- Yayasan dan identitas legal.
- Kampus/institusi beserta kode dan identitas pelaporan.
- Fakultas, jurusan/departemen, program studi, jenjang, dan status akreditasi.
- Kurikulum, mata kuliah, CPL/CPMK jika digunakan, prasyarat, bobot SKS, dan metode penilaian.
- Kalender akademik dan periode semester.
- Dosen, pegawai, mahasiswa, calon mahasiswa, alumni, dan wali.
- Ruang, jadwal, kelompok kelas, dan kapasitas.
- Jenis tagihan, tarif, skema beasiswa, dan aturan cicilan.
- Chart of Accounts (COA), pusat biaya, sumber dana, anggaran, dan kategori aset.
- Kode integrasi eksternal dan pemetaan PDDIKTI.
- Template dokumen, nomor surat, notifikasi, dan workflow.

Semua master data penting harus memiliki status aktif/nonaktif, tanggal berlaku jika relevan, pemilik data, dan aturan perubahan yang jelas.

---

## 7. Kebutuhan Fungsional Terperinci

Prioritas:
- **P0:** wajib untuk fondasi/MVP atau kewajiban kritis.
- **P1:** penting untuk operasional awal atau rollout.
- **P2:** peningkatan setelah proses inti stabil.

### 7.1 Platform Administration, Organisasi, dan Konfigurasi

| ID | Kebutuhan | Prioritas |
|---|---|---|
| ADM-001 | Admin berwenang dapat mengelola struktur yayasan, kampus, fakultas, jurusan, prodi, lokasi, dan unit | P0 |
| ADM-002 | Mendukung unit opsional dan variasi struktur antar-kampus | P0 |
| ADM-003 | Mendukung periode akademik, tahun anggaran, zona waktu, kalender, dan hari libur | P0 |
| ADM-004 | Mengelola nomor dokumen, format cetak, logo, kop surat, dan template per institusi | P1 |
| ADM-005 | Konfigurasi tarif, aturan akademik, approval, dan kebijakan melalui konfigurasi terkontrol | P0 |
| ADM-006 | Menyimpan riwayat perubahan konfigurasi dan nilai sebelum/sesudah | P0 |
| ADM-007 | Impor/ekspor master data dengan validasi, preview, dan laporan error | P1 |
| ADM-008 | Mengaktifkan/menonaktifkan fitur per unit melalui feature flags yang disetujui | P2 |

### 7.2 Identity and Access Management (IAM)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| IAM-001 | Login aman dan manajemen sesi | P0 |
| IAM-002 | RBAC dengan scope kampus/fakultas/prodi/unit/kelas/mahasiswa | P0 |
| IAM-003 | Mendukung beberapa peran untuk satu pengguna dengan pergantian konteks yang tercatat | P0 |
| IAM-004 | MFA untuk akun istimewa dan akses berisiko tinggi | P0 |
| IAM-005 | Provisioning, aktivasi, penonaktifan, reset, dan pemulihan akun | P0 |
| IAM-006 | Integrasi SSO/OIDC jika tersedia dan disetujui | P1 |
| IAM-007 | Pemisahan tugas untuk pembuatan, persetujuan, dan pembayaran transaksi | P0 |
| IAM-008 | Audit login, kegagalan autentikasi, perubahan role, dan akses istimewa | P0 |
| IAM-009 | Sesi wali yang hanya terhubung ke mahasiswa terverifikasi dan scope yang diizinkan | P1 |
| IAM-010 | Peninjauan akses berkala dan pencabutan otomatis untuk akun yang tidak lagi berhak | P1 |

### 7.3 PMB (Penerimaan Mahasiswa Baru)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| PMB-001 | Halaman informasi PMB publik dan internal: jalur masuk, gelombang, kuota, kampus, dan program studi | P0 |
| PMB-002 | Calon mahasiswa dapat memulai pendaftaran mandiri; verifikasi kontak mengikuti kanal yang disetujui (pada produksi) | P0 |
| PMB-003 | Formulir pendaftaran berdasarkan jalur masuk, jenjang, dan pilihan kampus/prodi | P0 |
| PMB-004 | Unggah dokumen dengan batas tipe/ukuran, antivirus jika tersedia, dan akses terbatas | P0 |
| PMB-005 | Nomor pendaftaran unik dan pelacakan status oleh pendaftar tanpa akses back-office | P0 |
| PMB-006 | Tagihan biaya pendaftaran dan konfirmasi pembayaran | P0 |
| PMB-007 | Verifikasi dokumen, catatan pemeriksa, dan permintaan perbaikan | P0 |
| PMB-008 | Seleksi administratif, tes, wawancara, penilaian, dan pemeringkatan yang dapat dikonfigurasi | P1 |
| PMB-009 | Pengumuman hasil dan notifikasi | P1 |
| PMB-010 | Daftar ulang, pilihan prodi, verifikasi akhir, dan pembentukan data mahasiswa/NIM | P0 |
| PMB-011 | Aturan pencegahan pendaftar ganda berdasarkan identitas dan pemeriksaan petugas | P0 |
| PMB-012 | Dashboard funnel PMB per kampus, prodi, jalur, gelombang, dan sumber kampanye | P1 |
| PMB-013 | Impor calon mahasiswa dari kanal eksternal melalui API/file yang tervalidasi | P2 |
| PMB-014 | Audit perubahan hasil seleksi dan keputusan pengecualian | P0 |
| PMB-015 | Portal publik Daftar Online dan Cek Status tanpa login staf; pengajuan masuk antrean PMB yang sama | P0 |

#### 7.3.1 Portal publik Daftar Online (PMB-015 dan terkait)

Portal publik adalah permukaan bagi calon mahasiswa. Ia tidak memakai menu back-office. Spesifikasi UI ada di `design.md` bagian 7.3.1.

Cakupan prototype yang dapat diuji:
- beranda informasi kampus dan CTA daftar/cek status (PMB-001, PMB-015)
- formulir bertahap: data diri, kampus/prodi/jalur, konfirmasi berkas simulasi, ringkasan (PMB-003, PMB-015)
- penerbitan nomor pendaftaran dan status awal **Dikirim** (PMB-005)
- cek status hanya dengan nomor pendaftaran (PMB-005, PMB-015)
- notifikasi/audit ke petugas bahwa ada pendaftar baru (PMB-014, SVC-003)

Batasan yang harus tetap eksplisit:
- unggah berkas sungguhan dan antivirus = PMB-004 (produksi); prototype memakai konfirmasi checklist
- pembayaran biaya daftar = PMB-006; prototype menandai belum bayar / simulasi
- verifikasi email/SMS sungguhan = bagian PMB-002 produksi; prototype tidak mengirim pesan eksternal

**Kriteria penerimaan**
- Given periode PMB demo terbuka, when calon mahasiswa mengisi seluruh field wajib dan mengirim formulir publik, then sistem menyimpan pendaftar, menerbitkan nomor unik, menampilkan halaman sukses, dan record muncul di Daftar Pendaftar staf dengan sumber daftar-online.
- Given field wajib kosong atau tidak valid, when calon mahasiswa menekan Lanjut atau Kirim, then sistem menolak, menampilkan ringkasan kesalahan yang dapat difokuskan, dan tidak membuat nomor pendaftaran.
- Given jalur Prestasi dipilih dan sertifikat prestasi belum dikonfirmasi, when tahap berkas dilanjutkan, then sistem menolak sampai checklist prestasi dicentang.
- Given nomor pendaftaran yang sah, when calon mahasiswa membuka Cek Status, then sistem menampilkan status dokumen, seleksi, pembayaran, dan status proses tanpa data pendaftar lain.
- Given nomor yang tidak ada, when Cek Status dijalankan, then sistem menampilkan keadaan kosong yang jelas.
- Given pendaftaran publik berhasil, when petugas membuka antrean PMB, then petugas dapat melanjutkan verifikasi dengan alur PMB-007 dan seterusnya.

### 7.4 Administrasi Mahasiswa

| ID | Kebutuhan | Prioritas |
|---|---|---|
| STD-001 | Profil mahasiswa, identitas, kontak, alamat, pendidikan sebelumnya, dan dokumen | P0 |
| STD-002 | NIM unik sesuai aturan institusi dan pencegahan duplikasi | P0 |
| STD-003 | Riwayat kampus, prodi, kurikulum, status, angkatan, dan perubahan program | P0 |
| STD-004 | Status mahasiswa: calon, aktif, cuti, nonaktif, pindah, lulus, mengundurkan diri, atau status lain yang disahkan | P0 |
| STD-005 | Cuti, aktif kembali, pindah prodi, transfer kredit, dan pengunduran diri melalui workflow | P1 |
| STD-006 | Dokumen mahasiswa, surat keterangan, dan template surat | P1 |
| STD-007 | Riwayat perubahan profil dan siapa yang mengubah | P0 |
| STD-008 | Pengelolaan mahasiswa lintas kampus sesuai kebijakan dan aturan pelaporan | P1 |

### 7.5 Kurikulum dan Akademik

| ID | Kebutuhan | Prioritas |
|---|---|---|
| ACA-001 | Mengelola kurikulum berdasarkan prodi, jenjang, dan periode berlaku | P0 |
| ACA-002 | Mata kuliah, SKS, prasyarat, mata kuliah wajib/pilihan, dan ekuivalensi | P0 |
| ACA-003 | Kalender akademik: periode registrasi semester, pengisian KRS, perubahan KRS, perkuliahan, ujian, input nilai, dan yudisium | P0 |
| ACA-004 | Kelas, kapasitas, jadwal, ruang, dosen pengampu, dan pencegahan bentrok | P0 |
| ACA-005 | KRS: pilih mata kuliah dan kelas, draft, tambah/hapus, batas SKS, prasyarat, bentrok, kapasitas, persetujuan dosen wali, revisi, final, perubahan pada periode yang diizinkan, riwayat, dan hak akses role | P0 |
| ACA-006 | KHS, IPS/IPK, transkrip sementara, dan perhitungan yang dapat diuji | P0 |
| ACA-007 | Presensi mahasiswa dan jurnal perkuliahan | P0 |
| ACA-008 | Input nilai dengan skema komponen/bobot yang dapat dikonfigurasi dan workflow persetujuan | P0 |
| ACA-009 | Penguncian nilai setelah final; koreksi harus melalui prosedur resmi dan audit | P0 |
| ACA-010 | Kalender ujian, ruang, pengawas, dan jadwal ujian | P1 |
| ACA-011 | Status akademik, peringatan studi, batas masa studi, dan evaluasi kemajuan | P1 |
| ACA-012 | Kegiatan pembelajaran/OBE: CPL, CPMK, pemetaan mata kuliah dan bukti capaian bila dibutuhkan | P1 |
| ACA-013 | Pengakuan pembelajaran lampau/transfer kredit sesuai kebijakan | P2 |
| ACA-014 | Rekap beban mengajar dan penugasan dosen | P1 |
| ACA-015 | Cetak KRS, KHS, dan transkrip sesuai status yang diizinkan kebijakan, termasuk identitas institusi dan jejak persetujuan | P1 |

### 7.5.1 Registrasi Semester

Registrasi semester belum punya ID tersendiri sebelum versi ini. ACA-003 tetap menjadi induk kalender. ID berikut hanya untuk proses registrasi. Pembentukan tagihan tetap BILL-002. Pengecualian keuangan tetap BILL-004. Pemblokiran layanan karena tagihan tetap BILL-011. ACA-018 memakai kebijakan itu dan tidak membuat aturan tunggakan kedua.

| ID | Kebutuhan | Prioritas |
|---|---|---|
| ACA-016 | Persyaratan registrasi yang dapat dikonfigurasi per kampus, termasuk validasi status akademik | P0 |
| ACA-017 | Mahasiswa menyimpan draft, mengajukan registrasi, melihat status, dan membatalkan hanya jika kebijakan mengizinkan | P0 |
| ACA-018 | Pemeriksaan kewajiban keuangan registrasi sesuai kebijakan, termasuk jalur tanpa syarat bayar, tunggu bayar, dan dispensasi | P0 |
| ACA-019 | Validasi petugas bila diwajibkan, termasuk penolakan yang wajib beralasan | P0 |
| ACA-020 | Riwayat registrasi per mahasiswa dan semester | P0 |
| ACA-021 | Registrasi menghormati dispensasi atau pengecualian yang sudah disetujui dan menyimpan rujukan ke keputusan itu | P0 |
| ACA-022 | Notifikasi perubahan status registrasi kepada mahasiswa dan petugas yang terkait | P1 |
| ACA-023 | Audit trail registrasi: pelaku, waktu, status asal, status tujuan, dan alasan | P0 |

Nama status sama dengan `design.md` bagian 7.7: Belum Registrasi, Draft, Menunggu Pembayaran, Menunggu Validasi, Teregistrasi, Ditolak, Dibatalkan. Menunggu Pembayaran hanya dipakai jika kebijakan keuangan kampus memang mengaktifkannya.

**Kriteria penerimaan ACA-016 dan ACA-017**
- Given periode registrasi terbuka dan seluruh syarat aktif terpenuhi, when mahasiswa mengajukan registrasi, then sistem menyimpan pengajuan, menulis riwayat, dan menampilkan status yang sesuai kebijakan (Menunggu Validasi atau Teregistrasi).
- Given periode ditutup, when mahasiswa mengajukan registrasi, then sistem menolak dan menampilkan masa periode.
- Given mahasiswa menyimpan draft, when ia kembali ke halaman, then data draft dan waktu simpan masih ada tanpa dianggap sudah teregistrasi.

**Kriteria penerimaan ACA-018 dan ACA-021**
- Given kebijakan keuangan tidak mewajibkan pembayaran, when mahasiswa yang masih punya tagihan mengajukan registrasi dan syarat lain lolos, then tagihan itu tidak menahan registrasi.
- Given kebijakan mewajibkan pembayaran dan kewajiban belum terpenuhi serta tidak ada dispensasi, when mahasiswa mengajukan, then status menjadi Menunggu Pembayaran dan KRS tidak dapat diajukan bila registrasi memang prasyarat KRS.
- Given dispensasi yang sah sudah tercatat, when kewajiban keuangan belum lunas, then registrasi tidak tertahan oleh syarat keuangan itu dan riwayat menaut ke keputusan dispensasi.
- Given data tagihan yang diperlukan belum ada, when syarat keuangan aktif, then sistem menampilkan bahwa kewajiban belum dapat diperiksa dan tidak mengubah status menjadi Teregistrasi.

**Kriteria penerimaan ACA-019 sampai ACA-023**
- Given validasi petugas diwajibkan, when mahasiswa mengajukan dan syarat lain lolos, then status menjadi Menunggu Validasi sampai petugas berwenang pada lingkup itu bertindak.
- Given petugas menolak, when mahasiswa membuka riwayat, then alasan penolakan, waktu, dan pelaku tampil.
- Given petugas mengosongkan alasan, when ia menolak, then sistem menolak aksi tersebut.
- Given status berubah, when auditor membuka jejak, then status asal, status tujuan, pelaku, waktu, dan alasan yang ada dapat dibaca.
- Given status berubah, when notifikasi dalam aplikasi diperiksa, then mahasiswa melihat peristiwa itu. Pengiriman email atau pesan eksternal tetap mengikuti kanal yang sudah disetujui, bukan bagian dari prototype.

### 7.5.2 Rincian ACA-005, ACA-004, dan ACA-015 untuk KRS

ACA-005 tetap satu requirement. Butir di bawah memperjelas cakupannya. ACA-002 tetap induk prasyarat dan kurikulum. ACA-003 tetap induk periode. ACA-004 tetap induk kapasitas, jadwal, dan bentrok pada data kelas. ACA-015 tetap induk cetak. LEC-008 membatasi lingkup dosen wali. Tidak ada ID KRS baru untuk fungsi yang sama.

ACA-005 mencakup:
- memilih mata kuliah dan kelas yang tersedia bagi kurikulum mahasiswa
- menyimpan draft serta menambah dan menghapus item selama status mengizinkan
- menolak SKS di atas batas, prasyarat yang gagal atau belum dapat diperiksa, bentrok jadwal, kelas penuh, dan duplikat kelas atau mata kuliah pada KRS yang sama
- mengajukan kepada dosen wali, mengembalikan untuk revisi dengan catatan, dan mengajukan ulang
- memfinalkan hanya setelah persetujuan yang diwajibkan diberikan
- mengubah KRS final hanya pada periode perubahan, dengan snapshot sebelumnya
- menyimpan riwayat status
- membatasi aksi sesuai role dan lingkup
- memberi tahu mahasiswa dan dosen wali saat status berubah, lewat mekanisme notifikasi yang sudah ada (SVC-003 dan SVC-004)

**Kriteria penerimaan**
- Given syarat registrasi yang diwajibkan kebijakan sudah terpenuhi, when mahasiswa memilih kelas yang lolos seluruh aturan, then kelas masuk draft dan total SKS bertambah sesuai SKS mata kuliah itu.
- Given registrasi diwajibkan sebelum KRS dan belum terpenuhi, when mahasiswa mengajukan KRS, then sistem menolak dan menjelaskan syarat registrasi yang belum selesai.
- Given dua kelas bentrok, when mahasiswa menambah kelas kedua, then penambahan ditolak dan pesan menyebut kedua mata kuliah serta waktu yang beririsan.
- Given penambahan membuat total SKS melewati batas mahasiswa, when ia menambah mata kuliah, then sistem menolak dan menampilkan total serta batas.
- Given kelas sudah penuh, when mahasiswa memilih kelas itu, then pemilihan ditolak.
- Given mata kuliah atau kelas yang sama sudah ada pada draft, when mahasiswa menambahkannya lagi, then sistem menolak.
- Given data prasyarat belum tersedia, when mahasiswa menambah mata kuliah yang memiliki prasyarat, then sistem tidak menganggap prasyarat terpenuhi.
- Given KRS diajukan dan dosen wali bimbingannya menyetujui, when mahasiswa membuka KRS, then status dan waktu persetujuan terlihat.
- Given dosen wali mengembalikan KRS dengan catatan, when mahasiswa membuka KRS, then catatan tampil dan item dapat diperbaiki sesuai periode serta status.
- Given kebijakan mewajibkan persetujuan dosen wali, when KRS belum disetujui, then status tidak dapat menjadi Final.
- Given KRS sudah Final dan periode perubahan tertutup, when mahasiswa mengubah item, then sistem menolak.
- Given periode perubahan terbuka, when mahasiswa memulai perubahan, then snapshot Final tetap dapat dibaca dan perubahan mengikuti alur persetujuan yang berlaku.
- Given dosen wali membuka mahasiswa di luar penugasannya, when halaman detail diminta, then data KRS mahasiswa itu tidak ditampilkan.
- Given KRS berstatus yang kebijakan izinkan untuk dicetak, when mahasiswa mencetak, then dokumen memuat identitas, mata kuliah, SKS, kelas, dosen, jadwal, total SKS, status, dan dosen wali tanpa navigasi aplikasi.
- Given kurikulum diubah setelah KRS final, when riwayat KRS dibuka, then kode, nama, dan SKS pada KRS itu tidak berubah diam-diam.

### 7.6 Tugas Akhir, Kelulusan, Wisuda, dan Alumni

| ID | Kebutuhan | Prioritas |
|---|---|---|
| GRD-001 | Pendaftaran topik/judul tugas akhir dan penetapan pembimbing | P1 |
| GRD-002 | Log bimbingan, milestone, berkas, dan status persetujuan | P1 |
| GRD-003 | Seminar proposal, sidang, penilaian, dan berita acara | P1 |
| GRD-004 | Pemeriksaan syarat kelulusan akademik dan administratif | P0 |
| GRD-005 | Yudisium, penetapan kelulusan, dan daftar peserta | P1 |
| GRD-006 | Wisuda, pendaftaran, biaya, jadwal, dan dokumen kelulusan | P1 |
| GRD-007 | Transkrip akhir, surat keterangan lulus, SKPI/sertifikat jika berlaku | P1 |
| GRD-008 | Data alumni dan tracer study | P2 |
| GRD-009 | Riwayat perubahan status kelulusan dan koreksi yang disetujui | P0 |

### 7.7 Portal Dosen dan Beban Kerja

LEC-001 sampai LEC-007 adalah kebutuhan induk/ringkas. Rincian perilaku
portal dosen ada pada LEC-008 sampai LEC-037 dan `design.md` bagian 9.
Jangan menduplikasi ID untuk fungsi yang sama.

| ID | Kebutuhan | Prioritas |
|---|---|---|
| LEC-001 | Profil dosen, identitas profesional, unit, penugasan mengajar/wali/TA, preferensi notifikasi; identitas resmi hanya diubah BAAK/HR (`design.md` 9.0.17) | P0 |
| LEC-002 | Induk akses jadwal, kelas, daftar mahasiswa, dan materi; rincian pada LEC-010, LEC-011, LEC-013 | P0 |
| LEC-003 | Induk presensi, jurnal, tugas, komponen nilai, dan pengumuman; rincian pada LEC-016–LEC-026 dan LEC-032 | P0 |
| LEC-004 | Bimbingan tugas akhir dan catatan bimbingan. Persetujuan KRS ada pada ACA-005 dan LEC-008; rincian TA pada LEC-028 | P1 |
| LEC-005 | Rekap beban mengajar dan honor berdasarkan aturan yang disetujui | P1 |
| LEC-006 | Data untuk BKD atau proses pelaporan lain sesuai kebutuhan dan aturan yang berlaku | P1 |
| LEC-007 | Pembatasan akses nilai hanya pada kelas/mahasiswa yang menjadi tanggung jawab dosen (diperkuat LEC-009) | P0 |
| LEC-008 | Dosen wali meninjau, menyetujui, atau mengembalikan KRS hanya untuk mahasiswa pada penugasan bimbingannya | P0 |
| LEC-009 | Dosen hanya mengakses mata kuliah, kelas, mahasiswa, materi, tugas, dan nilai yang ditugaskan kepadanya; akses di luar penugasan ditolak | P0 |
| LEC-010 | Daftar mata kuliah dan kelas yang diampu per semester, dengan informasi jumlah mahasiswa, jumlah pertemuan, status presensi, status jurnal, dan status penilaian | P0 |
| LEC-011 | Jadwal mengajar harian, mingguan, dan kalender akademik; dosen hanya membaca kalender, tidak mengubah | P0 |
| LEC-012 | Pengajuan jadwal pengganti melalui form dengan alasan dan persetujuan sesuai prosedur institusi | P1 |
| LEC-013 | Pengelolaan materi dan modul per mata kuliah, kelas, dan pertemuan: RPS, silabus, modul, slide, praktikum, referensi URL, dan video; mendukung draft, publikasi, dan penjadwalan publikasi | P1 |
| LEC-014 | Batasan prototype materi: hanya metadata yang disimpan di localStorage; file tidak disimpan sebagai base64; dokumentasi kebutuhan object storage untuk produksi | P1 |
| LEC-015 | Akses materi mahasiswa dibatasi berdasarkan kelas yang diambil; dosen hanya mengelola materi kelasnya | P0 |
| LEC-016 | Membuat dan mengelola tugas per kelas: judul, deskripsi, lampiran simulasi, deadline, bobot, aturan keterlambatan, aturan pengumpulan ulang, dan status publikasi | P0 |
| LEC-017 | Melihat pengumpulan mahasiswa, memberikan nilai dan komentar per mahasiswa, meminta revisi; mahasiswa hanya mengakses tugas kelasnya | P0 |
| LEC-018 | Kuis sederhana demo: judul, deskripsi, durasi, jumlah soal simulasi, deadline, bobot | P1 |
| LEC-019 | Pengaturan komponen dan bobot penilaian per mata kuliah/kelas; komponen dapat ditambah, diubah nama, dan dinonaktifkan; bobot tidak di-hardcode global; total bobot harus 100% | P0 |
| LEC-020 | Rumus nilai akhir = Σ (nilai komponen × bobot / 100); konversi ke huruf dan bobot mutu mengikuti tabel yang dapat dikonfigurasi per kampus | P0 |
| LEC-021 | Impor dan ekspor nilai format CSV/Excel; preview dan validasi sebelum simpan | P1 |
| LEC-022 | Finalisasi nilai membutuhkan konfirmasi; setelah final nilai tidak diubah langsung; publikasi terpisah dari finalisasi; mahasiswa melihat nilai hanya setelah publikasi | P0 |
| LEC-023 | Koreksi nilai setelah finalisasi melalui pengajuan dengan nilai lama, nilai baru, dan alasan; riwayat koreksi tercatat | P0 |
| LEC-024 | Jika bobot atau komponen diubah setelah nilai diterbitkan, perubahan menyimpan snapshot sebelum dan sesudah, alasan, waktu, dan aktor | P0 |
| LEC-025 | Presensi per kelas dan pertemuan: status H/I/S/A, penguncian setelah batas waktu, koreksi dengan alasan dan audit trail; dosen hanya kelas kewenangannya | P0 |
| LEC-026 | Jurnal perkuliahan per pertemuan: topik, capaian pembelajaran, catatan; terkait dengan presensi pertemuan yang sama | P0 |
| LEC-027 | Ujian: jadwal UTS/UAS untuk kelas yang diampu, berita acara ujian demo | P1 |
| LEC-028 | Skripsi/TA dari sisi pembimbing: daftar mahasiswa bimbingan, review judul/proposal, catatan bimbingan, persetujuan seminar/sidang; akses hanya untuk mahasiswa yang ditugaskan | P1 |
| LEC-029 | Sidang dan penguji: jadwal sidang yang ditugaskan, dokumen peserta, rubrik penilaian, catatan penguji, keputusan sidang, berita acara, monitoring revisi; hanya sidang yang melibatkan dosen sebagai penguji | P1 |
| LEC-030 | Dashboard dosen menampilkan KPI sesuai penugasan: mata kuliah, kelas, mahasiswa, jadwal hari ini, tugas belum dinilai, nilai belum final/dipublikasikan, presensi belum lengkap, jurnal belum diisi, bimbingan, dan jadwal sidang; setiap kartu membuka halaman detail | P0 |
| LEC-031 | Monitoring Wali Akademik: daftar mahasiswa bimbingan, IPK/IPS, status registrasi dan KRS, indikator risiko, tautan ke LEC-008; hanya penugasan wali aktif | P0 |
| LEC-032 | Pengumuman kelas: buat/ubah/publikasi untuk kelas yang diampu; mahasiswa hanya melihat pengumuman kelas yang diambilnya | P1 |
| LEC-033 | Laporan akademik dosen: rekap presensi, nilai, pengumpulan tugas, dan beban mengajar terbatas pada kelas kewenangannya; cetak dan ekspor CSV demo | P1 |
| LEC-034 | Pengajuan administrasi dosen (surat tugas, keterangan aktif, cuti mengajar, terkait jadwal) dengan status Diajukan/Diproses/Selesai/Ditolak dan riwayat | P2 |
| LEC-035 | Catatan konsultasi bimbingan akademik (non-KRS): tanggal, topik, isi, tindak lanjut; terpisah dari catatan TA (LEC-028) | P1 |
| LEC-036 | Integrasi data portal dosen memakai sumber kanonis: classes (penugasan), enrollments/KRS Final (roster), advisorAssignments (wali), theses/defenseSessions (TA/sidang), curricula/courses (MK); perubahan master hanya lewat modul terkait | P0 |
| LEC-037 | Audit trail aksi penting portal dosen: perubahan nilai, bobot, presensi terkunci, publikasi materi/nilai, keputusan KRS wali, keputusan TA/sidang; menyimpan aktor, waktu, sebelum/sesudah, alasan bila wajib | P0 |

#### 7.7.1 Kriteria penerimaan LEC-009 s/d LEC-037

**LEC-009 dan LEC-010**
- Given dosen login, when membuka Mata Kuliah Saya, then hanya kelas yang ditugaskan kepadanya yang tampil.
- Given dosen mengakses kelas yang bukan penugasannya, then sistem menolak dan menampilkan pesan akses ditolak.

**LEC-013, LEC-014, LEC-015**
- Given dosen mengunggah materi, when prototype menyimpan, then hanya metadata (nama, ukuran simulasi, tipe, timestamp) yang disimpan di localStorage; tidak ada base64 file besar.
- Given mahasiswa membuka materi, when kelas yang diambil tidak cocok, then materi tidak ditampilkan.

**LEC-016 dan LEC-017**
- Given dosen membuat tugas dengan deadline, when mahasiswa mengumpulkan setelah deadline dan aturan keterlambatan = Ditolak, then pengumpulan ditolak.
- Given dosen menilai tugas, when kelas bukan kewenangannya, then aksi ditolak.

**LEC-019 dan LEC-020**
- Given dosen mengatur bobot dan totalnya belum 100%, when mencoba finalisasi nilai, then sistem menolak dan menampilkan peringatan total bobot.
- Given komponen penilaian dinonaktifkan, when nilai akhir dihitung, then komponen itu tidak ikut perhitungan.

**LEC-022 dan LEC-023**
- Given nilai sudah difinalkan, when dosen mengubah nilai langsung, then sistem menolak; hanya melalui pengajuan koreksi.
- Given nilai belum dipublikasikan, when mahasiswa membuka KHS, then nilai belum terlihat.

**LEC-024**
- Given bobot diubah setelah nilai dipublikasikan, when perubahan disimpan, then sistem menyimpan snapshot bobot lama, bobot baru, alasan, waktu, dan pelaku.

**LEC-025 dan LEC-026**
- Given presensi sudah dikunci, when dosen mengoreksi, then wajib mengisi alasan dan riwayat perubahan tercatat.
- Given jurnal belum diisi untuk pertemuan yang sudah berlangsung, when dashboard dihitung, then pertemuan itu masuk hitungan jurnal belum diisi.

**LEC-028 dan LEC-029**
- Given dosen bukan pembimbing mahasiswa X, when membuka detail skripsi X, then akses ditolak.
- Given dosen sebagai penguji sidang, when membuka dokumen peserta yang bukan ditugaskan kepadanya, then akses ditolak.

**LEC-030**
- Given dosen login, when membuka dashboard, then semua KPI dihitung dari penugasan aktualnya saja; mata kuliah, bimbingan, dan sidang di luar penugasan tidak dihitung.

**LEC-031 dan LEC-035**
- Given dosen tanpa penugasan wali, when membuka Wali Akademik, then empty state tanpa daftar mahasiswa kampus lain.
- Given dosen mencatat konsultasi, when mahasiswa bimbingan membuka portal, then catatan yang relevan dapat dilihat sesuai kebijakan tampilan.

**LEC-032**
- Given dosen mempublikasikan pengumuman untuk kelas A, when mahasiswa kelas B membuka portal, then pengumuman kelas A tidak tampil.

**LEC-033**
- Given dosen membuka laporan, when filter kelas di luar penugasan dipilih (atau di-hack lewat URL), then data tidak ditampilkan.

**LEC-034**
- Given dosen mengajukan surat keterangan, when status masih Diajukan, then riwayat memuat pelaku dan waktu pengajuan.

**LEC-036 dan LEC-037**
- Given roster kelas, when KRS mahasiswa belum Final (atau setara enrollment resmi), then mahasiswa itu tidak masuk daftar kelas dosen untuk penilaian/presensi sesuai kebijakan demo.
- Given koreksi nilai disimpan, when audit log dibuka, then baris memuat nilai lama, nilai baru, alasan, aktor, dan waktu.

#### 7.7.2 Alur utama Portal Dosen (aktor, prasyarat, aturan)

**A. Materi & Modul (LEC-013–LEC-015)**
- Aktor: Dosen pengampu kelas.
- Prasyarat: penugasan mengajar aktif pada kelas; periode semester berjalan atau diizinkan mengunggah.
- Alur utama: pilih MK/kelas → unggah/metadata → draft → publikasi atau jadwalkan → mahasiswa kelas melihat.
- Alternatif: ganti file (versi baru + riwayat); nonaktifkan materi; tolak hapus jika kebijakan melarang (DEC-031).
- Validasi: jenis/ukuran file sesuai kebijakan produksi; prototype hanya validasi metadata.
- Audit: create/update/publish/unpublish tercatat (LEC-037).

**B. Tugas & Penilaian pengumpulan (LEC-016–LEC-017)**
- Aktor: Dosen pengampu; Mahasiswa peserta kelas.
- Prasyarat: kelas diampu; tugas dipublikasikan untuk pengumpulan mahasiswa.
- Alur utama: buat tugas → publikasi → mahasiswa kumpul → dosen nilai/komentar → tandai selesai.
- Alternatif: terlambat menurut latePolicy; minta revisi; tolak akses kelas asing.
- Validasi: rentang nilai 0–100; deadline; tipe file (produksi).

**C. Komponen bobot & nilai akhir (LEC-019–LEC-024)**
- Aktor: Dosen pengampu; opsional Kaprodi/BAAK untuk koreksi (DEC-036).
- Prasyarat: kelas diampu; sebelum final, dosen boleh ubah komponen; setelah publikasi, ubah bobot lewat prosedur resmi.
- Alur utama: atur komponen+bobot (total 100%) → input nilai → pratinjau → finalisasi → publikasi.
- Alternatif: impor CSV dengan preview; pengajuan koreksi setelah final; snapshot saat ubah bobot setelah terbit.
- Aturan: tidak hardcode bobot global; huruf mutu dari tabel kampus yang dapat dikonfigurasi.

**D. Presensi & Jurnal (LEC-025–LEC-026)**
- Aktor: Dosen pengampu.
- Prasyarat: pertemuan terjadwal atau pertemuan yang dibuka dosen; kelas kewenangan.
- Alur utama: buka pertemuan → isi H/I/S/A → simpan → (opsional) kunci → isi jurnal topik/CPL.
- Alternatif: koreksi setelah kunci dengan alasan; tolak edit kelas lain.
- Audit: setiap koreksi pasca-kunci tercatat.

**E. Wali, TA, Sidang (LEC-008, LEC-028, LEC-029, LEC-031)**
- Aktor: Dosen wali / pembimbing / penguji sesuai penugasan.
- Prasyarat: `advisorAssignments` aktif, atau `theses.supervisorId`, atau slot penguji pada `defenseSessions`.
- Alur utama KRS: lihat antrean bimbingan → buka detail → Setujui atau Kembalikan dengan catatan (ACA-005).
- Alur utama TA: review judul/proposal → catatan bimbingan → setujui seminar/sidang.
- Alur utama sidang: buka jadwal ditugaskan → dokumen → rubrik → catatan → keputusan sesuai DEC-034.
- Aturan: tidak ada akses otomatis ke semua dokumen skripsi kampus.

**Integrasi:** LEC-036 mengikat portal ke ACA-004 (kelas/jadwal), ACA-005 (KRS), ACA-016+ (registrasi), modul skripsi 7.6, dan laporan 7.14 tanpa menyalin master data.

### 7.8 Billing dan Keuangan Mahasiswa

| ID | Kebutuhan | Prioritas |
|---|---|---|
| BILL-001 | Master tarif berdasarkan prodi, angkatan, jalur, kelas, dan periode | P0 |
| BILL-002 | Pembentukan invoice berdasarkan status registrasi dan aturan biaya | P0 |
| BILL-003 | Jenis biaya: pendaftaran, uang pangkal, UKT/SPP, SKS, praktikum, lab, wisuda, dan lainnya | P0 |
| BILL-004 | Beasiswa, diskon, dispensasi, cicilan, dan perubahan tagihan dengan approval | P0 |
| BILL-005 | Payment gateway, bank, Virtual Account, dan kanal pembayaran yang disepakati | P1 |
| BILL-006 | Pembayaran manual dengan verifikasi petugas dan bukti pendukung | P0 |
| BILL-007 | Rekonsiliasi transaksi bank/gateway dengan invoice dan settlement | P1 |
| BILL-008 | Penanganan pembayaran parsial, lebih bayar, kurang bayar, gagal, pending, reversal, dan refund | P0 |
| BILL-009 | Kartu piutang mahasiswa, aging, pengingat, dan riwayat penagihan | P0 |
| BILL-010 | Kuitansi dan bukti pembayaran dengan nomor unik | P0 |
| BILL-011 | Kebijakan blokir layanan akademik berdasarkan status tagihan, dengan pengecualian resmi | P1 |
| BILL-012 | Pemisahan antara status pembayaran, pengakuan pendapatan, dan pencatatan akuntansi | P0 |
| BILL-013 | Audit perubahan tarif, potongan, refund, dan transaksi pembayaran | P0 |

### 7.9 Akuntansi dan Keuangan Yayasan

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FIN-001 | COA dengan struktur akun dan aturan penggunaan | P0 |
| FIN-002 | Buku besar dan jurnal double-entry | P0 |
| FIN-003 | Jurnal otomatis dari billing, pembayaran, AP, aset, dan payroll sesuai mapping | P0 |
| FIN-004 | Jurnal manual dengan dokumen pendukung, approval, dan periode akuntansi | P0 |
| FIN-005 | Piutang, utang usaha, pembayaran vendor, dan aging | P1 |
| FIN-006 | Kas/bank, rekening, penerimaan, pengeluaran, dan rekonsiliasi bank | P0 |
| FIN-007 | Anggaran tahunan, revisi, komitmen, realisasi, dan variance | P0 |
| FIN-008 | Pusat biaya: kampus, fakultas, prodi, unit, proyek, dan sumber dana | P0 |
| FIN-009 | Alur pengajuan biaya, pengadaan, PO/kontrak jika dibutuhkan, penerimaan barang/jasa, dan pembayaran | P1 |
| FIN-010 | Kas kecil, uang muka, reimbursement, dan pertanggungjawaban | P1 |
| FIN-011 | Register aset tetap, lokasi, penanggung jawab, penyusutan, mutasi, dan pelepasan | P1 |
| FIN-012 | Donasi, hibah, dana terikat/tidak terikat jika relevan, dan pelacakan penggunaannya | P1 |
| FIN-013 | Payroll dan honorarium terintegrasi, termasuk pemetaan jurnal dan pusat biaya | P1 |
| FIN-014 | Laporan neraca, aktivitas/laba-rugi sesuai bentuk entitas, arus kas, buku besar, neraca saldo, dan realisasi anggaran | P0 |
| FIN-015 | Tutup periode, penguncian periode, pembukaan kembali melalui approval, dan checklist penutupan | P0 |
| FIN-016 | Konsolidasi seluruh kampus/unit dan eliminasi transaksi antar-entitas bila secara akuntansi diperlukan | P0 |
| FIN-017 | Koreksi transaksi terposting melalui reversal/jurnal pengganti; tidak ada penghapusan diam-diam | P0 |
| FIN-018 | Drill-down dari laporan ke jurnal dan transaksi sumber sesuai hak akses | P0 |
| FIN-019 | Nomor dokumen, status draft/approved/posted/reversed, dan segregasi tugas | P0 |
| FIN-020 | Kebijakan akuntansi, pengakuan pendapatan, dana, aset, dan konsolidasi disahkan oleh penanggung jawab keuangan/auditor | P0 |

**Catatan akuntansi:** bentuk laporan dan perlakuan akuntansi harus dikonfirmasi oleh akuntan/penasihat yang memahami bentuk hukum yayasan dan institusi pendidikan. Jangan mengasumsikan semua entitas harus menggunakan format laba-rugi komersial yang sama. Sistem harus mendukung kebijakan yang disetujui, bukan menetapkan kebijakan akuntansi sendiri.

### 7.10 SDM, Kepegawaian, dan Payroll

| ID | Kebutuhan | Prioritas |
|---|---|---|
| HR-001 | Data pegawai, dosen, jabatan, unit, kontrak, status, dan riwayat | P1 |
| HR-002 | Rekrutmen dan onboarding dasar | P2 |
| HR-003 | Kehadiran, cuti, izin, dan jadwal kerja | P1 |
| HR-004 | Komponen gaji, tunjangan, potongan, honor, dan aturan per periode | P1 |
| HR-005 | Approval payroll dan penguncian periode | P1 |
| HR-006 | Slip gaji dengan akses terbatas | P1 |
| HR-007 | Jurnal payroll dan alokasi biaya ke pusat biaya | P1 |
| HR-008 | Ekspor/Integrasi untuk kewajiban pajak dan BPJS sesuai kebutuhan dan spesifikasi yang berlaku | P2 |
| HR-009 | Pembatasan akses data personalia dan kompensasi | P0 |

### 7.11 Perpustakaan, Laboratorium, Fasilitas, dan Aset Operasional

| ID | Kebutuhan | Prioritas |
|---|---|---|
| OPS-001 | Inventaris ruang, fasilitas, dan laboratorium | P1 |
| OPS-002 | Jadwal pemakaian ruang/lab dan pencegahan bentrok | P1 |
| OPS-003 | Peminjaman alat, pengembalian, kondisi, dan denda bila berlaku | P2 |
| OPS-004 | Perpustakaan: anggota, koleksi, peminjaman, pengembalian, dan denda atau integrasi ke sistem perpustakaan yang ada | P2 |
| OPS-005 | Pengadaan dan pemeliharaan aset | P1 |
| OPS-006 | Pencatatan lokasi dan penanggung jawab aset | P1 |

### 7.12 Mutu, Akreditasi, Penelitian, dan Pengabdian

| ID | Kebutuhan | Prioritas |
|---|---|---|
| QUA-001 | Penyimpanan dokumen mutu, standar, indikator, temuan, dan tindak lanjut | P1 |
| QUA-002 | Pengumpulan bukti kinerja program studi dan fakultas | P1 |
| QUA-003 | Monitoring akreditasi dan tenggat dokumen | P1 |
| QUA-004 | Data penelitian, publikasi, pengabdian, dan hibah jika masuk ruang lingkup | P2 |
| QUA-005 | Pelacakan versi dokumen dan approval | P1 |

### 7.13 Layanan Mahasiswa, Notifikasi, dan Pengaduan

| ID | Kebutuhan | Prioritas |
|---|---|---|
| SVC-001 | Portal permintaan surat dan layanan akademik | P1 |
| SVC-002 | Pengaduan/tiket, kategori, prioritas, SLA internal, dan status | P2 |
| SVC-003 | Notifikasi email dan kanal lain melalui provider yang disetujui | P1 |
| SVC-004 | Template notifikasi per kejadian dan unit | P1 |
| SVC-005 | Preferensi komunikasi dan pencatatan status pengiriman | P1 |
| SVC-006 | Pusat informasi kalender, pengumuman, dan perubahan jadwal | P1 |

### 7.14 Dashboard dan Pelaporan

| ID | Kebutuhan | Prioritas |
|---|---|---|
| REP-001 | Dashboard yayasan dengan agregat seluruh kampus | P0 |
| REP-002 | Dashboard kampus, fakultas, jurusan, dan prodi sesuai lingkup | P0 |
| REP-003 | Filter periode, kampus, unit, prodi, angkatan, dan status | P0 |
| REP-004 | Drill-down dari angka agregat ke detail yang diizinkan | P0 |
| REP-005 | Ekspor Excel/CSV/PDF dengan pembatasan akses dan pencatatan | P1 |
| REP-006 | Penjadwalan laporan berkala dan pengiriman ke penerima yang sah | P2 |
| REP-007 | Definisi KPI dan rumus perhitungan yang terdokumentasi | P0 |
| REP-008 | Pemisahan data operasional dan analitik saat volume laporan membesar | P2 |
| REP-009 | Penanda waktu pembaruan data dan sumber data pada dashboard | P1 |

### 7.15 Integrasi PDDIKTI/Neo Feeder

| ID | Kebutuhan | Prioritas |
|---|---|---|
| INT-001 | Adapter integrasi yang terpisah dari domain akademik utama | P0 |
| INT-002 | Mapping kode internal ke kode dan referensi resmi yang relevan | P0 |
| INT-003 | Validasi lokal sebelum pengiriman | P0 |
| INT-004 | Status antrean: pending, processing, success, failed, needs-review | P0 |
| INT-005 | Retry dengan backoff dan batas percobaan; cegah duplikasi | P0 |
| INT-006 | Log permintaan/respons dengan redaksi data sensitif | P0 |
| INT-007 | Rekonsiliasi data internal dan data eksternal | P0 |
| INT-008 | Dashboard kegagalan, penyebab, pemilik tindak lanjut, dan tenggat | P0 |
| INT-009 | Mendukung proses manual/approval operator jika diwajibkan oleh alur resmi | P0 |
| INT-010 | Uji regresi ketika versi, skema, atau aturan integrasi berubah | P0 |
| INT-011 | Menyimpan kredensial integrasi di secret manager, bukan source code | P0 |

Implementasi harus menggunakan dokumentasi, akses, dan mekanisme resmi yang berlaku saat proyek dimulai. Tidak boleh mengasumsikan semua operasi dapat dilakukan otomatis tanpa tindakan operator. Ruang lingkup integrasi final harus dikonfirmasi dengan pihak kampus dan pengelola sistem resmi.

### 7.16 Integrasi Eksternal Lain

- Bank/VA/payment gateway: invoice reference, callback bertanda tangan/terverifikasi, idempotency, settlement, refund, rekonsiliasi, dan pemantauan.
- LMS: SSO, sinkronisasi kelas/roster, tautan materi, dan hasil pembelajaran jika dibutuhkan.
- Email/SMS/WhatsApp: provider resmi, template, consent/preference, status, rate limit, dan retry.
- HR/payroll/tax: integrasi hanya setelah skema data dan kewajiban yang berlaku disepakati.
- Sistem identitas/SSO: OIDC/SAML jika tersedia.
- Perpustakaan dan sistem riset: API/file import yang terdokumentasi.
- Sistem BI: data mart/read replica dengan akses read-only dan kebijakan privasi.

---

## 8. Alur Bisnis End-to-End Utama

### 8.1 PMB sampai mahasiswa aktif

1. Admin mengonfigurasi gelombang, jalur, kuota, program studi, formulir, tarif, dan jadwal.
2. Calon mahasiswa membuka portal publik Daftar Online (atau staf menambah pendaftar dari back-office jika kebijakan mengizinkan).
3. Calon mahasiswa mengisi formulir, mengonfirmasi berkas sesuai ketentuan, dan mengirim pengajuan. Sistem memvalidasi data wajib dan menerbitkan nomor pendaftaran.
4. Sistem membentuk tagihan biaya pendaftaran sesuai kebijakan (pada prototype: status belum bayar / simulasi).
5. Pembayaran dikonfirmasi melalui kanal resmi atau diverifikasi petugas (produksi); prototype tidak memindahkan dana.
6. Petugas memeriksa dokumen; jika kurang, pendaftar diminta memperbaiki.
7. Seleksi dilaksanakan sesuai jalur; keputusan dan pengecualian tercatat.
8. Hasil diumumkan; pendaftar dapat melihat status lewat Cek Status / pengumuman.
9. Calon mahasiswa yang diterima melakukan daftar ulang dan memenuhi persyaratan.
10. Sistem membentuk data mahasiswa, NIM, status awal, akun, kurikulum, dan tagihan yang relevan.
11. Data yang wajib dilaporkan dipetakan ke PDDIKTI sesuai aturan.
12. Dashboard PMB memperbarui funnel dan hasil, termasuk sumber daftar-online.

### 8.2 Registrasi semester sampai nilai

1. Admin menetapkan kalender, termasuk periode registrasi, pengisian KRS, dan perubahan KRS, serta kelas, mata kuliah, kapasitas, dosen, dosen wali, dan kebijakan registrasi.
2. Mahasiswa melihat syarat registrasi. Jika periode terbuka dan syarat aktif terpenuhi, mahasiswa mengajukan. Status berikutnya mengikuti kebijakan: dapat berhenti pada Menunggu Pembayaran, Menunggu Validasi, atau langsung Teregistrasi.
3. Bila validasi petugas aktif, petugas mengonfirmasi atau menolak dengan alasan. Dispensasi yang sah dirujuk, bukan diasumsikan.
4. Jika kebijakan mewajibkan registrasi sebelum KRS dan registrasi belum memenuhi syarat, pengajuan KRS ditolak beserta alasannya.
5. Mahasiswa menambah kelas yang lolos validasi dan dapat menyimpan draft.
6. Mahasiswa mengajukan KRS. Jika persetujuan dosen wali wajib, status menjadi Menunggu Persetujuan Dosen Wali.
7. Dosen wali menyetujui atau mengembalikan untuk revisi. Mahasiswa memperbaiki selama periode dan status mengizinkan.
8. KRS menjadi Final hanya sesuai kebijakan: saat disetujui, atau saat periode dikunci setelah status Disetujui. Persetujuan yang wajib tidak boleh dilewati.
9. Perubahan setelah Final hanya pada periode perubahan KRS dan menyimpan snapshot sebelumnya.
10. Roster kelas dibentuk dari item KRS yang sah. Total SKS pada KRS, jadwal mahasiswa, dan roster memakai SKS yang sama.
11. Dosen mencatat pertemuan, presensi, tugas, dan nilai.
12. Nilai diverifikasi lalu dikunci.
13. Sistem menghitung KHS, IPS, dan IPK dengan rumus yang dapat diuji.
14. Pelaporan eksternal hanya lewat integrasi resmi. Prototype tidak mengirim data sungguhan.
15. Mahasiswa melihat hasil sesuai waktu publikasi dan hak akses.

### 8.3 Tagihan sampai laporan keuangan

1. Tarif dan aturan biaya disahkan serta diberi periode berlaku.
2. Sistem membentuk invoice berdasarkan mahasiswa, status registrasi, dan kebijakan biaya.
3. Mahasiswa membayar melalui bank/gateway atau kanal resmi lain.
4. Sistem memverifikasi transaksi, mencegah callback duplikat, dan mengaitkannya ke invoice.
5. Rekonsiliasi mencocokkan transaksi sistem dengan settlement bank/gateway.
6. Jurnal dibuat berdasarkan aturan akuntansi yang disetujui; transaksi sumber dan jurnal saling tertaut.
7. Tim keuangan meninjau exception, refund, reversal, dan selisih.
8. Laporan per kampus/unit diperbarui.
9. Yayasan melihat agregat dan melakukan drill-down sesuai kewenangan.
10. Tutup periode hanya dilakukan setelah checklist dan rekonsiliasi yang ditetapkan selesai.

### 8.4 Pengeluaran dan anggaran

1. Unit mengajukan pengeluaran dengan kategori, pusat biaya, sumber dana, dokumen, dan nilai.
2. Sistem memeriksa anggaran tersedia dan kebijakan otorisasi.
3. Persetujuan mengikuti matriks kewenangan dan batas nilai.
4. Pengadaan/penerimaan barang atau jasa dicatat jika berlaku.
5. Keuangan memverifikasi dokumen dan melakukan pembayaran.
6. Transaksi masuk ke buku besar dengan dimensi pusat biaya yang benar.
7. Dashboard menunjukkan komitmen, realisasi, dan sisa anggaran.
8. Koreksi dilakukan dengan prosedur dan jejak audit.

### 8.5 PDDIKTI

1. Data akademik divalidasi sebelum masuk antrean.
2. Adapter memetakan data ke format yang disyaratkan.
3. Job mengirim data melalui mekanisme resmi yang tersedia.
4. Respons dicatat dan status diperbarui.
5. Kegagalan dikelompokkan menjadi error data, otorisasi, jaringan, konflik, atau kebutuhan tindakan manual.
6. Petugas memperbaiki sumber data atau menjalankan tindakan yang diwajibkan.
7. Sistem melakukan retry hanya untuk kondisi yang aman dan sesuai.
8. Laporan rekonsiliasi menampilkan selisih serta item yang belum selesai.

---

## 9. Aturan Bisnis Kritis

1. Identitas utama mahasiswa harus unik menurut aturan institusi; perubahan identitas tidak membuat histori hilang.
2. NIM dibuat melalui aturan yang disahkan dan tidak boleh digunakan ulang tanpa kebijakan formal.
3. Perubahan prodi, kurikulum, status, nilai final, tarif, dan transaksi harus memiliki alasan serta audit trail.
4. KRS hanya dapat dilakukan pada periode yang dibuka dan memenuhi prasyarat yang berlaku.
5. Perhitungan IPS/IPK harus memiliki rumus resmi yang dapat diuji dengan test case.
6. Nilai final tidak boleh diubah langsung tanpa workflow koreksi yang disetujui.
7. Pembayaran tidak boleh dianggap berhasil hanya karena browser diarahkan ke halaman sukses; verifikasi harus menggunakan sumber transaksi yang dapat dipercaya.
8. Callback pembayaran harus idempotent agar satu transaksi tidak diposting dua kali.
9. Pembatalan/refund dan koreksi jurnal harus dapat ditelusuri dan tidak menghapus histori.
10. Jurnal yang telah diposting tidak dihapus atau diubah diam-diam; koreksi dilakukan melalui reversal dan transaksi pengganti.
11. Periode keuangan yang ditutup terkunci; pembukaan kembali membutuhkan otorisasi.
12. Setiap laporan keuangan harus memiliki definisi, periode, basis data, dan aturan agregasi yang jelas.
13. Pengurus yayasan hanya melihat detail sensitif sesuai mandat dan kebutuhan kerja.
14. Administrator TI tidak otomatis memiliki hak menyetujui transaksi keuangan atau mengubah nilai akademik.
15. Data yang dikirim ke PDDIKTI harus mengikuti format dan prosedur resmi; data internal dan eksternal direkonsiliasi.
16. Perubahan struktur organisasi harus mempertahankan histori transaksi dan afiliasi sebelumnya.
17. Semua waktu transaksi disimpan dengan konsistensi zona waktu; tampilan mengikuti zona waktu yang dikonfigurasi.
18. Data historis tidak dihapus hanya karena mahasiswa atau pegawai menjadi nonaktif.
19. Ekspor data sensitif harus dibatasi, dicatat, dan hanya tersedia bagi pengguna berwenang.
20. Kebijakan retensi dan pemusnahan data harus disetujui pemilik data serta sesuai hukum yang berlaku.
21. Registrasi semester dan pengajuan KRS hanya berjalan pada periode kalender yang dibuka untuk kampus itu.
22. Kewajiban registrasi sebelum pengisian KRS mengikuti kebijakan kampus. Jika kebijakan mewajibkan registrasi, KRS menunggu status registrasi yang memenuhi syarat. Jika kebijakan menyatakan registrasi tidak wajib, KRS tidak menunggu registrasi. Jika kebijakan belum diisi, pengajuan KRS berhenti dan sistem menampilkan bahwa kebijakan belum dikonfigurasi.
23. Syarat keuangan registrasi dapat dikonfigurasi, termasuk tidak ada syarat bayar dan pengecualian resmi. Status bayar tidak sama dengan pengakuan pendapatan.
24. Batas SKS mengikuti aturan yang berlaku bagi mahasiswa tersebut, misalnya IPS terakhir atau ketentuan program studi. Rumus resminya menunggu keputusan kampus.
25. Prasyarat mengikuti kurikulum yang mengikat mahasiswa, bukan kurikulum lain yang kebetulan aktif.
26. Pada satu KRS, mahasiswa tidak boleh memiliki dua item dengan kelas yang sama atau kode mata kuliah yang sama.
27. Bentrok jadwal pada KRS mahasiswa ditolak. Peringatan longgar pada layar penjadwalan petugas tidak berlaku untuk pilihan mahasiswa.
28. Kapasitas kelas diperiksa saat menambah dan saat mengajukan. Saat kuota mulai terpakai adalah keputusan kampus; sebelum keputusan itu ada, produk tidak boleh mengurangi kuota secara diam-diam di luar aturan yang dikonfigurasi.
29. Jika kebijakan mewajibkan persetujuan, KRS tidak boleh Final sebelum persetujuan tercatat.
30. Perubahan setelah Final mengikuti periode perubahan KRS dan menyimpan snapshot keputusan sebelumnya.
31. Perubahan status registrasi, status KRS, dan keputusan persetujuan menyimpan pelaku, waktu, status asal, status tujuan, dan alasan bila ada.
32. Perhitungan SKS pada KRS, jadwal kuliah mahasiswa, dan roster kelas harus memakai sumber SKS yang sama.
33. Perubahan kurikulum tidak mengubah histori KRS yang sudah tersimpan.
34. Aksi registrasi dan KRS dibatasi oleh role serta lingkup kampus, program studi, kelas, atau penugasan bimbingan.
35. Dosen hanya mengakses dan mengubah data pembelajaran pada kelas atau mahasiswa yang menjadi penugasannya; akses di luar penugasan ditolak.
36. Bobot komponen penilaian tidak bersifat global untuk seluruh mata kuliah; setiap kelas/MK mengikuti konfigurasi dan kebijakan institusi, dan total bobot aktif harus 100% sebelum finalisasi.
37. Nilai yang sudah final tidak diubah langsung; koreksi memakai workflow dengan nilai lama, nilai baru, alasan, aktor, dan waktu.
38. Publikasi nilai kepada mahasiswa terpisah dari finalisasi; mahasiswa tidak melihat nilai kelas sebelum publikasi (kecuali kebijakan kampus menyatakan lain dan dikonfigurasi).
39. Perubahan komponen atau bobot setelah nilai diterbitkan menyimpan snapshot sebelum/sesudah, alasan, waktu, dan aktor.
40. Presensi yang dikunci tidak diubah tanpa alasan; setiap koreksi tercatat dalam audit trail.
41. Materi, tugas, pengumuman, dan pengumpulan file pada prototype hanya menyimpan metadata; penyimpanan objek biner adalah kebutuhan produksi (object storage + kontrol akses).
42. Pengajuan jadwal pengganti dan pengajuan administrasi dosen tidak langsung mengubah jadwal resmi sebelum disetujui pihak berwenang.
43. Dokumen skripsi/TA dan sidang hanya dapat diakses pembimbing, penguji, atau pejabat yang ditugaskan; tidak dibuka ke seluruh dosen.
44. Keputusan status alur skripsi/sidang mengikuti konfigurasi kebijakan institusi dan kewenangan peran pada sidang tersebut.
45. Roster kelas untuk presensi dan nilai mengacu pada mahasiswa dengan KRS/enrollment resmi sesuai kebijakan; draft KRS saja tidak memasukkan mahasiswa ke penilaian akhir.

---

## 10. Kebutuhan Non-Fungsional

Target berikut perlu dikonfirmasi melalui load test, analisis biaya, dan persetujuan pemilik sistem.

### 10.1 Kinerja dan kapasitas

- Mendukung 5.000–20.000 mahasiswa terdaftar secara agregat.
- Mendukung lonjakan pada periode PMB, KRS, pembayaran, ujian, dan publikasi nilai.
- Target awal halaman operasional umum: p95 di bawah 2 detik untuk request yang tidak menjalankan laporan berat, pada beban dan lingkungan yang disepakati.
- Target awal API operasional: p95 di bawah 500 ms untuk endpoint sederhana pada beban uji yang disepakati, tidak termasuk sistem eksternal.
- Laporan berat harus berjalan melalui query yang dioptimalkan, job asinkron, read replica, atau data mart bila dibutuhkan.
- Kapasitas ditentukan dengan load test yang meniru pola pemakaian nyata; jumlah mahasiswa saja tidak cukup untuk sizing.

### 10.2 Ketersediaan dan pemulihan

- Target awal ketersediaan produksi: 99,5% per bulan, di luar maintenance terjadwal yang disepakati; dapat ditingkatkan sesuai anggaran.
- Target awal RPO: maksimal 15 menit untuk data transaksional kritis jika teknologi dan biaya memungkinkan.
- Target awal RTO: maksimal 4 jam untuk layanan inti; target final disepakati berdasarkan analisis dampak bisnis.
- Backup terenkripsi, retensi yang ditetapkan, salinan terpisah/immutable bila tersedia, dan uji restore berkala.
- Disaster recovery plan mencakup database, object storage, konfigurasi, secrets, deployment, dan integrasi.

### 10.3 Keamanan

- TLS untuk komunikasi jaringan dan enkripsi at-rest yang didukung platform.
- MFA bagi administrator, pengurus keuangan, dan akun berisiko tinggi.
- Least privilege, RBAC plus scope organisasi, pemisahan tugas, dan tinjauan akses berkala.
- Secret manager untuk kredensial; tidak ada secret di source code atau log.
- Validasi input, proteksi terhadap OWASP Top 10, rate limiting, CSRF/CORS sesuai pola aplikasi, dan secure headers.
- Pemindaian dependency, secret, container, dan source code dalam CI/CD.
- Audit log append-only atau mekanisme yang mencegah perubahan tidak terdeteksi untuk aktivitas penting.
- Penanganan insiden, pencabutan sesi/token, rotasi secret, dan prosedur pemberitahuan yang ditetapkan.
- Pengujian penetrasi sebelum go-live dan setelah perubahan signifikan.

### 10.4 Privasi dan tata kelola data

- Inventaris data pribadi dan tujuan pemrosesannya.
- Minimisasi data dan pembatasan penggunaan sekunder.
- Dasar akses, pemberitahuan, persetujuan jika diperlukan, dan prosedur permintaan subjek data.
- Retensi dan penghapusan/anonimisasi sesuai kewajiban dan kebutuhan arsip.
- Perjanjian dengan penyedia cloud dan vendor integrasi.
- Penilaian transfer data lintas wilayah bila relevan.
- Evaluasi kepatuhan terhadap UU Pelindungan Data Pribadi, aturan sistem elektronik, dan peraturan pendidikan yang berlaku dengan penasihat hukum.

### 10.5 Aksesibilitas dan usability

- Antarmuka Bahasa Indonesia dengan istilah konsisten.
- Responsif pada desktop, tablet, dan ponsel.
- Mendukung navigasi keyboard dan kontras yang memadai.
- Pesan validasi menjelaskan kesalahan dan tindakan berikutnya.
- Formulir panjang mendukung penyimpanan draft bila aman.
- Portal per persona menampilkan tugas, status, notifikasi, dan data yang relevan tanpa membuka semua modul.

### 10.6 Maintainability dan operasional

- Automated unit, integration, contract, migration, security, dan end-to-end tests.
- API dan event terdokumentasi.
- Database migration dapat diaudit dan diuji sebelum produksi.
- Observability mencakup metrics, logs, traces, alerting, dan correlation ID.
- Deployment dapat diulang, memiliki rollback plan, dan tidak bergantung pada satu laptop.
- Dokumentasi runbook, arsitektur, backup/restore, incident response, dan onboarding developer.
- Komponen open source ditinjau lisensi dan kerentanannya.

---

## 11. Rancangan Arsitektur Produk (Arah Awal)

### 11.1 Pola arsitektur

Gunakan **modular monolith** sebagai fondasi, dengan modul/domain terpisah dan kontrak yang jelas. Hindari microservices sebelum ada alasan operasional yang kuat.

Domain yang disarankan:
- `Organization`
- `IdentityAccess`
- `Admission`
- `Student`
- `Academic`
- `Teaching`
- `GraduationAlumni`
- `Billing`
- `Accounting`
- `BudgetProcurement`
- `HumanResources`
- `AssetsFacilities`
- `QualityAssurance`
- `Reporting`
- `IntegrationPDDIKTI`
- `IntegrationPayments`
- `Notifications`
- `Audit`

### 11.2 Stack teknologi awal

- Frontend: Next.js + TypeScript; desain responsif, dengan PWA jika sesuai.
- Backend: ASP.NET Core pada versi .NET LTS yang masih didukung ketika proyek dimulai.
- Arsitektur kode: Clean Architecture dan Vertical Slice secara pragmatis.
- Database: PostgreSQL managed service.
- Data access: EF Core untuk domain transaksional; Dapper untuk query yang memang memerlukan kontrol/performa.
- Cache: Redis untuk kebutuhan yang terukur.
- Background processing: worker/queue; pilih teknologi berdasarkan kebutuhan retry, urutan, dan operasional.
- File: object storage dengan signed URL, enkripsi, dan policy akses.
- Integrasi: adapter terpisah, idempotency, retry, dan dead-letter handling.
- Observability: OpenTelemetry, centralized logging, metrics, dan tracing.
- CI/CD: build, tests, scan, migration check, deploy staging, approval, deploy production.
- Infrastruktur: infrastructure as code bila kapasitas tim memungkinkan.

### 11.3 Strategi database

Mulai dengan managed PostgreSQL dan batas domain yang jelas. Gunakan foreign key, unique constraints, transaksi, dan indeks berdasarkan query nyata. Hindari mengandalkan validasi frontend saja.

Pertimbangkan:
- Satu database untuk sistem awal dengan pemisahan domain melalui schema atau ownership table yang jelas.
- Semua entitas operasional terhubung ke `campus_id` atau scope organisasi yang sesuai.
- Jangan menambahkan `tenant_id` multi-yayasan sebagai kompleksitas produk awal jika tidak dibutuhkan; tetapi struktur `foundation_id` dapat dipakai untuk identitas yayasan induk dan laporan.
- Terapkan Row-Level Security jika sesuai, namun jangan menganggap RLS sendirian menggantikan authorization di aplikasi.
- Uji akses lintas kampus/fakultas secara otomatis.
- Pisahkan analitik berat dari transaksi ketika kebutuhan performa membuktikannya.

### 11.4 Prinsip integrasi

- Setiap integrasi memiliki pemilik, kontrak, autentikasi, timeout, retry, monitoring, dan runbook.
- Gunakan idempotency key atau business key untuk mencegah duplikasi.
- Hindari transaksi database terdistribusi; gunakan outbox/inbox atau pola konsistensi yang sesuai.
- Jangan menyimpan data kartu pembayaran yang tidak perlu.
- Simpan payload log secukupnya dan redaksi data pribadi/credential.
- Semua perubahan kontrak eksternal diuji melalui contract tests.

---

## 12. Model Data Konseptual

Ini adalah daftar entitas konseptual awal, bukan ERD final.

### 12.1 Organisasi dan akses
- Foundation
- Institution/Campus
- CampusLocation
- Faculty
- Department
- StudyProgram
- OrganizationalUnit
- CostCenter
- AcademicPeriod
- FiscalPeriod
- User
- Role
- Permission
- UserRoleAssignment
- OrganizationalScope
- AuditEvent

### 12.2 PMB dan mahasiswa
- AdmissionCycle
- AdmissionPath
- Applicant
- ApplicantApplication
- ApplicantDocument
- SelectionStage
- SelectionResult
- Student
- StudentIdentity
- StudentStatusHistory
- StudentProgramEnrollment
- GuardianRelationship
- StudentDocument
- AlumniProfile

### 12.3 Akademik
- Curriculum
- CurriculumVersion
- Course
- CoursePrerequisite
- CurriculumCourse
- ClassOffering
- ClassSection
- Schedule
- Room
- LecturerAssignment
- Enrollment/KRS (header rencana studi)
- KrsItem
- KrsStatusEvent
- SemesterRegistration
- RegistrationPolicy
- AdvisorAssignment
- Attendance
- TeachingJournal
- AssessmentComponent
- Grade
- GradeChangeRequest
- Transcript
- Thesis/FinalProject
- SupervisorAssignment
- GraduationDecision
- GraduationEvent

### 12.4 Keuangan
- FeeScheme
- FeeComponent
- StudentInvoice
- InvoiceLine
- Payment
- PaymentAllocation
- PaymentGatewayEvent
- BankSettlement
- ReconciliationBatch
- Scholarship
- Discount/InstallmentPlan
- Refund
- ChartOfAccount
- JournalEntry
- JournalLine
- FiscalPeriod
- Budget
- BudgetLine
- BudgetCommitment
- Vendor
- PurchaseRequest
- PurchaseOrder
- VendorInvoice
- Disbursement
- BankAccount
- FixedAsset
- DepreciationSchedule
- PayrollRun
- PayrollItem
- CostAllocation

### 12.5 Integrasi dan operasional
- IntegrationConnection
- ExternalCodeMapping
- SyncJob
- SyncItem
- SyncError
- Notification
- NotificationDelivery
- FileMetadata
- ApprovalWorkflow
- ApprovalStep
- ApprovalDecision
- ReportDefinition
- DataExportJob

### 12.6 Aturan desain data
- Gunakan primary key internal yang stabil dan kode bisnis yang unik sesuai lingkupnya.
- Jangan memakai NIM atau kode eksternal sebagai primary key teknis.
- Simpan histori status dan perubahan penting sebagai record terpisah.
- Tentukan kepemilikan data per domain dan aturan transaksi lintas domain.
- Gunakan soft delete hanya jika benar-benar diperlukan; data finansial dan akademik yang telah menjadi catatan resmi umumnya harus dikoreksi melalui prosedur terkontrol, bukan dihapus.
- Data agregat dashboard harus memiliki definisi dan waktu pembaruan.

---

## 13. Dashboard dan Laporan yang Diperlukan

### 13.1 Dashboard yayasan
- Total mahasiswa aktif dan tren per kampus/prodi.
- Pendaftar, penerimaan, dan daftar ulang.
- Pendapatan, piutang, arus kas, biaya, anggaran, dan realisasi.
- Perbandingan kinerja kampus dan fakultas.
- Status PDDIKTI dan risiko data.
- Status akreditasi/tenggat, SDM, serta indikator operasional.
- Peringatan untuk tunggakan, deviasi anggaran, sinkronisasi gagal, dan deadline penting.

### 13.2 Dashboard pimpinan kampus
- PMB dan mahasiswa aktif per prodi.
- Retensi, kelulusan, masa studi, dan hasil akademik agregat.
- Jadwal, beban dosen, kelas penuh, dan kelas bermasalah.
- Pendapatan, piutang, realisasi anggaran, dan biaya kampus.
- Status laporan PDDIKTI dan temuan mutu.

### 13.3 Dashboard dekan/kaprodi
- Distribusi mahasiswa dan dosen.
- Pengisian KRS, presensi, nilai, dan status bimbingan.
- Kinerja mata kuliah dan kelulusan agregat.
- Beban mengajar dan penggunaan ruang.
- Kebutuhan akreditasi serta tindak lanjut.

### 13.4 Dashboard mahasiswa
- Status registrasi semester dan status KRS.
- Total SKS yang diambil, IPK, dan IPS terakhir.
- Batas akhir registrasi, pengisian KRS, dan perubahan KRS.
- Jadwal kuliah berikutnya.
- Tagihan aktif, jatuh tempo, pembayaran, cicilan, dan kuitansi.
- Notifikasi dosen wali dan pengumuman akademik.
- Tautan ke registrasi, isi KRS, KRS, KHS, dan tagihan.
- Status surat, tugas akhir, dan kelulusan bila sudah ada datanya.

### 13.5 Dashboard dosen
- Jumlah mata kuliah dan kelas yang diampu pada semester aktif.
- Jadwal mengajar hari ini.
- Total mahasiswa pada kelas yang diampu.
- Tugas belum dinilai; nilai belum final; nilai belum dipublikasikan.
- Presensi belum lengkap; jurnal belum diisi.
- Mahasiswa bimbingan / KRS menunggu (jika wali).
- Jadwal seminar/sidang (jika pembimbing atau penguji).
- Pengumuman dan notifikasi relevan.
- Setiap kartu membuka halaman detail portal dosen terkait (lihat LEC-030 dan `design.md` 9.0.1).
- Jangan menampilkan tugas atau kelas di luar penugasan.

### 13.6 Laporan keuangan minimal
- Neraca saldo.
- Buku besar dan jurnal.
- Neraca.
- Laporan aktivitas/laba-rugi sesuai kebijakan entitas.
- Arus kas.
- Piutang mahasiswa dan aging.
- Utang vendor dan aging.
- Penerimaan pembayaran dan rekonsiliasi.
- Realisasi anggaran dan deviasi.
- Pendapatan dan biaya per kampus/fakultas/prodi/pusat biaya.
- Register aset dan penyusutan.
- Payroll/honor dan alokasi biaya.
- Laporan konsolidasi yayasan.
- Log jurnal koreksi, reversal, dan periode yang dibuka kembali.

Semua laporan wajib memiliki periode, filter, definisi, sumber data, waktu pembaruan, dan kontrol akses yang jelas.

---

## 14. Migrasi Data

### 14.1 Sumber yang mungkin
- Spreadsheet mahasiswa, dosen, prodi, dan kurikulum.
- Database aplikasi lama.
- Riwayat tagihan dan pembayaran.
- Data nilai, KRS/KHS, dan status akademik.
- Data pegawai, aset, anggaran, dan jurnal.
- Dokumen PMB dan arsip digital.

### 14.2 Proses migrasi
1. Inventarisasi sumber, pemilik, format, volume, kualitas, dan hak akses.
2. Profiling: duplikasi, field kosong, format tanggal, kode yang tidak konsisten, dan referensi rusak.
3. Tetapkan mapping sumber-ke-target dan aturan transformasi.
4. Tentukan cut-off dan data yang harus dimigrasikan: master, histori, saldo awal, dokumen, atau semuanya.
5. Jalankan migrasi percobaan ke staging.
6. Validasi jumlah record, kontrol total keuangan, nilai, IPK, status mahasiswa, dan sampel dokumen.
7. Pemilik data menandatangani hasil rekonsiliasi.
8. Jalankan migrasi final dengan freeze window dan rencana rollback.
9. Pertahankan arsip sumber read-only sesuai retensi dan kebijakan yang disetujui.

### 14.3 Kriteria penerimaan migrasi
- Tidak ada selisih yang belum dijelaskan pada kontrol total kritis.
- Semua mahasiswa aktif dan program studi memiliki mapping yang benar.
- Saldo awal piutang, kas/bank, utang, aset, dan buku besar direkonsiliasi oleh keuangan.
- Sampel riwayat akademik diverifikasi oleh BAAK/prodi.
- Dokumen sensitif dapat diakses hanya oleh role yang berhak.
- Hasil migrasi dan pengecualian terdokumentasi.

---

## 15. Pengujian dan Quality Assurance

### 15.1 Jenis pengujian
- Unit tests untuk aturan bisnis.
- Integration tests untuk database dan modul.
- Contract tests untuk PDDIKTI, bank, payment gateway, dan LMS.
- End-to-end tests untuk alur PMB, KRS, nilai, pembayaran, jurnal, dan laporan.
- Security tests: authorization scope, IDOR, privilege escalation, injection, session, upload, dan ekspor.
- Performance/load/stress tests untuk puncak KRS, pembayaran, dan publikasi nilai.
- Data migration tests dan financial reconciliation.
- Accessibility dan usability testing.
- Backup restore dan disaster recovery exercises.
- Regression tests setiap rilis.

### 15.2 Skenario uji wajib
1. Dosen Kampus A tidak dapat melihat atau mengubah nilai kelas Kampus B tanpa penugasan sah.
2. Dekan Fakultas A tidak dapat mengakses detail sensitif Fakultas B.
3. Pengurus yayasan dapat melihat agregat semua kampus sesuai haknya.
4. Admin TI tidak dapat menyetujui jurnal atau pembayaran hanya karena hak administrasi teknis.
5. Callback pembayaran duplikat tidak menggandakan penerimaan atau jurnal.
6. Refund menghasilkan jejak koreksi yang benar.
7. Nilai final tidak dapat diubah tanpa approval.
8. Periode keuangan yang ditutup menolak posting baru kecuali prosedur pembukaan kembali dilakukan.
9. Job PDDIKTI yang gagal dapat ditindaklanjuti tanpa kehilangan data atau mengirim duplikasi.
10. Restore backup memulihkan data dan konfigurasi sesuai RPO/RTO yang disepakati.
11. Ekspor data pribadi tercatat dan dibatasi.
12. Perubahan struktur organisasi tidak merusak histori laporan lama.
13. Mahasiswa yang syarat registrasinya belum terpenuhi tidak dapat mengajukan KRS bila kebijakan mewajibkan registrasi, dan pesan menjelaskan syarat yang gagal.
14. Kelas bentrok, SKS berlebih, kelas penuh, dan duplikat tidak masuk draft KRS.
15. Dosen wali tidak dapat memutuskan KRS di luar penugasan bimbingannya.
16. Penolakan registrasi dan pengembalian KRS tanpa alasan ditolak sistem.
17. Perubahan kurikulum tidak mengubah snapshot KRS yang sudah tersimpan.
18. Saklar syarat keuangan yang dimatikan tidak menahan registrasi hanya karena ada tagihan.
19. Calon mahasiswa dapat mengirim Daftar Online publik tanpa login staf dan mendapat nomor pendaftaran.
20. Cek Status dengan nomor sah menampilkan status proses; nomor tidak dikenal menampilkan keadaan kosong tanpa data orang lain.
21. Pengajuan dari Daftar Online muncul di antrean PMB staf dengan sumber yang dapat dibedakan.
22. Dosen tidak dapat membuka atau mengubah nilai/presensi kelas yang bukan penugasannya.
23. Finalisasi nilai ditolak jika total bobot komponen aktif bukan 100%.
24. Setelah nilai final, ubah langsung ditolak; hanya pengajuan koreksi dengan alasan yang diterima.
25. Mahasiswa tidak melihat nilai kelas sebelum status Dipublikasikan.
26. Materi yang disimpan di prototype hanya metadata; tidak ada base64 file besar di localStorage.
27. Dosen wali tidak dapat menyetujui KRS mahasiswa di luar `advisorAssignments` aktif.
28. Penguji hanya melihat dokumen dan rubrik sidang yang ditugaskan kepadanya.
29. Dashboard dosen menghitung KPI hanya dari penugasan aktual; kartu membuka halaman detail terkait.

---

## 16. Rencana Implementasi dan Rollout

Estimasi awal: **12–18 bulan atau lebih**, tergantung ukuran tim, kompleksitas integrasi, kualitas data, dan jumlah proses yang disepakati. Ini adalah rentang perencanaan, bukan janji tanggal rilis.

### Fase 0 — Discovery dan tata kelola (4–6 minggu)
- Wawancara stakeholder yayasan dan tiap fungsi.
- Pemetaan proses AS-IS dan TO-BE.
- Inventaris kampus, fakultas, jurusan, prodi, kalender, dan aturan.
- Workshop akuntansi, billing, PDDIKTI, keamanan, dan migrasi.
- BRD final, product backlog, KPI, risiko, dan keputusan ruang lingkup.
- Keputusan cloud, SLA, RPO/RTO, serta anggaran.
**Exit criteria:** stakeholder menyetujui ruang lingkup, proses prioritas, definisi KPI, dan pemilik keputusan.

### Fase 1 — Fondasi platform (6–10 minggu)
- Struktur organisasi dan master data.
- IAM, role/scope, MFA untuk akun penting, dan audit trail.
- CI/CD, environment dev/staging/prod, observability, secrets, backup.
- Design system dan kerangka portal.
- Pola API, error handling, logging, dan test framework.
**Exit criteria:** struktur organisasi dapat dikonfigurasi; pengujian akses lintas unit lulus.

### Fase 2 — PMB dan master mahasiswa (8–12 minggu)
- Portal publik Daftar Online dan Cek Status.
- Jalur/gelombang, formulir, dokumen, seleksi, tagihan pendaftaran.
- Daftar ulang, NIM, profil mahasiswa, dan onboarding akun.
- Dashboard PMB dasar.
**Exit criteria:** skenario PMB lengkap berhasil di staging dengan audit trail.

### Fase 3 — Akademik inti (12–18 minggu)
- Kurikulum, mata kuliah, kalender, registrasi semester, jadwal, kelas, KRS/KHS, persetujuan dosen wali, presensi, dan nilai.
- Portal mahasiswa, dosen, dosen wali, dan BAAK.
- Uji perhitungan IPS/IPK, aturan kurikulum, dan koreksi nilai.
**Exit criteria:** satu siklus akademik pilot lulus UAT.

### Fase 4 — Billing, pembayaran, dan akuntansi inti (12–20 minggu, dapat paralel)
- Tarif, invoice, cicilan, beasiswa, pembayaran, piutang, rekonsiliasi.
- COA, jurnal, buku besar, anggaran, pusat biaya, laporan inti.
- Approval, reversal, tutup periode, dan konsolidasi.
**Exit criteria:** transaksi end-to-end direkonsiliasi dengan hasil yang disetujui akuntan/pemilik proses.

### Fase 5 — PDDIKTI dan integrasi eksternal (8–14 minggu; mulai discovery lebih awal)
- Verifikasi akses dan dokumentasi resmi.
- Mapping, validasi, antrean, retry, dashboard error, rekonsiliasi.
- Integrasi bank/payment gateway dan LMS sesuai prioritas.
**Exit criteria:** pengujian integrasi resmi yang diizinkan berhasil dan prosedur operasional disetujui.

### Fase 6 — HR, aset, mutu, dan fitur lanjutan (8–16 minggu)
- Modul P1/P2 sesuai prioritas yang disetujui.
- Payroll, aset, procurement, akreditasi, alumni, layanan, dan analitik.
**Exit criteria:** setiap modul memiliki UAT, kontrol akses, dan runbook.

### Fase 7 — Pilot, migrasi, dan rollout (6–12 minggu atau lebih)
- Pilih satu kampus yang representatif tetapi terkendali.
- Latihan migrasi dan cutover.
- Pelatihan per persona.
- Go-live terbatas, hypercare, dan pengukuran KPI.
- Rollout kampus berikutnya secara bertahap.
**Exit criteria:** tidak ada defect kritis terbuka, rekonsiliasi data selesai, pengguna terlatih, dan pemilik proses menandatangani go-live.

### 16.1 Strategi MVP
MVP yang direkomendasikan:
- Organisasi dan IAM.
- PMB dasar: portal Daftar Online, antrean staf, sampai daftar ulang.
- Master mahasiswa dan program studi.
- Akademik inti: kurikulum, registrasi semester, KRS/KHS, jadwal, presensi, dan nilai.
- Billing dan pembayaran dasar.
- Integrasi PDDIKTI untuk operasi prioritas yang terverifikasi.
- Audit trail, backup, monitoring, serta laporan dasar.

Namun, jika sistem keuangan lama masih menjadi system of record selama pilot, integrasi sementara harus memiliki batas jelas. Jangan mengoperasikan dua buku besar resmi yang sama-sama dianggap sumber kebenaran.

---

## 17. Tim dan Tata Kelola Proyek

### 17.1 Peran yang diperlukan
- Sponsor eksekutif dari yayasan.
- Product Owner yang memiliki wewenang prioritas.
- Steering committee: yayasan, pimpinan kampus, akademik, keuangan, HR, TI, dan kepatuhan.
- Project Manager.
- Business Analyst/Product Analyst.
- Solution Architect/Tech Lead.
- Backend dan frontend developers.
- QA engineers.
- DevOps/SRE.
- UI/UX designer.
- SME PMB, BAAK, prodi, keuangan/akuntansi, HR, PDDIKTI, dan keamanan/data privacy.
- Pemilik data/migrasi dari setiap kampus.

### 17.2 Tata kelola keputusan
- Keputusan lintas kampus ditetapkan oleh steering committee.
- Kebijakan akademik ditetapkan pemilik akademik yang berwenang.
- COA, pengakuan pendapatan, anggaran, konsolidasi, dan penutupan buku disahkan pemilik keuangan serta penasihat akuntansi.
- Kebijakan akses dan privasi disetujui pemilik data, keamanan, dan penasihat hukum bila diperlukan.
- Perubahan scope masuk change control dengan dampak biaya, jadwal, risiko, dan kualitas.
- Setiap modul memiliki product owner/SME, acceptance criteria, dan penandatangan UAT.

### 17.3 Ritme kerja
- Sprint planning dan review berkala.
- Demo fitur kepada pemilik proses.
- Risk/issue log yang diperbarui.
- Rekonsiliasi backlog dengan prioritas bisnis.
- Rilis staging terjadwal dan release notes.
- Steering review bulanan atau sesuai kebutuhan.

---

## 18. Estimasi Anggaran Perencanaan

Estimasi awal harus diperlakukan sebagai **order-of-magnitude**, bukan penawaran atau komitmen anggaran. Biaya sangat dipengaruhi oleh jumlah anggota tim, komponen yang digunakan ulang, cakupan payroll/ERP, integrasi, SLA, dan kualitas data.

### 18.1 Kisaran pengembangan indikatif

| Komponen | Kisaran indikatif |
|---|---:|
| Discovery, BA, arsitektur, dan desain proses | Rp100–250 juta |
| UX/UI dan design system | Rp100–200 juta |
| Platform foundation, IAM, dan audit | Rp200–400 juta |
| PMB, mahasiswa, dan akademik inti | Rp400–800 juta |
| Billing, pembayaran, akuntansi, dan anggaran | Rp350–800 juta |
| PDDIKTI dan integrasi eksternal | Rp150–350 juta |
| QA, security, load test, migrasi, dan UAT | Rp200–400 juta |
| Cadangan perubahan/risiko | Rp200–500 juta |
| **Total indikatif** | **Rp1,7–3,7 miliar** |

Kisaran dapat lebih tinggi untuk pengembangan penuh tanpa reuse, aplikasi mobile native, modul ERP mendalam, banyak integrasi, atau persyaratan ketersediaan tinggi. Perkiraan perlu dihitung ulang setelah discovery dan estimasi kapasitas tim.

### 18.2 Kisaran cloud bulanan

| Komponen | Kisaran indikatif/bulan |
|---|---:|
| Application runtime/container | Rp3–10 juta |
| Managed PostgreSQL dan backup | Rp3–10 juta |
| Object storage dan transfer | Rp0,5–3 juta |
| Monitoring, log, dan alerting | Rp1–4 juta |
| Network, WAF, dan keamanan | Rp1–5 juta |
| Cadangan kapasitas/DR | Rp1,5–6 juta |
| **Total indikatif** | **Rp10–38 juta/bulan** |

Belum termasuk seluruh biaya tenaga operasional, layanan bank/payment gateway, SMS/WhatsApp, lisensi pihak ketiga, pajak, dan layanan support. Validasi menggunakan kalkulator cloud resmi setelah region, arsitektur, beban, retensi log, dan target DR ditentukan.

---

## 19. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Scope terlalu luas | Jadwal/biaya membengkak | MVP, prioritas P0/P1/P2, dan change control |
| Perbedaan aturan antar-kampus | Kustomisasi sulit dipelihara | Konfigurasi berbasis kebijakan, bukan fork kode per kampus |
| Data lama buruk | Migrasi gagal atau laporan salah | Profiling, mapping, dry-run, rekonsiliasi, sign-off |
| Akses lintas unit salah | Kebocoran data dan pelanggaran privasi | RBAC + scope, RLS bila tepat, negative authorization tests |
| Salah perhitungan nilai/IPK | Dampak akademik dan reputasi | Rumus disahkan, golden test cases, review dan UAT |
| Pembayaran ganda/tidak cocok | Kerugian finansial | Idempotency, rekonsiliasi, callback terverifikasi, audit |
| Akuntansi tidak konsisten | Laporan tidak dapat dipercaya | Double-entry, control totals, period close, reversal, review akuntan |
| PDDIKTI gagal/berubah | Pelaporan tertunda | Adapter, contract tests, monitoring, runbook, pemilik tindak lanjut |
| Vendor lock-in cloud | Biaya migrasi tinggi | Infrastruktur terdokumentasi, backup portabel, IaC, exit plan |
| Kegagalan cloud | Layanan berhenti | Backup teruji, DR, monitoring, RPO/RTO, latihan pemulihan |
| Ketergantungan pada developer tertentu | Sistem sulit dipelihara | Dokumentasi, code review, CI/CD, knowledge sharing |
| Pengguna menolak sistem | Adopsi rendah | Libatkan pengguna, pilot, training, champion per kampus |
| Perubahan regulasi | Kebutuhan baru | Pemantauan regulasi, adapter, konfigurasi, dan release planning |
| Laporan yayasan berbeda dengan unit | Keputusan salah | Definisi KPI, sumber data tunggal, rekonsiliasi, dan audit trail |
| Penyalahgunaan akun istimewa | Perubahan tanpa wewenang | MFA, least privilege, segregasi tugas, alerting, dan review akses |

---

## 20. Kriteria Go-Live

Go-live hanya dapat dilakukan jika semua kriteria wajib berikut terpenuhi atau pengecualian disetujui secara tertulis oleh steering committee dengan mitigasi.

- [ ] Struktur yayasan/kampus/fakultas/jurusan/prodi telah diverifikasi.
- [ ] Role dan scope akses telah diuji dengan skenario positif dan negatif.
- [ ] Tidak ada defect kritis/tinggi terbuka tanpa persetujuan risiko formal.
- [ ] PMB dan proses akademik inti lulus UAT.
- [ ] Perhitungan KRS, SKS, nilai, IPS/IPK, dan transkrip diverifikasi.
- [ ] Billing, pembayaran, refund, rekonsiliasi, jurnal, dan laporan keuangan lulus rekonsiliasi.
- [ ] PDDIKTI diuji menggunakan akses dan prosedur resmi yang tersedia.
- [ ] Migrasi data ditandatangani pemilik data dan keuangan.
- [ ] Backup dan restore berhasil diuji.
- [ ] Monitoring, alerting, runbook, dan eskalasi insiden tersedia.
- [ ] Dokumen kebijakan privasi, retensi, dan akses disetujui.
- [ ] Pengguna kunci dan helpdesk dilatih.
- [ ] Rencana cutover, rollback, dan hypercare disetujui.
- [ ] Pemilik bisnis menerima risiko yang masih terbuka.

---

## 21. Daftar Keputusan yang Belum Ditentukan

Keputusan berikut harus diselesaikan dalam discovery; dokumen ini tidak mengasumsikannya.

| ID | Keputusan | Pemilik yang disarankan |
|---|---|---|
| DEC-001 | Nama yayasan dan daftar kampus/institusi | Sponsor yayasan |
| DEC-002 | Struktur resmi fakultas, jurusan/departemen, dan prodi per kampus | Akademik |
| DEC-003 | Jumlah mahasiswa, dosen, pegawai, pengguna serentak, dan pola puncak | TI + akademik |
| DEC-004 | Kebijakan akademik lintas kampus dan variasi lokal | Pimpinan akademik |
| DEC-005 | Kebijakan COA, pengakuan pendapatan, dana, aset, dan konsolidasi | Keuangan + akuntan |
| DEC-006 | Apakah payroll masuk MVP atau fase berikutnya | HR + keuangan |
| DEC-007 | Penyedia cloud, region, RPO/RTO, dan SLA | TI + sponsor |
| DEC-008 | Apakah aplikasi mobile native diperlukan | Product Owner |
| DEC-009 | Kanal bank/VA/payment gateway | Keuangan |
| DEC-010 | Akses resmi dan cakupan operasi PDDIKTI/Neo Feeder | Akademik + TI |
| DEC-011 | Sumber data lama dan strategi migrasi | Pemilik data |
| DEC-012 | Integrasi LMS, perpustakaan, HR, dan sistem lain | Product Owner |
| DEC-013 | Kebijakan wali/orang tua dan jenis data yang boleh dilihat | Legal/privacy + akademik |
| DEC-014 | Retensi dokumen, arsip, dan audit | Legal + pemilik data |
| DEC-015 | Anggaran, tim internal/vendor, dan target rilis | Sponsor + PM |
| DEC-016 | Target performa, ketersediaan, dan pemulihan final | TI + pemilik bisnis |
| DEC-017 | Apakah registrasi semester wajib sebelum KRS | Pimpinan akademik |
| DEC-018 | Apakah registrasi punya syarat keuangan, dan status tagihan apa yang memenuhi syarat | Akademik + keuangan |
| DEC-019 | Apakah petugas harus mengesahkan registrasi, atau pengajuan yang lolos langsung berstatus Teregistrasi | Pimpinan akademik |
| DEC-020 | Apakah registrasi yang ditolak atau dibatalkan boleh diajukan ulang pada periode yang sama | Pimpinan akademik |
| DEC-021 | Rumus batas SKS, termasuk mahasiswa yang belum punya IPS | Pimpinan akademik |
| DEC-022 | Aturan mengulang mata kuliah yang sudah ditempuh | Pimpinan akademik |
| DEC-023 | Saat kuota kelas mulai terpakai: draft, pengajuan, atau persetujuan | Pimpinan akademik |
| DEC-024 | Apakah persetujuan dosen wali wajib | Pimpinan akademik |
| DEC-025 | Kapan KRS menjadi Final: saat disetujui atau saat periode dikunci | Pimpinan akademik |
| DEC-026 | Apakah mahasiswa boleh membatalkan pengajuan KRS yang masih menunggu persetujuan | Pimpinan akademik |
| DEC-027 | Apakah cetak KRS diizinkan pada status Disetujui sebelum Final | Pimpinan akademik |
| DEC-028 | Apakah Daftar Online publik wajib akun/verifikasi kontak sebelum formulir, atau cukup nomor pendaftaran | PMB + akademik |
| DEC-029 | Apakah staf masih boleh menambah pendaftar manual selain jalur publik | PMB + akademik |
| DEC-030 | Batas waktu penguncian presensi setelah pertemuan (misal: 24 jam, 48 jam, akhir pekan, atau tidak dikunci) | Pimpinan akademik |
| DEC-031 | Apakah dosen boleh menghapus materi yang sudah dipublikasikan, atau hanya menonaktifkan/mengganti | Pimpinan akademik |
| DEC-032 | Alur persetujuan pengajuan jadwal pengganti: langsung ke BAAK, melalui kaprodi, atau keduanya | Pimpinan akademik |
| DEC-033 | Apakah rubrik penilaian sidang seragam untuk seluruh program studi atau dapat dikonfigurasi per prodi | Pimpinan akademik |
| DEC-034 | Siapa yang memiliki wewenang memutuskan keputusan akhir sidang: ketua sidang saja, mayoritas penguji, atau komposisi lain | Pimpinan akademik |
| DEC-035 | Status alur skripsi/TA yang dapat dikonfigurasi per kampus atau prodi | Pimpinan akademik |
| DEC-036 | Apakah koreksi nilai setelah finalisasi harus disetujui kaprodi/dekan atau cukup dosen pengampu | Pimpinan akademik |
| DEC-037 | Threshold mahasiswa berisiko untuk dashboard wali (IPK, kehadiran, SKS mengulang) | Pimpinan akademik |
| DEC-038 | Apakah publikasi nilai dilakukan dosen pengampu, BAAK, atau keduanya berurutan | Pimpinan akademik |
| DEC-039 | Batas ukuran dan tipe file materi/tugas yang diizinkan per kampus | TI + akademik |
| DEC-040 | Apakah menu Wali Akademik dan Bimbingan Akademik digabung atau dipisah di UI produksi | Product Owner + akademik |
| DEC-041 | Siapa memproses pengajuan administrasi dosen (BAAK, HR, atau kaprodi) per jenis surat | Pimpinan akademik + HR |
| DEC-042 | Apakah dosen tamu/pengampu bersama memiliki hak nilai penuh, terbatas, atau hanya lihat | Pimpinan akademik |

---

## 22. Glosarium

- **SIAKAD:** Sistem Informasi Akademik.
- **Campus ERP:** Platform terintegrasi untuk proses akademik dan operasional institusi.
- **PMB:** Penerimaan Mahasiswa Baru.
- **Daftar Online:** Portal publik agar calon mahasiswa mengajukan pendaftaran tanpa masuk ke back-office staf.
- **Nomor pendaftaran:** Identitas sementara calon mahasiswa pada proses PMB sebelum NIM diterbitkan.
- **BAAK/TU:** Bagian administrasi akademik/tata usaha; nama dan pembagian tugas mengikuti struktur institusi.
- **KRS:** Kartu Rencana Studi, rencana mata kuliah dan kelas pada satu semester.
- **KHS:** Kartu Hasil Studi, hasil nilai pada satu semester.
- **IPS:** Indeks Prestasi Semester, hasil satu semester yang sudah dipublikasikan. IPS terakhir adalah IPS semester terbaru yang sudah terbit.
- **IPK:** Indeks Prestasi Kumulatif.
- **SKS:** Satuan Kredit Semester.
- **Registrasi semester:** pengesahan keikutsertaan mahasiswa pada satu semester sebelum atau terpisah dari KRS, sesuai kebijakan kampus.
- **Dosen wali:** dosen yang ditugaskan membimbing seorang mahasiswa, termasuk persetujuan KRS bila kebijakan mewajibkannya.
- **Dispensasi:** pengecualian resmi yang disetujui, beralasan, dan dapat ditelusuri. Bukan status bayar.
- **PDDIKTI:** Pangkalan Data Pendidikan Tinggi.
- **Neo Feeder:** Aplikasi/mekanisme feeder resmi yang digunakan sesuai ketentuan integrasi PDDIKTI yang berlaku.
- **COA:** Chart of Accounts, daftar akun akuntansi.
- **GL:** General Ledger/buku besar.
- **AP/AR:** Accounts Payable/Accounts Receivable (utang/piutang).
- **RPO:** Recovery Point Objective, toleransi kehilangan data dalam pemulihan.
- **RTO:** Recovery Time Objective, target waktu pemulihan layanan.
- **RBAC:** Role-Based Access Control.
- **ABAC:** Attribute-Based Access Control.
- **UAT:** User Acceptance Testing.
- **MVP:** Minimum Viable Product.
- **DR:** Disaster Recovery.
- **PWA:** Progressive Web App.

---

## 23. Persetujuan Dokumen

Dokumen ini merupakan baseline awal untuk diskusi. Sebelum menjadi baseline resmi, lakukan review dan persetujuan oleh:

| Peran | Nama | Status | Tanggal |
|---|---|---|---|
| Sponsor yayasan | TBD | Menunggu review | TBD |
| Product Owner | TBD | Menunggu review | TBD |
| Perwakilan pimpinan kampus | TBD | Menunggu review | TBD |
| Pemilik proses akademik | TBD | Menunggu review | TBD |
| Pemilik proses keuangan | TBD | Menunggu review | TBD |
| HR/SDM | TBD | Menunggu review | TBD |
| TI/keamanan | TBD | Menunggu review | TBD |
| Legal/privacy | TBD | Menunggu review | TBD |

### Riwayat perubahan

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 2026-10-24 | Draft awal BRD/PRD untuk satu yayasan dengan multi-kampus, multi-fakultas, multi-jurusan/prodi, cloud, akademik dan keuangan terintegrasi |
| 1.1 | 2026-10-24 | Menambah requirement registrasi semester ACA-016–ACA-023, merinci ACA-005, menambah LEC-008, aturan bisnis 21–34, dan keputusan DEC-017–DEC-027 |
| 1.2 | 2026-10-24 | Menambah PMB-015 portal publik Daftar Online/Cek Status, merinci PMB-001–PMB-005, memperbarui alur 8.1, uji 19–21, dan DEC-028–DEC-029 |
| 1.3 | 2026-10-25 | Menambah LEC-009–LEC-030 portal dosen lengkap: mata kuliah, jadwal, materi/modul, tugas/kuis, komponen & bobot penilaian, presensi, jurnal, ujian, skripsi/TA pembimbing, sidang/penguji, dashboard; menambah DEC-030–DEC-036; acceptance criteria |
| 1.4 | 2026-10-25 | Audit Portal Dosen: memperjelas LEC-001–003 sebagai induk; menambah LEC-031–037 (wali monitoring, pengumuman, laporan, administrasi, konsultasi, integrasi, audit); alur 7.7.2; aturan bisnis 35–45; DEC-037–042; dashboard dosen 13.5; uji 22–29; selaras `design.md` v1.4 |

---

## Lampiran A — Rekomendasi Urutan Pembangunan

1. Finalisasi discovery dan proses bisnis.
2. Tetapkan organisasi, IAM, scope akses, audit, dan konfigurasi.
3. Bangun portal publik Daftar Online, PMB back-office, dan master mahasiswa.
4. Bangun kurikulum, KRS/KHS, jadwal, presensi, dan nilai.
5. Bangun billing, pembayaran, dan piutang.
6. Bangun COA, jurnal, anggaran, rekonsiliasi, dan laporan yayasan.
7. Integrasikan PDDIKTI dengan prosedur resmi.
8. Tambahkan HR/payroll, aset, pengadaan, mutu, alumni, dan analitik sesuai prioritas.
9. Migrasikan data, lakukan pilot, lalu rollout per kampus.
10. Ukur KPI, lakukan audit pasca-go-live, dan rencanakan iterasi berikutnya.

## Lampiran B — Prinsip yang Tidak Boleh Dilanggar

- Jangan memberikan akses hanya berdasarkan jabatan tanpa scope organisasi.
- Jangan menganggap data pembayaran sama dengan pengakuan pendapatan.
- Jangan menghapus transaksi keuangan atau nilai final tanpa proses koreksi yang dapat diaudit.
- Jangan mengirim data ke PDDIKTI tanpa validasi dan pemetaan yang disetujui.
- Jangan memigrasikan saldo keuangan tanpa rekonsiliasi dan sign-off.
- Jangan menjadikan admin TI sebagai pemilik otomatis seluruh hak bisnis.
- Jangan meluncurkan semua kampus sebelum pilot dan pemulihan backup teruji.
- Jangan menambahkan kompleksitas multi-yayasan pada tahap awal jika tidak ada kebutuhan bisnis yang disetujui.
- Jangan menulis ulang histori registrasi atau KRS ketika kurikulum, tagihan, atau kebijakan berubah.
- Jangan menganggap setiap kampus mewajibkan pembayaran sebelum registrasi atau KRS.

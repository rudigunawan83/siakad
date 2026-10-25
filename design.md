# SIAKAD Multi-Kampus --- Prototype Design Specification

**Dokumen:** `design.md`\
**Versi:** 1.4\
**Status:** Draft untuk implementasi prototype oleh AI\
**Pembaruan 1.1:** Registrasi semester, KRS, persetujuan dosen wali, dan penyelarasan status dengan `prd.md`\
**Pembaruan 1.2:** Portal publik PMB — Daftar Online dan Cek Status untuk calon mahasiswa\
**Pembaruan 1.3:** Penyempurnaan Portal Dosen — 17 menu lengkap, spesifikasi materi/modul, tugas/kuis, penilaian/bobot, presensi, jurnal, skripsi, sidang/penguji, dan route baru\
**Pembaruan 1.4:** Audit konsistensi Portal Dosen — hubungan dengan mahasiswa/prodi/fakultas/BAAK, pembedaan Bimbingan Akademik vs Wali Akademik, model data materi/tugas/nilai/presensi, dan batasan simulasi vs produksi\

**Bahasa UI:** Bahasa Indonesia\
**Target:** Satu yayasan yang mengelola banyak kampus, fakultas, dan
program studi\
**Tujuan:** Menjadi spesifikasi desain dan implementasi yang cukup rinci
agar AI coding agent dapat membangun prototype SIAKAD berbasis
HTML/CSS/JavaScript.

------------------------------------------------------------------------

## 1. Tujuan dan Batasan Prototype

Prototype ini adalah aplikasi web interaktif untuk memvalidasi struktur
menu, alur kerja, tata letak, pengalaman pengguna, dan gambaran
dashboard sebelum implementasi backend produksi.

Prototype harus terasa seperti aplikasi SIAKAD enterprise yang bisa
didemokan, bukan sekadar kumpulan halaman statis.

### 1.1 Tujuan utama

1.  Memvisualisasikan SIAKAD untuk satu yayasan dengan banyak kampus.
2.  Memiliki menu dan sub-menu yang konsisten dengan peran pengguna.
3.  Menyediakan dashboard yayasan, pimpinan kampus, staf, dosen,
    mahasiswa, dan orang tua/wali.
4.  Menyimulasikan alur PMB, akademik, keuangan, SDM, aset, pelaporan,
    dan PDDIKTI.
5.  Memungkinkan pengguna menguji navigasi, filter, pencarian, form,
    tabel, detail, modal, notifikasi, dan perubahan status.
6.  Menyediakan data demo yang realistis tetapi sepenuhnya fiktif.
7.  Menjadi acuan visual dan fungsional bagi implementasi backend pada
    tahap berikutnya.

### 1.2 Batasan

Prototype tidak boleh mengklaim sudah terhubung dengan sistem eksternal.
Semua data, transaksi, login, sinkronisasi, dan proses bisnis
menggunakan simulasi lokal.

-   Tidak ada backend atau database server.
-   Tidak ada pembayaran sungguhan.
-   Tidak ada pengiriman data sungguhan ke PDDIKTI.
-   Tidak ada pengiriman email/SMS/WhatsApp sungguhan.
-   Tidak menyimpan data sensitif sungguhan.
-   Login dan role switching hanya untuk demonstrasi.
-   Semua label yang mengindikasikan integrasi harus diberi penanda
    **Simulasi** atau **Demo**.

------------------------------------------------------------------------

## 2. Konteks Organisasi dan Struktur Data

Model organisasi harus merepresentasikan hierarki:

**Yayasan → Kampus/Perguruan Tinggi → Fakultas → Program Studi →
Angkatan/Semester → Mahasiswa/Kelas**

Catatan: satu yayasan dapat memiliki beberapa perguruan tinggi/kampus.
Setiap kampus dapat memiliki fakultas dan program studi masing-masing.
Beberapa data seperti pengguna, kebijakan, chart of accounts, dan
pelaporan dapat dikelola pada level yayasan; data akademik operasional
memiliki konteks kampus.

### 2.1 Data demo organisasi

Gunakan data fiktif yang konsisten di seluruh aplikasi:

-   Yayasan: Yayasan Cakrawala Pendidikan
-   Kampus 1: Universitas Cakrawala Jakarta
-   Kampus 2: Institut Teknologi Cakrawala
-   Kampus 3: Sekolah Tinggi Bisnis Cakrawala
-   Fakultas contoh: Fakultas Teknik, Fakultas Ekonomi dan Bisnis,
    Fakultas Ilmu Komputer
-   Program studi contoh: Informatika, Sistem Informasi, Manajemen,
    Akuntansi, Teknik Industri
-   Tahun akademik: 2026/2027
-   Semester aktif: Ganjil 2026/2027

Nama dan angka hanyalah data demo dan dapat diubah melalui file data
seed.

### 2.2 Aturan filter konteks organisasi

-   Pengguna level yayasan dapat melihat data seluruh kampus.
-   Rektor/pimpinan kampus hanya melihat kampus yang menjadi
    kewenangannya.
-   Dekan hanya melihat fakultas yang menjadi kewenangannya.
-   Ketua program studi hanya melihat program studi yang menjadi
    kewenangannya.
-   Staf TU melihat data sesuai lingkup kerja dan hak akses.
-   Dosen melihat kelas, mahasiswa, dan jadwal yang ditugaskan.
-   Mahasiswa melihat data miliknya sendiri.
-   Orang tua/wali hanya melihat data mahasiswa yang memberikan
    persetujuan akses dalam simulasi.

Prototype boleh menyimulasikan aturan tersebut dengan role dan scope
yang dipilih; ini bukan implementasi keamanan produksi.

------------------------------------------------------------------------

## 3. Teknologi Prototype

### 3.1 Stack yang direkomendasikan

Gunakan stack sederhana agar dapat dijalankan langsung di browser dan
mudah dibuat oleh AI coding agent.

  -------------------------------------------------------------------------
  Bagian                  Teknologi                 Penggunaan
  ----------------------- ------------------------- -----------------------
  Struktur halaman        HTML5                     Kerangka halaman, form,
                                                    tabel, dialog

  Styling                 CSS3                      Design system, layout,
                                                    responsivitas, tema

  Interaksi               JavaScript ES6+           Navigasi, filter,
                                                    validasi form, modal,
                                                    simulasi alur

  Komponen UI             Bootstrap 5.3             Grid, form, tabel,
                                                    dropdown, modal,
                                                    offcanvas

  Ikon                    Bootstrap Icons           Ikon menu dan aksi

  Grafik                  Chart.js                  Grafik penerimaan,
                                                    keuangan, mahasiswa,
                                                    tren

  Penyimpanan demo        localStorage              Menyimpan perubahan
                                                    data selama demo

  Data awal               JSON/JS modules           Data seed terstruktur
                                                    dan mudah diganti

  Server lokal            VS Code Live Server atau  Menjalankan file lokal
                          `python -m http.server`   saat demo
  -------------------------------------------------------------------------

Gunakan CDN untuk Bootstrap, Bootstrap Icons, dan Chart.js agar
prototype mudah dijalankan tanpa proses build. Jika lingkungan demo
tidak memiliki internet, simpan dependency secara lokal di folder
`vendor/`.

### 3.2 Batas teknologi

-   Jangan menggunakan framework backend.
-   Jangan memerlukan database server.
-   Jangan menggunakan API eksternal yang membutuhkan kredensial.
-   Jangan menyimpan password asli.
-   Jangan mengandalkan API atau library berbayar.
-   Hindari ketergantungan pada satu file JavaScript raksasa; pecah file
    berdasarkan fitur.
-   Gunakan JavaScript modular (`type="module"`) bila lingkungan
    mendukungnya.

### 3.3 Struktur folder yang disarankan

``` text
siakad-prototype/
├── index.html
├── README.md
├── design.md
├── assets/
│   ├── logo.svg
│   └── illustrations/
├── css/
│   ├── tokens.css
│   ├── layout.css
│   ├── components.css
│   └── pages.css
├── js/
│   ├── app.js
│   ├── router.js
│   ├── state.js
│   ├── permissions-demo.js
│   ├── storage.js
│   ├── utils.js
│   ├── data/
│   │   ├── seed.js
│   │   ├── organization.js
│   │   ├── students.js
│   │   ├── academic.js
│   │   ├── finance.js
│   │   └── hr.js
│   ├── components/
│   │   ├── sidebar.js
│   │   ├── topbar.js
│   │   ├── data-table.js
│   │   ├── modal.js
│   │   ├── toast.js
│   │   ├── filters.js
│   │   └── charts.js
│   └── pages/
│       ├── dashboard-foundation.js
│       ├── organization.js
│       ├── admissions.js
│       ├── students.js
│       ├── academic.js
│       ├── learning.js
│       ├── thesis.js
│       ├── finance.js
│       ├── budget.js
│       ├── hr-payroll.js
│       ├── assets-procurement.js
│       ├── pddikti.js
│       ├── reports.js
│       ├── users-settings.js
│       ├── lecturer-portal.js
│       ├── student-portal.js
│       └── parent-portal.js
└── vendor/                 # Opsional jika tidak memakai CDN
```

AI boleh menyesuaikan struktur jika ada alasan teknis, tetapi semua
tanggung jawab modul harus tetap terpisah.

------------------------------------------------------------------------

## 4. Prinsip Desain UI/UX

### 4.1 Arah visual

Gunakan gaya **Premium Enterprise --- White, Navy, dan Gold Accent**.

-   Latar utama: putih atau abu-abu sangat muda.
-   Sidebar: navy gelap.
-   Aksen utama: gold untuk highlight, tombol utama tertentu, dan status
    pilihan.
-   Teks utama: abu-abu gelap/navy.
-   Status sukses: hijau.
-   Peringatan: amber.
-   Error: merah.
-   Informasi: biru.
-   Hindari penggunaan gold untuk semua elemen; gold adalah aksen.
-   Jangan menggunakan efek glassmorphism atau gradien berlebihan.
-   Prioritaskan keterbacaan dan kepadatan data enterprise.

### 4.2 Design tokens

Buat variabel CSS terpusat. Nilai berikut merupakan titik awal dan boleh
disesuaikan secara konsisten.

``` css
:root {
  --color-navy-950: #101a2b;
  --color-navy-900: #16243a;
  --color-navy-800: #213550;
  --color-gold-600: #b88a2b;
  --color-gold-500: #d1a84b;
  --color-gold-100: #f7efd9;
  --color-bg: #f5f7fa;
  --color-surface: #ffffff;
  --color-text: #202938;
  --color-muted: #6b7280;
  --color-border: #e3e8ef;
  --color-success: #198754;
  --color-warning: #d97706;
  --color-danger: #dc3545;
  --color-info: #0d6efd;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --shadow-card: 0 4px 16px rgba(16, 26, 43, 0.06);
  --sidebar-width: 260px;
  --topbar-height: 72px;
}
```

### 4.3 Kerangka aplikasi

Layout desktop:

1.  Sidebar tetap di sisi kiri.
2.  Topbar di atas area konten.
3.  Area konten memiliki breadcrumb, judul halaman, deskripsi singkat,
    aksi utama, filter, lalu konten.
4.  Sidebar bisa diciutkan.
5.  Topbar menampilkan konteks yayasan/kampus, tahun akademik,
    pencarian, notifikasi, dan profil pengguna.
6.  Di layar kecil, sidebar berubah menjadi offcanvas.
7.  Tabel lebar harus dapat digulir horizontal tanpa merusak layout.

### 4.4 Komponen yang harus konsisten

-   KPI/stat cards
-   Breadcrumb
-   Search box
-   Filter bar
-   Data table
-   Pagination
-   Status badge
-   Primary/secondary/danger buttons
-   Dropdown action per baris
-   Modal tambah/edit
-   Drawer atau halaman detail
-   Toast notification
-   Empty state
-   Loading/skeleton state sederhana
-   Confirmation dialog
-   Tabs
-   Chart cards
-   Timeline aktivitas
-   File upload placeholder
-   Date range picker sederhana
-   Tag/chip filter

### 4.5 Responsivitas

-   Desktop ≥ 1200 px: sidebar dan konten penuh.
-   Tablet 768--1199 px: sidebar dapat diciutkan; grid KPI menjadi 2
    kolom.
-   Mobile \< 768 px: sidebar offcanvas; KPI 1--2 kolom; form menjadi
    satu kolom; tabel dapat digulir horizontal.
-   Pastikan tombol penting tetap terlihat dan tidak saling menimpa.

### 4.6 Aksesibilitas

-   Gunakan label yang terlihat untuk input.
-   Semua tombol memiliki teks atau `aria-label`.
-   Jangan mengandalkan warna saja untuk menunjukkan status.
-   Pastikan fokus keyboard terlihat.
-   Gunakan heading secara berurutan.
-   Kontras teks harus memadai.
-   Gunakan Bahasa Indonesia untuk seluruh label antarmuka.

------------------------------------------------------------------------

## 5. Navigasi Global

### 5.1 Topbar

Elemen wajib:

-   Logo dan nama aplikasi: **SIAKAD Cakrawala**
-   Breadcrumb sesuai halaman aktif
-   Pemilih lingkup organisasi: Semua Kampus / nama kampus
-   Pemilih tahun akademik
-   Pencarian global demo
-   Ikon notifikasi dengan badge jumlah
-   Bantuan / panduan demo
-   Avatar, nama role aktif, dan menu profil
-   Tombol keluar demo

Pemilih organisasi dan tahun akademik harus mengubah konteks filter
dashboard/tabel yang mendukung filter tersebut.

### 5.2 Sidebar utama

Urutan menu yang disarankan:

1.  Dashboard
2.  Organisasi
3.  PMB
4.  Mahasiswa
5.  Dosen & Akademik SDM
6.  Akademik
7.  Pembelajaran
8.  Skripsi & Tugas Akhir
9.  Keuangan
10. Anggaran
11. SDM & Payroll
12. Aset & Pengadaan
13. PDDIKTI
14. Laporan
15. Pengguna & Hak Akses
16. Pengaturan
17. Audit Log

Menu dengan sub-menu harus bisa expand/collapse. Menu aktif memiliki
indikator visual. Menu yang tidak tersedia untuk role aktif sebaiknya
disembunyikan; jika ditampilkan sebagai preview, beri label "Tidak
tersedia untuk role ini".

### 5.3 Navigasi portal

Untuk role mahasiswa, dosen, dan orang tua, gunakan portal dengan
navigasi yang lebih ringkas. Portal tetap memakai design system yang
sama, tetapi tidak perlu menampilkan menu back-office yang tidak
relevan. Menu mahasiswa yang kanonis ada di bagian 8.1. Persetujuan
KRS dosen wali ada di bagian 9.1, di dalam Bimbingan Akademik, bukan
sebagai menu kedua.

------------------------------------------------------------------------

## 6. Role Demo dan Hak Akses

Sediakan role switcher untuk demonstrasi. Jangan memperlakukan role
switcher sebagai keamanan nyata.

  -----------------------------------------------------------------------
  Role demo               Lingkup data            Fokus utama
  ----------------------- ----------------------- -----------------------
  Pengurus Yayasan        Semua kampus            Dashboard konsolidasi,
                                                  keuangan, laporan,
                                                  perbandingan kampus

  Admin Yayasan           Semua kampus            Organisasi, pengguna,
                                                  konfigurasi, data
                                                  lintas kampus

  Rektor/Pimpinan Kampus  Satu kampus             Dashboard kampus,
                                                  akademik, keuangan
                                                  kampus, persetujuan

  Dekan                   Fakultas tertentu       Program studi,
                                                  mahasiswa, dosen,
                                                  kinerja fakultas

  Ketua Program Studi     Program studi tertentu  Kurikulum, kelas,
                                                  dosen, hasil studi

  Staf PMB                Kampus yang ditugaskan  Pendaftar, seleksi,
                                                  daftar ulang

  Staf TU Akademik        Lingkup akademik yang   Data mahasiswa,
                          ditugaskan              registrasi, KRS, nilai,
                                                  surat

  Staf Keuangan           Kampus atau yayasan     Tagihan, pembayaran
                          sesuai role             demo, piutang, jurnal,
                                                  laporan

  HR                      Lingkup yayasan/kampus  Data pegawai, kontrak,
                                                  payroll demo

  Dosen                   Kelas yang ditugaskan   Jadwal, presensi,
                                                  nilai, bimbingan

  Mahasiswa               Data diri sendiri       KRS, jadwal, nilai,
                                                  tagihan, surat

  Orang Tua/Wali          Mahasiswa yang          Ringkasan akademik dan
                          dihubungkan             tagihan sesuai
                                                  persetujuan
  -----------------------------------------------------------------------

Dosen wali bukan role login terpisah. Ia adalah penugasan pada role
Dosen. Hak menyetujui KRS hanya berlaku untuk mahasiswa yang tercantum
pada penugasan bimbingan aktif. Staf TU Akademik mengelola antrean
registrasi dan KRS pada lingkup yang ditugaskan. Mahasiswa hanya
melihat data dirinya. Orang tua tidak menyetujui KRS.

Setiap halaman harus menyebutkan lingkup data aktif jika relevan,
misalnya "Universitas Cakrawala Jakarta · Fakultas Teknik".

------------------------------------------------------------------------

## 7. Spesifikasi Menu dan Halaman

Setiap halaman minimal memiliki: judul, deskripsi, breadcrumb, konteks
organisasi, konten utama, state kosong, serta feedback untuk aksi
pengguna.

## 7.1 Dashboard

### A. Dashboard Yayasan

**Tujuan:** memberi gambaran kondisi seluruh kampus untuk pengurus
yayasan.

KPI cards: - Total mahasiswa aktif - Mahasiswa baru tahun berjalan -
Total dosen dan tenaga kependidikan - Total penerimaan pembayaran
periode berjalan - Total piutang mahasiswa - Rasio penagihan - Total
biaya operasional - Jumlah program studi aktif

Grafik: - Tren mahasiswa aktif per semester - Tren penerimaan PMB per
kampus - Pendapatan vs biaya per bulan - Komposisi mahasiswa per
kampus - Status pembayaran tagihan - Perbandingan performa kampus

Tabel: - Ringkasan performa kampus - Program studi dengan pertumbuhan
mahasiswa tertinggi - Tagihan jatuh tempo - Persetujuan yang menunggu
tindakan - Aktivitas terbaru lintas kampus

Filter: - Tahun akademik - Kampus / semua kampus - Fakultas - Program
studi - Periode keuangan

Interaksi: - Klik KPI membuka halaman terkait dengan filter yang
sesuai. - Klik kampus membuka ringkasan kampus. - Filter memperbarui
data demo dan grafik. - Tombol "Unduh Laporan" menghasilkan simulasi
unduhan CSV atau notifikasi demo.

### B. Dashboard Rektor/Pimpinan Kampus

KPI: - Mahasiswa aktif - Pendaftar PMB - Dosen aktif - Program studi
aktif - Persentase registrasi semester - Tagihan tertagih - Persetujuan
tertunda

Grafik: - Mahasiswa per fakultas - Tren PMB - Kelulusan/retensi
mahasiswa - Penerimaan vs target

Tabel: - Kinerja fakultas - Jadwal akademik terdekat - Persetujuan
menunggu - Masalah data akademik

### C. Dashboard Dekan/Ketua Program Studi

-   Mahasiswa aktif menurut angkatan
-   Dosen dan beban mengajar
-   Kelas berjalan
-   Distribusi IPK
-   Mahasiswa berisiko akademik (data simulasi)
-   Kelas yang belum lengkap nilainya
-   Jadwal dan agenda penting

### D. Dashboard Mahasiswa

**Informasi utama:**
- Status registrasi semester berjalan, dengan nama kanonis bagian 7.7: Belum Registrasi, Draft, Menunggu Pembayaran, Menunggu Validasi, Teregistrasi, Ditolak, atau Dibatalkan.
- Status KRS, dengan nama kanonis bagian 7.7: Belum Dibuat, Draft, Menunggu Persetujuan Dosen Wali, Disetujui, Perlu Revisi, atau Final.
- Total SKS semester ini, dihitung dari item KRS yang sama dengan halaman KRS.
- IPK dan IPS terakhir. IPS terakhir adalah IPS semester terakhir yang sudah dipublikasikan.
- Tagihan aktif dan jatuh tempo terdekat.
- Jadwal kuliah berikutnya dari KRS berstatus Disetujui atau Final. Jika belum ada, tampilkan keadaan kosong.
- Batas akhir registrasi semester.
- Batas akhir pengisian KRS dan batas akhir perubahan KRS, sebagai dua tanggal jika keduanya dikonfigurasi.
- Notifikasi dosen wali, termasuk catatan revisi KRS.
- Pengumuman akademik terbaru.
- Status skripsi atau tugas akhir jika ada.

Badge memakai teks status. Warna token hanya penguat. Indikator SKS memakai kalimat utuh, misalnya "18 dari 24 SKS", pada elemen `role="status"`. Jangan mengumumkan ulang indikator itu pada setiap perubahan filter.

**Tombol aksi cepat:**

| Tombol | Route | Aktif bila | Jika tidak aktif |
| --- | --- | --- | --- |
| Registrasi Semester | `#/portal/student/registration` | Periode registrasi terbuka dan status mengizinkan pengajuan atau perbaikan | Tetap terlihat, `disabled`, plus alasan |
| Isi KRS | `#/portal/student/krs/edit` | Periode pengisian atau perubahan KRS terbuka, syarat registrasi sesuai kebijakan terpenuhi, dan status KRS mengizinkan suntingan | Tetap terlihat, `disabled`, plus alasan |
| Lihat KRS | `#/portal/student/krs` | Selalu membuka KRS Saya | Jika belum ada KRS, halaman tujuan menampilkan keadaan kosong |
| Lihat KHS | `#/portal/student/khs` | Membuka KHS terakhir yang tersedia | Jika belum ada, halaman menjelaskan bahwa nilai belum dipublikasikan |
| Lihat Tagihan | `#/portal/student/finance/invoices` | Membuka tagihan mahasiswa yang sedang login | Jika tidak ada tagihan, tampilkan keadaan kosong |

Pada status Menunggu Pembayaran, tombol registrasi berubah menjadi Buka Tagihan dan mengarah ke `#/portal/student/finance/invoices`.

### E. Dashboard Dosen

Spesifikasi lengkap ada di bagian 9.0.1. Ringkasan:

**KPI cards:**
-   Jumlah mata kuliah dan kelas yang diampu
-   Total mahasiswa yang diampu
-   Jadwal mengajar hari ini
-   Tugas yang belum dinilai
-   Nilai yang belum difinalisasi
-   Nilai yang belum dipublikasikan
-   Presensi yang belum lengkap
-   Jurnal yang belum diisi

**Panel bimbingan (tampil jika ada penugasan):**
-   Mahasiswa bimbingan aktif
-   KRS menunggu persetujuan (dosen wali)
-   Mahasiswa bimbingan TA (pembimbing)
-   Jadwal seminar/sidang (penguji/pembimbing)

**Lainnya:**
-   Pengumuman akademik terbaru
-   Notifikasi tugas administrasi

Setiap kartu membuka halaman detail. Jangan menampilkan data di luar
penugasan dosen.

### F. Dashboard Orang Tua/Wali

-   Identitas mahasiswa yang dihubungkan
-   Status registrasi
-   Ringkasan IPS/IPK
-   Kehadiran ringkas jika diizinkan
-   Ringkasan tagihan dan pembayaran
-   Pengumuman
-   Penjelasan bahwa data hanya contoh dan akses sebenarnya membutuhkan
    persetujuan mahasiswa

------------------------------------------------------------------------

## 7.2 Organisasi

Sub-menu: - Profil Yayasan - Daftar Kampus - Fakultas - Program Studi -
Tahun Akademik - Semester - Kalender Akademik - Struktur Organisasi

### Daftar Kampus

Kolom: - Kode kampus - Nama kampus - Jenis institusi - Kota - Jumlah
fakultas - Jumlah program studi - Status - Aksi

Aksi: - Tambah kampus - Edit kampus - Lihat detail -
Aktifkan/nonaktifkan (simulasi)

### Fakultas dan Program Studi

Kolom program studi: - Kode - Nama program studi - Kampus - Fakultas -
Jenjang - Ketua program studi - Akreditasi (data demo) - Jumlah
mahasiswa - Status

Form program studi: - Kode program studi - Nama - Kampus - Fakultas -
Jenjang - Gelar - Ketua program studi - Status - Data akreditasi demo

Validasi: - Kode dan nama wajib. - Kampus wajib dipilih. - Fakultas
harus terkait dengan kampus terpilih.

------------------------------------------------------------------------

## 7.3 PMB --- Penerimaan Mahasiswa Baru

Sub-menu back-office: - Dashboard PMB - Daftar Online (Publik) - Periode
Pendaftaran - Jalur Penerimaan - Daftar Pendaftar - Verifikasi Dokumen -
Seleksi - Hasil Seleksi - Daftar Ulang - Konversi Menjadi Mahasiswa -
Laporan PMB

Entri **Daftar Online (Publik)** membuka portal calon mahasiswa di
bagian 7.3.1 (`#/pmb/daftar`). Itu bukan halaman staf kedua; data yang
dihasilkan masuk ke antrean Daftar Pendaftar yang sama.

### Dashboard PMB

KPI: - Total pendaftar - Formulir belum lengkap - Menunggu verifikasi -
Lulus seleksi - Sudah daftar ulang - Rasio konversi pendaftar ke
mahasiswa

Grafik: - Pendaftar per kampus/program studi - Pendaftar per jalur -
Funnel pendaftaran

### Daftar Pendaftar

Kolom: - Nomor pendaftaran - Nama - Kampus pilihan - Program studi
pilihan - Jalur - Tanggal daftar - Status dokumen - Status seleksi -
Status pembayaran pendaftaran - Sumber (daftar-online / petugas) - Aksi

Status: - Draft - Dikirim - Menunggu verifikasi - Perlu perbaikan -
Terverifikasi - Menunggu seleksi - Lulus - Tidak lulus - Daftar ulang -
Menjadi mahasiswa

Tombol **Halaman Daftar Online** mengarah ke `#/pmb/daftar` agar staf
dapat membuka permukaan publik dari modul PMB.

Alur demo:
1. Calon mahasiswa mendaftar sendiri di portal publik, atau staf menambah
   pendaftar dari back-office.
2. Petugas memeriksa kelengkapan data dan dokumen placeholder.
3. Mengubah status verifikasi.
4. Menginput hasil seleksi.
5. Mengubah status menjadi lulus/tidak lulus.
6. Jika lulus, menjalankan aksi daftar ulang.
7. Aksi buat mahasiswa menambahkan data ke daftar mahasiswa demo.

Dokumen upload hanya simulasi; jangan benar-benar mengunggah data
pribadi ke layanan eksternal. Pembayaran biaya daftar pada prototype
juga simulasi.

### 7.3.1 Portal Publik PMB — Daftar Online

Halaman untuk calon mahasiswa tanpa login staf. Shell aplikasi
menyembunyikan sidebar dan topbar back-office (`public-shell`). Navigasi
ringkas milik portal: Beranda, Daftar Online, Cek Status, dan tautan
kembali ke aplikasi demo.

**Route**
- `#/pmb` — beranda informasi PMB
- `#/pmb/daftar` — formulir Daftar Online
- `#/pmb/status` — cek status dengan nomor pendaftaran
- `#/pmb/status?no=PMB-2026-xxxx` — cek status dengan nomor terisi

**Beranda (`#/pmb`)**
- Nama yayasan dan periode PMB demo (2026/2027)
- CTA Mulai Daftar dan Cek Status
- Daftar kampus yang dibuka (kode, nama, kota, akreditasi)
- Alur singkat: isi data → konfirmasi berkas → nomor pendaftaran →
  verifikasi petugas
- Label jelas bahwa ini prototype dan tidak ada transaksi nyata

**Formulir Daftar Online (`#/pmb/daftar`)**

Stepper empat tahap. Tombol Lanjut dan Kirim punya perilaku nyata.
Ringkasan kesalahan (`role="alert"`, dapat difokuskan) tampil jika
validasi gagal; tautan mengarah ke field terkait.

1. **Data diri** — nama lengkap, email, nomor HP, tanggal lahir, jenis
   kelamin.
2. **Pilihan program** — kampus, program studi (difilter menurut kampus),
   jalur masuk (Reguler, Prestasi, Beasiswa).
3. **Berkas (simulasi)** — centang KTP, ijazah/SKL, pas foto; sertifikat
   prestasi wajib jika jalur Prestasi. Tidak ada unggah file sungguhan.
   Info biaya daftar demo (simulasi, status awal belum bayar).
4. **Konfirmasi** — ringkasan data, pernyataan data benar, Kirim
   Pendaftaran.

Setelah berhasil:
- Sistem membuat nomor pendaftaran unik (pola `PMB-2026-xxxx`).
- Record masuk koleksi `admissions` dengan status **Dikirim**,
  `docStatus` menunggu verifikasi, `paymentStatus` belum bayar,
  `source: daftar-online`.
- Halaman sukses menampilkan nomor, ringkasan, tautan Cek Status, dan
  opsi daftar lagi.
- Notifikasi demo untuk role Staf PMB / Admin bahwa ada pendaftar baru.
- Audit log mencatat peristiwa Daftar Online.

**Cek Status (`#/pmb/status`)**
- Input nomor pendaftaran.
- Jika ditemukan: nama, kampus, prodi, jalur, tanggal, status dokumen,
  status seleksi, pembayaran, dan status pendaftaran.
- Jika tidak ditemukan: keadaan kosong dengan pesan jelas.
- Tidak menampilkan data pendaftar lain.

**Akses dan batasan prototype**
- Tidak memerlukan role switcher atau akun mahasiswa.
- Tidak mengklaim verifikasi email/SMS nyata, payment gateway, atau
  penyimpanan berkas produksi.
- Data hanya di localStorage browser yang sama.

------------------------------------------------------------------------

## 7.4 Mahasiswa

Sub-menu: - Data Mahasiswa - Registrasi Semester - Status Akademik -
Cuti dan Aktif Kembali - Mutasi/Transfer - Beasiswa dan Keringanan -
Surat Akademik - Yudisium - Wisuda - Alumni

Entri Registrasi Semester pada modul ini membuka antrean yang sama
dengan bagian 7.7. Portal mahasiswa memakai bagian 8.2. Jangan membuat
alur registrasi kedua.

### Daftar Mahasiswa

Kolom: - NIM - Nama - Kampus - Fakultas - Program studi - Angkatan -
Status akademik - Semester aktif - IPK - Status pembayaran ringkas -
Aksi

Fitur: - Pencarian NIM/nama - Filter kampus, fakultas, program studi,
angkatan, status - Pagination - Sortir kolom - Tambah/edit mahasiswa -
Lihat detail - Ubah status (dengan konfirmasi) - Ekspor CSV demo

### Detail Mahasiswa

Tab: 1. Profil 2. Riwayat Akademik 3. KRS dan KHS 4. Tagihan dan
Pembayaran 5. Beasiswa 6. Dokumen/Surat 7. Aktivitas

Tab KRS dan KHS menampilkan status, total SKS, dan riwayat yang sama
dengan portal. Staf dapat membuka detail. Staf tidak mengubah KRS final
dari tab ini; perubahan mengikuti periode perubahan KRS.

Form profil: - NIM - Nama lengkap - Email - Nomor telepon demo -
Kampus - Fakultas - Program studi - Angkatan - Status akademik - Dosen
wali - Kontak darurat demo

Status mahasiswa: - Calon mahasiswa - Aktif - Cuti - Nonaktif -
Mengundurkan diri - Drop out - Lulus - Alumni

Perubahan status harus meminta konfirmasi dan menampilkan toast.

------------------------------------------------------------------------

## 7.5 Dosen & Akademik SDM

Sub-menu: - Data Dosen - Data Tenaga Kependidikan - Penugasan Mengajar -
Beban Kerja Dosen - Riwayat Pendidikan - Sertifikasi - Evaluasi Kinerja

Kolom dosen: - NIDN/NIDK demo - Nama - Kampus - Fakultas - Program studi
homebase - Jabatan akademik - Status kepegawaian - Jumlah kelas - Status
aktif - Aksi

Detail dosen: - Profil - Penugasan mengajar - Beban kerja - Riwayat
pendidikan - Dokumen placeholder - Evaluasi demo

Jangan menggunakan nomor identitas nyata. Semua NIDN/NIDK di prototype
harus fiktif atau jelas diberi label demo.

------------------------------------------------------------------------

## 7.6 Akademik

Sub-menu: - Kurikulum - Mata Kuliah - Prasyarat Mata Kuliah - Struktur
Kurikulum - Kelas Kuliah - Penjadwalan - Kalender Akademik - Dosen
Wali - Evaluasi Akademik

### Kurikulum

Kolom: - Kode kurikulum - Nama kurikulum - Program studi - Tahun
berlaku - Total SKS - Status

### Mata Kuliah

Kolom: - Kode mata kuliah - Nama - Program studi - SKS - Semester
rekomendasi - Jenis (wajib/pilihan) - Status

Form mata kuliah: - Kode - Nama - SKS teori - SKS praktik - Program
studi - Semester rekomendasi - Mata kuliah prasyarat - Jenis mata kuliah

### Kelas Kuliah dan Jadwal

Kolom: - Kode kelas - Mata kuliah - Program studi - Semester - Dosen -
Hari - Jam - Ruang - Kapasitas - Jumlah peserta - Status

Validasi simulasi: - Jam mulai harus sebelum jam selesai. - Ruang dan
dosen sebaiknya tidak memiliki jadwal bentrok. - Pada penyusunan jadwal
oleh petugas, bentrok ditampilkan sebagai peringatan; petugas dapat
membatalkan atau, khusus data demo penjadwalan, tetap menyimpan. Pilihan
mahasiswa pada KRS tidak memakai kelonggaran ini: bentrok tetap ditolak
(bagian 8.4).

### Kalender Akademik

Kalender milik kampus dan tahun akademik aktif. Jenis periode minimum:
registrasi semester, pengisian KRS, perubahan KRS, perkuliahan, ujian, dan
input nilai. Tiap periode punya tanggal mulai, tanggal selesai, dan status
dibuka atau ditutup.

Halaman menampilkan periode mana yang sedang berjalan. Portal mahasiswa
hanya membaca periode ini; mahasiswa tidak mengubah kalender.

### Dosen Wali

Halaman penugasan untuk Staf TU Akademik dan Ketua Program Studi pada
lingkupnya.

Kolom: NIDN demo, nama dosen, program studi, angkatan, NIM, nama
mahasiswa, periode berlaku, status penugasan.

Aksi: tetapkan dosen wali, akhiri penugasan dengan tanggal berlaku, lihat
jumlah bimbingan. Satu mahasiswa punya satu dosen wali aktif pada satu
periode. Mengganti dosen wali tidak menghapus riwayat keputusan KRS yang
sudah tercatat. Dosen hanya melihat mahasiswa pada penugasan aktifnya.

------------------------------------------------------------------------

## 7.7 Pembelajaran

Sub-menu: - Registrasi Semester - Persetujuan KRS - Jadwal Mahasiswa -
Presensi - Tugas dan Ujian - Input Nilai - Finalisasi Nilai - KHS -
Transkrip - Evaluasi Dosen

### Registrasi Semester (modul BAAK/akademik)

Halaman ini untuk Staf TU Akademik dan pimpinan pada lingkupnya. Isinya
antrean pengajuan, bukan formulir mahasiswa. Formulir mahasiswa ada di
bagian 8.2 dan memakai mesin status ini.

Kolom: NIM, nama, program studi, angkatan, status akademik, status
kewajiban keuangan, status registrasi, waktu pengajuan, waktu perubahan
status terakhir, petugas, aksi.

Filter: program studi, angkatan, semester, status registrasi, status
keuangan.

**Nama status kanonis**

- **Belum Registrasi** — belum ada pengajuan pada semester berjalan.
- **Draft** — mahasiswa menyimpan awal pengajuan, belum mengirim.
- **Menunggu Pembayaran** — hanya jika kebijakan kampus menempatkan
  kewajiban keuangan sebagai syarat, dan syarat itu belum terpenuhi serta
  tidak ada dispensasi.
- **Menunggu Validasi** — diajukan, menunggu petugas.
- **Teregistrasi** — syarat yang dikonfigurasi terpenuhi.
- **Ditolak** — petugas menolak. Alasan wajib dan terlihat oleh mahasiswa.
- **Dibatalkan** — hanya jika kebijakan mengizinkan. Alasan dan pemberi
  persetujuan wajib.

**Transisi**

| Dari | Ke | Kondisi |
| --- | --- | --- |
| Belum Registrasi | Draft | Periode terbuka dan mahasiswa menekan Simpan Draft |
| Belum Registrasi | Menunggu Pembayaran | Ajukan; syarat akademik lolos; aturan keuangan aktif; kewajiban belum terpenuhi; tidak ada dispensasi |
| Belum Registrasi | Menunggu Validasi | Ajukan; syarat akademik lolos; keuangan tidak menghalangi; validasi petugas diwajibkan |
| Belum Registrasi | Teregistrasi | Ajukan; seluruh syarat aktif lolos; validasi petugas tidak diwajibkan |
| Draft | Menunggu Pembayaran | Sama seperti ajuan dengan aturan keuangan yang belum terpenuhi |
| Draft | Menunggu Validasi | Ajukan; keuangan tidak menghalangi; petugas diwajibkan |
| Draft | Teregistrasi | Ajukan; keuangan tidak menghalangi; petugas tidak diwajibkan |
| Menunggu Pembayaran | Menunggu Validasi | Kewajiban terpenuhi atau dispensasi tercatat, dan petugas diwajibkan |
| Menunggu Pembayaran | Teregistrasi | Kewajiban terpenuhi atau dispensasi tercatat, dan petugas tidak diwajibkan |
| Menunggu Validasi | Teregistrasi | Petugas mengonfirmasi; syarat wajib masih terpenuhi atau ada dispensasi |
| Menunggu Validasi | Ditolak | Petugas mengisi alasan |
| Ditolak | Draft | Kebijakan demo mengizinkan ajuan ulang dan periode masih terbuka. Alasan lama tetap di riwayat |
| Teregistrasi | Dibatalkan | Kebijakan mengizinkan, ada alasan, dan KRS berjalan masih Belum Dibuat atau Draft. Jika KRS sudah diajukan, prototype menolak pembatalan dan menjelaskan bahwa dampaknya belum ditetapkan |
| Dibatalkan | Draft | Hanya jika flag demo ajuan ulang setelah batal dinyalakan. Bawaan prototype: mati |

Periode tertutup menghentikan pengajuan mahasiswa. Data syarat yang belum
tersedia berstatus Belum dapat diperiksa dan tidak boleh dilewati menjadi
Teregistrasi. Pembayaran demo tidak menandai lunas jika catatan tagihan
belum ada.

**Kebijakan demo yang terlihat di halaman**

Simpan pada `registrationPolicy` di localStorage. Saklar mengubah perilaku
sungguhan, bukan teks statis. Nilai bawaan prototype:

- registrasi wajib sebelum KRS: nyala
- aturan keuangan: tidak diwajibkan (`none`)
- validasi petugas: nyala
- ajuan ulang setelah tolak: nyala
- batal registrasi oleh petugas: nyala
- ajuan ulang setelah batal: mati

Nilai keuangan lain yang dapat dicoba: `paid` atau `dispensation`. Ini
konfigurasi demo agar kampus tidak diasumsikan seragam. Bukan kebijakan
resmi yayasan.

Aksi petugas: Konfirmasi, Tolak dengan alasan, catat rujukan dispensasi,
lihat riwayat. Konfirmasi ditolak sistem jika syarat wajib belum terpenuhi
dan tidak ada dispensasi. Setiap aksi menulis audit: pelaku, waktu, status
asal, status tujuan, alasan.

Dispensasi tidak dibuat sebagai modul kedua. Petugas memilih keputusan
dispensasi demo yang sudah ada pada keuangan atau mencatat pengecualian
akademik dengan alasan. Mahasiswa melihat akibatnya pada daftar syarat.

### KRS (modul BAAK/akademik — Persetujuan)

Antrean untuk Staf TU Akademik. Keputusan dosen wali ada di bagian 9.1.
Pengisian mahasiswa ada di bagian 8.3. Ketiganya membaca record KRS yang
sama.

Kolom: NIM, nama, program studi, semester, total SKS, batas SKS, status
KRS, dosen wali, aksi.

**Nama status kanonis**

- **Belum Dibuat** — belum ada item.
- **Draft** — dapat diubah mahasiswa selama periode mengizinkan.
- **Menunggu Persetujuan Dosen Wali** — terkunci bagi mahasiswa, kecuali
  batal pengajuan diizinkan kebijakan.
- **Disetujui** — disetujui dosen wali, atau langsung disetujui sistem jika
  kebijakan tidak mewajibkan dosen wali. Isi belum boleh diubah.
- **Perlu Revisi** — dikembalikan. Mahasiswa boleh mengubah item. Catatan
  dosen tetap tampil sampai diajukan ulang.
- **Final** — terkunci. Snapshot tidak ikut berubah bila kurikulum diubah.

**Transisi**

| Dari | Ke | Kondisi |
| --- | --- | --- |
| Belum Dibuat | Draft | Mahasiswa menambah mata kuliah yang lolos validasi bagian 8.4 |
| Draft | Menunggu Persetujuan Dosen Wali | Ajukan; seluruh validasi lolos; persetujuan dosen wali diwajibkan; dosen wali sudah ada |
| Draft | Disetujui | Ajukan; validasi lolos; kebijakan demo mematikan wajib setuju dosen wali |
| Menunggu Persetujuan Dosen Wali | Disetujui | Dosen wali menyetujui dan tidak ada pelanggaran keras |
| Menunggu Persetujuan Dosen Wali | Perlu Revisi | Dosen wali mengisi catatan |
| Menunggu Persetujuan Dosen Wali | Draft | Mahasiswa membatalkan pengajuan dan flag demo mengizinkan. Item tetap ada |
| Perlu Revisi | Menunggu Persetujuan Dosen Wali | Ajukan ulang setelah validasi lolos. Catatan revisi tetap di riwayat |
| Disetujui | Final | Kebijakan `finalizeOn` = tutup periode, lewat aksi demo "Kunci KRS periode ini"; atau `finalizeOn` = saat disetujui, lalu status Disetujui dilewati dan halaman menjelaskan hal itu |
| Final | Draft | Periode perubahan KRS sedang terbuka. Snapshot Final sebelumnya disimpan. Pengajuan ulang mengikuti aturan persetujuan yang sama |

Bawaan prototype: persetujuan dosen wali wajib, kuota dikurangi saat
status menjadi Menunggu Persetujuan Dosen Wali, kuota kembali jika
pengajuan dibatalkan atau item dihapus pada revisi, dan Final terjadi
saat aksi kunci periode. Rumus ini contoh yang dapat diuji, bukan
kebijakan resmi.

Perlu Revisi tidak dipaksa kembali ke Draft. Catatan dosen harus tetap
terlihat selama mahasiswa memperbaiki.

Aksi petugas BAAK: lihat detail, kunci periode menjadi Final, buka
perubahan hanya di dalam periode perubahan. Petugas tidak menyetujui atas
nama dosen wali.

### Presensi

Tampilan dosen: - Pilih kelas dan tanggal. - Daftar mahasiswa. - Status
hadir, izin, sakit, alfa. - Tombol simpan presensi. - Ringkasan
persentase kehadiran.

### Input Nilai

-   Pilih kelas.
-   Tampilkan daftar mahasiswa.
-   Kolom komponen nilai: tugas, kuis, UTS, UAS.
-   Nilai akhir dihitung dengan bobot demo yang dapat dikonfigurasi.
-   Nilai huruf dan bobot mutu ditampilkan sebagai simulasi.
-   Tombol "Simpan Draft" dan "Finalisasi Nilai".
-   Finalisasi membutuhkan konfirmasi.

### KHS dan Transkrip

-   Filter semester.
-   Tabel mata kuliah, SKS, nilai angka/huruf, mutu.
-   Ringkasan IPS, IPK, total SKS.
-   Tombol cetak/unduh demo menghasilkan tampilan print-friendly atau
    CSV.

------------------------------------------------------------------------

## 7.8 Skripsi & Tugas Akhir

Sub-menu: - Pengajuan Topik - Penetapan Pembimbing - Proposal -
Bimbingan - Seminar - Sidang - Revisi - Yudisium

Daftar tugas akhir: - NIM - Nama mahasiswa - Program studi - Judul -
Pembimbing - Tahap - Tanggal pembaruan - Status

Tahapan demo: 1. Pengajuan topik 2. Review program studi 3. Penetapan
pembimbing 4. Proposal 5. Bimbingan 6. Seminar 7. Sidang 8. Revisi 9.
Selesai

Detail menampilkan timeline, catatan bimbingan demo, status revisi, dan
agenda. Tidak perlu mengunggah dokumen sungguhan.

------------------------------------------------------------------------

## 7.9 Keuangan

Sub-menu: - Dashboard Keuangan - Komponen Biaya - Tagihan Mahasiswa -
Pembayaran - Piutang - Cicilan - Beasiswa dan Potongan - Penerimaan
Lain - Kas dan Bank - Jurnal Umum - Buku Besar - Bagan Akun (COA) -
Rekonsiliasi - Laporan Keuangan - Konsolidasi Yayasan

### Dashboard Keuangan

KPI: - Tagihan diterbitkan - Pembayaran diterima - Piutang berjalan -
Tagihan jatuh tempo - Persentase penagihan - Penerimaan bulan ini -
Biaya operasional demo - Saldo kas/bank demo

Grafik: - Tagihan vs pembayaran per bulan - Piutang berdasarkan umur -
Pendapatan per kampus - Komposisi pendapatan - Anggaran vs realisasi

### Tagihan Mahasiswa

Kolom: - Nomor tagihan - NIM - Nama mahasiswa - Kampus - Jenis biaya -
Periode - Tanggal jatuh tempo - Nilai tagihan - Dibayar - Sisa -
Status - Aksi

Status: - Draft - Terbit - Dibayar sebagian - Lunas - Jatuh tempo -
Dibatalkan

Detail tagihan: - Rincian komponen - Riwayat pembayaran demo - Sisa
tagihan - Rencana cicilan - Catatan

### Pembayaran

Kolom: - Nomor transaksi demo - Tanggal - NIM/nama - Nomor tagihan -
Metode demo - Nilai - Status - Petugas demo

Metode: - Transfer bank (simulasi) - Virtual account (simulasi) - Tunai
(simulasi) - QRIS (simulasi)

Tombol "Catat Pembayaran Demo" hanya mengubah data lokal dan harus
selalu menampilkan label bahwa transaksi tidak sungguhan. Jangan membuat
integrasi pembayaran nyata.

### Piutang dan Cicilan

-   Filter berdasarkan kampus, umur piutang, program studi, dan status.
-   Tampilkan aging bucket demo: belum jatuh tempo, 1--30 hari, 31--60
    hari, 61--90 hari, \>90 hari.
-   Rencana cicilan memiliki jumlah cicilan, tanggal jatuh tempo, dan
    status.
-   Tombol pengingat hanya membuat notifikasi demo di UI.

### Akuntansi

Prototype visual untuk: - Chart of Accounts - Jurnal umum - Buku besar -
Neraca saldo - Laporan aktivitas/laba-rugi - Neraca - Arus kas -
Anggaran vs realisasi - Laporan konsolidasi yayasan

Untuk data demo, gunakan angka konsisten dan beri label "Simulasi".
Jangan mengklaim laporan telah memenuhi standar akuntansi atau
perpajakan.

### Konsolidasi

-   Pilih periode.
-   Tampilkan per kampus dan total yayasan.
-   Tabel pendapatan, biaya, surplus/defisit, piutang.
-   Tombol "Lihat Detail Kampus".
-   Tombol "Ekspor Demo".

------------------------------------------------------------------------

## 7.10 Anggaran

Sub-menu: - Perencanaan Anggaran - Anggaran per Kampus - Anggaran per
Unit - Pengajuan Anggaran - Persetujuan - Realisasi - Analisis Varians

Kolom: - Tahun anggaran - Kampus/unit - Kategori - Anggaran disetujui -
Realisasi - Sisa - Persentase penggunaan - Status

Alur demo: 1. Unit mengajukan anggaran. 2. Pengurus/pimpinan meninjau.
3. Status berubah menjadi Disetujui atau Perlu Revisi. 4. Realisasi
ditambahkan sebagai data simulasi. 5. Grafik varians diperbarui.

------------------------------------------------------------------------

## 7.11 SDM & Payroll

Sub-menu: - Data Pegawai - Struktur Jabatan - Kontrak dan Status Kerja -
Kehadiran Pegawai - Cuti - Komponen Gaji - Proses Payroll Demo - Slip
Gaji Demo - Laporan SDM

Kolom pegawai: - ID pegawai demo - Nama - Unit/kampus - Jabatan - Status
kerja - Tanggal bergabung - Status aktif

Payroll demo: - Periode - Pegawai - Gaji pokok demo - Tunjangan demo -
Potongan demo - Estimasi take-home pay - Status
draft/diperiksa/disetujui

Penting: - Semua angka payroll adalah data fiktif. - Tidak mengirim
payroll ke bank. - Slip gaji hanya preview. - Jangan memasukkan data
pribadi nyata.

------------------------------------------------------------------------

## 7.12 Aset & Pengadaan

Sub-menu: - Master Aset - Lokasi Aset - Kategori Aset - Pengajuan
Pengadaan - Persetujuan Pengadaan - Pesanan Demo - Penerimaan Barang -
Pemeliharaan - Inventarisasi - Laporan Aset

Kolom aset: - Kode aset - Nama - Kategori - Kampus/lokasi - Tanggal
perolehan demo - Nilai perolehan demo - Kondisi - Status

Alur pengadaan: 1. Unit membuat pengajuan. 2. Pimpinan menyetujui atau
menolak. 3. Status pesanan berubah. 4. Barang diterima pada modul
inventaris. 5. Aset baru muncul di daftar aset.

------------------------------------------------------------------------

## 7.13 PDDIKTI

Sub-menu: - Dashboard Validasi - Validasi Mahasiswa - Validasi Dosen -
Validasi Kurikulum - Validasi Kelas dan KRS - Validasi Nilai - Antrean
Sinkronisasi Demo - Riwayat Sinkronisasi Demo

Tampilan: - Jumlah data valid - Jumlah data perlu perbaikan - Jumlah
antrean - Status terakhir - Tabel entitas, kode, temuan validasi,
status, aksi

Status demo: - Belum divalidasi - Valid - Perlu perbaikan - Siap
disinkronkan - Simulasi berhasil - Simulasi gagal

Alur: 1. Klik "Validasi Data Demo". 2. Aplikasi menjalankan pemeriksaan
aturan lokal sederhana. 3. Hasil tampil dalam tabel. 4. Klik
"Simulasikan Sinkronisasi". 5. Tampilkan hasil simulasi dengan waktu dan
status. 6. Simpan riwayat di localStorage.

**Larangan:** jangan membuat klaim bahwa aplikasi tersambung dengan
PDDIKTI atau mengirim data ke layanan resmi. Integrasi sungguhan
membutuhkan analisis API, otorisasi, aturan, dan pengujian terpisah.

------------------------------------------------------------------------

## 7.14 Laporan

Sub-menu: - Laporan Akademik - Laporan PMB - Laporan Mahasiswa - Laporan
Dosen - Laporan Keuangan - Laporan Piutang - Laporan Anggaran - Laporan
SDM - Laporan Aset - Laporan Yayasan - Builder Laporan Demo

Setiap halaman laporan: - Filter periode dan lingkup organisasi. -
Preview tabel. - Ringkasan angka. - Tombol cetak. - Tombol ekspor CSV
demo. - Informasi filter yang diterapkan.

Jangan membuat tombol ekspor yang tidak melakukan apa pun. Jika belum
tersedia, tampilkan toast "Fitur ekspor belum tersedia pada demo ini".

------------------------------------------------------------------------

## 7.15 Pengguna & Hak Akses

Sub-menu: - Pengguna - Role - Hak Akses Menu - Lingkup Organisasi -
Undangan Demo - Sesi Demo

Fitur: - Daftar pengguna fiktif - Aktif/nonaktif demo - Penetapan role
demo - Penetapan kampus/fakultas/program studi - Preview menu
berdasarkan role

Jangan menyimpan password. Login demo dapat menggunakan pilihan role
tanpa kredensial atau satu tombol "Masuk sebagai demo".

------------------------------------------------------------------------

## 7.16 Pengaturan

Sub-menu: - Profil Yayasan - Identitas dan Branding - Tahun Akademik
Default - Semester Default - Batas SKS Demo - Bobot Penilaian Demo -
Komponen Biaya Demo - Format Nomor Dokumen - Notifikasi Demo -
Preferensi Tampilan - Reset Data Demo

Reset data harus meminta konfirmasi kedua dan menjelaskan bahwa seluruh
perubahan lokal akan dikembalikan ke data awal.

------------------------------------------------------------------------

## 7.17 Audit Log

Kolom: - Waktu - Pengguna demo - Role - Modul - Aktivitas - Objek -
Hasil

Catat perubahan demo seperti tambah/edit data, perubahan status,
persetujuan, simulasi sinkronisasi, dan reset data. Audit log hanya
simulasi sisi browser dan bukan bukti audit yang aman.

------------------------------------------------------------------------

## 8. Portal Mahasiswa

### 8.1 Navigasi Portal Mahasiswa

Gunakan navigasi tab atau sidebar ringkas (bukan sidebar back-office penuh).
Struktur menu:

1.  **Dashboard** — beranda mahasiswa
2.  **Profil Saya** — data diri, identitas, kontak
3.  **Registrasi Akademik**
    -   Registrasi Semester
    -   Riwayat Registrasi
4.  **Kartu Rencana Studi (KRS)**
    -   Isi KRS
    -   KRS Saya
    -   Cetak KRS
5.  **Hasil Studi**
    -   Kartu Hasil Studi (KHS)
    -   Transkrip Nilai
6.  **Perkuliahan**
    -   Jadwal Kuliah
    -   Kalender Akademik
7.  **Dosen Wali**
8.  **Keuangan**
    -   Tagihan
    -   Riwayat Pembayaran
9.  **Beasiswa**
10. **Surat Akademik**
11. **Pengumuman**
12. **Notifikasi**
13. **Pengaturan Akun**

Hindari menu duplikat. Menu yang belum diimplementasikan menampilkan state kosong dengan
penjelasan, bukan halaman error. Halaman utama harus mobile-first, mudah dibaca,
dan menampilkan tindakan yang paling relevan. Mahasiswa hanya boleh melihat record
yang dikaitkan dengan identitas mahasiswa aktif pada demo. Nama menu di atas
selaras dengan bagian 7 dan requirement `prd.md`. Route ada di bagian 13.

---

### 8.2 Halaman Registrasi Semester

Mahasiswa memeriksa syarat dan mengajukan registrasi semester berjalan.
Mesin status dan transisi hanya yang ada di bagian 7.7. Halaman ini tidak
menambah status baru.

**Tata letak**
- Identitas: nama, NIM, program studi, angkatan.
- Konteks: tahun akademik, semester aktif, tanggal buka dan tutup registrasi.
- Status akademik mahasiswa.
- Badge status registrasi berjalan, dengan teks dan warna token.
- Status kewajiban keuangan: Tidak diwajibkan, Terpenuhi, Belum terpenuhi, Dispensasi tercatat, atau Belum dapat diperiksa.
- Daftar syarat: nama syarat, status Terpenuhi / Belum terpenuhi / Tidak berlaku / Belum dapat diperiksa, alasan singkat, dan tautan ke halaman yang menyelesaikan syarat itu.
- Panel "Yang masih perlu dilakukan" hanya untuk syarat yang belum selesai.
- Ringkasan kebijakan demo yang sedang aktif, dalam bahasa yang dapat dibaca mahasiswa.
- Tombol Simpan Draft dan Registrasi Semester.
- Riwayat semester lain.

**Riwayat**

Kolom: tahun akademik, semester, waktu pengajuan, waktu perubahan status, status, alasan atau catatan. Riwayat kosong menampilkan "Belum ada registrasi pada semester sebelumnya."

**Perilaku tombol**

| Kondisi | Tombol utama | Perilaku prototype |
| --- | --- | --- |
| Syarat aktif terpenuhi dan periode terbuka | Registrasi Semester | Dialog konfirmasi, lalu transisi sesuai bagian 7.7, toast, dan baris riwayat |
| Ada syarat yang belum terpenuhi | Registrasi Semester | `disabled`, alasan ada di panel syarat. Pengajuan tidak tersimpan sebagai terkirim |
| Menunggu Pembayaran | Buka Tagihan | Pindah ke `#/portal/student/finance/invoices` |
| Menunggu Validasi | Menunggu validasi petugas | `disabled` |
| Teregistrasi | Sudah teregistrasi | `disabled` |
| Ditolak dan ajuan ulang diizinkan | Perbaiki dan ajukan ulang | Kembali ke Draft; alasan penolakan tetap tampil |
| Periode tertutup | Registrasi ditutup | `disabled`, tampilkan tanggal periode |

Simpan Draft menulis status Draft dan waktu simpan tanpa mengirim ke petugas. Jika data syarat belum ada, halaman menampilkan Belum dapat diperiksa dan tidak menganggap syarat lolos.

---

### 8.3 Halaman Isi KRS

**Ringkasan mahasiswa, tetap terlihat saat menggulir di desktop:**
- Nama dan NIM
- Program studi
- Semester aktif
- Dosen wali, atau teks "Dosen wali belum ditetapkan"
- IPK dan IPS terakhir
- Batas maksimum SKS
- Total SKS dipilih dibanding batas. Hijau di bawah 80 persen batas, amber mulai 80 persen, merah jika melewati batas. Teks status selalu ada, bukan warna saja
- Status registrasi
- Status pengajuan KRS

**Daftar mata kuliah**

Kolom: kode, nama, SKS, semester rekomendasi kurikulum, kelas, dosen, hari dan jam, ruangan, kapasitas, sisa kursi, prasyarat, aksi.

Prasyarat ditampilkan dengan ikon Bootstrap Icons plus teks: Terpenuhi, Belum terpenuhi, Tidak ada prasyarat, atau Belum dapat diperiksa. Jangan memakai emoji.

Indikator kursi: Tersedia, Hampir penuh (sisa paling banyak 3 atau 10 persen, ambang tampilan demo), Penuh. Saat penuh, Tambah tidak aktif.

**Fitur**
- Cari kode atau nama.
- Filter semester rekomendasi, program studi, dan kelas. Bawaan program adalah program mahasiswa. Program lain hanya muncul jika kebijakan demo mengizinkan kelas lintas program.
- Filter yang sudah ada tetap ada: jenis wajib atau pilihan, status prasyarat, dan sisa kursi.
- Tambah ke draft hanya jika validasi bagian 8.4 lolos.
- Hapus item dari draft selama status Draft atau Perlu Revisi.
- Lihat detail membuka panel: SKS teori, SKS praktik, prasyarat beserta pemenuhannya, daftar kelas, dan jadwal. Tutup panel tidak mengubah draft.
- Jadwal mingguan menampilkan grid hari dan jam dari item draft. Bentrok diwarnai dan diberi label teks.
- Simpan Draft menyimpan item saat ini. Item yang kemudian menjadi tidak valid tetap terlihat bersama alasannya.
- Ajukan KRS membuka konfirmasi jumlah mata kuliah dan total SKS.
- Batalkan Pengajuan terlihat dan `disabled` dengan alasan jika kebijakan tidak mengizinkan. Jika diizinkan dan status masih Menunggu Persetujuan Dosen Wali, status kembali ke Draft, item tetap, dan kuota kembali.
- Catatan dosen wali tampil pada Perlu Revisi dan di riwayat setelahnya.
- Cetak KRS mengikuti bagian 8.7.

**Umpan balik**

Gagal menambah atau mengajukan menampilkan ringkasan di atas area aksi (`role="alert"`, dapat difokuskan). Tiap butir menaut ke mata kuliah atau aturan terkait. Pesan pada baris tetap ada. Jangan hanya toast. Setelah sukses, toast dan badge status berubah dari data yang sama.

Batas SKS demo dihitung dari IPS terakhir agar tombolnya dapat diuji: IPS 3,00 atau lebih = 24; 2,50–2,99 = 21; 2,00–2,49 = 18; di bawah 2,00 = 15; belum ada IPS = 20. Angka ini data demo, bukan rumus resmi kampus.

---

### 8.4 Validasi KRS

Sebelum mata kuliah ditambahkan dan sebelum KRS diajukan, periksa:

1. Mahasiswa berstatus akademik yang diizinkan kebijakan. Pada demo, hanya Aktif.
2. Registrasi semester memenuhi kebijakan yang sedang aktif. Jika registrasi tidak diwajibkan, langkah ini Tidak berlaku, bukan otomatis lolos tanpa penjelasan.
3. Periode pengisian atau, untuk KRS Final, periode perubahan sedang terbuka.
4. Mata kuliah ada pada kurikulum mahasiswa, bukan hanya kurikulum aktif terbaru.
5. Prasyarat kurikulum mahasiswa terpenuhi. Jika data prasyarat belum ada, statusnya Belum dapat diperiksa dan penambahan ditolak.
6. Total SKS tidak melebihi batas yang berlaku untuk mahasiswa itu.
7. Jadwal tidak beririsan dengan item yang sudah dipilih. Pesan menyebut kedua mata kuliah, hari, dan jam yang bentrok.
8. Sisa kursi kelas masih ada menurut kuota yang belum dipegang pengajuan lain.
9. Kode mata kuliah dan kelas yang sama belum ada pada KRS ini.
10. Status KRS adalah Draft atau Perlu Revisi. Status lain menolak perubahan isi.

Pengulangan mata kuliah dari semester lalu tidak diasumsikan boleh atau dilarang. Jika aturan pengulangan belum dikonfigurasi, sistem menampilkan bahwa aturan itu belum dapat diperiksa dan tidak menambahkan mata kuliah yang pernah ditempuh sampai aturan demo diisi.

Penyusunan jadwal oleh petugas boleh menyimpan bentrok sebagai peringatan demo. KRS mahasiswa tidak boleh.

Validasi memakai data demo yang saling merujuk: mahasiswa, kurikulum, kelas, prasyarat, nilai lalu, registrasi, dan kalender. Jangan mengisi kelulusan semu agar tombol selalu berhasil.

---

### 8.5 Alur Persetujuan KRS

```
Belum Dibuat → Draft → Menunggu Persetujuan Dosen Wali → Disetujui → Final
                              ↘ Perlu Revisi → (ajukan ulang)
```

Transisi lengkap, termasuk batal pengajuan dan perubahan setelah Final, ada di bagian 7.7. Jangan membuat status tambahan.

Mahasiswa melihat status, waktu pengajuan, daftar mata kuliah, total SKS, catatan dosen wali, waktu keputusan, riwayat status, dan alasan revisi.

KRS Disetujui atau Final tidak diubah langsung. Perubahan setelah Final hanya pada periode perubahan, menyimpan snapshot, lalu mengikuti persetujuan lagi jika kebijakan mewajibkannya.

---

### 8.6 Halaman KRS Saya

- Header status dan waktu pengajuan.
- Tabel: kode, nama, SKS, kelas, dosen, jadwal, ruang.
- Total SKS, sama dengan angka di halaman isi KRS dan di jadwal.
- Dosen wali dan keputusan terakhir.
- Catatan dosen wali.
- Timeline status.
- Tombol Cetak KRS sesuai bagian 8.7.
- Jika status Final dan periode perubahan terbuka, tombol Ubah KRS menuju halaman isi KRS.

---

### 8.7 Cetak KRS

Halaman `#/portal/student/krs/print` memanggil `window.print()` dan memakai `@media print`.

Dokumen memuat:
- Nama yayasan, kampus, dan logo demo.
- NIM, nama, program studi, angkatan, semester berjalan.
- Tahun akademik dan semester.
- Tabel mata kuliah: kode, nama, SKS, kelas, dosen, jadwal.
- Total SKS.
- Status KRS dan waktu persetujuan jika ada.
- Nama dosen wali.
- Area tanda tangan Mahasiswa, Dosen Wali, dan BAAK. Area ini ikut kebijakan `print.showSignature`. Bawaan demo: tampil.

Tombol cetak aktif pada Final. Bawaan demo juga mengizinkan cetak saat Disetujui (`allowPrintBeforeFinal`), dan dokumen menulis status yang sebenarnya. Jika status masih Draft, Menunggu Persetujuan Dosen Wali, atau Perlu Revisi, tombol `disabled` dengan alasan.

`@media print` menyembunyikan sidebar, topbar, navigasi, filter, toast, dan elemen `.no-print`. Tabel tidak terpotong di tengah baris sejauh CSS memungkinkan. Footer memuat kalimat bahwa ini dokumen prototype, bukan dokumen resmi kampus.

---

### 8.8 Halaman Dosen Wali

Mahasiswa dapat melihat nama dan kontak demo dosen wali, catatan dosen wali, riwayat persetujuan KRS, dan jadwal konsultasi demo jika ada. Mahasiswa tidak melihat data bimbingan orang lain.

------------------------------------------------------------------------

## 9. Portal Dosen

Portal Dosen menggunakan navigasi ringkas (bukan sidebar back-office).
Semua menu dan data dibatasi pada penugasan aktual dosen: kelas yang
diampu, mahasiswa bimbingan, jadwal sidang yang ditugaskan, dsb. Dosen
tidak melihat kelas, nilai, atau dokumen di luar kewenangannya.

### 9.0.0 Hubungan dengan modul lain

| Modul / aktor | Hubungan dengan Portal Dosen |
|---|---|
| **Mahasiswa** | Roster kelas dari KRS Final/`enrollments`; materi, tugas, pengumuman, dan nilai hanya untuk mahasiswa pada kelas yang diampu; portal mahasiswa membaca status yang sama |
| **Program studi** | Kelas dan kurikulum terikat prodi; Kaprodi dapat meninjau beban mengajar dan nilai final menurut hak back-office (bukan lewat portal dosen) |
| **Fakultas** | Dekan melihat agregat beban dan kinerja; tidak mengubah nilai atau presensi kelas dosen lewat portal dosen |
| **BAAK / Staf TU Akademik** | Menetapkan penugasan mengajar, dosen wali, kalender, dan dapat mempublikasikan nilai atau memproses koreksi sesuai kebijakan; memproses pengajuan jadwal pengganti dan administrasi |
| **Kurikulum & Kelas** | Sumber mata kuliah, SKS, kapasitas, jadwal, dan ruang; dosen tidak mengubah master kurikulum |
| **Dosen Wali (master)** | Penugasan di `#/academic/advisors` (`advisorAssignments`); portal hanya memakai penugasan aktif |
| **Skripsi & Sidang** | Penugasan pembimbing/penguji dari modul 7.8; portal memfilter menurut penugasan itu |
| **Keuangan** | Portal dosen tidak mengubah tagihan; honor mengajar (LEC-005) hanya rekap/informasi sesuai aturan yang disetujui |

**Pembedaan menu bimbingan:**

| Menu | Tujuan | Syarat tampil |
|---|---|---|
| **Bimbingan Akademik** (9.0.10) | Operasional: daftar mahasiswa bimbingan, catatan konsultasi, tautan ke persetujuan KRS | Ada penugasan wali atau pembimbing akademik aktif |
| **Wali Akademik** (9.0.13) | Monitoring: KPI risiko (IPK/kehadiran rendah), ringkasan registrasi/KRS, tautan cepat ke 9.1 | Ada penugasan dosen wali aktif (`advisorAssignments`) |
| **Persetujuan KRS** (9.1) | Keputusan Setujui / Kembalikan Revisi | Sub-halaman di bawah Bimbingan Akademik; tidak diduplikasi di sidebar |

Jika dosen tidak memiliki penugasan terkait, menu yang relevan menampilkan empty state atau disembunyikan dari navigasi (preferensi demo: tampilkan dengan empty state agar penemuan fitur mudah).

### 9.0 Navigasi Portal Dosen

Struktur menu:

1.  **Dashboard Dosen**
2.  **Mata Kuliah Saya**
    -   Daftar Mata Kuliah
    -   Daftar Kelas
    -   Daftar Mahasiswa
    -   Detail Mata Kuliah
3.  **Jadwal Mengajar**
    -   Jadwal Harian
    -   Jadwal Mingguan
    -   Kalender Akademik
    -   Jadwal UTS/UAS
    -   Pengajuan Jadwal Pengganti
4.  **Materi & Modul**
    -   RPS (Rencana Pembelajaran Semester)
    -   Silabus
    -   Modul Perkuliahan
    -   Slide Presentasi
    -   Materi Praktikum
    -   Referensi dan Video
    -   Pengaturan Publikasi
5.  **Tugas & Kuis**
    -   Buat Tugas
    -   Daftar Tugas
    -   Pengumpulan Mahasiswa
    -   Penilaian Tugas
    -   Kuis
    -   Umpan Balik
6.  **Penilaian**
    -   Pengaturan Komponen Nilai
    -   Pengaturan Bobot
    -   Nilai Tugas
    -   Nilai Kuis
    -   Nilai Praktikum
    -   Nilai UTS
    -   Nilai UAS
    -   Perhitungan Nilai Akhir
    -   Publikasi Nilai
    -   Koreksi Nilai
7.  **Presensi Mahasiswa**
    -   Input Presensi
    -   Rekap Kehadiran
    -   Riwayat Presensi
    -   Koreksi Presensi
8.  **Jurnal Perkuliahan**
9.  **Ujian**
    -   Jadwal Ujian
    -   Pengelolaan Nilai
    -   Berita Acara
10. **Bimbingan Akademik** (termasuk persetujuan KRS dosen wali, lihat
    bagian 9.1)
11. **Skripsi / Tugas Akhir**
    -   Daftar Mahasiswa Bimbingan
    -   Review Judul
    -   Review Proposal
    -   Riwayat Bimbingan
    -   Catatan dan Revisi
    -   Persetujuan Seminar
    -   Persetujuan Sidang
12. **Sidang & Penguji**
    -   Jadwal Sidang
    -   Dokumen Peserta
    -   Rubrik Penilaian
    -   Catatan Penguji
    -   Keputusan Sidang
    -   Berita Acara
    -   Monitoring Revisi
13. **Wali Akademik**
14. **Pengumuman Kelas**
15. **Laporan Akademik**
16. **Pengajuan Administrasi**
17. **Profil & Pengaturan**

Menu Persetujuan KRS tidak diduplikasi di sidebar. Ia adalah bagian
dari Bimbingan Akademik.

Route portal dosen:

-   `#/portal/lecturer` — Dashboard Dosen
-   `#/portal/lecturer/courses` — Mata Kuliah Saya
-   `#/portal/lecturer/courses/:id` — Detail Mata Kuliah
-   `#/portal/lecturer/courses/:id/students` — Daftar Mahasiswa Kelas
-   `#/portal/lecturer/schedule` — Jadwal Mengajar
-   `#/portal/lecturer/schedule/replacement` — Pengajuan Jadwal Pengganti
-   `#/portal/lecturer/materials` — Materi & Modul
-   `#/portal/lecturer/materials/:courseId` — Materi per Mata Kuliah
-   `#/portal/lecturer/assignments` — Tugas & Kuis
-   `#/portal/lecturer/assignments/create` — Buat Tugas
-   `#/portal/lecturer/assignments/:id` — Detail Tugas
-   `#/portal/lecturer/assignments/:id/submissions` — Pengumpulan
-   `#/portal/lecturer/grading` — Penilaian
-   `#/portal/lecturer/grading/:classId/components` — Komponen & Bobot
-   `#/portal/lecturer/grading/:classId/input` — Input Nilai
-   `#/portal/lecturer/grading/:classId/final` — Perhitungan Nilai Akhir
-   `#/portal/lecturer/attendance` — Presensi
-   `#/portal/lecturer/attendance/:classId` — Input Presensi Kelas
-   `#/portal/lecturer/journal` — Jurnal Perkuliahan
-   `#/portal/lecturer/exam` — Ujian
-   `#/portal/lecturer/advising` — Bimbingan Akademik
-   `#/portal/lecturer/advising/krs` — Persetujuan KRS
-   `#/portal/lecturer/thesis` — Skripsi / Tugas Akhir
-   `#/portal/lecturer/thesis/:studentId` — Detail Bimbingan
-   `#/portal/lecturer/examination` — Sidang & Penguji
-   `#/portal/lecturer/examination/:id` — Detail Sidang
-   `#/portal/lecturer/academic-advisor` — Wali Akademik
-   `#/portal/lecturer/announcements` — Pengumuman Kelas
-   `#/portal/lecturer/reports` — Laporan Akademik
-   `#/portal/lecturer/administration` — Pengajuan Administrasi
-   `#/portal/lecturer/profile` — Profil & Pengaturan

---

### 9.0.1 Dashboard Dosen

**KPI cards:**
-   Jumlah mata kuliah yang diampu semester ini
-   Jumlah kelas aktif
-   Total mahasiswa yang diampu
-   Jadwal mengajar hari ini (daftar kelas, jam, ruang)
-   Tugas yang belum dinilai (count)
-   Nilai yang belum difinalisasi (count kelas)
-   Nilai yang belum dipublikasikan (count kelas)
-   Presensi yang belum lengkap (count pertemuan)
-   Jurnal yang belum diisi (count pertemuan)

**Panel bimbingan (tampil jika dosen memiliki penugasan):**
-   Mahasiswa bimbingan aktif (count)
-   KRS menunggu persetujuan (count, jika dosen wali)
-   Mahasiswa bimbingan TA aktif (count, jika pembimbing)
-   Jadwal seminar/sidang yang akan datang (jika penguji/pembimbing)

**Pengumuman dan notifikasi:**
-   Pengumuman akademik terbaru
-   Notifikasi tugas administrasi

Setiap kartu ringkasan harus membuka halaman detail terkait. Jangan
menampilkan menu atau tugas yang tidak relevan dengan penugasan dosen.

---

### 9.0.2 Mata Kuliah Saya

Dosen hanya melihat mata kuliah dan kelas yang ditugaskan kepadanya.

**Daftar Mata Kuliah**

Kolom: kode mata kuliah, nama mata kuliah, semester, tahun akademik,
program studi, jumlah kelas, total mahasiswa, status.

Filter: semester, tahun akademik, program studi. Pencarian kode/nama.

**Daftar Kelas (per mata kuliah)**

Kolom: kode kelas, hari dan jam, ruang, dosen pengampu, jumlah
mahasiswa, kapasitas, jumlah pertemuan terlaksana, status presensi,
status jurnal, status penilaian, status kelas.

Status kelas: Aktif, Selesai, Dibatalkan.

Klik kelas membuka halaman detail.

**Daftar Mahasiswa (per kelas)**

Kolom: NIM, nama, program studi, angkatan, status KRS, status presensi
(persentase), nilai sementara.

Fitur: pencarian NIM/nama, ekspor CSV demo.

**Detail Mata Kuliah**

Informasi: kode, nama, SKS teori, SKS praktik, deskripsi, prasyarat,
kurikulum, dosen pengampu, kelas yang tersedia.

Tab: Kelas, Mahasiswa, Materi, Tugas, Nilai, Presensi, Jurnal.

---

### 9.0.3 Jadwal Mengajar

**Jadwal Harian**

Grid waktu dari jam 07:00 sampai 21:00 pada tanggal yang dipilih.
Tampilkan kelas yang diampu pada slot waktu yang sesuai. Setiap blok
menampilkan: mata kuliah, kelas, ruang, waktu.

**Jadwal Mingguan**

Grid hari Senin–Sabtu × slot waktu. Highlight hari ini.

**Kalender Akademik**

Menampilkan periode penting dari kalender akademik kampus: perkuliahan,
UTS, UAS, libur, input nilai. Dosen hanya membaca, tidak mengubah.

**Jadwal UTS/UAS**

Daftar jadwal ujian untuk kelas yang diampu: mata kuliah, kelas, tanggal,
jam, ruang, jumlah peserta.

**Pengajuan Jadwal Pengganti**

Form: mata kuliah, kelas, tanggal asli, alasan, tanggal pengganti yang
diusulkan, jam, ruang. Status: Draft, Menunggu Persetujuan, Disetujui,
Ditolak. Perubahan jadwal mengikuti hak akses dan prosedur persetujuan
institusi. Pada prototype, pengajuan disimpan sebagai record demo dan
status diubah oleh staf/admin.

---

### 9.0.4 Materi & Modul Perkuliahan

Dosen mengelola materi berdasarkan mata kuliah, kelas, dan pertemuan.

**Daftar Materi per Mata Kuliah**

Kolom: pertemuan ke, judul materi, jenis (RPS, silabus, modul, slide,
praktikum, referensi, video), status (draft, dipublikasikan, dijadwalkan),
tanggal publikasi, aksi.

**Form Upload Materi**

Field: mata kuliah, kelas (opsional, bawaan semua kelas), pertemuan ke,
judul, deskripsi, jenis materi, file placeholder (simulasi), URL
referensi, status publikasi, tanggal publikasi terjadwal.

**Jenis file yang diizinkan (spesifikasi produksi):**
PDF, DOCX, PPTX, XLSX, MP4, ZIP. Batas ukuran: 50 MB per file.

**Batasan prototype localStorage:**
-   Jangan menyimpan file sebagai base64 di localStorage.
-   Simpan hanya metadata: nama file, ukuran simulasi, tipe, timestamp,
    status, uploader.
-   Tampilkan indikator "File disimulasikan — pada produksi disimpan
    di object storage".
-   Kebutuhan produksi: object storage (S3/GCS/Azure Blob), signed URL,
    antivirus, enkripsi at-rest, access policy per kelas.

**Pengaturan Publikasi**

-   Draft: hanya dosen yang bisa melihat.
-   Dipublikasikan: mahasiswa kelas terkait bisa melihat.
-   Dijadwalkan: otomatis dipublikasikan pada tanggal yang ditentukan.
-   Penggantian atau penghapusan materi mengikuti izin dan menyimpan
    riwayat perubahan.

**Akses mahasiswa:**
Mahasiswa hanya dapat melihat materi untuk kelas yang diambilnya.

---

### 9.0.5 Tugas & Kuis

Dosen membuat dan mengelola tugas berdasarkan kelas yang diampu.

**Data tugas minimal:**
-   Judul
-   Deskripsi
-   Mata kuliah dan kelas
-   Lampiran (simulasi metadata)
-   Waktu mulai
-   Deadline
-   Bobot nilai (opsional, terkait komponen penilaian)
-   Batas ukuran file pengumpulan (produksi)
-   Jenis file yang diizinkan (produksi)
-   Aturan keterlambatan: Ditolak, Diterima dengan penalti, Diterima
    tanpa penalti
-   Aturan pengumpulan ulang: Diizinkan, Tidak diizinkan, Diizinkan
    sampai deadline
-   Status publikasi: Draft, Dipublikasikan

**Daftar Tugas**

Kolom: judul, mata kuliah, kelas, deadline, jumlah pengumpulan/total
mahasiswa, status penilaian, status publikasi, aksi.

Filter: mata kuliah, kelas, status penilaian. Pencarian judul.

**Pengumpulan Mahasiswa**

Kolom: NIM, nama, waktu pengumpulan, status (Tepat waktu, Terlambat,
Belum mengumpulkan), file (simulasi), nilai, komentar, aksi.

**Penilaian Tugas**

Form per mahasiswa: nilai angka, komentar/umpan balik, status
(Belum dinilai, Dinilai, Perlu revisi).

**Kuis**

Form kuis sederhana (demo): judul, deskripsi, mata kuliah, kelas,
durasi, jumlah soal (simulasi), deadline, bobot.

**Umpan Balik**

Dosen dapat memberikan komentar umum per tugas/kuis kepada kelas,
atau komentar individual per mahasiswa.

**Hak akses:**
-   Mahasiswa hanya mengakses tugas kelasnya sendiri.
-   Dosen hanya menilai tugas kelas yang menjadi kewenangannya.

---

### 9.0.6 Penilaian

**Pengaturan Komponen Nilai**

Per mata kuliah dan kelas. Komponen yang dapat dikonfigurasi:
-   Tugas
-   Kuis
-   Praktikum
-   Partisipasi
-   UTS
-   UAS
-   Komponen tambahan (nama dapat diubah)

Aksi: tambah, ubah nama, nonaktifkan komponen. Komponen yang
dinonaktifkan tidak ikut perhitungan.

**Pengaturan Bobot**

-   Bobot per komponen dalam persen.
-   Validasi: total bobot harus 100%. Jika belum 100%, tampilkan
    peringatan dan tolak finalisasi.
-   Jangan hardcode bobot secara global. Setiap mata kuliah/kelas
    dapat memiliki bobot berbeda.
-   Bobot mengikuti kebijakan institusi. Jika nilai sudah diterbitkan,
    perubahan komponen atau bobot harus melalui prosedur resmi:
    menyimpan nilai sebelum dan sesudah perubahan, alasan perubahan,
    waktu, dan aktor.

**Rumus Nilai Akhir**

Nilai akhir = Σ (nilai komponen × bobot komponen / 100).

Konversi ke huruf dan bobot mutu mengikuti tabel yang dapat dikonfigurasi
per kampus. Tabel default demo:

| Rentang | Huruf | Bobot Mutu |
|---|---|---|
| 85–100 | A | 4,00 |
| 80–84 | A- | 3,70 |
| 75–79 | B+ | 3,30 |
| 70–74 | B | 3,00 |
| 65–69 | B- | 2,70 |
| 60–64 | C+ | 2,30 |
| 55–59 | C | 2,00 |
| 50–54 | C- | 1,70 |
| 40–49 | D | 1,00 |
| 0–39 | E | 0,00 |

Tabel ini contoh demo. Rentang dan huruf harus dapat dikonfigurasi.

**Input Nilai**

-   Pilih kelas.
-   Tampilkan daftar mahasiswa.
-   Kolom per komponen yang sudah dikonfigurasi.
-   Validasi rentang: 0–100.
-   Nilai akhir dan huruf dihitung otomatis.
-   Tombol Simpan Draft dan Finalisasi.

**Impor dan Ekspor Excel**

-   Ekspor template CSV/Excel dengan kolom NIM, nama, dan komponen aktif.
-   Impor nilai dari file tersebut.
-   Preview hasil impor dan validasi sebelum simpan.
-   Pada prototype, impor membaca file lokal (CSV) dan memetakan ke data
    demo.

**Pratinjau Nilai Akhir**

Tabel: NIM, nama, nilai per komponen, nilai akhir, huruf, bobot mutu.
Indikator mahasiswa yang belum lengkap nilainya.

**Finalisasi Nilai**

-   Konfirmasi kedua sebelum finalisasi.
-   Setelah final, nilai tidak dapat diubah langsung.
-   Finalisasi hanya jika semua mahasiswa sudah dinilai.

**Publikasi Nilai**

-   Setelah finalisasi, dosen atau BAAK mempublikasikan nilai kepada
    mahasiswa.
-   Status: Belum Final, Final Belum Dipublikasikan, Dipublikasikan.
-   Mahasiswa melihat nilai hanya setelah dipublikasikan.

**Koreksi Nilai**

-   Setelah finalisasi, perubahan melalui pengajuan koreksi.
-   Form: mahasiswa, komponen, nilai lama, nilai baru, alasan.
-   Status: Diajukan, Disetujui, Ditolak.
-   Riwayat koreksi tercatat: pelaku, waktu, nilai sebelum, nilai
    sesudah, alasan.

---

### 9.0.7 Presensi Mahasiswa

**Input Presensi**

-   Pilih kelas dan pertemuan.
-   Daftar mahasiswa dengan pilihan status: Hadir (H), Izin (I),
    Sakit (S), Alfa (A).
-   Waktu pertemuan terisi otomatis dari jadwal.
-   Tombol Simpan Presensi.
-   Penguncian presensi setelah batas waktu sesuai kebijakan.

**Rekap Kehadiran**

Tabel per kelas: NIM, nama, jumlah H/I/S/A, persentase kehadiran.
Indikator mahasiswa di bawah batas kehadiran minimum (demo: 75%).

**Riwayat Presensi**

Tabel per kelas: pertemuan ke, tanggal, jumlah H/I/S/A, waktu simpan,
status kunci.

**Koreksi Presensi**

-   Jika presensi sudah dikunci, koreksi membutuhkan alasan.
-   Riwayat perubahan tercatat: status asal, status tujuan, alasan,
    waktu, pelaku.
-   Dosen hanya mengoreksi presensi kelas yang menjadi kewenangannya.

---

### 9.0.8 Jurnal Perkuliahan

Form per pertemuan per kelas:
-   Tanggal pertemuan
-   Pertemuan ke
-   Topik/materi yang diajarkan
-   Capaian pembelajaran yang dibahas
-   Catatan tambahan
-   Status: Belum Diisi, Terisi

Daftar jurnal per kelas: pertemuan ke, tanggal, topik, status.

Jurnal terkait dengan presensi pada pertemuan yang sama.

---

### 9.0.9 Ujian

**Jadwal Ujian**

Daftar jadwal UTS/UAS untuk kelas yang diampu: mata kuliah, kelas,
jenis ujian, tanggal, jam, ruang, jumlah peserta.

**Pengelolaan Nilai Ujian**

Input nilai UTS/UAS langsung mengisi komponen penilaian yang sesuai
pada halaman Penilaian.

**Berita Acara Ujian**

Form per kelas per ujian: mata kuliah, kelas, jenis ujian, tanggal,
jumlah hadir, jumlah tidak hadir, catatan kejadian, tanda tangan
pengawas (simulasi). Simpan sebagai record demo.

---

### 9.0.10 Bimbingan Akademik

Menampilkan daftar mahasiswa bimbingan akademik dosen (sebagai dosen
wali atau pembimbing akademik).

Kolom: NIM, nama, program studi, angkatan, semester, IPK, IPS terakhir,
status akademik, status KRS, aksi.

Aksi: lihat detail, lihat riwayat konsultasi, catat konsultasi baru.

Catatan konsultasi: tanggal, topik, isi, tindak lanjut.

Persetujuan KRS (khusus dosen wali) dibahas di bagian 9.1.

---

### 9.0.11 Skripsi / Tugas Akhir (Pembimbing)

Dosen yang ditugaskan sebagai pembimbing melihat mahasiswa bimbingan
TA-nya.

**Daftar Mahasiswa Bimbingan TA**

Kolom: NIM, nama, judul, tahap saat ini, tanggal pembaruan terakhir,
status, aksi.

Tahap: Pengajuan Judul, Review Judul, Proposal, Bimbingan, Seminar,
Sidang, Revisi Pasca-Sidang, Selesai.

**Review Judul dan Review Proposal**

-   Dosen melihat judul/proposal yang diajukan.
-   Aksi: Setujui, Minta Revisi (wajib catatan), Tolak (wajib alasan).
-   Riwayat keputusan tercatat.

**Riwayat Bimbingan**

Tabel per mahasiswa: tanggal, topik, catatan dosen, dokumen yang
dibahas (simulasi metadata), tindak lanjut.

**Catatan dan Revisi**

Dosen memberi catatan tertulis. Mahasiswa melihat catatan dan
mengunggah revisi (simulasi).

**Persetujuan Seminar dan Sidang**

-   Dosen pembimbing menyetujui kesiapan mahasiswa untuk seminar
    proposal atau sidang akhir.
-   Status: Belum Siap, Disetujui Pembimbing.
-   Persetujuan hanya untuk mahasiswa bimbingannya sendiri.

**Hak akses:**
Jangan memberikan akses otomatis kepada seluruh dosen terhadap semua
dokumen skripsi. Hanya pembimbing yang ditugaskan yang melihat
dokumen mahasiswa bimbingannya.

---

### 9.0.12 Sidang & Penguji

Menu ini tampil jika dosen ditugaskan sebagai penguji atau ketua
sidang.

**Jadwal Sidang**

Daftar sidang yang melibatkan dosen sebagai penguji: mahasiswa, judul,
jenis sidang (proposal/akhir), tanggal, jam, ruang, peran dosen
(penguji 1/2/ketua).

**Dokumen Peserta**

Dosen penguji melihat dokumen yang diunggah mahasiswa (simulasi
metadata): draft skripsi, proposal, lembar revisi.

**Rubrik Penilaian**

Form rubrik per komponen yang dapat dikonfigurasi: presentasi,
penguasaan materi, metodologi, penulisan, jawaban pertanyaan.
Setiap komponen: skor (0–100), bobot, komentar.

**Catatan Penguji**

Teks catatan per penguji. Catatan ini terlihat oleh pembimbing
dan mahasiswa setelah sidang.

**Keputusan Sidang**

Opsi: Lulus, Lulus dengan Revisi (batas waktu revisi), Tidak Lulus,
Ditunda. Keputusan akhir mengikuti kewenangan dan komposisi dewan
penguji.

**Berita Acara Sidang**

Form: peserta, penguji, pembimbing, nilai per rubrik, keputusan,
catatan, waktu. Simpan sebagai record demo.

**Monitoring Revisi**

Dosen penguji melihat status revisi mahasiswa yang mendapat keputusan
Lulus dengan Revisi: sudah/belum mengunggah revisi, tanggal, status
verifikasi pembimbing.

---

### 9.0.13 Wali Akademik

Halaman monitoring untuk dosen dengan penugasan wali aktif. Bukan
pengganti Bimbingan Akademik (9.0.10) maupun Persetujuan KRS (9.1).

**KPI ringkas:**
-   Jumlah mahasiswa bimbingan aktif
-   KRS menunggu persetujuan
-   Mahasiswa berisiko akademik (threshold demo: IPK di bawah 2,00 atau
    kehadiran di bawah 75% pada kelas yang diampu — data demo)
-   Konsultasi belum ditindaklanjuti

**Tabel mahasiswa:**
NIM, nama, prodi, angkatan, IPK, IPS terakhir, status registrasi
semester, status KRS, indikator risiko, aksi (detail, konsultasi, KRS).

**Hak akses:** hanya mahasiswa pada `advisorAssignments` berstatus
aktif. Perubahan data akademik mahasiswa (prodi, status) dilakukan di
modul Mahasiswa/BAAK, bukan di portal dosen.

---

### 9.0.14 Pengumuman Kelas

Dosen membuat pengumuman untuk kelas yang diampu.

Form: mata kuliah, kelas (satu atau semua kelas yang diampu), judul,
isi, tanggal publikasi, lampiran (simulasi metadata), status
(Draft / Dipublikasikan).

Daftar: judul, kelas, tanggal, status, aksi edit/hapus/nonaktifkan.

**Aturan:**
-   Hanya kelas penugasan dosen.
-   Mahasiswa melihat pengumuman di portal mahasiswa sesuai kelas yang
    diambil (KRS Final / enrollment).
-   Penghapusan pengumuman yang sudah dipublikasikan mengikuti kebijakan
    institusi (DEC terkait); prototype: soft-delete dengan riwayat.

---

### 9.0.15 Laporan Akademik

Laporan yang tersedia untuk dosen (hanya kelas/mahasiswa kewenangannya):
-   Rekap presensi per kelas (tabel dan grafik persentase).
-   Rekap nilai per kelas (distribusi nilai, rata-rata, median).
-   Rekap pengumpulan tugas (tepat waktu, terlambat, belum).
-   Rekap beban mengajar semester berjalan (jumlah SKS/kelas/pertemuan).
-   Cetak rekap print-friendly dan ekspor CSV demo.

Filter: semester, tahun akademik, mata kuliah, kelas.

Laporan lintas prodi/fakultas atau seluruh kampus tidak tersedia di
portal dosen; itu ada di Dashboard Dekan/Kaprodi dan Laporan back-office.

---

### 9.0.16 Pengajuan Administrasi

Dosen dapat mengajukan:
-   Surat tugas mengajar
-   Surat keterangan aktif mengajar
-   Permohonan cuti mengajar
-   Permohonan penggantian jadwal (selain form khusus 9.0.3; atau
    mengarahkan ke `#/portal/lecturer/schedule/replacement`)

Form: jenis pengajuan, detail, lampiran (simulasi metadata).

Status: Diajukan → Diproses → Selesai | Ditolak.

Daftar pengajuan menampilkan riwayat: pelaku, waktu, status asal/tujuan,
catatan. Pemrosesan oleh BAAK/HR pada prototype disimulasikan (ubah
status dari role staf atau tombol demo).

---

### 9.0.17 Profil & Pengaturan

-   Data diri: nama, NIDN/NIDK (demo), email, telepon, unit/prodi,
    jabatan akademik, status kepegawaian, kampus afiliasi.
-   Daftar penugasan mengajar semester berjalan (read-only dari `classes`).
-   Daftar penugasan wali dan bimbingan TA (read-only).
-   Riwayat pendidikan dan mengajar (demo).
-   Preferensi notifikasi (email/in-app simulasi).
-   Preferensi tampilan.

Dosen dapat memperbarui kontak dan preferensi. Identitas utama (NIDN,
nama resmi, unit) hanya diubah melalui BAAK/HR. Perubahan profil
tercatat di audit log demo.

---

### 9.1 Portal Dosen Wali — Persetujuan KRS

Dosen yang menerima penugasan dosen wali memiliki halaman khusus untuk
mengelola persetujuan KRS mahasiswa bimbingannya. Ini bukan role login
terpisah.

**Daftar mahasiswa bimbingan:**

Kolom:
-   NIM — Nama — Program studi — Angkatan — Semester — Status akademik
-   Status KRS — Total SKS — Batas SKS — Aksi

Filter: program studi, angkatan, semester, status KRS.

**Detail akademik mahasiswa (panel samping atau halaman detail):**
-   Profil ringkas: NIM, nama, prodi, angkatan, IPK, IPS terakhir
-   Riwayat KRS semester-semester sebelumnya
-   Ringkasan kredit yang sudah diselesaikan

**Detail KRS yang diajukan:**
-   Daftar mata kuliah: kode, nama, SKS, kelas, dosen, jadwal, ruang
-   Total SKS
-   Peringatan bentrok jadwal (tampil otomatis jika ada)
-   Peringatan prasyarat yang belum terpenuhi
-   Indikator kapasitas kelas

**Aksi dosen wali:**
-   **Setujui KRS** — pada bawaan demo mengubah status menjadi Disetujui
    (wajib konfirmasi). Jika kebijakan demo memfinalkan saat persetujuan,
    status menjadi Final dan halaman menjelaskan hal itu.
-   **Kembalikan untuk Revisi** — mengubah status KRS menjadi Perlu Revisi,
    wajib mengisi catatan/alasan revisi
-   Lihat riwayat keputusan

Perubahan status KRS oleh dosen wali tercermin langsung pada Portal Mahasiswa.

Dosen wali tidak memiliki akses terhadap KRS mahasiswa yang bukan bimbingannya.
Lingkup akses dosen wali dibatasi pada mahasiswa yang ditugaskan secara resmi.

**Riwayat keputusan:**
-   Tabel: tanggal, mahasiswa, status asal, status tujuan, aksi, catatan

Setujui ditolak jika masih ada bentrok, prasyarat gagal, SKS berlebih,
kelas penuh, atau duplikat. Dosen wali lalu hanya dapat mengembalikan
KRS. Override dosen wali tidak tersedia pada demo sampai keputusan
kampus mengizinkannya.

Kembalikan untuk Revisi memfokuskan isian alasan yang kosong dan
menolak simpan tanpa catatan. Setelah keputusan, portal mahasiswa,
timeline, dan notifikasi berubah dari state yang sama.

Membuka KRS di luar bimbingan menampilkan keadaan tidak ditemukan,
tanpa nama mahasiswa lain. Daftar kosong menampilkan "Belum ada
mahasiswa bimbingan pada filter ini."

------------------------------------------------------------------------

## 10. Portal Orang Tua/Wali

Menu: - Ringkasan - Akademik - Kehadiran - Tagihan - Riwayat
Pembayaran - Pengumuman - Pengaturan Akses

Tampilkan informasi bahwa akses orang tua pada sistem nyata harus
didasarkan pada kebijakan kampus dan persetujuan yang sah. Prototype
hanya menampilkan data demo dari mahasiswa yang sudah dihubungkan.

Jangan tampilkan detail pribadi atau data mahasiswa lain.

------------------------------------------------------------------------

## 11. Data Demo dan State Management

### 11.1 Model data minimum

Gunakan object/array JavaScript atau JSON dengan identifier stabil.

``` js
const organization = {
  foundation: { id: "foundation-1", name: "Yayasan Cakrawala Pendidikan" },
  campuses: [
    { id: "campus-1", code: "UCBJ", name: "Universitas Cakrawala Jakarta" },
    { id: "campus-2", code: "ITC", name: "Institut Teknologi Cakrawala" },
    { id: "campus-3", code: "STBC", name: "Sekolah Tinggi Bisnis Cakrawala" }
  ]
};
```

Model minimum lainnya: - `faculties` - `studyPrograms` -
`academicYears` - `semesters` - `students` - `lecturers` - `staff` -
`courses` - `curricula` - `classes` - `enrollments` - `attendance` -
`grades` - `admissions` - `invoices` - `payments` - `scholarships` -
`accounts` - `journals` - `budgets` - `employees` - `payrollRuns` -
`assets` - `procurementRequests` - `notifications` - `auditLogs` -
`thesisRecords` - `pddiktiValidationJobs` -
`semesterRegistrations` - `registrationPolicies` - `advisorAssignments` -
`krsPlans` - `krsItems` - `krsStatusEvents` -
`courseMaterials` - `classAssignments` - `assignmentSubmissions` -
`gradeComponents` - `gradeEntries` - `gradePublications` -
`gradeCorrections` - `attendanceSessions` - `attendanceRecords` -
`lectureJournals` - `examMinutes` - `scheduleReplacements` -
`classAnnouncements` - `lecturerAdminRequests` -
`thesisReviews` - `thesisConsultationNotes` -
`defenseSessions` - `defenseScores`

`krsPlans` adalah header KRS. `krsItems` menyimpan salinan kode, nama,
dan SKS pada saat item ditambahkan. `Enrollment/KRS` pada dokumen lain
mengacu ke header ini, bukan ke record kedua.

**Model Portal Dosen (ringkas):**

| Koleksi | Isi utama | Catatan prototype |
|---|---|---|
| `courseMaterials` | classId/courseId, pertemuan, jenis, judul, fileMeta, url, status, publishAt | fileMeta hanya nama/ukuran/tipe; tanpa base64 |
| `classAssignments` | classId, judul, deadline, bobot, latePolicy, resubmitPolicy, status | terkait `gradeComponents` opsional |
| `assignmentSubmissions` | assignmentId, studentId, submittedAt, fileMeta, score, feedback, status | unduh file = simulasi |
| `gradeComponents` | classId, name, weight%, active | total aktif harus 100% sebelum final |
| `gradeEntries` | classId, studentId, componentId, score, status | draft / final |
| `gradePublications` | classId, publishedAt, publishedBy | terpisah dari finalisasi |
| `gradeCorrections` | entryId, oldScore, newScore, reason, status, actor | setelah final |
| `attendanceSessions` | classId, meetingNo, date, locked | |
| `attendanceRecords` | sessionId, studentId, status H/I/S/A | |
| `lectureJournals` | classId, meetingNo, topic, cloNotes | 1:1 dengan pertemuan |
| `classAnnouncements` | classId(s), title, body, status, publishAt | |
| `lecturerAdminRequests` | lecturerId, type, status, history | |
| `scheduleReplacements` | classId, originalDate, proposed, reason, status | |
| `defenseSessions` / `defenseScores` | thesisId, examiners, rubrik, keputusan | filter per penugasan penguji |

### 11.2 Local storage

-   Simpan state demo pada key dengan prefix `siakad-demo-`.
-   Saat aplikasi pertama kali dibuka, seed data awal jika belum ada.
-   Perubahan form harus memperbarui state dan UI.
-   Sediakan tombol reset data demo.
-   Tangani localStorage yang tidak tersedia dengan fallback ke memori.
-   Jangan menyimpan informasi rahasia.

### 11.3 Fungsi utilitas

Buat utilitas reusable untuk: - Format Rupiah:
`Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })` -
Format tanggal Indonesia - Pencarian tanpa membedakan huruf
besar/kecil - Filter berdasarkan field - Sorting - Pagination - Membuat
ID demo - Toast notification - Konfirmasi aksi - Ekspor CSV - Menghitung
ringkasan KPI dari data demo

### 11.4 Konsistensi data

-   Semua record harus memiliki ID unik.
-   Mahasiswa harus terkait dengan kampus, fakultas, program studi, dan
    angkatan yang valid.
-   Kelas harus terkait dengan mata kuliah dan dosen.
-   KRS harus terkait dengan mahasiswa dan kelas pada kurikulum mahasiswa.
-   Total SKS di KRS, jadwal, dan roster kelas berasal dari SKS item yang sama.
-   Snapshot KRS final tidak berubah ketika kurikulum atau nama mata kuliah diubah.
-   Tagihan harus terkait dengan mahasiswa.
-   Pembayaran harus terkait dengan tagihan.
-   Jangan menggunakan angka yang berubah acak setiap render; data harus
    stabil agar demo dapat dipercaya.
-   Jika membuat data sintetis, gunakan seed tetap.

------------------------------------------------------------------------

## 12. Perilaku Interaksi yang Wajib Berfungsi

Prototype dianggap interaktif jika perilaku berikut bekerja:

1.  Navigasi sidebar membuka halaman yang benar.
2.  Sub-menu dapat expand/collapse.
3.  Menu aktif ditandai.
4.  Pemilih role mengubah menu dan dashboard.
5.  Pemilih kampus/tahun akademik mengubah filter yang relevan.
6.  Pencarian dan filter tabel bekerja.
7.  Pagination bekerja.
8.  Tambah data membuka form/modal dan menyimpan record demo.
9.  Edit data mengubah record yang dipilih.
10. Detail menampilkan record yang benar.
11. Tombol hapus/nonaktif meminta konfirmasi.
12. Perubahan status memperbarui badge dan ringkasan.
13. Grafik dirender dari data demo.
14. Tabs dapat berganti konten.
15. Toast muncul setelah aksi.
16. Form wajib tervalidasi.
17. Reset demo mengembalikan data awal.
18. Ekspor CSV menghasilkan file lokal yang dapat diunduh.
19. Tombol cetak membuka halaman print-friendly atau dialog print.
20. Aksi integrasi eksternal selalu ditandai simulasi.
21. Ajukan registrasi mengubah status, riwayat, dan dashboard.
22. Tambah atau hapus mata kuliah mengubah draft dan indikator SKS.
23. Ajukan KRS yang gagal validasi menampilkan ringkasan kesalahan dan tidak mengubah status menjadi Menunggu Persetujuan Dosen Wali.
24. Keputusan dosen wali mengubah status di portal mahasiswa.
25. Cetak KRS memanggil `window.print()` tanpa sidebar.
26. Saklar kebijakan demo mengubah jalur status registrasi dan KRS.
27. Daftar Online publik menyimpan pendaftar ke antrean PMB dan menampilkan nomor pendaftaran.
28. Cek Status menampilkan record yang cocok atau keadaan kosong.
29. Portal dosen menolak akses kelas/nilai/dokumen di luar penugasan (pesan akses ditolak atau empty state).
30. Simpan materi/tugas/pengumuman hanya menulis metadata ke state demo; toast menjelaskan simulasi file.
31. Finalisasi nilai menolak jika total bobot ≠ 100% atau ada mahasiswa belum dinilai.
32. Koreksi nilai/presensi setelah kunci/final wajib alasan dan menambah baris riwayat.
33. Persetujuan KRS dosen wali hanya untuk mahasiswa pada `advisorAssignments` aktif.
34. Kartu KPI dashboard dosen membuka route detail yang sesuai (courses, assignments, grading, attendance, journal, advising, examination).

Jangan meninggalkan tombol utama sebagai elemen dekoratif tanpa
perilaku. Jika aksi belum dibuat, tampilkan pesan yang jelas.

------------------------------------------------------------------------

## 13. Router dan Pola URL

Gunakan hash routing sederhana tanpa server, contoh:

-   `#/dashboard/foundation`
-   `#/organization/campuses`
-   `#/organization/faculties`
-   `#/admissions/applicants`
-   `#/pmb`
-   `#/pmb/daftar`
-   `#/pmb/status`
-   `#/students`
-   `#/academic/curriculum`
-   `#/learning/krs`
-   `#/learning/grades`
-   `#/finance/invoices`
-   `#/finance/payments`
-   `#/finance/reports`
-   `#/budget/overview`
-   `#/hr/employees`
-   `#/assets`
-   `#/pddikti/validation`
-   `#/reports`
-   `#/settings/users`
-   `#/portal/student`
-   `#/portal/student/registration`
-   `#/portal/student/registration/history`
-   `#/portal/student/krs`
-   `#/portal/student/krs/edit`
-   `#/portal/student/krs/print`
-   `#/portal/student/khs`
-   `#/portal/student/transcript`
-   `#/portal/student/schedule`
-   `#/portal/student/calendar`
-   `#/portal/student/advisor`
-   `#/portal/student/finance/invoices`
-   `#/portal/student/finance/payments`
-   `#/learning/registration`
-   `#/academic/calendar`
-   `#/academic/advisors`
-   `#/portal/lecturer`
-   `#/portal/lecturer/courses`
-   `#/portal/lecturer/courses/:id`
-   `#/portal/lecturer/courses/:id/students`
-   `#/portal/lecturer/schedule`
-   `#/portal/lecturer/schedule/replacement`
-   `#/portal/lecturer/materials`
-   `#/portal/lecturer/materials/:courseId`
-   `#/portal/lecturer/assignments`
-   `#/portal/lecturer/assignments/create`
-   `#/portal/lecturer/assignments/:id`
-   `#/portal/lecturer/assignments/:id/submissions`
-   `#/portal/lecturer/grading`
-   `#/portal/lecturer/grading/:classId/components`
-   `#/portal/lecturer/grading/:classId/input`
-   `#/portal/lecturer/grading/:classId/final`
-   `#/portal/lecturer/attendance`
-   `#/portal/lecturer/attendance/:classId`
-   `#/portal/lecturer/journal`
-   `#/portal/lecturer/exam`
-   `#/portal/lecturer/advising`
-   `#/portal/lecturer/advising/krs`
-   `#/portal/lecturer/thesis`
-   `#/portal/lecturer/thesis/:studentId`
-   `#/portal/lecturer/examination`
-   `#/portal/lecturer/examination/:id`
-   `#/portal/lecturer/academic-advisor`
-   `#/portal/lecturer/announcements`
-   `#/portal/lecturer/reports`
-   `#/portal/lecturer/administration`
-   `#/portal/lecturer/profile`
-   `#/portal/parent`

Setiap route harus memiliki metadata: - `id` - `title` - `description` -
`icon` - `requiredRoles` - `organizationScope` - `render` atau
`pageModule`

Route yang tidak dikenal harus menampilkan halaman "Halaman tidak
ditemukan" yang memiliki tombol kembali ke dashboard.

------------------------------------------------------------------------

## 14. Format Halaman List, Form, dan Detail

### 14.1 Halaman list

Susunan: 1. Breadcrumb 2. Judul dan deskripsi 3. Tombol aksi utama 4.
KPI ringkas bila relevan 5. Filter/search 6. Tabel 7. Pagination 8.
Catatan data demo jika diperlukan

### 14.2 Form tambah/edit

-   Gunakan modal untuk form sederhana.
-   Gunakan halaman detail/form penuh untuk proses yang panjang.
-   Label dan placeholder harus jelas.
-   Tandai field wajib.
-   Validasi dilakukan sebelum simpan.
-   Tampilkan pesan kesalahan dekat field.
-   Tombol "Batal" tidak mengubah data.
-   Tombol "Simpan" menyimpan data ke state demo dan menampilkan toast.

### 14.3 Detail record

-   Header dengan nama/kode record dan badge status.
-   Aksi yang sesuai role.
-   Tab untuk kelompok informasi.
-   Timeline perubahan untuk proses yang memiliki alur.
-   Tombol kembali ke list mempertahankan filter jika memungkinkan.

------------------------------------------------------------------------

## 15. Grafik dan Visualisasi

Gunakan Chart.js untuk grafik yang relevan, bukan dekorasi semata.

Grafik yang diperlukan: - Line chart: tren mahasiswa atau penerimaan per
periode. - Bar chart: perbandingan kampus/fakultas. - Doughnut chart:
komposisi mahasiswa/status pembayaran. - Horizontal bar: piutang
berdasarkan umur atau program studi. - Bar berkelompok: anggaran vs
realisasi.

Ketentuan: - Judul dan satuan jelas. - Tooltip menampilkan nilai. -
Warna konsisten dengan design tokens. - Grafik berubah saat filter
berubah. - Sediakan ringkasan angka atau tabel alternatif agar informasi
tidak hanya bergantung pada grafik. - Hindari grafik yang terlalu banyak
dalam satu halaman.

------------------------------------------------------------------------

## 16. Notifikasi dan Aktivitas

Notifikasi demo dapat berisi: - Registrasi menunggu validasi, ditolak, atau teregistrasi - KRS menunggu persetujuan - KRS disetujui atau perlu revisi - Nilai belum
difinalisasi - Tagihan mendekati jatuh tempo - Pendaftar perlu
verifikasi - Pengajuan anggaran menunggu persetujuan - Data PDDIKTI
perlu perbaikan - Permintaan surat berubah status

Interaksi: - Klik notifikasi membuka halaman terkait. - Tandai dibaca
mengubah status lokal. - "Tandai semua dibaca" bekerja. - Tidak ada
email, SMS, atau WhatsApp sungguhan.

------------------------------------------------------------------------

## 17. Kriteria Penerimaan Prototype

Prototype diterima bila:

### Visual

-   [ ] Semua halaman memakai design system konsisten.
-   [ ] Sidebar, topbar, breadcrumb, tombol, tabel, badge, modal, dan
    toast konsisten.
-   [ ] Layout responsif pada desktop, tablet, dan mobile.
-   [ ] Tidak ada teks terpotong atau elemen bertumpuk.
-   [ ] Grafik memiliki judul, label, dan data yang masuk akal.

### Fungsional

-   [ ] Semua menu utama dapat dibuka.
-   [ ] Role demo mengubah menu dan lingkup tampilan.
-   [ ] Pencarian, filter, sortir, dan pagination berfungsi pada tabel
    utama.
-   [ ] CRUD demo tersedia minimal untuk kampus/program studi,
    mahasiswa, pendaftar, mata kuliah, tagihan, dan pegawai.
-   [ ] Alur PMB sampai konversi menjadi mahasiswa dapat didemokan.
-   [ ] Calon mahasiswa dapat mendaftar lewat `#/pmb/daftar` tanpa login staf dan muncul di Daftar Pendaftar.
-   [ ] Cek status `#/pmb/status` menampilkan status untuk nomor yang valid dan keadaan kosong untuk nomor yang tidak ada.
-   [ ] Alur registrasi semester, termasuk syarat yang gagal dan penolakan beralasan, dapat didemokan.
-   [ ] Alur KRS dari draft, bentrok, batas SKS, kelas penuh, persetujuan dosen wali, revisi, final, dan cetak dapat didemokan.
-   [ ] Alur presensi dan input nilai dapat didemokan.
-   [ ] Dosen wali tidak dapat membuka KRS di luar bimbingannya.
-   [ ] Alur tagihan dan catat pembayaran demo dapat didemokan.
-   [ ] Alur persetujuan anggaran dapat didemokan.
-   [ ] Validasi dan simulasi PDDIKTI dapat didemokan.
-   [ ] Perubahan tersimpan selama sesi melalui localStorage.
-   [ ] Reset data mengembalikan data seed.
-   [ ] Ekspor CSV bekerja minimal pada tabel utama.
-   [ ] Semua integrasi eksternal diberi label simulasi.

### Kualitas

-   [ ] Tidak ada error JavaScript di console saat alur normal.
-   [ ] Tidak ada tombol utama yang diam tanpa feedback.
-   [ ] Data relasional demo tetap konsisten.
-   [ ] README berisi cara menjalankan prototype.
-   [ ] `design.md` ini disertakan dalam folder proyek.

------------------------------------------------------------------------

## 18. Tahapan Implementasi yang Disarankan

Bangun secara bertahap agar AI coding agent tidak menghasilkan aplikasi
besar yang tidak konsisten.

### Tahap 1 --- Fondasi UI

-   Membuat struktur folder.
-   Membuat design tokens.
-   Membuat shell aplikasi: sidebar, topbar, breadcrumb, content
    container.
-   Membuat router hash.
-   Membuat role switcher.
-   Membuat komponen tabel, modal, toast, badge, filter.
-   Membuat data seed dan localStorage.

### Tahap 2 --- Dashboard dan Organisasi

-   Dashboard yayasan.
-   Dashboard kampus.
-   Dashboard fakultas/prodi.
-   Organisasi, kampus, fakultas, program studi, tahun akademik.

### Tahap 3 --- PMB dan Mahasiswa

-   Portal publik PMB (beranda, Daftar Online, Cek Status).
-   Dashboard PMB.
-   Daftar pendaftar dan detail.
-   Verifikasi dan seleksi demo.
-   Konversi pendaftar ke mahasiswa.
-   CRUD mahasiswa dan detail mahasiswa.

### Tahap 4 --- Akademik dan Pembelajaran

-   Kurikulum, mata kuliah, dan kalender.
-   Kelas dan jadwal.
-   Penugasan dosen wali.
-   Registrasi semester.
-   KRS, persetujuan dosen wali, dan cetak KRS.
-   Presensi.
-   Input/finalisasi nilai.
-   KHS/transkrip.

### Tahap 5 --- Keuangan dan Anggaran

-   Tagihan.
-   Pembayaran demo.
-   Piutang dan cicilan.
-   Dashboard keuangan.
-   Jurnal dan laporan demo.
-   Anggaran dan persetujuan.

### Tahap 6 --- SDM, Aset, dan PDDIKTI

-   Data pegawai dan payroll demo.
-   Aset dan pengadaan.
-   Validasi dan simulasi sinkronisasi PDDIKTI.

### Tahap 7 --- Portal dan Laporan

-   Portal mahasiswa.
-   Portal dosen.
-   Portal orang tua.
-   Laporan dan ekspor.
-   Audit log dan pengaturan.

### Tahap 8 --- Quality pass

-   Uji semua role.
-   Uji desktop/mobile.
-   Uji navigasi.
-   Uji form dan filter.
-   Uji reset localStorage.
-   Perbaiki error console.
-   Pastikan seluruh aksi memiliki feedback.

------------------------------------------------------------------------

## 19. Instruksi untuk AI Coding Agent

Gunakan dokumen ini sebagai spesifikasi utama. Implementasikan prototype
secara bertahap dan jangan mencoba menyelesaikan semua modul dengan satu
komponen generik yang hanya mengganti judul.

### Instruksi implementasi

1.  Baca seluruh `design.md` sebelum menulis kode.
2.  Buat aplikasi yang bisa dijalankan lokal tanpa backend.
3.  Gunakan HTML5, CSS3, JavaScript ES6+, Bootstrap 5.3, Bootstrap
    Icons, dan Chart.js.
4.  Implementasikan shell UI dan routing terlebih dahulu.
5.  Pisahkan data, state, komponen, dan halaman.
6.  Buat data demo yang konsisten dan fiktif.
7.  Implementasikan setiap halaman dengan struktur yang sesuai jenis
    pekerjaannya.
8.  Semua tombol dan aksi utama harus berfungsi atau memberi pesan yang
    jujur bahwa fitur belum tersedia.
9.  Jangan mengklaim integrasi PDDIKTI, pembayaran, email, atau layanan
    eksternal sudah nyata.
10. Jangan membuat backend, database server, autentikasi produksi, atau
    penyimpanan rahasia.
11. Jangan mengubah cakupan organisasi: aplikasi ini untuk satu yayasan
    dengan banyak kampus, fakultas, dan program studi.
12. Jangan membuat satu dashboard yang sama untuk semua role; dashboard
    harus relevan dengan role.
13. Gunakan format angka dan tanggal Indonesia.
14. Tambahkan README dengan langkah menjalankan aplikasi.
15. Setelah tiap tahap selesai, jalankan dan periksa console browser.
16. Jika konteks atau kebutuhan belum jelas, catat sebagai asumsi;
    jangan diam-diam menghapus modul dari spesifikasi.
17. Gunakan data sintetis dan hindari informasi pribadi nyata.

### Urutan hasil yang harus diserahkan

-   `index.html`
-   File CSS terstruktur
-   File JavaScript terstruktur
-   Data seed demo
-   `README.md`
-   `design.md`
-   Prototype yang bisa dijalankan lokal
-   Daftar fitur yang sudah berfungsi dan fitur yang masih berupa
    simulasi

------------------------------------------------------------------------

## 20. Hal yang Tidak Boleh Disalahartikan

-   **Prototype bukan sistem produksi.** Tidak ada jaminan keamanan,
    kepatuhan, akurasi akuntansi, atau integrasi resmi.
-   **Role demo bukan otorisasi nyata.** Pengamanan sebenarnya harus
    ditegakkan di backend.
-   **localStorage bukan database bersama.** Data hanya ada pada
    browser/perangkat yang digunakan.
-   **Pembayaran demo bukan transaksi keuangan.** Tidak ada dana yang
    dipindahkan.
-   **PDDIKTI demo bukan sinkronisasi resmi.** Integrasi sebenarnya
    memerlukan akses dan verifikasi teknis/operasional.
-   **Laporan keuangan demo bukan laporan resmi.** Aturan akuntansi,
    pajak, dan kebijakan yayasan perlu ditentukan terpisah.
-   **Akses orang tua harus dibatasi.** Implementasi produksi memerlukan
    kebijakan persetujuan dan privasi yang jelas.

------------------------------------------------------------------------

## 21. Keputusan yang Perlu Divalidasi Sebelum Produksi

Prototype dapat menggunakan asumsi sementara, tetapi keputusan berikut
harus divalidasi sebelum sistem produksi dibuat:

1.  Struktur hukum dan administrasi tiap institusi/kampus.
2.  Apakah kampus merupakan perguruan tinggi terpisah atau unit kampus
    dalam satu institusi.
3.  Struktur fakultas dan program studi.
4.  Kebijakan tahun akademik, semester, registrasi, cuti, mutasi,
    kelulusan.
5.  Formula penilaian, IPS/IPK, batas SKS, dan prasyarat mata kuliah.
6.  Struktur biaya kuliah, beasiswa, potongan, cicilan, dan denda.
7.  Bagan akun, kebijakan pengakuan pendapatan, anggaran, dan
    konsolidasi.
8.  Struktur SDM, payroll, pajak, BPJS, dan persetujuan.
9.  Aturan akses orang tua/wali.
10. Kebutuhan dan prosedur integrasi PDDIKTI.
11. Kebijakan retensi data, audit, backup, dan pemulihan.
12. Kebutuhan integrasi payment gateway, bank, email, SMS, dan WhatsApp.
13. Kebijakan keamanan, privasi, dan kepatuhan yang berlaku.
14. Apakah registrasi wajib sebelum KRS, dan apakah petugas harus menyetujui.
15. Apakah ada syarat keuangan, serta status tagihan yang dianggap memenuhi.
16. Rumus batas SKS, aturan mengulang mata kuliah, dan saat kuota kelas dikunci.
17. Apakah persetujuan dosen wali wajib, serta kapan KRS menjadi Final.
18. Apakah mahasiswa boleh membatalkan registrasi atau pengajuan KRS.
19. Apakah KRS boleh dicetak sebelum Final.
20. Apakah Daftar Online publik wajib akun atau verifikasi kontak dulu.
21. Apakah staf masih boleh menambah pendaftar manual selain jalur publik.
22. Batas penguncian presensi, siapa memublikasikan nilai, dan alur koreksi nilai (DEC-030, DEC-036, DEC-038).
23. Apakah materi terpublikasi boleh dihapus atau hanya diganti/nonaktif (DEC-031).
24. Alur persetujuan jadwal pengganti dan pengajuan administrasi dosen (DEC-032, DEC-041).
25. Rubrik sidang, wewenang keputusan sidang, dan status alur TA yang dapat dikonfigurasi (DEC-033–DEC-035).
26. Threshold mahasiswa berisiko untuk wali, batas file materi/tugas, dan hak dosen pengampu bersama (DEC-037, DEC-039, DEC-042).
27. Apakah menu Wali Akademik digabung dengan Bimbingan Akademik di UI produksi (DEC-040).

Butir 14–19 selaras dengan DEC-017 sampai DEC-027 pada `prd.md`.
Butir 20–21 selaras dengan DEC-028 dan DEC-029. Prototype Daftar Online
tidak mewajibkan akun; staf tetap dapat menambah pendaftar dari
back-office.
Butir 22–27 selaras dengan DEC-030 sampai DEC-042 (Portal Dosen).

------------------------------------------------------------------------

**Akhir dokumen.**

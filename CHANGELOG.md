# 📜 Changelog - Jurnal 7KAIH (SMP Negeri 2 Glagah)

Semua pembaruan, perbaikan, dan penambahan fitur aplikasi Jurnal Pembiasaan 7 Karakter Anak Indonesia Hebat (7KAIH) dicatat secara kronologis di bawah ini.

---

## [v0.6.0] - 2026-08-26 *(Multi-Period Aggregation & Hall of Fame)*

### 🌟 Fitur Baru & Peningkatan Strategis
- **Agregasi Rekap Multi-Periode Fleksibel**:
  - Filter evaluasi kinerja **Harian (Daily)**, **Mingguan (Weekly / 7 Hari)**, **Bulanan (Monthly)**, dan **1 Semester Penuh (Jul–Des / Jan–Jun)** untuk seluruh 18 rombel dan individu siswa.
  - Tersedia di Dashboard Wali Kelas, Dashboard Pimpinan (Kepsek/Waka/Kesiswaan/BK), dan Superadmin.
- **🌟 Hall of Fame: Apresiasi Siswa & Wali Kelas**:
  - **🔥 Siswa Terkonsisten (Streak Master)**: Menghitung streak pengisian beruntun tanpa jeda (Kategori: *3 Hari Berturut-turut*, *1 Minggu Beruntun*, *1 Bulan Penuh*, dan *1 Semester Legendaris 90+ Hari*).
  - **🚀 Siswa Ter-Effort (Most Improved)**: Mengapresiasi siswa dengan lonjakan progresivitas kepatuhan tertinggi ($+\Delta\%$) dari hari-hari sebelumnya.
  - **👑 Wali Kelas Ter-Istiqomah (Consistent Top Mentor)**: Menghargai wali kelas yang konsisten membawa kelas binaannya berada di papan atas klasemen sekolah dan membimbing siswa secara intensif.
  - **⚡ Wali Kelas Ter-Effort (Highest Class Growth)**: Menghargai wali kelas yang paling gigih mendongkrak kepatuhan dan keaktifan kelasnya ($+\Delta\%$ lonjakan terbesar).
- **Auto-Range Chunked Pagination**:
  - Mengimplementasikan penarikan data Supabase secara bertingkat (*multi-page range pagination*) untuk mengatasi limit default 1.000 baris PostgREST. Seluruh ribuan data riil dari hari-hari sebelumnya tetap tersaji 100% utuh tanpa terpotong.

---

## [v0.5.1] - 2026-08-25 *(Presisi Hisab Sholat Banyuwangi & Aturan Dhuhur)*

### 🕌 Penyesuaian & Koreksi Waktu Sholat
- **Engine Hisab Astronomis Banyuwangi**:
  - Menghitung jadwal 5 waktu sholat secara dinamis dan presisi berdasarkan titik koordinat SMPN 2 Glagah (Latitude -8.2192° S, Longitude 114.3691° E, Standar Kemenag RI).
- **Aturan Sholat Dhuhur Hari Minggu vs. Hari Sekolah**:
  - Hari Senin–Sabtu: Siswa sholat Dhuhur berjamaah di sekolah (target mandiri di rumah 4 waktu).
  - Hari Minggu: Dinilai 5 waktu penuh dari rumah (termasuk Dhuhur).
- **Koreksi Elevasi Sudut Ashar**:
  - Memperbaiki rumus hisab sudut matahari Ashar di atas ufuk sehingga rentang waktu valid berada tepat di `14.47 – 17.25 WIB`.

---

## [v0.5.0] - 2026-08-25 *(Diversifikasi Peran, Gamifikasi & Rapor Karakter)*

### 🏛️ Diversifikasi Tupoksi Peran
- **Kepala Sekolah**: 1-Klik Cetak Piagam Penghargaan Resmi Juara 1 Siswa & Rombel Teladan.
- **Waka Kurikulum**: Portofolio Khusus Kebiasaan #5 (Gemar Belajar & Literasi Buku).
- **Kesiswaan & Guru BK**: Radar Pembinaan Dini (*Early Warning Radar*) untuk siswa pasif $\ge 3$ hari, sering terlambat, atau terindikasi anomali foto.
- **Wali Kelas**: Catatan motivasi instan (*Quick Feedback Chips*) langsung ke profil siswa.

### 🎮 Gamifikasi & PWA
- **Sistem Lencana Kehormatan**: 13 badge pencapaian karakter (Early Bird, Night Guardian, Streak Hero, dll.).
- **PWA Ready**: Dukungan `manifest.json` agar aplikasi dapat diinstal di smartphone siswa dan guru layaknya aplikasi native.

### 📄 Rapor Karakter 7KAIH (Standar A4 Resmi)
- Format cetak A4 resmi lengkap dengan Kop SMPN 2 Glagah, nilai capaian predikat (A/B/C/D), deskripsi otomatis, serta kolom tanda tangan Wali Kelas, Kepala Sekolah, dan Orang Tua/Wali Murid.

---

## [v0.4.0] - 2026-08-24 *(Papan Peringkat, Export Excel & Integrasi Cloud)*

### 📊 Fitur Klasemen & Analitik
- **Papan Peringkat 18 Rombel (7A - 9F)**: Formula Skor Tertib berdasarkan persentase kepatuhan, siswa tuntas 7/7, dan minimnya pelanggaran foto.
- **Siswa Teladan Tercepat & Terbersih**: Filter ketat untuk menyaring murid terbaik harian dengan integritas foto 100%.
- **Export & Share**:
  - Export rekapitulasi kelas dan sekolah ke Microsoft Excel (`.xlsx`).
  - Bagikan ringkasan laporan langsung ke grup WhatsApp wali murid.

---

## [v0.3.0] - 2026-08-23 *(Integritas Foto EXIF & Anti-Fraud)*

### 🛡️ Validasi & Forensik Digital
- Pemeriksaan Metadata EXIF (*DateTimeOriginal*, *Software*, *Device Model*).
- Deteksi status waktu otomatis (*Tepat Waktu*, *Toleransi +15m*, *Terlambat*).
- Sistem deteksi foto mencurigakan (*Flag Anomali*) untuk mencegah kecurangan unggahan galeri lawas atau manipulasi jam HP.

---

## [v0.2.0] - 2026-08-22 *(Manajemen Akun & Basis Data)*

### 👥 Pengelolaan Siswa & Staf
- Manajemen akun 563 siswa dan 22 staf sekolah.
- Format default sandi tanggal lahir siswa (`DDMMYYYY`) dan kemudahan reset sandi oleh superadmin.
- Sinkronisasi realtime dengan Supabase PostgreSQL Database.

---

## [v0.1.0] - 2026-08-20 *(Inisiasi Proyek Jurnal 7KAIH)*

### 🚀 Fondasi Aplikasi
- Desain antarmuka modern, responsif, dan ramah pengguna dengan tema warna elegan.
- Implementasi 7 Kebiasaan Anak Indonesia Hebat (Bangun Pagi, Beribadah, Berolahraga, Makan Sehat, Gemar Belajar, Bermasyarakat, Tidur Cepat).
- Kompresi gambar client-side otomatis sebelum unggah ke cloud storage.

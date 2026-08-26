# 📜 Changelog - Jurnal 7 KAIH (SMP Negeri 2 Glagah)

Semua pembaruan, perbaikan, dan penambahan fitur aplikasi Jurnal 7 KAIH (7 Karakter Anak Indonesia Hebat) dicatat secara kronologis di bawah ini.

## [v0.9.0] - 2026-08-26 *(Pusat Piagam Penghargaan Kepala Sekolah: Multi-Periode & Kategori Prestasi Siswa / Guru)*

### 🌟 Fitur Baru & Peningkatan
1. **Penerbitan Piagam Multi-Periode Fleksibel (Kepala Sekolah)**:
   - Kepala Sekolah dapat menerbitkan dan mencetak sertifikat piagam penghargaan resmi untuk 4 rentang periode evaluasi: **📅 Harian (Daily)**, **🗓️ Mingguan (Weekly / 7 Hari)**, **📊 Bulanan (Monthly / 1 Bulan Penuh)**, dan **🏛️ Semester (Semester Ganjil & Genap)**.
2. **Diversifikasi Kategori Piagam Prestasi Siswa**:
   - 🌟 **Siswa Teladan Terdisiplin**: Capaian ketuntasan 100% dan integritas bukti foto asli valid.
   - 🔥 **Siswa Terkonsisten (Streak Master)**: Rekor hari pengisian berturut-turut terpanjang tanpa terputus.
   - 🚀 **Siswa Ter-Effort (Most Improved)**: Lonjakan pertumbuhan dan daya juang kepatuhan karakter tertinggi ($+\Delta\%$).
   - 📖 **Duta Literasi 7KAIH (Gemar Belajar #5)**: Siswa paling aktif menuliskan refleksi bacaan dan pembelajaran bermutu tinggi.
   - 🤝 **Bintang Karakter Sosial (Bermasyarakat #6)**: Keaktifan gotong royong dan kontribusi sosial teraktif.
   - 🏃 **Bintang Kebugaran & Olahraga (Berolahraga #3)**: Kedisiplinan berolahraga dan menjaga kebugaran fisik jasmani.
3. **Kategori Piagam Prestasi Kelas & Pendidik / Wali Kelas**:
   - 👑 **Kelas Juara 1 Terdisiplin**: Kelas dengan Skor Tertib dan persentase kepatuhan kolektif tertinggi pada periode tersebut.
   - 🥇 **Wali Kelas Ter-Istiqomah**: Wali kelas pembina yang konsisten mendampingi kelasnya di peringkat atas klasemen.
   - ⚡ **Wali Kelas Ter-Effort (Highest Growth)**: Wali kelas dengan lonjakan pertumbuhan kepatuhan siswa terbesar ($+\Delta\%$).
   - 💬 **Wali Kelas Paling Responsif & Inspiratif**: Pendidik paling aktif memberikan pendampingan, arahan, dan feedback motivasi harian.
4. **Penerbitan Piagam Kustom Fleksibel**:
   - Formulir penerbitan piagam kustom untuk memilih siswa, guru/staf, atau rombel kelas tertentu di luar sistem pemenang otomatis dengan kustomisasi judul, nomor surat resmi, kategori, dan deskripsi apresiasi.
5. **Format Cetak A4 Landscape Standar Resmi**:
   - Desain sertifikat bernuansa emas elegan dengan ornamen ganda, watermark garuda/bintang karakter, nomor surat dinamis, badge kategori, dan tanda tangan Kepala Sekolah.

---

## [v0.8.0] - 2026-08-26 *(Branding Resmi Jurnal 7 KAIH, Suara & Curhat Siswa, Date Range Picker, & Bulk Reminder WA)*

### 🌟 Fitur Baru & Peningkatan
1. **Branding Resmi & Standarisasi Aplikasi (`Jurnal 7 KAIH`)**:
   - Menstandarkan seluruh antarmuka, navbar, footer, login view, dashboard router, modal rapor, header ekspor Excel, dan format WhatsApp ke nama resmi **Jurnal 7 KAIH**.
2. **Kotak Aspirasi & Curhat Siswa ("Suara Siswa")**:
   - Siswa dapat mengirimkan curhatan pembiasaan, keluhan kendala teknis/kehidupan, maupun ide/saran inovasi aplikasi secara opsional setiap hari melalui modal interaktif.
   - **Privasi Terproteksi (Anonim)**: Wali Kelas, Kepala Sekolah, Waka Kurikulum, dan Kesiswaan membaca pesan dengan label *"Siswa Kelas [Rombel] (Anonim)"* dan dapat memberikan tanggapan resmi yang langsung muncul di dashboard siswa.
   - **Audit Superadmin**: Hanya Superadministrator yang memiliki hak khusus untuk melihat nama dan NISN asli siswa demi keamanan dan pembinaan terarah.
3. **Date Range Picker Kustom pada Evaluasi Progress**:
   - Pemilihan rentang tanggal fleksibel (*Start Date s.d. End Date*) dengan tombol preset cepat (*Hari Ini*, *7 Hari Terakhir*, *30 Hari Terakhir*, *Bulan Ini*, *1 Semester Penuh*).
   - Menghilangkan tab Peringkat 18 Kelas yang duplikat pada tab Progress agar Leaderboard tetap fokus dan eksklusif di tab klasemen.
4. **Peringatan Massal (Bulk Reminder) Siswa Pasif via WhatsApp & In-App**:
   - **Superadmin, KS, Kurikulum, Kesiswaan**: Tombol *Bulk Peringatan ke Semua Wali Kelas* yang otomatis mengirimkan arahan in-app serentak dan membuat template WhatsApp broadcast lengkap dengan rincian nama siswa per kelas.
   - **Wali Kelas**: Tombol *📢 Ingatkan Semua via WA* langsung di banner peringatan siswa pasif 3 hari berturut-turut untuk menyalin format pengingat ke grup kelas/wali murid.

---

## [v0.7.0] - 2026-08-26 *(Superadmin Rename, Radar Inactivity 3 Hari, & Student Progress Dashboard)*

### 🌟 Fitur Baru & Pembaruan
1. **Fitur Rename & Edit Data Lengkap Guru / Siswa (Khusus Superadmin)**:
   - Superadmin dapat me-rename nama, memperbarui NISN/NIP, mengubah rombel kelas, atau memperbarui data staf dan siswa secara instan melalui modal `EditUserModal`.
   - Perubahan langsung tersinkronisasi realtime ke Supabase Cloud (`siswa` dan `staf_sekolah`) serta lokal store.
2. **Radar & Laporan Siswa Tidak Mengisi Jurnal 3 Hari Berturut-turut**:
   - Deteksi otomatis siswa pasif yang tidak memiliki satupun entri selama 3 hari terakhir secara berturut-turut.
   - Dilengkapi **sebaran per 18 kelas (7A–9F)**, rincian tanggal terakhir mengisi, dan tombol **Export Laporan Excel (.xlsx)**.
   - Akses menyeluruh lintas role: **Superadmin**, **Kepala Sekolah**, **Kesiswaan & BK**, **Waka Kurikulum**, serta **Wali Kelas** (dengan *Alert Warning Card* khusus kelasnya).
3. **Dashboard Gambaran Lengkap Progress Siswa (`StudentProgressOverview`)**:
   - Visualisasi distribusi tingkat kepatuhan siswa (🌟 *7/7 Tuntas Sempurna*, 🟢 *5-6 Sangat Aktif*, 🟡 *3-4 Cukup Aktif*, 🔴 *Belum Mengisi*).
   - Capaian partisipasi per 7 Kebiasaan Resmi Kemendikdasmen.
   - Peringkat & persentase kepatuhan 18 rombongan belajar (7A s.d 9F).
4. **Refleksi Literasi Gemar Belajar (Wajib Min. 100 Kata)**:
   - Menerapkan validasi wajib cerita refleksi minimal 100 kata pada kebiasaan #5 (Gemar Belajar) dengan *live word counter badge*, *progress bar*, dan pemantik kalimat singkat.

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

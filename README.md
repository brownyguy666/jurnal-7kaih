# 🇮🇩 Jurnal 7 Kebiasaan Anak Indonesia Hebat (7 KAIH)
### SMP Negeri 2 Glagah — Banyuwangi, Jawa Timur
> **Versi: `v0.7.0` (Official Production)**  
> Platform Web Pencatatan & Evaluasi Pembiasaan Karakter Luhur Peserta Didik Berbasis Cloud Database Realtime.

---

## 📌 Identitas Satuan Pendidikan
- **Nama Sekolah**: SMP Negeri 2 Glagah
- **NPSN**: 20525649
- **Bentuk Pendidikan**: SMP (Negeri)
- **Akreditasi**: A
- **Jumlah Rombel**: 18 Kelas (Kelas 7A s.d. 9F)
- **Total Siswa Riil**: 563 Siswa
- **Total Pendidik & Staf**: 22 Pengguna (Superadmin, Kepala Sekolah, Waka Kurikulum, Kesiswaan, 18 Wali Kelas)
- **Alamat**: Jl. Kenjo No.45, Glagah, Kec. Glagah, Kab. Banyuwangi, Jawa Timur 68432
- **Website Resmi**: [https://smpnegeri2glagah.sch.id/](https://smpnegeri2glagah.sch.id/)

---

## 🎯 7 Kebiasaan Resmi Kemendikdasmen RI
Sistem mencatat pembiasaan siswa dengan urutan baku resmi Kementerian Pendidikan Dasar dan Menengah RI:
1. **Bangun Pagi** *(Target Ideal: 04.00 – 05.30 WIB)*
2. **Beribadah** *(Sholat 5 Waktu: Subuh, Dzuhur, Ashar, Maghrib, Isya / Ibadah Keagamaan)*
3. **Berolahraga** *(Minimal 15–30 menit pembiasaan fisik sehat)*
4. **Makan Sehat dan Bergizi** *(Maksimal 2x input per hari)*
5. **Gemar Belajar** *(Membaca buku, mengulang pelajaran, eksplorasi pengetahuan)*
6. **Bermasyarakat** *(Aktivitas gotong royong, sosial, membantu sesama dengan nama kegiatan)*
7. **Tidur Cepat** *(Target Ideal: 20.00 – 22.00 WIB, batas toleransi s.d. 22.15 WIB)*

---

## ⏰ Jam Operasional Pengisian Jurnal Harian
- **Jendela Pengisian Aktif**: Setiap hari dibuka mulai **pukul 01.00 WIB s.d. 24.00 WIB** (23:59:59).
- **Jeda Pergantian Tanggal**: Pukul 00.00 – 01.00 WIB sistem membatasi submisi dengan notifikasi informatif untuk sinkronisasi harian server.
- **Evaluasi Ketepatan Waktu Realtime**:
  - 🟢 **Tepat Waktu**: Sesuai jam target ideal kebiasaan.
  - 🟡 **Toleransi**: Masuk dalam rentang toleransi (+15 menit).
  - 🔴 **Terlambat / Kemalaman**: Melewati batas jam ideal & toleransi.
  - ⚪ **Selesai**: Untuk kebiasaan dengan waktu fleksibel sepanjang hari.

---

## 👥 Multi-Role & Hak Akses Pengguna

### 1. 🎓 Peserta Didik (Siswa — 563 Siswa)
- **Login**: Menggunakan **NISN** (10 digit).
- **Password Default**: Tanggal Lahir format `DDMMYYYY` (misal: `12042011`).
- **Fitur**:
  - Input jurnal harian 7 kebiasaan secara mandiri.
  - Bukti foto langsung kamera (`capture="environment"`) atau unggah galeri.
  - **Anti-Kecurangan EXIF**: Deteksi otomatis tanggal pengambilan foto asli (`DateTimeOriginal`) via `exifr`. Foto tangkapan layar/WhatsApp diberi tanda `flag_foto_mencurigakan` tanpa memblokir pengiriman.
  - **Kompresi Client-Side**: Otomatis dikompresi (< 1MB) sebelum diunggah ke cloud storage.
  - **Pesan Apresiasi Guru**: Menampilkan kartu notifikasi motivasi dan pesan pembinaan dari wali kelas/guru di dashboard utama.

### 2. 👨‍🏫 Wali Kelas (18 Rombel: 7A – 9F)
- **Login**: Menggunakan **NIP / NIK / Username**.
- **Password Default**: Tanggal Lahir format `DDMMYYYY`.
- **Fitur**:
  - Matriks rekapitulasi harian siswa di kelas binaan.
  - Inspeksi detail entri jurnal, preview foto resolusi tinggi, dan metadata EXIF.
  - **Beri Feedback & Motivasi Siswa**: Tombol feedback cepat per siswa lengkap dengan pilihan template motivasi siap pakai.
  - **Moderasi & Hapus Entri**: Wali kelas dapat menghapus entri tidak valid disertai alasan wajib yang tercatat dalam audit log (`log_hapus`).
  - **Export & Share**: Cetak laporan format Excel (`.xlsx`) via SheetJS atau bagikan rekap ke WhatsApp wali murid.

### 3. 🏛️ Pimpinan Sekolah (Kepala Sekolah, Waka Kurikulum, Kesiswaan)
- **Login**: Menggunakan **NIP / NIK**.
- **Password Default**: Tanggal Lahir format `DDMMYYYY`.
- **Fitur**:
  - **Executive Overview**: Pantau metrik kepatuhan 563 siswa di 18 rombel secara realtime.
  - **Arahan & Feedback Kelas**: Mengirimkan instruksi dan feedback resmi kepada wali kelas dengan 4 kategori (*Apresiasi*, *Evaluasi*, *Instruksi*, *Tindak Lanjut*).
  - **Laporan Drill-Down 18 Kelas (Ikon Mata 👁️)**: Membuka modal inspeksi detail rekapitulasi per kelas lengkap dengan foto bukti dan persentase kehadiran.

### 4. 🔑 Super Administrator
- **Login**: `ajibaguskhoiri` / Password: `••••••`
- **Fitur Tertinggi**:
  - **Password Manager**: Melihat semua password siswa & staf secara transparan (dengan *show/hide eye toggle*), menyalin password, serta mengganti/mereset password langsung ke database Supabase Cloud.
  - **Import Massal Dapodik/Excel**: Unggah dan sinkronkan data siswa & staf baru via file Excel/CSV dengan pemetaan kolom cerdas.
  - **Konfigurasi 7 Kebiasaan**: Kustomisasi jam target, toleransi waktu, dan kuota input harian untuk setiap butir kebiasaan.
  - **Monitoring 18 Rombel**: Laporan lengkap per kelas dengan fitur drill-down modal dan reset data.

---

## 🛠️ Arsitektur & Tech Stack

| Komponen | Teknologi yang Digunakan |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript + Vite |
| **Styling & UI** | Tailwind CSS + Lucide React Icons |
| **Cloud Database** | PostgreSQL via Supabase Cloud (RLS Active) |
| **Storage Bukti Foto** | Supabase Storage Bucket (`bukti_foto`) |
| **Anti-Kecurangan** | `exifr` (EXIF Metadata Reader) |
| **Image Compression** | HTML5 Canvas Client-Side Compressor |
| **Spreadsheet Engine** | `xlsx` (SheetJS) |
| **Visual Effects** | `canvas-confetti` |

---

## 🚀 Panduan Menjalankan Proyek

### 1. Instalasi Lokal
```bash
# Clone repository
git clone https://github.com/brownyguy666/jurnal-7kaih.git
cd jurnal-7kaih

# Install dependensi
npm install

# Buat file environment (.env)
cp .env.example .env
```

Isi file `.env` dengan kredensial Supabase Anda:
```env
VITE_SUPABASE_URL=https://xxeegyireqgxshtazkzh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Jalankan server development:
```bash
npm run dev
```
Akses di browser: `http://localhost:5173`

### 2. Build untuk Produksi
```bash
npm run build
```

---

## ☁️ Deployment ke Vercel
1. Hubungkan repository GitHub `brownyguy666/jurnal-7kaih` ke [Vercel](https://vercel.com).
2. Konfigurasikan **Environment Variables** di Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Vercel akan melakukan *Automatic Deployment* setiap kali ada push ke branch `main`.

---

## 📜 Riwayat Rilis & Revisi

### `v0.4.0` (Revisi 04 — Current)
- 🏆 **Sistem Perangkingan Harian (Leaderboard 18 Kelas)**: Evaluasi otomatis setelah pukul 24.00 WIB menghitung Skor Tertib Kelas berdasarkan persentase kepatuhan 7 kebiasaan, rasio siswa tuntas 100%, dan minimnya anomali foto.
- 🌟 **Siswa Teladan Tercepat & Terbersih**: Algoritma kurasi murid terbaik yang menyelesaikan seluruh 7 kebiasaan paling awal dengan **100% foto asli sinkron (bebas peringatan EXIF)** dan **tepat waktu** saat Bangun Pagi (04.00–05.00) dan Tidur Cepat (20.00–22.00).
- 📊 **Dashboard Grafik Dinamis Superadmin**: Visualisasi interaktif meliputi Animated Horizontal Bar Chart 18 Kelas, Komparasi Tingkat 7 vs 8 vs 9, Grafik Pemenuhan 7 Kebiasaan Sekolah, dan Pengukur Integritas Foto EXIF.
- 🥇 **Podium Juara 3D/Glassmorphic**: Visualisasi podium penghargaan Juara 1 (Gold), Juara 2 (Silver), dan Juara 3 (Bronze) untuk kelas terdisiplin dan siswa teladan.
- 📥 **Export Excel 2-Sheet & WhatsApp Broadcast**: Ekspor laporan klasemen harian ke Excel (.xlsx) dan format broadcast pengumuman resmi ke WhatsApp grup sekolah.
- 🛠️ **Penyelarasan Dinamis Wali Kelas & Supabase**: Perbaikan integrasi relasi dua arah wali kelas (`wali_kelas_id` & `kelas_id`), memastikan guru (seperti Wali Kelas 7F) memuat data 31 siswa dan entri jurnal Supabase secara realtime dan dinamis.

### `v0.3.1` (Revisi 03)
- ⏰ **Jam Operasional Harian**: Penetapan jendela input jurnal setiap hari pukul **01.00 – 24.00 WIB** disertai pesan notifikasi jeda pergantian hari (00.00 – 01.00 WIB).
- 💬 **Feedback Siswa Realtime**: Penambahan tombol feedback langsung pada tabel rekap wali kelas & pimpinan beserta template apresiasi cepat yang langsung tampil di HP siswa.
- 🔑 **Superadmin Password Manager**: Fitur melihat password aktif (show/hide toggle) dan modal ubah/reset password siswa & staf langsung tersinkron ke Supabase Cloud.
- 👁️ **Perbaikan Laporan Per Kelas (Gambar Mata)**: Integrasi modal drill-down rekapitulasi kelas interaktif untuk Superadmin, Kepala Sekolah, Kurikulum, dan Kesiswaan.
- 📄 **Pembaruan Dokumentasi README.md**: Dokumentasi lengkap seluruh alur sistem, identitas sekolah, kredensial, dan konfigurasi teknis.

### `v0.3.0` (Revisi 02)
- ☁️ **Migrasi 100% Supabase Cloud**: Seluruh 563 siswa riil dan 22 guru/staf SMPN 2 Glagah tersimpan penuh di database cloud Supabase dengan optimasi RLS policies.
- 📱 **Sinkronisasi Multi-Perangkat**: Pengisian jurnal dari HP langsung sinkron ke dashboard wali kelas di komputer sekolah secara realtime.
- 👥 **Struktur 18 Rombel**: Konfigurasi lengkap rombongan belajar Kelas 7A s.d. 9F.

### `v0.2.0` (Revisi 01)
- 📊 **Executive Dashboard**: Panel monitoring khusus Kepala Sekolah, Waka Kurikulum, dan Kesiswaan dengan fitur Arahan Wali Kelas.
- 📸 **EXIF Analyzer & Image Compressor**: Proteksi kecurangan tanggal foto galeri dan kompresi otomatis client-side.
- 📤 **Export Excel & WhatsApp**: Pembuatan modul export SheetJS dan integrasi share WhatsApp.

### `v0.1.0` (Inisiasi)
- 🇮🇩 Implementasi awal 7 Kebiasaan Anak Indonesia Hebat Kemendikdasmen RI dengan autentikasi multi-role.

---

## 🏫 Hak Cipta & Pengembang
Dikelola dan dioperasikan oleh Tim IT **SMP Negeri 2 Glagah**, Banyuwangi, Jawa Timur.  
*Program Penguatan Pendidikan Karakter — Kementerian Pendidikan Dasar dan Menengah Republik Indonesia.*

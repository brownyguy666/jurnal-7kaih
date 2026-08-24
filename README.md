# 🇮🇩 Jurnal 7 Kebiasaan Anak Indonesia Hebat (Digital)

Aplikasi web pencatatan harian pelaksanaan **7 Kebiasaan Resmi Kemendikdasmen RI** untuk SMP (Kelas VII, 32 Siswa):
1. **Bangun Pagi** (04.00–05.00 WIB)
2. **Beribadah** (Sholat 5 Waktu: Subuh, Dzuhur, Ashar, Maghrib, Isya)
3. **Berolahraga** (Minimal 15-30 menit)
4. **Makan Sehat dan Bergizi** (Maksimal 2x/hari)
5. **Gemar Belajar** (Membaca & mengulang materi)
6. **Bermasyarakat** (Aktivitas sosial & gotong royong dengan nama kegiatan)
7. **Tidur Cepat** (20.00–22.00 WIB, toleransi s.d 22.15 WIB)

---

## 🚀 Fitur Utama

- **Pencatatan Terpisah Sepanjang Hari**: Siswa membuka aplikasi setiap kali menyelesaikan kebiasaan tertentu.
- **Bukti Foto & Anti-Kecurangan EXIF**:
  - *Kamera Langsung*: Menggunakan atribut `capture="environment"`, mencatat timestamp otomatis saat foto diambil (`sumber_foto='kamera'`).
  - *Unggah Galeri*: Membaca metadata EXIF (`DateTimeOriginal`) secara otomatis menggunakan library `exifr`. Jika tanggal foto berbeda dari hari ini atau metadata tidak ditemukan (foto WhatsApp/screenshot), sistem memberikan tanda `flag_foto_mencurigakan` tanpa memblokir pengiriman.
- **Kompresi Foto Otomatis**: Foto dikompresi di sisi client (< 1MB) menggunakan HTML5 Canvas setelah pembacaan EXIF selesai.
- **Multi-Role & Hak Akses Ketat (Row Level Security)**:
  1. **Siswa** — Login menggunakan **NISN**, password default tanggal lahir `DDMMYYYY`. Hanya dapat melihat dan menulis jurnal miliknya.
  2. **Wali Kelas** — Login menggunakan **NIP/NIK**, akses ke kelas yang diampu (Kelas VII-A), matriks rekap harian, detail foto & EXIF, feedback siswa, dan moderasi hapus entri dengan audit log (`log_hapus`).
  3. **Kepala Sekolah, Waka Kurikulum, Kesiswaan** — Login menggunakan **NIP**, akses laporan rekap lintas kelas di seluruh sekolah (Read-Only).
- **Export & Share**:
  - Export laporan resmi format Excel (`.xlsx`) via **SheetJS**.
  - Bagikan ringkasan ke **WhatsApp** wali murid via Web Share API atau direct URL.
- **Mode Demo / Standalone Terintegrasi**: Aplikasi dapat langsung diuji coba 100% out of the box lengkap dengan 32 siswa Kelas VII-A dan data simulasi.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (Vite) + TypeScript + Tailwind CSS
- **Icons**: Lucide React
- **Backend & Auth**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **EXIF Inspector**: `exifr`
- **Spreadsheet**: `xlsx` (SheetJS)
- **Visuals**: `canvas-confetti`

---

## 📦 Menjalankan Proyek di Lokal

1. **Clone repository**:
   ```bash
   git clone <URL_REPO_GITHUB>
   cd jurnal-7kaih
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment (Opsional untuk Supabase Live)**:
   Salin `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```
   Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.

4. **Jalankan server development**:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:5173` di browser Anda.

---

## 🗄️ Setup Database Supabase

Jika ingin menghubungkan ke project Supabase baru:

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan buat project baru.
2. Masuk ke menu **SQL Editor**.
3. Buka file [`supabase/schema.sql`](file:///d:/jurnal-7kaih/supabase/schema.sql) dan jalankan query untuk membuat tabel, RLS policy, dan storage bucket `bukti_foto`.
4. Buka file [`supabase/seed.sql`](file:///d:/jurnal-7kaih/supabase/seed.sql) dan jalankan query untuk mengisi data awal (7 kebiasaan, staf, dan 32 siswa Kelas VII-A).
5. Salin URL dan anon key dari menu **Project Settings -> API** ke file `.env` lokal Anda.

---

## ☁️ Panduan Deploy ke Vercel

1. Push kode Anda ke repository GitHub.
2. Buka [Vercel Dashboard](https://vercel.com) dan klik **Add New Project**.
3. Import repository GitHub `jurnal-7kaih`.
4. Pada bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Klik **Deploy**. Selesai!

---

## 🔄 Alur Kerja Multi-Lokasi (Rumah & Sekolah)

Agar project dapat dikerjakan secara fleksibel dari komputer manapun:

1. **GitHub adalah versi utama**: Anggap repo GitHub sebagai data asli. Folder di laptop/komputer hanya salinan lokal.
2. **Di komputer baru / lokasi lain**:
   - Clone repo: `git clone <URL_REPO>`
   - Jalankan `npm install`
   - Buat file `.env` dan salin kredensial Supabase dari Vercel / Supabase Dashboard.
3. **Sebelum mulai bekerja**:
   - Jalankan `git pull` (atau klik tombol Sync di Antigravity Source Control) untuk mengambil perubahan terbaru.
4. **Setelah selesai bekerja**:
   - Lakukan `git add .`, `git commit -m "pesan update"`, dan `git push` (atau gunakan panel Source Control).
5. **Peringatan**: Jangan meletakkan folder project di dalam Google Drive / Dropbox sync folder agar tidak terjadi file lock atau corrupt pada git database.

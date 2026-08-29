# 📖 Panduan Praktis Replikasi Aplikasi Jurnal 7KAIH untuk Sekolah Lain
### Panduan Langkah Demi Langkah bagi Operator Sekolah / Guru TIK

Panduan ini disusun untuk mempermudah sekolah lain yang ingin mereplikasi dan menjalankan aplikasi **Jurnal 7 Kebiasaan Anak Indonesia Hebat (7KAIH)** secara mandiri dengan database, domain, dan identitas sekolah masing-masing tanpa biaya langganan server (**100% Gratis menggunakan Supabase & Vercel Free Tier**).

---

## ⏱️ Estimasi Waktu Pengerjaan: 10 - 15 Menit

---

## 🛠️ Langkah 1: Buat Database Supabase (3 Menit)

1. Buka [https://supabase.com](https://supabase.com) dan klik **Start your project** (Bisa login dengan akun Google/GitHub).
2. Klik **New project**:
   - **Name**: `Jurnal 7KAIH - [Nama Sekolah Anda]` (Contoh: `Jurnal 7KAIH - SMPN 1 Giri`)
   - **Database Password**: Buat password yang kuat (simpan di catatan Anda).
   - **Region**: Pilih **Singapore (`ap-southeast-1`)** agar akses dari Indonesia super cepat.
   - Klik **Create new project** dan tunggu 1-2 menit hingga status database aktif (*Green*).
3. Di bilah menu sebelah kiri, klik icon **SQL Editor** (icon `>_`).
4. Klik tombol **New query**.
5. Buka file [`supabase/SETUP_SEKOLAH_BARU.sql`](supabase/SETUP_SEKOLAH_BARU.sql) di repositori ini, **Copy seluruh isinya**, lalu **Paste** ke editor query Supabase.
6. Klik tombol hijau **Run** di pojok kanan bawah editor (atau tekan `Ctrl + Enter`).
   - *Status: "Success. No rows returned."* $\to$ Berarti seluruh tabel, keamanan RLS, 7 kebiasaan resmi, dan akun admin perdana sudah selesai dibuat secara otomatis!
7. Ambil Kunci API Supabase:
   - Klik menu **Project Settings** (icon gerigi di pojok kiri bawah) $\to$ pilih sub-menu **API**.
   - Salin dan simpan 2 informasi penting ini:
     1. **Project URL** (Contoh: `https://xyzabcdefg.supabase.co`)
     2. **Project API keys: `anon` / `public`** (String panjang berisi token)

---

## 🚀 Langkah 2: Deploy ke Vercel (5 Menit)

1. **Fork Repositori**:
   - Buka halaman GitHub repositori ini: [https://github.com/brownyguy666/jurnal-7kaih](https://github.com/brownyguy666/jurnal-7kaih)
   - Klik tombol **Fork** di pojok kanan atas untuk menyalin repositori ke akun GitHub sekolah Anda.
2. **Deploy di Vercel**:
   - Buka [https://vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
   - Klik tombol **Add New...** $\to$ pilih **Project**.
   - Pada daftar repositori, pilih repo hasil fork (`jurnal-7kaih`) lalu klik **Import**.
3. **Masukkan Environment Variables**:
   - Sebelum klik deploy, buka bagian **Environment Variables** (accordion di bawah *Build and Output Settings*).
   - Tambahkan 2 variabel yang didapat dari Langkah 1 tadi:
     | Key (Nama Variabel) | Value (Nilai) |
     | :--- | :--- |
     | `VITE_SUPABASE_URL` | *Paste Project URL dari Supabase* |
     | `VITE_SUPABASE_ANON_KEY` | *Paste Anon Key dari Supabase* |
4. Klik tombol **Deploy**!
   - Tunggu sekitar 1 menit hingga proses build selesai dan muncul kembang api ucapan selamat dari Vercel.
   - Website jurnal sekolah Anda sekarang sudah aktif dan dapat diakses publik!

---

## 🌐 Langkah 3: Menautkan Domain Sekolah (Opsional - `sch.id`)

Agar alamat web sekolah terlihat resmi dan profesional (misalnya `jurnal.smpn1giri.sch.id`):
1. Di dashboard proyek Vercel Anda, buka tab **Settings** $\to$ pilih **Domains**.
2. Ketik subdomain yang diinginkan, misalnya `jurnal.namasekolah.sch.id`, lalu klik **Add**.
3. Buka cPanel / DNS Manager pengelola domain sekolah Anda, lalu tambahkan DNS Record:
   - **Type**: `CNAME`
   - **Name**: `jurnal`
   - **Target / Value**: `cname.vercel-dns.com`
4. Tunggu beberapa menit hingga sertifikat SSL (HTTPS) aktif otomatis.

---

## 🔑 Langkah 4: Login Perdana Superadmin & Setup Data Sekolah

1. Buka website jurnal sekolah Anda yang baru saja aktif.
2. Di halaman login, pilih tab **"Superadmin"**:
   - **Username**: `admin`
   - **Password**: `admin123` *(atau tanggal lahir: `01011990`)*
3. Setelah berhasil masuk ke Dashboard Superadmin:
   - Masuk ke tab **"Kelola, Rename & Password Staf"** $\to$ Edit akun `Super Administrator Sekolah` untuk mengganti nama Anda dan memperbarui password baru yang aman.
   - Masuk ke tab **"Kelola, Rename & Password Siswa"** $\to$ Klik tombol **"Import Siswa (CSV/Excel)"** untuk memasukkan data seluruh siswa sekolah Anda dari Dapodik secara massal.
   - 🎯 **Penyesuaian Rombel Otomatis**: Berapa pun jumlah rombel sekolah Anda (misal **3 rombel**, **6 rombel**, **12 rombel**, **18 rombel**, atau **24 rombel**), sistem akan **secara otomatis membaca nama-nama kelas di file Excel Anda**, membuat kelas baru yang belum ada, dan membersihkan kelas kosong lama jika Anda mencentang opsi *"Otomatis sesuaikan rombel"*.
   - Buat akun staf untuk Kepala Sekolah, Waka Kurikulum, Kesiswaan, Guru BK, dan Wali Kelas sesuai rombel yang Anda miliki.

---

## ⚙️ Langkah 5: Penyesuaian Nama Sekolah & Titik Koordinat Sholat

File profil sekolah tersimpan di file: [`src/lib/schoolProfile.ts`](src/lib/schoolProfile.ts)
Operator dapat mengedit file tersebut langsung di GitHub untuk menyesuaikan:
- Nama Sekolah & NPSN
- Alamat & Kabupaten/Kota
- **Latitude & Longitude**: Agar hisab jadwal sholat 5 waktu dinamis mengacu presisi ke lokasi astronomis kota sekolah Anda!

---

### 🎉 Selesai!
Sekolah Anda sekarang memiliki platform digital mandiri untuk memantau pembiasaan karakter 7KAIH bagi seluruh peserta didik! Jika ada kendala, silakan diskusikan melalui tab *Issues* di repositori ini.

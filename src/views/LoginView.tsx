import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  UserCheck, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Info
} from 'lucide-react';
import { SCHOOL_PROFILE } from '../lib/schoolProfile';

export const LoginView: React.FC = () => {
  const { loginSiswa, loginStaf, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'siswa' | 'staf'>('siswa');

  // Siswa state
  const [nisn, setNisn] = useState('');
  const [siswaPassword, setSiswaPassword] = useState('');

  // Staf state
  const [nipNik, setNipNik] = useState('');
  const [stafPassword, setStafPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSiswaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nisn.trim()) {
      setErrorMessage('Silakan masukkan NISN Anda.');
      return;
    }
    if (!siswaPassword) {
      setErrorMessage('Silakan masukkan password.');
      return;
    }

    const res = await loginSiswa(nisn.trim(), siswaPassword);
    if (!res.success) {
      setErrorMessage(res.message || 'Gagal login sebagai Siswa.');
    }
  };

  const handleStafSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nipNik.trim()) {
      setErrorMessage('Silakan masukkan NIP, NIK, atau Username Anda.');
      return;
    }
    if (!stafPassword) {
      setErrorMessage('Silakan masukkan password.');
      return;
    }

    const res = await loginStaf(nipNik.trim(), stafPassword);
    if (!res.success) {
      setErrorMessage(res.message || 'Gagal login sebagai Pendidik/Staf.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full space-y-6">
          {/* Logo & Heading */}
          <div className="text-center space-y-3">
            {/* Logos Berdampingan: Klik untuk menuju website resmi */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 pt-2">
              <a
                href="https://pendidikan.banyuwangikab.go.id/inovasi-daerah/"
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Website Dinas Pendidikan Kab. Banyuwangi (Inovasi Daerah)"
                className="w-16 h-16 sm:w-20 sm:h-20 p-2 rounded-2xl bg-white shadow-lg shadow-slate-200/70 border border-slate-100 flex items-center justify-center transform hover:scale-110 hover:shadow-xl hover:border-emerald-200 transition duration-300 group cursor-pointer"
              >
                <img 
                  src="/logos/logo_banyuwangi.png" 
                  alt="Logo Kabupaten Banyuwangi" 
                  className="max-h-full max-w-full object-contain group-hover:drop-shadow-sm transition"
                />
              </a>

              <a
                href="https://smpnegeri2glagah.sch.id/"
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Website Resmi SMPN 2 Glagah"
                className="w-16 h-16 sm:w-20 sm:h-20 p-2 rounded-2xl bg-white shadow-lg shadow-slate-200/70 border border-slate-100 flex items-center justify-center transform hover:scale-110 hover:shadow-xl hover:border-purple-200 transition duration-300 group cursor-pointer"
              >
                <img 
                  src="/logos/logo_smpn2_glagah.png" 
                  alt="Logo SMPN 2 Glagah" 
                  className="max-h-full max-w-full object-contain group-hover:drop-shadow-sm transition"
                />
              </a>
            </div>

            <div className="inline-flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Program Resmi Kemendikdasmen RI</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold border border-purple-200 shadow-xs">
                v0.4.0 (Rev 04)
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                Jurnal 7 Kebiasaan
              </h1>
              <p className="text-sm font-bold text-purple-900 mt-0.5">
                {SCHOOL_PROFILE.nama} • {SCHOOL_PROFILE.kabupaten}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                NPSN: {SCHOOL_PROFILE.npsn} • Status: {SCHOOL_PROFILE.status} • Akreditasi: {SCHOOL_PROFILE.akreditasi}
              </p>
            </div>
          </div>

          {/* Card Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80 space-y-6 animate-slide-up">
            {/* Tabs Selector */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('siswa');
                  setErrorMessage(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'siswa'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('staf');
                  setErrorMessage(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'staf'
                    ? 'bg-white text-purple-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Guru / Admin</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Siswa */}
            {activeTab === 'siswa' ? (
              <form onSubmit={handleSiswaSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Induk Siswa Nasional (NISN)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={nisn}
                      onChange={(e) => setNisn(e.target.value)}
                      placeholder="Contoh: 0081234567"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={siswaPassword}
                      onChange={(e) => setSiswaPassword(e.target.value)}
                      placeholder="Default: Tanggal Lahir (DDMMYYYY)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Helper info note */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    Password default awal adalah <strong>tanggal lahir (DDMMYYYY)</strong>. Contoh: tanggal lahir 15 Mei 2011 = <code>15052011</code>.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  <span>{isLoading ? 'Memproses...' : 'Masuk sebagai Siswa'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Form Staf Sekolah & Superadmin */
              <form onSubmit={handleStafSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP / NIK / Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={nipNik}
                      onChange={(e) => setNipNik(e.target.value)}
                      placeholder="Masukkan NIP, NIK, atau Username"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={stafPassword}
                      onChange={(e) => setStafPassword(e.target.value)}
                      placeholder="Default: Tanggal Lahir (DDMMYYYY)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Helper info note */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    Untuk Wali Kelas, Kepala Sekolah, Kurikulum, & Kesiswaan. Password default awal adalah <strong>tanggal lahir (DDMMYYYY)</strong>.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  <span>{isLoading ? 'Memproses...' : 'Masuk sebagai Pendidik / Admin'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} {SCHOOL_PROFILE.nama} ({SCHOOL_PROFILE.npsn}) • {SCHOOL_PROFILE.alamat}
      </footer>
    </div>
  );
};

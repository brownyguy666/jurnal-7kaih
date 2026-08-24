import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Sliders, 
  FileSpreadsheet, 
  Download, 
  UploadCloud, 
  Search, 
  Filter, 
  RefreshCw, 
  Settings2, 
  Building2, 
  Layers, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { Kebiasaan, Kelas, Siswa, StafSekolah, EntriJurnal } from '../../types/database';
import { JournalService } from '../../lib/journalService';
import { MockDatabase } from '../../lib/mockStore';
import { DataImportSiswaModal } from './DataImportSiswaModal';
import { DataImportStafModal } from './DataImportStafModal';
import { KebiasaanConfigModal } from './KebiasaanConfigModal';
import { PasswordManagerModal } from './PasswordManagerModal';
import { ClassReportModal } from './ClassReportModal';
import { ClassComparisonTable } from '../pejabat/ClassComparisonTable';
import { SchoolStatsOverview } from '../pejabat/SchoolStatsOverview';
import { ArahanWaliKelasModal } from '../pejabat/ArahanWaliKelasModal';
import { SuperadminLeaderboardView } from './SuperadminLeaderboardView';
import { Trophy } from 'lucide-react';

interface SuperadminDashboardProps {
  staf: StafSekolah;
}

export const SuperadminDashboard: React.FC<SuperadminDashboardProps> = ({ staf }) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'siswa' | 'staf' | 'kebiasaan' | 'monitoring'>('leaderboard');
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [stafList, setStafList] = useState<StafSekolah[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [kebiasaanList, setKebiasaanList] = useState<Kebiasaan[]>([]);
  const [entries, setEntries] = useState<EntriJurnal[]>([]);

  // Search & Filter
  const [searchSiswa, setSearchSiswa] = useState('');
  const [filterKelasSiswa, setFilterKelasSiswa] = useState('all');
  const [searchStaf, setSearchStaf] = useState('');

  // Password visibility states
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Modals
  const [isImportSiswaOpen, setIsImportSiswaOpen] = useState(false);
  const [isImportStafOpen, setIsImportStafOpen] = useState(false);
  const [selectedHabitForConfig, setSelectedHabitForConfig] = useState<Kebiasaan | null>(null);
  const [isArahanModalOpen, setIsArahanModalOpen] = useState(false);
  const [targetClassForArahan, setTargetClassForArahan] = useState('');
  
  // Password Manager Modal & Class Report Modal
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<{
    type: 'siswa' | 'staf';
    data: Siswa | StafSekolah;
  } | null>(null);
  const [selectedClassForReport, setSelectedClassForReport] = useState<Kelas | null>(null);

  const loadAllData = async () => {
    try {
      const [allKelas, allStaf, allSiswa, habits, allEntries] = await Promise.all([
        JournalService.getKelas(),
        JournalService.getStaf(),
        JournalService.getSiswa(),
        JournalService.getKebiasaan(),
        JournalService.getEntriJurnal()
      ]);

      setKelasList(allKelas);
      setStafList(allStaf);
      setSiswaList(allSiswa);
      setKebiasaanList(habits.sort((a, b) => a.urutan - b.urutan));
      setEntries(allEntries);
    } catch (e) {
      console.warn('Error loading superadmin data:', e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleResetDatabase = () => {
    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi default awal?')) {
      MockDatabase.resetToDefault();
      loadAllData();
      alert('Database telah direset ke kondisi awal.');
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getFormattedDobPassword = (dobStr?: string) => {
    if (!dobStr) return '01012011';
    try {
      const parts = dobStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}${parts[1]}${parts[0]}`;
      }
    } catch {
      // fallback
    }
    return dobStr.replace(/\D/g, '');
  };

  // Filtered Siswa
  const filteredSiswa = siswaList.filter((s) => {
    const matchSearch = s.nama.toLowerCase().includes(searchSiswa.toLowerCase()) || s.nisn.includes(searchSiswa);
    const matchKelas = filterKelasSiswa === 'all' || s.kelas_id === filterKelasSiswa;
    return matchSearch && matchKelas;
  });

  // Filtered Staf
  const filteredStaf = stafList.filter((st) => {
    return st.nama.toLowerCase().includes(searchStaf.toLowerCase()) || st.nip_atau_nik.includes(searchStaf);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Top Banner Dashboard Superadmin */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white shadow-xl shadow-purple-900/20 border border-purple-800/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold backdrop-blur-sm border border-purple-400/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
            <span>Hak Akses Tertinggi • Super Administrator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Panel Kendali Superadmin SMPN 2 Glagah
          </h2>
          <p className="text-xs text-purple-200/80 mt-1 max-w-2xl">
            Kelola data 563 Siswa, 22 Pendidik & Staf, lihat serta ubah password, periksa laporan per kelas, dan konfigurasi 7 Kebiasaan Resmi Kemendikdasmen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            title="Refresh Data Cloud"
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition border border-white/15 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetDatabase}
            title="Reset Database ke Default"
            className="px-3.5 py-2.5 rounded-2xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 font-bold text-xs transition flex items-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Siswa Riil</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{siswaList.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Tersinkronisasi Cloud</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Staf & Guru</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{stafList.length}</p>
          <span className="text-[11px] text-slate-400">Kepsek, Waka, Kesiswaan & 18 Wali Kelas</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Rombongan Belajar</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{kelasList.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium">18 Kelas (7A s.d 9F)</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Entri Jurnal</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{entries.length}</p>
          <span className="text-[11px] text-slate-400">Bukti 7 Kebiasaan Tersimpan</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'leaderboard'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/25 ring-2 ring-amber-400 font-extrabold'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>🏆 Peringkat & Grafik Analitik</span>
        </button>

        <button
          onClick={() => setActiveTab('siswa')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'siswa'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola & Password Siswa ({siswaList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('staf')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'staf'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Kelola & Password Staf ({stafList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'monitoring'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Monitoring & Report 18 Kelas</span>
        </button>

        <button
          onClick={() => setActiveTab('kebiasaan')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'kebiasaan'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Konfigurasi 7 Kebiasaan</span>
        </button>
      </div>

      {/* TAB 0: LEADERBOARD & GRAFIK ANALITIK */}
      {activeTab === 'leaderboard' && (
        <SuperadminLeaderboardView
          kelasList={kelasList}
          siswaList={siswaList}
          entries={entries}
          stafList={stafList}
          kebiasaanList={kebiasaanList}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onRefreshData={loadAllData}
          onSelectClassReport={(k) => setSelectedClassForReport(k)}
        />
      )}

      {/* TAB 1: KELOLA & PASSWORD SISWA */}
      {activeTab === 'siswa' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Filter Kelas */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl text-xs font-bold text-slate-700">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterKelasSiswa}
                  onChange={(e) => setFilterKelasSiswa(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Kelas (18 Kelas)</option>
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.id}>
                      Kelas {k.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input Cari Siswa */}
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  value={searchSiswa}
                  onChange={(e) => setSearchSiswa(e.target.value)}
                  placeholder="Cari siswa atau NISN..."
                  className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Tombol Import CSV/XLSX Siswa */}
            <button
              onClick={() => setIsImportSiswaOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-2 shrink-0 self-end sm:self-center"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Siswa (CSV/Excel)</span>
            </button>
          </div>

          {/* Tabel Siswa dengan Kolom Password & Ganti Password */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">NISN (Username)</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4 text-center">Kelas</th>
                    <th className="py-3 px-4">Tanggal Lahir</th>
                    <th className="py-3 px-4 text-center">Password Login (DDMMYYYY)</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSiswa.slice(0, 100).map((s, idx) => {
                    const k = kelasList.find((c) => c.id === s.kelas_id);
                    const formattedPass = getFormattedDobPassword(s.tanggal_lahir);
                    const isVisible = visiblePasswords[s.id];

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-4 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-purple-900">{s.nisn}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-800">{s.nama}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-bold border border-purple-200">
                            {k?.nama_kelas || '7A'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{s.tanggal_lahir}</td>
                        <td className="py-2.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 font-mono text-slate-800 font-bold">
                            <span>{isVisible ? formattedPass : '••••••••'}</span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(s.id)}
                              className="p-1 text-slate-400 hover:text-purple-700 transition"
                              title={isVisible ? 'Sembunyikan' : 'Lihat Password'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => setSelectedUserForPassword({ type: 'siswa', data: s })}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition flex items-center gap-1 mx-auto active:scale-95"
                            title="Lihat atau Ganti Password Siswa"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Ganti Password</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredSiswa.length > 100 && (
              <div className="p-3 bg-slate-50 text-center text-xs text-slate-400 border-t border-slate-100">
                Menampilkan 100 dari total {filteredSiswa.length} siswa (Gunakan filter kelas/pencarian).
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: KELOLA & PASSWORD STAF */}
      {activeTab === 'staf' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchStaf}
                onChange={(e) => setSearchStaf(e.target.value)}
                placeholder="Cari staf atau NIP/NIK..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Tombol Import CSV/XLSX Staf */}
            <button
              onClick={() => setIsImportStafOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-2 shrink-0"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Staf (CSV/Excel)</span>
            </button>
          </div>

          {/* Tabel Staf dengan Password & Ganti Password */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">NIP / NIK / Username</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">Role / Jabatan</th>
                    <th className="py-3 px-4 text-center">Kelas Binaan</th>
                    <th className="py-3 px-4 text-center">Password Login</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaf.map((st, idx) => {
                    const k = kelasList.find((c) => c.id === st.kelas_id);
                    const formattedPass = st.role === 'superadmin' ? '060894' : getFormattedDobPassword(st.tanggal_lahir);
                    const isVisible = visiblePasswords[st.id];

                    return (
                      <tr key={st.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-900">{st.nip_atau_nik}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{st.nama}</td>
                        <td className="py-3 px-4 font-bold text-slate-700">
                          <span className="uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {st.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {k ? (
                            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                              Kelas {k.nama_kelas}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 font-mono text-slate-800 font-bold">
                            <span>{isVisible ? formattedPass : '••••••••'}</span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(st.id)}
                              className="p-1 text-slate-400 hover:text-indigo-700 transition"
                              title={isVisible ? 'Sembunyikan' : 'Lihat Password'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedUserForPassword({ type: 'staf', data: st })}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition flex items-center gap-1 mx-auto active:scale-95"
                            title="Lihat atau Ganti Password Staf"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Ganti Password</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MONITORING & REPORT 18 KELAS */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <SchoolStatsOverview
            kebiasaanList={kebiasaanList}
            entries={entries}
            siswaList={siswaList}
            selectedDate={selectedDate}
          />

          <ClassComparisonTable
            kelasList={kelasList}
            siswaList={siswaList}
            entries={entries}
            stafList={stafList}
            selectedDate={selectedDate}
            onOpenArahanModal={(kId) => {
              setTargetClassForArahan(kId);
              setIsArahanModalOpen(true);
            }}
            onDrillDownClass={(kId) => {
              const targetK = kelasList.find((c) => c.id === kId);
              if (targetK) {
                setSelectedClassForReport(targetK);
              }
            }}
          />
        </div>
      )}

      {/* TAB 4: KONFIGURASI 7 KEBIASAAN */}
      {activeTab === 'kebiasaan' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-800 text-sm">
                  Aturan Parameter 7 Kebiasaan Resmi Kemendikdasmen
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                  Operasional: 01.00 - 24.00 WIB
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pengisian jurnal aktif setiap hari dari pukul 01:00 s.d 24:00 WIB. Klik ikon ubah aturan untuk menyesuaikan target jam ideal, toleransi waktu, dan batas submisi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kebiasaanList.map((k) => (
              <div
                key={k.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      Kebiasaan #{k.urutan}
                    </span>
                    <button
                      onClick={() => setSelectedHabitForConfig(k)}
                      className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition flex items-center gap-1"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>Ubah Aturan</span>
                    </button>
                  </div>

                  <h4 className="font-bold text-slate-800 text-base">{k.nama}</h4>
                  <p className="text-xs text-slate-500 mt-1">{k.deskripsi}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Rentang Waktu:</span>
                    <span className="font-semibold text-slate-700">
                      {k.jam_mulai ? `${k.jam_mulai} - ${k.jam_selesai}` : 'Fleksibel 24 Jam'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Batas Input Harian:</span>
                    <span className="font-semibold text-slate-700">{k.maks_input_harian}x / hari</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <DataImportSiswaModal
        isOpen={isImportSiswaOpen}
        onClose={() => setIsImportSiswaOpen(false)}
        kelasList={kelasList}
        onImportSuccess={loadAllData}
      />

      <DataImportStafModal
        isOpen={isImportStafOpen}
        onClose={() => setIsImportStafOpen(false)}
        kelasList={kelasList}
        onImportSuccess={loadAllData}
      />

      <KebiasaanConfigModal
        isOpen={Boolean(selectedHabitForConfig)}
        kebiasaan={selectedHabitForConfig}
        onClose={() => setSelectedHabitForConfig(null)}
        onSaveSuccess={loadAllData}
      />

      <PasswordManagerModal
        isOpen={Boolean(selectedUserForPassword)}
        targetUser={selectedUserForPassword}
        onClose={() => setSelectedUserForPassword(null)}
        onSuccess={loadAllData}
      />

      <ClassReportModal
        isOpen={Boolean(selectedClassForReport)}
        kelas={selectedClassForReport}
        allKelas={kelasList}
        siswaList={siswaList}
        kebiasaanList={kebiasaanList}
        entries={entries}
        stafList={stafList}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onDataRefresh={loadAllData}
        currentStaf={staf}
        onClose={() => setSelectedClassForReport(null)}
      />

      <ArahanWaliKelasModal
        isOpen={isArahanModalOpen}
        onClose={() => setIsArahanModalOpen(false)}
        kelasList={kelasList}
        stafList={stafList}
        currentStaf={staf}
        selectedKelasIdDefault={targetClassForArahan}
        onSendSuccess={async (kId, kat, jud, pes) => {
          await JournalService.sendArahanWaliKelas(staf.id, kId, kat, jud, pes);
          await loadAllData();
        }}
      />
    </div>
  );
};

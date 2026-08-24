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
  Trash2
} from 'lucide-react';
import { Kebiasaan, Kelas, Siswa, StafSekolah, EntriJurnal } from '../../types/database';
import { JournalService } from '../../lib/journalService';
import { MockDatabase } from '../../lib/mockStore';
import { DataImportSiswaModal } from './DataImportSiswaModal';
import { DataImportStafModal } from './DataImportStafModal';
import { KebiasaanConfigModal } from './KebiasaanConfigModal';
import { ClassComparisonTable } from '../pejabat/ClassComparisonTable';
import { SchoolStatsOverview } from '../pejabat/SchoolStatsOverview';
import { ArahanWaliKelasModal } from '../pejabat/ArahanWaliKelasModal';

interface SuperadminDashboardProps {
  staf: StafSekolah;
}

export const SuperadminDashboard: React.FC<SuperadminDashboardProps> = ({ staf }) => {
  const [activeTab, setActiveTab] = useState<'siswa' | 'staf' | 'kebiasaan' | 'monitoring'>('siswa');
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [stafList, setStafList] = useState<StafSekolah[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [kebiasaanList, setKebiasaanList] = useState<Kebiasaan[]>([]);
  const [entries, setEntries] = useState<EntriJurnal[]>([]);

  // Search & Filters
  const [searchSiswa, setSearchSiswa] = useState('');
  const [filterKelasSiswa, setFilterKelasSiswa] = useState('all');
  const [searchStaf, setSearchStaf] = useState('');

  // Modals
  const [isImportSiswaOpen, setIsImportSiswaOpen] = useState(false);
  const [isImportStafOpen, setIsImportStafOpen] = useState(false);
  const [selectedHabitForConfig, setSelectedHabitForConfig] = useState<Kebiasaan | null>(null);
  const [isArahanModalOpen, setIsArahanModalOpen] = useState(false);
  const [targetClassForArahan, setTargetClassForArahan] = useState('');

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
      {/* Superadmin Master Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl border border-purple-800/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-extrabold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>SUPERADMIN MASTER CONTROL</span>
            </span>
            <span className="text-xs font-semibold text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-400/30">
              {staf.nama}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Pusat Pengelolaan Data & Konfigurasi Sekolah
          </h2>
          <p className="text-xs text-purple-200/80 mt-1 max-w-2xl">
            Impor data massal Dapodik/Excel Siswa & Staf, kelola 18 kelas (7A-9F), sesuaikan aturan 7 kebiasaan Kemendikdasmen, dan pantau metrik sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            title="Refresh Data"
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition border border-white/15"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetDatabase}
            title="Reset Database ke Default"
            className="px-3.5 py-2.5 rounded-2xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 font-bold text-xs transition flex items-center gap-1.5"
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
            <span className="text-xs font-semibold">Total Siswa Terdaftar</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{siswaList.length}</p>
          <span className="text-[11px] text-slate-400">Tersebar di 18 Kelas</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Staf & Guru</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{stafList.length}</p>
          <span className="text-[11px] text-slate-400">Wali Kelas, KS, Kurikulum, Kesiswaan</span>
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
          <span className="text-[11px] text-slate-400">Bukti 7 Kebiasaan</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('siswa')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'siswa'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola & Import Siswa ({siswaList.length})</span>
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
          <span>Kelola & Import Staf ({stafList.length})</span>
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

        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'monitoring'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Monitoring 18 Kelas (7A-9F)</span>
        </button>
      </div>

      {/* TAB 1: KELOLA & IMPORT SISWA */}
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

              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  value={searchSiswa}
                  onChange={(e) => setSearchSiswa(e.target.value)}
                  placeholder="Cari nama atau NISN..."
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

          {/* Tabel Siswa */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">NISN</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4 text-center">Kelas</th>
                    <th className="py-3 px-4">Tanggal Lahir</th>
                    <th className="py-3 px-4 text-center">Password</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSiswa.slice(0, 100).map((s, idx) => {
                    const k = kelasList.find((c) => c.id === s.kelas_id);
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
                          {s.sudah_ganti_password ? (
                            <span className="text-[10px] text-slate-500">Custom</span>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">
                              Default (DDMMYYYY)
                            </span>
                          )}
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

      {/* TAB 2: KELOLA & IMPORT STAF */}
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

          {/* Tabel Staf */}
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
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaf.map((st, idx) => {
                    const k = kelasList.find((c) => c.id === st.kelas_id);
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
                          {st.status_asn ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              ASN / PPPK
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              Non-ASN
                            </span>
                          )}
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

      {/* TAB 3: KONFIGURASI 7 KEBIASAAN */}
      {activeTab === 'kebiasaan' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Aturan Parameter 7 Kebiasaan Resmi Kemendikdasmen
              </h3>
              <p className="text-xs text-slate-400">
                Klik ikon edit untuk menyesuaikan jam mulai/selesai, toleransi waktu, dan batas submisi harian.
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

                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Waktu Berlaku</span>
                    <span className="font-bold text-slate-700">
                      {k.jam_mulai && k.jam_selesai ? `${k.jam_mulai} - ${k.jam_selesai}` : 'Fleksibel'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Toleransi</span>
                    <span className="font-bold text-slate-700">
                      {k.toleransi_menit > 0 ? `+${k.toleransi_menit} Menit` : 'Tanpa Toleransi'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Maks Submisi</span>
                    <span className="font-bold text-slate-700">{k.maks_input_harian}x / Hari</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MONITORING SELURUH SEKOLAH */}
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
            onDrillDownClass={() => {}}
          />
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

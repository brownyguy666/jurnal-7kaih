import React, { useState, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Sunrise, 
  HeartHandshake, 
  Activity, 
  Utensils, 
  Moon, 
  Building2, 
  Search, 
  Filter, 
  Download, 
  MessageSquare, 
  FileSpreadsheet, 
  ChevronRight, 
  ShieldAlert, 
  Sparkles,
  Eye,
  FileText
} from 'lucide-react';
import { EntriJurnal, Kebiasaan, Kelas, Siswa, StafSekolah } from '../../types/database';
import { getTodayDateString } from '../../lib/timeCalculator';
import * as XLSX from 'xlsx';

interface StudentProgressOverviewProps {
  entries: EntriJurnal[];
  kelasList: Kelas[];
  siswaList: Siswa[];
  stafList: StafSekolah[];
  kebiasaanList: Kebiasaan[];
  selectedDate?: string;
  onOpenStudentDetail?: (siswa: Siswa) => void;
  onOpenArahanModal?: (targetKelasId: string, prefillMessage: string) => void;
}

export const StudentProgressOverview: React.FC<StudentProgressOverviewProps> = ({
  entries,
  kelasList,
  siswaList,
  stafList,
  kebiasaanList,
  selectedDate,
  onOpenStudentDetail,
  onOpenArahanModal
}) => {
  const todayStr = selectedDate || getTodayDateString();
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'inactive3days' | 'classRanking'>('overview');

  // Filter entri hari yang dipilih
  const todayEntries = useMemo(() => {
    return entries.filter((e) => e.tanggal === todayStr);
  }, [entries, todayStr]);

  // Evaluasi 3 Hari Terakhir (Today, Today-1, Today-2)
  const last3Days = useMemo(() => {
    const dates: string[] = [];
    const baseDate = new Date(todayStr);
    for (let i = 0; i < 3; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [todayStr]);

  // Evaluasi Siswa yang Tidak Mengisi 3 Hari Berturut-turut
  const inactive3DaysStudents = useMemo(() => {
    return siswaList.map((siswa) => {
      const studentEntriesLast3Days = entries.filter(
        (e) => e.siswa_id === siswa.id && last3Days.includes(e.tanggal)
      );

      // Cari tanggal terakhir siswa pernah mengisi jurnal
      const allStudentEntries = entries.filter((e) => e.siswa_id === siswa.id);
      const allDates = Array.from(new Set(allStudentEntries.map((e) => e.tanggal))).sort();
      const lastActiveDate = allDates.length > 0 ? allDates[allDates.length - 1] : null;

      let daysSinceLast = 0;
      if (!lastActiveDate) {
        daysSinceLast = 999; // Belum pernah sama sekali
      } else {
        const diff = Math.round(
          (new Date(todayStr).getTime() - new Date(lastActiveDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        daysSinceLast = Math.max(diff, 0);
      }

      const kelas = kelasList.find((k) => k.id === siswa.kelas_id);
      const waliKelas = stafList.find((s) => s.id === kelas?.wali_kelas_id);

      return {
        siswa,
        namaKelas: kelas?.nama_kelas || '-',
        tingkat: kelas?.tingkat || 7,
        waliKelasNama: waliKelas?.nama || 'Wali Kelas',
        waliKelasNip: waliKelas?.nip_atau_nik || '-',
        isInactive3Days: studentEntriesLast3Days.length === 0,
        entriesCountLast3Days: studentEntriesLast3Days.length,
        lastActiveDate,
        daysSinceLast
      };
    }).filter((item) => item.isInactive3Days);
  }, [siswaList, entries, last3Days, todayStr, kelasList, stafList]);

  // Rekap jumlah siswa tidak aktif per kelas
  const inactiveCountPerClass = useMemo(() => {
    const map: Record<string, { kelas: Kelas; count: number; waliKelas: string }> = {};
    kelasList.forEach((k) => {
      const wali = stafList.find((s) => s.id === k.wali_kelas_id);
      map[k.id] = {
        kelas: k,
        count: 0,
        waliKelas: wali?.nama || 'Wali Kelas'
      };
    });

    inactive3DaysStudents.forEach((item) => {
      if (item.siswa.kelas_id && map[item.siswa.kelas_id]) {
        map[item.siswa.kelas_id].count += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [kelasList, stafList, inactive3DaysStudents]);

  // Filter siswa tidak aktif sesuai dropdown & pencarian
  const filteredInactiveList = useMemo(() => {
    return inactive3DaysStudents.filter((item) => {
      const matchKelas = selectedClassFilter === 'all' || item.siswa.kelas_id === selectedClassFilter;
      const matchQuery = item.siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.siswa.nisn.includes(searchQuery);
      return matchKelas && matchQuery;
    });
  }, [inactive3DaysStudents, selectedClassFilter, searchQuery]);

  // Distribusi Tingkat Kepatuhan Hari Ini
  const complianceDistribution = useMemo(() => {
    let perfect = 0; // 7/7
    let high = 0;    // 5-6/7
    let medium = 0;  // 3-4/7
    let low = 0;     // 1-2/7
    let zero = 0;    // 0/7

    siswaList.forEach((siswa) => {
      const habitIds = new Set(
        todayEntries.filter((e) => e.siswa_id === siswa.id).map((e) => e.kebiasaan_id)
      );
      const count = habitIds.size;
      if (count === 7) perfect++;
      else if (count >= 5) high++;
      else if (count >= 3) medium++;
      else if (count >= 1) low++;
      else zero++;
    });

    return { perfect, high, medium, low, zero };
  }, [siswaList, todayEntries]);

  // Rata-rata kepatuhan sekolah hari ini
  const averageComplianceRate = useMemo(() => {
    if (siswaList.length === 0) return 0;
    const totalFilledDistinct = siswaList.reduce((acc, siswa) => {
      const habits = new Set(
        todayEntries.filter((e) => e.siswa_id === siswa.id).map((e) => e.kebiasaan_id)
      );
      return acc + habits.size;
    }, 0);
    return Math.round((totalFilledDistinct / (siswaList.length * 7)) * 100);
  }, [siswaList, todayEntries]);

  // Performa Per Kebiasaan Hari Ini
  const habitPerformance = useMemo(() => {
    return kebiasaanList.map((k) => {
      const studentsSubmitted = new Set(
        todayEntries.filter((e) => e.kebiasaan_id === k.id).map((e) => e.siswa_id)
      );
      const submittedCount = studentsSubmitted.size;
      const percentage = siswaList.length > 0 ? Math.round((submittedCount / siswaList.length) * 100) : 0;
      
      // Khusus refleksi belajar 100 kata
      const wordCountValid = k.id === 5 
        ? todayEntries.filter((e) => e.kebiasaan_id === 5 && (e.catatan || '').trim().split(/\s+/).filter(Boolean).length >= 100).length
        : null;

      return {
        kebiasaan: k,
        submittedCount,
        percentage,
        wordCountValid
      };
    });
  }, [kebiasaanList, todayEntries, siswaList]);

  // Peringkat 18 Kelas Hari Ini
  const classRankings = useMemo(() => {
    return kelasList.map((k) => {
      const classStudents = siswaList.filter((s) => s.kelas_id === k.id);
      const wali = stafList.find((s) => s.id === k.wali_kelas_id);
      if (classStudents.length === 0) {
        return { kelas: k, studentCount: 0, complianceRate: 0, completedAllCount: 0, waliNama: wali?.nama || '-' };
      }

      let completedAll = 0;
      let totalCompletedHabits = 0;

      classStudents.forEach((s) => {
        const studentHabits = new Set(
          todayEntries.filter((e) => e.siswa_id === s.id).map((e) => e.kebiasaan_id)
        );
        totalCompletedHabits += studentHabits.size;
        if (studentHabits.size === 7) completedAll++;
      });

      const rate = Math.round((totalCompletedHabits / (classStudents.length * 7)) * 100);

      return {
        kelas: k,
        studentCount: classStudents.length,
        complianceRate: rate,
        completedAllCount: completedAll,
        waliNama: wali?.nama || 'Wali Kelas'
      };
    }).sort((a, b) => b.complianceRate - a.complianceRate);
  }, [kelasList, siswaList, stafList, todayEntries]);

  // Export Excel Siswa Tidak Aktif 3 Hari
  const handleExportInactiveExcel = () => {
    const exportData = filteredInactiveList.map((item, idx) => ({
      No: idx + 1,
      NISN: item.siswa.nisn,
      'Nama Siswa': item.siswa.nama,
      Kelas: `Kelas ${item.namaKelas}`,
      'Wali Kelas': item.waliKelasNama,
      'Terakhir Mengisi Jurnal': item.lastActiveDate || 'Belum Pernah',
      'Lama Tidak Mengisi (Hari)': item.daysSinceLast >= 999 ? 'Belum Pernah' : `${item.daysSinceLast} Hari`,
      Status: 'Tidak Mengisi 3+ Hari Berturut-turut'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Siswa Tidak Aktif 3 Hari');
    XLSX.writeFile(wb, `Laporan_Siswa_Tidak_Aktif_3Hari_SMPN2Glagah_${todayStr}.xlsx`);
  };

  const getHabitIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Sunrise': return <Sunrise className="w-4 h-4 text-amber-600" />;
      case 'HeartHandshake': return <HeartHandshake className="w-4 h-4 text-emerald-600" />;
      case 'Activity': return <Activity className="w-4 h-4 text-blue-600" />;
      case 'Utensils': return <Utensils className="w-4 h-4 text-green-600" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-indigo-600" />;
      case 'Users': return <Users className="w-4 h-4 text-purple-600" />;
      case 'Moon': return <Moon className="w-4 h-4 text-violet-600" />;
      default: return <Award className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Hero Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Siswa */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">Total Siswa Terdaftar</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{siswaList.length}</p>
          <span className="text-[11px] text-purple-600 font-semibold">18 Kelas (7A s.d 9F)</span>
        </div>

        {/* Total Entri Jurnal Realtime */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">Total Entri Jurnal</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{entries.length}</p>
          <span className="text-[11px] text-slate-500 font-medium">Bukti 7 Kebiasaan Tersimpan</span>
        </div>

        {/* Kepatuhan Rata-Rata */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">Kepatuhan Hari Ini</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{averageComplianceRate}%</p>
          <span className="text-[11px] text-emerald-600 font-medium">
            {complianceDistribution.perfect} Siswa Tuntas 100%
          </span>
        </div>

        {/* Radar Siswa Tidak Aktif 3 Hari */}
        <div className={`p-5 rounded-3xl border shadow-xs space-y-1 transition ${
          inactive3DaysStudents.length > 0
            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-rose-800">Tidak Aktif 3+ Hari</span>
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-rose-700">{inactive3DaysStudents.length}</p>
          <span className="text-[11px] text-rose-600 font-bold">
            {inactive3DaysStudents.length > 0 ? 'Perlu Pembinaan Segera' : 'Semua Siswa Terpantau Aktif'}
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Ringkasan 7 Kebiasaan</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inactive3days')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'inactive3days'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Radar Tidak Aktif 3 Hari ({inactive3DaysStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('classRanking')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'classRanking'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Peringkat 18 Kelas</span>
        </button>
      </div>

      {/* TAB 1: RINGKASAN PROGRESS 7 KEBIASAAN */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Distribusi Kepatuhan Siswa Cards */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Distribusi Kepatuhan Siswa Hari Ini ({todayStr})</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80">
                <span className="text-xs font-bold text-amber-800 block">⭐ 7/7 Tuntas Sempurna</span>
                <p className="text-2xl font-black text-amber-900 mt-1">{complianceDistribution.perfect}</p>
                <span className="text-[10px] text-amber-700">100% Kebiasaan</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                <span className="text-xs font-bold text-emerald-800 block">🟢 5-6 Kebiasaan</span>
                <p className="text-2xl font-black text-emerald-900 mt-1">{complianceDistribution.high}</p>
                <span className="text-[10px] text-emerald-700">Sangat Aktif</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80">
                <span className="text-xs font-bold text-blue-800 block">🟡 3-4 Kebiasaan</span>
                <p className="text-2xl font-black text-blue-900 mt-1">{complianceDistribution.medium}</p>
                <span className="text-[10px] text-blue-700">Cukup Aktif</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-700 block">⚪ 1-2 Kebiasaan</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{complianceDistribution.low}</p>
                <span className="text-[10px] text-slate-500">Mulai Mengisi</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 col-span-2 sm:col-span-1">
                <span className="text-xs font-bold text-rose-800 block">🔴 Belum Mengisi</span>
                <p className="text-2xl font-black text-rose-900 mt-1">{complianceDistribution.zero}</p>
                <span className="text-[10px] text-rose-700">Perlu Diingatkan</span>
              </div>
            </div>
          </div>

          {/* Grid 7 Kebiasaan Kemendikdasmen */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Progres Partisipasi Per 7 Kebiasaan Kemendikdasmen</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habitPerformance.map(({ kebiasaan, submittedCount, percentage, wordCountValid }) => (
                <div
                  key={kebiasaan.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                          {getHabitIcon(kebiasaan.icon_name)}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Kebiasaan #{kebiasaan.urutan}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">{kebiasaan.nama}</h4>
                        </div>
                      </div>

                      <span className="text-xs font-black text-slate-800 px-2 py-0.5 rounded-lg bg-slate-100">
                        {percentage}%
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2">{kebiasaan.deskripsi}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Total Siswa Mengisi:</span>
                      <span className="font-bold text-slate-800">
                        {submittedCount} / {siswaList.length} siswa
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Khusus Gemar Belajar: info refleksi 100 kata */}
                    {kebiasaan.id === 5 && (
                      <div className="pt-1 text-[10px] text-indigo-700 font-semibold flex items-center justify-between">
                        <span>📝 Refleksi Min. 100 Kata:</span>
                        <span className="px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200 font-bold">
                          {wordCountValid} Refleksi Terverifikasi
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RADAR SISWA TIDAK MENGISI 3 HARI BERTURUT-TURUT */}
      {activeSubTab === 'inactive3days' && (
        <div className="space-y-6">
          {/* Header Alert Radar */}
          <div className="rounded-3xl p-6 bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-rose-800/40">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shrink-0">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/30 uppercase tracking-wider">
                  Early Warning System • Kesiswaan, BK & Wali Kelas
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  Laporan Siswa Tidak Mengisi Jurnal 3 Hari Berturut-turut
                </h3>
                <p className="text-xs text-rose-200/80 mt-0.5">
                  Mendeteksi siswa yang pasif tanpa entri pada rentang 3 hari terakhir ({last3Days.reverse().join(', ')}).
                </p>
              </div>
            </div>

            <button
              onClick={handleExportInactiveExcel}
              className="px-4 py-2.5 rounded-2xl bg-white text-rose-900 hover:bg-rose-50 font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Laporan Excel (.xlsx)</span>
            </button>
          </div>

          {/* Breakdown Per Kelas */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Sebaran Siswa Tidak Aktif di 18 Rombel (7A - 9F)</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {inactiveCountPerClass.map(({ kelas, count, waliKelas }) => (
                <button
                  key={kelas.id}
                  onClick={() => setSelectedClassFilter(kelas.id)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedClassFilter === kelas.id
                      ? 'bg-purple-600 text-white border-purple-700 shadow-md'
                      : count > 0
                      ? 'bg-rose-50/80 hover:bg-rose-100/80 border-rose-200 text-rose-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm">Kelas {kelas.nama_kelas}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                      selectedClassFilter === kelas.id
                        ? 'bg-white/20 text-white'
                        : count > 0
                        ? 'bg-rose-200/80 text-rose-900'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count} Siswa
                    </span>
                  </div>
                  <span className={`text-[9px] truncate mt-1 ${
                    selectedClassFilter === kelas.id ? 'text-purple-200' : 'text-slate-400'
                  }`}>
                    {waliKelas}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-rose-500 focus:outline-none w-full sm:w-56"
              >
                <option value="all">Semua Rombel ({inactive3DaysStudents.length} Siswa)</option>
                {kelasList.map((k) => {
                  const c = inactiveCountPerClass.find((x) => x.kelas.id === k.id)?.count || 0;
                  return (
                    <option key={k.id} value={k.id}>
                      Kelas {k.nama_kelas} ({c} siswa tidak aktif)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa atau NISN..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Tabel Daftar Siswa Tidak Aktif 3 Hari */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">NISN</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4 text-center">Kelas</th>
                    <th className="py-3 px-4">Wali Kelas</th>
                    <th className="py-3 px-4 text-center">Terakhir Mengisi</th>
                    <th className="py-3 px-4 text-center">Aksi Pembinaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInactiveList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        🎉 Tidak ada siswa yang pasif 3 hari pada filter ini. Semua siswa terpantau aktif!
                      </td>
                    </tr>
                  ) : (
                    filteredInactiveList.map((item, idx) => (
                      <tr key={item.siswa.id} className="hover:bg-rose-50/40 transition">
                        <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.siswa.nisn}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{item.siswa.nama}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-bold border border-purple-200">
                            Kelas {item.namaKelas}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.waliKelasNama}</td>
                        <td className="py-3 px-4 text-center">
                          {item.lastActiveDate ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              {item.daysSinceLast} Hari Lalu ({item.lastActiveDate})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
                              Belum Pernah Mengisi
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {onOpenStudentDetail && (
                              <button
                                onClick={() => onOpenStudentDetail(item.siswa)}
                                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition flex items-center gap-1"
                                title="Lihat Profil Siswa"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Detail</span>
                              </button>
                            )}

                            {onOpenArahanModal && (
                              <button
                                onClick={() => {
                                  onOpenArahanModal(
                                    item.siswa.kelas_id || '',
                                    `Mohon pendampingan untuk ananda ${item.siswa.nama} (Kelas ${item.namaKelas}) yang belum mengisi jurnal 7 KAIH selama 3 hari berturut-turut.`
                                  );
                                }}
                                className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition flex items-center gap-1 shadow-xs active:scale-95"
                                title="Kirim Arahan ke Wali Kelas"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Arahan</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PERINGKAT 18 KELAS */}
      {activeSubTab === 'classRanking' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                Peringkat Kepatuhan 18 Rombongan Belajar (7A - 9F) Hari Ini
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dihitung dari persentase rata-rata 7 kebiasaan seluruh siswa di masing-masing kelas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classRankings.map((cr, idx) => (
              <div
                key={cr.kelas.id}
                className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between space-y-3 transition ${
                  idx === 0
                    ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                    : idx === 1
                    ? 'bg-slate-50 border-slate-300'
                    : idx === 2
                    ? 'bg-orange-50/50 border-orange-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : idx === 2
                          ? 'bg-orange-300 text-orange-950'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{idx + 1}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-base">Kelas {cr.kelas.nama_kelas}</h4>
                    </div>

                    <span className="font-black text-sm text-emerald-700 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      {cr.complianceRate}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">Wali Kelas: <strong>{cr.waliNama}</strong></p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Siswa Tuntas 100%:</span>
                    <span className="font-bold text-slate-800">{cr.completedAllCount} / {cr.studentCount} siswa</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cr.complianceRate >= 80 ? 'bg-emerald-500' : cr.complianceRate >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${cr.complianceRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

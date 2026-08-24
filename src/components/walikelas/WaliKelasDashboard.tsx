import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Search, 
  FileSpreadsheet, 
  TrendingUp, 
  ShieldAlert,
  Award,
  RefreshCw,
  Mail,
  Check,
  Sparkles
} from 'lucide-react';
import { ArahanWaliKelas, EntriJurnal, Feedback, Kebiasaan, Kelas, Siswa, StafSekolah } from '../../types/database';
import { JournalService } from '../../lib/journalService';
import { MatrixRekapTable } from './MatrixRekapTable';
import { StudentDetailModal } from './StudentDetailModal';
import { ModerationDeleteModal } from './ModerationDeleteModal';
import { ExportSharePanel } from './ExportSharePanel';
import { PhotoViewerModal } from '../common/PhotoViewerModal';

interface WaliKelasDashboardProps {
  staf: StafSekolah;
}

export const WaliKelasDashboard: React.FC<WaliKelasDashboardProps> = ({ staf }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [currentKelas, setCurrentKelas] = useState<Kelas | null>(null);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [kebiasaanList, setKebiasaanList] = useState<Kebiasaan[]>([]);
  const [entries, setEntries] = useState<EntriJurnal[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [arahanList, setArahanList] = useState<ArahanWaliKelas[]>([]);
  const [stafList, setStafList] = useState<StafSekolah[]>([]);

  // Modal states
  const [selectedStudent, setSelectedStudent] = useState<Siswa | null>(null);
  const [selectedEntryForPhoto, setSelectedEntryForPhoto] = useState<EntriJurnal | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<EntriJurnal | null>(null);

  const loadData = async () => {
    try {
      const [allKelas, allSiswa, habits, allEntries, allFeedbacks, allStaf] = await Promise.all([
        JournalService.getKelas(),
        JournalService.getSiswa(),
        JournalService.getKebiasaan(),
        JournalService.getEntriJurnal(),
        JournalService.getFeedback(),
        JournalService.getStaf()
      ]);

      // 1. Temukan kelas yang diampu oleh Wali Kelas ini (dukung relasi UUID dan string nama kelas)
      let matchedKelas = allKelas.find((k) => 
        (staf.id && k.wali_kelas_id === staf.id) ||
        (staf.kelas_id && k.id === staf.kelas_id) ||
        (staf.kelas_id && (
          k.nama_kelas.toUpperCase() === String(staf.kelas_id).toUpperCase().replace(/^K-/, '') ||
          k.id === String(staf.kelas_id)
        ))
      );

      // Fallback jika tidak ditemukan di list kelas (misal staf.kelas_id berupa string '7F')
      if (!matchedKelas && staf.kelas_id) {
        const rawName = String(staf.kelas_id).replace(/^k-/i, '').toUpperCase();
        matchedKelas = {
          id: staf.kelas_id,
          nama_kelas: rawName || 'Kelas',
          tingkat: parseInt(rawName.replace(/\D/g, '')) || 7,
          wali_kelas_id: staf.id
        };
      }

      setCurrentKelas(matchedKelas || null);

      // 2. Kumpulkan seluruh kemungkinan ID / format kelas
      const targetClassIds = new Set<string>();
      if (matchedKelas?.id) targetClassIds.add(matchedKelas.id);
      if (matchedKelas?.nama_kelas) {
        targetClassIds.add(matchedKelas.nama_kelas.toUpperCase());
        targetClassIds.add(`k-${matchedKelas.nama_kelas.toLowerCase()}`);
      }
      if (staf.kelas_id) {
        targetClassIds.add(staf.kelas_id);
        targetClassIds.add(String(staf.kelas_id).toUpperCase());
        targetClassIds.add(String(staf.kelas_id).toUpperCase().replace(/^K-/, ''));
        targetClassIds.add(`k-${String(staf.kelas_id).toLowerCase().replace(/^k-/, '')}`);
      }

      // 3. Filter siswa yang terdaftar di kelas wali kelas ini
      const classStudents = allSiswa.filter((s) => {
        if (!matchedKelas && !staf.kelas_id) return true;
        if (targetClassIds.has(s.kelas_id)) return true;
        if (s.kelas_id && targetClassIds.has(s.kelas_id.toUpperCase())) return true;
        if (s.kelas_id && targetClassIds.has(s.kelas_id.toUpperCase().replace(/^K-/, ''))) return true;
        return false;
      });

      // 4. Muat arahan pimpinan untuk kelas ini
      const targetClassIdForArahan = matchedKelas?.id || staf.kelas_id || undefined;
      const classArahan = await JournalService.getArahanWaliKelas(targetClassIdForArahan);

      setSiswaList(classStudents);
      setKebiasaanList(habits.sort((a, b) => a.urutan - b.urutan));
      setEntries(allEntries);
      setFeedbacks(allFeedbacks);
      setArahanList(classArahan);
      setStafList(allStaf);
    } catch (e) {
      console.warn('Error loading wali kelas data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [staf.id, staf.kelas_id]);

  // Hitung KPI
  const currentDayEntries = entries.filter((e) => e.tanggal === selectedDate);
  const totalSiswa = siswaList.length;

  let totalHabitsCompleted = 0;
  let perfectStudentCount = 0;
  let flaggedPhotoCount = 0;

  siswaList.forEach((siswa) => {
    const studentDayEntries = currentDayEntries.filter((e) => e.siswa_id === siswa.id);
    const distinct = new Set(studentDayEntries.map((e) => e.kebiasaan_id)).size;
    totalHabitsCompleted += distinct;
    if (distinct === 7) perfectStudentCount++;
    if (studentDayEntries.some((e) => e.flag_foto_mencurigakan)) flaggedPhotoCount++;
  });

  const avgCompletionRate = totalSiswa > 0
    ? Math.round((totalHabitsCompleted / (totalSiswa * 7)) * 100)
    : 0;

  // Handlers
  const handleConfirmDelete = async (entriId: string, alasan: string) => {
    await JournalService.deleteEntriJurnal(entriId, staf.id, alasan);
    await loadData();
  };

  const handleAddFeedback = async (siswaId: string, komentar: string) => {
    await JournalService.addFeedback(staf.id, siswaId, null, komentar);
    await loadData();
  };

  const handleMarkArahanRead = async (arahanId: string) => {
    await JournalService.markArahanRead(arahanId);
    await loadData();
  };

  const getKategoriBadge = (kategori: string) => {
    switch (kategori) {
      case 'apresiasi':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'evaluasi':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'instruksi':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'tindak_lanjut':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-1">
            Portal Wali Kelas • Kelas {currentKelas?.nama_kelas || staf.kelas_id || '7A'}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Rekap & Moderasi Jurnal Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau kedisiplinan {totalSiswa} siswa {currentKelas ? `kelas ${currentKelas.nama_kelas}` : ''}, tinjau keaslian bukti foto EXIF, dan berikan feedback apresiasi.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={loadData}
            title="Muat Ulang Data"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Directives from School Leaders Banner (Arahan Pimpinan Sekolah) */}
      {arahanList.length > 0 && (
        <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-purple-800/40 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-purple-200">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <span>Arahan & Feedback dari Pimpinan Sekolah</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-200 border border-purple-400/30">
                    {arahanList.length} Pesan
                  </span>
                </h3>
                <p className="text-xs text-purple-200/80">
                  Instruksi dan masukan resmi dari Kepala Sekolah / Waka Kurikulum / Kesiswaan
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {arahanList.map((arahan) => {
              const sender = stafList.find((s) => s.id === arahan.staf_pengirim_id);

              return (
                <div
                  key={arahan.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[11px] font-bold text-purple-200">
                        Dari: {sender?.nama || 'Pimpinan Sekolah'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getKategoriBadge(arahan.kategori)}`}>
                        {arahan.kategori}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white">{arahan.judul}</h4>
                    <p className="text-xs text-purple-100/90 mt-1 leading-relaxed bg-black/20 p-2.5 rounded-xl">
                      "{arahan.pesan}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-purple-300">
                    <span>
                      {new Date(arahan.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} WIB
                    </span>
                    {!arahan.dibaca ? (
                      <button
                        onClick={() => handleMarkArahanRead(arahan.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 font-semibold border border-emerald-400/30 flex items-center gap-1 transition"
                      >
                        <Check className="w-3 h-3" />
                        <span>Tandai Sudah Dibaca</span>
                      </button>
                    ) : (
                      <span className="text-emerald-300 font-medium">✓ Sudah Dibaca</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Siswa */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Siswa Kelas</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800">{totalSiswa}</p>
          <span className="text-[11px] text-slate-400">
            Siswa Kelas {currentKelas?.nama_kelas || staf.kelas_id || ''}
          </span>
        </div>

        {/* Rata-rata Capaian */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Rata-rata Capaian</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">{avgCompletionRate}%</p>
          <span className="text-[11px] text-emerald-600 font-medium">Kepatuhan 7 Kebiasaan</span>
        </div>

        {/* Tuntas 7 Kebiasaan */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Tuntas 7 Kebiasaan</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800">
            {perfectStudentCount} <span className="text-xs font-normal text-slate-400">/ {totalSiswa}</span>
          </p>
          <span className="text-[11px] text-slate-400">Siswa Tuntas Hari Ini</span>
        </div>

        {/* Flag Foto Perlu Review */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Perlu Review Foto</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{flaggedPhotoCount}</p>
          <span className="text-[11px] text-amber-700">Siswa dengan Flag EXIF</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau NISN siswa..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        <span className="text-xs text-slate-500 self-end sm:self-center">
          Menampilkan matriks pelaksanaan tanggal: <strong className="text-slate-700">{selectedDate}</strong>
        </span>
      </div>

      {/* Matrix Table */}
      <MatrixRekapTable
        siswaList={siswaList}
        kebiasaanList={kebiasaanList}
        entries={entries}
        selectedDate={selectedDate}
        onSelectStudent={(s) => setSelectedStudent(s)}
        searchQuery={searchQuery}
      />

      {/* Export & WhatsApp Share Panel */}
      <ExportSharePanel
        namaKelas={currentKelas ? `Kelas ${currentKelas.nama_kelas}` : (staf.kelas_id ? `Kelas ${staf.kelas_id}` : 'Kelas')}
        selectedDate={selectedDate}
        siswaList={siswaList}
        kebiasaanList={kebiasaanList}
        entries={entries}
      />

      {/* Modals */}
      <StudentDetailModal
        isOpen={Boolean(selectedStudent)}
        siswa={selectedStudent}
        entries={
          selectedStudent
            ? entries.filter((e) => e.siswa_id === selectedStudent.id)
            : []
        }
        kebiasaanList={kebiasaanList}
        feedbacks={feedbacks}
        onClose={() => setSelectedStudent(null)}
        onViewPhoto={(entry) => setSelectedEntryForPhoto(entry)}
        onDeleteEntry={(entry) => setEntryToDelete(entry)}
        onAddFeedback={handleAddFeedback}
      />

      <PhotoViewerModal
        isOpen={Boolean(selectedEntryForPhoto)}
        entry={selectedEntryForPhoto}
        onClose={() => setSelectedEntryForPhoto(null)}
      />

      <ModerationDeleteModal
        isOpen={Boolean(entryToDelete)}
        entry={entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

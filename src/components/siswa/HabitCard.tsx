import React from 'react';
import { 
  Sunrise, 
  HeartHandshake, 
  Activity, 
  Utensils, 
  BookOpen, 
  Users, 
  Moon, 
  CheckCircle2, 
  PlusCircle, 
  Clock, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { EntriJurnal, Kebiasaan } from '../../types/database';
import { StatusBadge, FlagBadge } from '../common/StatusBadge';

interface HabitCardProps {
  kebiasaan: Kebiasaan;
  entries: EntriJurnal[];
  onOpenEntryModal: (kebiasaan: Kebiasaan) => void;
  onViewPhoto: (entry: EntriJurnal) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  kebiasaan,
  entries,
  onOpenEntryModal,
  onViewPhoto
}) => {
  const currentCount = entries.length;
  const isMaxReached = currentCount >= kebiasaan.maks_input_harian;
  const isCompleted = currentCount > 0;

  // Icon mapping
  const getIcon = () => {
    switch (kebiasaan.urutan) {
      case 1:
        return <Sunrise className="w-6 h-6 text-amber-500" />;
      case 2:
        return <HeartHandshake className="w-6 h-6 text-emerald-500" />;
      case 3:
        return <Activity className="w-6 h-6 text-blue-500" />;
      case 4:
        return <Utensils className="w-6 h-6 text-green-500" />;
      case 5:
        return <BookOpen className="w-6 h-6 text-indigo-500" />;
      case 6:
        return <Users className="w-6 h-6 text-purple-500" />;
      case 7:
        return <Moon className="w-6 h-6 text-violet-500" />;
      default:
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
    }
  };

  const getCardBg = () => {
    if (isMaxReached) {
      return 'bg-emerald-50/60 border-emerald-200/80 shadow-sm';
    }
    if (isCompleted) {
      return 'bg-blue-50/40 border-blue-200/80 shadow-sm';
    }
    return 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm';
  };

  return (
    <div
      className={`rounded-3xl p-5 border transition-all duration-200 ${getCardBg()} flex flex-col justify-between`}
    >
      <div>
        {/* Top bar: Habit Order, Icon, and Status Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
              {getIcon()}
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Kebiasaan #{kebiasaan.urutan}
              </span>
              <h3 className="font-bold text-slate-800 text-base leading-tight">
                {kebiasaan.nama}
              </h3>
            </div>
          </div>

          {/* Progress or Completion Badge */}
          {kebiasaan.maks_input_harian > 1 ? (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                isMaxReached
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : isCompleted
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {currentCount}/{kebiasaan.maks_input_harian} Selesai
            </span>
          ) : isCompleted ? (
            <StatusBadge status={entries[0].status_waktu} />
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
              Belum diisi
            </span>
          )}
        </div>

        {/* Deskripsi / Aturan Waktu */}
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">
          {kebiasaan.deskripsi}
        </p>

        {/* Info Jam Operasional / Toleransi jika ada */}
        {kebiasaan.jam_mulai && kebiasaan.jam_selesai && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/80 text-slate-600 text-[11px] font-medium mb-3">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>
              Waktu ideal: {kebiasaan.jam_mulai} - {kebiasaan.jam_selesai} WIB
              {kebiasaan.toleransi_menit > 0 && ` (Toleransi +${kebiasaan.toleransi_menit}m)`}
            </span>
          </div>
        )}

        {/* List Foto Bukti yang sudah diisi hari ini */}
        {entries.length > 0 && (
          <div className="space-y-2 mb-4 pt-2 border-t border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Bukti Terkirim Hari Ini:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {entries.map((entry, idx) => (
                <div
                  key={entry.id || idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/80 border border-slate-200/70 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => onViewPhoto(entry)}
                    className="flex items-center gap-2.5 text-left hover:text-emerald-700 transition"
                  >
                    <img
                      src={entry.foto_url}
                      alt="Thumbnail"
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block truncate max-w-[150px]">
                        {entry.sub_tipe || entry.nama_kegiatan || `Entri #${entry.urutan_ke}`}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(entry.waktu_submit).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} WIB
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {entry.flag_foto_mencurigakan && (
                      <FlagBadge
                        reason={entry.alasan_flag}
                        onClick={() => onViewPhoto(entry)}
                      />
                    )}
                    <button
                      onClick={() => onViewPhoto(entry)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Button Action */}
      <div className="pt-2">
        {!isMaxReached ? (
          <button
            type="button"
            onClick={() => onOpenEntryModal(kebiasaan)}
            className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>
              {isCompleted ? `Isi Entri Berikutnya (${currentCount + 1}/${kebiasaan.maks_input_harian})` : 'Isi Bukti Jurnal'}
            </span>
          </button>
        ) : (
          <div className="w-full py-2 px-3 rounded-2xl bg-emerald-100/70 border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tuntas untuk Hari Ini</span>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Info,
  Loader2
} from 'lucide-react';
import { EntriJurnal, Kebiasaan, SumberFoto } from '../../types/database';
import { analyzePhotoExif } from '../../lib/exifHelper';
import { compressImage } from '../../lib/imageCompressor';
import { calculateStatusWaktu, getStatusWaktuLabel, isDailyEntryWindowOpen } from '../../lib/timeCalculator';
import { uploadBuktiFoto } from '../../lib/supabase';

interface HabitEntryModalProps {
  kebiasaan: Kebiasaan | null;
  existingEntries: EntriJurnal[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (newEntry: Omit<EntriJurnal, 'id' | 'waktu_submit'>) => void;
  studentId: string;
}

const BERMASYARAKAT_CHIPS = [
  'Bantu pekerjaan rumah',
  'Ngobrol sopan dengan tetangga',
  'Ikut kerja bakti lingkungan',
  'Menolong teman / keluarga',
  'Menjaga kebersihan lingkungan',
  'Membantu adik belajar'
];

export const HabitEntryModal: React.FC<HabitEntryModalProps> = ({
  kebiasaan,
  existingEntries,
  isOpen,
  onClose,
  onSubmitSuccess,
  studentId
}) => {
  if (!isOpen || !kebiasaan) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  
  // State form
  const [sumberFoto, setSumberFoto] = useState<SumberFoto>('kamera');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [waktuAmbilFoto, setWaktuAmbilFoto] = useState<Date>(new Date());
  const [flagFoto, setFlagFoto] = useState<boolean>(false);
  const [alasanFlag, setAlasanFlag] = useState<string | null>(null);
  const [subTipe, setSubTipe] = useState<string>('');
  const [namaKegiatan, setNamaKegiatan] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputCameraRef = useRef<HTMLInputElement>(null);
  const fileInputGalleryRef = useRef<HTMLInputElement>(null);

  // Sub-tipe yang sudah pernah diisi hari ini
  const usedSubTypes = existingEntries.map((e) => e.sub_tipe).filter(Boolean);

  // Status waktu realtime
  const estimatedStatusWaktu = calculateStatusWaktu(kebiasaan, waktuAmbilFoto);
  const { label: statusLabel, badgeColor: statusBadgeColor } = getStatusWaktuLabel(estimatedStatusWaktu);

  // Handle pemilihan foto kamera
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const now = new Date();
      setWaktuAmbilFoto(now);
      setSumberFoto('kamera');
      setFlagFoto(false);
      setAlasanFlag(null);

      // Buat preview lokal
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);

      // Kompresi di client
      const compressed = await compressImage(file, 1280, 0.8);
      setPhotoBlob(compressed);
    } catch (err) {
      console.error(err);
      setErrorMessage('Gagal memproses foto dari kamera');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle pemilihan foto galeri (Analisis EXIF via exifr)
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      setSumberFoto('upload');

      // 1. Ekstraksi EXIF sebelum dikompres
      const exifResult = await analyzePhotoExif(file, todayStr);
      
      if (exifResult.isSuspicious) {
        setFlagFoto(true);
        setAlasanFlag(exifResult.reason || 'Metadata mencurigakan');
        setWaktuAmbilFoto(exifResult.dateTimeOriginal || new Date());
      } else {
        setFlagFoto(false);
        setAlasanFlag(null);
        setWaktuAmbilFoto(exifResult.dateTimeOriginal || new Date());
      }

      // 2. Buat preview
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);

      // 3. Kompresi gambar
      const compressed = await compressImage(file, 1280, 0.8);
      setPhotoBlob(compressed);
    } catch (err) {
      console.error(err);
      setErrorMessage('Gagal membaca metadata gambar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const windowStatus = isDailyEntryWindowOpen(new Date());
    if (!windowStatus.isOpen) {
      setErrorMessage(windowStatus.message || 'Pengisian jurnal harian dibuka mulai pukul 01:00 s.d 24:00 WIB.');
      return;
    }

    if (!photoBlob && !photoPreview) {
      setErrorMessage('Wajib melampirkan foto bukti pelaksanaan kebiasaan!');
      return;
    }

    if (kebiasaan.butuh_sub_tipe && !subTipe) {
      setErrorMessage('Silakan pilih waktu sholat/ibadah terlebih dahulu!');
      return;
    }

    if (kebiasaan.butuh_nama_kegiatan && !namaKegiatan.trim()) {
      setErrorMessage('Silakan isi atau pilih nama kegiatan bermasyarakat!');
      return;
    }

    setIsProcessing(true);

    try {
      let finalFotoUrl = photoPreview || '';

      // Upload ke storage jika ada blob
      if (photoBlob) {
        const fileExt = 'jpg';
        const fileName = `${studentId}/${kebiasaan.id}_${Date.now()}.${fileExt}`;
        const uploadedUrl = await uploadBuktiFoto(photoBlob, fileName);
        if (uploadedUrl) {
          finalFotoUrl = uploadedUrl;
        }
      }

      const nextUrutanKe = existingEntries.length + 1;
      const finalStatusWaktu = calculateStatusWaktu(kebiasaan, waktuAmbilFoto);

      onSubmitSuccess({
        siswa_id: studentId,
        kebiasaan_id: kebiasaan.id,
        tanggal: todayStr,
        urutan_ke: nextUrutanKe,
        sub_tipe: kebiasaan.butuh_sub_tipe ? subTipe : null,
        nama_kegiatan: kebiasaan.butuh_nama_kegiatan ? namaKegiatan : null,
        catatan: catatan.trim() || null,
        foto_url: finalFotoUrl,
        sumber_foto: sumberFoto,
        waktu_ambil_foto: waktuAmbilFoto.toISOString(),
        flag_foto_mencurigakan: flagFoto,
        alasan_flag: alasanFlag,
        status_waktu: finalStatusWaktu
      });

      onClose();
    } catch (err: any) {
      console.error('Gagal simpan entri:', err);
      setErrorMessage(err.message || 'Gagal menyimpan entri jurnal');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-slide-up">
        {/* Header Modal */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              Isi Jurnal Kebiasaan #{kebiasaan.urutan}
            </span>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">
              {kebiasaan.nama}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
          {/* Info Aturan Jam & Toleransi */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Panduan Pelaksanaan:</span>
            </div>
            <p className="text-[11px] text-slate-500">{kebiasaan.deskripsi}</p>
            <div className="pt-1 flex items-center justify-between text-[11px] border-t border-slate-200/60 mt-1">
              <span className="font-medium text-slate-500">
                ⏰ Jam Operasional Jurnal: <strong className="text-slate-700">01:00 - 24:00 WIB</strong>
              </span>
              {kebiasaan.jam_mulai && kebiasaan.jam_selesai && (
                <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${statusBadgeColor}`}>
                  Status: {statusLabel}
                </span>
              )}
            </div>
            {kebiasaan.jam_mulai && kebiasaan.jam_selesai && (
              <div className="text-[11px] text-slate-600">
                🎯 Target Ideal: <strong>{kebiasaan.jam_mulai} - {kebiasaan.jam_selesai} WIB</strong>
                {kebiasaan.toleransi_menit > 0 && ` (+${kebiasaan.toleransi_menit}m toleransi)`}
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Pilih Sumber Foto */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Bukti Foto Pelaksanaan (Wajib)
            </label>

            {/* Hidden Inputs */}
            <input
              type="file"
              ref={fileInputCameraRef}
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputGalleryRef}
              accept="image/*"
              onChange={handleGalleryUpload}
              className="hidden"
            />

            {!photoPreview ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputCameraRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 transition text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-900 block">Ambil Foto Kamera</span>
                  <span className="text-[10px] text-emerald-600 mt-0.5">Waktu otomatis tercatat</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputGalleryRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 transition text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-blue-900 block">Unggah dari Galeri</span>
                  <span className="text-[10px] text-blue-600 mt-0.5">Deteksi otomatis EXIF</span>
                </button>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
                <img
                  src={photoPreview}
                  alt="Preview Bukti"
                  className="w-full h-44 object-cover"
                />
                
                {/* Overlay Change Photo */}
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoBlob(null);
                      setFlagFoto(false);
                      setAlasanFlag(null);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium backdrop-blur-sm transition"
                  >
                    Ganti Foto
                  </button>
                </div>

                <div className="absolute bottom-2 left-2">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-black/60 text-white backdrop-blur-sm">
                    {sumberFoto === 'kamera' ? '📷 Kamera Langsung' : '🖼️ Unggah Galeri'}
                  </span>
                </div>
              </div>
            )}

            {/* Peringatan Flag Deteksi Kecurangan (Non-blocking) */}
            {flagFoto && (
              <div className="mt-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block text-amber-800">
                    Catatan Verifikasi EXIF:
                  </strong>
                  <p className="text-amber-700 text-[11px] mt-0.5">{alasanFlag}</p>
                  <span className="text-[10px] text-amber-600 italic block mt-1">
                    *Anda tetap dapat mengirim jurnal. Catatan ini akan ditinjau oleh wali kelas.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Sub-Tipe (Khusus Beribadah: Sholat 5 Waktu) */}
          {kebiasaan.butuh_sub_tipe && kebiasaan.daftar_sub_tipe && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Pilih Waktu Sholat / Ibadah
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {kebiasaan.daftar_sub_tipe.map((tipe) => {
                  const isUsed = usedSubTypes.includes(tipe);
                  const isSelected = subTipe === tipe;

                  return (
                    <button
                      key={tipe}
                      type="button"
                      disabled={isUsed}
                      onClick={() => setSubTipe(tipe)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition text-center ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : isUsed
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <span>{tipe}</span>
                      {isUsed && <span className="block text-[9px] font-normal text-slate-400">Sudah</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Nama Kegiatan (Khusus Bermasyarakat) */}
          {kebiasaan.butuh_nama_kegiatan && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Kegiatan Bermasyarakat
              </label>
              
              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {BERMASYARAKAT_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setNamaKegiatan(chip)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                      namaKegiatan === chip
                        ? 'bg-purple-100 text-purple-900 border-purple-300 font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={namaKegiatan}
                onChange={(e) => setNamaKegiatan(e.target.value)}
                placeholder="Contoh: Kerja bakti bersihkan selokan..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          )}

          {/* 4. Catatan Refleksi (Opsional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan / Refleksi Diri (Opsional)
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Ceritakan perasaan atau hal bermanfaat yang kamu rasakan..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Footer Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kirim Bukti Jurnal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

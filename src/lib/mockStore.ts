import { ArahanWaliKelas, EntriJurnal, Feedback, Kebiasaan, Kelas, LogHapus, Siswa, StafSekolah } from '../types/database';
import { 
  ALL_INITIAL_SISWA, 
  INITIAL_ARAHAN, 
  INITIAL_ENTRI, 
  INITIAL_FEEDBACK, 
  INITIAL_KEBIASAAN, 
  INITIAL_KELAS, 
  INITIAL_LOG_HAPUS, 
  INITIAL_STAF 
} from './mockData';

const STORAGE_KEYS = {
  KEBIASAAN: 'jurnal_7k_kebiasaan',
  KELAS: 'jurnal_7k_kelas',
  STAF: 'jurnal_7k_staf',
  SISWA: 'jurnal_7k_siswa',
  ENTRI: 'jurnal_7k_entri',
  FEEDBACK: 'jurnal_7k_feedback',
  ARAHAN: 'jurnal_7k_arahan_wali_kelas',
  LOG_HAPUS: 'jurnal_7k_log_hapus'
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed saving to localStorage', e);
  }
}

export class MockDatabase {
  static getKebiasaan(): Kebiasaan[] {
    return getStored(STORAGE_KEYS.KEBIASAAN, INITIAL_KEBIASAAN);
  }

  static getKelas(): Kelas[] {
    return getStored(STORAGE_KEYS.KELAS, INITIAL_KELAS);
  }

  static getStaf(): StafSekolah[] {
    return getStored(STORAGE_KEYS.STAF, INITIAL_STAF);
  }

  static getSiswa(): Siswa[] {
    return getStored(STORAGE_KEYS.SISWA, ALL_INITIAL_SISWA);
  }

  static getEntriJurnal(): EntriJurnal[] {
    return getStored(STORAGE_KEYS.ENTRI, INITIAL_ENTRI);
  }

  static getFeedback(): Feedback[] {
    return getStored(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
  }

  static getArahanWaliKelas(): ArahanWaliKelas[] {
    return getStored(STORAGE_KEYS.ARAHAN, INITIAL_ARAHAN);
  }

  static getLogHapus(): LogHapus[] {
    return getStored(STORAGE_KEYS.LOG_HAPUS, INITIAL_LOG_HAPUS);
  }

  static addEntriJurnal(newEntry: Omit<EntriJurnal, 'id' | 'waktu_submit'>): EntriJurnal {
    const current = this.getEntriJurnal();
    const entry: EntriJurnal = {
      ...newEntry,
      id: 'entry-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      waktu_submit: new Date().toISOString()
    };
    
    const existingIndex = current.findIndex(
      (e) => e.siswa_id === entry.siswa_id && 
             e.tanggal === entry.tanggal && 
             e.kebiasaan_id === entry.kebiasaan_id && 
             e.urutan_ke === entry.urutan_ke
    );

    let updated: EntriJurnal[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = entry;
    } else {
      updated = [entry, ...current];
    }

    setStored(STORAGE_KEYS.ENTRI, updated);
    return entry;
  }

  static deleteEntriJurnal(entriId: string, stafId: string, alasan: string): boolean {
    const currentEntries = this.getEntriJurnal();
    const target = currentEntries.find((e) => e.id === entriId);
    if (!target) return false;

    const log: LogHapus = {
      id: 'log-' + Date.now(),
      entri_id: entriId,
      data_terhapus: target,
      dihapus_oleh: stafId,
      alasan: alasan,
      waktu: new Date().toISOString()
    };

    const currentLogs = this.getLogHapus();
    setStored(STORAGE_KEYS.LOG_HAPUS, [log, ...currentLogs]);

    const remaining = currentEntries.filter((e) => e.id !== entriId);
    setStored(STORAGE_KEYS.ENTRI, remaining);

    return true;
  }

  static addFeedback(stafId: string, siswaId: string, entriId: string | null, komentar: string): Feedback {
    const current = this.getFeedback();
    const newFb: Feedback = {
      id: 'fb-' + Date.now(),
      staf_id: stafId,
      siswa_id: siswaId,
      entri_id: entriId,
      komentar,
      created_at: new Date().toISOString()
    };

    setStored(STORAGE_KEYS.FEEDBACK, [newFb, ...current]);
    return newFb;
  }

  static addArahanWaliKelas(
    stafPengirimId: string, 
    kelasId: string, 
    kategori: 'apresiasi' | 'evaluasi' | 'instruksi' | 'tindak_lanjut',
    judul: string,
    pesan: string
  ): ArahanWaliKelas {
    const current = this.getArahanWaliKelas();
    const newArahan: ArahanWaliKelas = {
      id: 'arahan-' + Date.now(),
      staf_pengirim_id: stafPengirimId,
      kelas_id: kelasId,
      kategori,
      judul,
      pesan,
      created_at: new Date().toISOString(),
      dibaca: false
    };

    setStored(STORAGE_KEYS.ARAHAN, [newArahan, ...current]);
    return newArahan;
  }

  static markArahanRead(arahanId: string): void {
    const current = this.getArahanWaliKelas();
    const updated = current.map(a => a.id === arahanId ? { ...a, dibaca: true } : a);
    setStored(STORAGE_KEYS.ARAHAN, updated);
  }

  static deleteArahan(arahanId: string): void {
    const current = this.getArahanWaliKelas();
    const updated = current.filter(a => a.id !== arahanId);
    setStored(STORAGE_KEYS.ARAHAN, updated);
  }

  static updatePassword(type: 'siswa' | 'staf', id: string): boolean {
    if (type === 'siswa') {
      const allSiswa = this.getSiswa();
      const idx = allSiswa.findIndex((s) => s.id === id);
      if (idx >= 0) {
        allSiswa[idx].sudah_ganti_password = true;
        setStored(STORAGE_KEYS.SISWA, allSiswa);
        return true;
      }
    } else {
      const allStaf = this.getStaf();
      const idx = allStaf.findIndex((s) => s.id === id);
      if (idx >= 0) {
        allStaf[idx].sudah_ganti_password = true;
        setStored(STORAGE_KEYS.STAF, allStaf);
        return true;
      }
    }
    return false;
  }

  /**
   * Import Siswa (Opsi Replace all atau Merge)
   */
  static importSiswa(newStudents: Siswa[], replaceAll: boolean = true): void {
    if (replaceAll) {
      setStored(STORAGE_KEYS.SISWA, newStudents);
    } else {
      const current = this.getSiswa();
      const map = new Map<string, Siswa>();
      current.forEach((s) => map.set(s.nisn, s));
      newStudents.forEach((s) => map.set(s.nisn, s));
      setStored(STORAGE_KEYS.SISWA, Array.from(map.values()));
    }
  }

  /**
   * Import Staf Sekolah (Opsi Replace all kecuali superadmin atau Merge)
   */
  static importStaf(newStaffList: StafSekolah[], replaceAll: boolean = true): void {
    if (replaceAll) {
      // Pastikan Superadmin Aji Bagus Khoiri tetap terjaga
      const current = this.getStaf();
      const superAdmin = current.find(s => s.role === 'superadmin' || s.nip_atau_nik === 'ajibaguskhoiri') || {
        id: 'staf-superadmin-aji',
        nama: 'Aji Bagus Khoiri (Superadmin)',
        role: 'superadmin' as const,
        status_asn: true,
        nip_atau_nik: 'ajibaguskhoiri',
        kelas_id: null,
        scope: 'sekolah' as const,
        sudah_ganti_password: true
      };

      const filtered = newStaffList.filter(s => s.nip_atau_nik !== 'ajibaguskhoiri');
      setStored(STORAGE_KEYS.STAF, [superAdmin, ...filtered]);
    } else {
      const current = this.getStaf();
      const map = new Map<string, StafSekolah>();
      current.forEach((st) => map.set(st.nip_atau_nik, st));
      newStaffList.forEach((st) => map.set(st.nip_atau_nik, st));
      setStored(STORAGE_KEYS.STAF, Array.from(map.values()));
    }
  }

  static updateKebiasaan(updatedHabit: Kebiasaan): void {
    const current = this.getKebiasaan();
    const idx = current.findIndex(k => k.id === updatedHabit.id);
    if (idx >= 0) {
      current[idx] = updatedHabit;
      setStored(STORAGE_KEYS.KEBIASAAN, current);
    }
  }

  static resetToDefault(): void {
    setStored(STORAGE_KEYS.KEBIASAAN, INITIAL_KEBIASAAN);
    setStored(STORAGE_KEYS.KELAS, INITIAL_KELAS);
    setStored(STORAGE_KEYS.STAF, INITIAL_STAF);
    setStored(STORAGE_KEYS.SISWA, ALL_INITIAL_SISWA);
    setStored(STORAGE_KEYS.ENTRI, INITIAL_ENTRI);
    setStored(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
    setStored(STORAGE_KEYS.ARAHAN, INITIAL_ARAHAN);
    setStored(STORAGE_KEYS.LOG_HAPUS, INITIAL_LOG_HAPUS);
  }
}

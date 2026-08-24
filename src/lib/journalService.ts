import { isSupabaseConfigured, supabase } from './supabase';
import { MockDatabase } from './mockStore';
import { 
  ArahanWaliKelas, 
  EntriJurnal, 
  Feedback, 
  Kebiasaan, 
  Kelas, 
  LogHapus, 
  Siswa, 
  StafSekolah 
} from '../types/database';

export class JournalService {
  /**
   * Mengambil data Kebiasaan
   */
  static async getKebiasaan(): Promise<Kebiasaan[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('kebiasaan')
          .select('*')
          .order('urutan', { ascending: true });
        if (!error && data && data.length > 0) return data as Kebiasaan[];
      } catch (e) {
        console.warn('Fallback to local store for kebiasaan:', e);
      }
    }
    return MockDatabase.getKebiasaan();
  }

  /**
   * Mengambil data Kelas
   */
  static async getKelas(): Promise<Kelas[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('kelas')
          .select('*, wali_kelas:staf_sekolah(*)');
        if (!error && data && data.length > 0) return data as Kelas[];
      } catch (e) {
        console.warn('Fallback to local store for kelas:', e);
      }
    }
    return MockDatabase.getKelas();
  }

  /**
   * Mengambil data Siswa
   */
  static async getSiswa(kelasId?: string): Promise<Siswa[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('siswa').select('*, kelas(*)');
        if (kelasId && kelasId !== 'all') {
          query = query.eq('kelas_id', kelasId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Siswa[];
      } catch (e) {
        console.warn('Fallback to local store for siswa:', e);
      }
    }
    const local = MockDatabase.getSiswa();
    if (kelasId && kelasId !== 'all') {
      return local.filter((s) => s.kelas_id === kelasId);
    }
    return local;
  }

  /**
   * Mengambil data Staf Sekolah
   */
  static async getStaf(): Promise<StafSekolah[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('staf_sekolah')
          .select('*, kelas(*)');
        if (!error && data && data.length > 0) return data as StafSekolah[];
      } catch (e) {
        console.warn('Fallback to local store for staf:', e);
      }
    }
    return MockDatabase.getStaf();
  }

  /**
   * Mengambil Entri Jurnal
   */
  static async getEntriJurnal(tanggal?: string, siswaId?: string): Promise<EntriJurnal[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('entri_jurnal').select('*, siswa(*), kebiasaan(*)');
        if (tanggal) query = query.eq('tanggal', tanggal);
        if (siswaId) query = query.eq('siswa_id', siswaId);
        const { data, error } = await query;
        if (!error && data) return data as EntriJurnal[];
      } catch (e) {
        console.warn('Fallback to local store for entries:', e);
      }
    }
    let local = MockDatabase.getEntriJurnal();
    if (tanggal) local = local.filter((e) => e.tanggal === tanggal);
    if (siswaId) local = local.filter((e) => e.siswa_id === siswaId);
    return local;
  }

  /**
   * Mengambil Arahan Wali Kelas
   */
  static async getArahanWaliKelas(kelasId?: string): Promise<ArahanWaliKelas[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('arahan_wali_kelas')
          .select('*, staf_pengirim:staf_sekolah(*), kelas(*)')
          .order('created_at', { ascending: false });
        if (kelasId) query = query.eq('kelas_id', kelasId);
        const { data, error } = await query;
        if (!error && data) return data as ArahanWaliKelas[];
      } catch (e) {
        console.warn('Fallback to local store for arahan:', e);
      }
    }
    let local = MockDatabase.getArahanWaliKelas();
    if (kelasId) local = local.filter((a) => a.kelas_id === kelasId);
    return local;
  }

  /**
   * Menyimpan Entri Jurnal Siswa
   */
  static async submitEntriJurnal(
    entry: Omit<EntriJurnal, 'id' | 'waktu_submit'>
  ): Promise<EntriJurnal> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('entri_jurnal')
          .upsert(entry, { onConflict: 'siswa_id,tanggal,kebiasaan_id,urutan_ke' })
          .select()
          .single();
        if (!error && data) {
          MockDatabase.addEntriJurnal(entry);
          return data as EntriJurnal;
        }
      } catch (e) {
        console.warn('Failed remote save, falling back to local:', e);
      }
    }
    return MockDatabase.addEntriJurnal(entry);
  }

  /**
   * Mengirim Arahan ke Wali Kelas
   */
  static async sendArahanWaliKelas(
    stafPengirimId: string,
    kelasId: string,
    kategori: 'apresiasi' | 'evaluasi' | 'instruksi' | 'tindak_lanjut',
    judul: string,
    pesan: string
  ): Promise<ArahanWaliKelas> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('arahan_wali_kelas')
          .insert({
            staf_pengirim_id: stafPengirimId,
            kelas_id: kelasId,
            kategori,
            judul,
            pesan
          })
          .select()
          .single();
        if (!error && data) {
          MockDatabase.addArahanWaliKelas(stafPengirimId, kelasId, kategori, judul, pesan);
          return data as ArahanWaliKelas;
        }
      } catch (e) {
        console.warn('Failed remote insert arahan, using local:', e);
      }
    }
    return MockDatabase.addArahanWaliKelas(stafPengirimId, kelasId, kategori, judul, pesan);
  }
}

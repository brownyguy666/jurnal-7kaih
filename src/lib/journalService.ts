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
   * Melakukan inisialisasi sinkronisasi dari Supabase Cloud ke Local Cache
   */
  static async initCloudSync(): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      // Parallel fetch dari Supabase Cloud
      const [kebRes, kelasRes, siswaRes, stafRes, entriRes, arahanRes, fbRes] = await Promise.all([
        supabase.from('kebiasaan').select('*').order('urutan', { ascending: true }),
        supabase.from('kelas').select('*').order('tingkat', { ascending: true }),
        supabase.from('siswa').select('*'),
        supabase.from('staf_sekolah').select('*'),
        supabase.from('entri_jurnal').select('*'),
        supabase.from('arahan_wali_kelas').select('*').order('created_at', { ascending: false }),
        supabase.from('feedback').select('*')
      ]);

      if (kebRes.data && kebRes.data.length > 0) {
        MockDatabase.syncKebiasaanFromRemote(kebRes.data as Kebiasaan[]);
      }
      if (kelasRes.data && kelasRes.data.length > 0) {
        MockDatabase.syncKelasFromRemote(kelasRes.data as Kelas[]);
      }
      if (siswaRes.data && siswaRes.data.length > 0) {
        MockDatabase.syncSiswaFromRemote(siswaRes.data as Siswa[]);
      }
      if (stafRes.data && stafRes.data.length > 0) {
        MockDatabase.syncStafFromRemote(stafRes.data as StafSekolah[]);
      }
      if (entriRes.data && entriRes.data.length > 0) {
        MockDatabase.syncEntriFromRemote(entriRes.data as EntriJurnal[]);
      }
    } catch (e) {
      console.warn('initCloudSync warning:', e);
    }
  }

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
        if (!error && data && data.length > 0) {
          MockDatabase.syncKebiasaanFromRemote(data as Kebiasaan[]);
          return data as Kebiasaan[];
        }
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
          .select('*')
          .order('nama_kelas', { ascending: true });
        if (!error && data && data.length > 0) {
          MockDatabase.syncKelasFromRemote(data as Kelas[]);
          return data as Kelas[];
        }
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
        let query = supabase.from('siswa').select('*');
        if (kelasId && kelasId !== 'all') {
          query = query.eq('kelas_id', kelasId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          MockDatabase.syncSiswaFromRemote(data as Siswa[]);
          return data as Siswa[];
        }
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
          .select('*');
        if (!error && data && data.length > 0) {
          MockDatabase.syncStafFromRemote(data as StafSekolah[]);
          return data as StafSekolah[];
        }
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
        let query = supabase.from('entri_jurnal').select('*');
        if (tanggal) query = query.eq('tanggal', tanggal);
        if (siswaId) query = query.eq('siswa_id', siswaId);
        const { data, error } = await query;
        if (!error && data) {
          return data as EntriJurnal[];
        }
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
          .select('*')
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
   * Menyimpan Entri Jurnal Siswa ke Cloud & Local
   */
  static async submitEntriJurnal(
    entry: Omit<EntriJurnal, 'id' | 'waktu_submit'>
  ): Promise<EntriJurnal> {
    const localEntry = MockDatabase.addEntriJurnal(entry);
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('entri_jurnal')
          .upsert({
            siswa_id: entry.siswa_id,
            kebiasaan_id: entry.kebiasaan_id,
            tanggal: entry.tanggal,
            urutan_ke: entry.urutan_ke,
            sub_tipe: entry.sub_tipe,
            nama_kegiatan: entry.nama_kegiatan,
            foto_url: entry.foto_url,
            sumber_foto: entry.sumber_foto,
            waktu_ambil_foto: entry.waktu_ambil_foto ? new Date(entry.waktu_ambil_foto).toISOString() : null,
            status_waktu: entry.status_waktu,
            flag_foto_mencurigakan: entry.flag_foto_mencurigakan,
            alasan_flag: entry.alasan_flag,
            catatan: entry.catatan
          });
      } catch (e) {
        console.warn('Failed remote save entri:', e);
      }
    }
    return localEntry;
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
    const localArahan = MockDatabase.addArahanWaliKelas(stafPengirimId, kelasId, kategori, judul, pesan);
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('arahan_wali_kelas')
          .insert({
            staf_pengirim_id: stafPengirimId,
            kelas_id: kelasId,
            kategori,
            judul,
            pesan
          });
      } catch (e) {
        console.warn('Failed remote insert arahan:', e);
      }
    }
    return localArahan;
  }

  /**
   * Impor Massal Siswa ke Cloud Supabase & Local Cache
   */
  static async importSiswa(students: Siswa[], replaceAll: boolean): Promise<void> {
    MockDatabase.importSiswa(students, replaceAll);

    if (isSupabaseConfigured) {
      try {
        if (replaceAll) {
          // Bersihkan data lama jika mode replace
          await supabase.from('siswa').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }

        // Format data untuk Supabase
        const payload = students.map(s => ({
          nisn: s.nisn,
          nama: s.nama,
          kelas_id: s.kelas_id,
          tanggal_lahir: s.tanggal_lahir,
          sudah_ganti_password: s.sudah_ganti_password || false
        }));

        // Batch insert dalam chunks of 100
        const chunkSize = 100;
        for (let i = 0; i < payload.length; i += chunkSize) {
          const chunk = payload.slice(i, i + chunkSize);
          await supabase.from('siswa').upsert(chunk, { onConflict: 'nisn' });
        }
      } catch (e) {
        console.error('Gagal sync import siswa ke Supabase Cloud:', e);
      }
    }
  }

  /**
   * Impor Massal Staf ke Cloud Supabase & Local Cache
   */
  static async importStaf(staffList: StafSekolah[], replaceAll: boolean): Promise<void> {
    MockDatabase.importStaf(staffList, replaceAll);

    if (isSupabaseConfigured) {
      try {
        const payload = staffList.map(st => ({
          nip_atau_nik: st.nip_atau_nik,
          nama: st.nama,
          role: st.role,
          status_asn: st.status_asn,
          tanggal_lahir: st.tanggal_lahir,
          kelas_id: st.kelas_id,
          scope: st.scope,
          sudah_ganti_password: st.sudah_ganti_password || false
        }));

        const chunkSize = 50;
        for (let i = 0; i < payload.length; i += chunkSize) {
          const chunk = payload.slice(i, i + chunkSize);
          await supabase.from('staf_sekolah').upsert(chunk, { onConflict: 'nip_atau_nik' });
        }
      } catch (e) {
        console.error('Gagal sync import staf ke Supabase Cloud:', e);
      }
    }
  }
}

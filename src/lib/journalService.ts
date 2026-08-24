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
      // Parallel fetch dari Supabase Cloud dengan limit besar (tanpa terpotong default 500)
      const [kebRes, kelasRes, siswaRes, stafRes, entriRes, arahanRes, fbRes] = await Promise.all([
        supabase.from('kebiasaan').select('*').order('urutan', { ascending: true }),
        supabase.from('kelas').select('*').order('nama_kelas', { ascending: true }),
        supabase.from('siswa').select('*').order('nama', { ascending: true }).limit(5000),
        supabase.from('staf_sekolah').select('*').order('nama', { ascending: true }).limit(500),
        supabase.from('entri_jurnal').select('*').limit(10000),
        supabase.from('arahan_wali_kelas').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('feedback').select('*').limit(1000)
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
   * Mengambil data Siswa (hingga 5000 data tanpa batas limit 500)
   */
  static async getSiswa(kelasId?: string): Promise<Siswa[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('siswa')
          .select('*')
          .order('nama', { ascending: true })
          .limit(5000);

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
          .select('*')
          .order('nama', { ascending: true })
          .limit(500);
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
        let query = supabase.from('entri_jurnal').select('*').limit(10000);
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
          .order('created_at', { ascending: false })
          .limit(500);
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
   * Impor Massal Siswa ke Cloud Supabase & Local Cache dengan UUID Resolver
   */
  static async importSiswa(students: Siswa[], replaceAll: boolean): Promise<void> {
    MockDatabase.importSiswa(students, replaceAll);

    if (isSupabaseConfigured) {
      try {
        // Ambil daftar kelas asli dari Supabase untuk mapping UUID yang valid
        const { data: dbKelasList } = await supabase.from('kelas').select('id, nama_kelas');
        const kelasUuidMap = new Map<string, string>();
        
        if (dbKelasList) {
          dbKelasList.forEach(k => {
            kelasUuidMap.set(k.nama_kelas.toUpperCase().trim(), k.id);
          });
        }

        const defaultKelas7AUuid = kelasUuidMap.get('7A') || dbKelasList?.[0]?.id;

        if (replaceAll) {
          // Bersihkan data lama jika mode replace
          await supabase.from('siswa').delete().neq('nama', '___RESERVED_NEVER_MATCH___');
        }

        // Format data untuk Supabase dengan UUID yang dipastikan valid
        const payload = students.map(s => {
          let resolvedKelasId = s.kelas_id;
          
          // Jika kelas_id berupa format string lokal (k-7a, 7A, dll), konversi ke UUID Supabase
          if (!resolvedKelasId || resolvedKelasId.startsWith('k-') || resolvedKelasId.length < 30) {
            const cleanName = (s as any).kelas_name || resolvedKelasId?.replace('k-', '').toUpperCase() || '7A';
            resolvedKelasId = kelasUuidMap.get(cleanName) || defaultKelas7AUuid;
          }

          return {
            nisn: String(s.nisn).trim(),
            nama: String(s.nama).trim(),
            kelas_id: resolvedKelasId,
            tanggal_lahir: s.tanggal_lahir,
            sudah_ganti_password: s.sudah_ganti_password || false
          };
        });

        // Batch upsert dalam chunks of 50
        const chunkSize = 50;
        for (let i = 0; i < payload.length; i += chunkSize) {
          const chunk = payload.slice(i, i + chunkSize);
          const { error } = await supabase.from('siswa').upsert(chunk, { onConflict: 'nisn' });
          if (error) {
            console.error(`Error import siswa chunk [${i}..${i + chunkSize}]:`, error.message);
          }
        }

        // Re-sync local cache
        const { data: refreshedSiswa } = await supabase.from('siswa').select('*').limit(5000);
        if (refreshedSiswa) {
          MockDatabase.syncSiswaFromRemote(refreshedSiswa as Siswa[]);
        }
      } catch (e) {
        console.error('Gagal sync import siswa ke Supabase Cloud:', e);
      }
    }
  }

  /**
   * Impor Massal Staf ke Cloud Supabase & Local Cache dengan UUID Resolver
   */
  static async importStaf(staffList: StafSekolah[], replaceAll: boolean): Promise<void> {
    MockDatabase.importStaf(staffList, replaceAll);

    if (isSupabaseConfigured) {
      try {
        // Ambil daftar kelas asli dari Supabase untuk mapping UUID yang valid
        const { data: dbKelasList } = await supabase.from('kelas').select('id, nama_kelas');
        const kelasUuidMap = new Map<string, string>();
        
        if (dbKelasList) {
          dbKelasList.forEach(k => {
            kelasUuidMap.set(k.nama_kelas.toUpperCase().trim(), k.id);
          });
        }

        if (replaceAll) {
          // Jangan hapus akun superadmin saat replace
          await supabase.from('staf_sekolah').delete().neq('role', 'superadmin');
        }

        const payload = staffList.map(st => {
          let resolvedKelasId: string | null = null;
          if (st.role === 'wali_kelas') {
            const rawK = st.kelas_id ? String(st.kelas_id).replace('k-', '').toUpperCase().trim() : '';
            resolvedKelasId = kelasUuidMap.get(rawK) || null;
          }

          return {
            nip_atau_nik: String(st.nip_atau_nik).trim(),
            nama: String(st.nama).trim(),
            role: st.role,
            status_asn: st.status_asn,
            tanggal_lahir: st.tanggal_lahir,
            kelas_id: resolvedKelasId,
            scope: st.scope,
            sudah_ganti_password: st.sudah_ganti_password || false
          };
        });

        const chunkSize = 20;
        for (let i = 0; i < payload.length; i += chunkSize) {
          const chunk = payload.slice(i, i + chunkSize);
          const { error } = await supabase.from('staf_sekolah').upsert(chunk, { onConflict: 'nip_atau_nik' });
          if (error) {
            console.error(`Error import staf chunk [${i}..${i + chunkSize}]:`, error.message);
          }
        }

        // Re-sync local cache
        const { data: refreshedStaf } = await supabase.from('staf_sekolah').select('*').limit(500);
        if (refreshedStaf) {
          MockDatabase.syncStafFromRemote(refreshedStaf as StafSekolah[]);
        }
      } catch (e) {
        console.error('Gagal sync import staf ke Supabase Cloud:', e);
      }
    }
  }
}

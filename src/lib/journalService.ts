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
      const [kebRes, kelasRes, siswaRes, stafRes, entriRes, arahanRes, fbRes] = await Promise.all([
        supabase.from('kebiasaan').select('*').order('urutan', { ascending: true }),
        supabase.from('kelas').select('*').order('nama_kelas', { ascending: true }),
        supabase.from('siswa').select('*').order('nama', { ascending: true }).limit(5000),
        supabase.from('staf_sekolah').select('*').order('nama', { ascending: true }).limit(500),
        supabase.from('entri_jurnal').select('*').order('waktu_submit', { ascending: false }).limit(10000),
        supabase.from('arahan_wali_kelas').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(1000)
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
      if (arahanRes.data && arahanRes.data.length > 0) {
        MockDatabase.syncArahanFromRemote(arahanRes.data as ArahanWaliKelas[]);
      }
      if (fbRes.data && fbRes.data.length > 0) {
        MockDatabase.syncFeedbackFromRemote(fbRes.data as Feedback[]);
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
   * Mengupdate data Kebiasaan
   */
  static async updateKebiasaan(updated: Kebiasaan | Kebiasaan[]): Promise<void> {
    MockDatabase.updateKebiasaan(updated);
    if (isSupabaseConfigured) {
      try {
        const list = Array.isArray(updated) ? updated : [updated];
        await supabase.from('kebiasaan').upsert(list);
      } catch (e) {
        console.warn('Failed remote update kebiasaan:', e);
      }
    }
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
        if (!error && data) {
          if (!kelasId || kelasId === 'all') {
            MockDatabase.syncSiswaFromRemote(data as Siswa[]);
          }
          return data as Siswa[];
        }
      } catch (e) {
        console.warn('Fallback to local store for siswa:', e);
      }
    }
    const local = MockDatabase.getSiswa();
    if (kelasId && kelasId !== 'all') {
      const clean = kelasId.replace(/^k-/i, '').toUpperCase();
      return local.filter((s) => s.kelas_id === kelasId || s.kelas_id?.replace(/^k-/i, '').toUpperCase() === clean);
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
   * Mengambil Entri Jurnal dari Cloud Supabase & Local Cache dengan Pagination Lengkap
   * Mengatasi batas 1.000 baris PostgREST agar data seluruh tanggal tidak terpotong
   */
  static async getEntriJurnal(tanggal?: string, siswaId?: string): Promise<EntriJurnal[]> {
    if (isSupabaseConfigured) {
      try {
        let allData: EntriJurnal[] = [];
        let from = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          let query = supabase
            .from('entri_jurnal')
            .select('*')
            .order('waktu_submit', { ascending: false })
            .range(from, from + pageSize - 1);

          if (tanggal) query = query.eq('tanggal', tanggal);
          if (siswaId) query = query.eq('siswa_id', siswaId);

          const { data, error } = await query;
          if (error) {
            console.error('Error fetching journal entries chunk:', error);
            break;
          }

          if (data && data.length > 0) {
            allData = allData.concat(data as EntriJurnal[]);
            if (data.length < pageSize) {
              hasMore = false;
            } else {
              from += pageSize;
            }
          } else {
            hasMore = false;
          }
        }

        if (allData.length > 0) {
          MockDatabase.syncEntriFromRemote(allData);
          return allData;
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
   * Menyimpan Entri Jurnal Siswa ke Cloud & Local
   */
  static async submitEntriJurnal(
    entry: Omit<EntriJurnal, 'id' | 'waktu_submit'>
  ): Promise<EntriJurnal> {
    const localEntry = MockDatabase.addEntriJurnal(entry);
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('entri_jurnal')
          .upsert({
            siswa_id: entry.siswa_id,
            kebiasaan_id: entry.kebiasaan_id,
            tanggal: entry.tanggal,
            urutan_ke: entry.urutan_ke,
            sub_tipe: entry.sub_tipe || null,
            nama_kegiatan: entry.nama_kegiatan || null,
            foto_url: entry.foto_url,
            sumber_foto: entry.sumber_foto,
            waktu_ambil_foto: entry.waktu_ambil_foto ? new Date(entry.waktu_ambil_foto).toISOString() : null,
            status_waktu: entry.status_waktu,
            flag_foto_mencurigakan: entry.flag_foto_mencurigakan || false,
            alasan_flag: entry.alasan_flag || null,
            catatan: entry.catatan || null
          }, { onConflict: 'siswa_id, tanggal, kebiasaan_id, urutan_ke' })
          .select()
          .single();

        if (error) {
          console.error('Error saving entry to Supabase:', error);
        } else if (data) {
          return data as EntriJurnal;
        }
      } catch (e) {
        console.warn('Failed remote save entri:', e);
      }
    }
    return localEntry;
  }

  /**
   * Menghapus Entri Jurnal (Wali Kelas / Superadmin)
   */
  static async deleteEntriJurnal(entriId: string, stafId: string, alasan: string): Promise<boolean> {
    MockDatabase.deleteEntriJurnal(entriId, stafId, alasan);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('entri_jurnal').delete().eq('id', entriId);
        await supabase.from('log_hapus').insert({
          entri_id: entriId,
          dihapus_oleh: stafId,
          alasan: alasan,
          waktu: new Date().toISOString()
        });
        return true;
      } catch (e) {
        console.warn('Failed remote delete entri:', e);
      }
    }
    return true;
  }

  /**
   * Mengambil Feedback Guru ke Siswa
   */
  static async getFeedback(siswaId?: string): Promise<Feedback[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(1000);
        if (siswaId) query = query.eq('siswa_id', siswaId);
        const { data, error } = await query;
        if (!error && data) {
          return data as Feedback[];
        }
      } catch (e) {
        console.warn('Fallback to local store for feedback:', e);
      }
    }
    const local = MockDatabase.getFeedback();
    if (siswaId) return local.filter(f => f.siswa_id === siswaId);
    return local;
  }

  /**
   * Menambah Feedback dari Guru ke Siswa
   */
  static async addFeedback(
    stafId: string, 
    siswaId: string, 
    entriId: string | null, 
    komentar: string
  ): Promise<Feedback> {
    const localFb = MockDatabase.addFeedback(stafId, siswaId, entriId, komentar);
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('feedback')
          .insert({
            staf_id: stafId,
            siswa_id: siswaId,
            entri_id: entriId,
            komentar
          })
          .select()
          .single();
        if (data) return data as Feedback;
      } catch (e) {
        console.warn('Failed remote insert feedback:', e);
      }
    }
    return localFb;
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
        const { data } = await supabase
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
        if (data) return data as ArahanWaliKelas;
      } catch (e) {
        console.warn('Failed remote insert arahan:', e);
      }
    }
    return localArahan;
  }

  /**
   * Menandai Arahan Terbaca
   */
  static async markArahanRead(arahanId: string): Promise<void> {
    MockDatabase.markArahanRead(arahanId);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('arahan_wali_kelas').update({ dibaca: true }).eq('id', arahanId);
      } catch (e) {
        console.warn('Failed remote mark arahan read:', e);
      }
    }
  }

  /**
   * Menghapus Arahan Wali Kelas
   */
  static async deleteArahan(arahanId: string): Promise<void> {
    MockDatabase.deleteArahan(arahanId);
    if (isSupabaseConfigured) {
      try {
        await supabase.from('arahan_wali_kelas').delete().eq('id', arahanId);
      } catch (e) {
        console.warn('Failed remote delete arahan:', e);
      }
    }
  }

  /**
   * Impor Massal Siswa ke Cloud Supabase & Local Cache dengan UUID Resolver
   */
  static async importSiswa(students: Siswa[], replaceAll: boolean): Promise<void> {
    MockDatabase.importSiswa(students, replaceAll);

    if (isSupabaseConfigured) {
      try {
        const { data: dbKelasList } = await supabase.from('kelas').select('id, nama_kelas');
        const kelasUuidMap = new Map<string, string>();
        
        if (dbKelasList) {
          dbKelasList.forEach(k => {
            kelasUuidMap.set(k.nama_kelas.toUpperCase().trim(), k.id);
          });
        }

        const defaultKelas7AUuid = kelasUuidMap.get('7A') || dbKelasList?.[0]?.id;

        if (replaceAll) {
          await supabase.from('siswa').delete().neq('nama', '___RESERVED_NEVER_MATCH___');
        }

        const payload = students.map(s => {
          let resolvedKelasId = s.kelas_id;
          
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

        const chunkSize = 50;
        for (let i = 0; i < payload.length; i += chunkSize) {
          const chunk = payload.slice(i, i + chunkSize);
          const { error } = await supabase.from('siswa').upsert(chunk, { onConflict: 'nisn' });
          if (error) {
            console.error(`Error import siswa chunk [${i}..${i + chunkSize}]:`, error.message);
          }
        }

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
        const { data: dbKelasList } = await supabase.from('kelas').select('id, nama_kelas');
        const kelasUuidMap = new Map<string, string>();
        
        if (dbKelasList) {
          dbKelasList.forEach(k => {
            kelasUuidMap.set(k.nama_kelas.toUpperCase().trim(), k.id);
          });
        }

        if (replaceAll) {
          await supabase.from('staf_sekolah').delete().neq('role', 'superadmin');
        }

        const payload = staffList.map(st => {
          let resolvedKelasId: string | null = null;
          if (st.role === 'wali_kelas') {
            const rawK = st.kelas_id ? String(st.kelas_id).replace(/^k-/i, '').toUpperCase().trim() : '';
            resolvedKelasId = kelasUuidMap.get(rawK) || dbKelasList?.find(k => k.id === st.kelas_id)?.id || null;
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
            if (error.message.includes('tanggal_lahir')) {
              const fallbackChunk = chunk.map(({ tanggal_lahir, ...rest }) => rest);
              await supabase.from('staf_sekolah').upsert(fallbackChunk, { onConflict: 'nip_atau_nik' });
            }
          }
        }

        const { data: refreshedStaf } = await supabase.from('staf_sekolah').select('*').limit(500);
        if (refreshedStaf && refreshedStaf.length > 0) {
          MockDatabase.syncStafFromRemote(refreshedStaf as StafSekolah[]);
          // Update kelas.wali_kelas_id in Supabase
          for (const st of refreshedStaf) {
            if (st.role === 'wali_kelas' && st.kelas_id) {
              await supabase.from('kelas').update({ wali_kelas_id: st.id }).eq('id', st.kelas_id);
            }
          }
        }
      } catch (e) {
        console.error('Gagal sync import staf ke Supabase Cloud:', e);
      }
    }
  }

  /**
   * Mengubah Password / Tanggal Lahir Siswa atau Staf (Akses Khusus Superadmin)
   */
  static async adminUpdatePassword(
    type: 'siswa' | 'staf',
    userId: string,
    newTanggalLahir: string,
    _newPasswordText?: string
  ): Promise<boolean> {
    if (type === 'siswa') {
      const allSiswa = MockDatabase.getSiswa();
      const idx = allSiswa.findIndex(s => s.id === userId);
      if (idx >= 0) {
        allSiswa[idx].tanggal_lahir = newTanggalLahir;
        allSiswa[idx].sudah_ganti_password = true;
        MockDatabase.syncSiswaFromRemote(allSiswa);
      }

      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('siswa')
            .update({ 
              tanggal_lahir: newTanggalLahir, 
              sudah_ganti_password: true 
            })
            .eq('id', userId);
        } catch (e) {
          console.warn('Failed admin update password siswa:', e);
        }
      }
      return true;
    } else {
      const allStaf = MockDatabase.getStaf();
      const idx = allStaf.findIndex(st => st.id === userId);
      if (idx >= 0) {
        allStaf[idx].tanggal_lahir = newTanggalLahir;
        allStaf[idx].sudah_ganti_password = true;
        MockDatabase.syncStafFromRemote(allStaf);
      }

      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('staf_sekolah')
            .update({ 
              tanggal_lahir: newTanggalLahir, 
              sudah_ganti_password: true 
            })
            .eq('id', userId);
        } catch (e) {
          console.warn('Failed admin update password staf:', e);
        }
      }
      return true;
    }
  }

  /**
   * Mengedit / Rename Data Siswa atau Staf (Akses Khusus Superadmin)
   */
  static async adminUpdateUser(
    type: 'siswa' | 'staf',
    userId: string,
    updates: Partial<Siswa> | Partial<StafSekolah>
  ): Promise<boolean> {
    if (type === 'siswa') {
      const allSiswa = MockDatabase.getSiswa();
      const idx = allSiswa.findIndex(s => s.id === userId);
      if (idx >= 0) {
        allSiswa[idx] = { ...allSiswa[idx], ...updates } as Siswa;
        MockDatabase.syncSiswaFromRemote(allSiswa);
      }

      if (isSupabaseConfigured) {
        try {
          const { id, auth_id, created_at, ...cleanUpdates } = updates as any;
          await supabase
            .from('siswa')
            .update(cleanUpdates)
            .eq('id', userId);
        } catch (e) {
          console.warn('Failed admin update siswa:', e);
        }
      }
      return true;
    } else {
      const allStaf = MockDatabase.getStaf();
      const idx = allStaf.findIndex(st => st.id === userId);
      if (idx >= 0) {
        allStaf[idx] = { ...allStaf[idx], ...updates } as StafSekolah;
        MockDatabase.syncStafFromRemote(allStaf);
      }

      if (isSupabaseConfigured) {
        try {
          const { id, auth_id, created_at, ...cleanUpdates } = updates as any;
          await supabase
            .from('staf_sekolah')
            .update(cleanUpdates)
            .eq('id', userId);
          
          if (cleanUpdates.kelas_id && (updates as StafSekolah).role === 'wali_kelas') {
            await supabase.from('kelas').update({ wali_kelas_id: userId }).eq('id', cleanUpdates.kelas_id);
          }
        } catch (e) {
          console.warn('Failed admin update staf:', e);
        }
      }
      return true;
    }
  }
}


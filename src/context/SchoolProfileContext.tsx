import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  SchoolProfile, 
  DEFAULT_SCHOOL_PROFILE, 
  SCHOOL_PROFILE_STORAGE_KEY, 
  getLocalSchoolProfile 
} from '../lib/schoolProfile';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface SchoolProfileContextType {
  profile: SchoolProfile;
  updateProfile: (updates: Partial<SchoolProfile>) => Promise<void>;
  resetProfile: () => Promise<void>;
  isLoading: boolean;
}

const SchoolProfileContext = createContext<SchoolProfileContextType | undefined>(undefined);

export const SchoolProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<SchoolProfile>(getLocalSchoolProfile);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Ambil data terbaru dari Supabase saat awal muat
  useEffect(() => {
    const fetchRemoteProfile = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from('profil_sekolah')
            .select('*')
            .eq('id', 'main')
            .maybeSingle();

          if (data && !error) {
            const merged: SchoolProfile = {
              ...DEFAULT_SCHOOL_PROFILE,
              nama: data.nama || DEFAULT_SCHOOL_PROFILE.nama,
              jenjang: data.jenjang || DEFAULT_SCHOOL_PROFILE.jenjang,
              npsn: data.npsn || DEFAULT_SCHOOL_PROFILE.npsn,
              status: data.status || DEFAULT_SCHOOL_PROFILE.status,
              alamat: data.alamat || DEFAULT_SCHOOL_PROFILE.alamat,
              kabupaten: data.kabupaten || DEFAULT_SCHOOL_PROFILE.kabupaten,
              provinsi: data.provinsi || DEFAULT_SCHOOL_PROFILE.provinsi,
              akreditasi: data.akreditasi || DEFAULT_SCHOOL_PROFILE.akreditasi,
              tahunAjaran: data.tahun_ajaran || DEFAULT_SCHOOL_PROFILE.tahunAjaran,
              telepon: data.telepon || DEFAULT_SCHOOL_PROFILE.telepon,
              email: data.email || DEFAULT_SCHOOL_PROFILE.email,
              website: data.website || DEFAULT_SCHOOL_PROFILE.website,
              motto: data.motto || DEFAULT_SCHOOL_PROFILE.motto,
              logoUrl: data.logo_url || DEFAULT_SCHOOL_PROFILE.logoUrl,
              logoKabupatenUrl: data.logo_kabupaten_url || DEFAULT_SCHOOL_PROFILE.logoKabupatenUrl,
              namaKepalaSekolah: data.nama_kepala_sekolah || DEFAULT_SCHOOL_PROFILE.namaKepalaSekolah,
              nipKepalaSekolah: data.nip_kepala_sekolah || DEFAULT_SCHOOL_PROFILE.nipKepalaSekolah
            };
            setProfile(merged);
            localStorage.setItem(SCHOOL_PROFILE_STORAGE_KEY, JSON.stringify(merged));
          }
        }
      } catch (e) {
        console.warn('Gagal sinkron remote profil sekolah:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRemoteProfile();
  }, []);

  const updateProfile = async (updates: Partial<SchoolProfile>) => {
    const updated: SchoolProfile = { ...profile, ...updates };
    setProfile(updated);
    localStorage.setItem(SCHOOL_PROFILE_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profil_sekolah')
          .upsert({
            id: 'main',
            nama: updated.nama,
            jenjang: updated.jenjang,
            npsn: updated.npsn,
            status: updated.status,
            alamat: updated.alamat,
            kabupaten: updated.kabupaten,
            provinsi: updated.provinsi,
            akreditasi: updated.akreditasi,
            tahun_ajaran: updated.tahunAjaran,
            telepon: updated.telepon,
            email: updated.email,
            website: updated.website,
            motto: updated.motto,
            logo_url: updated.logoUrl,
            logo_kabupaten_url: updated.logoKabupatenUrl,
            nama_kepala_sekolah: updated.namaKepalaSekolah,
            nip_kepala_sekolah: updated.nipKepalaSekolah,
            updated_at: new Date().toISOString()
          });
      } catch (e) {
        console.error('Gagal menyimpan profil sekolah ke Supabase:', e);
      }
    }
  };

  const resetProfile = async () => {
    setProfile(DEFAULT_SCHOOL_PROFILE);
    localStorage.setItem(SCHOOL_PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_SCHOOL_PROFILE));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profil_sekolah')
          .delete()
          .eq('id', 'main');
      } catch (e) {
        console.error('Gagal reset profil sekolah di Supabase:', e);
      }
    }
  };

  return (
    <SchoolProfileContext.Provider value={{ profile, updateProfile, resetProfile, isLoading }}>
      {children}
    </SchoolProfileContext.Provider>
  );
};

export const useSchoolProfile = (): SchoolProfileContextType => {
  const context = useContext(SchoolProfileContext);
  if (!context) {
    throw new Error('useSchoolProfile must be used within a SchoolProfileProvider');
  }
  return context;
};

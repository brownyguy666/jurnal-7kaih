export interface SchoolProfile {
  nama: string;
  jenjang: string;
  npsn: string;
  status: string;
  alamat: string;
  kabupaten: string;
  provinsi: string;
  akreditasi: string;
  tahunAjaran: string;
}

export const SCHOOL_PROFILE: SchoolProfile = {
  nama: 'SMPN 2 Glagah',
  jenjang: 'SMP',
  npsn: '20525649',
  status: 'Negeri',
  alamat: 'Jl. Kenjo No.45, Glagah, Banyuwangi, Jawa Timur',
  kabupaten: 'Kabupaten Banyuwangi',
  provinsi: 'Jawa Timur',
  akreditasi: 'A',
  tahunAjaran: '2026/2027'
};

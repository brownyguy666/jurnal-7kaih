import { 
  ClassRankingItem, 
  EntriJurnal, 
  Kelas, 
  Siswa, 
  StafSekolah, 
  StudentRankingItem 
} from '../types/database';

export class LeaderboardService {
  /**
   * Menghitung perangkingan 18 kelas untuk tanggal tertentu
   * Kriteria:
   * 1. Persentase kepatuhan rata-rata 7 kebiasaan (% tertinggi)
   * 2. Jumlah & persentase siswa tuntas 7 kebiasaan
   * 3. Minimnya foto mencurigakan (anomali EXIF)
   */
  static calculateClassRankings(
    kelasList: Kelas[],
    siswaList: Siswa[],
    entries: EntriJurnal[],
    stafList: StafSekolah[],
    selectedDate: string
  ): ClassRankingItem[] {
    const currentDayEntries = entries.filter((e) => e.tanggal === selectedDate);

    const rankings: Omit<ClassRankingItem, 'rank'>[] = kelasList.map((k) => {
      // Temukan siswa kelas ini (support UUID, nama kelas '7A', 'k-7a')
      const classStudents = siswaList.filter((s) => 
        s.kelas_id === k.id ||
        s.kelas_id?.toUpperCase() === k.nama_kelas.toUpperCase() ||
        s.kelas_id?.toLowerCase() === `k-${k.nama_kelas.toLowerCase()}`
      );

      const wali = stafList.find((st) => 
        st.id === k.wali_kelas_id || 
        st.kelas_id === k.id || 
        st.kelas_id?.toUpperCase() === k.nama_kelas.toUpperCase() ||
        (st.kelas_id && String(st.kelas_id).toUpperCase().replace(/^K-/, '') === k.nama_kelas.toUpperCase())
      );

      const classEntries = currentDayEntries.filter((e) => 
        classStudents.some((s) => s.id === e.siswa_id)
      );

      let totalHabitsCompleted = 0;
      let perfectCount = 0;
      let flagCount = 0;
      let tepatWaktuCount = 0;

      classStudents.forEach((student) => {
        const studentEntries = classEntries.filter((e) => e.siswa_id === student.id);
        const distinct = new Set(studentEntries.map((e) => e.kebiasaan_id)).size;
        totalHabitsCompleted += distinct;
        if (distinct === 7) perfectCount++;
        if (studentEntries.some((e) => e.flag_foto_mencurigakan)) flagCount++;
        tepatWaktuCount += studentEntries.filter((e) => e.status_waktu === 'tepat_waktu').length;
      });

      const totalStudents = classStudents.length;
      const rate = totalStudents > 0 
        ? Math.round((totalHabitsCompleted / (totalStudents * 7)) * 100) 
        : 0;

      const tuntasPercent = totalStudents > 0
        ? Math.round((perfectCount / totalStudents) * 100)
        : 0;

      // Formula Skor Tertib Total:
      // (Persentase Kepatuhan * 0.6) + (Persentase Siswa Tuntas * 0.35) - (Penalti Flag * 2) + bonus keaktifan
      const penalty = flagCount * 2;
      const calculatedScore = Math.max(0, Math.round((rate * 0.6) + (tuntasPercent * 0.35) - penalty));

      return {
        kelasId: k.id,
        namaKelas: k.nama_kelas,
        tingkat: k.tingkat,
        waliKelasNama: wali?.nama || 'Wali Kelas',
        totalSiswa: totalStudents,
        siswaTuntasCount: perfectCount,
        tuntasPercentage: tuntasPercent,
        totalEntri: classEntries.length,
        persentaseKepatuhan: rate,
        flaggedPhotosCount: flagCount,
        tepatWaktuCount,
        score: calculatedScore
      };
    });

    // Urutkan berdasarkan Skor Tertib tertinggi, lalu persentase kepatuhan, lalu siswa tuntas
    rankings.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.persentaseKepatuhan !== a.persentaseKepatuhan) return b.persentaseKepatuhan - a.persentaseKepatuhan;
      if (b.siswaTuntasCount !== a.siswaTuntasCount) return b.siswaTuntasCount - a.siswaTuntasCount;
      return a.namaKelas.localeCompare(b.namaKelas);
    });

    return rankings.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }

  /**
   * Menghitung Siswa Teladan Hari Ini (Murid Tercepat & Terdisiplin)
   * Syarat Ketat:
   * 1. Menuntaskan ke-7 kebiasaan hari itu (distinct 7)
   * 2. TANPA peringatan foto EXIF (flag_foto_mencurigakan = false pada seluruh entri)
   * 3. Tepat waktu saat bangun pagi (kebiasaan 1) & tidur cepat (kebiasaan 7)
   * 4. Diurutkan dari yang selesai paling awal pada hari itu
   */
  static calculateTopStudents(
    siswaList: Siswa[],
    entries: EntriJurnal[],
    kelasList: Kelas[],
    selectedDate: string
  ): {
    qualifiedStudents: StudentRankingItem[];
    disqualifiedCount: number;
  } {
    const currentDayEntries = entries.filter((e) => e.tanggal === selectedDate);
    const kelasMap = new Map<string, { nama: string; tingkat: number }>();

    kelasList.forEach((k) => {
      kelasMap.set(k.id, { nama: k.nama_kelas, tingkat: k.tingkat });
      kelasMap.set(k.nama_kelas.toUpperCase(), { nama: k.nama_kelas, tingkat: k.tingkat });
      kelasMap.set(`k-${k.nama_kelas.toLowerCase()}`, { nama: k.nama_kelas, tingkat: k.tingkat });
    });

    const candidates: Omit<StudentRankingItem, 'rank'>[] = [];
    let disqualified = 0;

    siswaList.forEach((student) => {
      const studentEntries = currentDayEntries.filter((e) => e.siswa_id === student.id);
      const distinctHabits = new Set(studentEntries.map((e) => e.kebiasaan_id));

      // 1. Wajib menyelesaikan 7 kebiasaan
      if (distinctHabits.size < 7) return;

      // 2. Cek flag foto EXIF mencurigakan
      const hasFlag = studentEntries.some((e) => e.flag_foto_mencurigakan);

      // 3. Cek ketepatan waktu (khusus Bangun Pagi dan Tidur Cepat)
      const hasLateEntry = studentEntries.some((e) => 
        (e.kebiasaan_id === 1 || e.kebiasaan_id === 7) && e.status_waktu === 'terlambat'
      );

      if (hasFlag || hasLateEntry) {
        disqualified++;
        return; // Tidak lolos kriteria Siswa Teladan Terbersih
      }

      // Cari waktu submit entri terakhir (kapan siswa resmi tuntas 7 kebiasaan)
      const submitTimestamps = studentEntries.map((e) => {
        const d = new Date(e.waktu_submit || e.waktu_ambil_foto || `${selectedDate}T23:59:59Z`);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      });

      const finishTimestamp = Math.max(...submitTimestamps);
      const finishDate = new Date(finishTimestamp);

      const kInfo = kelasMap.get(student.kelas_id) || 
                    kelasMap.get(student.kelas_id?.toUpperCase()) || 
                    { nama: student.kelas_id || '7A', tingkat: 7 };

      const timeFormatted = finishDate.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' WIB';

      candidates.push({
        siswaId: student.id,
        nama: student.nama,
        nisn: student.nisn,
        namaKelas: kInfo.nama,
        tingkat: kInfo.tingkat,
        totalKebiasaan: 7,
        selesaiPada: finishDate.toISOString(),
        selesaiFormatted: timeFormatted,
        hasFlaggedPhoto: false,
        isTepatWaktu: true,
        scoreKerapian: 100
      });
    });

    // Urutkan dari waktu selesai paling cepat (earliest timestamp)
    candidates.sort((a, b) => {
      const timeA = new Date(a.selesaiPada).getTime();
      const timeB = new Date(b.selesaiPada).getTime();
      return timeA - timeB;
    });

    const rankedStudents = candidates.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));

    return {
      qualifiedStudents: rankedStudents,
      disqualifiedCount: disqualified
    };
  }

  /**
   * Menghitung Ringkasan Tingkat (Kelas 7, Kelas 8, Kelas 9)
   */
  static calculateGradeSummaries(classRankings: ClassRankingItem[]) {
    const grades = [7, 8, 9];

    return grades.map((g) => {
      const gradeClasses = classRankings.filter((c) => c.tingkat === g);
      const totalSiswa = gradeClasses.reduce((acc, c) => acc + c.totalSiswa, 0);
      const totalTuntas = gradeClasses.reduce((acc, c) => acc + c.siswaTuntasCount, 0);
      const avgRate = gradeClasses.length > 0
        ? Math.round(gradeClasses.reduce((acc, c) => acc + c.persentaseKepatuhan, 0) / gradeClasses.length)
        : 0;

      const topClass = gradeClasses.sort((a, b) => b.score - a.score)[0];

      return {
        tingkat: g,
        namaTingkat: `Kelas ${g}`,
        totalKelas: gradeClasses.length,
        totalSiswa,
        totalTuntas,
        persentaseKepatuhan: avgRate,
        kelasTerbaik: topClass ? `Kelas ${topClass.namaKelas}` : '-'
      };
    });
  }
}

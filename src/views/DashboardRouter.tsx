import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { SiswaDashboard } from '../components/siswa/SiswaDashboard';
import { WaliKelasDashboard } from '../components/walikelas/WaliKelasDashboard';
import { PejabatDashboard } from '../components/pejabat/PejabatDashboard';
import { SuperadminDashboard } from '../components/admin/SuperadminDashboard';
import { ChangePasswordModal } from '../components/common/ChangePasswordModal';

export const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  const [showMandatoryPasswordChange, setShowMandatoryPasswordChange] = useState(false);

  useEffect(() => {
    if (user && !user.data.sudah_ganti_password) {
      setShowMandatoryPasswordChange(true);
    } else {
      setShowMandatoryPasswordChange(false);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="pb-12">
          {user.type === 'siswa' ? (
            <SiswaDashboard siswa={user.data} />
          ) : user.data.role === 'superadmin' ? (
            <SuperadminDashboard staf={user.data} />
          ) : user.data.role === 'wali_kelas' ? (
            <WaliKelasDashboard staf={user.data} />
          ) : (
            <PejabatDashboard staf={user.data} />
          )}
        </main>
      </div>

      {/* Mandatory Password Change Modal on First Login */}
      <ChangePasswordModal
        isOpen={showMandatoryPasswordChange}
        isMandatory={true}
        onClose={() => setShowMandatoryPasswordChange(false)}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Jurnal 7 KAIH • SMP Negeri 2 Glagah</span>
          <span>Kementerian Pendidikan Dasar dan Menengah RI</span>
        </div>
      </footer>
    </div>
  );
};

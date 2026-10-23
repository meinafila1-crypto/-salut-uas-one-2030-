import React from 'react';
import { Shield, Sparkles, MapPin, Globe, Clock, Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminLogin }) => {
  return (
    <footer className="w-full border-t border-sky-900/40 bg-[#020713] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20 no-print">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-sky-950/80">
          
          {/* Main Institution Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold text-white tracking-wider">
                SALUT CAHAYA MERAPI
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-400/20 text-yellow-300 font-mono-code font-bold">
                2030
              </span>
            </div>
            <p className="text-sm font-semibold text-sky-300">
              Universitas Terbuka Yogyakarta
            </p>
            <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-yellow-400/70 pl-3">
              "Layanan digital untuk mendukung proses administrasi akademik mahasiswa."
            </p>
          </div>

          {/* Location & Academic Services */}
          <div className="space-y-2 text-xs text-slate-300">
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-400" />
              Sentra Layanan UT (SALUT)
            </h4>
            <p className="leading-relaxed">
              Kawasan Edukasi Merapi, Sleman, Daerah Istimewa Yogyakarta.
            </p>
            <div className="flex items-center gap-2 text-slate-400 pt-1">
              <Clock className="w-3.5 h-3.5 text-yellow-300" />
              <span>Layanan Operasional Ujian: Senin – Minggu</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Terintegrasi dengan Ekosistem Universitas Terbuka</span>
            </div>
          </div>

          {/* Security & Standard Notice */}
          <div className="space-y-2 text-xs text-slate-300">
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Integritas & Keamanan
            </h4>
            <p className="leading-relaxed text-slate-400">
              Aplikasi ini mengamankan alokasi kuota ujian melalui verifikasi atomic Firestore. Pilihan hari, sesi, dan lokasi mengikuti regulasi resmi Universitas Terbuka.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-sky-300">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Futuristic Academic Technology Architecture</span>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-3">
          <p>© 2030 SALUT Cahaya Merapi — Universitas Terbuka Yogyakarta. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4 text-sky-400/70">
            <span>SALUT UAS ONE 2030</span>
            <span>•</span>
            <button
              type="button"
              id="staf-portal-btn"
              onClick={() => {
                window.location.hash = 'admin';
                if (onOpenAdminLogin) {
                  onOpenAdminLogin();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-800/80 bg-sky-950/70 text-sky-200 hover:text-yellow-300 hover:border-yellow-400/70 hover:bg-sky-900/60 transition-all font-medium text-xs cursor-pointer shadow-sm group"
              title="Staf Portal — Akses Khusus Administrator SALUT UAS ONE 2030"
            >
              <Lock className="w-3.5 h-3.5 text-yellow-300 group-hover:scale-110 transition-transform" />
              <span>Staf Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

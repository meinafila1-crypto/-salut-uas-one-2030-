import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  Search, 
  LogOut, 
  CalendarCheck, 
  HelpCircle,
  Menu,
  X,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAdmin: () => void;
  onOpenLookup: () => void;
  onGoHome: () => void;
  onStartRegistration?: () => void;
  currentView: 'home' | 'register' | 'confirmation' | 'admin';
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmin,
  onOpenLookup,
  onGoHome,
  onStartRegistration,
  currentView
}) => {
  const { isAdmin, adminEmail, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScrollToGuide = () => {
    onGoHome();
    setTimeout(() => {
      const guideElement = document.getElementById('panduan-mahasiswa');
      if (guideElement) {
        guideElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#030b1e]/90 border-b border-sky-900/40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Logo Area */}
        <div 
          onClick={() => {
            onGoHome();
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          {/* UT Official Styling Emblem */}
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#003B73] via-[#0284c7] to-[#002244] border border-sky-400/40 shadow-lg shadow-sky-950/50 group-hover:border-yellow-400/60 transition-all duration-300">
            <div className="absolute inset-0 bg-sky-400/10 rounded-xl blur-sm group-hover:bg-yellow-400/20 transition-colors" />
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 relative z-10" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-yellow-400 rounded-full border-2 border-[#030b1e] flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-[#003B73] rounded-full" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-sky-300 transition-colors">
                SALUT UAS ONE
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono-code font-bold rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                2030
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-sky-200/80 font-medium tracking-wide">
              SALUT Cahaya Merapi • UT Yogyakarta
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-3">
          
          {/* Public Link: Panduan Mahasiswa */}
          <button
            onClick={handleScrollToGuide}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-sky-900/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>Panduan Mahasiswa</span>
          </button>

          {/* =============================================================== */}
          {/* STRICT ADMIN-ONLY MENU (Hidden from Public & Non-Admin Users)   */}
          {/* =============================================================== */}
          {isAdmin && (
            <div className="flex items-center gap-2 pl-3 ml-2 border-l border-sky-800/50">
              
              {/* 1. Status Admin Indicator */}
              <div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-400/40 text-[11px] font-mono-code text-emerald-300"
                title={`Status Admin: Aktif (${adminEmail || 'Superadmin'})`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">Status Admin: Aktif</span>
              </div>

              {/* 2. Cek Bukti UAS (Admin Verification Tool) */}
              <button
                onClick={onOpenLookup}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-200 hover:text-white bg-sky-900/40 hover:bg-sky-800/60 border border-sky-400/40 transition-all cursor-pointer"
                title="Verifikasi dan Cek Bukti UAS Peserta"
              >
                <Search className="w-3.5 h-3.5 text-yellow-300" />
                <span>Cek Bukti UAS</span>
              </button>

              {/* 3. Panel Admin Navigation */}
              <button
                onClick={onOpenAdmin}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-500/30'
                    : 'bg-sky-600/30 text-sky-200 hover:bg-sky-600/50 border border-sky-400/40'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
                <span>Panel Admin</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => logout()}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl border border-transparent hover:border-rose-900/50 transition-all cursor-pointer"
                title="Keluar dari Akun Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2030 Campus Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-950/60 border border-sky-500/30 text-[10px] font-mono-code text-sky-300 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Digital UT 2030</span>
          </div>

        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAdmin && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Admin Aktif" />
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-sky-950/60 border border-sky-600/30"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu (Strictly honors RBAC) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-sky-900/60 bg-[#040f29]/95 px-4 pt-3 pb-5 space-y-2 backdrop-blur-2xl">
          <button
            onClick={handleScrollToGuide}
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-sky-900/40 flex items-center gap-2 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>Panduan Mahasiswa</span>
          </button>

          {/* ADMIN ONLY ON MOBILE */}
          {isAdmin && (
            <div className="pt-3 mt-2 border-t border-sky-800/50 space-y-2">
              <div className="px-3.5 py-2 rounded-xl bg-emerald-950/70 border border-emerald-400/40 text-[11px] text-emerald-300 font-mono-code flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Status Admin: Aktif ({adminEmail})</span>
              </div>

              <button
                onClick={() => {
                  onOpenLookup();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-sky-200 bg-sky-900/50 border border-sky-500/30 flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-yellow-300" />
                <span>Cek Bukti UAS</span>
              </button>

              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600/40 border border-sky-400/40 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-yellow-300" />
                <span>Buka Panel Admin</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-rose-300 hover:bg-rose-950/40 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Admin</span>
              </button>
            </div>
          )}

        </div>
      )}
    </header>
  );
};


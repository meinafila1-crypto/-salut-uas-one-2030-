import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Cpu, 
  ShieldCheck, 
  Search,
  BookOpen,
  Building2,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import { RegistrationPeriod } from '../types';
import defaultHeroStudent from '../assets/hero_student_2030.jpg';

interface StudentHeroProps {
  period: RegistrationPeriod | null;
  onStartRegistration: () => void;
  onOpenLookup?: () => void;
  totalSlotsAvailable: number;
  totalSeatsRemaining: number;
}

export const StudentHero: React.FC<StudentHeroProps> = ({
  period,
  onStartRegistration,
  onOpenLookup,
  totalSlotsAvailable,
  totalSeatsRemaining
}) => {
  const isOpen = period ? period.isOpen : true;

  // Hero image with fallback support
  const [heroSrc, setHeroSrc] = useState<string>(period?.heroImageUrl || defaultHeroStudent);

  useEffect(() => {
    if (period?.heroImageUrl) {
      setHeroSrc(period.heroImageUrl);
    } else {
      setHeroSrc(defaultHeroStudent);
    }
  }, [period?.heroImageUrl]);

  const handleHeroImageError = () => {
    // Graceful fallback to bundled high-res 2030 asset if custom URL fails
    setHeroSrc(defaultHeroStudent);
  };

  return (
    <div className="relative overflow-hidden pt-4 pb-16">
      {/* Ambient Radial & Glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-sky-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-36 right-10 w-80 h-80 bg-yellow-400/10 rounded-full blur-[110px] pointer-events-none" />
      
      {/* Decorative cyber grid lines */}
      <div className="absolute inset-0 bg-cyber-grid opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Top Status & Campus Identification Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-sky-400/30 text-xs text-sky-200">
            <Cpu className="w-3.5 h-3.5 text-yellow-300" />
            <span className="font-semibold text-white">SALUT Cahaya Merapi</span>
            <span className="text-sky-500">•</span>
            <span className="text-sky-300">Universitas Terbuka Yogyakarta</span>
            <span className="text-sky-500">•</span>
            <span className="font-mono-code text-yellow-300 font-bold">2030</span>
          </div>

          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
            isOpen 
              ? 'bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 shadow-sm shadow-emerald-500/20' 
              : 'bg-rose-950/80 border border-rose-400/40 text-rose-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
            <span>{isOpen ? 'STATUS REGISTRASI: DIBUKA' : 'STATUS REGISTRASI: DITUTUP'}</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. VISUAL HERO SECTION BESAR (FUTURISTIC ACADEMIC TECHNOLOGY 2030)         */}
        {/* ========================================================================= */}
        <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-sky-400/35 shadow-[0_20px_50px_-10px_rgba(2,132,199,0.3)] bg-gradient-to-br from-[#05173a]/95 via-[#030d24]/95 to-[#072456]/95 backdrop-blur-xl mb-10 transition-all">
          
          {/* Subtle cyber corner brackets */}
          <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-yellow-300/60 pointer-events-none z-20" />
          <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-sky-400/60 pointer-events-none z-20" />
          <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b-2 border-l-2 border-sky-400/60 pointer-events-none z-20" />
          <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b-2 border-r-2 border-yellow-300/60 pointer-events-none z-20" />

          {/* Desktop & Mobile Responsive Grid Layout (Height: ~380-440px on Desktop) */}
          <div className="flex flex-col-reverse lg:flex-row items-stretch min-h-[380px] lg:h-[430px]">
            
            {/* Left Content Area (~58% on Desktop) */}
            <div className="flex-1 flex flex-col justify-center p-6 sm:p-9 lg:p-11 z-10 space-y-4">
              
              {/* Small Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-400/30 text-xs font-semibold text-sky-200 tracking-wider uppercase w-fit shadow-inner">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-yellow-300 font-bold font-heading">SALUT UAS ONE 2030</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                MASA DEPANMU,<br />
                <span className="bg-gradient-to-r from-yellow-300 via-sky-200 to-sky-400 bg-clip-text text-transparent">
                  KAMU YANG TENTUKAN!
                </span>
              </h1>

              {/* Explanatory sentence */}
              <p className="text-sm sm:text-base text-slate-200 max-w-xl leading-relaxed font-normal">
                Tentukan jadwal pilihanmu dan persiapkan langkah berikutnya bersama <strong className="text-white font-semibold">SALUT Cahaya Merapi — Universitas Terbuka Yogyakarta</strong>.
              </p>

              {/* Primary Call-to-Action (CTA) Button */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3.5">
                {isOpen ? (
                  <button
                    onClick={onStartRegistration}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-heading font-bold text-slate-950 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-yellow-500/25 border border-yellow-200/90 flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all duration-200 group cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>PILIH JADWAL SEKARANG</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={() => alert('Pemberitahuan: Periode registrasi UAS saat ini sedang ditutup atau belum dimulai. Silakan pantau pengumuman resmi.')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-heading font-semibold text-slate-400 bg-slate-900/80 border border-slate-700/80 flex items-center justify-center gap-2.5 text-sm cursor-not-allowed"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>PILIH JADWAL (DITUTUP)</span>
                  </button>
                )}
              </div>

              {/* Companion Text */}
              <div className="pt-1 flex items-center gap-2 text-xs text-sky-200/90">
                <CheckCircle className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                <span>Belajar lebih fleksibel. Atur rencana kuliahmu sesuai kebutuhan.</span>
              </div>

            </div>

            {/* Right Hero Image Area (~42% on Desktop, Stacked cleanly on Mobile) */}
            <div className="w-full lg:w-[44%] relative overflow-hidden h-64 sm:h-80 lg:h-auto min-h-[260px] bg-sky-950/40">
              
              {/* Student Image with graceful fallback */}
              <img
                src={heroSrc}
                alt="Mahasiswa Universitas Terbuka 2030 - Jas Almamater Kuning Cerah"
                onError={handleHeroImageError}
                className="w-full h-full object-cover object-top lg:object-[center_12%] select-none transition-transform duration-700 hover:scale-105"
                loading="eager"
              />

              {/* Gradient masks to seamlessly blend image into dark blue UI background */}
              <div className="hidden lg:block absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#030d24] via-[#030d24]/60 to-transparent pointer-events-none" />
              <div className="block lg:hidden absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#05173a] via-[#05173a]/70 to-transparent pointer-events-none" />

              {/* Floating Holographic Badge (Desktop & Tablet) */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 p-2.5 rounded-xl glass-card border border-sky-400/40 shadow-xl flex items-center gap-2.5 backdrop-blur-md bg-slate-950/75 z-20">
                <div className="w-8 h-8 rounded-lg bg-yellow-400/20 border border-yellow-300/50 flex items-center justify-center text-yellow-300 font-bold text-xs">
                  UT
                </div>
                <div className="text-[11px] leading-tight text-left">
                  <div className="text-white font-semibold flex items-center gap-1">
                    <span>Generasi Emas 2030</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-sky-300 text-[10px]">Cahaya Merapi Yogyakarta</div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Important Institutional Announcement Banner */}
        {period?.announcement && (
          <div className="mb-10 max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl glass-card border-sky-500/30 bg-sky-950/40 text-xs sm:text-sm text-sky-100 flex items-start gap-3 shadow-lg">
            <Sparkles className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-yellow-300 uppercase tracking-wide text-xs block">
                Pemberitahuan Resmi UT Yogyakarta:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {period.announcement}
              </p>
              <div className="pt-1 text-[11px] text-sky-300/80 flex items-center gap-3">
                <span>Periode: {period.semester}</span>
                <span>•</span>
                <span>Batas: {period.closeDate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Live Academic Capacity & Guarantee Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-5xl mx-auto mb-12">
          <div className="p-4 rounded-2xl glass-card text-center border-sky-500/25 shadow-md">
            <CalendarCheck className="w-5 h-5 text-yellow-300 mx-auto mb-1.5" />
            <div className="text-xl font-bold text-white font-mono-code">{totalSlotsAvailable}</div>
            <div className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Slot Sesi Resmi</div>
          </div>

          <div className="p-4 rounded-2xl glass-card text-center border-sky-500/25 shadow-md">
            <Users className="w-5 h-5 text-sky-400 mx-auto mb-1.5" />
            <div className="text-xl font-bold text-white font-mono-code">{totalSeatsRemaining}</div>
            <div className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Sisa Kuota Kursi</div>
          </div>

          <div className="p-4 rounded-2xl glass-card text-center border-sky-500/25 shadow-md">
            <Building2 className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <div className="text-xl font-bold text-white font-mono-code">Lab Digital</div>
            <div className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Lokasi SALUT UT</div>
          </div>

          <div className="p-4 rounded-2xl glass-card text-center border-sky-500/25 shadow-md">
            <ShieldCheck className="w-5 h-5 text-yellow-300 mx-auto mb-1.5" />
            <div className="text-xl font-bold text-white font-mono-code">Atomic Lock</div>
            <div className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Bebas Registrasi Ganda</div>
          </div>
        </div>

        {/* Petunjuk Singkat Sebelum Mengisi Formulir */}
        <div id="panduan-mahasiswa" className="max-w-5xl mx-auto p-6 sm:p-7 rounded-2xl glass-panel border-sky-500/30 shadow-xl scroll-mt-24">
          <div className="flex items-center gap-2.5 mb-5 pb-3.5 border-b border-sky-900/50">
            <BookOpen className="w-5 h-5 text-yellow-300" />
            <h3 className="font-heading font-bold text-base sm:text-lg text-white">
              Petunjuk Singkat Sebelum Mahasiswa Mengisi Formulir
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm">
            
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/15">
              <div className="w-7 h-7 rounded-lg bg-sky-600/30 border border-sky-400/40 text-yellow-300 font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-white block">Siapkan Data NIM</span>
                <p className="text-slate-400 leading-relaxed text-xs">
                  Gunakan 9 Digit Nomor Induk Mahasiswa (NIM) aktif dan nomor WhatsApp untuk koordinasi kehadiran.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/15">
              <div className="w-7 h-7 rounded-lg bg-sky-600/30 border border-sky-400/40 text-yellow-300 font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-white block">Pilih Hari, Sesi & Lokasi</span>
                <p className="text-slate-400 leading-relaxed text-xs">
                  Pilihan jadwal dan lokasi hanya berasal dari data resmi yang disediakan oleh admin SALUT UT. Kuota ditampilkan transparan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/15">
              <div className="w-7 h-7 rounded-lg bg-sky-600/30 border border-sky-400/40 text-yellow-300 font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-white block">Simpan Bukti Registrasi</span>
                <p className="text-slate-400 leading-relaxed text-xs">
                  Dapatkan Nomor Referensi unik & QR Code digital. Simpan atau cetak bukti ini sebagai tanda registrasi internal SALUT.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-5 pt-3.5 border-t border-sky-950/80 flex items-center gap-2 text-[11px] text-sky-300/80">
            <CheckCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>
              Catatan: Jadwal dan lokasi mengikuti ketentuan resmi Universitas Terbuka. Konfirmasi ini digunakan untuk persiapan teknis dan alokasi tempat ujian di SALUT Cahaya Merapi.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { ShieldCheck, X, AlertCircle, Loader2, Lock, CheckCircle2, Globe, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { loginWithGoogle, adminEmail } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setUnauthorizedDomain(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: unknown) {
      console.error('Login error:', err);
      const anyErr = err as { code?: string; message?: string };
      if (anyErr?.code === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
        setUnauthorizedDomain(currentDomain || 'ais-dev-utdohjqyasv4ujdaqtkndf-533431475547.asia-southeast1.run.app');
        setErrorMsg('Domain aplikasi belum terdaftar di daftar Authorized domains Firebase.');
      } else if (anyErr?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Proses login dibatalkan karena jendela masuk Google ditutup sebelum selesai.');
      } else if (anyErr?.code === 'auth/popup-blocked') {
        setErrorMsg('Jendela popup login diblokir oleh browser. Harap izinkan pop-up untuk situs ini lalu coba lagi.');
      } else if (anyErr?.code === 'auth/network-request-failed') {
        setErrorMsg('Koneksi terputus. Pastikan perangkat Anda terhubung ke internet.');
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Akses ditolak. Menu Staf/Admin hanya dapat diakses oleh akun administrator resmi SALUT UAS ONE 2030.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl glass-panel border-sky-500/40 p-6 sm:p-7 shadow-2xl bg-[#040e24]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003B73] to-sky-600 border border-sky-400/40 flex items-center justify-center text-yellow-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-base">
                Portal Administrator
              </h3>
              <p className="text-[11px] text-sky-300 font-medium">
                SALUT Cahaya Merapi • UT Yogyakarta
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-5 p-3.5 rounded-xl bg-sky-950/50 border border-sky-500/30 text-xs text-sky-200 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">Autentikasi Terverifikasi Server:</span>
            <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
              Akses panel manajemen dilindungi oleh Firebase Authentication & Security Rules. Hanya akun Google yang terdaftar di basis data administrator yang dapat mengakses dashboard.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Dedicated Authorized Domains Helper Box */}
        {unauthorizedDomain && (
          <div className="mt-3 p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs text-amber-200 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Globe className="w-4 h-4 shrink-0 text-yellow-400" />
              <span>Otorisasi Domain di Firebase Console (Wajib):</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Google OAuth memerlukan pendaftaran hostname aktif ini agar popup login diizinkan:
            </p>
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-amber-500/30 font-mono text-[11px] text-yellow-300">
              <span className="truncate select-all">{unauthorizedDomain}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(unauthorizedDomain);
                  setCopiedDomain(true);
                  setTimeout(() => setCopiedDomain(false), 2500);
                }}
                className="px-2.5 py-1 rounded bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-heading font-bold text-[10px] flex items-center gap-1 shrink-0 cursor-pointer transition-all"
                title="Salin Hostname"
              >
                {copiedDomain ? <Check className="w-3 h-3 text-slate-950" /> : <Copy className="w-3 h-3 text-slate-950" />}
                <span>{copiedDomain ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-amber-900/40 space-y-1">
              <span className="font-semibold text-slate-300 block">Langkah Menambahkan:</span>
              <ol className="list-decimal pl-4 space-y-0.5 leading-relaxed">
                <li>Buka <span className="text-yellow-300 font-medium">console.firebase.google.com</span></li>
                <li>Pilih proyek: <strong className="text-white">ai-studio-applet-webapp-cef31</strong></li>
                <li>Buka tab: <strong className="text-white">Authentication → Settings → Authorized domains</strong></li>
                <li>Klik <strong className="text-white">Add domain</strong>, tempel hostname di atas, lalu simpan.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Google Login Action */}
        <div className="mt-6 space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Memverifikasi Akun Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Google (Akun Terotorisasi)</span>
              </>
            )}
          </button>

          <div className="p-3 rounded-xl bg-[#020919] border border-sky-950 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-yellow-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Administrator Utama Terotorisasi:</span>
            </div>
            <div className="font-mono-code text-sky-300 pl-5">meinafila1@gmail.com</div>
          </div>
        </div>

      </div>
    </div>
  );
};

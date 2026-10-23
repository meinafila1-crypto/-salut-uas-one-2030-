import React, { useState } from 'react';
import { Search, X, Loader2, AlertCircle, FileCheck, ShieldCheck, Key } from 'lucide-react';
import { Registration } from '../types';
import { verifyAndGetRegistration } from '../services/examService';

interface LookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRegistration: (reg: Registration) => void;
}

export const LookupModal: React.FC<LookupModalProps> = ({
  isOpen,
  onClose,
  onSelectRegistration
}) => {
  const [nimInput, setNimInput] = useState('');
  const [verificationInput, setVerificationInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [foundRecord, setFoundRecord] = useState<Registration | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNim = nimInput.trim();
    const cleanKey = verificationInput.trim();

    if (!cleanNim) {
      setErrorMessage('Harap masukkan NIM Anda.');
      return;
    }
    if (!cleanKey) {
      setErrorMessage('Harap masukkan Nomor Referensi atau 4 digit terakhir nomor WhatsApp sebagai verifikasi kepemilikan.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setFoundRecord(null);

    try {
      const record = await verifyAndGetRegistration(cleanNim, cleanKey);
      setFoundRecord(record);
    } catch (err: unknown) {
      console.error('Lookup verification failed:', err);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Verifikasi gagal: Data tidak ditemukan atau kunci verifikasi tidak cocok.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl glass-panel border-sky-500/40 p-6 shadow-2xl bg-[#040e24]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-900/60 border border-sky-500/30 flex items-center justify-center text-yellow-300">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-base">
                Cek Bukti Pendaftaran UAS
              </h3>
              <p className="text-[11px] text-sky-300/80">
                Pencarian aman dengan verifikasi kepemilikan mahasiswa
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

        {/* Privacy Protection Notice */}
        <div className="mt-4 p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-[11px] text-sky-200 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" />
          <span>
            Untuk melindungi data pribadi dan jadwal, masukkan NIM beserta Nomor Referensi atau 4 digit terakhir WhatsApp yang terdaftar.
          </span>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">
              Nomor Induk Mahasiswa (NIM) *
            </label>
            <input
              type="text"
              value={nimInput}
              onChange={(e) => setNimInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Contoh: 045123456"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white font-mono-code placeholder-slate-500 text-xs sm:text-sm outline-none transition-all"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-yellow-300" />
              <span>Verifikasi: No. Referensi ATAU 4 Digit Akhir WhatsApp *</span>
            </label>
            <input
              type="text"
              value={verificationInput}
              onChange={(e) => setVerificationInput(e.target.value)}
              placeholder="Contoh: UAS30-CM-XYZ atau 4 digit no. WA (misal: 6789)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white font-mono-code placeholder-slate-500 text-xs sm:text-sm outline-none transition-all uppercase"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Mencegah pihak lain melihat jadwal Anda hanya dengan mengetahui NIM.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !nimInput.trim() || !verificationInput.trim()}
            className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-slate-950 font-heading font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Memverifikasi Kepemilikan...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-slate-950" />
                <span>Verifikasi & Tampilkan Bukti</span>
              </>
            )}
          </button>
        </form>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Pencarian Tidak Berhasil</span>
              <p className="mt-0.5 text-rose-200/90 text-[11px] leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* Verified Found Record */}
        {foundRecord && (
          <div className="mt-4 p-4 rounded-xl bg-sky-950/60 border border-emerald-500/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <FileCheck className="w-4 h-4" />
              <span>Verifikasi Berhasil! Registrasi Terdaftar:</span>
            </div>

            <div className="text-xs space-y-1">
              <div className="text-white font-bold">{foundRecord.fullName}</div>
              <div className="text-sky-300 font-mono-code">NIM: {foundRecord.nim}</div>
              <div className="text-yellow-300 font-mono-code text-[11px]">
                No. Ref: {foundRecord.refNumber}
              </div>
              <div className="text-slate-300 text-[11px] pt-1">
                Jadwal: {foundRecord.day} ({foundRecord.sessionName})
              </div>
              <div className="text-emerald-300 text-[11px]">
                Lokasi: {foundRecord.location} — {foundRecord.room}
              </div>
            </div>

            <button
              onClick={() => {
                onSelectRegistration(foundRecord);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-bold text-xs transition-all cursor-pointer"
            >
              Buka Dokumen Lengkap & Cetak PDF
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-sky-950 text-[10px] text-slate-500 text-center">
          Standar Privasi Akademik 2030: Akses dokumen terikat pada pembuktian kredensial unik mahasiswa.
        </div>

      </div>
    </div>
  );
};

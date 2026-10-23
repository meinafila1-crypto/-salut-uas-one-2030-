import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Printer, 
  Copy, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Building2, 
  Info,
  Calendar,
  Clock,
  MapPin,
  Share2
} from 'lucide-react';
import { Registration } from '../types';

interface ConfirmationProofProps {
  registration: Registration;
  onDone: () => void;
}

export const ConfirmationProof: React.FC<ConfirmationProofProps> = ({
  registration,
  onDone
}) => {
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(registration.refNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `Bukti Registrasi UAS 2030 SALUT Cahaya Merapi UT Yogyakarta\nNama: ${registration.fullName}\nNIM: ${registration.nim}\nNo. Ref: ${registration.refNumber}\nJadwal: ${registration.day} (${registration.timeRange})\nLokasi: ${registration.location}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      {/* Success Notification Bar (no-print) */}
      <div className="mb-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 flex items-start sm:items-center justify-between gap-4 no-print shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-white text-base">
              Registrasi Berhasil Disimpan!
            </h3>
            <p className="text-xs text-emerald-300/90">
              Data Anda telah tersimpan secara permanen pada sistem SALUT Cahaya Merapi.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-heading font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Bukti</span>
        </button>
      </div>

      {/* THE OFFICIAL CONFIRMATION CARD (PRINTABLE) */}
      <div className="print-document rounded-3xl glass-panel border-sky-500/40 p-6 sm:p-10 shadow-2xl relative overflow-hidden bg-[#051126]">
        
        {/* Subtle Watermark background in print/screen */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none select-none">
          <ShieldCheck className="w-96 h-96 text-sky-400" />
        </div>

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-sky-800/60 pb-6 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#003B73] to-[#0284c7] border border-yellow-400/50 flex items-center justify-center text-yellow-300 shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-white tracking-wide">
                  SALUT CAHAYA MERAPI
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                  UAS 2030
                </span>
              </div>
              <p className="text-xs text-sky-300 font-semibold tracking-wider uppercase">
                Universitas Terbuka Yogyakarta
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-mono-code uppercase tracking-widest text-slate-400 block">
              STATUS ALOKASI RUANG
            </span>
            <span className="inline-block mt-0.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-400/40">
              ● TERDAFTAR RESMI
            </span>
          </div>
        </div>

        {/* Reference Number Highlight Panel */}
        <div className="p-4 sm:p-5 rounded-2xl bg-sky-950/70 border border-sky-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="text-[11px] font-mono-code text-slate-400 uppercase tracking-widest">
              NOMOR REFERENSI REGISTRASI (UNIK)
            </div>
            <div className="text-xl sm:text-2xl font-mono-code font-extrabold text-yellow-300 tracking-wider">
              {registration.refNumber}
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handleCopyRef}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-900/50 hover:bg-sky-800 text-sky-200 text-xs font-medium border border-sky-600/30 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-yellow-300" />}
              <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-900/50 hover:bg-sky-800 text-sky-200 text-xs font-medium border border-sky-600/30 transition-all cursor-pointer"
              title="Salin ringkasan ke clipboard"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-300" />
              <span>{shareFeedback ? 'Ringkasan Disalin!' : 'Bagikan'}</span>
            </button>
          </div>
        </div>

        {/* Two-Column Details Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Identitas Mahasiswa */}
          <div className="space-y-3.5 p-4 rounded-xl bg-[#030d22] border border-sky-900/50">
            <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider block border-b border-sky-900/60 pb-1.5">
              Identitas Peserta UAS
            </span>

            <div>
              <div className="text-[11px] text-slate-400">Nama Mahasiswa</div>
              <div className="text-sm font-bold text-white uppercase">{registration.fullName}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Nomor Induk Mahasiswa (NIM)</div>
              <div className="text-sm font-mono-code font-bold text-yellow-300">{registration.nim}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Program Studi</div>
              <div className="text-xs font-semibold text-slate-200">{registration.studyProgram}</div>
              <div className="text-[10px] text-slate-400">{registration.faculty}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Nomor WhatsApp Terdaftar</div>
              <div className="text-xs font-mono-code text-slate-300">{registration.whatsapp}</div>
            </div>
          </div>

          {/* Jadwal & Alokasi Ruang */}
          <div className="space-y-3.5 p-4 rounded-xl bg-[#030d22] border border-sky-900/50">
            <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider block border-b border-sky-900/60 pb-1.5">
              Alokasi Jadwal & Tempat Ujian
            </span>

            <div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                Hari & Tanggal Ujian
              </div>
              <div className="text-sm font-bold text-white">{registration.day}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-yellow-300" />
                Sesi & Jam Ujian
              </div>
              <div className="text-xs font-mono-code font-bold text-yellow-300">
                {registration.sessionName} • {registration.timeRange}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                Lokasi / Gedung Ujian
              </div>
              <div className="text-xs font-semibold text-slate-200">
                {registration.regionName ? `${registration.regionName} — ` : ''}{registration.location}
              </div>
              {registration.locationAddress && (
                <div className="text-[10px] text-slate-400 mt-0.5">{registration.locationAddress}</div>
              )}
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Ruangan / Lab Komputer</div>
              <div className="text-xs font-mono-code text-emerald-300 font-semibold">{registration.room}</div>
            </div>
          </div>

        </div>

        {/* Digital Verification & Timestamp Box */}
        <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300 mb-6">
          <div className="flex items-center gap-3">
            {/* SVG Micro QR Code Pattern */}
            <div className="w-16 h-16 p-1.5 bg-white rounded-lg shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 25 25" className="w-full h-full text-slate-950">
                <rect x="0" y="0" width="7" height="7" fill="currentColor" />
                <rect x="1" y="1" width="5" height="5" fill="white" />
                <rect x="2" y="2" width="3" height="3" fill="currentColor" />
                
                <rect x="18" y="0" width="7" height="7" fill="currentColor" />
                <rect x="19" y="1" width="5" height="5" fill="white" />
                <rect x="20" y="2" width="3" height="3" fill="currentColor" />
                
                <rect x="0" y="18" width="7" height="7" fill="currentColor" />
                <rect x="1" y="19" width="5" height="5" fill="white" />
                <rect x="2" y="20" width="3" height="3" fill="currentColor" />
                
                <rect x="9" y="3" width="2" height="2" fill="currentColor" />
                <rect x="13" y="2" width="3" height="2" fill="currentColor" />
                <rect x="10" y="7" width="4" height="2" fill="currentColor" />
                <rect x="8" y="11" width="3" height="3" fill="currentColor" />
                <rect x="13" y="10" width="2" height="4" fill="currentColor" />
                <rect x="17" y="12" width="4" height="2" fill="currentColor" />
                <rect x="9" y="16" width="3" height="2" fill="currentColor" />
                <rect x="14" y="18" width="3" height="3" fill="currentColor" />
                <rect x="19" y="17" width="2" height="4" fill="currentColor" />
              </svg>
            </div>

            <div className="space-y-0.5">
              <span className="font-mono-code font-bold text-white text-[11px] block">
                VALIDASI DIGITAL SALUT 2030
              </span>
              <p className="text-[11px] text-slate-400">
                Terdaftar pada: {new Date(registration.registeredAt).toLocaleString('id-ID', {
                  dateStyle: 'long',
                  timeStyle: 'medium'
                })}
              </p>
              <p className="text-[10px] text-sky-400 font-mono-code">
                HASH: {registration.id}
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-400 border-t sm:border-t-0 pt-2 sm:pt-0">
            <span className="block font-semibold text-slate-300">Tanda Tangan Digital Panitia:</span>
            <span className="font-heading text-sky-300 font-bold block mt-0.5">SALUT CAHAYA MERAPI</span>
            <span className="text-[10px] text-slate-500">Unit Pelaksana Teknis UAS UT</span>
          </div>
        </div>

        {/* Mandatory Official Notice (Prompt section 5 requirement) */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Ketentuan Resmi Bukti Registrasi:</span>
              <p className="mt-0.5 text-slate-400">
                Bukti ini merupakan konfirmasi registrasi internal SALUT Cahaya Merapi Universitas Terbuka Yogyakarta untuk alokasi tempat duduk dan fasilitas laboratorium komputer UAS. Bukti ini bukan merupakan pengganti Kartu Tanda Peserta Ujian (KTPU) resmi yang diterbitkan melalui sistem pusat Universitas Terbuka. Harap simpan atau cetak bukti ini untuk ditunjukkan saat verifikasi kehadiran di lokasi ujian.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Action Footer (no-print) */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <button
          onClick={onDone}
          className="w-full sm:w-auto px-5 py-3 rounded-xl glass-card hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Selesai & Kembali ke Beranda</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-heading font-extrabold text-xs shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Cetak / Simpan Bukti PDF</span>
          </button>
        </div>
      </div>

    </div>
  );
};

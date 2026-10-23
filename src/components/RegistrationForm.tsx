import React, { useState, useMemo, useEffect } from 'react';
import { 
  User, 
  CreditCard, 
  GraduationCap, 
  Phone, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  Loader2, 
  Sparkles, 
  BookOpen,
  Building2,
  Compass,
  Check
} from 'lucide-react';
import { 
  ExamRegion,
  ExamLocation,
  ExamSlot, 
  Registration, 
  RegistrationPeriod, 
  getFaculties, 
  getProgramsByFaculty, 
  findFacultyByCode, 
  findProgramByCode, 
  validateFacultyProgramPair,
  DegreeLevel,
  AcademicProgramItem 
} from '../types';
import { 
  submitStudentRegistration, 
  checkNimExists,
  getExamRegions,
  getExamLocations
} from '../services/examService';

interface RegistrationFormProps {
  regions?: ExamRegion[];
  locations?: ExamLocation[];
  slots: ExamSlot[];
  period: RegistrationPeriod | null;
  onSuccess: (registration: Registration) => void;
  onCancel: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  regions: initialRegions,
  locations: initialLocations,
  slots,
  period,
  onSuccess,
  onCancel
}) => {
  // Wizard steps: 1 = Data Mahasiswa, 2 = Pilihan Jadwal & Lokasi UAS, 3 = Periksa Ringkasan & Konfirmasi
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Local fallback state if parent hasn't loaded regions/locations
  const [localRegions, setLocalRegions] = useState<ExamRegion[]>(initialRegions || []);
  const [localLocations, setLocalLocations] = useState<ExamLocation[]>(initialLocations || []);

  useEffect(() => {
    if (initialRegions && initialRegions.length > 0) {
      setLocalRegions(initialRegions);
    } else {
      getExamRegions().then(r => setLocalRegions(r || [])).catch(() => {});
    }
  }, [initialRegions]);

  useEffect(() => {
    if (initialLocations && initialLocations.length > 0) {
      setLocalLocations(initialLocations);
    } else {
      getExamLocations().then(l => setLocalLocations(l || [])).catch(() => {});
    }
  }, [initialLocations]);

  // Form State - Mahasiswa
  const [fullName, setFullName] = useState('');
  const [nim, setNim] = useState('');
  const [facultyCode, setFacultyCode] = useState('');
  const [faculty, setFaculty] = useState('');
  const [studyProgramCode, setStudyProgramCode] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel | undefined>(undefined);
  const [whatsapp, setWhatsapp] = useState('');

  // Form State - Cascading Schedule & Location Selection
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  // Processing & Error State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateNimWarning, setDuplicateNimWarning] = useState<Registration | null>(null);

  // Centralized Faculties List
  const facultiesList = useMemo(() => getFaculties(), []);

  // Dynamically filtered Active Programs based on chosen Faculty
  const availablePrograms = useMemo<AcademicProgramItem[]>(() => {
    if (!facultyCode) return [];
    return getProgramsByFaculty(facultyCode, { onlyActive: true });
  }, [facultyCode]);

  // ==========================================================================
  // CASCADING SELECTIONS: WILAYAH -> LOKASI -> TANGGAL -> SESI
  // ==========================================================================

  // 1. Active Regions
  const activeRegions = useMemo(() => {
    return localRegions
      .filter(r => r.isActive)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [localRegions]);

  // 2. Active Locations filtered by chosen Region
  const availableLocations = useMemo(() => {
    if (!selectedRegionId) return [];
    return localLocations
      .filter(l => l.isActive && l.regionId === selectedRegionId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [localLocations, selectedRegionId]);

  const selectedRegion = useMemo(() => {
    return localRegions.find(r => r.id === selectedRegionId);
  }, [localRegions, selectedRegionId]);

  const selectedLocation = useMemo(() => {
    return localLocations.find(l => l.id === selectedLocationId);
  }, [localLocations, selectedLocationId]);

  // 3. Available Dates for the chosen Location
  const availableDatesForLocation = useMemo(() => {
    if (!selectedLocationId && !selectedLocation) return [];
    const datesMap = new Map<string, string>(); // date -> day
    
    slots
      .filter(s => {
        if (!s.isActive) return false;
        if (s.locationId && s.locationId === selectedLocationId) return true;
        if (!s.locationId && selectedLocation && s.location === selectedLocation.name) return true;
        return false;
      })
      .forEach(s => {
        if (!datesMap.has(s.date)) {
          datesMap.set(s.date, s.day);
        }
      });

    return Array.from(datesMap.entries()).map(([date, day]) => ({ date, day }));
  }, [slots, selectedLocationId, selectedLocation]);

  // 4. Available Slots / Sessions for the chosen Location and Date
  const availableSlotsForSession = useMemo(() => {
    if (!selectedLocationId || !selectedDate) return [];
    return slots
      .filter(s => {
        if (!s.isActive) return false;
        const matchesLocation = s.locationId 
          ? s.locationId === selectedLocationId 
          : (selectedLocation && s.location === selectedLocation.name);
        return matchesLocation && s.date === selectedDate;
      })
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.sessionName.localeCompare(b.sessionName));
  }, [slots, selectedLocationId, selectedDate, selectedLocation]);

  // Selected slot object
  const selectedSlot = useMemo(() => {
    return slots.find(s => s.id === selectedSlotId);
  }, [slots, selectedSlotId]);

  // ==========================================================================
  // HANDLERS WITH AUTOMATIC CASCADE RESETS
  // ==========================================================================

  // Step 1: Faculty selection
  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setFacultyCode(code);
    const facItem = findFacultyByCode(code);
    setFaculty(facItem ? facItem.facultyName : '');

    // Reset child program
    setStudyProgramCode('');
    setStudyProgram('');
    setDegreeLevel(undefined);
    setErrorMessage(null);
  };

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setStudyProgramCode(code);
    const progItem = findProgramByCode(code);
    if (progItem) {
      setStudyProgram(progItem.programName);
      setDegreeLevel(progItem.degreeLevel);
    } else {
      setStudyProgram('');
      setDegreeLevel(undefined);
    }
    setErrorMessage(null);
  };

  // Step 2: Region change -> resets Location, Date, and Session
  const handleRegionChange = (regionId: string) => {
    setSelectedRegionId(regionId);
    setSelectedLocationId('');
    setSelectedDate('');
    setSelectedSlotId('');
    setErrorMessage(null);
  };

  // Step 2: Location change -> resets Date and Session
  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    setSelectedDate('');
    setSelectedSlotId('');
    setErrorMessage(null);
  };

  // Step 2: Date change -> resets Session
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlotId('');
    setErrorMessage(null);
  };

  // Step 2: Slot selection
  const handleSlotSelect = (slot: ExamSlot) => {
    if (slot.registeredCount >= slot.capacity) {
      return; // Cannot pick full session
    }
    setSelectedSlotId(slot.id);
    setErrorMessage(null);
  };

  // Step 1 Validation & Proceed to Step 2
  const handleProceedToSchedule = async () => {
    setErrorMessage(null);
    setDuplicateNimWarning(null);

    const cleanNim = nim.trim();
    const cleanName = fullName.trim();

    if (!cleanName || cleanName.length < 3) {
      setErrorMessage('Harap isi Nama Lengkap Anda secara benar.');
      return;
    }

    if (!cleanNim || !/^\d{8,12}$/.test(cleanNim)) {
      setErrorMessage('Nomor Induk Mahasiswa (NIM) harus berupa 8-12 digit angka resmi Universitas Terbuka.');
      return;
    }

    if (!facultyCode || !studyProgramCode) {
      setErrorMessage('Harap pilih Fakultas / Kategori Pendidikan dan Program Studi Anda.');
      return;
    }

    const pairValidation = validateFacultyProgramPair(facultyCode, studyProgramCode);
    if (!pairValidation.isValid) {
      setErrorMessage(pairValidation.error || 'Program studi tidak cocok dengan fakultas yang dipilih.');
      return;
    }

    if (!whatsapp.trim() || whatsapp.trim().length < 9) {
      setErrorMessage('Harap isi Nomor WhatsApp aktif untuk konfirmasi kehadiran.');
      return;
    }

    // Check duplicate NIM if disallowed
    if (period && !period.allowDuplicateNim) {
      setIsSubmitting(true);
      try {
        const existing = await checkNimExists(cleanNim);
        if (existing) {
          setDuplicateNimWarning(existing);
          setErrorMessage(`NIM ${cleanNim} sudah terdaftar sebelumnya dengan No. Referensi ${existing.refNumber}. Sesuai kebijakan admin, registrasi ganda tidak diperkenankan.`);
          setIsSubmitting(false);
          return;
        }
      } catch (e) {
        console.warn('Check NIM warning:', e);
      } finally {
        setIsSubmitting(false);
      }
    }

    // Default auto-pick first region if none selected yet
    if (activeRegions.length > 0 && !selectedRegionId) {
      setSelectedRegionId(activeRegions[0].id);
    }

    setStep(2);
  };

  // Step 2 Validation & Proceed to Step 3 (Review)
  const handleProceedToReview = () => {
    setErrorMessage(null);

    if (!selectedRegionId) {
      setErrorMessage('Harap pilih Wilayah Ujian.');
      return;
    }

    if (!selectedLocationId) {
      setErrorMessage('Harap pilih Lokasi Ujian yang tersedia di wilayah terpilih.');
      return;
    }

    if (!selectedDate) {
      setErrorMessage('Harap pilih Tanggal Ujian.');
      return;
    }

    if (!selectedSlotId || !selectedSlot) {
      setErrorMessage('Harap pilih Sesi Ujian yang masih memiliki kuota kursi.');
      return;
    }

    if (selectedSlot.registeredCount >= selectedSlot.capacity) {
      setErrorMessage('Sesi yang Anda pilih sudah penuh. Silakan pilih sesi atau hari lain.');
      return;
    }

    setStep(3);
  };

  // Step 3 Final Submit
  const handleFinalSubmit = async () => {
    if (!selectedSlot) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await submitStudentRegistration({
        nim: nim.trim(),
        fullName: fullName.trim(),
        studyProgram,
        studyProgramCode,
        faculty,
        facultyCode,
        degreeLevel,
        whatsapp: whatsapp.trim(),
        regionId: selectedRegionId,
        regionName: selectedRegion?.name || selectedSlot.regionName,
        locationId: selectedLocationId,
        locationAddress: selectedLocation?.address || selectedSlot.locationAddress,
        slotId: selectedSlot.id
      });

      onSuccess(result);
    } catch (err: unknown) {
      console.error('Registration failed:', err);
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat menyimpan registrasi. Silakan coba kembali.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="rounded-3xl glass-panel border-sky-500/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden bg-[#040e24]">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header Progress Wizard */}
        <div className="relative z-10 mb-8 border-b border-sky-900/60 pb-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-xs font-mono-code font-bold tracking-widest text-yellow-300 uppercase">
                SALUT UAS ONE 2030
              </span>
            </div>
            <span className="text-xs text-sky-300 font-mono-code">
              Langkah {step} dari 3
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className={`flex-1 h-2 rounded-full transition-all ${
              step >= 1 ? 'bg-gradient-to-r from-sky-400 to-yellow-400' : 'bg-slate-800'
            }`} />
            <div className={`flex-1 h-2 rounded-full transition-all ${
              step >= 2 ? 'bg-gradient-to-r from-sky-400 to-yellow-400' : 'bg-slate-800'
            }`} />
            <div className={`flex-1 h-2 rounded-full transition-all ${
              step >= 3 ? 'bg-gradient-to-r from-yellow-400 to-emerald-400' : 'bg-slate-800'
            }`} />
          </div>

          <div className="mt-3 flex justify-between text-[11px] font-medium text-slate-400">
            <span className={step === 1 ? 'text-yellow-300 font-bold' : ''}>1. Data Mahasiswa</span>
            <span className={step === 2 ? 'text-yellow-300 font-bold' : ''}>2. Wilayah & Jadwal</span>
            <span className={step === 3 ? 'text-yellow-300 font-bold' : ''}>3. Konfirmasi</span>
          </div>
        </div>

        {/* Global Error Notice */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-3 animate-in fade-in duration-200">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-rose-300 block">Pemberitahuan Sistem:</span>
              <p className="leading-relaxed">{errorMessage}</p>
              {duplicateNimWarning && (
                <div className="pt-2 text-[11px] text-sky-300 flex items-center gap-2">
                  <span>Terdaftar pada: {duplicateNimWarning.day} ({duplicateNimWarning.sessionName})</span>
                  <span>•</span>
                  <span>Lokasi: {duplicateNimWarning.location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 1: IDENTITAS MAHASISWA & FAKULTAS-PRODI                           */}
        {/* ===================================================================== */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            <div className="border-b border-sky-900/40 pb-3">
              <h2 className="text-lg sm:text-xl font-heading font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-yellow-300" />
                <span>Identitas Mahasiswa Universitas Terbuka</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Lengkapi identitas akademik resmi Anda sebelum memilih wilayah dan sesi ujian.
              </p>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wide">
                Nama Lengkap (Sesuai Data SIA UT) *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-sky-400 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Rian Anggara"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#06142e] border border-sky-500/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white placeholder-slate-500 text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* NIM */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wide">
                Nomor Induk Mahasiswa (NIM) *
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-3.5 w-4 h-4 text-sky-400 pointer-events-none" />
                <input
                  type="text"
                  value={nim}
                  onChange={(e) => setNim(e.target.value.replace(/\D/g, ''))}
                  maxLength={12}
                  placeholder="Contoh: 041234567"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#06142e] border border-sky-500/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white placeholder-slate-500 font-mono-code text-sm outline-none transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Masukkan 8–12 digit angka NIM aktif Anda.
              </p>
            </div>

            {/* Hubungan Otomatis Fakultas & Program Studi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wide">
                  Fakultas / Kategori Pendidikan *
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-3.5 w-4 h-4 text-sky-400 pointer-events-none" />
                  <select
                    value={facultyCode}
                    onChange={handleFacultyChange}
                    className="w-full pl-10 pr-8 py-3 rounded-xl bg-[#06142e] border border-sky-500/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white text-sm outline-none appearance-none transition-all cursor-pointer"
                    required
                  >
                    <option value="">Pilih Fakultas / Kategori...</option>
                    {facultiesList.map((f) => (
                      <option key={f.facultyCode} value={f.facultyCode} className="bg-slate-900 text-white">
                        {f.facultyName}
                      </option>
                    ))}
                  </select>
                </div>
                {facultyCode && (
                  <p className="text-[10px] text-sky-300/80 mt-1">
                    {availablePrograms.length} Program Studi aktif tersedia.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wide flex items-center justify-between">
                  <span>Program Studi *</span>
                  {degreeLevel && (
                    <span className="text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                      Jenjang: {degreeLevel}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-3.5 w-4 h-4 text-sky-400 pointer-events-none" />
                  <select
                    value={studyProgramCode}
                    onChange={handleProgramChange}
                    disabled={!facultyCode}
                    className="w-full pl-10 pr-8 py-3 rounded-xl bg-[#06142e] border border-sky-500/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white text-sm outline-none appearance-none transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    required
                  >
                    <option value="">
                      {facultyCode 
                        ? (availablePrograms.length > 0 ? 'Pilih Program Studi...' : 'Tidak ada prodi aktif pada unit ini') 
                        : 'Pilih Fakultas terlebih dahulu'}
                    </option>
                    {availablePrograms.map((prog) => (
                      <option key={prog.programCode} value={prog.programCode} className="bg-slate-900 text-white">
                        {prog.programName} ({prog.degreeLevel})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {!facultyCode 
                    ? 'Pilihan prodi terkunci hingga fakultas ditentukan.' 
                    : 'Pilihan prodi disaring otomatis khusus untuk fakultas terpilih.'}
                </p>
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wide">
                Nomor WhatsApp Aktif *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-sky-400 pointer-events-none" />
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#06142e] border border-sky-500/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-white placeholder-slate-500 font-mono-code text-sm outline-none transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Digunakan untuk notifikasi pembagian ruang, presensi, dan konfirmasi darurat.
              </p>
            </div>

            {/* Step 1 Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-sky-900/40">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Kembali ke Beranda
              </button>

              <button
                type="button"
                onClick={handleProceedToSchedule}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl font-heading font-bold text-slate-950 bg-yellow-400 hover:bg-yellow-300 shadow-md shadow-yellow-500/20 flex items-center gap-2 text-sm transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi NIM...</span>
                  </>
                ) : (
                  <>
                    <span>Pilih Wilayah & Jadwal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 2: CASCADING SELECTION: WILAYAH -> LOKASI -> TANGGAL -> SESI      */}
        {/* ===================================================================== */}
        {step === 2 && (
          <div className="space-y-7 animate-in fade-in duration-200">
            
            <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/20 text-xs text-sky-200 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
              <span>
                Sistem Dinamis 2030: Seluruh wilayah, lokasi sekolah, tanggal, dan kuota sesi disinkronkan secara langsung dari panel admin resmi.
              </span>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* LANGKAH 1 — PILIH WILAYAH UJIAN                                    */}
            {/* ----------------------------------------------------------------- */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-yellow-300" />
                  <span>1. Pilih Wilayah Ujian *</span>
                </label>
                {selectedRegion && (
                  <span className="text-[11px] font-mono-code text-yellow-300 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                    Wilayah: {selectedRegion.name}
                  </span>
                )}
              </div>

              {activeRegions.length === 0 ? (
                <div className="p-4 rounded-xl glass-card text-xs text-slate-400 italic">
                  Belum ada wilayah ujian aktif yang dikonfigurasi admin.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {activeRegions.map((reg) => {
                    const isSelected = selectedRegionId === reg.id;
                    const locCount = localLocations.filter(l => l.isActive && l.regionId === reg.id).length;
                    return (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => handleRegionChange(reg.id)}
                        className={`p-3 rounded-xl text-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600/30 border-yellow-400 ring-2 ring-yellow-400 text-white shadow-lg shadow-sky-950 font-bold'
                            : 'glass-card border-sky-500/20 text-slate-300 hover:border-sky-400/50 hover:bg-sky-900/30'
                        }`}
                      >
                        <div className="text-xs truncate">{reg.name}</div>
                        <div className="text-[10px] text-sky-300/80 mt-1 font-mono-code">
                          {locCount} Lokasi
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* LANGKAH 2 — PILIH LOKASI UJIAN (Hanya lokasi di wilayah terpilih)   */}
            {/* ----------------------------------------------------------------- */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-yellow-300" />
                  <span>2. Pilih Lokasi Ujian *</span>
                </label>
                {selectedLocation && (
                  <span className="text-[11px] font-mono-code text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Lokasi Terpilih
                  </span>
                )}
              </div>

              {!selectedRegionId ? (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Pilih Wilayah Ujian terlebih dahulu untuk melihat daftar lokasi yang tersedia.</span>
                </div>
              ) : availableLocations.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Belum ada lokasi ujian aktif di wilayah {selectedRegion?.name}. Silakan pilih wilayah lain.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableLocations.map((loc) => {
                    const isSelected = selectedLocationId === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleLocationChange(loc.id)}
                        className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600/30 border-yellow-400 ring-2 ring-yellow-400 text-white shadow-xl shadow-sky-950'
                            : 'glass-card border-sky-500/20 text-slate-300 hover:border-sky-400/50 hover:bg-sky-900/30'
                        }`}
                      >
                        <div className="font-heading font-bold text-sm text-white flex items-center justify-between">
                          <span>{loc.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-yellow-300" />}
                        </div>
                        <div className="text-xs text-sky-300/90 mt-1 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{loc.address}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-sky-900/50 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{loc.city || selectedRegion?.name}</span>
                          <span className="font-mono-code text-yellow-300 font-semibold">Kapasitas: {loc.capacity}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* LANGKAH 3 — PILIH TANGGAL UJIAN (Hanya tanggal pada lokasi terpilih)*/}
            {/* ----------------------------------------------------------------- */}
            {selectedLocationId && (
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-yellow-300" />
                  <span>3. Pilih Tanggal Ujian Tersedia *</span>
                </label>

                {availableDatesForLocation.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Belum ada jadwal sesi yang aktif pada lokasi {selectedLocation?.name}. Admin dapat menambahkannya melalui panel admin.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableDatesForLocation.map(({ date, day }) => {
                      const isSelected = selectedDate === date;
                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => handleDateChange(date)}
                          className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-600/30 border-yellow-400 ring-2 ring-yellow-400 text-white shadow-lg'
                              : 'glass-card border-sky-500/20 text-slate-300 hover:border-sky-400/50 hover:bg-sky-900/30'
                          }`}
                        >
                          <div className="font-heading font-bold text-sm text-white">{day}</div>
                          <div className="text-xs text-sky-300 font-mono-code mt-0.5">Tanggal: {date}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* LANGKAH 4 — PILIH SESI UJIAN (Jam 24 jam & Status Kuota Real-time)  */}
            {/* ----------------------------------------------------------------- */}
            {selectedLocationId && selectedDate && (
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-yellow-300" />
                  <span>4. Pilih Sesi Ujian (Kapasitas & Status Kuota) *</span>
                </label>

                {availableSlotsForSession.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
                    Tidak ada sesi aktif pada tanggal terpilih di lokasi ini.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableSlotsForSession.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      const isFull = slot.registeredCount >= slot.capacity;
                      const seatsLeft = Math.max(0, slot.capacity - slot.registeredCount);
                      const percentFilled = Math.min(100, Math.round((slot.registeredCount / slot.capacity) * 100));

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isFull}
                          onClick={() => handleSlotSelect(slot)}
                          className={`w-full p-4 rounded-xl text-left border transition-all ${
                            isFull 
                              ? 'opacity-50 bg-slate-900/50 border-slate-800 cursor-not-allowed'
                              : isSelected
                                ? 'bg-sky-600/30 border-yellow-400 ring-2 ring-yellow-400 shadow-xl cursor-pointer'
                                : 'glass-card border-sky-500/20 hover:border-sky-400/50 hover:bg-sky-900/30 cursor-pointer'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="font-heading font-bold text-sm text-white flex items-center gap-2">
                                <span>{slot.sessionName}</span>
                                <span className="text-yellow-300 font-mono-code text-xs px-2 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/20">
                                  {slot.timeRange}
                                </span>
                                {isFull && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                                    PENUH
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-sky-300 mt-1">
                                Ruang: <span className="text-white font-medium">{slot.room}</span>
                              </div>
                            </div>

                            <div className="text-right sm:shrink-0">
                              <div className="text-xs font-mono-code font-semibold">
                                <span className={isFull ? 'text-rose-400' : 'text-emerald-300'}>
                                  Sisa {seatsLeft} Kursi
                                </span>
                                <span className="text-slate-500 text-[11px] ml-1">
                                  / {slot.capacity} Total
                                </span>
                              </div>
                              <div className="w-32 bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden ml-auto">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    isFull ? 'bg-rose-500' : percentFilled > 75 ? 'bg-yellow-400' : 'bg-emerald-400'
                                  }`}
                                  style={{ width: `${percentFilled}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* LANGKAH 5 — RINGKASAN PILIHAN SEBELUM KONFIRMASI                   */}
            {/* ----------------------------------------------------------------- */}
            {selectedSlot && (
              <div className="p-4 rounded-2xl bg-[#030c22] border border-sky-400/40 shadow-inner space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-sky-900/60">
                  <span className="text-xs font-bold text-yellow-300 uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                    <span>Ringkasan Pilihan Jadwal Anda</span>
                  </span>
                  <span className="text-[10px] font-mono-code text-sky-300">Siap Dikonfirmasi</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Wilayah & Lokasi Ujian:</span>
                    <span className="font-semibold text-white">{selectedRegion?.name} — {selectedLocation?.name || selectedSlot.location}</span>
                    <span className="text-[11px] text-slate-400 block">{selectedLocation?.address || selectedSlot.locationAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Waktu & Ruangan:</span>
                    <span className="font-semibold text-white">{selectedSlot.day} ({selectedSlot.date})</span>
                    <span className="text-yellow-300 font-mono-code text-[11px] block">{selectedSlot.sessionName} • {selectedSlot.timeRange}</span>
                    <span className="text-emerald-300 text-[11px] block">{selectedSlot.room}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-sky-900/40">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white flex items-center gap-2 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToReview}
                disabled={!selectedSlotId}
                className="px-6 py-3 rounded-xl font-heading font-bold text-slate-950 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-yellow-500/20 flex items-center gap-2 text-sm transition-all cursor-pointer"
              >
                <span>Periksa Ringkasan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 3: RINGKASAN DATA FINAL & KONFIRMASI REGISTRASI                   */}
        {/* ===================================================================== */}
        {step === 3 && selectedSlot && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="p-4 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-xs text-yellow-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Pemeriksaan Akhir:</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">
                  Harap pastikan seluruh data identitas mahasiswa dan pilihan lokasi serta jadwal UAS di bawah ini sudah tepat sebelum menekan tombol Kirim Registrasi.
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Mahasiswa Info */}
              <div className="p-4 rounded-xl glass-card border-sky-500/20 space-y-2.5">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block border-b border-sky-900/50 pb-1.5">
                  Identitas Mahasiswa
                </span>
                <div>
                  <div className="text-[11px] text-slate-400">Nama Lengkap</div>
                  <div className="text-sm font-bold text-white">{fullName}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Nomor Induk Mahasiswa (NIM)</div>
                  <div className="text-sm font-mono-code font-bold text-yellow-300">{nim}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Program Studi</div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{studyProgram}</span>
                    {degreeLevel && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-mono-code">
                        {degreeLevel}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{faculty}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Nomor WhatsApp</div>
                  <div className="text-xs font-mono-code text-slate-300">{whatsapp}</div>
                </div>
              </div>

              {/* Jadwal & Lokasi UAS Info */}
              <div className="p-4 rounded-xl glass-card border-sky-500/20 space-y-2.5">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block border-b border-sky-900/50 pb-1.5">
                  Pilihan Wilayah & Lokasi Ujian
                </span>
                <div>
                  <div className="text-[11px] text-slate-400">Wilayah Ujian</div>
                  <div className="text-sm font-bold text-yellow-300">{selectedRegion?.name || selectedSlot.regionName || 'D.I. Yogyakarta'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Lokasi / Sekolah Ujian</div>
                  <div className="text-sm font-bold text-white">{selectedLocation?.name || selectedSlot.location}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{selectedLocation?.address || selectedSlot.locationAddress}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Hari & Tanggal Ujian</div>
                  <div className="text-xs font-medium text-slate-200">{selectedSlot.day} ({selectedSlot.date})</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Sesi & Jam Ujian</div>
                  <div className="text-xs font-mono-code text-yellow-300">
                    {selectedSlot.sessionName} — ({selectedSlot.timeRange})
                  </div>
                  <div className="text-[11px] text-emerald-300">{selectedSlot.room}</div>
                </div>
              </div>

            </div>

            {/* Disclaimer Section */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-[11px] text-slate-400 leading-relaxed">
              <span className="text-slate-300 font-semibold block mb-0.5">Ketentuan Layanan:</span>
              Dengan mengirim registrasi ini, Anda mengalokasikan satu kursi ujian di wilayah dan lokasi terpilih melalui SALUT Cahaya Merapi UT Yogyakarta. Konfirmasi ini adalah bukti registrasi internal pendukung administrasi akademik. Kartu Tanda Peserta Ujian (KTPU) resmi tetap dapat diunduh melalui portal SIA UT sesuai kalender akademik resmi.
            </div>

            {/* Step 3 Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-sky-900/40">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white flex items-center gap-2 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ubah Pilihan</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl font-heading font-extrabold text-slate-950 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 hover:brightness-110 shadow-lg shadow-yellow-500/30 flex items-center gap-2 text-sm transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Kirim Registrasi UAS</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

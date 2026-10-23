import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Download, 
  Printer, 
  Search, 
  Plus, 
  Settings, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Sliders, 
  X, 
  Save, 
  ShieldCheck,
  Eye,
  Building2,
  ChevronDown,
  Layers,
  Image as ImageIcon,
  Compass,
  Check,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Info,
  ArrowUpDown,
  List,
  Grid,
  Filter,
  Loader2
} from 'lucide-react';
import defaultHeroStudent from '../assets/hero_student_2030.jpg';
import { 
  ExamRegion,
  ExamLocation,
  ExamSlot, 
  Registration, 
  RegistrationPeriod, 
  RegistrationStatus, 
  UT_FACULTIES 
} from '../types';
import { 
  getAllRegistrations, 
  subscribeAllRegistrations, 
  updateRegistrationStatus, 
  cancelRegistrationAndFreeQuota,
  saveExamSlot, 
  deleteExamSlot, 
  updateRegistrationPeriod,
  saveExamRegion,
  deleteExamRegion,
  saveExamLocation,
  deleteExamLocation,
  getExamRegions,
  getExamLocations
} from '../services/examService';

interface AdminDashboardProps {
  regions?: ExamRegion[];
  locations?: ExamLocation[];
  slots: ExamSlot[];
  period: RegistrationPeriod | null;
  onRefreshRegions?: () => void;
  onRefreshLocations?: () => void;
  onRefreshSlots: () => void;
  onRefreshPeriod: () => void;
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  regions: initialRegions,
  locations: initialLocations,
  slots,
  period,
  onRefreshRegions,
  onRefreshLocations,
  onRefreshSlots,
  onRefreshPeriod,
  onBackToHome
}) => {
  // Navigation tabs within Admin:
  // 'registrations' | 'regions' | 'locations' | 'slots' | 'settings' | 'statistics'
  const [activeTab, setActiveTab] = useState<'registrations' | 'regions' | 'locations' | 'slots' | 'settings' | 'statistics'>('registrations');

  // Fallback states for regions and locations
  const [localRegions, setLocalRegions] = useState<ExamRegion[]>(initialRegions || []);
  const [localLocations, setLocalLocations] = useState<ExamLocation[]>(initialLocations || []);

  const refreshAllLocal = async () => {
    try {
      const [r, l] = await Promise.all([getExamRegions(), getExamLocations()]);
      if (r) setLocalRegions(r);
      if (l) setLocalLocations(l);
    } catch (e) {
      console.warn('Refresh local error:', e);
    }
  };

  useEffect(() => {
    if (initialRegions) setLocalRegions(initialRegions);
  }, [initialRegions]);

  useEffect(() => {
    if (initialLocations) setLocalLocations(initialLocations);
  }, [initialLocations]);

  // Registrations state
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoadingRegs, setIsLoadingRegs] = useState<boolean>(true);
  const [regError, setRegError] = useState<string | null>(null);

  // Filters for Registrations
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProdi, setFilterProdi] = useState('');

  // Selected registration detail modal
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  // Region Edit/Create modal, search & sort
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Partial<ExamRegion> | null>(null);
  const [regionSearch, setRegionSearch] = useState('');
  const [regionSort, setRegionSort] = useState<'order' | 'name-asc' | 'name-desc' | 'status'>('order');

  // Location Edit/Create modal, search, filter & sort
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Partial<ExamLocation> | null>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [filterLocRegion, setFilterLocRegion] = useState('');
  const [filterLocStatus, setFilterLocStatus] = useState('all');
  const [locationSort, setLocationSort] = useState<'order' | 'name-asc' | 'region-asc' | 'capacity-desc'>('order');

  // Slot Edit/Create modal, search, filters & sort
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Partial<ExamSlot> | null>(null);
  const [slotTimeError, setSlotTimeError] = useState<string | null>(null);
  const [slotSearch, setSlotSearch] = useState('');
  const [filterSlotRegion, setFilterSlotRegion] = useState('');
  const [filterSlotLocation, setFilterSlotLocation] = useState('');
  const [filterSlotDate, setFilterSlotDate] = useState('');
  const [filterSlotStatus, setFilterSlotStatus] = useState('all');
  const [slotSort, setSlotSort] = useState<'time-asc' | 'date-asc' | 'name-asc' | 'seats-desc' | 'order'>('time-asc');
  const [slotViewMode, setSlotViewMode] = useState<'cards' | 'table'>('cards');

  // Loading & Async action states to prevent double submission
  const [isSavingSlot, setIsSavingSlot] = useState(false);
  const [isSavingRegion, setIsSavingRegion] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Toast feedback state
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(prev => prev?.message === message ? null : prev);
    }, 4500);
  };

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<RegistrationPeriod>(() => {
    return period || {
      title: 'REGISTRASI UAS SALUT CAHAYA MERAPI',
      semester: 'Semester 2029/2030 Ganjil (2029.1)',
      academicYear: '2029/2030',
      isOpen: true,
      openDate: '2030-11-01',
      closeDate: '2030-12-10',
      announcement: '',
      allowDuplicateNim: false,
      heroImageUrl: '',
      updatedAt: new Date().toISOString()
    };
  });
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Load Registrations
  const loadRegistrations = async () => {
    setIsLoadingRegs(true);
    setRegError(null);
    try {
      const data = await getAllRegistrations();
      setRegistrations(data);
    } catch (err: unknown) {
      console.error('Failed to load registrations:', err);
      setRegError('Gagal memuat data registrasi. Pastikan aturan keamanan Firestore terkonfigurasi.');
    } finally {
      setIsLoadingRegs(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
    const unsub = subscribeAllRegistrations(
      (data) => {
        setRegistrations(data);
        setIsLoadingRegs(false);
      },
      (err) => {
        console.warn('Realtime registrations notice:', err);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (period) {
      setSettingsForm(period);
    }
  }, [period]);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchesSearch = 
        reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.nim.includes(searchTerm) ||
        reg.refNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDay = !filterDay || reg.day === filterDay;
      const matchesSession = !filterSession || reg.sessionName === filterSession;
      const matchesLocation = !filterLocation || reg.location === filterLocation;
      const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
      const matchesProdi = !filterProdi || reg.studyProgram === filterProdi;

      return matchesSearch && matchesDay && matchesSession && matchesLocation && matchesStatus && matchesProdi;
    });
  }, [registrations, searchTerm, filterDay, filterSession, filterLocation, filterStatus, filterProdi]);

  // Filtered & Sorted Regions
  const filteredRegions = useMemo(() => {
    const q = regionSearch.trim().toLowerCase();
    const list = localRegions.filter((r) => {
      if (!q) return true;
      const matchName = r.name.toLowerCase().includes(q);
      const matchDesc = r.description ? r.description.toLowerCase().includes(q) : false;
      const matchId = r.id.toLowerCase().includes(q);
      return matchName || matchDesc || matchId;
    });

    return [...list].sort((a, b) => {
      if (regionSort === 'name-asc') return a.name.localeCompare(b.name);
      if (regionSort === 'name-desc') return b.name.localeCompare(a.name);
      if (regionSort === 'status') return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  }, [localRegions, regionSearch, regionSort]);

  // Filtered & Sorted Locations
  const filteredLocations = useMemo(() => {
    const q = locationSearch.trim().toLowerCase();
    const list = localLocations.filter((l) => {
      const matchSearch = !q || 
        l.name.toLowerCase().includes(q) || 
        l.address.toLowerCase().includes(q) || 
        (l.city && l.city.toLowerCase().includes(q));
      const matchRegion = !filterLocRegion || l.regionId === filterLocRegion;
      const matchStatus = filterLocStatus === 'all' || (filterLocStatus === 'active' ? l.isActive : !l.isActive);
      return matchSearch && matchRegion && matchStatus;
    });

    return [...list].sort((a, b) => {
      if (locationSort === 'name-asc') return a.name.localeCompare(b.name);
      if (locationSort === 'region-asc') return (a.regionName || '').localeCompare(b.regionName || '');
      if (locationSort === 'capacity-desc') return b.capacity - a.capacity;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  }, [localLocations, locationSearch, filterLocRegion, filterLocStatus, locationSort]);

  // Filtered & Sorted Slots
  const filteredSlots = useMemo(() => {
    const q = slotSearch.trim().toLowerCase();
    const list = slots.filter((s) => {
      const matchSearch = !q || 
        s.sessionName.toLowerCase().includes(q) || 
        s.day.toLowerCase().includes(q) || 
        s.location.toLowerCase().includes(q) || 
        s.room.toLowerCase().includes(q) || 
        s.timeRange.toLowerCase().includes(q) ||
        (s.date && s.date.includes(q));
      
      const matchRegion = !filterSlotRegion || s.regionId === filterSlotRegion;
      const matchLocation = !filterSlotLocation || s.locationId === filterSlotLocation || s.location === filterSlotLocation;
      const matchDate = !filterSlotDate || s.date === filterSlotDate;
      const isFull = s.registeredCount >= s.capacity;
      const matchStatus = 
        filterSlotStatus === 'all' ? true :
        filterSlotStatus === 'active' ? s.isActive :
        filterSlotStatus === 'inactive' ? !s.isActive :
        filterSlotStatus === 'available' ? (s.isActive && !isFull) :
        filterSlotStatus === 'full' ? (s.isActive && isFull) : true;

      return matchSearch && matchRegion && matchLocation && matchDate && matchStatus;
    });

    return [...list].sort((a, b) => {
      if (slotSort === 'time-asc') return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
      if (slotSort === 'date-asc') return a.date.localeCompare(b.date);
      if (slotSort === 'name-asc') return a.sessionName.localeCompare(b.sessionName);
      if (slotSort === 'seats-desc') {
        const remainingA = Math.max(0, a.capacity - a.registeredCount);
        const remainingB = Math.max(0, b.capacity - b.registeredCount);
        return remainingB - remainingA;
      }
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  }, [slots, slotSearch, filterSlotRegion, filterSlotLocation, filterSlotDate, filterSlotStatus, slotSort]);

  // Distinct dates in slots for dropdown filter
  const distinctSlotDates = useMemo(() => {
    const map = new Map<string, string>();
    slots.forEach(s => {
      if (s.date && !map.has(s.date)) {
        map.set(s.date, `${s.date} (${s.day.split('(')[0].trim()})`);
      }
    });
    return Array.from(map.entries()).map(([date, label]) => ({ date, label }));
  }, [slots]);

  // Statistics computations
  const totalRegistered = registrations.length;
  const totalCapacity = slots.reduce((acc, s) => acc + s.capacity, 0);
  const totalRemainingSeats = slots.reduce((acc, s) => acc + Math.max(0, s.capacity - s.registeredCount), 0);
  const percentFilledOverall = totalCapacity > 0 ? Math.round((totalRegistered / totalCapacity) * 100) : 0;

  // Breakdown by Day
  const statsByDay = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach(r => {
      counts[r.day] = (counts[r.day] || 0) + 1;
    });
    return counts;
  }, [registrations]);

  // Breakdown by Session
  const statsBySession = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach(r => {
      counts[r.sessionName] = (counts[r.sessionName] || 0) + 1;
    });
    return counts;
  }, [registrations]);

  // Breakdown by Location
  const statsByLocation = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach(r => {
      counts[r.location] = (counts[r.location] || 0) + 1;
    });
    return counts;
  }, [registrations]);

  // Breakdown by Region
  const statsByRegion = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach(r => {
      const regName = r.regionName || 'Wilayah Belum Ditentukan';
      counts[regName] = (counts[regName] || 0) + 1;
    });
    return counts;
  }, [registrations]);

  // Breakdown by Study Program
  const statsByProgram = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach(r => {
      counts[r.studyProgram] = (counts[r.studyProgram] || 0) + 1;
    });
    return counts;
  }, [registrations]);

  // ==========================================================================
  // REGION CRUD HANDLERS
  // ==========================================================================

  const handleSaveRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegion || !editingRegion.name?.trim() || isSavingRegion) return;

    setIsSavingRegion(true);
    try {
      await saveExamRegion({
        name: editingRegion.name.trim(),
        description: (editingRegion.description || '').trim(),
        isActive: editingRegion.isActive ?? true,
        sortOrder: Number(editingRegion.sortOrder ?? 1),
        createdAt: editingRegion.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, editingRegion.id);

      setIsRegionModalOpen(false);
      setEditingRegion(null);
      showFeedback('success', `Wilayah "${editingRegion.name.trim()}" berhasil disimpan ke database!`);
      if (onRefreshRegions) onRefreshRegions();
      refreshAllLocal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan wilayah ujian.';
      showFeedback('error', msg);
      alert(msg);
    } finally {
      setIsSavingRegion(false);
    }
  };

  const handleToggleRegionActive = async (region: ExamRegion) => {
    try {
      await saveExamRegion({
        name: region.name,
        description: region.description || '',
        isActive: !region.isActive,
        sortOrder: region.sortOrder || 1,
        createdAt: region.createdAt,
        updatedAt: new Date().toISOString()
      }, region.id);

      showFeedback('success', `Status wilayah "${region.name}" berhasil diubah menjadi ${!region.isActive ? 'Aktif' : 'Nonaktif'}.`);
      if (onRefreshRegions) onRefreshRegions();
      refreshAllLocal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui status wilayah.';
      showFeedback('error', msg);
      alert(msg);
    }
  };

  const handleDeleteRegion = async (region: ExamRegion) => {
    const linked = localLocations.filter(l => l.regionId === region.id);
    if (linked.length > 0) {
      const msg = `Peringatan Keamanan: Wilayah "${region.name}" sedang digunakan oleh ${linked.length} lokasi ujian. Harap nonaktifkan status wilayah alih-alih menghapusnya agar data tetap aman.`;
      showFeedback('error', msg);
      alert(msg);
      return;
    }

    if (!confirm(`Hapus permanen wilayah "${region.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      await deleteExamRegion(region.id);
      showFeedback('success', `Wilayah "${region.name}" berhasil dihapus.`);
      if (onRefreshRegions) onRefreshRegions();
      refreshAllLocal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus wilayah.';
      showFeedback('error', msg);
      alert(msg);
    }
  };

  // ==========================================================================
  // LOCATION CRUD HANDLERS
  // ==========================================================================

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation || !editingLocation.name?.trim() || isSavingLocation) {
      if (!editingLocation?.name?.trim()) alert('Nama sekolah atau lokasi ujian wajib diisi.');
      return;
    }
    if (!editingLocation.regionId) {
      alert('Wilayah ujian wajib dipilih dari daftar menu Wilayah Ujian.');
      return;
    }
    if (!editingLocation.address?.trim()) {
      alert('Alamat lengkap lokasi ujian wajib diisi.');
      return;
    }

    setIsSavingLocation(true);
    const parentRegion = localRegions.find(r => r.id === editingLocation.regionId);
    try {
      await saveExamLocation({
        name: editingLocation.name.trim(),
        regionId: editingLocation.regionId,
        regionName: parentRegion?.name || '',
        address: editingLocation.address.trim(),
        city: editingLocation.city?.trim() || '',
        province: editingLocation.province?.trim() || 'D.I. Yogyakarta',
        capacity: Number(editingLocation.capacity || 50),
        isActive: editingLocation.isActive ?? true,
        sortOrder: Number(editingLocation.sortOrder ?? 1),
        createdAt: editingLocation.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, editingLocation.id);

      setIsLocationModalOpen(false);
      setEditingLocation(null);
      showFeedback('success', `Lokasi ujian "${editingLocation.name.trim()}" berhasil disimpan ke database!`);
      if (onRefreshLocations) onRefreshLocations();
      refreshAllLocal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan lokasi ujian.';
      showFeedback('error', msg);
      alert(msg);
    } finally {
      setIsSavingLocation(false);
    }
  };

  const handleToggleLocationActive = async (loc: ExamLocation) => {
    try {
      await saveExamLocation({
        name: loc.name,
        regionId: loc.regionId,
        regionName: loc.regionName || '',
        address: loc.address,
        city: loc.city || '',
        province: loc.province || '',
        capacity: loc.capacity,
        isActive: !loc.isActive,
        sortOrder: loc.sortOrder || 1,
        createdAt: loc.createdAt,
        updatedAt: new Date().toISOString()
      }, loc.id);

      showFeedback('success', `Status lokasi "${loc.name}" berhasil diubah menjadi ${!loc.isActive ? 'Aktif' : 'Nonaktif'}.`);
      if (onRefreshLocations) onRefreshLocations();
      refreshAllLocal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status lokasi.';
      showFeedback('error', msg);
      alert(msg);
    }
  };

  const handleDeleteLocation = async (loc: ExamLocation) => {
    const linkedSlots = slots.filter(s => s.locationId === loc.id || s.location === loc.name);
    if (linkedSlots.length > 0) {
      const msg = `Peringatan: Lokasi "${loc.name}" memiliki ${linkedSlots.length} jadwal sesi ujian terkait. Nonaktifkan status lokasi ini alih-alih menghapusnya agar data pendaftar lama tetap aman.`;
      showFeedback('error', msg);
      alert(msg);
      return;
    }

    if (!confirm(`Hapus permanen lokasi "${loc.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      await deleteExamLocation(loc.id);
      showFeedback('success', `Lokasi "${loc.name}" berhasil dihapus.`);
      if (onRefreshLocations) onRefreshLocations();
      refreshAllLocal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus lokasi.';
      showFeedback('error', msg);
      alert(msg);
    }
  };

  // ==========================================================================
  // SLOT / SESI CRUD HANDLERS
  // ==========================================================================

  // Helper to calculate duration in minutes
  const calculateDurationMinutes = (start?: string, end?: string): number | null => {
    if (!start || !end) return null;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return null;
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? diff : null;
  };

  const applyDurationPreset = (minutes: number) => {
    if (!editingSlot?.startTime) return;
    const [sh, sm] = editingSlot.startTime.split(':').map(Number);
    if (isNaN(sh) || isNaN(sm)) return;
    const totalMinutes = sh * 60 + sm + minutes;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    const newEnd = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    setEditingSlot(prev => prev ? ({ ...prev, endTime: newEnd }) : null);
    setSlotTimeError(null);
  };

  const openEditSlotModal = (slot: ExamSlot) => {
    setSlotTimeError(null);
    let start = slot.startTime || '';
    let end = slot.endTime || '';

    // If startTime or endTime is not explicitly present, extract from timeRange
    if (!start || !end) {
      const match = slot.timeRange?.match(/(\d{1,2})[:.](\d{2})\s*[-–]\s*(\d{1,2})[:.](\d{2})/);
      if (match) {
        start = `${match[1].padStart(2, '0')}:${match[2]}`;
        end = `${match[3].padStart(2, '0')}:${match[4]}`;
      }
    }

    setEditingSlot({
      id: slot.id,
      day: slot.day,
      date: slot.date,
      sessionName: slot.sessionName,
      startTime: start || '08:00',
      endTime: end || '09:45',
      timeRange: slot.timeRange,
      locationId: slot.locationId || '',
      location: slot.location,
      regionId: slot.regionId || '',
      regionName: slot.regionName || '',
      locationAddress: slot.locationAddress || '',
      room: slot.room,
      capacity: slot.capacity,
      registeredCount: slot.registeredCount,
      isActive: slot.isActive,
      sortOrder: slot.sortOrder ?? 1,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt
    });
    setIsSlotModalOpen(true);
  };

  const openCreateSlotModal = () => {
    setSlotTimeError(null);
    const activeLoc = localLocations.find(l => l.isActive) || localLocations[0];
    const parentReg = activeLoc ? localRegions.find(r => r.id === activeLoc.regionId) : localRegions[0];

    setEditingSlot({
      day: 'Hari 1 (Sabtu, 14 Desember 2030)',
      date: '2030-12-14',
      sessionName: `Sesi ${(slots.length % 4) + 1} (Pagi)`,
      startTime: '08:00',
      endTime: '09:45',
      timeRange: '08.00–09.45 WIB',
      locationId: activeLoc?.id || '',
      location: activeLoc?.name || 'SALUT Cahaya Merapi',
      regionId: activeLoc?.regionId || parentReg?.id || '',
      regionName: parentReg?.name || activeLoc?.regionName || '',
      locationAddress: activeLoc?.address || '',
      room: 'Lab Komputer 1',
      capacity: 40,
      registeredCount: 0,
      isActive: true,
      sortOrder: slots.length + 1
    });
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot || isSavingSlot) return;
    setSlotTimeError(null);

    // Validate 24-hour time range
    const startTime = editingSlot.startTime?.trim() || '08:00';
    const endTime = editingSlot.endTime?.trim() || '09:45';

    if (startTime >= endTime) {
      setSlotTimeError(`Jam selesai (${endTime}) harus lebih besar daripada jam mulai (${startTime}). Format 24 jam.`);
      return;
    }

    setIsSavingSlot(true);
    // Resolve Location and Region
    let resolvedLocation = editingSlot.location || '';
    let resolvedRegionId = editingSlot.regionId || '';
    let resolvedRegionName = editingSlot.regionName || '';
    let resolvedLocationAddress = editingSlot.locationAddress || '';

    if (editingSlot.locationId) {
      const foundLoc = localLocations.find(l => l.id === editingSlot.locationId);
      if (foundLoc) {
        resolvedLocation = foundLoc.name;
        resolvedRegionId = foundLoc.regionId;
        const foundReg = localRegions.find(r => r.id === foundLoc.regionId);
        resolvedRegionName = foundReg?.name || foundLoc.regionName || '';
        resolvedLocationAddress = foundLoc.address;
      }
    }

    // Warning if lowering capacity below existing registered students
    const existingRegistered = editingSlot.registeredCount || 0;
    const newCapacity = Number(editingSlot.capacity || 40);
    if (editingSlot.id && newCapacity < existingRegistered) {
      alert(`Catatan Penting: Anda mengubah kapasitas menjadi ${newCapacity}, sedangkan saat ini telah ada ${existingRegistered} peserta terdaftar. Data pendaftar lama tidak akan dihapus dan tetap aman.`);
    }

    // Indonesian 24h formatted display: 08.00–09.45 WIB
    const formattedRange = `${startTime.replace(':', '.')}–${endTime.replace(':', '.')} WIB`;

    try {
      await saveExamSlot({
        regionId: resolvedRegionId,
        regionName: resolvedRegionName,
        locationId: editingSlot.locationId || '',
        locationAddress: resolvedLocationAddress,
        day: editingSlot.day || 'Hari 1 (Sabtu, 14 Desember 2030)',
        date: editingSlot.date || '2030-12-14',
        sessionName: editingSlot.sessionName?.trim() || 'Sesi 1 (Pagi)',
        startTime,
        endTime,
        timeRange: formattedRange,
        location: resolvedLocation,
        room: editingSlot.room || 'Lab Komputer 1',
        capacity: newCapacity,
        registeredCount: existingRegistered,
        isActive: editingSlot.isActive ?? true,
        sortOrder: Number(editingSlot.sortOrder ?? 1),
        createdAt: editingSlot.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, editingSlot.id);

      setIsSlotModalOpen(false);
      setEditingSlot(null);
      showFeedback('success', `Sesi "${editingSlot.sessionName}" berhasil disimpan ke database!`);
      onRefreshSlots();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan slot ujian.';
      setSlotTimeError(msg);
      showFeedback('error', msg);
    } finally {
      setIsSavingSlot(false);
    }
  };

  const handleToggleSlotActive = async (slot: ExamSlot) => {
    try {
      await saveExamSlot({
        regionId: slot.regionId || '',
        regionName: slot.regionName || '',
        locationId: slot.locationId || '',
        locationAddress: slot.locationAddress || '',
        day: slot.day,
        date: slot.date,
        sessionName: slot.sessionName,
        startTime: slot.startTime || '08:00',
        endTime: slot.endTime || '09:45',
        timeRange: slot.timeRange,
        location: slot.location,
        room: slot.room,
        capacity: slot.capacity,
        registeredCount: slot.registeredCount,
        isActive: !slot.isActive,
        sortOrder: slot.sortOrder || 1,
        createdAt: slot.createdAt,
        updatedAt: new Date().toISOString()
      }, slot.id);

      showFeedback('success', `Status sesi "${slot.sessionName}" diubah menjadi ${!slot.isActive ? 'Aktif' : 'Nonaktif'}.`);
      onRefreshSlots();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status sesi ujian.';
      showFeedback('error', msg);
      alert(msg);
    }
  };

  const handleDeleteSlot = async (slotId: string, registeredCount: number) => {
    if (registeredCount > 0) {
      const msg = `Sesi ujian ini telah memiliki ${registeredCount} peserta terdaftar. Silakan nonaktifkan sesi ini alih-alih menghapusnya agar data pendaftar tidak rusak.`;
      showFeedback('error', msg);
      alert(msg);
      return;
    }

    if (!confirm('Hapus jadwal slot sesi ini secara permanen?')) return;

    try {
      await deleteExamSlot(slotId);
      showFeedback('success', 'Sesi ujian berhasil dihapus.');
      onRefreshSlots();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus slot.';
      showFeedback('error', msg);
      alert(msg);
    }
  };

  // Change status of a student registration
  const handleChangeStatus = async (id: string, newStatus: RegistrationStatus) => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      if (newStatus === 'Dibatalkan') {
        const reg = registrations.find(r => r.id === id);
        if (reg) {
          await cancelRegistrationAndFreeQuota(id, reg.slotId, reg.nim);
        } else {
          await updateRegistrationStatus(id, newStatus);
        }
      } else {
        await updateRegistrationStatus(id, newStatus);
      }
      showFeedback('success', `Status pendaftaran berhasil diubah menjadi "${newStatus}".`);
      loadRegistrations();
      onRefreshSlots();
      if (selectedReg && selectedReg.id === id) {
        setSelectedReg(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status registrasi.';
      showFeedback('error', msg);
      alert(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingSettings) return;
    setIsSavingSettings(true);
    try {
      await updateRegistrationPeriod(settingsForm);
      onRefreshPeriod();
      setSettingsSaveSuccess(true);
      showFeedback('success', 'Pengaturan sistem dan banner pendaftaran berhasil disimpan!');
      setTimeout(() => setSettingsSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.';
      showFeedback('error', msg);
      alert(msg);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      alert('Tidak ada data registrasi untuk diekspor.');
      return;
    }

    const sanitizeCsvCell = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'No. Ref', 'NIM', 'Nama Mahasiswa', 'Fakultas', 'Program Studi', 
      'Jenjang', 'Nomor WhatsApp', 'Wilayah Ujian', 'Lokasi Ujian', 'Alamat Lokasi',
      'Hari Ujian', 'Tanggal', 'Sesi', 'Jam Ujian', 'Ruangan', 'Status', 'Waktu Pendaftaran'
    ];

    const rows = filteredRegistrations.map((r) => [
      sanitizeCsvCell(r.refNumber),
      sanitizeCsvCell(r.nim),
      sanitizeCsvCell(r.fullName),
      sanitizeCsvCell(r.faculty),
      sanitizeCsvCell(r.studyProgram),
      sanitizeCsvCell(r.degreeLevel || 'S1'),
      sanitizeCsvCell(r.whatsapp),
      sanitizeCsvCell(r.regionName || '-'),
      sanitizeCsvCell(r.location),
      sanitizeCsvCell(r.locationAddress || '-'),
      sanitizeCsvCell(r.day),
      sanitizeCsvCell(r.date),
      sanitizeCsvCell(r.sessionName),
      sanitizeCsvCell(r.timeRange),
      sanitizeCsvCell(r.room),
      sanitizeCsvCell(r.status),
      sanitizeCsvCell(new Date(r.registeredAt).toLocaleString('id-ID'))
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Registrasi_UAS_SALUT_2030_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSyncAll = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await Promise.all([
        loadRegistrations(),
        onRefreshSlots(),
        refreshAllLocal()
      ]);
      if (onRefreshRegions) onRefreshRegions();
      if (onRefreshLocations) onRefreshLocations();
      if (onRefreshPeriod) onRefreshPeriod();
      showFeedback('success', 'Semua data registrasi, wilayah, lokasi, dan sesi berhasil disinkronkan!');
    } catch (err: unknown) {
      showFeedback('error', 'Kendala saat sinkronisasi data.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      
      {/* Top Admin Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-sky-900/60 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono-code font-bold bg-yellow-400 text-slate-950">
              PANEL ADMINISTRATOR 2030
            </span>
            <span className="text-xs text-sky-400 font-mono-code">
              SALUT Cahaya Merapi
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-white mt-1">
            Sistem Manajemen Registrasi & Jadwal UAS
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/dist-salut-uas-one-2030.zip"
            download="dist-salut-uas-one-2030.zip"
            className="px-3 py-2 rounded-xl bg-sky-900/60 hover:bg-sky-800 text-sky-200 text-xs font-semibold border border-sky-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Unduh paket Firebase Hosting siap deploy (dist + config)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">Paket Hosting ZIP</span>
          </a>

          <a
            href="/salut-uas-one-2030-project-source.zip"
            download="salut-uas-one-2030-project-source.zip"
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Unduh seluruh source code proyek lengkap"
          >
            <Download className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden md:inline">Source Code ZIP</span>
          </a>

          <button
            type="button"
            disabled={isSyncing}
            onClick={handleSyncAll}
            className="px-3.5 py-2 rounded-xl glass-card hover:bg-sky-900/40 text-sky-200 text-xs font-semibold border border-sky-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Sinkronisasi Ulang Data Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-yellow-300 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan'}</span>
          </button>

          <button
            onClick={onBackToHome}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>

      {/* Toast Feedback Notification Banner */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 border no-print ${
          feedback.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-950/40' 
            : 'bg-rose-950/90 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-950/40'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)} 
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8 no-print">
        <div className="p-4 rounded-2xl glass-card border-sky-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Pendaftar</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white font-mono-code">
            {totalRegistered}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Mahasiswa Terverifikasi
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border-sky-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Kapasitas Kursi</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-emerald-300 font-mono-code">
            {totalCapacity}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total Seluruh Sesi
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border-sky-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Sisa Kuota Kursi</span>
            <Clock className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-yellow-300 font-mono-code">
            {totalRemainingSeats}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Kursi Tersedia
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border-sky-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Persentase Terisi</span>
            <Layers className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-yellow-300 font-mono-code">
            {percentFilledOverall}%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-yellow-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, percentFilledOverall)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher - 6 Integrated Management Modules */}
      <div className="flex items-center gap-2 border-b border-sky-900/60 pb-3 mb-6 no-print overflow-x-auto">
        <button
          onClick={() => setActiveTab('registrations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'registrations'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-400 hover:text-white glass-card'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Data Registrasi ({filteredRegistrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('regions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'regions'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-400 hover:text-white glass-card'
          }`}
        >
          <Compass className="w-4 h-4 text-yellow-300" />
          <span>Wilayah Ujian ({localRegions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'locations'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-400 hover:text-white glass-card'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>Lokasi Ujian ({localLocations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('slots')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'slots'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-400 hover:text-white glass-card'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Sesi Ujian ({slots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('statistics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'statistics'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-400 hover:text-white glass-card'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Statistik</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-400 hover:text-white glass-card'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan & Hero</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: DATA REGISTRASI MAHASISWA                                      */}
      {/* ===================================================================== */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          
          {/* Action & Filter Bar */}
          <div className="p-4 rounded-2xl glass-panel border-sky-500/30 space-y-3 no-print">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-sky-400" />
                <input
                  type="text"
                  placeholder="Cari Nama, NIM, atau No. Referensi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#06142e] border border-sky-500/30 text-white placeholder-slate-500 text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-950"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor CSV</span>
                </button>
              </div>
            </div>

            {/* Sub-Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-sky-950/80 text-xs">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 rounded-lg bg-[#06142e] border border-sky-500/20 text-white text-xs outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="Terdaftar">Terdaftar</option>
                <option value="Perlu Verifikasi">Perlu Verifikasi</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>

              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="p-2 rounded-lg bg-[#06142e] border border-sky-500/20 text-white text-xs outline-none cursor-pointer"
              >
                <option value="">Semua Lokasi</option>
                {Array.from(new Set(slots.map(s => s.location))).map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>

              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="p-2 rounded-lg bg-[#06142e] border border-sky-500/20 text-white text-xs outline-none cursor-pointer"
              >
                <option value="">Semua Hari</option>
                {Array.from(new Set(slots.map(s => s.day))).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>

              <select
                value={filterSession}
                onChange={(e) => setFilterSession(e.target.value)}
                className="p-2 rounded-lg bg-[#06142e] border border-sky-500/20 text-white text-xs outline-none cursor-pointer"
              >
                <option value="">Semua Sesi</option>
                {Array.from(new Set(slots.map(s => s.sessionName))).map(sess => (
                  <option key={sess} value={sess}>{sess}</option>
                ))}
              </select>

              <select
                value={filterProdi}
                onChange={(e) => setFilterProdi(e.target.value)}
                className="p-2 rounded-lg bg-[#06142e] border border-sky-500/20 text-white text-xs outline-none cursor-pointer"
              >
                <option value="">Semua Program Studi</option>
                {Array.from(new Set(registrations.map(r => r.studyProgram))).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="rounded-2xl glass-panel border-sky-500/30 overflow-hidden shadow-2xl">
            {isLoadingRegs ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Memuat data registrasi dari cloud database...
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Tidak ada data registrasi yang sesuai dengan filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-[#030d22] text-[11px] uppercase tracking-wider text-slate-400 border-b border-sky-900/60 font-semibold">
                    <tr>
                      <th className="py-3 px-4">No. Ref & NIM</th>
                      <th className="py-3 px-4">Mahasiswa & Prodi</th>
                      <th className="py-3 px-4">Wilayah & Lokasi</th>
                      <th className="py-3 px-4">Jadwal UAS</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-950">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-sky-950/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono-code font-bold text-yellow-300">{reg.refNumber}</div>
                          <div className="font-mono-code text-[11px] text-slate-400">NIM: {reg.nim}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{reg.fullName}</div>
                          <div className="text-[11px] text-slate-300">{reg.studyProgram}</div>
                          <div className="text-[10px] text-slate-500 font-mono-code">{reg.whatsapp}</div>
                        </td>
                        <td className="py-3 px-4">
                          {reg.regionName && (
                            <div className="text-[10px] font-mono-code text-yellow-300 font-bold uppercase">{reg.regionName}</div>
                          )}
                          <div className="font-semibold text-slate-200">{reg.location}</div>
                          <div className="text-[11px] text-emerald-300 font-mono-code">{reg.room}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{reg.day}</div>
                          <div className="text-[11px] text-sky-300 font-mono-code">{reg.sessionName} • {reg.timeRange}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            reg.status === 'Terdaftar'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : reg.status === 'Perlu Verifikasi'
                                ? 'bg-yellow-950 text-yellow-300 border border-yellow-500/30'
                                : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedReg(reg)}
                            className="p-1.5 rounded-lg bg-sky-900/50 hover:bg-sky-800 text-sky-200 transition-colors cursor-pointer"
                            title="Lihat Detail & Ubah Status"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: PENGATURAN WILAYAH UJIAN (DYNAMIC REGIONS)                     */}
      {/* ===================================================================== */}
      {activeTab === 'regions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-panel border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-heading font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-yellow-300" />
                <span>Pengaturan Wilayah Ujian (Master Region)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola wilayah operasional ujian seperti Magelang, Kulon Progo, Sleman, Kota Yogyakarta, Bantul, dll.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingRegion({
                  name: '',
                  description: '',
                  sortOrder: localRegions.length + 1,
                  isActive: true
                });
                setIsRegionModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-heading font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Tambah Wilayah Baru</span>
            </button>
          </div>

          {/* Action & Filter Bar for Regions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-sky-400" />
              <input
                type="text"
                placeholder="Pencarian wilayah ujian atau keterangan..."
                value={regionSearch}
                onChange={(e) => setRegionSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#06142e] border border-sky-500/30 text-white placeholder-slate-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono-code text-[11px] whitespace-nowrap">
                <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
                <span>Urutan:</span>
              </div>
              <select
                value={regionSort}
                onChange={(e) => setRegionSort(e.target.value as 'order' | 'name-asc' | 'name-desc' | 'status')}
                className="px-3 py-2 rounded-xl bg-[#06142e] border border-sky-500/30 text-white outline-none cursor-pointer"
              >
                <option value="order">Urutan Tampilan</option>
                <option value="name-asc">Nama Wilayah (A-Z)</option>
                <option value="name-desc">Nama Wilayah (Z-A)</option>
                <option value="status">Status (Aktif Dahulu)</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl glass-panel border-sky-500/30 overflow-hidden shadow-2xl">
            {filteredRegions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Tidak ada wilayah ujian yang cocok dengan kriteria pencarian.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-[#030d22] text-[11px] uppercase tracking-wider text-slate-400 border-b border-sky-900/60 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Urutan</th>
                    <th className="py-3 px-4">Nama Wilayah</th>
                    <th className="py-3 px-4">Keterangan / Sentra</th>
                    <th className="py-3 px-4">ID Wilayah</th>
                    <th className="py-3 px-4">Jumlah Lokasi</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-950">
                  {filteredRegions.map((reg) => {
                    const locCount = localLocations.filter(l => l.regionId === reg.id).length;
                    return (
                      <tr key={reg.id} className="hover:bg-sky-950/30 transition-colors">
                        <td className="py-3 px-4 font-mono-code text-slate-400 font-bold">{reg.sortOrder || 1}</td>
                        <td className="py-3 px-4 font-bold text-white text-sm">{reg.name}</td>
                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={reg.description || ''}>
                          {reg.description || <span className="text-slate-600 italic">Tidak ada keterangan</span>}
                        </td>
                        <td className="py-3 px-4 font-mono-code text-[11px] text-sky-400">{reg.id}</td>
                        <td className="py-3 px-4 font-mono-code text-yellow-300 font-bold">
                          {locCount} Lokasi Sekolah/Sentra
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleRegionActive(reg)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                              reg.isActive
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            {reg.isActive ? '● AKTIF' : '○ NONAKTIF'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingRegion(reg);
                              setIsRegionModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-sky-900/50 hover:bg-sky-800 text-sky-200 transition-colors cursor-pointer"
                            title="Edit Wilayah"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRegion(reg)}
                            className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer"
                            title="Hapus Wilayah"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: PENGATURAN LOKASI UJIAN (DYNAMIC LOCATIONS)                    */}
      {/* ===================================================================== */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-panel border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-heading font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Pengaturan Lokasi Ujian (Master Location)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola sekolah mitra atau sentra ujian seperti SMK Negeri 1 Pengasih, SMAN 1 Muntilan, SALUT Merapi, dll.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingLocation({
                  name: '',
                  regionId: localRegions.find(r => r.isActive)?.id || '',
                  address: '',
                  city: '',
                  province: 'D.I. Yogyakarta',
                  capacity: 100,
                  sortOrder: localLocations.length + 1,
                  isActive: true
                });
                setIsLocationModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-heading font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Tambah Lokasi Baru</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-sky-400" />
              <input
                type="text"
                placeholder="Pencarian lokasi ujian, sekolah, atau alamat..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#06142e] border border-sky-500/30 text-white placeholder-slate-500 outline-none"
              />
            </div>
            <select
              value={filterLocRegion}
              onChange={(e) => setFilterLocRegion(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#06142e] border border-sky-500/30 text-white outline-none cursor-pointer"
            >
              <option value="">Semua Wilayah Induk</option>
              {localRegions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <select
              value={filterLocStatus}
              onChange={(e) => setFilterLocStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#06142e] border border-sky-500/30 text-white outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Hanya Aktif</option>
              <option value="inactive">Hanya Nonaktif</option>
            </select>
            <select
              value={locationSort}
              onChange={(e) => setLocationSort(e.target.value as 'order' | 'name-asc' | 'region-asc' | 'capacity-desc')}
              className="px-3 py-2 rounded-xl bg-[#06142e] border border-sky-500/30 text-white outline-none cursor-pointer"
            >
              <option value="order">Urutan Default</option>
              <option value="name-asc">Nama Sekolah (A-Z)</option>
              <option value="region-asc">Wilayah Induk (A-Z)</option>
              <option value="capacity-desc">Kapasitas Terbesar</option>
            </select>
          </div>

          <div className="rounded-2xl glass-panel border-sky-500/30 overflow-hidden shadow-2xl">
            {filteredLocations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Tidak ada lokasi ujian yang sesuai dengan kriteria pencarian atau filter wilayah.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-[#030d22] text-[11px] uppercase tracking-wider text-slate-400 border-b border-sky-900/60 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nama Lokasi Ujian</th>
                    <th className="py-3 px-4">Wilayah Induk</th>
                    <th className="py-3 px-4">Alamat Lengkap</th>
                    <th className="py-3 px-4">Kapasitas</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-950">
                  {filteredLocations.map((loc) => {
                    const parentReg = localRegions.find(r => r.id === loc.regionId);
                    return (
                      <tr key={loc.id} className="hover:bg-sky-950/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-sm">{loc.name}</div>
                          <div className="text-[10px] text-sky-400 font-mono-code">{loc.id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-900/60 text-sky-200 border border-sky-500/30">
                            {parentReg?.name || loc.regionName || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={loc.address}>
                          {loc.address}
                          {loc.city && <div className="text-[10px] text-slate-500">{loc.city}</div>}
                        </td>
                        <td className="py-3 px-4 font-mono-code text-yellow-300 font-bold">
                          {loc.capacity} Kursi
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleLocationActive(loc)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                              loc.isActive
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            {loc.isActive ? '● AKTIF' : '○ NONAKTIF'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingLocation(loc);
                              setIsLocationModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-sky-900/50 hover:bg-sky-800 text-sky-200 transition-colors cursor-pointer"
                            title="Edit Lokasi"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(loc)}
                            className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer"
                            title="Hapus Lokasi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: PENGATURAN SESI UJIAN & KUOTA (DYNAMIC SLOTS)                  */}
      {/* ===================================================================== */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-panel border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-heading font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-300" />
                <span>Pengaturan Sesi Ujian (Tanggal, Waktu 24 Jam & Kuota)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola sesi ujian per tanggal dan lokasi. Sesi yang penuh atau nonaktif ditutup otomatis dari link mahasiswa.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateSlotModal}
              className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-heading font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Tambah Sesi Ujian Baru</span>
            </button>
          </div>

          {/* Action & Filter Bar for Slots */}
          <div className="p-4 rounded-2xl glass-panel border-sky-500/30 space-y-3 no-print">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-sky-400" />
                <input
                  type="text"
                  placeholder="Cari Sesi, Hari, Jam, Ruangan..."
                  value={slotSearch}
                  onChange={(e) => setSlotSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#06142e] border border-sky-500/30 text-white placeholder-slate-500 text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="flex items-center rounded-xl bg-[#06142e] border border-sky-500/30 p-1">
                  <button
                    onClick={() => setSlotViewMode('cards')}
                    className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      slotViewMode === 'cards' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tampilan Kartu Sesi"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSlotViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      slotViewMode === 'table' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tampilan Tabel Sesi"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-Filters & Sort */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-sky-950/80 text-xs">
              <select
                value={filterSlotRegion}
                onChange={(e) => setFilterSlotRegion(e.target.value)}
                className="p-2 rounded-lg bg-[#06142e] border border-sky-500/20 text-white text-xs outline-none cursor-pointer"
              >
                <option value="">Semua Wilayah</option>
                {localRegions.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>

              <select
                value={filterSlotLocation}
                onChange={(e) => setFilterSlotLocation(e.target.value)}
                className="p-2 rounded-lg bg-[#06142e] border border-sky-500/20 text-white text-xs outline-none cursor-pointer"
              >
                <option value="">Semua Lokasi</option>
                {localLocations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>

              <select
                value={filterSlotDate}
                onChange={(e) => setFilterSlotDate(e.target.value)}
                className="p-2 rounded-lg bg-[#06142e] border border-sky-500/20 text-white text-xs outline-none cursor-pointer"
              >
                <option value="">Semua Tanggal</option>
                {distinctSlotDates.map(d => (
                  <option key={d.date} value={d.date}>{d.label}</option>
                ))}
              </select>

              <select
                value={filterSlotStatus}
                onChange={(e) => setFilterSlotStatus(e.target.value)}
                className="p-2 rounded-lg bg-[#06142e] border border-sky-500/20 text-white text-xs outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="active">Sesi Aktif</option>
                <option value="available">Aktif & Ada Kuota</option>
                <option value="full">Kuota Penuh</option>
                <option value="inactive">Dinonaktifkan</option>
              </select>

              <select
                value={slotSort}
                onChange={(e) => setSlotSort(e.target.value as 'time-asc' | 'date-asc' | 'name-asc' | 'seats-desc' | 'order')}
                className="p-2 rounded-lg bg-[#06142e] border border-sky-500/20 text-white text-xs outline-none cursor-pointer"
              >
                <option value="time-asc">Jam Mulai (Pagi - Sore)</option>
                <option value="date-asc">Tanggal Ujian (Terdekat)</option>
                <option value="name-asc">Nama Sesi (A-Z)</option>
                <option value="seats-desc">Sisa Kuota Terbanyak</option>
                <option value="order">Urutan Pengaturan</option>
              </select>
            </div>
          </div>

          {filteredSlots.length === 0 ? (
            <div className="p-8 rounded-2xl glass-panel border-sky-500/30 text-center text-xs text-slate-400">
              Tidak ada sesi ujian yang cocok dengan kriteria filter yang dipilih.
            </div>
          ) : slotViewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSlots.map((slot) => {
                const isFull = slot.registeredCount >= slot.capacity;
                const remaining = Math.max(0, slot.capacity - slot.registeredCount);
                const percent = Math.min(100, Math.round((slot.registeredCount / slot.capacity) * 100));

                return (
                  <div key={slot.id} className="p-4 rounded-2xl glass-card border-sky-500/20 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between pb-2 border-b border-sky-950">
                      <span className="text-xs font-mono-code font-bold text-yellow-300">
                        {slot.sessionName}
                      </span>
                      <button
                        onClick={() => handleToggleSlotActive(slot)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          !slot.isActive 
                            ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' 
                            : isFull 
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/30' 
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900'
                        }`}
                        title="Klik untuk mengubah status aktif/nonaktif"
                      >
                        {!slot.isActive ? '○ NONAKTIF' : isFull ? '● PENUH' : '● AKTIF'}
                      </button>
                    </div>

                    <h3 className="font-heading font-bold text-sm text-white">{slot.day}</h3>
                    <div className="text-xs text-sky-300 font-mono-code mt-0.5">
                      {slot.timeRange} • {slot.date}
                    </div>

                    <div className="mt-3 pt-3 border-t border-sky-950 space-y-1 text-xs">
                      <div className="text-slate-300 font-medium truncate" title={slot.location}>
                        {slot.location}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono-code truncate">
                        {slot.room}
                      </div>
                    </div>

                    {/* Quota Progress */}
                    <div className="mt-4 pt-3 border-t border-sky-950">
                      <div className="flex items-center justify-between text-xs font-mono-code mb-1">
                        <span className="text-slate-400">Terisi: {slot.registeredCount} / {slot.capacity}</span>
                        <span className={remaining === 0 ? 'text-rose-400 font-bold' : 'text-emerald-300 font-bold'}>
                          Sisa: {remaining} Kursi
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isFull ? 'bg-rose-500' : percent > 80 ? 'bg-yellow-400' : 'bg-sky-400'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-sky-950 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleSlotActive(slot)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                      >
                        {slot.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditSlotModal(slot)}
                          className="px-3 py-1.5 rounded-lg bg-sky-900/40 hover:bg-sky-800 text-sky-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-yellow-300" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteSlot(slot.id, slot.registeredCount)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer"
                          title="Hapus Sesi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl glass-panel border-sky-500/30 overflow-hidden shadow-2xl">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-[#030d22] text-[11px] uppercase tracking-wider text-slate-400 border-b border-sky-900/60 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nama Sesi & Jam</th>
                    <th className="py-3 px-4">Hari & Tanggal</th>
                    <th className="py-3 px-4">Lokasi & Ruangan</th>
                    <th className="py-3 px-4">Kuota / Terisi</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-950">
                  {filteredSlots.map((slot) => {
                    const isFull = slot.registeredCount >= slot.capacity;
                    const remaining = Math.max(0, slot.capacity - slot.registeredCount);
                    return (
                      <tr key={slot.id} className="hover:bg-sky-950/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-sm">{slot.sessionName}</div>
                          <div className="text-[11px] text-yellow-300 font-mono-code">{slot.timeRange}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{slot.day}</div>
                          <div className="text-[11px] text-sky-300 font-mono-code">{slot.date}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-200">{slot.location}</div>
                          <div className="text-[11px] text-emerald-300 font-mono-code">{slot.room}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono-code text-xs">
                            <span className="text-white font-bold">{slot.registeredCount}</span> / {slot.capacity}
                          </div>
                          <div className={`text-[11px] font-mono-code ${remaining === 0 ? 'text-rose-400' : 'text-emerald-300'}`}>
                            Sisa: {remaining} kursi
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleSlotActive(slot)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                              !slot.isActive 
                                ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' 
                                : isFull 
                                  ? 'bg-rose-950 text-rose-300 border border-rose-500/30' 
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900'
                            }`}
                          >
                            {!slot.isActive ? '○ NONAKTIF' : isFull ? '● PENUH' : '● AKTIF'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditSlotModal(slot)}
                            className="p-1.5 rounded-lg bg-sky-900/50 hover:bg-sky-800 text-sky-200 transition-colors cursor-pointer"
                            title="Edit Sesi"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id, slot.registeredCount)}
                            className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer"
                            title="Hapus Sesi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: STATISTIK & DISTRIBUSI PESERTA                                  */}
      {/* ===================================================================== */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          {/* Ringkasan Status Pendaftaran Real-Time */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-card border-sky-500/20 bg-sky-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider">Total Pendaftar</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-mono-code font-extrabold text-white mt-1">
                {registrations.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Semua status terekam</div>
            </div>

            <div className="p-4 rounded-2xl glass-card border-emerald-500/30 bg-emerald-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">Terdaftar (Aktif)</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-mono-code font-extrabold text-emerald-300 mt-1">
                {registrations.filter(r => r.status === 'Terdaftar').length}
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-0.5">Kursi terpakai sah</div>
            </div>

            <div className="p-4 rounded-2xl glass-card border-yellow-500/30 bg-yellow-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-yellow-300 uppercase tracking-wider">Perlu Verifikasi</span>
                <AlertCircle className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-mono-code font-extrabold text-yellow-300 mt-1">
                {registrations.filter(r => r.status === 'Perlu Verifikasi').length}
              </div>
              <div className="text-[10px] text-yellow-400/80 mt-0.5">Menunggu konfirmasi berkas</div>
            </div>

            <div className="p-4 rounded-2xl glass-card border-rose-500/30 bg-rose-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider">Dibatalkan</span>
                <Trash2 className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-mono-code font-extrabold text-rose-300 mt-1">
                {registrations.filter(r => r.status === 'Dibatalkan').length}
              </div>
              <div className="text-[10px] text-rose-400/80 mt-0.5">Kuota slot dikembalikan</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Berdasarkan Hari */}
            <div className="p-5 rounded-2xl glass-card border-sky-500/20 space-y-4">
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-300" />
                Distribusi Peserta Berdasarkan Hari
              </h3>
              <div className="space-y-3">
                {Object.entries(statsByDay).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada data pendaftar.</p>
                ) : (
                  Object.entries(statsByDay).map(([day, count]) => {
                    const pct = totalRegistered > 0 ? Math.round((count / totalRegistered) * 100) : 0;
                    return (
                      <div key={day} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white font-semibold">{day}</span>
                          <span className="font-mono-code text-sky-300">{count} Mahasiswa ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Berdasarkan Sesi */}
            <div className="p-5 rounded-2xl glass-card border-sky-500/20 space-y-4">
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-300" />
                Distribusi Peserta Berdasarkan Sesi
              </h3>
              <div className="space-y-3">
                {Object.entries(statsBySession).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada data pendaftar.</p>
                ) : (
                  Object.entries(statsBySession).map(([sess, count]) => {
                    const pct = totalRegistered > 0 ? Math.round((count / totalRegistered) * 100) : 0;
                    return (
                      <div key={sess} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white font-semibold">{sess}</span>
                          <span className="font-mono-code text-yellow-300">{count} Mahasiswa ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Berdasarkan Wilayah */}
            <div className="p-5 rounded-2xl glass-card border-sky-500/20 space-y-4">
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-yellow-300" />
                Distribusi Peserta Berdasarkan Wilayah Ujian
              </h3>
              <div className="space-y-3">
                {Object.entries(statsByRegion).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada data pendaftar.</p>
                ) : (
                  Object.entries(statsByRegion).map(([regName, count]) => {
                    const pct = totalRegistered > 0 ? Math.round((count / totalRegistered) * 100) : 0;
                    return (
                      <div key={regName} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white font-semibold">{regName}</span>
                          <span className="font-mono-code text-yellow-300">{count} Mahasiswa ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Berdasarkan Lokasi */}
            <div className="p-5 rounded-2xl glass-card border-sky-500/20 space-y-4">
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Distribusi Peserta Berdasarkan Lokasi / Sentra
              </h3>
              <div className="space-y-3">
                {Object.entries(statsByLocation).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada data pendaftar.</p>
                ) : (
                  Object.entries(statsByLocation).map(([loc, count]) => {
                    const pct = totalRegistered > 0 ? Math.round((count / totalRegistered) * 100) : 0;
                    return (
                      <div key={loc} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white font-semibold truncate max-w-[240px]">{loc}</span>
                          <span className="font-mono-code text-emerald-300">{count} Mahasiswa ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Berdasarkan Program Studi */}
            <div className="p-5 rounded-2xl glass-card border-sky-500/20 space-y-4">
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                Distribusi Berdasarkan Program Studi
              </h3>
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2">
                {Object.entries(statsByProgram).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada data pendaftar.</p>
                ) : (
                  Object.entries(statsByProgram).map(([prodi, count]) => (
                    <div key={prodi} className="flex justify-between items-center text-xs p-2 rounded-lg bg-sky-950/30 border border-sky-900/40">
                      <span className="text-slate-200 truncate max-w-[220px]">{prodi}</span>
                      <span className="font-mono-code font-bold text-white px-2 py-0.5 rounded bg-sky-900">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Matriks Kuota & Okupansi Sesi Ujian */}
          <div className="p-5 rounded-2xl glass-card border-sky-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Matriks Okupansi & Kapasitas Sesi Ujian Real-Time</span>
              </h3>
              <span className="text-[11px] font-mono-code text-slate-400">
                {slots.length} Sesi Terdaftar
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-[#030d22] text-[10px] uppercase tracking-wider text-slate-400 border-b border-sky-900/60 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Sesi & Jam</th>
                    <th className="py-2.5 px-3">Hari & Tanggal</th>
                    <th className="py-2.5 px-3">Lokasi / Ruangan</th>
                    <th className="py-2.5 px-3">Terisi / Kapasitas</th>
                    <th className="py-2.5 px-3">Sisa Kursi</th>
                    <th className="py-2.5 px-3">Okupansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-950">
                  {slots.map(s => {
                    const occ = s.capacity > 0 ? Math.round((s.registeredCount / s.capacity) * 100) : 0;
                    const rem = Math.max(0, s.capacity - s.registeredCount);
                    return (
                      <tr key={s.id} className="hover:bg-sky-950/20 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-white">
                          <div>{s.sessionName}</div>
                          <div className="text-[10px] text-yellow-300 font-mono-code">{s.timeRange}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="text-slate-200">{s.day}</div>
                          <div className="text-[10px] text-sky-300 font-mono-code">{s.date}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="text-white font-medium">{s.location}</div>
                          <div className="text-[10px] text-emerald-300 font-mono-code">{s.room}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono-code">
                          <span className="font-bold text-white">{s.registeredCount}</span> / {s.capacity}
                        </td>
                        <td className="py-2.5 px-3 font-mono-code font-bold">
                          <span className={rem === 0 ? 'text-rose-400' : 'text-emerald-300'}>
                            {rem} Kursi
                          </span>
                        </td>
                        <td className="py-2.5 px-3 w-36">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${rem === 0 ? 'bg-rose-500' : occ > 80 ? 'bg-yellow-400' : 'bg-sky-400'}`}
                                style={{ width: `${Math.min(100, occ)}%` }}
                              />
                            </div>
                            <span className="font-mono-code text-[10px] text-slate-300">{occ}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: PENGATURAN PERIODE & VISUAL HERO BERANDA                        */}
      {/* ===================================================================== */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl glass-panel border-sky-500/30 space-y-5 bg-[#030d22]">
            
            <div className="flex items-center justify-between pb-3 border-b border-sky-900/60">
              <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-yellow-300" />
                <span>Pengaturan Periode & Parameter Sistem</span>
              </h2>
              {settingsSaveSuccess && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Pengaturan Tersimpan!
                </span>
              )}
            </div>

            {/* Status Registrasi Switch */}
            <div className="p-4 rounded-xl bg-[#040e24] border border-sky-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Status Buka/Tutup Registrasi</span>
                <span className="text-[11px] text-slate-400">
                  Jika ditutup, halaman publik akan mengunci pendaftaran baru.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSettingsForm(prev => ({ ...prev, isOpen: !prev.isOpen }))}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  settingsForm.isOpen
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-400 shadow-sm'
                    : 'bg-rose-950 text-rose-300 border-rose-400'
                }`}
              >
                {settingsForm.isOpen ? 'STATUS: DIBUKA' : 'STATUS: DITUTUP'}
              </button>
            </div>

            {/* Judul & Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">
                Judul Formulir Registrasi
              </label>
              <input
                type="text"
                value={settingsForm.title}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">
                  Semester Akademik
                </label>
                <input
                  type="text"
                  value={settingsForm.semester}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, semester: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">
                  Tahun Akademik
                </label>
                <input
                  type="text"
                  value={settingsForm.academicYear}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, academicYear: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                  required
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">
                  Tanggal Pembukaan
                </label>
                <input
                  type="date"
                  value={settingsForm.openDate}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, openDate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">
                  Tanggal Penutupan
                </label>
                <input
                  type="date"
                  value={settingsForm.closeDate}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, closeDate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                />
              </div>
            </div>

            {/* Announcement text */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">
                Teks Pengumuman Resmi Mahasiswa
              </label>
              <textarea
                rows={3}
                value={settingsForm.announcement}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, announcement: e.target.value }))}
                className="w-full p-3.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none leading-relaxed"
                placeholder="Pemberitahuan khusus untuk mahasiswa sebelum mengisi form..."
              />
            </div>

            {/* Visual Hero Image Configuration */}
            <div className="p-4 rounded-xl bg-[#040e24] border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    Visual Hero Beranda Utama (Edisi 2030)
                  </span>
                </div>
                {settingsForm.heroImageUrl && (
                  <button
                    type="button"
                    onClick={() => setSettingsForm(prev => ({ ...prev, heroImageUrl: '' }))}
                    className="text-[11px] text-yellow-300 hover:text-yellow-200 underline cursor-pointer"
                  >
                    Reset ke Gambar Default UT 2030
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Sesuaikan visual mahasiswa jas kuning UT beranda. Anda dapat memasukkan URL gambar langsung atau mengunggah berkas gambar dari perangkat.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2 space-y-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">URL Gambar Khusus (Opsional):</label>
                    <input
                      type="url"
                      value={settingsForm.heroImageUrl || ''}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, heroImageUrl: e.target.value }))}
                      placeholder="https://.../gambar-hero.jpg"
                      className="w-full px-3 py-2 rounded-lg bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Atau Unggah Berkas Gambar:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Ukuran gambar maksimal 2MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setSettingsForm(prev => ({ ...prev, heroImageUrl: reader.result as string }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-[11px] text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-sky-900 file:text-sky-200 hover:file:bg-sky-800 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Thumbnail Preview */}
                <div className="h-28 rounded-lg overflow-hidden border border-sky-500/30 bg-black/40 relative flex items-center justify-center">
                  <img
                    src={settingsForm.heroImageUrl || defaultHeroStudent}
                    alt="Preview Hero"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultHeroStudent;
                    }}
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] bg-slate-950/80 text-yellow-300 font-mono-code border border-sky-500/30">
                    {settingsForm.heroImageUrl ? 'Kustom' : 'Default 2030'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-heading font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSavingSettings ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Menyimpan Perubahan Pengaturan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>Simpan Perubahan Pengaturan</span>
                </>
              )}
            </button>

          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: DETAIL REGISTRASI MAHASISWA                                  */}
      {/* ===================================================================== */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel border-sky-500/40 p-6 shadow-2xl bg-[#040e24] max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-sky-900/60">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-white text-base">
                  Detail Registrasi Peserta
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-sky-900 text-sky-200">
                  {selectedReg.refNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#030b1e] border border-sky-900/50 space-y-2">
                <div>
                  <span className="text-slate-400 text-[11px]">Nama Mahasiswa:</span>
                  <div className="text-sm font-bold text-white">{selectedReg.fullName}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Nomor Induk Mahasiswa (NIM):</span>
                  <div className="font-mono-code font-bold text-yellow-300">{selectedReg.nim}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Program Studi:</span>
                  <div className="text-slate-200 font-medium">{selectedReg.studyProgram}</div>
                  <div className="text-slate-400 text-[10px]">{selectedReg.faculty}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Nomor WhatsApp:</span>
                  <div className="font-mono-code text-slate-200">{selectedReg.whatsapp}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#030b1e] border border-sky-900/50 space-y-2">
                {selectedReg.regionName && (
                  <div>
                    <span className="text-slate-400 text-[11px]">Wilayah Ujian:</span>
                    <div className="text-yellow-300 font-bold">{selectedReg.regionName}</div>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 text-[11px]">Jadwal Ujian:</span>
                  <div className="text-white font-semibold">{selectedReg.day}</div>
                  <div className="text-yellow-300 font-mono-code">{selectedReg.sessionName} • {selectedReg.timeRange}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Lokasi & Ruangan:</span>
                  <div className="text-slate-200">{selectedReg.location}</div>
                  {selectedReg.locationAddress && (
                    <div className="text-[11px] text-slate-400">{selectedReg.locationAddress}</div>
                  )}
                  <div className="text-emerald-300 font-mono-code">{selectedReg.room}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Waktu Pendaftaran:</span>
                  <div className="text-slate-300 font-mono-code">
                    {new Date(selectedReg.registeredAt).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ubah Status Registrasi:
                </label>
                <div className="flex gap-2">
                  {(['Terdaftar', 'Perlu Verifikasi', 'Dibatalkan'] as RegistrationStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleChangeStatus(selectedReg.id, st)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedReg.status === st
                          ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-bold'
                          : 'glass-card text-slate-300 hover:text-white border-sky-500/20'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="mt-6 pt-3 border-t border-sky-900/60 flex items-center justify-end">
              <button
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: EDIT / TAMBAH WILAYAH UJIAN (MASTER REGION)                  */}
      {/* ===================================================================== */}
      {isRegionModalOpen && editingRegion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl glass-panel border-sky-500/40 p-6 shadow-2xl bg-[#040e24]">
            <div className="flex items-center justify-between pb-3 border-b border-sky-900/60">
              <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
                <Compass className="w-4 h-4 text-yellow-300" />
                <span>{editingRegion.id ? 'Edit Wilayah Ujian' : 'Tambah Wilayah Ujian Baru'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsRegionModalOpen(false);
                  setEditingRegion(null);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRegion} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Wilayah Ujian *</label>
                <input
                  type="text"
                  value={editingRegion.name || ''}
                  onChange={(e) => setEditingRegion(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Magelang Barat, Sleman, Kulon Progo"
                  className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Keterangan Wilayah (Opsional)</label>
                <textarea
                  rows={2}
                  value={editingRegion.description || ''}
                  onChange={(e) => setEditingRegion(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Contoh: Meliputi Muntilan, Magelang Kota, Borobudur, Secang"
                  className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Urutan Tampilan</label>
                <input
                  type="number"
                  min="1"
                  value={editingRegion.sortOrder ?? 1}
                  onChange={(e) => setEditingRegion(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                  className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none font-mono-code"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="regIsActive"
                  checked={editingRegion.isActive ?? true}
                  onChange={(e) => setEditingRegion(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-sky-500/30 text-yellow-400 focus:ring-0"
                />
                <label htmlFor="regIsActive" className="text-slate-300 font-semibold cursor-pointer">
                  Wilayah Aktif untuk Registrasi Mahasiswa
                </label>
              </div>

              <div className="pt-4 border-t border-sky-900/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegionModalOpen(false);
                    setEditingRegion(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingRegion}
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-heading font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  {isSavingRegion ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    'Simpan Wilayah'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: EDIT / TAMBAH LOKASI UJIAN (MASTER LOCATION)                */}
      {/* ===================================================================== */}
      {isLocationModalOpen && editingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel border-sky-500/40 p-6 shadow-2xl bg-[#040e24] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-sky-900/60">
              <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{editingLocation.id ? 'Edit Lokasi Ujian' : 'Tambah Lokasi Ujian Baru'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsLocationModalOpen(false);
                  setEditingLocation(null);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Lokasi / Sekolah *</label>
                <input
                  type="text"
                  value={editingLocation.name || ''}
                  onChange={(e) => setEditingLocation(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: SMK Negeri 1 Pengasih, SMAN 1 Muntilan"
                  className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Wilayah Induk *</label>
                <select
                  value={editingLocation.regionId || ''}
                  onChange={(e) => setEditingLocation(prev => ({ ...prev, regionId: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none cursor-pointer"
                  required
                >
                  <option value="">Pilih Wilayah...</option>
                  {localRegions.filter(r => r.isActive).map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alamat Lengkap *</label>
                <textarea
                  rows={2}
                  value={editingLocation.address || ''}
                  onChange={(e) => setEditingLocation(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                  className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kabupaten / Kota</label>
                  <input
                    type="text"
                    value={editingLocation.city || ''}
                    onChange={(e) => setEditingLocation(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Contoh: Kulon Progo"
                    className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={editingLocation.province || 'D.I. Yogyakarta'}
                    onChange={(e) => setEditingLocation(prev => ({ ...prev, province: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kapasitas Gedung (Kursi)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingLocation.capacity || 100}
                    onChange={(e) => setEditingLocation(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none font-mono-code"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Urutan</label>
                  <input
                    type="number"
                    min="1"
                    value={editingLocation.sortOrder ?? 1}
                    onChange={(e) => setEditingLocation(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none font-mono-code"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="locIsActive"
                  checked={editingLocation.isActive ?? true}
                  onChange={(e) => setEditingLocation(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-sky-500/30 text-yellow-400 focus:ring-0"
                />
                <label htmlFor="locIsActive" className="text-slate-300 font-semibold cursor-pointer">
                  Lokasi Aktif untuk Pendaftaran Mahasiswa
                </label>
              </div>

              <div className="pt-4 border-t border-sky-900/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLocationModalOpen(false);
                    setEditingLocation(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingLocation}
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-heading font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  {isSavingLocation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    'Simpan Lokasi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: EDIT / CREATE EXAM SLOT                                      */}
      {/* ===================================================================== */}
      {isSlotModalOpen && editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel border-sky-500/40 p-6 shadow-2xl bg-[#040e24] max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-sky-900/60">
              <h3 className="font-heading font-bold text-white text-base">
                {editingSlot.id ? 'Edit Sesi Jadwal & Kuota' : 'Tambah Sesi Ujian Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsSlotModalOpen(false);
                  setEditingSlot(null);
                  setSlotTimeError(null);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {slotTimeError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{slotTimeError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSlot} className="mt-4 space-y-3.5 text-xs">
              
              {/* Lokasi Ujian Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pilih Lokasi Ujian Mitra *</label>
                <select
                  value={editingSlot.locationId || ''}
                  onChange={(e) => {
                    const locId = e.target.value;
                    const loc = localLocations.find(l => l.id === locId);
                    setEditingSlot(prev => ({
                      ...prev,
                      locationId: locId,
                      location: loc ? loc.name : prev?.location,
                      regionId: loc ? loc.regionId : prev?.regionId,
                      locationAddress: loc ? loc.address : prev?.locationAddress
                    }));
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none cursor-pointer"
                >
                  <option value="">Gunakan Lokasi Kustom / Manual...</option>
                  {localLocations.map(l => {
                    const reg = localRegions.find(r => r.id === l.regionId);
                    return (
                      <option key={l.id} value={l.id}>
                        {l.name} ({reg?.name || l.regionName || 'Wilayah'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {!editingSlot.locationId && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Lokasi Kustom</label>
                  <input
                    type="text"
                    value={editingSlot.location || ''}
                    onChange={(e) => setEditingSlot(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hari Ujian *</label>
                  <input
                    type="text"
                    value={editingSlot.day || ''}
                    onChange={(e) => setEditingSlot(prev => ({ ...prev, day: e.target.value }))}
                    placeholder="Contoh: Hari 1 (Sabtu, 14 Des 2030)"
                    className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tanggal (YYYY-MM-DD) *</label>
                  <input
                    type="date"
                    value={editingSlot.date || ''}
                    onChange={(e) => setEditingSlot(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Sesi *</label>
                  <input
                    type="text"
                    value={editingSlot.sessionName || ''}
                    onChange={(e) => setEditingSlot(prev => ({ ...prev, sessionName: e.target.value }))}
                    placeholder="Contoh: Sesi 1 (Pagi)"
                    className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jam Mulai (24 Jam) *</label>
                  <input
                    type="time"
                    value={editingSlot.startTime || '08:00'}
                    onChange={(e) => setEditingSlot(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none font-mono-code"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jam Selesai (24 Jam) *</label>
                  <input
                    type="time"
                    value={editingSlot.endTime || '09:45'}
                    onChange={(e) => setEditingSlot(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none font-mono-code"
                    required
                  />
                </div>
              </div>

              {/* Preset Durasi & Live Preview Format Tampilan Waktu */}
              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="text-slate-300">Format Jadwal:</span>
                  <span className="font-mono-code font-bold text-yellow-300">
                    {editingSlot.startTime && editingSlot.endTime
                      ? `${editingSlot.startTime.replace(':', '.')}–${editingSlot.endTime.replace(':', '.')} WIB`
                      : '08.00–09.45 WIB'}
                  </span>
                  {calculateDurationMinutes(editingSlot.startTime, editingSlot.endTime) !== null && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono-code font-bold">
                      Durasi: {calculateDurationMinutes(editingSlot.startTime, editingSlot.endTime)} Menit
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-1 border-t border-sky-900/40">
                  <span className="text-[10px] text-slate-400">Setel Cepat Jam Selesai:</span>
                  <button
                    type="button"
                    onClick={() => applyDurationPreset(90)}
                    className="px-2 py-0.5 rounded bg-sky-900/60 hover:bg-sky-800 text-sky-200 text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    +90 m (Standar UT)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDurationPreset(105)}
                    className="px-2 py-0.5 rounded bg-sky-900/60 hover:bg-sky-800 text-sky-200 text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    +105 m (1j 45m)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDurationPreset(120)}
                    className="px-2 py-0.5 rounded bg-sky-900/60 hover:bg-sky-800 text-sky-200 text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    +120 m (2 Jam)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ruangan / Lab Komputer *</label>
                <input
                  type="text"
                  value={editingSlot.room || ''}
                  onChange={(e) => setEditingSlot(prev => ({ ...prev, room: e.target.value }))}
                  placeholder="Contoh: Lab Komputer A (Kapasitas 40 PC)"
                  className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kapasitas Maksimal (Kursi) *</label>
                  <input
                    type="number"
                    min="1"
                    value={editingSlot.capacity || 40}
                    onChange={(e) => setEditingSlot(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none font-mono-code"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Peserta Terdaftar Saat Ini</label>
                  <input
                    type="number"
                    min="0"
                    value={editingSlot.registeredCount || 0}
                    onChange={(e) => setEditingSlot(prev => ({ ...prev, registeredCount: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-[#06142e] border border-sky-500/30 text-white text-xs outline-none font-mono-code"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="slotIsActive"
                  checked={editingSlot.isActive ?? true}
                  onChange={(e) => setEditingSlot(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-sky-500/30 text-yellow-400 focus:ring-0"
                />
                <label htmlFor="slotIsActive" className="text-slate-300 font-semibold cursor-pointer">
                  Slot Sesi Aktif untuk Dipilih Mahasiswa
                </label>
              </div>

              <div className="pt-4 border-t border-sky-900/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSlotModalOpen(false);
                    setEditingSlot(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingSlot}
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-heading font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isSavingSlot ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                      <span>Menyimpan Sesi...</span>
                    </>
                  ) : (
                    'Simpan Sesi Ujian'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

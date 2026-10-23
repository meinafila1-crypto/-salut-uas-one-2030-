import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  runTransaction,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  ExamRegion, 
  ExamLocation, 
  ExamSlot, 
  Registration, 
  RegistrationPeriod, 
  validateFacultyProgramPair 
} from '../types';

export const DEFAULT_PERIOD: RegistrationPeriod = {
  title: 'REGISTRASI UJIAN AKHIR SEMESTER (UAS) SALUT CAHAYA MERAPI',
  semester: 'Semester 2029/2030 Ganjil (2029.1)',
  academicYear: 'Tahun Akademik 2029/2030',
  isOpen: true,
  openDate: '2030-11-01',
  closeDate: '2030-12-10',
  announcement: 'Pemberitahuan Resmi: Pemilihan wilayah, lokasi, hari, dan sesi ujian diselenggarakan secara terintegrasi melalui SALUT Cahaya Merapi Universitas Terbuka Yogyakarta. Pastikan data NIM dan nomor WhatsApp Anda valid untuk verifikasi kehadiran di lokasi ujian.',
  allowDuplicateNim: false,
  updatedAt: new Date().toISOString()
};

// ============================================================================
// 1. INITIAL SEED DATA (WILAYAH, LOKASI & SESI UJIAN RESMI)
// ============================================================================

export const INITIAL_OFFICIAL_REGIONS: ExamRegion[] = [
  {
    id: 'reg_magelang',
    name: 'Magelang',
    description: 'Wilayah Kabupaten dan Kota Magelang, Jawa Tengah',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'reg_kulonprogo',
    name: 'Kulon Progo',
    description: 'Wilayah Kabupaten Kulon Progo, D.I. Yogyakarta',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'reg_sleman',
    name: 'Sleman',
    description: 'Wilayah Kabupaten Sleman, D.I. Yogyakarta',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'reg_yogyakarta',
    name: 'Kota Yogyakarta',
    description: 'Wilayah Sentra Pusat Kota Yogyakarta, D.I. Yogyakarta',
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'reg_bantul',
    name: 'Bantul',
    description: 'Wilayah Kabupaten Bantul, D.I. Yogyakarta',
    isActive: true,
    sortOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'reg_gunungkidul',
    name: 'Gunungkidul',
    description: 'Wilayah Kabupaten Gunungkidul, D.I. Yogyakarta',
    isActive: true,
    sortOrder: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_OFFICIAL_LOCATIONS: ExamLocation[] = [
  {
    id: 'loc_salutcahaya',
    name: 'SALUT Cahaya Merapi — Gedung Pembelajaran Digital',
    regionId: 'reg_sleman',
    regionName: 'Sleman',
    address: 'Jl. Kaliurang Km. 9, Ngaglik, Sleman',
    city: 'Kabupaten Sleman',
    province: 'D.I. Yogyakarta',
    capacity: 120,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_sentraut',
    name: 'Sentra Ujian UT Yogyakarta — Kampus Utama',
    regionId: 'reg_yogyakarta',
    regionName: 'Kota Yogyakarta',
    address: 'Jl. Bantul No. 100, Mantrijeron, Kota Yogyakarta',
    city: 'Kota Yogyakarta',
    province: 'D.I. Yogyakarta',
    capacity: 150,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_smkn1pengasih',
    name: 'SMK Negeri 1 Pengasih',
    regionId: 'reg_kulonprogo',
    regionName: 'Kulon Progo',
    address: 'Jl. Pengasih - Wates No. 1, Pengasih, Kulon Progo',
    city: 'Kabupaten Kulon Progo',
    province: 'D.I. Yogyakarta',
    capacity: 100,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_sman1muntilan',
    name: 'SMAN 1 Muntilan',
    regionId: 'reg_magelang',
    regionName: 'Magelang',
    address: 'Jl. Pemuda No. 153, Muntilan, Magelang',
    city: 'Kabupaten Magelang',
    province: 'Jawa Tengah',
    capacity: 80,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_sman1bantul',
    name: 'SMAN 1 Bantul',
    regionId: 'reg_bantul',
    regionName: 'Bantul',
    address: 'Jl. K.H. Wahid Hasyim, Palbapang, Bantul',
    city: 'Kabupaten Bantul',
    province: 'D.I. Yogyakarta',
    capacity: 80,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_smkn1wonosari',
    name: 'SMKN 1 Wonosari',
    regionId: 'reg_gunungkidul',
    regionName: 'Gunungkidul',
    address: 'Jl. Veteran, Baleharjo, Wonosari, Gunungkidul',
    city: 'Kabupaten Gunungkidul',
    province: 'D.I. Yogyakarta',
    capacity: 80,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_OFFICIAL_SLOTS: Omit<ExamSlot, 'id'>[] = [
  {
    regionId: 'reg_sleman',
    regionName: 'Sleman',
    locationId: 'loc_salutcahaya',
    locationAddress: 'Jl. Kaliurang Km. 9, Ngaglik, Sleman',
    day: 'Hari 1 (Sabtu, 14 Desember 2030)',
    date: '2030-12-14',
    sessionName: 'Sesi 1 (Pagi)',
    startTime: '07:30',
    endTime: '09:00',
    timeRange: '07:30 - 09:00 WIB',
    location: 'SALUT Cahaya Merapi — Gedung Pembelajaran Digital',
    room: 'Lab Komputer A (Kapasitas 40 PC)',
    capacity: 40,
    registeredCount: 18,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    regionId: 'reg_sleman',
    regionName: 'Sleman',
    locationId: 'loc_salutcahaya',
    locationAddress: 'Jl. Kaliurang Km. 9, Ngaglik, Sleman',
    day: 'Hari 1 (Sabtu, 14 Desember 2030)',
    date: '2030-12-14',
    sessionName: 'Sesi 2 (Siang 1)',
    startTime: '09:30',
    endTime: '11:00',
    timeRange: '09:30 - 11:00 WIB',
    location: 'SALUT Cahaya Merapi — Gedung Pembelajaran Digital',
    room: 'Lab Komputer A (Kapasitas 40 PC)',
    capacity: 40,
    registeredCount: 32,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    regionId: 'reg_sleman',
    regionName: 'Sleman',
    locationId: 'loc_salutcahaya',
    locationAddress: 'Jl. Kaliurang Km. 9, Ngaglik, Sleman',
    day: 'Hari 1 (Sabtu, 14 Desember 2030)',
    date: '2030-12-14',
    sessionName: 'Sesi 3 (Siang 2)',
    startTime: '11:30',
    endTime: '13:00',
    timeRange: '11:30 - 13:00 WIB',
    location: 'SALUT Cahaya Merapi — Gedung Pembelajaran Digital',
    room: 'Lab Komputer B (Kapasitas 35 PC)',
    capacity: 35,
    registeredCount: 12,
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    regionId: 'reg_yogyakarta',
    regionName: 'Kota Yogyakarta',
    locationId: 'loc_sentraut',
    locationAddress: 'Jl. Bantul No. 100, Mantrijeron, Kota Yogyakarta',
    day: 'Hari 1 (Sabtu, 14 Desember 2030)',
    date: '2030-12-14',
    sessionName: 'Sesi 4 (Sore)',
    startTime: '13:30',
    endTime: '15:00',
    timeRange: '13:30 - 15:00 WIB',
    location: 'Sentra Ujian UT Yogyakarta — Kampus Utama',
    room: 'Ruang Ujian Digital 101',
    capacity: 50,
    registeredCount: 45,
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    regionId: 'reg_sleman',
    regionName: 'Sleman',
    locationId: 'loc_salutcahaya',
    locationAddress: 'Jl. Kaliurang Km. 9, Ngaglik, Sleman',
    day: 'Hari 2 (Minggu, 15 Desember 2030)',
    date: '2030-12-15',
    sessionName: 'Sesi 1 (Pagi)',
    startTime: '07:30',
    endTime: '09:00',
    timeRange: '07:30 - 09:00 WIB',
    location: 'SALUT Cahaya Merapi — Gedung Pembelajaran Digital',
    room: 'Lab Komputer A (Kapasitas 40 PC)',
    capacity: 40,
    registeredCount: 25,
    isActive: true,
    sortOrder: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    regionId: 'reg_sleman',
    regionName: 'Sleman',
    locationId: 'loc_salutcahaya',
    locationAddress: 'Jl. Kaliurang Km. 9, Ngaglik, Sleman',
    day: 'Hari 2 (Minggu, 15 Desember 2030)',
    date: '2030-12-15',
    sessionName: 'Sesi 2 (Siang 1)',
    startTime: '09:30',
    endTime: '11:00',
    timeRange: '09:30 - 11:00 WIB',
    location: 'SALUT Cahaya Merapi — Gedung Pembelajaran Digital',
    room: 'Lab Komputer B (Kapasitas 35 PC)',
    capacity: 35,
    registeredCount: 35, // Penuh untuk demonstrasi status kuota penuh
    isActive: true,
    sortOrder: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    regionId: 'reg_yogyakarta',
    regionName: 'Kota Yogyakarta',
    locationId: 'loc_sentraut',
    locationAddress: 'Jl. Bantul No. 100, Mantrijeron, Kota Yogyakarta',
    day: 'Hari 2 (Minggu, 15 Desember 2030)',
    date: '2030-12-15',
    sessionName: 'Sesi 3 (Siang 2)',
    startTime: '11:30',
    endTime: '13:00',
    timeRange: '11:30 - 13:00 WIB',
    location: 'Sentra Ujian UT Yogyakarta — Kampus Utama',
    room: 'Ruang Ujian Digital 102',
    capacity: 50,
    registeredCount: 20,
    isActive: true,
    sortOrder: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    regionId: 'reg_kulonprogo',
    regionName: 'Kulon Progo',
    locationId: 'loc_smkn1pengasih',
    locationAddress: 'Jl. Pengasih - Wates No. 1, Pengasih, Kulon Progo',
    day: 'Hari 1 (Sabtu, 14 Desember 2030)',
    date: '2030-12-14',
    sessionName: 'Sesi 1 (Pagi)',
    startTime: '08:00',
    endTime: '09:45',
    timeRange: '08:00 - 09:45 WIB',
    location: 'SMK Negeri 1 Pengasih',
    room: 'Lab Komputer & Multimedia',
    capacity: 40,
    registeredCount: 16,
    isActive: true,
    sortOrder: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    regionId: 'reg_kulonprogo',
    regionName: 'Kulon Progo',
    locationId: 'loc_smkn1pengasih',
    locationAddress: 'Jl. Pengasih - Wates No. 1, Pengasih, Kulon Progo',
    day: 'Hari 1 (Sabtu, 14 Desember 2030)',
    date: '2030-12-14',
    sessionName: 'Sesi 2 (Siang)',
    startTime: '10:00',
    endTime: '11:45',
    timeRange: '10:00 - 11:45 WIB',
    location: 'SMK Negeri 1 Pengasih',
    room: 'Lab Komputer & Multimedia',
    capacity: 40,
    registeredCount: 24,
    isActive: true,
    sortOrder: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    regionId: 'reg_magelang',
    regionName: 'Magelang',
    locationId: 'loc_sman1muntilan',
    locationAddress: 'Jl. Pemuda No. 153, Muntilan, Magelang',
    day: 'Hari 1 (Sabtu, 14 Desember 2030)',
    date: '2030-12-14',
    sessionName: 'Sesi 1 (Pagi)',
    startTime: '08:00',
    endTime: '09:45',
    timeRange: '08:00 - 09:45 WIB',
    location: 'SMAN 1 Muntilan',
    room: 'Lab Komputer Barat',
    capacity: 40,
    registeredCount: 12,
    isActive: true,
    sortOrder: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    regionId: 'reg_magelang',
    regionName: 'Magelang',
    locationId: 'loc_sman1muntilan',
    locationAddress: 'Jl. Pemuda No. 153, Muntilan, Magelang',
    day: 'Hari 1 (Sabtu, 14 Desember 2030)',
    date: '2030-12-14',
    sessionName: 'Sesi 2 (Siang)',
    startTime: '10:00',
    endTime: '11:45',
    timeRange: '10:00 - 11:45 WIB',
    location: 'SMAN 1 Muntilan',
    room: 'Lab Komputer Barat',
    capacity: 40,
    registeredCount: 19,
    isActive: true,
    sortOrder: 11,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    regionId: 'reg_bantul',
    regionName: 'Bantul',
    locationId: 'loc_sman1bantul',
    locationAddress: 'Jl. K.H. Wahid Hasyim, Palbapang, Bantul',
    day: 'Hari 1 (Sabtu, 14 Desember 2030)',
    date: '2030-12-14',
    sessionName: 'Sesi 1 (Pagi)',
    startTime: '08:00',
    endTime: '09:45',
    timeRange: '08:00 - 09:45 WIB',
    location: 'SMAN 1 Bantul',
    room: 'Lab Komputer 1',
    capacity: 40,
    registeredCount: 10,
    isActive: true,
    sortOrder: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    regionId: 'reg_gunungkidul',
    regionName: 'Gunungkidul',
    locationId: 'loc_smkn1wonosari',
    locationAddress: 'Jl. Veteran, Baleharjo, Wonosari, Gunungkidul',
    day: 'Hari 1 (Sabtu, 14 Desember 2030)',
    date: '2030-12-14',
    sessionName: 'Sesi 1 (Pagi)',
    startTime: '08:00',
    endTime: '09:45',
    timeRange: '08:00 - 09:45 WIB',
    location: 'SMKN 1 Wonosari',
    room: 'Lab Komputer Multimedia',
    capacity: 40,
    registeredCount: 8,
    isActive: true,
    sortOrder: 13,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper to format 24-hour time range into standard Indonesian notation (e.g. 08.00–09.45 WIB)
export function formatTimeDisplay(startTime: string, endTime: string): string {
  const s = startTime.replace(':', '.');
  const e = endTime.replace(':', '.');
  return `${s}–${e} WIB`;
}

// Helper to generate unique reference code
export function generateReferenceNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `UAS30-CM-${rand}`;
}

// ============================================================================
// 2. REGISTRATION PERIOD MANAGEMENT
// ============================================================================

export async function getRegistrationPeriod(): Promise<RegistrationPeriod> {
  const periodDocRef = doc(db, 'settings', 'registrationPeriod');
  try {
    const snap = await getDoc(periodDocRef);
    if (snap.exists()) {
      return snap.data() as RegistrationPeriod;
    }
    await setDoc(periodDocRef, DEFAULT_PERIOD);
    return DEFAULT_PERIOD;
  } catch (error) {
    console.warn('Fallback to local default period due to:', error);
    return DEFAULT_PERIOD;
  }
}

export async function updateRegistrationPeriod(period: Partial<RegistrationPeriod>): Promise<void> {
  const periodDocRef = doc(db, 'settings', 'registrationPeriod');
  const payload = {
    ...period,
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(periodDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'settings/registrationPeriod');
  }
}

export function subscribeRegistrationPeriod(
  onData: (period: RegistrationPeriod) => void,
  onError?: (err: Error) => void
) {
  const periodDocRef = doc(db, 'settings', 'registrationPeriod');
  return onSnapshot(
    periodDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as RegistrationPeriod);
      } else {
        onData(DEFAULT_PERIOD);
      }
    },
    (error) => {
      console.error('Realtime registrationPeriod error:', error);
      if (onError) onError(error);
    }
  );
}

// ============================================================================
// 3. EXAM REGIONS MANAGEMENT (WILAYAH UJIAN)
// ============================================================================

export async function getExamRegions(): Promise<ExamRegion[]> {
  const colRef = collection(db, 'examRegions');
  try {
    const snap = await getDocs(colRef);
    if (snap.empty) {
      await seedInitialRegions();
      return getExamRegions();
    }
    const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ExamRegion, 'id'>) }));
    return items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'examRegions');
  }
}

export function subscribeExamRegions(
  onData: (regions: ExamRegion[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'examRegions');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ExamRegion, 'id'>) }));
      items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      onData(items);
    },
    (error) => {
      console.error('Realtime examRegions error:', error);
      if (onError) onError(error);
    }
  );
}

export async function seedInitialRegions(): Promise<void> {
  for (const reg of INITIAL_OFFICIAL_REGIONS) {
    const docRef = doc(db, 'examRegions', reg.id);
    const { id, ...data } = reg;
    await setDoc(docRef, data);
  }
}

export async function saveExamRegion(region: Omit<ExamRegion, 'id'>, id?: string): Promise<string> {
  const cleanName = region.name.trim();
  if (!cleanName) {
    throw new Error('Nama wilayah ujian tidak boleh kosong.');
  }

  const regionId = id || `reg_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`;
  const docRef = doc(db, 'examRegions', regionId);
  const payload = {
    ...region,
    name: cleanName,
    description: (region.description || '').trim(),
    updatedAt: new Date().toISOString(),
    createdAt: region.createdAt || new Date().toISOString()
  };

  try {
    await setDoc(docRef, payload, { merge: true });
    return regionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `examRegions/${regionId}`);
  }
}

export async function deleteExamRegion(regionId: string): Promise<void> {
  // Integrity check: prevent deletion if locations or registrations exist in this region
  const locs = await getExamLocations();
  const linkedLocations = locs.filter(l => l.regionId === regionId);
  if (linkedLocations.length > 0) {
    throw new Error(`Wilayah ini memiliki ${linkedLocations.length} lokasi ujian aktif/terdaftar. Nonaktifkan status wilayah ini agar data tetap aman alih-alih menghapusnya.`);
  }

  const docRef = doc(db, 'examRegions', regionId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `examRegions/${regionId}`);
  }
}

// ============================================================================
// 4. EXAM LOCATIONS MANAGEMENT (LOKASI UJIAN)
// ============================================================================

export async function getExamLocations(): Promise<ExamLocation[]> {
  const colRef = collection(db, 'examLocations');
  try {
    const snap = await getDocs(colRef);
    if (snap.empty) {
      await seedInitialLocations();
      return getExamLocations();
    }
    const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ExamLocation, 'id'>) }));
    return items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'examLocations');
  }
}

export function subscribeExamLocations(
  onData: (locations: ExamLocation[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'examLocations');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ExamLocation, 'id'>) }));
      items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      onData(items);
    },
    (error) => {
      console.error('Realtime examLocations error:', error);
      if (onError) onError(error);
    }
  );
}

export async function seedInitialLocations(): Promise<void> {
  for (const loc of INITIAL_OFFICIAL_LOCATIONS) {
    const docRef = doc(db, 'examLocations', loc.id);
    const { id, ...data } = loc;
    await setDoc(docRef, data);
  }
}

export async function saveExamLocation(location: Omit<ExamLocation, 'id'>, id?: string): Promise<string> {
  const cleanName = location.name.trim();
  const cleanRegionId = (location.regionId || '').trim();
  const cleanAddress = location.address.trim();

  if (!cleanName) throw new Error('Nama sekolah atau lokasi ujian wajib diisi.');
  if (!cleanRegionId) throw new Error('Wilayah ujian wajib dipilih dari menu Wilayah Ujian.');
  if (!cleanAddress) throw new Error('Alamat lengkap lokasi ujian wajib diisi.');

  // Validate that parent region exists and pull canonical name
  let resolvedRegionName = location.regionName || '';
  try {
    const regDocRef = doc(db, 'examRegions', cleanRegionId);
    const regSnap = await getDoc(regDocRef);
    if (regSnap.exists()) {
      resolvedRegionName = (regSnap.data() as ExamRegion).name;
    }
  } catch (e) {
    console.warn('Region check notice:', e);
  }

  const locationId = id || `loc_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`;
  const docRef = doc(db, 'examLocations', locationId);
  const payload = {
    ...location,
    name: cleanName,
    regionId: cleanRegionId,
    regionName: resolvedRegionName,
    address: cleanAddress,
    updatedAt: new Date().toISOString(),
    createdAt: location.createdAt || new Date().toISOString()
  };

  try {
    await setDoc(docRef, payload, { merge: true });
    return locationId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `examLocations/${locationId}`);
  }
}

export async function deleteExamLocation(locationId: string): Promise<void> {
  const slots = await getExamSlots();
  const linkedSlots = slots.filter(s => s.locationId === locationId);
  if (linkedSlots.length > 0) {
    throw new Error(`Lokasi ini digunakan oleh ${linkedSlots.length} jadwal/sesi ujian. Nonaktifkan status lokasi agar riwayat ujian tidak terhapus.`);
  }

  const docRef = doc(db, 'examLocations', locationId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `examLocations/${locationId}`);
  }
}

// ============================================================================
// 5. EXAM SLOTS & SESSIONS MANAGEMENT (SESI UJIAN)
// ============================================================================

export async function getExamSlots(): Promise<ExamSlot[]> {
  const slotsCol = collection(db, 'examSlots');
  try {
    const snap = await getDocs(slotsCol);
    if (snap.empty) {
      await seedInitialSlots();
      return getExamSlots();
    }
    const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ExamSlot, 'id'>) }));
    return items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'examSlots');
  }
}

export function subscribeExamSlots(
  onData: (slots: ExamSlot[]) => void,
  onError?: (err: Error) => void
) {
  const slotsCol = collection(db, 'examSlots');
  return onSnapshot(
    slotsCol,
    (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ExamSlot, 'id'>) }));
      items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      onData(items);
    },
    (error) => {
      console.error('Realtime slot sync error:', error);
      if (onError) onError(error);
    }
  );
}

export async function seedInitialSlots(): Promise<void> {
  for (let i = 0; i < INITIAL_OFFICIAL_SLOTS.length; i++) {
    const slotId = `slot_${i + 1}`;
    const slotRef = doc(db, 'examSlots', slotId);
    await setDoc(slotRef, INITIAL_OFFICIAL_SLOTS[i]);
  }
}

export async function saveExamSlot(slot: Omit<ExamSlot, 'id'>, id?: string): Promise<string> {
  const cleanSessionName = slot.sessionName?.trim();
  if (!cleanSessionName) {
    throw new Error('Nama sesi ujian wajib diisi.');
  }

  // Validate start and end time format & relationship
  if (slot.startTime && slot.endTime) {
    if (slot.startTime >= slot.endTime) {
      throw new Error(`Jam selesai (${slot.endTime}) harus lebih besar daripada jam mulai (${slot.startTime}). Format 24 jam.`);
    }
  }

  // Compute timeRange standard display string (08.00–09.45 WIB)
  const timeRange = slot.startTime && slot.endTime 
    ? formatTimeDisplay(slot.startTime, slot.endTime)
    : (slot.timeRange || '08.00–09.45 WIB');

  // Resolve Location and Region details if locationId is given
  let resolvedLocation = slot.location || '';
  let resolvedRegionId = slot.regionId || '';
  let resolvedRegionName = slot.regionName || '';
  let resolvedAddress = slot.locationAddress || '';

  if (slot.locationId) {
    try {
      const locRef = doc(db, 'examLocations', slot.locationId);
      const locSnap = await getDoc(locRef);
      if (locSnap.exists()) {
        const lData = locSnap.data() as ExamLocation;
        resolvedLocation = lData.name;
        resolvedRegionId = lData.regionId;
        resolvedRegionName = lData.regionName || '';
        resolvedAddress = lData.address;
      }
    } catch (e) {
      console.warn('Location lookup in saveSlot notice:', e);
    }
  }

  const slotId = id || `slot_${Date.now()}`;
  const slotRef = doc(db, 'examSlots', slotId);

  const payload = {
    ...slot,
    sessionName: cleanSessionName,
    location: resolvedLocation,
    regionId: resolvedRegionId,
    regionName: resolvedRegionName,
    locationAddress: resolvedAddress,
    timeRange,
    updatedAt: new Date().toISOString(),
    createdAt: slot.createdAt || new Date().toISOString()
  };

  try {
    await setDoc(slotRef, payload, { merge: true });
    return slotId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `examSlots/${slotId}`);
  }
}

export async function deleteExamSlot(slotId: string): Promise<void> {
  const slotRef = doc(db, 'examSlots', slotId);
  try {
    const snap = await getDoc(slotRef);
    if (snap.exists()) {
      const data = snap.data() as ExamSlot;
      if (data.registeredCount > 0) {
        throw new Error(`Sesi ujian ini telah memiliki ${data.registeredCount} peserta terdaftar. Silakan nonaktifkan sesi ini alih-alih menghapusnya agar data pendaftar tidak rusak.`);
      }
    }
    await deleteDoc(slotRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `examSlots/${slotId}`);
  }
}

// ============================================================================
// 6. NIM LOOKUP & 2FA VERIFICATION
// ============================================================================

export async function checkNimExists(nim: string): Promise<Registration | null> {
  const cleanNim = nim.trim();
  if (!cleanNim) return null;

  try {
    const nimDocRef = doc(db, 'nimRegistrations', cleanNim);
    const nimSnap = await getDoc(nimDocRef);
    if (!nimSnap.exists()) {
      return null;
    }

    const { registrationId } = nimSnap.data() as { registrationId: string };
    if (!registrationId) return null;

    const regDocRef = doc(db, 'registrations', registrationId);
    const regSnap = await getDoc(regDocRef);
    if (!regSnap.exists()) return null;

    return { id: regSnap.id, ...(regSnap.data() as Omit<Registration, 'id'>) };
  } catch (error) {
    console.warn('Check NIM lookup notice:', error);
    return null;
  }
}

export async function verifyAndGetRegistration(
  nim: string,
  verificationKey: string
): Promise<Registration> {
  const cleanNim = nim.trim();
  const cleanKey = verificationKey.trim();

  if (!cleanNim) throw new Error('NIM wajib diisi.');
  if (!cleanKey) throw new Error('Nomor Referensi atau 4 Digit Terakhir No. WhatsApp wajib diisi untuk verifikasi kepemilikan.');

  const nimDocRef = doc(db, 'nimRegistrations', cleanNim);
  let nimSnap;
  try {
    nimSnap = await getDoc(nimDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `nimRegistrations/${cleanNim}`);
  }

  if (!nimSnap || !nimSnap.exists()) {
    throw new Error(`NIM ${cleanNim} tidak ditemukan dalam arsip pendaftaran resmi.`);
  }

  const { registrationId } = nimSnap.data() as { registrationId: string };
  if (!registrationId) {
    throw new Error('Data registrasi terkorupsi atau tidak terhubung.');
  }

  const regDocRef = doc(db, 'registrations', registrationId);
  let regSnap;
  try {
    regSnap = await getDoc(regDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `registrations/${registrationId}`);
  }

  if (!regSnap || !regSnap.exists()) {
    throw new Error('Dokumen registrasi tidak ditemukan.');
  }

  const reg = { id: regSnap.id, ...(regSnap.data() as Omit<Registration, 'id'>) };

  // Ownership verification check:
  // Must match either full refNumber (case-insensitive) OR last 4 digits of WhatsApp
  const refNumber = reg.refNumber;
  const cleanPhone = reg.whatsapp.replace(/\D/g, '');
  const last4Wa = cleanPhone.slice(-4);
  const refMatches = cleanKey.toUpperCase() === refNumber.toUpperCase() || reg.refNumber.toLowerCase() === cleanKey.toLowerCase();
  const waMatches = cleanKey === last4Wa || cleanKey === cleanPhone;

  if (!refMatches && !waMatches) {
    throw new Error('Verifikasi kepemilikan gagal. Kunci verifikasi (Nomor Referensi atau 4 Digit Terakhir WhatsApp) tidak cocok dengan NIM yang terdaftar.');
  }

  return reg;
}

// ============================================================================
// 7. SUBMIT REGISTRATION WITH ATOMIC CONCURRENCY & DYNAMIC REGION/LOCATION
// ============================================================================

export async function submitStudentRegistration(formData: {
  nim: string;
  fullName: string;
  studyProgram: string;
  studyProgramCode?: string;
  faculty: string;
  facultyCode?: string;
  degreeLevel?: string;
  whatsapp: string;
  regionId?: string;
  regionName?: string;
  locationId?: string;
  locationAddress?: string;
  slotId: string;
}): Promise<Registration> {
  const cleanNim = formData.nim.trim();
  const cleanName = formData.fullName.trim();
  const cleanProdi = formData.studyProgram.trim();
  const cleanSlotId = formData.slotId.trim();

  // Rigorous input validations
  if (!cleanName || cleanName.length < 2 || cleanName.length > 120) {
    throw new Error('Nama lengkap tidak valid. Masukkan 2–120 karakter.');
  }

  if (!cleanNim || !/^\d{8,12}$/.test(cleanNim)) {
    throw new Error('Nomor Induk Mahasiswa (NIM) harus berupa 8–12 digit angka resmi UT.');
  }

  if (!cleanProdi) {
    throw new Error('Program studi harus dipilih.');
  }

  // Backend cross-validation: verify faculty and study program pairing
  if (formData.facultyCode && formData.studyProgramCode) {
    const pairValidation = validateFacultyProgramPair(formData.facultyCode, formData.studyProgramCode);
    if (!pairValidation.isValid) {
      throw new Error(pairValidation.error || 'Kombinasi Fakultas dan Program Studi tidak valid atau tidak aktif.');
    }
  }

  const registrationId = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const refNumber = generateReferenceNumber();

  const slotDocRef = doc(db, 'examSlots', cleanSlotId);
  const regDocRef = doc(db, 'registrations', registrationId);
  const nimDocRef = doc(db, 'nimRegistrations', cleanNim);
  const periodDocRef = doc(db, 'settings', 'registrationPeriod');

  try {
    const result = await runTransaction(db, async (transaction) => {
      // 1. Verify period is open
      const periodSnap = await transaction.get(periodDocRef);
      if (periodSnap.exists()) {
        const periodData = periodSnap.data() as RegistrationPeriod;
        if (!periodData.isOpen) {
          throw new Error('Pendaftaran saat ini sedang ditutup oleh pihak administrasi SALUT.');
        }

        // If duplicate NIM is disallowed, check if NIM document already exists
        if (!periodData.allowDuplicateNim) {
          const nimSnap = await transaction.get(nimDocRef);
          if (nimSnap.exists()) {
            throw new Error(`NIM ${cleanNim} sudah terdaftar sebelumnya. Sesuai ketentuan, satu mahasiswa hanya dapat mendaftar satu kali.`);
          }
        }
      }

      // 2. Verify slot capacity and active status
      const slotSnap = await transaction.get(slotDocRef);
      if (!slotSnap.exists()) {
        throw new Error('Jadwal ujian yang dipilih tidak ditemukan pada sistem.');
      }

      const slotData = slotSnap.data() as ExamSlot;
      if (!slotData.isActive) {
        throw new Error('Jadwal ujian ini sedang tidak aktif atau ditutup sementara oleh admin.');
      }

      if (slotData.registeredCount >= slotData.capacity) {
        throw new Error('Mohon maaf, kuota peserta pada sesi ini baru saja terpenuhi. Silakan pilih sesi atau hari lain yang masih tersedia.');
      }

      // 3. Verify region and location if specified
      let resolvedRegionName = formData.regionName || slotData.regionName || '';
      let resolvedLocationAddress = formData.locationAddress || slotData.locationAddress || '';

      if (formData.regionId) {
        const regionDocRef = doc(db, 'examRegions', formData.regionId);
        const regionSnap = await transaction.get(regionDocRef);
        if (regionSnap.exists()) {
          const rData = regionSnap.data() as ExamRegion;
          if (!rData.isActive) {
            throw new Error(`Wilayah ${rData.name} sedang dinonaktifkan oleh administrator.`);
          }
          resolvedRegionName = rData.name;
        }
      }

      if (formData.locationId) {
        const locDocRef = doc(db, 'examLocations', formData.locationId);
        const locSnap = await transaction.get(locDocRef);
        if (locSnap.exists()) {
          const lData = locSnap.data() as ExamLocation;
          if (!lData.isActive) {
            throw new Error(`Lokasi ujian ${lData.name} sedang dinonaktifkan oleh administrator.`);
          }
          if (formData.regionId && lData.regionId !== formData.regionId) {
            throw new Error('Lokasi ujian tidak sesuai dengan wilayah yang dipilih.');
          }
          resolvedLocationAddress = lData.address;
        }
      }

      const registrationRecord: Registration = {
        id: registrationId,
        refNumber,
        nim: cleanNim,
        fullName: cleanName,
        studyProgram: cleanProdi,
        studyProgramCode: formData.studyProgramCode || '',
        faculty: formData.faculty || 'Universitas Terbuka Yogyakarta',
        facultyCode: formData.facultyCode || '',
        degreeLevel: (formData.degreeLevel as any) || 'S1',
        whatsapp: formData.whatsapp.trim(),
        regionId: formData.regionId || slotData.regionId || '',
        regionName: resolvedRegionName,
        locationId: formData.locationId || slotData.locationId || '',
        locationAddress: resolvedLocationAddress,
        slotId: cleanSlotId,
        day: slotData.day,
        date: slotData.date,
        sessionName: slotData.sessionName,
        timeRange: slotData.timeRange,
        location: slotData.location,
        room: slotData.room,
        status: 'Terdaftar',
        registeredAt: new Date().toISOString()
      };

      // 4. Atomically increment slot registeredCount
      transaction.update(slotDocRef, {
        registeredCount: slotData.registeredCount + 1,
        updatedAt: new Date().toISOString()
      });

      // 5. Save registration document
      transaction.set(regDocRef, registrationRecord);

      // 6. Save NIM direct index mapping to lock NIM atomically
      transaction.set(nimDocRef, {
        nim: cleanNim,
        registrationId,
        refNumber,
        registeredAt: new Date().toISOString()
      });

      return registrationRecord;
    });

    return result;
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('kuota') || 
      error.message.includes('tidak ditemukan') ||
      error.message.includes('sudah terdaftar') ||
      error.message.includes('ditutup') ||
      error.message.includes('dinonaktifkan') ||
      error.message.includes('tidak sesuai')
    )) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, `registrations/${registrationId}`);
  }
}

// ============================================================================
// 8. ADMIN REGISTRATIONS MANAGEMENT
// ============================================================================

export async function getRegistrationById(id: string): Promise<Registration | null> {
  const regDocRef = doc(db, 'registrations', id);
  try {
    const snap = await getDoc(regDocRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Registration, 'id'>) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `registrations/${id}`);
  }
}

export async function getAllRegistrations(): Promise<Registration[]> {
  const regCol = collection(db, 'registrations');
  try {
    const q = query(regCol, orderBy('registeredAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Registration, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'registrations');
  }
}

export function subscribeAllRegistrations(
  onData: (registrations: Registration[]) => void,
  onError?: (err: Error) => void
) {
  const regCol = collection(db, 'registrations');
  const q = query(regCol, orderBy('registeredAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Registration, 'id'>) }));
      onData(items);
    },
    (error) => {
      console.error('Realtime registrations subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function updateRegistrationStatus(
  registrationId: string,
  newStatus: Registration['status']
): Promise<void> {
  const regDocRef = doc(db, 'registrations', registrationId);
  try {
    await updateDoc(regDocRef, { status: newStatus });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `registrations/${registrationId}`);
  }
}

export async function cancelRegistrationAndFreeQuota(
  registrationId: string,
  slotId: string,
  studentNim?: string
): Promise<void> {
  const regDocRef = doc(db, 'registrations', registrationId);
  const slotDocRef = doc(db, 'examSlots', slotId);

  try {
    await runTransaction(db, async (transaction) => {
      const regSnap = await transaction.get(regDocRef);
      if (!regSnap.exists()) return;

      const regData = regSnap.data() as Registration;
      
      // CRITICAL: Prevent repeated cancellation from repeatedly inflating slot quota
      if (regData.status === 'Dibatalkan') {
        throw new Error('Pendaftaran ini sudah berstatus Dibatalkan. Kuota tidak dapat dikembalikan berulang kali.');
      }

      const nimToFree = studentNim || regData.nim;

      const slotSnap = await transaction.get(slotDocRef);
      if (slotSnap.exists()) {
        const slotData = slotSnap.data() as ExamSlot;
        const newCount = Math.max(0, slotData.registeredCount - 1);
        transaction.update(slotDocRef, {
          registeredCount: newCount,
          updatedAt: new Date().toISOString()
        });
      }

      transaction.update(regDocRef, {
        status: 'Dibatalkan'
      });

      // Free the NIM index so the student can re-register if policy permits
      if (nimToFree) {
        const nimDocRef = doc(db, 'nimRegistrations', nimToFree);
        transaction.delete(nimDocRef);
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `registrations/${registrationId}`);
  }
}

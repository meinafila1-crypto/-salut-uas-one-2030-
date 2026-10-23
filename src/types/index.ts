import { 
  ACADEMIC_PROGRAMS, 
  AcademicFacultyItem, 
  AcademicProgramItem, 
  DegreeLevel, 
  getFaculties, 
  getProgramsByFaculty,
  getProgramsByFacultyAndLevel,
  findFacultyByCode,
  findProgramByCode,
  validateFacultyProgramPair 
} from '../data/academicPrograms';

export {
  ACADEMIC_PROGRAMS,
  type AcademicFacultyItem,
  type AcademicProgramItem,
  type DegreeLevel,
  getFaculties,
  getProgramsByFaculty,
  getProgramsByFacultyAndLevel,
  findFacultyByCode,
  findProgramByCode,
  validateFacultyProgramPair
};

export interface ExamRegion {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  locationCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamLocation {
  id: string;
  name: string;
  regionId: string;
  regionName?: string;
  address: string;
  city?: string;
  province?: string;
  capacity: number;
  isActive: boolean;
  sortOrder: number;
  registeredCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamSlot {
  id: string;
  regionId?: string;
  regionName?: string;
  locationId?: string;
  locationAddress?: string;
  day: string;
  date: string;
  sessionName: string;
  startTime?: string;
  endTime?: string;
  timeRange: string;
  location: string;
  room: string;
  capacity: number;
  registeredCount: number;
  isActive: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export type RegistrationStatus = 'Terdaftar' | 'Perlu Verifikasi' | 'Dibatalkan';

export interface Registration {
  id: string;
  refNumber: string;
  nim: string;
  fullName: string;
  studyProgram: string;
  studyProgramCode?: string;
  faculty: string;
  facultyCode?: string;
  degreeLevel?: DegreeLevel;
  whatsapp: string;
  regionId?: string;
  regionName?: string;
  locationId?: string;
  locationAddress?: string;
  slotId: string;
  day: string;
  date: string;
  sessionName: string;
  timeRange: string;
  location: string;
  room: string;
  status: RegistrationStatus;
  registeredAt: string;
}

export interface RegistrationPeriod {
  title: string;
  semester: string;
  academicYear: string;
  isOpen: boolean;
  openDate: string;
  closeDate: string;
  announcement: string;
  allowDuplicateNim: boolean;
  heroImageUrl?: string;
  updatedAt: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'superadmin' | 'admin';
}

export interface FacultyProgram {
  faculty: string;
  programs: string[];
}

// Backward-compatible export mapping directly from centralized ACADEMIC_PROGRAMS
export const UT_FACULTIES: FacultyProgram[] = ACADEMIC_PROGRAMS.map(f => ({
  faculty: f.facultyName,
  programs: f.programs.filter(p => p.isActive).map(p => p.programName)
}));

export type DegreeLevel = 'D3' | 'D4' | 'S1' | 'S2' | 'S3' | 'Profesi';

export interface AcademicProgramItem {
  programCode: string;
  programName: string;
  degreeLevel: DegreeLevel;
  isActive: boolean;
  verifiedForCurrentAdmission: boolean;
  notes?: string;
}

export interface AcademicFacultyItem {
  facultyCode: string;
  facultyName: string;
  shortName: string;
  category: 'Sarjana' | 'Pascasarjana' | 'Diploma' | 'Profesi';
  programs: AcademicProgramItem[];
}

export const ACADEMIC_PROGRAMS: AcademicFacultyItem[] = [
  {
    facultyCode: 'FEB',
    facultyName: 'Fakultas Ekonomi dan Bisnis (FEB)',
    shortName: 'FEB',
    category: 'Sarjana',
    programs: [
      {
        programCode: 'FEB-S1-MAN',
        programName: 'S1 Manajemen',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FEB-S1-EKOP',
        programName: 'S1 Ekonomi Pembangunan',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FEB-S1-EKOS',
        programName: 'S1 Ekonomi Syariah',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FEB-S1-AKT',
        programName: 'S1 Akuntansi',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FEB-S1-AKP',
        programName: 'S1 Akuntansi Keuangan Publik',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FEB-S1-PAR',
        programName: 'S1 Pariwisata',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FEB-S1-KWU',
        programName: 'S1 Kewirausahaan',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      }
    ]
  },
  {
    facultyCode: 'FHISIP',
    facultyName: 'Fakultas Hukum, Ilmu Sosial, dan Ilmu Politik (FHISIP)',
    shortName: 'FHISIP',
    category: 'Sarjana',
    programs: [
      {
        programCode: 'FHISIP-S1-IAP',
        programName: 'S1 Ilmu Administrasi Publik',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FHISIP-S1-ADB',
        programName: 'S1 Administrasi Bisnis',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FHISIP-S1-HKM',
        programName: 'S1 Hukum',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FHISIP-S1-IPEM',
        programName: 'S1 Ilmu Pemerintahan',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FHISIP-S1-IKOM',
        programName: 'S1 Ilmu Komunikasi',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FHISIP-S1-PSI',
        programName: 'S1 Perpustakaan dan Sains Informasi',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FHISIP-S1-SOS',
        programName: 'S1 Sosiologi',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FHISIP-S1-SING',
        programName: 'S1 Sastra Inggris',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FHISIP-S1-PJK',
        programName: 'S1 Perpajakan',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      }
    ]
  },
  {
    facultyCode: 'FST',
    facultyName: 'Fakultas Sains dan Teknologi (FST)',
    shortName: 'FST',
    category: 'Sarjana',
    programs: [
      {
        programCode: 'FST-S1-STAT',
        programName: 'S1 Statistika',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FST-S1-MAT',
        programName: 'S1 Matematika',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FST-S1-BIO',
        programName: 'S1 Biologi',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FST-S1-TPAN',
        programName: 'S1 Teknologi Pangan',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FST-S1-AGRI',
        programName: 'S1 Agribisnis',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FST-S1-PWK',
        programName: 'S1 Perencanaan Wilayah dan Kota',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FST-S1-SI',
        programName: 'S1 Sistem Informasi',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FST-S1-SDATA',
        programName: 'S1 Sains Data',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      }
    ]
  },
  {
    facultyCode: 'FKIP',
    facultyName: 'Fakultas Keguruan dan Ilmu Pendidikan (FKIP)',
    shortName: 'FKIP',
    category: 'Sarjana',
    programs: [
      {
        programCode: 'FKIP-S1-PGSD',
        programName: 'S1 Pendidikan Guru Sekolah Dasar (PGSD)',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FKIP-S1-PGPAUD',
        programName: 'S1 Pendidikan Guru Pendidikan Anak Usia Dini (PGPAUD)',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FKIP-S1-PBSI',
        programName: 'S1 Pendidikan Bahasa dan Sastra Indonesia',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FKIP-S1-PBING',
        programName: 'S1 Pendidikan Bahasa Inggris',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FKIP-S1-PMAT',
        programName: 'S1 Pendidikan Matematika',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FKIP-S1-PFIS',
        programName: 'S1 Pendidikan Fisika',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FKIP-S1-PKIM',
        programName: 'S1 Pendidikan Kimia',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FKIP-S1-PBIO',
        programName: 'S1 Pendidikan Biologi',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FKIP-S1-PEKO',
        programName: 'S1 Pendidikan Ekonomi',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FKIP-S1-PPKN',
        programName: 'S1 Pendidikan Pancasila dan Kewarganegaraan',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FKIP-S1-TPEN',
        programName: 'S1 Teknologi Pendidikan',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'FKIP-S1-PAI',
        programName: 'S1 Pendidikan Agama Islam',
        degreeLevel: 'S1',
        isActive: true,
        verifiedForCurrentAdmission: true
      }
    ]
  },
  {
    facultyCode: 'SPS',
    facultyName: 'Sekolah Pascasarjana (SPs)',
    shortName: 'SPs',
    category: 'Pascasarjana',
    programs: [
      // Magister (S2)
      {
        programCode: 'SPS-S2-MSL',
        programName: 'Magister Studi Lingkungan (S2)',
        degreeLevel: 'S2',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'SPS-S2-MMP',
        programName: 'Magister Manajemen Perikanan (S2)',
        degreeLevel: 'S2',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'SPS-S2-MAP',
        programName: 'Magister Administrasi Publik (S2)',
        degreeLevel: 'S2',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'SPS-S2-MM',
        programName: 'Magister Manajemen (S2)',
        degreeLevel: 'S2',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'SPS-S2-MPD',
        programName: 'Magister Pendidikan Dasar (S2)',
        degreeLevel: 'S2',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'SPS-S2-MPMAT',
        programName: 'Magister Pendidikan Matematika (S2)',
        degreeLevel: 'S2',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'SPS-S2-MPBI',
        programName: 'Magister Pendidikan Bahasa Inggris (S2)',
        degreeLevel: 'S2',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'SPS-S2-MPAD',
        programName: 'Magister Pendidikan Anak Usia Dini (MPAD) (S2)',
        degreeLevel: 'S2',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'SPS-S2-MHKM',
        programName: 'Magister Hukum (S2)',
        degreeLevel: 'S2',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      // Doktor (S3)
      {
        programCode: 'SPS-S3-DIM',
        programName: 'Doktor Ilmu Manajemen (S3)',
        degreeLevel: 'S3',
        isActive: true,
        verifiedForCurrentAdmission: true
      },
      {
        programCode: 'SPS-S3-DAP',
        programName: 'Doktor Administrasi Publik (S3)',
        degreeLevel: 'S3',
        isActive: true,
        verifiedForCurrentAdmission: true
      }
    ]
  },
  {
    facultyCode: 'DIPLOMA',
    facultyName: 'Program Diploma (Vokasi)',
    shortName: 'Diploma',
    category: 'Diploma',
    programs: [
      {
        programCode: 'DIP-D3-PJK',
        programName: 'D3 Perpajakan',
        degreeLevel: 'D3',
        isActive: false, // Ditutup untuk mahasiswa baru; dialihkan ke S1 Perpajakan FHISIP
        verifiedForCurrentAdmission: false,
        notes: 'Penerimaan baru ditutup; dialihkan ke program S1 Perpajakan di FHISIP.'
      },
      {
        programCode: 'DIP-D4-ASIP',
        programName: 'D4 Kearsipan',
        degreeLevel: 'D4',
        isActive: true,
        verifiedForCurrentAdmission: true,
        notes: 'Program sarjana terapan aktif.'
      }
    ]
  },
  {
    facultyCode: 'PPG',
    facultyName: 'Program Profesi (PPG)',
    shortName: 'Profesi',
    category: 'Profesi',
    programs: [
      {
        programCode: 'PPG-PROF-GURU',
        programName: 'Pendidikan Profesi Guru (PPG)',
        degreeLevel: 'Profesi',
        isActive: true,
        verifiedForCurrentAdmission: true,
        notes: 'Program Profesi Guru Prajabatan / Dalam Jabatan.'
      }
    ]
  }
];

// Centralized Helper Functions
export function getFaculties(): AcademicFacultyItem[] {
  return ACADEMIC_PROGRAMS;
}

export function getProgramsByFaculty(
  facultyCode: string,
  options: { onlyActive?: boolean } = { onlyActive: true }
): AcademicProgramItem[] {
  const fac = ACADEMIC_PROGRAMS.find(f => f.facultyCode === facultyCode);
  if (!fac) return [];
  if (options.onlyActive) {
    return fac.programs.filter(p => p.isActive && p.verifiedForCurrentAdmission);
  }
  return fac.programs;
}

export function getProgramsByFacultyAndLevel(
  facultyCode: string,
  degreeLevel: DegreeLevel,
  options: { onlyActive?: boolean } = { onlyActive: true }
): AcademicProgramItem[] {
  const progs = getProgramsByFaculty(facultyCode, options);
  return progs.filter(p => p.degreeLevel === degreeLevel);
}

export function findFacultyByCode(facultyCode: string): AcademicFacultyItem | undefined {
  return ACADEMIC_PROGRAMS.find(f => f.facultyCode === facultyCode);
}

export function findProgramByCode(programCode: string): AcademicProgramItem | undefined {
  for (const fac of ACADEMIC_PROGRAMS) {
    const prog = fac.programs.find(p => p.programCode === programCode);
    if (prog) return prog;
  }
  return undefined;
}

const PROGRAM_CODE_ALIASES: Record<string, string> = {
  'FEB_MNJ': 'FEB-S1-MAN',
  'FEB-MNJ': 'FEB-S1-MAN',
  'FST_SI': 'FST-S1-SI',
  'FST-SI': 'FST-S1-SI',
  'FKIP_PGSD': 'FKIP-S1-PGSD',
  'FKIP-PGSD': 'FKIP-S1-PGSD',
};

export function validateFacultyProgramPair(
  facultyCode: string,
  programCode: string,
  options: { requireActive?: boolean } = { requireActive: true }
): { isValid: boolean; error?: string; faculty?: AcademicFacultyItem; program?: AcademicProgramItem } {
  const normalizedCode = PROGRAM_CODE_ALIASES[programCode] || programCode;
  const faculty = findFacultyByCode(facultyCode);
  if (!faculty) {
    return { isValid: false, error: `Fakultas dengan kode '${facultyCode}' tidak ditemukan.` };
  }

  const program = faculty.programs.find(p => p.programCode === normalizedCode || p.programCode === programCode);
  if (!program) {
    return {
      isValid: false,
      error: `Program studi dengan kode '${programCode}' tidak terdaftar pada ${faculty.facultyName}.`
    };
  }

  if (options.requireActive && (!program.isActive || !program.verifiedForCurrentAdmission)) {
    return {
      isValid: false,
      error: `Program studi '${program.programName}' saat ini sedang tidak menerima registrasi baru (${program.notes || 'nonaktif'}).`,
      faculty,
      program
    };
  }

  return { isValid: true, faculty, program };
}

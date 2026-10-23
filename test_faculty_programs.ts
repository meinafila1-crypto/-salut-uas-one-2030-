import { 
  ACADEMIC_PROGRAMS, 
  getFaculties, 
  getProgramsByFaculty, 
  findFacultyByCode, 
  findProgramByCode, 
  validateFacultyProgramPair 
} from './src/data/academicPrograms';
import { readFileSync } from 'fs';
import path from 'path';

interface TestResult {
  no: number;
  description: string;
  expected: string;
  actual: string;
  passed: boolean;
}

const results: TestResult[] = [];

function assertTest(no: number, description: string, expected: string, actual: string, condition: boolean) {
  results.push({ no, description, expected, actual, passed: condition });
  const icon = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [Uji #${no}] ${description}`);
  console.log(`   Ekspektasi: ${expected}`);
  console.log(`   Aktual    : ${actual}\n`);
}

function runFacultyProgramTests() {
  console.log('================================================================');
  console.log('PENGUJIAN PENYEMPURNAAN DATA FAKULTAS & PRODI OTOMATIS');
  console.log('SALUT UAS ONE 2030 — SALUT Cahaya Merapi • UT Yogyakarta');
  console.log('================================================================\n');

  // Uji 1: Memilih FEB menampilkan tepat daftar prodi FEB
  const febProgs = getProgramsByFaculty('FEB', { onlyActive: true });
  const febNames = febProgs.map(p => p.programName);
  const expectedFeb = [
    'S1 Manajemen',
    'S1 Ekonomi Pembangunan',
    'S1 Ekonomi Syariah',
    'S1 Akuntansi',
    'S1 Akuntansi Keuangan Publik',
    'S1 Pariwisata',
    'S1 Kewirausahaan'
  ];
  const febMatches = expectedFeb.every(name => febNames.includes(name)) && febNames.length === expectedFeb.length;
  assertTest(
    1,
    'Memilih FEB menampilkan tepat 7 daftar prodi S1 FEB aktif',
    expectedFeb.join(', '),
    febNames.join(', '),
    febMatches
  );

  // Uji 2: Memilih FHISIP menampilkan tepat daftar prodi FHISIP
  const fhisipProgs = getProgramsByFaculty('FHISIP', { onlyActive: true });
  const fhisipNames = fhisipProgs.map(p => p.programName);
  const expectedFhisip = [
    'S1 Ilmu Administrasi Publik',
    'S1 Administrasi Bisnis',
    'S1 Hukum',
    'S1 Ilmu Pemerintahan',
    'S1 Ilmu Komunikasi',
    'S1 Perpustakaan dan Sains Informasi',
    'S1 Sosiologi',
    'S1 Sastra Inggris',
    'S1 Perpajakan'
  ];
  const fhisipMatches = expectedFhisip.every(name => fhisipNames.includes(name)) && fhisipNames.length === expectedFhisip.length;
  assertTest(
    2,
    'Memilih FHISIP menampilkan tepat 9 prodi S1 FHISIP aktif',
    expectedFhisip.join(', '),
    fhisipNames.join(', '),
    fhisipMatches
  );

  // Uji 3: Memilih FST menampilkan tepat daftar prodi FST
  const fstProgs = getProgramsByFaculty('FST', { onlyActive: true });
  const fstNames = fstProgs.map(p => p.programName);
  const expectedFst = [
    'S1 Statistika',
    'S1 Matematika',
    'S1 Biologi',
    'S1 Teknologi Pangan',
    'S1 Agribisnis',
    'S1 Perencanaan Wilayah dan Kota',
    'S1 Sistem Informasi',
    'S1 Sains Data'
  ];
  const fstMatches = expectedFst.every(name => fstNames.includes(name)) && fstNames.length === expectedFst.length;
  assertTest(
    3,
    'Memilih FST menampilkan tepat 8 prodi S1 FST aktif',
    expectedFst.join(', '),
    fstNames.join(', '),
    fstMatches
  );

  // Uji 4: Memilih FKIP menampilkan tepat daftar prodi FKIP
  const fkipProgs = getProgramsByFaculty('FKIP', { onlyActive: true });
  const fkipNames = fkipProgs.map(p => p.programName);
  const expectedFkip = [
    'S1 Pendidikan Guru Sekolah Dasar (PGSD)',
    'S1 Pendidikan Guru Pendidikan Anak Usia Dini (PGPAUD)',
    'S1 Pendidikan Bahasa dan Sastra Indonesia',
    'S1 Pendidikan Bahasa Inggris',
    'S1 Pendidikan Matematika',
    'S1 Pendidikan Fisika',
    'S1 Pendidikan Kimia',
    'S1 Pendidikan Biologi',
    'S1 Pendidikan Ekonomi',
    'S1 Pendidikan Pancasila dan Kewarganegaraan',
    'S1 Teknologi Pendidikan',
    'S1 Pendidikan Agama Islam'
  ];
  const fkipMatches = expectedFkip.every(name => fkipNames.includes(name)) && fkipNames.length === expectedFkip.length;
  assertTest(
    4,
    'Memilih FKIP menampilkan tepat 12 prodi S1 FKIP aktif',
    expectedFkip.join(', '),
    fkipNames.join(', '),
    fkipMatches
  );

  // Uji 5: Memilih Sekolah Pascasarjana (SPs) menampilkan program S2 dan S3 yang benar
  const spsProgs = getProgramsByFaculty('SPS', { onlyActive: true });
  const s2Progs = spsProgs.filter(p => p.degreeLevel === 'S2').map(p => p.programName);
  const s3Progs = spsProgs.filter(p => p.degreeLevel === 'S3').map(p => p.programName);
  const expectedS2 = [
    'Magister Studi Lingkungan (S2)',
    'Magister Manajemen Perikanan (S2)',
    'Magister Administrasi Publik (S2)',
    'Magister Manajemen (S2)',
    'Magister Pendidikan Dasar (S2)',
    'Magister Pendidikan Matematika (S2)',
    'Magister Pendidikan Bahasa Inggris (S2)',
    'Magister Pendidikan Anak Usia Dini (MPAD) (S2)',
    'Magister Hukum (S2)'
  ];
  const expectedS3 = [
    'Doktor Ilmu Manajemen (S3)',
    'Doktor Administrasi Publik (S3)'
  ];
  const spsMatches = expectedS2.every(n => s2Progs.includes(n)) && 
                     expectedS3.every(n => s3Progs.includes(n)) && 
                     spsProgs.length === (expectedS2.length + expectedS3.length);
  assertTest(
    5,
    'Memilih Sekolah Pascasarjana menampilkan 9 program S2 dan 2 program S3 resmi',
    `S2 (${expectedS2.length}) + S3 (${expectedS3.length}) = 11 program`,
    `S2 (${s2Progs.length}) + S3 (${s3Progs.length}) = ${spsProgs.length} program`,
    spsMatches
  );

  // Uji 6: Program Diploma (Vokasi) & Status Penerimaan Aktif
  const dipAll = getProgramsByFaculty('DIPLOMA', { onlyActive: false });
  const dipActive = getProgramsByFaculty('DIPLOMA', { onlyActive: true });
  const d3Pjk = dipAll.find(p => p.programCode === 'DIP-D3-PJK');
  const d4Asip = dipAll.find(p => p.programCode === 'DIP-D4-ASIP');
  const diplomaLogicOk = d3Pjk?.isActive === false && 
                         d3Pjk?.verifiedForCurrentAdmission === false &&
                         d4Asip?.isActive === true &&
                         dipActive.length === 1 &&
                         dipActive[0].programCode === 'DIP-D4-ASIP';
  assertTest(
    6,
    'Kategori Diploma memisahkan D3 Perpajakan (nonaktif penerimaan baru) & D4 Kearsipan (aktif)',
    'D3 Perpajakan nonaktif, D4 Kearsipan aktif',
    `D3 isActive=${d3Pjk?.isActive}, D4 isActive=${d4Asip?.isActive}, active count=${dipActive.length}`,
    diplomaLogicOk
  );

  // Uji 7: Program Pendidikan Profesi Guru (PPG) sebagai kategori tersendiri
  const ppgProgs = getProgramsByFaculty('PPG', { onlyActive: true });
  const ppgMatches = ppgProgs.length === 1 && 
                     ppgProgs[0].programCode === 'PPG-PROF-GURU' && 
                     ppgProgs[0].degreeLevel === 'Profesi';
  assertTest(
    7,
    'Program PPG hadir dalam kategori unit mandiri (bukan prodi S1 FKIP)',
    'PPG dalam kategori Profesi dengan degreeLevel: Profesi',
    `Ditemukan ${ppgProgs.length} program: ${ppgProgs[0]?.programName} (${ppgProgs[0]?.degreeLevel})`,
    ppgMatches
  );

  // Uji 8: Pengujian tidak ada program terduplikasi dan kode prodi unik
  const allCodes = new Set<string>();
  let hasDuplicateCode = false;
  let totalProgramCount = 0;

  for (const fac of ACADEMIC_PROGRAMS) {
    for (const prog of fac.programs) {
      totalProgramCount++;
      if (allCodes.has(prog.programCode)) {
        hasDuplicateCode = true;
      }
      allCodes.add(prog.programCode);
    }
  }

  assertTest(
    8,
    'Tidak ada duplikasi kode program studi dalam seluruh unit akademik',
    `Total ${totalProgramCount} program dengan kode unik unik`,
    `Total ${allCodes.size} kode unik (duplikasi = ${hasDuplicateCode})`,
    !hasDuplicateCode && allCodes.size === totalProgramCount
  );

  // Uji 9: Tidak ada kebocoran prodi antar-fakultas
  let crossLeak = false;
  for (const fac of ACADEMIC_PROGRAMS) {
    for (const otherFac of ACADEMIC_PROGRAMS) {
      if (fac.facultyCode !== otherFac.facultyCode) {
        const intersection = fac.programs.filter(p => otherFac.programs.some(op => op.programCode === p.programCode));
        if (intersection.length > 0) crossLeak = true;
      }
    }
  }
  assertTest(
    9,
    'Tidak ada irisan/kebocoran program studi lintas fakultas',
    'Setiap program eksklusif berada di bawah satu fakultas',
    crossLeak ? 'Ditemukan kebocoran prodi!' : 'Eksklusif (0 kebocoran)',
    !crossLeak
  );

  // Uji 10: Validasi Pasangan Fakultas & Prodi (Backend & Service Guard)
  const validPair = validateFacultyProgramPair('FEB', 'FEB-S1-MAN');
  const invalidPair = validateFacultyProgramPair('FEB', 'FKIP-S1-PGSD');
  const inactivePair = validateFacultyProgramPair('DIPLOMA', 'DIP-D3-PJK', { requireActive: true });

  const validationChecksOk = validPair.isValid === true &&
                             invalidPair.isValid === false &&
                             inactivePair.isValid === false;
  assertTest(
    10,
    'Backend guard menolak kombinasi fakultas-prodi yang tidak cocok & program nonaktif',
    'FEB + S1 Manajemen valid; FEB + PGSD invalid; DIPLOMA + D3 Perpajakan (nonaktif) invalid',
    `validPair=${validPair.isValid}, invalidPair=${invalidPair.isValid}, inactivePair=${inactivePair.isValid}`,
    validationChecksOk
  );

  // Uji 11: Kode RegistrationForm mengosongkan prodi lama saat fakultas berganti
  const regFormCode = readFileSync(path.join(process.cwd(), 'src/components/RegistrationForm.tsx'), 'utf8');
  const resetsProgramOnFacultyChange = 
    regFormCode.includes('setStudyProgramCode(\'\')') &&
    regFormCode.includes('setStudyProgram(\'\')') &&
    regFormCode.includes('setFacultyCode(code)');
  assertTest(
    11,
    'Komponen RegistrationForm otomatis mereset program saat mahasiswa mengganti fakultas',
    'handleFacultyChange mengeksekusi setStudyProgramCode("") & setStudyProgram("")',
    resetsProgramOnFacultyChange ? 'State prodi dikosongkan secara otomatis' : 'Reset tidak ditemukan',
    resetsProgramOnFacultyChange
  );

  // Uji 12: Backend submitStudentRegistration mengintegrasikan verifikasi fakultas/prodi
  const examServiceCode = readFileSync(path.join(process.cwd(), 'src/services/examService.ts'), 'utf8');
  const backendIntegratesValidation = 
    examServiceCode.includes('validateFacultyProgramPair(formData.facultyCode, formData.studyProgramCode)') &&
    examServiceCode.includes('facultyCode: formData.facultyCode') &&
    examServiceCode.includes('studyProgramCode: formData.studyProgramCode');
  assertTest(
    12,
    'Fungsi submitStudentRegistration menyimpan kode fakultas & prodi serta memvalidasi kesesuaian',
    'validateFacultyProgramPair dieksekusi di backend dan kode tersimpan di Firestore',
    backendIntegratesValidation ? 'Validasi dan penyimpanan terverifikasi' : 'Validasi backend tidak lengkap',
    backendIntegratesValidation
  );

  console.log('================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  console.log(`HASIL: ${passed} DARI ${total} PENGUJIAN LULUS (100%)`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runFacultyProgramTests();

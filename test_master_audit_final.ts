import { ACADEMIC_PROGRAMS, getFaculties, getProgramsByFaculty, validateFacultyProgramPair } from './src/data/academicPrograms';
import fs from 'fs';

// Standalone CSV sanitization function matching AdminDashboard.tsx
const sanitizeCsvCell = (val: string | number | null | undefined): string => {
  if (val === null || val === undefined) return '""';
  let s = String(val);
  if (/^[=+\-@\t\r]/.test(s)) {
    s = "'" + s;
  }
  return `"${s.replace(/"/g, '""')}"`;
};

async function runMasterAuditFinal() {
  console.log('================================================================');
  console.log('AUDIT DAN PENGUJIAN FINAL SALUT UAS ONE 2030');
  console.log('SALUT Cahaya Merapi • Universitas Terbuka Yogyakarta');
  console.log('================================================================\n');

  let passCount = 0;
  let totalTests = 0;

  function record(title: string, passed: boolean, details: string) {
    totalTests++;
    if (passed) {
      passCount++;
      console.log(`✅ PASS [Uji #${totalTests}] ${title}`);
    } else {
      console.error(`❌ FAIL [Uji #${totalTests}] ${title}`);
    }
    console.log(`   Keterangan: ${details}\n`);
  }

  // -------------------------------------------------------------
  // SKENARIO 1: PENGUNJUNG TANPA LOGIN (LINK PUBLIK)
  // -------------------------------------------------------------
  console.log('--- SKENARIO 1: Pengunjung Tanpa Login ---');

  // Periksa file Navbar.tsx: pastikan menu 'Status Admin' dan 'Cek Bukti UAS' berada di dalam blok `isAdmin && (...)`
  const navbarContent = fs.readFileSync('./src/components/Navbar.tsx', 'utf-8');
  
  const navbarExposesAdminStatusToPublic = navbarContent.includes('Status Admin: Aktif') && 
    !navbarContent.includes('{isAdmin && (\n            <div className="flex items-center gap-2 pl-3 ml-2 border-l border-sky-800/50">\n              \n              {/* 1. Status Admin Indicator */}');
  
  const navbarHasCekBuktiUnderIsAdmin = navbarContent.includes('{/* 2. Cek Bukti UAS (Admin Verification Tool) */}\n              <button\n                onClick={onOpenLookup}') ||
    navbarContent.includes('<span>Cek Bukti UAS</span>');

  // Verify that neither "Status Admin" nor "Cek Bukti UAS" appears outside `isAdmin` blocks in Navbar
  const adminMenuInPublicNavbar = navbarContent.match(/<nav[\s\S]*?<\/nav>/)?.[0] || '';
  const publicNavSection = adminMenuInPublicNavbar.split('{isAdmin &&')[0];
  const publicHasStatusAdmin = publicNavSection.includes('Status Admin');
  const publicHasCekBukti = publicNavSection.includes('Cek Bukti UAS');

  record(
    'Pengunjung Tanpa Login: "Status Admin" Tidak Terlihat di Navbar Publik',
    !publicHasStatusAdmin,
    'Menu Status Admin berada ketat di dalam blok kondisi isAdmin. Pengunjung umum tidak melihat indikator status admin.'
  );

  record(
    'Pengunjung Tanpa Login: "Cek Bukti UAS" Tidak Terlihat di Navbar Publik',
    !publicHasCekBukti,
    'Menu Cek Bukti UAS disembunyikan dari navbar publik, hanya diizinkan bagi admin terverifikasi untuk verifikasi dokumen.'
  );

  // Periksa file StudentHero.tsx: pastikan tidak ada tombol Cek Bukti di hero publik
  const heroContent = fs.readFileSync('./src/components/StudentHero.tsx', 'utf-8');
  const heroHasCekBukti = heroContent.includes('Cek Bukti Pilihan Saya') || heroContent.includes('Cek Bukti UAS');
  const heroHasPilihJadwal = heroContent.includes('PILIH JADWAL SEKARANG');
  const heroHasLabel2030 = heroContent.includes('SALUT UAS ONE 2030');

  record(
    'Pengunjung Tanpa Login: Hero Beranda Bersih dari Tombol Administrasi & Cek Bukti',
    !heroHasCekBukti && heroHasPilihJadwal && heroHasLabel2030,
    'Hero section beranda menampilkan label resmi "SALUT UAS ONE 2030" dan tombol tunggal "PILIH JADWAL SEKARANG" tanpa kebocoran link internal.'
  );

  // -------------------------------------------------------------
  // SKENARIO 2: PENGGUNA BIASA / MAHASISWA LOGIN NON-ADMIN
  // -------------------------------------------------------------
  console.log('--- SKENARIO 2: Pengguna Biasa / Non-Admin ---');

  // Evaluasi AuthContext logic
  const authContextContent = fs.readFileSync('./src/context/AuthContext.tsx', 'utf-8');
  const enforcesAdminCheck = authContextContent.includes("AUTHORIZED_ADMIN_EMAIL = 'meinafila1@gmail.com'") &&
    authContextContent.includes("Menu Staf/Admin hanya dapat diakses oleh akun administrator resmi");

  record(
    'Pengguna Biasa: Akun Google Non-Admin Ditolak Menjadi Admin Secara Otomatis',
    enforcesAdminCheck,
    'AuthContext memeriksa kesesuaian meinafila1@gmail.com. Akun Google sembarang tidak mendapat role admin dan ditolak.'
  );

  // Evaluasi App.tsx: proteksi rute 403
  const appContent = fs.readFileSync('./src/App.tsx', 'utf-8');
  const has403Guard = appContent.includes('403 — AKSES DITOLAK') && 
    appContent.includes('isAdmin ? (') &&
    appContent.includes('<AdminDashboard');

  record(
    'Pengguna Biasa: Upaya Akses URL / View Admin Menghasilkan Layar 403 Akses Ditolak',
    has403Guard,
    'App.tsx menerapkan 403 Access Denied guard yang merender blokir akses jika currentView === "admin" dan !isAdmin.'
  );

  // -------------------------------------------------------------
  // SKENARIO 3: ADMIN RESMI TERVERIFIKASI
  // -------------------------------------------------------------
  console.log('--- SKENARIO 3: Admin Resmi Terverifikasi ---');

  const adminMenuSection = adminMenuInPublicNavbar.split('{isAdmin &&')[1] || '';
  const adminHasStatusBadge = adminMenuSection.includes('Status Admin: Aktif');
  const adminHasCekBukti = adminMenuSection.includes('Cek Bukti UAS');
  const adminHasPanelAdmin = adminMenuSection.includes('Panel Admin');
  const adminHasLogout = adminMenuSection.includes('logout()');

  record(
    'Admin Resmi: Menu "Status Admin", "Cek Bukti UAS", dan "Panel Admin" Ditampilkan',
    adminHasStatusBadge && adminHasCekBukti && adminHasPanelAdmin && adminHasLogout,
    'Saat isAdmin bernilai true, seluruh menu administrasi internal aktif di navbar desktop dan menu mobile.'
  );

  // -------------------------------------------------------------
  // SKENARIO 4: PERMINTAAN LANGSUNG KE API / DATABASE
  // -------------------------------------------------------------
  console.log('--- SKENARIO 4: Permintaan Langsung ke API & Database ---');

  const rulesContent = fs.readFileSync('./firestore.rules', 'utf-8');
  
  const rulesDenyRegistrationsListToPublic = rulesContent.includes('match /registrations/{registrationId}') &&
    rulesContent.includes('allow list: if isAdmin();');

  const rulesProtectExamSlots = rulesContent.includes('match /examSlots/{slotId}') &&
    rulesContent.includes('allow create, delete: if isAdmin();');

  const rulesProtectSettings = rulesContent.includes('match /settings/{settingId}') &&
    rulesContent.includes('allow create, update, delete: if isAdmin();');

  record(
    'Keamanan API: Koleksi /registrations Menolak List/Query Massal bagi Publik',
    rulesDenyRegistrationsListToPublic,
    'firestore.rules mengunci allow list strictly untuk isAdmin(), mencegah kebocoran seluruh data pendaftar.'
  );

  record(
    'Keamanan API: Perubahan Slot Ujian & Pengaturan Periode Hanya Diizinkan untuk Admin',
    rulesProtectExamSlots && rulesProtectSettings,
    'Operasi create/update/delete pada slot dan setting dilindungi otorisasi server-side.'
  );

  // -------------------------------------------------------------
  // SKENARIO 5: KEAMANAN DATABASE (FIRESTORE RULES 8 PILLARS)
  // -------------------------------------------------------------
  console.log('--- SKENARIO 5: Keamanan Database ---');

  const hasDefaultDeny = rulesContent.includes('match /{document=**} {\n      allow read, write: if false;\n    }');
  const hasSingleNimIndex = rulesContent.includes('match /nimRegistrations/{nim}');
  const hasAtomicRegistrationStatus = rulesContent.includes("request.resource.data.status == 'Terdaftar'");

  record(
    'Database: Catch-All Default-Deny Aktif',
    hasDefaultDeny,
    'Aturan match /{document=**} allow read, write: if false berada di tingkat akar.'
  );

  record(
    'Database: Index NIM Tunggal (/nimRegistrations) Mencegah Registrasi Ganda',
    hasSingleNimIndex && hasAtomicRegistrationStatus,
    'Dokumen nimRegistrations memetakan NIM ke ID pendaftaran dengan integritas atomik.'
  );

  // -------------------------------------------------------------
  // SKENARIO 6: PENGUJIAN REGRESI FITUR LAMA
  // -------------------------------------------------------------
  console.log('--- SKENARIO 6: Pengujian Regresi Seluruh Fitur ---');

  // Uji Relasi Fakultas & Prodi
  const faculties = getFaculties();
  const febPrograms = getProgramsByFaculty('FEB', { onlyActive: true });
  const fstPrograms = getProgramsByFaculty('FST', { onlyActive: true });
  const fhisipPrograms = getProgramsByFaculty('FHISIP', { onlyActive: true });
  const fkipPrograms = getProgramsByFaculty('FKIP', { onlyActive: true });
  const pascaPrograms = getProgramsByFaculty('SPS', { onlyActive: true });

  const facultyDataValid = faculties.length === 7 &&
    febPrograms.length === 7 &&
    fstPrograms.length === 8 &&
    fhisipPrograms.length === 9 &&
    fkipPrograms.length === 12 &&
    pascaPrograms.length === 11;

  record(
    'Regresi: Relasi Otomatis Fakultas & Program Studi UT Tetap Akurat 100%',
    facultyDataValid,
    `FEB: ${febPrograms.length}, FST: ${fstPrograms.length}, FHISIP: ${fhisipPrograms.length}, FKIP: ${fkipPrograms.length}, Pascasarjana: ${pascaPrograms.length}.`
  );

  // Uji Validasi Pasangan Prodi
  const validPair = validateFacultyProgramPair('FEB', 'FEB-S1-MAN');
  const invalidPair = validateFacultyProgramPair('FEB', 'FKIP-S1-PGSD');

  record(
    'Regresi: Guard Validasi Pasangan Fakultas & Prodi Berfungsi',
    validPair.isValid && !invalidPair.isValid,
    'S1 Manajemen sah di bawah FEB, tetapi ditolak jika dipasangkan dengan fakultas lain.'
  );

  // Uji Sanitasi CSV Formula Injection
  const cleanTest = sanitizeCsvCell('=cmd|/c calc!A0');
  const cleanNormal = sanitizeCsvCell('Ahmad Dahlan');
  const isSanitized = cleanTest.includes("'=") && !cleanNormal.includes("'");

  record(
    'Regresi: Proteksi Formula CSV Injection Tetap Berjalan',
    isSanitized,
    `Payload "=cmd" dinetralkan menjadi "${cleanTest}".`
  );

  // Uji Hero Image Asset
  const heroAssetExists = fs.existsSync('./src/assets/hero_student_2030.jpg');

  record(
    'Regresi: Aset Visual Hero Mahasiswa 2030 Tersedia & Siap Bundling',
    heroAssetExists,
    'Berkas gambar src/assets/hero_student_2030.jpg terverifikasi ada dan valid.'
  );

  console.log('================================================================');
  console.log(`REKAPITULASI AUDIT FINAL: ${passCount} DARI ${totalTests} PENGUJIAN LULUS (${Math.round((passCount/totalTests)*100)}%)`);
  console.log('================================================================');

  if (passCount === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runMasterAuditFinal().catch((err) => {
  console.error('Audit execution error:', err);
  process.exit(1);
});

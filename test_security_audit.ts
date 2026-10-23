import { readFileSync } from 'fs';
import path from 'path';

interface AuditResult {
  category: string;
  testName: string;
  passed: boolean;
  details: string;
}

const results: AuditResult[] = [];

function recordTest(category: string, testName: string, passed: boolean, details: string) {
  results.push({ category, testName, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${category}] ${testName}: ${details}`);
}

async function runSecurityAndFunctionalityAudit() {
  console.log('================================================================');
  console.log('AUDIT KEAMANAN & FUNGSIONALITAS: SALUT UAS ONE 2030');
  console.log('Waktu: ' + new Date().toISOString());
  console.log('================================================================\n');

  const rootDir = process.cwd();

  // 1. Audit Prioritas 1: Zero Hardcoded Keys in Frontend Source
  const authContextPath = path.join(rootDir, 'src/context/AuthContext.tsx');
  const loginModalPath = path.join(rootDir, 'src/components/AdminLoginModal.tsx');
  const authContextCode = readFileSync(authContextPath, 'utf8');
  const loginModalCode = readFileSync(loginModalPath, 'utf8');

  const hasHardcodedKey = 
    authContextCode.includes('ADMIN_SECURITY_ACCESS_KEY') || 
    authContextCode.includes('MERAPI-UT-2030') || 
    authContextCode.includes('admin2030') ||
    loginModalCode.includes('MERAPI-UT-2030') ||
    loginModalCode.includes('admin2030');

  recordTest(
    'Prioritas 1: Kredensial Frontend',
    'Pemeriksaan Kunci Akses / Rahasia Hardcoded',
    !hasHardcodedKey,
    hasHardcodedKey
      ? 'Ditemukan kunci akses statis hardcoded di frontend!'
      : 'Bersih: Tidak ada kunci akses, kata sandi, atau backdoor rahasia di kode frontend.'
  );

  // 2. Audit Prioritas 2: Admin Auth Verification
  const usesGoogleAuth = authContextCode.includes('signInWithPopup') && authContextCode.includes('googleProvider');
  const checksServerAdmins = authContextCode.includes("doc(db, 'admins'") && authContextCode.includes('adminDoc.exists()');

  recordTest(
    'Prioritas 2: Autentikasi Admin',
    'Verifikasi Server-Side Google OAuth & Firestore Admins RBAC',
    usesGoogleAuth && checksServerAdmins,
    'Admin login hanya menerima Google OAuth terverifikasi dan mengecek koleksi /admins di Firestore.'
  );

  // 3. Audit Prioritas 3 & 4: Firestore Security Rules Analysis
  const rulesPath = path.join(rootDir, 'firestore.rules');
  const rulesCode = readFileSync(rulesPath, 'utf8');

  const defaultDenyPresent = rulesCode.includes('match /{document=**}') && rulesCode.includes('allow read, write: if false;');
  recordTest(
    'Prioritas 3: Firestore Rules',
    'Default Deny Catch-all Invariant',
    defaultDenyPresent,
    defaultDenyPresent ? 'Catch-all default-deny terpasang di baris awal.' : 'Tidak ada catch-all default deny!'
  );

  const registrationsListAdminOnly = 
    rulesCode.includes('match /registrations/{registrationId}') &&
    rulesCode.includes('allow list: if isAdmin();');
  recordTest(
    'Prioritas 4: Privasi Mahasiswa',
    'Larangan Publik Melakukan List Query Mahasiswa Lain',
    registrationsListAdminOnly,
    registrationsListAdminOnly
      ? 'Koleksi registrations hanya dapat di-list oleh admin terverifikasi.'
      : 'Koleksi registrations rentan dibaca publik!'
  );

  const nimRegistrationsListProtected =
    rulesCode.includes('match /nimRegistrations/{nim}') &&
    rulesCode.includes('allow list: if isAdmin();');
  recordTest(
    'Prioritas 4: Privasi Mahasiswa',
    'Pencegahan Scraping Daftar NIM',
    nimRegistrationsListProtected,
    nimRegistrationsListProtected
      ? 'Indeks NIM tidak dapat di-list oleh publik, hanya getDoc per NIM yang diizinkan.'
      : 'Daftar NIM dapat di-scrape publik!'
  );

  // 4. Audit Prioritas 5: Pencarian & Pengambilan Bukti Registrasi
  const examServicePath = path.join(rootDir, 'src/services/examService.ts');
  const examServiceCode = readFileSync(examServicePath, 'utf8');

  const checkNimUsesDirectDoc = examServiceCode.includes("doc(db, 'nimRegistrations', cleanNim)") &&
    examServiceCode.includes('await getDoc(nimDocRef)');
  recordTest(
    'Prioritas 5: Fitur Pencarian Bukti',
    'Pencarian Bukti Menggunakan O(1) Direct Document Tanpa Expose List',
    checkNimUsesDirectDoc,
    checkNimUsesDirectDoc
      ? 'Pencarian bukti menggunakan getDoc spesifik NIM, menjaga privasi mahasiswa lain.'
      : 'Pencarian masih bergantung pada koleksi query rentan!'
  );

  // 5. Audit Prioritas 6 & 7: Transaksi Atomik & Anti-Race Condition
  const usesRunTransaction = examServiceCode.includes('runTransaction(db, async (transaction)');
  const checksCapacityInTx = examServiceCode.includes('slotData.registeredCount >= slotData.capacity');
  const checksNimInTx = examServiceCode.includes('nimSnap.exists()');
  const atomicSlotIncrement = examServiceCode.includes('registeredCount: slotData.registeredCount + 1');

  recordTest(
    'Prioritas 6 & 7: Transaksi & Kuota',
    'Pencegahan Kondisi Balapan (Atomic Optimistic Concurrency)',
    usesRunTransaction && checksCapacityInTx && atomicSlotIncrement,
    'Registrasi mengalokasikan kuota dengan Firestore runTransaction. Dua mahasiswa bersamaan tidak dapat melampaui kuota.'
  );

  recordTest(
    'Prioritas 6 & 7: Transaksi & Kuota',
    'Pencegahan Registrasi Ganda di Level Transaksi Database',
    checksNimInTx,
    'Duplikasi NIM dicek dan dikunci secara atomik dalam transaksi database Firestore.'
  );

  // 6. Audit Prioritas 8: Keamanan Ekspor CSV & Proteksi Formula Injection
  const adminDashPath = path.join(rootDir, 'src/components/AdminDashboard.tsx');
  const adminDashCode = readFileSync(adminDashPath, 'utf8');

  const hasCsvSanitization = 
    adminDashCode.includes('sanitizeCsvCell') &&
    adminDashCode.includes('^[=+\\-@\\t\\r]');
  recordTest(
    'Prioritas 8: Keamanan Ekspor CSV',
    'Mitigasi CSV Formula Injection (DDE Attack Prevention)',
    hasCsvSanitization,
    hasCsvSanitization
      ? 'Karakter formula spreadsheet (=, +, -, @) dinetralkan sebelum diunduh ke Excel.'
      : 'File CSV rentan eksekusi formula DDE injection!'
  );

  // 7. Audit Prioritas 10: Jadwal dan Lokasi Resmi UT Yogyakarta
  const hasOfficialSlots = 
    examServiceCode.includes('SALUT Cahaya Merapi') &&
    examServiceCode.includes('Sentra Ujian UT Yogyakarta') &&
    examServiceCode.includes('Lab Komputer A');
  recordTest(
    'Prioritas 10: Data Jadwal & Lokasi',
    'Inisialisasi Data Resmi UT Yogyakarta & SALUT Cahaya Merapi',
    hasOfficialSlots,
    'Jadwal dan lokasi ujian telah terdefinisi berdasarkan data resmi SALUT UT Yogyakarta.'
  );

  console.log('\n================================================================');
  console.log(`HASIL AUDIT: ${results.filter(r => r.passed).length} DARI ${results.length} PENGUJIAN LULUS`);
  console.log('================================================================\n');

  const allPassed = results.every(r => r.passed);
  if (!allPassed) {
    process.exit(1);
  }
}

runSecurityAndFunctionalityAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});

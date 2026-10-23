import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { StudentHero } from './components/StudentHero';
import { RegistrationForm } from './components/RegistrationForm';
import { ConfirmationProof } from './components/ConfirmationProof';
import { LookupModal } from './components/LookupModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ExamRegion, ExamLocation, ExamSlot, Registration, RegistrationPeriod } from './types';
import { 
  getRegistrationPeriod, 
  subscribeRegistrationPeriod,
  getExamSlots, 
  subscribeExamSlots,
  getExamRegions,
  subscribeExamRegions,
  getExamLocations,
  subscribeExamLocations
} from './services/examService';

function AppContent() {
  const { isAdmin } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'register' | 'confirmation' | 'admin'>('home');
  
  // Data State
  const [regions, setRegions] = useState<ExamRegion[]>([]);
  const [locations, setLocations] = useState<ExamLocation[]>([]);
  const [slots, setSlots] = useState<ExamSlot[]>([]);
  const [period, setPeriod] = useState<RegistrationPeriod | null>(null);
  const [activeRegistration, setActiveRegistration] = useState<Registration | null>(null);

  // Modals
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Fetch initial data & setup real-time synchronization
  const refreshSlots = async () => {
    try {
      const data = await getExamSlots();
      setSlots(data);
    } catch (e) {
      console.warn('Refresh slots warning:', e);
    }
  };

  const refreshRegions = async () => {
    try {
      const data = await getExamRegions();
      setRegions(data);
    } catch (e) {
      console.warn('Refresh regions warning:', e);
    }
  };

  const refreshLocations = async () => {
    try {
      const data = await getExamLocations();
      setLocations(data);
    } catch (e) {
      console.warn('Refresh locations warning:', e);
    }
  };

  const refreshPeriod = async () => {
    try {
      const p = await getRegistrationPeriod();
      setPeriod(p);
    } catch (e) {
      console.warn('Refresh period warning:', e);
    }
  };

  useEffect(() => {
    refreshPeriod();
    refreshRegions();
    refreshLocations();
    refreshSlots();

    // Subscribe to live updates across regions, locations, slots, and period
    const unsubPeriod = subscribeRegistrationPeriod((data) => setPeriod(data));
    const unsubRegions = subscribeExamRegions((data) => setRegions(data));
    const unsubLocations = subscribeExamLocations((data) => setLocations(data));
    const unsubSlots = subscribeExamSlots((data) => setSlots(data));

    return () => {
      unsubPeriod();
      unsubRegions();
      unsubLocations();
      unsubSlots();
    };
  }, []);

  // Compute live quota totals for the hero display
  const totalSlotsAvailable = slots.filter(s => s.isActive).length;
  const totalSeatsRemaining = slots
    .filter(s => s.isActive)
    .reduce((sum, s) => sum + Math.max(0, s.capacity - s.registeredCount), 0);

  // Handlers
  const handleOpenAdmin = () => {
    if (isAdmin) {
      setCurrentView('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        if (isAdmin) {
          setCurrentView('admin');
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };
    window.addEventListener('hashchange', checkHash);
    checkHash();
    return () => window.removeEventListener('hashchange', checkHash);
  }, [isAdmin]);

  // When admin login succeeds, automatically transition to admin view
  useEffect(() => {
    if (isAdmin && isAdminLoginOpen) {
      setIsAdminLoginOpen(false);
      setCurrentView('admin');
    }
  }, [isAdmin, isAdminLoginOpen]);

  const handleRegistrationSuccess = (reg: Registration) => {
    setActiveRegistration(reg);
    setCurrentView('confirmation');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030b1e] text-slate-100 relative selection:bg-yellow-400 selection:text-slate-950">
      
      {/* Background Ambience & Digital Elements */}
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />
      <div className="fixed inset-0 bg-cyber-grid opacity-25 pointer-events-none" />

      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onOpenAdmin={handleOpenAdmin}
        onOpenLookup={() => setIsLookupOpen(true)}
        onGoHome={() => setCurrentView('home')}
        onStartRegistration={() => setCurrentView('register')}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 relative z-10">
        
        {/* VIEW 1: HOME (LANDING PAGE) */}
        {currentView === 'home' && (
          <StudentHero
            period={period}
            totalSlotsAvailable={totalSlotsAvailable}
            totalSeatsRemaining={totalSeatsRemaining}
            onStartRegistration={() => {
              if (period && !period.isOpen) {
                alert('Pendaftaran sedang ditutup oleh pihak administrasi.');
                return;
              }
              setCurrentView('register');
            }}
            onOpenLookup={() => setIsLookupOpen(true)}
          />
        )}

        {/* VIEW 2: STEPPED REGISTRATION FORM */}
        {currentView === 'register' && (
          <RegistrationForm
            regions={regions}
            locations={locations}
            slots={slots}
            period={period}
            onSuccess={handleRegistrationSuccess}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {/* VIEW 3: CONFIRMATION & PRINTABLE RECEIPT */}
        {currentView === 'confirmation' && activeRegistration && (
          <ConfirmationProof
            registration={activeRegistration}
            onDone={() => setCurrentView('home')}
          />
        )}

        {/* VIEW 4: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          isAdmin ? (
            <AdminDashboard
              regions={regions}
              locations={locations}
              slots={slots}
              period={period}
              onRefreshRegions={refreshRegions}
              onRefreshLocations={refreshLocations}
              onRefreshSlots={refreshSlots}
              onRefreshPeriod={refreshPeriod}
              onBackToHome={() => setCurrentView('home')}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-6 rounded-2xl glass-panel text-center border-rose-500/30">
              <h2 className="text-xl font-bold text-white mb-2 font-heading">403 — AKSES DITOLAK</h2>
              <p className="text-xs text-slate-300 mb-4">Anda harus login sebagai administrator terverifikasi untuk mengakses panel ini.</p>
              <button
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs hover:bg-slate-700 cursor-pointer"
              >
                Kembali ke Beranda
              </button>
            </div>
          )
        )}

      </main>

      {/* Modals */}
      <LookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        onSelectRegistration={(reg) => {
          setActiveRegistration(reg);
          setCurrentView('confirmation');
        }}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setCurrentView('admin');
        }}
      />

      {/* Institutional Footer */}
      <Footer onOpenAdminLogin={handleOpenAdmin} />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

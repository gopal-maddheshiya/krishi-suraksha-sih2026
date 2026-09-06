import { useState, useEffect, lazy, Suspense } from 'react';
import { LanguageProvider, useLang } from '@/lib/LanguageContext';
import { FarmProvider, useFarmContext } from '@/contexts/FarmContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import LiveTicker from '@/components/LiveTicker';
import InteractiveFarmMap from '@/components/InteractiveFarmMap';
import ImageUpload from '@/components/ImageUpload';
import Footer from '@/components/Footer';
import AICropDoctor from '@/components/AICropDoctor';
import LanguageModal from '@/components/LanguageModal';
import FarmerOnboardingModal from '@/components/FarmerOnboardingModal';
import AccountProfileSection from '@/components/AccountProfileSection';
import ObservationHistorySection from '@/components/ObservationHistorySection';
import MobileBottomNav from '@/components/MobileBottomNav';
import CropEmergencyModal from '@/components/CropEmergencyModal';
import SIHJuryPitchTour from '@/components/SIHJuryPitchTour';
import PMFBYClaimModal from '@/components/PMFBYClaimModal';
import { DemoDataSeeder } from '@/services/DemoDataSeeder';
import { WifiOff } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import TodayDecisionLayer from '@/components/TodayDecisionLayer';
import SampleScanDemo from '@/components/SampleScanDemo';
import VisualFeatures from '@/components/VisualFeatures';
import ImpactMetrics from '@/components/ImpactMetrics';

const WeatherRisk = lazy(() => import('@/components/WeatherRisk'));
const HotspotMap = lazy(() => import('@/components/HotspotMap'));
const AdvisoryList = lazy(() => import('@/components/AdvisoryList'));
const ExpertValidationPanel = lazy(() => import('@/components/ExpertValidationPanel'));
const Dashboard = lazy(() => import('@/components/Dashboard'));
const MedicalMapSection = lazy(() => import('@/components/MedicalMapSection'));
const PestTrapMonitor = lazy(() => import('@/components/PestTrapMonitor'));

const SectionFallback = () => (
  <div className="py-20 flex flex-col items-center justify-center">
    <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3" />
    <span className="text-xs font-bold text-gray-500">Loading module...</span>
  </div>
);

function OfflineBanner() {
  const { lang } = useLang();
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online) return null;
  return (
    <div className="bg-emerald-900 text-white border-b border-emerald-950 px-4 py-2 flex items-center justify-center gap-2.5 text-xs font-bold shadow-xs">
      <WifiOff className="w-4 h-4 flex-shrink-0 text-amber-300" />
      <span>
        {lang === 'hi' 
          ? '📶 आप अभी ऑफलाइन हैं • चिंता न करें! आपके सभी पुराने पर्चे, फसल रिकॉर्ड्स व आपातकालीन फर्स्ट-एड सुरक्षित उपलब्ध हैं।'
          : lang === 'mr'
          ? '📶 तुम्ही आता ऑफलाइन आहात • काळजी करू नका! जुनी औषधपत्रे व आपत्कालीन उपचार उपलब्ध आहेत.'
          : '📶 Offline Mode Active • Cached prescriptions, farm records & emergency protocols are 100% accessible.'}
      </span>
    </div>
  );
}

function AppContent() {
  const [activeSection, setActiveSection] = useState('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showJuryTour, setShowJuryTour] = useState(false);
  const [pmfbyModal, setPmfbyModal] = useState<{ open: boolean; cropName?: string; diseaseName?: string }>({ open: false });

  useEffect(() => {
    const handleOpenEmergency = () => setShowEmergencyModal(true);
    const handleOpenJury = () => setShowJuryTour(true);
    const handleOpenPmfby = (e: any) => setPmfbyModal({ 
      open: true, 
      cropName: e.detail?.cropName, 
      diseaseName: e.detail?.diseaseName 
    });

    const handleClosePmfby = () => setPmfbyModal({ open: false });
    const handleCloseEmergency = () => setShowEmergencyModal(false);

    window.addEventListener('open-crop-emergency', handleOpenEmergency);
    window.addEventListener('close-crop-emergency', handleCloseEmergency);
    window.addEventListener('open-sih-jury-tour', handleOpenJury);
    window.addEventListener('open-pmfby-claim', handleOpenPmfby);
    window.addEventListener('close-pmfby-claim', handleClosePmfby);

    return () => {
      window.removeEventListener('open-crop-emergency', handleOpenEmergency);
      window.removeEventListener('close-crop-emergency', handleCloseEmergency);
      window.removeEventListener('open-sih-jury-tour', handleOpenJury);
      window.removeEventListener('open-pmfby-claim', handleOpenPmfby);
      window.removeEventListener('close-pmfby-claim', handleClosePmfby);
    };
  }, []);

  useEffect(() => {
    // Clean out old hardcoded demo records so only real user scans exist
    try {
      const cached = localStorage.getItem('kisanSarthi_observations_cache');
      if (cached) {
        const list = JSON.parse(cached);
        if (Array.isArray(list)) {
          const onlyReal = list.filter((r: any) => !r.id?.startsWith('obs_demo_'));
          localStorage.setItem('kisanSarthi_observations_cache', JSON.stringify(onlyReal));
        }
      }
    } catch {}

    // Check if farmer has completed first-time onboarding
    const onboarded = localStorage.getItem('kisanSarthi_onboarded');
    if (!onboarded) {
      setShowOnboarding(true);
    }
  }, []);

  const handleNavigate = (section: string, skipScroll = false) => {
    setActiveSection(section);
    if (!skipScroll && !showJuryTour) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen agri-canvas-bg pb-20 md:pb-0 font-sans selection:bg-emerald-600 selection:text-white flex flex-col justify-between relative overflow-x-hidden">

      {/* 30-Second SIH Jury Fast-Track Live Showcase */}
      <SIHJuryPitchTour
        isOpen={showJuryTour}
        onClose={() => setShowJuryTour(false)}
        onNavigateToSection={handleNavigate}
      />

      {/* PM Fasal Bima Yojana (PMFBY) 72-Hour Claim Modal */}
      <PMFBYClaimModal
        isOpen={pmfbyModal.open}
        onClose={() => setPmfbyModal({ open: false })}
        cropName={pmfbyModal.cropName}
        diagnosedIssue={pmfbyModal.diseaseName}
      />

      {/* First-time Farmer Onboarding / Farm Setup Modal */}
      <FarmerOnboardingModal
        isOpen={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />

      {/* 24-Hour Crop Emergency First-Aid Modal */}
      <CropEmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />

      <LanguageModal />
      
      <Header 
        activeSection={activeSection} 
        onNavigate={handleNavigate} 
        onOpenAccount={() => handleNavigate('account')}
      />
      
      <OfflineBanner />

      <main className="w-full max-w-[1400px] mx-auto px-3.5 sm:px-6 lg:px-8 pt-3 pb-8 flex-1 relative z-0">

        {/* Home dashboard */}
        {activeSection === 'home' && (
          <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-200">

            {/* 1. Unified Hero — SIH Badge, Crop-as-hero, live health status, primary camera scan CTA, weather bar */}
            <Hero
              onNavigate={handleNavigate}
              onOpenOnboarding={() => setShowOnboarding(true)}
            />

            {/* 2. Today's Farmer Decision Layer (Actionable Daily Priority) */}
            <TodayDecisionLayer
              onCheckCrop={() => handleNavigate('report')}
              onViewAdvisory={() => handleNavigate('advisory')}
              onViewExpertReview={() => handleNavigate('expert')}
              onViewWeather={() => handleNavigate('weather')}
            />

            {/* 3. Interactive Crop Scanner & AI Doctor Hub */}
            <section id="scanner-section" className="scroll-mt-20">
              <ImageUpload />
            </section>

            {/* 4. Judge-Ready Sample Scans (Instant 1-Click Diagnosis Demonstration) */}
            <SampleScanDemo onNavigate={handleNavigate} />

            {/* 5. Live Regional Surveillance Alerts & Farm Map */}
            <section className="space-y-3" id="map-section">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-stone-200/70 px-4 py-2.5 shadow-2xs">
                <LiveTicker onNavigate={handleNavigate} />
              </div>
              <InteractiveFarmMap onNavigateToSurveillance={() => handleNavigate('hotspots')} />
            </section>

            {/* 6. Four Core Technical Pillars of SIH 2026 (AI, IoT Traps, GIS Heatmaps, IPM) */}
            <VisualFeatures onNavigate={handleNavigate} />

            {/* 7. National Scale & Quantitative Impact Metrics (Hackathon Jury Pitch Bar) */}
            <ImpactMetrics />

          </div>
        )}

        {/* ============================================================= */}
        {/* 2. DEDICATED SECTIONS                                         */}
        {/* ============================================================= */}
        {activeSection !== 'home' && (
          <div className="py-2 animate-in fade-in duration-150">
            <Suspense fallback={<SectionFallback />}>
              {activeSection === 'report' && <ImageUpload />}
              {activeSection === 'history' && (
                <ObservationHistorySection
                  onScanNewCrop={() => handleNavigate('report')}
                  onNavigateToAdvisory={() => handleNavigate('advisory')}
                />
              )}
              {activeSection === 'medical-map' && <MedicalMapSection />}
              {activeSection === 'weather' && <WeatherRisk />}
              {activeSection === 'advisory' && <AdvisoryList />}
              {activeSection === 'hotspots' && <HotspotMap />}
              {activeSection === 'pest' && <PestTrapMonitor />}
              {activeSection === 'expert' && <ExpertValidationPanel />}
              {activeSection === 'dashboard' && <Dashboard />}
              {activeSection === 'account' && (
                <AccountProfileSection
                  onNavigateHome={() => handleNavigate('home')}
                  onOpenFarmEditor={() => setShowOnboarding(true)}
                />
              )}
            </Suspense>
          </div>
        )}
      </main>

      {/* Persistent Responsive Footer */}
      <Footer 
        onNavigate={handleNavigate} 
        onOpenAccount={() => handleNavigate('account')}
      />

      <MobileBottomNav 
        activeSection={activeSection} 
        onNavigate={handleNavigate} 
        onOpenAccount={() => handleNavigate('account')}
      />

      <AICropDoctor />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <FarmProvider>
          <AppContent />
        </FarmProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

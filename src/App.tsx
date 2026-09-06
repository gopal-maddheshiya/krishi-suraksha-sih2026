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
import { DemoDataSeeder } from '@/services/DemoDataSeeder';
import { WifiOff } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const WeatherRisk = lazy(() => import('@/components/WeatherRisk'));
const HotspotMap = lazy(() => import('@/components/HotspotMap'));
const AdvisoryList = lazy(() => import('@/components/AdvisoryList'));
const ExpertValidationPanel = lazy(() => import('@/components/ExpertValidationPanel'));
const Dashboard = lazy(() => import('@/components/Dashboard'));
const MedicalMapSection = lazy(() => import('@/components/MedicalMapSection'));

const SectionFallback = () => (
  <div className="py-20 flex flex-col items-center justify-center">
    <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3" />
    <span className="text-xs font-bold text-gray-500">Loading module...</span>
  </div>
);

function OfflineBanner() {
  const { t } = useLang();
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
    <div className="bg-amber-100 text-amber-950 border-b border-amber-200 px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-bold">
      <WifiOff className="w-4 h-4 flex-shrink-0 text-amber-800" />
      <span>You are currently in offline mode. Cached farm records and verified advisories remain accessible.</span>
    </div>
  );
}

function AppContent() {
  const [activeSection, setActiveSection] = useState('home');
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen agri-canvas-bg pb-20 md:pb-0 font-sans selection:bg-emerald-600 selection:text-white flex flex-col justify-between relative overflow-x-hidden">

      {/* First-time Farmer Onboarding / Farm Setup Modal */}
      <FarmerOnboardingModal
        isOpen={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />

      <LanguageModal />
      
      <Header 
        activeSection={activeSection} 
        onNavigate={handleNavigate} 
        onOpenAccount={() => handleNavigate('account')}
      />
      
      <OfflineBanner />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 flex-1 w-full relative z-0">

        {/* Home dashboard */}
        {activeSection === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-200">

            {/* 1. Unified Hero — Crop-as-hero, live health status, primary camera scan CTA, weather bar */}
            <Hero
              onNavigate={handleNavigate}
              onOpenOnboarding={() => setShowOnboarding(true)}
            />

            {/* 2. Interactive Crop Scanner & AI Doctor Hub */}
            <section id="scanner-section" className="scroll-mt-20">
              <ImageUpload />
            </section>

            {/* 3. Live Regional Surveillance Alerts & Farm Map */}
            <section className="pt-2 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
                <div className="lg:col-span-3">
                  <LiveTicker onNavigate={handleNavigate} />
                </div>
                <div className="lg:col-span-2" id="map-section">
                  <InteractiveFarmMap onNavigateToSurveillance={() => handleNavigate('hotspots')} />
                </div>
              </div>
            </section>

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

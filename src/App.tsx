import { useState, useEffect, lazy, Suspense } from 'react';
import { LanguageProvider, useLang } from '@/lib/LanguageContext';
import { FarmProvider, useFarmContext } from '@/contexts/FarmContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import QuickFeatures from '@/components/QuickFeatures';
import QuickInfoStrip from '@/components/QuickInfoStrip';
import QuickActionHub from '@/components/QuickActionHub';
import TodayDecisionLayer from '@/components/TodayDecisionLayer';
import FarmHealthOverview from '@/components/FarmHealthOverview';
import LatestCropCheckCard from '@/components/LatestCropCheckCard';
import CropJourneyTimeline from '@/components/CropJourneyTimeline';
import InteractiveFarmMap from '@/components/InteractiveFarmMap';
import ImageUpload from '@/components/ImageUpload';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import LanguageModal from '@/components/LanguageModal';
import FarmerOnboardingModal from '@/components/FarmerOnboardingModal';
import AccountProfileSection from '@/components/AccountProfileSection';
import ActiveFarmBar from '@/components/ActiveFarmBar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { WifiOff, ShieldCheck, UserCheck, MapPin } from 'lucide-react';

const WeatherRisk = lazy(() => import('@/components/WeatherRisk'));
const HotspotMap = lazy(() => import('@/components/HotspotMap'));
const AdvisoryList = lazy(() => import('@/components/AdvisoryList'));
const ExpertValidationPanel = lazy(() => import('@/components/ExpertValidationPanel'));
const Dashboard = lazy(() => import('@/components/Dashboard'));

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
  const { activeFarm, setActiveFarm } = useFarmContext();

  useEffect(() => {
    // Check if farmer has completed first-time onboarding
    const onboarded = localStorage.getItem('crophealth_onboarded');
    if (!onboarded) {
      setShowOnboarding(true);
    }
  }, []);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 pb-16 md:pb-0 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 flex-1 w-full">
        {/* Active Farm & Crop Summary Bar */}
        <ActiveFarmBar 
          onFarmChange={(f) => setActiveFarm(f)}
          onAddNewFarm={() => setShowOnboarding(true)}
        />

        {activeSection === 'home' && (
          <div className="space-y-6">
            <Hero 
              onNavigate={handleNavigate} 
              onOpenOnboarding={() => setShowOnboarding(true)} 
            />

            {/* Quick Info & Farm Utilities Strip */}
            <QuickInfoStrip
              onNavigateToWeather={() => handleNavigate('weather')}
              onNavigateToMap={() => {
                const mapEl = document.getElementById('map-section');
                if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
                else handleNavigate('hotspots');
              }}
              onNavigateToHistory={() => handleNavigate('report')}
              onNavigateToAdvisory={() => handleNavigate('advisory')}
            />

            {/* Dynamic "Today" Decision Layer */}
            <TodayDecisionLayer
              onCheckCrop={() => handleNavigate('report')}
              onViewAdvisory={() => handleNavigate('advisory')}
              onViewExpertReview={() => handleNavigate('expert')}
              onViewWeather={() => handleNavigate('weather')}
            />

            {/* Farm Health & Latest Crop Check: Responsive 2-Column Desktop Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <FarmHealthOverview
                farmId={activeFarm?.id || 'default_farm'}
                cropName={activeFarm?.crop?.name || 'Cotton'}
                cropStage={activeFarm?.crop?.stage || 'Flowering'}
                onNavigateToCheck={() => handleNavigate('report')}
                onNavigateToAdvisory={() => handleNavigate('advisory')}
              />

              <LatestCropCheckCard
                onCheckCrop={() => handleNavigate('report')}
                onViewHistory={() => handleNavigate('report')}
              />
            </div>

            {/* Farmer Action Hub: 4 Key Field Actions */}
            <QuickActionHub
              onCheckCrop={() => handleNavigate('report')}
              onConsultExpert={() => handleNavigate('expert')}
              onInspectFoliage={() => handleNavigate('advisory')}
              onManageMoisture={() => handleNavigate('weather')}
            />

            {/* Real Weather & Early Warning Risk Engine */}
            <Suspense fallback={<SectionFallback />}>
              <WeatherRisk />
            </Suspense>

            {/* Step-by-Step AI Leaf Scanner */}
            <div id="scanner-section">
              <ImageUpload />
            </div>

            {/* Interactive Farm Map */}
            <div id="map-section">
              <InteractiveFarmMap onNavigateToSurveillance={() => handleNavigate('hotspots')} />
            </div>

            {/* Verified ICAR Advisories */}
            <Suspense fallback={<SectionFallback />}>
              <AdvisoryList />
            </Suspense>

            {/* End-to-End Crop Health Journey */}
            <CropJourneyTimeline
              onCheckCrop={() => handleNavigate('report')}
              onViewAdvisory={() => handleNavigate('advisory')}
            />
          </div>
        )}

        {activeSection !== 'home' && (
          <div className="py-2">
            <Suspense fallback={<SectionFallback />}>
              {activeSection === 'report' && <ImageUpload />}
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
      <ChatBot />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <FarmProvider>
        <AppContent />
      </FarmProvider>
    </LanguageProvider>
  );
}

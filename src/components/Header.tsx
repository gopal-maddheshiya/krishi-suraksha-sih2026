import { useState, useEffect } from 'react';
import { 
  Sprout, Globe, Menu, X, ChevronDown, Camera, 
  Cloud, MapPin, Bug, ShieldCheck, BarChart3, 
  Sparkles, Check, Home, Users, Bell, AlertTriangle, 
  Leaf, Phone, User, BookOpen, Compass, ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { languages, type LanguageCode } from '@/lib/i18n';
import LocationBar from './LocationBar';
import { RiskAssessmentService, type InAppAlertEntity } from '@/services/RiskAssessmentService';
import { useFarmContext } from '@/contexts/FarmContext';
import { supabase } from '@/lib/supabase';

type HeaderProps = {
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenAccount?: () => void;
};

export default function Header({ activeSection, onNavigate, onOpenAccount }: HeaderProps) {
  const { lang, setLang, t } = useLang();
  const { activeFarm, activeLocation } = useFarmContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [alerts, setAlerts] = useState<InAppAlertEntity[]>([]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const userAlerts = await RiskAssessmentService.getFarmerAlerts(authData.user.id);
          setAlerts(userAlerts);
        }
      } catch {}
    };
    loadAlerts();
  }, []);

  const mainNav = [
    { key: 'nav_home', section: 'home', label: lang === 'hi' ? 'होम' : lang === 'mr' ? 'मुख्य' : 'Home', icon: Home },
    { key: 'nav_report', section: 'report', label: lang === 'hi' ? 'फसल जांच' : lang === 'mr' ? 'पीक तपासणी' : 'Check Crop', icon: Camera },
    { key: 'nav_weather', section: 'weather', label: lang === 'hi' ? 'मौसम व जोखिम' : lang === 'mr' ? 'हवामान जोखीम' : 'Weather & Risk', icon: Cloud },
    { key: 'nav_advisory', section: 'advisory', label: lang === 'hi' ? 'कृषि सलाह' : lang === 'mr' ? 'कृषी सल्ला' : 'Advisory', icon: BookOpen },
    { key: 'nav_hotspots', section: 'hotspots', label: lang === 'hi' ? 'क्षेत्रीय निगरानी' : lang === 'mr' ? 'क्षेत्रीय पाहणी' : 'Surveillance', icon: Compass },
    { key: 'nav_expert', section: 'expert', label: lang === 'hi' ? 'विशेषज्ञ कक्ष' : lang === 'mr' ? 'तज्ज्ञ कक्ष' : 'Expert Portal', icon: Users },
    { key: 'nav_dashboard', section: 'dashboard', label: lang === 'hi' ? 'डैशबोर्ड' : lang === 'mr' ? 'डॅशबोर्ड' : 'Dashboard', icon: BarChart3 },
  ];

  const handleNav = (section: string) => {
    onNavigate(section);
    setMenuOpen(false);
  };

  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-stone-200/80 transition-all duration-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[68px]">
            
            {/* Premium Logo / Brand Emblem */}
            <div 
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none flex-shrink-0" 
              onClick={() => handleNav('home')}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-all duration-200 border border-emerald-400/30">
                <Leaf className="w-5 h-5 text-white stroke-[2.4]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-gray-900 group-hover:text-emerald-700 transition-colors">
                    CropHealth
                  </span>
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-2xs tracking-wider">
                    AI
                  </span>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold tracking-wide -mt-0.5 hidden sm:block">
                  {lang === 'hi' ? 'कृषि स्वास्थ्य एवं सुरक्षा' : lang === 'mr' ? 'पीक आरोग्य व संरक्षण' : 'Agri-Decision Support'}
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-stone-100/80 p-1 rounded-2xl border border-stone-200/80">
              {mainNav.slice(0, 6).map((item) => {
                const isActive = activeSection === item.section;
                return (
                  <button
                    key={item.section}
                    onClick={() => handleNav(item.section)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center ${
                      isActive
                        ? 'bg-white text-emerald-900 shadow-sm border border-stone-200/90'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Location, Bell & Hamburger Menu */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              
              {/* Location Pill (Desktop) */}
              <div className="hidden md:block">
                <LocationBar />
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-10 h-10 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-700 relative transition-all active:scale-95 shadow-2xs"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 stroke-[2]" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-xs">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Hamburger Sidebar Trigger Button */}
              <button
                onClick={() => setMenuOpen(true)}
                className="w-10 h-10 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-800 transition-all active:scale-95 shadow-2xs"
                aria-label="Open Sidebar Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. NOTIFICATIONS MODAL / POPOVER (100% Mobile Safe, No Clipping)           */}
      {/* ========================================================================= */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-start justify-center sm:justify-end p-4 sm:p-6 sm:pt-20">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in" 
            onClick={() => setNotifOpen(false)} 
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-sm sm:w-88 bg-white rounded-3xl shadow-2xl border border-gray-200/90 p-4 sm:p-5 z-50 animate-in zoom-in-95 fade-in duration-150 max-h-[80vh] flex flex-col mt-12 sm:mt-0">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Bell className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-gray-900 leading-tight">
                    {lang === 'hi' ? 'सूचना केंद्र' : lang === 'mr' ? 'सूचना कक्ष' : 'Notifications'}
                  </div>
                  <div className="text-[11px] text-gray-400 font-medium">
                    {alerts.length > 0 
                      ? `${alerts.length} ${lang === 'hi' ? 'सक्रिय अलर्ट' : 'Active Alerts'}`
                      : (lang === 'hi' ? 'सभी फसलें सुरक्षित हैं' : 'All crops normal')}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setNotifOpen(false)}
                className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content List */}
            <div className="py-3 overflow-y-auto flex-1 space-y-2.5">
              {alerts.length === 0 ? (
                <div className="text-center py-8 px-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-2 shadow-2xs">
                    <Check className="w-6 h-6 stroke-[2.4]" />
                  </div>
                  <div className="font-bold text-xs text-gray-800">
                    {lang === 'hi' ? 'कोई नया अलर्ट नहीं है' : lang === 'mr' ? 'नवीन सूचना नाही' : 'No New Alerts'}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed max-w-xs mx-auto">
                    {lang === 'hi'
                      ? 'वर्तमान में आपके खेत का मौसम और फसल स्थिति सामान्य है। नियमित जांच जारी रखें।'
                      : 'Microclimate and disease risk indicators are normal for your active crop.'}
                  </p>
                </div>
              ) : (
                alerts.map((al) => (
                  <div key={al.id} className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs shadow-2xs space-y-1">
                    <div className="font-bold text-amber-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>{al.title}</span>
                    </div>
                    <p className="text-[11px] text-amber-900/90 leading-relaxed pl-5">{al.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <span className="text-gray-400 font-medium">CropHealth Alerts</span>
              <button
                onClick={() => setNotifOpen(false)}
                className="font-bold text-emerald-700 hover:text-emerald-800"
              >
                {lang === 'hi' ? 'ठीक है' : 'Dismiss'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COMPREHENSIVE SIDEBAR DRAWER (Right Slide-over Sheet)                  */}
      {/* ========================================================================= */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in" 
            onClick={() => setMenuOpen(false)} 
          />

          {/* Sidebar Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-gray-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            
            {/* Sidebar Top Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  <Leaf className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="font-black text-base text-white tracking-tight">CropHealth AI</div>
                  <div className="text-[11px] text-emerald-200 font-medium">
                    {lang === 'hi' ? 'किसान सुविधा केंद्र' : lang === 'mr' ? 'शेतकरी सुविधा केंद्र' : 'Farmer Command Center'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Close Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* 1. Farmer Account Profile Snapshot */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-base shadow-xs">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-sm text-gray-900">
                      {activeFarm?.farm_name || (lang === 'hi' ? 'मेरा खेत' : 'My Farm')}
                    </div>
                    <div className="text-xs font-semibold text-emerald-800">
                      {activeFarm?.crop?.name || 'Cotton'} • {activeFarm?.area_acres || 2.5} {lang === 'hi' ? 'एकड़' : 'Acres'}
                    </div>
                  </div>
                </div>

                {onOpenAccount && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAccount();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 shadow-2xs transition-colors"
                  >
                    {lang === 'hi' ? 'खाता' : 'Profile'}
                  </button>
                )}
              </div>

              {/* 2. Language Selection Grid (13 Languages) */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Globe className="w-4 h-4 text-emerald-700 stroke-[2.2]" />
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700">
                    {lang === 'hi' ? 'भाषा का चयन करें (13 भाषाएं)' : 'Select Language (13 Languages)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code as LanguageCode)}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${
                        lang === l.code
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/80'
                      }`}
                    >
                      <span>{l.nativeName}</span>
                      {lang === l.code && <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Location Bar */}
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                  {lang === 'hi' ? 'वर्तमान स्थान' : 'Current Location'}
                </div>
                <LocationBar />
              </div>

              {/* 4. Complete Application Navigation */}
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                  {lang === 'hi' ? 'मुख्य नेविगेशन' : 'Navigation Menu'}
                </div>
                <div className="space-y-1.5">
                  {mainNav.map((item) => {
                    const isActive = activeSection === item.section;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.section}
                        onClick={() => handleNav(item.section)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-xl ${isActive ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Farmer Support Helpline */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-2">
                <div className="font-extrabold text-stone-900 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'hi' ? 'किसान कॉल सेंटर (निःशुल्क सहायता)' : 'Kisan Call Centre (Toll-Free)'}</span>
                </div>
                <a href="tel:18001801551" className="block text-emerald-700 font-black text-sm hover:underline">
                  📞 1800-180-1551
                </a>
                <div className="text-[11px] text-stone-500">
                  Government of Maharashtra • MSInS
                </div>
              </div>

            </div>

            {/* Sidebar Bottom Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 text-center text-[11px] text-stone-500">
              CropHealth AI • SIH 2026 Problem 26131
            </div>

          </div>
        </div>
      )}
    </>
  );
}

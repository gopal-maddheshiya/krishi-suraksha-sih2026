import { useState, useEffect } from 'react';
import { 
  Sprout, Globe, Menu, X, ChevronDown, Camera, 
  Cloud, MapPin, Bug, ShieldCheck, BarChart3, 
  Sparkles, Check, Home, Users, Bell, AlertTriangle, 
  Leaf, Phone, User, BookOpen, Compass, ChevronRight,
  ExternalLink, LogOut, LogIn, History, MoreHorizontal
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
  const { activeFarm, activeLocation, currentUser, logout } = useFarmContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
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

  const primaryNav = [
    { section: 'home', label: lang === 'hi' ? 'होम' : lang === 'mr' ? 'मुख्य' : 'Home', icon: Home },
    { section: 'report', label: lang === 'hi' ? 'फसल जांच' : lang === 'mr' ? 'पीक तपासणी' : 'Check Crop', icon: Camera },
    { section: 'medical-map', label: t('nav_medical_map') || (lang === 'hi' ? 'कृषि केंद्र व सेवाएं' : 'Farming Stores'), icon: MapPin },
    { section: 'weather', label: lang === 'hi' ? 'मौसम' : lang === 'mr' ? 'हवामान' : 'Weather', icon: Cloud },
    { section: 'advisory', label: lang === 'hi' ? 'कृषि सलाह' : lang === 'mr' ? 'कृषी सल्ला' : 'Advisory', icon: BookOpen },
    { section: 'hotspots', label: lang === 'hi' ? 'निगरानी' : lang === 'mr' ? 'पाहणी' : 'Surveillance', icon: Compass },
  ];

  const secondaryNav = [
    { section: 'history', label: lang === 'hi' ? 'जांच इतिहास' : lang === 'mr' ? 'तपासणी इतिहास' : 'Scan History', icon: History },
    { section: 'expert', label: lang === 'hi' ? 'विशेषज्ञ सत्यापन' : lang === 'mr' ? 'तज्ज्ञ कक्ष' : 'Expert Portal', icon: Users },
    { section: 'pest', label: lang === 'hi' ? 'स्मार्ट कीट ट्रैप' : lang === 'mr' ? 'कीड ट्रॅप' : 'Pest Traps', icon: Bug },
    { section: 'dashboard', label: lang === 'hi' ? 'एनालिटिक्स' : lang === 'mr' ? 'डॅशबोर्ड' : 'Analytics', icon: BarChart3 },
  ];

  const handleNav = (section: string) => {
    onNavigate(section);
    setMenuOpen(false);
  };

  const currentLangObj = languages.find((l) => l.code === lang) || languages[0];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/97 backdrop-blur-xl border-b border-stone-200/80 transition-all duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 lg:gap-3">
            
            {/* ========================================================= */}
            {/* 1. BRAND LOGO (CLEAN & NON-CROWDED)                       */}
            {/* ========================================================= */}
            <div 
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none flex-shrink-0" 
              onClick={() => handleNav('home')}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-800/15 group-hover:scale-105 transition-all duration-200 border border-emerald-400/20">
                <Leaf className="w-5 h-5 text-white stroke-[2.4]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-stone-900 group-hover:text-emerald-800 transition-colors">
                    KisanSarthi
                  </span>
                  <span className="bg-emerald-800 text-emerald-100 text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider">
                    AI
                  </span>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold tracking-wide mt-1 hidden sm:block">
                  {lang === 'hi' ? 'भारतीय कृषि सुरक्षा' : lang === 'mr' ? 'पीक संरक्षण प्रणाली' : 'Indian Agri-Shield'}
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 2. DESKTOP NAV — scrollable pill tabs                     */}
            {/* ========================================================= */}
            <nav className="hidden lg:flex items-center gap-0.5 bg-stone-100/80 p-1 rounded-2xl border border-stone-200/80 flex-1 mx-3 xl:mx-6 overflow-x-auto max-w-[640px]">
              {primaryNav.map((item) => {
                const isActive = activeSection === item.section;
                const Icon = item.icon;
                const isMedical = item.section === 'medical-map';
                return (
                  <button
                    key={item.section}
                    onClick={() => handleNav(item.section)}
                    className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-[11px] xl:text-xs font-bold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? isMedical
                          ? 'bg-emerald-800 text-white shadow-sm font-black'
                          : 'bg-white text-emerald-950 shadow-sm border border-stone-200/80 font-black'
                        : isMedical
                        ? 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900 border border-transparent hover:border-emerald-200'
                        : 'text-stone-500 hover:text-stone-900 hover:bg-white/70'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${
                      isActive ? (isMedical ? 'text-white' : 'text-emerald-700') : (isMedical ? 'text-emerald-600' : 'text-stone-400')
                    }`} />
                    <span>{item.label}</span>
                    {isMedical && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ========================================================= */}
            {/* 3. RIGHT CONTROLS: LANGUAGE, LOCATION, PROFILE, MENU      */}
            {/* ========================================================= */}
            <div className="flex items-center gap-2 flex-shrink-0">
              
              {/* Quick Language Selector (Desktop / Laptop) */}
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/90 text-stone-700 font-bold text-xs transition-colors shadow-2xs"
                  aria-label="Change Language"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{currentLangObj.nativeName}</span>
                  <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {langDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLangDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 p-1.5 z-50 animate-in zoom-in-95 duration-150 space-y-0.5">
                      <div className="text-[10px] font-black text-stone-400 uppercase tracking-wider px-2.5 py-1">
                        भाषा चुनें (Select Language)
                      </div>
                      {languages.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => {
                            setLang(l.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            lang === l.code
                              ? 'bg-emerald-50 text-emerald-950 font-black'
                              : 'text-stone-700 hover:bg-stone-50 font-bold'
                          }`}
                        >
                          <span>{l.nativeName} ({l.name})</span>
                          {lang === l.code && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Location Pill (Desktop) */}
              <div className="hidden xl:block">
                <LocationBar />
              </div>

              {/* User Profile / Login Pill */}
              {currentUser ? (
                <button
                  onClick={onOpenAccount}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 text-emerald-950 text-xs font-black transition-all active:scale-95 shadow-2xs"
                  title="Farmer Account"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : '👨‍🌾'}
                  </div>
                  <span className="truncate max-w-[90px]">{currentUser.fullName}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAccount}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all active:scale-95 shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'लॉगिन' : 'Login'}</span>
                </button>
              )}

              {/* Notifications Trigger */}
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/90 flex items-center justify-center text-stone-700 relative transition-all active:scale-95 shadow-2xs"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 stroke-[2]" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-xs">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Sidebar Menu Trigger (Hamburger) */}
              <button
                onClick={() => setMenuOpen(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/90 flex items-center justify-center text-stone-800 transition-all active:scale-95 shadow-2xs"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. NOTIFICATIONS MODAL / POPOVER                                          */}
      {/* ========================================================================= */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-4 sm:p-6 sm:pt-20">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in" 
            onClick={() => setNotifOpen(false)} 
          />

          <div className="relative w-full max-w-sm sm:w-88 bg-white rounded-3xl shadow-2xl border border-stone-200 p-4 sm:p-5 z-50 animate-in zoom-in-95 fade-in duration-150 max-h-[80vh] flex flex-col mt-12 sm:mt-0">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Bell className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-stone-900 leading-tight">
                    {lang === 'hi' ? 'सूचना केंद्र' : lang === 'mr' ? 'सूचना कक्ष' : 'Notifications'}
                  </div>
                  <div className="text-[11px] text-stone-400 font-medium">
                    {alerts.length > 0 
                      ? `${alerts.length} ${lang === 'hi' ? 'सक्रिय अलर्ट' : 'Active Alerts'}`
                      : (lang === 'hi' ? 'सभी फसलें सुरक्षित हैं' : 'All crops normal')}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setNotifOpen(false)}
                className="w-8 h-8 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 overflow-y-auto flex-1 space-y-2.5">
              {alerts.length === 0 ? (
                <div className="text-center py-8 px-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-2 shadow-2xs">
                    <Check className="w-6 h-6 stroke-[2.4]" />
                  </div>
                  <div className="font-bold text-xs text-stone-800">
                    {lang === 'hi' ? 'कोई नया अलर्ट नहीं है' : lang === 'mr' ? 'नवीन सूचना नाही' : 'No New Alerts'}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed max-w-xs mx-auto">
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

            <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
              <span className="text-stone-400 font-medium">CropHealth Alerts</span>
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
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in" 
            onClick={() => setMenuOpen(false)} 
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-stone-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            
            {/* Sidebar Top Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  <Leaf className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="font-black text-base tracking-tight text-white flex items-center gap-1.5">
                    <span>KisanSarthi</span>
                    <span className="bg-emerald-500 text-emerald-950 text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md">
                      AI
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-200 font-medium">
                    {lang === 'hi' ? 'राष्ट्रीय डिजिटल कृषि मंच' : 'National Digital Agri Platform'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Navigation Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              
              {/* Primary Views */}
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-2 px-1">
                  {lang === 'hi' ? 'मुख्य सुविधाएं' : 'Primary Features'}
                </div>
                <div className="space-y-1">
                  {[...primaryNav, ...secondaryNav].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.section;
                    return (
                      <button
                        key={item.section}
                        onClick={() => handleNav(item.section)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-950 font-black border border-emerald-200'
                            : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isActive ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'
                          }`}>
                            <Icon className="w-4 h-4 stroke-[2.2]" />
                          </div>
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-300" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Switcher in Drawer */}
              <div className="pt-3 border-t border-stone-100">
                <div className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-2.5 px-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-700" />
                  <span>भाषा (Language)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                        lang === l.code
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/80'
                      }`}
                    >
                      <div className="truncate">{l.nativeName}</div>
                      <div className={`text-[10px] ${lang === l.code ? 'text-emerald-200' : 'text-stone-400'}`}>
                        {l.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Official ICAR Helpline Contact Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2 text-xs text-emerald-950">
                <div className="font-black flex items-center gap-1.5 text-emerald-900">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === 'hi' ? 'ICAR किसान हेल्पलाइन' : 'ICAR Farmer Helpline'}</span>
                </div>
                <p className="text-[11px] text-emerald-900/80 leading-relaxed font-medium">
                  {lang === 'hi' 
                    ? 'रोग या कीटनाशक संबंधी आपातकालीन सलाह के लिए संपर्क करें:' 
                    : 'Toll-free advisory support by Senior Agronomists:'}
                </p>
                <div className="text-sm font-black text-emerald-800">
                  📞 1800-180-1551 (टोल-फ्री)
                </div>
              </div>

            </div>

            {/* Sidebar Bottom Account / Logout */}
            <div className="p-4 border-t border-stone-100 bg-stone-50">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                      {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : '👨‍🌾'}
                    </div>
                    <div>
                      <div className="text-xs font-black text-stone-900">{currentUser.fullName}</div>
                      <div className="text-[10px] text-stone-500 font-medium">{currentUser.phone || currentUser.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (onOpenAccount) onOpenAccount();
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'किसान लॉगिन / खाता' : 'Farmer Login / Account'}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

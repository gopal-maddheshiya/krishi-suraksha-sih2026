import { 
  Camera, MapPin, CloudRain, Droplets, 
  Sprout, ChevronRight, Sun, ShieldCheck,
  CheckCircle2, Sparkles, Tractor, Thermometer, 
  History, ArrowRight, Zap, ShieldAlert
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';

type HeroProps = {
  onNavigate: (section: string) => void;
  onOpenOnboarding?: () => void;
};

export default function Hero({ onNavigate, onOpenOnboarding }: HeroProps) {
  const { lang } = useLang();
  const { activeFarm, weather, risk, currentUser } = useFarmContext();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return lang === 'hi' ? 'सुप्रभात' : lang === 'mr' ? 'शुभ प्रभात' : 'Good Morning';
    if (hour < 17) return lang === 'hi' ? 'नमस्ते' : lang === 'mr' ? 'नमस्कार' : 'Good Afternoon';
    return lang === 'hi' ? 'शुभ संध्या' : lang === 'mr' ? 'शुभ संध्याकाळ' : 'Good Evening';
  };

  const farmerName = currentUser?.fullName || (lang === 'hi' ? 'किसान मित्र' : 'Farmer Friend');
  const cropName = activeFarm?.crop?.name || 'Cotton';
  const cropStage = activeFarm?.crop?.stage || (lang === 'hi' ? 'फूल आने की अवस्था' : 'Flowering Stage');
  const district = activeFarm?.district || 'Pune';
  const state = activeFarm?.state || 'Maharashtra';
  const areaAcres = activeFarm?.area_acres || '2.5';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white shadow-2xl border border-emerald-800/40 p-5 sm:p-7 md:p-8">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* ============================================================= */}
        {/* LEFT COLUMN: GREETING & PRIMARY CALL TO ACTION                */}
        {/* ============================================================= */}
        <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
          
          {/* Personalized Farmer Greeting Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-xs font-black text-emerald-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{getGreeting()}, {farmerName}! 👋</span>
          </div>

          {/* Main Hero Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            {lang === 'hi' ? (
              <>
                स्मार्ट AI फसल डॉक्टर <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
                  एवं डिजिटल कृषि सुरक्षा कवच
                </span>
              </>
            ) : lang === 'mr' ? (
              <>
                स्मार्ट AI पीक डॉक्टर <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
                  व डिजिटल शेती सुरक्षा
                </span>
              </>
            ) : (
              <>
                Smart AI Crop Doctor <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
                  & Digital Farm Shield
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal max-w-lg mx-auto lg:mx-0">
            {lang === 'hi'
              ? 'प्रभावित पत्ती की स्पष्ट फोटो लें और तुरंत ICAR प्रमाणित बीमारी का नाम, दवा की सटीक मात्रा एवं मौसम अनुसार छिड़काव सलाह पाएं।'
              : 'Upload a leaf photo for instant preliminary symptom screening, certified ICAR dosages & microclimate spray timings.'}
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('scanner-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onNavigate('report');
              }}
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white text-emerald-950 font-black text-xs sm:text-sm hover:bg-emerald-50 active:scale-95 shadow-xl transition-all"
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 stroke-[2.4]" />
              <span>{lang === 'hi' ? 'फसल पत्ती की जांच करें' : 'Check Crop Leaf Health'}</span>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 active:scale-95 transition-all shadow-md"
            >
              <History className="w-4 h-4 text-emerald-300" />
              <span>{lang === 'hi' ? 'जांच इतिहास देखें' : 'My History'}</span>
            </button>
          </div>

        </div>

        {/* ============================================================= */}
        {/* RIGHT COLUMN: HIGH-TECH CROP SCANNER SHOWCASE CARD            */}
        {/* ============================================================= */}
        <div className="hidden lg:block lg:col-span-5">
          <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl group">
            
            {/* Image Banner */}
            <img
              src="/images/hero-farmer.jpg"
              alt="Farmer crop scan"
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=800&auto=format&fit=crop&q=80';
              }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/40 to-transparent" />

            {/* AI HUD Scanner Overlay Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-black border border-white/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Vision 99.2% Accuracy</span>
              </span>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-emerald-950 text-[11px] font-black">
                ✓ ICAR Verified
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-black text-white">{cropName} • {cropStage}</div>
                  <div className="text-[11px] text-emerald-200">{district}, {state} ({areaAcres} {lang === 'hi' ? 'एकड़' : 'Acres'})</div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-400 text-emerald-950 font-black text-[10px]">
                  {risk?.riskLevel === 'high' ? 'High Risk' : 'Low Risk'}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

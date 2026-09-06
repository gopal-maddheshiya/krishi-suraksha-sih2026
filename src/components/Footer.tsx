import { Leaf, Mail, Phone, Globe, Info, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { languages, type LanguageCode } from '@/lib/i18n';

type FooterProps = {
  onNavigate?: (section: string) => void;
  onOpenAccount?: () => void;
};

export default function Footer({ onNavigate }: FooterProps) {
  const { lang, setLang, t } = useLang();

  const navigationLinks = [
    { key: 'nav_home', section: 'home', label: t('nav_home') },
    { key: 'nav_report', section: 'report', label: t('nav_report') },
    { key: 'nav_weather', section: 'weather', label: t('nav_weather') },
    { key: 'nav_advisory', section: 'advisory', label: t('nav_advisory') },
    { key: 'nav_hotspots', section: 'hotspots', label: t('nav_hotspots') },
    { key: 'nav_history', section: 'history', label: lang === 'hi' ? 'जांच इतिहास' : 'Scan History' },
  ];

  return (
    <footer className="bg-white/95 backdrop-blur-xl border-t border-stone-200/90 mt-14 pb-24 md:pb-8 shadow-xs relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-8">
          
          {/* 1. Brand & Mission Statement (4 Columns) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-800/15">
                <Leaf className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-black text-lg text-stone-900">
                    KisanSarthi
                  </span>
                  <span className="bg-emerald-800 text-emerald-100 text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider">
                    AI
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700 font-bold tracking-wide mt-1">
                  {lang === 'hi' ? 'भारतीय कृषि सुरक्षा एवं रोग प्रबंधन' : 'National Crop Protection System'}
                </div>
              </div>
            </div>
            
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              {lang === 'hi' 
                ? 'किसानों और कृषि वैज्ञानिकों को सटीक रोग पहचान, मौसम पूर्वानुमान और ICAR प्रमाणित मार्गदर्शन प्रदान करने वाला आधुनिक डिजिटल मंच।'
                : 'Empowering Indian farmers and agronomists with instant disease diagnosis, microclimate advisories, and certified ICAR prescriptions.'}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-bold shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>ICAR Standard Aligned</span>
              </span>
            </div>
          </div>

          {/* 2. Quick Navigation Links (3 Columns) */}
          <div className="lg:col-span-3">
            <h3 className="font-black text-xs text-stone-900 uppercase tracking-wider mb-3.5 pb-1 border-b border-stone-100">
              {t('footer_quick_links')}
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-xs font-semibold">
              {navigationLinks.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => onNavigate?.(item.section)}
                    className="text-stone-600 hover:text-emerald-800 transition-colors text-left flex items-center gap-1 py-1 hover:translate-x-0.5 duration-150"
                  >
                    <span>• {item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Multi-Language Switcher (3 Columns) */}
          <div className="lg:col-span-3">
            <h3 className="font-black text-xs text-stone-900 uppercase tracking-wider mb-3.5 pb-1 border-b border-stone-100 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'hi' ? 'भाषा चुनें (Languages)' : 'Select Language'}</span>
            </h3>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code as LanguageCode)}
                  className={`text-left px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold ${
                    lang === l.code
                      ? 'text-emerald-950 font-black bg-emerald-100/90 border-emerald-300 shadow-2xs'
                      : 'text-stone-600 bg-stone-50/60 border-stone-200/80 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {l.nativeName}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Farmer Helpline & Support (2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-black text-xs text-stone-900 uppercase tracking-wider mb-3.5 pb-1 border-b border-stone-100 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'hi' ? 'किसान सहायता' : 'Helpline'}</span>
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 shadow-2xs space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Kisan Call Center</span>
                <a 
                  href="tel:18001801551" 
                  className="font-black text-emerald-900 hover:text-emerald-700 flex items-center gap-1.5 text-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>1800-180-1551</span>
                </a>
              </div>

              <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 shadow-2xs space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Technical Support</span>
                <a 
                  href="mailto:support@crophealth.gov.in" 
                  className="font-bold text-stone-700 hover:text-emerald-800 flex items-center gap-1.5 text-[11px] truncate"
                >
                  <Mail className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                  <span className="truncate">support@crophealth.gov.in</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Disclaimer Strip */}
        <div className="pt-6 border-t border-stone-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 font-medium">
          <div>
            © {new Date().getFullYear()} KisanSarthi AI · {lang === 'hi' ? 'भारतीय कृषि सुरक्षा प्रणाली' : 'Indian Agricultural Protection System'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-600 bg-stone-100/70 px-3 py-1 rounded-full border border-stone-200/80 shadow-2xs">
            <Info className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
            <span>{lang === 'hi' ? 'AI जांच प्रारंभिक है। रासायनिक उपचार के लिए KVK वैज्ञानिकों से परामर्श लें।' : 'AI diagnosis is preliminary. Follow ICAR & KVK guidelines for chemical treatment.'}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
import { Sprout, Mail, Phone, MapPin, Globe, ShieldCheck, Heart, Info, User } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { languages, type LanguageCode } from '@/lib/i18n';

type FooterProps = {
  onNavigate?: (section: string) => void;
  onOpenAccount?: () => void;
};

export default function Footer({ onNavigate, onOpenAccount }: FooterProps) {
  const { lang, setLang, t } = useLang();

  const navigationLinks = [
    { key: 'nav_home', section: 'home', label: lang === 'hi' ? 'होम' : lang === 'mr' ? 'मुख्यपृष्ठ' : 'Home' },
    { key: 'nav_report', section: 'report', label: lang === 'hi' ? 'AI फसल जांच' : lang === 'mr' ? 'AI पीक तपासणी' : 'AI Crop Scanner' },
    { key: 'nav_weather', section: 'weather', label: lang === 'hi' ? 'मौसम व जोखिम' : lang === 'mr' ? 'हवामान व जोखीम' : 'Weather & Risk Engine' },
    { key: 'nav_advisory', section: 'advisory', label: lang === 'hi' ? 'कृषि सलाह' : lang === 'mr' ? 'कृषी सल्ला' : 'Farmer Advisories' },
    { key: 'nav_hotspots', section: 'hotspots', label: lang === 'hi' ? 'क्षेत्रीय निगरानी' : lang === 'mr' ? 'क्षेत्रीय देखरेख' : 'Surveillance Matrix' },
    { key: 'nav_expert', section: 'expert', label: lang === 'hi' ? 'विशेषज्ञ पोर्टल' : lang === 'mr' ? 'तज्ज्ञ पोर्टल' : 'Expert Review Portal' },
    { key: 'nav_dashboard', section: 'dashboard', label: lang === 'hi' ? 'डैशबोर्ड' : lang === 'mr' ? 'डॅशबोर्ड' : 'Analytics Dashboard' },
  ];

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 mt-16 pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand & Problem Statement Context */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">CropHealth AI</span>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              {lang === 'hi'
                ? 'भारतीय कृषि-जलवायु क्षेत्रों में फसल रोगों और कीटों का प्रारंभिक पता लगाने और प्रबंधन की प्रणाली।'
                : 'Early detection and integrated management of crop diseases and pest infestations across Indian agro-climatic zones.'}
            </p>

            <div className="pt-2">
              <div className="inline-block p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-stone-400 space-y-0.5">
                <div className="font-bold text-emerald-400">SIH 2026 • Problem ID: 26131</div>
                <div>Govt of Maharashtra • MSInS</div>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Navigation */}
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-4">
              {lang === 'hi' ? 'त्वरित नेविगेशन' : lang === 'mr' ? 'नेव्हिगेशन' : 'Quick Navigation'}
            </h3>
            <ul className="space-y-2 text-xs">
              {navigationLinks.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => onNavigate?.(item.section)}
                    className="text-stone-400 hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Multilingual Access */}
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'hi' ? 'भाषा विकल्प' : 'Language Support'}</span>
            </h3>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code as LanguageCode)}
                  className={`text-left p-1.5 rounded-lg transition-colors text-[11px] ${
                    lang === l.code
                      ? 'text-emerald-400 font-bold bg-emerald-950/60'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {l.nativeName}
                </button>
              ))}
            </div>
          </div>

          {/* Col 4: Agricultural Helpline & Farmer Profile Corner */}
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-4">
              {lang === 'hi' ? 'किसान सहायता एवं खाता' : 'Farmer Support & Account'}
            </h3>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Kisan Call Centre: 1800-180-1551</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>support@crophealth.gov.in</span>
              </div>
              
              {/* Secondary Farmer Profile / Account Action */}
              {onOpenAccount && (
                <div className="pt-2">
                  <button
                    onClick={onOpenAccount}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-bold transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'hi' ? 'मेरा खाता / प्रोफाइल' : lang === 'mr' ? 'माझे खाते / प्रोफाइल' : 'My Account / Profile'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Safety Disclaimer */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            &copy; 2026 CropHealth AI Platform. Smart India Hackathon 2026.
          </div>

          <div className="flex items-center gap-1 text-center sm:text-right">
            <Info className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <span>
              {lang === 'hi'
                ? 'स्वचालित जांच प्रारंभिक है। रासायनिक उपचार के लिए कृषि विज्ञान केंद्र (KVK) विशेषज्ञों से परामर्श लें।'
                : 'Automated screening is preliminary. Consult certified KVK agricultural officers for chemical treatments.'}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}

import { Sprout, Mail, Phone, Globe, Info, User } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { languages, type LanguageCode } from '@/lib/i18n';

type FooterProps = {
  onNavigate?: (section: string) => void;
  onOpenAccount?: () => void;
};

export default function Footer({ onNavigate, onOpenAccount }: FooterProps) {
  const { lang, setLang, t } = useLang();

  const navigationLinks = [
    { key: 'nav_home', section: 'home', label: t('nav_home') },
    { key: 'nav_report', section: 'report', label: t('nav_report') },
    { key: 'nav_weather', section: 'weather', label: t('nav_weather') },
    { key: 'nav_advisory', section: 'advisory', label: t('nav_advisory') },
    { key: 'nav_hotspots', section: 'hotspots', label: t('nav_hotspots') },
  ];

  return (
    <footer className="bg-white border-t border-stone-200 mt-12 pb-24 lg:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                <Sprout className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-base text-stone-900">CropHealth AI</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              {t('footer_about_text')}
            </p>
            <div className="inline-block px-2 py-1 rounded-md bg-stone-50 border border-stone-200 text-[10px] text-stone-500">
              <span className="font-bold text-emerald-700">SIH 2026</span> · Problem 26131
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wider mb-2.5">
              {t('footer_quick_links')}
            </h3>
            <ul className="space-y-1.5 text-xs">
              {navigationLinks.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => onNavigate?.(item.section)}
                    className="text-stone-600 hover:text-emerald-700 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('footer_quick_links') === 'त्वरित लिंक' ? 'भाषा' : 'Language'}</span>
            </h3>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code as LanguageCode)}
                  className={`text-left px-2 py-1 rounded-md transition-colors text-[11px] ${
                    lang === l.code
                      ? 'text-emerald-700 font-bold bg-emerald-50'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {l.nativeName}
                </button>
              ))}
            </div>
          </div>

          {/* Support & Account (far-right corner) */}
          <div>
            <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wider mb-2.5">
              {lang === 'hi' ? 'सहायता व खाता' : 'Support & Account'}
            </h3>
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span>1800-180-1551</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span>support@crophealth.gov.in</span>
              </div>
              {onOpenAccount && (
                <button
                  onClick={onOpenAccount}
                  className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] border border-stone-200 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('common_view_all').startsWith('View') ? 'My Account' : 'मेरा खाता'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500">
          <div>© 2026 CropHealth AI · Smart India Hackathon 2026</div>
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
            <span>{t('common_offline').startsWith('You are offline') ? 'AI screening is preliminary. Consult KVK experts for chemical treatments.' : 'AI जांच प्रारंभिक है। रासायनिक उपचार के लिए KVK विशेषज्ञों से परामर्श लें।'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
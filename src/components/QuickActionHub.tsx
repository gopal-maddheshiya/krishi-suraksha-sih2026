import { useState } from 'react';
import { 
  Camera, Search, Droplets, UserCheck, 
  Sparkles, CheckCircle2, ChevronRight, ShieldAlert 
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

interface QuickActionHubProps {
  onCheckCrop: () => void;
  onConsultExpert: () => void;
  onInspectFoliage: () => void;
  onManageMoisture: () => void;
}

export default function QuickActionHub({
  onCheckCrop,
  onConsultExpert,
  onInspectFoliage,
  onManageMoisture,
}: QuickActionHubProps) {
  const { lang } = useLang();

  const actions = [
    {
      id: 'check_crop',
      icon: Camera,
      title: lang === 'hi' ? 'फसल की फोटो जांचें' : lang === 'mr' ? 'पिकाचा फोटो तपासा' : 'Check My Crop',
      subtitle: lang === 'hi' ? 'लक्षणों की स्वचालित जांच' : lang === 'mr' ? 'रोगाचे प्राथमिक निदान' : 'Instant Symptom Screening',
      color: 'from-emerald-600 to-teal-600 text-white',
      badge: lang === 'hi' ? 'मुख्य कार्य' : 'Primary CTA',
      onClick: onCheckCrop,
      primary: true,
    },
    {
      id: 'inspect_foliage',
      icon: Search,
      title: lang === 'hi' ? 'खेत का निरीक्षण करें' : lang === 'mr' ? 'शेताची पाहणी करा' : 'Inspect Field Foliage',
      subtitle: lang === 'hi' ? 'निचली पत्तियों पर धब्बे देखें' : lang === 'mr' ? 'खालच्या पानांची तपासणी' : 'Check leaf undersides for spots',
      color: 'bg-white hover:bg-stone-50 text-gray-900 border border-gray-200/90',
      onClick: onInspectFoliage,
    },
    {
      id: 'manage_moisture',
      icon: Droplets,
      title: lang === 'hi' ? 'नमी व जल निकासी' : lang === 'mr' ? 'ओलावा व पाण्याचा निचरा' : 'Check Soil Moisture',
      subtitle: lang === 'hi' ? 'शाम को जलभराव से बचें' : lang === 'mr' ? 'पाणी साचू देऊ नका' : 'Prevent evening water pooling',
      color: 'bg-white hover:bg-stone-50 text-gray-900 border border-gray-200/90',
      onClick: onManageMoisture,
    },
    {
      id: 'consult_expert',
      icon: UserCheck,
      title: lang === 'hi' ? 'कृषि विशेषज्ञ से पूछें' : lang === 'mr' ? 'कृषी तज्ज्ञांचा सल्ला घ्या' : 'Consult Agri Expert',
      subtitle: lang === 'hi' ? 'सत्यापित वैज्ञानिक मार्गदर्शन' : lang === 'mr' ? 'प्रमाणित वैज्ञानिक सल्ला' : 'Official review & advice',
      color: 'bg-white hover:bg-stone-50 text-gray-900 border border-gray-200/90',
      onClick: onConsultExpert,
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span>{lang === 'hi' ? 'आज मुझे क्या करना चाहिए?' : lang === 'mr' ? 'आज काय करावे?' : 'What should I do today?'}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {lang === 'hi' ? 'आपकी सक्रिय फसल के लिए प्राथमिकता कार्य' : 'Priority field actions for your active crop'}
          </p>
        </div>
      </div>

      {/* 4 Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              onClick={act.onClick}
              className={`p-4 sm:p-5 rounded-3xl shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[120px] ${
                act.primary
                  ? 'bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20 hover:scale-[1.02]'
                  : 'bg-white hover:border-emerald-400 border border-gray-200/90 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    act.primary ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {act.badge && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                    {act.badge}
                  </span>
                )}
              </div>

              <div>
                <h3 className={`font-extrabold text-sm sm:text-base mb-0.5 ${act.primary ? 'text-white' : 'text-gray-900'}`}>
                  {act.title}
                </h3>
                <p className={`text-xs ${act.primary ? 'text-emerald-100' : 'text-gray-500'}`}>
                  {act.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

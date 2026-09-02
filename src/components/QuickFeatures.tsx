import { Camera, Cloud, MapPin, Bug, ShieldCheck, BarChart3 } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

interface QuickFeaturesProps {
  onNavigate: (section: string) => void;
}

export default function QuickFeatures({ onNavigate }: QuickFeaturesProps) {
  const { lang, t } = useLang();

  const features = [
    {
      id: 'report',
      icon: Camera,
      title: lang === 'hi' ? 'रोग पहचान (Scanner)' : lang === 'mr' ? 'रोग निदान (Scanner)' : 'Disease Detection',
      desc: lang === 'hi' ? 'पत्ती की फोटो से तुरंत पहचान' : lang === 'mr' ? 'पानाच्या फोटोवरून त्वरित निदान' : 'Instant leaf symptom analysis',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      id: 'weather',
      icon: Cloud,
      title: lang === 'hi' ? 'मौसम जोखिम' : lang === 'mr' ? 'हवामान जोखीम' : 'Weather Risk',
      desc: lang === 'hi' ? 'तापमान व आर्द्रता अलर्ट' : lang === 'mr' ? 'तापमान व आर्द्रता इशारा' : 'Humidity & spore forecasts',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      id: 'hotspots',
      icon: MapPin,
      title: lang === 'hi' ? 'हॉटस्पॉट मैप' : lang === 'mr' ? 'हॉटस्पॉट नकाशा' : 'Hotspot Map',
      desc: lang === 'hi' ? 'क्षेत्रीय प्रकोप का नक्शा' : lang === 'mr' ? 'प्रादेशिक रोग नकाशा' : 'Geospatial outbreak tracking',
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      id: 'pest',
      icon: Bug,
      title: lang === 'hi' ? 'कीट जाल (IoT)' : lang === 'mr' ? 'कीटक सापळे (IoT)' : 'Pest Traps',
      desc: lang === 'hi' ? 'फेरोमोन जाल व सेंसर' : lang === 'mr' ? 'कामगंध सापळे व सेन्सर' : 'IoT trap counters & threshold',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      id: 'ipm',
      icon: ShieldCheck,
      title: lang === 'hi' ? 'IPM गाइड' : lang === 'mr' ? 'IPM मार्गदर्शक' : 'IPM Guide',
      desc: lang === 'hi' ? 'जैविक व रासायनिक खुराक' : lang === 'mr' ? 'सेंद्रिय व रासायनिक उपाय' : 'Safe dosage & biocontrol',
      color: 'text-teal-600 bg-teal-50 border-teal-100',
    },
    {
      id: 'dashboard',
      icon: BarChart3,
      title: lang === 'hi' ? 'डैशबोर्ड' : lang === 'mr' ? 'डॅशबोर्ड' : 'Gov Dashboard',
      desc: lang === 'hi' ? 'कृषि अधिकारियों के लिए' : lang === 'mr' ? 'कृषी अधिकाऱ्यांसाठी' : 'Official surveillance view',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
  ];

  return (
    <section className="py-8 sm:py-10 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => onNavigate(f.id)}
                className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-gray-200/70 hover:border-emerald-500 hover:shadow-md active:scale-95 transition-all group"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 border ${f.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors leading-tight mb-1">
                  {f.title}
                </div>
                <div className="text-[11px] text-gray-500 leading-tight line-clamp-1">
                  {f.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

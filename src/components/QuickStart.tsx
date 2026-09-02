import { Camera, Cpu, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

export default function QuickStart() {
  const { lang } = useLang();

  const steps = [
    {
      step: '01',
      icon: Camera,
      title: lang === 'hi' ? 'पत्ती / फसल की फोटो लें' : lang === 'mr' ? 'पानाचा / पिकाचा फोटो घ्या' : '1. Snap Diseased Leaf Photo',
      text: lang === 'hi'
        ? 'अपने मोबाइल कैमरे से प्रभावित पत्ती, तने या फल की स्पष्ट फोटो खींचें या गैलरी से अपलोड करें।'
        : lang === 'mr'
        ? 'मोबाईल कॅमेऱ्याने बाधित पान, खोड किंवा फळाचा स्पष्ट फोटो काढा किंवा अपलोड करा.'
        : 'Capture a clear photo of the affected plant leaf, stem, or fruit using your phone camera.',
      color: 'from-emerald-500 to-teal-600',
      badge: 'Capture'
    },
    {
      step: '02',
      icon: Cpu,
      title: lang === 'hi' ? 'AI व मौसम जोखिम विश्लेषण' : lang === 'mr' ? 'AI व हवामान जोखीम विश्लेषण' : '2. Instant Deep Learning Diagnosis',
      text: lang === 'hi'
        ? 'AI मॉडल बीमारी और गंभीरता की पहचान करता है, साथ ही स्थानीय मौसम व आर्द्रता के जोखिम का आकलन करता है।'
        : lang === 'mr'
        ? 'AI मॉडेल रोग आणि त्याची तीव्रता ओळखते आणि स्थानिक हवामानाच्या जोखमीचे मूल्यांकन करते.'
        : 'Neural vision model detects disease type, severity level & correlates with local weather data in < 3s.',
      color: 'from-blue-500 to-indigo-600',
      badge: 'Analyze'
    },
    {
      step: '03',
      icon: ShieldCheck,
      title: lang === 'hi' ? 'सटीक उपचार व KVK विशेषज्ञ सलाह' : lang === 'mr' ? 'अचूक उपाय व KVK तज्ज्ञ मार्गदर्शन' : '3. IPM Remedy & Certified Action',
      text: lang === 'hi'
        ? 'अपनी भाषा में जैविक नियंत्रण, सटीक दवा की खुराक और आवश्यकता पड़ने पर कृषि विज्ञान केंद्र (KVK) से सीधा संपर्क पाएं।'
        : lang === 'mr'
        ? 'आपल्या भाषेत सेंद्रिय उपाय, अचूक औषधांचे प्रमाण आणि आवश्यकतेनुसार KVK शास्त्रज्ञांचा थेट सल्ला मिळवा.'
        : 'Get biological solutions, exact chemical dosage per acre, and direct referral to extension scientists.',
      color: 'from-amber-500 to-orange-600',
      badge: 'Resolve'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-semibold mb-3 border border-emerald-200/60">
            <span>⚡ {lang === 'hi' ? 'सरल 3-चरणीय प्रक्रिया' : lang === 'mr' ? 'सोपी ३-टप्प्यांची प्रक्रिया' : 'Simple 3-Step Workflow'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {lang === 'hi'
              ? 'खेत में बीमारी रोकने की आसान प्रक्रिया'
              : lang === 'mr'
              ? 'शेतातील रोग नियंत्रणाची सुलभ कार्यपद्धती'
              : 'How Crop Health Management Works'}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mt-2">
            {lang === 'hi'
              ? 'बिना किसी परेशानी के कुछ ही सेकंड में अपनी फसल का सटीक डॉक्टर पाएं।'
              : lang === 'mr'
              ? 'काही सेकंदात तुमच्या पिकाचे अचूक डिजिटल डॉक्टरी निदान मिळवा.'
              : 'Empowering every farmer with instant diagnostic precision directly in their palm.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative bg-gradient-to-b from-gray-50/80 to-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Step Number Top Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-3xl font-black text-gray-200 group-hover:text-emerald-300 transition-colors">
                    {s.step}
                  </span>
                </div>

                <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md mb-2">
                  {s.badge}
                </div>

                <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-3 group-hover:text-emerald-800 transition-colors">
                  {s.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {s.text}
                </p>

                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-400">
                    <ArrowRight className="w-4 h-4 text-emerald-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { Bug, MapPin, CloudRain, ShieldCheck, Microscope, Volume2, ArrowUpRight, Cpu } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

interface VisualFeaturesProps {
  onNavigate: (section: string) => void;
}

export default function VisualFeatures({ onNavigate }: VisualFeaturesProps) {
  const { lang } = useLang();

  const features = [
    {
      id: 'pest',
      title: lang === 'hi' ? 'IoT स्मार्ट फेरोमोन कीट जाल' : lang === 'mr' ? 'IoT स्मार्ट कामगंध कीटक सापळे' : 'IoT Smart Pheromone Pest Traps',
      subtitle: lang === 'hi'
        ? 'स्वचालित ऑप्टिकल कीट गणना और आर्थिक सीमा (ETL) पार होने पर तुरंत फोन अलर्ट।'
        : lang === 'mr'
        ? 'स्वयंचलित कीटक मोजणी आणि आर्थिक मर्यादा (ETL) ओलांडल्यास त्वरित मोबाइल अलर्ट.'
        : 'Automated optical insect counts & threshold breach alarms before infestation spreads.',
      tag: lang === 'hi' ? 'हार्डवेयर व सेंसर' : lang === 'mr' ? 'हार्डवेअर व सेन्सर' : 'IoT & Sensors',
      image: '/images/smart-trap.jpg',
      icon: Cpu,
      color: 'from-amber-500 to-orange-600',
      action: 'pest'
    },
    {
      id: 'hotspots',
      title: lang === 'hi' ? 'GIS भू-स्थानिक हॉटस्पॉट और सैटेलाइट मैप' : lang === 'mr' ? 'GIS उपग्रह व जिओ-हॉटस्पॉट नकाशा' : 'GIS Geospatial Outbreak Hotspots',
      subtitle: lang === 'hi'
        ? 'तहसील व जिला स्तर पर बीमारी प्रसार का रियल-टाइम हीटमैप और सरकारी कृषि अधिकारियों के लिए निगरानी।'
        : lang === 'mr'
        ? 'तालुका व जिल्हा स्तरावर रोग प्रसाराचा थेट हीटमॅप आणि कृषी अधिकाऱ्यांसाठी देखरेख.'
        : 'Real-time regional outbreak cluster mapping & surveillance dashboards for agriculture officers.',
      tag: lang === 'hi' ? 'सैटेलाइट व GIS' : lang === 'mr' ? 'उपग्रह व GIS' : 'Satellite & GIS',
      image: '/images/satellite-map.jpg',
      icon: MapPin,
      color: 'from-blue-600 to-indigo-600',
      action: 'hotspots'
    }
  ];

  const quickPillars = [
    {
      icon: CloudRain,
      title: lang === 'hi' ? 'माइक्रो-क्लाइमेट मौसम जोखिम' : lang === 'mr' ? 'हवामान आधारित रोग जोखीम' : 'Weather Risk Forecasting',
      desc: lang === 'hi'
        ? 'आर्द्रता, तापमान व बारिश के आधार पर फंगल व बैक्टीरियल बीमारी का 7-दिवसीय पूर्वानुमान।'
        : lang === 'mr'
        ? 'तापमान व आर्द्रतेच्या आधारे बुरशीजन्य रोगांचे ७ दिवसांचे आगाऊ भाकीत.'
        : 'Predicts spore germination and pest multiplication 7 days ahead based on microclimate.',
      action: 'weather',
      color: 'text-sky-600 bg-sky-50'
    },
    {
      icon: ShieldCheck,
      title: lang === 'hi' ? 'समेकित कीट प्रबंधन (IPM)' : lang === 'mr' ? 'एकात्मिक कीड नियंत्रण (IPM)' : 'Integrated Pest Management (IPM)',
      desc: lang === 'hi'
        ? 'जैविक नियंत्रण को प्राथमिकता, रसायनों की सटीक खुराक और फसल कटाई सुरक्षा अंतराल (PHI)।'
        : lang === 'mr'
        ? 'जैविक उपायांना प्राधान्य, रसायनांचे अचूक प्रमाण आणि कापणी सुरक्षा कालावधी.'
        : 'Eco-friendly biologicals first, exact pesticide grams/acre, and harvest safety intervals.',
      action: 'ipm',
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      icon: Microscope,
      title: lang === 'hi' ? 'KVK वैज्ञानिक व लैब सत्यापन' : lang === 'mr' ? 'KVK तज्ज्ञ व लॅब तपासणी' : 'KVK Expert Validation & Lab Referral',
      desc: lang === 'hi'
        ? 'संदिग्ध व दुर्लभ मामलों को सीधे कृषि विज्ञान केंद्र (KVK) व पैथोलॉजी लैब में रेफर करने की सुविधा।'
        : lang === 'mr'
        ? 'संशयास्पद नमुने थेट कृषी विज्ञान केंद्र व प्रयोगशाळेकडे पाठवण्याची सोय.'
        : 'Direct referral of complex/unknown cases to Krishi Vigyan Kendra & pathology labs.',
      action: 'expert',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: Volume2,
      title: lang === 'hi' ? '8+ भारतीय भाषाओं में सलाह' : lang === 'mr' ? '८+ प्रादेशिक भाषांत सल्ला' : '8+ Regional Indian Languages',
      desc: lang === 'hi'
        ? 'हिंदी, मराठी, बंगाली, तमिल, तेलुगु, गुजराती आदि में स्थानीय कृषि सिफारिशें।'
        : lang === 'mr'
        ? 'मराठी, हिंदी, इंग्रजी सह ८ प्रादेशिक भाषांमध्ये शेतीविषयक अचूक मार्गदर्शन.'
        : 'Localized advisories available in Hindi, Marathi, Bengali, Tamil, Telugu, and more.',
      action: 'advisory',
      color: 'text-rose-600 bg-rose-50'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-gray-50/70 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {lang === 'hi'
              ? 'किसानों व कृषि अधिकारियों के लिए सम्पूर्ण तकनीकी समाधान'
              : lang === 'mr'
              ? 'शेतकरी व कृषी अधिकाऱ्यांसाठी परिपूर्ण तांत्रिक प्रणाली'
              : 'Complete Farm-to-Gov Surveillance & Management Suite'}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mt-3">
            {lang === 'hi'
              ? 'आधुनिक AI, IoT सेंसर, सैटेलाइट हीटमैप और कृषि वैज्ञानिकों की विशेषज्ञता का संगम।'
              : lang === 'mr'
              ? 'AI, IoT सेन्सर्स, उपग्रह हीटमॅप आणि कृषी वैज्ञानिकांचे मार्गदर्शन एकाच ठिकाणी.'
              : 'End-to-end framework solving crop health diagnosis, community-level spread, and official action.'}
          </p>
        </div>

        {/* 2 Featured Large Cards with Real Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onNavigate(feat.action)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-gray-200/90 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Image */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gray-900">
                  <img
                    src={feat.image}
                    alt={feat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                    <Icon className="w-3.5 h-3.5 text-emerald-600" />
                    {feat.tag}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 group-hover:text-emerald-300 transition-colors">
                      {feat.title}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    {feat.subtitle}
                  </p>

                  <div className="flex items-center justify-between text-sm font-bold text-emerald-700 pt-4 border-t border-gray-100 group-hover:text-emerald-800">
                    <span>
                      {lang === 'hi' ? 'विस्तार से देखें' : lang === 'mr' ? 'सविस्तर पहा' : 'Explore Platform Feature'}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickPillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                onClick={() => onNavigate(pillar.action)}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${pillar.color} transition-transform group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-base mb-2 group-hover:text-emerald-700 transition-colors">
                    {pillar.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <span>{lang === 'hi' ? 'खोलें' : lang === 'mr' ? 'उघडा' : 'Open'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

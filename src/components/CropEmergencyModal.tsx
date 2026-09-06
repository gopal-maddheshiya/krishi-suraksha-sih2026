import { useState } from 'react';
import { 
  AlertOctagon, X, PhoneCall, Bug, Flame, 
  Droplets, AlertTriangle 
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

interface CropEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CropEmergencyModal({ isOpen, onClose }: CropEmergencyModalProps) {
  const { lang } = useLang();
  const [selectedEmergency, setSelectedEmergency] = useState<string>('locust');

  if (!isOpen) return null;

  const emergencies = [
    {
      id: 'locust',
      icon: Bug,
      title: lang === 'hi' ? 'टिड्डी दल / कीट प्रकोप' : lang === 'mr' ? 'टोळधाड / कीड हल्ला' : 'Locust / Swarm Attack',
      severity: 'high',
      timeCritical: '0 - 6 घंटे के भीतर',
      tag: 'CIBRC Emergency',
      immediateSteps: [
        {
          step: 1,
          action: lang === 'hi' ? 'खेत की मेड़ों पर ध्वनि व धुआं करें:' : 'Make noise & smoke at field borders:',
          detail: lang === 'hi' ? 'थाली, ढोल या ट्रैक्टर के हॉर्न से टिड्डियों को बैठने न दें।' : 'Deter swarm landing with noise.'
        },
        {
          step: 2,
          action: lang === 'hi' ? 'बैरियर स्प्रे (Barrier Spray):' : 'Border barrier spray:',
          detail: lang === 'hi' ? 'क्लोरपायरीफॉस 20% EC @ 2.5 ml/लीटर पानी या नीम तेल 1500ppm खेत की सीमाओं पर छिड़कें।' : 'Chlorpyrifos 20% EC @ 2.5 ml/L or Neem Oil at perimeter.'
        },
        {
          step: 3,
          action: lang === 'hi' ? 'सामूहिक सूचना दें:' : 'Notify community:',
          detail: lang === 'hi' ? 'नजदीकी कृषि अधिकारी या ग्राम प्रधान को तत्काल सूचित करें।' : 'Alert local Agriculture Officer / KVK immediately.'
        }
      ]
    },
    {
      id: 'armyworm',
      icon: Flame,
      title: lang === 'hi' ? 'फॉल आर्मीवर्म / इल्ली हमला' : lang === 'mr' ? 'लष्करी अळी हल्ला' : 'Fall Armyworm Outbreak',
      severity: 'high',
      timeCritical: '12 घंटे के भीतर',
      tag: 'ICAR Protocol',
      immediateSteps: [
        {
          step: 1,
          action: lang === 'hi' ? 'पोंगे (Whorl) में सीधा प्रयोग:' : 'Target the plant whorl directly:',
          detail: lang === 'hi' ? 'इल्लियां पत्तियों के मध्य पोंगे में छिपती हैं, दवा का फव्वारा सीधे केंद्र पर मारें।' : 'Spray directly into central whorls where larvae hide.'
        },
        {
          step: 2,
          action: lang === 'hi' ? 'अनुशंसित रसायन व मात्रा:' : 'Target formulation:',
          detail: lang === 'hi' ? 'क्लोरेंट्रानिलिप्रोल (Chlorantraniliprole 18.5% SC) @ 0.4 ml प्रति लीटर पानी (80 ml/एकड़)।' : 'Chlorantraniliprole 18.5% SC @ 0.4 ml/L (80 ml/acre).'
        },
        {
          step: 3,
          action: lang === 'hi' ? 'जैविक प्रथम उपचार:' : 'Bio-control alternative:',
          detail: lang === 'hi' ? 'रेत और सूखी राख (9:1) का मिश्रण पोंगे में डालें या नीम तेल 5 ml/L छिड़कें।' : 'Dust fine dry sand + ash into whorls or neem oil 5 ml/L.'
        }
      ]
    },
    {
      id: 'wilt',
      icon: Droplets,
      title: lang === 'hi' ? 'अचानक उकठा / पौधा सूखना' : lang === 'mr' ? 'अचानक झाड सुकणे (उकठा)' : 'Sudden Wilt / Root Rot',
      severity: 'critical',
      timeCritical: '24 घंटे के भीतर',
      tag: 'Root Pathology',
      immediateSteps: [
        {
          step: 1,
          action: lang === 'hi' ? 'सिंचाई तुरंत रोकें:' : 'Stop watering immediately:',
          detail: lang === 'hi' ? 'अधिक पानी से फफूंद तेजी से फैलती है। क्यारी से अतिरिक्त पानी बाहर निकालें।' : 'Drain waterlogged fields immediately to starve fungal growth.'
        },
        {
          step: 2,
          action: lang === 'hi' ? 'तने के पास ड्रेंचिंग (Drenching):' : 'Stem base drenching:',
          detail: lang === 'hi' ? 'कॉपर ऑक्सीक्लोराइड (COC 50% WP) @ 2.5-3.0 ग्राम/लीटर से पौधे की जड़ें भिगोएं।' : 'Copper Oxychloride (COC 50% WP) @ 2.5-3.0 g/L root drench.'
        },
        {
          step: 3,
          action: lang === 'hi' ? 'जैविक कवच (Trichoderma):' : 'Bio-fungicide protective shield:',
          detail: lang === 'hi' ? 'ट्राइकोडर्मा विरिडी (10 ग्राम/लीटर) गोबर की खाद में मिलाकर जड़ों में डालें।' : 'Apply Trichoderma viride enriched organic manure at base.'
        }
      ]
    },
    {
      id: 'whitefly',
      icon: AlertTriangle,
      title: lang === 'hi' ? 'सफेद मक्खी व पीला मोज़ेक' : lang === 'mr' ? 'पांढरी माशी व पिवळा मोझॅक' : 'Whitefly & Yellow Mosaic',
      severity: 'moderate',
      timeCritical: '24 घंटे के भीतर',
      tag: 'Vector Control',
      immediateSteps: [
        {
          step: 1,
          action: lang === 'hi' ? 'पीले चिपचिपे कार्ड लगाएं:' : 'Deploy yellow sticky traps:',
          detail: lang === 'hi' ? 'प्रति एकड़ 15-20 पीले चिपचिपे ट्रैप फसल की ऊंचाई पर लगाएं।' : 'Install 15-20 yellow sticky traps per acre at canopy level.'
        },
        {
          step: 2,
          action: lang === 'hi' ? 'रसायन छिड़काव:' : 'Foliar spray:',
          detail: lang === 'hi' ? 'डाइएफेन्थियुरॉन (Diafenthiuron 50% WP) @ 1.25 ग्राम/लीटर या नीम तेल 1500ppm @ 4 ml/L।' : 'Diafenthiuron 50% WP @ 1.25 g/L or Neem Oil @ 4 ml/L.'
        },
        {
          step: 3,
          action: lang === 'hi' ? 'रोगी पौधे उखाड़ें:' : 'Rogue out infected plants:',
          detail: lang === 'hi' ? 'पीले मोज़ेक से गंभीर रूप से ग्रसित पौधों को उखाड़कर जमीन में दबा दें।' : 'Uproot severely infected mosaic plants to stop viral spread.'
        }
      ]
    }
  ];

  const activeData = emergencies.find((e) => e.id === selectedEmergency) || emergencies[0];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-red-900 text-white p-4 sm:p-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
              <AlertOctagon className="w-6 h-6 text-rose-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-950/70 text-rose-200 px-2.5 py-0.5 rounded-full border border-rose-500/40">
                  {lang === 'hi' ? 'आपातकालीन प्रोटोकॉल' : 'Emergency Protocol'}
                </span>
                <span className="text-[11px] text-rose-100 font-semibold">
                  {lang === 'hi' ? 'ICAR / KVK मान्यता प्राप्त' : 'ICAR / KVK Certified'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black mt-1 leading-snug">
                {lang === 'hi' ? 'फसल आपातकालीन सहायता (24 घंटे में बचाव)' : 'Crop Emergency First-Aid (24h Action)'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Emergency Type Selector Pills */}
        <div className="p-3 sm:px-5 bg-stone-50 border-b border-stone-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {emergencies.map((item) => {
            const isSelected = item.id === selectedEmergency;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedEmergency(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none cursor-pointer ${
                  isSelected
                    ? 'bg-rose-700 text-white shadow-xs scale-102'
                    : 'bg-white hover:bg-stone-100 border border-stone-200 text-stone-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Emergency Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                {activeData.tag}
              </span>
              <h4 className="text-base sm:text-lg font-black text-stone-900 mt-1">
                {activeData.title}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 font-bold block">{lang === 'hi' ? 'कार्रवाई समय सीमा:' : 'Critical Window:'}</span>
              <span className="text-xs font-black text-rose-700">{activeData.timeCritical}</span>
            </div>
          </div>

          {/* Action Steps */}
          <div className="space-y-3">
            {activeData.immediateSteps.map((s) => (
              <div 
                key={s.step} 
                className="p-3.5 rounded-2xl bg-stone-50/90 border border-stone-200/80 flex items-start gap-3 transition-all hover:bg-rose-50/30"
              >
                <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-stone-900 text-xs sm:text-sm">
                    {s.action}
                  </div>
                  <p className="text-xs text-stone-600 font-medium leading-relaxed">
                    {s.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Safety Precaution Strip */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-950 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span className="font-medium">
              {lang === 'hi' 
                ? 'सावधानी: तेज धूप में छिड़काव न करें। मास्क व दस्ताने पहनें और हवा की विपरीत दिशा में कभी स्प्रे न करें।'
                : 'Safety: Avoid spraying during peak afternoon heat. Always wear gloves and mask.'}
            </span>
          </div>
        </div>

        {/* Footer: 1-Tap Free Kisan Helpline Dial Button */}
        <div className="p-3.5 sm:p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-600 text-center sm:text-left">
            <span className="font-bold text-stone-900">{lang === 'hi' ? 'संदेह है?' : 'Need urgent advice?'}</span> {lang === 'hi' ? 'सरकारी वैज्ञानिक से सीधे फोन पर बात करें' : 'Speak to an official agronomist directly'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="tel:18001801551"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-emerald-200" />
              <span>{lang === 'hi' ? '📞 1800-180-1551 (टोल-फ्री)' : '📞 1800-180-1551 (Toll-Free)'}</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
            >
              {lang === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

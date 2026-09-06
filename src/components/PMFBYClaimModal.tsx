import { useState } from 'react';
import { 
  ShieldCheck, X, PhoneCall, AlertTriangle, CheckCircle2, 
  FileText, Clock, Building2, HelpCircle, ExternalLink 
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

interface PMFBYClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropName?: string;
  diagnosedIssue?: string;
}

export default function PMFBYClaimModal({ isOpen, onClose, cropName = 'फसल', diagnosedIssue = 'गंभीर रोग प्रकोप' }: PMFBYClaimModalProps) {
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: lang === 'hi' ? '72 घंटे के भीतर सूचना देना अनिवार्य:' : 'Mandatory 72-Hour Notification:',
      desc: lang === 'hi' 
        ? 'फसल में 50% से अधिक क्षति होने पर घटना के 72 घंटे के भीतर PMFBY पोर्टल, टोल-फ्री 14447 या बैंक में सूचना दर्ज करें।'
        : 'Report crop damage within 72 hours via PMFBY portal, toll-free 14447, or your bank.'
    },
    {
      step: 2,
      title: lang === 'hi' ? 'आवश्यक दस्तावेज तैयार रखें:' : 'Required Claim Documents:',
      desc: lang === 'hi'
        ? '1. आधार कार्ड • 2. बैंक पासबुक • 3. भू-अभिलेख (खसरा/खतौनी) • 4. क्षति की जियो-टैग फोटो (इस ऐप से जनरेटेड पर्चा)।'
        : '1. Aadhaar Card • 2. Bank Passbook • 3. Land record (Khasra) • 4. Geo-tagged damage photos.'
    },
    {
      step: 3,
      title: lang === 'hi' ? 'सर्वेक्षक (Surveyor) द्वारा भौतिक सत्यापन:' : 'Physical Survey Verification:',
      desc: lang === 'hi'
        ? 'सूचना दर्ज होने के 7 से 10 दिनों में बीमा कंपनी व कृषि विभाग का संयुक्त दल खेत का भौतिक सत्यापन करेगा।'
        : 'A joint inspection team verifies field loss within 7-10 days of claim intimation.'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip with Government Shield Styling */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-4 sm:p-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner text-xl">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-950 text-amber-200 px-2 py-0.5 rounded-full border border-amber-500/40">
                  Government Scheme
                </span>
                <span className="text-[11px] text-amber-100 font-semibold">
                  भारत सरकार • कृषि मंत्रालय
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black mt-1 leading-snug">
                {lang === 'hi' ? 'PM फसल बीमा योजना (PMFBY) क्लेम गाइड' : 'PM Fasal Bima (PMFBY) Claim Guide'}
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

        {/* Severe Damage Alert Context Bar */}
        <div className="p-3 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between gap-2 text-xs text-amber-950 font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>{cropName}</strong> में <strong>{diagnosedIssue}</strong> का गंभीर प्रकोप दर्ज हुआ है।
            </span>
          </div>
          <span className="text-[10px] font-black uppercase text-rose-800 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded">
            Severe Loss (&gt;50%)
          </span>
        </div>

        {/* Body Steps */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="space-y-3">
            {steps.map((s) => (
              <div key={s.step} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-stone-900 text-xs sm:text-sm">
                    {s.title}
                  </div>
                  <p className="text-xs text-stone-600 font-medium leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Time Critical Warning */}
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-1">
            <div className="font-black flex items-center gap-1.5 text-rose-900">
              <Clock className="w-4 h-4 text-rose-600" />
              <span>{lang === 'hi' ? 'समय सीमा का विशेष ध्यान रखें:' : 'Strict Time Deadline:'}</span>
            </div>
            <p className="text-[11px] text-rose-800 font-medium leading-relaxed pl-5.5">
              {lang === 'hi'
                ? 'कीट या रोग से नुकसान होने पर 72 घंटे के बाद दी गई सूचना मान्य नहीं होती। तुरंत नीचे दिए नंबर पर फोन करके क्लेम इंटिमेशन नंबर (Claim Intimation No.) प्राप्त करें।'
                : 'Intimations delayed beyond 72 hours are rejected by insurance surveyors. Call 14447 immediately.'}
            </p>
          </div>
        </div>

        {/* Footer Dialing Actions */}
        <div className="p-3.5 sm:p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-600 text-center sm:text-left">
            <span className="font-bold text-stone-900">PMFBY टोल-फ्री हेल्पलाइन:</span> 14447 (24x7)
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="tel:14447"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-amber-100" />
              <span>📞 14447 पर क्लेम दर्ज करें</span>
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

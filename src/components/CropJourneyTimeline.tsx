import { useState, useEffect } from 'react';
import { 
  Sprout, Camera, Cpu, UserCheck, 
  CheckCircle2, ArrowRight, Clock, ShieldCheck 
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';

interface CropJourneyTimelineProps {
  onCheckCrop: () => void;
  onViewAdvisory: () => void;
}

export default function CropJourneyTimeline({
  onCheckCrop,
  onViewAdvisory,
}: CropJourneyTimelineProps) {
  const { lang } = useLang();
  const { activeFarm, latestObservation } = useFarmContext();

  const isObserved = !!latestObservation;
  const isDiagnosed = !!latestObservation?.diagnoses?.length;
  const isExpertReviewed = latestObservation?.status === 'verified';
  const isPendingExpert = latestObservation?.status === 'pending_expert' || latestObservation?.status === 'processing';

  const steps = [
    {
      id: 'step_farm',
      title: lang === 'hi' ? 'खेत व फसल पंजीकृत' : 'Farm & Crop Registered',
      desc: `${activeFarm?.farm_name || 'My Farm'} • ${activeFarm?.crop?.name || 'Cotton'} (${activeFarm?.area_acres || 2.5} Acres)`,
      icon: Sprout,
      status: 'completed',
    },
    {
      id: 'step_scan',
      title: lang === 'hi' ? 'फसल की फोटो जांच' : 'Crop Photo Screening',
      desc: isObserved 
        ? `${lang === 'hi' ? 'पत्ती की जांच की गई' : 'Leaf photo analyzed'}`
        : `${lang === 'hi' ? 'पहली जांच लंबित' : 'Awaiting first photo'}`,
      icon: Camera,
      status: isObserved ? 'completed' : 'active',
    },
    {
      id: 'step_ai',
      title: lang === 'hi' ? 'AI प्रारंभिक विश्लेषण' : 'AI Preliminary Screening',
      desc: isDiagnosed
        ? `${latestObservation?.diagnoses?.[0]?.disease?.name || 'Symptom pattern detected'}`
        : `${lang === 'hi' ? 'स्वचालित लक्षण जांच' : 'Automated symptom detection'}`,
      icon: Cpu,
      status: isDiagnosed ? 'completed' : isObserved ? 'active' : 'pending',
    },
    {
      id: 'step_expert',
      title: lang === 'hi' ? 'कृषि विशेषज्ञ सत्यापन' : 'Expert Verification',
      desc: isExpertReviewed
        ? `${latestObservation?.expert_reviews?.[0]?.expert_diagnosis || 'Verified by Agronomist'}`
        : isPendingExpert
        ? `${lang === 'hi' ? 'वैज्ञानिक समीक्षाधीन' : 'Under Expert Review'}`
        : `${lang === 'hi' ? 'सत्यापन का विकल्प' : 'Official review available'}`,
      icon: UserCheck,
      status: isExpertReviewed ? 'completed' : isPendingExpert ? 'active' : 'pending',
    },
    {
      id: 'step_advisory',
      title: lang === 'hi' ? 'प्रमाणित कार्य योजना' : 'Certified Action Plan',
      desc: `${lang === 'hi' ? 'ICAR गैर-रासायनिक व सांस्कृतिक उपाय' : 'ICAR IPM Non-Chemical Practices'}`,
      icon: ShieldCheck,
      status: isObserved ? 'completed' : 'pending',
    },
  ];

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-gray-200/90 shadow-sm mb-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-gray-900 flex items-center gap-2">
            <span>{lang === 'hi' ? 'आपकी फसल की यात्रा' : 'My Crop Health Journey'}</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {lang === 'hi' ? 'खेत पंजीकरण से लेकर विशेषज्ञ सत्यापन और सलाह तक की पूरी प्रक्रिया' : 'End-to-end trace from farm setup to expert verification'}
          </p>
        </div>

        <button
          onClick={isObserved ? onViewAdvisory : onCheckCrop}
          className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
        >
          <span>{isObserved ? (lang === 'hi' ? 'सलाह देखें' : 'View Action') : (lang === 'hi' ? 'जांच शुरू करें' : 'Start Check')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal / Vertical Timeline Flow */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';

          return (
            <div
              key={step.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[110px] ${
                isCompleted
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : isActive
                  ? 'bg-amber-50/70 border-amber-300 text-amber-950 ring-2 ring-amber-400/30'
                  : 'bg-gray-50/60 border-gray-200 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isActive
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <span className="text-[10px] font-mono font-bold text-gray-400">
                  0{idx + 1}
                </span>
              </div>

              <div>
                <h4 className={`text-xs font-extrabold ${isCompleted ? 'text-emerald-900' : isActive ? 'text-amber-900' : 'text-gray-600'}`}>
                  {step.title}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

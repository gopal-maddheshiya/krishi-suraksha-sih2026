import { useState, useEffect } from 'react';
import { 
  Leaf, Search, Volume2, VolumeX, ShieldCheck, 
  CheckCircle2, AlertTriangle, UserCheck, BookOpen, 
  Sparkles, Sprout, Info, ChevronRight, X
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { 
  AdvisoryService, 
  VERIFIED_AGRI_KNOWLEDGE_BASE, 
  type StructuredAdvisory 
} from '@/services/AdvisoryService';
import { Section, SectionHeader, Card } from './ui';

export default function AdvisoryList() {
  const { lang, t } = useLang();
  const [searchQuery, setSearchQuery] = useState('');
  const [knowledgeList, setKnowledgeList] = useState<StructuredAdvisory[]>([]);
  const [selectedAdvisory, setSelectedAdvisory] = useState<StructuredAdvisory | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const results = AdvisoryService.searchKnowledgeBase(searchQuery);
    setKnowledgeList(results);
  }, [searchQuery]);

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      AdvisoryService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      const ok = AdvisoryService.speakAdvisoryText(text, lang);
      if (ok) setIsSpeaking(true);
    }
  };

  return (
    <Section id="advisory" tone="teal">
      <SectionHeader 
        title={lang === 'hi' ? 'कृषि सलाह एवं कार्य योजना (What to do)' : 'Farmer Action Plan & Agricultural Advisory'} 
        subtitle={lang === 'hi' ? 'ICAR एवं कृषि विज्ञान केंद्र द्वारा सत्यापित सुरक्षित, गैर-रासायनिक व निवारक मार्गदर्शन' : 'Source-verified, non-chemical agronomic guidance and field inspection steps'} 
      />

      {/* Search Bar & Quick Crop Badges */}
      <div className="max-w-4xl mx-auto mb-6 space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'hi' ? 'फसल या बीमारी खोजें (उदा. कपास, सोयाबीन रस्ट, टमाटर)...' : 'Search crop or problem (e.g. Cotton Blight, Soybean Rust, Tomato)...'}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-900 outline-none focus:border-teal-500"
          />
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['Cotton', 'Soybean', 'Tomato', 'Rice', 'Grapes'].map((c) => (
            <button
              key={c}
              onClick={() => setSearchQuery(c)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                searchQuery.toLowerCase() === c.toLowerCase()
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {c}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-rose-600 hover:underline px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Advisory Cards Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {knowledgeList.map((item, idx) => (
          <div
            key={idx}
            onClick={() => {
              setSelectedAdvisory(item);
              setIsSpeaking(false);
            }}
            className="p-5 rounded-3xl bg-white border border-gray-200/90 shadow-sm hover:border-teal-400 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                  {item.cropName}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {item.knowledgeVersion}
                </span>
              </div>

              <h4 className="font-extrabold text-gray-900 text-base mb-1">
                {item.issueName}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {item.fieldInspectionSteps[0]}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-teal-700 mt-3">
              <span>View Action Plan</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* ACTION ADVISORY MODAL / DRAWER */}
      {selectedAdvisory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-800 to-emerald-800 text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white/20 rounded-md">
                    {selectedAdvisory.cropName}
                  </span>
                  <span className="text-xs text-teal-200 font-medium">
                    Part: {selectedAdvisory.affectedPart}
                  </span>
                </div>
                <h3 className="font-extrabold text-base sm:text-lg">
                  {selectedAdvisory.issueName}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSpeak(`${selectedAdvisory.cropName}. ${selectedAdvisory.issueName}. Immediate Action: ${selectedAdvisory.immediateNonChemicalActions.join('. ')}`)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
                  title="Listen (Audio)"
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5 text-rose-300" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => {
                    setSelectedAdvisory(null);
                    AdvisoryService.stopSpeaking();
                    setIsSpeaking(false);
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: 4 Action Sections */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              
              {/* 1. What to check in field */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-teal-600" />
                  <span>1. What to check in your field (निरीक्षण):</span>
                </div>
                <ul className="text-xs text-gray-800 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
                  {selectedAdvisory.fieldInspectionSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* 2. Immediate Safe Non-Chemical Actions */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>2. Immediate Safe Actions (तुरंत क्या करें):</span>
                </div>
                <ul className="text-xs text-emerald-950 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
                  {selectedAdvisory.immediateNonChemicalActions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              {/* 3. Long-term Prevention */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                <div className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>3. Preventive Measures (बचाव के उपाय):</span>
                </div>
                <ul className="text-xs text-blue-950 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
                  {selectedAdvisory.preventiveActions.map((prev, i) => (
                    <li key={i}>{prev}</li>
                  ))}
                </ul>
              </div>

              {/* 4. When to seek expert help */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span>4. When to consult an agricultural expert:</span>
                </div>
                <ul className="text-xs text-amber-950 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
                  {selectedAdvisory.escalationTriggers.map((trig, i) => (
                    <li key={i}>{trig}</li>
                  ))}
                </ul>
              </div>

              {/* Verified Source Attribution Footer */}
              <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Source: {selectedAdvisory.sourceOrganization} ({selectedAdvisory.sourceDocument}, {selectedAdvisory.sourceDate})
                </span>
                <span>Version: {selectedAdvisory.knowledgeVersion}</span>
              </div>

            </div>

          </div>
        </div>
      )}

    </Section>
  );
}

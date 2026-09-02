import { useState, useEffect } from 'react';
import { 
  History, Clock, CheckCircle2, ShieldAlert, 
  HelpCircle, UserCheck, ChevronRight, Sprout 
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { supabase } from '@/lib/supabase';
import { ObservationService, type CropObservationEntity } from '@/services/ObservationService';

export default function DiagnosisHistory() {
  const { lang } = useLang();
  const [history, setHistory] = useState<CropObservationEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;
        if (userId) {
          const records = await ObservationService.getFarmerObservations(userId);
          setHistory(records);
        }
      } catch (err) {
        console.warn('History load exception:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  if (loading) return null;
  if (history.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-3xl p-5 sm:p-7 border border-gray-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          <span>{lang === 'hi' ? 'हालिया फसल जाँच इतिहास' : 'Recent Crop Checks & History'}</span>
        </h3>
        <span className="text-xs text-gray-400 font-medium">
          {history.length} {lang === 'hi' ? 'अवलोकन' : 'Checks'}
        </span>
      </div>

      <div className="space-y-3">
        {history.slice(0, 5).map((item) => {
          const isVerified = item.status === 'verified';
          const isPending = item.status === 'pending_expert' || item.status === 'submitted';
          const dateStr = new Date(item.observed_at).toLocaleDateString([], { month: 'short', day: 'numeric' });

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between hover:bg-emerald-50/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">
                    {item.description || 'Field Foliar Inspection'}
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{dateStr}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    isVerified
                      ? 'bg-emerald-100 text-emerald-800'
                      : isPending
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {isVerified ? (
                    <>
                      <UserCheck className="w-3 h-3" />
                      <span>{lang === 'hi' ? 'सत्यापित' : 'Expert Verified'}</span>
                    </>
                  ) : isPending ? (
                    <>
                      <HelpCircle className="w-3 h-3" />
                      <span>{lang === 'hi' ? 'समीक्षा लंबित' : 'Under Review'}</span>
                    </>
                  ) : (
                    <span>{item.status}</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

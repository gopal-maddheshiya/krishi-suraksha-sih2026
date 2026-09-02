import { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, 
  HelpCircle, CheckCircle2, CloudRain, Clock, 
  Info, ChevronDown, ChevronUp, Bell, BellOff, X
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { 
  RiskAssessmentService, 
  type RiskAssessmentResult, 
  type InAppAlertEntity 
} from '@/services/RiskAssessmentService';
import { WeatherService } from '@/services/WeatherService';
import { LocationService } from '@/services/LocationService';
import { supabase } from '@/lib/supabase';

export default function RiskAssessmentCard() {
  const { lang } = useLang();
  const [assessment, setAssessment] = useState<RiskAssessmentResult | null>(null);
  const [alerts, setAlerts] = useState<InAppAlertEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFactors, setShowFactors] = useState(false);

  useEffect(() => {
    const loadRisk = async () => {
      setLoading(true);
      try {
        let farmId = 'local_farm_default';
        let cropName = 'Cotton';
        let cropStage = 'Vegetative';
        let district = 'Pune';
        let state = 'Maharashtra';
        let lat = 18.5204;
        let lon = 73.8567;

        const activeFarmStr = localStorage.getItem('crophealth_active_farm');
        if (activeFarmStr) {
          try {
            const f = JSON.parse(activeFarmStr);
            farmId = f.id || farmId;
            cropName = f.crop?.name || cropName;
            cropStage = f.crop?.stage || cropStage;
            district = f.district || district;
            state = f.state || state;
            lat = f.latitude || lat;
            lon = f.longitude || lon;
          } catch {}
        }

        const weather = await WeatherService.fetchRealWeather({
          latitude: lat,
          longitude: lon,
          district,
          state,
          source: 'gps',
        });

        const result = await RiskAssessmentService.evaluateCropRisk({
          farmId,
          cropName,
          cropStage,
          weather,
          district,
          state,
        });

        setAssessment(result);

        // Fetch alerts
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const userAlerts = await RiskAssessmentService.getFarmerAlerts(authData.user.id);
          setAlerts(userAlerts);
        }
      } catch (err) {
        console.warn('Risk evaluation notice:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRisk();
  }, []);

  const handleDismissAlert = async (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    await RiskAssessmentService.markAlertAsRead(id);
  };

  if (loading) return null;
  if (!assessment) return null;

  const isHigh = assessment.riskLevel === 'high' || assessment.riskLevel === 'critical';
  const isMod = assessment.riskLevel === 'moderate';

  return (
    <div className="space-y-4 mb-6">
      
      {/* IN-APP ALERT BANNER (If High Risk) */}
      {alerts.length > 0 && alerts.map((alert) => (
        <div
          key={alert.id}
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start justify-between gap-3 shadow-sm animate-in fade-in duration-200"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-700">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm text-rose-900">
                {lang === 'hi' ? alert.title_hi || alert.title : alert.title}
              </div>
              <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                {lang === 'hi' ? alert.message_hi || alert.message : alert.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDismissAlert(alert.id)}
            className="p-1.5 rounded-lg hover:bg-rose-200/60 text-rose-700"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* MAIN EXPLAINABLE RISK CARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-200/90 shadow-sm space-y-4">
        
        {/* Header with Risk Level Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className={`w-5 h-5 ${isHigh ? 'text-rose-600' : isMod ? 'text-amber-600' : 'text-emerald-600'}`} />
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {lang === 'hi' ? 'फसल रोग व कीट पूर्व-जोखिम' : 'Crop Disease Early-Warning Risk'}
              </h3>
              <div className="text-[11px] text-gray-400">
                {assessment.cropName} ({assessment.cropStage})
              </div>
            </div>
          </div>

          <span
            className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
              isHigh
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : isMod
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            {assessment.riskLevel === 'high'
              ? (lang === 'hi' ? 'उच्च जोखिम' : 'High Risk')
              : assessment.riskLevel === 'moderate'
              ? (lang === 'hi' ? 'मध्यम जोखिम' : 'Moderate Risk')
              : (lang === 'hi' ? 'अनुकूल स्थिति (कम जोखिम)' : 'Low Risk')}
          </span>
        </div>

        {/* Primary Factor Summary */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            {lang === 'hi' ? 'मुख्य जोखिम कारण:' : 'Primary Risk Factor:'}
          </div>
          <p className="text-sm font-semibold text-gray-800 leading-relaxed">
            {lang === 'hi' ? assessment.primaryRiskFactorHi : assessment.primaryRiskFactor}
          </p>
        </div>

        {/* Observational Advice */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
          <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'hi' ? 'खेत में अनुशंसित निरीक्षण कदम:' : 'Recommended Field Observation:'}</span>
          </div>
          <ul className="text-xs text-emerald-950 space-y-1 list-disc list-inside font-medium leading-relaxed">
            {(lang === 'hi' ? assessment.recommendedActionsHi : assessment.recommendedActions).map((act, i) => (
              <li key={i}>{act}</li>
            ))}
          </ul>
        </div>

        {/* Explainability Accordion: "Why?" */}
        {assessment.contributingFactors.length > 0 && (
          <div className="pt-1">
            <button
              onClick={() => setShowFactors(!showFactors)}
              className="w-full flex items-center justify-between text-xs font-bold text-gray-600 hover:text-emerald-700 py-1"
            >
              <span>{lang === 'hi' ? 'यह जोखिम स्तर क्यों निर्धारित हुआ? (Why?)' : 'Why this risk level? (See contributing evidence)'}</span>
              {showFactors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFactors && (
              <div className="mt-2 space-y-2 animate-in fade-in duration-150">
                {assessment.contributingFactors.map((fact, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-gray-50/90 border border-gray-100 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-gray-800">
                        {lang === 'hi' ? fact.factorHi : fact.factor}
                      </div>
                      <p className="text-gray-600 mt-0.5 leading-relaxed">
                        {lang === 'hi' ? fact.descriptionHi : fact.description}
                      </p>
                    </div>
                    <span className="font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 flex-shrink-0 text-[11px]">
                      {fact.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rule Version & Validity Footnote */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 flex-wrap gap-2">
          <span>Rule: {assessment.ruleVersion} ({assessment.ruleSource})</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Valid for 24h
          </span>
        </div>

      </div>

    </div>
  );
}

import { useState, useEffect } from 'react';
import { 
  MapPin, TrendingUp, TrendingDown, Minus, 
  ShieldCheck, Sparkles, Filter, Calendar, 
  Clock, AlertTriangle, Layers, X, Info, Sprout
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { 
  SurveillanceService, 
  type AreaSurveillanceSummary, 
  type SurveillanceActivityLevel 
} from '@/services/SurveillanceService';
import { PAN_INDIA_STATES } from '@/services/LocationService';
import { Section, SectionHeader, Card } from './ui';

export default function HotspotMap() {
  const { lang } = useLang();
  const [surveillanceData, setSurveillanceData] = useState<AreaSurveillanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<AreaSurveillanceSummary | null>(null);

  // Filters
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [timeWindowDays, setTimeWindowDays] = useState(7);

  const fetchSurveillance = async () => {
    setLoading(true);
    try {
      const data = await SurveillanceService.getAreaSurveillance({
        state: selectedState === 'all' ? undefined : selectedState,
        district: selectedDistrict === 'all' ? undefined : selectedDistrict,
        crop: selectedCrop === 'all' ? undefined : selectedCrop,
        days: timeWindowDays,
      });
      setSurveillanceData(data);
    } catch (e) {
      console.warn('Surveillance fetch error:', e);
      setSurveillanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveillance();
  }, [selectedState, selectedDistrict, selectedCrop, timeWindowDays]);

  // Aggregate Top Statistics
  const areasMonitored = surveillanceData.length;
  const highActivityAreas = surveillanceData.filter((a) => a.activityLevel === 'high').length;
  const totalVerified = surveillanceData.reduce((acc, a) => acc + a.verifiedReports, 0);
  const totalPreliminary = surveillanceData.reduce((acc, a) => acc + a.preliminaryReports, 0);

  const currentStateObj = PAN_INDIA_STATES.find((s) => s.name === selectedState);

  return (
    <Section id="hotspots" tone="red">
      <SectionHeader 
        title={lang === 'hi' ? 'क्षेत्रीय फसल रोग एवं कीट निगरानी (Surveillance)' : 'Area-Level Crop Disease & Pest Surveillance'} 
        subtitle={lang === 'hi' ? 'कृषि विशेषज्ञों एवं अधिकारियों के लिए गोपनीयता-सुरक्षित क्षेत्रीय रोग गतिविधि विश्लेषण' : 'Privacy-preserving aggregated epidemiological surveillance for extension officers'} 
      />

      {/* Top 4 Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6 max-w-5xl mx-auto">
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Areas Monitored</div>
          <div className="text-2xl font-black mt-1">{areasMonitored}</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Increased Activity</div>
          <div className="text-2xl font-black mt-1">{highActivityAreas}</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Verified Reports</div>
          <div className="text-2xl font-black mt-1">{totalVerified}</div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Preliminary Screenings</div>
          <div className="text-2xl font-black mt-1">{totalPreliminary}</div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/90 shadow-sm mb-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          {/* State Selector */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict('all');
              }}
              className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold outline-none"
            >
              {PAN_INDIA_STATES.map((s) => (
                <option key={s.code} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* District Selector */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold outline-none"
            >
              <option value="all">All Districts in {selectedState}</option>
              {currentStateObj?.districts.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Crop Selector */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold outline-none"
            >
              <option value="all">All Crops</option>
              <option value="Cotton">Cotton</option>
              <option value="Soybean">Soybean</option>
              <option value="Tomato">Tomato</option>
              <option value="Rice">Rice</option>
              <option value="Sugarcane">Sugarcane</option>
            </select>
          </div>

          {/* Time Window */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Time Window</label>
            <select
              value={timeWindowDays}
              onChange={(e) => setTimeWindowDays(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold outline-none"
            >
              <option value={1}>Last 24 Hours</option>
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>
          </div>

        </div>
      </div>

      {/* Surveillance Area Grid / Cards */}
      <div className="max-w-5xl mx-auto space-y-3.5">
        {loading && (
          <div className="py-16 text-center text-sm font-semibold text-gray-500">
            Aggregating surveillance statistics from database...
          </div>
        )}

        {!loading && surveillanceData.length === 0 && (
          <div className="py-16 text-center rounded-3xl bg-gray-50 border border-dashed border-gray-200 p-8">
            <Layers className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <div className="font-bold text-gray-700 text-base">No activity recorded in this time window.</div>
            <p className="text-xs text-gray-400 mt-1">Surveillance aggregations update automatically as field observations are verified.</p>
          </div>
        )}

        {!loading && surveillanceData.map((area) => {
          const isHigh = area.activityLevel === 'high';
          const isMod = area.activityLevel === 'moderate';
          const isInsufficient = area.activityLevel === 'insufficient_data';

          return (
            <div
              key={area.areaId}
              onClick={() => !isInsufficient && setSelectedArea(area)}
              className={`p-4 sm:p-5 rounded-3xl bg-white border transition-all ${
                isInsufficient
                  ? 'border-gray-200 opacity-60 cursor-default'
                  : 'border-gray-200/90 hover:border-indigo-400 cursor-pointer shadow-sm'
              } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    isHigh
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : isMod
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : isInsufficient
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <MapPin className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-gray-900 text-base">
                      {area.taluka} ({area.district})
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {area.state}
                    </span>

                    {/* Semantic Activity Badge */}
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800'
                          : isMod
                          ? 'bg-amber-100 text-amber-800'
                          : isInsufficient
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isHigh ? 'Increased Activity' : isMod ? 'Moderate Activity' : isInsufficient ? 'Insufficient Reports (< 3)' : 'Low Activity'}
                    </span>
                  </div>

                  {/* Evidence Breakdown */}
                  {!isInsufficient ? (
                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-emerald-800">
                        {area.verifiedReports} verified reports
                      </span>
                      <span>•</span>
                      <span className="text-blue-700">
                        {area.preliminaryReports} preliminary
                      </span>
                      <span>•</span>
                      <span className="text-gray-400">
                        Crops: {area.affectedCrops.join(', ') || 'Cotton'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 mt-1 italic">
                      Fewer than 3 reports in this area. Data is privacy-protected.
                    </div>
                  )}
                </div>
              </div>

              {/* Trend & Action */}
              {!isInsufficient && (
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100">
                    {area.trend === 'increasing' ? (
                      <>
                        <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-rose-700">Increasing</span>
                      </>
                    ) : area.trend === 'decreasing' ? (
                      <>
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Decreasing</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-3.5 h-3.5 text-gray-400" />
                        <span>Stable</span>
                      </>
                    )}
                  </div>

                  <button className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors">
                    View Details
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AREA DETAIL MODAL */}
      {selectedArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-indigo-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-indigo-300" />
                <div>
                  <h3 className="font-extrabold text-base">
                    {selectedArea.taluka}, {selectedArea.district}
                  </h3>
                  <div className="text-xs text-indigo-200">
                    {selectedArea.state} • Area Epidemiological Summary
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedArea(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              
              {/* Evidence Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">Verified</div>
                  <div className="text-xl font-black text-emerald-950 mt-0.5">{selectedArea.verifiedReports}</div>
                </div>

                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                  <div className="text-[10px] font-bold text-blue-700 uppercase">Preliminary</div>
                  <div className="text-xl font-black text-blue-950 mt-0.5">{selectedArea.preliminaryReports}</div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Total in Area</div>
                  <div className="text-xl font-black text-gray-800 mt-0.5">{selectedArea.totalReports}</div>
                </div>
              </div>

              {/* Affected Crops */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">Affected Crops in this Taluka</div>
                <div className="flex gap-2 flex-wrap mt-1">
                  {selectedArea.affectedCrops.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white rounded-lg border border-gray-200 text-xs font-bold text-gray-800 flex items-center gap-1">
                      <Sprout className="w-3 h-3 text-emerald-600" />
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Privacy-Safe Aggregation: Individual farm boundaries and farmer contact details are strictly withheld from surveillance queries.
                </span>
              </div>

            </div>

          </div>
        </div>
      )}

    </Section>
  );
}

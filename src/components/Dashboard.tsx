import { useState, useEffect } from 'react';
import { FileText, Flame, CloudRain, Bug, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { supabase, type CropReport, type DiseaseHotspot, type WeatherRisk, type PestTrap } from '@/lib/supabase';
import { Section, SectionHeader, Card, StatCard, LoadingState, EmptyState, SolidBadge, type Tone } from './ui';

const HOTSPOT_TONE: Record<string, Tone> = { active: 'red', contained: 'amber', resolved: 'green' };

export default function Dashboard() {
  const { t } = useLang();
  const [reports, setReports] = useState<CropReport[]>([]);
  const [hotspots, setHotspots] = useState<DiseaseHotspot[]>([]);
  const [weather, setWeather] = useState<WeatherRisk[]>([]);
  const [traps, setTraps] = useState<PestTrap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: r }, { data: h }, { data: w }, { data: tr }] = await Promise.all([
          supabase.from('crop_reports').select('*').order('created_at', { ascending: false }),
          supabase.from('disease_hotspots').select('*'),
          supabase.from('weather_risks').select('*'),
          supabase.from('pest_traps').select('*'),
        ]);
        setReports(r || []);
        setHotspots(h || []);
        setWeather(w || []);
        setTraps(tr || []);
      } catch {
        setReports([]);
        setHotspots([]);
        setWeather([]);
        setTraps([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Section id="dashboard" tone="indigo">
        <LoadingState tone="indigo" />
      </Section>
    );
  }

  const activeHotspots = hotspots.filter((h) => h.status === 'active').length;
  const highRiskWeather = weather.filter((w) => w.risk_level === 'high').length;
  const highRiskTraps = traps.filter((tr) => tr.risk_level === 'high').length;

  const cropCounts: Record<string, number> = {};
  reports.forEach((r) => {
    cropCounts[r.crop_type] = (cropCounts[r.crop_type] || 0) + 1;
  });
  const maxCropCount = Math.max(...Object.values(cropCounts), 1);

  const severityCounts: Record<string, number> = { high: 0, moderate: 0, low: 0, unknown: 0 };
  reports.forEach((r) => {
    severityCounts[r.severity] = (severityCounts[r.severity] || 0) + 1;
  });

  const totalData = reports.length + hotspots.length + weather.length + traps.length;

  return (
    <Section id="dashboard" tone="indigo">
      <SectionHeader title={t('dashboard_title')} subtitle={t('dashboard_subtitle')} />

      {totalData === 0 ? (
        <EmptyState icon={<BarChart3 className="w-6 h-6" />} title={t('common_none')} description={t('dashboard_subtitle')} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard icon={<FileText className="w-4 h-4 text-white" />} value={reports.length} label={t('dashboard_total_reports')} tone="green" />
            <StatCard icon={<Flame className="w-4 h-4 text-white" />} value={activeHotspots} label={t('dashboard_active_hotspots')} tone="red" />
            <StatCard icon={<CloudRain className="w-4 h-4 text-white" />} value={highRiskWeather} label={t('dashboard_high_risk_weather')} tone="blue" />
            <StatCard icon={<Bug className="w-4 h-4 text-white" />} value={highRiskTraps} label={t('dashboard_high_risk_traps')} tone="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <Card className="p-4 sm:p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </span>
                {t('dashboard_reports_by_crop')}
              </h3>
              {Object.keys(cropCounts).length === 0 ? (
                <p className="text-sm text-gray-400 py-4">{t('common_none')}</p>
              ) : (
                <div className="space-y-2.5">
                  {Object.entries(cropCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([crop, count]) => (
                      <div key={crop} className="flex items-center gap-3">
                        <div className="w-20 text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0 truncate">{crop}</div>
                        <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-lg flex items-center justify-end pr-2 transition-all"
                            style={{ width: `${(count / maxCropCount) * 100}%` }}
                          >
                            <span className="text-[11px] text-white font-bold">{count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>

            <Card className="p-4 sm:p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                {t('dashboard_severity_dist')}
              </h3>
              <div className="grid grid-cols-4 gap-2 sm:gap-3 items-end pt-2">
                {[
                  { label: t('upload_severity_high'), value: severityCounts.high, color: 'from-rose-400 to-red-500' },
                  { label: t('upload_severity_moderate'), value: severityCounts.moderate, color: 'from-amber-400 to-orange-500' },
                  { label: t('upload_severity_low'), value: severityCounts.low, color: 'from-emerald-400 to-green-500' },
                  { label: t('upload_severity_unknown'), value: severityCounts.unknown, color: 'from-gray-300 to-gray-400' },
                ].map((s, i) => {
                  const maxVal = Math.max(...Object.values(severityCounts), 1);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div className="text-base sm:text-lg font-bold text-gray-900">{s.value}</div>
                      <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden flex items-end">
                        <div className={`w-full bg-gradient-to-b ${s.color} rounded-b-lg transition-all duration-500`} style={{ height: `${(s.value / maxVal) * 100}%` }} />
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-gray-500 text-center font-medium leading-tight">{s.label}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </span>
                {t('dashboard_recent_reports')}
              </h3>
              {reports.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">{t('common_none')}</p>
              ) : (
                <div className="space-y-1.5 max-h-80 overflow-y-auto -mr-1 pr-1 scrollbar-thin">
                  {reports.slice(0, 10).map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{r.reporter_name} · {r.crop_type}</div>
                        <div className="text-[11px] text-gray-500 truncate">{r.detected_disease || 'Pending'} · {r.location_name}</div>
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0">{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-4 sm:p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </span>
                {t('dashboard_hotspot_list')}
              </h3>
              {hotspots.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">{t('common_none')}</p>
              ) : (
                <div className="space-y-1.5 max-h-80 overflow-y-auto -mr-1 pr-1 scrollbar-thin">
                  {hotspots.map((h) => (
                    <div key={h.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{h.location_name}</div>
                        <div className="text-[11px] text-gray-500 truncate">{h.disease_type} · {h.crop_type}</div>
                      </div>
                      <SolidBadge tone={HOTSPOT_TONE[h.status] || 'green'}>{t(`hotspot_${h.status}`)}</SolidBadge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </Section>
  );
}

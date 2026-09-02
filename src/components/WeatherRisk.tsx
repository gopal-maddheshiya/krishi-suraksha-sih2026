import { useState, useEffect } from 'react';
import { 
  CloudRain, Wind, Thermometer, Droplets, RefreshCw, 
  ShieldCheck, CheckCircle2, Calendar, Info, AlertTriangle
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { WeatherService } from '@/services/WeatherService';
import { LocationService } from '@/services/LocationService';
import type { WeatherDataBundle, GeoLocation } from '@/services/types';
import LocationBar from './LocationBar';
import RiskAssessmentCard from './RiskAssessmentCard';
import { Section } from './ui';

export default function WeatherRisk() {
  const { lang } = useLang();
  const [location, setLocation] = useState<GeoLocation>(() => LocationService.getSavedLocation());
  const [weatherData, setWeatherData] = useState<WeatherDataBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadWeather = async (targetLoc: GeoLocation) => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await WeatherService.fetchRealWeather(targetLoc);
      setWeatherData(data);
    } catch (err) {
      console.warn('Weather load error:', err);
      setFetchError(
        err instanceof Error
          ? err.message
          : 'Weather data is temporarily unavailable. Please verify connection and retry.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(location);
  }, [location]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadWeather(location);
  };

  const handleLocationChange = (newLoc: GeoLocation) => {
    setLocation(newLoc);
    loadWeather(newLoc);
  };

  return (
    <Section id="weather" tone="blue">
      {/* Header with Location & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span>{lang === 'hi' ? 'मौसम व कृषि जोखिम' : lang === 'mr' ? 'हवामान व कृषी जोखीम' : 'Current Weather & Crop Risk'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {lang === 'hi' 
              ? 'आर्द्रता, तापमान और वर्षा के आधार पर फंगल व कीट प्रसार के जोखिम कारक' 
              : lang === 'mr'
              ? 'आर्द्रता, तापमान आणि पावसाच्या आधारे बुरशी व कीड प्रसाराचा अंदाज'
              : 'Meteorological observations and microclimate risk indicators for timely prevention'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LocationBar onLocationChange={handleLocationChange} />
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh weather data"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-emerald-700 hover:bg-gray-50 active:scale-95 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Explainable Disease Risk Early Warning Assessment */}
      <RiskAssessmentCard />

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-600">
            {lang === 'hi' ? 'मौसम डेटा प्राप्त हो रहा है...' : 'Fetching meteorological feed...'}
          </p>
        </div>
      )}

      {!loading && fetchError && (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-center max-w-lg mx-auto space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
          <div className="font-bold text-rose-950 text-base">
            {lang === 'hi' ? 'मौसम जानकारी उपलब्ध नहीं है' : 'Weather Information Temporarily Unavailable'}
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            {fetchError}
          </p>
          <button
            onClick={() => loadWeather(location)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            {lang === 'hi' ? 'पुनः प्रयास करें (Retry)' : 'Retry'}
          </button>
        </div>
      )}

      {!loading && !fetchError && weatherData && (
        <div className="space-y-6">
          
          {/* Main Today's Weather & Risk Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Current Weather Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-300 bg-sky-800/60 px-3 py-1 rounded-full border border-sky-600/40">
                    {weatherData.status === 'offline_cached'
                      ? (lang === 'hi' ? 'सहेजा गया मौसम' : 'Saved Weather')
                      : weatherData.status === 'cached'
                      ? (lang === 'hi' ? 'कैश्ड मौसम' : 'Current Weather')
                      : (lang === 'hi' ? 'मौसम (ताजा)' : 'Current Weather')}
                  </span>
                  <span className="text-xs text-sky-200/80">
                    {weatherData.fetchedAt}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl sm:text-5xl font-black">{weatherData.current.temperatureC}°C</span>
                  <span className="text-sm text-sky-200">
                    {lang === 'hi' ? `महसूस: ${weatherData.current.apparentTemperatureC}°C` : `Feels: ${weatherData.current.apparentTemperatureC}°C`}
                  </span>
                </div>

                <div className="text-lg font-semibold text-sky-100 mb-6">
                  {weatherData.current.weatherConditionText}
                </div>
              </div>

              {/* 4 Microclimate Indicators */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-sky-700/50">
                <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl text-center">
                  <Droplets className="w-4 h-4 text-sky-300 mx-auto mb-1" />
                  <div className="text-xs text-sky-200">{lang === 'hi' ? 'आर्द्रता' : 'Humidity'}</div>
                  <div className="text-sm font-bold">{weatherData.current.relativeHumidityPct}%</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl text-center">
                  <CloudRain className="w-4 h-4 text-sky-300 mx-auto mb-1" />
                  <div className="text-xs text-sky-200">{lang === 'hi' ? 'वर्षा' : 'Rain'}</div>
                  <div className="text-sm font-bold">{weatherData.current.precipitationMm} mm</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl text-center">
                  <Wind className="w-4 h-4 text-sky-300 mx-auto mb-1" />
                  <div className="text-xs text-sky-200">{lang === 'hi' ? 'हवा' : 'Wind'}</div>
                  <div className="text-sm font-bold">{weatherData.current.windSpeedKmh} km/h</div>
                </div>
              </div>
            </div>

            {/* Agricultural Risk Advisory Card */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>{lang === 'hi' ? 'खेत स्तर का जोखिम व सलाह' : lang === 'mr' ? 'शेत पातळीवरील जोखीम व सल्ला' : 'Farm-Level Risk & Actionable Advisory'}</span>
                  </h3>

                  <span
                    className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full ${
                      weatherData.riskAssessment.overallRisk === 'high'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : weatherData.riskAssessment.overallRisk === 'moderate'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {weatherData.riskAssessment.overallRisk === 'high'
                      ? lang === 'hi' ? 'उच्च जोखिम' : 'High Risk'
                      : weatherData.riskAssessment.overallRisk === 'moderate'
                      ? lang === 'hi' ? 'मध्यम जोखिम' : 'Moderate Risk'
                      : lang === 'hi' ? 'अनुकूल मौसम' : 'Low Risk'}
                  </span>
                </div>

                {/* Primary Risk Explanation */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {lang === 'hi' ? 'मुख्य मौसम कारक:' : 'Contributing Weather Factor:'}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                    {lang === 'hi'
                      ? weatherData.riskAssessment.primaryRiskFactorHi
                      : lang === 'mr'
                      ? weatherData.riskAssessment.primaryRiskFactorMr
                      : weatherData.riskAssessment.primaryRiskFactor}
                  </p>
                </div>

                {/* Actionable Advice */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'hi' ? 'किसान के लिए अनुशंसित कदम:' : 'Recommended Action:'}</span>
                  </div>
                  <p className="text-sm font-medium text-emerald-950 leading-relaxed">
                    {lang === 'hi'
                      ? weatherData.riskAssessment.actionableAdviceHi
                      : lang === 'mr'
                      ? weatherData.riskAssessment.actionableAdviceMr
                      : weatherData.riskAssessment.actionableAdvice}
                  </p>
                </div>
              </div>

              {/* Source Attribution footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Source: {weatherData.sourceAttribution}
                </span>
                <span>{weatherData.location.district}, {weatherData.location.state}</span>
              </div>
            </div>

          </div>

          {/* 7-Day Forecast Grid */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{lang === 'hi' ? '7-दिवसीय मौसम व रोग जोखिम पूर्वानुमान' : '7-Day Agricultural Forecast'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weatherData.forecast.map((day, idx) => {
                const dayDate = new Date(day.date);
                const dayName = idx === 0 
                  ? (lang === 'hi' ? 'आज' : 'Today')
                  : dayDate.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'short' });

                return (
                  <div
                    key={day.date}
                    className="bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-sm text-center flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-gray-900 mb-1">{dayName}</div>
                      <div className="text-[11px] text-gray-400 mb-2">{dayDate.getDate()} {dayDate.toLocaleDateString('en-US', { month: 'short' })}</div>
                      
                      <div className="text-base font-extrabold text-gray-800">
                        {day.maxTempC}° <span className="text-xs font-normal text-gray-400">{day.minTempC}°</span>
                      </div>

                      <div className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                        {day.weatherConditionText}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 space-y-1">
                      <div className="text-[10px] text-blue-600 font-semibold flex items-center justify-center gap-1">
                        <CloudRain className="w-3 h-3" />
                        <span>{day.precipitationProbabilityPct}%</span>
                      </div>

                      <div
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          day.fungalRisk === 'high'
                            ? 'bg-red-100 text-red-700'
                            : day.fungalRisk === 'moderate'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {day.fungalRisk === 'high' ? 'High Risk' : day.fungalRisk === 'moderate' ? 'Mod Risk' : 'Safe'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </Section>
  );
}

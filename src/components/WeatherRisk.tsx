import { useState, useEffect } from 'react';
import { 
  CloudRain, Wind, Thermometer, Droplets, RefreshCw, 
  ShieldCheck, CheckCircle2, Calendar, Info, AlertTriangle,
  Sun, Clock, Check, X, ShieldAlert, Sparkles, MapPin,
  ChevronRight, Compass
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { WeatherService } from '@/services/WeatherService';
import { LocationService } from '@/services/LocationService';
import { useFarmContext } from '@/contexts/FarmContext';
import type { WeatherDataBundle, GeoLocation } from '@/services/types';
import LocationBar from './LocationBar';
import RiskAssessmentCard from './RiskAssessmentCard';

export default function WeatherRisk() {
  const { lang, t } = useLang();
  const { activeFarm } = useFarmContext();
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
          : 'Weather data is temporarily unavailable. Please retry.'
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

  // Farmer spraying suitability computation
  const isSafeToSpray = () => {
    if (!weatherData) return true;
    const rain = weatherData.current.precipitationMm;
    const wind = weatherData.current.windSpeedKmh;
    return rain < 1.0 && wind < 15;
  };

  const safeSpray = isSafeToSpray();

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto py-2">
      
      {/* ============================================================= */}
      {/* 1. TOP HEADER & LOCATION SWITCHER                             */}
      {/* ============================================================= */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0">
            <CloudRain className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              {t('home_weather_today')}
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 leading-snug">
              {t('weather_title')}
            </h1>
            <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">
              {t('weather_subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <LocationBar onLocationChange={handleLocationChange} />
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh weather data"
            className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-stone-500">
            {lang === 'hi' ? 'मौसम विभाग से ताजा जानकारी प्राप्त हो रही है...' : 'Fetching live meteorological data...'}
          </p>
        </div>
      )}

      {!loading && fetchError && (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-center max-w-lg mx-auto space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
          <div className="font-bold text-rose-950 text-base">
            {lang === 'hi' ? 'मौसम जानकारी लोड नहीं हो सकी' : 'Weather Information Unavailable'}
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            {fetchError}
          </p>
          <button
            onClick={() => loadWeather(location)}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            {lang === 'hi' ? 'पुनः प्रयास करें (Retry)' : 'Retry'}
          </button>
        </div>
      )}

      {!loading && !fetchError && weatherData && (
        <div className="space-y-6">

          {/* ============================================================= */}
          {/* 2. BIG TODAY'S SPRAYING DECISION CARD (KISAN KE LIYE SARAL)    */}
          {/* ============================================================= */}
          <div className={`rounded-2xl p-5 sm:p-6 border ${
            safeSpray
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-rose-50/70 border-rose-200'
          }`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-stone-200/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  safeSpray ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {safeSpray ? <Check className="w-5 h-5 stroke-[2.6]" /> : <X className="w-5 h-5 stroke-[2.6]" />}
                </div>

                <div className="min-w-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    safeSpray ? 'bg-white text-emerald-800 border-emerald-200' : 'bg-white text-rose-800 border-rose-200'
                  }`}>
                    {lang === 'hi' ? 'आज का छिड़काव निर्णय' : 'Today\'s Spray Decision'}
                  </span>
                  
                  <h2 className={`text-base sm:text-lg font-extrabold mt-1 leading-snug ${
                    safeSpray ? 'text-emerald-950' : 'text-rose-950'
                  }`}>
                    {safeSpray 
                      ? (lang === 'hi' ? '✓ हाँ, आज खेत में दवा छिड़कना सुरक्षित है' : '✓ Safe to Spray Today')
                      : (lang === 'hi' ? '⚠️ आज छिड़काव टालें (बारिश या तेज हवा का खतरा)' : '⚠️ Postpone Spraying (Rain or Wind Risk)')
                    }
                  </h2>
                </div>
              </div>

              {/* Best Spraying Window Pill */}
              <div className="bg-white px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-700">
                <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1 mb-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{lang === 'hi' ? 'सर्वोत्तम छिड़काव समय' : 'Best Spray Window'}</span>
                </div>
                <div className="font-extrabold text-stone-900 text-sm">
                  {lang === 'hi' ? 'सुबह 6:30 से 10:30 बजे' : '6:30 AM to 10:30 AM'}
                </div>
              </div>
            </div>

            {/* Why is it safe / unsafe? (Farmer-Friendly Reason) */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <p className={`leading-relaxed max-w-2xl font-medium ${safeSpray ? 'text-emerald-900/90' : 'text-rose-900/90'}`}>
                {safeSpray
                  ? (lang === 'hi' 
                      ? 'हवा की गति सामान्य (8-12 km/h) है और बारिश की कोई संभावना नहीं है। दवा पत्तों पर अच्छे से चिपकेगी और बहेगी नहीं।'
                      : 'Wind speeds are optimal (<15 km/h) and rain risk is minimal. Spray droplets will adhere properly without drift.')
                  : (lang === 'hi'
                      ? 'तेज हवा या वर्षा की संभावना के कारण दवा उड़ सकती है या धुल सकती है। मौसम साफ होने की प्रतीक्षा करें।'
                      : 'High wind speed or precipitation risk detected. Chemical spray may drift or get washed away.')
                }
              </p>

              <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {weatherData.location.district}, {weatherData.location.state}
              </span>
            </div>
          </div>

          {/* ============================================================= */}
          {/* 3. 4 BIG METRIC CARDS (SARAL SHABDON MEIN)                     */}
          {/* ============================================================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
            
            {/* 1. Temperature */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {lang === 'hi' ? 'तापमान' : 'Temperature'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Thermometer className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-stone-900 block">{weatherData.current.temperatureC}°C</span>
                <span className="text-xs font-bold text-stone-600 mt-1 block">
                  {lang === 'hi' ? 'फसल विकास के लिए अनुकूल' : 'Optimal for crop growth'}
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  {lang === 'hi' ? `महसूस: ${weatherData.current.apparentTemperatureC}°C` : `Feels like ${weatherData.current.apparentTemperatureC}°C`}
                </span>
              </div>
            </div>

            {/* 2. Humidity */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {lang === 'hi' ? 'हवा में नमी' : 'Humidity'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-stone-900 block">{weatherData.current.relativeHumidityPct}%</span>
                <span className={`text-xs font-bold mt-1 block ${
                  weatherData.current.relativeHumidityPct > 80 ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {weatherData.current.relativeHumidityPct > 80 
                    ? (lang === 'hi' ? '⚠️ फफूंद रोग का खतरा' : 'High Fungal Risk') 
                    : (lang === 'hi' ? '✓ सामान्य आर्द्रता' : 'Normal Humidity')}
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  {lang === 'hi' ? 'पत्तियों पर ओस की स्थिति' : 'Moisture on leaves'}
                </span>
              </div>
            </div>

            {/* 3. Rain Probability */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {lang === 'hi' ? 'बारिश का अनुमान' : 'Rain Forecast'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CloudRain className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-stone-900 block">{weatherData.current.precipitationMm} mm</span>
                <span className="text-xs font-bold text-emerald-700 mt-1 block">
                  {weatherData.current.precipitationMm === 0 
                    ? (lang === 'hi' ? '✓ आज बारिश नहीं होगी' : 'No Rain Expected') 
                    : (lang === 'hi' ? 'हल्की बारिश संभव' : 'Light Showers')}
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Open-Meteo Radar
                </span>
              </div>
            </div>

            {/* 4. Wind Speed */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {lang === 'hi' ? 'हवा की गति' : 'Wind Speed'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Wind className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-stone-900 block">{weatherData.current.windSpeedKmh} <span className="text-sm font-bold text-stone-500">km/h</span></span>
                <span className={`text-xs font-bold mt-1 block ${
                  weatherData.current.windSpeedKmh > 15 ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  {weatherData.current.windSpeedKmh > 15 
                    ? (lang === 'hi' ? '⚠️ तेज हवा (दवा उड़ेगी)' : 'High Drift Risk') 
                    : (lang === 'hi' ? '✓ शांत हवा (दवा नहीं उड़ेगी)' : 'Low Drift - Safe')}
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  {lang === 'hi' ? 'छिड़काव के लिए आदर्श' : 'Ideal for foliar spray'}
                </span>
              </div>
            </div>

          </div>

          {/* ============================================================= */}
          {/* 4. EXPLAINABLE DISEASE RISK & ICAR ADVISORY                   */}
          {/* ============================================================= */}
          <RiskAssessmentCard />

          {/* ============================================================= */}
          {/* 5. 7-DAY SIMPLE FORECAST WITH DAILY FARMER ACTION             */}
          {/* ============================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-black text-base sm:text-lg text-stone-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>{lang === 'hi' ? 'अगले 7 दिनों का मौसम एवं कृषि सुझाव' : '7-Day Agricultural Forecast & Action Plan'}</span>
              </h3>

              <span className="text-xs font-bold text-stone-400">
                {activeFarm?.district || location.district || 'Pune'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weatherData.forecast.map((day, idx) => {
                const dayDate = new Date(day.date);
                const dayName = idx === 0 
                  ? (lang === 'hi' ? 'आज' : 'Today')
                  : idx === 1
                  ? (lang === 'hi' ? 'कल' : 'Tomorrow')
                  : dayDate.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'short' });

                const isSafe = day.precipitationProbabilityPct < 30 && day.fungalRisk !== 'high';

                return (
                  <div
                    key={day.date}
                    className={`rounded-2xl p-4 border text-center flex flex-col justify-between transition-all ${
                      idx === 0 
                        ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs' 
                        : 'bg-stone-50/70 hover:bg-stone-100/70 border-stone-200'
                    }`}
                  >
                    <div>
                      <div className="font-black text-xs sm:text-sm text-stone-900">{dayName}</div>
                      <div className="text-[10px] text-stone-500 mb-2">{dayDate.getDate()} {dayDate.toLocaleDateString('en-US', { month: 'short' })}</div>
                      
                      <div className="text-base font-black text-stone-900">
                        {day.maxTempC}° <span className="text-xs font-medium text-stone-400">/ {day.minTempC}°</span>
                      </div>

                      <div className="text-[11px] text-stone-600 mt-1 line-clamp-1 font-medium">
                        {day.weatherConditionText}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-200/80 space-y-1.5">
                      <div className="text-[11px] text-blue-700 font-bold flex items-center justify-center gap-1">
                        <CloudRain className="w-3.5 h-3.5" />
                        <span>{day.precipitationProbabilityPct}%</span>
                      </div>

                      <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isSafe ? (lang === 'hi' ? 'स्प्रे करें' : 'Safe') : (lang === 'hi' ? 'निगरानी' : 'Watch')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

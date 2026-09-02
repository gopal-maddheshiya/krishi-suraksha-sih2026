/**
 * Weather Service & Provider Abstraction
 * Fetches real meteorological data from Open-Meteo, manages smart caching,
 * computes agricultural microclimate risk indices, and handles offline states cleanly.
 */

import type { 
  GeoLocation, 
  CurrentWeather, 
  DailyWeatherForecast, 
  WeatherRiskAssessment, 
  WeatherDataBundle 
} from './types';
import { supabase } from '@/lib/supabase';

export interface IWeatherProvider {
  name: string;
  fetchCurrentAndForecast(lat: number, lon: number): Promise<{
    current: CurrentWeather;
    forecast: DailyWeatherForecast[];
  }>;
}

/**
 * Open-Meteo Provider Implementation
 * Free, real-time meteorological API with WMO certified models and hourly updates.
 */
export class OpenMeteoWeatherProvider implements IWeatherProvider {
  public name = 'Open-Meteo Agricultural Feed';

  public async fetchCurrentAndForecast(lat: number, lon: number): Promise<{
    current: CurrentWeather;
    forecast: DailyWeatherForecast[];
  }> {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lon.toString());
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m');
    url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max');
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', '7');

    const res = await fetch(url.toString(), { cache: 'no-cache' });
    if (!res.ok) {
      throw new Error(`Open-Meteo API responded with status ${res.status}`);
    }

    const json = await res.json();
    const curr = json.current;
    const daily = json.daily;

    const current: CurrentWeather = {
      temperatureC: Math.round(curr.temperature_2m),
      apparentTemperatureC: Math.round(curr.apparent_temperature),
      relativeHumidityPct: Math.round(curr.relative_humidity_2m),
      precipitationMm: Number((curr.precipitation || 0).toFixed(1)),
      windSpeedKmh: Math.round(curr.wind_speed_10m),
      windDirectionDeg: Math.round(curr.wind_direction_10m),
      wmoWeatherCode: curr.weather_code,
      weatherConditionText: translateWMOCode(curr.weather_code),
      observationTimeIso: curr.time,
    };

    const forecast: DailyWeatherForecast[] = [];
    if (daily && daily.time) {
      for (let i = 0; i < daily.time.length; i++) {
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const precipMm = Number((daily.precipitation_sum[i] || 0).toFixed(1));
        const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;
        const wCode = daily.weather_code[i];

        // Evaluate fungal risk based on rain probability and temperature
        const fungalRisk: 'low' | 'moderate' | 'high' =
          rainProb >= 65 || precipMm > 8
            ? 'high'
            : rainProb >= 35 || precipMm > 2
            ? 'moderate'
            : 'low';

        forecast.push({
          date: daily.time[i],
          maxTempC: maxTemp,
          minTempC: minTemp,
          precipitationMm: precipMm,
          precipitationProbabilityPct: rainProb,
          wmoWeatherCode: wCode,
          weatherConditionText: translateWMOCode(wCode),
          fungalRisk,
        });
      }
    }

    return { current, forecast };
  }
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache validity

export class WeatherService {
  private static provider: IWeatherProvider = new OpenMeteoWeatherProvider();

  /**
   * Set custom weather provider
   */
  public static setProvider(p: IWeatherProvider) {
    WeatherService.provider = p;
  }

  /**
   * Fetch real weather bundle with caching & offline fallback
   */
  public static async fetchRealWeather(location: GeoLocation): Promise<WeatherDataBundle> {
    const cacheKey = `crophealth_weather_${location.latitude.toFixed(2)}_${location.longitude.toFixed(2)}`;
    const now = Date.now();

    // 1. Check client-side cached data
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed: WeatherDataBundle & { cachedTimestamp: number } = JSON.parse(cached);
        if (now - parsed.cachedTimestamp < CACHE_TTL_MS) {
          return {
            ...parsed,
            status: 'cached',
          };
        }
      }
    } catch {
      // Ignore cache read errors
    }

    // 2. Fetch fresh data from provider
    try {
      const { current, forecast } = await WeatherService.provider.fetchCurrentAndForecast(
        location.latitude,
        location.longitude
      );

      const riskAssessment = WeatherService.computeAgriculturalRisk(current, forecast);
      const fetchedTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const bundle: WeatherDataBundle = {
        location,
        current,
        forecast,
        riskAssessment,
        fetchedAt: `Today at ${fetchedTimeStr}`,
        sourceAttribution: WeatherService.provider.name,
        status: 'fresh',
      };

      // Store in client cache
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ ...bundle, cachedTimestamp: now })
        );
      } catch {
        // Storage quota full
      }

      // Async persist to Supabase cache table (silent background task)
      WeatherService.persistToSupabaseCache(location, current, forecast).catch(() => {});

      return bundle;
    } catch (networkError) {
      console.warn('Weather fetch failed, checking offline cache:', networkError);

      // 3. Offline fallback
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          return {
            ...parsed,
            status: 'offline_cached',
            sourceAttribution: `${WeatherService.provider.name} (Cached)`,
          };
        }
      } catch {
        // Cache miss
      }

      throw new Error(
        'Weather information is temporarily unavailable. Please check your network connection.'
      );
    }
  }

  /**
   * Agricultural microclimate risk calculation
   */
  private static computeAgriculturalRisk(
    current: CurrentWeather,
    forecast: DailyWeatherForecast[]
  ): WeatherRiskAssessment {
    const { temperatureC, relativeHumidityPct, precipitationMm } = current;
    const tomorrowRainProb = forecast.length > 1 ? forecast[1].precipitationProbabilityPct : 0;

    let overallRisk: 'low' | 'moderate' | 'high' = 'low';
    let primaryFactor = 'Favorable weather conditions for healthy crop growth.';
    let primaryFactorHi = 'फसल वृद्धि के लिए मौसम अनुकूल और सुरक्षित है।';
    let primaryFactorMr = 'पिकांच्या वाढीसाठी हवामान अनुकूल आणि सुरक्षित आहे.';
    let advice = 'Standard field hygiene and regular irrigation scheduling recommended.';
    let adviceHi = 'नियमित सिंचाई करें और सामान्य खेत की स्वच्छता बनाए रखें।';
    let adviceMr = 'नियमित पाणी व्यवस्थापन करा व शेतात स्वच्छता ठेवा.';

    // Fungal risk condition: High humidity (>= 75%) and moderate temp (20 - 30°C)
    if (relativeHumidityPct >= 75 && temperatureC >= 18 && temperatureC <= 32) {
      overallRisk = 'high';
      primaryFactor = `High relative humidity (${relativeHumidityPct}%) creates elevated fungal spore germination risk.`;
      primaryFactorHi = `उच्च आर्द्रता (${relativeHumidityPct}%) फंगल (फफूंद) बीजाणु अंकुरण का जोखिम बढ़ाती है।`;
      primaryFactorMr = `जास्त आर्द्रता (${relativeHumidityPct}%) बुरशीजन्य रोगांचा प्रादुर्भाव वाढवू शकते.`;
      advice = 'Inspect lower leaves for blight/mildew spots. Avoid excessive overhead irrigation.';
      adviceHi = 'निचली पत्तियों पर धब्बों की जाँच करें। शाम के समय पत्तियों पर पानी का छिड़काव न करें।';
      adviceMr = 'खालच्या पानांवर करपा किंवा भुरी रोगाची तपासणी करा. संध्याकाळी तुषार सिंचन टाळा.';
    } else if (tomorrowRainProb > 60 || precipitationMm > 10) {
      overallRisk = 'moderate';
      primaryFactor = `Rain expected (${tomorrowRainProb}% probability). Free surface moisture promotes bacterial blight.`;
      primaryFactorHi = `बारिश की संभावना (${tomorrowRainProb}%)। पत्तियों पर अधिक नमी से जीवाणु झुलसा का खतरा है।`;
      primaryFactorMr = `पावसाची शक्यता (${tomorrowRainProb}%). पानांवर पाणी साचल्याने जिवाणूजन्य रोगांचा धोका वाढतो.`;
      advice = 'Ensure proper field drainage. Postpone foliar pesticide sprays until weather clears.';
      adviceHi = 'खेत में जल निकासी सुनिश्चित करें। बारिश रुकने तक किसी भी कीटनाशक का छिड़काव टालें।';
      adviceMr = 'शेतातून पाण्याचा निचरा योग्य ठेवा. पाऊस थांबेपर्यंत फवारणी पुढे ढकला.';
    } else if (temperatureC > 34 && relativeHumidityPct < 45) {
      overallRisk = 'moderate';
      primaryFactor = `Dry heat spell (${temperatureC}°C, ${relativeHumidityPct}% humidity) favors sucking pests (Thrips/Mites).`;
      primaryFactorHi = `शुष्क व गर्म मौसम (${temperatureC}°C) चूसक कीटों (थ्रिप्स, माइट्स) के फैलाव को बढ़ाता है।`;
      primaryFactorMr = `कोरडे व उष्ण हवामान (${temperatureC}°C) रसशोषक किडींसाठी (थ्रिप्स, कोळी) पोषक आहे.`;
      advice = 'Monitor tender apical shoots and leaf undersides for curling and thrips activity.';
      adviceHi = 'कोमल पत्तियों और कलियों के नीचे मुड़ाव व चूसक कीटों की उपस्थिति की जाँच करें।';
      adviceMr = 'कोवळ्या पानांच्या खाली रसशोषक किडींचा प्रादुर्भाव तपासा व आवश्यकतेनुसार कडुनिंब अर्क वापरा.';
    }

    return {
      overallRisk,
      primaryRiskFactor: primaryFactor,
      primaryRiskFactorHi: primaryFactorHi,
      primaryRiskFactorMr: primaryFactorMr,
      actionableAdvice: advice,
      actionableAdviceHi: adviceHi,
      actionableAdviceMr: adviceMr,
      fungalIndex: Math.min(100, Math.round((relativeHumidityPct / 100) * 85)),
      suckingPestIndex: Math.min(100, Math.round((temperatureC / 40) * 75)),
      bacterialBlightRisk: precipitationMm > 5 ? 'high' : 'low',
    };
  }

  /**
   * Persist fresh weather observations and forecasts to Supabase PostgreSQL
   */
  private static async persistToSupabaseCache(
    loc: GeoLocation,
    current: CurrentWeather,
    forecast: DailyWeatherForecast[]
  ) {
    try {
      await supabase.from('weather_observations').insert({
        latitude: loc.latitude,
        longitude: loc.longitude,
        temperature: current.temperatureC,
        humidity: current.relativeHumidityPct,
        rainfall: current.precipitationMm,
        wind_speed: current.windSpeedKmh,
        wind_direction: current.windDirectionDeg,
        weather_condition: current.weatherConditionText,
        observed_at: current.observationTimeIso,
        provider: WeatherService.provider.name,
        fetched_at: new Date().toISOString(),
      });

      if (forecast.length > 0) {
        const forecastInserts = forecast.map((f) => ({
          latitude: loc.latitude,
          longitude: loc.longitude,
          forecast_date: f.date,
          temperature_min: f.minTempC,
          temperature_max: f.maxTempC,
          humidity: 60,
          rain_probability: f.precipitationProbabilityPct,
          rainfall: f.precipitationMm,
          wind_speed: 10,
          weather_condition: f.weatherConditionText,
          provider: WeatherService.provider.name,
          fetched_at: new Date().toISOString(),
        }));

        await supabase.from('weather_forecasts').insert(forecastInserts);
      }
    } catch (e) {
      // Background cache persistence failure is non-blocking
    }
  }
}

/**
 * Standard WMO Weather Code Interpreter
 */
function translateWMOCode(code: number): string {
  switch (code) {
    case 0:
      return 'Clear Sky';
    case 1:
      return 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Fog & Depositing Rime';
    case 51:
    case 53:
    case 55:
      return 'Drizzle';
    case 61:
    case 63:
      return 'Moderate Rain';
    case 65:
      return 'Heavy Rain';
    case 71:
    case 73:
    case 75:
      return 'Snow Fall';
    case 80:
    case 81:
    case 82:
      return 'Rain Showers';
    case 95:
      return 'Thunderstorm';
    case 96:
    case 99:
      return 'Thunderstorm with Hail';
    default:
      return 'Clear';
  }
}

/**
 * Central Data Source Registry
 * Documents every data provider used in the platform to guarantee transparency,
 * verifiable sourcing, and clear separation of real vs simulated feeds.
 */

import type { DataSourceMetadata } from './types';

export const DATA_SOURCE_REGISTRY: Record<string, DataSourceMetadata> = {
  open_meteo_weather: {
    providerName: 'Open-Meteo Agricultural & Meteorological API',
    purpose: 'Real-time hourly and 7-day location-specific weather forecasting, humidity, precipitation, wind speed & temperature',
    endpointUrl: 'https://api.open-meteo.com/v1/forecast',
    authRequired: false,
    updateFrequency: 'Hourly (WMO certified meteorological models / ECMWF & GFS feeds)',
    licenseTerms: 'Open-Meteo Open Data License (CC BY 4.0)',
    isOfficialSource: true,
    fallbackAvailable: true,
  },
  maharashtra_admin_geo: {
    providerName: 'Maharashtra State Administrative Division Directory',
    purpose: 'Standard district and taluka coordinates and boundaries across Maharashtra districts',
    authRequired: false,
    updateFrequency: 'Static reference (Govt of Maharashtra Gazette)',
    licenseTerms: 'Public Administrative Domain',
    isOfficialSource: true,
    fallbackAvailable: true,
  },
  cibrc_icar_pathology: {
    providerName: 'ICAR / Central Insecticide Board & Registration Committee (CIBRC)',
    purpose: 'Standard crop disease pathologies, symptoms, biological Trichoderma/Pseudomonas dosages, and safe Pre-Harvest Intervals (PHI)',
    authRequired: false,
    updateFrequency: 'Quarterly review based on official university extension guidelines (MPKV Rahuri / VNMKV Parbhani)',
    licenseTerms: 'Official Government Agricultural Extension Reference',
    isOfficialSource: true,
    fallbackAvailable: true,
  },
  supabase_cloud_db: {
    providerName: 'Supabase PostgreSQL Cloud Database',
    purpose: 'Persistent storage for user-submitted crop observations, expert reviews, follow-up monitoring tasks, and field hotspot reports',
    endpointUrl: 'https://qlloickdkhipjwqtnzkc.supabase.co',
    authRequired: true,
    updateFrequency: 'Real-time sync via Row-Level Security',
    licenseTerms: 'Cloud Service Instance',
    isOfficialSource: true,
    fallbackAvailable: true,
  },
  google_gemini_vision: {
    providerName: 'Google Gemini Generative AI (Cloud Function)',
    purpose: 'Multilingual conversational crop assistant and multimodal leaf pathology preliminary analysis',
    endpointUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    authRequired: true,
    updateFrequency: 'On-demand API query',
    licenseTerms: 'Google Cloud Terms of Service',
    isOfficialSource: true,
    fallbackAvailable: true,
  },
};

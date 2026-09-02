/**
 * Production Domain Types & Data Contracts
 * Smart India Hackathon 2026 - Problem Statement 26131
 * Government of Maharashtra - Crop Health Management System
 */

import type { LanguageCode } from '@/lib/i18n';

// ---------------------------------------------------------------------------
// 1. Location & Administrative Hierarchy
// ---------------------------------------------------------------------------
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  source: 'gps' | 'district_selector' | 'fallback_default' | string;
  district: string;
  taluka?: string;
  village?: string;
  state: string;
  isGPSDetected?: boolean;
}

export interface AdministrativeDistrict {
  id: string;
  name: string;
  nameMr?: string;
  nameHi?: string;
  latitude: number;
  longitude: number;
  talukas?: string[];
}

// ---------------------------------------------------------------------------
// 2. Real Weather Data Models
// ---------------------------------------------------------------------------
export type AgriculturalRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface CurrentWeather {
  temperatureC: number;
  apparentTemperatureC: number;
  relativeHumidityPct: number;
  precipitationMm: number;
  windSpeedKmh: number;
  windDirectionDeg?: number;
  weatherCode?: number;
  wmoWeatherCode?: number;
  weatherConditionText: string;
  isDay?: boolean;
  observationTimeIso?: string;
  fetchedAt?: string;
  source?: string;
  attribution?: string;
}

export interface DailyWeatherForecast {
  date: string;
  maxTempC: number;
  minTempC: number;
  precipitationSumMm?: number;
  precipitationMm?: number;
  precipitationProbabilityPct: number;
  maxWindSpeedKmh?: number;
  weatherCode?: number;
  wmoWeatherCode?: number;
  weatherConditionText: string;
  fungalRisk: AgriculturalRiskLevel;
  pestRisk?: AgriculturalRiskLevel;
}

export interface WeatherRiskAssessment {
  overallRisk: AgriculturalRiskLevel;
  primaryRiskFactor: string;
  primaryRiskFactorHi: string;
  primaryRiskFactorMr: string;
  actionableAdvice: string;
  actionableAdviceHi: string;
  actionableAdviceMr: string;
  fungalSporeRisk?: AgriculturalRiskLevel;
  suckingPestRisk?: AgriculturalRiskLevel;
  bacterialRisk?: AgriculturalRiskLevel;
  fungalIndex?: number;
  suckingPestIndex?: number;
  bacterialBlightRisk?: 'low' | 'high';
}

export interface WeatherDataBundle {
  location: GeoLocation;
  current: CurrentWeather;
  forecast: DailyWeatherForecast[];
  riskAssessment: WeatherRiskAssessment;
  isRealData?: boolean;
  sourceAttribution: string;
  fetchedAt: string;
  status?: 'fresh' | 'cached' | 'offline_cached';
}

// ---------------------------------------------------------------------------
// 3. Crop & Disease Pathology Models (ICAR / CIBRC Aligned)
// ---------------------------------------------------------------------------
export interface CropInfo {
  id: string;
  name: string;
  nameMr: string;
  nameHi: string;
  scientificName: string;
  category: 'Cash Crops' | 'Oilseeds' | 'Vegetables' | 'Cereals' | 'Pulses' | 'Horticulture';
  commonStages?: string[];
  majorDiseases: string[];
  majorPests: string[];
}

export interface DiseasePathology {
  id: string;
  cropId: string;
  cropName: string;
  diseaseName: string;
  diseaseNameHi: string;
  diseaseNameMr: string;
  scientificName: string;
  pathogenType: 'fungal' | 'bacterial' | 'viral' | 'pest_infestation' | 'physiological';
  typicalSeverity: 'low' | 'moderate' | 'high' | 'critical';
  symptomsEn: string;
  symptomsHi: string;
  symptomsMr: string;
  organicRemedyEn: string;
  organicRemedyHi: string;
  organicRemedyMr: string;
  chemicalRemedyEn: string;
  chemicalRemedyHi: string;
  chemicalRemedyMr: string;
  approvedDosage: string;
  preHarvestIntervalDays: number;
  cibrcReference: string;
}

export interface DiagnosisResult {
  isIdentified: boolean;
  confidenceScore: number;
  suspectedIssue?: DiseasePathology | null;
  severityLevel: 'low' | 'moderate' | 'high' | 'critical' | 'unknown';
  diagnosticConfidenceRating?: string;
  disclaimer: string;
  disclaimerHi: string;
  disclaimerMr?: string;
  recommendationSummary?: string;
  needsExpertReferral?: boolean;
  analyzedAt?: string;
}

// ---------------------------------------------------------------------------
// 4. Pest Surveillance & ETL Thresholds
// ---------------------------------------------------------------------------
export interface PestETLStandard {
  pestId: string;
  commonName: string;
  commonNameHi: string;
  commonNameMr: string;
  scientificName: string;
  targetCrop: string;
  trapType: 'pheromone' | 'light' | 'sticky_yellow' | 'sticky_blue';
  etlThresholdCount: number;
  etlDescription: string;
  samplingIntervalHours: number;
  recommendedActionAboveETL: string;
}

// ---------------------------------------------------------------------------
// 5. Data Sourcing & Transparency Contracts
// ---------------------------------------------------------------------------
export interface DataSourceMetadata {
  providerName: string;
  purpose: string;
  endpointUrl?: string;
  authRequired: boolean;
  updateFrequency: string;
  licenseTerms: string;
  isOfficialSource: boolean;
  fallbackAvailable: boolean;
}

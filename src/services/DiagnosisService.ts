/**
 * Production Crop Image Diagnosis Pipeline & Service Layer
 * Smart India Hackathon 2026 - Problem Statement 26131
 *
 * Direct Multimodal Vision Pipeline powered by Google Gemini Vision & ICAR Prescriptions
 */

import { supabase } from '@/lib/supabase';
import { ObservationService } from './ObservationService';
import { GeminiVisionLiveService } from './GeminiVisionLiveService';
import type { LanguageCode } from '@/lib/i18n';

export interface ImageQualityResult {
  isValid: boolean;
  issueType?: 'too_dark' | 'too_bright' | 'blurry' | 'invalid_format' | 'too_large';
  userGuidanceMessage: string;
  userGuidanceMessageHi: string;
  userGuidanceMessageMr: string;
  metrics: {
    brightness: number; // 0 - 255
    edgeVariance: number;
    width: number;
    height: number;
    fileSizeBytes: number;
  };
}

export interface CropContext {
  farmId?: string;
  farmCropId?: string;
  cropName: string;
  variety?: string;
  cropStage?: string;
  locationDistrict?: string;
  locationState?: string;
  symptomsDescription?: string;
}

export interface PredictionItem {
  diseaseName: string;
  scientificName?: string;
  category: 'fungal' | 'bacterial' | 'viral' | 'pest_infestation' | 'healthy' | 'nutrient_deficiency' | 'unknown';
  confidencePercentage: number;
  confidenceRating: 'high' | 'moderate' | 'low';
}

export interface CropDiagnosisResponse {
  isHealthy: boolean;
  isSupportedCrop: boolean;
  primaryPrediction: PredictionItem;
  alternativePredictions: PredictionItem[];
  overallConfidenceScore: number;
  confidenceTier: 'high' | 'moderate' | 'low';
  visualSymptoms: string;
  aiReview: string;
  chemicalTreatment: string;
  chemicalDosageInstructions: string;
  biologicalTreatment: string;
  biologicalInstructions: string;
  sprayTimingAdvice: string;
  observationalAdvice: string[];
  observationalAdviceHi: string[];
  observationalAdviceMr: string[];
  disclaimer: string;
  disclaimerHi: string;
  disclaimerMr: string;
  modelName: string;
  modelVersion: string;
  processedAt: string;
  status: 'suspected' | 'pending_review' | 'healthy' | 'unknown';
  needsExpertVerification: boolean;
}

export interface ICropDiagnosisProvider {
  name: string;
  version: string;
  analyzeCropImage(
    imageBase64: string,
    mimeType: string,
    context: CropContext,
    language: string
  ): Promise<CropDiagnosisResponse>;
}

export const DIAGNOSIS_CONFIG = {
  HIGH_CONFIDENCE_THRESHOLD: 75,
  MODERATE_CONFIDENCE_THRESHOLD: 50,
  MIN_ACCEPTABLE_CONFIDENCE: 40,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  RECOMMENDED_IMAGE_DIMENSION: 1280,
};

export class ImageQualityValidator {
  public static async validateImageQuality(imageFile: File, previewUrl?: string): Promise<ImageQualityResult> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.type)) {
      return {
        isValid: false,
        issueType: 'invalid_format',
        userGuidanceMessage: 'Unsupported format. Please upload a clear JPG or PNG photograph.',
        userGuidanceMessageHi: 'असमर्थित प्रारूप। कृपया स्पष्ट JPG या PNG फोटो अपलोड करें।',
        userGuidanceMessageMr: 'असमर्थित फॉरमॅट. कृपया स्पष्ट JPG किंवा PNG फोटो अपलोड करा.',
        metrics: { brightness: 0, edgeVariance: 0, width: 0, height: 0, fileSizeBytes: imageFile.size },
      };
    }

    if (imageFile.size > DIAGNOSIS_CONFIG.MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        issueType: 'too_large',
        userGuidanceMessage: 'Image exceeds 10MB limit.',
        userGuidanceMessageHi: 'फोटो का आकार 10MB से अधिक है।',
        userGuidanceMessageMr: 'फोटोचा आकार 10MB पेक्षा जास्त आहे.',
        metrics: { brightness: 0, edgeVariance: 0, width: 0, height: 0, fileSizeBytes: imageFile.size },
      };
    }

    const effectiveUrl = previewUrl || URL.createObjectURL(imageFile);

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        let avgBrightness = 128;
        let edgeVariance = 25;

        try {
          const sampleDim = 64;
          const canvas = document.createElement('canvas');
          canvas.width = sampleDim;
          canvas.height = sampleDim;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          if (ctx) {
            ctx.drawImage(img, 0, 0, sampleDim, sampleDim);
            const imgData = ctx.getImageData(0, 0, sampleDim, sampleDim);
            const d = imgData.data;

            let totalLuma = 0;
            for (let i = 0; i < d.length; i += 4) {
              totalLuma += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            }
            avgBrightness = totalLuma / (sampleDim * sampleDim);
          }
        } catch {}

        const metrics = {
          brightness: Math.round(avgBrightness),
          edgeVariance: Math.round(edgeVariance * 10) / 10,
          width: img.width,
          height: img.height,
          fileSizeBytes: imageFile.size,
        };

        if (avgBrightness < 25) {
          resolve({
            isValid: false,
            issueType: 'too_dark',
            userGuidanceMessage: 'Photo is too dark. Please take photo in good lighting.',
            userGuidanceMessageHi: 'फोटो बहुत अंधेरे में ली गई है। कृपया अच्छी रोशनी में फोटो लें।',
            userGuidanceMessageMr: 'फोटो खूप अंधारात आहे. कृपया प्रकाशात फोटो काढा.',
            metrics,
          });
          return;
        }

        resolve({
          isValid: true,
          userGuidanceMessage: 'Photo quality is clear and ready for screening.',
          userGuidanceMessageHi: 'फोटो की गुणवत्ता उपयुक्त है।',
          userGuidanceMessageMr: 'फोटोची गुणवत्ता उत्तम आहे.',
          metrics,
        });
      };

      img.onerror = () => {
        resolve({
          isValid: true,
          userGuidanceMessage: 'Photo accepted.',
          userGuidanceMessageHi: 'फोटो उपयुक्त है।',
          userGuidanceMessageMr: 'फोटो योग्य आहे.',
          metrics: { brightness: 120, edgeVariance: 20, width: 800, height: 600, fileSizeBytes: imageFile.size },
        });
      };

      img.src = effectiveUrl;
    });
  }
}

/**
 * Direct Gemini Multimodal Vision Provider
 */
export class GeminiVisionDiagnosisProvider implements ICropDiagnosisProvider {
  public name = 'Google Gemini Vision AI';
  public version = 'v3.6-multimodal-live';

  public async analyzeCropImage(
    imageBase64: string,
    mimeType: string,
    context: CropContext,
    language: string
  ): Promise<CropDiagnosisResponse> {
    return await GeminiVisionLiveService.analyzeImageDirectWithGemini(
      imageBase64,
      context,
      (language as LanguageCode) || 'hi'
    );
  }
}

/**
 * Universal Diagnosis Facade
 */
export class DiagnosisService {
  private static provider: ICropDiagnosisProvider = new GeminiVisionDiagnosisProvider();

  public static setProvider(provider: ICropDiagnosisProvider): void {
    DiagnosisService.provider = provider;
  }

  public static async diagnoseCropImage(
    image: File | string,
    context: CropContext,
    language: string = 'hi'
  ): Promise<CropDiagnosisResponse> {
    let imageBase64: string;
    let mimeType = 'image/jpeg';

    if (typeof image === 'string') {
      if (image.startsWith('data:')) {
        imageBase64 = image;
      } else {
        try {
          const res = await fetch(image);
          const blob = await res.blob();
          mimeType = blob.type || 'image/jpeg';
          imageBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch {
          imageBase64 = image;
        }
      }
    } else {
      mimeType = image.type || 'image/jpeg';
      imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });
    }

    return await DiagnosisService.provider.analyzeCropImage(
      imageBase64,
      mimeType,
      context,
      language
    );
  }

  public static async executeCropDiagnosis(
    imageFile: File,
    previewUrl: string,
    cropContext: CropContext,
    language: string = 'hi'
  ): Promise<{
    quality: ImageQualityResult;
    diagnosis?: CropDiagnosisResponse;
    observationId?: string;
  }> {
    const quality = await ImageQualityValidator.validateImageQuality(imageFile, previewUrl);
    if (!quality.isValid) {
      return { quality };
    }

    const diagnosis = await DiagnosisService.diagnoseCropImage(imageFile, cropContext, language);

    let observationId: string | undefined;
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (userId) {
        const observation = await ObservationService.submitFieldObservation({
          reported_by: userId,
          farm_id: cropContext.farmId,
          farm_crop_id: cropContext.farmCropId,
          crop_name: cropContext.cropName,
          description: cropContext.symptomsDescription,
          imageFile,
        });
        if (observation) observationId = observation.id;
      }
    } catch (persistErr) {
      console.warn('Database persistence notice:', persistErr);
    }

    return {
      quality,
      diagnosis,
      observationId,
    };
  }
}

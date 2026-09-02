import { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, X, Info, Zap } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

interface SampleScanDemoProps {
  onNavigate: (section: string) => void;
}

interface SampleDisease {
  id: string;
  crop: string;
  cropHi: string;
  cropMr: string;
  disease: string;
  diseaseHi: string;
  diseaseMr: string;
  scientific: string;
  severity: 'low' | 'moderate' | 'high';
  confidence: number;
  image: string;
  symptoms: string;
  symptomsHi: string;
  symptomsMr: string;
  organicRemedy: string;
  organicRemedyHi: string;
  organicRemedyMr: string;
  chemicalRemedy: string;
  chemicalRemedyHi: string;
  chemicalRemedyMr: string;
  dosage: string;
  phi: string;
}

const samples: SampleDisease[] = [
  {
    id: 'tomato-blight',
    crop: 'Tomato',
    cropHi: 'टमाटर',
    cropMr: 'टोमॅटो',
    disease: 'Early Blight',
    diseaseHi: 'अगेती झुलसा (अर्ली ब्लाइट)',
    diseaseMr: 'लवकर येणारा करपा',
    scientific: 'Alternaria solani',
    severity: 'moderate',
    confidence: 97.4,
    image: '/images/sample-tomato.jpg',
    symptoms: 'Concentric dark brown rings on older lower leaves with yellow halo margins.',
    symptomsHi: 'पुरानी निचली पत्तियों पर पीले घेरे के साथ गहरे भूरे रंग के संकेंद्रित छल्ले।',
    symptomsMr: 'जुन्या खालच्या पानांवर पिवळ्या कडांसह गडद तपकिरी वर्तुळाकार डाग.',
    organicRemedy: 'Spray Trichoderma viride (5g/L) + Neem Oil 1500 ppm at 10-day intervals.',
    organicRemedyHi: 'ट्राइकोडर्मा विरिडे (5 ग्राम/लीटर) + नीम का तेल 1500 ppm का 10 दिनों के अंतराल पर छिड़काव करें।',
    organicRemedyMr: 'ट्रायकोडर्मा विरिडी (५ ग्रॅम/लिटर) + कडुनिंब तेल १५०० ppm ची १० दिवसांच्या अंतराने फवारणी करा.',
    chemicalRemedy: 'Mancozeb 75% WP or Copper Oxychloride 50% WP.',
    chemicalRemedyHi: 'मैंकोजेब 75% WP या कॉपर ऑक्सीक्लोराइड 50% WP।',
    chemicalRemedyMr: 'मॅन्कोझेब ७५% WP किंवा कॉपर ऑक्सिक्लोराईड ५०% WP.',
    dosage: '2.5g per litre of water (500g / acre)',
    phi: 'Safe Harvest Interval: 7 Days'
  },
  {
    id: 'cotton-pest',
    crop: 'Cotton',
    cropHi: 'कपास',
    cropMr: 'कापूस',
    disease: 'Pink Bollworm Infestation',
    diseaseHi: 'गुलाबी सुंडी (पिंक बॉलवर्म)',
    diseaseMr: 'गुलाबी बोंडअळी प्रादुर्भाव',
    scientific: 'Pectinophora gossypiella',
    severity: 'high',
    confidence: 98.9,
    image: '/images/sample-cotton.jpg',
    symptoms: 'Larvae boring into squares and developing bolls, rosette flowers, staining of lint.',
    symptomsHi: 'सुंडी का कलियों और बोंडों में छेद करना, रोसेट फूल बनना और रुई का खराब होना।',
    symptomsMr: 'अळी बोंडात शिरणे, रोझेट (गुलाबासारखी) फुले तयार होणे आणि कापूस खराब होणे.',
    organicRemedy: 'Install 5 Gossyplure pheromone traps/acre + Release Trichogramma wasps.',
    organicRemedyHi: 'प्रति एकड़ 5 गॉसीप्लूर फेरोमोन जाल लगाएं + ट्राइकोग्रामा परजीवी छोड़ें।',
    organicRemedyMr: 'प्रति एकरी ५ गॉसिप्ल्यूर कामगंध सापळे लावा + ट्रायकोड्रॉमा कीटक सोडा.',
    chemicalRemedy: 'Profenofos 50% EC or Emamectin Benzoate 5% SG.',
    chemicalRemedyHi: 'प्रोफेनोफॉस 50% EC या इमामेक्टिन बेंजोएट 5% SG।',
    chemicalRemedyMr: 'प्रोफेनोफॉस ५०% EC किंवा इमामेक्टिन बेंझोएट ५% SG.',
    dosage: '0.4g Emamectin Benzoate per litre water',
    phi: 'Safe Harvest Interval: 14 Days'
  },
  {
    id: 'rice-blast',
    crop: 'Rice / Paddy',
    cropHi: 'धान (चावल)',
    cropMr: 'भात / धान',
    disease: 'Rice Leaf Blast',
    diseaseHi: 'धान का झोंका रोग (ब्लास्ट)',
    diseaseMr: 'भातावरील करपा (ब्लास्ट)',
    scientific: 'Magnaporthe oryzae',
    severity: 'high',
    confidence: 95.8,
    image: '/images/sample-rice.jpg',
    symptoms: 'Spindle-shaped diamond lesions with gray/whitish centers and dark reddish-brown borders.',
    symptomsHi: 'ग्रे/सफेद केंद्र और गहरे लाल-भूरे किनारों वाले धुरी के आकार के धब्बे।',
    symptomsMr: 'राखाडी/पांढऱ्या केंद्रासह आणि गडद तपकिरी कडा असलेले लांबट आकाराचे डाग.',
    organicRemedy: 'Pseudomonas fluorescens seed treatment (10g/kg) + foliar spray @ 2.5g/L.',
    organicRemedyHi: 'स्यूडोमोनास फ्लोरोसेंस से बीज उपचार (10g/kg) + 2.5g/L का पर्णीय छिड़काव।',
    organicRemedyMr: 'स्यूडोमोनास फ्लोरोसेन्स बीजप्रक्रिया (१० ग्रॅम/किलो) + २.५ ग्रॅम/लिटर फवारणी.',
    chemicalRemedy: 'Tricyclazole 75% WP or Isoprothiolane 40% EC.',
    chemicalRemedyHi: 'ट्राइसाइक्लाजोल 75% WP या आइसोप्रथियोलेन 40% EC।',
    chemicalRemedyMr: 'ट्रायसायक्लाझोल ७५% WP किंवा आयसोप्रोथिओलेन ४०% EC.',
    dosage: '0.6g Tricyclazole per litre of water',
    phi: 'Safe Harvest Interval: 21 Days'
  },
  {
    id: 'soybean-rust',
    crop: 'Soybean',
    cropHi: 'सोयाबीन',
    cropMr: 'सोयाबीन',
    disease: 'Asian Soybean Rust',
    diseaseHi: 'सोयाबीन रस्ट (गेरुआ)',
    diseaseMr: 'सोयाबीन तांबेरा रोग',
    scientific: 'Phakopsora pachyrhizi',
    severity: 'moderate',
    confidence: 94.2,
    image: '/images/sample-soybean.jpg',
    symptoms: 'Small tan to dark brown/reddish pustules primarily on lower leaf undersides causing premature defoliation.',
    symptomsHi: 'पत्तियों की निचली सतह पर छोटे भूरे-लाल दाने (पुस्ट्यूल), जिससे पत्तियां जल्दी झड़ने लगती हैं।',
    symptomsMr: 'पानांच्या खालच्या भागावर लहान तांबूस-तपकिरी ठिपके, ज्यामुळे पाने अकाली गळतात.',
    organicRemedy: 'Preventive spray of bio-fungicide Bacillus subtilis or cow urine + neem extract.',
    organicRemedyHi: 'बैसिलस सबटिलिस जैव-कवकनाशी या गोमूत्र + नीम अर्क का निवारक छिड़काव।',
    organicRemedyMr: 'बॅसिलस सबटिलिस जैविक बुरशीनाशक किंवा गोमूत्र + कडुनिंब अर्काची प्रतिबंधक फवारणी.',
    chemicalRemedy: 'Hexaconazole 5% EC or Tebuconazole 25.9% EC.',
    chemicalRemedyHi: 'हेक्साकोनाजोल 5% EC या टेबुकोनाजोल 25.9% EC।',
    chemicalRemedyMr: 'हेक्साकोनाझोल ५% EC किंवा टेबुकोनाझोल २५.९% EC.',
    dosage: '1.0 ml per litre of water',
    phi: 'Safe Harvest Interval: 15 Days'
  }
];

export default function SampleScanDemo({ onNavigate }: SampleScanDemoProps) {
  const { lang } = useLang();
  const [selectedSample, setSelectedSample] = useState<SampleDisease | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleSelectSample = (sample: SampleDisease) => {
    setAnalyzing(true);
    setTimeout(() => {
      setSelectedSample(sample);
      setAnalyzing(false);
    }, 450);
  };

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-white via-emerald-50/30 to-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-green-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold mb-4 shadow-sm border border-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            {lang === 'hi'
              ? 'इंटरएक्टिव डेमो: 1-क्लिक में टेस्ट करें'
              : lang === 'mr'
              ? 'थेट डेमो: १-क्लिक मध्ये तपासा'
              : 'Interactive Live Test: Click Any Sample Crop'}
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {lang === 'hi'
              ? 'खेत की असली समस्याओं पर AI की त्वरित जांच'
              : lang === 'mr'
              ? 'शेतातील खऱ्या समस्यांवर AI चे त्वरित निदान'
              : 'Instant AI Diagnosis on Real Field Crop Issues'}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
            {lang === 'hi'
              ? 'यदि अभी आपके पास पत्ती की फोटो नहीं है, तो नीचे दिए गए 4 मुख्य फसलों के सैंपल पर क्लिक करके लाइव AI पहचान, तीव्रता और सुरक्षित उपचार देखें।'
              : lang === 'mr'
              ? 'सध्या तुमच्याकडे फोटो नसल्यास खालील नमुन्यांवर क्लिक करून थेट AI निदान, तीव्रता आणि सुरक्षित उपाय तपासा.'
              : 'Try our multi-crop deep learning vision model. Select any sample below to see instant bounding detection, confidence score, and IPM advisories.'}
          </p>
        </div>

        {/* 4 Sample Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {samples.map((sample) => {
            const cropTitle = lang === 'hi' ? sample.cropHi : lang === 'mr' ? sample.cropMr : sample.crop;
            const diseaseTitle = lang === 'hi' ? sample.diseaseHi : lang === 'mr' ? sample.diseaseMr : sample.disease;

            return (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className="group relative bg-white rounded-2xl border border-gray-200/80 shadow-md hover:shadow-xl hover:border-emerald-500/60 overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image Container with AI Target Overlay */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={sample.image}
                    alt={sample.disease}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Subtle scan brackets visual */}
                  <div className="absolute inset-3 border border-dashed border-white/50 rounded-lg pointer-events-none group-hover:border-emerald-400 group-hover:bg-emerald-900/10 transition-colors" />

                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {cropTitle}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow">
                    <Zap className="w-3.5 h-3.5" />
                    {sample.confidence}% {lang === 'hi' ? 'विश्वास' : lang === 'mr' ? 'विश्वास' : 'Conf.'}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        sample.severity === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {sample.severity === 'high'
                        ? lang === 'hi' ? 'उच्च जोखिम' : lang === 'mr' ? 'उच्च धोका' : 'High Severity'
                        : lang === 'hi' ? 'मध्यम जोखिम' : lang === 'mr' ? 'मध्यम धोका' : 'Moderate Severity'}
                    </span>
                    <span className="text-[11px] text-gray-400 italic">{sample.scientific}</span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {diseaseTitle}
                  </h3>

                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-700 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {lang === 'hi' ? 'AI निदान देखें' : lang === 'mr' ? 'AI निदान पहा' : 'View AI Analysis'}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal / Detailed Result View */}
        {selectedSample && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 p-4 sm:p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {lang === 'hi' ? selectedSample.diseaseHi : lang === 'mr' ? selectedSample.diseaseMr : selectedSample.disease}
                    </h3>
                    <p className="text-xs text-gray-500 italic">{selectedSample.scientific} • {selectedSample.crop}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSample(null)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* Image + Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-video sm:aspect-square">
                    <img
                      src={selectedSample.image}
                      alt={selectedSample.disease}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                      <span className="text-white text-xs font-semibold bg-emerald-600/90 px-2.5 py-1 rounded-md">
                        {lang === 'hi' ? 'सटीकता' : lang === 'mr' ? 'अचूकता' : 'AI Confidence'}: {selectedSample.confidence}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500 font-medium">
                        {lang === 'hi' ? 'जोखिम स्तर (Severity)' : lang === 'mr' ? 'धोका पातळी' : 'Severity Rating'}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            selectedSample.severity === 'high'
                              ? 'bg-red-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {selectedSample.severity === 'high' ? 'High / Critical' : 'Moderate'}
                        </span>
                        <span className="text-xs text-gray-600 font-medium">
                          {lang === 'hi' ? 'शीघ्र उपचार आवश्यक' : lang === 'mr' ? 'तातडीने उपचार आवश्यक' : 'Immediate action required'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500 font-medium">
                        {lang === 'hi' ? 'लक्षण (Field Symptoms)' : lang === 'mr' ? 'लक्षणे' : 'Visible Symptoms'}
                      </span>
                      <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed">
                        {lang === 'hi'
                          ? selectedSample.symptomsHi
                          : lang === 'mr'
                          ? selectedSample.symptomsMr
                          : selectedSample.symptoms}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Biological & Chemical Recommendations */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {lang === 'hi' ? 'अनुशंसित IPM और रासायनिक उपचार' : lang === 'mr' ? 'शिफारस केलेले IPM व रासायनिक उपाय' : 'Integrated Pest Management (IPM) Protocol'}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Organic / Bio */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {lang === 'hi' ? '1. जैविक / पर्यावरण अनुकूल उपचार' : lang === 'mr' ? '१. सेंद्रिय / जैविक उपचार' : '1. Organic / Biological Control'}
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed">
                        {lang === 'hi'
                          ? selectedSample.organicRemedyHi
                          : lang === 'mr'
                          ? selectedSample.organicRemedyMr
                          : selectedSample.organicRemedy}
                      </p>
                    </div>

                    {/* Chemical Dosage */}
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        {lang === 'hi' ? '2. अनुशंसित रसायन व सटीक खुराक' : lang === 'mr' ? '२. रासायनिक व अचूक प्रमाण' : '2. Chemical Control & Exact Dosage'}
                      </div>
                      <p className="text-xs font-semibold text-amber-950">
                        {lang === 'hi'
                          ? selectedSample.chemicalRemedyHi
                          : lang === 'mr'
                          ? selectedSample.chemicalRemedyMr
                          : selectedSample.chemicalRemedy}
                      </p>
                      <div className="mt-2 text-[11px] text-amber-900 bg-amber-100/70 p-2 rounded-lg space-y-0.5">
                        <div><strong>{lang === 'hi' ? 'खुराक' : lang === 'mr' ? 'प्रमाण' : 'Dosage'}:</strong> {selectedSample.dosage}</div>
                        <div><strong>{lang === 'hi' ? 'सुरक्षा अंतराल' : lang === 'mr' ? 'सुरक्षा कालावधी' : 'PHI'}:</strong> {selectedSample.phi}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedSample(null);
                      onNavigate('report');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm text-center shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    {lang === 'hi' ? 'अपनी फसल की नई फोटो स्कैन करें' : lang === 'mr' ? 'स्वतःच्या पिकाचा फोटो स्कॅन करा' : 'Scan Your Own Crop Photo'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSample(null);
                      onNavigate('expert');
                    }}
                    className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-xs sm:text-sm text-center transition-all"
                  >
                    {lang === 'hi' ? 'KVK विशेषज्ञ से पुष्टि करवाएं' : lang === 'mr' ? 'KVK तज्ज्ञांशी संपर्क साधा' : 'Request KVK Scientist Referral'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

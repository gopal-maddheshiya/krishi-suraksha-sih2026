/**
 * Pan-India Location Service & Administrative Registry
 * Provides real GPS location detection and structured State -> District -> Taluka hierarchy.
 */

import type { GeoLocation } from './types';

export interface IndianState {
  code: string;
  name: string;
  nameHi: string;
  nameRegional?: string;
  districts: IndianDistrict[];
}

export interface IndianDistrict {
  id: string;
  name: string;
  nameHi: string;
  nameRegional?: string;
  latitude: number;
  longitude: number;
  talukas?: string[];
}

export const PAN_INDIA_STATES: IndianState[] = [
  {
    code: 'MH',
    name: 'Maharashtra',
    nameHi: 'महाराष्ट्र',
    nameRegional: 'महाराष्ट्र',
    districts: [
      { id: 'mh_pune', name: 'Pune', nameHi: 'पुणे', nameRegional: 'पुणे', latitude: 18.5204, longitude: 73.8567, talukas: ['Haveli', 'Baramati', 'Junnar', 'Khed', 'Shirur', 'Ambegaon', 'Daund', 'Indapur'] },
      { id: 'mh_nashik', name: 'Nashik', nameHi: 'नासिक', nameRegional: 'नाशिक', latitude: 19.9975, longitude: 73.7898, talukas: ['Nashik', 'Niphad', 'Dindori', 'Sinnar', 'Yeola', 'Malegaon', 'Chandwad'] },
      { id: 'mh_nagpur', name: 'Nagpur', nameHi: 'नागपुर', nameRegional: 'नागपूर', latitude: 21.1458, longitude: 79.0882, talukas: ['Nagpur Rural', 'Katol', 'Saoner', 'Ramtek', 'Hingna', 'Umred', 'Narkhed'] },
      { id: 'mh_csn', name: 'Chhatrapati Sambhajinagar', nameHi: 'छत्रपति संभाजीनगर', nameRegional: 'छत्रपती संभाजीनगर', latitude: 19.8762, longitude: 75.3433, talukas: ['Aurangabad', 'Paithan', 'Gangapur', 'Vaijapur', 'Kannad', 'Sillod'] },
      { id: 'mh_ahilyanagar', name: 'Ahilyanagar', nameHi: 'अहिल्यानगर', nameRegional: 'अहिल्यानगर', latitude: 19.0952, longitude: 74.7496, talukas: ['Nagar', 'Rahata', 'Sangamner', 'Shrirampur', 'Kopargaon', 'Nevasa'] },
      { id: 'mh_jalgaon', name: 'Jalgaon', nameHi: 'जलगांव', nameRegional: 'जळगाव', latitude: 21.0077, longitude: 75.5626, talukas: ['Jalgaon', 'Bhusawal', 'Raver', 'Yawal', 'Chopda', 'Pachora', 'Jamner'] },
      { id: 'mh_kolhapur', name: 'Kolhapur', nameHi: 'कोल्हापुर', nameRegional: 'कोल्हापूर', latitude: 16.7050, longitude: 74.2433, talukas: ['Karvir', 'Hatkanangle', 'Shirol', 'Kagal', 'Gadhinglaj', 'Radhanagari'] },
      { id: 'mh_solapur', name: 'Solapur', nameHi: 'सोलापुर', nameRegional: 'सोलापूर', latitude: 17.6599, longitude: 75.9064, talukas: ['North Solapur', 'Pandharpur', 'Barshi', 'Malshiras', 'Sangola', 'Karmala'] },
      { id: 'mh_amravati', name: 'Amravati', nameHi: 'अमरावती', nameRegional: 'अमरावती', latitude: 20.9374, longitude: 77.7796, talukas: ['Amravati', 'Achalpur', 'Chandur Bazar', 'Morshi', 'Warud', 'Daryapur'] },
      { id: 'mh_yavatmal', name: 'Yavatmal', nameHi: 'यवतमाल', nameRegional: 'यवतमाळ', latitude: 20.3888, longitude: 78.1204, talukas: ['Yavatmal', 'Pusad', 'Umarkhed', 'Digras', 'Darwha', 'Wani'] },
      { id: 'mh_satara', name: 'Satara', nameHi: 'सतारा', nameRegional: 'सातारा', latitude: 17.6805, longitude: 73.9983, talukas: ['Satara', 'Karad', 'Wai', 'Phaltan', 'Koregaon', 'Khatav'] },
      { id: 'mh_sangli', name: 'Sangli', nameHi: 'सांगली', nameRegional: 'सांगली', latitude: 16.8524, longitude: 74.5815, talukas: ['Miraj', 'Tasgaon', 'Walwa', 'Khanapur', 'Jat', 'Kavathe Mahankal'] },
    ],
  },
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    nameHi: 'उत्तर प्रदेश',
    districts: [
      { id: 'up_lucknow', name: 'Lucknow', nameHi: 'लखनऊ', latitude: 26.8467, longitude: 80.9462, talukas: ['Bakshi Ka Talab', 'Malihabad', 'Mohanlalganj', 'Sarojini Nagar'] },
      { id: 'up_varanasi', name: 'Varanasi', nameHi: 'वाराणसी', latitude: 25.3176, longitude: 82.9739, talukas: ['Pindra', 'Sadar', 'Raja Talab'] },
      { id: 'up_agra', name: 'Agra', nameHi: 'आगरा', latitude: 27.1767, longitude: 78.0081, talukas: ['Etmadpur', 'Fatehabad', 'Kheragarh', 'Bah'] },
      { id: 'up_kanpur', name: 'Kanpur Nagar', nameHi: 'कानपुर नगर', latitude: 26.4499, longitude: 80.3319, talukas: ['Bilhaur', 'Ghatampur', 'Kanpur Sadar'] },
      { id: 'up_prayagraj', name: 'Prayagraj', nameHi: 'प्रयागराज', latitude: 25.4358, longitude: 81.8463, talukas: ['Phulpur', 'Soraon', 'Handia', 'Karchhana'] },
      { id: 'up_gorakhpur', name: 'Gorakhpur', nameHi: 'गोरखपुर', latitude: 26.7606, longitude: 83.3732, talukas: ['Campierganj', 'Sahjanwa', 'Chauri Chaura', 'Bansgaon'] },
      { id: 'up_meerut', name: 'Meerut', nameHi: 'मेरठ', latitude: 28.9845, longitude: 77.7064, talukas: ['Mawana', 'Sardhana', 'Meerut Sadar'] },
    ],
  },
  {
    code: 'PB',
    name: 'Punjab',
    nameHi: 'पंजाब',
    nameRegional: 'ਪੰਜਾਬ',
    districts: [
      { id: 'pb_ludhiana', name: 'Ludhiana', nameHi: 'लुधियाना', nameRegional: 'ਲੁਧਿਆਣਾ', latitude: 30.9010, longitude: 75.8573, talukas: ['Ludhiana East', 'Ludhiana West', 'Jagraon', 'Samrala', 'Khanna', 'Payal'] },
      { id: 'pb_amritsar', name: 'Amritsar', nameHi: 'अमृतसर', nameRegional: 'ਅੰਮ੍ਰਿਤਸਰ', latitude: 31.6340, longitude: 74.8723, talukas: ['Amritsar-I', 'Amritsar-II', 'Ajnala', 'Baba Bakala'] },
      { id: 'pb_jalandhar', name: 'Jalandhar', nameHi: 'जालंधर', nameRegional: 'ਜਲੰਧਰ', latitude: 31.3260, longitude: 75.5762, talukas: ['Jalandhar-I', 'Jalandhar-II', 'Nakodar', 'Phillaur', 'Shahkot'] },
      { id: 'pb_bathinda', name: 'Bathinda', nameHi: 'बठिंडा', nameRegional: 'ਬਠਿੰਡਾ', latitude: 30.2110, longitude: 74.9455, talukas: ['Bathinda', 'Rampura Phul', 'Talwandi Sabo', 'Maur'] },
      { id: 'pb_patiala', name: 'Patiala', nameHi: 'पटियाला', nameRegional: 'ਪਟਿਆਲਾ', latitude: 30.3398, longitude: 76.3869, talukas: ['Patiala', 'Nabha', 'Rajpura', 'Samana', 'Patran'] },
    ],
  },
  {
    code: 'MP',
    name: 'Madhya Pradesh',
    nameHi: 'मध्य प्रदेश',
    districts: [
      { id: 'mp_indore', name: 'Indore', nameHi: 'इंदौर', latitude: 22.7196, longitude: 75.8577, talukas: ['Indore', 'Mhow', 'Depalpur', 'Sanwer'] },
      { id: 'mp_bhopal', name: 'Bhopal', nameHi: 'भोपाल', latitude: 23.2599, longitude: 77.4126, talukas: ['Huzur', 'Berasia', 'Kolar'] },
      { id: 'mp_ujjain', name: 'Ujjain', nameHi: 'उज्जैन', latitude: 23.1765, longitude: 75.7885, talukas: ['Ujjain', 'Badnagar', 'Mahidpur', 'Nagda', 'Tarana'] },
      { id: 'mp_jabalpur', name: 'Jabalpur', nameHi: 'जबलपुर', latitude: 23.1815, longitude: 79.9864, talukas: ['Jabalpur', 'Patan', 'Sihora', 'Kundam', 'Panagar'] },
      { id: 'mp_gwalior', name: 'Gwalior', nameHi: 'ग्वालियर', latitude: 26.2183, longitude: 78.1828, talukas: ['Gwalior', 'Dabra', 'Bhitarwar', 'Chinour'] },
    ],
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    nameHi: 'गुजरात',
    nameRegional: 'ગુજરાત',
    districts: [
      { id: 'gj_ahmedabad', name: 'Ahmedabad', nameHi: 'अहमदाबाद', nameRegional: 'અમદાવાદ', latitude: 23.0225, longitude: 72.5714, talukas: ['Daskroi', 'Sanand', 'Bavla', 'Dholka', 'Viramgam'] },
      { id: 'gj_surat', name: 'Surat', nameHi: 'सूरत', nameRegional: 'સુરત', latitude: 21.1702, longitude: 72.8311, talukas: ['Choryasi', 'Bardoli', 'Kamrej', 'Olpad', 'Mahuva'] },
      { id: 'gj_rajkot', name: 'Rajkot', nameHi: 'राजकोट', nameRegional: 'રાજકોટ', latitude: 22.3039, longitude: 70.8022, talukas: ['Rajkot', 'Gondal', 'Jetpur', 'Dhoraji', 'Jasdan'] },
      { id: 'gj_vadodara', name: 'Vadodara', nameHi: 'वडोदरा', nameRegional: 'વડોદરા', latitude: 22.3072, longitude: 73.1812, talukas: ['Vadodara', 'Padra', 'Karjan', 'Dabhoi', 'Savli'] },
      { id: 'gj_junagadh', name: 'Junagadh', nameHi: 'जूनागढ़', nameRegional: 'જૂનાગઢ', latitude: 21.5222, longitude: 70.4579, talukas: ['Junagadh', 'Keshod', 'Mangrol', 'Manavadar', 'Visavadar'] },
    ],
  },
  {
    code: 'KA',
    name: 'Karnataka',
    nameHi: 'कर्नाटक',
    nameRegional: 'ಕರ್ನಾಟಕ',
    districts: [
      { id: 'ka_bengaluru', name: 'Bengaluru Rural', nameHi: 'बेंगलुरु ग्रामीण', nameRegional: 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ', latitude: 13.2272, longitude: 77.5750, talukas: ['Devanahalli', 'Doddaballapura', 'Hosakote', 'Nelamangala'] },
      { id: 'ka_mysuru', name: 'Mysuru', nameHi: 'मैसूरु', nameRegional: 'ಮೈಸೂರು', latitude: 12.2958, longitude: 76.6394, talukas: ['Mysuru', 'Hunsur', 'Nanjangud', 'T.Narasipura', 'K.R.Nagar'] },
      { id: 'ka_belagavi', name: 'Belagavi', nameHi: 'बेलगावी', nameRegional: 'ಬೆಳಗಾವಿ', latitude: 15.8497, longitude: 74.4977, talukas: ['Belagavi', 'Chikkodi', 'Gokak', 'Athani', 'Bailhongal'] },
      { id: 'ka_dharwad', name: 'Dharwad', nameHi: 'धारवाड़', nameRegional: 'ಧಾರವಾಡ', latitude: 15.4589, longitude: 75.0078, talukas: ['Dharwad', 'Hubballi', 'Kalghatgi', 'Navalgund', 'Kundgol'] },
      { id: 'ka_shivamogga', name: 'Shivamogga', nameHi: 'शिवमोग्गा', nameRegional: 'ಶಿವಮೊಗ್ಗ', latitude: 13.9299, longitude: 75.5681, talukas: ['Shivamogga', 'Bhadravathi', 'Sagara', 'Shikaripura', 'Thirthahalli'] },
    ],
  },
  {
    code: 'TS',
    name: 'Telangana',
    nameHi: 'तेलंगाना',
    nameRegional: 'తెలంగాణ',
    districts: [
      { id: 'ts_hyderabad', name: 'Hyderabad & Rangareddy', nameHi: 'हैदराबाद / रंगारेड्डी', nameRegional: 'రంగారెడ్డి', latitude: 17.3850, longitude: 78.4867, talukas: ['Rajendranagar', 'Chevella', 'Ibrahimpatnam', 'Shadnagar'] },
      { id: 'ts_warangal', name: 'Warangal', nameHi: 'वारंगल', nameRegional: 'వరంగల్', latitude: 17.9689, longitude: 79.5941, talukas: ['Warangal', 'Narsampet', 'Parkal', 'Wardhannapet'] },
      { id: 'ts_karimnagar', name: 'Karimnagar', nameHi: 'करीमनगर', nameRegional: 'కరీంనగర్', latitude: 18.4386, longitude: 79.1288, talukas: ['Karimnagar', 'Huzurabad', 'Manakondur', 'Choppadandi'] },
      { id: 'ts_nizamabad', name: 'Nizamabad', nameHi: 'निजामाबाद', nameRegional: 'నిజామాబాద్', latitude: 18.6725, longitude: 78.0941, talukas: ['Nizamabad', 'Armoor', 'Bodhan', 'Banswada'] },
    ],
  },
  {
    code: 'AP',
    name: 'Andhra Pradesh',
    nameHi: 'आंध्र प्रदेश',
    nameRegional: 'ఆంధ్రప్రదేశ్',
    districts: [
      { id: 'ap_guntur', name: 'Guntur', nameHi: 'गुंटूर', nameRegional: 'గుంటూరు', latitude: 16.3067, longitude: 80.4365, talukas: ['Guntur', 'Tenali', 'Narasaraopet', 'Sattenapalle', 'Bapatla'] },
      { id: 'ap_krishna', name: 'Krishna (Vijayawada)', nameHi: 'कृष्णा (विजयवाड़ा)', nameRegional: 'కృష్ణా', latitude: 16.5062, longitude: 80.6480, talukas: ['Vijayawada', 'Machilipatnam', 'Gudivada', 'Nuzvid'] },
      { id: 'ap_kurnool', name: 'Kurnool', nameHi: 'कर्नूल', nameRegional: 'కర్నూలు', latitude: 15.8281, longitude: 78.0373, talukas: ['Kurnool', 'Adoni', 'Nandyal', 'Yemmiganur'] },
      { id: 'ap_visakhapatnam', name: 'Visakhapatnam', nameHi: 'विशाखापट्टनम', nameRegional: 'విశాఖపట్నం', latitude: 17.6868, longitude: 83.2185, talukas: ['Anakapalle', 'Bheemunipatnam', 'Gajuwaka'] },
    ],
  },
  {
    code: 'TN',
    name: 'Tamil Nadu',
    nameHi: 'तमिलनाडु',
    nameRegional: 'தமிழ்நாடு',
    districts: [
      { id: 'tn_coimbatore', name: 'Coimbatore', nameHi: 'कोयंबटूर', nameRegional: 'கோயம்புத்தூர்', latitude: 11.0168, longitude: 76.9558, talukas: ['Pollachi', 'Mettupalayam', 'Sulur', 'Annur'] },
      { id: 'tn_madurai', name: 'Madurai', nameHi: 'मदुरै', nameRegional: 'மதுரை', latitude: 9.9252, longitude: 78.1198, talukas: ['Melur', 'Vadipatti', 'Thirumangalam', 'Usilampatti'] },
      { id: 'tn_salem', name: 'Salem', nameHi: 'सलेम', nameRegional: 'சேலம்', latitude: 11.6643, longitude: 78.1460, talukas: ['Attur', 'Mettur', 'Omalur', 'Sankari'] },
      { id: 'tn_thanjavur', name: 'Thanjavur (Delta)', nameHi: 'तंजावुर', nameRegional: 'தஞ்சாவூர்', latitude: 10.7870, longitude: 79.1378, talukas: ['Kumbakonam', 'Papanasam', 'Pattukkottai', 'Thiruvaiyaru'] },
    ],
  },
  {
    code: 'WB',
    name: 'West Bengal',
    nameHi: 'पश्चिम बंगाल',
    nameRegional: 'পশ্চিমবঙ্গ',
    districts: [
      { id: 'wb_bardhaman', name: 'Purba Bardhaman', nameHi: 'पूर्व बर्धमान', nameRegional: 'পূর্ব বর্ধমান', latitude: 23.2324, longitude: 87.8615, talukas: ['Bardhaman Sadar', 'Katwa', 'Kalna'] },
      { id: 'wb_hooghly', name: 'Hooghly', nameHi: 'हुगली', nameRegional: 'হুগলি', latitude: 22.9036, longitude: 88.3968, talukas: ['Chinsurah', 'Chandannagar', 'Arambagh'] },
      { id: 'wb_murshidabad', name: 'Murshidabad', nameHi: 'मुर्शिदाबाद', nameRegional: 'মুর্শিদাবাদ', latitude: 24.1759, longitude: 88.2802, talukas: ['Berhampore', 'Lalgola', 'Jangipur'] },
      { id: 'wb_malda', name: 'Malda', nameHi: 'मालदा', nameRegional: 'মালদা', latitude: 25.0108, longitude: 88.1411, talukas: ['English Bazar', 'Chanchal', 'Gazole'] },
    ],
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    nameHi: 'राजस्थान',
    districts: [
      { id: 'rj_jaipur', name: 'Jaipur', nameHi: 'जयपुर', latitude: 26.9124, longitude: 75.7873, talukas: ['Chomu', 'Amer', 'Sanganer', 'Kotputli', 'Phulera'] },
      { id: 'rj_jodhpur', name: 'Jodhpur', nameHi: 'जोधपुर', latitude: 26.2389, longitude: 73.0243, talukas: ['Bilara', 'Osian', 'Phalodi', 'Bhopalgarh'] },
      { id: 'rj_kota', name: 'Kota', nameHi: 'कोटा', latitude: 25.2138, longitude: 75.8648, talukas: ['Ladpura', 'Digod', 'Pipalda', 'Sangod', 'Ramganj Mandi'] },
      { id: 'rj_sriganganagar', name: 'Sri Ganganagar', nameHi: 'श्रीगंगानगर', latitude: 29.9094, longitude: 73.8799, talukas: ['Ganganagar', 'Suratgarh', 'Raisinghnagar', 'Anupgarh'] },
    ],
  },
  {
    code: 'HR',
    name: 'Haryana',
    nameHi: 'हरियाणा',
    districts: [
      { id: 'hr_karnal', name: 'Karnal', nameHi: 'करनाल', latitude: 29.6857, longitude: 76.9905, talukas: ['Karnal', 'Assandh', 'Gharaunda', 'Indri', 'Nilokheri'] },
      { id: 'hr_hisar', name: 'Hisar', nameHi: 'हिसार', latitude: 29.1492, longitude: 75.7217, talukas: ['Hisar', 'Hansi', 'Adampur', 'Barwala', 'Narnaund'] },
      { id: 'hr_sirsa', name: 'Sirsa', nameHi: 'सिरसा', latitude: 29.5349, longitude: 75.0296, talukas: ['Sirsa', 'Dabwali', 'Ellenabad', 'Rania'] },
      { id: 'hr_ambala', name: 'Ambala', nameHi: 'अंबाला', latitude: 30.3782, longitude: 76.7767, talukas: ['Ambala', 'Barara', 'Naraingarh'] },
    ],
  },
];

const DEFAULT_LOCATION: GeoLocation = {
  latitude: 18.5204,
  longitude: 73.8567,
  state: 'Maharashtra',
  district: 'Pune',
  taluka: 'Haveli',
  village: 'Shivajinagar',
  isGPSDetected: false,
  accuracyMeters: 500,
  source: 'District Default',
};

const STORAGE_KEY = 'crophealth_active_location';

export class LocationService {
  /**
   * Get saved location from localStorage or default
   */
  public static getSavedLocation(): GeoLocation {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as GeoLocation;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_LOCATION;
  }

  /**
   * Save location to localStorage
   */
  public static saveLocation(loc: GeoLocation): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch {
      // Ignore
    }
  }

  /**
   * Request actual browser GPS coordinates with reverse lookup
   */
  public static async requestDeviceGPS(): Promise<GeoLocation> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported on this device.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Find nearest district from Pan-India database
          const nearest = LocationService.findNearestDistrict(latitude, longitude);

          const detected: GeoLocation = {
            latitude: Number(latitude.toFixed(6)),
            longitude: Number(longitude.toFixed(6)),
            state: nearest?.stateName || 'Detected State',
            district: nearest?.district.name || 'GPS Location',
            taluka: nearest?.district.talukas?.[0] || 'Local Block',
            village: 'Device GPS Location',
            isGPSDetected: true,
            accuracyMeters: Math.round(accuracy),
            source: 'Hardware GPS',
          };

          LocationService.saveLocation(detected);
          resolve(detected);
        },
        (error) => {
          let msg = 'Could not access GPS.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission was denied. Please select your district manually.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'GPS signal unavailable. Please select your district manually.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'GPS detection timed out. Please select your district manually.';
          }
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  /**
   * Set location by choosing State + District
   */
  public static setLocationByDistrictId(stateCode: string, districtId: string, talukaName?: string): GeoLocation {
    const state = PAN_INDIA_STATES.find((s) => s.code === stateCode) || PAN_INDIA_STATES[0];
    const district = state.districts.find((d) => d.id === districtId) || state.districts[0];

    const loc: GeoLocation = {
      latitude: district.latitude,
      longitude: district.longitude,
      state: state.name,
      district: district.name,
      taluka: talukaName || district.talukas?.[0] || 'Main',
      village: 'Gram Panchayat',
      isGPSDetected: false,
      accuracyMeters: 5000,
      source: 'Administrative Registry',
    };

    LocationService.saveLocation(loc);
    return loc;
  }

  /**
   * Helper: Find nearest district based on haversine distance
   */
  private static findNearestDistrict(lat: number, lon: number): { stateName: string; district: IndianDistrict } | null {
    let bestDist = Infinity;
    let match: { stateName: string; district: IndianDistrict } | null = null;

    for (const state of PAN_INDIA_STATES) {
      for (const dist of state.districts) {
        const d = LocationService.haversineDistance(lat, lon, dist.latitude, dist.longitude);
        if (d < bestDist) {
          bestDist = d;
          match = { stateName: state.name, district: dist };
        }
      }
    }
    return match;
  }

  private static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

import { useState, useEffect } from 'react';
import { 
  Sprout, Globe, MapPin, Navigation, Check, ChevronRight, 
  ArrowLeft, Sparkles, Loader2, Leaf, ShieldCheck, Sun,
  Phone, Lock, User, KeyRound, LogIn, AlertCircle
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { languages, type LanguageCode } from '@/lib/i18n';
import { PAN_INDIA_STATES, LocationService } from '@/services/LocationService';
import { FarmService } from '@/services/FarmService';
import { AuthService, type UserProfile } from '@/services/AuthService';
import { supabase } from '@/lib/supabase';
import type { GeoLocation } from '@/services/types';

interface FarmerOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function FarmerOnboardingModal({ isOpen, onComplete }: FarmerOnboardingModalProps) {
  const { lang, setLang } = useLang();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Auth State
  const [authSubView, setAuthSubView] = useState<'login' | 'signup' | 'forgot_password'>('signup');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Step 2: Location State
  const [selectedStateCode, setSelectedStateCode] = useState('MH');
  const [selectedDistrictId, setSelectedDistrictId] = useState('mh_pune');
  const [selectedTaluka, setSelectedTaluka] = useState('Haveli');
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<GeoLocation | null>(null);

  // Step 3: Farm State
  const [farmName, setFarmName] = useState('Main Farm');
  const [farmAreaAcres, setFarmAreaAcres] = useState('2.5');
  const [soilType, setSoilType] = useState('Black Cotton');
  const [irrigationType, setIrrigationType] = useState('Drip Irrigation');

  // Step 4: Crop State
  const [selectedCropName, setSelectedCropName] = useState('Cotton');
  const [variety, setVariety] = useState('Bt Cotton');
  const [sowingDate, setSowingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [cropStage, setCropStage] = useState('Flowering Stage');

  // Check if user already logged in
  useEffect(() => {
    AuthService.getCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user);
        setFullName(user.fullName || '');
        if (user.phone) setPhone(user.phone);
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const currentState = PAN_INDIA_STATES.find((s) => s.code === selectedStateCode) || PAN_INDIA_STATES[0];
  const currentDistrict = currentState.districts.find((d) => d.id === selectedDistrictId) || currentState.districts[0];

  // Auth Handler: Farmer Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    if (password !== confirmPassword) {
      setAuthError('पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते (Passwords do not match).');
      setAuthLoading(false);
      return;
    }

    try {
      const user = await AuthService.signUpWithPhone(fullName, phone, password);
      setCurrentUser(user);
      setStep(2); // Proceed to location
    } catch (err: any) {
      setAuthError(err.message || 'खाता निर्माण विफल रहा (Sign up failed).');
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth Handler: Farmer Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const user = await AuthService.loginWithPhone(phone, password);
      setCurrentUser(user);
      setStep(2); // Proceed to location
    } catch (err: any) {
      setAuthError(err.message || 'लॉगिन विफल रहा (Authentication failed).');
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth Handler: Master Key Password Reset (SIH2026)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setResetSuccessMessage(null);
    try {
      const res = await AuthService.resetPasswordWithKey(phone, recoveryKey, newPassword);
      setResetSuccessMessage(res.message);
      setPassword(newPassword);
      setTimeout(() => {
        setAuthSubView('login');
        setResetSuccessMessage(null);
      }, 2000);
    } catch (err: any) {
      setAuthError(err.message || 'पासवर्ड रीसेट विफल (Password reset failed).');
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth Handler: Google OAuth
  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await AuthService.loginWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-In failed.');
      setAuthLoading(false);
    }
  };

  // Skip / Fast Guest Access
  const handleGuestAccess = () => {
    const guestUser: UserProfile = {
      id: `farmer_${Date.now()}`,
      fullName: fullName || 'Kisan Mitra',
      phone: phone || '9876543210',
      role: 'farmer',
      preferredLanguage: lang,
    };
    setCurrentUser(guestUser);
    setStep(2);
  };

  // GPS Detection Handler
  const handleDetectGPS = async () => {
    setLoadingGps(true);
    setGpsError(null);
    try {
      const loc = await LocationService.requestDeviceGPS();
      setDetectedLocation(loc);
      const matchedState = PAN_INDIA_STATES.find((s) => s.name.toLowerCase() === loc.state.toLowerCase());
      if (matchedState) {
        setSelectedStateCode(matchedState.code);
        const matchedDist = matchedState.districts.find((d) => d.name.toLowerCase() === loc.district.toLowerCase());
        if (matchedDist) setSelectedDistrictId(matchedDist.id);
      }
    } catch (err) {
      setGpsError(err instanceof Error ? err.message : 'GPS detection failed.');
    } finally {
      setLoadingGps(false);
    }
  };

  // Finalize & Persist to Supabase Database
  const handleFinishOnboarding = async () => {
    setAuthLoading(true);
    try {
      const activeLoc = detectedLocation || LocationService.setLocationByDistrictId(selectedStateCode, selectedDistrictId, selectedTaluka);
      const farmerId = currentUser?.id || `farmer_${Date.now()}`;

      // 1. Persist Farm in Supabase
      let databaseFarmId = `farm_${Date.now()}`;
      try {
        const farmPayload = {
          farmer_id: farmerId,
          farm_name: farmName || 'Main Farm',
          state: activeLoc.state,
          district: activeLoc.district,
          taluka: activeLoc.taluka,
          village: activeLoc.village || 'Gram Panchayat',
          latitude: activeLoc.latitude,
          longitude: activeLoc.longitude,
          area_acres: parseFloat(farmAreaAcres) || 2.5,
          soil_type: soilType,
          irrigation_type: irrigationType,
        };
        const created = await FarmService.createFarm(farmPayload);
        if (created) databaseFarmId = created.id;
      } catch (dbErr) {
        console.warn('Database farm insert warning (offline fallback active):', dbErr);
      }

      // 2. Local State Sync
      const savedFarm = {
        id: databaseFarmId,
        farm_name: farmName || 'Main Farm',
        state: activeLoc.state,
        district: activeLoc.district,
        taluka: activeLoc.taluka,
        village: activeLoc.village || 'Gram Panchayat',
        latitude: activeLoc.latitude,
        longitude: activeLoc.longitude,
        area_acres: parseFloat(farmAreaAcres) || 2.5,
        soil_type: soilType,
        irrigation_type: irrigationType,
        crop: {
          name: selectedCropName,
          variety: variety,
          sowing_date: sowingDate,
          stage: cropStage,
        },
      };

      localStorage.setItem('crophealth_active_farm', JSON.stringify(savedFarm));
      localStorage.setItem('crophealth_onboarded', 'true');
      onComplete();
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <Leaf className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-black text-lg sm:text-xl tracking-tight text-white">
                {lang === 'hi' ? 'किसान पंजीकरण एवं लॉगिन' : lang === 'mr' ? 'शेतकरी नोंदणी व लॉगिन' : 'Farmer Portal & Registration'}
              </h2>
              <p className="text-xs text-emerald-200">
                {lang === 'hi' ? `चरण ${step} / 4 • सुरक्षित डेटाबेस सिंक` : `Step ${step} of 4 • Secure Database Sync`}
              </p>
            </div>
          </div>

          <span className="text-xs font-black text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
            {step === 1 ? (authSubView === 'signup' ? 'साइन-अप' : authSubView === 'login' ? 'लॉगिन' : 'रीसेट') : step === 2 ? 'स्थान' : step === 3 ? 'खेत' : 'फसल'}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">

          {/* ================================================================= */}
          {/* STEP 1: AUTHENTICATION (SIGN UP VS LOGIN TABS + GOOGLE SIGN-IN)   */}
          {/* ================================================================= */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Tab Selector: Sign Up vs Login */}
              {authSubView !== 'forgot_password' && (
                <div className="grid grid-cols-2 p-1 rounded-2xl bg-stone-100 border border-stone-200 text-xs font-black mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setAuthSubView('signup');
                    }}
                    className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      authSubView === 'signup'
                        ? 'bg-white text-emerald-900 shadow-sm border border-stone-200'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>✍️</span>
                    <span>{lang === 'hi' ? 'नया खाता बनाएं (Sign Up)' : 'Create Account'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setAuthSubView('login');
                    }}
                    className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      authSubView === 'login'
                        ? 'bg-white text-emerald-900 shadow-sm border border-stone-200'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>🔑</span>
                    <span>{lang === 'hi' ? 'लॉगिन करें (Login)' : 'Login'}</span>
                  </button>
                </div>
              )}

              {authError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {resetSuccessMessage && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{resetSuccessMessage}</span>
                </div>
              )}

              {/* ----------------------------------------------------------- */}
              {/* VIEW A: SIGN UP FORM                                       */}
              {/* ----------------------------------------------------------- */}
              {authSubView === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      {lang === 'hi' ? 'किसान का पूरा नाम' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={lang === 'hi' ? 'जैसे: रमेश पाटिल' : 'e.g. Ramesh Patil'}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-bold text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      {lang === 'hi' ? 'मोबाइल नंबर (10 अंक)' : 'Mobile Number (10 Digits)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-xs font-bold text-gray-400">+91</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        maxLength={10}
                        required
                        className="w-full pl-12 pr-4 py-2.5 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-bold text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      {lang === 'hi' ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min 6 characters)'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={6}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-bold text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      {lang === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={6}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-bold text-gray-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all mt-2"
                  >
                    {authLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        <span>{lang === 'hi' ? 'खाता बनाएं एवं आगे बढ़ें' : 'Create Account & Continue'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ----------------------------------------------------------- */}
              {/* VIEW B: LOGIN FORM                                         */}
              {/* ----------------------------------------------------------- */}
              {authSubView === 'login' && (
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      {lang === 'hi' ? 'पंजीकृत मोबाइल नंबर (10 अंक)' : 'Registered Mobile Number'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-xs font-bold text-gray-400">+91</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        maxLength={10}
                        required
                        className="w-full pl-12 pr-4 py-2.5 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-bold text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-gray-600 uppercase">
                        {lang === 'hi' ? 'पासवर्ड' : 'Password'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setAuthSubView('forgot_password');
                        }}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                      >
                        {lang === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={6}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-bold text-gray-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all mt-2"
                  >
                    {authLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>{lang === 'hi' ? 'लॉगिन करें' : 'Login'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ----------------------------------------------------------- */}
              {/* VIEW C: FORGOT PASSWORD WITH MASTER KEY (SIH2026)          */}
              {/* ----------------------------------------------------------- */}
              {authSubView === 'forgot_password' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="text-center pb-1">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-2 border border-amber-200">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-base text-gray-900">
                      {lang === 'hi' ? 'मास्टर कुंजी से पासवर्ड बदलें' : 'Reset Password with Master Key'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {lang === 'hi' ? 'मास्टर रिकवरी कुंजी "SIH2026" दर्ज करें।' : 'Enter the Master Recovery Key "SIH2026".'}
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                        {lang === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        maxLength={10}
                        required
                        className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-sm font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                        {lang === 'hi' ? 'मास्टर रिकवरी कुंजी (Master Key)' : 'Master Recovery Key'}
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-amber-600" />
                        <input
                          type="text"
                          value={recoveryKey}
                          onChange={(e) => setRecoveryKey(e.target.value)}
                          placeholder="SIH2026"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-amber-300 focus:ring-2 focus:ring-amber-500 text-sm font-black tracking-wider text-amber-950 bg-amber-50/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                        {lang === 'hi' ? 'नया पासवर्ड' : 'New Password (min 6 chars)'}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={6}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 text-sm font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      {authLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>{lang === 'hi' ? 'पासवर्ड रीसेट करें (Save New Password)' : 'Reset & Save Password'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthError(null);
                        setAuthSubView('login');
                      }}
                      className="w-full text-center py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
                    >
                      ← {lang === 'hi' ? 'लॉगिन पर वापस जाएं' : 'Back to Login'}
                    </button>
                  </form>
                </div>
              )}

              {/* ----------------------------------------------------------- */}
              {/* GOOGLE SIGN IN & GUEST PASS (AVAILABLE ON LOGIN/SIGNUP)     */}
              {/* ----------------------------------------------------------- */}
              {authSubView !== 'forgot_password' && (
                <>
                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-gray-200 w-full" />
                    <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase">
                      {lang === 'hi' ? 'या' : 'OR'}
                    </span>
                  </div>

                  {/* Google Sign-In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="w-full py-3 rounded-2xl bg-white hover:bg-gray-50 active:scale-98 border border-gray-300 text-gray-800 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{lang === 'hi' ? 'Google से लॉगिन करें' : 'Continue with Google'}</span>
                  </button>

                  {/* Guest / Direct Pass */}
                  <button
                    type="button"
                    onClick={handleGuestAccess}
                    className="w-full text-center py-2 text-xs font-bold text-gray-500 hover:text-emerald-700 transition-colors"
                  >
                    {lang === 'hi' ? 'त्वरित अतिथि प्रवेश (Guest Direct Pass) →' : 'Direct Demo Access →'}
                  </button>
                </>
              )}

            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 2: LOCATION & GPS SELECTION                                 */}
          {/* ================================================================= */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-gray-900 uppercase tracking-wide">
                  {lang === 'hi' ? 'खेत का स्थान चुनें' : 'Select Farm Location'}
                </h3>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={loadingGps}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200"
                >
                  <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${loadingGps ? 'animate-spin' : ''}`} />
                  <span>{loadingGps ? 'GPS खोज रहा...' : 'GPS Detect'}</span>
                </button>
              </div>

              {gpsError && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  {gpsError}
                </div>
              )}

              {detectedLocation && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center justify-between">
                  <span>📍 {detectedLocation.district}, {detectedLocation.state}</span>
                  <span className="text-[11px] font-mono text-emerald-700">GPS Verified</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">State / राज्य</label>
                  <select
                    value={selectedStateCode}
                    onChange={(e) => {
                      setSelectedStateCode(e.target.value);
                      const st = PAN_INDIA_STATES.find(s => s.code === e.target.value);
                      if (st && st.districts.length > 0) setSelectedDistrictId(st.districts[0].id);
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900"
                  >
                    {PAN_INDIA_STATES.map((s) => (
                      <option key={s.code} value={s.code}>{s.name} ({s.nameHi})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">District / जिला</label>
                  <select
                    value={selectedDistrictId}
                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900"
                  >
                    {currentState.districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.nameHi})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 3: FARM DETAILS                                             */}
          {/* ================================================================= */}
          {step === 3 && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <h3 className="font-black text-sm text-gray-900 uppercase tracking-wide">
                {lang === 'hi' ? 'खेत का विवरण' : 'Farm Details'}
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  {lang === 'hi' ? 'खेत का नाम' : 'Farm Name'}
                </label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="Main Farm / घर के पास वाला खेत"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    {lang === 'hi' ? 'क्षेत्रफल (एकड़)' : 'Area (Acres)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={farmAreaAcres}
                    onChange={(e) => setFarmAreaAcres(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    {lang === 'hi' ? 'सिंचाई प्रणाली' : 'Irrigation'}
                  </label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900"
                  >
                    <option value="Drip Irrigation">Drip Irrigation (ड्रिप)</option>
                    <option value="Sprinkler">Sprinkler (फव्वारा)</option>
                    <option value="Flood Irrigation">Flood (खुला पानी)</option>
                    <option value="Rainfed">Rainfed (वर्षा आधारित)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 4: CROP DETAILS                                             */}
          {/* ================================================================= */}
          {step === 4 && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <h3 className="font-black text-sm text-gray-900 uppercase tracking-wide">
                {lang === 'hi' ? 'फसल की जानकारी' : 'Crop Details'}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    {lang === 'hi' ? 'फसल का नाम' : 'Crop Name'}
                  </label>
                  <select
                    value={selectedCropName}
                    onChange={(e) => setSelectedCropName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900"
                  >
                    <option value="Cotton">Cotton (कपास)</option>
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Tomato">Tomato (टमाटर)</option>
                    <option value="Rice">Rice (धान / चावल)</option>
                    <option value="Wheat">Wheat (गेहूं)</option>
                    <option value="Maize">Maize (मक्का)</option>
                    <option value="Grapes">Grapes (अंगूर)</option>
                    <option value="Sugarcane">Sugarcane (गन्ना)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    {lang === 'hi' ? 'किस्म (Variety)' : 'Variety'}
                  </label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="Bt Cotton / देसी"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  {lang === 'hi' ? 'वर्तमान अवस्था (Growth Stage)' : 'Growth Stage'}
                </label>
                <select
                  value={cropStage}
                  onChange={(e) => setCropStage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900"
                >
                  <option value="Vegetative Stage">Vegetative Stage (वानस्पतिक वृद्धि)</option>
                  <option value="Flowering Stage">Flowering Stage (फूल आने की अवस्था)</option>
                  <option value="Boll/Fruit Formation">Boll/Fruit Formation (फल/टिंडे बनना)</option>
                  <option value="Maturity/Harvest">Maturity / Harvest (परिपक्वता)</option>
                </select>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1) as any)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'hi' ? 'पीछे' : 'Back'}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            step > 1 && (
              <button
                onClick={() => setStep((s) => Math.min(4, s + 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>{lang === 'hi' ? 'आगे बढ़ें' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )
          ) : (
            <button
              onClick={handleFinishOnboarding}
              disabled={authLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-black flex items-center gap-1.5 shadow-md"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[2.4]" />}
              <span>{lang === 'hi' ? 'डेटाबेस में सुरक्षित करें' : 'Save & Sync Farm'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

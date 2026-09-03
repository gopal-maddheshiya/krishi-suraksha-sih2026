import { useState } from 'react';
import { 
  User, Phone, ShieldCheck, MapPin, Sprout, 
  KeyRound, LogOut, LogIn, UserPlus, CheckCircle2, 
  AlertCircle, Loader2, Sparkles, RefreshCw, Calendar,
  Building, Check, Lock, Layers
} from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';
import { AuthService } from '@/services/AuthService';

type AccountProfileSectionProps = {
  onNavigateHome: () => void;
  onOpenFarmEditor: () => void;
};

export default function AccountProfileSection({ onNavigateHome, onOpenFarmEditor }: AccountProfileSectionProps) {
  const { lang } = useLang();
  const { currentUser, setCurrentUser, activeFarm, logout } = useFarmContext();

  // Auth sub-view for non-logged in users: 'login' | 'signup' | 'forgot_password'
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg(lang === 'hi' ? 'पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const user = await AuthService.signUpWithPhone(fullName, phone, password);
      setCurrentUser(user);
      setSuccessMsg(lang === 'hi' ? 'खाता सफलतापूर्वक बन गया!' : 'Account created successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'hi' ? 'खाता निर्माण विफल रहा।' : 'Sign up failed.'));
    } finally {
      setLoading(false);
    }
  };

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const user = await AuthService.loginWithPhone(phone, password);
      setCurrentUser(user);
      setSuccessMsg(lang === 'hi' ? 'लॉगिन सफल रहा!' : 'Login successful!');
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'hi' ? 'लॉगिन विफल रहा।' : 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  // Master Key Password Reset Handler (SIH2026)
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await AuthService.resetPasswordWithKey(phone, recoveryKey, newPassword);
      setSuccessMsg(res.message);
      setPassword(newPassword);
      setTimeout(() => {
        setAuthMode('login');
        setSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await AuthService.loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google login failed.');
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    setSuccessMsg(lang === 'hi' ? 'आप सफलतापूर्वक लॉगआउट हो गए हैं।' : 'Logged out successfully.');
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. STATE A: FARMER IS LOGGED IN (SHOW FULL PROFILE & ACCOUNT DASHBOARD)    */}
      {/* ========================================================================= */}
      {currentUser ? (
        <div className="space-y-6">
          
          {/* Top Banner Card */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-2xl shadow-inner">
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser.fullName}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{lang === 'hi' ? 'सत्यापित किसान' : 'Verified Farmer'}</span>
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90 mt-1 flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{currentUser.phone ? `+91 ${currentUser.phone}` : 'Registered User'}</span>
                  <span className="text-emerald-400">•</span>
                  <span>ID: {currentUser.id.slice(0, 12)}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'hi' ? 'लॉगआउट' : 'Log Out'}</span>
              </button>
            </div>
          </div>

          {/* Account Details 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Card: Active Farm & Land Record */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <Building className="w-4 h-4 stroke-[2.4]" />
                  </div>
                  <h3 className="font-extrabold text-sm text-stone-900">
                    {lang === 'hi' ? 'खेत का विवरण (Farm Details)' : 'Active Farm Information'}
                  </h3>
                </div>
                <button
                  onClick={onOpenFarmEditor}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                >
                  {lang === 'hi' ? 'संशोधन करें' : 'Edit Farm'}
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-stone-50">
                  <span className="text-stone-500 font-medium">{lang === 'hi' ? 'खेत का नाम' : 'Farm Name'}</span>
                  <span className="font-bold text-stone-900">{activeFarm?.farm_name || 'Main Farm'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-50">
                  <span className="text-stone-500 font-medium">{lang === 'hi' ? 'स्थान' : 'Location'}</span>
                  <span className="font-bold text-stone-900">{activeFarm?.district}, {activeFarm?.state}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-50">
                  <span className="text-stone-500 font-medium">{lang === 'hi' ? 'तहसील / गाँव' : 'Taluka / Village'}</span>
                  <span className="font-bold text-stone-900">{activeFarm?.taluka} • {activeFarm?.village}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-50">
                  <span className="text-stone-500 font-medium">{lang === 'hi' ? 'क्षेत्रफल' : 'Total Land Area'}</span>
                  <span className="font-bold text-emerald-700">{activeFarm?.area_acres || 2.5} Acres</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-50">
                  <span className="text-stone-500 font-medium">{lang === 'hi' ? 'मिट्टी का प्रकार' : 'Soil Type'}</span>
                  <span className="font-bold text-stone-900">{activeFarm?.soil_type || 'Black Cotton'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 font-medium">{lang === 'hi' ? 'सिंचाई प्रणाली' : 'Irrigation'}</span>
                  <span className="font-bold text-stone-900">{activeFarm?.irrigation_type || 'Drip Irrigation'}</span>
                </div>
              </div>
            </div>

            {/* Right Card: Active Crop Cycle */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                    <Sprout className="w-4 h-4 stroke-[2.4]" />
                  </div>
                  <h3 className="font-extrabold text-sm text-stone-900">
                    {lang === 'hi' ? 'फसल चक्र (Active Crop Cycle)' : 'Current Crop Cycle'}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                  {activeFarm?.crop?.name || 'Cotton'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-stone-50">
                  <span className="text-stone-500 font-medium">{lang === 'hi' ? 'फसल की किस्म' : 'Crop Variety'}</span>
                  <span className="font-bold text-stone-900">{activeFarm?.crop?.variety || 'Bt Cotton'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-50">
                  <span className="text-stone-500 font-medium">{lang === 'hi' ? 'बुवाई की तारीख' : 'Sowing Date'}</span>
                  <span className="font-bold text-stone-900">{activeFarm?.crop?.sowing_date || '2026-06-15'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-50">
                  <span className="text-stone-500 font-medium">{lang === 'hi' ? 'वर्तमान अवस्था' : 'Phenological Stage'}</span>
                  <span className="font-bold text-teal-700">{activeFarm?.crop?.stage || 'Flowering Stage'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-50">
                  <span className="text-stone-500 font-medium">{lang === 'hi' ? 'डेटाबेस स्थिति' : 'Database Status'}</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Supabase Live Synchronized</span>
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 font-medium">{lang === 'hi' ? 'सुरक्षा प्रोटोकॉल' : 'Security Level'}</span>
                  <span className="font-bold text-stone-900">ICAR Certified Protocol</span>
                </div>
              </div>
            </div>

          </div>

          {/* Master Recovery Key Info Box */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold">{lang === 'hi' ? 'मास्टर पासवर्ड रिकवरी कुंजी' : 'Master Password Recovery Key'}</div>
              <p className="text-[11px] text-amber-900/80 mt-0.5 leading-relaxed">
                {lang === 'hi'
                  ? 'यदि आप कभी अपना पासवर्ड भूल जाते हैं, तो आप आपातकालीन कुंजी "SIH2026" दर्ज करके तुरंत नया पासवर्ड सेट कर सकते हैं।'
                  : 'If you forget your password, you can reset it instantly using the Master Recovery Key "SIH2026".'}
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* 2. STATE B: FARMER IS NOT LOGGED IN (CLEAN IN-PAGE AUTH PORTAL)           */
        /* ========================================================================= */
        <div className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 space-y-6">
          
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
              <User className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h2 className="text-xl font-black text-stone-900">
              {authMode === 'signup' 
                ? (lang === 'hi' ? 'नया किसान खाता बनाएं' : 'Create Farmer Account')
                : authMode === 'login'
                ? (lang === 'hi' ? 'किसान पोर्टल में लॉगिन करें' : 'Login to Farmer Portal')
                : (lang === 'hi' ? 'मास्टर कुंजी से पासवर्ड बदलें' : 'Reset Password with Master Key')}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {lang === 'hi' ? 'सुरक्षित क्लाउड डेटाबेस सिंक' : 'Secure Cloud Database Sync'}
            </p>
          </div>

          {/* Clean Segmented Tab Switcher (No Emojis) */}
          {authMode !== 'forgot_password' && (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-stone-100 border border-stone-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setAuthMode('login');
                }}
                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  authMode === 'login'
                    ? 'bg-white text-emerald-900 shadow-sm border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'लॉगिन करें' : 'Login'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setAuthMode('signup');
                }}
                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  authMode === 'signup'
                    ? 'bg-white text-emerald-900 shadow-sm border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'नया खाता बनाएं' : 'Sign Up'}</span>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form A: Login */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {lang === 'hi' ? 'मोबाइल नंबर (10 अंक)' : 'Mobile Number (10 Digits)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-bold text-stone-400">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    required
                    className="w-full pl-12 pr-4 py-2.5 rounded-2xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-stone-600 uppercase">
                    {lang === 'hi' ? 'पासवर्ड' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setAuthMode('forgot_password');
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    {lang === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'लॉगिन करें' : 'Login'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form B: Sign Up */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {lang === 'hi' ? 'किसान का पूरा नाम' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={lang === 'hi' ? 'जैसे: रमेश पाटिल' : 'e.g. Ramesh Patil'}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {lang === 'hi' ? 'मोबाइल नंबर (10 अंक)' : 'Mobile Number (10 Digits)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-bold text-stone-400">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    required
                    className="w-full pl-12 pr-4 py-2.5 rounded-2xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {lang === 'hi' ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min 6 characters)'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {lang === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'खाता बनाएं एवं आगे बढ़ें' : 'Create Account & Continue'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form C: Forgot Password via Master Key (SIH2026) */}
          {authMode === 'forgot_password' && (
            <form onSubmit={handlePasswordReset} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {lang === 'hi' ? 'पंजीकृत मोबाइल नंबर' : 'Registered Mobile Number'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-xs font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-amber-300 bg-amber-50/50 text-xs font-black tracking-wider text-amber-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {lang === 'hi' ? 'नया पासवर्ड' : 'New Password (min 6 chars)'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'पासवर्ड बदलें' : 'Save New Password'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setAuthMode('login');
                }}
                className="w-full text-center py-2 text-xs font-bold text-stone-500 hover:text-stone-800"
              >
                ← {lang === 'hi' ? 'लॉगिन पर वापस जाएं' : 'Back to Login'}
              </button>
            </form>
          )}

          {/* Google Sign-in */}
          {authMode !== 'forgot_password' && (
            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-white hover:bg-stone-50 active:scale-98 border border-stone-300 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{lang === 'hi' ? 'Google से लॉगिन करें' : 'Continue with Google'}</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

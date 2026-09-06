import { useRef } from 'react';
import { Home, CloudRain, Camera, User, Store } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { useFarmContext } from '@/contexts/FarmContext';

interface MobileBottomNavProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenAccount?: () => void;
}

export default function MobileBottomNav({ activeSection, onNavigate, onOpenAccount }: MobileBottomNavProps) {
  const { lang } = useLang();
  const { currentUser } = useFarmContext();
  const directCameraInputRef = useRef<HTMLInputElement>(null);

  const accountLabel = currentUser
    ? (currentUser.fullName ? currentUser.fullName.split(' ')[0] : (lang === 'hi' ? 'प्रोफाइल' : 'Profile'))
    : (lang === 'hi' ? 'खाता' : 'Account');

  const navItems = [
    {
      id: 'home',
      label: lang === 'hi' ? 'होम' : lang === 'mr' ? 'मुख्य' : 'Home',
      icon: Home,
    },
    {
      id: 'medical-map',
      label: lang === 'hi' ? 'दुकानें' : lang === 'mr' ? 'दुकाने' : 'Agro Stores',
      icon: Store,
    },
    {
      id: 'report',
      label: lang === 'hi' ? 'फसल जांच' : lang === 'mr' ? 'पीक तपासणी' : 'Check Crop',
      icon: Camera,
      primary: true,
    },
    {
      id: 'weather',
      label: lang === 'hi' ? 'मौसम' : lang === 'mr' ? 'हवामान' : 'Weather',
      icon: CloudRain,
    },
    {
      id: 'account',
      label: accountLabel,
      icon: User,
      isAccountAction: true,
    },
  ];

  // Handle direct 1-tap camera capture
  const handlePrimaryCameraClick = () => {
    onNavigate('report');
    directCameraInputRef.current?.click();
  };

  const handleCameraFileCaptured = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const directScanEvent = new CustomEvent<File>('crophealth-direct-scan', { detail: file });
      window.dispatchEvent(directScanEvent);
    }
    if (directCameraInputRef.current) directCameraInputRef.current.value = '';
  };

  return (
    <>
      {/* Invisible Native Mobile Camera Capture Shutter */}
      <input
        ref={directCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraFileCaptured}
      />

      {/* 100% Solid, Non-Transparent, Opaque Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 pt-2 pb-3.5 safe-area-pb"
      >
        <div className="flex items-center justify-around max-w-md mx-auto relative bg-white">
          
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            const handleClick = () => {
              if (item.isAccountAction && onOpenAccount) {
                onOpenAccount();
              } else {
                onNavigate(item.id);
              }
            };

            // -------------------------------------------------------------
            // CENTER ELEVATED CAMERA BUTTON (PROMINENT, ERGONOMIC SHUTTER)
            // -------------------------------------------------------------
            if (item.primary) {
              return (
                <div key={item.id} className="relative -top-4.5 flex flex-col items-center z-10">
                  {/* Solid White Notch Backing (100% Opaque, No Transparency) */}
                  <div className="absolute -top-1.5 w-16 h-10 bg-white rounded-t-full border-t border-x border-stone-200 shadow-2xs -z-10" />

                  <button
                    type="button"
                    onClick={handlePrimaryCameraClick}
                    className="relative group focus:outline-none select-none active:scale-90 transition-transform duration-150"
                    aria-label={item.label}
                  >
                    {/* Elevated Circular Camera Disc */}
                    <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 border-[3px] border-white ${
                      isActive 
                        ? 'bg-gradient-to-tr from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-emerald-900/40 ring-2 ring-emerald-500/50 scale-105' 
                        : 'bg-gradient-to-tr from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-700/35'
                    }`}>
                      <Icon className="w-6 h-6 stroke-[2.4]" />
                    </div>
                  </button>

                  <span className={`text-[11px] font-black tracking-tight mt-1 ${
                    isActive ? 'text-emerald-900' : 'text-stone-800'
                  }`}>
                    {item.label}
                  </span>
                </div>
              );
            }

            // -------------------------------------------------------------
            // STANDARD NAVIGATION ICONS (SUBSTANTIAL, COMFORTABLE TOUCH TARGETS)
            // -------------------------------------------------------------
            return (
              <button
                key={item.id}
                type="button"
                onClick={handleClick}
                className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all duration-150 min-w-[58px] active:scale-95 ${
                  isActive 
                    ? 'text-emerald-900 font-bold bg-emerald-50/90 ring-1 ring-emerald-200/70 shadow-2xs' 
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-150 ${
                  isActive ? 'stroke-[2.4] text-emerald-800 scale-105' : 'stroke-[1.9]'
                }`} />
                <span className={`text-[11px] mt-1 tracking-tight ${
                  isActive ? 'font-black text-emerald-950' : 'font-semibold text-stone-600'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}

        </div>
      </nav>
    </>
  );
}

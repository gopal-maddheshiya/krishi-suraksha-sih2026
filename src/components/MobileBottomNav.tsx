import { useRef } from 'react';
import { Home, CloudRain, Camera, User, History } from 'lucide-react';
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
      id: 'history',
      label: lang === 'hi' ? 'इतिहास' : lang === 'mr' ? 'इतिहास' : 'History',
      icon: History,
    },
    {
      id: 'report',
      label: lang === 'hi' ? 'जांचें' : lang === 'mr' ? 'तपासा' : 'Check Crop',
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

      {/* Solid, 100% Opaque Bottom Navigation Bar with Elevated Center Shutter */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1 safe-area-pb">
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
            // CENTER ELEVATED CAMERA BUTTON (SOLID WHITE CURVED ARCH NOTCH)
            // -------------------------------------------------------------
            if (item.primary) {
              return (
                <div key={item.id} className="relative -top-3.5 flex flex-col items-center z-10">
                  {/* Solid White Notch Backing */}
                  <div className="absolute -top-1.5 w-14 h-8 bg-white rounded-t-full border-t border-x border-stone-200 -z-10" />

                  <button
                    type="button"
                    onClick={handlePrimaryCameraClick}
                    className="relative group focus:outline-none select-none active:scale-90 transition-transform duration-150"
                    aria-label={item.label}
                  >
                    {/* Elevated Circular Camera Disc */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-150 border-2 border-white ${
                      isActive 
                        ? 'bg-gradient-to-tr from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-emerald-900/40 ring-2 ring-emerald-500/40 scale-105' 
                        : 'bg-gradient-to-tr from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-700/30'
                    }`}>
                      <Icon className="w-5 h-5 stroke-[2.4]" />
                    </div>
                  </button>

                  <span className={`text-[10px] font-black tracking-tight mt-0.5 ${
                    isActive ? 'text-emerald-900' : 'text-stone-700'
                  }`}>
                    {item.label}
                  </span>
                </div>
              );
            }

            // -------------------------------------------------------------
            // STANDARD NAVIGATION ICONS (FLUSH, COMPACT, SPACE-SAVING)
            // -------------------------------------------------------------
            return (
              <button
                key={item.id}
                type="button"
                onClick={handleClick}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[50px] ${
                  isActive 
                    ? 'text-emerald-800 font-bold bg-emerald-50/80' 
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-150 ${
                  isActive ? 'stroke-[2.4] scale-105' : 'stroke-[1.8]'
                }`} />
                <span className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-black text-emerald-950' : 'font-medium text-stone-500'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}

        </div>
      </div>
    </>
  );
}

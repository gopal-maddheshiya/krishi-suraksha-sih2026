import { Home, CloudRain, Camera, User, UserCheck } from 'lucide-react';
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

  const accountLabel = currentUser
    ? (currentUser.fullName ? currentUser.fullName.split(' ')[0] : (lang === 'hi' ? 'प्रोफाइल' : 'Profile'))
    : (lang === 'hi' ? 'लॉगिन' : 'Login');

  const navItems = [
    {
      id: 'home',
      label: lang === 'hi' ? 'होम' : lang === 'mr' ? 'मुख्य' : 'Home',
      icon: Home,
    },
    {
      id: 'weather',
      label: lang === 'hi' ? 'मौसम' : lang === 'mr' ? 'हवामान' : 'Weather',
      icon: CloudRain,
    },
    {
      id: 'report',
      label: lang === 'hi' ? 'जांचें' : lang === 'mr' ? 'तपासा' : 'Check Crop',
      icon: Camera,
      primary: true,
    },
    {
      id: 'login',
      label: accountLabel,
      icon: User,
      isAccountAction: true,
    },
    {
      id: 'expert',
      label: lang === 'hi' ? 'विशेषज्ञ' : lang === 'mr' ? 'तज्ज्ञ' : 'Expert',
      icon: UserCheck,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
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

          if (item.primary) {
            return (
              <button
                key={item.id}
                onClick={handleClick}
                className="relative -top-5 flex flex-col items-center group focus:outline-none"
                aria-label={item.label}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform border-4 border-white">
                  <Camera className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-black text-emerald-800 tracking-tight mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={handleClick}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-h-[44px] min-w-[56px] transition-all ${
                isActive
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-gray-500 hover:text-gray-900 font-semibold'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

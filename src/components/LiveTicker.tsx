import { ShieldAlert } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

interface LiveTickerProps {
  onNavigate: (section: string) => void;
}

export default function LiveTicker({ onNavigate }: LiveTickerProps) {
  const { t } = useLang();

  return (
    <div className="flex items-center gap-2 text-[11px] font-medium text-stone-600">
      <span className="flex h-1.5 w-1.5 relative flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-600"></span>
      </span>
      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
      <span className="font-bold text-stone-900 uppercase tracking-wider">
        {t('home_today_on_farm')}
      </span>
      <span className="text-stone-300 hidden sm:inline">·</span>
      <span className="truncate flex-1">
        {t('home_no_action')}
      </span>
      <button
        onClick={() => onNavigate('hotspots')}
        className="font-bold text-emerald-700 hover:text-emerald-800 flex-shrink-0"
      >
        {t('home_open_map')} →
      </button>
    </div>
  );
}
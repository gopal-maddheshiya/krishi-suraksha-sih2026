import { useState, useEffect } from 'react';
import { Globe, Check, Sparkles, X, ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { languages, type LanguageCode } from '@/lib/i18n';

interface LanguageModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function LanguageModal({ forceOpen = false, onClose }: LanguageModalProps) {
  const { lang, setLang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(lang);

  useEffect(() => {
    // Check if the user has already chosen a language previously
    const hasChosen = localStorage.getItem('crophealth_lang_chosen');
    if (!hasChosen || forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  if (!isOpen) return null;

  const handleSelect = (code: LanguageCode) => {
    setSelectedLang(code);
    setLang(code);
  };

  const handleConfirm = () => {
    localStorage.setItem('crophealth_lang_chosen', 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleDismiss = () => {
    localStorage.setItem('crophealth_lang_chosen', 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Pattern & Header */}
        <div className="relative bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-6 text-white text-center">
          
          {/* Close button */}
          <button 
            onClick={handleDismiss}
            aria-label="Close language selector"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/20">
            <Globe className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            अपनी भाषा चुनें / Choose Language
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-md mx-auto">
            कृपया अपनी पसंदीदा भाषा चुनें ताकि सभी जानकारी और उपचार आपकी भाषा में मिल सके।
          </p>
        </div>

        {/* Language Grid */}
        <div className="p-5 sm:p-6 max-h-[55vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {languages.map((item) => {
              const isSelected = selectedLang === item.code;
              return (
                <button
                  key={item.code}
                  onClick={() => handleSelect(item.code as LanguageCode)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between group ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-sm ring-2 ring-emerald-400/40'
                      : 'bg-gray-50/70 hover:bg-gray-100/80 border-gray-200/80'
                  }`}
                >
                  <div>
                    <div className={`text-base sm:text-lg font-bold leading-tight ${isSelected ? 'text-emerald-900' : 'text-gray-900'}`}>
                      {item.nativeName}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 font-medium">
                      {item.name}
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-transparent group-hover:bg-gray-300'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer with Continue Button */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500 font-medium hidden sm:block">
            आप इसे कभी भी ऊपर हेडर से बदल सकते हैं।
          </div>

          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all ml-auto"
          >
            <span>आगे बढ़ें / Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

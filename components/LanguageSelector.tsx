import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { changeLanguage, getAvailableLanguages, getCurrentLanguage } from '../lib/i18n';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'inline' | 'compact';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'dropdown',
  className = '' 
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const languages = getAvailableLanguages();
  const currentLang = getCurrentLanguage();

  const handleLanguageChange = (code: string) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all duration-200 text-gray-300 hover:text-white"
          title="Change language"
        >
          <Globe className="w-5 h-5" />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-700 transition-colors ${
                    currentLang === lang.code ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300'
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  {currentLang === lang.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentLang === lang.code
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all duration-200 text-gray-300 hover:text-white"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm">
          {languages.find(l => l.code === currentLang)?.nativeName || 'English'}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-700 transition-colors ${
                  currentLang === lang.code ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300'
                }`}
              >
                <div>
                  <p className="font-medium">{lang.nativeName}</p>
                  <p className="text-xs text-gray-500">{lang.name}</p>
                </div>
                {currentLang === lang.code && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Hook for easy translation access
export function useAppTranslation() {
  const { t, i18n } = useTranslation();
  
  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage,
    availableLanguages: getAvailableLanguages(),
  };
}

export default LanguageSelector;

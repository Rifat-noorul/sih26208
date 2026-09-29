import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { type Language } from '../utils/i18n';
import { Globe, ChevronDown } from 'lucide-react';

const langLabels: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  mr: 'मराठी',
};

/**
 * Compact Polished Language Dropdown Selector (🌐 EN)
 */
export default function LanguageSelector() {
  const language = useGameStore((state) => state.language);
  const setLanguage = useGameStore((state) => state.setLanguage);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="language-selector-wrapper" ref={dropdownRef}>
      <button className="lang-dropdown-btn" onClick={() => setIsOpen(!isOpen)}>
        <Globe size={14} className="text-amber-400" />
        <span>{language.toUpperCase()}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="lang-dropdown-menu">
          {(['en', 'hi', 'ta', 'mr'] as Language[]).map((lang) => (
            <button
              key={lang}
              className={`lang-option ${language === lang ? 'active' : ''}`}
              onClick={() => {
                setLanguage(lang);
                setIsOpen(false);
              }}
            >
              <span className="lang-code">{lang.toUpperCase()}</span>
              <span className="lang-name">{langLabels[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

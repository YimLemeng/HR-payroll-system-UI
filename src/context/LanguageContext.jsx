import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionary } from '../translations/dictionary';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('hr_payroll_lang') || 'en'; 
  });

  useEffect(() => {
    localStorage.setItem('hr_payroll_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'km' ? 'en' : 'km'));
  };

  const setLanguage = (newLang) => {
    if (newLang === 'en' || newLang === 'km') {
      setLang(newLang);
    }
  };

  // Safe translation helper
  const t = (key) => {
    if (!dictionary[lang]) return key;
    return dictionary[lang][key] || dictionary['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

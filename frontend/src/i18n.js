// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import kinyarwandaTranslations from './locales/kinyarwanda.json';
import frenchTranslations from './locales/french.json';

const resources = {
  en: { translation: enTranslations },
  kinyarwanda: { translation: kinyarwandaTranslations },
  french: { translation: frenchTranslations }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
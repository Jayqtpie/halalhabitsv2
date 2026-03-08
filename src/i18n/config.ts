import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en/translation.json';

/**
 * Detect the device language, falling back to English.
 */
function getDeviceLanguage(): string {
  try {
    const locales = Localization.getLocales();
    return locales[0]?.languageCode ?? 'en';
  } catch {
    return 'en';
  }
}

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18next;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '@/constants/locales/en.json';
import tr from '@/constants/locales/tr.json';
import ar from '@/constants/locales/ar.json';

const LANGUAGE_KEY = '@app_language';

const resources = {
    en: { translation: en },
    tr: { translation: tr },
    ar: { translation: ar },
};

const initI18n = async () => {
    let savedLanguage = 'tr'; // Varsayılan dil

    try {
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (storedLanguage) {
            savedLanguage = storedLanguage;
        }
    } catch (error) {
        console.log('Error loading language:', error);
    }

    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: savedLanguage,
            fallbackLng: 'en',
            compatibilityJSON: 'v4',
            interpolation: {
                escapeValue: false,
            },
        });
};

export const changeLanguage = async (language: string) => {
    try {
        await AsyncStorage.setItem(LANGUAGE_KEY, language);
        await i18n.changeLanguage(language);
    } catch (error) {
        console.log('Error saving language:', error);
    }
};

export const getStoredLanguage = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(LANGUAGE_KEY);
    } catch (error) {
        console.log('Error getting language:', error);
        return null;
    }
};

export const setStoredLanguage = async (language: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
        console.log('Error setting language:', error);
    }
};

initI18n();

export default i18n;

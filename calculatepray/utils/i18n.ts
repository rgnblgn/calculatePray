import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '@/constants/locales/en.json';
import tr from '@/constants/locales/tr.json';
import ar from '@/constants/locales/ar.json';

export const LANGUAGE_KEY = '@app_language';

const resources = {
    en: { translation: en },
    tr: { translation: tr },
    ar: { translation: ar },
};

// i18n'i senkron olarak başlat
i18n.use(initReactI18next).init({
    resources,
    lng: 'tr', // Varsayılan dil
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
        escapeValue: false,
    },
});

export const initI18n = async () => {
    try {
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (storedLanguage) {
            await i18n.changeLanguage(storedLanguage);
        }
    } catch (error) {
        console.log('Error loading language:', error);
    }
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

export const clearStoredLanguage = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(LANGUAGE_KEY);
    } catch (error) {
        console.log('Error clearing language:', error);
    }
};

export default i18n;

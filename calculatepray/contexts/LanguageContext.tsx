import React, { createContext, useState, useContext, useEffect } from 'react';
import i18nInstance from '@/utils/i18n';
import { getStoredLanguage, setStoredLanguage, initI18n, clearStoredLanguage } from '@/utils/i18n';

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => Promise<void>;
    resetLanguage: () => Promise<void>;
    isLanguageSelected: boolean;
    isLoading: boolean;
    i18nReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<string>(i18nInstance.language || 'tr');
    const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [i18nReady, setI18nReady] = useState<boolean>(false);

    useEffect(() => {
        loadLanguage();

        // i18n languageChanged event'ini dinle
        const handleLanguageChange = (lng: string) => {
            console.log('i18n language changed event:', lng);
            setLanguageState(lng);
            setI18nReady(false);
            // Küçük bir gecikme ile i18n'in hazır olduğunu işaretle
            setTimeout(() => {
                setI18nReady(true);
            }, 50);
        };

        i18nInstance.on('languageChanged', handleLanguageChange);

        return () => {
            i18nInstance.off('languageChanged', handleLanguageChange);
        };
    }, []);

    const loadLanguage = async () => {
        try {
            console.log('Loading language...');
            // i18n'i başlat
            await initI18n();

            const storedLang = await getStoredLanguage();
            console.log('Stored language:', storedLang);

            if (storedLang) {
                setLanguageState(storedLang);
                setIsLanguageSelected(true);
                await i18nInstance.changeLanguage(storedLang);
                console.log('Language changed to:', storedLang, 'Current i18n language:', i18nInstance.language);
            } else {
                setIsLanguageSelected(false);
            }
            setI18nReady(true);
        } catch (error) {
            console.log('Error loading language:', error);
            setIsLanguageSelected(false);
            setI18nReady(true);
        } finally {
            setIsLoading(false);
        }
    };

    const setLanguage = async (lang: string) => {
        console.log('setLanguage called with:', lang);
        setI18nReady(false);
        await setStoredLanguage(lang);
        await i18nInstance.changeLanguage(lang);
        console.log('After changeLanguage, i18n language is:', i18nInstance.language);
        setLanguageState(lang);
        setIsLanguageSelected(true);
        // Küçük gecikme ile state'i güncelle
        setTimeout(() => {
            setI18nReady(true);
        }, 100);
    };

    const resetLanguage = async () => {
        console.log('Resetting language...');
        await clearStoredLanguage();
        setIsLanguageSelected(false);
        setI18nReady(false);
        // Küçük gecikme ile dil seçim ekranına dön
        setTimeout(() => {
            setI18nReady(true);
        }, 100);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, resetLanguage, isLanguageSelected, isLoading, i18nReady }}>
            {i18nReady ? children : null}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

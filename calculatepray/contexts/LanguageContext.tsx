import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getStoredLanguage, setStoredLanguage } from '@/utils/i18n';

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => Promise<void>;
    isLanguageSelected: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { i18n } = useTranslation();
    const [language, setLanguageState] = useState<string>('tr');
    const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(false);

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        const storedLang = await getStoredLanguage();
        if (storedLang) {
            setLanguageState(storedLang);
            setIsLanguageSelected(true);
            await i18n.changeLanguage(storedLang);
        } else {
            setIsLanguageSelected(false);
        }
    };

    const setLanguage = async (lang: string) => {
        await setStoredLanguage(lang);
        await i18n.changeLanguage(lang);
        setLanguageState(lang);
        setIsLanguageSelected(true);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, isLanguageSelected }}>
            {children}
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

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Language,
  Translations,
  getTranslation,
} from "../constants/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>("tr");
  const [t, setTranslations] = useState<Translations>(getTranslation("tr"));

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("selectedLanguage");
      if (
        savedLanguage &&
        (savedLanguage === "tr" ||
          savedLanguage === "en" ||
          savedLanguage === "ar")
      ) {
        setLanguageState(savedLanguage as Language);
        setTranslations(getTranslation(savedLanguage as Language));
      }
    } catch (error) {
      console.log("Error loading language:", error);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem("selectedLanguage", newLanguage);
      setLanguageState(newLanguage);
      setTranslations(getTranslation(newLanguage));
    } catch (error) {
      console.log("Error saving language:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Language } from "../../constants/translations";

interface LanguageSelectionScreenProps {
  onLanguageSelect: (language: Language) => void;
}

export default function LanguageSelectionScreen({
  onLanguageSelect,
}: LanguageSelectionScreenProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null
  );
  const scaleAnim = new Animated.Value(1);

  const languages: {
    code: Language;
    name: string;
    flag: string;
    nativeName: string;
  }[] = [
    { code: "tr", name: "Turkish", flag: "🇹🇷", nativeName: "Türkçe" },
    { code: "en", name: "English", flag: "🇬🇧", nativeName: "English" },
    { code: "ar", name: "Arabic", flag: "🇸🇦", nativeName: "العربية" },
  ];

  const handleLanguagePress = (language: Language) => {
    setSelectedLanguage(language);

    // Animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        onLanguageSelect(language);
      }, 200);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🌍</Text>
        <Text style={styles.subtitle}>
          {selectedLanguage === "tr"
            ? "Dil Seçimi"
            : selectedLanguage === "ar"
            ? "اختيار اللغة"
            : "Language Selection"}
        </Text>
        <Text style={styles.description}>
          {selectedLanguage === "tr"
            ? "Lütfen dilinizi seçin"
            : selectedLanguage === "ar"
            ? "الرجاء اختيار لغتك"
            : "Please select your language"}
        </Text>

        <View style={styles.languagesContainer}>
          {languages.map((lang) => (
            <Animated.View
              key={lang.code}
              style={[
                {
                  transform: [
                    { scale: selectedLanguage === lang.code ? scaleAnim : 1 },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  selectedLanguage === lang.code &&
                    styles.languageButtonSelected,
                ]}
                onPress={() => handleLanguagePress(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <View style={styles.languageTextContainer}>
                  <Text
                    style={[
                      styles.languageName,
                      selectedLanguage === lang.code &&
                        styles.languageNameSelected,
                    ]}
                  >
                    {lang.nativeName}
                  </Text>
                  <Text style={styles.languageEnglishName}>{lang.name}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F3",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    fontSize: 72,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 40,
    textAlign: "center",
  },
  languagesContainer: {
    width: "100%",
    gap: 16,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  languageButtonSelected: {
    borderColor: "#8B7355",
    backgroundColor: "#F7F4EF",
    shadowColor: "#8B7355",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  flag: {
    fontSize: 48,
    marginRight: 20,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 2,
  },
  languageNameSelected: {
    color: "#8B7355",
  },
  languageEnglishName: {
    fontSize: 14,
    color: "#A0AEC0",
  },
});

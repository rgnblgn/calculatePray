import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLanguage } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
}

const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSelectionScreen() {
    const { setLanguage } = useLanguage();

    const handleLanguageSelect = async (languageCode: string) => {
        await setLanguage(languageCode);
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <ThemedText style={styles.title}>Select Language</ThemedText>
                <ThemedText style={styles.subtitle}>اختر اللغة • Dil Seçin</ThemedText>

                <View style={styles.languagesContainer}>
                    {languages.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={styles.languageButton}
                            onPress={() => handleLanguageSelect(lang.code)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.languageContent}>
                                <ThemedText style={styles.flag}>{lang.flag}</ThemedText>
                                <View style={styles.languageTexts}>
                                    <ThemedText style={styles.languageName}>{lang.name}</ThemedText>
                                    <ThemedText style={styles.nativeName}>{lang.nativeName}</ThemedText>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <ThemedText style={styles.note}>
                    You can change this later in settings
                </ThemedText>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: isSmallDevice ? 16 : 20,
        justifyContent: 'center',
    },
    content: {
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        fontSize: isSmallDevice ? 28 : 32,
        fontWeight: '700',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 40,
        fontSize: isSmallDevice ? 14 : 16,
        opacity: 0.6,
    },
    languagesContainer: {
        gap: 12,
    },
    languageButton: {
        backgroundColor: '#B89968',
        borderRadius: 12,
        padding: isSmallDevice ? 16 : 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    languageContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    flag: {
        fontSize: isSmallDevice ? 32 : 40,
    },
    languageTexts: {
        flex: 1,
    },
    languageName: {
        fontSize: isSmallDevice ? 16 : 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    nativeName: {
        fontSize: isSmallDevice ? 14 : 16,
        color: '#FFFFFF',
        opacity: 0.8,
    },
    note: {
        textAlign: 'center',
        marginTop: 24,
        fontSize: 12,
        opacity: 0.5,
    },
});

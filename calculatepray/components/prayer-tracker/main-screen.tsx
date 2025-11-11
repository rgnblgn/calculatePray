import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, useColorScheme, Dimensions, TouchableOpacity, Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { Ionicons } from '@expo/vector-icons';
import { loadData, saveData, clearData } from '@/utils/storage';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

interface MainScreenProps {
    startDate: Date;
    debtDate: Date;
    onReset?: () => void;
}

interface PrayerCounts {
    sabah: number;
    ogle: number;
    ikindi: number;
    aksam: number;
    yatsi: number;
}

const PRAYERS = [
    { key: 'sabah', name: 'Sabah', icon: '🌅' },
    { key: 'ogle', name: 'Öğle', icon: '☀️' },
    { key: 'ikindi', name: 'İkindi', icon: '🌤️' },
    { key: 'aksam', name: 'Akşam', icon: '🌆' },
    { key: 'yatsi', name: 'Yatsı', icon: '🌙' },
];

export default function MainScreen({ startDate, debtDate, onReset }: MainScreenProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Hangi section açık?
    const [openSection, setOpenSection] = useState<'current' | 'past' | null>(null);

    // Tarihler arası gün farkını hesapla
    const calculateDaysDifference = (date1: Date, date2: Date): number => {
        const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.floor(diffTime / oneDay);
    };

    const daysDifference = calculateDaysDifference(startDate, debtDate);

    const [currentDebts, setCurrentDebts] = useState<PrayerCounts>({
        sabah: 0,
        ogle: 0,
        ikindi: 0,
        aksam: 0,
        yatsi: 0,
    });

    const [pastDebts, setPastDebts] = useState<PrayerCounts>({
        sabah: daysDifference,
        ogle: daysDifference,
        ikindi: daysDifference,
        aksam: daysDifference,
        yatsi: daysDifference,
    });

    // Storage'dan verileri yükle (ilk açılışta)
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        const storedData = await loadData();
        if (storedData) {
            setCurrentDebts(storedData.currentDebts);
            setPastDebts(storedData.pastDebts);
        }
    };

    // Counter değişikliklerini otomatik kaydet
    useEffect(() => {
        saveCurrentData();
    }, [currentDebts, pastDebts]);

    const saveCurrentData = async () => {
        await saveData({
            startDate: startDate.toISOString(),
            debtDate: debtDate.toISOString(),
            currentDebts,
            pastDebts,
        });
    };

    const handleResetData = () => {
        if (Platform.OS === 'web') {
            // Web için confirm kullan
            const confirmed = window.confirm(
                '⚠️ Emin Misiniz?\n\nTüm veriler silinecek ve yeni tarih girişi yapmanız gerekecek. Devam etmek istiyor musunuz?'
            );
            if (confirmed) {
                clearData().then(() => {
                    if (onReset) {
                        onReset();
                    }
                });
            }
        } else {
            // Mobil için Alert kullan
            Alert.alert(
                '⚠️ Emin Misiniz?',
                'Tüm veriler silinecek ve yeni tarih girişi yapmanız gerekecek. Devam etmek istiyor musunuz?',
                [
                    {
                        text: 'İptal',
                        style: 'cancel',
                        onPress: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
                    },
                    {
                        text: 'Evet, Sil',
                        style: 'destructive',
                        onPress: async () => {
                            await clearData();
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            if (onReset) {
                                onReset();
                            }
                        },
                    },
                ]
            );
        }
    };

    const updateCount = (type: 'current' | 'past', prayer: keyof PrayerCounts, delta: number) => {
        if (type === 'current') {
            setCurrentDebts(prev => ({
                ...prev,
                [prayer]: Math.max(0, prev[prayer] + delta),
            }));
        } else {
            setPastDebts(prev => ({
                ...prev,
                [prayer]: Math.max(0, prev[prayer] + delta),
            }));
        }
    };

    const currentTotal = Object.values(currentDebts).reduce((a, b) => a + b, 0);
    const pastTotal = Object.values(pastDebts).reduce((a, b) => a + b, 0);

    const renderPrayerItem = (prayer: typeof PRAYERS[0], count: number, type: 'current' | 'past', isLast: boolean = false) => (
        <View key={prayer.key} style={[styles.prayerItem, isLast && styles.prayerItemLast, isDark && styles.prayerItemDark]}>
            <View style={styles.prayerInfo}>
                <View style={styles.iconContainer}>
                    <ThemedText style={styles.prayerIcon}>{prayer.icon}</ThemedText>
                </View>
                <ThemedText style={styles.prayerName}>{prayer.name}</ThemedText>
            </View>
            <View style={styles.counterContainer}>
                <TouchableOpacity
                    style={[styles.counterButton, styles.minusButton]}
                    onPress={() => {
                        updateCount(type, prayer.key as keyof PrayerCounts, -1);
                        Haptics.selectionAsync();
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="remove" size={isSmallDevice ? 20 : 22} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={[styles.countDisplay, isDark && styles.countDisplayDark]}>
                    <ThemedText style={[styles.countText, isDark ? styles.countTextDark : styles.countTextLight]}>{count}</ThemedText>
                </View>
                <TouchableOpacity
                    style={[styles.counterButton, styles.plusButton]}
                    onPress={() => {
                        updateCount(type, prayer.key as keyof PrayerCounts, 1);
                        Haptics.selectionAsync();
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="add" size={isSmallDevice ? 20 : 22} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <ThemedText type="title" style={styles.title}>
                            🕌 Namaz Takip
                        </ThemedText>
                        <ThemedText style={styles.subtitle}>
                            Kaza namazlarınızı kolayca yönetin
                        </ThemedText>
                    </View>

                    <View style={[styles.section, styles.sectionShadow]}>
                        <Collapsible
                            title={`📊 Güncel Kazalar • Toplam: ${currentTotal}`}
                            isOpen={openSection === 'current'}
                            onToggle={() => setOpenSection(openSection === 'current' ? null : 'current')}
                        >
                            <ThemedView style={[styles.contentContainer, isDark && styles.contentContainerDark]}>
                                {PRAYERS.map((prayer, index) => renderPrayerItem(prayer, currentDebts[prayer.key as keyof PrayerCounts], 'current', index === PRAYERS.length - 1))}
                            </ThemedView>
                        </Collapsible>
                    </View>

                    <View style={[styles.section, styles.sectionShadow]}>
                        <Collapsible
                            title={`📜 Geçmiş Kazalar • Toplam: ${pastTotal}`}
                            isOpen={openSection === 'past'}
                            onToggle={() => setOpenSection(openSection === 'past' ? null : 'past')}
                        >
                            <ThemedView style={[styles.contentContainer, isDark && styles.contentContainerDark]}>
                                {PRAYERS.map((prayer, index) => renderPrayerItem(prayer, pastDebts[prayer.key as keyof PrayerCounts], 'past', index === PRAYERS.length - 1))}
                            </ThemedView>
                        </Collapsible>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.fixedButtonContainer, isDark && styles.fixedButtonContainerDark]}>
                <TouchableOpacity
                    style={[styles.resetButton, isDark && styles.resetButtonDark]}
                    onPress={handleResetData}
                    activeOpacity={0.7}
                >
                    <Ionicons name="refresh" size={20} color="#FFFFFF" style={styles.resetIcon} />
                    <ThemedText style={styles.resetButtonText}>Yeni Tarih Gir</ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingBottom: 100,
        backgroundColor: '#FFFFFF',
    },
    content: {
        padding: isSmallDevice ? 12 : 16,
        paddingTop: isSmallDevice ? 8 : 12,
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
    },
    header: {
        marginBottom: isSmallDevice ? 16 : 20,
        marginTop: isSmallDevice ? 20 : 28,
        paddingHorizontal: 8,
    },
    title: {
        textAlign: 'center',
        marginBottom: 6,
        fontSize: isSmallDevice ? 24 : 28,
        fontWeight: '800',
        color: '#2D3748',
    },
    subtitle: {
        textAlign: 'center',
        fontSize: isSmallDevice ? 13 : 14,
        color: '#718096',
        fontWeight: '500',
    },
    section: {
        marginBottom: isSmallDevice ? 14 : 18,
        borderRadius: 20,
        overflow: 'visible',
    },
    sectionShadow: {
        shadowColor: '#4A5568',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    contentContainer: {
        padding: isSmallDevice ? 8 : 12,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        marginTop: 8,
    },
    contentContainerDark: {
        backgroundColor: '#2D3748',
    },
    prayerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: isSmallDevice ? 10 : 12,
        paddingHorizontal: isSmallDevice ? 8 : 12,
        borderRadius: 14,
        marginBottom: 8,
        backgroundColor: '#F7FAFC',
        borderWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    prayerItemDark: {
        backgroundColor: '#4A5568',
        shadowOpacity: 0.1,
    },
    prayerItemLast: {
        marginBottom: 0,
    },
    prayerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
        marginRight: 8,
    },
    iconContainer: {
        width: isSmallDevice ? 36 : 42,
        height: isSmallDevice ? 36 : 42,
        borderRadius: isSmallDevice ? 18 : 21,
        backgroundColor: '#E6FFFA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        flexShrink: 0,
    },
    prayerIcon: {
        fontSize: isSmallDevice ? 18 : 22,
    },
    prayerName: {
        fontSize: isSmallDevice ? 14 : 16,
        fontWeight: '600',
        letterSpacing: 0.2,
        color: '#2D3748',
        flexShrink: 1,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 5 : 7,
        flexShrink: 0,
    },
    counterButton: {
        width: isSmallDevice ? 34 : 40,
        height: isSmallDevice ? 34 : 40,
        borderRadius: isSmallDevice ? 17 : 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    minusButton: {
        backgroundColor: '#FC8181',
    },
    plusButton: {
        backgroundColor: '#68D391',
    },
    counterButtonText: {
        color: '#FFFFFF',
        fontSize: isSmallDevice ? 20 : 24,
        fontWeight: 'bold',
        lineHeight: isSmallDevice ? 20 : 24,
    },
    countDisplay: {
        minWidth: isSmallDevice ? 38 : 46,
        paddingHorizontal: isSmallDevice ? 7 : 10,
        paddingVertical: isSmallDevice ? 7 : 9,
        backgroundColor: '#4FD1C5',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4FD1C5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    countDisplayDark: {
        backgroundColor: '#38B2AC',
    },
    countText: {
        fontSize: isSmallDevice ? 15 : 17,
        fontWeight: '700',
    },
    countTextLight: {
        color: '#FFFFFF',
    },
    countTextDark: {
        color: '#FFFFFF',
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: isSmallDevice ? 70 : 80,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: isSmallDevice ? 16 : 20,
    },
    fixedButtonContainerDark: {
        backgroundColor: '#2D3748',
    },
    resetButton: {
        backgroundColor: '#FC8181',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FC8181',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },
    resetButtonDark: {
        backgroundColor: '#E53E3E',
    },
    resetIcon: {
        marginRight: 8,
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});

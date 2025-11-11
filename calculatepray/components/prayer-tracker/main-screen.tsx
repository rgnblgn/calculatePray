import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, useColorScheme, Dimensions, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

interface MainScreenProps {
    startDate: Date;
    debtDate: Date;
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

export default function MainScreen({ startDate, debtDate }: MainScreenProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [currentDebts, setCurrentDebts] = useState<PrayerCounts>({
        sabah: 0,
        ogle: 0,
        ikindi: 0,
        aksam: 0,
        yatsi: 0,
    });

    const [pastDebts, setPastDebts] = useState<PrayerCounts>({
        sabah: 0,
        ogle: 0,
        ikindi: 0,
        aksam: 0,
        yatsi: 0,
    });

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

    const renderPrayerItem = (prayer: typeof PRAYERS[0], count: number, type: 'current' | 'past') => (
        <View key={prayer.key} style={styles.prayerItem}>
            <View style={styles.prayerInfo}>
                <ThemedText style={styles.prayerIcon}>{prayer.icon}</ThemedText>
                <ThemedText style={styles.prayerName}>{prayer.name}</ThemedText>
            </View>
            <View style={styles.counterContainer}>
                <TouchableOpacity
                    style={[styles.counterButton, styles.minusButton]}
                    onPress={() => updateCount(type, prayer.key as keyof PrayerCounts, -1)}
                    activeOpacity={0.7}
                >
                    <ThemedText style={styles.counterButtonText}>−</ThemedText>
                </TouchableOpacity>
                <View style={[styles.countDisplay, isDark && styles.countDisplayDark]}>
                    <ThemedText style={styles.countText}>{count}</ThemedText>
                </View>
                <TouchableOpacity
                    style={[styles.counterButton, styles.plusButton]}
                    onPress={() => updateCount(type, prayer.key as keyof PrayerCounts, 1)}
                    activeOpacity={0.7}
                >
                    <ThemedText style={styles.counterButtonText}>+</ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <ThemedView style={styles.content}>
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>
                        🕌 Namaz Takip
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Kaza namazlarınızı kolayca yönetin
                    </ThemedText>
                </View>

                <View style={[styles.section, styles.sectionShadow]}>
                    <Collapsible title="📊 Güncel Kazalar">
                        <ThemedView style={[styles.contentContainer, isDark && styles.contentContainerDark]}>
                            {PRAYERS.map(prayer => renderPrayerItem(prayer, currentDebts[prayer.key as keyof PrayerCounts], 'current'))}
                        </ThemedView>
                    </Collapsible>
                </View>

                <View style={[styles.section, styles.sectionShadow]}>
                    <Collapsible title="📜 Geçmiş Kazalar">
                        <ThemedView style={[styles.contentContainer, isDark && styles.contentContainerDark]}>
                            {PRAYERS.map(prayer => renderPrayerItem(prayer, pastDebts[prayer.key as keyof PrayerCounts], 'past'))}
                        </ThemedView>
                    </Collapsible>
                </View>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    content: {
        padding: isSmallDevice ? 16 : 20,
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },
    header: {
        marginBottom: isSmallDevice ? 20 : 24,
        marginTop: 10,
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        fontSize: isSmallDevice ? 28 : 32,
        fontWeight: 'bold',
    },
    subtitle: {
        textAlign: 'center',
        fontSize: isSmallDevice ? 14 : 15,
        opacity: 0.7,
    },
    section: {
        marginBottom: isSmallDevice ? 16 : 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    sectionShadow: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    contentContainer: {
        padding: isSmallDevice ? 12 : 16,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        marginTop: 8,
    },
    contentContainerDark: {
        backgroundColor: '#1C1C1E',
    },
    prayerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: isSmallDevice ? 12 : 14,
        paddingHorizontal: isSmallDevice ? 8 : 12,
        borderRadius: 10,
        marginBottom: 10,
    },
    prayerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    prayerIcon: {
        fontSize: isSmallDevice ? 22 : 24,
        marginRight: 12,
    },
    prayerName: {
        fontSize: isSmallDevice ? 16 : 18,
        fontWeight: '600',
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    counterButton: {
        width: isSmallDevice ? 36 : 40,
        height: isSmallDevice ? 36 : 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
    },
    minusButton: {
        backgroundColor: '#FF3B30',
    },
    plusButton: {
        backgroundColor: '#34C759',
    },
    counterButtonText: {
        color: '#FFFFFF',
        fontSize: isSmallDevice ? 20 : 24,
        fontWeight: 'bold',
        lineHeight: isSmallDevice ? 20 : 24,
    },
    countDisplay: {
        minWidth: isSmallDevice ? 40 : 50,
        paddingHorizontal: isSmallDevice ? 8 : 12,
        paddingVertical: isSmallDevice ? 6 : 8,
        backgroundColor: '#E5E5EA',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countDisplayDark: {
        backgroundColor: '#2C2C2E',
    },
    countText: {
        fontSize: isSmallDevice ? 16 : 18,
        fontWeight: 'bold',
    },
});

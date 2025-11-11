import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface OnboardingScreenProps {
    onComplete: (startDate: Date, debtDate: Date) => void;
}

const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const parseDate = (dateString: string): Date | null => {
    const parts = dateString.split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }
    return null;
};

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [debtDate, setDebtDate] = useState<Date>(new Date());
    const [startDateText, setStartDateText] = useState(formatDate(new Date()));
    const [debtDateText, setDebtDateText] = useState(formatDate(new Date()));

    const handleStartDateChange = (text: string) => {
        setStartDateText(text);
        const parsed = parseDate(text);
        if (parsed) {
            setStartDate(parsed);
        }
    };

    const handleDebtDateChange = (text: string) => {
        setDebtDateText(text);
        const parsed = parseDate(text);
        if (parsed) {
            setDebtDate(parsed);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
                Namaz Takip
            </ThemedText>

            <View style={styles.questionContainer}>
                <ThemedText type="subtitle" style={styles.question}>
                    Namaza Başlanan Tarih
                </ThemedText>
                <TextInput
                    style={styles.dateInput}
                    value={startDateText}
                    onChangeText={handleStartDateChange}
                    placeholder="GG/AA/YYYY"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.questionContainer}>
                <ThemedText type="subtitle" style={styles.question}>
                    Hangi Tarihten Beri Borç Eklemek İstiyorsunuz?
                </ThemedText>
                <TextInput
                    style={styles.dateInput}
                    value={debtDateText}
                    onChangeText={handleDebtDateChange}
                    placeholder="GG/AA/YYYY"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                />
            </View>

            <TouchableOpacity
                style={styles.submitButton}
                onPress={() => onComplete(startDate, debtDate)}
            >
                <ThemedText style={styles.submitButtonText}>Devam Et</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 40,
    },
    questionContainer: {
        marginBottom: 30,
    },
    question: {
        marginBottom: 10,
    },
    dateInput: {
        backgroundColor: '#F0F0F0',
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        color: '#000',
    },
    submitButton: {
        backgroundColor: '#34C759',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});


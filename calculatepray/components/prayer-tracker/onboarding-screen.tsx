import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, useColorScheme, Dimensions, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isWeb = Platform.OS === 'web';

interface OnboardingScreenProps {
    onComplete: (startDate: Date, debtDate: Date) => void;
}

const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [debtDate, setDebtDate] = useState<Date>(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showDebtPicker, setShowDebtPicker] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleStartDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowStartPicker(false);
        }
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const handleDebtDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDebtPicker(false);
        }
        if (selectedDate) {
            setDebtDate(selectedDate);
        }
    };

    const handleWebStartDateChange = (dateString: string) => {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            setStartDate(date);
        }
    };

    const handleWebDebtDateChange = (dateString: string) => {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            setDebtDate(date);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.card}>
                <ThemedText type="title" style={styles.title}>
                    🕌 Namaz Takip
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    Kaza namazlarınızı takip etmek için başlangıç bilgilerinizi girin
                </ThemedText>

                <View style={styles.questionContainer}>
                    <ThemedText type="subtitle" style={styles.question}>
                        📅 Namaza Başlanan Tarih
                    </ThemedText>
                    {isWeb ? (
                        <div style={{ position: 'relative' }}>
                            <input
                                className="custom-date-input"
                                style={{
                                    backgroundColor: isDark ? '#0A84FF' : '#007AFF',
                                    padding: isSmallDevice ? '16px' : '18px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    fontSize: isSmallDevice ? '17px' : '18px',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    width: '100%',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                }}
                                value={formatDateForInput(startDate)}
                                onChange={(e: any) => handleWebStartDateChange(e.target.value)}
                                type="date"
                                max={formatDateForInput(new Date())}
                            />
                            <style>{`
                                .custom-date-input::-webkit-calendar-picker-indicator {
                                    filter: invert(1);
                                    cursor: pointer;
                                    font-size: 18px;
                                }
                                .custom-date-input::-webkit-datetime-edit {
                                    color: white;
                                }
                                .custom-date-input::-webkit-datetime-edit-fields-wrapper {
                                    color: white;
                                }
                                .custom-date-input::-webkit-datetime-edit-text {
                                    color: white;
                                    padding: 0 0.3em;
                                }
                                .custom-date-input::-webkit-datetime-edit-month-field {
                                    color: white;
                                }
                                .custom-date-input::-webkit-datetime-edit-day-field {
                                    color: white;
                                }
                                .custom-date-input::-webkit-datetime-edit-year-field {
                                    color: white;
                                }
                                .custom-date-input:hover {
                                    opacity: 0.9;
                                    transition: opacity 0.2s;
                                }
                            `}</style>
                        </div>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.dateButton, isDark && styles.dateButtonDark]}
                                onPress={() => setShowStartPicker(true)}
                                activeOpacity={0.7}
                            >
                                <ThemedText style={styles.dateText}>{formatDate(startDate)}</ThemedText>
                            </TouchableOpacity>
                            {showStartPicker && (
                                <DateTimePicker
                                    value={startDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleStartDateChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </>
                    )}
                </View>

                <View style={styles.questionContainer}>
                    <ThemedText type="subtitle" style={styles.question}>
                        📋 Hangi Tarihten Beri Borç Eklemek İstiyorsunuz?
                    </ThemedText>
                    {isWeb ? (
                        <div style={{ position: 'relative' }}>
                            <input
                                className="custom-date-input"
                                style={{
                                    backgroundColor: isDark ? '#0A84FF' : '#007AFF',
                                    padding: isSmallDevice ? '16px' : '18px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    fontSize: isSmallDevice ? '17px' : '18px',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    width: '100%',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                }}
                                value={formatDateForInput(debtDate)}
                                onChange={(e: any) => handleWebDebtDateChange(e.target.value)}
                                type="date"
                                max={formatDateForInput(new Date())}
                            />
                        </div>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.dateButton, isDark && styles.dateButtonDark]}
                                onPress={() => setShowDebtPicker(true)}
                                activeOpacity={0.7}
                            >
                                <ThemedText style={styles.dateText}>{formatDate(debtDate)}</ThemedText>
                            </TouchableOpacity>
                            {showDebtPicker && (
                                <DateTimePicker
                                    value={debtDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDebtDateChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={() => onComplete(startDate, debtDate)}
                    activeOpacity={0.8}
                >
                    <ThemedText style={styles.submitButtonText}>✨ Devam Et</ThemedText>
                </TouchableOpacity>
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
    card: {
        borderRadius: 20,
        padding: isSmallDevice ? 20 : 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 12,
        fontSize: isSmallDevice ? 28 : 32,
        fontWeight: 'bold',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: isSmallDevice ? 24 : 32,
        fontSize: isSmallDevice ? 14 : 15,
        opacity: 0.7,
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    questionContainer: {
        marginBottom: isSmallDevice ? 24 : 28,
        width: '100%',
    },
    question: {
        marginBottom: 12,
        fontSize: isSmallDevice ? 16 : 17,
        fontWeight: '600',
    },
    dateButton: {
        backgroundColor: '#007AFF',
        padding: isSmallDevice ? 16 : 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
        width: '100%',
    },
    dateButtonDark: {
        backgroundColor: '#0A84FF',
    },
    dateText: {
        color: '#FFFFFF',
        fontSize: isSmallDevice ? 17 : 18,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#34C759',
        padding: isSmallDevice ? 16 : 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#34C759',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        width: '100%',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: isSmallDevice ? 18 : 20,
        fontWeight: 'bold',
    },
});


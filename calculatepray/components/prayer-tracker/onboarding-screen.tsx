import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useColorScheme,
  Dimensions,
  TextInput,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isWeb = Platform.OS === "web";

interface OnboardingScreenProps {
  onComplete: (debtDate: Date) => void;
}

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps) {
  const { t } = useTranslation();
  const { language } = useLanguage(); // Dil değişikliğini dinlemek için
  const [debtDate, setDebtDate] = useState<Date>(new Date());
  const [showDebtPicker, setShowDebtPicker] = useState(false);
  const [debtYearsAgo, setDebtYearsAgo] = useState<string>("");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleDebtYearsAgoChange = (text: string) => {
    // Sadece sayı girişine izin ver
    const numericValue = text.replace(/[^0-9]/g, "");
    setDebtYearsAgo(numericValue);

    if (numericValue && parseInt(numericValue) > 0) {
      const years = parseInt(numericValue);
      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setFullYear(today.getFullYear() - years);
      setDebtDate(pastDate);
    }
  };

  const handleDebtDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDebtPicker(false);
    }
    if (selectedDate) {
      setDebtDate(selectedDate);
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
      <View style={styles.content}>
        <ThemedText style={styles.title}>{t('onboarding.title')}</ThemedText>

        <View style={styles.section}>
          <View style={[styles.debtHeaderContainer, isDark && styles.debtHeaderContainerDark]}>
            <ThemedText style={[styles.debtTitle, isDark && styles.debtTitleDark]}>{t('onboarding.debtAddingTitle')}</ThemedText>
            <ThemedText style={[styles.debtSubtitle, isDark && styles.debtSubtitleDark]}>{t('onboarding.debtAddingSubtitle')}</ThemedText>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.yearsInput, isDark && styles.yearsInputDark]}
              placeholder={t('onboarding.debtYearsAgoPlaceholder')}
              placeholderTextColor={isDark ? "#A0AEC0" : "#718096"}
              keyboardType="numeric"
              value={debtYearsAgo}
              onChangeText={handleDebtYearsAgoChange}
              maxLength={2}
            />
            <ThemedText style={styles.orDivider}>{t('onboarding.or')}</ThemedText>
          </View>

          {isWeb ? (
            <div style={{ position: "relative" }}>
              <input
                className="custom-date-input-debt"
                style={{
                  backgroundColor: isDark ? "#38B2AC" : "#4FD1C5",
                  padding: isSmallDevice ? "12px" : "14px",
                  borderRadius: "10px",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: isSmallDevice ? "15px" : "16px",
                  fontWeight: "600",
                  textAlign: "center",
                  width: "100%",
                  cursor: "pointer",
                  boxSizing: "border-box",
                  outline: "none",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
                value={formatDateForInput(debtDate)}
                onChange={(e: any) => handleWebDebtDateChange(e.target.value)}
                type="date"
                max={formatDateForInput(new Date())}
              />
              <style>{`
                                .custom-date-input-debt::-webkit-calendar-picker-indicator {
                                    filter: invert(1);
                                    cursor: pointer;
                                    font-size: 16px;
                                }
                                .custom-date-input-debt::-webkit-datetime-edit {
                                    color: white;
                                }
                                .custom-date-input-debt::-webkit-datetime-edit-fields-wrapper {
                                    color: white;
                                }
                                .custom-date-input-debt::-webkit-datetime-edit-text {
                                    color: white;
                                    padding: 0 0.3em;
                                }
                                .custom-date-input-debt::-webkit-datetime-edit-month-field {
                                    color: white;
                                }
                                .custom-date-input-debt::-webkit-datetime-edit-day-field {
                                    color: white;
                                }
                                .custom-date-input-debt::-webkit-datetime-edit-year-field {
                                    color: white;
                                }
                                .custom-date-input-debt:hover {
                                    opacity: 0.9;
                                }
                            `}</style>
            </div>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.dateButton, isDark && styles.dateButtonDark]}
                onPress={() => setShowDebtPicker(true)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.dateText}>
                  {formatDate(debtDate)}
                </ThemedText>
              </TouchableOpacity>
              {showDebtPicker && (
                <DateTimePicker
                  value={debtDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDebtDateChange}
                  maximumDate={new Date()}
                />
              )}
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => onComplete(debtDate)}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.submitButtonText}>{t('onboarding.continue')}</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isSmallDevice ? 16 : 20,
    justifyContent: "center",
  },
  content: {
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: "700",
  },
  section: {
    marginBottom: 20,
  },
  debtHeaderContainer: {
    backgroundColor: "#E6FFFA",
    borderRadius: 12,
    padding: isSmallDevice ? 14 : 16,
    marginBottom: 16,
  },
  debtHeaderContainerDark: {
    backgroundColor: "#234E52",
  },
  debtTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: "700",
    marginBottom: 6,
    color: "#2D3748",
    textAlign: "center",
  },
  debtTitleDark: {
    color: "#E6FFFA",
  },
  debtSubtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: "500",
    color: "#4A5568",
    textAlign: "center",
    opacity: 0.9,
  },
  debtSubtitleDark: {
    color: "#B2D4D7",
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: "600",
    marginBottom: 10,
    opacity: 0.8,
  },
  inputRow: {
    marginBottom: 8,
  },
  yearsInput: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#E5DDD1",
    color: "#2C2416",
    marginBottom: 8,
  },
  yearsInputDark: {
    backgroundColor: "#2A2520",
    color: "#FFFFFF",
    borderColor: "#5C4A3A",
  },
  orDivider: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: "#B89968",
    padding: isSmallDevice ? 12 : 14,
    borderRadius: 10,
    alignItems: "center",
  },
  dateButtonDark: {
    backgroundColor: "#8B7355",
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#8B9A7E",
    padding: isSmallDevice ? 14 : 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: "700",
  },
});

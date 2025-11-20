import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useColorScheme,
  Dimensions,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Animated,
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

type TimeUnit = "day" | "month" | "year";

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
  const { language } = useLanguage();
  const [debtDate, setDebtDate] = useState<Date>(new Date());
  const [showDebtPicker, setShowDebtPicker] = useState(false);
  const [debtAmount, setDebtAmount] = useState<string>("");
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("year");
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleDebtAmountChange = (text: string) => {
    // Sadece sayı girişine izin ver
    const numericValue = text.replace(/[^0-9]/g, "");
    setDebtAmount(numericValue);

    if (numericValue && parseInt(numericValue) > 0) {
      const amount = parseInt(numericValue);
      const today = new Date();
      const pastDate = new Date(today);

      if (timeUnit === "year") {
        pastDate.setFullYear(today.getFullYear() - amount);
      } else if (timeUnit === "month") {
        // Her ay 30 gün olarak hesapla
        pastDate.setDate(today.getDate() - (amount * 30));
      } else if (timeUnit === "day") {
        pastDate.setDate(today.getDate() - amount);
      }

      setDebtDate(pastDate);
    }
  };

  const handleUnitChange = (unit: TimeUnit) => {
    setTimeUnit(unit);
    setShowUnitPicker(false); // Modal'ı kapat

    // Input focus'unu kaldır
    Keyboard.dismiss();
    if (inputRef.current) {
      inputRef.current.blur();
    }

    // Mevcut değer varsa, yeni birime göre tekrar hesapla
    if (debtAmount && parseInt(debtAmount) > 0) {
      const amount = parseInt(debtAmount);
      const today = new Date();
      const pastDate = new Date(today);

      if (unit === "year") {
        pastDate.setFullYear(today.getFullYear() - amount);
      } else if (unit === "month") {
        pastDate.setDate(today.getDate() - (amount * 30));
      } else if (unit === "day") {
        pastDate.setDate(today.getDate() - amount);
      }

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
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <ThemedText style={styles.title}>{t('onboarding.title')}</ThemedText>

          <View style={styles.section}>
            <View style={[styles.debtHeaderContainer, isDark && styles.debtHeaderContainerDark]}>
              <ThemedText style={[styles.debtTitle, isDark && styles.debtTitleDark]}>{t('onboarding.debtAddingTitle')}</ThemedText>
              <ThemedText style={[styles.debtSubtitle, isDark && styles.debtSubtitleDark]}>{t('onboarding.debtAddingSubtitle')}</ThemedText>
            </View>

            <View style={styles.inputWithUnitRow}>
              <TextInput
                ref={inputRef}
                style={[styles.amountInput, isDark && styles.amountInputDark]}
                placeholder={t('onboarding.amountPlaceholder')}
                placeholderTextColor={isDark ? "#A0AEC0" : "#718096"}
                keyboardType="numeric"
                value={debtAmount}
                onChangeText={handleDebtAmountChange}
                maxLength={3}
              />

              <TouchableOpacity
                style={[styles.unitButton, isDark && styles.unitButtonDark]}
                onPress={() => {
                  setShowUnitPicker(true);
                  Keyboard.dismiss();
                }}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.unitButtonText}>
                  {t(`onboarding.units.${timeUnit}`)}
                </ThemedText>
                <ThemedText style={styles.unitButtonArrow}>▼</ThemedText>
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.orDivider}>{t('onboarding.or')}</ThemedText>

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

        {/* Şık Unit Picker Modal */}
        <Modal
          visible={showUnitPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowUnitPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowUnitPicker(false)}
          >
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                  <View style={styles.modalHeader}>
                    <ThemedText style={styles.modalTitle}>
                      {t('onboarding.debtAddingSubtitle')}
                    </ThemedText>
                  </View>

                  <View style={styles.optionsList}>
                    {(["day", "month", "year"] as TimeUnit[]).map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.optionButton,
                          isDark && styles.optionButtonDark,
                          timeUnit === unit && styles.optionButtonSelected,
                          timeUnit === unit && isDark && styles.optionButtonSelectedDark,
                        ]}
                        onPress={() => handleUnitChange(unit)}
                        activeOpacity={0.7}
                      >
                        <ThemedText
                          style={[
                            styles.optionText,
                            timeUnit === unit && styles.optionTextSelected,
                          ]}
                        >
                          {t(`onboarding.units.${unit}`)}
                        </ThemedText>
                        {timeUnit === unit && (
                          <ThemedText style={styles.checkMark}>✓</ThemedText>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableOpacity>
        </Modal>
      </ThemedView>
    </TouchableWithoutFeedback>
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
  inputWithUnitRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  amountInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#E5DDD1",
    color: "#2C2416",
  },
  amountInputDark: {
    backgroundColor: "#2A2520",
    color: "#FFFFFF",
    borderColor: "#5C4A3A",
  },
  unitButton: {
    backgroundColor: "#4FD1C5",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minWidth: 100,
  },
  unitButtonDark: {
    backgroundColor: "#38B2AC",
  },
  unitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  unitButtonArrow: {
    color: "#FFFFFF",
    fontSize: 11,
    opacity: 0.8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 340,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContentDark: {
    backgroundColor: "#1A202C",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  optionsList: {
    gap: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#F7FAFC",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonDark: {
    backgroundColor: "#2D3748",
  },
  optionButtonSelected: {
    backgroundColor: "#E6FFFA",
    borderColor: "#4FD1C5",
  },
  optionButtonSelectedDark: {
    backgroundColor: "#234E52",
    borderColor: "#38B2AC",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  optionTextSelected: {
    fontWeight: "700",
    color: "#2C7A7B",
  },
  checkMark: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4FD1C5",
  },
});

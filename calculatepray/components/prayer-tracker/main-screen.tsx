import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { Ionicons } from "@expo/vector-icons";
import { loadData, saveData, clearData } from "@/utils/storage";
import surahNames from "@/constants/surahs.json";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

interface MainScreenProps {
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

export default function MainScreen({ debtDate, onReset }: MainScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const { resetLanguage, language } = useLanguage();

  const PRAYERS = [
    { key: "sabah", name: t("mainScreen.prayers.fajr"), icon: "🌅" },
    { key: "ogle", name: t("mainScreen.prayers.dhuhr"), icon: "☀️" },
    { key: "ikindi", name: t("mainScreen.prayers.asr"), icon: "🌤️" },
    { key: "aksam", name: t("mainScreen.prayers.maghrib"), icon: "🌆" },
    { key: "yatsi", name: t("mainScreen.prayers.isha"), icon: "🌙" },
  ];

  // Borç tarihinden bugüne kadar geçen gün sayısını hesapla
  const calculateDaysFromDebtDate = (debtDate: Date): number => {
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    const diffTime = Math.abs(today.getTime() - debtDate.getTime());
    return Math.floor(diffTime / oneDay);
  };

  const daysDifference = calculateDaysFromDebtDate(debtDate);

  // Hangi section açık?
  const [openSection, setOpenSection] = useState<
    "current" | "voluntary" | null
  >(null);

  // Detayları göster/gizle
  const [showDebtDetails, setShowDebtDetails] = useState(false);

  // Günün ayeti
  const [dailyAyah, setDailyAyah] = useState<{
    text: string;
    surah: string;
    numberInSurah: number;
    surahNumber: number;
  } | null>(null);

  const [currentDebts, setCurrentDebts] = useState<PrayerCounts>({
    sabah: 0,
    ogle: 0,
    ikindi: 0,
    aksam: 0,
    yatsi: 0,
  });

  const [voluntaryPrayers, setVoluntaryPrayers] = useState<PrayerCounts>({
    sabah: 0,
    ogle: 0,
    ikindi: 0,
    aksam: 0,
    yatsi: 0,
  });

  const [paidDebts, setPaidDebts] = useState<PrayerCounts>({
    sabah: 0,
    ogle: 0,
    ikindi: 0,
    aksam: 0,
    yatsi: 0,
  });

  // Storage'dan verileri yükle (ilk açılışta)
  useEffect(() => {
    loadInitialData();
  }, []);

  // Dil değiştiğinde ayeti yeniden yükle
  useEffect(() => {
    fetchQuranData();
  }, [language]);

  const fetchQuranData = async () => {
    try {
      // Dil ayarına göre çeviri seç
      const translationMap: { [key: string]: string } = {
        tr: "tr.diyanet",
        en: "en.asad",
        ar: "ar.alafasy",
      };
      const translation = translationMap[language] || "tr.diyanet";

      let selectedAyah = null;
      let selectedSurahNumber = 0;
      let attempts = 0;
      const maxAttempts = 20; // Sonsuz döngüye girmemek için limit

      // Text uzunluğu 25'in üstünde bir ayet bulana kadar dene
      while (
        (!selectedAyah || selectedAyah.text.length < 25) &&
        attempts < maxAttempts
      ) {
        attempts++;

        // Random sure numarası seç (1 ile 114 arası)
        const randomSurahNumber = Math.floor(Math.random() * 114) + 1;
        selectedSurahNumber = randomSurahNumber;

        console.log(
          `Attempt ${attempts}: Selected Surah Number: ${randomSurahNumber}`
        );

        // O sureyi çek
        const surahResponse = await fetch(
          `https://api.alquran.cloud/v1/surah/${randomSurahNumber}/${translation}`
        );
        const surahData = await surahResponse.json();

        if (surahData.code === 200 && surahData.data && surahData.data.ayahs) {
          const ayahs = surahData.data.ayahs;
          const numberOfAyahs = ayahs.length;
          const surahName = surahData.data.name;

          // Random ayet numarası seç (2 ile numberOfAyahs arası, index için -1)
          const randomAyahIndex =
            Math.floor(Math.random() * (numberOfAyahs - 1)) + 1;

          selectedAyah = {
            ...ayahs[randomAyahIndex],
            surahName: surahName,
          };

          console.log(`Ayah text length: ${selectedAyah.text.length}`);
        }
      }

      // Uygun ayet bulunduysa state'e kaydet
      if (selectedAyah && selectedAyah.text.length >= 25) {
        console.log("Selected Ayah:", selectedAyah);
        setDailyAyah({
          text: selectedAyah.text,
          surah: selectedAyah.surahName,
          numberInSurah: selectedAyah.numberInSurah,
          surahNumber: selectedSurahNumber,
        });
      } else {
        console.log("Could not find suitable ayah after max attempts");
      }
    } catch (error) {
      console.error("Error fetching Quran data:", error);
    }
  };

  const loadInitialData = async () => {
    const storedData = await loadData();
    if (storedData) {
      setCurrentDebts(storedData.currentDebts);
      setVoluntaryPrayers(
        storedData.voluntaryPrayers || {
          sabah: 0,
          ogle: 0,
          ikindi: 0,
          aksam: 0,
          yatsi: 0,
        }
      );
      setPaidDebts(
        storedData.paidDebts || {
          sabah: 0,
          ogle: 0,
          ikindi: 0,
          aksam: 0,
          yatsi: 0,
        }
      );
    }
  };

  const saveCurrentData = useCallback(async () => {
    await saveData({
      debtDate: debtDate.toISOString(),
      currentDebts,
      voluntaryPrayers,
      paidDebts,
    });
  }, [debtDate, currentDebts, voluntaryPrayers, paidDebts]);

  // Counter değişikliklerini otomatik kaydet
  useEffect(() => {
    saveCurrentData();
  }, [currentDebts, voluntaryPrayers, saveCurrentData]);

  const handleResetData = () => {
    if (Platform.OS === "web") {
      // Web için confirm kullan
      const confirmed = window.confirm(
        "⚠️ Emin Misiniz?\n\nTüm veriler silinecek ve yeni tarih girişi yapmanız gerekecek. Devam etmek istiyor musunuz?"
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
        "⚠️ Emin Misiniz?",
        "Tüm veriler silinecek ve yeni tarih girişi yapmanız gerekecek. Devam etmek istiyor musunuz?",
        [
          {
            text: "İptal",
            style: "cancel",
            onPress: () =>
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning
              ),
          },
          {
            text: "Evet, Sil",
            style: "destructive",
            onPress: async () => {
              await clearData();
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              if (onReset) {
                onReset();
              }
            },
          },
        ]
      );
    }
  };

  const updateCount = (
    type: "current" | "voluntary",
    prayer: keyof PrayerCounts,
    delta: number
  ) => {
    if (type === "current") {
      setCurrentDebts((prev) => ({
        ...prev,
        [prayer]: Math.max(0, prev[prayer] + delta),
      }));
    } else {
      setVoluntaryPrayers((prev) => ({
        ...prev,
        [prayer]: Math.max(0, prev[prayer] + delta),
      }));
    }
  };

  const handleSaveVoluntaryPrayers = async () => {
    if (voluntaryTotal === 0) {
      Alert.alert("Uyarı", "Kaydedilecek nafile namaz bulunmuyor.");
      return;
    }

    // Nafile namazları paidDebts'e ekle (currentDebts'e ekleme!)
    const updatedPaidDebts: PrayerCounts = {
      sabah: paidDebts.sabah + voluntaryPrayers.sabah,
      ogle: paidDebts.ogle + voluntaryPrayers.ogle,
      ikindi: paidDebts.ikindi + voluntaryPrayers.ikindi,
      aksam: paidDebts.aksam + voluntaryPrayers.aksam,
      yatsi: paidDebts.yatsi + voluntaryPrayers.yatsi,
    };

    setPaidDebts(updatedPaidDebts);

    // Nafile namazları sıfırla
    setVoluntaryPrayers({
      sabah: 0,
      ogle: 0,
      ikindi: 0,
      aksam: 0,
      yatsi: 0,
    });

    // Storage'a kaydet
    await saveData({
      debtDate: debtDate.toISOString(),
      currentDebts,
      voluntaryPrayers: {
        sabah: 0,
        ogle: 0,
        ikindi: 0,
        aksam: 0,
        yatsi: 0,
      },
      paidDebts: updatedPaidDebts,
    });

    // Başarı feedback'i
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "✅ Kaydedildi",
      `${voluntaryTotal} nafile namaz borçtan düşüldü. Allah kabul etsin! 🤲`
    );
  };

  const currentTotal = Object.values(currentDebts).reduce((a, b) => a + b, 0);
  const voluntaryTotal = Object.values(voluntaryPrayers).reduce(
    (a, b) => a + b,
    0
  );

  // Toplam borç hesaplama
  // Gün hesabı: Her vakitten (currentDebts + paidDebts) kaç tane kılınmışsa
  // En az kılınan vakit sayısı = Tam gün sayısı
  const completedDays = Math.min(
    currentDebts.sabah + paidDebts.sabah,
    currentDebts.ogle + paidDebts.ogle,
    currentDebts.ikindi + paidDebts.ikindi,
    currentDebts.aksam + paidDebts.aksam,
    currentDebts.yatsi + paidDebts.yatsi
  );

  const remainingDays = Math.max(0, daysDifference - completedDays);

  // Her vakitten kaç namaz borcu kaldığını hesapla (paidDebts dahil)
  const getDebtDetailsByPrayer = () => {
    const prayerOrder = ["sabah", "ogle", "ikindi", "aksam", "yatsi"] as const;
    const prayerKeys = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
    const prayerIcons = ["🌅", "☀️", "🌤️", "🌆", "🌙"];

    return prayerOrder.map((key, index) => {
      const totalExpected = daysDifference;
      const completed = currentDebts[key] + paidDebts[key];
      const remaining = Math.max(0, totalExpected - completed);

      return {
        key,
        name: t(`mainScreen.prayers.${prayerKeys[index]}`),
        icon: prayerIcons[index],
        remaining,
      };
    });
  };

  const debtDetails = getDebtDetailsByPrayer();

  const renderPrayerItem = (
    prayer: (typeof PRAYERS)[0],
    count: number,
    type: "current" | "voluntary",
    isLast: boolean = false
  ) => (
    <View
      key={prayer.key}
      style={[
        styles.prayerItem,
        isLast && styles.prayerItemLast,
        isDark && styles.prayerItemDark,
      ]}
    >
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
          <Ionicons
            name="remove"
            size={isSmallDevice ? 20 : 22}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <View style={[styles.countDisplay, isDark && styles.countDisplayDark]}>
          <ThemedText
            style={[
              styles.countText,
              isDark ? styles.countTextDark : styles.countTextLight,
            ]}
          >
            {count}
          </ThemedText>
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

  const handleChangeLanguage = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(t("settings.changeLanguageConfirm"));
      if (confirmed) {
        resetLanguage();
      }
    } else {
      Alert.alert(
        t("settings.changeLanguage"),
        t("settings.changeLanguageConfirm"),
        [
          {
            text: t("settings.cancel"),
            style: "cancel",
          },
          {
            text: t("settings.change"),
            onPress: () => resetLanguage(),
          },
        ]
      );
    }
  };

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
              {t("mainScreen.title")}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {t("mainScreen.subtitle")}
            </ThemedText>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.languageButton,
                isDark && styles.languageButtonDark,
              ]}
              onPress={handleChangeLanguage}
              activeOpacity={0.7}
            >
              <Ionicons
                name="language"
                size={18}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <ThemedText style={styles.actionButtonText}>
                {t("settings.changeLanguage")}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.resetButton,
                isDark && styles.resetButtonDark,
              ]}
              onPress={handleResetData}
              activeOpacity={0.7}
            >
              <Ionicons
                name="refresh"
                size={18}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <ThemedText style={styles.actionButtonText}>
                {t("mainScreen.newDate")}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={[styles.section, styles.sectionShadow]}>
            <Collapsible
              title={`${t("mainScreen.currentDebts")} ${currentTotal}`}
              isOpen={openSection === "current"}
              onToggle={() =>
                setOpenSection(openSection === "current" ? null : "current")
              }
            >
              <ThemedView
                style={[
                  styles.contentContainer,
                  isDark && styles.contentContainerDark,
                ]}
              >
                {PRAYERS.map((prayer, index) =>
                  renderPrayerItem(
                    prayer,
                    currentDebts[prayer.key as keyof PrayerCounts],
                    "current",
                    index === PRAYERS.length - 1
                  )
                )}
              </ThemedView>
            </Collapsible>
          </View>

          <View style={[styles.section, styles.sectionShadow]}>
            <Collapsible
              title={`${t("mainScreen.voluntaryPrayers")} ${voluntaryTotal}`}
              isOpen={openSection === "voluntary"}
              onToggle={() =>
                setOpenSection(openSection === "voluntary" ? null : "voluntary")
              }
            >
              <ThemedView
                style={[
                  styles.contentContainer,
                  isDark && styles.contentContainerDark,
                ]}
              >
                {PRAYERS.map((prayer, index) =>
                  renderPrayerItem(
                    prayer,
                    voluntaryPrayers[prayer.key as keyof PrayerCounts],
                    "voluntary",
                    index === PRAYERS.length - 1
                  )
                )}
              </ThemedView>
              {openSection === "voluntary" && (
                <>
                  <View
                    style={[
                      styles.voluntaryNote,
                      isDark && styles.voluntaryNoteDark,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.voluntaryNoteText,
                        isDark && styles.voluntaryNoteTextDark,
                      ]}
                    >
                      {remainingDays > 0
                        ? t("mainScreen.remainingDebt", { days: remainingDays })
                        : t("mainScreen.noDebt")}
                      {"\n"}
                      {t("mainScreen.prayerAccepted")}
                    </ThemedText>
                  </View>

                  {remainingDays > 0 && (
                    <TouchableOpacity
                      style={[
                        styles.detailsButton,
                        isDark && styles.detailsButtonDark,
                      ]}
                      onPress={() => setShowDebtDetails(!showDebtDetails)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={showDebtDetails ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={isDark ? "#D4C4B0" : "#8B7355"}
                        style={styles.detailsIcon}
                      />
                      <ThemedText
                        style={[
                          styles.detailsButtonText,
                          isDark && styles.detailsButtonTextDark,
                        ]}
                      >
                        {showDebtDetails
                          ? t("mainScreen.hideDetails")
                          : t("mainScreen.showDetails")}
                      </ThemedText>
                    </TouchableOpacity>
                  )}

                  {showDebtDetails && remainingDays > 0 && (
                    <View
                      style={[
                        styles.debtDetailsContainer,
                        isDark && styles.debtDetailsContainerDark,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.debtDetailsTitle,
                          isDark && styles.debtDetailsTitleDark,
                        ]}
                      >
                        {t("mainScreen.remainingByPrayer")}
                      </ThemedText>
                      {debtDetails.map(
                        (detail) =>
                          detail.remaining > 0 && (
                            <View
                              key={detail.key}
                              style={[
                                styles.debtDetailItem,
                                isDark && styles.debtDetailItemDark,
                              ]}
                            >
                              <ThemedText style={styles.debtDetailIcon}>
                                {detail.icon}
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.debtDetailName,
                                  isDark && styles.debtDetailNameDark,
                                ]}
                              >
                                {detail.name}
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.debtDetailCount,
                                  isDark && styles.debtDetailCountDark,
                                ]}
                              >
                                {detail.remaining} {t("mainScreen.pieces")}
                              </ThemedText>
                            </View>
                          )
                      )}
                    </View>
                  )}

                  {voluntaryTotal > 0 && (
                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        isDark && styles.saveButtonDark,
                      ]}
                      onPress={handleSaveVoluntaryPrayers}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#FFFFFF"
                        style={styles.saveIcon}
                      />
                      <ThemedText style={styles.saveButtonText}>
                        Kaydet ve Borçtan Düş
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </Collapsible>
          </View>

          {dailyAyah && (
            <View
              style={[styles.ayahContainer, isDark && styles.ayahContainerDark]}
            >
              <View style={styles.ayahHeader}>
                <ThemedText style={styles.ayahTitle}>
                  📖 {t("mainScreen.dailyVerse")}
                </ThemedText>
                <ThemedText style={styles.ayahReference}>
                  {language === "ar"
                    ? dailyAyah.surah
                    : (surahNames as any)[dailyAyah.surahNumber.toString()][
                        language
                      ] || dailyAyah.surah}{" "}
                  - {dailyAyah.numberInSurah}
                </ThemedText>
              </View>
              <ThemedText
                style={[styles.ayahText, isDark && styles.ayahTextDark]}
              >
                {dailyAyah.text}
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 80,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: isSmallDevice ? 12 : 16,
    paddingTop: isSmallDevice ? 8 : 12,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: isSmallDevice ? 16 : 20,
    marginTop: isSmallDevice ? 20 : 28,
    paddingHorizontal: 8,
  },
  title: {
    textAlign: "center",
    marginBottom: 6,
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: "800",
    color: "#2D3748",
  },
  subtitle: {
    textAlign: "center",
    fontSize: isSmallDevice ? 13 : 14,
    color: "#718096",
    fontWeight: "500",
  },
  ayahContainer: {
    backgroundColor: "#E6FFFA",
    borderRadius: 16,
    padding: isSmallDevice ? 14 : 18,
    marginTop: isSmallDevice ? 20 : 24,
    marginBottom: isSmallDevice ? 20 : 24,
    borderLeftWidth: 4,
    borderLeftColor: "#4FD1C5",
    shadowColor: "#4FD1C5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  ayahContainerDark: {
    backgroundColor: "#234E52",
    borderLeftColor: "#38B2AC",
  },
  ayahHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ayahTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: "700",
    color: "#2D3748",
  },
  ayahReference: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: "600",
    color: "#8B7355",
  },
  ayahText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 22 : 24,
    color: "#2D3748",
    fontStyle: "italic",
  },
  ayahTextDark: {
    color: "#F5EFE6",
  },
  section: {
    marginBottom: isSmallDevice ? 14 : 18,
    borderRadius: 20,
    overflow: "visible",
  },
  sectionShadow: {
    shadowColor: "#4A5568",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  contentContainer: {
    padding: isSmallDevice ? 8 : 12,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    marginTop: 8,
  },
  contentContainerDark: {
    backgroundColor: "#2A2520",
  },
  prayerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 8 : 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#FAF8F3",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  prayerItemDark: {
    backgroundColor: "#3D3428",
    shadowOpacity: 0.08,
  },
  prayerItemLast: {
    marginBottom: 0,
  },
  prayerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  iconContainer: {
    width: isSmallDevice ? 36 : 42,
    height: isSmallDevice ? 36 : 42,
    borderRadius: isSmallDevice ? 18 : 21,
    backgroundColor: "#F5EFE6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    flexShrink: 0,
  },
  prayerIcon: {
    fontSize: isSmallDevice ? 18 : 22,
  },
  prayerName: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "600",
    letterSpacing: 0.2,
    color: "#2D3748",
    flexShrink: 1,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: isSmallDevice ? 5 : 7,
    flexShrink: 0,
  },
  counterButton: {
    width: isSmallDevice ? 30 : 34,
    height: isSmallDevice ? 30 : 34,
    borderRadius: isSmallDevice ? 8 : 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  minusButton: {
    backgroundColor: "#D4A373",
  },
  plusButton: {
    backgroundColor: "#8B9A7E",
  },
  counterButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: "bold",
    lineHeight: isSmallDevice ? 20 : 24,
  },
  countDisplay: {
    minWidth: isSmallDevice ? 36 : 42,
    paddingHorizontal: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 6 : 8,
    backgroundColor: "#B89968",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  countDisplayDark: {
    backgroundColor: "#8B7355",
  },
  countText: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: "700",
  },
  countTextLight: {
    color: "#FFFFFF",
  },
  countTextDark: {
    color: "#FFFFFF",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: isSmallDevice ? 18 : 22,
    paddingHorizontal: 4,
  },
  actionButton: {
    flex: 1,
    paddingVertical: isSmallDevice ? 8 : 10,
    paddingHorizontal: isSmallDevice ? 10 : 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  languageButton: {
    backgroundColor: "#4FD1C5",
  },
  languageButtonDark: {
    backgroundColor: "#38B2AC",
  },
  resetButton: {
    backgroundColor: "#D4A373",
  },
  resetButtonDark: {
    backgroundColor: "#B5886D",
  },
  buttonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  resetIcon: {
    marginRight: 6,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  voluntaryNote: {
    backgroundColor: "#F5EFE6",
    borderRadius: 10,
    padding: isSmallDevice ? 10 : 12,
    marginTop: 12,
    marginHorizontal: isSmallDevice ? 8 : 12,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#B89968",
  },
  voluntaryNoteDark: {
    backgroundColor: "#3D3428",
    borderLeftColor: "#8B7355",
  },
  voluntaryNoteText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 18 : 20,
    color: "#5C4A3A",
    textAlign: "center",
    fontWeight: "500",
  },
  voluntaryNoteTextDark: {
    color: "#D4C4B0",
  },
  saveButton: {
    backgroundColor: "#8B9A7E",
    paddingVertical: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 16 : 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginHorizontal: isSmallDevice ? 8 : 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonDark: {
    backgroundColor: "#6B7A5F",
  },
  saveIcon: {
    marginRight: 6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isSmallDevice ? 8 : 10,
    marginTop: 8,
    marginHorizontal: isSmallDevice ? 8 : 12,
    marginBottom: 4,
  },
  detailsButtonDark: {
    opacity: 0.9,
  },
  detailsIcon: {
    marginRight: 4,
  },
  detailsButtonText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: "#8B7355",
    fontWeight: "600",
  },
  detailsButtonTextDark: {
    color: "#D4C4B0",
  },
  debtDetailsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: isSmallDevice ? 10 : 12,
    marginTop: 8,
    marginHorizontal: isSmallDevice ? 8 : 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#E5DDD1",
  },
  debtDetailsContainerDark: {
    backgroundColor: "#2A2520",
    borderColor: "#5C4A3A",
  },
  debtDetailsTitle: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: "700",
    color: "#5C4A3A",
    marginBottom: 10,
    textAlign: "center",
  },
  debtDetailsTitleDark: {
    color: "#D4C4B0",
  },
  debtDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: isSmallDevice ? 6 : 8,
    paddingHorizontal: isSmallDevice ? 8 : 10,
    backgroundColor: "#FAF8F3",
    borderRadius: 8,
    marginBottom: 6,
  },
  debtDetailItemDark: {
    backgroundColor: "#3D3428",
  },
  debtDetailIcon: {
    fontSize: isSmallDevice ? 16 : 18,
    marginRight: 8,
  },
  debtDetailName: {
    flex: 1,
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: "600",
    color: "#5C4A3A",
  },
  debtDetailNameDark: {
    color: "#E5DDD1",
  },
  debtDetailCount: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: "700",
    color: "#8B7355",
  },
  debtDetailCountDark: {
    color: "#B89968",
  },
});

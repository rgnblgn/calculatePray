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
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { Ionicons } from "@expo/vector-icons";
import { loadData, saveData, clearData } from "@/utils/storage";

const { width } = Dimensions.get("window");
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
  { key: "sabah", name: "Sabah", icon: "🌅" },
  { key: "ogle", name: "Öğle", icon: "☀️" },
  { key: "ikindi", name: "İkindi", icon: "🌤️" },
  { key: "aksam", name: "Akşam", icon: "🌆" },
  { key: "yatsi", name: "Yatsı", icon: "🌙" },
];

export default function MainScreen({
  startDate,
  debtDate,
  onReset,
}: MainScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Tarihler arası gün farkını hesapla
  const calculateDaysDifference = (date1: Date, date2: Date): number => {
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffTime / oneDay);
  };

  const daysDifference = calculateDaysDifference(startDate, debtDate);

  // Hangi section açık?
  const [openSection, setOpenSection] = useState<
    "current" | "voluntary" | null
  >(null);

  // Günün ayeti
  const [dailyAyah, setDailyAyah] = useState<{
    text: string;
    surah: string;
    numberInSurah: number;
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

  // Storage'dan verileri yükle (ilk açılışta)
  useEffect(() => {
    loadInitialData();
    fetchQuranData();
  }, []);

  const fetchQuranData = async () => {
    try {
      let selectedAyah = null;
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

        console.log(
          `Attempt ${attempts}: Selected Surah Number: ${randomSurahNumber}`
        );

        // O sureyi çek
        const surahResponse = await fetch(
          `http://api.alquran.cloud/v1/surah/${randomSurahNumber}/tr.diyanet`
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
    }
  };

  const saveCurrentData = useCallback(async () => {
    await saveData({
      startDate: startDate.toISOString(),
      debtDate: debtDate.toISOString(),
      currentDebts,
      voluntaryPrayers,
    });
  }, [startDate, debtDate, currentDebts, voluntaryPrayers]);

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

  const currentTotal = Object.values(currentDebts).reduce((a, b) => a + b, 0);
  const voluntaryTotal = Object.values(voluntaryPrayers).reduce(
    (a, b) => a + b,
    0
  );

  // Nafile namazlardan kalan gün sayısını hesapla
  // Her 5 nafile namaz (5 vakit) = 1 gün borç ödenir
  const completedDays = Math.floor(voluntaryTotal / 5);
  const remainingDebtDays = Math.max(0, daysDifference - completedDays);

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

          <TouchableOpacity
            style={[styles.resetButton, isDark && styles.resetButtonDark]}
            onPress={handleResetData}
            activeOpacity={0.7}
          >
            <Ionicons
              name="refresh"
              size={18}
              color="#FFFFFF"
              style={styles.resetIcon}
            />
            <ThemedText style={styles.resetButtonText}>
              Yeni Tarih Gir
            </ThemedText>
          </TouchableOpacity>

          <View style={[styles.section, styles.sectionShadow]}>
            <Collapsible
              title={`📊 Güncel Kazalar • Toplam: ${currentTotal}`}
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
              title={`🌟 Nafile Namazlar • Toplam: ${voluntaryTotal}`}
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
                    Toplam {remainingDebtDays} gün borcunuz var. Allah
                    namazlarınızı kabul etsin. 🤲
                  </ThemedText>
                </View>
              )}
            </Collapsible>
          </View>

          {dailyAyah && (
            <View
              style={[styles.ayahContainer, isDark && styles.ayahContainerDark]}
            >
              <View style={styles.ayahHeader}>
                <ThemedText style={styles.ayahTitle}>📖 Günün Ayeti</ThemedText>
                <ThemedText style={styles.ayahReference}>
                  {dailyAyah.surah} - {dailyAyah.numberInSurah}
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
  resetButton: {
    backgroundColor: "#D4A373",
    paddingVertical: isSmallDevice ? 8 : 10,
    paddingHorizontal: isSmallDevice ? 14 : 18,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: isSmallDevice ? 18 : 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resetButtonDark: {
    backgroundColor: "#B5886D",
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
});

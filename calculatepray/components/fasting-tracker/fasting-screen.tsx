import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { loadData, saveData } from "@/utils/storage";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

export default function FastingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [fastingDebt, setFastingDebt] = useState(0);

  // Storage'dan verileri yükle
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const storedData = await loadData();
    if (storedData && storedData.fastingDebt !== undefined) {
      setFastingDebt(storedData.fastingDebt);
    }
  };

  // İlk kayıtta diğer verileri korumak için flag
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    saveCurrentData();
  }, [fastingDebt]);

  const saveCurrentData = async () => {
    const storedData = await loadData();
    if (storedData) {
      await saveData({
        ...storedData,
        fastingDebt,
      });
    } else {
      // Eğer hiç veri yoksa sadece fasting'i kaydet
      await saveData({
        startDate: new Date().toISOString(),
        debtDate: new Date().toISOString(),
        currentDebts: { sabah: 0, ogle: 0, ikindi: 0, aksam: 0, yatsi: 0 },
        pastDebts: { sabah: 0, ogle: 0, ikindi: 0, aksam: 0, yatsi: 0 },
        fastingDebt,
      });
    }
  };

  const updateCount = (change: number) => {
    setFastingDebt((prev) => Math.max(0, prev + change));
    Haptics.selectionAsync();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            🌙 Oruç Takip
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Kaza oruçlarınızı kolayca yönetin
          </ThemedText>
        </View>

        <ThemedView style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.iconContainer}>
            <ThemedText style={styles.mainIcon}>🌙</ThemedText>
          </View>

          <ThemedText style={[styles.label, isDark && styles.labelDark]}>
            Kaza Orucu Borcu
          </ThemedText>

          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={[styles.counterButton, styles.minusButton]}
              onPress={() => updateCount(-1)}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <View
              style={[styles.countDisplay, isDark && styles.countDisplayDark]}
            >
              <ThemedText
                style={[
                  styles.countText,
                  isDark ? styles.countTextDark : styles.countTextLight,
                ]}
              >
                {fastingDebt}
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.counterButton, styles.plusButton]}
              onPress={() => updateCount(1)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {fastingDebt > 0 && (
            <ThemedText
              style={[styles.infoText, isDark && styles.infoTextDark]}
            >
              🎯 {fastingDebt} gün oruç borcunuz var
            </ThemedText>
          )}

          {fastingDebt === 0 && (
            <ThemedText style={[styles.infoText, styles.successText]}>
              ✅ Hiç oruç borcunuz yok!
            </ThemedText>
          )}
        </ThemedView>

        <View style={styles.tipsContainer}>
          <ThemedText
            style={[styles.tipsTitle, isDark && styles.tipsTitleDark]}
          >
            💡 Bilgi
          </ThemedText>
          <ThemedText style={[styles.tipsText, isDark && styles.tipsTextDark]}>
            • Her tuttuğunuz kaza orucunda (-) butonuna basın{"\n"}• Yeni borç
            oluştuğunda (+) butonuna basın{"\n"}• Verileriniz otomatik olarak
            kaydedilir
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: isSmallDevice ? 16 : 20,
    paddingTop: isSmallDevice ? 40 : 50,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    marginBottom: isSmallDevice ? 30 : 40,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: "800",
    color: "#2D3748",
  },
  subtitle: {
    textAlign: "center",
    fontSize: isSmallDevice ? 14 : 15,
    color: "#718096",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#F7FAFC",
    borderRadius: 24,
    padding: isSmallDevice ? 24 : 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardDark: {
    backgroundColor: "#2D3748",
    borderColor: "#4A5568",
  },
  iconContainer: {
    width: isSmallDevice ? 70 : 80,
    height: isSmallDevice ? 70 : 80,
    borderRadius: isSmallDevice ? 35 : 40,
    backgroundColor: "#E6FFFA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  mainIcon: {
    fontSize: isSmallDevice ? 36 : 42,
  },
  label: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 24,
    textAlign: "center",
  },
  labelDark: {
    color: "#E2E8F0",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: isSmallDevice ? 16 : 20,
    marginBottom: 20,
  },
  counterButton: {
    width: isSmallDevice ? 48 : 54,
    height: isSmallDevice ? 48 : 54,
    borderRadius: isSmallDevice ? 12 : 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  minusButton: {
    backgroundColor: "#D4A373",
  },
  plusButton: {
    backgroundColor: "#8B9A7E",
  },
  countDisplay: {
    minWidth: isSmallDevice ? 70 : 85,
    paddingHorizontal: isSmallDevice ? 18 : 22,
    paddingVertical: isSmallDevice ? 14 : 16,
    backgroundColor: "#B89968",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  countDisplayDark: {
    backgroundColor: "#8B7355",
  },
  countText: {
    fontSize: isSmallDevice ? 28 : 34,
    fontWeight: "800",
  },
  countTextLight: {
    color: "#FFFFFF",
  },
  countTextDark: {
    color: "#FFFFFF",
  },
  infoText: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: "600",
    color: "#4A5568",
    textAlign: "center",
    marginTop: 8,
  },
  infoTextDark: {
    color: "#CBD5E0",
  },
  successText: {
    color: "#48BB78",
  },
  tipsContainer: {
    marginTop: isSmallDevice ? 30 : 40,
    backgroundColor: "#F5EFE6",
    borderRadius: 12,
    padding: isSmallDevice ? 16 : 20,
    borderLeftWidth: 4,
    borderLeftColor: "#B89968",
  },
  tipsTitle: {
    fontSize: isSmallDevice ? 16 : 17,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 12,
  },
  tipsTitleDark: {
    color: "#E2E8F0",
  },
  tipsText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 22 : 24,
    color: "#4A5568",
  },
  tipsTextDark: {
    color: "#CBD5E0",
  },
});

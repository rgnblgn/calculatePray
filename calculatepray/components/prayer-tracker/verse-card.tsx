import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import ViewShot from "react-native-view-shot";
import surahNames from "@/constants/surahs.json";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

interface VerseCardProps {
  text: string;
  surah: string;
  numberInSurah: number;
  surahNumber: number;
  language: string;
}

export default function VerseCard({
  text,
  surah,
  numberInSurah,
  surahNumber,
  language,
}: VerseCardProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const verseCardRef = useRef<View>(null);

  const surahDisplay =
    language === "ar"
      ? surah
      : (surahNames as any)[surahNumber.toString()]?.[language] || surah;

  const generateAndShareImage = async () => {
    try {
      if (Platform.OS === "web") {
        generateWebImage();
      } else {
        generateNativeImage();
      }
    } catch (error) {
      Alert.alert("Hata", "Görüntü oluşturulamadı");
    }
  };

  const generateWebImage = () => {
    try {
      const canvas = document.createElement("canvas");
      // Instagram Story boyutları: 1080x1920
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Arka plan gradyent
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#E6FFFA");
      gradient.addColorStop(1, "#B3E8E0");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dekoratif çizgi üst
      ctx.strokeStyle = "#4FD1C5";
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(100, 120);
      ctx.lineTo(980, 120);
      ctx.stroke();

      // Emoji
      ctx.font = "160px Arial";
      ctx.textAlign = "center";
      ctx.fillText("📖", 540, 320);

      // Başlık
      ctx.font = "bold 80px Arial";
      ctx.fillStyle = "#2D3748";
      ctx.fillText(t("mainScreen.dailyVerse"), 540, 450);

      // Dekoratif ayırıcı
      ctx.strokeStyle = "#8B7355";
      ctx.lineWidth = 3;
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      ctx.moveTo(150, 550);
      ctx.lineTo(930, 550);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ayet metni (kalın ve belirgin font)
      ctx.font = "italic bold 50px 'Georgia', serif";
      ctx.fillStyle = "#1A202C";
      ctx.textAlign = "center";
      const maxWidth = 900;
      const lineHeight = 90;
      let y = 680;

      const words = text.split(" ");
      let line = "";

      words.forEach((word: string) => {
        const testLine = line + word + " ";
        const metrics = ctx!.measureText(testLine);

        if (metrics.width > maxWidth && line) {
          ctx!.fillText(line, 540, y);
          line = word + " ";
          y += lineHeight;
        } else {
          line = testLine;
        }
      });

      if (line) {
        ctx!.fillText(line, 540, y);
      }

      // Dekoratif ayırıcı alt
      ctx.strokeStyle = "#8B7355";
      ctx.lineWidth = 3;
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      ctx.moveTo(150, y + 120);
      ctx.lineTo(930, y + 120);
      ctx.stroke();
      ctx.setLineDash([]);

      // Referans
      ctx.font = "bold 60px Arial";
      ctx.fillStyle = "#8B7355";
      ctx.textAlign = "center";
      ctx.fillText(`${surahDisplay} - ${numberInSurah}`, 540, y + 240);

      // Brand
      ctx.font = "bold 50px Arial";
      ctx.fillStyle = "#4FD1C5";
      ctx.textAlign = "center";
      ctx.fillText(t("common.brandDomain"), 540, y + 330);

      // Dekoratif çizgi alt
      ctx.strokeStyle = "#4FD1C5";
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(100, y + 420);
      ctx.lineTo(980, y + 420);
      ctx.stroke();

      // İndir
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `ayet-${numberInSurah}.png`;
      link.click();

      Alert.alert("Başarılı", "Kart görseli indirildi");
    } catch (error) {
      console.error("Error generating image:", error);
      Alert.alert("Hata", "Görüntü oluşturulamadı");
    }
  };

  const generateNativeImage = async () => {
    try {
      if (verseCardRef.current) {
        const uri = await (verseCardRef.current as any).capture();
        if (uri) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: t("mainScreen.dailyVerse"),
          });
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
      Alert.alert("Hata", "Görüntü oluşturulamadı");
    }
  };

  return (
    <>
      {/* Mobil için ViewShot - kart render edilmiş hali */}
      {Platform.OS !== "web" && (
        <ViewShot
          ref={verseCardRef}
          options={{ format: "png", quality: 0.95 }}
          style={styles.viewShotContainer}
        >
          <View style={styles.nativeCard}>
            <View style={styles.nativeCardContent}>
              <ThemedText style={styles.nativeEmoji}>📖</ThemedText>
              <ThemedText style={styles.nativeTitle}>
                {t("mainScreen.dailyVerse")}
              </ThemedText>

              <ScrollView
                style={styles.nativeVerseContainer}
                showsVerticalScrollIndicator={false}
              >
                <ThemedText style={styles.nativeVerseText}>{text}</ThemedText>
              </ScrollView>

              <ThemedText style={styles.nativeReference}>
                {surahDisplay} - {numberInSurah}
              </ThemedText>
              <ThemedText style={styles.nativeBrand}>
                {t("common.brandName")}
              </ThemedText>
            </View>
          </View>
        </ViewShot>
      )}

      <ThemedView style={[styles.container, isDark && styles.containerDark]}>
        <TouchableOpacity
          style={[styles.shareButton, isDark && styles.shareButtonDark]}
          onPress={generateAndShareImage}
          activeOpacity={0.7}
        >
          <Ionicons name="image" size={20} color="#FFFFFF" />
          <ThemedText style={styles.shareButtonText}>
            {t("common.shareImage") || "Kart Olarak Paylaş"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    paddingVertical: isSmallDevice ? 16 : 20,
    paddingHorizontal: isSmallDevice ? 12 : 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    alignItems: "center",
  },
  containerDark: {
    borderTopColor: "#4A5568",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: isSmallDevice ? 12 : 14,
    paddingHorizontal: isSmallDevice ? 24 : 32,
    borderRadius: 12,
    gap: 8,
    backgroundColor: "#4FD1C5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonDark: {
    backgroundColor: "#38B2AC",
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  // ViewShot Container
  viewShotContainer: {
    position: "absolute",
    top: -9999,
    left: 0,
    width: width,
    opacity: 0,
  },
  // Native Card Stilleri
  nativeCard: {
    width: "100%",
    backgroundColor: "#E6FFFA",
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 50,
  },
  nativeCardContent: {
    alignItems: "center",
    width: "100%",
  },
  nativeEmoji: {
    fontSize: 60,
    lineHeight: 80,
    marginBottom: 12,
  },
  nativeTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 20,
  },
  nativeVerseContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  nativeVerseText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#2D3748",
    textAlign: "center",
    fontStyle: "italic",
  },
  nativeReference: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B7355",
    marginBottom: 10,
  },
  nativeBrand: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4FD1C5",
    letterSpacing: 0.5,
  },
});

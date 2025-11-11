import React, { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import OnboardingScreen from '@/components/prayer-tracker/onboarding-screen';
import MainScreen from '@/components/prayer-tracker/main-screen';
import { loadData, saveData } from '@/utils/storage';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [debtDate, setDebtDate] = useState<Date>(new Date());

  useEffect(() => {
    checkStoredData();
  }, []);

  const checkStoredData = async () => {
    const storedData = await loadData();
    if (storedData) {
      setStartDate(new Date(storedData.startDate));
      setDebtDate(new Date(storedData.debtDate));
      setIsOnboarded(true);
    }
    setIsLoading(false);
  };

  const handleOnboardingComplete = async (selectedStartDate: Date, selectedDebtDate: Date) => {
    setStartDate(selectedStartDate);
    setDebtDate(selectedDebtDate);

    // Tarihler arası gün farkını hesapla
    const oneDay = 24 * 60 * 60 * 1000;
    const diffTime = Math.abs(selectedDebtDate.getTime() - selectedStartDate.getTime());
    const daysDifference = Math.floor(diffTime / oneDay);

    // İlk kayıt: tarihleri ve başlangıç değerlerini kaydet
    await saveData({
      startDate: selectedStartDate.toISOString(),
      debtDate: selectedDebtDate.toISOString(),
      currentDebts: {
        sabah: 0,
        ogle: 0,
        ikindi: 0,
        aksam: 0,
        yatsi: 0,
      },
      pastDebts: {
        sabah: daysDifference,
        ogle: daysDifference,
        ikindi: daysDifference,
        aksam: daysDifference,
        yatsi: daysDifference,
      },
    });

    setIsOnboarded(true);
  };

  const handleReset = () => {
    setIsOnboarded(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FD1C5" />
      </View>
    );
  }

  if (!isOnboarded) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return <MainScreen startDate={startDate} debtDate={debtDate} onReset={handleReset} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
});

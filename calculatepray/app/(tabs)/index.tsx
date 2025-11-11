import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import OnboardingScreen from '@/components/prayer-tracker/onboarding-screen';
import MainScreen from '@/components/prayer-tracker/main-screen';

export default function HomeScreen() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [debtDate, setDebtDate] = useState<Date>(new Date());

  const handleOnboardingComplete = (selectedStartDate: Date, selectedDebtDate: Date) => {
    setStartDate(selectedStartDate);
    setDebtDate(selectedDebtDate);
    setIsOnboarded(true);
  };

  if (!isOnboarded) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return <MainScreen startDate={startDate} debtDate={debtDate} />;
}

const styles = StyleSheet.create({});

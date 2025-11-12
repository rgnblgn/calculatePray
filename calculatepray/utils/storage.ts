import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface PrayerCounts {
    sabah: number;
    ogle: number;
    ikindi: number;
    aksam: number;
    yatsi: number;
}

interface StoredData {
    startDate: string;
    debtDate: string;
    currentDebts: PrayerCounts;
    pastDebts: PrayerCounts;
    fastingDebt?: number;
}

const STORAGE_KEY = '@prayer_tracker_data';

// Web için localStorage wrapper
const webStorage = {
    async getItem(key: string): Promise<string | null> {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key);
        }
        return null;
    },
    async setItem(key: string, value: string): Promise<void> {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
        }
    },
    async removeItem(key: string): Promise<void> {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
        }
    },
};

// Platform'a göre storage seç
const storage = Platform.OS === 'web' ? webStorage : AsyncStorage;

export const saveData = async (data: StoredData): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(data);
        await storage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
        console.error('Error saving data:', e);
    }
};

export const loadData = async (): Promise<StoredData | null> => {
    try {
        const jsonValue = await storage.getItem(STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Error loading data:', e);
        return null;
    }
};

export const clearData = async (): Promise<void> => {
    try {
        await storage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Error clearing data:', e);
    }
};

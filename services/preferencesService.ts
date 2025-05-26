import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, FavoriteLocation } from '@/types';

const PREFERENCES_KEY = 'user_preferences';
const FAVORITES_KEY = 'favorite_locations';

const defaultPreferences: UserPreferences = {
  notifications: {
    pushEnabled: true,
    emailEnabled: true,
    ridingReminders: true,
    promotions: false,
  },
  privacy: {
    shareLocation: true,
    shareRideHistory: false,
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
  },
};

export const getUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
    return defaultPreferences;
  } catch (error) {
    console.error('Error loading preferences:', error);
    return defaultPreferences;
  }
};

export const saveUserPreferences = async (preferences: UserPreferences): Promise<void> => {
  try {
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
};

export const updatePreference = async (
  key: keyof UserPreferences,
  value: Partial<UserPreferences[keyof UserPreferences]>
): Promise<void> => {
  try {
    const current = await getUserPreferences();
    const updated = {
      ...current,
      [key]: { ...current[key], ...value },
    };
    await saveUserPreferences(updated);
  } catch (error) {
    console.error('Error updating preference:', error);
    throw error;
  }
};

export const getFavoriteLocations = async (): Promise<FavoriteLocation[]> => {
  try {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
};

export const addFavoriteLocation = async (location: Omit<FavoriteLocation, 'id'>): Promise<FavoriteLocation> => {
  try {
    const favorites = await getFavoriteLocations();
    const newFavorite: FavoriteLocation = {
      ...location,
      id: Date.now().toString(),
    };
    
    const updated = [...favorites, newFavorite];
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    
    return newFavorite;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

export const removeFavoriteLocation = async (id: string): Promise<void> => {
  try {
    const favorites = await getFavoriteLocations();
    const filtered = favorites.filter(fav => fav.id !== id);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([PREFERENCES_KEY, FAVORITES_KEY]);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

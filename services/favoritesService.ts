import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'home' | 'work' | 'custom';
  icon?: string;
  createdAt: number;
  lastUsed: number;
}

export interface RecentLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  frequency: number;
}

class FavoritesService {
  private static instance: FavoritesService;
  private favorites: FavoriteLocation[] = [];
  private recentLocations: RecentLocation[] = [];

  private constructor() {
    this.loadData();
  }

  public static getInstance(): FavoritesService {
    if (!FavoritesService.instance) {
      FavoritesService.instance = new FavoritesService();
    }
    return FavoritesService.instance;
  }

  private async loadData() {
    try {
      const [favoritesData, recentData] = await Promise.all([
        AsyncStorage.getItem('favoriteLocations'),
        AsyncStorage.getItem('recentLocations'),
      ]);

      if (favoritesData) {
        this.favorites = JSON.parse(favoritesData);
      }

      if (recentData) {
        this.recentLocations = JSON.parse(recentData);
      }
    } catch (error) {
      console.log('Error loading favorites data:', error);
    }
  }

  private async saveFavorites() {
    try {
      await AsyncStorage.setItem('favoriteLocations', JSON.stringify(this.favorites));
    } catch (error) {
      console.log('Error saving favorites:', error);
    }
  }

  private async saveRecentLocations() {
    try {
      await AsyncStorage.setItem('recentLocations', JSON.stringify(this.recentLocations));
    } catch (error) {
      console.log('Error saving recent locations:', error);
    }
  }

  // Favorite Locations Methods
  public async addFavorite(location: Omit<FavoriteLocation, 'id' | 'createdAt' | 'lastUsed'>): Promise<string> {
    const id = `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newFavorite: FavoriteLocation = {
      ...location,
      id,
      createdAt: Date.now(),
      lastUsed: Date.now(),
    };

    this.favorites.push(newFavorite);
    await this.saveFavorites();
    return id;
  }

  public async removeFavorite(id: string): Promise<void> {
    this.favorites = this.favorites.filter(fav => fav.id !== id);
    await this.saveFavorites();
  }

  public async updateFavorite(id: string, updates: Partial<FavoriteLocation>): Promise<void> {
    const index = this.favorites.findIndex(fav => fav.id === id);
    if (index !== -1) {
      this.favorites[index] = { ...this.favorites[index], ...updates };
      await this.saveFavorites();
    }
  }

  public async markFavoriteAsUsed(id: string): Promise<void> {
    const favorite = this.favorites.find(fav => fav.id === id);
    if (favorite) {
      favorite.lastUsed = Date.now();
      await this.saveFavorites();
    }
  }

  public getFavorites(): FavoriteLocation[] {
    return this.favorites.sort((a, b) => b.lastUsed - a.lastUsed);
  }

  public getFavoritesByType(type: FavoriteLocation['type']): FavoriteLocation[] {
    return this.favorites.filter(fav => fav.type === type);
  }

  public isFavorite(latitude: number, longitude: number, tolerance = 0.001): boolean {
    return this.favorites.some(fav => 
      Math.abs(fav.latitude - latitude) < tolerance &&
      Math.abs(fav.longitude - longitude) < tolerance
    );
  }

  public findNearbyFavorites(latitude: number, longitude: number, radiusKm = 1): FavoriteLocation[] {
    return this.favorites.filter(fav => {
      const distance = this.calculateDistance(latitude, longitude, fav.latitude, fav.longitude);
      return distance <= radiusKm;
    });
  }

  // Recent Locations Methods
  public async addRecentLocation(location: Omit<RecentLocation, 'id' | 'timestamp' | 'frequency'>): Promise<void> {
    const existingIndex = this.recentLocations.findIndex(recent => 
      Math.abs(recent.latitude - location.latitude) < 0.001 &&
      Math.abs(recent.longitude - location.longitude) < 0.001
    );

    if (existingIndex !== -1) {
      // Update existing location
      this.recentLocations[existingIndex].frequency += 1;
      this.recentLocations[existingIndex].timestamp = Date.now();
      this.recentLocations[existingIndex].name = location.name;
      this.recentLocations[existingIndex].address = location.address;
    } else {
      // Add new location
      const id = `recent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newRecent: RecentLocation = {
        ...location,
        id,
        timestamp: Date.now(),
        frequency: 1,
      };
      this.recentLocations.push(newRecent);
    }

    // Keep only the 20 most recent locations
    this.recentLocations = this.recentLocations
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);

    await this.saveRecentLocations();
  }

  public getRecentLocations(): RecentLocation[] {
    return this.recentLocations.sort((a, b) => b.timestamp - a.timestamp);
  }

  public getFrequentLocations(): RecentLocation[] {
    return this.recentLocations
      .filter(location => location.frequency >= 3)
      .sort((a, b) => b.frequency - a.frequency);
  }

  public async clearRecentLocations(): Promise<void> {
    this.recentLocations = [];
    await this.saveRecentLocations();
  }

  // Search and Suggestions
  public searchLocations(query: string): (FavoriteLocation | RecentLocation)[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];

    const favoriteMatches = this.favorites.filter(fav =>
      fav.name.toLowerCase().includes(normalizedQuery) ||
      fav.address.toLowerCase().includes(normalizedQuery)
    );

    const recentMatches = this.recentLocations.filter(recent =>
      recent.name.toLowerCase().includes(normalizedQuery) ||
      recent.address.toLowerCase().includes(normalizedQuery)
    );

    return [...favoriteMatches, ...recentMatches];
  }

  public getSuggestedLocations(): FavoriteLocation[] {
    const now = new Date();
    const currentHour = now.getHours();
    const dayOfWeek = now.getDay();

    // Morning commute (6-10 AM on weekdays) - suggest work
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && currentHour >= 6 && currentHour < 10) {
      const workLocations = this.getFavoritesByType('work');
      if (workLocations.length > 0) return workLocations;
    }

    // Evening commute (4-8 PM on weekdays) - suggest home
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && currentHour >= 16 && currentHour < 20) {
      const homeLocations = this.getFavoritesByType('home');
      if (homeLocations.length > 0) return homeLocations;
    }

    // Return most frequently used favorites
    return this.favorites
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, 3);
  }

  // Utility Methods
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Import/Export for backup
  public async exportData(): Promise<string> {
    const data = {
      favorites: this.favorites,
      recentLocations: this.recentLocations,
      exportDate: Date.now(),
    };
    return JSON.stringify(data, null, 2);
  }

  public async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      if (data.favorites && Array.isArray(data.favorites)) {
        this.favorites = data.favorites;
        await this.saveFavorites();
      }
      if (data.recentLocations && Array.isArray(data.recentLocations)) {
        this.recentLocations = data.recentLocations;
        await this.saveRecentLocations();
      }
    } catch (error) {
      throw new Error('Invalid backup data format');
    }
  }

  // Statistics
  public getStatistics() {
    const totalFavorites = this.favorites.length;
    const favoritesByType = {
      home: this.getFavoritesByType('home').length,
      work: this.getFavoritesByType('work').length,
      custom: this.getFavoritesByType('custom').length,
    };
    const totalRecentLocations = this.recentLocations.length;
    const mostFrequentLocation = this.recentLocations
      .sort((a, b) => b.frequency - a.frequency)[0];

    return {
      totalFavorites,
      favoritesByType,
      totalRecentLocations,
      mostFrequentLocation,
    };
  }
}

// Export singleton instance
export const favoritesService = FavoritesService.getInstance();

// Convenience functions
export const addFavorite = (location: Omit<FavoriteLocation, 'id' | 'createdAt' | 'lastUsed'>) =>
  favoritesService.addFavorite(location);

export const removeFavorite = (id: string) => favoritesService.removeFavorite(id);
export const getFavorites = () => favoritesService.getFavorites();
export const isFavorite = (lat: number, lng: number) => favoritesService.isFavorite(lat, lng);
export const addRecentLocation = (location: Omit<RecentLocation, 'id' | 'timestamp' | 'frequency'>) =>
  favoritesService.addRecentLocation(location);
export const getRecentLocations = () => favoritesService.getRecentLocations();
export const searchLocations = (query: string) => favoritesService.searchLocations(query);
export const getSuggestedLocations = () => favoritesService.getSuggestedLocations();

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Scooter = {
  id: string;
  latitude: number;
  longitude: number;
  batteryLevel: number;
  pricePerMinute: number;
  address: string;
  isAvailable: boolean;
  model?: string;
  maxSpeed?: number;
  range?: number;
  imageUrl?: string;
};

export type RideHistoryItem = {
  id: string;
  date: string;
  title: string;
  cost: number;
  duration: number; // in minutes
  distance: number; // in kilometers
  co2Saved: number; // in kilograms
  startLocation: string;
  endLocation: string;
  status: 'completed' | 'cancelled' | 'in-progress';
  rating?: number;
  scooterId?: string;
};

export type RideEndData = {
  duration: number;
  distance: number;
  cost: number;
  route: Coordinates[];
  endLocation?: Coordinates;
};

export type WeatherData = {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
};

export type PaymentMethod = {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  isDefault: boolean;
};

export type UserPreferences = {
  notifications: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    ridingReminders: boolean;
    promotions: boolean;
  };
  privacy: {
    shareLocation: boolean;
    shareRideHistory: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
};

export type FavoriteLocation = {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  icon?: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
};
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
};

export type RideEndData = {
  duration: number;
  distance: number;
  cost: number;
  route: Coordinates[];
  endLocation?: Coordinates;
};
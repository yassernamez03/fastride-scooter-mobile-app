import { Scooter, RideEndData } from '@/types';

// Mock data for scooters
const mockScooters: Scooter[] = [
  {
    id: '1',
    latitude: 37.78825,
    longitude: -122.4324,
    batteryLevel: 87,
    pricePerMinute: 0.15,
    address: '123 Market St, San Francisco, CA',
  },
  {
    id: '2',
    latitude: 37.78925,
    longitude: -122.4344,
    batteryLevel: 65,
    pricePerMinute: 0.15,
    address: '456 Mission St, San Francisco, CA',
  },
  {
    id: '3',
    latitude: 37.78725,
    longitude: -122.4304,
    batteryLevel: 42,
    pricePerMinute: 0.15,
    address: '789 Howard St, San Francisco, CA',
  },
  {
    id: '4',
    latitude: 37.78625,
    longitude: -122.4354,
    batteryLevel: 23,
    pricePerMinute: 0.15,
    address: '101 Main St, San Francisco, CA',
  },
  {
    id: '5',
    latitude: 37.78525,
    longitude: -122.4294,
    batteryLevel: 92,
    pricePerMinute: 0.15,
    address: '222 Folsom St, San Francisco, CA',
  },
];

// Get scooters near a location
export const getScooters = async (latitude: number, longitude: number): Promise<Scooter[]> => {
  // In a real app, this would make an API call to fetch nearby scooters
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Add some randomness to scooter positions around the user's location
  return mockScooters.map(scooter => ({
    ...scooter,
    latitude: latitude + (Math.random() - 0.5) * 0.01,
    longitude: longitude + (Math.random() - 0.5) * 0.01,
  }));
};

// Get a scooter by ID
export const getScooterById = async (id: string): Promise<Scooter | null> => {
  // In a real app, this would make an API call to fetch a specific scooter
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const scooter = mockScooters.find(s => s.id === id);
  return scooter || null;
};

// Unlock a scooter
export const unlockScooter = async (qrCode: string): Promise<{ success: boolean; scooterId: string }> => {
  // In a real app, this would make an API call to unlock the scooter
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo purposes, always succeed and return a random scooter ID
  const randomId = Math.floor(Math.random() * mockScooters.length) + 1;
  return {
    success: true,
    scooterId: randomId.toString(),
  };
};

// End a ride
export const endRide = async (scooterId: string, data: RideEndData): Promise<{ success: boolean }> => {
  // In a real app, this would make an API call to end the ride
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, always succeed
  return {
    success: true,
  };
};
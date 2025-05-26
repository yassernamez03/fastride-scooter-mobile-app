import { RideHistoryItem } from '@/types';

// Mock data for ride history
const mockRideHistory: RideHistoryItem[] = [
  {
    id: '1',
    date: 'Today, 3:45 PM',
    title: 'Market Street Ride',
    cost: 5.25,
    duration: 15,
    distance: 2.3,
    co2Saved: 0.28,
    startLocation: '123 Market St, San Francisco, CA',
    endLocation: '456 Mission St, San Francisco, CA',
  },
  {
    id: '2',
    date: 'Yesterday, 9:30 AM',
    title: 'Morning Commute',
    cost: 4.50,
    duration: 12,
    distance: 1.8,
    co2Saved: 0.22,
    startLocation: '789 Howard St, San Francisco, CA',
    endLocation: '101 Main St, San Francisco, CA',
  },
  {
    id: '3',
    date: 'July 15, 2023',
    title: 'Lunch Break',
    cost: 3.75,
    duration: 10,
    distance: 1.5,
    co2Saved: 0.18,
    startLocation: '222 Folsom St, San Francisco, CA',
    endLocation: '333 Beale St, San Francisco, CA',
  },
];

// Get ride history
export const getRideHistory = (): RideHistoryItem[] => {
  // In a real app, this would make an API call to fetch ride history
  return mockRideHistory;
};

// Get a ride by ID
export const getRideById = (id: string): RideHistoryItem | undefined => {
  // In a real app, this would make an API call to fetch a specific ride
  return mockRideHistory.find(ride => ride.id === id);
};

// Add a new ride to history
export const addRideToHistory = (ride: Omit<RideHistoryItem, 'id'>): RideHistoryItem => {
  // In a real app, this would make an API call to add a ride to history
  
  const newRide: RideHistoryItem = {
    id: Date.now().toString(),
    ...ride,
  };
  
  // For demo purposes, just return the new ride
  return newRide;
};
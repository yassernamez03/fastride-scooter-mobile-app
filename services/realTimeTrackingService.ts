import { EventEmitter } from 'events';
import * as Location from 'expo-location';
import { Scooter } from '@/types';

export interface ScooterUpdate {
  id: string;
  latitude: number;
  longitude: number;
  batteryLevel: number;
  speed: number;
  heading: number;
  timestamp: number;
  status: 'available' | 'in_use' | 'maintenance' | 'low_battery';
}

export interface RideTracking {
  rideId: string;
  scooterId: string;
  startTime: number;
  currentLocation: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
  };
  route: Array<{
    latitude: number;
    longitude: number;
    timestamp: number;
  }>;
  distance: number;
  duration: number;
  averageSpeed: number;
  maxSpeed: number;
  batteryUsed: number;
  cost: number;
}

class RealTimeTrackingService extends EventEmitter {
  private static instance: RealTimeTrackingService;
  private scooterUpdates: Map<string, ScooterUpdate> = new Map();
  private activeRide: RideTracking | null = null;
  private locationSubscription: Location.LocationSubscription | null = null;
  private trackingInterval: NodeJS.Timeout | null = null;
  private mockDataInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.startMockDataGeneration();
  }

  public static getInstance(): RealTimeTrackingService {
    if (!RealTimeTrackingService.instance) {
      RealTimeTrackingService.instance = new RealTimeTrackingService();
    }
    return RealTimeTrackingService.instance;
  }

  // Mock data generation for demonstration
  private startMockDataGeneration() {
    this.mockDataInterval = setInterval(() => {
      this.generateMockScooterUpdates();
    }, 5000); // Update every 5 seconds
  }

  private generateMockScooterUpdates() {
    // Generate mock updates for existing scooters
    const mockScooterIds = ['scooter_001', 'scooter_002', 'scooter_003', 'scooter_004', 'scooter_005'];
    
    mockScooterIds.forEach(id => {
      const existing = this.scooterUpdates.get(id);
      const baseLocation = existing || {
        latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
      };

      const update: ScooterUpdate = {
        id,
        latitude: baseLocation.latitude + (Math.random() - 0.5) * 0.001,
        longitude: baseLocation.longitude + (Math.random() - 0.5) * 0.001,
        batteryLevel: Math.max(20, Math.min(100, (existing?.batteryLevel || 85) + (Math.random() - 0.5) * 5)),
        speed: Math.random() * 25, // 0-25 km/h
        heading: Math.random() * 360,
        timestamp: Date.now(),
        status: this.getRandomStatus(),
      };

      this.scooterUpdates.set(id, update);
      this.emit('scooterUpdate', update);
    });
  }

  private getRandomStatus(): ScooterUpdate['status'] {
    const statuses: ScooterUpdate['status'][] = ['available', 'in_use', 'maintenance', 'low_battery'];
    const weights = [0.6, 0.25, 0.1, 0.05]; // Probabilities
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < statuses.length; i++) {
      sum += weights[i];
      if (random <= sum) {
        return statuses[i];
      }
    }
    
    return 'available';
  }

  // Real-time scooter tracking
  public subscribeToScooterUpdates(callback: (update: ScooterUpdate) => void) {
    this.on('scooterUpdate', callback);
    
    // Return unsubscribe function
    return () => {
      this.off('scooterUpdate', callback);
    };
  }

  public getScooterUpdate(scooterId: string): ScooterUpdate | null {
    return this.scooterUpdates.get(scooterId) || null;
  }

  public getAllScooterUpdates(): ScooterUpdate[] {
    return Array.from(this.scooterUpdates.values());
  }

  // Ride tracking
  public async startRideTracking(rideId: string, scooterId: string): Promise<void> {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      this.activeRide = {
        rideId,
        scooterId,
        startTime: Date.now(),
        currentLocation: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || undefined,
          speed: location.coords.speed || undefined,
          heading: location.coords.heading || undefined,
        },
        route: [{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: Date.now(),
        }],
        distance: 0,
        duration: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        batteryUsed: 0,
        cost: 0,
      };

      // Start location tracking
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000, // Update every 2 seconds
          distanceInterval: 5, // Update every 5 meters
        },
        (location) => {
          this.updateRideLocation(location);
        }
      );

      // Start ride statistics tracking
      this.trackingInterval = setInterval(() => {
        this.updateRideStatistics();
      }, 1000); // Update every second

      this.emit('rideStarted', this.activeRide);
    } catch (error) {
      console.error('Failed to start ride tracking:', error);
      throw error;
    }
  }

  private updateRideLocation(location: Location.LocationObject) {
    if (!this.activeRide) return;

    const newLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || undefined,
      speed: location.coords.speed || undefined,
      heading: location.coords.heading || undefined,
    };

    // Calculate distance from last point
    const lastPoint = this.activeRide.route[this.activeRide.route.length - 1];
    const distance = this.calculateDistance(
      lastPoint.latitude,
      lastPoint.longitude,
      newLocation.latitude,
      newLocation.longitude
    );

    // Update ride data
    this.activeRide.currentLocation = newLocation;
    this.activeRide.route.push({
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      timestamp: Date.now(),
    });
    this.activeRide.distance += distance;

    // Update max speed
    if (newLocation.speed && newLocation.speed > this.activeRide.maxSpeed) {
      this.activeRide.maxSpeed = newLocation.speed;
    }

    this.emit('rideLocationUpdate', this.activeRide);
  }

  private updateRideStatistics() {
    if (!this.activeRide) return;

    const now = Date.now();
    this.activeRide.duration = now - this.activeRide.startTime;

    // Calculate average speed (km/h)
    if (this.activeRide.duration > 0) {
      const hours = this.activeRide.duration / (1000 * 60 * 60);
      this.activeRide.averageSpeed = this.activeRide.distance / hours;
    }

    // Calculate cost (mock pricing: $0.50 base + $0.25/minute)
    const minutes = this.activeRide.duration / (1000 * 60);
    this.activeRide.cost = 0.50 + (minutes * 0.25);

    // Mock battery usage
    this.activeRide.batteryUsed = Math.min(20, (this.activeRide.distance / 1000) * 5); // 5% per km

    this.emit('rideStatsUpdate', this.activeRide);
  }

  public async stopRideTracking(): Promise<RideTracking | null> {
    if (!this.activeRide) return null;

    const finalRide = { ...this.activeRide };

    // Stop location tracking
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    // Stop statistics tracking
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    this.activeRide = null;
    this.emit('rideStopped', finalRide);

    return finalRide;
  }

  public pauseRideTracking(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    this.emit('ridePaused', this.activeRide);
  }

  public async resumeRideTracking(): Promise<void> {
    if (!this.activeRide) return;

    // Resume location tracking
    this.locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      (location) => {
        this.updateRideLocation(location);
      }
    );

    // Resume statistics tracking
    this.trackingInterval = setInterval(() => {
      this.updateRideStatistics();
    }, 1000);

    this.emit('rideResumed', this.activeRide);
  }

  public getActiveRide(): RideTracking | null {
    return this.activeRide;
  }

  // Utility methods
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
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

  // Zone-based features
  public checkGeofences(latitude: number, longitude: number): {
    inSlowZone: boolean;
    inNoRideZone: boolean;
    inParkingZone: boolean;
  } {
    // Mock geofence data - in real app, this would query a geofencing service
    const slowZones = [
      { lat: 37.7749, lng: -122.4194, radius: 500 }, // Downtown SF
    ];

    const noRideZones = [
      { lat: 37.7849, lng: -122.4094, radius: 200 }, // Hospital area
    ];

    const parkingZones = [
      { lat: 37.7649, lng: -122.4294, radius: 100 }, // Designated parking
    ];

    const isInZone = (zones: any[], lat: number, lng: number) => {
      return zones.some(zone => {
        const distance = this.calculateDistance(lat, lng, zone.lat, zone.lng);
        return distance <= zone.radius;
      });
    };

    return {
      inSlowZone: isInZone(slowZones, latitude, longitude),
      inNoRideZone: isInZone(noRideZones, latitude, longitude),
      inParkingZone: isInZone(parkingZones, latitude, longitude),
    };
  }

  // Predictive maintenance
  public predictMaintenanceNeeds(scooterId: string): {
    batteryHealth: number;
    brakeWear: number;
    tireCondition: number;
    overallScore: number;
    maintenanceRecommended: boolean;
  } {
    const scooter = this.scooterUpdates.get(scooterId);
    if (!scooter) {
      return {
        batteryHealth: 100,
        brakeWear: 0,
        tireCondition: 100,
        overallScore: 100,
        maintenanceRecommended: false,
      };
    }

    // Mock predictive analysis based on usage patterns
    const batteryHealth = Math.max(70, scooter.batteryLevel + Math.random() * 10);
    const brakeWear = Math.random() * 30;
    const tireCondition = Math.max(60, 100 - Math.random() * 40);
    const overallScore = (batteryHealth + (100 - brakeWear) + tireCondition) / 3;

    return {
      batteryHealth,
      brakeWear,
      tireCondition,
      overallScore,
      maintenanceRecommended: overallScore < 80,
    };
  }

  public destroy(): void {
    // Clean up intervals
    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
      this.mockDataInterval = null;
    }

    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    // Clean up location subscription
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    // Remove all listeners
    this.removeAllListeners();
  }
}

// Export singleton instance
export const realTimeTrackingService = RealTimeTrackingService.getInstance();

// Convenience functions
export const subscribeToScooterUpdates = (callback: (update: ScooterUpdate) => void) =>
  realTimeTrackingService.subscribeToScooterUpdates(callback);

export const startRideTracking = (rideId: string, scooterId: string) =>
  realTimeTrackingService.startRideTracking(rideId, scooterId);

export const stopRideTracking = () => realTimeTrackingService.stopRideTracking();
export const getActiveRide = () => realTimeTrackingService.getActiveRide();
export const getAllScooterUpdates = () => realTimeTrackingService.getAllScooterUpdates();

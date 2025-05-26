import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Dynamic imports to handle Expo Go compatibility
let Notifications: any = null;
let Device: any = null;

// Check if we're in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Only import expo-notifications if not in Expo Go
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');
    
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    console.warn('expo-notifications not available:', error);
  }
}

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: number;
  read: boolean;
  type: 'ride' | 'promotion' | 'maintenance' | 'general';
}

export interface NotificationSettings {
  rideUpdates: boolean;
  promotions: boolean;
  maintenance: boolean;
  general: boolean;
  pushEnabled: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private notifications: NotificationData[] = [];

  private constructor() {
    this.initializeNotifications();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }  private async initializeNotifications() {
    if (!isExpoGo && Notifications) {
      await this.registerForPushNotificationsAsync();
      this.setupNotificationListeners();
    } else {
      console.log('Running in Expo Go - notifications disabled');
      // Set up mock token for development
      this.expoPushToken = 'mock-token-for-expo-go';
    }
    await this.loadStoredNotifications();
    
    // Add demo notifications in Expo Go for development testing
    if (isExpoGo && this.notifications.length === 0) {
      await this.addDemoNotifications();
    }
  }

  private async registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Notifications || !Device) {
      console.log('Notifications not available');
      return null;
    }

    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      try {
        // Use a default project ID for development
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || 'development-mode';
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        })).data;
        this.expoPushToken = token;
        console.log('Push token:', token);
      } catch (error) {
        console.log('Error getting push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }  private setupNotificationListeners() {
    if (!Notifications) {
      console.log('Notification listeners not available in Expo Go');
      return;
    }

    // Listen for notifications when app is in foreground
    Notifications.addNotificationReceivedListener((notification: any) => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listen for notification interactions
    Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }
  private handleNotificationReceived(notification: any) {
    const notificationData: NotificationData = {
      id: notification.request.identifier,
      title: notification.request.content.title || '',
      body: notification.request.content.body || '',
      data: notification.request.content.data,
      timestamp: Date.now(),
      read: false,
      type: notification.request.content.data?.type || 'general',
    };

    this.notifications.unshift(notificationData);
    this.saveNotifications();
  }

  private handleNotificationResponse(response: any) {
    const notificationId = response.notification.request.identifier;
    this.markAsRead(notificationId);
    
    // Handle navigation based on notification type
    const data = response.notification.request.content.data;
    if (data?.action) {
      // Navigate to specific screen based on action
      console.log('Navigate to:', data.action);
    }
  }

  private async loadStoredNotifications() {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.log('Error loading notifications:', error);
    }
  }

  private async saveNotifications() {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.log('Error saving notifications:', error);
    }
  }
  // Public methods
  public async sendLocalNotification(
    title: string,
    body: string,
    data?: any,
    scheduleOptions?: any
  ) {
    if (!Notifications) {
      // Mock notification for Expo Go
      console.log('Mock notification:', { title, body, data });
      
      // Add to local notifications array for testing
      const notificationData: NotificationData = {
        id: Date.now().toString(),
        title,
        body,
        data,
        timestamp: Date.now(),
        read: false,
        type: data?.type || 'general',
      };
      
      this.notifications.unshift(notificationData);
      this.saveNotifications();
      
      return notificationData.id;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: scheduleOptions || null,
    });

    return notificationId;
  }

  public async sendRideNotification(
    type: 'started' | 'paused' | 'resumed' | 'ended' | 'lowBattery',
    rideData: any
  ) {
    const settings = await this.getNotificationSettings();
    if (!settings.rideUpdates || !settings.pushEnabled) return;

    let title = '';
    let body = '';

    switch (type) {
      case 'started':
        title = 'Ride Started';
        body = `Your ride on scooter #${rideData.scooterId} has begun. Enjoy!`;
        break;
      case 'paused':
        title = 'Ride Paused';
        body = 'Your ride is paused. Tap to resume when ready.';
        break;
      case 'resumed':
        title = 'Ride Resumed';
        body = 'Your ride has been resumed. Safe travels!';
        break;
      case 'ended':
        title = 'Ride Completed';
        body = `Total cost: $${rideData.totalCost}. Duration: ${rideData.duration}`;
        break;
      case 'lowBattery':
        title = 'Low Battery Warning';
        body = 'Your scooter battery is below 20%. Consider ending your ride soon.';
        break;
    }

    return this.sendLocalNotification(title, body, {
      type: 'ride',
      rideId: rideData.id,
      action: 'ride',
    });
  }

  public async sendPromotionalNotification(title: string, body: string, promoData?: any) {
    const settings = await this.getNotificationSettings();
    if (!settings.promotions || !settings.pushEnabled) return;

    return this.sendLocalNotification(title, body, {
      type: 'promotion',
      promoData,
      action: 'promotions',
    });
  }

  public async sendMaintenanceNotification(title: string, body: string) {
    const settings = await this.getNotificationSettings();
    if (!settings.maintenance || !settings.pushEnabled) return;

    return this.sendLocalNotification(title, body, {
      type: 'maintenance',
      action: 'maintenance',
    });
  }

  public getNotifications(): NotificationData[] {
    return this.notifications.sort((a, b) => b.timestamp - a.timestamp);
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  public markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  public deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  public clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
  }

  public async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        return JSON.parse(settings);
      }
    } catch (error) {
      console.log('Error loading notification settings:', error);
    }

    // Default settings
    return {
      rideUpdates: true,
      promotions: true,
      maintenance: true,
      general: true,
      pushEnabled: true,
    };
  }

  public async updateNotificationSettings(settings: Partial<NotificationSettings>) {
    try {
      const currentSettings = await this.getNotificationSettings();
      const newSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      
      // If push notifications are disabled, cancel all scheduled notifications
      if (!newSettings.pushEnabled) {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (error) {
      console.log('Error saving notification settings:', error);
    }
  }

  public getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Schedule periodic notifications for testing
  public async scheduleTestNotifications() {
    // Ride reminder after 1 minute
    await this.sendLocalNotification(
      'Ready to ride?',
      'Find a FastRide scooter near you and start your journey!',
      { type: 'general', action: 'map' },
      { seconds: 60 }
    );

    // Promotional notification after 5 minutes
    await this.sendLocalNotification(
      '🎉 Special Offer!',
      'Get 20% off your next ride with code FAST20. Valid until midnight!',
      { type: 'promotion', code: 'FAST20', action: 'promotions' },
      { seconds: 300 }
    );
  }

  public async addDemoNotifications() {
    // Only add demo notifications in Expo Go for development
    if (!isExpoGo) return;
    
    const demoNotifications: NotificationData[] = [
      {
        id: 'demo-1',
        title: 'Welcome to FastRide!',
        body: 'Your account has been set up successfully. Find a scooter near you to get started.',
        data: { type: 'general', action: 'home' },
        timestamp: Date.now() - 3600000, // 1 hour ago
        read: false,
        type: 'general',
      },
      {
        id: 'demo-2',
        title: 'Ride Started',
        body: 'Your ride on scooter #SC-2024 has begun. Enjoy your trip!',
        data: { type: 'ride', scooterId: 'SC-2024' },
        timestamp: Date.now() - 1800000, // 30 minutes ago
        read: true,
        type: 'ride',
      },
      {
        id: 'demo-3',
        title: 'Special Offer!',
        body: '🎉 Get 20% off your next 3 rides. Use code SAVE20. Valid until midnight!',
        data: { type: 'promotion', code: 'SAVE20' },
        timestamp: Date.now() - 900000, // 15 minutes ago
        read: false,
        type: 'promotion',
      },
      {
        id: 'demo-4',
        title: 'Maintenance Alert',
        body: 'Scooter #SC-1847 will be temporarily unavailable for maintenance from 2-4 PM today.',
        data: { type: 'maintenance', scooterId: 'SC-1847' },
        timestamp: Date.now() - 300000, // 5 minutes ago
        read: false,
        type: 'maintenance',
      },
      {
        id: 'demo-5',
        title: 'Low Battery Warning',
        body: 'Your current scooter has 15% battery remaining. Consider ending your ride soon.',
        data: { type: 'ride', warning: 'low_battery' },
        timestamp: Date.now() - 60000, // 1 minute ago
        read: false,
        type: 'ride',
      }
    ];

    // Add demo notifications to the beginning of the array
    this.notifications = [...demoNotifications, ...this.notifications];
    await this.saveNotifications();
    
    console.log('Demo notifications added for development');
  }

  public async testNotification() {
    // Send a test notification for development
    return await this.sendLocalNotification(
      'Test Notification',
      'This is a test notification to verify the system is working correctly.',
      { type: 'general', test: true }
    );
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Convenience functions
export const sendRideNotification = (type: 'started' | 'paused' | 'resumed' | 'ended' | 'lowBattery', rideData: any) =>
  notificationService.sendRideNotification(type, rideData);

export const getNotifications = () => notificationService.getNotifications();
export const getUnreadCount = () => notificationService.getUnreadCount();
export const markAsRead = (id: string) => notificationService.markAsRead(id);
export const markAllAsRead = () => notificationService.markAllAsRead();
export const deleteNotification = (id: string) => notificationService.deleteNotification(id);
export const getNotificationSettings = () => notificationService.getNotificationSettings();
export const updateNotificationSettings = (settings: Partial<NotificationSettings>) =>
  notificationService.updateNotificationSettings(settings);

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/context/ToastContext';
import * as Haptics from 'expo-haptics';
import { 
  Play, 
  Pause, 
  Square, 
  Navigation, 
  Clock, 
  DollarSign, 
  Battery,
  Zap,
  MapPin,
  Phone
} from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat,
  interpolate
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function RideScreen() {
  const { scooterId } = useLocalSearchParams<{ scooterId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { success, error, warning } = useToast();
  
  // Ride state
  const [isRiding, setIsRiding] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rideTime, setRideTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [cost, setCost] = useState(1.0); // $1 unlock fee
  const [speed, setSpeed] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(87);
  
  // Refs for intervals
  const rideInterval = useRef<number | null>(null);
  const locationInterval = useRef<number | null>(null);
  
  // Animation values
  const pulseValue = useSharedValue(1);
  const speedAnimation = useSharedValue(0);

  useEffect(() => {
    // Start pulse animation for riding indicator
    if (isRiding && !isPaused) {
      pulseValue.value = withRepeat(
        withTiming(1.2, { duration: 1000 }),
        -1,
        true
      );
    } else {
      pulseValue.value = withTiming(1, { duration: 300 });
    }
  }, [isRiding, isPaused]);

  useEffect(() => {
    // Animate speed changes
    speedAnimation.value = withTiming(speed / 25, { duration: 500 });
  }, [speed]);

  // Start ride timer and tracking
  const startRideTracking = () => {
    if (!rideInterval.current) {
      rideInterval.current = setInterval(() => {
        setRideTime(prev => prev + 1);
        setCost(prev => prev + (0.15 / 60)); // $0.15 per minute
      }, 1000);
    }

    if (!locationInterval.current) {
      locationInterval.current = setInterval(() => {
        // Simulate movement and speed changes
        const newSpeed = Math.random() * 25; // 0-25 km/h
        const newDistance = Math.random() * 0.01; // Small increment
        
        setSpeed(Math.round(newSpeed));
        setDistance(prev => prev + newDistance);
        setBatteryLevel(prev => Math.max(10, prev - 0.1)); // Slow battery drain
      }, 2000);
    }
  };

  // Stop ride tracking
  const stopRideTracking = () => {
    if (rideInterval.current) {
      clearInterval(rideInterval.current);
      rideInterval.current = null;
    }
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }
  };

  // Start ride
  const handleStartRide = () => {
    setIsRiding(true);
    setIsPaused(false);
    startRideTracking();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    success('Ride started! Enjoy your journey 🛴');
  };

  // Pause ride
  const handlePauseRide = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      stopRideTracking();
      warning('Ride paused');
    } else {
      startRideTracking();
      success('Ride resumed');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // End ride
  const handleEndRide = () => {
    Alert.alert(
      'End Ride',
      'Are you sure you want to end your ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Ride',
          style: 'destructive',
          onPress: () => {
            stopRideTracking();
            setIsRiding(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            success(`Ride completed! Total cost: $${cost.toFixed(2)}`);
            
            // Navigate back after a short delay
            setTimeout(() => {
              router.replace('/(tabs)');
            }, 2000);
          }
        }
      ]
    );
  };

  // Emergency contact
  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Contact',
      'Do you need emergency assistance?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Emergency', style: 'destructive', onPress: () => {
          // In a real app, this would make an emergency call
          success('Emergency services contacted');
        }}
      ]
    );
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Animation styles
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const speedBarStyle = useAnimatedStyle(() => ({
    width: `${interpolate(speedAnimation.value, [0, 1], [0, 100])}%`,
  }));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRideTracking();
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            try {
              if (router && router.canGoBack()) {
                if (router && router.back) router.back();
              } else if (router) {
                router.replace('/(tabs)');
              }
            } catch (error) {
              console.log('Navigation error:', error);
              if (router) {
                router.replace('/(tabs)');
              }
            }
          }}
        >
          <Text style={[styles.backText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Scooter #{scooterId}
        </Text>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={handleEmergencyCall}
        >
          <Phone size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Ride Status Card */}
      <View style={[styles.statusCard, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIndicator}>
            <Animated.View 
              style={[
                styles.statusDot, 
                pulseStyle,
                { 
                  backgroundColor: isRiding && !isPaused 
                    ? colors.success 
                    : isPaused 
                      ? colors.warning 
                      : colors.disabled 
                }
              ]} 
            />
            <Text style={[styles.statusText, { color: colors.text }]}>
              {isRiding ? (isPaused ? 'Paused' : 'Riding') : 'Ready'}
            </Text>
          </View>
          
          <View style={styles.batteryIndicator}>
            <Battery size={16} color={batteryLevel > 30 ? colors.success : colors.warning} />
            <Text style={[styles.batteryText, { color: colors.text }]}>
              {batteryLevel.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Speed Display */}
        <View style={styles.speedContainer}>
          <Text style={[styles.speedValue, { color: colors.text }]}>{speed}</Text>
          <Text style={[styles.speedUnit, { color: colors.secondaryText }]}>km/h</Text>
        </View>

        {/* Speed Bar */}
        <View style={[styles.speedBarContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Animated.View 
            style={[
              styles.speedBar, 
              speedBarStyle,
              { backgroundColor: colors.primary }
            ]} 
          />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Clock size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatTime(rideTime)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Time</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <Navigation size={24} color={colors.accent} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {distance.toFixed(2)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>km</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <DollarSign size={24} color={colors.warning} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            ${cost.toFixed(2)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Cost</Text>
        </View>
      </View>

      {/* Current Location */}
      <View style={[styles.locationCard, { backgroundColor: colors.cardBackground }]}>
        <MapPin size={20} color={colors.secondaryText} />
        <View style={styles.locationText}>
          <Text style={[styles.locationTitle, { color: colors.text }]}>
            Current Location
          </Text>
          <Text style={[styles.locationAddress, { color: colors.secondaryText }]}>
            123 Market Street, San Francisco, CA
          </Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!isRiding ? (
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.primary }]}
            onPress={handleStartRide}
          >
            <Play size={24} color="white" />
            <Text style={styles.startButtonText}>Start Ride</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.rideControls}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.warning }]}
              onPress={handlePauseRide}
            >
              {isPaused ? (
                <Play size={20} color="white" />
              ) : (
                <Pause size={20} color="white" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.endButton, { backgroundColor: colors.error }]}
              onPress={handleEndRide}
            >
              <Square size={20} color="white" />
              <Text style={styles.endButtonText}>End Ride</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  emergencyButton: {
    padding: 8,
  },
  statusCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  batteryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
  speedContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  speedValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 48,
  },
  speedUnit: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
  },
  speedBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  speedBar: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    marginVertical: 4,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationText: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginBottom: 2,
  },
  locationAddress: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  controlsContainer: {
    padding: 16,
    marginTop: 'auto',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
  },
  startButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: 'white',
    marginLeft: 8,
  },
  rideControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  endButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
  },
  endButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: 'white',
    marginLeft: 8,
  },
});
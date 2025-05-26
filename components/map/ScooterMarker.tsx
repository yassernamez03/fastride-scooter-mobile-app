import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Battery } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Scooter } from '@/types';

let Marker: any = () => null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  Marker = Maps.Marker;
}

type ScooterMarkerProps = {
  scooter: Scooter;
  onPress: () => void;
};

export function ScooterMarker({ scooter, onPress }: ScooterMarkerProps) {
  const { colors } = useTheme();
  
  if (Platform.OS === 'web') {
    return null;
  }

  // Determine the battery color based on level
  const getBatteryColor = (level: number) => {
    if (level > 70) return '#32CD32'; // Green for high battery
    if (level > 30) return '#FFA500'; // Orange for medium battery
    return '#FF0000'; // Red for low battery
  };
  
  return (
    <Marker
      coordinate={{
        latitude: scooter.latitude,
        longitude: scooter.longitude,
      }}
      onPress={onPress}
    >
      <View style={styles.markerContainer}>
        <View style={[styles.markerTop, { backgroundColor: colors.cardBackground }]}>
          <Battery size={12} color={getBatteryColor(scooter.batteryLevel)} />
          <Text style={[styles.batteryText, { color: colors.text }]}>{scooter.batteryLevel}%</Text>
        </View>
        <View style={styles.markerPin}>
          <View style={[styles.circle, { backgroundColor: colors.cardBackground }]}>
            <Text style={styles.price}>${scooter.pricePerMinute}</Text>
          </View>
          <View style={[styles.pointer, { backgroundColor: colors.cardBackground }]} />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 2,
  },
  batteryText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    marginLeft: 2,
  },
  markerPin: {
    alignItems: 'center',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  price: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#32CD32',
  },
  pointer: {
    width: 8,
    height: 8,
    transform: [{ rotate: '45deg' }],
    marginTop: -4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
});
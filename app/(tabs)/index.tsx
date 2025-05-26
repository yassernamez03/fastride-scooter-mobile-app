import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Battery, Navigation, Filter, ListFilter } from 'lucide-react-native';
import * as Location from 'expo-location';
import { getScooters } from '@/services/scooterService';
import { MapHeader } from '@/components/map/MapHeader';
import { ScooterDetails } from '@/components/map/ScooterDetails';
import { darkMapStyle } from '@/constants/mapStyles';
import { Scooter } from '@/types';

// Conditional imports for maps - disable for now due to compatibility issues
let MapView: any = null;
let Marker: any = null;

// Temporarily disable maps until proper native build
// if (Platform.OS !== 'web') {
//   try {
//     const Maps = require('react-native-maps');
//     MapView = Maps.default || Maps.MapView;
//     Marker = Maps.Marker;
//   } catch (error) {
//     console.warn('React Native Maps not available:', error);
//   }
// }

export default function MapScreen() {
  const { theme, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [scooters, setScooters] = useState<Scooter[]>([]);
  const [selectedScooter, setSelectedScooter] = useState<Scooter | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        
        // Fetch scooters near the user's location
        const nearbyScooters = await getScooters(
          location.coords.latitude, 
          location.coords.longitude
        );
        setScooters(nearbyScooters);
      }
    })();
  }, []);

  const handleMarkerPress = (scooter: Scooter) => {
    setSelectedScooter(scooter);
  };

  const closeScooterDetails = () => {
    setSelectedScooter(null);
  };

  // Web fallback component or no maps available
  if (Platform.OS === 'web' || !MapView) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <MapHeader />
        <View style={styles.webFallback}>
          <Text style={[styles.webFallbackText, { color: colors.text }]}>
            {Platform.OS === 'web' 
              ? 'Map view is currently not available on web. Please use our mobile app for the full experience.'
              : 'Map functionality is not available. Please check your installation.'}
          </Text>
          <View style={styles.scooterList}>
            {scooters.map((scooter) => (
              <TouchableOpacity
                key={scooter.id}
                style={[styles.scooterItem, { backgroundColor: colors.cardBackground }]}
                onPress={() => handleMarkerPress(scooter)}
              >
                <Text style={[styles.scooterTitle, { color: colors.text }]}>
                  Scooter #{scooter.id}
                </Text>
                <Text style={[styles.scooterInfo, { color: colors.secondaryText }]}>
                  Battery: {scooter.batteryLevel}% | ${scooter.pricePerMinute}/min
                </Text>
                <Text style={[styles.scooterAddress, { color: colors.secondaryText }]}>
                  {scooter.address}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {selectedScooter && (
          <ScooterDetails 
            scooter={selectedScooter} 
            onClose={closeScooterDetails} 
          />
        )}
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {MapView && (
        <MapView
          style={styles.map}
          provider={Platform.OS === 'android' ? 'google' : undefined}
          showsUserLocation
          showsMyLocationButton={false}
          customMapStyle={theme === 'dark' ? darkMapStyle : []}
          initialRegion={{
            latitude: userLocation?.coords.latitude || 37.78825,
            longitude: userLocation?.coords.longitude || -122.4324,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
        >
          {Marker && scooters.map((scooter) => (
            <Marker
              key={scooter.id}
              coordinate={{
                latitude: scooter.latitude,
                longitude: scooter.longitude,
              }}
              onPress={() => handleMarkerPress(scooter)}
            />
          ))}
        </MapView>
      )}
      
      <MapHeader />
      
      <View style={[styles.filterButton, { top: insets.top + 60 }]}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}
        >
          <ListFilter size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {!locationPermission && (
        <View style={[styles.permissionAlert, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.permissionText, { color: colors.text }]}>
            Location permission is required to find scooters near you
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={async () => {
              const { status } = await Location.requestForegroundPermissionsAsync();
              setLocationPermission(status === 'granted');
            }}
          >
            <Text style={styles.permissionButtonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {selectedScooter && (
        <ScooterDetails 
          scooter={selectedScooter} 
          onClose={closeScooterDetails} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  filterButton: {
    position: 'absolute',
    right: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  permissionAlert: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  permissionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginBottom: 12,
  },
  permissionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  permissionButtonText: {
    fontFamily: 'Poppins-Medium',
    color: 'white',
    fontSize: 14,
  },
  webFallback: {
    flex: 1,
    padding: 16,
    paddingTop: 80,
  },
  webFallbackText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  scooterList: {
    gap: 12,
  },
  scooterItem: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scooterTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  scooterInfo: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  scooterAddress: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});
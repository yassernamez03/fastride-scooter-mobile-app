import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Battery, Navigation, Filter, ListFilter } from 'lucide-react-native';
import * as Location from 'expo-location';
import { getScooters } from '@/services/scooterService';
import { MapHeader } from '@/components/map/MapHeader';
import { ScooterDetails } from '@/components/map/ScooterDetails';
import { WeatherWidget } from '@/components/ui/WeatherWidget';
import { darkMapStyle, lightMapStyle } from '@/constants/mapStyles';
import { Scooter } from '@/types';

// Conditional imports for maps
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default || Maps.MapView;
    Marker = Maps.Marker;
  } catch (error) {
    console.log('Maps not available:', error);
  }
}

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
        
        {/* Weather Widget */}
        <WeatherWidget 
          latitude={userLocation?.coords.latitude}
          longitude={userLocation?.coords.longitude}
        />
        
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
      {MapView && (        <MapView
          style={styles.map}
          provider="google"
          customMapStyle={theme === 'dark' ? darkMapStyle : lightMapStyle}
          initialRegion={{
            latitude: userLocation?.coords.latitude || 37.78825,
            longitude: userLocation?.coords.longitude || -122.4324,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={locationPermission}
          showsMyLocationButton={false}
          showsPointsOfInterest={false}
          showsBuildings={false}
          showsTraffic={false}
        >
          {scooters.map((scooter) => (
            <Marker
              key={scooter.id}
              coordinate={{
                latitude: scooter.latitude,
                longitude: scooter.longitude,
              }}
              onPress={() => handleMarkerPress(scooter)}
            >
              <View style={styles.markerContainer}>
                <View style={[styles.markerCircle, { backgroundColor: colors.primary }]}>
                  <Battery size={16} color="white" />
                </View>
                <Text style={[styles.markerText, { color: colors.text }]}>
                  {scooter.batteryLevel}%
                </Text>
              </View>
            </Marker>
          ))}
        </MapView>
      )}
      
      <MapHeader />
      
      {/* Weather Widget */}
      <WeatherWidget 
        latitude={userLocation?.coords.latitude}
        longitude={userLocation?.coords.longitude}
      />
      
      {/* Map Controls */}
      <View style={[styles.mapControls, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}
        >
          <Navigation size={24} color={colors.text} />
        </TouchableOpacity>
        
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
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },  markerCircle: {
    width: 36,
    height: 36,    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },markerText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mapControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'column',
    gap: 12,
  },  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },permissionAlert: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
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
    paddingTop: 20,
  },
  webFallbackText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  scooterList: {
    gap: 12,
  },  scooterItem: {
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

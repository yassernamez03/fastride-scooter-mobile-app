import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Battery, Zap, Timer, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Scooter } from '@/types';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

type ScooterDetailsProps = {
  scooter: Scooter;
  onClose: () => void;
};

export function ScooterDetails({ scooter, onClose }: ScooterDetailsProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Determine the battery color based on level
  const getBatteryColor = (level: number) => {
    if (level > 70) return '#32CD32'; // Green for high battery
    if (level > 30) return '#FFA500'; // Orange for medium battery
    return '#FF0000'; // Red for low battery
  };
  
  // Calculate the estimated range based on battery level
  const estimatedRange = Math.floor(scooter.batteryLevel * 0.25); // 0.25 km per 1% battery
  
  const handleUnlock = () => {
    router.push({
      pathname: '/scan',
    });
  };
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.cardBackground,
          paddingBottom: insets.bottom + 16
        }
      ]}
      entering={FadeInUp.duration(300)}
      exiting={FadeOutDown.duration(300)}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Scooter Details</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.scooterInfo}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Battery size={20} color={getBatteryColor(scooter.batteryLevel)} style={styles.infoIcon} />
            <Text style={[styles.infoValue, { color: colors.text }]}>{scooter.batteryLevel}%</Text>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Battery</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.infoItem}>
            <Zap size={20} color={colors.primary} style={styles.infoIcon} />
            <Text style={[styles.infoValue, { color: colors.text }]}>{estimatedRange} km</Text>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Range</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.infoItem}>
            <Timer size={20} color={colors.primary} style={styles.infoIcon} />
            <Text style={[styles.infoValue, { color: colors.text }]}>${scooter.pricePerMinute}</Text>
            <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Per min</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.addressContainer}>
        <Text style={[styles.addressLabel, { color: colors.secondaryText }]}>Location</Text>
        <Text style={[styles.addressText, { color: colors.text }]}>{scooter.address}</Text>
      </View>
      
      <View style={styles.pricingContainer}>
        <Text style={[styles.pricingTitle, { color: colors.text }]}>Pricing</Text>
        
        <View style={styles.pricingRow}>
          <Text style={[styles.pricingLabel, { color: colors.secondaryText }]}>Unlock Fee</Text>
          <Text style={[styles.pricingValue, { color: colors.text }]}>$1.00</Text>
        </View>
        
        <View style={styles.pricingRow}>
          <Text style={[styles.pricingLabel, { color: colors.secondaryText }]}>Per Minute</Text>
          <Text style={[styles.pricingValue, { color: colors.text }]}>${scooter.pricePerMinute}</Text>
        </View>
        
        <View style={[styles.pricingDivider, { backgroundColor: colors.border }]} />
        
        <View style={styles.pricingRow}>
          <Text style={[styles.pricingTotal, { color: colors.text }]}>Estimated 10 min ride</Text>
          <Text style={[styles.pricingTotalValue, { color: colors.text }]}>
            ${(1 + scooter.pricePerMinute * 10).toFixed(2)}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.unlockButton, { backgroundColor: colors.primary }]}
        onPress={handleUnlock}
      >
        <Text style={styles.unlockButtonText}>Scan to Unlock</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  scooterInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoIcon: {
    marginBottom: 8,
  },
  infoValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  infoLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 40,
  },
  addressContainer: {
    marginBottom: 20,
  },
  addressLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  addressText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  pricingContainer: {
    marginBottom: 24,
  },
  pricingTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginBottom: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pricingLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  pricingValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  pricingDivider: {
    height: 1,
    marginVertical: 8,
  },
  pricingTotal: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  pricingTotalValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  unlockButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: 'white',
  },
});
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, Leaf } from 'lucide-react-native';
import { getRideHistory } from '@/services/rideService';
import { RideHistoryItem } from '@/types';

export default function RidesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('history');
  const [rides, setRides] = useState<RideHistoryItem[]>(getRideHistory());

  const renderRideItem = ({ item }: { item: RideHistoryItem }) => {
    return (
      <TouchableOpacity 
        style={[styles.rideCard, { backgroundColor: colors.cardBackground }]}
      >
        <View style={styles.rideHeader}>
          <View style={styles.rideInfo}>
            <Text style={[styles.rideDate, { color: colors.secondaryText }]}>
              {item.date}
            </Text>
            <Text style={[styles.rideTitle, { color: colors.text }]}>
              {item.title}
            </Text>
          </View>
          <View style={[styles.rideCost, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.rideCostText, { color: colors.text }]}>${item.cost.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.rideDetails}>
          <View style={styles.detailItem}>
            <Clock size={16} color={colors.secondaryText} style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: colors.secondaryText }]}>
              {item.duration} min
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MapPin size={16} color={colors.secondaryText} style={styles.detailIcon} />
            <Text 
              style={[styles.detailText, { color: colors.secondaryText }]}
              numberOfLines={1}
            >
              {item.distance} km
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Leaf size={16} color="#32CD32" style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: '#32CD32' }]}>
              {item.co2Saved} kg CO₂ saved
            </Text>
          </View>
        </View>
        
        <View style={[styles.rideRouteLine, { backgroundColor: colors.border }]} />
        
        <View style={styles.routeContainer}>
          <View style={styles.routePoints}>
            <View style={[styles.routePointStart, { backgroundColor: colors.primary }]} />
            <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
            <View style={[styles.routePointEnd, { backgroundColor: colors.error }]} />
          </View>
          <View style={styles.routeAddresses}>
            <Text style={[styles.routeAddressText, { color: colors.text }]} numberOfLines={1}>
              {item.startLocation}
            </Text>
            <Text style={[styles.routeAddressText, { color: colors.text }]} numberOfLines={1}>
              {item.endLocation}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image 
        source={{ uri: 'https://images.pexels.com/photos/5061568/pexels-photo-5061568.jpeg?auto=compress&cs=tinysrgb&w=600' }} 
        style={styles.emptyImage} 
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No rides yet</Text>
      <Text style={[styles.emptyDescription, { color: colors.secondaryText }]}>
        Your ride history will appear here after you take your first ride
      </Text>
      <TouchableOpacity 
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.emptyButtonText}>Find a Scooter</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Rides</Text>
        
        <View style={[styles.tabs, { backgroundColor: colors.backgroundSecondary }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'upcoming' && { 
                backgroundColor: colors.cardBackground 
              },
            ]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.secondaryText },
                activeTab === 'upcoming' && { color: colors.text },
              ]}
            >
              Upcoming
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'history' && { 
                backgroundColor: colors.cardBackground 
              },
            ]}
            onPress={() => setActiveTab('history')}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.secondaryText },
                activeTab === 'history' && { color: colors.text },
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={activeTab === 'history' ? rides : []}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  rideCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rideInfo: {
    flex: 1,
  },
  rideDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginBottom: 2,
  },
  rideTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  rideCost: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rideCostText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  rideDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailIcon: {
    marginRight: 4,
  },
  detailText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  rideRouteLine: {
    height: 1,
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: 'row',
  },
  routePoints: {
    width: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  routePointStart: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  routeLine: {
    width: 2,
    height: 24,
  },
  routePointEnd: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeAddresses: {
    flex: 1,
    justifyContent: 'space-between',
    height: 48,
  },
  routeAddressText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    padding: 16,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 24,
    borderRadius: 75,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginBottom: 8,
  },
  emptyDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: 'white',
  },
});
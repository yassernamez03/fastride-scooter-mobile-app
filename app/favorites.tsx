import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Heart,
  Home,
  Briefcase,
  MapPin,
  Search,
  Edit2,
  Trash2,
  Clock,
  TrendingUp,
} from 'lucide-react-native';
import {
  favoritesService,
  FavoriteLocation,
  RecentLocation,
  getFavorites,
  getRecentLocations,
  removeFavorite,
  addFavorite,
} from '@/services/favoritesService';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'favorites' | 'recent'>('favorites');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setFavorites(getFavorites());
    setRecentLocations(getRecentLocations());
  };

  const handleAddFavorite = () => {
    setShowAddModal(true);
  };

  const handleDeleteFavorite = (id: string, name: string) => {
    Alert.alert(
      'Remove Favorite',
      `Are you sure you want to remove "${name}" from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeFavorite(id);
            loadData();
          },
        },
      ]
    );
  };

  const getLocationIcon = (type: FavoriteLocation['type']) => {
    switch (type) {
      case 'home':
        return <Home size={20} color={colors.primary} />;
      case 'work':
        return <Briefcase size={20} color={colors.accent} />;
      default:
        return <MapPin size={20} color={colors.secondaryText} />;
    }
  };

  const filteredFavorites = favorites.filter(fav =>
    fav.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fav.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecent = recentLocations.filter(recent =>
    recent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recent.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router && router.back) {
              router.back();
            }
          }}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Saved Places
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddFavorite}
        >
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}>
          <Search size={20} color={colors.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search locations..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'favorites' && { backgroundColor: colors.primary + '20' },
          ]}
          onPress={() => setSelectedTab('favorites')}
        >
          <Heart
            size={20}
            color={selectedTab === 'favorites' ? colors.primary : colors.secondaryText}
          />
          <Text style={[
            styles.tabText,
            {
              color: selectedTab === 'favorites' ? colors.primary : colors.secondaryText,
            },
          ]}>
            Favorites ({favorites.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'recent' && { backgroundColor: colors.primary + '20' },
          ]}
          onPress={() => setSelectedTab('recent')}
        >
          <Clock
            size={20}
            color={selectedTab === 'recent' ? colors.primary : colors.secondaryText}
          />
          <Text style={[
            styles.tabText,
            {
              color: selectedTab === 'recent' ? colors.primary : colors.secondaryText,
            },
          ]}>
            Recent ({recentLocations.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {selectedTab === 'favorites' ? (
          <View style={styles.locationsList}>
            {filteredFavorites.length === 0 ? (
              <View style={styles.emptyState}>
                <Heart size={64} color={colors.secondaryText} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {searchQuery ? 'No matching favorites' : 'No favorite places yet'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
                  {searchQuery 
                    ? 'Try searching with different keywords'
                    : 'Add your frequently visited locations for quick access'
                  }
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={[styles.addFirstButton, { backgroundColor: colors.primary }]}
                    onPress={handleAddFavorite}
                  >
                    <Plus size={20} color="white" />
                    <Text style={styles.addFirstButtonText}>Add Your First Place</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredFavorites.map((favorite) => (
                <View
                  key={favorite.id}
                  style={[styles.locationItem, { backgroundColor: colors.cardBackground }]}
                >
                  <View style={styles.locationHeader}>
                    <View style={styles.locationIcon}>
                      {getLocationIcon(favorite.type)}
                    </View>
                    
                    <View style={styles.locationInfo}>
                      <Text style={[styles.locationName, { color: colors.text }]}>
                        {favorite.name}
                      </Text>
                      <Text style={[styles.locationAddress, { color: colors.secondaryText }]}>
                        {favorite.address}
                      </Text>
                      <Text style={[styles.locationTime, { color: colors.secondaryText }]}>
                        Last used {formatTime(favorite.lastUsed)}
                      </Text>
                    </View>

                    <View style={styles.locationActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          // Navigate to map with this location
                          router.push('/(tabs)/');
                        }}
                      >
                        <MapPin size={16} color={colors.primary} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteFavorite(favorite.id, favorite.name)}
                      >
                        <Trash2 size={16} color={colors.error || '#EF4444'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.locationsList}>
            {filteredRecent.length === 0 ? (
              <View style={styles.emptyState}>
                <Clock size={64} color={colors.secondaryText} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {searchQuery ? 'No matching recent places' : 'No recent places'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
                  {searchQuery 
                    ? 'Try searching with different keywords'
                    : 'Your recently visited locations will appear here'
                  }
                </Text>
              </View>
            ) : (
              filteredRecent.map((recent) => (
                <View
                  key={recent.id}
                  style={[styles.locationItem, { backgroundColor: colors.cardBackground }]}
                >
                  <View style={styles.locationHeader}>
                    <View style={styles.locationIcon}>
                      <Clock size={20} color={colors.secondaryText} />
                    </View>
                    
                    <View style={styles.locationInfo}>
                      <Text style={[styles.locationName, { color: colors.text }]}>
                        {recent.name}
                      </Text>
                      <Text style={[styles.locationAddress, { color: colors.secondaryText }]}>
                        {recent.address}
                      </Text>
                      <View style={styles.recentStats}>
                        <TrendingUp size={12} color={colors.secondaryText} />
                        <Text style={[styles.frequencyText, { color: colors.secondaryText }]}>
                          {recent.frequency} visits • {formatTime(recent.timestamp)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.locationActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          // Navigate to map with this location
                          router.push('/(tabs)/');
                        }}
                      >
                        <MapPin size={16} color={colors.primary} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={async () => {
                          await addFavorite({
                            name: recent.name,
                            address: recent.address,
                            latitude: recent.latitude,
                            longitude: recent.longitude,
                            type: 'custom',
                          });
                          loadData();
                        }}
                      >
                        <Heart size={16} color={colors.accent} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Favorite Modal */}
      <AddFavoriteModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={() => {
          setShowAddModal(false);
          loadData();
        }}
        colors={colors}
      />
    </View>
  );
}

// Add Favorite Modal Component
function AddFavoriteModal({
  visible,
  onClose,
  onAdd,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
  colors: any;
}) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<FavoriteLocation['type']>('custom');

  const handleAdd = async () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await addFavorite({
        name: name.trim(),
        address: address.trim(),
        type,
        latitude: 37.7749, // Mock coordinates - in real app, use geocoding
        longitude: -122.4194,
      });
      
      setName('');
      setAddress('');
      setType('custom');
      onAdd();
    } catch (error) {
      Alert.alert('Error', 'Failed to add favorite location');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Add Favorite Place
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
            placeholder="Place name"
            placeholderTextColor={colors.secondaryText}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
            placeholder="Address"
            placeholderTextColor={colors.secondaryText}
            value={address}
            onChangeText={setAddress}
          />

          <View style={styles.typeSelector}>
            <Text style={[styles.typeLabel, { color: colors.text }]}>Type:</Text>
            <View style={styles.typeButtons}>
              {[
                { key: 'home', label: 'Home', icon: Home },
                { key: 'work', label: 'Work', icon: Briefcase },
                { key: 'custom', label: 'Other', icon: MapPin },
              ].map(({ key, label, icon: Icon }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.typeButton,
                    { backgroundColor: colors.cardBackground },
                    type === key && { backgroundColor: colors.primary + '20' },
                  ]}
                  onPress={() => setType(key as FavoriteLocation['type'])}
                >
                  <Icon
                    size={16}
                    color={type === key ? colors.primary : colors.secondaryText}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    { color: type === key ? colors.primary : colors.secondaryText },
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.cardBackground }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleAdd}
            >
              <Text style={styles.modalButtonTextPrimary}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  content: {
    flex: 1,
  },
  locationsList: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },  locationItem: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  locationTime: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  recentStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  frequencyText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginBottom: 16,
  },
  typeSelector: {
    marginBottom: 24,
  },
  typeLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  typeButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  modalButtonTextPrimary: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
});

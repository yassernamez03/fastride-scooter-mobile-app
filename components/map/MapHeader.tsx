import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Menu, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export function MapHeader() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={[styles.menuButton, { backgroundColor: colors.cardBackground }]}
          activeOpacity={0.7}
        >
          <Menu size={22} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Fast</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Ride</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: colors.cardBackground }]}
          activeOpacity={0.7}
          onPress={() => router.push('/profile')}
        >
          <User size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.searchContainer, { 
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
      }]}>
        <Search size={20} color={colors.primary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Where would you like to go?"
          placeholderTextColor={colors.placeholderText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    height: 48,
  },
});
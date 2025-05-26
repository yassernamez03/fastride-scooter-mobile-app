import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { 
  CreditCard, 
  Settings, 
  LogOut, 
  Heart, 
  Gift, 
  MessageCircle,
  Moon,
  ChevronRight,
  Leaf,
  Bell
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toggleTheme();
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Image 
            source={{ uri: user?.photoURL || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }} 
            style={styles.profileImage} 
          />
          <View style={styles.headerText}>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'John Doe'}</Text>
            <Text style={[styles.userEmail, { color: colors.secondaryText }]}>{user?.email || 'john.doe@example.com'}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={[styles.editButton, { borderColor: colors.border }]}>
          <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.statHeader}>
            <Text style={[styles.statTitle, { color: colors.text }]}>Green Impact</Text>
            <Leaf size={20} color="#32CD32" />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>8.2 kg</Text>
          <Text style={[styles.statDescription, { color: colors.secondaryText }]}>CO₂ emissions saved</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.statHeader}>
            <Text style={[styles.statTitle, { color: colors.text }]}>Total Rides</Text>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/5061568/pexels-photo-5061568.jpeg?auto=compress&cs=tinysrgb&w=600' }} 
              style={styles.statIcon} 
            />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>24</Text>
          <Text style={[styles.statDescription, { color: colors.secondaryText }]}>Rides completed</Text>
        </View>
      </View>
      
      <View style={[styles.sectionContainer, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/payment-methods')}
        >
          <CreditCard size={24} color={colors.primary} style={styles.menuIcon} />
          <Text style={[styles.menuText, { color: colors.text }]}>Payment Methods</Text>
          <ChevronRight size={20} color={colors.secondaryText} />
        </TouchableOpacity>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/notifications')}
        >
          <Bell size={24} color="#3B82F6" style={styles.menuIcon} />
          <Text style={[styles.menuText, { color: colors.text }]}>Notifications</Text>
          <ChevronRight size={20} color={colors.secondaryText} />
        </TouchableOpacity>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <TouchableOpacity style={styles.menuItem}>
          <Gift size={24} color="#F97316" style={styles.menuIcon} />
          <Text style={[styles.menuText, { color: colors.text }]}>Referrals & Rewards</Text>
          <ChevronRight size={20} color={colors.secondaryText} />
        </TouchableOpacity>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/favorites')}
        >
          <Heart size={24} color="#EC4899" style={styles.menuIcon} />
          <Text style={[styles.menuText, { color: colors.text }]}>Favorite Locations</Text>
          <ChevronRight size={20} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.sectionContainer, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
        
        <View style={styles.menuItem}>
          <Moon size={24} color="#6366F1" style={styles.menuIcon} />
          <Text style={[styles.menuText, { color: colors.text }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={handleToggleTheme}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={"#f4f3f4"}
          />
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/settings')}
        >
          <Settings size={24} color={colors.secondaryText} style={styles.menuIcon} />
          <Text style={[styles.menuText, { color: colors.text }]}>Settings</Text>
          <ChevronRight size={20} color={colors.secondaryText} />
        </TouchableOpacity>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <TouchableOpacity style={styles.menuItem}>
          <MessageCircle size={24} color="#8B5CF6" style={styles.menuIcon} />
          <Text style={[styles.menuText, { color: colors.text }]}>Help & Support</Text>
          <ChevronRight size={20} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.logoutButton, { borderColor: colors.border }]}
        onPress={logout}
      >
        <LogOut size={20} color={colors.error} style={styles.logoutIcon} />
        <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  editButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  statIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    marginBottom: 4,
  },
  statDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  sectionContainer: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    flex: 1,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
});
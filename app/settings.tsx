import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Bell, 
  Shield, 
  Eye, 
  Type, 
  ChevronRight, 
  Trash2,
  ArrowLeft
} from 'lucide-react-native';
import { 
  getUserPreferences, 
  saveUserPreferences, 
  clearAllData 
} from '@/services/preferencesService';
import { UserPreferences } from '@/types';

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getUserPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (
    section: keyof UserPreferences,
    key: string,
    value: any
  ) => {
    if (!preferences) return;

    const updated = {
      ...preferences,
      [section]: {
        ...preferences[section],
        [key]: value,
      },
    };

    setPreferences(updated);
    
    try {
      await saveUserPreferences(updated);
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Revert on error
      setPreferences(preferences);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all your preferences, favorites, and cached data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Success', 'All data has been cleared.');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading || !preferences) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading settings...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
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
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Notifications
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Push Notifications
            </Text>
            <Switch
              value={preferences.notifications.pushEnabled}
              onValueChange={(value) => 
                updatePreference('notifications', 'pushEnabled', value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBackground}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Email Updates
            </Text>
            <Switch
              value={preferences.notifications.emailEnabled}
              onValueChange={(value) => 
                updatePreference('notifications', 'emailEnabled', value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBackground}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Riding Reminders
            </Text>
            <Switch
              value={preferences.notifications.ridingReminders}
              onValueChange={(value) => 
                updatePreference('notifications', 'ridingReminders', value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBackground}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Promotions
            </Text>
            <Switch
              value={preferences.notifications.promotions}
              onValueChange={(value) => 
                updatePreference('notifications', 'promotions', value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBackground}
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Privacy
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Share Location
            </Text>
            <Switch
              value={preferences.privacy.shareLocation}
              onValueChange={(value) => 
                updatePreference('privacy', 'shareLocation', value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBackground}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Share Ride History
            </Text>
            <Switch
              value={preferences.privacy.shareRideHistory}
              onValueChange={(value) => 
                updatePreference('privacy', 'shareRideHistory', value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBackground}
            />
          </View>
        </View>

        {/* Accessibility Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Eye size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Accessibility
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Reduced Motion
            </Text>
            <Switch
              value={preferences.accessibility.reducedMotion}
              onValueChange={(value) => 
                updatePreference('accessibility', 'reducedMotion', value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBackground}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              High Contrast
            </Text>
            <Switch
              value={preferences.accessibility.highContrast}
              onValueChange={(value) => 
                updatePreference('accessibility', 'highContrast', value)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBackground}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Font Size
            </Text>
            <View style={styles.settingValue}>
              <Text style={[styles.settingValueText, { color: colors.secondaryText }]}>
                {preferences.accessibility.fontSize.charAt(0).toUpperCase() + 
                 preferences.accessibility.fontSize.slice(1)}
              </Text>
              <ChevronRight size={20} color={colors.secondaryText} />
            </View>
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Type size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              App Settings
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Dark Mode
            </Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBackground}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Trash2 size={20} color={colors.error} />
            <Text style={[styles.sectionTitle, { color: colors.error }]}>
              Danger Zone
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleClearData}
          >
            <Text style={[styles.settingLabel, { color: colors.error }]}>
              Clear All Data
            </Text>
            <ChevronRight size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.secondaryText }]}>
            FastRide v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
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
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    flex: 1,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    marginRight: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});

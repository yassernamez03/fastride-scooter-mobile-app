import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Bell,
  BellOff,
  ArrowLeft,
  Trash2,
  CheckCheck,
  Clock,
  Gift,
  Wrench,
  Car,
} from 'lucide-react-native';
import {
  notificationService,
  NotificationData,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from '@/services/notificationService';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const allNotifications = getNotifications();
    setNotifications(allNotifications);
    setUnreadCount(getUnreadCount());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: NotificationData) => {
    if (!notification.read) {
      markAsRead(notification.id);
      loadNotifications();
    }

    // Navigate based on notification action
    if (notification.data?.action) {      switch (notification.data.action) {
        case 'ride':
          router.push('/ride');
          break;
        case 'map':
          router.push('/');
          break;
        case 'promotions':
          // Navigate to promotions screen when available
          break;
        case 'maintenance':
          // Navigate to maintenance info when available
          break;
      }
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteNotification(notificationId);
            loadNotifications();
          },
        },
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    loadNotifications();
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            notificationService.clearAllNotifications();
            loadNotifications();
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ride':
        return <Car size={20} color={colors.primary} />;
      case 'promotion':
        return <Gift size={20} color={colors.accent} />;
      case 'maintenance':
        return <Wrench size={20} color={colors.warning || '#F59E0B'} />;
      default:
        return <Bell size={20} color={colors.secondaryText} />;
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
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
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleMarkAllAsRead}
            >
              <CheckCheck size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClearAll}
          >
            <Trash2 size={20} color={colors.error || '#EF4444'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <BellOff size={64} color={colors.secondaryText} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No notifications yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
              You'll see ride updates, promotions, and important announcements here
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  { backgroundColor: colors.cardBackground },
                  !notification.read && styles.unreadNotification,
                  !notification.read && { backgroundColor: colors.primary + '10' },
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </View>
                  
                  <View style={styles.notificationContent}>                    <Text style={[
                      styles.notificationTitle,
                      { color: colors.text },
                      !notification.read && styles.unreadTextBold,
                    ]}>
                      {notification.title}
                    </Text>
                    <Text style={[
                      styles.notificationBody,
                      { color: colors.secondaryText },
                    ]}>
                      {notification.body}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteNotification(notification.id)}
                  >
                    <Trash2 size={16} color={colors.secondaryText} />
                  </TouchableOpacity>
                </View>

                <View style={styles.notificationFooter}>
                  <View style={styles.timeContainer}>
                    <Clock size={12} color={colors.secondaryText} />
                    <Text style={[styles.timeText, { color: colors.secondaryText }]}>
                      {formatTime(notification.timestamp)}
                    </Text>
                  </View>

                  {!notification.read && (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    marginRight: 8,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
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
  },
  notificationsList: {
    padding: 16,
    gap: 12,
  },  notificationItem: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: 'currentColor',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },  notificationBody: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  unreadTextBold: {
    fontFamily: 'Poppins-Bold',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

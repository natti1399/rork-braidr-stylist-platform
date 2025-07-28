import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  RefreshControl,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'review' | 'reminder' | 'promotion' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  avatar?: string;
  actionData?: any;
}

interface NotificationCenterScreenProps {
  navigation?: any;
}

// Sample notifications data
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your appointment with Maya Johnson for Medium Box Braids is confirmed for tomorrow at 2:00 PM.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isRead: false,
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f4?auto=format&fit=crop&w=200&q=80',
    actionData: { stylistId: '1', appointmentId: 'apt_123' }
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'Maya Johnson: "Perfect! See you tomorrow at 2 PM for your box braids."',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f4?auto=format&fit=crop&w=200&q=80',
    actionData: { conversationId: '1', stylistName: 'Maya Johnson' }
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Appointment Reminder',
    message: 'Your appointment with Aisha Thompson is scheduled for today at 10:00 AM. Don\'t forget to prepare your hair!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    isRead: true,
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80',
    actionData: { appointmentId: 'apt_124' }
  },
  {
    id: '4',
    type: 'review',
    title: 'Review Request',
    message: 'How was your experience with Zara Williams? Share your review to help other customers.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    actionData: { appointmentId: 'apt_122', stylistId: '3' }
  },
  {
    id: '5',
    type: 'promotion',
    title: 'Special Offer',
    message: 'Get 20% off your next booking with any stylist! Use code BRAIDR20. Valid until Friday.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    isRead: true,
    actionData: { promoCode: 'BRAIDR20' }
  },
  {
    id: '6',
    type: 'system',
    title: 'App Update Available',
    message: 'Version 2.1 is now available with new features and improvements. Update now for the best experience.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    isRead: true
  }
];

export default function NotificationCenterScreen({ navigation }: NotificationCenterScreenProps) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state
  const [notificationSettings, setNotificationSettings] = useState({
    bookings: true,
    messages: true,
    reviews: true,
    reminders: true,
    promotions: true,
    system: false
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return 'calendar';
      case 'message': return 'chatbubble';
      case 'review': return 'star';
      case 'reminder': return 'alarm';
      case 'promotion': return 'gift';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking': return '#4267FF';
      case 'message': return '#34C759';
      case 'review': return '#FFD700';
      case 'reminder': return '#FF9500';
      case 'promotion': return '#FF3B30';
      case 'system': return '#8E8E93';
      default: return '#4267FF';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'booking':
        if (notification.actionData?.appointmentId) {
          navigation?.navigate('CustomerBookings');
        }
        break;
      case 'message':
        if (notification.actionData?.conversationId) {
          navigation?.navigate('Chat', {
            conversationId: notification.actionData.conversationId,
            stylistName: notification.actionData.stylistName
          });
        }
        break;
      case 'review':
        if (notification.actionData?.appointmentId) {
          navigation?.navigate('WriteReview', {
            appointmentId: notification.actionData.appointmentId,
            stylistId: notification.actionData.stylistId
          });
        }
        break;
      case 'reminder':
        navigation?.navigate('CustomerBookings');
        break;
      case 'promotion':
        navigation?.navigate('CustomerSearch');
        break;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => setNotifications([])
        }
      ]
    );
  };

  const updateNotificationSetting = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderNotification = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[styles.notificationCard, !notification.isRead && styles.unreadNotificationCard]}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationLeft}>
          {notification.avatar ? (
            <Image source={{ uri: notification.avatar }} style={styles.notificationAvatar} />
          ) : (
            <View style={[styles.notificationIcon, { backgroundColor: `${getNotificationColor(notification.type)}20` }]}>
              <Ionicons 
                name={getNotificationIcon(notification.type) as any} 
                size={24} 
                color={getNotificationColor(notification.type)} 
              />
            </View>
          )}
          
          {!notification.isRead && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.notificationBody}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationTitle, !notification.isRead && styles.unreadTitle]}>
              {notification.title}
            </Text>
            <Text style={styles.notificationTime}>{formatTimestamp(notification.timestamp)}</Text>
          </View>
          
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteNotification(notification.id)}
        >
          <Ionicons name="close" size={18} color="#8E8E93" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>Notification Settings</Text>
      
      {Object.entries(notificationSettings).map(([key, value]) => (
        <View key={key} style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
            <Text style={styles.settingDescription}>
              {key === 'bookings' && 'Booking confirmations and updates'}
              {key === 'messages' && 'New messages from stylists'}
              {key === 'reviews' && 'Review requests and reminders'}
              {key === 'reminders' && 'Appointment reminders'}
              {key === 'promotions' && 'Special offers and discounts'}
              {key === 'system' && 'App updates and system messages'}
            </Text>
          </View>
          <Switch
            value={value}
            onValueChange={(newValue) => updateNotificationSetting(key, newValue)}
            trackColor={{ false: '#E5E5EA', true: '#4267FF' }}
            thumbColor="white"
          />
        </View>
      ))}
    </View>
  );

  if (showSettings) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Settings Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowSettings(false)}
          >
            <Ionicons name="chevron-back" size={24} color="#4267FF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Notification Settings</Text>
          
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderSettings()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#4267FF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#4267FF" />
        </TouchableOpacity>
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <Ionicons name="checkmark-done" size={18} color={unreadCount > 0 ? "#4267FF" : "#8E8E93"} />
          <Text style={[styles.actionButtonText, unreadCount === 0 && styles.disabledActionText]}>
            Mark All Read
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={clearAllNotifications}
          disabled={notifications.length === 0}
        >
          <Ionicons name="trash-outline" size={18} color={notifications.length > 0 ? "#FF3B30" : "#8E8E93"} />
          <Text style={[styles.actionButtonText, { color: notifications.length > 0 ? "#FF3B30" : "#8E8E93" }]}>
            Clear All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView 
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4267FF"
          />
        }
      >
        <View style={styles.notificationsContainer}>
          {notifications.length > 0 ? (
            notifications.map(renderNotification)
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="notifications-outline" size={64} color="#8E8E93" />
              </View>
              <Text style={styles.emptyStateTitle}>No Notifications</Text>
              <Text style={styles.emptyStateDescription}>
                You're all caught up! New notifications will appear here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  headerPlaceholder: {
    width: 40,
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4267FF',
  },
  disabledActionText: {
    color: '#8E8E93',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotificationCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4267FF',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  notificationLeft: {
    position: 'relative',
    marginRight: 12,
  },
  notificationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: 'white',
  },
  notificationBody: {
    flex: 1,
    marginRight: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(142, 142, 147, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  settingsContainer: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
});
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Modal, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { toast } from 'sonner-native';

export default function CustomerProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const customerData = {
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    memberSince: 'January 2024',
    totalBookings: 12,
    favoriteStylists: 3,
    avatar: null
  };

  const handleLogout = () => {
    setSettingsVisible(false);
    toast.success('Logged out successfully');
  };

  const handleNavigation = (screen: string) => {
    navigation.navigate(screen as never);
  };

  const renderSettingsModal = () => (
    <Modal
      visible={settingsVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setSettingsVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalHeader, { paddingTop: Math.max(insets.top, 20) }]}>
          <TouchableOpacity onPress={() => setSettingsVisible(false)}>
            <Ionicons name="close" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          {/* App Preferences */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>App Preferences</Text>
            
            <View style={styles.settingsRow}>
              <View style={styles.settingsRowLeft}>
                <Ionicons name="moon-outline" size={20} color="#666" />
                <Text style={styles.settingsRowText}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E5E5E7', true: '#4267FF' }}
                thumbColor={darkMode ? 'white' : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity style={styles.settingsRow}>
              <View style={styles.settingsRowLeft}>
                <Ionicons name="language-outline" size={20} color="#666" />
                <Text style={styles.settingsRowText}>Language</Text>
              </View>
              <View style={styles.settingsRowRight}>
                <Text style={styles.settingsRowValue}>English</Text>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Notifications */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            <View style={styles.settingsRow}>
              <View style={styles.settingsRowLeft}>
                <Ionicons name="notifications-outline" size={20} color="#666" />
                <Text style={styles.settingsRowText}>Push Notifications</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#E5E5E7', true: '#4267FF' }}
                thumbColor={pushNotifications ? 'white' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingsRow}>
              <View style={styles.settingsRowLeft}>
                <Ionicons name="mail-outline" size={20} color="#666" />
                <Text style={styles.settingsRowText}>Email Notifications</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#E5E5E7', true: '#4267FF' }}
                thumbColor={emailNotifications ? 'white' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Account */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity style={styles.settingsRow}>
              <View style={styles.settingsRowLeft}>
                <Ionicons name="shield-outline" size={20} color="#666" />
                <Text style={styles.settingsRowText}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </TouchableOpacity>
          </View>

          {/* Support */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            <TouchableOpacity style={styles.settingsRow}>
              <View style={styles.settingsRowLeft}>
                <Ionicons name="help-circle-outline" size={20} color="#666" />
                <Text style={styles.settingsRowText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsRow}>
              <View style={styles.settingsRowLeft}>
                <Ionicons name="document-text-outline" size={20} color="#666" />
                <Text style={styles.settingsRowText}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsRow}>
              <View style={styles.settingsRowLeft}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" />
                <Text style={styles.settingsRowText}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Version 1.0.0</Text>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setSettingsVisible(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {customerData.avatar ? (
              <Image source={{ uri: customerData.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {customerData.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.profileName}>{customerData.name}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.locationText}>{customerData.location}</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{customerData.totalBookings}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{customerData.favoriteStylists}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <TouchableOpacity 
            style={styles.infoRow}
            onPress={() => handleNavigation('PersonalInfo')}
          >
            <View style={styles.infoRowLeft}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.infoRowText}>Personal Information</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoRow}
            onPress={() => handleNavigation('ContactInfo')}
          >
            <View style={styles.infoRowLeft}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.infoRowText}>Contact Information</Text>
            </View>
            <View style={styles.infoRowRight}>
              <Text style={styles.infoRowValue}>{customerData.email}</Text>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoRow}
            onPress={() => handleNavigation('LocationSettings')}
          >
            <View style={styles.infoRowLeft}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.infoRowText}>Location</Text>
            </View>
            <View style={styles.infoRowRight}>
              <Text style={styles.infoRowValue}>{customerData.location}</Text>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Booking History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking History</Text>
          
          <TouchableOpacity 
            style={styles.infoRow}
            onPress={() => navigation.navigate('Bookings' as never)}
          >
            <View style={styles.infoRowLeft}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.infoRowText}>Recent Bookings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoRow}
            onPress={() => handleNavigation('FavoriteStylists')}
          >
            <View style={styles.infoRowLeft}>
              <Ionicons name="heart-outline" size={20} color="#666" />
              <Text style={styles.infoRowText}>Favorite Stylists</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoRow}
            onPress={() => handleNavigation('ReviewsRatings')}
          >
            <View style={styles.infoRowLeft}>
              <Ionicons name="star-outline" size={20} color="#666" />
              <Text style={styles.infoRowText}>Reviews & Ratings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        <View style={styles.memberSinceContainer}>
          <Text style={styles.memberSinceText}>Member since {customerData.memberSince}</Text>
        </View>
      </ScrollView>

      {renderSettingsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222'
  },
  settingsButton: {
    padding: 4
  },
  scrollView: {
    flex: 1
  },
  profileHeader: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4267FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white'
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4267FF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white'
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 14,
    color: '#666'
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E7'
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 16,
    paddingVertical: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 16,
    paddingHorizontal: 20
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  infoRowText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 12
  },
  infoRowRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoRowValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 8
  },
  memberSinceContainer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  memberSinceText: {
    fontSize: 14,
    color: '#666'
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  modalHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222'
  },
  modalContent: {
    flex: 1,
    paddingTop: 16
  },
  settingsSection: {
    backgroundColor: 'white',
    marginBottom: 16,
    paddingVertical: 16
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingsRowText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 12
  },
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  settingsRowValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 8
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 12,
    fontWeight: '500'
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingBottom: 40
  }
});
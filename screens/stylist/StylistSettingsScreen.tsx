import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { useNavigation } from '@react-navigation/native';

export default function StylistSettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    emailNotifications: true,
    distanceUnit: 'miles',
    language: 'English',
    currency: 'USD',
  });

  const handleToggleSetting = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
    
    toast.success(`Setting updated successfully!`);
  };

  const renderSettingToggle = (
    title: string, 
    description: string | null, 
    settingKey: string, 
    icon: keyof typeof Ionicons.glyphMap
  ) => {
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingIconContainer}>
          <Ionicons name={icon} size={22} color="#4267FF" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
        <Switch
          trackColor={{ false: "#E0E0E0", true: "rgba(66, 103, 255, 0.4)" }}
          thumbColor={settings[settingKey as keyof typeof settings] ? "#4267FF" : "#f4f3f4"}
          ios_backgroundColor="#E0E0E0"
          onValueChange={() => handleToggleSetting(settingKey)}
          value={settings[settingKey as keyof typeof settings] as boolean}
        />
      </View>
    );
  };

  const renderSettingOption = (
    title: string, 
    value: string, 
    icon: keyof typeof Ionicons.glyphMap,
    onPress: () => void
  ) => {
    return (
      <TouchableOpacity style={styles.settingItem} onPress={onPress}>
        <View style={styles.settingIconContainer}>
          <Ionicons name={icon} size={22} color="#4267FF" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingValue}>{value}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
      </TouchableOpacity>
    );
  };

  const showLanguageOptions = () => {
    Alert.alert(
      "Select Language",
      "Choose your preferred language",
      [
        { text: "English", onPress: () => {
          setSettings(prev => ({ ...prev, language: 'English' }));
          toast.success('Language updated to English');
        }},
        { text: "Spanish", onPress: () => {
          setSettings(prev => ({ ...prev, language: 'Spanish' }));
          toast.success('Language updated to Spanish');
        }},
        { text: "French", onPress: () => {
          setSettings(prev => ({ ...prev, language: 'French' }));
          toast.success('Language updated to French');
        }},
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const showCurrencyOptions = () => {
    Alert.alert(
      "Select Currency",
      "Choose your preferred currency",
      [
        { text: "USD ($)", onPress: () => {
          setSettings(prev => ({ ...prev, currency: 'USD' }));
          toast.success('Currency updated to USD');
        }},
        { text: "EUR (€)", onPress: () => {
          setSettings(prev => ({ ...prev, currency: 'EUR' }));
          toast.success('Currency updated to EUR');
        }},
        { text: "GBP (£)", onPress: () => {
          setSettings(prev => ({ ...prev, currency: 'GBP' }));
          toast.success('Currency updated to GBP');
        }},
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const showDistanceOptions = () => {
    Alert.alert(
      "Select Distance Unit",
      "Choose your preferred unit of measurement",
      [
        { text: "Miles", onPress: () => {
          setSettings(prev => ({ ...prev, distanceUnit: 'miles' }));
          toast.success('Distance unit updated to miles');
        }},
        { text: "Kilometers", onPress: () => {
          setSettings(prev => ({ ...prev, distanceUnit: 'kilometers' }));
          toast.success('Distance unit updated to kilometers');
        }},
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          {renderSettingToggle(
            "Dark Mode", 
            "Switch between light and dark theme", 
            "darkMode",
            "moon-outline"
          )}
          {renderSettingOption(
            "Language",
            settings.language,
            "language-outline",
            showLanguageOptions
          )}
          {renderSettingOption(
            "Currency",
            settings.currency,
            "cash-outline",
            showCurrencyOptions
          )}
          {renderSettingOption(
            "Distance Unit",
            settings.distanceUnit,
            "navigate-outline",
            showDistanceOptions
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {renderSettingToggle(
            "Push Notifications", 
            "Receive alerts on your device", 
            "notifications",
            "notifications-outline"
          )}
          {renderSettingToggle(
            "Email Notifications", 
            "Receive updates via email", 
            "emailNotifications",
            "mail-outline"
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('StylistProfile' as never)}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="person-outline" size={22} color="#4267FF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>View Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="card-outline" size={22} color="#4267FF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#4267FF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="help-circle-outline" size={22} color="#4267FF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#4267FF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="document-text-outline" size={22} color="#4267FF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="lock-closed-outline" size={22} color="#4267FF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Braidr v1.0.0</Text>
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
    justifyContent: 'space-between',
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
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  settingDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 20,
  },
});
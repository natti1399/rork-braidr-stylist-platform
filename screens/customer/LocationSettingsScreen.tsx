import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { toast } from 'sonner-native';

export default function LocationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  
  const [locationSettings, setLocationSettings] = useState({
    currentLocation: 'New York, NY',
    address: '123 Main Street, New York, NY 10001',
    allowLocationAccess: true,
    searchRadius: '10 miles',
    autoDetectLocation: true
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Location settings updated successfully');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values if needed
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location Settings</Text>
        <TouchableOpacity onPress={isEditing ? handleSave : () => setIsEditing(true)}>
          <Text style={styles.editButton}>{isEditing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Location</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={locationSettings.currentLocation}
              onChangeText={(text) => setLocationSettings({...locationSettings, currentLocation: text})}
              editable={isEditing}
              placeholder="Enter your city"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Address</Text>
            <TextInput
              style={[styles.input, styles.textArea, !isEditing && styles.inputDisabled]}
              value={locationSettings.address}
              onChangeText={(text) => setLocationSettings({...locationSettings, address: text})}
              editable={isEditing}
              placeholder="Enter your full address"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Search Radius</Text>
            <TouchableOpacity style={[styles.input, styles.dateInput, !isEditing && styles.inputDisabled]}>
              <Text style={styles.dateText}>{locationSettings.searchRadius}</Text>
              {isEditing && <Ionicons name="chevron-down" size={20} color="#666" />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Preferences</Text>
          
          <View style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons name="location" size={20} color="#666" />
              <Text style={styles.settingsRowText}>Allow Location Access</Text>
            </View>
            <Switch
              value={locationSettings.allowLocationAccess}
              onValueChange={(value) => setLocationSettings({...locationSettings, allowLocationAccess: value})}
              trackColor={{ false: '#E5E5E7', true: '#4267FF' }}
              thumbColor={locationSettings.allowLocationAccess ? 'white' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons name="navigate" size={20} color="#666" />
              <Text style={styles.settingsRowText}>Auto-Detect Location</Text>
            </View>
            <Switch
              value={locationSettings.autoDetectLocation}
              onValueChange={(value) => setLocationSettings({...locationSettings, autoDetectLocation: value})}
              trackColor={{ false: '#E5E5E7', true: '#4267FF' }}
              thumbColor={locationSettings.autoDetectLocation ? 'white' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#4267FF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Why we need your location</Text>
              <Text style={styles.infoText}>We use your location to show you nearby braiders and provide accurate travel times and distances.</Text>
            </View>
          </View>
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#222'
  },
  editButton: {
    fontSize: 16,
    color: '#4267FF',
    fontWeight: '500'
  },
  scrollView: {
    flex: 1
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 16
  },
  inputGroup: {
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'white'
  },
  inputDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#666'
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateText: {
    fontSize: 16,
    color: '#222'
  },
  textArea: {
    height: 80,
    paddingTop: 12
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 20
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  infoContent: {
    flex: 1,
    marginLeft: 16
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7'
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4267FF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500'
  }
});
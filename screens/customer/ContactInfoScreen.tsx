import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { toast } from 'sonner-native';

export default function ContactInfoScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  
  const [contactInfo, setContactInfo] = useState({
    email: 'test@example.com',
    phone: '+1 (555) 123-4567',
    alternatePhone: '',
    preferredContact: 'Email'
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Contact information updated successfully');
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
        <Text style={styles.headerTitle}>Contact Information</Text>
        <TouchableOpacity onPress={isEditing ? handleSave : () => setIsEditing(true)}>
          <Text style={styles.editButton}>{isEditing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={contactInfo.email}
              onChangeText={(text) => setContactInfo({...contactInfo, email: text})}
              editable={isEditing}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={contactInfo.phone}
              onChangeText={(text) => setContactInfo({...contactInfo, phone: text})}
              editable={isEditing}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Alternate Phone (Optional)</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={contactInfo.alternatePhone}
              onChangeText={(text) => setContactInfo({...contactInfo, alternatePhone: text})}
              editable={isEditing}
              placeholder="Enter alternate phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Preferred Contact Method</Text>
            <TouchableOpacity style={[styles.input, styles.dateInput, !isEditing && styles.inputDisabled]}>
              <Text style={styles.dateText}>{contactInfo.preferredContact}</Text>
              {isEditing && <Ionicons name="chevron-down" size={20} color="#666" />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={24} color="#4267FF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Your information is secure</Text>
              <Text style={styles.infoText}>We use your contact information only to communicate about your bookings and account updates.</Text>
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
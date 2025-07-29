import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { bookingService, type Stylist } from '../src/services/bookingService';

interface RouteParams {
  stylistId: string;
  selectedServices: Array<{
    serviceId: string;
    addOns: string[];
  }>;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookingDateTimeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { stylistId, selectedServices } = route.params as RouteParams;
  
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  useEffect(() => {
    loadStylistData();
    generateAvailableDates();
  }, [stylistId]);

  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadStylistData = async () => {
    try {
      const response = await bookingService.getStylistById(stylistId);
      if (response.success && response.data) {
        setStylist(response.data);
      }
    } catch (error) {
      console.error('Failed to load stylist:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    // Generate next 14 days
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    setAvailableDates(dates);
    
    // Auto-select tomorrow
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  };

  const loadTimeSlots = async (date: string) => {
    setLoadingTimeSlots(true);
    try {
      // Mock time slots - in real app, this would come from API
      const mockTimeSlots: TimeSlot[] = [
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: false },
        { time: '12:00', available: true },
        { time: '13:00', available: true },
        { time: '14:00', available: true },
        { time: '15:00', available: false },
        { time: '16:00', available: true },
        { time: '17:00', available: true },
        { time: '18:00', available: true }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAvailableTimeSlots(mockTimeSlots);
    } catch (error) {
      console.error('Failed to load time slots:', error);
      Alert.alert('Error', 'Failed to load available times');
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Select Date & Time', 'Please select both date and time to continue.');
      return;
    }

    navigation.navigate('BookingConfirmation', {
      stylistId,
      selectedServices,
      selectedDate,
      selectedTime
    });
  };

  const renderDateCard = (date: string) => {
    const isSelected = selectedDate === date;
    
    return (
      <TouchableOpacity
        key={date}
        style={[styles.dateCard, isSelected && styles.selectedDateCard]}
        onPress={() => setSelectedDate(date)}
      >
        <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
          {formatDate(date)}
        </Text>
        <Text style={[styles.dateNumber, isSelected && styles.selectedDateNumber]}>
          {new Date(date).getDate()}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTimeSlot = (slot: TimeSlot) => {
    const isSelected = selectedTime === slot.time;
    const isDisabled = !slot.available;
    
    return (
      <TouchableOpacity
        key={slot.time}
        style={[
          styles.timeSlot,
          isSelected && styles.selectedTimeSlot,
          isDisabled && styles.disabledTimeSlot
        ]}
        onPress={() => slot.available && setSelectedTime(slot.time)}
        disabled={isDisabled}
      >
        <Text style={[
          styles.timeSlotText,
          isSelected && styles.selectedTimeSlotText,
          isDisabled && styles.disabledTimeSlotText
        ]}>
          {formatTime(slot.time)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4267FF" />
        <Text style={styles.loadingText}>Loading availability...</Text>
      </View>
    );
  }

  const displayName = stylist?.businessName || stylist?.bio.split(' ').slice(0, 2).join(' ') || 'Stylist';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Select Date & Time</Text>
          <Text style={styles.headerSubtitle}>{displayName}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Ionicons name="calendar-outline" size={24} color="#4267FF" />
          <View style={styles.instructionsText}>
            <Text style={styles.instructionsTitle}>Choose Your Appointment Time</Text>
            <Text style={styles.instructionsSubtitle}>
              Select your preferred date and available time slot
            </Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.datesScrollView}
            contentContainerStyle={styles.datesContainer}
          >
            {availableDates.map(renderDateCard)}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Times</Text>
          {selectedDate && (
            <Text style={styles.selectedDateDisplay}>
              {formatDate(selectedDate)}, {new Date(selectedDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          )}
          
          {loadingTimeSlots ? (
            <View style={styles.timeSlotsLoading}>
              <ActivityIndicator size="small" color="#4267FF" />
              <Text style={styles.loadingText}>Loading available times...</Text>
            </View>
          ) : (
            <View style={styles.timeSlotsGrid}>
              {availableTimeSlots.map(renderTimeSlot)}
            </View>
          )}
        </View>

        {/* Selected Summary */}
        {selectedDate && selectedTime && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Appointment Summary</Text>
            <View style={styles.summaryRow}>
              <Ionicons name="calendar" size={20} color="#4267FF" />
              <Text style={styles.summaryText}>
                {formatDate(selectedDate)}, {new Date(selectedDate).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="time" size={20} color="#4267FF" />
              <Text style={styles.summaryText}>{formatTime(selectedTime)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="person" size={20} color="#4267FF" />
              <Text style={styles.summaryText}>{displayName}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      {selectedDate && selectedTime && (
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue to Confirmation</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    backgroundColor: '#4267FF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backIcon: {
    padding: 8,
    marginRight: 8
  },
  headerInfo: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white'
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2
  },
  headerSpacer: {
    width: 40
  },
  scrollView: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  instructionsCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  instructionsText: {
    flex: 1,
    marginLeft: 12
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4
  },
  instructionsSubtitle: {
    fontSize: 14,
    color: '#666'
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16
  },
  datesScrollView: {
    marginHorizontal: -20
  },
  datesContainer: {
    paddingHorizontal: 20,
    paddingRight: 40
  },
  dateCard: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  selectedDateCard: {
    backgroundColor: '#4267FF'
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center'
  },
  selectedDateText: {
    color: 'rgba(255, 255, 255, 0.8)'
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222'
  },
  selectedDateNumber: {
    color: 'white'
  },
  selectedDateDisplay: {
    fontSize: 16,
    color: '#4267FF',
    fontWeight: '600',
    marginBottom: 16
  },
  timeSlotsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6
  },
  timeSlot: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 6,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  selectedTimeSlot: {
    backgroundColor: '#4267FF'
  },
  disabledTimeSlot: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222'
  },
  selectedTimeSlotText: {
    color: 'white'
  },
  disabledTimeSlotText: {
    color: '#999'
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  summaryText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 12,
    fontWeight: '500'
  },
  bottomSection: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  continueButton: {
    backgroundColor: '#4267FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Image,
  Calendar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  price?: number;
}

interface TimeSlotSelectionScreenProps {
  route?: {
    params?: {
      stylistId?: string;
      serviceId?: string;
      serviceName?: string;
      serviceDuration?: string;
    };
  };
  navigation?: any;
}

// Sample data
const stylistData = {
  id: '1',
  name: 'Maya Johnson',
  avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f4?auto=format&fit=crop&w=200&q=80',
  responseTime: 'Usually responds within 1 hour',
};

// Generate time slots for the next 7 days
const generateTimeSlots = (): { [key: string]: TimeSlot[] } => {
  const slots = {};
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    
    // Skip Sundays (day 0)
    if (date.getDay() === 0) {
      slots[dateKey] = [];
      continue;
    }
    
    const daySlots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      // Create slots every 2 hours
      if (hour % 2 === 1) {
        const timeString = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
        if (hour === 12) {
          daySlots.push({
            id: `${dateKey}-${hour}`,
            time: '12:00 PM',
            available: Math.random() > 0.3, // 70% availability
          });
        } else {
          daySlots.push({
            id: `${dateKey}-${hour}`,
            time: timeString,
            available: Math.random() > 0.3, // 70% availability
          });
        }
      }
    }
    
    slots[dateKey] = daySlots;
  }
  
  return slots;
};

export default function TimeSlotSelectionScreen({ route, navigation }: TimeSlotSelectionScreenProps) {
  const insets = useSafeAreaInsets();
  
  const stylistId = route?.params?.stylistId || '1';
  const serviceId = route?.params?.serviceId || '1';
  const serviceName = route?.params?.serviceName || 'Medium Box Braids';
  const serviceDuration = route?.params?.serviceDuration || '4-6 hours';
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [timeSlots] = useState(generateTimeSlots());

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === new Date(today.getTime() + 86400000).toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        day: 'numeric' 
      });
    }
  };

  const getAvailableSlots = (dateString: string) => {
    return timeSlots[dateString]?.filter(slot => slot.available) || [];
  };

  const getTotalSlots = (dateString: string) => {
    return timeSlots[dateString]?.length || 0;
  };

  const handleContinue = () => {
    if (!selectedTimeSlot) return;
    
    const [date, time] = selectedTimeSlot.split('-');
    const slot = timeSlots[selectedDate]?.find(s => s.id === selectedTimeSlot);
    
    navigation?.navigate('BookingConfirmation', {
      stylistId,
      serviceId,
      selectedDate,
      selectedTime: slot?.time,
      timeSlotId: selectedTimeSlot,
      serviceName,
      serviceDuration
    });
  };

  const renderDateTab = (dateString: string, index: number) => {
    const isSelected = selectedDate === dateString;
    const availableCount = getAvailableSlots(dateString).length;
    const totalCount = getTotalSlots(dateString);
    const date = new Date(dateString);
    const isToday = date.toDateString() === new Date().toDateString();
    
    return (
      <TouchableOpacity
        key={dateString}
        style={[styles.dateTab, isSelected && styles.selectedDateTab]}
        onPress={() => {
          setSelectedDate(dateString);
          setSelectedTimeSlot(null);
        }}
      >
        <Text style={[styles.dateTabDay, isSelected && styles.selectedDateTabText]}>
          {date.toLocaleDateString('en-US', { weekday: 'short' })}
        </Text>
        <Text style={[styles.dateTabNumber, isSelected && styles.selectedDateTabText]}>
          {date.getDate()}
        </Text>
        <View style={[styles.availabilityDot, availableCount > 0 ? styles.availableDot : styles.unavailableDot]} />
        {isToday && (
          <View style={styles.todayIndicator}>
            <Text style={styles.todayText}>Today</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTimeSlot = (slot: TimeSlot) => {
    const isSelected = selectedTimeSlot === slot.id;
    
    return (
      <TouchableOpacity
        key={slot.id}
        style={[
          styles.timeSlot,
          isSelected && styles.selectedTimeSlot,
          !slot.available && styles.unavailableTimeSlot
        ]}
        onPress={() => slot.available && setSelectedTimeSlot(slot.id)}
        disabled={!slot.available}
      >
        <Text style={[
          styles.timeSlotText,
          isSelected && styles.selectedTimeSlotText,
          !slot.available && styles.unavailableTimeSlotText
        ]}>
          {slot.time}
        </Text>
        {!slot.available && (
          <Text style={styles.bookedLabel}>Booked</Text>
        )}
      </TouchableOpacity>
    );
  };

  const selectedDateSlots = timeSlots[selectedDate] || [];
  const availableSlots = selectedDateSlots.filter(slot => slot.available);

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
          <Text style={styles.headerTitle}>Select Time</Text>
          <Text style={styles.headerSubtitle}>Book with {stylistData.name}</Text>
        </View>
        
        <TouchableOpacity style={styles.calendarButton}>
          <Ionicons name="calendar-outline" size={24} color="#4267FF" />
        </TouchableOpacity>
      </View>

      {/* Stylist Info */}
      <View style={styles.stylistInfo}>
        <Image source={{ uri: stylistData.avatar }} style={styles.stylistAvatar} />
        <View style={styles.stylistDetails}>
          <Text style={styles.stylistName}>{stylistData.name}</Text>
          <Text style={styles.responseTime}>{stylistData.responseTime}</Text>
        </View>
        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#4267FF" />
        </TouchableOpacity>
      </View>

      {/* Service Info */}
      <View style={styles.serviceInfo}>
        <View style={styles.serviceDetails}>
          <Text style={styles.serviceName}>{serviceName}</Text>
          <Text style={styles.serviceDuration}>Duration: {serviceDuration}</Text>
        </View>
        <View style={styles.availabilityInfo}>
          <Ionicons name="time-outline" size={18} color="#34C759" />
          <Text style={styles.availabilityText}>
            {availableSlots.length} slots available
          </Text>
        </View>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.dateTabsContainer}
          contentContainerStyle={styles.dateTabsContent}
        >
          {Object.keys(timeSlots).map(renderDateTab)}
        </ScrollView>
      </View>

      {/* Time Slots */}
      <ScrollView style={styles.timeSlotsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.timeSlotsContent}>
          <View style={styles.timeSlotsHeader}>
            <Text style={styles.sectionTitle}>
              Available Times - {formatDateHeader(selectedDate)}
            </Text>
            {selectedDateSlots.length === 0 ? (
              <Text style={styles.noSlotsText}>Closed on Sundays</Text>
            ) : (
              <Text style={styles.slotsCount}>
                {availableSlots.length} of {selectedDateSlots.length} available
              </Text>
            )}
          </View>

          {selectedDateSlots.length > 0 ? (
            <View style={styles.timeSlotsGrid}>
              {selectedDateSlots.map(renderTimeSlot)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="calendar-outline" size={48} color="#8E8E93" />
              </View>
              <Text style={styles.emptyStateTitle}>No appointments on Sundays</Text>
              <Text style={styles.emptyStateDescription}>
                Please select another day to view available time slots
              </Text>
            </View>
          )}

          {availableSlots.length === 0 && selectedDateSlots.length > 0 && (
            <View style={styles.fullyBookedState}>
              <View style={styles.fullyBookedIcon}>
                <Ionicons name="calendar" size={48} color="#FF3B30" />
              </View>
              <Text style={styles.fullyBookedTitle}>Fully Booked</Text>
              <Text style={styles.fullyBookedDescription}>
                All time slots are taken for this day. Try selecting another date.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      {selectedTimeSlot && (
        <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.selectedSlotInfo}>
            <Text style={styles.selectedSlotLabel}>Selected Time</Text>
            <Text style={styles.selectedSlotValue}>
              {formatDateHeader(selectedDate)} at {timeSlots[selectedDate]?.find(s => s.id === selectedTimeSlot)?.time}
            </Text>
          </View>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
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
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stylistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stylistAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  stylistDetails: {
    flex: 1,
  },
  stylistName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  responseTime: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '500',
  },
  messageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    backgroundColor: 'white',
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceDetails: {
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666',
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 4,
  },
  dateSelector: {
    backgroundColor: 'white',
    marginTop: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  dateTabsContainer: {
    paddingLeft: 20,
  },
  dateTabsContent: {
    paddingRight: 20,
  },
  dateTab: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    minWidth: 60,
    position: 'relative',
  },
  selectedDateTab: {
    backgroundColor: '#4267FF',
  },
  dateTabDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  dateTabNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  selectedDateTabText: {
    color: 'white',
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  availableDot: {
    backgroundColor: '#34C759',
  },
  unavailableDot: {
    backgroundColor: '#FF3B30',
  },
  todayIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  todayText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  timeSlotsContainer: {
    flex: 1,
  },
  timeSlotsContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  timeSlotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  slotsCount: {
    fontSize: 14,
    color: '#666',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 100,
  },
  selectedTimeSlot: {
    backgroundColor: '#4267FF',
    shadowColor: '#4267FF',
    shadowOpacity: 0.3,
  },
  unavailableTimeSlot: {
    backgroundColor: '#f8f9fa',
    opacity: 0.6,
  },
  timeSlotText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  selectedTimeSlotText: {
    color: 'white',
  },
  unavailableTimeSlotText: {
    color: '#8E8E93',
  },
  bookedLabel: {
    fontSize: 11,
    color: '#FF3B30',
    fontWeight: '500',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(142, 142, 147, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  fullyBookedState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  fullyBookedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  fullyBookedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  fullyBookedDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedSlotInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedSlotLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  selectedSlotValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  continueButton: {
    backgroundColor: '#4267FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
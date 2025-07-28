import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  TextInput,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BookingDetailsScreenProps {
  route?: {
    params?: {
      stylistId?: string;
      serviceId?: string;
      addOns?: string[];
      totalPrice?: number;
    };
  };
  navigation?: any;
}

// Sample data
const stylistData = {
  id: '1',
  name: 'Maya Johnson',
  avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f4?auto=format&fit=crop&w=200&q=80',
  location: 'Brooklyn, NY',
  distance: '1.2 km away',
};

const serviceData = {
  '1': {
    name: 'Medium Box Braids',
    description: 'Classic medium-sized box braids, perfect for everyday wear',
    price: 180,
    duration: '4-6 hours',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=300&q=80'
  },
  '2': {
    name: 'Small Box Braids',
    description: 'Detailed small box braids for a more intricate look',
    price: 220,
    duration: '6-8 hours',
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=300&q=80'
  },
  '3': {
    name: 'Knotless Braids',
    description: 'Gentle knotless braids that reduce tension on your scalp',
    price: 250,
    duration: '5-7 hours',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=300&q=80'
  }
};

const addOnsData = {
  '1': { name: 'Hair Extensions', price: 25 },
  '2': { name: 'Scalp Treatment', price: 15 },
  '3': { name: 'Hair Accessories', price: 20 },
};

// Available time slots
const timeSlots = [
  { id: '1', date: '2024-02-01', time: '09:00 AM', available: true },
  { id: '2', date: '2024-02-01', time: '02:00 PM', available: false },
  { id: '3', date: '2024-02-02', time: '10:00 AM', available: true },
  { id: '4', date: '2024-02-02', time: '03:00 PM', available: true },
  { id: '5', date: '2024-02-03', time: '11:00 AM', available: true },
  { id: '6', date: '2024-02-03', time: '01:00 PM', available: false },
];

export default function BookingDetailsScreen({ route, navigation }: BookingDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  
  const stylistId = route?.params?.stylistId || '1';
  const serviceId = route?.params?.serviceId || '1';
  const selectedAddOns = route?.params?.addOns || [];
  const basePrice = route?.params?.totalPrice || serviceData[serviceId]?.price || 180;
  
  const service = serviceData[serviceId];
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const getAddOnTotal = () => {
    return selectedAddOns.reduce((total, addOnId) => {
      return total + (addOnsData[addOnId]?.price || 0);
    }, 0);
  };

  const getTotalPrice = () => {
    return service.price + getAddOnTotal();
  };

  const formatDate = (dateString: string) => {
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
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const groupSlotsByDate = () => {
    const grouped = {};
    timeSlots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  const handleBooking = () => {
    if (!selectedTimeSlot) {
      Alert.alert('Time Required', 'Please select a time slot for your appointment.');
      return;
    }
    
    if (!location.trim()) {
      Alert.alert('Location Required', 'Please enter your location for the appointment.');
      return;
    }

    if (!contactNumber.trim()) {
      Alert.alert('Contact Required', 'Please enter your contact number.');
      return;
    }

    // Navigate to confirmation screen
    navigation?.navigate('BookingConfirmation', {
      stylistId,
      serviceId,
      timeSlotId: selectedTimeSlot,
      location: location.trim(),
      specialRequests: specialRequests.trim(),
      contactNumber: contactNumber.trim(),
      addOns: selectedAddOns,
      totalPrice: getTotalPrice()
    });
  };

  const renderTimeSlot = (slot) => {
    const isSelected = selectedTimeSlot === slot.id;
    const isAvailable = slot.available;
    
    return (
      <TouchableOpacity
        key={slot.id}
        style={[
          styles.timeSlot,
          isSelected && styles.selectedTimeSlot,
          !isAvailable && styles.unavailableTimeSlot
        ]}
        onPress={() => isAvailable && setSelectedTimeSlot(slot.id)}
        disabled={!isAvailable}
      >
        <Text style={[
          styles.timeSlotText,
          isSelected && styles.selectedTimeSlotText,
          !isAvailable && styles.unavailableTimeSlotText
        ]}>
          {slot.time}
        </Text>
        {!isAvailable && (
          <Text style={styles.unavailableLabel}>Booked</Text>
        )}
      </TouchableOpacity>
    );
  };

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
        
        <Text style={styles.headerTitle}>Booking Details</Text>
        
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color="#4267FF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stylist Info */}
        <View style={styles.stylistSection}>
          <Image source={{ uri: stylistData.avatar }} style={styles.stylistAvatar} />
          <View style={styles.stylistInfo}>
            <Text style={styles.stylistName}>{stylistData.name}</Text>
            <View style={styles.locationInfo}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.locationText}>{stylistData.location} • {stylistData.distance}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.messageButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#4267FF" />
          </TouchableOpacity>
        </View>

        {/* Service Summary */}
        <View style={styles.serviceSection}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.serviceCard}>
            <Image source={{ uri: service.image }} style={styles.serviceImage} />
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <View style={styles.serviceMeta}>
                <Text style={styles.servicePrice}>${service.price}</Text>
                <Text style={styles.serviceDuration}>• {service.duration}</Text>
              </View>
            </View>
          </View>

          {/* Add-ons */}
          {selectedAddOns.length > 0 && (
            <View style={styles.addOnsContainer}>
              <Text style={styles.addOnsTitle}>Selected Add-ons</Text>
              {selectedAddOns.map(addOnId => {
                const addOn = addOnsData[addOnId];
                return (
                  <View key={addOnId} style={styles.addOnItem}>
                    <Text style={styles.addOnName}>{addOn.name}</Text>
                    <Text style={styles.addOnPrice}>+${addOn.price}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Time Selection */}
        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>Select Date & Time</Text>
          {Object.entries(groupSlotsByDate()).map(([date, slots]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateLabel}>{formatDate(date)}</Text>
              <View style={styles.timeSlotsContainer}>
                {slots.map(renderTimeSlot)}
              </View>
            </View>
          ))}
        </View>

        {/* Location Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Appointment Location</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your address"
            placeholderTextColor="#8E8E93"
            value={location}
            onChangeText={setLocation}
            multiline
          />
          <Text style={styles.inputHelper}>The stylist will come to this location</Text>
        </View>

        {/* Contact Number */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Contact Number</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your phone number"
            placeholderTextColor="#8E8E93"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
          />
        </View>

        {/* Special Requests */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="Any special requests or preferences?"
            placeholderTextColor="#8E8E93"
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Pricing Summary */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Pricing Summary</Text>
          <View style={styles.pricingItem}>
            <Text style={styles.pricingLabel}>{service.name}</Text>
            <Text style={styles.pricingValue}>${service.price}</Text>
          </View>
          {selectedAddOns.map(addOnId => {
            const addOn = addOnsData[addOnId];
            return (
              <View key={addOnId} style={styles.pricingItem}>
                <Text style={styles.pricingLabel}>{addOn.name}</Text>
                <Text style={styles.pricingValue}>+${addOn.price}</Text>
              </View>
            );
          })}
          <View style={styles.pricingDivider} />
          <View style={styles.pricingItem}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${getTotalPrice()}</Text>
          </View>
          <Text style={styles.paymentNote}>Payment will be made directly to the stylist</Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.totalContainer}>
          <Text style={styles.bottomTotalLabel}>Total: ${getTotalPrice()}</Text>
          <Text style={styles.paymentMethod}>Pay in person</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>Confirm Booking</Text>
          <Ionicons name="checkmark" size={20} color="white" />
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  stylistSection: {
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
  stylistInfo: {
    flex: 1,
  },
  stylistName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  messageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
  },
  serviceImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  serviceInfo: {
    flex: 1,
    padding: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4267FF',
  },
  serviceDuration: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  addOnsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  addOnsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  addOnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  addOnName: {
    fontSize: 15,
    color: '#444',
  },
  addOnPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4267FF',
  },
  timeSection: {
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
  dateGroup: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#4267FF',
  },
  unavailableTimeSlot: {
    backgroundColor: '#f8f9fa',
    opacity: 0.6,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  selectedTimeSlotText: {
    color: 'white',
  },
  unavailableTimeSlotText: {
    color: '#8E8E93',
  },
  unavailableLabel: {
    fontSize: 11,
    color: '#FF3B30',
    marginTop: 2,
  },
  inputSection: {
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
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputHelper: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
  },
  pricingSection: {
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
  pricingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pricingLabel: {
    fontSize: 15,
    color: '#444',
  },
  pricingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  pricingDivider: {
    height: 1,
    backgroundColor: '#f1f3f4',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4267FF',
  },
  paymentNote: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 100,
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
  totalContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bottomTotalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  paymentMethod: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: '#4267FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
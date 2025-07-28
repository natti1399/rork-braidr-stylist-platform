import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  Alert,
  Linking,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BookingConfirmationScreenProps {
  route?: {
    params?: {
      stylistId?: string;
      serviceId?: string;
      timeSlotId?: string;
      selectedDate?: string;
      selectedTime?: string;
      location?: string;
      specialRequests?: string;
      contactNumber?: string;
      addOns?: string[];
      totalPrice?: number;
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
  phone: '+1 (555) 123-4567',
  location: 'Brooklyn, NY',
  rating: 4.9,
  reviews: 127,
};

const serviceData = {
  '1': {
    name: 'Medium Box Braids',
    description: 'Classic medium-sized box braids, perfect for everyday wear',
    price: 180,
    duration: '4-6 hours',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=300&q=80'
  }
};

const addOnsData = {
  '1': { name: 'Hair Extensions', price: 25 },
  '2': { name: 'Scalp Treatment', price: 15 },
  '3': { name: 'Hair Accessories', price: 20 },
};

export default function BookingConfirmationScreen({ route, navigation }: BookingConfirmationScreenProps) {
  const insets = useSafeAreaInsets();
  
  const {
    stylistId = '1',
    serviceId = '1',
    selectedDate = '2024-02-01',
    selectedTime = '10:00 AM',
    location = '',
    specialRequests = '',
    contactNumber = '',
    addOns = [],
    totalPrice = 180,
    serviceName = 'Medium Box Braids',
    serviceDuration = '4-6 hours'
  } = route?.params || {};

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const service = serviceData[serviceId];
  const bookingId = `BRD${Date.now().toString().slice(-6)}`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleConfirmBooking = () => {
    Alert.alert(
      'Confirm Booking',
      'Are you sure you want to book this appointment? This will notify the stylist and reserve your time slot.',
      [
        { text: 'Back', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            setBookingConfirmed(true);
            // Here you would normally make an API call to confirm the booking
          }
        }
      ]
    );
  };

  const handleCallStylist = () => {
    Linking.openURL(`tel:${stylistData.phone}`);
  };

  const handleMessageStylist = () => {
    navigation?.navigate('Chat', { 
      conversationId: stylistId,
      stylistName: stylistData.name,
      stylistAvatar: stylistData.avatar
    });
  };

  const handleShareBooking = () => {
    Share.share({
      message: `I've booked a ${serviceName} appointment with ${stylistData.name} on ${formatDate(selectedDate)} at ${selectedTime}. Booking ID: ${bookingId}`,
      title: 'Braidr Booking Confirmation'
    });
  };

  const handleAddToCalendar = () => {
    Alert.alert(
      'Add to Calendar',
      'This feature will be available soon. For now, please save the appointment details manually.',
      [{ text: 'OK' }]
    );
  };

  const renderConfirmedState = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Success Animation Placeholder */}
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color="#34C759" />
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your appointment has been successfully booked
        </Text>
        <View style={styles.bookingIdContainer}>
          <Text style={styles.bookingIdLabel}>Booking ID</Text>
          <Text style={styles.bookingId}>{bookingId}</Text>
        </View>
      </View>

      {/* Appointment Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Appointment Details</Text>
        
        <View style={styles.appointmentInfo}>
          <View style={styles.appointmentItem}>
            <Ionicons name="calendar" size={20} color="#4267FF" />
            <View style={styles.appointmentText}>
              <Text style={styles.appointmentLabel}>Date & Time</Text>
              <Text style={styles.appointmentValue}>
                {formatDate(selectedDate)} at {selectedTime}
              </Text>
            </View>
          </View>

          <View style={styles.appointmentItem}>
            <Ionicons name="location" size={20} color="#4267FF" />
            <View style={styles.appointmentText}>
              <Text style={styles.appointmentLabel}>Location</Text>
              <Text style={styles.appointmentValue}>{location}</Text>
            </View>
          </View>

          <View style={styles.appointmentItem}>
            <Ionicons name="time" size={20} color="#4267FF" />
            <View style={styles.appointmentText}>
              <Text style={styles.appointmentLabel}>Duration</Text>
              <Text style={styles.appointmentValue}>{serviceDuration}</Text>
            </View>
          </View>

          <View style={styles.appointmentItem}>
            <Ionicons name="card" size={20} color="#4267FF" />
            <View style={styles.appointmentText}>
              <Text style={styles.appointmentLabel}>Total Cost</Text>
              <Text style={styles.appointmentValue}>${totalPrice} (Pay in person)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stylist Info */}
      <View style={styles.stylistCard}>
        <Text style={styles.cardTitle}>Your Stylist</Text>
        <View style={styles.stylistInfo}>
          <Image source={{ uri: stylistData.avatar }} style={styles.stylistAvatar} />
          <View style={styles.stylistDetails}>
            <Text style={styles.stylistName}>{stylistData.name}</Text>
            <View style={styles.stylistRating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{stylistData.rating} ({stylistData.reviews} reviews)</Text>
            </View>
            <Text style={styles.stylistLocation}>{stylistData.location}</Text>
          </View>
        </View>
      </View>

      {/* Next Steps */}
      <View style={styles.nextStepsCard}>
        <Text style={styles.cardTitle}>What's Next?</Text>
        <View style={styles.stepsList}>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Your stylist will receive a notification about your booking
            </Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              You'll receive a confirmation message within 24 hours
            </Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Prepare your hair and arrive on time for your appointment
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleAddToCalendar}>
          <Ionicons name="calendar-outline" size={20} color="#4267FF" />
          <Text style={styles.actionButtonText}>Add to Calendar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleShareBooking}>
          <Ionicons name="share-outline" size={20} color="#4267FF" />
          <Text style={styles.actionButtonText}>Share Booking</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  const renderPendingState = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Booking Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Booking Summary</Text>
        
        {/* Stylist Info */}
        <View style={styles.stylistSummary}>
          <Image source={{ uri: stylistData.avatar }} style={styles.stylistAvatar} />
          <View style={styles.stylistDetails}>
            <Text style={styles.stylistName}>{stylistData.name}</Text>
            <View style={styles.stylistRating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{stylistData.rating} ({stylistData.reviews} reviews)</Text>
            </View>
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.serviceDetails}>
          <Image source={{ uri: service.image }} style={styles.serviceImage} />
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{serviceName}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
            <Text style={styles.serviceDuration}>Duration: {serviceDuration}</Text>
          </View>
        </View>
      </View>

      {/* Appointment Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Appointment Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date & Time</Text>
          <Text style={styles.detailValue}>
            {formatDate(selectedDate)} at {selectedTime}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue}>{location}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Contact</Text>
          <Text style={styles.detailValue}>{contactNumber}</Text>
        </View>

        {specialRequests && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Special Requests</Text>
            <Text style={styles.detailValue}>{specialRequests}</Text>
          </View>
        )}
      </View>

      {/* Pricing Breakdown */}
      <View style={styles.pricingCard}>
        <Text style={styles.cardTitle}>Pricing Breakdown</Text>
        
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>{serviceName}</Text>
          <Text style={styles.pricingValue}>${service.price}</Text>
        </View>

        {addOns.map(addOnId => {
          const addOn = addOnsData[addOnId];
          return (
            <View key={addOnId} style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>{addOn.name}</Text>
              <Text style={styles.pricingValue}>+${addOn.price}</Text>
            </View>
          );
        })}

        <View style={styles.pricingDivider} />
        <View style={styles.pricingRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${totalPrice}</Text>
        </View>
        <Text style={styles.paymentNote}>Payment will be made directly to the stylist</Text>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  if (bookingConfirmed) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.navigate('CustomerHome')}
          >
            <Ionicons name="close" size={24} color="#4267FF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Booking Confirmed</Text>
          
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={24} color="#4267FF" />
          </TouchableOpacity>
        </View>

        {renderConfirmedState()}

        {/* Bottom Actions */}
        <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity style={styles.callButton} onPress={handleCallStylist}>
            <Ionicons name="call" size={20} color="#34C759" />
            <Text style={styles.callButtonText}>Call Stylist</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.messageButton} onPress={handleMessageStylist}>
            <Ionicons name="chatbubble" size={20} color="white" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
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
        
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color="#4267FF" />
        </TouchableOpacity>
      </View>

      {renderPendingState()}

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.finalTotal}>
          <Text style={styles.finalTotalLabel}>Total: ${totalPrice}</Text>
          <Text style={styles.paymentMethod}>Pay in person</Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
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
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#222',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  bookingIdContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookingIdLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4267FF',
    letterSpacing: 1,
  },
  summaryCard: {
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
  detailsCard: {
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
  stylistCard: {
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
  nextStepsCard: {
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
  pricingCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  stylistSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stylistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  stylistRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  stylistLocation: {
    fontSize: 14,
    color: '#666',
  },
  serviceDetails: {
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
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#4267FF',
    fontWeight: '600',
  },
  appointmentInfo: {
    gap: 16,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  appointmentText: {
    flex: 1,
    marginLeft: 12,
  },
  appointmentLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  appointmentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    flex: 2,
    textAlign: 'right',
  },
  pricingRow: {
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
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4267FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4267FF',
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
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
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
    gap: 12,
  },
  finalTotal: {
    alignItems: 'center',
    marginBottom: 16,
  },
  finalTotalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  paymentMethod: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  confirmButton: {
    backgroundColor: '#4267FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  callButtonText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4267FF',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  messageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
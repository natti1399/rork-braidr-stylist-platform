import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { bookingService, type Stylist, type Service } from '../../src/services/bookingService';
import * as Sharing from 'expo-sharing';

interface RouteParams {
  stylistId: string;
  selectedServices: Array<{
    serviceId: string;
    addOns: string[];
  }>;
  selectedDate: string;
  selectedTime: string;
}

export default function BookingConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { stylistId, selectedServices, selectedDate, selectedTime } = route.params as RouteParams;
  
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  
  const bookingId = `BRD${Date.now().toString().slice(-6)}`;

  useEffect(() => {
    loadData();
  }, [stylistId, selectedServices]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load stylist details
      const stylistResponse = await bookingService.getStylistDetails(stylistId);
      if (stylistResponse.success && stylistResponse.data) {
        setStylist(stylistResponse.data);
      }

      // Load selected services details
      const allServices = await bookingService.getStylistServices(stylistId);
      if (allServices.success && allServices.data) {
        const selectedServiceDetails = allServices.data.filter((service: Service) => 
          selectedServices.some(selected => selected.serviceId === service.id)
        );
        setServices(selectedServiceDetails);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    services.forEach(service => {
      const selectedService = selectedServices.find(s => s.serviceId === service.id);
      total += service.price;
      if (selectedService?.addOns) {
        total += selectedService.addOns.length * 10; // $10 per add-on
      }
    });
    return total;
  };

  const calculateDuration = () => {
    return services.reduce((total, service) => {
      return total + (service.durationMinutes || 60);
    }, 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleConfirmBooking = async () => {
    Alert.alert(
      'Confirm Booking',
      'Are you sure you want to book this appointment? This will notify the stylist and reserve your time slot.',
      [
        { text: 'Back', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            try {
              setConfirming(true);
              
              const bookingRequest = {
                stylistId,
                serviceId: selectedServices[0]?.serviceId || '',
                appointmentDate: selectedDate,
                startTime: selectedTime,
                location: {
                  address: stylist?.location?.address || '',
                  city: stylist?.location?.city || '',
                  state: stylist?.location?.state || '',
                  zipCode: stylist?.location?.zipCode || ''
                },
                contactNumber: '',
                addOns: selectedServices.flatMap(s => s.addOns || []),
                specialRequests: ''
              };
              
              const response = await bookingService.createBooking(bookingRequest);
              
              if (response.success) {
                setBookingConfirmed(true);
              } else {
                Alert.alert('Booking Failed', response.error || 'Unable to create booking. Please try again.');
              }
            } catch (error) {
              console.error('Booking error:', error);
              Alert.alert('Error', 'Failed to create booking. Please try again.');
            } finally {
              setConfirming(false);
            }
          }
        }
      ]
    );
  };

  const handleCallStylist = () => {
    // Phone number would come from user profile, not stylist profile
    Alert.alert('Contact Info', 'Phone number not available');
  };

  const handleMessageStylist = () => {
    Alert.alert('Message Stylist', 'Messaging feature will be available soon.');
  };

  const handleShareBooking = async () => {
    try {
      const displayName = stylist?.businessName || stylist?.bio.split(' ').slice(0, 2).join(' ') || 'Stylist';
      const serviceNames = services.map(s => s.name).join(', ');
      const message = `I've booked ${serviceNames} with ${displayName} on ${formatDate(selectedDate)} at ${selectedTime}. Booking ID: ${bookingId}`;
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync('data:text/plain;base64,' + btoa(message));
      } else {
        Alert.alert('Share', message);
      }
    } catch (error) {
      Alert.alert('Share', 'Unable to share booking details.');
    }
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
              <Text style={styles.appointmentValue}>{stylist?.location?.address || 'Location TBD'}</Text>
            </View>
          </View>

          <View style={styles.appointmentItem}>
            <Ionicons name="time" size={20} color="#4267FF" />
            <View style={styles.appointmentText}>
              <Text style={styles.appointmentLabel}>Duration</Text>
              <Text style={styles.appointmentValue}>{bookingService.formatDuration(calculateDuration())}</Text>
            </View>
          </View>

          <View style={styles.appointmentItem}>
            <Ionicons name="card" size={20} color="#4267FF" />
            <View style={styles.appointmentText}>
              <Text style={styles.appointmentLabel}>Total Cost</Text>
              <Text style={styles.appointmentValue}>${calculateTotal()} (Pay in person)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stylist Info */}
      <View style={styles.stylistCard}>
        <Text style={styles.cardTitle}>Your Stylist</Text>
        <View style={styles.stylistInfo}>
          {stylist?.portfolio?.[0] ? (
            <Image source={{ uri: stylist.portfolio[0] }} style={styles.stylistAvatar} />
          ) : (
            <View style={[styles.stylistAvatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {(stylist?.businessName || stylist?.bio || 'S').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.stylistDetails}>
            <Text style={styles.stylistName}>
              {stylist?.businessName || stylist?.bio.split(' ').slice(0, 2).join(' ') || 'Stylist'}
            </Text>
            <View style={styles.stylistRating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{stylist?.rating || 5.0} ({stylist?.reviewCount || 0} reviews)</Text>
            </View>
            <Text style={styles.stylistLocation}>{stylist?.location?.address || 'Location not specified'}</Text>
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
          {stylist?.portfolio?.[0] ? (
            <Image source={{ uri: stylist.portfolio[0] }} style={styles.stylistAvatar} />
          ) : (
            <View style={[styles.stylistAvatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {(stylist?.businessName || stylist?.bio || 'S').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.stylistDetails}>
            <Text style={styles.stylistName}>
              {stylist?.businessName || stylist?.bio.split(' ').slice(0, 2).join(' ') || 'Stylist'}
            </Text>
            <View style={styles.stylistRating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{stylist?.rating || 5.0} ({stylist?.reviewCount || 0} reviews)</Text>
            </View>
          </View>
        </View>

        {/* Services Details */}
        <View style={styles.servicesContainer}>
          {services.map((service, index) => {
            const selectedService = selectedServices.find(s => s.serviceId === service.id);
            return (
              <View key={service.id} style={[styles.serviceDetails, index > 0 && { marginTop: 12 }]}>
                <View style={styles.serviceImageContainer}>
                  <Ionicons name="cut-outline" size={24} color="#4267FF" />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                  <Text style={styles.serviceDuration}>Duration: {service.duration}</Text>
                  {selectedService?.addOns && selectedService.addOns.length > 0 && (
                    <Text style={styles.addOnsText}>
                      Add-ons: {selectedService.addOns.join(', ')}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
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
          <Text style={styles.detailValue}>{stylist?.location?.address || 'To be confirmed'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>
            {Math.floor(calculateDuration() / 60)}h {calculateDuration() % 60}m
          </Text>
        </View>
      </View>

      {/* Pricing Breakdown */}
      <View style={styles.pricingCard}>
        <Text style={styles.cardTitle}>Pricing Breakdown</Text>
        
        {services.map(service => {
          const selectedService = selectedServices.find(s => s.serviceId === service.id);
          return (
            <View key={service.id}>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>{service.name}</Text>
                <Text style={styles.pricingValue}>${service.price}</Text>
              </View>
              {selectedService?.addOns?.map((addOn, index) => (
                <View key={index} style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>  + {addOn}</Text>
                  <Text style={styles.pricingValue}>+$10</Text>
                </View>
              ))}
            </View>
          );
        })}

        <View style={styles.pricingDivider} />
        <View style={styles.pricingRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${calculateTotal()}</Text>
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
            onPress={() => navigation?.goBack()}
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
          <Text style={styles.finalTotalLabel}>Total: ${calculateTotal()}</Text>
          <Text style={styles.paymentMethod}>Pay in person</Text>
        </View>
        <TouchableOpacity 
          style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]} 
          onPress={handleConfirmBooking}
          disabled={confirming}
        >
          {confirming ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              <Ionicons name="checkmark" size={20} color="white" />
            </>
          )}
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
  servicesContainer: {
    gap: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
  },
  serviceImageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
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
  addOnsText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  avatarPlaceholder: {
    backgroundColor: '#4267FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
  confirmButtonDisabled: {
    opacity: 0.7,
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
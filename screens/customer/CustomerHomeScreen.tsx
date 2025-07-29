import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { bookingService, type Appointment, type Stylist } from '../../src/services/bookingService';
import { locationService } from '../../src/services/locationService';

// Removed mock data - using real API data

export default function CustomerHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [greeting, setGreeting] = useState('Good morning');
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
  const [nearbyStylists, setNearbyStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadHomeData();
    }, [])
  );

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Get user location
      const location = await locationService.getCurrentLocation();
      if (location) {
        setUserLocation(location.coordinates);
      }

      // Load upcoming appointments
      const appointmentsResponse = await bookingService.getMyBookings();
      if (appointmentsResponse.success && appointmentsResponse.data) {
        const upcoming = appointmentsResponse.data
          .filter(apt => apt.status === 'confirmed' && new Date(apt.appointmentDate) >= new Date())
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())[0];
        setUpcomingAppointment(upcoming || null);
      }

      // Load nearby stylists
      const stylistsResponse = await bookingService.searchStylists({
        ...(location && {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
          radius: 10
        }),
        sortBy: 'distance',
        limit: 3
      });
      
      if (stylistsResponse.success && stylistsResponse.data) {
        setNearbyStylists(stylistsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindBraiders = () => {
    navigation.navigate('CustomerSearch');
  };

  const handleMyBookings = () => {
    navigation.navigate('CustomerBookings');
  };

  const handleStylistPress = (stylist: Stylist) => {
    navigation.navigate('StylistDetail', { stylistId: stylist.id });
  };

  const handleBookNow = (stylist: Stylist) => {
    navigation.navigate('ServiceSelection', { stylistId: stylist.id });
  };

  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  const renderStylistCard = (stylist: Stylist) => {
    const displayName = stylist.businessName || stylist.bio.split(' ').slice(0, 2).join(' ');
    const avatarImage = stylist.portfolio && stylist.portfolio.length > 0 ? stylist.portfolio[0] : null;
    
    return (
      <TouchableOpacity key={stylist.id} style={styles.stylistCard} onPress={() => handleStylistPress(stylist)}>
        {avatarImage ? (
          <Image source={{ uri: avatarImage }} style={styles.stylistAvatar} />
        ) : (
          <View style={[styles.stylistAvatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{displayName.split(' ').map(n => n[0]).join('')}</Text>
          </View>
        )}
        <View style={styles.stylistInfo}>
          <Text style={styles.stylistName} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.stylistSpecialties} numberOfLines={1}>
            {stylist.specialties.slice(0, 2).join(', ')}
          </Text>
          <View style={styles.stylistMeta}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFC90A" />
              <Text style={styles.ratingText}>{stylist.rating.toFixed(1)} ({stylist.reviewCount})</Text>
            </View>
            <Text style={styles.distanceText}>{stylist.distance || 'N/A'}</Text>
          </View>
          {stylist.isAvailable && (
            <View style={styles.availabilityContainer}>
              <View style={styles.availabilityDot} />
              <Text style={styles.availabilityText}>Available for booking</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.quickBookButton} onPress={() => handleBookNow(stylist)}>
          <Text style={styles.quickBookText}>Book</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.headerContent}>
          <View style={styles.profileInitial}>
            <Text style={styles.initialText}>TC</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Hi, Test! 👋</Text>
            <Text style={styles.subtitle}>Find your perfect braiding artist</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleFindBraiders}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="people-outline" size={24} color="#4267FF" />
            </View>
            <Text style={styles.actionText}>Find Braiders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleMyBookings}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="calendar-outline" size={24} color="#4267FF" />
            </View>
            <Text style={styles.actionText}>My Bookings</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointment */}
        {loading ? (
          <View style={styles.appointmentCard}>
            <ActivityIndicator size="small" color="#4267FF" />
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        ) : upcomingAppointment ? (
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <Ionicons name="calendar" size={20} color="#4267FF" />
              <Text style={styles.appointmentTitle}>Upcoming Appointment</Text>
            </View>
            <Text style={styles.appointmentService}>Service Booking</Text>
            <Text style={styles.appointmentDetails}>
              {formatAppointmentDate(upcomingAppointment.appointmentDate)} at {upcomingAppointment.startTime} • {upcomingAppointment.location || 'Location TBD'}
            </Text>
            
            <View style={styles.appointmentActions}>
              <TouchableOpacity style={styles.rescheduleButton}>
                <Text style={styles.rescheduleText}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.viewDetailsButton} onPress={handleMyBookings}>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={[styles.appointmentTitle, { color: '#666' }]}>No Upcoming Appointments</Text>
            </View>
            <Text style={styles.appointmentDetails}>Book your first braiding session today!</Text>
            
            <TouchableOpacity style={styles.viewDetailsButton} onPress={handleFindBraiders}>
              <Text style={styles.viewDetailsText}>Find Braiders</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Nearby Braiders */}
        <View style={styles.nearbySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Braiders</Text>
            <TouchableOpacity onPress={handleFindBraiders}>
              <Text style={styles.viewAllText}>View all →</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.stylistsList}>
            {loading ? (
              <ActivityIndicator size="large" color="#4267FF" style={{ marginTop: 20 }} />
            ) : nearbyStylists.length > 0 ? (
              nearbyStylists.map(renderStylistCard)
            ) : (
              <Text style={styles.noDataText}>No nearby braiders found</Text>
            )}
          </View>
        </View>
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
    backgroundColor: '#4267FF',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileInitial: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  initialText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  headerText: {
    flex: 1
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)'
  },
  scrollView: {
    flex: 1
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center'
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4267FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginLeft: 8
  },
  appointmentService: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4
  },
  appointmentDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 12
  },
  rescheduleButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  rescheduleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: '#4267FF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white'
  },
  nearbySection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222'
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4267FF'
  },
  stylistsList: {
    gap: 16
  },
  stylistCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  stylistAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12
  },
  stylistInfo: {
    flex: 1
  },
  stylistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4
  },
  stylistSpecialties: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  stylistMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    fontSize: 13,
    color: '#222',
    marginLeft: 4
  },
  distanceText: {
    fontSize: 13,
    color: '#666'
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 6
  },
  availabilityText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500'
  },
  avatarPlaceholder: {
    backgroundColor: '#4267FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  quickBookButton: {
    backgroundColor: '#4267FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start'
  },
  quickBookText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20
  }
});
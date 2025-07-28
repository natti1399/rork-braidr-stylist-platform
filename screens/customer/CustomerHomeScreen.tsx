import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface Stylist {
  id: string;
  name: string;
  specialties: string;
  rating: number;
  reviews: number;
  distance: string;
  avatar?: string;
  availableNext?: string;
}

const mockStylists: Stylist[] = [
  {
    id: '1',
    name: 'Aisha Thompson',
    specialties: 'Knotless & Goddess Braids',
    rating: 5.0,
    reviews: 89,
    distance: '0.8 km',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=50',
    availableNext: 'Available Tomorrow 10:00 AM'
  },
  {
    id: '2',
    name: 'Maya Johnson',
    specialties: 'Box Braids & Cornrows',
    rating: 4.9,
    reviews: 124,
    distance: '1.2 km',
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f4?auto=format&fit=crop&w=200&q=50',
    availableNext: 'Available Today 3:00 PM'
  },
  {
    id: '3',
    name: 'Zara Williams',
    specialties: 'Twist Braids & Locs',
    rating: 4.8,
    reviews: 67,
    distance: '2.1 km',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=50',
    availableNext: 'Available Friday 11:00 AM'
  }
];

export default function CustomerHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const renderStylistCard = (stylist: Stylist) => (
    <TouchableOpacity key={stylist.id} style={styles.stylistCard}>
      <Image source={{ uri: stylist.avatar }} style={styles.stylistAvatar} />
      <View style={styles.stylistInfo}>
        <Text style={styles.stylistName}>{stylist.name}</Text>
        <Text style={styles.stylistSpecialties}>{stylist.specialties}</Text>
        <View style={styles.stylistMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFC90A" />
            <Text style={styles.ratingText}>{stylist.rating} ({stylist.reviews})</Text>
          </View>
          <Text style={styles.distanceText}>{stylist.distance}</Text>
        </View>
        {stylist.availableNext && (
          <View style={styles.availabilityContainer}>
            <View style={styles.availabilityDot} />
            <Text style={styles.availabilityText}>{stylist.availableNext}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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
            onPress={() => navigation.navigate('Search')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="people-outline" size={24} color="#4267FF" />
            </View>
            <Text style={styles.actionText}>Find Braiders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Bookings')}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="calendar-outline" size={24} color="#4267FF" />
            </View>
            <Text style={styles.actionText}>My Bookings</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointment */}
        <View style={styles.appointmentCard}>
          <View style={styles.appointmentHeader}>
            <Ionicons name="calendar" size={20} color="#4267FF" />
            <Text style={styles.appointmentTitle}>Upcoming Appointment</Text>
          </View>
          <Text style={styles.appointmentService}>Box Braids with Maya Johnson</Text>
          <Text style={styles.appointmentDetails}>Tomorrow at 2:00 PM • Studio Downtown</Text>
          
          <View style={styles.appointmentActions}>
            <TouchableOpacity style={styles.rescheduleButton}>
              <Text style={styles.rescheduleText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nearby Braiders */}
        <View style={styles.nearbySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Braiders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.viewAllText}>View all →</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.stylistsList}>
            {mockStylists.map(renderStylistCard)}
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
  }
});
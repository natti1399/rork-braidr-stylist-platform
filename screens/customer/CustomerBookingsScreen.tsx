import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface Booking {
  id: string;
  stylistName: string;
  service: string;
  rating: number;
  date: string;
  time: string;
  duration: string;
  location: string;
  price: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  avatar: string;
}

const mockUpcomingBookings: Booking[] = [
  {
    id: '1',
    stylistName: 'Maya Johnson',
    service: 'Box Braids',
    rating: 4.9,
    date: 'Wednesday, May 15',
    time: '14:00',
    duration: '3 hours',
    location: "Stylist's Home",
    price: '1200 kr',
    status: 'confirmed',
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f4?auto=format&fit=crop&w=200&q=50'
  },
  {
    id: '2',
    stylistName: 'Aisha Thompson',
    service: 'Knotless Braids',
    rating: 5.0,
    date: 'Monday, May 20',
    time: '10:00',
    duration: '4 hours',
    location: 'Mobile service',
    price: '1500 kr',
    status: 'confirmed',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=50'
  }
];

const mockPastBookings: Booking[] = [
  {
    id: '3',
    stylistName: 'Zara Williams',
    service: 'Goddess Braids',
    rating: 4.8,
    date: 'Friday, May 3',
    time: '11:00',
    duration: '5 hours',
    location: "Stylist's Studio",
    price: '1800 kr',
    status: 'completed',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=50'
  }
];

export default function CustomerBookingsScreen() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'completed':
        return '#007AFF';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'CONFIRMED';
      case 'pending':
        return 'PENDING';
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status.toUpperCase();
    }
  };

  const renderBookingCard = (booking: Booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.stylistInfo}>
          <Image source={{ uri: booking.avatar }} style={styles.stylistAvatar} />
          <View style={styles.stylistDetails}>
            <Text style={styles.stylistName}>{booking.stylistName}</Text>
            <Text style={styles.serviceName}>{booking.service}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFC90A" />
              <Text style={styles.ratingText}>{booking.rating}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{booking.date} at {booking.time}</Text>
          <Text style={styles.priceText}>{booking.price}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Duration: {booking.duration}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{booking.location}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View details</Text>
      </TouchableOpacity>

      <View style={styles.bookingActions}>
        <TouchableOpacity style={styles.rescheduleButton}>
          <Text style={styles.rescheduleText}>Reschedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.messageButton}>
          <Text style={styles.messageText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const currentBookings = activeTab === 'upcoming' ? mockUpcomingBookings : mockPastBookings;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.bookButton}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {currentBookings.length > 0 ? (
          currentBookings.map(renderBookingCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#E5E5E7" />
            <Text style={styles.emptyTitle}>
              No {activeTab} bookings
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'upcoming' 
                ? 'Book your first appointment to get started!'
                : 'Your completed bookings will appear here.'
              }
            </Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222'
  },
  bookButton: {
    backgroundColor: '#4267FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  tabContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8
  },
  activeTab: {
    backgroundColor: '#4267FF'
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  activeTabText: {
    color: 'white'
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  stylistInfo: {
    flexDirection: 'row',
    flex: 1
  },
  stylistAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12
  },
  stylistDetails: {
    flex: 1
  },
  stylistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2
  },
  serviceName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white'
  },
  bookingDetails: {
    marginBottom: 12
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222'
  },
  viewDetailsButton: {
    alignSelf: 'flex-start',
    marginBottom: 16
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#4267FF',
    fontWeight: '500'
  },
  bookingActions: {
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
  messageButton: {
    flex: 1,
    backgroundColor: '#4267FF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  messageText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40
  }
});
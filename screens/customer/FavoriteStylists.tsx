import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { toast } from 'sonner-native';

export default function FavoriteStylists() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [favoriteStylists, setFavoriteStylists] = useState([
    {
      id: '1',
      name: 'Aisha Thompson',
      specialty: 'Knotless & Goddess Braids',
      rating: 5.0,
      reviewCount: 89,
      distance: '0.8 km',
      experience: '3+ years',
      priceFrom: '200 kr',
      avatar: null,
      lastBooked: '2 weeks ago'
    },
    {
      id: '2',
      name: 'Maya Johnson',
      specialty: 'Box Braids & Protective Styles',
      rating: 4.9,
      reviewCount: 127,
      distance: '1.2 km',
      experience: '5+ years',
      priceFrom: '150 kr',
      avatar: null,
      lastBooked: '1 month ago'
    },
    {
      id: '3',
      name: 'Zara Williams',
      specialty: 'Cornrows & Tribal Braids',
      rating: 4.8,
      reviewCount: 156,
      distance: '2.1 km',
      experience: '4+ years',
      priceFrom: '180 kr',
      avatar: null,
      lastBooked: '3 months ago'
    }
  ]);

  const handleRemoveFavorite = (stylistId: string) => {
    setFavoriteStylists(prev => prev.filter(stylist => stylist.id !== stylistId));
    toast.success('Removed from favorites');
  };

  const handleBookNow = (stylistName: string) => {
    toast.success(`Booking with ${stylistName}...`);
  };

  const handleMessage = (stylistName: string) => {
    navigation.navigate('Messages' as never);
    toast.success(`Opening chat with ${stylistName}`);
  };

  const renderStylistCard = (stylist: any) => (
    <View key={stylist.id} style={styles.stylistCard}>
      <View style={styles.cardHeader}>
        <View style={styles.stylistInfo}>
          <View style={styles.avatarContainer}>
            {stylist.avatar ? (
              <Image source={{ uri: stylist.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {stylist.name.split(' ').map((n: string) => n[0]).join('')}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.stylistDetails}>
            <Text style={styles.stylistName}>{stylist.name}</Text>
            <Text style={styles.stylistSpecialty}>{stylist.specialty}</Text>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{stylist.rating}</Text>
              <Text style={styles.reviewCount}>({stylist.reviewCount})</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => handleRemoveFavorite(stylist.id)}
        >
          <Ionicons name="heart" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>DISTANCE</Text>
          <Text style={styles.statValue}>{stylist.distance}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>EXPERIENCE</Text>
          <Text style={styles.statValue}>{stylist.experience}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>FROM</Text>
          <Text style={styles.statValue}>{stylist.priceFrom}</Text>
        </View>
      </View>

      <View style={styles.lastBookedContainer}>
        <Ionicons name="time-outline" size={16} color="#666" />
        <Text style={styles.lastBookedText}>Last booked {stylist.lastBooked}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => handleMessage(stylist.name)}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#4267FF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => handleBookNow(stylist.name)}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorite Stylists</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.resultsCount}>{favoriteStylists.length} favorite stylists</Text>
          
          {favoriteStylists.length > 0 ? (
            favoriteStylists.map(renderStylistCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>No favorite stylists yet</Text>
              <Text style={styles.emptyText}>
                When you find stylists you love, tap the heart icon to add them to your favorites.
              </Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Search' as never)}
              >
                <Text style={styles.exploreButtonText}>Explore Stylists</Text>
              </TouchableOpacity>
            </View>
          )}
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
  scrollView: {
    flex: 1
  },
  content: {
    padding: 16
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 16
  },
  stylistCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  stylistInfo: {
    flexDirection: 'row',
    flex: 1
  },
  avatarContainer: {
    marginRight: 12
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4267FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white'
  },
  stylistDetails: {
    flex: 1
  },
  stylistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4
  },
  stylistSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    marginLeft: 4
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4
  },
  favoriteButton: {
    padding: 4
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0'
  },
  statItem: {
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500'
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222'
  },
  lastBookedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  lastBookedText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12
  },
  messageButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#4267FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48
  },
  bookButton: {
    backgroundColor: '#4267FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: 'center'
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24
  },
  exploreButton: {
    backgroundColor: '#4267FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500'
  }
});
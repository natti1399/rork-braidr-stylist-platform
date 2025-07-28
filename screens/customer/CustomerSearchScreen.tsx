import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Stylist {
  id: string;
  name: string;
  specialties: string;
  rating: number;
  reviews: number;
  distance: string;
  experience: string;
  priceFrom: string;
  avatar: string;
  availableNext?: string;
  isFavorite?: boolean;
}

const mockStylists: Stylist[] = [
  {
    id: '1',
    name: 'Aisha Thompson',
    specialties: 'Knotless & Goddess Braids',
    rating: 5.0,
    reviews: 89,
    distance: '0.8 km',
    experience: '3+ years',
    priceFrom: '200 kr',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=50',
    availableNext: 'Available Tomorrow 10:00 AM',
    isFavorite: true
  },
  {
    id: '2',
    name: 'Maya Johnson',
    specialties: 'Box Braids & Protective Styles',
    rating: 4.9,
    reviews: 127,
    distance: '1.2 km',
    experience: '5+ years',
    priceFrom: '150 kr',
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f4?auto=format&fit=crop&w=200&q=50',
    isFavorite: false
  },
  {
    id: '3',
    name: 'Zara Williams',
    specialties: 'Twist Braids & Locs',
    rating: 4.8,
    reviews: 67,
    distance: '2.1 km',
    experience: '4+ years',
    priceFrom: '180 kr',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=50',
    availableNext: 'Available Friday 11:00 AM'
  },
  {
    id: '4',
    name: 'Keisha Davis',
    specialties: 'Fulani & Tribal Braids',
    rating: 4.7,
    reviews: 45,
    distance: '3.2 km',
    experience: '2+ years',
    priceFrom: '220 kr',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=50',
    availableNext: 'Available Monday 2:00 PM'
  },
  {
    id: '5',
    name: 'Amara Brown',
    specialties: 'Senegalese Twists & Braids',
    rating: 4.9,
    reviews: 98,
    distance: '1.8 km',
    experience: '6+ years',
    priceFrom: '175 kr',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=50',
    availableNext: 'Available Today 4:00 PM'
  }
];

export default function CustomerSearchScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [sortBy, setSortBy] = useState('Nearest');
  const [favorites, setFavorites] = useState<string[]>(['1']);

  const filteredStylists = mockStylists.filter(stylist => {
    const matchesSearch = stylist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stylist.specialties.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailable = !showAvailableOnly || stylist.availableNext;
    return matchesSearch && matchesAvailable;
  });

  const toggleFavorite = (stylistId: string) => {
    setFavorites(prev => 
      prev.includes(stylistId) 
        ? prev.filter(id => id !== stylistId)
        : [...prev, stylistId]
    );
  };

  const renderStylistCard = (stylist: Stylist) => (
    <View key={stylist.id} style={styles.stylistCard}>
      <View style={styles.cardHeader}>
        <View style={styles.stylistMainInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{stylist.name.split(' ').map(n => n[0]).join('')}</Text>
            </View>
          </View>
          <View style={styles.stylistDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.stylistName}>{stylist.name}</Text>
              <TouchableOpacity onPress={() => toggleFavorite(stylist.id)}>
                <Ionicons 
                  name={favorites.includes(stylist.id) ? "heart" : "heart-outline"} 
                  size={20} 
                  color={favorites.includes(stylist.id) ? "#FF3B30" : "#8E8E93"} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.stylistSpecialties}>{stylist.specialties}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFC90A" />
              <Text style={styles.ratingText}>{stylist.rating} ({stylist.reviews} reviews)</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
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

      {stylist.availableNext && (
        <View style={styles.availabilityRow}>
          <View style={styles.availabilityDot} />
          <Text style={styles.availabilityText}>{stylist.availableNext}</Text>
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#4267FF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={styles.headerTitle}>Find Braiders</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search braiders, styles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity 
          style={[styles.filterTab, showAvailableOnly && styles.activeFilterTab]}
          onPress={() => setShowAvailableOnly(!showAvailableOnly)}
        >
          <Ionicons name="time-outline" size={16} color={showAvailableOnly ? "#4267FF" : "#666"} />
          <Text style={[styles.filterTabText, showAvailableOnly && styles.activeFilterTabText]}>
            Available Now
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterTab, showMapView && styles.activeFilterTab]}
          onPress={() => setShowMapView(!showMapView)}
        >
          <Ionicons name="map-outline" size={16} color={showMapView ? "#4267FF" : "#666"} />
          <Text style={[styles.filterTabText, showMapView && styles.activeFilterTabText]}>
            Map View
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{filteredStylists.length} braiders found</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>{sortBy}</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Stylists List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.stylistsList}>
          {filteredStylists.map(renderStylistCard)}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#f8f9fa'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center'
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  searchIcon: {
    marginRight: 12
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222'
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4267FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    gap: 6
  },
  activeFilterTab: {
    backgroundColor: '#f0f4ff'
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  activeFilterTabText: {
    color: '#4267FF'
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222'
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  sortText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  scrollView: {
    flex: 1
  },
  stylistsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16
  },
  stylistCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  cardHeader: {
    marginBottom: 16
  },
  stylistMainInfo: {
    flexDirection: 'row'
  },
  avatarContainer: {
    marginRight: 12
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4267FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  stylistDetails: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  stylistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222'
  },
  stylistSpecialties: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    fontSize: 14,
    color: '#222',
    marginLeft: 4,
    fontWeight: '500'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  statItem: {
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5
  },
  statValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600'
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 8
  },
  availabilityText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500'
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#4267FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
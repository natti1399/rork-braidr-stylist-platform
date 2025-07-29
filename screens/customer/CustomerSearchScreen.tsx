import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Alert, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { bookingService, type Stylist, type SearchFilters } from '../../src/services/bookingService';
import { locationService } from '../../src/services/locationService';

// Using Stylist interface from bookingService

// Removed mock data - using real API data

export default function CustomerSearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);

  useEffect(() => {
    initializeScreen();
    loadFavorites();
  }, []);

  useEffect(() => {
    if (userLocation) {
      searchStylists();
    }
  }, [userLocation, sortBy, showAvailableOnly]);

  const initializeScreen = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setUserLocation(location.coordinates);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('Location Error', 'Unable to get your location. Showing all stylists.');
      searchStylists();
    }
  };

  const loadFavorites = async () => {
    try {
      const favs = await bookingService.getFavoriteStylists();
      setFavorites(favs);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const searchStylists = async () => {
    try {
      setLoading(true);
      const filters: SearchFilters = {
        ...(userLocation && {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 25
        }),
        sortBy: sortBy as any,
        availableToday: showAvailableOnly,
        limit: 20
      };

      const response = await bookingService.searchStylists(filters);
      if (response.success) {
        setStylists(response.data || []);
      } else {
        Alert.alert('Search Error', response.error || 'Failed to search stylists');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search stylists');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredStylists = stylists.filter(stylist => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = `${stylist.businessName || ''} ${stylist.bio || ''}`.toLowerCase();
    const specialties = stylist.specialties.join(' ').toLowerCase();
    return name.includes(query) || specialties.includes(query);
  });

  const toggleFavorite = async (stylistId: string) => {
    try {
      if (favorites.includes(stylistId)) {
        await bookingService.removeFromFavorites(stylistId);
        setFavorites(prev => prev.filter(id => id !== stylistId));
      } else {
        await bookingService.addToFavorites(stylistId);
        setFavorites(prev => [...prev, stylistId]);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    searchStylists();
  };

  const handleStylistPress = (stylist: Stylist) => {
    navigation.navigate('StylistDetail', { stylistId: stylist.id });
  };

  const handleBookNow = (stylist: Stylist) => {
    navigation.navigate('ServiceSelection', { stylistId: stylist.id });
  };

  const handleMessage = (stylist: Stylist) => {
    navigation.navigate('Chat', { 
      conversationId: stylist.id,
      stylistName: stylist.businessName || stylist.bio,
      stylistAvatar: stylist.portfolio[0] || null
    });
  };

  const renderStylistCard = (stylist: Stylist) => {
    const displayName = stylist.businessName || stylist.bio.split(' ').slice(0, 2).join(' ');
    const avatarImage = stylist.portfolio && stylist.portfolio.length > 0 ? stylist.portfolio[0] : null;
    
    return (
      <TouchableOpacity key={stylist.id} style={styles.stylistCard} onPress={() => handleStylistPress(stylist)}>
        <View style={styles.cardHeader}>
          <View style={styles.stylistMainInfo}>
            <View style={styles.avatarContainer}>
              {avatarImage ? (
                <Image source={{ uri: avatarImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{displayName.split(' ').map(n => n[0]).join('')}</Text>
                </View>
              )}
            </View>
            <View style={styles.stylistDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.stylistName} numberOfLines={1}>{displayName}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(stylist.id)}>
                  <Ionicons 
                    name={favorites.includes(stylist.id) ? "heart" : "heart-outline"} 
                    size={20} 
                    color={favorites.includes(stylist.id) ? "#FF3B30" : "#8E8E93"} 
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.stylistSpecialties} numberOfLines={1}>
                {stylist.specialties.slice(0, 2).join(', ')}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFC90A" />
                <Text style={styles.ratingText}>{stylist.rating.toFixed(1)} ({stylist.reviewCount} reviews)</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>DISTANCE</Text>
            <Text style={styles.statValue}>{stylist.distance || 'N/A'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>EXPERIENCE</Text>
            <Text style={styles.statValue}>{stylist.experience}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>VERIFIED</Text>
            <Text style={styles.statValue}>{stylist.isVerified ? 'Yes' : 'No'}</Text>
          </View>
        </View>

        {stylist.isAvailable && (
          <View style={styles.availabilityRow}>
            <View style={styles.availabilityDot} />
            <Text style={styles.availabilityText}>Available for booking</Text>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.bookButton} onPress={() => handleBookNow(stylist)}>
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton} onPress={() => handleMessage(stylist)}>
            <Ionicons name="chatbubble-outline" size={20} color="#4267FF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.sortText}>{sortBy === 'distance' ? 'Nearest' : sortBy === 'rating' ? 'Rating' : sortBy === 'price' ? 'Price' : sortBy}</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Stylists List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4267FF" />
          <Text style={styles.loadingText}>Finding stylists near you...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4267FF']}
              tintColor="#4267FF"
            />
          }
        >
          <View style={styles.stylistsList}>
            {filteredStylists.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#8E8E93" />
                <Text style={styles.emptyTitle}>No stylists found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery ? 'Try adjusting your search terms' : 'Try expanding your search area or removing filters'}
                </Text>
              </View>
            ) : (
              filteredStylists.map(renderStylistCard)
            )}
          </View>
        </ScrollView>
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
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  emptyContainer: {
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
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22
  }
});
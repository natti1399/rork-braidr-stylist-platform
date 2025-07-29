import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { bookingService, type Stylist, type Service } from '../../src/services/bookingService';

const { width } = Dimensions.get('window');

interface RouteParams {
  stylistId: string;
}

export default function StylistDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { stylistId } = route.params as RouteParams;
  
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadStylistData();
    checkFavoriteStatus();
  }, [stylistId]);

  const loadStylistData = async () => {
    try {
      setLoading(true);
      
      // Load stylist details
      const stylistResponse = await bookingService.getStylistDetails(stylistId);
      if (stylistResponse.success && stylistResponse.data) {
        setStylist(stylistResponse.data);
      } else {
        Alert.alert('Error', 'Failed to load stylist details');
        navigation.goBack();
        return;
      }

      // Load stylist services
      const servicesResponse = await bookingService.getStylistServices(stylistId);
      if (servicesResponse.success && servicesResponse.data) {
        setServices(servicesResponse.data);
      }
    } catch (error) {
      console.error('Failed to load stylist data:', error);
      Alert.alert('Error', 'Failed to load stylist information');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const favorites = await bookingService.getFavoriteStylists();
      setIsFavorite(favorites.includes(stylistId));
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await bookingService.removeFromFavorites(stylistId);
        setIsFavorite(false);
      } else {
        await bookingService.addToFavorites(stylistId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handleBookService = (service: Service) => {
    navigation.navigate('BookingFlow', { 
      stylistId: stylistId,
      serviceId: service.id 
    });
  };

  const handleMessage = () => {
    if (!stylist) return;
    navigation.navigate('Chat', { 
      conversationId: stylistId,
      stylistName: stylist.businessName || stylist.bio,
      stylistAvatar: stylist.portfolio[0] || null
    });
  };

  const handleCall = () => {
    Alert.alert('Call Stylist', 'This feature will be available soon!');
  };

  const renderPortfolioImage = (imageUrl: string, index: number) => (
    <TouchableOpacity 
      key={index} 
      style={styles.portfolioImage}
      onPress={() => setSelectedImageIndex(index)}
    >
      <Image source={{ uri: imageUrl }} style={styles.portfolioImageContent} />
    </TouchableOpacity>
  );

  const renderServiceCard = (service: Service) => (
    <View key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.servicePrice}>${service.price}</Text>
      </View>
      <Text style={styles.serviceDescription} numberOfLines={2}>{service.description}</Text>
      <View style={styles.serviceFooter}>
        <View style={styles.serviceDuration}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.serviceDurationText}>{service.duration}</Text>
        </View>
        <TouchableOpacity 
          style={styles.bookServiceButton}
          onPress={() => handleBookService(service)}
        >
          <Text style={styles.bookServiceText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4267FF" />
        <Text style={styles.loadingText}>Loading stylist details...</Text>
      </View>
    );
  }

  if (!stylist) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>Stylist not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayName = stylist.businessName || stylist.bio.split(' ').slice(0, 2).join(' ');
  const mainImage = stylist.portfolio && stylist.portfolio.length > 0 ? stylist.portfolio[selectedImageIndex] : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stylist Profile</Text>
        <TouchableOpacity style={styles.favoriteIcon} onPress={toggleFavorite}>
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#FF3B30" : "white"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        {mainImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: mainImage }} style={styles.mainImage} />
            {stylist.portfolio.length > 1 && (
              <View style={styles.imageIndicators}>
                {stylist.portfolio.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.indicator,
                      selectedImageIndex === index && styles.activeIndicator
                    ]}
                    onPress={() => setSelectedImageIndex(index)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Stylist Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameSection}>
            <Text style={styles.stylistName}>{displayName}</Text>
            {stylist.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          
          <View style={styles.ratingSection}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFC90A" />
              <Text style={styles.ratingText}>{stylist.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({stylist.reviewCount} reviews)</Text>
            </View>
            {stylist.distance && (
              <Text style={styles.distanceText}>{stylist.distance} away</Text>
            )}
          </View>

          <View style={styles.specialtiesSection}>
            <Text style={styles.specialtiesTitle}>Specialties</Text>
            <View style={styles.specialtiesList}>
              {stylist.specialties.map((specialty, index) => (
                <View key={index} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.bioSection}>
            <Text style={styles.bioTitle}>About</Text>
            <Text style={styles.bioText}>{stylist.bio}</Text>
          </View>

          <View style={styles.experienceSection}>
            <Text style={styles.experienceTitle}>Experience</Text>
            <Text style={styles.experienceText}>{stylist.experience}</Text>
          </View>
        </View>

        {/* Portfolio */}
        {stylist.portfolio && stylist.portfolio.length > 1 && (
          <View style={styles.portfolioSection}>
            <Text style={styles.portfolioTitle}>Portfolio</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioScroll}>
              {stylist.portfolio.map(renderPortfolioImage)}
            </ScrollView>
          </View>
        )}

        {/* Services */}
        <View style={styles.servicesSection}>
          <Text style={styles.servicesTitle}>Services</Text>
          {services.length > 0 ? (
            services.map(renderServiceCard)
          ) : (
            <Text style={styles.noServicesText}>No services available</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
            <Ionicons name="chatbubble-outline" size={20} color="#4267FF" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Ionicons name="call-outline" size={20} color="#4267FF" />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
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
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backIcon: {
    padding: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white'
  },
  favoriteIcon: {
    padding: 8
  },
  scrollView: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 40
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center'
  },
  backButton: {
    backgroundColor: '#4267FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  imageContainer: {
    position: 'relative'
  },
  mainImage: {
    width: width,
    height: 300,
    resizeMode: 'cover'
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)'
  },
  activeIndicator: {
    backgroundColor: 'white'
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  stylistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    flex: 1
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  verifiedText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 4
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginLeft: 4
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4
  },
  distanceText: {
    fontSize: 14,
    color: '#666'
  },
  specialtiesSection: {
    marginBottom: 20
  },
  specialtiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  specialtyTag: {
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  specialtyText: {
    fontSize: 14,
    color: '#4267FF',
    fontWeight: '500'
  },
  bioSection: {
    marginBottom: 20
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8
  },
  bioText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24
  },
  experienceSection: {
    marginBottom: 20
  },
  experienceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8
  },
  experienceText: {
    fontSize: 16,
    color: '#666'
  },
  portfolioSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 8
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16
  },
  portfolioScroll: {
    marginHorizontal: -20
  },
  portfolioImage: {
    marginLeft: 20,
    marginRight: 8
  },
  portfolioImageContent: {
    width: 120,
    height: 120,
    borderRadius: 12
  },
  servicesSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 8
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16
  },
  serviceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    flex: 1
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4267FF'
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  serviceDuration: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  serviceDurationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4
  },
  bookServiceButton: {
    backgroundColor: '#4267FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  bookServiceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  noServicesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: 'white',
    marginTop: 8
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4ff',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4267FF'
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4ff',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4267FF'
  }
});
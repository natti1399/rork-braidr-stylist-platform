import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  image: string;
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

interface StylistDetailScreenProps {
  route?: {
    params?: {
      stylistId?: string;
    };
  };
  navigation?: any;
}

// Sample stylist data
const stylistData = {
  id: '1',
  name: 'Maya Johnson',
  specialties: 'Box Braids & Protective Styles',
  rating: 4.9,
  reviews: 127,
  distance: '1.2 km',
  experience: '5+ years',
  avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f4?auto=format&fit=crop&w=400&q=80',
  bio: 'Passionate braiding stylist with over 5 years of experience. I specialize in protective styles that promote healthy hair growth while keeping you looking fabulous. My goal is to make every client feel confident and beautiful.',
  location: 'Brooklyn, NY',
  responseTime: 'Usually responds within 1 hour',
  languages: ['English', 'Spanish'],
  isVerified: true,
  portfolio: [
    'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1595475038665-d7e8b9a4d9b4?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1580618652393-3c23d2dbb02c?auto=format&fit=crop&w=300&q=80',
  ]
};

const services: Service[] = [
  {
    id: '1',
    name: 'Medium Box Braids',
    description: 'Classic medium-sized box braids, perfect for everyday wear',
    price: '$180',
    duration: '4-6 hours',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: '2',
    name: 'Small Box Braids',
    description: 'Detailed small box braids for a more intricate look',
    price: '$220',
    duration: '6-8 hours',
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: '3',
    name: 'Knotless Braids',
    description: 'Gentle knotless braids that reduce tension on your scalp',
    price: '$250',
    duration: '5-7 hours',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: '4',
    name: 'Jumbo Braids',
    description: 'Quick and stylish jumbo braids for a bold look',
    price: '$120',
    duration: '2-3 hours',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=200&q=80'
  }
];

const reviews: Review[] = [
  {
    id: '1',
    customerName: 'Sarah M.',
    rating: 5,
    comment: 'Maya did an amazing job with my box braids! They lasted 8 weeks and looked perfect the entire time. Highly recommend!',
    date: '2 weeks ago',
    images: ['https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=200&q=80']
  },
  {
    id: '2',
    customerName: 'Jennifer K.',
    rating: 5,
    comment: 'Professional, clean, and skilled. Maya made me feel so comfortable and the results were exactly what I wanted.',
    date: '1 month ago'
  },
  {
    id: '3',
    customerName: 'Tasha L.',
    rating: 4,
    comment: 'Great work! The braids were neat and lasted long. Will definitely book again.',
    date: '2 months ago'
  }
];

export default function StylistDetailScreen({ route, navigation }: StylistDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'services' | 'portfolio' | 'reviews'>('services');
  const [isFavorite, setIsFavorite] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < Math.floor(rating) ? 'star' : index < rating ? 'star-half' : 'star-outline'}
        size={16}
        color="#FFD700"
        style={{ marginRight: 2 }}
      />
    ));
  };

  const renderService = (service: Service) => (
    <TouchableOpacity
      key={service.id}
      style={styles.serviceCard}
      onPress={() => navigation?.navigate('BookingDetails', { 
        stylistId: stylistData.id, 
        serviceId: service.id 
      })}
    >
      <Image source={{ uri: service.image }} style={styles.serviceImage} />
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.serviceDescription}>{service.description}</Text>
        <View style={styles.serviceDetails}>
          <View style={styles.servicePrice}>
            <Text style={styles.servicePriceText}>{service.price}</Text>
            <Text style={styles.serviceDuration}>• {service.duration}</Text>
          </View>
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPortfolioImage = (image: string, index: number) => (
    <TouchableOpacity key={index} style={styles.portfolioImageContainer}>
      <Image source={{ uri: image }} style={styles.portfolioImage} />
    </TouchableOpacity>
  );

  const renderReview = (review: Review) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerAvatar}>
            <Text style={styles.reviewerInitial}>{review.customerName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.reviewerName}>{review.customerName}</Text>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
        </View>
        <View style={styles.reviewRating}>
          {renderStars(review.rating)}
        </View>
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
      {review.images && (
        <ScrollView horizontal style={styles.reviewImages}>
          {review.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Image */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: stylistData.avatar }} style={styles.headerImage} />
        <View style={[styles.headerOverlay, { paddingTop: Math.max(insets.top, 20) }]}>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation?.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerRightActions}>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="share-outline" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={22} 
                  color={isFavorite ? "#FF3B30" : "white"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stylist Info */}
        <View style={styles.stylistInfo}>
          <View style={styles.stylistHeader}>
            <View style={styles.stylistTitleContainer}>
              <Text style={styles.stylistName}>{stylistData.name}</Text>
              {stylistData.isVerified && (
                <Ionicons name="checkmark-circle" size={20} color="#4267FF" style={styles.verifiedBadge} />
              )}
            </View>
            <Text style={styles.stylistSpecialties}>{stylistData.specialties}</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.rating}>
                {renderStars(stylistData.rating)}
                <Text style={styles.ratingText}>{stylistData.rating}</Text>
              </View>
              <Text style={styles.reviewCount}>({stylistData.reviews} reviews)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.distance}>{stylistData.distance} away</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.experience}>{stylistData.experience}</Text>
            </View>
          </View>

          <Text style={styles.bio}>{stylistData.bio}</Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={18} color="#4267FF" />
              <Text style={styles.detailText}>{stylistData.location}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={18} color="#4267FF" />
              <Text style={styles.detailText}>{stylistData.responseTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="language" size={18} color="#4267FF" />
              <Text style={styles.detailText}>{stylistData.languages.join(', ')}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'services' && styles.activeTab]}
            onPress={() => setActiveTab('services')}
          >
            <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
              Services
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'portfolio' && styles.activeTab]}
            onPress={() => setActiveTab('portfolio')}
          >
            <Text style={[styles.tabText, activeTab === 'portfolio' && styles.activeTabText]}>
              Portfolio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'services' && (
            <View style={styles.servicesContainer}>
              {services.map(renderService)}
            </View>
          )}

          {activeTab === 'portfolio' && (
            <View style={styles.portfolioContainer}>
              <View style={styles.portfolioGrid}>
                {stylistData.portfolio.map(renderPortfolioImage)}
              </View>
            </View>
          )}

          {activeTab === 'reviews' && (
            <View style={styles.reviewsContainer}>
              {reviews.map(renderReview)}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => navigation?.navigate('Chat', { 
            conversationId: stylistData.id,
            stylistName: stylistData.name,
            stylistAvatar: stylistData.avatar
          })}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#4267FF" />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.bookNowButton}
          onPress={() => navigation?.navigate('ServiceSelection', { stylistId: stylistData.id })}
        >
          <Text style={styles.bookNowButtonText}>Book Now</Text>
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
  headerContainer: {
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  stylistInfo: {
    backgroundColor: 'white',
    marginTop: -40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  stylistHeader: {
    marginBottom: 16,
  },
  stylistTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stylistName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222',
    marginRight: 8,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  stylistSpecialties: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 12,
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  experience: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  bio: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsContainer: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: 8,
    paddingHorizontal: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4267FF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#4267FF',
  },
  tabContent: {
    backgroundColor: 'white',
    paddingBottom: 100,
  },
  servicesContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginBottom: 16,
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
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePriceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4267FF',
  },
  serviceDuration: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: '#4267FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  portfolioContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  portfolioImageContainer: {
    width: (width - 60) / 2,
    marginBottom: 12,
  },
  portfolioImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  reviewsContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  reviewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4267FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  reviewDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewComment: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  reviewImages: {
    marginTop: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    resizeMode: 'cover',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 24,
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
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  messageButtonText: {
    color: '#4267FF',
    fontSize: 16,
    fontWeight: '600',
  },
  bookNowButton: {
    flex: 2,
    backgroundColor: '#4267FF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
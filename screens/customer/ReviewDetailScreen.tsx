import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  Dimensions,
  Alert,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Review {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  stylistId: string;
  stylistName: string;
  stylistAvatar: string;
  serviceName: string;
  overallRating: number;
  categoryRatings: {
    quality: number;
    timeliness: number;
    professionalism: number;
    cleanliness: number;
    communication: number;
  };
  reviewText: string;
  photos: string[];
  date: Date;
  isAnonymous: boolean;
  helpfulCount: number;
  isHelpful: boolean;
  appointmentId: string;
}

interface ReviewDetailScreenProps {
  route?: {
    params?: {
      reviewId?: string;
      review?: Review;
    };
  };
  navigation?: any;
}

// Sample review data
const sampleReview: Review = {
  id: '1',
  customerId: '123',
  customerName: 'Sarah M.',
  customerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b5b06717?auto=format&fit=crop&w=200&q=80',
  stylistId: '1',
  stylistName: 'Maya Johnson',
  stylistAvatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f4?auto=format&fit=crop&w=200&q=80',
  serviceName: 'Medium Box Braids',
  overallRating: 5,
  categoryRatings: {
    quality: 5,
    timeliness: 4,
    professionalism: 5,
    cleanliness: 5,
    communication: 5
  },
  reviewText: 'Maya did an absolutely amazing job with my box braids! From start to finish, the experience was professional and comfortable. She took her time to ensure each braid was perfect, and the results exceeded my expectations. The salon was clean and welcoming, and Maya was so easy to talk to throughout the 5-hour session. My braids have lasted 8 weeks and still look fresh! I\'ve already booked my next appointment with her. Highly recommend Maya to anyone looking for quality braiding work.',
  photos: [
    'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=400&q=80'
  ],
  date: new Date('2024-01-15'),
  isAnonymous: false,
  helpfulCount: 24,
  isHelpful: false,
  appointmentId: 'apt_123'
};

const categoryLabels = {
  quality: 'Quality of Work',
  timeliness: 'Timeliness',
  professionalism: 'Professionalism',
  cleanliness: 'Cleanliness',
  communication: 'Communication'
};

export default function ReviewDetailScreen({ route, navigation }: ReviewDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const review = route?.params?.review || sampleReview;
  
  const [isHelpful, setIsHelpful] = useState(review.isHelpful);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderStars = (rating: number, size: number = 16) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < Math.floor(rating) ? 'star' : index < rating ? 'star-half' : 'star-outline'}
        size={size}
        color="#FFD700"
        style={{ marginRight: 2 }}
      />
    ));
  };

  const toggleHelpful = () => {
    setIsHelpful(!isHelpful);
    setHelpfulCount(prev => isHelpful ? prev - 1 : prev + 1);
  };

  const shareReview = () => {
    Share.share({
      message: `Check out this review of ${review.stylistName} on Braidr: "${review.reviewText.slice(0, 100)}..." - ${review.overallRating} stars`,
      title: `Review of ${review.stylistName}`
    });
  };

  const reportReview = () => {
    Alert.alert(
      'Report Review',
      'Why are you reporting this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Inappropriate content', onPress: () => handleReport('inappropriate') },
        { text: 'Spam or fake', onPress: () => handleReport('spam') },
        { text: 'Other', onPress: () => handleReport('other') }
      ]
    );
  };

  const handleReport = (reason: string) => {
    Alert.alert('Report Submitted', 'Thank you for your report. We\'ll review this content.');
  };

  const viewStylistProfile = () => {
    navigation?.navigate('StylistDetail', { stylistId: review.stylistId });
  };

  const renderPhoto = (photo: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.photoThumbnail}
      onPress={() => setSelectedPhotoIndex(index)}
    >
      <Image source={{ uri: photo }} style={styles.photoThumbnailImage} />
    </TouchableOpacity>
  );

  const renderPhotoModal = () => {
    if (selectedPhotoIndex === null) return null;

    return (
      <View style={styles.photoModal}>
        <StatusBar barStyle="light-content" />
        <View style={styles.photoModalHeader}>
          <TouchableOpacity 
            style={styles.photoModalClose}
            onPress={() => setSelectedPhotoIndex(null)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.photoModalCounter}>
            {selectedPhotoIndex + 1} of {review.photos.length}
          </Text>
        </View>
        
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: selectedPhotoIndex * width, y: 0 }}
        >
          {review.photos.map((photo, index) => (
            <View key={index} style={styles.photoModalSlide}>
              <Image source={{ uri: photo }} style={styles.photoModalImage} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

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
        
        <Text style={styles.headerTitle}>Review Details</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton} onPress={shareReview}>
            <Ionicons name="share-outline" size={22} color="#4267FF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton} onPress={reportReview}>
            <Ionicons name="flag-outline" size={22} color="#4267FF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Review Header */}
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerInfo}>
            {!review.isAnonymous && review.customerAvatar ? (
              <Image source={{ uri: review.customerAvatar }} style={styles.reviewerAvatar} />
            ) : (
              <View style={styles.reviewerAvatarPlaceholder}>
                <Text style={styles.reviewerAvatarText}>
                  {review.isAnonymous ? 'A' : review.customerName.charAt(0)}
                </Text>
              </View>
            )}
            
            <View style={styles.reviewerDetails}>
              <Text style={styles.reviewerName}>
                {review.isAnonymous ? 'Anonymous' : review.customerName}
              </Text>
              <Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
            </View>
          </View>

          <View style={styles.overallRating}>
            <View style={styles.ratingStars}>
              {renderStars(review.overallRating, 20)}
            </View>
            <Text style={styles.ratingNumber}>{review.overallRating}.0</Text>
          </View>
        </View>

        {/* Service Info */}
        <View style={styles.serviceInfo}>
          <TouchableOpacity style={styles.stylistCard} onPress={viewStylistProfile}>
            <Image source={{ uri: review.stylistAvatar }} style={styles.stylistAvatar} />
            <View style={styles.stylistDetails}>
              <Text style={styles.stylistName}>{review.stylistName}</Text>
              <Text style={styles.serviceName}>{review.serviceName}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Category Ratings */}
        <View style={styles.categoryRatings}>
          <Text style={styles.sectionTitle}>Detailed Ratings</Text>
          {Object.entries(review.categoryRatings).map(([category, rating]) => (
            <View key={category} style={styles.categoryRating}>
              <Text style={styles.categoryLabel}>{categoryLabels[category as keyof typeof categoryLabels]}</Text>
              <View style={styles.categoryRatingRight}>
                <View style={styles.categoryStars}>
                  {renderStars(rating)}
                </View>
                <Text style={styles.categoryRatingNumber}>{rating}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Review Text */}
        <View style={styles.reviewTextSection}>
          <Text style={styles.sectionTitle}>Review</Text>
          <Text style={styles.reviewText}>{review.reviewText}</Text>
        </View>

        {/* Photos */}
        {review.photos.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Photos ({review.photos.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
              {review.photos.map(renderPhoto)}
            </ScrollView>
          </View>
        )}

        {/* Helpful Section */}
        <View style={styles.helpfulSection}>
          <Text style={styles.helpfulQuestion}>Was this review helpful?</Text>
          <View style={styles.helpfulActions}>
            <TouchableOpacity 
              style={[styles.helpfulButton, isHelpful && styles.helpfulButtonActive]}
              onPress={toggleHelpful}
            >
              <Ionicons 
                name={isHelpful ? "thumbs-up" : "thumbs-up-outline"} 
                size={20} 
                color={isHelpful ? "white" : "#4267FF"} 
              />
              <Text style={[styles.helpfulButtonText, isHelpful && styles.helpfulButtonTextActive]}>
                Helpful ({helpfulCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Related Reviews */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>More Reviews for {review.stylistName}</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation?.navigate('StylistDetail', { 
              stylistId: review.stylistId,
              initialTab: 'reviews'
            })}
          >
            <Text style={styles.viewAllButtonText}>View All Reviews</Text>
            <Ionicons name="chevron-forward" size={16} color="#4267FF" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Photo Modal */}
      {selectedPhotoIndex !== null && renderPhotoModal()}
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  reviewHeader: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  reviewerAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4267FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 14,
    color: '#666',
  },
  overallRating: {
    alignItems: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4267FF',
  },
  serviceInfo: {
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
  serviceName: {
    fontSize: 14,
    color: '#4267FF',
    fontWeight: '600',
  },
  categoryRatings: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  categoryRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  categoryLabel: {
    fontSize: 15,
    color: '#222',
    flex: 1,
  },
  categoryRatingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  categoryRatingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 20,
    textAlign: 'right',
  },
  reviewTextSection: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewText: {
    fontSize: 16,
    color: '#222',
    lineHeight: 24,
  },
  photosSection: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photosScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  photoThumbnail: {
    marginRight: 12,
  },
  photoThumbnailImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  helpfulSection: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  helpfulQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  helpfulActions: {
    flexDirection: 'row',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  helpfulButtonActive: {
    backgroundColor: '#4267FF',
  },
  helpfulButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4267FF',
  },
  helpfulButtonTextActive: {
    color: 'white',
  },
  relatedSection: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  viewAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4267FF',
  },
  bottomSpacing: {
    height: 40,
  },
  photoModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 1000,
  },
  photoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  photoModalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalCounter: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  photoModalSlide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalImage: {
    width: width - 40,
    height: width - 40,
    resizeMode: 'contain',
  },
});
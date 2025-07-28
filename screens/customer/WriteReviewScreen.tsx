import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WriteReviewScreenProps {
  route?: {
    params?: {
      appointmentId?: string;
      stylistId?: string;
      stylistName?: string;
      stylistAvatar?: string;
      serviceName?: string;
      appointmentDate?: string;
    };
  };
  navigation?: any;
}

const reviewCategories = [
  { id: 'quality', label: 'Quality of Work', icon: 'star' },
  { id: 'timeliness', label: 'Timeliness', icon: 'time' },
  { id: 'professionalism', label: 'Professionalism', icon: 'person' },
  { id: 'cleanliness', label: 'Cleanliness', icon: 'checkmark-circle' },
  { id: 'communication', label: 'Communication', icon: 'chatbubble' }
];

export default function WriteReviewScreen({ route, navigation }: WriteReviewScreenProps) {
  const insets = useSafeAreaInsets();
  
  // Get appointment details from navigation params
  const {
    appointmentId = '1',
    stylistId = '1',
    stylistName = 'Maya Johnson',
    stylistAvatar = 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f4?auto=format&fit=crop&w=200&q=80',
    serviceName = 'Medium Box Braids',
    appointmentDate = '2024-01-28'
  } = route?.params || {};

  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<{[key: string]: number}>({});
  const [reviewText, setReviewText] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample photos that could be selected
  const samplePhotos = [
    'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80'
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderStars = (rating: number, onPress?: (rating: number) => void, size: number = 24) => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => onPress && onPress(index + 1)}
        disabled={!onPress}
        style={styles.starButton}
      >
        <Ionicons
          name={index < rating ? 'star' : 'star-outline'}
          size={size}
          color={index < rating ? '#FFD700' : '#E5E5EA'}
        />
      </TouchableOpacity>
    ));
  };

  const setCategoryRating = (categoryId: string, rating: number) => {
    setCategoryRatings(prev => ({
      ...prev,
      [categoryId]: rating
    }));
  };

  const getAverageRating = () => {
    const ratings = Object.values(categoryRatings);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  };

  const canSubmit = () => {
    return overallRating > 0 && reviewText.trim().length > 10;
  };

  const handleSubmitReview = async () => {
    if (!canSubmit()) {
      Alert.alert('Incomplete Review', 'Please provide an overall rating and write at least a few words about your experience.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Review Submitted!',
        'Thank you for your feedback. Your review helps other customers find great stylists.',
        [
          {
            text: 'OK',
            onPress: () => navigation?.goBack()
          }
        ]
      );
    }, 2000);
  };

  const addPhoto = (photoUrl: string) => {
    if (selectedPhotos.length < 4) {
      setSelectedPhotos(prev => [...prev, photoUrl]);
    }
    setShowPhotoModal(false);
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const renderPhotoModal = () => (
    <Modal
      visible={showPhotoModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.photoModalContainer}>
        <View style={[styles.photoModalHeader, { paddingTop: Math.max(insets.top, 20) }]}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setShowPhotoModal(false)}
          >
            <Ionicons name="close" size={24} color="#4267FF" />
          </TouchableOpacity>
          
          <Text style={styles.photoModalTitle}>Add Photos</Text>
          
          <View style={styles.modalPlaceholder} />
        </View>

        <ScrollView style={styles.photoModalContent}>
          <Text style={styles.photoModalDescription}>
            Choose photos that show the final result of your braiding appointment
          </Text>
          
          <View style={styles.photoGrid}>
            {samplePhotos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={styles.photoOption}
                onPress={() => addPhoto(photo)}
              >
                <Image source={{ uri: photo }} style={styles.photoOptionImage} />
                <View style={styles.photoOptionOverlay}>
                  <Ionicons name="add-circle" size={32} color="white" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera" size={24} color="#4267FF" />
            <Text style={styles.cameraButtonText}>Take New Photo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

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
        
        <Text style={styles.headerTitle}>Write Review</Text>
        
        <TouchableOpacity 
          style={[styles.submitButton, canSubmit() && styles.submitButtonActive]}
          onPress={handleSubmitReview}
          disabled={!canSubmit() || isSubmitting}
        >
          <Text style={[styles.submitButtonText, canSubmit() && styles.submitButtonTextActive]}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appointment Info */}
        <View style={styles.appointmentCard}>
          <View style={styles.appointmentHeader}>
            <Image source={{ uri: stylistAvatar }} style={styles.stylistAvatar} />
            <View style={styles.appointmentDetails}>
              <Text style={styles.stylistName}>{stylistName}</Text>
              <Text style={styles.serviceName}>{serviceName}</Text>
              <Text style={styles.appointmentDate}>{formatDate(appointmentDate)}</Text>
            </View>
          </View>
        </View>

        {/* Overall Rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Overall Rating</Text>
          <Text style={styles.sectionDescription}>How would you rate your overall experience?</Text>
          
          <View style={styles.overallRatingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(overallRating, setOverallRating, 32)}
            </View>
            <Text style={styles.ratingLabel}>
              {overallRating === 0 ? 'Tap to rate' : 
               overallRating === 1 ? 'Poor' :
               overallRating === 2 ? 'Fair' :
               overallRating === 3 ? 'Good' :
               overallRating === 4 ? 'Very Good' : 'Excellent'}
            </Text>
          </View>
        </View>

        {/* Category Ratings */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Rate Specific Areas</Text>
          <Text style={styles.sectionDescription}>Help others by rating different aspects of your experience</Text>
          
          {reviewCategories.map(category => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryIcon}>
                  <Ionicons name={category.icon as any} size={20} color="#4267FF" />
                </View>
                <Text style={styles.categoryLabel}>{category.label}</Text>
              </View>
              <View style={styles.categoryStars}>
                {renderStars(categoryRatings[category.id] || 0, (rating) => setCategoryRating(category.id, rating), 20)}
              </View>
            </View>
          ))}
        </View>

        {/* Written Review */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Tell us about your experience</Text>
          <Text style={styles.sectionDescription}>Share details that would help other customers</Text>
          
          <TextInput
            style={styles.reviewInput}
            placeholder="Describe your experience with this stylist. What did you like? What could be improved?"
            placeholderTextColor="#8E8E93"
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>{reviewText.length}/500</Text>
        </View>

        {/* Photo Section */}
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Add Photos (Optional)</Text>
          <Text style={styles.sectionDescription}>Show off the amazing work! Up to 4 photos</Text>
          
          <View style={styles.photosContainer}>
            {selectedPhotos.map((photo, index) => (
              <View key={index} style={styles.selectedPhoto}>
                <Image source={{ uri: photo }} style={styles.selectedPhotoImage} />
                <TouchableOpacity 
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
            
            {selectedPhotos.length < 4 && (
              <TouchableOpacity 
                style={styles.addPhotoButton}
                onPress={() => setShowPhotoModal(true)}
              >
                <Ionicons name="camera-outline" size={32} color="#4267FF" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Privacy Options */}
        <View style={styles.privacySection}>
          <View style={styles.privacyOption}>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyTitle}>Post Anonymously</Text>
              <Text style={styles.privacyDescription}>Your name won't be shown with this review</Text>
            </View>
            <TouchableOpacity 
              style={[styles.toggleButton, isAnonymous && styles.toggleButtonActive]}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <View style={[styles.toggleIndicator, isAnonymous && styles.toggleIndicatorActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Review Guidelines */}
        <View style={styles.guidelinesSection}>
          <Text style={styles.guidelinesTitle}>Review Guidelines</Text>
          <View style={styles.guidelinesList}>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.guidelineText}>Be honest and fair in your review</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.guidelineText}>Focus on the service and experience</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.guidelineText}>Avoid personal attacks or inappropriate content</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Photo Modal */}
      {renderPhotoModal()}
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
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
  },
  submitButtonActive: {
    backgroundColor: '#4267FF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  submitButtonTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stylistAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  appointmentDetails: {
    flex: 1,
  },
  stylistName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    color: '#4267FF',
    fontWeight: '600',
    marginBottom: 2,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
  },
  ratingSection: {
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
  categorySection: {
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
  reviewSection: {
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
  photoSection: {
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
  privacySection: {
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
  guidelinesSection: {
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  overallRatingContainer: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4267FF',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  categoryStars: {
    flexDirection: 'row',
  },
  reviewInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 8,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  selectedPhoto: {
    position: 'relative',
  },
  selectedPhotoImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4267FF',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#4267FF',
    fontWeight: '600',
    marginTop: 4,
  },
  privacyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privacyInfo: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#666',
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E5EA',
    padding: 2,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#4267FF',
  },
  toggleIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleIndicatorActive: {
    alignSelf: 'flex-end',
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  guidelinesList: {
    gap: 8,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guidelineText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  bottomSpacing: {
    height: 40,
  },
  photoModalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  photoModalHeader: {
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
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },
  modalPlaceholder: {
    width: 40,
  },
  photoModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  photoModalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  photoOption: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  photoOptionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOptionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
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
    gap: 12,
  },
  cameraButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4267FF',
  },
});
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function ReviewsRatingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [reviews] = useState([
    {
      id: '1',
      stylistName: 'Maya Johnson',
      stylistAvatar: null,
      service: 'Box Braids',
      rating: 5,
      date: '2024-01-15',
      comment: 'Amazing work! Maya was professional, friendly, and my braids turned out exactly how I wanted them. The salon was clean and comfortable. Highly recommend!',
      images: []
    },
    {
      id: '2',
      stylistName: 'Aisha Thompson',
      stylistAvatar: null,
      service: 'Knotless Braids',
      rating: 5,
      date: '2024-01-08',
      comment: 'Aisha is incredibly talented! The knotless braids were perfect and lasted for weeks. Great conversation and very gentle with my hair.',
      images: []
    },
    {
      id: '3',
      stylistName: 'Zara Williams',
      stylistAvatar: null,
      service: 'Cornrows',
      rating: 4,
      date: '2023-12-20',
      comment: 'Good service overall. The cornrows were neat and well-done. Only minor issue was the appointment started a bit late, but the quality made up for it.',
      images: []
    }
  ]);

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  const renderStars = (rating: number, size: number = 16) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={size}
        color={index < rating ? '#FFD700' : '#C7C7CC'}
      />
    ));
  };

  const renderReviewCard = (review: any) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.stylistInfo}>
          <View style={styles.avatarContainer}>
            {review.stylistAvatar ? (
              <Image source={{ uri: review.stylistAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {review.stylistName.split(' ').map((n: string) => n[0]).join('')}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.reviewDetails}>
            <Text style={styles.stylistName}>{review.stylistName}</Text>
            <Text style={styles.serviceName}>{review.service}</Text>
            <Text style={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</Text>
          </View>
        </View>
        
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {renderStars(review.rating)}
          </View>
        </View>
      </View>

      <Text style={styles.reviewComment}>{review.comment}</Text>

      {review.images && review.images.length > 0 && (
        <View style={styles.reviewImages}>
          {review.images.map((image: string, index: number) => (
            <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
          ))}
        </View>
      )}
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
        <Text style={styles.headerTitle}>Reviews & Ratings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Your Reviews</Text>
            <View style={styles.averageRating}>
              <Text style={styles.averageRatingText}>{averageRating.toFixed(1)}</Text>
              <View style={styles.averageStars}>
                {renderStars(Math.round(averageRating), 20)}
              </View>
            </View>
          </View>
          
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{reviews.length}</Text>
              <Text style={styles.statLabel}>Total Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{reviews.filter(r => r.rating === 5).length}</Text>
              <Text style={styles.statLabel}>5-Star Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{new Set(reviews.map(r => r.stylistName)).size}</Text>
              <Text style={styles.statLabel}>Stylists Reviewed</Text>
            </View>
          </View>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          
          {reviews.length > 0 ? (
            reviews.map(renderReviewCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={64} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptyText}>
                After your appointments, you can leave reviews to help other customers and support your favorite stylists.
              </Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#4267FF" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>About Reviews</Text>
            <Text style={styles.infoText}>
              Your reviews help other customers make informed decisions and help stylists improve their services. Reviews are visible to other users.
            </Text>
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
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222'
  },
  averageRating: {
    alignItems: 'center'
  },
  averageRatingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4
  },
  averageStars: {
    flexDirection: 'row'
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E7'
  },
  reviewsSection: {
    paddingHorizontal: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 16
  },
  reviewCard: {
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
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  stylistInfo: {
    flexDirection: 'row',
    flex: 1
  },
  avatarContainer: {
    marginRight: 12
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4267FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white'
  },
  reviewDetails: {
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
    marginBottom: 2
  },
  reviewDate: {
    fontSize: 12,
    color: '#999'
  },
  ratingContainer: {
    alignItems: 'flex-end'
  },
  starsContainer: {
    flexDirection: 'row'
  },
  reviewComment: {
    fontSize: 14,
    color: '#222',
    lineHeight: 20,
    marginBottom: 12
  },
  reviewImages: {
    flexDirection: 'row',
    gap: 8
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8
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
    lineHeight: 24
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  infoContent: {
    flex: 1,
    marginLeft: 16
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  }
});
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  duration: string;
  durationValue: number;
  image: string;
  popular?: boolean;
  addOns?: AddOn[];
}

interface AddOn {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  description: string;
}

interface ServiceSelectionScreenProps {
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
  avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f4?auto=format&fit=crop&w=200&q=80',
  specialties: 'Box Braids & Protective Styles',
  rating: 4.9,
  reviews: 127,
};

const services: Service[] = [
  {
    id: '1',
    name: 'Medium Box Braids',
    description: 'Classic medium-sized box braids, perfect for everyday wear. Includes wash, conditioning, and styling.',
    price: '$180',
    priceValue: 180,
    duration: '4-6 hours',
    durationValue: 5,
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=300&q=80',
    popular: true,
    addOns: [
      { id: '1', name: 'Hair Extensions', price: '$25', priceValue: 25, description: 'Premium quality extensions' },
      { id: '2', name: 'Scalp Treatment', price: '$15', priceValue: 15, description: 'Nourishing scalp massage' }
    ]
  },
  {
    id: '2',
    name: 'Small Box Braids',
    description: 'Detailed small box braids for a more intricate and long-lasting look. Perfect for special occasions.',
    price: '$220',
    priceValue: 220,
    duration: '6-8 hours',
    durationValue: 7,
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=300&q=80',
    addOns: [
      { id: '1', name: 'Hair Extensions', price: '$30', priceValue: 30, description: 'Premium quality extensions' },
      { id: '3', name: 'Hair Accessories', price: '$20', priceValue: 20, description: 'Beads and decorative elements' }
    ]
  },
  {
    id: '3',
    name: 'Knotless Braids',
    description: 'Gentle knotless braids that reduce tension on your scalp while providing a natural look.',
    price: '$250',
    priceValue: 250,
    duration: '5-7 hours',
    durationValue: 6,
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=300&q=80',
    popular: true,
    addOns: [
      { id: '1', name: 'Hair Extensions', price: '$35', priceValue: 35, description: 'Premium quality extensions' },
      { id: '2', name: 'Scalp Treatment', price: '$15', priceValue: 15, description: 'Nourishing scalp massage' }
    ]
  },
  {
    id: '4',
    name: 'Jumbo Braids',
    description: 'Quick and stylish jumbo braids for a bold, statement look. Great for busy schedules.',
    price: '$120',
    priceValue: 120,
    duration: '2-3 hours',
    durationValue: 2.5,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80',
    addOns: [
      { id: '1', name: 'Hair Extensions', price: '$20', priceValue: 20, description: 'Premium quality extensions' }
    ]
  },
  {
    id: '5',
    name: 'Goddess Braids',
    description: 'Elegant goddess braids with a regal appearance. Perfect for formal events and special occasions.',
    price: '$200',
    priceValue: 200,
    duration: '4-5 hours',
    durationValue: 4.5,
    image: 'https://images.unsplash.com/photo-1595475038665-d7e8b9a4d9b4?auto=format&fit=crop&w=300&q=80',
    addOns: [
      { id: '2', name: 'Scalp Treatment', price: '$15', priceValue: 15, description: 'Nourishing scalp massage' },
      { id: '3', name: 'Hair Accessories', price: '$25', priceValue: 25, description: 'Beads and decorative elements' }
    ]
  },
  {
    id: '6',
    name: 'Twist Braids',
    description: 'Protective twist braids that promote hair health while maintaining style. Low maintenance option.',
    price: '$160',
    priceValue: 160,
    duration: '3-4 hours',
    durationValue: 3.5,
    image: 'https://images.unsplash.com/photo-1580618652393-3c23d2dbb02c?auto=format&fit=crop&w=300&q=80',
    addOns: [
      { id: '1', name: 'Hair Extensions', price: '$25', priceValue: 25, description: 'Premium quality extensions' },
      { id: '2', name: 'Scalp Treatment', price: '$15', priceValue: 15, description: 'Nourishing scalp massage' }
    ]
  }
];

export default function ServiceSelectionScreen({ route, navigation }: ServiceSelectionScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'duration'>('popular');

  const stylistId = route?.params?.stylistId || '1';

  const getSortedServices = () => {
    let sorted = [...services];
    
    switch (sortBy) {
      case 'price':
        return sorted.sort((a, b) => a.priceValue - b.priceValue);
      case 'duration':
        return sorted.sort((a, b) => a.durationValue - b.durationValue);
      case 'popular':
      default:
        return sorted.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }
  };

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    
    let total = selectedService.priceValue;
    
    selectedService.addOns?.forEach(addOn => {
      if (selectedAddOns.includes(addOn.id)) {
        total += addOn.priceValue;
      }
    });
    
    return total;
  };

  const handleContinue = () => {
    if (!selectedService) return;
    
    navigation?.navigate('BookingDetails', {
      stylistId,
      serviceId: selectedService.id,
      addOns: selectedAddOns,
      totalPrice: calculateTotal()
    });
  };

  const renderSortButton = (type: 'popular' | 'price' | 'duration', label: string) => (
    <TouchableOpacity
      style={[styles.sortButton, sortBy === type && styles.activeSortButton]}
      onPress={() => setSortBy(type)}
    >
      <Text style={[styles.sortButtonText, sortBy === type && styles.activeSortButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderService = (service: Service) => {
    const isSelected = selectedService?.id === service.id;
    
    return (
      <TouchableOpacity
        key={service.id}
        style={[styles.serviceCard, isSelected && styles.selectedServiceCard]}
        onPress={() => setSelectedService(service)}
      >
        {service.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>Most Popular</Text>
          </View>
        )}
        
        <Image source={{ uri: service.image }} style={styles.serviceImage} />
        
        <View style={styles.serviceContent}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <View style={styles.servicePricing}>
              <Text style={styles.servicePrice}>{service.price}</Text>
              <Text style={styles.serviceDuration}>• {service.duration}</Text>
            </View>
          </View>
          
          <Text style={styles.serviceDescription}>{service.description}</Text>
          
          {isSelected && service.addOns && service.addOns.length > 0 && (
            <View style={styles.addOnsSection}>
              <Text style={styles.addOnsTitle}>Add-ons</Text>
              {service.addOns.map(addOn => (
                <TouchableOpacity
                  key={addOn.id}
                  style={styles.addOnItem}
                  onPress={() => toggleAddOn(addOn.id)}
                >
                  <View style={styles.addOnInfo}>
                    <Text style={styles.addOnName}>{addOn.name}</Text>
                    <Text style={styles.addOnDescription}>{addOn.description}</Text>
                  </View>
                  <View style={styles.addOnRight}>
                    <Text style={styles.addOnPrice}>{addOn.price}</Text>
                    <View style={[styles.checkbox, selectedAddOns.includes(addOn.id) && styles.checkedBox]}>
                      {selectedAddOns.includes(addOn.id) && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#4267FF" />
          </View>
        )}
      </TouchableOpacity>
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
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Select Service</Text>
          <Text style={styles.headerSubtitle}>Choose from {stylistData.name}'s services</Text>
        </View>
        
        <View style={styles.stylistPreview}>
          <Image source={{ uri: stylistData.avatar }} style={styles.stylistAvatar} />
        </View>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortButtons}>
          {renderSortButton('popular', 'Popular')}
          {renderSortButton('price', 'Price')}
          {renderSortButton('duration', 'Duration')}
        </ScrollView>
      </View>

      {/* Services List */}
      <ScrollView style={styles.servicesList} showsVerticalScrollIndicator={false}>
        <View style={styles.servicesContainer}>
          {getSortedServices().map(renderService)}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      {selectedService && (
        <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>${calculateTotal()}</Text>
          </View>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue to Booking</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  stylistPreview: {
    width: 40,
    height: 40,
  },
  stylistAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sortLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginRight: 12,
  },
  sortButtons: {
    flex: 1,
  },
  sortButton: {
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeSortButton: {
    backgroundColor: '#4267FF',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeSortButtonText: {
    color: 'white',
  },
  servicesList: {
    flex: 1,
  },
  servicesContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  selectedServiceCard: {
    borderWidth: 2,
    borderColor: '#4267FF',
    shadowColor: '#4267FF',
    shadowOpacity: 0.1,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  serviceImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  serviceContent: {
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    flex: 1,
    marginRight: 12,
  },
  servicePricing: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4267FF',
  },
  serviceDuration: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  serviceDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  addOnsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  addOnsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  addOnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addOnInfo: {
    flex: 1,
    marginRight: 12,
  },
  addOnName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  addOnDescription: {
    fontSize: 13,
    color: '#666',
  },
  addOnRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addOnPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4267FF',
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#4267FF',
    borderColor: '#4267FF',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  continueButton: {
    backgroundColor: '#4267FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
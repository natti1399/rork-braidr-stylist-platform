import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Switch,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FilterState {
  priceRange: {
    min: number;
    max: number;
  };
  distance: number;
  rating: number;
  availability: {
    today: boolean;
    tomorrow: boolean;
    thisWeek: boolean;
    flexible: boolean;
  };
  services: string[];
  experience: string[];
  features: string[];
  sortBy: string;
}

interface AdvancedFiltersScreenProps {
  route?: {
    params?: {
      currentFilters?: Partial<FilterState>;
    };
  };
  navigation?: any;
}

const serviceTypes = [
  'Box Braids', 'Knotless Braids', 'Goddess Braids', 'Jumbo Braids', 
  'Twist Braids', 'Cornrows', 'French Braids', 'Dutch Braids',
  'Fulani Braids', 'Lemonade Braids', 'Passion Twists', 'Spring Twists'
];

const experienceLevels = [
  '1-2 years', '3-5 years', '5+ years', '10+ years'
];

const specialFeatures = [
  'Accepts Walk-ins', 'Home Service', 'Late Hours', 'Weekend Available',
  'Child Friendly', 'Verified Photos', 'Quick Response', 'Same Day Booking'
];

const sortOptions = [
  { id: 'relevance', label: 'Most Relevant' },
  { id: 'distance', label: 'Closest First' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'reviews', label: 'Most Reviews' },
  { id: 'newest', label: 'Newest First' }
];

const priceRanges = [
  { min: 0, max: 100, label: 'Under $100' },
  { min: 100, max: 200, label: '$100 - $200' },
  { min: 200, max: 300, label: '$200 - $300' },
  { min: 300, max: 500, label: '$300 - $500' },
  { min: 500, max: 1000, label: '$500+' }
];

const distanceOptions = [5, 10, 25, 50];

export default function AdvancedFiltersScreen({ route, navigation }: AdvancedFiltersScreenProps) {
  const insets = useSafeAreaInsets();
  
  const initialFilters: FilterState = {
    priceRange: { min: 0, max: 1000 },
    distance: 25,
    rating: 0,
    availability: {
      today: false,
      tomorrow: false,
      thisWeek: false,
      flexible: true
    },
    services: [],
    experience: [],
    features: [],
    sortBy: 'relevance',
    ...route?.params?.currentFilters
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [hasChanges, setHasChanges] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateNestedFilter = (key: keyof FilterState, nestedKey: string, value: any) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: { ...prev[key], [nestedKey]: value }
    }));
    setHasChanges(true);
  };

  const toggleArrayFilter = (key: keyof FilterState, item: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
    setHasChanges(true);
  };

  const applyFilters = () => {
    navigation?.navigate('CustomerSearch', { filters });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    
    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) count++;
    if (filters.distance < 50) count++;
    if (filters.rating > 0) count++;
    if (Object.values(filters.availability).some(v => v && filters.availability.flexible === false)) count++;
    if (filters.services.length > 0) count++;
    if (filters.experience.length > 0) count++;
    if (filters.features.length > 0) count++;
    if (filters.sortBy !== 'relevance') count++;
    
    return count;
  };

  const renderPriceRange = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Price Range</Text>
      <View style={styles.priceRangeContainer}>
        {priceRanges.map((range, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.priceRangeOption,
              filters.priceRange.min === range.min && filters.priceRange.max === range.max && styles.activeOption
            ]}
            onPress={() => updateFilter('priceRange', { min: range.min, max: range.max })}
          >
            <Text style={[
              styles.optionText,
              filters.priceRange.min === range.min && filters.priceRange.max === range.max && styles.activeOptionText
            ]}>
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.customPriceRange}>
        <Text style={styles.customPriceLabel}>Custom Range</Text>
        <View style={styles.priceInputContainer}>
          <TextInput
            style={styles.priceInput}
            placeholder="Min"
            value={filters.priceRange.min.toString()}
            onChangeText={(text) => updateNestedFilter('priceRange', 'min', parseInt(text) || 0)}
            keyboardType="numeric"
          />
          <Text style={styles.priceSeparator}>to</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="Max"
            value={filters.priceRange.max.toString()}
            onChangeText={(text) => updateNestedFilter('priceRange', 'max', parseInt(text) || 1000)}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderDistance = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Distance</Text>
      <View style={styles.distanceContainer}>
        {distanceOptions.map((distance) => (
          <TouchableOpacity
            key={distance}
            style={[
              styles.distanceOption,
              filters.distance === distance && styles.activeOption
            ]}
            onPress={() => updateFilter('distance', distance)}
          >
            <Text style={[
              styles.optionText,
              filters.distance === distance && styles.activeOptionText
            ]}>
              {distance} mi
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRating = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Minimum Rating</Text>
      <View style={styles.ratingContainer}>
        {[0, 3, 4, 4.5, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingOption,
              filters.rating === rating && styles.activeOption
            ]}
            onPress={() => updateFilter('rating', rating)}
          >
            <View style={styles.ratingContent}>
              {rating === 0 ? (
                <Text style={[styles.optionText, filters.rating === rating && styles.activeOptionText]}>
                  Any
                </Text>
              ) : (
                <>
                  <Text style={[styles.optionText, filters.rating === rating && styles.activeOptionText]}>
                    {rating}
                  </Text>
                  <Ionicons 
                    name="star" 
                    size={16} 
                    color={filters.rating === rating ? "white" : "#FFD700"} 
                    style={styles.ratingIcon}
                  />
                </>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAvailability = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Availability</Text>
      <View style={styles.availabilityContainer}>
        <View style={styles.availabilityOption}>
          <Text style={styles.availabilityLabel}>Available Today</Text>
          <Switch
            value={filters.availability.today}
            onValueChange={(value) => updateNestedFilter('availability', 'today', value)}
            trackColor={{ false: '#E5E5EA', true: '#4267FF' }}
            thumbColor="white"
          />
        </View>
        <View style={styles.availabilityOption}>
          <Text style={styles.availabilityLabel}>Available Tomorrow</Text>
          <Switch
            value={filters.availability.tomorrow}
            onValueChange={(value) => updateNestedFilter('availability', 'tomorrow', value)}
            trackColor={{ false: '#E5E5EA', true: '#4267FF' }}
            thumbColor="white"
          />
        </View>
        <View style={styles.availabilityOption}>
          <Text style={styles.availabilityLabel}>Available This Week</Text>
          <Switch
            value={filters.availability.thisWeek}
            onValueChange={(value) => updateNestedFilter('availability', 'thisWeek', value)}
            trackColor={{ false: '#E5E5EA', true: '#4267FF' }}
            thumbColor="white"
          />
        </View>
        <View style={styles.availabilityOption}>
          <Text style={styles.availabilityLabel}>Flexible Scheduling</Text>
          <Switch
            value={filters.availability.flexible}
            onValueChange={(value) => updateNestedFilter('availability', 'flexible', value)}
            trackColor={{ false: '#E5E5EA', true: '#4267FF' }}
            thumbColor="white"
          />
        </View>
      </View>
    </View>
  );

  const renderServices = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Service Types</Text>
      <View style={styles.tagsContainer}>
        {serviceTypes.map((service) => (
          <TouchableOpacity
            key={service}
            style={[
              styles.tag,
              filters.services.includes(service) && styles.activeTag
            ]}
            onPress={() => toggleArrayFilter('services', service)}
          >
            <Text style={[
              styles.tagText,
              filters.services.includes(service) && styles.activeTagText
            ]}>
              {service}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExperience = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Experience Level</Text>
      <View style={styles.tagsContainer}>
        {experienceLevels.map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.tag,
              filters.experience.includes(level) && styles.activeTag
            ]}
            onPress={() => toggleArrayFilter('experience', level)}
          >
            <Text style={[
              styles.tagText,
              filters.experience.includes(level) && styles.activeTagText
            ]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFeatures = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Special Features</Text>
      <View style={styles.tagsContainer}>
        {specialFeatures.map((feature) => (
          <TouchableOpacity
            key={feature}
            style={[
              styles.tag,
              filters.features.includes(feature) && styles.activeTag
            ]}
            onPress={() => toggleArrayFilter('features', feature)}
          >
            <Text style={[
              styles.tagText,
              filters.features.includes(feature) && styles.activeTagText
            ]}>
              {feature}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSortBy = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Sort By</Text>
      <View style={styles.sortContainer}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.sortOption,
              filters.sortBy === option.id && styles.activeSortOption
            ]}
            onPress={() => updateFilter('sortBy', option.id)}
          >
            <Text style={[
              styles.sortOptionText,
              filters.sortBy === option.id && styles.activeSortOptionText
            ]}>
              {option.label}
            </Text>
            {filters.sortBy === option.id && (
              <Ionicons name="checkmark" size={20} color="#4267FF" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
        
        <Text style={styles.headerTitle}>Filters</Text>
        
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearAllFilters}
        >
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters Count */}
      {getActiveFiltersCount() > 0 && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>
            {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? 's' : ''} active
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPriceRange()}
        {renderDistance()}
        {renderRating()}
        {renderAvailability()}
        {renderServices()}
        {renderExperience()}
        {renderFeatures()}
        {renderSortBy()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Apply Button */}
      <View style={[styles.applyContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity 
          style={[styles.applyButton, hasChanges && styles.applyButtonActive]}
          onPress={applyFilters}
          disabled={!hasChanges}
        >
          <Text style={[styles.applyButtonText, hasChanges && styles.applyButtonTextActive]}>
            Apply Filters
          </Text>
          <Ionicons 
            name="checkmark" 
            size={20} 
            color={hasChanges ? "white" : "#8E8E93"} 
          />
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
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  activeFiltersContainer: {
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  activeFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4267FF',
  },
  content: {
    flex: 1,
  },
  filterSection: {
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
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  priceRangeContainer: {
    gap: 8,
    marginBottom: 16,
  },
  priceRangeOption: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  customPriceRange: {
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
    paddingTop: 16,
  },
  customPriceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
  },
  priceSeparator: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  distanceContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  distanceOption: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeOption: {
    backgroundColor: '#4267FF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  activeOptionText: {
    color: 'white',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingOption: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    marginLeft: 4,
  },
  availabilityContainer: {
    gap: 16,
  },
  availabilityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityLabel: {
    fontSize: 16,
    color: '#222',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTag: {
    backgroundColor: '#4267FF',
    borderColor: '#4267FF',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
  },
  activeTagText: {
    color: 'white',
  },
  sortContainer: {
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  activeSortOption: {
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#4267FF',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#222',
  },
  activeSortOptionText: {
    fontWeight: '600',
    color: '#4267FF',
  },
  bottomSpacing: {
    height: 100,
  },
  applyContainer: {
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
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f3f4',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  applyButtonActive: {
    backgroundColor: '#4267FF',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8E8E93',
  },
  applyButtonTextActive: {
    color: 'white',
  },
});
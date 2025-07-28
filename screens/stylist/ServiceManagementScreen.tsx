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

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  image: string;
  isActive: boolean;
  bookingsCount: number;
}

interface ServiceManagementScreenProps {
  navigation?: any;
}

// Sample services data
const initialServices: Service[] = [
  {
    id: '1',
    name: 'Medium Box Braids',
    description: 'Classic medium-sized box braids, perfect for everyday wear',
    price: 180,
    duration: '4-6 hours',
    category: 'Box Braids',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=300&q=80',
    isActive: true,
    bookingsCount: 24
  },
  {
    id: '2',
    name: 'Small Box Braids',
    description: 'Detailed small box braids for a more intricate look',
    price: 220,
    duration: '6-8 hours',
    category: 'Box Braids',
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=300&q=80',
    isActive: true,
    bookingsCount: 18
  },
  {
    id: '3',
    name: 'Knotless Braids',
    description: 'Gentle knotless braids that reduce tension on your scalp',
    price: 250,
    duration: '5-7 hours',
    category: 'Knotless',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=300&q=80',
    isActive: true,
    bookingsCount: 31
  },
  {
    id: '4',
    name: 'Jumbo Braids',
    description: 'Quick and stylish jumbo braids for a bold look',
    price: 120,
    duration: '2-3 hours',
    category: 'Jumbo',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80',
    isActive: false,
    bookingsCount: 7
  }
];

const categories = ['All', 'Box Braids', 'Knotless', 'Jumbo', 'Goddess', 'Twist'];

export default function ServiceManagementScreen({ navigation }: ServiceManagementScreenProps) {
  const insets = useSafeAreaInsets();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Form state
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Box Braids');

  const filteredServices = selectedCategory === 'All' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const activeServices = services.filter(s => s.isActive).length;
  const totalBookings = services.reduce((sum, s) => sum + s.bookingsCount, 0);

  const resetForm = () => {
    setServiceName('');
    setServiceDescription('');
    setServicePrice('');
    setServiceDuration('');
    setServiceCategory('Box Braids');
    setEditingService(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
    setServiceDescription(service.description);
    setServicePrice(service.price.toString());
    setServiceDuration(service.duration);
    setServiceCategory(service.category);
    setShowAddModal(true);
  };

  const handleSaveService = () => {
    if (!serviceName.trim() || !serviceDescription.trim() || !servicePrice.trim() || !serviceDuration.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    const price = parseInt(servicePrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }

    if (editingService) {
      // Update existing service
      setServices(prev => prev.map(service => 
        service.id === editingService.id 
          ? {
              ...service,
              name: serviceName,
              description: serviceDescription,
              price,
              duration: serviceDuration,
              category: serviceCategory
            }
          : service
      ));
    } else {
      // Add new service
      const newService: Service = {
        id: Date.now().toString(),
        name: serviceName,
        description: serviceDescription,
        price,
        duration: serviceDuration,
        category: serviceCategory,
        image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=300&q=80',
        isActive: true,
        bookingsCount: 0
      };
      setServices(prev => [...prev, newService]);
    }

    setShowAddModal(false);
    resetForm();
  };

  const toggleServiceStatus = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, isActive: !service.isActive }
        : service
    ));
  };

  const deleteService = (serviceId: string) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setServices(prev => prev.filter(service => service.id !== serviceId));
          }
        }
      ]
    );
  };

  const renderCategoryTab = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[styles.categoryTab, selectedCategory === category && styles.activeCategoryTab]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[styles.categoryTabText, selectedCategory === category && styles.activeCategoryTabText]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderService = (service: Service) => (
    <View key={service.id} style={styles.serviceCard}>
      <Image source={{ uri: service.image }} style={styles.serviceImage} />
      
      <View style={styles.serviceContent}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceTitleContainer}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <View style={[styles.statusBadge, service.isActive ? styles.activeBadge : styles.inactiveBadge]}>
              <Text style={[styles.statusText, service.isActive ? styles.activeText : styles.inactiveText]}>
                {service.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          
          <View style={styles.serviceActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => openEditModal(service)}
            >
              <Ionicons name="pencil" size={18} color="#4267FF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => toggleServiceStatus(service.id)}
            >
              <Ionicons 
                name={service.isActive ? "eye-off" : "eye"} 
                size={18} 
                color={service.isActive ? "#FF3B30" : "#34C759"} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => deleteService(service.id)}
            >
              <Ionicons name="trash" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.serviceDescription}>{service.description}</Text>
        
        <View style={styles.serviceDetails}>
          <View style={styles.serviceDetailItem}>
            <Ionicons name="pricetag" size={16} color="#4267FF" />
            <Text style={styles.serviceDetailText}>${service.price}</Text>
          </View>
          <View style={styles.serviceDetailItem}>
            <Ionicons name="time" size={16} color="#4267FF" />
            <Text style={styles.serviceDetailText}>{service.duration}</Text>
          </View>
          <View style={styles.serviceDetailItem}>
            <Ionicons name="calendar" size={16} color="#4267FF" />
            <Text style={styles.serviceDetailText}>{service.bookingsCount} bookings</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAddEditModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalHeader, { paddingTop: Math.max(insets.top, 20) }]}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => {
              setShowAddModal(false);
              resetForm();
            }}
          >
            <Ionicons name="close" size={24} color="#4267FF" />
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>
            {editingService ? 'Edit Service' : 'Add New Service'}
          </Text>
          
          <TouchableOpacity 
            style={styles.modalSaveButton}
            onPress={handleSaveService}
          >
            <Text style={styles.modalSaveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Service Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g., Medium Box Braids"
              placeholderTextColor="#8E8E93"
              value={serviceName}
              onChangeText={setServiceName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.formInput, styles.multilineInput]}
              placeholder="Describe your service..."
              placeholderTextColor="#8E8E93"
              value={serviceDescription}
              onChangeText={setServiceDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.formLabel}>Price ($)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="180"
                placeholderTextColor="#8E8E93"
                value={servicePrice}
                onChangeText={setServicePrice}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroupHalf}>
              <Text style={styles.formLabel}>Duration</Text>
              <TextInput
                style={styles.formInput}
                placeholder="4-6 hours"
                placeholderTextColor="#8E8E93"
                value={serviceDuration}
                onChangeText={setServiceDuration}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
              {categories.filter(c => c !== 'All').map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categorySelectorItem,
                    serviceCategory === category && styles.selectedCategorySelectorItem
                  ]}
                  onPress={() => setServiceCategory(category)}
                >
                  <Text style={[
                    styles.categorySelectorText,
                    serviceCategory === category && styles.selectedCategorySelectorText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
        
        <Text style={styles.headerTitle}>Manage Services</Text>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Ionicons name="add" size={24} color="#4267FF" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeServices}</Text>
          <Text style={styles.statLabel}>Active Services</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalBookings}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>${services.reduce((sum, s) => sum + (s.price * s.bookingsCount), 0)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabsScroll}>
          {categories.map(renderCategoryTab)}
        </ScrollView>
      </View>

      {/* Services List */}
      <ScrollView style={styles.servicesList} showsVerticalScrollIndicator={false}>
        <View style={styles.servicesContainer}>
          {filteredServices.length > 0 ? (
            filteredServices.map(renderService)
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="cut-outline" size={48} color="#8E8E93" />
              </View>
              <Text style={styles.emptyStateTitle}>No Services Found</Text>
              <Text style={styles.emptyStateDescription}>
                {selectedCategory === 'All' 
                  ? 'Add your first service to start receiving bookings'
                  : `No services in the ${selectedCategory} category`
                }
              </Text>
              {selectedCategory === 'All' && (
                <TouchableOpacity style={styles.emptyStateButton} onPress={openAddModal}>
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.emptyStateButtonText}>Add Service</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      {renderAddEditModal()}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4267FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  categoryTabs: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingVertical: 16,
  },
  categoryTabsScroll: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeCategoryTab: {
    backgroundColor: '#4267FF',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeCategoryTabText: {
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
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  serviceContent: {
    padding: 16,
  },
  serviceHeader: {
    marginBottom: 8,
  },
  serviceTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#34C759',
  },
  inactiveText: {
    color: '#FF3B30',
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceDetailText: {
    fontSize: 13,
    color: '#4267FF',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(142, 142, 147, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4267FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
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
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },
  modalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4267FF',
    borderRadius: 20,
  },
  modalSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
  },
  categorySelectorItem: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedCategorySelectorItem: {
    backgroundColor: '#4267FF',
    borderColor: '#4267FF',
  },
  categorySelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedCategorySelectorText: {
    color: 'white',
  },
});
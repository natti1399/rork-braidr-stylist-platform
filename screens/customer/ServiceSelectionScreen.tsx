import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { bookingService, type Service, type Stylist } from '../../src/services/bookingService';

interface RouteParams {
  stylistId: string;
}

interface SelectedService extends Service {
  addOns?: string[];
}

export default function ServiceSelectionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { stylistId } = route.params as RouteParams;
  
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [stylistId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load stylist details
      const stylistResponse = await bookingService.getStylistDetails(stylistId);
      if (stylistResponse.success && stylistResponse.data) {
        setStylist(stylistResponse.data);
      }

      // Load services
      const servicesResponse = await bookingService.getStylistServices(stylistId);
      if (servicesResponse.success && servicesResponse.data) {
        setServices(servicesResponse.data);
      } else {
        Alert.alert('Error', 'No services available for this stylist');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load services');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceSelection = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, { ...service, addOns: [] }];
      }
    });
  };

  const toggleAddOn = (serviceId: string, addOn: string) => {
    setSelectedServices(prev => 
      prev.map(service => {
        if (service.id === serviceId) {
          const currentAddOns = service.addOns || [];
          const hasAddOn = currentAddOns.includes(addOn);
          return {
            ...service,
            addOns: hasAddOn 
              ? currentAddOns.filter(a => a !== addOn)
              : [...currentAddOns, addOn]
          };
        }
        return service;
      })
    );
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => {
      let serviceTotal = service.price;
      // Add add-on prices (assuming $10 per add-on for now)
      if (service.addOns) {
        serviceTotal += service.addOns.length * 10;
      }
      return total + serviceTotal;
    }, 0);
  };

  const calculateDuration = () => {
    return selectedServices.reduce((total, service) => {
      return total + (service.durationMinutes || 60);
    }, 0);
  };

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      Alert.alert('Select Services', 'Please select at least one service to continue.');
      return;
    }

    navigation.navigate('BookingDateTime', {
      stylistId,
      selectedServices: selectedServices.map(service => ({
        serviceId: service.id,
        addOns: service.addOns || []
      }))
    });
  };

  const renderServiceCard = (service: Service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    const selectedService = selectedServices.find(s => s.id === service.id);
    
    return (
      <View key={service.id} style={styles.serviceCard}>
        <TouchableOpacity 
          style={[styles.serviceHeader, isSelected && styles.selectedServiceHeader]}
          onPress={() => toggleServiceSelection(service)}
        >
          <View style={styles.serviceInfo}>
            <Text style={[styles.serviceName, isSelected && styles.selectedServiceName]}>
              {service.name}
            </Text>
            <Text style={styles.serviceDescription} numberOfLines={2}>
              {service.description}
            </Text>
            <View style={styles.serviceDetails}>
              <View style={styles.serviceDuration}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.serviceDurationText}>{service.duration}</Text>
              </View>
              <Text style={styles.servicePrice}>${service.price}</Text>
            </View>
          </View>
          <View style={[styles.selectionIndicator, isSelected && styles.selectedIndicator]}>
            {isSelected && <Ionicons name="checkmark" size={20} color="white" />}
          </View>
        </TouchableOpacity>

        {/* Add-ons */}
        {isSelected && service.addOns && service.addOns.length > 0 && (
          <View style={styles.addOnsSection}>
            <Text style={styles.addOnsTitle}>Add-ons (+$10 each)</Text>
            {service.addOns.map((addOn, index) => {
              const isAddOnSelected = selectedService?.addOns?.includes(addOn) || false;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.addOnItem}
                  onPress={() => toggleAddOn(service.id, addOn)}
                >
                  <View style={[styles.addOnCheckbox, isAddOnSelected && styles.selectedAddOnCheckbox]}>
                    {isAddOnSelected && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <Text style={[styles.addOnText, isAddOnSelected && styles.selectedAddOnText]}>
                    {addOn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4267FF" />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  const displayName = stylist?.businessName || stylist?.bio.split(' ').slice(0, 2).join(' ') || 'Stylist';
  const totalPrice = calculateTotal();
  const totalDuration = calculateDuration();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Select Services</Text>
          <Text style={styles.headerSubtitle}>{displayName}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle-outline" size={24} color="#4267FF" />
          <View style={styles.instructionsText}>
            <Text style={styles.instructionsTitle}>Choose Your Services</Text>
            <Text style={styles.instructionsSubtitle}>
              Select one or more services and customize with add-ons
            </Text>
          </View>
        </View>

        {/* Services List */}
        <View style={styles.servicesSection}>
          {services.map(renderServiceCard)}
        </View>

        {/* Selected Services Summary */}
        {selectedServices.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Selected Services ({selectedServices.length})</Text>
            {selectedServices.map((service, index) => (
              <View key={service.id} style={styles.summaryItem}>
                <Text style={styles.summaryServiceName}>{service.name}</Text>
                <Text style={styles.summaryServicePrice}>
                  ${service.price + (service.addOns?.length || 0) * 10}
                </Text>
              </View>
            ))}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalPrice}>${totalPrice}</Text>
            </View>
            <Text style={styles.summaryDuration}>
              Estimated duration: {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      {selectedServices.length > 0 && (
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>
              Continue to Date & Time (${totalPrice})
            </Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#4267FF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backIcon: {
    padding: 8,
    marginRight: 8
  },
  headerInfo: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white'
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2
  },
  headerSpacer: {
    width: 40
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
  instructionsCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  instructionsText: {
    flex: 1,
    marginLeft: 12
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4
  },
  instructionsSubtitle: {
    fontSize: 14,
    color: '#666'
  },
  servicesSection: {
    paddingHorizontal: 20
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  serviceHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectedServiceHeader: {
    backgroundColor: '#f0f4ff'
  },
  serviceInfo: {
    flex: 1
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4
  },
  selectedServiceName: {
    color: '#4267FF'
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20
  },
  serviceDetails: {
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
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4267FF'
  },
  selectionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12
  },
  selectedIndicator: {
    backgroundColor: '#4267FF',
    borderColor: '#4267FF'
  },
  addOnsSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 16
  },
  addOnsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12
  },
  addOnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  addOnCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  selectedAddOnCheckbox: {
    backgroundColor: '#4267FF',
    borderColor: '#4267FF'
  },
  addOnText: {
    fontSize: 14,
    color: '#666'
  },
  selectedAddOnText: {
    color: '#4267FF',
    fontWeight: '500'
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  summaryServiceName: {
    fontSize: 14,
    color: '#666',
    flex: 1
  },
  summaryServicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222'
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222'
  },
  summaryTotalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4267FF'
  },
  summaryDuration: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  bottomSection: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  continueButton: {
    backgroundColor: '#4267FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
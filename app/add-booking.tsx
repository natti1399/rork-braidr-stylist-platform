import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Clock, User, CheckCircle, AlertCircle, DollarSign, Timer } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";

import { Button } from "@/components/ui/Button";
import { CalendarView } from "@/components/ui/CalendarView";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { useAppointments, useServices } from "@/context/StylistContext";
import { Service } from "@/types";

export default function AddBookingScreen() {
  const router = useRouter();
  const { services } = useServices();
  const { addAppointment } = useAppointments();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];
  
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }
    
    if (!customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required";
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(customerPhone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.customerPhone = "Please enter a valid phone number";
    }
    
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email address";
    }
    
    if (!selectedService) {
      newErrors.service = "Please select a service";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateBooking = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors and try again.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const appointmentDate = selectedDate.toISOString().split("T")[0];
      const duration = selectedService!.duration || 60;
      const endTime = calculateEndTime(selectedTime, duration);
      
      await addAppointment({
        date: appointmentDate,
        startTime: selectedTime,
        endTime: endTime,
        service: selectedService!,
        customer: {
          id: Date.now().toString(),
          name: customerName.trim(),
          email: customerEmail.trim() || `${customerPhone}@temp.com`,
          phone: customerPhone.trim(),
          avatar: undefined,
        },
        status: "confirmed",
        price: selectedService!.price,
        location: "Studio",
        notes: notes.trim() || undefined,
      });
      
      Alert.alert(
        "Booking Created!", 
        `Appointment scheduled for ${customerName} on ${selectedDate.toLocaleDateString()} at ${formatTime(selectedTime)}.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Failed to create booking:", error);
      Alert.alert("Error", "Failed to create booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
  };
  
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const isTimeSlotAvailable = (time: string): boolean => {
    // This would check against existing appointments in a real app
    // For now, we'll just return true
    return true;
  };

  const getTotalPrice = (): string => {
    return selectedService?.price || "$0";
  };

  const getEstimatedDuration = (): string => {
    if (!selectedService?.duration) return "";
    const hours = Math.floor(selectedService.duration / 60);
    const minutes = selectedService.duration % 60;
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Booking</Text>
      </View>
      
      <Card variant="elevated" style={styles.customerCard}>
        <View style={styles.sectionHeader}>
          <User size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Customer Information</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Customer Name *</Text>
          <TextInput
            style={[styles.textInput, errors.customerName && styles.inputError]}
            value={customerName}
            onChangeText={(text) => {
              setCustomerName(text);
              if (errors.customerName) {
                setErrors(prev => ({ ...prev, customerName: '' }));
              }
            }}
            placeholder="Enter customer name"
            placeholderTextColor={Colors.text.secondary}
          />
          {errors.customerName && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={Colors.error} />
              <Text style={styles.errorText}>{errors.customerName}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput
            style={[styles.textInput, errors.customerPhone && styles.inputError]}
            value={customerPhone}
            onChangeText={(text) => {
              setCustomerPhone(text);
              if (errors.customerPhone) {
                setErrors(prev => ({ ...prev, customerPhone: '' }));
              }
            }}
            placeholder="Enter phone number"
            placeholderTextColor={Colors.text.secondary}
            keyboardType="phone-pad"
          />
          {errors.customerPhone && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={Colors.error} />
              <Text style={styles.errorText}>{errors.customerPhone}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email (Optional)</Text>
          <TextInput
            style={[styles.textInput, errors.customerEmail && styles.inputError]}
            value={customerEmail}
            onChangeText={(text) => {
              setCustomerEmail(text);
              if (errors.customerEmail) {
                setErrors(prev => ({ ...prev, customerEmail: '' }));
              }
            }}
            placeholder="Enter email address"
            placeholderTextColor={Colors.text.secondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.customerEmail && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={Colors.error} />
              <Text style={styles.errorText}>{errors.customerEmail}</Text>
            </View>
          )}
        </View>
      </Card>
      
      <Card variant="elevated" style={styles.serviceCard}>
        <Text style={styles.sectionTitle}>Select Service *</Text>
        {errors.service && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color={Colors.error} />
            <Text style={styles.errorText}>{errors.service}</Text>
          </View>
        )}
        <View style={styles.serviceList}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceOption,
                selectedService?.id === service.id && styles.selectedServiceOption,
              ]}
              onPress={() => {
                setSelectedService(service);
                if (errors.service) {
                  setErrors(prev => ({ ...prev, service: '' }));
                }
              }}
            >
              <View style={styles.serviceInfo}>
                <View style={styles.serviceHeader}>
                  <Text style={[
                    styles.serviceName,
                    selectedService?.id === service.id && styles.selectedServiceText,
                  ]}>
                    {service.name}
                  </Text>
                  {selectedService?.id === service.id && (
                    <CheckCircle size={20} color={Colors.text.light} />
                  )}
                </View>
                <View style={styles.serviceMetrics}>
                  <View style={styles.serviceMetric}>
                    <Timer size={14} color={selectedService?.id === service.id ? Colors.text.light : Colors.text.secondary} />
                    <Text style={[
                      styles.serviceMetricText,
                      selectedService?.id === service.id && styles.selectedServiceText,
                    ]}>
                      {service.duration ? `${Math.floor(service.duration / 60)}h ${service.duration % 60}m` : "N/A"}
                    </Text>
                  </View>
                  <View style={styles.serviceMetric}>
                    <DollarSign size={14} color={selectedService?.id === service.id ? Colors.text.light : Colors.text.secondary} />
                    <Text style={[
                      styles.servicePriceText,
                      selectedService?.id === service.id && styles.selectedServiceText,
                    ]}>
                      {service.price}
                    </Text>
                  </View>
                </View>
                {service.description && (
                  <Text style={[
                    styles.serviceDescription,
                    selectedService?.id === service.id && styles.selectedServiceText,
                  ]}>
                    {service.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
      
      <Card variant="elevated" style={styles.calendarCard}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Select Date</Text>
        </View>
        <CalendarView
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          markedDates={[]}
        />
      </Card>
      
      <Card variant="elevated" style={styles.timeCard}>
        <View style={styles.sectionHeader}>
          <Clock size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Select Time</Text>
        </View>
        <View style={styles.timeSlots}>
          {timeSlots.map((time) => {
            const isAvailable = isTimeSlotAvailable(time);
            const isSelected = selectedTime === time;
            
            return (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  isSelected && styles.selectedTimeSlot,
                  !isAvailable && styles.unavailableTimeSlot,
                ]}
                onPress={() => isAvailable && setSelectedTime(time)}
                disabled={!isAvailable}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    isSelected && styles.selectedTimeSlotText,
                    !isAvailable && styles.unavailableTimeSlotText,
                  ]}
                >
                  {formatTime(time)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>
      
      <Card variant="outlined" style={styles.notesCard}>
        <Text style={styles.sectionTitle}>Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any special notes or requests..."
          placeholderTextColor={Colors.text.secondary}
          multiline
          numberOfLines={3}
        />
      </Card>
      
      {selectedService && (
        <Card variant="outlined" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service:</Text>
            <Text style={styles.summaryValue}>{selectedService.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>{selectedDate.toLocaleDateString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time:</Text>
            <Text style={styles.summaryValue}>{formatTime(selectedTime)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration:</Text>
            <Text style={styles.summaryValue}>{getEstimatedDuration()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{getTotalPrice()}</Text>
          </View>
        </Card>
      )}
      
      <View style={styles.actionButtons}>
        <Button
          title={isLoading ? "Creating Booking..." : "Create Booking"}
          onPress={handleCreateBooking}
          fullWidth
          disabled={!selectedService || !customerName || !customerPhone || isLoading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  customerCard: {
    margin: 16,
  },
  serviceCard: {
    margin: 16,
    marginTop: 0,
  },
  calendarCard: {
    margin: 16,
    marginTop: 0,
  },
  timeCard: {
    margin: 16,
    marginTop: 0,
  },
  notesCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
  },
  serviceList: {
    gap: 8,
  },
  serviceOption: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background.primary,
  },
  selectedServiceOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  serviceDetails: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  selectedServiceText: {
    color: Colors.text.light,
  },
  timeSlots: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background.primary,
    minWidth: 80,
    alignItems: "center",
  },
  selectedTimeSlot: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeSlotText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  selectedTimeSlotText: {
    color: Colors.text.light,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
    textAlignVertical: "top",
    minHeight: 80,
  },
  actionButtons: {
    padding: 16,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginLeft: 4,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  serviceMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceMetricText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  servicePriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  serviceDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  },
  unavailableTimeSlot: {
    backgroundColor: Colors.background.secondary,
    borderColor: Colors.border,
    opacity: 0.5,
  },
  unavailableTimeSlotText: {
    color: Colors.text.secondary,
  },
  summaryCard: {
    margin: 16,
    marginTop: 0,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
});
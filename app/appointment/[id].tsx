import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Clock, MapPin, Phone, User } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { useAppointments } from "@/context/StylistContext";

export default function AppointmentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAppointmentById, updateAppointmentStatus } = useAppointments();
  
  const appointment = getAppointmentById(id!);
  
  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Appointment not found</Text>
      </View>
    );
  }
  
  const handleConfirm = async () => {
    try {
      await updateAppointmentStatus(appointment.id, "confirmed");
      router.back();
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
    }
  };
  
  const handleCancel = async () => {
    try {
      await updateAppointmentStatus(appointment.id, "cancelled");
      router.back();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };
  
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Appointment Details</Text>
      </View>
      
      <Card variant="elevated" style={styles.appointmentCard}>
        <View style={styles.customerSection}>
          <Avatar 
            uri={appointment.customer?.avatar} 
            name={appointment.customer?.name || "Customer"} 
            size="large" 
          />
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{appointment.customer?.name}</Text>
            <Text style={styles.customerPhone}>{appointment.customer?.phone}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.appointmentInfo}>
          <View style={styles.infoRow}>
            <Calendar size={20} color={Colors.text.secondary} />
            <Text style={styles.infoText}>{formatDate(appointment.date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={20} color={Colors.text.secondary} />
            <Text style={styles.infoText}>
              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <User size={20} color={Colors.text.secondary} />
            <Text style={styles.infoText}>{appointment.service?.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={20} color={Colors.text.secondary} />
            <Text style={styles.infoText}>{appointment.location || "Studio"}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceValue}>{appointment.price}</Text>
        </View>
        
        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={[
            styles.statusBadge,
            appointment.status === "confirmed" && styles.confirmedBadge,
            appointment.status === "pending" && styles.pendingBadge,
            appointment.status === "cancelled" && styles.cancelledBadge,
          ]}>
            <Text style={[
              styles.statusText,
              appointment.status === "confirmed" && styles.confirmedText,
              appointment.status === "pending" && styles.pendingText,
              appointment.status === "cancelled" && styles.cancelledText,
            ]}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Text>
          </View>
        </View>
      </Card>
      
      {appointment.notes && (
        <Card variant="outlined" style={styles.notesCard}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>{appointment.notes}</Text>
        </Card>
      )}
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.contactButton}>
          <Phone size={20} color={Colors.primary} />
          <Text style={styles.contactButtonText}>Call Customer</Text>
        </TouchableOpacity>
        
        {appointment.status === "pending" && (
          <View style={styles.confirmCancelButtons}>
            <Button
              title="Confirm"
              onPress={handleConfirm}
              style={styles.confirmButton}
            />
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
            />
          </View>
        )}
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
  appointmentCard: {
    margin: 16,
  },
  customerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  customerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  appointmentInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
  },
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  statusSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confirmedBadge: {
    backgroundColor: Colors.success + "20",
  },
  pendingBadge: {
    backgroundColor: Colors.warning + "20",
  },
  cancelledBadge: {
    backgroundColor: Colors.error + "20",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  confirmedText: {
    color: Colors.success,
  },
  pendingText: {
    color: Colors.warning,
  },
  cancelledText: {
    color: Colors.error,
  },
  notesCard: {
    margin: 16,
    marginTop: 0,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  actionButtons: {
    padding: 16,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.primary,
    marginLeft: 8,
  },
  confirmCancelButtons: {
    flexDirection: "row",
    gap: 12,
  },
  confirmButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
    marginTop: 100,
  },
});
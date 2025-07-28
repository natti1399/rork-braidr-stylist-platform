import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Clock } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { CalendarView } from "@/components/ui/CalendarView";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { useAppointments } from "@/context/StylistContext";

export default function RescheduleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAppointmentById, updateAppointment } = useAppointments();
  
  const appointment = getAppointmentById(id!);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("09:00");
  
  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Appointment not found</Text>
      </View>
    );
  }
  
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];
  
  const handleReschedule = async () => {
    try {
      const newDate = selectedDate.toISOString().split("T")[0];
      const duration = appointment.service?.duration || 60;
      const endTime = calculateEndTime(selectedTime, duration);
      
      await updateAppointment(appointment.id, {
        ...appointment,
        date: newDate,
        startTime: selectedTime,
        endTime: endTime,
      });
      
      router.back();
    } catch (error) {
      console.error("Failed to reschedule appointment:", error);
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
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Reschedule Appointment</Text>
      </View>
      
      <Card variant="outlined" style={styles.appointmentCard}>
        <Text style={styles.appointmentTitle}>Current Appointment</Text>
        <Text style={styles.appointmentDetails}>
          {appointment.service?.name} with {appointment.customer?.name}
        </Text>
        <Text style={styles.appointmentTime}>
          {new Date(appointment.date).toLocaleDateString()} at {formatTime(appointment.startTime)}
        </Text>
      </Card>
      
      <Card variant="elevated" style={styles.calendarCard}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Select New Date</Text>
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
          <Text style={styles.sectionTitle}>Select New Time</Text>
        </View>
        <View style={styles.timeSlots}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                selectedTime === time && styles.selectedTimeSlot,
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTime === time && styles.selectedTimeSlotText,
                ]}
              >
                {formatTime(time)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
      
      <View style={styles.actionButtons}>
        <Button
          title="Reschedule Appointment"
          onPress={handleReschedule}
          fullWidth
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
  appointmentCard: {
    margin: 16,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  appointmentDetails: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  calendarCard: {
    margin: 16,
    marginTop: 0,
  },
  timeCard: {
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
  actionButtons: {
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
    marginTop: 100,
  },
});
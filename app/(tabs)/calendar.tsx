import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { AppointmentCard } from "@/components/ui/AppointmentCard";
import { Button } from "@/components/ui/Button";
import { CalendarView } from "@/components/ui/CalendarView";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { useAppointments } from "@/context/StylistContext";
import { Appointment } from "@/types";

export default function CalendarScreen() {
  const router = useRouter();
  const { appointments, getAppointmentsByDate, updateAppointmentStatus } = useAppointments();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateAppointments, setSelectedDateAppointments] = useState<Appointment[]>([]);
  const [markedDates, setMarkedDates] = useState<Date[]>([]);
  
  useEffect(() => {
    // Get dates with appointments for the calendar
    const dates = appointments.map((appointment) => new Date(appointment.date));
    setMarkedDates(dates);
    
    // Format selected date to match appointment date format
    const formattedDate = selectedDate.toISOString().split("T")[0];
    setSelectedDateAppointments(getAppointmentsByDate(formattedDate));
  }, [appointments, selectedDate, getAppointmentsByDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleViewDetails = (appointment: Appointment) => {
    router.push(`/appointment/${appointment.id}` as const);
  };

  const handleConfirmAppointment = async (appointment: Appointment) => {
    try {
      await updateAppointmentStatus(appointment.id, "confirmed");
      // Refresh appointments for the selected date
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setSelectedDateAppointments(getAppointmentsByDate(formattedDate));
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      await updateAppointmentStatus(appointment.id, "cancelled");
      // Refresh appointments for the selected date
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setSelectedDateAppointments(getAppointmentsByDate(formattedDate));
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  const formatSelectedDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <CalendarView
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        markedDates={markedDates}
      />
      
      <View style={styles.appointmentsContainer}>
        <View style={styles.appointmentsHeader}>
          <Text style={styles.appointmentsTitle}>
            {formatSelectedDate(selectedDate)}
          </Text>
        </View>
        
        {selectedDateAppointments.length > 0 ? (
          <FlatList
            data={selectedDateAppointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AppointmentCard
                appointment={item}
                onViewDetails={handleViewDetails}
                onConfirm={item.status === "pending" ? handleConfirmAppointment : undefined}
                onCancel={
                  item.status !== "cancelled" ? handleCancelAppointment : undefined
                }
                onReschedule={() => router.push(`/reschedule/${item.id}` as const)}
              />
            )}
            contentContainerStyle={styles.appointmentsList}
          />
        ) : (
          <Card variant="outlined" style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>No appointments for this day.</Text>
            <Button
              title="Add Booking"
              leftIcon={<Plus size={16} color={Colors.text.light} />}
              onPress={() => router.push("/add-booking" as const)}
              style={styles.addButton}
            />
          </Card>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    padding: 16,
  },
  appointmentsContainer: {
    flex: 1,
  },
  appointmentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  appointmentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  appointmentsList: {
    paddingBottom: 16,
  },
  emptyStateCard: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
  },
});
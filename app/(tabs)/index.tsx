// Image import removed to fix unused import warning
import { useRouter } from "expo-router";
import { ChevronRight, Calendar, MessageCircle, Settings, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AppointmentCard } from "@/components/ui/AppointmentCard";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { useAppointments, useStylist } from "@/context/StylistContext";
import { Appointment } from "@/types";

export default function DashboardScreen() {
  const router = useRouter();
  const { stylist, isLoading } = useStylist();
  const { getUpcomingAppointments, getNextAppointment, getTodayAppointments, updateAppointmentStatus } = useAppointments();
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  
  useEffect(() => {
    if (!isLoading) {
      setUpcomingAppointments(getUpcomingAppointments().slice(0, 5));
      setTodayAppointments(getTodayAppointments());
      setNextAppointment(getNextAppointment());
    }
  }, [isLoading, getUpcomingAppointments, getTodayAppointments, getNextAppointment]);

  const handleViewAppointmentDetails = (appointment: Appointment) => {
    router.push(`/appointment/${appointment.id}` as const);
  };

  const handleConfirmAppointment = async (appointment: Appointment) => {
    try {
      await updateAppointmentStatus(appointment.id, "confirmed");
      // Refresh appointments
      setUpcomingAppointments(getUpcomingAppointments().slice(0, 5));
      setTodayAppointments(getTodayAppointments());
      setNextAppointment(getNextAppointment());
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getAppointmentSummary = (): string => {
    const todayCount = todayAppointments.length;
    const upcomingCount = upcomingAppointments.length;
    
    if (todayCount > 0) {
      return `You have ${todayCount} appointment${todayCount > 1 ? 's' : ''} today.`;
    }
    if (upcomingCount > 0) {
      return `You have ${upcomingCount} upcoming appointment${upcomingCount > 1 ? 's' : ''}.`;
    }
    return "No appointments scheduled.";
  };



  // Format time
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header with greeting and avatar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {getGreeting()}, {stylist?.name.split(" ")[0]}
            <Text style={styles.wave}> 👋</Text>
          </Text>
          <Text style={styles.subGreeting}>
            {getAppointmentSummary()}
          </Text>
        </View>
        <Avatar 
          uri={stylist?.avatar} 
          name={stylist?.name || "User"} 
          size="large" 
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => router.push("/add-booking" as const)}
        >
          <View style={styles.quickActionIcon}>
            <Plus size={20} color={Colors.primary} />
          </View>
          <Text style={styles.quickActionTitle}>Add Booking</Text>
          <Text style={styles.quickActionSubtitle}>Schedule new appointment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => router.push("/(tabs)/calendar" as const)}
        >
          <View style={styles.quickActionIcon}>
            <Calendar size={20} color={Colors.primary} />
          </View>
          <Text style={styles.quickActionTitle}>Calendar</Text>
          <Text style={styles.quickActionSubtitle}>View all appointments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => router.push("/(tabs)/messages" as const)}
        >
          <View style={styles.quickActionIcon}>
            <MessageCircle size={20} color={Colors.primary} />
          </View>
          <Text style={styles.quickActionTitle}>Messages</Text>
          <Text style={styles.quickActionSubtitle}>Chat with clients</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => router.push("/(tabs)/services" as const)}
        >
          <View style={styles.quickActionIcon}>
            <Settings size={20} color={Colors.primary} />
          </View>
          <Text style={styles.quickActionTitle}>Services</Text>
          <Text style={styles.quickActionSubtitle}>Manage offerings</Text>
        </TouchableOpacity>
      </View>

      {/* Next appointment */}
      {nextAppointment && (
        <Card variant="elevated" style={styles.nextAppointmentCard}>
          <View style={styles.nextAppointmentHeader}>
            <Text style={styles.sectionTitle}>Next Appointment</Text>
            <Text style={styles.nextAppointmentTime}>
              {nextAppointment.date === new Date().toISOString().split("T")[0]
                ? "Today"
                : "Tomorrow"}{" "}
              at {formatTime(nextAppointment.startTime)}
            </Text>
          </View>
          <View style={styles.appointmentDetails}>
            <Text style={styles.appointmentService}>
              {nextAppointment.service?.name} for {nextAppointment.customer?.name}
            </Text>
            <Text style={styles.appointmentDuration}>
              {nextAppointment.service?.duration ? 
                `${Math.floor(nextAppointment.service.duration / 60)}h` : 
                ""} • ${nextAppointment.price}
            </Text>
          </View>
        </Card>
      )}



      {/* Today's appointments */}
      <View style={styles.todayAppointmentsHeader}>
        <Text style={styles.sectionTitle}>Today&apos;s Appointments</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push("/(tabs)/calendar" as const)}
        >
          <Text style={styles.viewAllText}>View all</Text>
          <ChevronRight size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {todayAppointments.length > 0 ? (
        <FlatList
          data={todayAppointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item}
              onViewDetails={handleViewAppointmentDetails}
              onConfirm={item.status === "pending" ? handleConfirmAppointment : undefined}
              variant="compact"
            />
          )}
          scrollEnabled={false}
        />
      ) : (
        <Card variant="outlined" style={styles.emptyStateCard}>
          <Text style={styles.emptyStateText}>No appointments for today</Text>
          <Text style={styles.emptyStateSubtext}>Tap &quot;Add Booking&quot; to schedule your first appointment</Text>
        </Card>
      )}

      {/* Upcoming Appointments Section */}
      {upcomingAppointments.length > 0 && (
        <>
          <View style={styles.upcomingAppointmentsHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push("/(tabs)/calendar" as const)}
            >
              <Text style={styles.viewAllText}>View all</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={upcomingAppointments.slice(0, 3)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AppointmentCard
                appointment={item}
                onViewDetails={handleViewAppointmentDetails}
                onConfirm={item.status === "pending" ? handleConfirmAppointment : undefined}
                variant="compact"
              />
            )}
            scrollEnabled={false}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  wave: {
    fontSize: 20,
  },
  subGreeting: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  quickActionCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    width: "48%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  nextAppointmentCard: {
    marginBottom: 24,
  },
  nextAppointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  nextAppointmentTime: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary,
  },
  appointmentDetails: {
    marginTop: 8,
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  appointmentDuration: {
    fontSize: 14,
    color: Colors.text.secondary,
  },

  todayAppointmentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
  emptyStateCard: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  upcomingAppointmentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },

});
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { Appointment } from "@/types";

interface AppointmentCardProps {
  appointment: Appointment;
  onViewDetails?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onConfirm?: (appointment: Appointment) => void;
  variant?: "compact" | "detailed";
}

export const AppointmentCard = ({
  appointment,
  onViewDetails,
  onReschedule,
  onCancel,
  onConfirm,
  variant = "detailed",
}: AppointmentCardProps) => {
  const { service, customer, date, startTime, status, price } = appointment;

  // Format date
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Check if appointment is today
  const isToday = (): boolean => {
    const today = new Date().toISOString().split("T")[0];
    return date === today;
  };

  // Get status color
  const getStatusColor = (): string => {
    switch (status) {
      case "confirmed":
        return Colors.success;
      case "pending":
        return Colors.warning;
      case "cancelled":
        return Colors.danger;
      default:
        return Colors.text.secondary;
    }
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.serviceName}>{service?.name}</Text>
          <Text style={styles.customerName}>for {customer?.name}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${price}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>
            {isToday() ? "Today" : formatDate(date)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>{formatTime(startTime)}</Text>
        </View>
        {variant === "detailed" && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {status === "pending" && onConfirm && (
          <Button
            title="Confirm"
            variant="primary"
            size="small"
            onPress={() => onConfirm(appointment)}
            style={styles.actionButton}
          />
        )}
        {status !== "cancelled" && onReschedule && (
          <Button
            title="Reschedule"
            variant="outline"
            size="small"
            onPress={() => onReschedule(appointment)}
            style={styles.actionButton}
          />
        )}
        {status !== "cancelled" && onCancel && (
          <Button
            title="Cancel"
            variant="text"
            size="small"
            onPress={() => onCancel(appointment)}
            style={styles.actionButton}
          />
        )}
        {onViewDetails && (
          <Button
            title="View Details"
            variant="primary"
            size="small"
            onPress={() => onViewDetails(appointment)}
            style={styles.actionButton}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  customerName: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  priceContainer: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    width: 70,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  actionButton: {
    marginLeft: 8,
  },
});
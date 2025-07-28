import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Colors } from "@/constants/colors";
import { useServices } from "@/context/StylistContext";
import { Service } from "@/types";

export default function ServicesScreen() {
  const router = useRouter();
  const { services, deleteService } = useServices();
  // Using isDeleting state to track deletion status and potentially show loading indicators
  const [isDeleting, setIsDeleting] = useState(false);
  
  // We could use isDeleting to show a loading indicator or disable buttons
  // For example: <Button disabled={isDeleting} ... />

  const handleAddService = () => {
    router.push("/add-service" as const);
  };

  const handleEditService = (service: Service) => {
    router.push(`/edit-service/${service.id}` as const);
  };

  const handleDeleteService = async (service: Service) => {
    try {
      setIsDeleting(true);
      await deleteService(service.id);
    } catch (error) {
      console.error("Failed to delete service:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Services</Text>
        <Button
          title="Add Service"
          leftIcon={<Plus size={16} color={Colors.text.light} />}
          onPress={handleAddService}
          size="small"
        />
      </View>

      {services.length > 0 ? (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
            />
          )}
          contentContainerStyle={styles.servicesList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No services yet</Text>
          <Text style={styles.emptyStateText}>
            Add your first service to start accepting bookings.
          </Text>
          <Button
            title="Add Your First Service"
            leftIcon={<Plus size={16} color={Colors.text.light} />}
            onPress={handleAddService}
            style={styles.emptyStateButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  servicesList: {
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyStateButton: {
    marginTop: 16,
  },
});
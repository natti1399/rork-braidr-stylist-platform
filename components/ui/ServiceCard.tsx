import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
}

export const ServiceCard = ({ service, onEdit, onDelete }: ServiceCardProps) => {
  const { name, description, price, duration, image } = service;

  // Format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr${hours > 1 ? "s" : ""}`;
    } else {
      return `${hours} hr${hours > 1 ? "s" : ""} ${mins} min`;
    }
  };

  return (
    <Card variant="elevated" style={styles.card}>
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.price}>${price}</Text>
        </View>
        <Text style={styles.duration}>{formatDuration(duration)}</Text>
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.actions}>
          {onEdit && (
            <Button
              title="Edit"
              variant="outline"
              size="small"
              onPress={() => onEdit(service)}
              style={styles.actionButton}
            />
          )}
          {onDelete && (
            <Button
              title="Delete"
              variant="text"
              size="small"
              onPress={() => onDelete(service)}
              style={styles.actionButton}
            />
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 150,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  duration: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    marginLeft: 8,
  },
});
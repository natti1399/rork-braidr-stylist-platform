import { useRouter } from "expo-router";
import { ArrowLeft, Clock, DollarSign, FileText, Image, Type } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { useServices } from "@/context/StylistContext";

export default function AddServiceScreen() {
  const router = useRouter();
  const { addService } = useServices();
  
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  const handleCreateService = async () => {
    if (!serviceName || !price || !duration) {
      console.log("Please fill in all required fields");
      return;
    }
    
    try {
      await addService({
        name: serviceName,
        description: description || undefined,
        price: `${parseFloat(price).toFixed(2)}`,
        duration: parseInt(duration, 10),
        image: imageUrl || undefined,
        category: "Braiding",
        isActive: true,
      });
      
      router.back();
    } catch (error) {
      console.error("Failed to create service:", error);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Service</Text>
      </View>
      
      <Card variant="elevated" style={styles.formCard}>
        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <Type size={20} color={Colors.primary} />
            <Text style={styles.inputLabel}>Service Name *</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={serviceName}
            onChangeText={setServiceName}
            placeholder="e.g., Box Braids, Cornrows, Twists"
            placeholderTextColor={Colors.text.secondary}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <FileText size={20} color={Colors.primary} />
            <Text style={styles.inputLabel}>Description</Text>
          </View>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your service, techniques, and what's included..."
            placeholderTextColor={Colors.text.secondary}
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <View style={styles.inputHeader}>
              <DollarSign size={20} color={Colors.primary} />
              <Text style={styles.inputLabel}>Price *</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor={Colors.text.secondary}
              keyboardType="decimal-pad"
            />
          </View>
          
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <View style={styles.inputHeader}>
              <Clock size={20} color={Colors.primary} />
              <Text style={styles.inputLabel}>Duration (minutes) *</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={duration}
              onChangeText={setDuration}
              placeholder="120"
              placeholderTextColor={Colors.text.secondary}
              keyboardType="number-pad"
            />
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <View style={styles.inputHeader}>
            <Image size={20} color={Colors.primary} />
            <Text style={styles.inputLabel}>Image URL (Optional)</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={Colors.text.secondary}
            keyboardType="url"
          />
        </View>
      </Card>
      
      <Card variant="outlined" style={styles.previewCard}>
        <Text style={styles.previewTitle}>Preview</Text>
        <View style={styles.previewContent}>
          <Text style={styles.previewServiceName}>
            {serviceName || "Service Name"}
          </Text>
          <Text style={styles.previewDescription}>
            {description || "Service description will appear here..."}
          </Text>
          <View style={styles.previewDetails}>
            <Text style={styles.previewPrice}>
              ${price ? parseFloat(price).toFixed(2) : "0.00"}
            </Text>
            <Text style={styles.previewDuration}>
              {duration ? `${Math.floor(parseInt(duration, 10) / 60)}h ${parseInt(duration, 10) % 60}m` : "0h 0m"}
            </Text>
          </View>
        </View>
      </Card>
      
      <View style={styles.actionButtons}>
        <Button
          title="Create Service"
          onPress={handleCreateService}
          fullWidth
          disabled={!serviceName || !price || !duration}
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
  formCard: {
    margin: 16,
  },
  previewCard: {
    margin: 16,
    marginTop: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.primary,
    marginLeft: 8,
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
  textArea: {
    textAlignVertical: "top",
    minHeight: 100,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  previewContent: {
    padding: 16,
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewServiceName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  previewDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  previewDuration: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  actionButtons: {
    padding: 16,
  },
});
import * as ImagePicker from "expo-image-picker";
import { 
  Camera, 
  ChevronRight, 
  Clock, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  MapPin, 
  Bell, 
  Shield, 
  Star, 
  User, 
  X 
} from "lucide-react-native";
import { useState } from "react";
import { 
  Alert, 
  Modal, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { useStylist } from "@/context/StylistContext";
import { Stylist } from "@/types";

type EditModalType = 'personal' | 'bio' | 'location' | 'hours' | null;

export default function ProfileScreen() {
  const { stylist } = useStylist();
  const [profileImage, setProfileImage] = useState<string | undefined>(
    stylist?.avatar
  );
  const [editModal, setEditModal] = useState<EditModalType>(null);
  const [editData, setEditData] = useState<Partial<Stylist>>({});
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '10:00', close: '16:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: true },
  });


  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access camera roll is required!");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      // In a real app, you would upload this to your server
      console.log('Profile image updated:', result.assets[0].uri);
    }
  };

  const openEditModal = (type: EditModalType) => {
    if (type === 'personal') {
      setEditData({
        name: stylist?.name || '',
        email: stylist?.email || '',
        phone: stylist?.phone || '',
      });
    } else if (type === 'bio') {
      setEditData({ bio: stylist?.bio || '' });
    } else if (type === 'location') {
      setEditData({
        location: stylist?.location || {
          address: '',
          city: '',
          state: '',
          zip: '',
        },
      });
    }
    setEditModal(type);
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditData({});
  };

  const saveChanges = () => {
    // In a real app, you would make an API call to update the stylist data
    console.log('Saving changes:', editData);
    Alert.alert('Success', 'Profile updated successfully!');
    closeEditModal();
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => {
            // In a real app, you would clear auth tokens and navigate to login
            console.log('Logging out...');
          }
        },
      ]
    );
  };

  const menuItems = [
    {
      title: "Personal Information",
      icon: <User size={20} color={Colors.text.secondary} />,
      chevron: <ChevronRight size={20} color={Colors.text.secondary} />,
      onPress: () => openEditModal('personal'),
    },
    {
      title: "Business Hours",
      icon: <Clock size={20} color={Colors.text.secondary} />,
      chevron: <ChevronRight size={20} color={Colors.text.secondary} />,
      onPress: () => openEditModal('hours'),
    },
    {
      title: "Payment Methods",
      icon: <CreditCard size={20} color={Colors.text.secondary} />,
      chevron: <ChevronRight size={20} color={Colors.text.secondary} />,
      onPress: () => {
        Alert.alert('Coming Soon', 'Payment methods management will be available soon.');
      },
    },
    {
      title: "Notifications",
      icon: <Bell size={20} color={Colors.text.secondary} />,
      chevron: <ChevronRight size={20} color={Colors.text.secondary} />,
      onPress: () => {
        Alert.alert('Notifications', 'Notification settings will be available soon.');
      },
    },
    {
      title: "Privacy & Security",
      icon: <Shield size={20} color={Colors.text.secondary} />,
      chevron: <ChevronRight size={20} color={Colors.text.secondary} />,
      onPress: () => {
        Alert.alert('Privacy & Security', 'Privacy and security settings will be available soon.');
      },
    },
    {
      title: "Help & Support",
      icon: <HelpCircle size={20} color={Colors.text.secondary} />,
      chevron: <ChevronRight size={20} color={Colors.text.secondary} />,
      onPress: () => {
        Alert.alert('Help & Support', 'Contact support at support@braidr.com');
      },
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Avatar
              uri={profileImage}
              name={stylist?.name || "User"}
              size="large"
            />
            <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
              <Camera size={16} color={Colors.text.light} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.profileName}>{stylist?.name}</Text>
          
          <View style={styles.locationContainer}>
            <MapPin size={16} color={Colors.text.secondary} />
            <Text style={styles.locationText}>
              {stylist?.location?.city}, {stylist?.location?.state}
            </Text>
          </View>
          
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FFC107" />
            <Text style={styles.ratingText}>
              {stylist?.rating} ({stylist?.reviewCount} reviews)
            </Text>
          </View>
        </View>

        <Card variant="elevated" style={styles.bioCard}>
          <Text style={styles.bioTitle}>About</Text>
          <Text style={styles.bioText}>{stylist?.bio || "No bio yet."}</Text>
          <Button
            title="Edit Bio"
            variant="outline"
            size="small"
            style={styles.editBioButton}
            onPress={() => openEditModal('bio')}
          />
        </Card>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                {item.icon}
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              {item.chevron}
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Log Out"
          variant="outline"
          leftIcon={<LogOut size={16} color={Colors.danger} />}
          style={styles.logoutButton}
          onPress={handleLogout}
        />
      </ScrollView>

      {/* Edit Modals */}
      <Modal
        visible={editModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeEditModal}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editModal === 'personal' && 'Personal Information'}
              {editModal === 'bio' && 'Edit Bio'}
              {editModal === 'location' && 'Location'}
              {editModal === 'hours' && 'Business Hours'}
            </Text>
            <TouchableOpacity onPress={saveChanges}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {editModal === 'personal' && (
              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editData.name || ''}
                    onChangeText={(text) => setEditData({ ...editData, name: text })}
                    placeholder="Enter your name"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editData.email || ''}
                    onChangeText={(text) => setEditData({ ...editData, email: text })}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editData.phone || ''}
                    onChangeText={(text) => setEditData({ ...editData, phone: text })}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            )}

            {editModal === 'bio' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editData.bio || ''}
                  onChangeText={(text) => setEditData({ ...editData, bio: text })}
                  placeholder="Tell clients about yourself and your expertise..."
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
            )}

            {editModal === 'location' && (
              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editData.location?.address || ''}
                    onChangeText={(text) => 
                      setEditData({ 
                        ...editData, 
                        location: { ...editData.location!, address: text } 
                      })
                    }
                    placeholder="Enter your address"
                  />
                </View>
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text style={styles.inputLabel}>City</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editData.location?.city || ''}
                      onChangeText={(text) => 
                        setEditData({ 
                          ...editData, 
                          location: { ...editData.location!, city: text } 
                        })
                      }
                      placeholder="City"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                    <Text style={styles.inputLabel}>State</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editData.location?.state || ''}
                      onChangeText={(text) => 
                        setEditData({ 
                          ...editData, 
                          location: { ...editData.location!, state: text } 
                        })
                      }
                      placeholder="State"
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ZIP Code</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editData.location?.zip || ''}
                    onChangeText={(text) => 
                      setEditData({ 
                        ...editData, 
                        location: { ...editData.location!, zip: text } 
                      })
                    }
                    placeholder="ZIP Code"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            {editModal === 'hours' && (
              <View>
                {Object.entries(businessHours).map(([day, hours]) => (
                  <View key={day} style={styles.hoursRow}>
                    <Text style={styles.dayLabel}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Text>
                    {hours.closed ? (
                      <View style={styles.hoursControls}>
                        <Text style={styles.closedText}>Closed</Text>
                        <TouchableOpacity
                          onPress={() => 
                            setBusinessHours({
                              ...businessHours,
                              [day]: { ...hours, closed: false }
                            })
                          }
                        >
                          <Text style={styles.openButton}>Open</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.hoursControls}>
                        <TextInput
                          style={styles.timeInput}
                          value={hours.open}
                          onChangeText={(text) => 
                            setBusinessHours({
                              ...businessHours,
                              [day]: { ...hours, open: text }
                            })
                          }
                          placeholder="09:00"
                        />
                        <Text style={styles.timeSeparator}>-</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={hours.close}
                          onChangeText={(text) => 
                            setBusinessHours({
                              ...businessHours,
                              [day]: { ...hours, close: text }
                            })
                          }
                          placeholder="18:00"
                        />
                        <TouchableOpacity
                          onPress={() => 
                            setBusinessHours({
                              ...businessHours,
                              [day]: { ...hours, closed: true }
                            })
                          }
                        >
                          <Text style={styles.closeButton}>Close</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
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
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  bioCard: {
    marginBottom: 24,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 16,
    lineHeight: 20,
  },
  editBioButton: {
    alignSelf: "flex-start",
  },
  menuContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
  },
  logoutButton: {
    marginBottom: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  inputRow: {
    flexDirection: "row",
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text.primary,
    flex: 1,
  },
  hoursControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeInput: {
    backgroundColor: Colors.background.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 60,
    textAlign: "center",
  },
  timeSeparator: {
    marginHorizontal: 8,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  closedText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 12,
  },
  openButton: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  closeButton: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: "600",
    marginLeft: 12,
  },
});
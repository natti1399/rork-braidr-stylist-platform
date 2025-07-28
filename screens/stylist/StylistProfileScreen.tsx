import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  Modal,
  FlatList,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';

export default function StylistProfileScreen() {
  const insets = useSafeAreaInsets();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState(
    'Professional braider with 5+ years of experience specializing in box braids, goddess braids, and more.'
  );
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [portfolio, setPortfolio] = useState([
    { id: '1', imageUrl: 'https://api.a0.dev/assets/image?text=Braids%201&aspect=1:1&seed=123' },
    { id: '2', imageUrl: 'https://api.a0.dev/assets/image?text=Braids%202&aspect=1:1&seed=456' },
  ]);

  const saveBio = () => {
    setIsEditingBio(false);
    toast.success('Bio updated');
  };

  const addPortfolioImage = () => {
    // Generate a random seed for the image
    const newSeed = Math.floor(Math.random() * 1000).toString();
    const newImage = {
      id: (portfolio.length + 1).toString(),
      imageUrl: `https://api.a0.dev/assets/image?text=Braids%20${portfolio.length + 1}&aspect=1:1&seed=${newSeed}`
    };
    
    setPortfolio([...portfolio, newImage]);
    toast.success('Portfolio image added');
  };

  const removePortfolioImage = (id: string) => {
    setPortfolio(portfolio.filter(item => item.id !== id));
    toast.success('Portfolio image removed');
  };

  const Row = ({ title, icon, onPress }: { title: string; icon: keyof typeof Ionicons.glyphMap; onPress?: () => void }) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowIconWrapper}>
        <Ionicons name={icon} size={20} color="#4267FF" />
      </View>
      <Text style={styles.rowTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
    </TouchableOpacity>
  );

  const SettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showSettingsModal}
      onRequestClose={() => setShowSettingsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
              <Ionicons name="close" size={24} color="#222" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll}>
            <TouchableOpacity style={styles.settingsRow}>
              <Ionicons name="moon-outline" size={22} color="#4267FF" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Dark Mode</Text>
              <View style={styles.switch}>
                <View style={styles.switchTrack} />
                <View style={styles.switchThumb} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsRow}>
              <Ionicons name="notifications-outline" size={22} color="#4267FF" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Push Notifications</Text>
              <View style={[styles.switch, styles.switchActive]}>
                <View style={styles.switchTrack} />
                <View style={[styles.switchThumb, styles.switchThumbActive]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsRow}>
              <Ionicons name="language-outline" size={22} color="#4267FF" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Language</Text>
              <Text style={styles.settingsValue}>English</Text>
              <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsRow}>
              <Ionicons name="help-circle-outline" size={22} color="#4267FF" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsRow}>
              <Ionicons name="document-text-outline" size={22} color="#4267FF" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsRow}>
              <Ionicons name="lock-closed-outline" size={22} color="#4267FF" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.logoutButton}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
            
            <Text style={styles.versionText}>Braidr v1.0.0</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Settings button in header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowSettingsModal(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#4267FF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={styles.headerCenter}>
          <TouchableOpacity activeOpacity={0.8} style={styles.avatarWrapper}>
            <Image
              source={{ uri: 'https://api.a0.dev/assets/image?text=Stylist&aspect=1:1&seed=99' }}
              style={styles.avatar}
            />
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>Test Stylist</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#8E8E93" style={{ marginRight: 4 }} />
            <Text style={styles.locationText}>New York, NY</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFC107" style={{ marginRight: 4 }} />
            <Text style={styles.ratingText}>4.9 (89 reviews)</Text>
          </View>
        </View>

        {/* About card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          {isEditingBio ? (
            <TextInput
              style={styles.bioInput}
              multiline
              value={bio}
              onChangeText={setBio}
            />
          ) : (
            <Text style={styles.bioText}>{bio}</Text>
          )}
          <TouchableOpacity
            style={[styles.editBioBtn, isEditingBio && { backgroundColor: '#4267FF' }]}
            onPress={isEditingBio ? saveBio : () => setIsEditingBio(true)}
          >
            <Text style={[styles.editBioText, isEditingBio && { color: 'white' }]}>
              {isEditingBio ? 'Save' : 'Edit Bio'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Portfolio section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Portfolio</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addPortfolioImage}
            >
              <Ionicons name="add" size={20} color="#4267FF" />
              <Text style={styles.addButtonText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
          
          {portfolio.length === 0 ? (
            <View style={styles.emptyPortfolio}>
              <Ionicons name="images-outline" size={40} color="#8E8E93" />
              <Text style={styles.emptyText}>No portfolio images yet</Text>
              <Text style={styles.emptySubtext}>Add photos of your work to showcase your skills</Text>
            </View>
          ) : (
            <View style={styles.portfolioGrid}>
              {portfolio.map((item) => (
                <View key={item.id} style={styles.portfolioItem}>
                  <Image source={{ uri: item.imageUrl }} style={styles.portfolioImage} />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removePortfolioImage(item.id)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Sections list */}
        <View style={styles.listCard}>
          <Row title="Personal Information" icon="person-outline" />
          <Row title="Business Hours" icon="time-outline" />
          <Row title="Payment Methods" icon="card-outline" />
          <Row title="Notifications" icon="notifications-outline" />
          <Row title="Privacy & Security" icon="shield-checkmark-outline" />
        </View>
      </ScrollView>
      
      <SettingsModal />
    </View>
  );
}

const { width } = Dimensions.get('window');
const imageSize = (width - 56) / 3; // 3 images per row with margins

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66,103,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { flex: 1 },
  headerCenter: { alignItems: 'center', marginBottom: 24 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4267FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: { fontSize: 24, fontWeight: '700', color: '#222', marginTop: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: 14, color: '#8E8E93' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 14, color: '#8E8E93' },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 8 },
  bioText: { fontSize: 15, color: '#222', lineHeight: 22 },
  bioInput: {
    fontSize: 15,
    color: '#222',
    lineHeight: 22,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  editBioBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4267FF',
    marginTop: 12,
  },
  editBioText: { fontSize: 14, fontWeight: '600', color: '#4267FF' },
  listCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rowIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(66,103,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowTitle: { flex: 1, fontSize: 16, color: '#222' },
  
  // Portfolio styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4267FF',
    marginLeft: 4,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  portfolioItem: {
    width: imageSize,
    height: imageSize,
    margin: 4,
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  emptyPortfolio: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
    marginHorizontal: 20,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  modalScroll: {
    maxHeight: '100%',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsIcon: {
    marginRight: 12,
  },
  settingsText: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  settingsValue: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: 'rgba(66,103,255,0.4)',
  },
  switchTrack: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  switchThumb: {
    position: 'absolute',
    left: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  switchThumbActive: {
    left: 'auto',
    right: 2,
    backgroundColor: '#4267FF',
  },
  logoutButton: {
    margin: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 12,
    marginVertical: 16,
  },
});
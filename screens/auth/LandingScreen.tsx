import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  onRoleSelect: (role: 'customer' | 'stylist') => void;
}

export default function LandingScreen({ onRoleSelect }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Text style={styles.logo}>Braidr</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{
              uri: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=diverse%20group%20of%20people%20with%20beautiful%20braided%20hairstyles%2C%20smiling%20and%20happy%2C%20professional%20hair%20salon%20setting%2C%20warm%20lighting%2C%20modern%20and%20clean%20aesthetic&image_size=square_hd'
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <Text style={styles.tagline}>Braiding made easy.</Text>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Hey there! 👋</Text>
          <Text style={styles.welcomeText}>
            Connect with skilled braiders in your area or offer your braiding services to clients looking for beautiful, professional hairstyles.
          </Text>
        </View>

        {/* Role Selection Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => onRoleSelect('customer')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4267FF', '#5A7FFF']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Customer</Text>
              <Text style={styles.buttonSubtext}>Book appointments</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => onRoleSelect('stylist')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4267FF', '#5A7FFF']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Stylist</Text>
              <Text style={styles.buttonSubtext}>Offer your skills</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4267FF',
    letterSpacing: -0.5,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroImage: {
    width: 280,
    height: 280,
    borderRadius: 24,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '500',
  },
  welcomeSection: {
    marginBottom: 48,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  buttonSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  roleButton: {
    borderRadius: 12,
    shadowColor: '#4267FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#E8EFFF',
    fontWeight: '400',
  },
});
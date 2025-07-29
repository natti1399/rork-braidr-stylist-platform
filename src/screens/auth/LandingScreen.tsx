import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface LandingScreenProps {
  navigation: any;
}

const LandingScreen: React.FC<LandingScreenProps> = () => {
  const navigation = useNavigation();

  const handleRoleSelection = (role: 'customer' | 'stylist') => {
    navigation.navigate('SignIn', { role });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.gradient}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Braidr</Text>
          </View>
          <Text style={styles.tagline}>Braiding made easy.</Text>
        </View>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <View style={styles.heroImagePlaceholder}>
            <Image
              source={{
                uri: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=diverse%20group%20of%20people%20with%20beautiful%20braided%20hairstyles%2C%20smiling%2C%20professional%20photography%2C%20warm%20lighting%2C%20modern%20salon%20background&image_size=square_hd'
              }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Hey there! 👋</Text>
          <Text style={styles.welcomeText}>
            Connect with skilled braiders in your area or offer your braiding services to clients looking for beautiful, professional hairstyles.
          </Text>
        </View>

        {/* Role Selection Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => handleRoleSelection('customer')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Book Appointments</Text>
            <Text style={styles.buttonSubtext}>Find and book braiding services</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleRoleSelection('stylist')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Offer Your Skills</Text>
            <Text style={styles.buttonSubtext}>Provide braiding services</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 8,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4267FF',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  heroContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  heroImagePlaceholder: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  welcomeContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#4267FF',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4267FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4267FF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    color: '#4267FF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '400',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default LandingScreen;
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  role: 'customer' | 'stylist';
  onComplete: () => void;
  onBack: () => void;
}

export default function OnboardingScreen({ role, onComplete, onBack }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = role === 'customer' ? 3 : 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const renderCustomerContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Image
              source={{
                uri: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=person%20looking%20at%20mobile%20app%20with%20hairstyle%20options%2C%20modern%20UI%2C%20clean%20design%2C%20professional%20photography&image_size=square_hd'
              }}
              style={styles.stepImage}
              resizeMode="cover"
            />
            <Text style={styles.stepTitle}>Find Your Perfect Style</Text>
            <Text style={styles.stepDescription}>
              Browse through a variety of braiding styles and find the perfect look for you.
            </Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Image
              source={{
                uri: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=person%20booking%20appointment%20on%20mobile%20app%2C%20calendar%20interface%2C%20modern%20UI%2C%20clean%20design%2C%20professional%20photography&image_size=square_hd'
              }}
              style={styles.stepImage}
              resizeMode="cover"
            />
            <Text style={styles.stepTitle}>Book with Ease</Text>
            <Text style={styles.stepDescription}>
              Schedule appointments with top braiders in your area at times that work for you.
            </Text>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Image
              source={{
                uri: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=person%20with%20beautiful%20braided%20hairstyle%20smiling%2C%20professional%20photography%2C%20clean%20background%2C%20modern%20aesthetic&image_size=square_hd'
              }}
              style={styles.stepImage}
              resizeMode="cover"
            />
            <Text style={styles.stepTitle}>Look Your Best</Text>
            <Text style={styles.stepDescription}>
              Enjoy professional braiding services and show off your beautiful new style.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderStylistContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Image
              source={{
                uri: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=stylist%20creating%20profile%20on%20mobile%20app%2C%20adding%20portfolio%20photos%2C%20modern%20UI%2C%20clean%20design%2C%20professional%20photography&image_size=square_hd'
              }}
              style={styles.stepImage}
              resizeMode="cover"
            />
            <Text style={styles.stepTitle}>Create Your Profile</Text>
            <Text style={styles.stepDescription}>
              Showcase your skills with a professional profile and portfolio of your work.
            </Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Image
              source={{
                uri: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=stylist%20setting%20up%20services%20and%20prices%20on%20mobile%20app%2C%20modern%20UI%2C%20clean%20design%2C%20professional%20photography&image_size=square_hd'
              }}
              style={styles.stepImage}
              resizeMode="cover"
            />
            <Text style={styles.stepTitle}>Set Your Services</Text>
            <Text style={styles.stepDescription}>
              Define your braiding services, prices, and availability for clients to book.
            </Text>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Image
              source={{
                uri: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=stylist%20managing%20calendar%20and%20appointments%20on%20mobile%20app%2C%20modern%20UI%2C%20clean%20design%2C%20professional%20photography&image_size=square_hd'
              }}
              style={styles.stepImage}
              resizeMode="cover"
            />
            <Text style={styles.stepTitle}>Manage Your Schedule</Text>
            <Text style={styles.stepDescription}>
              Keep track of appointments and manage your availability with our easy-to-use calendar.
            </Text>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Image
              source={{
                uri: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=stylist%20receiving%20payment%20and%20growing%20business%2C%20mobile%20app%20interface%2C%20modern%20UI%2C%20clean%20design%2C%20professional%20photography&image_size=square_hd'
              }}
              style={styles.stepImage}
              resizeMode="cover"
            />
            <Text style={styles.stepTitle}>Grow Your Business</Text>
            <Text style={styles.stepDescription}>
              Expand your client base, receive secure payments, and build your reputation as a top braider.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#222222" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index + 1 === currentStep ? styles.activeDot : {},
                index + 1 < currentStep ? styles.completedDot : {},
              ]}
            />
          ))}
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {role === 'customer' ? renderCustomerContent() : renderStylistContent()}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4267FF', '#5A7FFF']}
            style={styles.buttonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === totalSteps ? 'Get Started' : 'Next'}
            </Text>
            {currentStep !== totalSteps && (
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4267FF',
  },
  completedDot: {
    backgroundColor: '#4267FF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  stepImage: {
    width: 280,
    height: 280,
    borderRadius: 24,
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  nextButton: {
    borderRadius: 12,
    shadowColor: '#4267FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
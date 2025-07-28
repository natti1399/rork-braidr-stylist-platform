# Braidr Authentication System

This document describes the new authentication system implemented for the Braidr app, featuring a complete user flow for both customers and stylists.

## 🚀 Features

### Authentication Flow
- **Landing Page**: Welcome screen with role selection (Customer/Stylist)
- **Role-Specific Sign-In**: Dedicated login screens for each user type
- **Registration**: Account creation with form validation
- **Onboarding**: Role-specific guided setup for new users
- **Persistent Authentication**: User sessions maintained across app restarts

### User Roles
- **Customer**: Users who book braiding appointments
- **Stylist**: Users who offer braiding services

## 📱 Screen Flow

```
Landing Page
    ↓
[Customer] or [Stylist] Selection
    ↓
Role-Specific Sign-In Screen
    ↓
[Sign In] → Home Screen
    ↓
[Create Account] → Sign-Up Screen
    ↓
Onboarding Flow → Home Screen
```

## 🎨 Design Features

### Visual Design
- **Primary Color**: Blue (#4267FF) for branding and CTAs
- **Typography**: Clean sans-serif with proper hierarchy
- **Layout**: Card-based design with generous spacing
- **Images**: AI-generated hero images for each screen
- **Responsive**: Mobile-first design optimized for touch

### UI Components
- Gradient buttons with shadow effects
- Password visibility toggles
- Form validation with error messages
- Progress indicators for onboarding
- Loading states with branded spinner

## 🔧 Technical Implementation

### File Structure
```
screens/auth/
├── LandingScreen.tsx      # Welcome + role selection
├── SignInScreen.tsx       # Role-specific login
├── SignUpScreen.tsx       # Registration form
└── OnboardingScreen.tsx   # Role-specific setup

contexts/
└── AuthContext.tsx        # Authentication state management

navigation/
└── AuthNavigator.tsx      # Authentication flow navigation

components/
└── LoadingScreen.tsx      # Loading state component
```

### Key Components

#### AuthContext
- Manages user authentication state
- Handles sign-in, sign-up, and sign-out operations
- Persists user data using AsyncStorage
- Provides authentication status throughout the app

#### AuthNavigator
- Stack navigator for authentication screens
- Handles navigation between auth screens
- Manages onboarding flow state
- Integrates with AuthContext for state management

#### Screen Components
- **LandingScreen**: Hero section with role selection buttons
- **SignInScreen**: Email/password form with role-specific branding
- **SignUpScreen**: Registration form with validation
- **OnboardingScreen**: Multi-step setup flow for new users

## 🔐 Authentication Features

### Form Validation
- Email format validation
- Password strength requirements (minimum 6 characters)
- Password confirmation matching
- Real-time error feedback

### Security
- Password visibility toggles
- Secure password input fields
- Form data validation before submission
- Error handling for failed requests

### User Experience
- Loading states during authentication
- Success/error feedback
- Smooth navigation transitions
- Persistent login sessions

## 🎯 Onboarding Flow

### Customer Onboarding (3 steps)
1. **Find Your Perfect Style**: Browse braiding options
2. **Book with Ease**: Schedule appointments
3. **Look Your Best**: Enjoy professional services

### Stylist Onboarding (4 steps)
1. **Create Your Profile**: Showcase skills and portfolio
2. **Set Your Services**: Define services and pricing
3. **Manage Your Schedule**: Calendar and availability
4. **Grow Your Business**: Expand client base

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- React Native development environment

### Installation
```bash
cd braidr_A0
npm install
npx expo install @expo/metro-runtime
```

### Running the App
```bash
# Start development server
npm start

# Run on web
npx expo start --web

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

### Testing Authentication
1. Open the app in your browser or simulator
2. You'll see the Landing Page with Braidr branding
3. Select either "Customer" or "Stylist" role
4. Try signing in (mock authentication)
5. Create a new account to test the registration flow
6. Complete the onboarding process

## 🔄 State Management

The authentication system uses React Context for state management:

- **AuthProvider**: Wraps the entire app to provide auth context
- **useAuth**: Hook to access authentication state and methods
- **AsyncStorage**: Persists user data and authentication status
- **Loading States**: Manages UI feedback during async operations

## 🎨 Customization

### Colors
Update the primary color scheme in the style objects:
```typescript
const primaryColor = '#4267FF';
const secondaryColor = '#5A7FFF';
```

### Images
Replace hero images by updating the image URLs in each screen component.

### Onboarding Content
Modify the onboarding steps in `OnboardingScreen.tsx` to match your specific requirements.

## 📝 Notes

- The current implementation uses mock authentication for demonstration
- In production, replace mock auth with your backend API calls
- Add proper error handling and retry mechanisms
- Consider implementing biometric authentication for enhanced security
- Add analytics tracking for user flow optimization

## 🤝 Integration

The authentication system integrates seamlessly with the existing Braidr app:
- Maintains existing customer and stylist home screens
- Preserves current navigation structure
- Compatible with existing state management
- Ready for backend API integration
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export interface AddressComponents {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface LocationResult {
  coordinates: LocationCoordinates;
  address?: AddressComponents;
  timestamp: number;
}

class LocationService {
  private lastKnownLocation: LocationResult | null = null;
  private locationWatchId: Location.LocationSubscription | null = null;

  // Permission Management
  async requestLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
        status
      };
    } catch (error) {
      console.error('Location permission error:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error'
      };
    }
  }

  async checkLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
        status
      };
    } catch (error) {
      console.error('Check location permission error:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error'
      };
    }
  }

  // Location Retrieval
  async getCurrentLocation(useCache: boolean = true): Promise<LocationResult | null> {
    try {
      // Check if we can use cached location (within 5 minutes)
      if (useCache && this.lastKnownLocation) {
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        if (this.lastKnownLocation.timestamp > fiveMinutesAgo) {
          return this.lastKnownLocation;
        }
      }

      // Check permission
      const permission = await this.checkLocationPermission();
      if (!permission.granted) {
        const requestResult = await this.requestLocationPermission();
        if (!requestResult.granted) {
          return await this.getDefaultLocation();
        }
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 100
      });

      const result: LocationResult = {
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        },
        timestamp: Date.now()
      };

      // Cache the location
      this.lastKnownLocation = result;
      await this.saveLocationToStorage(result);

      return result;
    } catch (error) {
      console.error('Get current location error:', error);
      return await this.getDefaultLocation();
    }
  }

  async getLocationWithAddress(): Promise<LocationResult | null> {
    try {
      const locationResult = await this.getCurrentLocation();
      if (!locationResult) return null;

      // Reverse geocode to get address
      const address = await this.reverseGeocode(
        locationResult.coordinates.latitude,
        locationResult.coordinates.longitude
      );

      return {
        ...locationResult,
        address
      };
    } catch (error) {
      console.error('Get location with address error:', error);
      return null;
    }
  }

  // Address Services
  async reverseGeocode(latitude: number, longitude: number): Promise<AddressComponents | undefined> {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (results && results.length > 0) {
        const result = results[0];
        return {
          street: result.street || undefined,
          city: result.city || undefined,
          state: result.region || undefined,
          zipCode: result.postalCode || undefined,
          country: result.country || undefined
        };
      }
      return undefined;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return undefined;
    }
  }

  async geocodeAddress(address: string): Promise<LocationCoordinates | null> {
    try {
      const results = await Location.geocodeAsync(address);
      
      if (results && results.length > 0) {
        const result = results[0];
        return {
          latitude: result.latitude,
          longitude: result.longitude
        };
      }
      return null;
    } catch (error) {
      console.error('Geocode address error:', error);
      return null;
    }
  }

  // Location Watching
  async startLocationWatch(callback: (location: LocationResult) => void): Promise<boolean> {
    try {
      const permission = await this.checkLocationPermission();
      if (!permission.granted) {
        return false;
      }

      this.locationWatchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // 30 seconds
          distanceInterval: 100 // 100 meters
        },
        (location) => {
          const result: LocationResult = {
            coordinates: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            },
            timestamp: Date.now()
          };
          
          this.lastKnownLocation = result;
          callback(result);
        }
      );

      return true;
    } catch (error) {
      console.error('Start location watch error:', error);
      return false;
    }
  }

  stopLocationWatch(): void {
    if (this.locationWatchId) {
      this.locationWatchId.remove();
      this.locationWatchId = null;
    }
  }

  // Distance Calculations
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  formatDistance(miles: number): string {
    if (miles < 0.1) {
      return 'Nearby';
    } else if (miles < 1) {
      return `${(miles * 5280).toFixed(0)} ft`;
    } else {
      return `${miles.toFixed(1)} mi`;
    }
  }

  // Storage Management
  private async saveLocationToStorage(location: LocationResult): Promise<void> {
    try {
      await AsyncStorage.setItem('lastKnownLocation', JSON.stringify(location));
    } catch (error) {
      console.error('Save location to storage error:', error);
    }
  }

  async getStoredLocation(): Promise<LocationResult | null> {
    try {
      const stored = await AsyncStorage.getItem('lastKnownLocation');
      if (stored) {
        const location = JSON.parse(stored);
        // Only use stored location if it's less than 24 hours old
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        if (location.timestamp > twentyFourHoursAgo) {
          this.lastKnownLocation = location;
          return location;
        }
      }
      return null;
    } catch (error) {
      console.error('Get stored location error:', error);
      return null;
    }
  }

  private async getDefaultLocation(): Promise<LocationResult | null> {
    try {
      // Try to get stored location first
      const stored = await this.getStoredLocation();
      if (stored) return stored;

      // Default to New York City if no location available
      return {
        coordinates: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        address: {
          city: 'New York',
          state: 'NY',
          country: 'US'
        },
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Get default location error:', error);
      return null;
    }
  }

  // Utility Functions
  isLocationStale(location: LocationResult, maxAgeMinutes: number = 30): boolean {
    const maxAge = maxAgeMinutes * 60 * 1000;
    return (Date.now() - location.timestamp) > maxAge;
  }

  isValidCoordinates(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }

  getLocationDisplayName(address?: AddressComponents): string {
    if (!address) return 'Unknown location';
    
    if (address.city && address.state) {
      return `${address.city}, ${address.state}`;
    } else if (address.city) {
      return address.city;
    } else if (address.state) {
      return address.state;
    }
    return 'Unknown location';
  }

  // Privacy Functions
  getApproximateLocation(coordinates: LocationCoordinates, radiusMiles: number = 1): LocationCoordinates {
    // Add random offset within radius for privacy
    const offsetLat = (Math.random() - 0.5) * (radiusMiles / 69); // 1 degree lat ≈ 69 miles
    const offsetLon = (Math.random() - 0.5) * (radiusMiles / (69 * Math.cos(this.toRadians(coordinates.latitude))));
    
    return {
      latitude: coordinates.latitude + offsetLat,
      longitude: coordinates.longitude + offsetLon
    };
  }
}

export const locationService = new LocationService();
export default locationService;
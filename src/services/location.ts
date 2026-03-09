/**
 * Location service — expo-location wrapper with permission handling.
 *
 * Provides city-level accuracy coordinates for prayer time calculation.
 * Handles all permission states gracefully.
 */
import * as Location from 'expo-location';

/** Result of a location request */
export type LocationResult = { lat: number; lng: number } | null;

/**
 * Request location permission and return coordinates.
 *
 * Uses foreground permission with low accuracy (city-level is sufficient
 * for prayer time calculation). Returns null on permission denial.
 */
export async function getCoordinates(): Promise<LocationResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch {
    // Handle any unexpected errors (e.g., location services disabled)
    return null;
  }
}

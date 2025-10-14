import { Location, Coordinates, MapBounds, GeocodingResult } from "@/types/location";

/**
 * Convert degrees to radians
 */
export function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function toDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate the distance between two points using the Haversine formula
 */
export function calculateDistance(
  point1: Location | Coordinates,
  point2: Location | Coordinates
): number {
  const lat1 = "latitude" in point1 ? point1.latitude : point1.lat;
  const lon1 = "longitude" in point1 ? point1.longitude : point1.lng;
  const lat2 = "latitude" in point2 ? point2.latitude : point2.lat;
  const lon2 = "longitude" in point2 ? point2.longitude : point2.lng;

  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate a bounding box for a given center point and radius in miles
 */
export function calculateBoundingBox(
  center: Location | Coordinates,
  radiusMiles: number
): MapBounds {
  const lat = "latitude" in center ? center.latitude : center.lat;
  const lng = "longitude" in center ? center.longitude : center.lng;

  const milesPerLat = 69; // Approximate miles per degree latitude
  const milesPerLng = 69 * Math.cos(lat * (Math.PI / 180));
  
  const latRadius = radiusMiles / milesPerLat;
  const lngRadius = radiusMiles / milesPerLng;
  
  return {
    northeast: {
      lat: lat + latRadius,
      lng: lng + lngRadius
    },
    southwest: {
      lat: lat - latRadius,
      lng: lng - lngRadius
    }
  };
}

/**
 * Request and store the user's current location
 */
export async function requestAndStoreLocation(): Promise<Location | null> {
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported by this browser.");
    return null;
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });

    const location: Location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    // Store in localStorage for immediate use
    localStorage.setItem("user_location", JSON.stringify(location));

    // Update user's location in the database
    try {
      const response = await fetch("/api/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location),
      });

      if (!response.ok) {
        throw new Error("Failed to update location: " + response.statusText);
      }
    } catch (error) {
      console.error("Error updating location in database:", error);
      // Don't fail completely if only the database update failed
    }

    return location;
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
}

/**
 * Parse a location from various formats into a standardized Location object
 */
export function parseLocation(input: string | Location | Coordinates): Location {
  if (typeof input === "string") {
    const [lat, lng] = input.split(",").map(Number);
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error("Invalid location string format. Expected: 'latitude,longitude'");
    }
    return { latitude: lat, longitude: lng };
  }
  
  if ("latitude" in input && "longitude" in input) {
    return input;
  }
  
  if ("lat" in input && "lng" in input) {
    return {
      latitude: input.lat,
      longitude: input.lng
    };
  }
  
  throw new Error("Invalid location format");
}

/**
 * Format a location object into a string representation
 */
export function formatLocation(location: Location | Coordinates): string {
  const lat = "latitude" in location ? location.latitude : location.lat;
  const lng = "longitude" in location ? location.longitude : location.lng;
  return `    return lat + "," + lng;`;
}

/**
 * Check if a point is within a given distance of another point
 */
export function isWithinDistance(
  point1: Location | Coordinates,
  point2: Location | Coordinates,
  maxDistance: number
): boolean {
  return calculateDistance(point1, point2) <= maxDistance;
}

/**
 * Calculate the center point between multiple locations
 */
export function calculateCenter(points: (Location | Coordinates)[]): Location {
  if (!points.length) {
    throw new Error("Cannot calculate center of empty points array");
  }

  let totalLat = 0;
  let totalLng = 0;

  points.forEach(point => {
    totalLat += "latitude" in point ? point.latitude : point.lat;
    totalLng += "longitude" in point ? point.longitude : point.lng;
  });

  return {
    latitude: totalLat / points.length,
    longitude: totalLng / points.length
  };
}
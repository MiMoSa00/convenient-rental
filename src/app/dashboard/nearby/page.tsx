"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Home, Users, Filter, Loader2, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import map component to avoid SSR issues
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

interface Location {
  latitude: number;
  longitude: number;
}

interface Property {
  id: string;
  title: string;
  type: "house" | "apartment";
  price: number;
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
  beds: number;
  baths: number;
  distance: number;
  location: { latitude: number; longitude: number };
}

interface RoommatePreferences {
  cleanliness?: number;
  socialLevel?: number;
  smoking?: boolean;
  pets?: boolean;
}

interface NearbyRoommate {
  id: string;
  name: string;
  age: number;
  occupation: string;
  profileImage: string | null;
  latitude: number;
  longitude: number;
  distance: number;
  matchPercentage: number;
  interests: string[];
  preferences: RoommatePreferences;
  location: { latitude: number; longitude: number };
}

interface NearbyApiResponse {
  properties: Array<Omit<Property, 'location'>>;
  roommates: Array<Omit<NearbyRoommate, 'location'>>;
  error?: string;
}

export default function NearbyPage() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [roommates, setRoommates] = useState<NearbyRoommate[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "properties" | "roommates">("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [radius, setRadius] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<"denied" | "granted" | "pending">("pending");

  // Initialize: Try to get location on component mount
  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = () => {
    // Check if location is already saved in localStorage
    const savedLocation = localStorage.getItem("user_location");
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setUserLocation(location);
        setLocationPermission("granted");
        setLoading(false);
        return;
      } catch (error) {
        console.error("Error parsing saved location:", error);
        localStorage.removeItem("user_location");
      }
    }

    // Request geolocation from browser
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(location);
          setLocationPermission("granted");
          // Save to localStorage for future use
          localStorage.setItem("user_location", JSON.stringify(location));
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Safely access error properties - error might be undefined or missing code
          const errorCode = error?.code;
          const permissionDenied = 1; // GeolocationPositionError.PERMISSION_DENIED
          const positionUnavailable = 2; // GeolocationPositionError.POSITION_UNAVAILABLE
          
          if (errorCode === permissionDenied) {
            setLocationPermission("denied");
            setError("Please enable location access to see nearby properties and roommates.");
          } else if (errorCode === positionUnavailable) {
            setError("Location information is unavailable. Please try again.");
          } else if (errorCode === 3) {
            setError("Location request timed out. Please try again.");
          } else {
            setError("Unable to retrieve your location. Please try again.");
          }
          setLoading(false);
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  // Fetch nearby items when location or filters change
  useEffect(() => {
    if (userLocation) {
      fetchNearbyItems();
    }
  }, [radius, priceRange, activeFilter, userLocation]);

  const fetchNearbyItems = async () => {
    if (!userLocation) {
      setError("Location not available");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        lat: userLocation.latitude.toString(),
        lng: userLocation.longitude.toString(),
        radius: radius.toString(),
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        filter: activeFilter
      });

      const response = await fetch(`/api/nearby?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Error fetching nearby items: ${response.statusText}`);
      }
      
      const data = await response.json() as NearbyApiResponse;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Add location property
      const propertiesWithLocation = (data.properties || []).map(p => ({
        ...p,
        id: p.id.toString(),
        location: { latitude: p.latitude, longitude: p.longitude }
      }));
      
      const roommatesWithLocation = (data.roommates || []).map(r => ({
        ...r,
        id: r.id.toString(),
        location: { latitude: r.latitude || 0, longitude: r.longitude || 0 }
      }));
      
      setProperties(propertiesWithLocation);
      setRoommates(roommatesWithLocation);
    } catch (error) {
      console.error("Error fetching nearby items:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch nearby items");
      setProperties([]);
      setRoommates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLocation = () => {
    setLocationPermission("pending");
    setError(null);
    initializeLocation();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  // Permission denied state
  if (locationPermission === "denied") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Location Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We need access to your location to show nearby properties and roommates. 
            Please enable location services in your browser settings and try again.
          </p>
          <button
            onClick={handleRetryLocation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading location state
  if (locationLoading || (loading && !userLocation)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Getting your location...
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please allow location access when prompted
          </p>
        </div>
      </div>
    );
  }

  // No location available
  if (!userLocation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Location Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please enable location services to see nearby properties and roommates.
          </p>
          <button
            onClick={handleRetryLocation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Enable Location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Nearby
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Discover properties and potential roommates in your area
            </p>
          </div>
          
          {/* Filters */}
          <div className="mt-4 md:mt-0 flex items-center space-x-4 flex-wrap gap-2">
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm"
            >
              <option value={1}>1 mile</option>
              <option value={5}>5 miles</option>
              <option value={10}>10 miles</option>
              <option value={20}>20 miles</option>
            </select>
            
            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-300 dark:border-gray-700">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  activeFilter === "all"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter("properties")}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  activeFilter === "properties"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                Properties
              </button>
              <button
                onClick={() => setActiveFilter("roommates")}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  activeFilter === "roommates"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                Roommates
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map */}
            <div className="lg:sticky lg:top-20 h-[400px] lg:h-[calc(100vh-6rem)] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <Map
                center={userLocation}
                properties={properties}
                roommates={roommates}
                radius={radius}
              />
            </div>

            {/* Results List */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {(activeFilter === "all" || activeFilter === "properties") && (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Nearby Properties ({properties.length})
                  </h2>
                  {properties.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">
                      No properties found in this area
                    </p>
                  ) : (
                    properties.map((property) => (
                      <motion.div
                        key={property.id}
                        variants={itemVariants}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        {property.images && property.images.length > 0 && (
                          <div className="aspect-video bg-gray-200 dark:bg-gray-700">
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-property.jpg";
                              }}
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {property.title}
                            </h3>
                            <span className="text-lg font-bold text-blue-500">
                              ${property.price}/mo
                            </span>
                          </div>
                          <p className="mt-2 text-gray-600 dark:text-gray-400 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {property.address} • {property.distance.toFixed(1)} miles
                          </p>
                          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center">
                              <Home className="w-4 h-4 mr-1" />
                              {property.type}
                            </span>
                            <span>{property.beds} beds</span>
                            <span>{property.baths} baths</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </>
              )}

              {(activeFilter === "all" || activeFilter === "roommates") && (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8">
                    Potential Roommates Nearby ({roommates.length})
                  </h2>
                  {roommates.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">
                      No roommates found in this area
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {roommates.map((roommate) => (
                        <motion.div
                          key={roommate.id}
                          variants={itemVariants}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 p-4"
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={roommate.profileImage || "/default-avatar.png"}
                              alt={roommate.name}
                              className="w-16 h-16 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/default-avatar.png";
                              }}
                            />
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {roommate.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {roommate.age} • {roommate.occupation}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {roommate.distance.toFixed(1)} miles away
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-500">
                                {roommate.matchPercentage}%
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                match
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
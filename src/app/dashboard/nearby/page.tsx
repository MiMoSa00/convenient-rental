"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Home, Users, Filter, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import map component to avoid SSR issues
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

// Define types directly in the component or ensure they're exported from @/types
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
  const [activeFilter, setActiveFilter] = useState<"all" | "properties" | "roommates">("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [radius, setRadius] = useState<number>(5); // miles
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user's location from localStorage (set during login)
    const savedLocation = localStorage.getItem("user_location");
    if (savedLocation) {
      try {
        setUserLocation(JSON.parse(savedLocation));
      } catch (error) {
        console.error("Error parsing saved location:", error);
        setError("Could not load saved location");
      }
    }
  }, []);

  useEffect(() => {
    // Fetch nearby items if we have a location
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
      
      // Add location property and convert id to string for Map component
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
    } finally {
      setLoading(false);
    }
  };

  // Framer motion variants for animations
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

  if (!userLocation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Location Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please enable location services to see nearby properties and roommates
          </p>
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
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
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
                className={`px-4 py-2 rounded-md text-sm ${
                  activeFilter === "all"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter("properties")}
                className={`px-4 py-2 rounded-md text-sm ${
                  activeFilter === "properties"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Properties
              </button>
              <button
                onClick={() => setActiveFilter("roommates")}
                className={`px-4 py-2 rounded-md text-sm ${
                  activeFilter === "roommates"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Roommates
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
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
                        initial="hidden"
                        animate="visible"
                        transition={{ type: "spring", stiffness: 100 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        {property.images && property.images.length > 0 && (
                          <div className="aspect-video">
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="object-cover w-full h-full"
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
                            {property.address} • {property.distance.toFixed(1)} miles away
                          </p>
                          <div className="mt-4 flex items-center space-x-4 text-gray-600 dark:text-gray-400">
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
                          initial="hidden"
                          animate="visible"
                          transition={{ type: "spring", stiffness: 100 }}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 p-4"
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={roommate.profileImage || "/default-avatar.png"}
                              alt={roommate.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {roommate.name}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                {roommate.age} • {roommate.occupation}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {roommate.distance.toFixed(1)} miles away
                              </p>
                            </div>
                            <div className="ml-auto text-right">
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
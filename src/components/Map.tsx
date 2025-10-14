"use client";
import { useEffect, useRef } from "react";

interface Location {
  latitude: number;
  longitude: number;
}

interface Property {
  id: string;
  title: string;
  location: Location;
  type: "house" | "apartment";
}

interface NearbyRoommate {
  id: string;
  name: string;
  location: Location;
}

interface MapProps {
  center: Location;
  properties: Property[];
  roommates: NearbyRoommate[];
  radius: number;
}

export default function Map({ center, properties, roommates, radius }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if already loaded
        if ((window as any).google && (window as any).google.maps) {
          resolve();
          return;
        }

        // Check if script is already being loaded
        if (scriptLoadedRef.current) {
          return;
        }

        scriptLoadedRef.current = true;

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps script'));
        
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      try {
        // Wait for the script to load
        await loadGoogleMapsScript();
        
        if (mapRef.current && (window as any).google) {
          const google = (window as any).google;

          // Clear existing markers
          markersRef.current.forEach((marker: any) => {
            if (marker && marker.setMap) {
              marker.setMap(null);
            }
          });
          markersRef.current = [];

          // Create map
          if (!googleMapRef.current) {
            googleMapRef.current = new google.maps.Map(mapRef.current, {
              center: { lat: center.latitude, lng: center.longitude },
              zoom: 13,
              styles: [
                {
                  featureType: "all",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#6c7783" }],
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [{ color: "#e9e9e9" }],
                },
              ],
            });
          } else {
            // Update center if map already exists
            googleMapRef.current.setCenter({ lat: center.latitude, lng: center.longitude });
          }

          // Draw radius circle
          const circle = new google.maps.Circle({
            map: googleMapRef.current,
            center: { lat: center.latitude, lng: center.longitude },
            radius: radius * 1609.34, // Convert miles to meters
            fillColor: "#4299e1",
            fillOpacity: 0.1,
            strokeColor: "#4299e1",
            strokeOpacity: 0.8,
            strokeWeight: 2,
          });
          markersRef.current.push(circle);

          // Add markers for properties
          properties.forEach((property) => {
            const marker = new google.maps.Marker({
              position: {
                lat: property.location.latitude,
                lng: property.location.longitude,
              },
              map: googleMapRef.current,
              title: property.title,
              icon: {
                url: property.type === "house" ? "/house-marker.svg" : "/apartment-marker.svg",
                scaledSize: new google.maps.Size(32, 32),
              },
            });

            // Add click listener for info window
            marker.addListener("click", () => {
              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div class="p-2">
                    <h3 class="font-medium">${property.title}</h3>
                    <p class="text-sm text-gray-600">${property.type}</p>
                  </div>
                `,
              });
              infoWindow.open(googleMapRef.current, marker);
            });

            markersRef.current.push(marker);
          });

          // Add markers for roommates
          roommates.forEach((roommate) => {
            const marker = new google.maps.Marker({
              position: {
                lat: roommate.location.latitude,
                lng: roommate.location.longitude,
              },
              map: googleMapRef.current,
              title: roommate.name,
              icon: {
                url: "/roommate-marker.svg",
                scaledSize: new google.maps.Size(32, 32),
              },
            });

            marker.addListener("click", () => {
              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div class="p-2">
                    <h3 class="font-medium">${roommate.name}</h3>
                    <p class="text-sm text-gray-600">Potential Roommate</p>
                  </div>
                `,
              });
              infoWindow.open(googleMapRef.current, marker);
            });

            markersRef.current.push(marker);
          });
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      markersRef.current.forEach((marker: any) => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];
    };
  }, [center, properties, roommates, radius]);

  return <div ref={mapRef} className="w-full h-full" />;
}
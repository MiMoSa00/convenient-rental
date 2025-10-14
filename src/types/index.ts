import { Location } from "./location";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
}

// Property related interfaces
export interface Property {
  id: string;
  title: string;
  type: "house" | "apartment" | "condo" | "studio";
  price: number;
  address: string;
  distance?: number;
  images: string[];
  beds: number;
  baths: number;
  location: Location;
  description?: string;
  amenities?: string[];
  availableFrom?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyCreate {
  title: string;
  type: Property["type"];
  price: number;
  address: string;
  images: string[];
  beds: number;
  baths: number;
  location: Location;
  description?: string;
  amenities?: string[];
  availableFrom?: Date;
}

export interface PropertyUpdate {
  title?: string;
  type?: Property["type"];
  price?: number;
  address?: string;
  images?: string[];
  beds?: number;
  baths?: number;
  location?: Location;
  description?: string;
  amenities?: string[];
  availableFrom?: Date;
}

// User and Roommate related interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NearbyRoommate {
  id: string;
  name: string;
  age?: number;
  occupation?: string;
  distance?: number;
  profileImage?: string;
  matchPercentage?: number;
  interests?: string[];
  preferences?: RoommatePreferences;
}

export interface RoommatePreferences {
  smoking?: boolean;
  pets?: boolean;
  gender?: "male" | "female" | "other" | "no_preference";
  ageRange?: [number, number];
  cleanliness?: 1 | 2 | 3 | 4 | 5;
  socialLevel?: 1 | 2 | 3 | 4 | 5;
  workSchedule?: "day" | "night" | "flexible";
  maxBudget?: number;
}

// API Response interfaces
export interface NearbyApiResponse {
  properties?: Property[];
  roommates?: NearbyRoommate[];
  error?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  statusCode?: number;
}
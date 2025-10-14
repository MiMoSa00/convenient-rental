export interface Location {
  latitude: number;
  longitude: number;
}

export interface LocationWithAddress extends Location {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapBounds {
  northeast: Coordinates;
  southwest: Coordinates;
}

export interface GeocodingResult {
  address: string;
  location: Location;
  bounds?: MapBounds;
  placeId?: string;
}
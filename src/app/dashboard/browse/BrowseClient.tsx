"use client";
import React, { useMemo, useState, useEffect } from "react";
import ThemeWrapper from '@/components/ThemeWrapper';
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  MapPin,
  Search,
  Users,
  MessageSquare,
  Sparkles,
  Heart,
  Star,
} from "lucide-react";

type SearchForm = {
  location: string;
  keywords: string;
  propertyType: string;
  apartmentType: string;
  priceRange: string;
};

type ResultItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  location?: string;
  snippet?: string;
  thumbnail?: string;
  priceNaira?: number;
};

type RoommateMatch = {
  id: string | number;
  name: string;
  age: number;
  location: string;
  occupation: string;
  budgetNairaMin?: number;
  budgetNairaMax?: number;
  compatibility: number;
  interests: string[];
  bio?: string;
};

const popularLocations = [
  "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu",
  "Benin City", "Abeokuta", "Uyo", "Owerri", "Asaba", "Warri",
  "Calabar", "Ilorin", "Jos", "Kaduna",
];

const priceOptions = [
  { value: "any", label: "Any Price", shortLabel: "Any" },
  { value: "0-200000", label: "Under ₦200,000", shortLabel: "<₦200k" },
  { value: "200000-500000", label: "₦200k - ₦500k", shortLabel: "₦200k-500k" },
  { value: "500000-1000000", label: "₦500k - ₦1M", shortLabel: "₦500k-1M" },
  { value: "1000000-2000000", label: "₦1M - ₦2M", shortLabel: "₦1M-2M" },
  { value: "2000000+", label: "₦2M+", shortLabel: "₦2M+" },
];

const propertyTypes = [
  { value: "any", label: "All Types", shortLabel: "All" },
  { value: "apartment", label: "Apartment", shortLabel: "Apt" },
  { value: "shared", label: "Shared Room", shortLabel: "Shared" },
  { value: "studio", label: "Studio", shortLabel: "Studio" },
];

const apartmentTypes = [
  { value: "any", label: "Any Type", shortLabel: "Any" },
  { value: "self contain", label: "Self Contain", shortLabel: "Self-con" },
  { value: "room and parlour self contain", label: "Room & Parlour", shortLabel: "R&P" },
  { value: "mini flat", label: "Mini Flat", shortLabel: "Mini" },
  { value: "studio", label: "Studio", shortLabel: "Studio" },
  { value: "2 bedroom", label: "2 Bedroom", shortLabel: "2BR" },
  { value: "3 bedroom", label: "3 Bedroom", shortLabel: "3BR" },
  { value: "duplex", label: "Duplex", shortLabel: "Duplex" },
  { value: "bungalow", label: "Bungalow", shortLabel: "Bungalow" },
  { value: "penthouse", label: "Penthouse", shortLabel: "Pent" },
];

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);

function findRoommatesDemo(form: SearchForm): RoommateMatch[] {
  const pool: RoommateMatch[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      age: 22,
      location: "Lagos",
      occupation: "Student",
      budgetNairaMin: 300000,
      budgetNairaMax: 600000,
      compatibility: 92,
      interests: ["Clean", "Quiet", "Non-smoker"],
      bio: "Looking for a tidy roommate near Yaba/Unilag.",
    },
    {
      id: 2,
      name: "Mike Chen",
      age: 25,
      location: "Abuja",
      occupation: "Software Developer",
      budgetNairaMin: 500000,
      budgetNairaMax: 900000,
      compatibility: 87,
      interests: ["Tech", "Cooking", "Gym"],
      bio: "Remote dev, prefers quiet, gym nearby.",
    },
    {
      id: 3,
      name: "Adaeze Obi",
      age: 27,
      location: "Port Harcourt",
      occupation: "Nurse",
      budgetNairaMin: 400000,
      budgetNairaMax: 700000,
      compatibility: 81,
      interests: ["Early riser", "Clean", "Non-smoker"],
      bio: "Night shifts, needs a respectful roommate.",
    },
    {
      id: 4,
      name: "Ibrahim Musa",
      age: 24,
      location: "Lagos",
      occupation: "Entrepreneur",
      budgetNairaMin: 600000,
      budgetNairaMax: 1200000,
      compatibility: 85,
      interests: ["Business", "Cooking", "Fitness"],
      bio: "Friendly and organized, prefers Island axis.",
    },
  ];

  const loc = (form.location || "").toLowerCase();
  const kw = (form.keywords || "").toLowerCase();
  const filtered = pool.filter((p) => {
    const locMatch = !loc || p.location.toLowerCase().includes(loc);
    const kwMatch =
      !kw ||
      p.name.toLowerCase().includes(kw) ||
      p.occupation.toLowerCase().includes(kw) ||
      p.interests.some((i) => i.toLowerCase().includes(kw)) ||
      (p.bio || "").toLowerCase().includes(kw);
    return locMatch && kwMatch;
  });

  return filtered.sort((a, b) => b.compatibility - a.compatibility);
}

// Storage helper functions
const STORAGE_KEY = 'browse-search-cache';
const FAVORITES_KEY = 'browse-favorites';

const saveToStorage = (form: SearchForm, results: ResultItem[], roommateResults: RoommateMatch[]) => {
  try {
    const data = {
      form,
      results,
      roommateResults,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

const getFavorites = (): ResultItem[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load favorites:', error);
    return [];
  }
};

const saveFavorites = (favorites: ResultItem[]) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
};

const toggleFavorite = (item: ResultItem): boolean => {
  const favorites = getFavorites();
  const index = favorites.findIndex(f => f.id === item.id);
  
  if (index > -1) {
    favorites.splice(index, 1);
    saveFavorites(favorites);
    return false;
  } else {
    favorites.push(item);
    saveFavorites(favorites);
    return true;
  }
};

export default function BrowseClient() {
  const router = useRouter();
  const qp = useSearchParams();

  const [form, setForm] = useState<SearchForm>({
    location: qp?.get("location") || "",
    keywords: qp?.get("q") || "",
    propertyType: qp?.get("type") || "any",
    apartmentType: qp?.get("aptType") || "any",
    priceRange: qp?.get("price") || "any",
  });

  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [roommateResults, setRoommateResults] = useState<RoommateMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const cached = loadFromStorage();
    
    if (cached) {
      setResults(cached.results || []);
      setRoommateResults(cached.roommateResults || []);
      if (!qp?.get("location") && !qp?.get("q")) {
        setForm(cached.form);
      }
    }
    
    const favs = getFavorites();
    setFavorites(new Set(favs.map(f => f.id)));
    
    setIsInitialized(true);
  }, []);

  const filteredLocations = useMemo(() => {
    if (!form.location) return popularLocations;
    const q = form.location.toLowerCase();
    return popularLocations.filter((l) => l.toLowerCase().includes(q));
  }, [form.location]);

  const handleToggleFavorite = (item: ResultItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isFav = toggleFavorite(item);
    
    if (isFav) {
      setFavorites(prev => new Set([...prev, item.id]));
    } else {
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError(null);

    const params = new URLSearchParams();
    if (form.location) params.set("location", form.location);
    if (form.keywords) params.set("q", form.keywords);
    if (form.propertyType !== "any") params.set("type", form.propertyType);
    if (form.apartmentType !== "any") params.set("aptType", form.apartmentType);
    if (form.priceRange !== "any") params.set("price", form.priceRange);
    router.replace(`/dashboard/browse?${params.toString()}`);

    try {
      if (form.propertyType === "shared") {
        const matches = findRoommatesDemo(form);
        setRoommateResults(matches);
        setResults([]);
        saveToStorage(form, [], matches);
      } else {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            ...form,
            country: "NG",
          }),
        });
        
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `Search failed with status ${res.status}`);
        }
        
        const data = (await res.json()) as { items: ResultItem[] };
        const items = data.items || [];
        
        setResults(items);
        setRoommateResults([]);
        saveToStorage(form, items, []);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || "Search failed");
      setResults([]);
      setRoommateResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const mapQuery = encodeURIComponent(form.location || "Nigeria");
  const mapSrc = `https://www.google.com/maps?q=${mapQuery}&z=13&output=embed`;

  if (!isInitialized) {
    return (
      <ThemeWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600 text-sm sm:text-base">Loading...</div>
        </div>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>

      <div className="min-h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <div className="relative overflow-hidden border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 opacity-50"></div>
          
          <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3 animate-fade-in-down">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-700 backdrop-blur-sm rounded-full border border-purple-200 dark:border-purple-700 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400 animate-pulse flex-shrink-0" />
                  <span className="whitespace-nowrap">Smart Search Powered</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Browse Rentals
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                  Discover your perfect home from our curated collection of premium listings across Nigeria
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Search Form */}
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 md:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Location Input */}
              <div className="relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 100)}
                    placeholder="e.g. Lagos, Abuja..."
                    className="w-full px-3 py-2 pl-3 pr-9 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                  <MapPin className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 flex-shrink-0" />
                </div>
                {showLocationSuggestions && (
                  <div
                    className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 sm:max-h-56 overflow-auto"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {filteredLocations.length === 0 ? (
                      <div className="px-3 py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">No suggestions</div>
                    ) : (
                      filteredLocations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm sm:text-base hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            setForm((f) => ({ ...f, location: loc }));
                            setShowLocationSuggestions(false);
                          }}
                        >
                          {loc}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Keywords Input */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                  placeholder="e.g. close to Yaba..."
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              {/* Property Type Select */}
              <div className="relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2 truncate">
                  Property Type
                </label>
                <div className="relative">
                  <select
                    value={form.propertyType}
                    onChange={(e) => setForm((f) => ({ ...f, propertyType: e.target.value }))}
                    className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm md:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer pr-8 truncate bg-white"
                    style={{ 
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundImage: 'none'
                    }}
                  >
                    {propertyTypes.map((opt) => (
                      <option key={opt.value} value={opt.value} className="text-xs sm:text-sm md:text-base bg-white dark:bg-gray-700 py-2">
                        {isMobile ? opt.shortLabel : opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Apartment Type Select */}
              <div className="relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2 truncate">
                  Apartment Type
                </label>
                <div className="relative">
                  <select
                    value={form.apartmentType}
                    onChange={(e) => setForm((f) => ({ ...f, apartmentType: e.target.value }))}
                    className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm md:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer pr-8 truncate bg-white"
                    style={{ 
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundImage: 'none'
                    }}
                  >
                    {apartmentTypes.map((opt) => (
                      <option key={opt.value} value={opt.value} className="text-xs sm:text-sm md:text-base bg-white dark:bg-gray-700 py-2">
                        {isMobile ? opt.shortLabel : opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Price Range Select */}
              <div className="relative">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2 truncate">
                  Price (NGN)
                </label>
                <div className="relative">
                  <select
                    value={form.priceRange}
                    onChange={(e) => setForm((f) => ({ ...f, priceRange: e.target.value }))}
                    className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm md:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer pr-8 truncate bg-white"
                    style={{ 
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundImage: 'none'
                    }}
                  >
                    {priceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="text-xs sm:text-sm md:text-base bg-white dark:bg-gray-700 py-2">
                        {isMobile ? opt.shortLabel : opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <button
                  type="button"
                  onClick={onSubmit}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg inline-flex items-center justify-center transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isSearching}
                >
                  <Search className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">{isSearching ? "Searching..." : "Search"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden">
              <iframe
                title="Map"
                src={mapSrc}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5 md:p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-xs sm:text-sm text-red-700 dark:text-red-400 animate-scale-in">
                {error}
              </div>
            )}

            {form.propertyType === "shared" || roommateResults.length > 0 ? (
              roommateResults.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-600 dark:text-gray-400">
                  <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                  <p className="text-lg sm:text-xl font-medium mb-2">No roommate matches yet</p>
                  <p className="text-xs sm:text-sm">Adjust your location or keywords to find potential roommates.</p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Found <span className="font-semibold text-purple-600 dark:text-purple-400">{roommateResults.length}</span> compatible roommates
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {roommateResults.map((m, index) => (
                      <div 
                        key={m.id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg md:text-xl shadow-lg flex-shrink-0">
                              {m.name[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-sm sm:text-base md:text-lg truncate">
                                {m.name}, {m.age}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">
                                {m.occupation}
                              </p>
                              <p className="text-gray-500 dark:text-gray-500 text-xs flex items-center truncate">
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{m.location}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center mb-1">
                              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-0.5 sm:mr-1 flex-shrink-0" />
                              <span className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                                {m.compatibility}%
                              </span>
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Match</div>
                          </div>
                        </div>

                        {(m.budgetNairaMin || m.budgetNairaMax) && (
                          <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-semibold mb-2 sm:mb-3 truncate">
                            Budget: {m.budgetNairaMin ? formatNaira(m.budgetNairaMin) : ""}{m.budgetNairaMin && m.budgetNairaMax ? " - " : ""}{m.budgetNairaMax ? formatNaira(m.budgetNairaMax) : ""}
                          </p>
                        )}

                        {m.interests?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                            {m.interests.map((i, idx) => (
                              <span key={idx} className="text-[10px] sm:text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                {i}
                              </span>
                            ))}
                          </div>
                        )}

                        {m.bio && <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-2">{m.bio}</p>}

                        <div className="flex gap-2">
                          <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm inline-flex items-center justify-center transition-all duration-300 font-medium">
                            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" /> 
                            <span className="truncate">Message</span>
                          </button>
                          <button className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm transition-all duration-300 hover:border-red-300 group flex-shrink-0">
                            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : results.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-gray-600 dark:text-gray-400">
                <Home className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
                <p className="text-lg sm:text-xl font-medium mb-2">No listings to show yet</p>
                <p className="text-xs sm:text-sm">Try a different location or broaden your filters.</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-semibold text-purple-600 dark:text-purple-400">{results.length}</span> properties
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {results.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 animate-fade-in-up relative"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <div className="h-40 sm:h-48 bg-gradient-to-br from-purple-400 to-pink-500 relative overflow-hidden">
                          <img
                            src={item.thumbnail || "/Images/rental-3.jpeg"}
                            alt={item.title}
                            className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              el.src = "/Images/rental-3.jpeg";
                            }}
                          />
                          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                            <span className="text-[10px] sm:text-xs bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-2 sm:px-3 py-1 rounded-full font-medium whitespace-nowrap">
                              {item.source}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 sm:p-4 md:p-5 pb-12 sm:pb-14">
                          <h3 className="font-bold text-sm sm:text-base md:text-lg mb-2 line-clamp-2 leading-tight">{item.title}</h3>
                          {item.location && (
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm flex items-center mb-2">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </p>
                          )}
                          {typeof item.priceNaira === "number" && (
                            <p className="text-green-600 dark:text-green-400 font-bold text-base sm:text-lg mb-2 truncate">
                              {formatNaira(item.priceNaira)}
                            </p>
                          )}
                          {item.snippet && (
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{item.snippet}</p>
                          )}
                        </div>
                      </a>
                      
                      {/* Heart Icon at Bottom Right */}
                      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
                        <button
                          onClick={(e) => handleToggleFavorite(item, e)}
                          className={`p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 shadow-lg ${
                            favorites.has(item.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                          title={favorites.has(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart
                            className={`h-4 w-4 sm:h-5 sm:w-5 ${favorites.has(item.id) ? 'fill-current' : ''}`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
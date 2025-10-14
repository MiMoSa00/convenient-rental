"use client";
  import React, { useMemo, useState } from "react";
import ThemeWrapper from '@/components/ThemeWrapper';
  import { useRouter, useSearchParams } from "next/navigation";
  import {
    Home,
    MapPin,
    Search as SearchIcon,
    Users,
    MessageSquare,
  } from "lucide-react";
  
  type SearchForm = {
    location: string;
    keywords: string;
    propertyType: string;   // apartment/shared/studio/etc.
    apartmentType: string;  // self contain/room and parlour/2 bedroom/3 bedroom/duplex/etc.
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
    compatibility: number; // 0-100
    interests: string[];
    bio?: string;
  };
  
  const popularLocations = [
    "Lagos",
    "Abuja",
    "Port Harcourt",
    "Ibadan",
    "Kano",
    "Enugu",
    "Benin City",
    "Abeokuta",
    "Uyo",
    "Owerri",
    "Asaba",
    "Warri",
    "Calabar",
    "Ilorin",
    "Jos",
    "Kaduna",
  ];
  
  const priceOptions = [
    { value: "any", label: "Any Price" },
    { value: "0-200000", label: "Under ₦200,000" },
    { value: "200000-500000", label: "₦200,000 - ₦500,000" },
    { value: "500000-1000000", label: "₦500,000 - ₦1,000,000" },
    { value: "1000000-2000000", label: "₦1,000,000 - ₦2,000,000" },
    { value: "2000000+", label: "₦2,000,000+" },
  ];
  
  const propertyTypes = [
    { value: "any", label: "All Types" },
    { value: "apartment", label: "Apartment" },
    { value: "shared", label: "Shared Room" },
    { value: "studio", label: "Studio" },
  ];
  
  const apartmentTypes = [
    { value: "any", label: "Any Apartment Type" },
    { value: "self contain", label: "Self Contain (Self-con)" },
    { value: "room and parlour self contain", label: "Room & Parlour Self Contain" },
    { value: "mini flat", label: "Mini Flat" },
    { value: "studio", label: "Studio" },
    { value: "2 bedroom", label: "2 Bedroom" },
    { value: "3 bedroom", label: "3 Bedroom" },
    { value: "duplex", label: "Duplex" },
    { value: "bungalow", label: "Bungalow" },
    { value: "penthouse", label: "Penthouse" },
  ];
  
  const formatNaira = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);
  
  // Simple demo roommate search (local filtering). Replace with a backend call if you later persist profiles.
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
  
    // Sort by compatibility desc
    return filtered.sort((a, b) => b.compatibility - a.compatibility);
  }
  
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
  
    const filteredLocations = useMemo(() => {
      if (!form.location) return popularLocations;
      const q = form.location.toLowerCase();
      return popularLocations.filter((l) => l.toLowerCase().includes(q));
    }, [form.location]);
  
    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSearching(true);
      setError(null);
  
      // Update query params for shareable searches (keep user's raw selections)
      const params = new URLSearchParams();
      if (form.location) params.set("location", form.location);
      if (form.keywords) params.set("q", form.keywords);
      if (form.propertyType !== "any") params.set("type", form.propertyType);
      if (form.apartmentType !== "any") params.set("aptType", form.apartmentType);
      if (form.priceRange !== "any") params.set("price", form.priceRange);
      router.replace(`/dashboard/browse?${params.toString()}`);
  
      try {
        // If user is looking for "Shared Room", show internal roommate matches instead of external listings
        if (form.propertyType === "shared") {
          const matches = findRoommatesDemo(form);
          setRoommateResults(matches);
          setResults([]);
        } else {
          // Otherwise search external listings with raw values
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
          setResults(data.items || []);
          setRoommateResults([]);
        }
      } catch (err: any) {
        setError(err.message || "Search failed");
        setResults([]);
        setRoommateResults([]);
      } finally {
        setIsSearching(false);
      }
    };
  
    // Compute Google Maps iframe URL centered on the searched location
    const mapQuery = encodeURIComponent(form.location || "Nigeria");
    // z=13 is a reasonable city zoom; adjust as needed
    const mapSrc = `https://www.google.com/maps?q=${mapQuery}&z=13&output=embed`;
  
    return (
    <ThemeWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
        {/* Header bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* <Link href="/dashboard" className="text-blue-600 hover:underline">← Dashboard</Link> */}
              <h1 className="text-2xl font-bold">Browse Rentals</h1>
            </div>
            {/* <Link
              href="/dashboard"
              className="hidden sm:inline-block text-sm text-blue-600 hover:text-blue-700"
            >
              Back to Overview
            </Link> */}
          </div>
        </div>
  
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Filters */}
          <form onSubmit={onSubmit} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Location with suggestions */}
              <div className="relative md:flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 100)}
                    placeholder="e.g. Lagos, Abuja..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <MapPin className="h-4 w-4 text-gray-400 absolute right-3 top-3" />
                </div>
                {showLocationSuggestions && (
                  <div
                    className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-sm max-h-56 overflow-auto"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {filteredLocations.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">No suggestions</div>
                    ) : (
                      filteredLocations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-gray-50"
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
  
              {/* Keywords */}
              <div className="md:flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                  placeholder="e.g. close to Yaba, furnished..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
  
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={form.propertyType}
                  onChange={(e) => setForm((f) => ({ ...f, propertyType: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {propertyTypes.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
  
              {/* Apartment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apartment Type</label>
                <select
                  value={form.apartmentType}
                  onChange={(e) => setForm((f) => ({ ...f, apartmentType: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {apartmentTypes.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
  
              {/* Price Range (NGN) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (NGN)</label>
                <select
                  value={form.priceRange}
                  onChange={(e) => setForm((f) => ({ ...f, priceRange: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
  
              {/* Search */}
              <div className="md:self-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center"
                  disabled={isSearching}
                >
                  <SearchIcon className="h-4 w-4 mr-2" />
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
          </form>
  
          {/* Interactive Map (Google Maps Embed) */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="h-64 rounded-t-lg overflow-hidden">
              <iframe
                title="Map"
                src={mapSrc}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
  
          {/* Results */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
  
            {/* If user selected Shared Room, show roommate matches (internal), else show listing results */}
            {form.propertyType === "shared" ? (
              roommateResults.length === 0 ? (
                <div className="text-center py-10 text-gray-600">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>No roommate matches yet.</p>
                  <p className="text-sm text-gray-500">Adjust your location or keywords to find potential roommates.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roommateResults.map((m) => (
                    <div key={m.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {m.name[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {m.name}, {m.age}
                            </h3>
                            <p className="text-gray-600 text-sm">{m.occupation} • {m.location}</p>
                            {(m.budgetNairaMin || m.budgetNairaMax) && (
                              <p className="text-green-600 text-sm font-semibold">
                                Budget: {m.budgetNairaMin ? formatNaira(m.budgetNairaMin) : ""}{m.budgetNairaMin && m.budgetNairaMax ? " - " : ""}{m.budgetNairaMax ? formatNaira(m.budgetNairaMax) : ""}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-600 font-bold">{m.compatibility}%</div>
                          <div className="text-xs text-gray-500">Match</div>
                        </div>
                      </div>
                      {m.interests?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {m.interests.map((i, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {i}
                            </span>
                          ))}
                        </div>
                      )}
                      {m.bio && <p className="text-sm text-gray-600 mt-3 line-clamp-3">{m.bio}</p>}
                      <div className="mt-4 flex gap-2">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm inline-flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 mr-1" /> Message
                        </button>
                        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          Save
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : results.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                <Home className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p>No listings to show yet.</p>
                <p className="text-sm text-gray-500">Try a different location or broaden your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                      {/* Always show an image tag; you can replace the placeholder path with your own */}
                      <img
                        src={item.thumbnail || "/Images/rental-3.jpeg"}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.src = "/Images/rental-3.jpeg";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {item.source}
                        </span>
                      </div>
                      {item.location && (
                        <p className="text-gray-600 text-sm flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {item.location}
                        </p>
                      )}
                      {typeof item.priceNaira === "number" && (
                        <p className="text-green-600 font-bold mt-2">
                          {formatNaira(item.priceNaira)}
                        </p>
                      )}
                      {item.snippet && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.snippet}</p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemeWrapper>
    );
  }
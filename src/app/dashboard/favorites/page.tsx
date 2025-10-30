"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Trash2 } from 'lucide-react';

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

const FAVORITES_KEY = 'browse-favorites';

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);

const getFavorites = (): ResultItem[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('❌ Failed to load favorites:', error);
    return [];
  }
};

const saveFavorites = (favorites: ResultItem[]) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('❌ Failed to save favorites:', error);
  }
};

const Favorites = () => {
  const [favorites, setFavorites] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = () => {
      const saved = getFavorites();
      setFavorites(saved);
      setIsLoading(false);
    };

    loadFavorites();
  }, []);

  const handleRemoveFavorite = (itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const updatedFavorites = favorites.filter(f => f.id !== itemId);
    setFavorites(updatedFavorites);
    saveFavorites(updatedFavorites);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all saved properties?')) {
      setFavorites([]);
      saveFavorites([]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-white rounded-lg shadow-sm">
        <div className="text-gray-600">Loading your favorites...</div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
      `}</style>

      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Saved Properties
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              {favorites.length > 0 
                ? `${favorites.length} ${favorites.length === 1 ? 'property' : 'properties'} saved`
                : 'Properties you\'ve bookmarked for later'}
            </p>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {favorites.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center py-8 sm:py-12 lg:py-16 max-w-md mx-auto">
              {/* Animated Heart Icon */}
              <div className="mb-6 sm:mb-8">
                <Heart className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-gray-400 dark:text-gray-600 mx-auto animate-pulse" />
              </div>
              
              {/* Title */}
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                No Saved Properties
              </h2>
              
              {/* Description */}
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed px-4">
                Properties you save will appear here for easy access. Start browsing to find your perfect home!
              </p>
              
              {/* Browse Properties Link Button */}
              <Link
                href="/dashboard/browse"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 font-medium text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
              >
                Browse Properties
              </Link>
              
              {/* Additional helpful text */}
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-4 sm:mt-6 px-2">
                Tip: Click the heart icon on any property to save it here
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((item, index) => (
                <div
                  key={item.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 relative group"
                  >
                    <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 relative overflow-hidden">
                      <img
                        src={item.thumbnail || "/Images/rental-3.jpeg"}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.src = "/Images/rental-3.jpeg";
                        }}
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={(e) => handleRemoveFavorite(item.id, e)}
                          className="p-2 bg-red-500 text-white rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 shadow-lg hover:bg-red-600"
                          title="Remove from favorites"
                        >
                          <Heart className="h-5 w-5 fill-current" />
                        </button>
                        <span className="text-xs bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-3 py-2 rounded-full font-medium">
                          {item.source}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      {item.location && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {item.location}
                        </p>
                      )}
                      {typeof item.priceNaira === "number" && (
                        <p className="text-green-600 dark:text-green-400 font-bold text-lg mb-2">
                          {formatNaira(item.priceNaira)}
                        </p>
                      )}
                      {item.snippet && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {item.snippet}
                        </p>
                      )}
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
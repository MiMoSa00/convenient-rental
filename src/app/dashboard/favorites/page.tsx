"use client";
import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

const Favorites = () => {
  return (
    <div className="min-h-full flex flex-col bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Saved Properties
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Properties you've bookmarked for later
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="text-center py-8 sm:py-12 lg:py-16 max-w-md mx-auto">
          {/* Animated Heart Icon */}
          <div className="mb-6 sm:mb-8">
            <Heart className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-gray-400 mx-auto animate-pulse" />
          </div>
          
          {/* Title */}
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">
            No Saved Properties
          </h2>
          
          {/* Description */}
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed px-4">
            Properties you save will appear here for easy access. Start browsing to find your perfect home!
          </p>
          
          {/* Browse Properties Link Button with Pulsing Animation */}
          <Link
            href="/dashboard/browse"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 font-medium text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse hover:animate-none focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
          >
            Browse Properties
          </Link>
          
          {/* Additional helpful text */}
          <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6 px-2">
            Tip: Click the heart icon on any property to save it here
          </p>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
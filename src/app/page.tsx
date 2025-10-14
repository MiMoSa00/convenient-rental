'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import ImageSlider from '@/components/ImageSlider';

const features = [
  {
    icon: "🏠",
    title: "Find Perfect Matches",
    description: "Our smart algorithm matches you with compatible roommates based on lifestyle and preferences."
  },
  {
    icon: "🔒",
    title: "Verified Listings",
    description: "All properties and users are verified to ensure a safe and trustworthy experience."
  },
  {
    icon: "💬",
    title: "Easy Communication",
    description: "Built-in messaging system to easily connect with potential roommates and landlords."
  },
  {
    icon: "📍",
    title: "Prime Locations",
    description: "Discover properties in the best neighborhoods and convenient locations."
  },
  {
    icon: "💰",
    title: "Flexible Pricing",
    description: "Find options that fit your budget, from affordable to luxury accommodations."
  },
  {
    icon: "⭐",
    title: "Premium Features",
    description: "Access advanced features to make your house-hunting experience even better."
  }
];

export default function Home() {
  return (
    <div className="relative">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-16">
        <ImageSlider />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fixed Listings Button */}
      <motion.div
        className="fixed bottom-8 right-8"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Link
          href="/listings"
          className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>View Listings</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </motion.div>
    </div>
  );
}
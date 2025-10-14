'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const images = [
  {
    url: '/Images/rental 1.jpg',
    title: 'Luxury Apartments',
    description: 'Find your perfect modern living space'
  },
  {
    url: '/Images/rental-3.jpeg',
    title: 'Cozy Studios',
    description: 'Affordable and comfortable solutions'
  },
  {
    url: '/Images/rental-4.png',
    title: 'Shared Spaces',
    description: 'Meet like-minded roommates'
  },
  {
    url: '/Images/rental-6.jpg',
    title: 'Student Housing',
    description: 'Perfect for university life'
  },
  {
    url: '/Images/rentalNew.jpg',
    title: 'Premium Locations',
    description: 'Prime spots in the city'
  },
  {
    url: '/Images/Floor-rent.jpeg',
    title: 'Modern Living',
    description: 'Contemporary design meets comfort'
  }
];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold mb-2"
              >
                {images[currentIndex].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl"
              >
                {images[currentIndex].description}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

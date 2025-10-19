'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      {/* Responsive horizontal padding and vertical padding to give breathing room at the top */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-3 lg:py-4">
        <div className="flex items-center justify-between flex-wrap gap-y-2">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              aria-label="Affordable Housing"
              className="flex items-center space-x-2 pt-3" /* slight top padding so logo isn't too close to top */
            >
              <Image
                src="/Images/apartLogo.avif"
                alt=""
                aria-hidden="true"
                width={48}
                height={48}
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
                priority
              />
              {/* If you prefer visible brand text on larger screens, uncomment below: */}
              <span className="hidden lg:inline text-base lg:text-lg font-semibold text-gray-900">
                Affordable Housing
              </span>
             
            </Link>
          </div>

          {/* Right: Auth / Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
            {session ? (
              <>
                {/* Hide greeting on very small screens to avoid overflow */}
                <span className="hidden sm:inline text-sm md:text-base text-gray-600 truncate max-w-[10rem] md:max-w-none">
                  Hello, {session.user?.name}
                </span>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-red-500 text-white text-xs sm:text-sm md:text-base px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Log Out
                </motion.button>
              </>
            ) : (
              <div className="flex items-center space-x-3 sm:space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm md:text-base"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white text-xs sm:text-sm md:text-base px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
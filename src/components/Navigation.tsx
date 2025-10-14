'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/Images/apartLogo.avif"
                alt="Convenient Rental"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div className="flex flex-col">
                {/* Keep an accessible label for screen readers but hide visible text so only the logo shows */}
                <span className="sr-only">Affordable Housing</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-gray-600">Hello, {session.user?.name}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Log Out
                </motion.button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
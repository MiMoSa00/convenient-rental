"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Initialize theme from localStorage or system preference
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme') as Theme;
  console.log('Saved theme from localStorage:', savedTheme);
  
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }
  
  // Check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    console.log('System prefers dark mode');
    return 'dark';
  }
  
  console.log('Defaulting to light mode');
  return 'light';
};

// Apply theme to document with enhanced debugging
const applyTheme = (theme: Theme) => {
  console.log('Applying theme:', theme);
  
  const root = document.documentElement;
  const body = document.body;
  
  // Remove any existing theme classes
  root.classList.remove('dark');
  
  // Apply new theme
  if (theme === 'dark') {
    root.classList.add('dark');
    console.log('Added dark class to html element');
  } else {
    console.log('Removed dark class from html element');
  }
  
  // Log final state
  console.log('Final html classes:', root.className);
  console.log('Dark class present:', root.classList.contains('dark'));
  
  // Force a style recalculation
  void root.offsetHeight;
  
  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#111827' : '#ffffff');
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    console.log('ThemeProvider initializing...');
    
    const initialTheme = getInitialTheme();
    console.log('Initial theme determined:', initialTheme);
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setIsInitialized(true);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only follow system preference if no manual theme is saved
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        console.log('System theme changed to:', newTheme);
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    console.log('=== THEME TOGGLE START ===');
    console.log('Current theme before toggle:', theme);
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('New theme will be:', newTheme);
    
    // Update state
    setTheme(newTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    console.log('Saved to localStorage:', newTheme);
    
    // Apply to DOM
    applyTheme(newTheme);
    
    // Additional debugging
    setTimeout(() => {
      console.log('Post-toggle check:');
      console.log('- Theme state:', newTheme);
      console.log('- HTML classes:', document.documentElement.className);
      console.log('- Dark class present:', document.documentElement.classList.contains('dark'));
      console.log('=== THEME TOGGLE END ===');
    }, 100);
  };

  // Show loading state to prevent flash
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
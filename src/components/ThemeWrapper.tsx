"use client";

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function ThemeWrapper({ children, className = '' }: Props) {
  const { theme } = useTheme();

  // Use CSS variables to make the page-level background authoritative.
  // When `html.dark` is present, globals.css overrides --background.
  const wrapperClass = `min-h-screen ${className}`;

  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }} className={wrapperClass}>
      {children}
    </div>
  );
}

'use client'

import { getRandomTheme } from '@/lib/colors';
import { useTheme } from '@/lib/ThemeProvider';
import { Shuffle } from 'lucide-react';

export const ThemeColorToggle = () => {
  const { currentTheme, setTheme } = useTheme();

  const handleRandomTheme = () => {
    const newTheme = getRandomTheme();
    setTheme(newTheme);
  };

  return (
    <button
      onClick={handleRandomTheme}
      className="p-2 hover:text-primary transition-colors"
      aria-label="Random theme color"
      title="Shuffle theme color"
    >
      <Shuffle size={20} />
    </button>
  );
};

import { useEffect } from 'react';

const themes = [
  { name: 'green', hue: 158 },
  { name: 'blue', hue: 210 },
  { name: 'purple', hue: 270 },
  { name: 'orange', hue: 30 },
  { name: 'red', hue: 0 },
  { name: 'teal', hue: 180 },
  { name: 'pink', hue: 320 },
  { name: 'yellow', hue: 50 },
];

export const useRandomTheme = () => {
  useEffect(() => {
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    
    const root = document.documentElement;
    
    root.style.setProperty('--primary-hue', randomTheme.hue);
  }, []);
};

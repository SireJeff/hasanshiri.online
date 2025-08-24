import { createContext, useContext, useEffect, useState } from 'react';
import { getRandomTheme } from './colors';

const ThemeContext = createContext({
  currentTheme: null,
  setTheme: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(null);

  // Function to apply a random theme
  const applyRandomTheme = () => {
    console.log('Applying random theme...');
    const theme = getRandomTheme();
    console.log('Selected theme:', theme.name);
    setTheme(theme);
  };

  // Apply theme on initial mount and when component updates
  useEffect(() => {
    console.log('Theme provider mounted');
    applyRandomTheme();
  }, []);

  // Handle refresh and visibility changes
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Page refreshed/visibility changed');
      if (document.visibilityState === 'visible') {
        applyRandomTheme();
      }
    };

    // Listen for page refresh
    window.addEventListener('load', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);

    return () => {
      window.removeEventListener('load', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, []);

  const setTheme = (theme) => {
    if (!theme) return;
    
    if (currentTheme) {
      document.documentElement.classList.remove(currentTheme.class);
    }
    document.documentElement.classList.add(theme.class);
    document.documentElement.style.setProperty('--primary-hue', theme.hue.toString());
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

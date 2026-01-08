// Define a set of pleasant, accessible color combinations
export const themeColors = [
  {
    name: 'emerald',
    hue: 158,
    baseHue: '158',
    class: 'theme-emerald'
  },
  {
    name: 'purple',
    hue: 265,
    baseHue: '265',
    class: 'theme-purple'
  },
  {
    name: 'blue',
    hue: 220,
    baseHue: '220',
    class: 'theme-blue'
  },
  {
    name: 'rose',
    hue: 350,
    baseHue: '350',
    class: 'theme-rose'
  },
  {
    name: 'amber',
    hue: 45,
    baseHue: '45',
    class: 'theme-amber'
  },
  {
    name: 'indigo',
    hue: 240,
    baseHue: '240',
    class: 'theme-indigo'
  }
];

// Get previous theme to ensure we don't pick the same one twice
let previousTheme = null;

export const getRandomTheme = () => {
  let newTheme;
  do {
    const randomIndex = Math.floor(Math.random() * themeColors.length);
    newTheme = themeColors[randomIndex];
  } while (previousTheme && newTheme.name === previousTheme.name);
  
  previousTheme = newTheme;
  return newTheme;
};

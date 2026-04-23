export const GAME_SETTINGS_STORAGE_KEY = 'gameSettings';

export const DEFAULT_GAME_SETTINGS = {
  masterVolume: 75,
  sfxVolume: 80,
  musicVolume: 60,
  darkMode: true,
  matchMusic: 'epic-battle',
  menuMusic: 'chill-vibes',
  firstMove: 'X',
};

export const loadGameSettings = () => {
  try {
    const rawSettings = localStorage.getItem(GAME_SETTINGS_STORAGE_KEY);
    if (!rawSettings) {
      return { ...DEFAULT_GAME_SETTINGS };
    }

    const parsedSettings = JSON.parse(rawSettings);
    return {
      ...DEFAULT_GAME_SETTINGS,
      ...(parsedSettings || {}),
    };
  } catch {
    return { ...DEFAULT_GAME_SETTINGS };
  }
};

export const saveGameSettings = (settings) => {
  const nextSettings = {
    ...DEFAULT_GAME_SETTINGS,
    ...(settings || {}),
  };

  localStorage.setItem(GAME_SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
  return nextSettings;
};

export const applyThemeToDocument = (settings = DEFAULT_GAME_SETTINGS) => {
  const isDarkMode = settings.darkMode !== false;
  const theme = isDarkMode ? 'dark' : 'light';

  document.documentElement.setAttribute('data-app-theme', theme);
  document.body.setAttribute('data-app-theme', theme);
  document.body.classList.toggle('app-theme-dark', isDarkMode);
  document.body.classList.toggle('app-theme-light', !isDarkMode);
};

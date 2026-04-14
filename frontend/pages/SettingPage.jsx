import React, { useState, useEffect } from 'react';
import MasterVolume from '../components/settings/Preferences/MasterVolume';
import SFX from '../components/settings/Preferences/SFX';
import MusicVolume from '../components/settings/Preferences/MusicVolume';
import DarkTheme from '../components/settings/Themes/DarkTheme';
import InMatch from '../components/settings/BGMusicSelector/InMatch';
import InMenu from '../components/settings/BGMusicSelector/InMenu';
import MoveOption from '../components/settings/GameOptions/MoveOption';
import LogOut from '../components/settings/System/LogOut';
import SaveSetting from '../components/settings/System/SaveSetting';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/SettingPage.css';

export default function SettingPage() {
  // Initialize settings state
  const [settings, setSettings] = useState({
    masterVolume: 75,
    sfxVolume: 80,
    musicVolume: 60,
    darkMode: true,
    matchMusic: 'epic-battle',
    menuMusic: 'chill-vibes',
    firstMove: 'X'
  });

  const [initialSettings, setInitialSettings] = useState(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check for unsaved changes
  useEffect(() => {
    const isChanged = JSON.stringify(settings) !== JSON.stringify(initialSettings);
    setHasUnsavedChanges(isChanged);
  }, [settings, initialSettings]);

  const handleSave = () => {
    setInitialSettings(settings);
    setHasUnsavedChanges(false);
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const handleLogOut = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to log out?')) {
        alert('Logged out');
      }
    } else {
      alert('Logged out');
    }
  };

  const handleBackToMenu = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to go back?')) {
        window.history.back();
      }
    } else {
      window.history.back();
    }
  };

  return (
    <div className={`min-vh-100 p-4 ${settings.darkMode ? 'bg-dark-gradient' : 'bg-light-gradient'}`}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Back to Menu Button */}
        <button
          onClick={handleBackToMenu}
          className={`btn btn-link text-decoration-none mb-4 p-0 d-flex align-items-center gap-2 ${
            settings.darkMode ? 'text-light' : 'text-dark'
          }`}
        >
          <i className="bi bi-arrow-left"></i>
          <span>Back to Menu</span>
        </button>

        {/* Settings Title */}
        <h1 className={`display-3 fw-bold mb-4 ${settings.darkMode ? 'text-white' : 'text-dark'}`}>
          Settings
        </h1>

        {/* Volume Section */}
        <div className={`section-card rounded p-4 mb-4 ${settings.darkMode ? 'section-dark' : 'section-light'}`}>
          <h2 className={`h3 mb-4 ${settings.darkMode ? 'text-white' : 'text-dark'}`}>Volume</h2>
          <MasterVolume
            value={settings.masterVolume}
            onChange={(value) => setSettings({ ...settings, masterVolume: value })}
            darkMode={settings.darkMode}
          />
          <SFX
            value={settings.sfxVolume}
            onChange={(value) => setSettings({ ...settings, sfxVolume: value })}
            darkMode={settings.darkMode}
          />
          <MusicVolume
            value={settings.musicVolume}
            onChange={(value) => setSettings({ ...settings, musicVolume: value })}
            darkMode={settings.darkMode}
          />
        </div>

        {/* Themes Section */}
        <div className="mb-4">
          <h2 className={`h3 mb-3 ${settings.darkMode ? 'text-white' : 'text-dark'}`}>Themes</h2>
          <DarkTheme
            isActive={settings.darkMode}
            onToggle={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
            darkMode={settings.darkMode}
          />
        </div>

        {/* BG Music Selector Section */}
        <div className={`section-card rounded p-4 mb-4 ${settings.darkMode ? 'section-dark' : 'section-light'}`}>
          <h2 className={`h3 mb-4 ${settings.darkMode ? 'text-white' : 'text-dark'}`}>BG Music Selector</h2>
          <InMatch
            value={settings.matchMusic}
            onChange={(value) => setSettings({ ...settings, matchMusic: value })}
            darkMode={settings.darkMode}
          />
          <InMenu
            value={settings.menuMusic}
            onChange={(value) => setSettings({ ...settings, menuMusic: value })}
            darkMode={settings.darkMode}
          />
        </div>

        {/* Game Options Section */}
        <div className={`section-card rounded p-4 mb-4 ${settings.darkMode ? 'section-dark' : 'section-light'}`}>
          <h2 className={`h3 mb-4 ${settings.darkMode ? 'text-white' : 'text-dark'}`}>Game Options</h2>
          <MoveOption
            value={settings.firstMove}
            onChange={(value) => setSettings({ ...settings, firstMove: value })}
            darkMode={settings.darkMode}
          />
        </div>

        {/* Log Out Button */}
        <div className="text-center mt-4 mb-5">
          <LogOut onLogOut={handleLogOut} />
        </div>

        {/* Save/Cancel Panel */}
        <SaveSetting onSave={handleSave} hasUnsavedChanges={hasUnsavedChanges} darkMode={settings.darkMode} />
      </div>
    </div>
  );
}




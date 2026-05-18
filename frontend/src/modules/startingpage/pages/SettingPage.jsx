import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DarkTheme from '../components/settings/Themes/DarkTheme';
import LogOut from '../components/settings/System/LogOut';
import SaveSetting from '../components/settings/System/SaveSetting';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/SettingPage.css';
import ROUTES from '../../../router/routes.config.js';
import { applyThemeToDocument, loadGameSettings, saveGameSettings } from '../../../shared/utils/gameSettings.js';
import { socialService } from '../../social/services/socialService.js';

export default function SettingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState(() => loadGameSettings());

  const [initialSettings, setInitialSettings] = useState(settings);
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(initialSettings),
    [settings, initialSettings]
  );
  const returnTo = location.state?.returnTo || ROUTES.MAIN_MENU;
  const returnState = location.state?.returnState;
  const backLabel = returnTo === ROUTES.MAIN_MENU
    ? 'Back to Menu'
    : returnTo === ROUTES.GAMEROOM
      ? 'Back to Game Room'
      : 'Back';

  useEffect(() => {
    applyThemeToDocument(settings);
  }, [settings]);

  const handleSave = () => {
    const nextSettings = saveGameSettings(settings);
    setSettings(nextSettings);
    setInitialSettings(nextSettings);
    alert('Settings saved successfully!');
  };

  const handleLogOut = async () => {
    const confirmMessage = hasUnsavedChanges
      ? 'You have unsaved changes. Are you sure you want to log out?'
      : 'Are you sure you want to log out?';
    const shouldLogOut = window.confirm(confirmMessage);

    if (!shouldLogOut) {
      return;
    }

    await socialService.updatePresence(false).catch(() => null);
    localStorage.removeItem('token');
    localStorage.removeItem('authUser');
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleBackToMenu = () => {
    const navigateBack = () => {
      if (returnState) {
        navigate(returnTo, { state: returnState });
        return;
      }

      navigate(returnTo);
    };

    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to go back?')) {
        navigateBack();
      }
    } else {
      navigateBack();
    }
  };

  return (
    <div className={`full-bleed-page settings-page min-vh-100 p-4 ${settings.darkMode ? 'bg-dark-gradient' : 'bg-light-gradient'}`}>
      <div className="container-fluid px-0 px-lg-4 settings-shell">
        {/* Back to Menu Button */}
        <button
          onClick={handleBackToMenu}
          className={`btn btn-link text-decoration-none mb-4 p-0 d-flex align-items-center gap-2 ${
            settings.darkMode ? 'text-light settings-back-button' : 'text-dark settings-back-button'
          }`}
        >
          <i className="bi bi-arrow-left"></i>
          <span>{backLabel}</span>
        </button>

        {/* Settings Title */}
        <h1 className={`display-3 fw-bold mb-4 settings-title ${settings.darkMode ? 'text-white' : 'text-dark'}`}>
          Settings
        </h1>

        {/* Themes Section */}
        <div className="mb-4">
          <h2 className={`h3 mb-3 ${settings.darkMode ? 'text-white' : 'text-dark'}`}>Themes</h2>
          <DarkTheme
            isActive={settings.darkMode}
            onToggle={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
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


import { useNavigate } from 'react-router';
import { ArrowLeft, Volume2, VolumeX, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export function Settings() {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [masterVolume, setMasterVolume] = useState(80);
  const [soundEffectVolume, setSoundEffectVolume] = useState(70);
  const [musicVolume, setMusicVolume] = useState(65);

  useEffect(() => {
    setMounted(true);
  }, []);

  const darkMode = mounted ? resolvedTheme === 'dark' : true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Menu
        </button>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>
          
          <div className="space-y-6">
            {/* Sound Settings */}
            <div className="bg-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {soundEnabled ? (
                    <Volume2 className="w-6 h-6 text-blue-400" />
                  ) : (
                    <VolumeX className="w-6 h-6 text-slate-500" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">Sound Settings</h3>
                    <p className="text-sm text-slate-400">Adjust volume levels for the game</p>
                  </div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    soundEnabled ? 'bg-blue-500' : 'bg-slate-600'
                  }`}
                  style={{ borderRadius: '30px' }}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      soundEnabled ? 'translate-x-6' : ''
                    }`}
                  ></div>
                </button>
              </div>

              <div className="mt-6 space-y-5">
                {[
                  { label: 'Master Volume', value: masterVolume, setter: setMasterVolume },
                  { label: 'Sound Effect Volume', value: soundEffectVolume, setter: setSoundEffectVolume },
                  { label: 'Music Volume', value: musicVolume, setter: setMusicVolume },
                ].map((control) => (
                  <div key={control.label} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{control.label}</span>
                      <span className="text-sm text-slate-400">{control.value}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={control.value}
                      onChange={(event) => control.setter(Number(event.target.value))}
                      className="w-full accent-blue-400"
                      disabled={!soundEnabled}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Theme Settings */}
            <div className="bg-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Monitor className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Dark Mode</h3>
                    <p className="text-sm text-slate-400">Toggle dark/light theme</p>
                  </div>
                </div>
                <button
                  onClick={() => setTheme(darkMode ? 'light' : 'dark')}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    darkMode ? 'bg-blue-500' : 'bg-slate-600'
                  }`}
                  style={{ borderRadius: '30px' }}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      darkMode ? 'translate-x-6' : ''
                    }`}
                  ></div>
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

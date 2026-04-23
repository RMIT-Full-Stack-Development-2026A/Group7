import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft, CalendarClock, Crown, Globe, ShieldCheck, UserRound } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import ROUTES from '../../../router/routes.config.js';
import { getStoredAuthIdentity } from '../../gameroom/utils/authIdentity.js';
import { COUNTRIES } from '../../register/elements/CountryDropdown.jsx';
import { validateCountry, validateEmail } from '../../register/modules/ValidationHandler.js';
import { getRawAvatarValue, resolveAvatarUrl } from '../../../shared/utils/avatar.utils.js';

function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleString();
}

export function Profile() {
  const { call, loading } = useApi();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [userId] = useState(() => getStoredAuthIdentity().userId || 'TheOneWhoAsked');
  const [profile, setProfile] = useState(null);
  const [formState, setFormState] = useState({
    name: '',
    username: '',
    email: '',
    country: '',
    avatarUrl: '',
  });
  const [saveMessage, setSaveMessage] = useState('');
  const [saveMessageTone, setSaveMessageTone] = useState('info');
  const [avatarPreview, setAvatarPreview] = useState('');
  const defaultProfileAvatar = resolveAvatarUrl('');

  const handleAvatarLoadError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultProfileAvatar;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const data = await call(`/api/profile?userId=${userId}`);
        if (data) {
          setProfile(data);
          setFormState({
            name: data.name || data.username || '',
            username: data.username || '',
            email: data.email || '',
            country: data.country || '',
            avatarUrl: data.avatarUrl || '',
          });
          setAvatarPreview(resolveAvatarUrl(data.avatarUrl));
        }
      } catch (err) {
        console.error('Failed to fetch profile from database:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [call, userId]);

  const statusItems = useMemo(() => {
    if (!profile) return [];

    return [
      { label: 'Role', value: profile.role || 'Player', icon: ShieldCheck },
      { label: 'Premium', value: profile.premiumStatus ? 'Active' : 'Inactive', icon: Crown },
      { label: 'Status', value: profile.isActive ? 'Active' : 'Disabled', icon: UserRound },
      { label: 'Country', value: profile.country || 'Unknown', icon: Globe },
    ];
  }, [profile]);

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    const trimmedEmail = formState.email.trim();
    const trimmedCountry = formState.country.trim();
    const emailError = validateEmail(trimmedEmail);
    const countryError = validateCountry(trimmedCountry);

    if (emailError) {
      setSaveMessageTone('error');
      setSaveMessage(`Please enter a valid email address. ${emailError}`);
      return;
    }

    if (countryError) {
      setSaveMessageTone('error');
      setSaveMessage(countryError);
      return;
    }

    try {
      const updatedProfile = {
        ...profile,
        ...formState,
        email: trimmedEmail,
        country: trimmedCountry,
        userId,
      };

      const result = await call('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(updatedProfile),
      });

      if (result?.success || result?.profile) {
        const nextProfile = result.profile;
        setProfile(nextProfile);
        setFormState({
          name: nextProfile.name || nextProfile.username || '',
          username: nextProfile.username || '',
          email: nextProfile.email || '',
          country: nextProfile.country || '',
          avatarUrl: nextProfile.avatarUrl || '',
        });
        setAvatarPreview(resolveAvatarUrl(nextProfile.avatarUrl) || avatarPreview);
        localStorage.setItem('authUser', JSON.stringify({
          ...(getStoredAuthIdentity() || {}),
          id: nextProfile.userId,
          name: nextProfile.name || nextProfile.username || '',
          username: nextProfile.username || '',
          avatar: getRawAvatarValue(nextProfile.avatarUrl || ''),
        }));
        setSaveMessageTone('success');
        setSaveMessage('Profile updated successfully.');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessageTone('error');
        setSaveMessage('Failed to update profile.');
      }
    } catch (err) {
      setSaveMessageTone('error');
      setSaveMessage('Failed to save profile. Please try again.');
      console.error('Error saving profile:', err);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const nextAvatar = typeof reader.result === 'string' ? reader.result : '';
      setAvatarPreview(nextAvatar || defaultProfileAvatar);
      setFormState((current) => ({ ...current, avatarUrl: getRawAvatarValue(nextAvatar) }));
      setSaveMessageTone('info');
      setSaveMessage('Avatar preview updated. Save to keep the change.');
    };
    reader.onerror = () => {
      setSaveMessageTone('error');
      setSaveMessage('Failed to read that image file. Please try another one.');
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="neon-page py-8">
      <div className="neon-shell mx-auto max-w-6xl px-4">
        <NavLink to={ROUTES.MAIN_MENU} className="neon-outline-button mb-6 px-4 py-2 text-sm font-semibold transition">
          <ArrowLeft size={16} />
          Back to Menu
        </NavLink>

        {isLoadingProfile && <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-cyan-100">Loading profile from database...</div>}

        {!isLoadingProfile && !profile && (
          <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-rose-100">
            Failed to load profile from database.
          </div>
        )}

        {!isLoadingProfile && profile && (
          <div className="neon-card neon-card-strong overflow-hidden rounded-[32px]">
            <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_1.4fr] lg:p-8">
              <section className="space-y-6">
                <div className="neon-secondary-panel p-6 text-center">
                  <div className="neon-avatar-frame neon-avatar-frame--large mx-auto mb-5">
                    <span className="neon-avatar-inner">
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="mx-auto block h-full w-full object-cover"
                        onError={handleAvatarLoadError}
                      />
                    </span>
                  </div>
                  <h2 className="profile-page-name text-2xl font-bold text-white">{profile.name || profile.username}</h2>
                  <p className="profile-page-email mt-1 text-slate-400">{profile.email}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <span className="neon-badge">Player Hub</span>
                    <span className="neon-badge">{profile.isActive ? 'Active' : 'Offline'}</span>
                    <span className="neon-badge">{profile.premiumStatus ? 'Premium On' : 'Premium Off'}</span>
                  </div>
                  <div className="neon-stat-grid mt-6">
                    {statusItems.map(({ label, value, icon: Icon }) => (
                      <div key={label} className="neon-stat-pill text-left">
                        <span className="neon-stat-icon profile-stat-icon">
                          <Icon size={16} />
                        </span>
                        <div>
                          <div className="neon-stat-label">{label}</div>
                          <p className="neon-stat-value text-sm">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="neon-secondary-panel p-6">
                  <div className="profile-timeline-heading mb-4 flex items-center gap-3 text-white">
                    <CalendarClock className="text-[var(--neon-accent)]" size={18} />
                    <h3 className="text-lg font-semibold">Account Timeline</h3>
                  </div>
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="neon-timeline-row">
                      <span>Created At</span>
                      <span className="font-medium text-white">{formatDate(profile.createdAt)}</span>
                    </div>
                    <div className="neon-timeline-row">
                      <span>Subscription Ends</span>
                      <span className="font-medium text-white">{formatDate(profile.subscriptionEndDate)}</span>
                    </div>
                    <div className="neon-timeline-row">
                      <span>User ID</span>
                      <span className="font-medium text-white">{profile.userId}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="neon-secondary-panel p-6">
                  <h3 className="mb-5 text-xl font-semibold text-white">Edit Profile</h3>
                  <form className="space-y-4" onSubmit={handleSaveProfile}>
                    <label className="block">
                      <span className="profile-field-label mb-2 block text-sm font-medium text-slate-200">Display Name</span>
                      <input
                        type="text"
                        className="neon-input px-4 py-3 outline-none transition"
                        value={formState.name}
                        onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                      />
                    </label>
                    <label className="block">
                      <span className="profile-field-label mb-2 block text-sm font-medium text-slate-200">Username</span>
                      <input
                        type="text"
                        className="neon-input px-4 py-3 outline-none transition opacity-70"
                        value={formState.username}
                        readOnly
                      />
                    </label>
                    <label className="block">
                      <span className="profile-field-label mb-2 block text-sm font-medium text-slate-200">Email</span>
                      <input
                        type="email"
                        className="neon-input px-4 py-3 outline-none transition"
                        value={formState.email}
                        onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
                      />
                    </label>
                    <label className="block">
                      <span className="profile-field-label mb-2 block text-sm font-medium text-slate-200">Country</span>
                      <select
                        className={`neon-input profile-country-select px-4 py-3 outline-none transition ${!formState.country ? 'profile-country-select-placeholder' : ''}`}
                        value={formState.country}
                        onChange={(event) => setFormState((current) => ({ ...current, country: event.target.value }))}
                      >
                        <option value="">-- Select your country --</option>
                        {COUNTRIES.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="submit"
                      className="neon-primary-button inline-flex items-center justify-center px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    {saveMessage ? (
                      <p className={`text-sm ${saveMessageTone === 'error' ? 'profile-form-message-error' : 'profile-form-message-success'}`}>
                        {saveMessage}
                      </p>
                    ) : null}
                  </form>
                </div>

                <div className="neon-secondary-panel p-6">
                  <h3 className="mb-4 text-xl font-semibold text-white">Upload Avatar</h3>
                  <label className="neon-upload-box block px-4 py-6 text-center text-slate-300 transition hover:text-white">
                    <span className="block text-sm font-medium">Choose a profile image</span>
                    <span className="neon-helper-text mt-1 block text-xs">Preview updates instantly, then save the profile.</span>
                    <input className="hidden" type="file" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

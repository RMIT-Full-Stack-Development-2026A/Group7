import { NavLink } from 'react-router-dom';
import { ArrowLeft, CalendarClock } from 'lucide-react';
import ROUTES from '../../../router/routes.config.js';
import { COUNTRIES } from '../../register/constants/countries.js';
import { resolveAvatarUrl } from '../../../shared/utils/avatar.utils.js';
import GameSessionHistory from '../components/GameSessionHistory.jsx';
import PasswordSection from '../components/Profile/PasswordSection.jsx';
import { useProfile } from '../hooks/useProfile.js';
import { formatDate } from '../logic/profile.utils.js';

const defaultProfileAvatar = resolveAvatarUrl('');

const handleAvatarLoadError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = defaultProfileAvatar;
};

export function Profile() {
  const {
    loading, isLoadingProfile, profile, formState, setFormState,
    avatarPreview, saveMessage, saveMessageTone,
    passwordForm, setPasswordForm, passwordErrors, passwordMessage, passwordMessageTone,
    isChangingPassword, passwordVisibility, togglePasswordVisibility,
    statusItems, handleSaveProfile, handleChangePassword, handleAvatarChange,
  } = useProfile();

  return (
    <div className="neon-page py-8">
      <div className="neon-shell mx-auto max-w-6xl px-4">
        <NavLink to={ROUTES.MAIN_MENU} className="neon-outline-button mb-6 px-4 py-2 text-sm font-semibold transition">
          <ArrowLeft size={16} />
          Back to Menu
        </NavLink>

        {isLoadingProfile && (
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-cyan-100">
            Loading profile from database...
          </div>
        )}

        {!isLoadingProfile && !profile && (
          <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-rose-100">
            Failed to load profile from database.
          </div>
        )}

        {!isLoadingProfile && profile && (
          <div className="space-y-6">
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
                          <span
                            className="neon-stat-icon profile-stat-icon"
                            data-icon-name={Icon.displayName || Icon.name}
                          >
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
                          className="neon-input px-4 py-3 outline-none transition"
                          value={formState.username}
                          onChange={(event) => setFormState((current) => ({ ...current, username: event.target.value }))}
                          autoComplete="username"
                          minLength={3}
                          maxLength={30}
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
                            <option key={country} value={country}>{country}</option>
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

                  <PasswordSection
                    passwordForm={passwordForm}
                    setPasswordForm={setPasswordForm}
                    passwordErrors={passwordErrors}
                    passwordMessage={passwordMessage}
                    passwordMessageTone={passwordMessageTone}
                    passwordVisibility={passwordVisibility}
                    togglePasswordVisibility={togglePasswordVisibility}
                    isChangingPassword={isChangingPassword}
                    onSubmit={handleChangePassword}
                  />

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

            <GameSessionHistory
              title="Profile Game Sessions"
              description="Search by session number or Player 2, filter by date, result, and game type, then sort by date."
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;

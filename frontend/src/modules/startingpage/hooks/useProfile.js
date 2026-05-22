import { useEffect, useMemo, useState } from 'react';
import { useApi } from './useApi';
import { getApiBaseUrl } from '../../../config/api/baseUrl.js';
import { Crown, Globe, ShieldCheck, UserRound } from 'lucide-react';
import { getStoredAuthIdentity, resolveAuthIdentity } from '../../gameroom/utils/authIdentity.js';
import { validateCountry, validateEmail, validateUsername } from '../../register/modules/ValidationHandler.js';
import { getRawAvatarValue, resolveAvatarUrl } from '../../../shared/utils/avatar.utils.js';
import {
  buildProfileFromStoredIdentity,
  resizeAvatarFile,
} from '../logic/profile.utils.js';

const validatePasswordClient = ({ oldPassword, newPassword, confirmNewPassword }) => {
  const errors = {};
  if (!oldPassword) errors.oldPassword = 'Current password is required.';

  if (!newPassword) errors.newPassword = 'New password is required.';
  else if (newPassword.length < 8) errors.newPassword = 'At least 8 characters.';
  else if (!/[0-9]/.test(newPassword)) errors.newPassword = 'At least 1 number.';
  else if (!/[!@#$%^&*()\-_=+[\]{}|;:,.<>?]/.test(newPassword)) errors.newPassword = 'At least 1 special character.';
  else if (!/[A-Z]/.test(newPassword)) errors.newPassword = 'At least 1 uppercase letter.';

  if (!confirmNewPassword) errors.confirmNewPassword = 'Please confirm your new password.';
  else if (newPassword && newPassword !== confirmNewPassword) {
    errors.confirmNewPassword = 'New password and confirmation do not match.';
  }
  if (!errors.newPassword && oldPassword && newPassword && oldPassword === newPassword) {
    errors.newPassword = 'New password must be different from the current password.';
  }
  return errors;
};

export function useProfile() {
  const { call, loading } = useApi();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [userId, setUserId] = useState(() => getStoredAuthIdentity().userId || 'TheOneWhoAsked');
  const [profile, setProfile] = useState(null);
  const [formState, setFormState] = useState({
    name: '', username: '', email: '', country: '', avatarUrl: '',
  });
  const [saveMessage, setSaveMessage] = useState('');
  const [saveMessageTone, setSaveMessageTone] = useState('info');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '', newPassword: '', confirmNewPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageTone, setPasswordMessageTone] = useState('info');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    oldPassword: false, newPassword: false, confirmNewPassword: false,
  });

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((current) => ({ ...current, [field]: !current[field] }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const identity = await resolveAuthIdentity();
        const resolvedUserId = identity.userId || identity.username || identity.email || userId;
        setUserId(resolvedUserId);
        const data = await call(`/profile?userId=${encodeURIComponent(resolvedUserId)}`);
        const next = data || buildProfileFromStoredIdentity();
        if (next) {
          setProfile(next);
          setFormState({
            name: next.name || next.username || '',
            username: next.username || '',
            email: next.email || '',
            country: next.country || '',
            avatarUrl: next.avatarUrl || '',
          });
          setAvatarPreview(resolveAvatarUrl(next.avatarUrl));
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
    const trimmedUsername = formState.username.trim();
    const usernameError = validateUsername(trimmedUsername);
    const emailError = validateEmail(trimmedEmail);
    const countryError = validateCountry(trimmedCountry);

    if (usernameError) {
      setSaveMessageTone('error');
      setSaveMessage(usernameError);
      return;
    }
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
      const updated = {
        ...profile, ...formState,
        email: trimmedEmail, country: trimmedCountry,
        username: trimmedUsername,
        userId: profile.userId || userId,
      };
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updated),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !(result?.success || result?.profile)) {
        setSaveMessageTone('error');
        setSaveMessage(result?.error || result?.message || 'Failed to update profile.');
        return;
      }

      const next = result.profile;
      setProfile(next);
      setFormState({
        name: next.name || next.username || '',
        username: next.username || '',
        email: next.email || '',
        country: next.country || '',
        avatarUrl: next.avatarUrl || '',
      });
      setAvatarPreview(resolveAvatarUrl(next.avatarUrl) || avatarPreview);

      const nextAuthUser = {
        ...(getStoredAuthIdentity() || {}),
        id: next.userId,
        name: next.name || next.username || '',
        username: next.username || '',
        email: next.email || '',
        avatar: getRawAvatarValue(next.avatarUrl || ''),
        role: next.role,
        isPremium: Boolean(next.premiumStatus),
        premiumStatus: Boolean(next.premiumStatus),
      };
      localStorage.setItem('authUser', JSON.stringify(nextAuthUser));
      window.dispatchEvent(new CustomEvent('profile-updated', {
        detail: { authUser: nextAuthUser, profile: next },
      }));
      setSaveMessageTone('success');
      setSaveMessage('Profile updated successfully.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessageTone('error');
      setSaveMessage('Failed to save profile. Please try again.');
      console.error('Error saving profile:', err);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordErrors({});

    const clientErrors = validatePasswordClient(passwordForm);
    if (Object.keys(clientErrors).length > 0) {
      setPasswordErrors(clientErrors);
      setPasswordMessageTone('error');
      setPasswordMessage('Please fix the highlighted fields and try again.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(passwordForm),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data?.errors && typeof data.errors === 'object') setPasswordErrors(data.errors);
        setPasswordMessageTone('error');
        setPasswordMessage(data?.message || 'Failed to update password. Please try again.');
        return;
      }

      setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
      setPasswordMessageTone('success');
      setPasswordMessage('Password updated successfully.');
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (err) {
      setPasswordMessageTone('error');
      setPasswordMessage(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const next = await resizeAvatarFile(file);
      setAvatarPreview(next || resolveAvatarUrl(''));
      setFormState((current) => ({ ...current, avatarUrl: getRawAvatarValue(next) }));
      setSaveMessageTone('info');
      setSaveMessage('Avatar preview updated. Save to keep the change.');
    } catch (error) {
      setSaveMessageTone('error');
      setSaveMessage(error.message || 'Failed to read that image file. Please try another one.');
    }
  };

  return {
    loading, isLoadingProfile, profile, formState, setFormState,
    avatarPreview, saveMessage, saveMessageTone,
    passwordForm, setPasswordForm, passwordErrors, passwordMessage, passwordMessageTone,
    isChangingPassword, passwordVisibility, togglePasswordVisibility,
    statusItems,
    handleSaveProfile, handleChangePassword, handleAvatarChange,
  };
}

export default useProfile;

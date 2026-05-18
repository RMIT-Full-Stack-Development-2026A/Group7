import { Eye, EyeOff } from 'lucide-react';

const PasswordField = ({
  id, label, autoComplete, value, visible, error, onChange, onToggleVisibility, helper,
}) => (
  <div className="flex w-full flex-col">
    <label htmlFor={id} className="profile-field-label mb-2 block text-sm font-medium text-slate-200">
      {label}
    </label>
    <div className="relative w-full">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        className="neon-input w-full px-4 py-3 pr-12 outline-none transition"
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    {error ? (
      <p className="profile-form-message-error mt-1 text-xs">{error}</p>
    ) : helper ? (
      <p className="neon-helper-text mt-1 text-xs">{helper}</p>
    ) : (
      <p className="mt-1 min-h-[1rem] text-xs opacity-0">placeholder</p>
    )}
  </div>
);

export function PasswordSection({
  passwordForm, setPasswordForm, passwordErrors, passwordMessage, passwordMessageTone,
  passwordVisibility, togglePasswordVisibility, isChangingPassword, onSubmit,
}) {
  return (
    <div className="neon-secondary-panel p-6">
      <h3 className="mb-5 text-xl font-semibold text-white">Change Password</h3>
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <PasswordField
          id="profile-old-password"
          label="Current Password"
          autoComplete="current-password"
          value={passwordForm.oldPassword}
          visible={passwordVisibility.oldPassword}
          error={passwordErrors.oldPassword}
          onChange={(event) => setPasswordForm((current) => ({ ...current, oldPassword: event.target.value }))}
          onToggleVisibility={() => togglePasswordVisibility('oldPassword')}
        />
        <PasswordField
          id="profile-new-password"
          label="New Password"
          autoComplete="new-password"
          value={passwordForm.newPassword}
          visible={passwordVisibility.newPassword}
          error={passwordErrors.newPassword}
          helper={passwordErrors.newPassword ? null : 'Min 8 characters, 1 uppercase, 1 number, 1 special character.'}
          onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
          onToggleVisibility={() => togglePasswordVisibility('newPassword')}
        />
        <PasswordField
          id="profile-confirm-password"
          label="Confirm New Password"
          autoComplete="new-password"
          value={passwordForm.confirmNewPassword}
          visible={passwordVisibility.confirmNewPassword}
          error={passwordErrors.confirmNewPassword}
          onChange={(event) => setPasswordForm((current) => ({ ...current, confirmNewPassword: event.target.value }))}
          onToggleVisibility={() => togglePasswordVisibility('confirmNewPassword')}
        />

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            className="neon-primary-button inline-flex items-center justify-center self-start px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? 'Updating...' : 'Update Password'}
          </button>
          {passwordMessage ? (
            <p className={`text-sm ${passwordMessageTone === 'error' ? 'profile-form-message-error' : 'profile-form-message-success'}`}>
              {passwordMessage}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}

export default PasswordSection;

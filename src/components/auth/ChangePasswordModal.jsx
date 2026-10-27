import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ChangePasswordModal({ mandatory = false, onClose, onLogout }) {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      onClose();
    } catch (changeError) {
      setError(changeError.message || 'Unable to change password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4" role="presentation">
      <section
        aria-labelledby="change-password-title"
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-[#E2E8F0] bg-white p-6"
        role="dialog"
      >
        <h2 id="change-password-title" className="text-lg font-semibold text-[#0F172A]">
          {mandatory ? 'Set a new password' : 'Change password'}
        </h2>
        <p className="mt-2 text-sm text-[#64748B]">
          {mandatory
            ? 'For account security, replace the register-number password before continuing.'
            : 'Enter your current password and choose a new password with at least 8 characters.'}
        </p>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-[#0F172A]">
            Current password
            <input
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm"
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              type="password"
              value={currentPassword}
            />
          </label>
          <label className="block text-sm font-medium text-[#0F172A]">
            New password
            <input
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm"
              minLength={8}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </label>
          <label className="block text-sm font-medium text-[#0F172A]">
            Confirm new password
            <input
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm"
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>
          {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            {mandatory && onLogout && (
              <button
                className="mr-auto rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-sm font-medium text-[#1E3A5F]"
                onClick={onLogout}
                type="button"
              >
                Sign out
              </button>
            )}
            {!mandatory && (
              <button
                className="rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-sm font-medium text-[#1E3A5F]"
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
            )}
            <button
              className="rounded-lg bg-[#1E3A5F] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              disabled={saving}
              type="submit"
            >
              {saving ? 'Saving...' : 'Save password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

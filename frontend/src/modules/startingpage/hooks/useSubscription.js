import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApi } from './useApi';
import { profileService } from '../services/apiServices';
import { resolveAuthIdentity } from '../../gameroom/utils/authIdentity.js';

export const MONTHLY_PRICE = 10;

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('authUser') || '{}');
  } catch {
    return {};
  }
};

const buildCurrentUrl = (paypalState) => {
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('paypal', paypalState);
  return url.toString();
};

const resolveCheckoutUser = async () => {
  const resolvedUser = await resolveAuthIdentity();
  const storedUser = getStoredUser();
  return {
    ...storedUser,
    ...resolvedUser,
    id: resolvedUser.userId || storedUser.userId || storedUser.id,
  };
};

const buildEmailStatusMessage = (emailReceipt) => {
  if (emailReceipt?.ok) return 'Receipt email sent.';
  if (emailReceipt?.reason === 'smtp-not-configured') {
    return 'Premium is active, but SMTP is not configured yet so the receipt email was not sent.';
  }
  if (emailReceipt?.message) {
    return `Premium is active, but receipt email was not sent: ${emailReceipt.message}`;
  }
  return 'Premium is active, but receipt email was not sent.';
};

export function useSubscription() {
  const api = useApi();
  const profileApi = useMemo(() => profileService(api), [api]);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [receipt, setReceipt] = useState(null);
  const captureStartedRef = useRef(false);

  const persistProfileUpdate = useCallback((profile) => {
    if (!profile) return;
    const storedUser = getStoredUser();
    const nextUser = {
      ...storedUser,
      id: profile.userId || storedUser.id,
      userId: profile.userId || storedUser.userId,
      name: profile.name || storedUser.name,
      username: profile.username || storedUser.username,
      email: profile.email || storedUser.email,
      avatar: profile.avatarUrl || storedUser.avatar,
      role: profile.role || storedUser.role,
      isPremium: Boolean(profile.premiumStatus),
      premiumStatus: Boolean(profile.premiumStatus),
      subscriptionEndDate: profile.subscriptionEndDate || null,
    };
    localStorage.setItem('authUser', JSON.stringify(nextUser));
    window.dispatchEvent(new CustomEvent('profile-updated', { detail: { profile } }));
  }, []);

  const handleCaptureResult = useCallback((result) => {
    if (!result?.success) {
      setStatus({
        type: 'error',
        message: api.error || 'PayPal payment could not be captured. Please try again.',
      });
      return;
    }

    const profile = result.profile || {
      ...(result.user || {}),
      userId: result.user?._id || result.user?.id,
      premiumStatus: result.premiumStatus,
      subscriptionEndDate: result.subscriptionEndDate,
      avatarUrl: result.user?.avatar,
    };
    const endDate = result.subscriptionEndDate ? new Date(result.subscriptionEndDate) : new Date();
    const payerEmail = result.payment?.payerEmail || profile.email || '';

    persistProfileUpdate(profile);
    setReceipt({
      provider: 'PayPal',
      amount: result.payment?.amount || MONTHLY_PRICE,
      currency: result.payment?.currency || 'USD',
      endDate,
      email: payerEmail || profile.email,
      paypalEmail: payerEmail || 'PayPal wallet',
      captureId: result.payment?.captureId,
      orderId: result.payment?.orderId,
      emailReceipt: result.emailReceipt,
    });

    setStatus({
      type: result.emailReceipt?.ok ? 'success' : 'ready',
      message: `PayPal payment captured. Premium status is now active on your profile. ${buildEmailStatusMessage(result.emailReceipt)}`,
    });
  }, [api.error, persistProfileUpdate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paypalState = params.get('paypal');
    const orderId = params.get('token');

    if (paypalState === 'cancel') {
      queueMicrotask(() => {
        setStatus({ type: 'ready', message: 'PayPal checkout was cancelled. No payment was captured.' });
      });
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (paypalState !== 'success' || !orderId || captureStartedRef.current) return;

    captureStartedRef.current = true;
    queueMicrotask(() => {
      setStatus({ type: 'processing', message: 'Capturing approved PayPal payment...' });
    });

    const captureOrder = async () => {
      try {
        const checkoutUser = await resolveCheckoutUser();
        const result = await profileApi.capturePayPalSubscriptionOrder({
          orderId,
          userId: checkoutUser.userId || checkoutUser.id,
          username: checkoutUser.username,
          email: checkoutUser.email,
        });
        handleCaptureResult(result);
      } catch (error) {
        setStatus({
          type: 'error',
          message: error.message || 'PayPal payment could not be captured. Please try again.',
        });
      } finally {
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    captureOrder();
  }, [handleCaptureResult, profileApi]);

  const handlePayWithPayPal = async () => {
    try {
      setStatus({ type: 'processing', message: 'Creating PayPal checkout...' });
      const checkoutUser = await resolveCheckoutUser();
      const result = await profileApi.createPayPalSubscriptionOrder({
        userId: checkoutUser.userId || checkoutUser.id,
        username: checkoutUser.username,
        email: checkoutUser.email,
        returnUrl: buildCurrentUrl('success'),
        cancelUrl: buildCurrentUrl('cancel'),
      });

      if (!result?.success || !result.approveUrl) {
        setStatus({
          type: 'error',
          message: api.error || 'Could not start PayPal checkout. Check backend PayPal configuration.',
        });
        return;
      }

      setStatus({ type: 'processing', message: 'Redirecting to PayPal wallet...' });
      window.location.assign(result.approveUrl);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Could not start PayPal checkout. Check backend PayPal configuration.',
      });
    }
  };

  return {
    apiLoading: api.loading,
    status,
    receipt,
    handlePayWithPayPal,
  };
}

export default useSubscription;

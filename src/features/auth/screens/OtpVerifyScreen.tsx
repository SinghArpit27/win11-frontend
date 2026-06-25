import { KeyRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Button, Input, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { useAppDispatch, useAppSelector } from '@hooks/index';
import { OtpChannel, OtpPurpose, UserStatus } from '@shared/enums';

import { useRequestOtpMutation, useVerifyOtpMutation } from '../auth.api';
import { authSucceeded, selectAuthUser, userUpdated } from '../auth.slice';
import { authStorage } from '../auth.storage';
import { AuthErrorBanner } from '../components/AuthErrorBanner';
import { AuthLayout } from '../components/AuthLayout';

/**
 * Generic OTP verification screen.
 *
 * Caller decides intent via location state (purpose + identifier).
 * After signup the session is held in sessionStorage until this screen
 * verifies the code, then `authSucceeded` runs and the user enters the app.
 */
export const OtpVerifyScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAppSelector(selectAuthUser);
  const state = (location.state ?? {}) as {
    identifier?: string;
    purpose?: OtpPurpose;
    channel?: OtpChannel;
    next?: string;
  };

  const [verifyOtp, verifyState] = useVerifyOtpMutation();
  const [requestOtp, requestState] = useRequestOtpMutation();

  const [identifier, setIdentifier] = useState(state.identifier ?? '');
  const [code, setCode] = useState('');
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [resendInfo, setResendInfo] = useState<string | null>(null);

  const purpose = state.purpose ?? OtpPurpose.EMAIL_VERIFY;
  const channel =
    state.channel ?? (identifier.includes('@') ? OtpChannel.EMAIL : OtpChannel.SMS);

  useEffect(() => {
    if (identifier) return;
    const pending = authStorage.getPendingSignup();
    const fromPending = pending?.user.email ?? pending?.user.phone ?? '';
    if (fromPending) setIdentifier(fromPending);
  }, [identifier]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await verifyOtp({ identifier, channel, purpose, code }).unwrap();

      const pending = authStorage.consumePendingSignup();
      if (pending) {
        dispatch(
          authSucceeded({
            ...pending,
            user: {
              ...pending.user,
              status: UserStatus.ACTIVE,
              emailVerified:
                purpose === OtpPurpose.EMAIL_VERIFY ? true : pending.user.emailVerified,
              phoneVerified:
                purpose === OtpPurpose.PHONE_VERIFY ? true : pending.user.phoneVerified,
            },
          }),
        );
      } else if (currentUser) {
        dispatch(
          userUpdated({
            ...currentUser,
            status: UserStatus.ACTIVE,
            emailVerified:
              purpose === OtpPurpose.EMAIL_VERIFY ? true : currentUser.emailVerified,
            phoneVerified:
              purpose === OtpPurpose.PHONE_VERIFY ? true : currentUser.phoneVerified,
          }),
        );
      }

      navigate(state.next ?? ROUTES.HOME, { replace: true });
    } catch (err) {
      setSubmitError(err);
    }
  };

  const handleResend = async (): Promise<void> => {
    setResendInfo(null);
    try {
      await requestOtp({ identifier, channel, purpose }).unwrap();
      setResendInfo('We sent a new code.');
    } catch (err) {
      setSubmitError(err);
    }
  };

  return (
    <AuthLayout
      title="Verify it's you"
      subtitle={`Enter the 6-digit code we sent to ${identifier || 'your email or phone'}.`}
      footer={
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <AuthErrorBanner error={submitError} />

      {!identifier ? (
        <Typography variant="body" tone="muted" className="mb-4">
          Missing contact details. Go back to{' '}
          <Link to={ROUTES.SIGNUP} className="text-primary hover:underline">
            sign up
          </Link>{' '}
          and try again.
        </Typography>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="identifier">
            Email or phone
          </label>
          <Input
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="otp-code">
            6-digit code
          </label>
          <Input
            id="otp-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            leftAdornment={<KeyRound className="h-4 w-4" />}
          />
        </div>

        {resendInfo ? (
          <Typography variant="caption" tone="success">
            {resendInfo}
          </Typography>
        ) : null}

        <Button
          type="submit"
          fullWidth
          loading={verifyState.isLoading}
          disabled={!identifier || code.length !== 6}
        >
          Verify
        </Button>
        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={handleResend}
          loading={requestState.isLoading}
          disabled={!identifier}
        >
          Resend code
        </Button>
      </form>
    </AuthLayout>
  );
};

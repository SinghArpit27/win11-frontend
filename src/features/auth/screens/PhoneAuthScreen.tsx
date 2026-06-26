import { ArrowLeft, Check, CircleHelp, KeyRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Typography } from '@components/ui';
import { APP_NAME } from '@constants/app.constants';
import { ROUTES } from '@constants/routes.constants';
import { useAppDispatch } from '@hooks/index';
import { ADMIN_ROLES } from '@shared/enums';
import { cn } from '@utils/cn';
import { extractErrorMessage } from '@utils/errors';

import { usePhoneSendOtpMutation, usePhoneVerifyOtpMutation } from '../auth.api';
import { authSucceeded } from '../auth.slice';
import type { AuthUser } from '../auth.types';
import { isValidIndianMobile, normalizeIndianPhoneInput, toE164India } from '../auth.utils';

type Step = 'phone' | 'otp';

const HEADER: Record<Step, { title: string; subtitle: string }> = {
  phone: { title: 'Login/Register', subtitle: "Let's get you started" },
  otp: { title: 'Verify OTP', subtitle: 'Enter the code sent to your mobile' },
};

/**
 * Phone OTP sign-in — Dream11-style login/register sheet.
 */
export const PhoneAuthScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<Step>('phone');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [otp, setOtp] = useState('');
  const [submitError, setSubmitError] = useState<unknown>(null);

  const [sendOtp, sendState] = usePhoneSendOtpMutation();
  const [verifyOtp, verifyState] = usePhoneVerifyOtpMutation();

  const phoneE164 = useMemo(
    () => (isValidIndianMobile(phoneDigits) ? toE164India(phoneDigits) : ''),
    [phoneDigits],
  );

  const canContinuePhone = isValidIndianMobile(phoneDigits) && ageConfirmed;
  const canContinueOtp = otp.length === 6;

  const handleBack = (): void => {
    if (step === 'phone') navigate(ROUTES.SPLASH);
    else setStep('phone');
  };

  const handleSendOtp = async (): Promise<void> => {
    setSubmitError(null);
    if (!phoneE164 || !canContinuePhone) return;
    try {
      await sendOtp({ phone: phoneE164 }).unwrap();
      setOtp('');
      setStep('otp');
    } catch (err) {
      setSubmitError(err);
    }
  };

  const handleVerify = async (): Promise<void> => {
    setSubmitError(null);
    if (!phoneE164 || otp.length !== 6) return;

    try {
      const payload = await verifyOtp({ phone: phoneE164, code: otp }).unwrap();
      dispatch(authSucceeded(payload));
      const fromState = (location.state as { from?: string } | null)?.from;
      navigate(resolvePostLoginRoute(fromState, payload.user), { replace: true });
    } catch (err) {
      setSubmitError(err);
    }
  };

  const header = HEADER[step];
  const isLoading = sendState.isLoading || verifyState.isLoading;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-[#6d0f0f] via-[#9a1515] to-[#b71c1c] text-white">
      <header className="relative px-4 pb-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Go back"
            onClick={handleBack}
            className="rounded-full p-2 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Help"
            className="rounded-full p-2 text-white hover:bg-white/10"
          >
            <CircleHelp className="h-6 w-6" />
          </button>
        </div>
        <div className="mt-4 px-1">
          <Typography variant="h2" className="text-2xl font-bold text-white">
            {header.title}
          </Typography>
          <Typography variant="body" className="mt-1 text-sm text-white/85">
            {step === 'otp' ? (
              <>
                {header.subtitle}{' '}
                <span className="font-semibold text-white">+91 {phoneDigits}</span>
              </>
            ) : (
              header.subtitle
            )}
          </Typography>
        </div>
      </header>

      <main className="flex flex-1 flex-col rounded-t-[28px] bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 text-[#1a1a1a] shadow-[0_-8px_32px_rgba(0,0,0,0.18)] [color-scheme:light]">
        {submitError ? (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-[#e02020]/30 bg-[#fff5f5] px-3 py-2 text-sm text-[#c62828]"
          >
            <span>{extractErrorMessage(submitError)}</span>
          </div>
        ) : null}

        {step === 'phone' ? (
          <PhoneStep
            phoneDigits={phoneDigits}
            ageConfirmed={ageConfirmed}
            canContinue={canContinuePhone}
            loading={isLoading}
            onPhoneChange={setPhoneDigits}
            onAgeChange={setAgeConfirmed}
            onContinue={handleSendOtp}
          />
        ) : null}

        {step === 'otp' ? (
          <OtpStep
            otp={otp}
            canContinue={canContinueOtp}
            loading={isLoading}
            onOtpChange={setOtp}
            onContinue={handleVerify}
            onResend={handleSendOtp}
          />
        ) : null}
      </main>
    </div>
  );
};

const ContinueButton = ({
  disabled,
  loading,
  onClick,
  label = 'CONTINUE',
}: {
  disabled: boolean;
  loading?: boolean;
  onClick: () => void;
  label?: string;
}): JSX.Element => (
  <button
    type="button"
    disabled={disabled || loading}
    onClick={onClick}
    className={cn(
      'flex h-12 w-full items-center justify-center rounded-md text-sm font-bold uppercase tracking-[0.12em] transition-colors',
      disabled || loading
        ? 'cursor-not-allowed bg-[#ececec] text-[#9e9e9e]'
        : 'bg-[#e02020] text-white hover:bg-[#c91b1b] active:scale-[0.99]',
    )}
  >
    {loading ? 'Please wait…' : label}
  </button>
);

const PhoneStep = ({
  phoneDigits,
  ageConfirmed,
  canContinue,
  loading,
  onPhoneChange,
  onAgeChange,
  onContinue,
}: {
  phoneDigits: string;
  ageConfirmed: boolean;
  canContinue: boolean;
  loading: boolean;
  onPhoneChange: (value: string) => void;
  onAgeChange: (value: boolean) => void;
  onContinue: () => void;
}): JSX.Element => (
  <div className="flex flex-1 flex-col">
    <label htmlFor="phone" className="sr-only">
      Mobile number
    </label>
    <input
      id="phone"
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      placeholder="Mobile number"
      value={phoneDigits}
      onChange={(e) => onPhoneChange(normalizeIndianPhoneInput(e.target.value))}
      className="w-full border-0 border-b border-[#d9d9d9] bg-transparent py-3 text-base text-[#1a1a1a] outline-none placeholder:text-[#bdbdbd] focus:border-[#e02020]"
    />

    <label className="mt-8 flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={ageConfirmed}
          onChange={(e) => onAgeChange(e.target.checked)}
          className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-[3px] border-2 border-[#bdbdbd] bg-white checked:border-[#e02020] checked:bg-[#e02020] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e02020]/30"
        />
        <Check
          aria-hidden
          className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
          strokeWidth={3}
        />
      </span>
      <span className="text-sm leading-snug text-[#666]">I certify that I am above 18 years</span>
    </label>

    <div className="mt-auto pt-10">
      <ContinueButton disabled={!canContinue} loading={loading} onClick={onContinue} />
      <Typography variant="caption" className="mt-4 block text-center text-xs leading-relaxed text-[#888]">
        By continuing, I agree to {APP_NAME}&apos;s{' '}
        <span className="font-semibold text-[#555]">T&amp;C</span>.
      </Typography>
    </div>
  </div>
);

const OtpStep = ({
  otp,
  canContinue,
  loading,
  onOtpChange,
  onContinue,
  onResend,
}: {
  otp: string;
  canContinue: boolean;
  loading: boolean;
  onOtpChange: (value: string) => void;
  onContinue: () => void;
  onResend: () => void;
}): JSX.Element => (
  <div className="flex flex-1 flex-col">
    <Typography variant="body" className="mb-4 text-sm text-[#666]">
      We sent a 6-digit code to your mobile. It may take up to a minute to arrive.
    </Typography>

    <label htmlFor="otp" className="sr-only">
      One-time password
    </label>
    <div className="relative">
      <KeyRound className="pointer-events-none absolute left-0 top-3.5 h-4 w-4 text-[#bdbdbd]" />
      <input
        id="otp"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="Enter 6-digit OTP"
        maxLength={6}
        value={otp}
        onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        className="w-full border-0 border-b border-[#d9d9d9] bg-transparent py-3 pl-7 text-base text-[#1a1a1a] outline-none placeholder:text-[#bdbdbd] focus:border-[#e02020]"
      />
    </div>

    <button
      type="button"
      onClick={onResend}
      disabled={loading}
      className="mt-4 self-start text-sm font-semibold text-[#e02020] disabled:opacity-50"
    >
      Resend OTP
    </button>

    <div className="mt-auto pt-10">
      <ContinueButton disabled={!canContinue} loading={loading} onClick={onContinue} label="VERIFY" />
    </div>
  </div>
);

export default PhoneAuthScreen;

const resolvePostLoginRoute = (from: string | undefined, user: AuthUser): string => {
  if (!from) {
    const isAdmin = (user.roles ?? []).some((r) => ADMIN_ROLES.includes(r));
    return isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.HOME;
  }
  if (from.startsWith('/admin')) {
    const isAdmin = (user.roles ?? []).some((r) => ADMIN_ROLES.includes(r));
    return isAdmin ? from : ROUTES.FORBIDDEN;
  }
  return from;
};

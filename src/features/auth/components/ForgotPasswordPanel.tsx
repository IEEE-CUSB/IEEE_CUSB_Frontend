import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft, FiCheckCircle, FiMail, FiLock } from 'react-icons/fi';
import { useTheme } from '@/shared/hooks/useTheme';
import { useSendPasswordOTP, useResetPassword, useCheckPasswordOTP } from '@/shared/queries/auth';
import { OtpInput } from './OtpInput';
import { InputField, PasswordField, Button } from '@ieee-ui/ui';

// ── Schemas ──────────────────────────────────────────────────────────────────

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address').trim(),
});

const resetSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
      'Must contain uppercase, lowercase, number and special character (@$!%*?&#)',
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

type Step = 'email' | 'otp' | 'password' | 'success';

const RESEND_SECONDS = 60;

interface ForgotPasswordPanelProps {
  onClose: () => void;
}

/**
 * Inline multi-step forgot-password panel.
 * Step 1: Enter email → send OTP
 * Step 2: Enter OTP
 * Step 3: New password → reset
 * Step 4: Success
 */
export const ForgotPasswordPanel = ({ onClose }: ForgotPasswordPanelProps) => {
  const { isDark } = useTheme();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { mutate: sendOTP, isPending: isSending } = useSendPasswordOTP();
  const { mutate: checkOTP, isPending: isCheckingOTP } = useCheckPasswordOTP();
  const { mutate: resetPassword, isPending: isResetting } = useResetPassword();

  const emailForm = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetFormData>({ resolver: zodResolver(resetSchema) });

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSendOTP = (data: EmailFormData) => {
    sendOTP(
      { email: data.email },
      {
        onSuccess: () => {
          setEmail(data.email);
          setCountdown(RESEND_SECONDS);
          setStep('otp');
        },
      },
    );
  };

  const handleResend = useCallback(() => {
    if (countdown > 0) return;
    setOtp('');
    setOtpError('');
    setCountdown(RESEND_SECONDS);
    sendOTP({ email });
  }, [countdown, email, sendOTP]);

  const handleReset = (data: ResetFormData) => {
    if (otp.length !== 6) { setOtpError('Please enter the 6-digit code.'); return; }
    setOtpError('');
    resetPassword(
      {
        email,
        otp,
        password: data.password,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: () => setStep('success'),
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Invalid or expired OTP.';
          setOtpError(msg);
          setStep('otp'); // Go back to OTP screen so user sees error and fixes it
        },
      },
    );
  };

  const label = (text: string) => (
    <p className={`text-sm font-medium mb-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{text}</p>
  );

  const btnPrimary = (text: string, loading?: boolean, disabled?: boolean) => (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`
        w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
        ${!disabled && !loading
          ? 'bg-primary text-white hover:bg-primary/90 shadow-sm active:scale-[0.98]'
          : isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
      `}
    >
      {loading ? 'Please wait…' : text}
    </button>
  );

  const divider = <div className={`h-px my-6 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />;

  // ── Step 1: Email ──────────────────────────────────────────────────────────
  if (step === 'email') return (
    <form onSubmit={emailForm.handleSubmit(handleSendOTP)} className="space-y-4">
      {divider}
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded-lg ${isDark ? 'bg-secondary/10' : 'bg-red-50'}`}>
          <FiMail className="w-4 h-4 text-secondary" />
        </div>
        <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Forgot password?
        </h3>
      </div>
      <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Enter your registered email and we'll send you a code to reset your password.
      </p>
      <div>
        <InputField
          id="fp-email"
          type="email"
          label="Email address"
          placeholder="your@email.com"
          {...emailForm.register('email')}
          error={emailForm.formState.errors.email?.message}
          darkMode={isDark}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-colors ${isDark ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          Cancel
        </button>
        <div className="flex-1">
          {btnPrimary('Send code', isSending)}
        </div>
      </div>
    </form>
  );

  // ── Step 2: OTP ────────────────────────────────────────────────────────────
  if (step === 'otp') return (
    <div className="space-y-5">
      {divider}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setStep('email')}
          className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Enter your code
        </h3>
      </div>

      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        We sent a 6-digit code to{' '}
        <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{email}</span>.
      </p>

      {/* OTP boxes */}
      <div>
        <OtpInput value={otp} onChange={val => { setOtp(val); setOtpError(''); }} disabled={isCheckingOTP || isResetting} isDark={isDark} />
        {otpError && (
          <p className="mt-2 text-xs text-center text-red-500">{otpError}</p>
        )}
        {/* Resend */}
        <div className="mt-3 text-center">
          {countdown > 0 ? (
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Resend in <span className="font-semibold tabular-nums">{String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}</span>
            </span>
          ) : (
            <button type="button" onClick={handleResend} disabled={isSending} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50">
              {isSending ? 'Sending…' : 'Resend code'}
            </button>
          )}
        </div>
      </div>

      <Button
        type="primary"
        loading={isCheckingOTP}
        disabled={isCheckingOTP}
        onClick={() => {
          if (otp.length !== 6) {
            setOtpError('Please enter the 6-digit code.');
            return;
          }
          setOtpError('');
          checkOTP(
            { email, otp },
            {
              onSuccess: () => setStep('password'),
              onError: (err: any) => {
                const msg = err?.response?.data?.message || 'Invalid or expired OTP.';
                setOtpError(msg);
              },
            }
          );
        }}
        className="w-full"
        darkMode={isDark}
      >
        Continue
      </Button>
    </div>
  );

  // ── Step 3: New password ───────────────────────────────────────────────────
  if (step === 'password') return (
    <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-5">
      {divider}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setStep('otp')}
          className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Create new password
        </h3>
      </div>

      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Your new password must be different from previous used passwords.
      </p>

      {/* New password */}
      <div>
        {label('New password')}
        <PasswordField
          id="fp-password"
          placeholder="Min 8 chars, mixed case + symbol"
          {...resetForm.register('password')}
          error={resetForm.formState.errors.password?.message}
          darkMode={isDark}
        />
      </div>

      <div>
        {label('Confirm new password')}
        <PasswordField
          id="fp-confirm"
          placeholder="Repeat new password"
          {...resetForm.register('confirmPassword')}
          error={resetForm.formState.errors.confirmPassword?.message}
          darkMode={isDark}
        />
      </div>

      <Button type="primary" htmlType="submit" onClick={() => {}} loading={isResetting} disabled={isResetting} className="w-full mt-2" darkMode={isDark}>
        {isResetting ? 'Resetting…' : 'Reset password'}
      </Button>
    </form>
  );

  // ── Step 3: Success ────────────────────────────────────────────────────────
  return (
    <>
      {divider}
      <div className="text-center py-4 space-y-4">
        <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
          <FiCheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Password reset!</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Your password has been updated. You can now log in with your new password.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FiLock className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Your account is secure</span>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Back to login
        </button>
      </div>
    </>
  );
};

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas';
import { useLogin } from '@/shared/queries/auth';
import { Button, InputField, PasswordField } from '@ieee-ui/ui';
import logo from '@/assets/logo.png';
import { useTheme } from '@/shared/hooks/useTheme';
import { ForgotPasswordPanel } from '@/features/auth/components/ForgotPasswordPanel';

/**
 * Login Page Component
 */
export const LoginPage = () => {
  const { isDark } = useTheme();
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const {

    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div
        className={`absolute inset-0 bg-linear-to-br transition-colors duration-500 ${
          isDark
            ? 'from-gray-900 via-blue-900 to-gray-900'
            : 'from-blue-50 via-purple-50 to-pink-50'
        } animate-gradient-xy`}
      >
        <div
          className={`absolute inset-0 ${
            isDark
              ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(0,10,50,0.5),rgba(0,0,0,0))]'
              : 'bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),rgba(255,255,255,0))]'
          }`}
        />
      </div>

      <Link
        to="/"
        className={`absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
          isDark
            ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-700/50'
            : 'bg-white/50 text-gray-600 hover:bg-white hover:text-gray-900 border border-gray-200/50'
        } backdrop-blur-md shadow-sm`}
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        <div
          className={`backdrop-blur-xl rounded-2xl shadow-2xl border transition-all duration-300 p-8 ${
            isDark
              ? 'bg-gray-800/80 border-gray-700/50 shadow-blue-900/20'
              : 'bg-white/80 border-white/20 shadow-gray-200'
          }`}
        >
          {/* Logo (Always visible) */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Link to="/" className="inline-block hover:scale-105 transition-transform duration-300">
                <img
                  src={logo}
                  alt="IEEE CUSB Logo"
                  className={`h-20 w-20 object-contain transition-all duration-300 ${isDark ? 'drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]' : ''}`}
                />
              </Link>
            </div>
            
            {!showForgotPwd && (
              <>
                <h1
                  className={`text-3xl font-bold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  Welcome Back
                </h1>
                <p
                  className={`transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Sign in to your IEEE CUSB account
                </p>
              </>
            )}
          </div>

          {!showForgotPwd ? (
            <>
              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email/Username Field */}
                <div>
                  <label
                    htmlFor="identifier"
                    className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    Email or Username
                  </label>
                  <InputField
                    id="identifier"
                    type="text"
                    placeholder="Enter your email or username"
                    {...register('identifier')}
                    error={errors.identifier?.message}
                    disabled={isPending}
                    darkMode={isDark}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    Password
                  </label>
                  <PasswordField
                    id="password"
                    placeholder="Enter your password"
                    {...register('password')}
                    error={errors.password?.message}
                    disabled={isPending}
                    darkMode={isDark}
                  />
                </div>

                {/* Forgot Password Link */}
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPwd(true)}
                    className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  htmlType="submit"
                  onClick={() => {}}
                  type="primary"
                  className="w-full"
                  disabled={isPending}
                  loading={isPending}
                  darkMode={isDark}
                >
                  {isPending ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* Sign Up Link */}
              <p
                className={`mt-8 text-center text-sm transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className={`font-medium transition-colors duration-300 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  Sign up
                </Link>
              </p>
            </>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <ForgotPasswordPanel onClose={() => setShowForgotPwd(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

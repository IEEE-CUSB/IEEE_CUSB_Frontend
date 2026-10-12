import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { registerSchema } from '@/features/auth/schemas';
import { useRegister } from '@/shared/queries/auth';
import { Button, InputField, PasswordField, Select } from '@ieee-ui/ui';
import UniversityList from '@/constants/universityList';
import FacultyList from '@/constants/facultyList';
import { getDepartmentsForFaculty } from '@/constants/departmentList';
import logo from '@/assets/logo.png';
import { useTheme } from '@/shared/hooks/useTheme';
import { VerifyEmailModal } from '@/features/auth/components/VerifyEmailModal';

/**
 * Register Page Component
 * Role is automatically set to "Visitor" on backend - users cannot select role
 */
export const RegisterPage = () => {
  const { isDark } = useTheme();
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  const { mutate: register, isPending } = useRegister(email => {
    setVerifyEmail(email);
  });

  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange', // Enable live validation
    defaultValues: {
      email: '',
      username: '',
      name: '',
      phone: '',
      faculty: '',
      university: '',
      academic_year: '' as unknown as number,
      major: 'General',
      password: '',
      confirmPassword: '',
      cv: null as any,
    },
  });

  // Watch fields
  const faculty = watch('faculty');
  const availableDepartments = getDepartmentsForFaculty(faculty);
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const cvFile = watch('cv');
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

  const getSelectedFile = (val: unknown): File | null => {
    if (!val) return null;
    if (val instanceof FileList) return val.length > 0 ? (val[0] ?? null) : null;
    if (val instanceof File) return val;
    return null;
  };
  const selectedCvFile = getSelectedFile(cvFile);
  const cvFileName = selectedCvFile?.name ?? '';

  const onSubmit = (data: any) => {
    const { major, cv, ...rest } = data;
    const formData = new FormData();
    formData.append('email', rest.email);
    formData.append('username', rest.username);
    formData.append('name', rest.name);
    formData.append('phone', rest.phone);
    formData.append('faculty', rest.faculty);
    formData.append('university', rest.university);
    formData.append('academic_year', String(rest.academic_year));
    formData.append('password', rest.password);
    formData.append('confirmPassword', rest.confirmPassword);

    // Only include major when it is not the default
    formData.append('major', major && major !== 'General' ? major : 'General');

    // CV is optional — only append if a valid PDF file was selected
    const cvFile = getSelectedFile(cv);
    if (cvFile) {
      formData.append('cv', cvFile);
    }

    register(formData as any);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div
        className={`absolute inset-0 bg-linear-to-br transition-colors duration-500 ${isDark
          ? 'from-gray-900 via-blue-900 to-gray-900'
          : 'from-blue-50 via-purple-50 to-pink-50'
          } animate-gradient-xy`}
      >
        <div
          className={`absolute inset-0 ${isDark
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

      <div className="w-full max-w-2xl relative z-10">
        <div
          className={`backdrop-blur-xl rounded-2xl shadow-2xl border transition-all duration-300 p-8 ${isDark
            ? 'bg-gray-800/80 border-gray-700/50 shadow-blue-900/20'
            : 'bg-white/80 border-white/20 shadow-gray-200'
            }`}
        >
          {/* Header */}
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
            <h1
              className={`text-3xl font-bold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Create Account
            </h1>
            <p
              className={`transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Join IEEE CUSB community today
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Full Name *
                </label>
                <InputField
                  id="name"
                  type="text"
                  placeholder="Ahmed Wagih"
                  {...registerField('name')}
                  error={errors.name?.message}
                  disabled={isPending}
                  darkMode={isDark}
                />
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Username *
                </label>
                <InputField
                  id="username"
                  type="text"
                  placeholder="ahmedwagih"
                  {...registerField('username')}
                  error={errors.username?.message}
                  disabled={isPending}
                  darkMode={isDark}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Email Address *
                </label>
                <InputField
                  id="email"
                  type="email"
                  placeholder="ahmed@example.com"
                  {...registerField('email')}
                  error={errors.email?.message}
                  disabled={isPending}
                  darkMode={isDark}
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Phone Number *
                </label>
                <InputField
                  id="phone"
                  type="tel"
                  placeholder="+201001234567"
                  {...registerField('phone')}
                  error={errors.phone?.message}
                  disabled={isPending}
                  darkMode={isDark}
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* University */}
              <div>
                <label
                  htmlFor="university"
                  className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  University *
                </label>
                <Select
                  id="university"
                  {...registerField('university')}
                  options={UniversityList.map(u => ({ value: u, label: u }))}
                  error={errors.university?.message}
                  disabled={isPending}
                  darkMode={isDark}
                  placeholder="Select university"
                />
              </div>

              {/* Faculty */}
              <div>
                <label
                  htmlFor="faculty"
                  className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Faculty *
                </label>
                <Select
                  id="faculty"
                  {...registerField('faculty')}
                  options={FacultyList.map(f => ({ value: f, label: f }))}
                  error={errors.faculty?.message}
                  disabled={isPending}
                  darkMode={isDark}
                  placeholder="Select faculty"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Academic Year */}
              <div>
                <label
                  htmlFor="academic_year"
                  className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Academic Year *
                </label>
                <Select
                  id="academic_year"
                  {...registerField('academic_year')}
                  options={Array.from({ length: 5 }, (_, i) => ({
                    value: String(i + 1),
                    label: `Year ${i + 1}`,
                  }))}
                  error={errors.academic_year?.message}
                  disabled={isPending}
                  darkMode={isDark}
                  placeholder="Select year"
                />
              </div>

              {/* Department (Major) */}
              <div>
                <label
                  htmlFor="major"
                  className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Department
                </label>
                <Select
                  id="major"
                  {...registerField('major')}
                  options={availableDepartments.map(d => ({ value: d, label: d }))}
                  error={errors.major?.message}
                  disabled={isPending}
                  darkMode={isDark}
                  placeholder="Select department"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Password *
                </label>
                <PasswordField
                  id="password"
                  placeholder="Enter password"
                  {...registerField('password')}
                  error={errors.password?.message}
                  disabled={isPending}
                  darkMode={isDark}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Confirm Password *
                </label>
                <PasswordField
                  id="confirmPassword"
                  placeholder="Confirm password"
                  {...registerField('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  disabled={isPending}
                  darkMode={isDark}
                />
                {confirmPassword && !errors.confirmPassword && (
                  <span
                    className={`text-xs font-medium mt-1 ${passwordsMatch ? 'text-green-600' : 'text-amber-600'}`}
                  >
                    {passwordsMatch
                      ? '✓ Passwords match'
                      : '✗ Passwords do not match'}
                  </span>
                )}
              </div>
            </div>

            {/* CV Upload Field — optional */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="cv"
                  className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Upload CV (PDF)
                </label>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                }`}>
                  Optional
                </span>
              </div>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-300 cursor-pointer ${
                  errors.cv
                    ? 'border-red-500 bg-red-500/5'
                    : cvFileName
                      ? 'border-green-500 bg-green-500/5'
                      : isDark
                        ? 'border-gray-700 hover:border-blue-500 bg-gray-800/40'
                        : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50/30'
                }`}
              >
                <input
                  id="cv"
                  type="file"
                  accept=".pdf,application/pdf"
                  disabled={isPending}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  {...registerField('cv')}
                />
                <div className="flex flex-col items-center justify-center space-y-2 text-center pointer-events-none">
                  {cvFileName ? (
                    <>
                      {/* File selected ✓ */}
                      <div className="p-2 rounded-full bg-green-500/10">
                        <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className={`text-sm font-semibold max-w-xs truncate ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        {cvFileName}
                      </span>
                      <span className="text-xs text-green-500 font-medium">PDF ready to upload</span>
                      <span className="text-xs text-gray-400">Click to replace</span>
                    </>
                  ) : (
                    <>
                      {/* No file selected */}
                      <div className={`p-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Drag & drop or click to select
                      </span>
                      <span className="text-xs text-gray-400">PDF only · Max 5 MB</span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        You can also upload your CV later from your profile
                      </span>
                    </>
                  )}
                </div>
              </div>
              {errors.cv?.message && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.cv.message as string}
                </p>
              )}
            </div>

            {/* Password Requirements - Live Validation */}
            <div
              className={`rounded-lg p-4 transition-colors duration-300 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}
            >
              <p
                className={`text-xs font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}
              >
                Password must contain:
              </p>
              <ul className="text-xs space-y-1">
                <li
                  className={
                    password?.length >= 8
                      ? 'text-green-600'
                      : isDark
                        ? 'text-blue-300'
                        : 'text-blue-600'
                  }
                >
                  {password?.length >= 8 ? '✓' : '•'} At least 8 characters
                </li>
                <li
                  className={
                    /[A-Z]/.test(password || '')
                      ? 'text-green-600'
                      : isDark
                        ? 'text-blue-300'
                        : 'text-blue-600'
                  }
                >
                  {/[A-Z]/.test(password || '') ? '✓' : '•'} One uppercase
                  letter
                </li>
                <li
                  className={
                    /[a-z]/.test(password || '')
                      ? 'text-green-600'
                      : isDark
                        ? 'text-blue-300'
                        : 'text-blue-600'
                  }
                >
                  {/[a-z]/.test(password || '') ? '✓' : '•'} One lowercase
                  letter
                </li>
                <li
                  className={
                    /\d/.test(password || '')
                      ? 'text-green-600'
                      : isDark
                        ? 'text-blue-300'
                        : 'text-blue-600'
                  }
                >
                  {/\d/.test(password || '') ? '✓' : '•'} One number
                </li>
                <li
                  className={
                    /[@$!%*?&#]/.test(password || '')
                      ? 'text-green-600'
                      : isDark
                        ? 'text-blue-300'
                        : 'text-blue-600'
                  }
                >
                  {/[@$!%*?&#]/.test(password || '') ? '✓' : '•'} One special
                  character (@$!%*?&#)
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              htmlType="submit"
              onClick={() => { }}
              type="primary"
              className="w-full"
              disabled={isPending}
              loading={isPending}
              darkMode={isDark}
            >
              {isPending ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Sign In Link */}
          <p
            className={`mt-6 text-center text-sm transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className={`font-medium transition-colors duration-300 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Email verification modal — shown after successful registration */}
      {verifyEmail && (
        <VerifyEmailModal
          email={verifyEmail}
          onClose={() => setVerifyEmail(null)}
        />
      )}
    </div>
  );
};

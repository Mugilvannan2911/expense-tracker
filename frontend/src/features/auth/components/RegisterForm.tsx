import React, { useState } from 'react';
import { useAuth } from '../../../context';

interface RegisterFormProps {
  onSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onNavigateToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  // const [countryCode, setCountryCode] = useState('+91');
  const [mobileNo, setMobileNo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-teal-400' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!username.trim()) {
      setErrorMessage('Please choose a username.');
      return;
    }

    if (username.length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const cleanMobile = mobileNo.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please create a secure password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        phone: mobileNo.trim() || undefined,
        password,
      });

      setSuccessMessage(`Account created successfully for ${name || username}! Redirecting to Sign In...`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onNavigateToLogin) onNavigateToLogin();
      }, 1500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Feedback alerts */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
          <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <svg className="w-4 h-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Field 1: Full Name */}
      <div className="space-y-1">
        <label htmlFor="register-name" className="block text-xs font-semibold text-slate-300">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jordan Rivera"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            autoComplete="name"
          />
        </div>
      </div>

      {/* Field 2 & 3: Username & Email in responsive 2 cols */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Username */}
        <div className="space-y-1">
          <label htmlFor="register-username" className="block text-xs font-semibold text-slate-300">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-xs font-bold">
              @
            </div>
            <input
              id="register-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="jordan_rivera"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              autoComplete="username"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="register-email" className="block text-xs font-semibold text-slate-300">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jordan@example.com"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              autoComplete="email"
            />
          </div>
        </div>
      </div>

      {/* Field 4: Mobile No */}
      <div className="space-y-1">
        <label htmlFor="register-mobile" className="block text-xs font-semibold text-slate-300">
          Mobile Number
        </label>
        <div className="flex gap-2">
          {/* <div className="w-24 shrink-0">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full py-2.5 px-2.5 rounded-xl glass-input text-xs text-slate-200 focus:outline-none bg-slate-900 cursor-pointer"
            >
              <option value="+91">🇮🇳 +91</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+971">🇦🇪 +971</option>
              <option value="+65">🇸🇬 +65</option>
            </select>
          </div> */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              id="register-mobile"
              type="tel"
              maxLength={10}
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, ''))}
              placeholder="10-digit mobile number"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              autoComplete="tel"
            />
          </div>
        </div>
      </div>

      {/* Field 5: Password with strength meter */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="register-password" className="block text-xs font-semibold text-slate-300">
            Create Password
          </label>
          {password && (
            <span className="text-[11px] font-semibold text-slate-400">
              Strength: <span className="text-emerald-400">{passwordStrength.label}</span>
            </span>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full pl-10 pr-11 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Strength Progress Bars */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-1 rounded-full transition-all duration-300 ${passwordStrength.score >= step ? passwordStrength.color : 'bg-slate-800'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Terms and conditions checkbox & Demo Auto-fill */}
      <div className="flex items-start justify-between pt-1">
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            id="register-terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/30 transition-all cursor-pointer"
          />
          <span className="text-xs text-slate-400 leading-snug">
            I agree to the{' '}
            <a href="#terms" className="text-emerald-400 underline">Terms</a> &{' '}
            <a href="#privacy" className="text-emerald-400 underline">Privacy Policy</a>
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        id="register-submit-btn"
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Creating Your Account...</span>
          </>
        ) : (
          <>
            <span>Create Account</span>
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
};

export default RegisterForm;

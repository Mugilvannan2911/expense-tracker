import React from 'react';
import PasswordLoginForm from './PasswordLoginForm';
import RegisterForm from './RegisterForm';
import expenseCoin from '../../../assets/expense-coin.svg';

interface SlidingAuthContainerProps {
  isSignUp: boolean;
  onToggleMode: (isSignUp: boolean) => void;
}

export const SlidingAuthContainer: React.FC<SlidingAuthContainerProps> = ({
  isSignUp,
  onToggleMode,
}) => {
  const modeClass = isSignUp ? 'state-signup' : 'state-signin';

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Desktop Sliding Container (md and up) */}
      <div className="hidden md:block relative w-full h-170 bg-slate-900/90 rounded-[36px] border border-slate-800/80 shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-2xl">
        <div
          className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center px-8 lg:px-12 smooth-form-panel signin-form-panel ${modeClass}`}
        >
          {/* Card Header */}
          <div className="mb-4">
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Sign In
            </h2>
          </div>

          {/* Active Login Form */}
          <div className="overflow-y-auto max-h-115 custom-scrollbar pr-1">
            <PasswordLoginForm />
          </div>
        </div>

        <div
          className={`absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center px-8 lg:px-12 smooth-form-panel signup-form-panel ${modeClass}`}
        >
          {/* Card Header */}
          <div className="mb-3">
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Create Account
            </h2>
          </div>

          {/* Register Form */}
          <div className="overflow-y-auto max-h-125 custom-scrollbar pr-1">
            <RegisterForm onNavigateToLogin={() => onToggleMode(false)} />
          </div>
        </div>

        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-40 smooth-overlay-box shadow-2xl ${modeClass}`}
        >
          {/* Internal double-width gradient background (200% width) */}
          <div
            className={`smooth-overlay-inner bg-linear-to-br from-emerald-700 via-emerald-600 to-teal-800 text-white ${modeClass}`}
          >
            {/* Background texture & lighting within the overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_60%)] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

            {/* Left Inner Panel: Shown when overlay is on the Left (Sign Up view active) */}
            <div
              className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center px-10 text-center smooth-form-panel overlay-panel-left ${modeClass}`}
            >
              {/* Pinned Brand Header at the top of Slider */}
              <div className="absolute top-8 left-0 right-0 flex items-center justify-center pointer-events-none">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-950/90 backdrop-blur-md border border-white/20 shadow-xl shadow-black/30">
                  <div className="w-9 h-9 rounded-full bg-white/10 p-1 flex items-center justify-center shadow-inner">
                    <img src={expenseCoin} alt="ExpenseTracker Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-black text-base md:text-lg tracking-tight text-white">
                    Expense<span className="text-emerald-400">Tracker</span>
                  </span>
                </div>
              </div>

              <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
                Welcome Back!
              </h3>
              <p className="text-sm text-emerald-100/90 leading-relaxed max-w-xs mb-8">
                To keep connected with your finances, please sign in with your personal credentials.
              </p>
              
              <button
                id="btn-slide-to-signin"
                type="button"
                onClick={() => onToggleMode(false)}
                className="px-9 py-3 rounded-full border-2 border-white/90 text-white font-extrabold text-xs tracking-wider uppercase hover:bg-white hover:text-emerald-800 active:scale-95 transition-all duration-300 shadow-xl shadow-emerald-950/40 cursor-pointer"
              >
                Sign In
              </button>
            </div>

            {/* Right Inner Panel: Shown when overlay is on the Right (Sign In view active) */}
            <div
              className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center px-10 text-center smooth-form-panel overlay-panel-right ${modeClass}`}
            >
              {/* Pinned Brand Header at the top of Slider */}
              <div className="absolute top-8 left-0 right-0 flex items-center justify-center pointer-events-none">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-950/90 backdrop-blur-md border border-white/20 shadow-xl shadow-black/30">
                  <div className="w-9 h-9 rounded-full bg-white/10 p-1 flex items-center justify-center shadow-inner">
                    <img src={expenseCoin} alt="ExpenseTracker Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-black text-base md:text-lg tracking-tight text-white">
                    Expense<span className="text-emerald-400">Tracker</span>
                  </span>
                </div>
              </div>

              <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
                Hello, Friend!
              </h3>
              <p className="text-sm text-emerald-100/90 leading-relaxed max-w-xs mb-8">
                Register with your personal details to track expenses, set budget goals, and grow your wealth.
              </p>

              <button
                id="btn-slide-to-signup"
                type="button"
                onClick={() => onToggleMode(true)}
                className="px-9 py-3 rounded-full border-2 border-white/90 text-white font-extrabold text-xs tracking-wider uppercase hover:bg-white hover:text-emerald-800 active:scale-95 transition-all duration-300 shadow-xl shadow-emerald-950/40 cursor-pointer"
              >
                Sign Up
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Mobile Responsive Layout (Screens < 768px) */}
      <div className="block md:hidden w-full">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          {/* Mobile Brand Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-1.5 flex items-center justify-center shadow-md">
              <img src={expenseCoin} alt="ExpenseTracker Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-2xl tracking-tight text-white">
              Expense<span className="text-emerald-400">Tracker</span>
            </span>
          </div>

          {/* Mobile Mode Switcher Pills */}
          <div className="p-1 rounded-2xl bg-slate-950 border border-slate-800 flex items-center mb-6">
            <button
              type="button"
              onClick={() => onToggleMode(false)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isSignUp
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onToggleMode(true)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSignUp
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {!isSignUp ? (
            <div>
              <PasswordLoginForm />
            </div>
          ) : (
            <RegisterForm onNavigateToLogin={() => onToggleMode(false)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SlidingAuthContainer;

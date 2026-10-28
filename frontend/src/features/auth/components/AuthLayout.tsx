import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Ambient background lighting and tech grid overlay
 */
const AuthBackground: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
    {/* Top-left emerald glow */}
    <div className="absolute -top-36 -left-36 w-140 h-140 rounded-full ambient-glow-green blur-3xl opacity-60 animate-pulse-glow" />

    {/* Bottom-right amber glow */}
    <div
      className="absolute -bottom-36 -right-36 w-145 h-145 rounded-full ambient-glow-amber blur-3xl opacity-50 animate-pulse-glow"
      style={{ animationDelay: '2s' }}
    />

    {/* Center subtle gradient wash */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-225 bg-linear-to-br from-emerald-950/15 via-slate-900/0 to-teal-950/15 rounded-full blur-3xl pointer-events-none" />

    {/* Tech grid texture overlay */}
    <div
      className="absolute inset-0 opacity-[0.035]"
      style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    />
  </div>
);

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full relative bg-[#070b14] text-slate-100 flex flex-col justify-center overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      <AuthBackground />
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-8 lg:px-8">
        <div className="w-full max-w-5xl mx-auto flex items-center justify-center">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;

import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, ArrowRight, Lock, Mail, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    isSaveProgressModalOpen,
    setIsSaveProgressModalOpen,
    continueAsGuest,
    createAccount,
    signIn,
  } = useApp();

  // Form states
  const [name, setName] = useState(user?.isGuest && user.name !== 'Guest' ? user.name : '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Show modal if user is new (!user), or if explicitly opened
  const isFirstTimeLanding = !user;

  if (!isAuthModalOpen && !isSaveProgressModalOpen && !isFirstTimeLanding) {
    return null;
  }

  // Active view: 'welcome' | 'guest' | 'signup' | 'signin' | 'save_progress'
  const currentView: 'welcome' | 'guest' | 'signup' | 'signin' | 'save_progress' = isSaveProgressModalOpen
    ? 'save_progress'
    : authModalMode;

  const switchMode = (mode: 'welcome' | 'guest' | 'signup' | 'signin') => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSaveProgressModalOpen(false);
    setAuthModalMode(mode);
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    continueAsGuest(name.trim() || 'Guest');
    setIsAuthModalOpen(false);
    setIsSaveProgressModalOpen(false);
  };

  const handleInstantGuest = () => {
    continueAsGuest('Guest');
    setIsAuthModalOpen(false);
    setIsSaveProgressModalOpen(false);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please agree to the Terms & Privacy Policy.');
      return;
    }

    const success = createAccount(name, email, password);
    if (!success) {
      setErrorMsg('An account with this email already exists.');
      return;
    }

    setSuccessMsg('Account created successfully! Progress synced.');
    setTimeout(() => {
      setIsAuthModalOpen(false);
      setIsSaveProgressModalOpen(false);
      setErrorMsg('');
      setSuccessMsg('');
    }, 600);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const success = signIn(email, password);
    if (!success) {
      setErrorMsg('Invalid email or password. Please check credentials or create a new account.');
      return;
    }

    setSuccessMsg('Signed in successfully!');
    setTimeout(() => {
      setIsAuthModalOpen(false);
      setErrorMsg('');
      setSuccessMsg('');
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B10]/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#111720] border border-[#202833] p-6 sm:p-8 shadow-2xl">
        {/* Close Button (only if user is already established) */}
        {user && (
          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setIsSaveProgressModalOpen(false);
              setErrorMsg('');
            }}
            className="absolute top-4 right-4 p-2 rounded-lg text-[#8B95A5] hover:text-[#F5F7FA] hover:bg-[#0D1219] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#0D1219] border border-cyan-500/30 text-cyan-400 font-bold text-2xl mx-auto mb-3 shadow-[0_0_16px_rgba(6,182,212,0.15)]">
            ∑
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#F5F7FA]">
            CALC<span className="text-cyan-400">RUSH</span>
          </h2>
          <p className="text-xs text-[#8B95A5] mt-1">Train your calculation.</p>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300">
            {successMsg}
          </div>
        )}

        {/* VIEW 1: FIRST-TIME WELCOME SCREEN */}
        {currentView === 'welcome' && (
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-4">
              <p className="text-sm font-medium text-[#F5F7FA]">
                Improve numerical fluency, speed, and accuracy.
              </p>
              <p className="text-xs text-[#8B95A5]">
                Compete on 10 progressive levels or practice freely.
              </p>
            </div>

            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Create Account</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('guest')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0D1219] hover:bg-[#18202c] active:bg-[#202833] text-[#F5F7FA] border border-[#202833] font-semibold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <span>⚡ Continue as Guest</span>
            </button>

            <div className="flex items-center justify-between pt-2 px-1 text-xs">
              <button
                type="button"
                onClick={handleInstantGuest}
                className="text-[#8B95A5] hover:text-[#F5F7FA] transition-colors cursor-pointer"
              >
                Instant Play (Guest)
              </button>
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-[#8B95A5] hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Already registered? <span className="font-semibold text-cyan-400">Sign in</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: GUEST ONBOARDING (NAME ONLY) */}
        {currentView === 'guest' && (
          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-sm font-bold text-[#F5F7FA]">Continue as Guest</h3>
              <p className="text-xs text-[#8B95A5] mt-1">What's your name?</p>
            </div>

            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anik"
                autoFocus
                className="w-full py-3 px-4 rounded-xl bg-[#0D1219] border border-[#202833] text-[#F5F7FA] placeholder-[#8B95A5]/60 focus:border-cyan-400 outline-none text-center font-medium"
              />
              <p className="text-[11px] text-[#8B95A5] text-center mt-2">
                Your name is used only to personalize your experience.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-bold text-sm transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              Start Training
            </button>

            <div className="flex items-center justify-between pt-1 px-1 text-xs text-[#8B95A5]">
              <button
                type="button"
                onClick={handleInstantGuest}
                className="hover:text-[#F5F7FA] cursor-pointer"
              >
                Skip name & start
              </button>
              <button
                type="button"
                onClick={() => switchMode('welcome')}
                className="hover:text-[#F5F7FA] cursor-pointer"
              >
                Back to options
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: CREATE ACCOUNT */}
        {currentView === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3">
            <div className="text-center mb-2">
              <h3 className="text-sm font-bold text-[#F5F7FA]">Create Your Account</h3>
              <p className="text-xs text-[#8B95A5]">Save progress securely across all devices.</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-[#8B95A5]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0D1219] border border-[#202833] text-xs text-[#F5F7FA] focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8B95A5]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0D1219] border border-[#202833] text-xs text-[#F5F7FA] focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8B95A5]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0D1219] border border-[#202833] text-xs text-[#F5F7FA] focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8B95A5]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0D1219] border border-[#202833] text-xs text-[#F5F7FA] focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <label className="flex items-start space-x-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded bg-[#0D1219] border-[#202833] text-cyan-500 focus:ring-0"
              />
              <span className="text-[11px] text-[#8B95A5]">
                I agree to the Terms & Privacy Policy
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-500/20 mt-2 cursor-pointer"
            >
              Create Account
            </button>

            <div className="flex items-center justify-between pt-2 px-1 text-xs text-[#8B95A5]">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="hover:text-cyan-400 cursor-pointer"
              >
                Already registered? <span className="font-semibold text-cyan-400">Sign in</span>
              </button>
              <button
                type="button"
                onClick={handleInstantGuest}
                className="hover:text-[#F5F7FA] cursor-pointer"
              >
                Play as Guest
              </button>
            </div>
          </form>
        )}

        {/* VIEW 4: SIGN IN */}
        {currentView === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-3">
            <div className="text-center mb-2">
              <h3 className="text-sm font-bold text-[#F5F7FA]">Welcome Back</h3>
              <p className="text-xs text-[#8B95A5]">Sign in to your CalcRush account.</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8B95A5]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0D1219] border border-[#202833] text-xs text-[#F5F7FA] focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8B95A5]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0D1219] border border-[#202833] text-xs text-[#F5F7FA] focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-500/20 mt-2 cursor-pointer"
            >
              Sign In
            </button>

            <div className="flex items-center justify-between pt-2 px-1 text-xs text-[#8B95A5]">
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="hover:text-cyan-400 cursor-pointer"
              >
                Need an account? <span className="font-semibold text-cyan-400">Create one</span>
              </button>
              <button
                type="button"
                onClick={handleInstantGuest}
                className="hover:text-[#F5F7FA] cursor-pointer"
              >
                Play as Guest
              </button>
            </div>
          </form>
        )}

        {/* VIEW 5: GUEST -> ACCOUNT CONVERSION MODAL */}
        {currentView === 'save_progress' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#F5F7FA]">Save Your Progress</h3>
              <p className="text-xs text-[#8B95A5]">
                Keep your ratings, streak, and statistics across devices.
              </p>
            </div>

            {user && (
              <div className="p-3.5 rounded-xl bg-[#0D1219] border border-[#202833] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8B95A5]">Questions Solved</span>
                  <span className="font-math font-bold text-[#F5F7FA]">{user.questionsSolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B95A5]">Competitive Level</span>
                  <span className="font-math font-bold text-cyan-400">Level {user.competitiveLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B95A5]">Rating</span>
                  <span className="font-math font-bold text-cyan-400">{user.competitiveRating}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B95A5]">Best Streak</span>
                  <span className="font-math font-bold text-amber-400">{user.bestStreak}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                switchMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-sm transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              Create Account & Migrate Data
            </button>

            <button
              onClick={() => {
                setIsSaveProgressModalOpen(false);
                setIsAuthModalOpen(false);
              }}
              className="w-full py-2.5 text-xs text-[#8B95A5] hover:text-[#F5F7FA] cursor-pointer"
            >
              Not now, keep local
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

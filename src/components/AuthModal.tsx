import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  User,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';

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
    handleAccountRegistered,
    handleAccountSignedIn,
    handleEmailVerified,
    isOnline,
  } = useApp();

  // Form states
  const [name, setName] = useState(user?.isGuest && user.name !== 'Guest' ? user.name : '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP Verification states
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailStatusNote, setEmailStatusNote] = useState<string>('');
  const [devOtpPreview, setDevOtpPreview] = useState<string | null>(null);

  // Password Reset states
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Google OAuth Availability
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);

  // Check Google OAuth status on mount
  useEffect(() => {
    authService.getGoogleConfig().then((cfg) => {
      setGoogleAvailable(cfg.enabled);
      setGoogleClientId(cfg.clientId);
    });
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const isFirstTimeLanding = !user;

  if (!isAuthModalOpen && !isSaveProgressModalOpen && !isFirstTimeLanding) {
    return null;
  }

  // Active view: 'welcome' | 'guest' | 'signup' | 'signin' | 'verify_email' | 'forgot_password' | 'reset_password' | 'save_progress'
  const currentView = isSaveProgressModalOpen ? 'save_progress' : authModalMode;

  const switchMode = (mode: any) => {
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

  // Google Sign In action
  const handleGoogleClick = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!googleAvailable) {
      setErrorMsg(
        'Google Sign-In is currently unavailable. (Google OAuth credentials have not been configured on this deployment. Please sign up with Email & Password or continue as Guest.)'
      );
      return;
    }

    // Google GIS integration
    try {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              setIsLoading(true);
              const authRes = await authService.loginWithGoogle(response.credential);
              setIsLoading(false);
              if (authRes.success && authRes.user && authRes.token) {
                handleAccountSignedIn(authRes.user, authRes.token);
                setSuccessMsg('Signed in with Google!');
                setTimeout(() => {
                  setIsAuthModalOpen(false);
                }, 500);
              } else {
                setErrorMsg(authRes.error || 'Google Sign-In failed.');
              }
            }
          },
        });
        (window as any).google.accounts.id.prompt();
      } else {
        setErrorMsg('Google Sign-In script is not loaded in this environment.');
      }
    } catch (err: any) {
      setErrorMsg('Google Sign-In error: ' + (err.message || 'Unknown error'));
    }
  };

  // Account creation submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

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

    setIsLoading(true);
    const res = await authService.register(name, email, password);
    setIsLoading(false);

    if (!res.success || !res.user || !res.token) {
      setErrorMsg(res.error || 'Failed to create account.');
      return;
    }

    handleAccountRegistered(res.user, res.token);

    if (res.emailStatus === 'unconfigured_dev_preview') {
      setEmailStatusNote(
        'Email service is running in Development / Preview mode (No external SMTP configured).'
      );
      if (res.verificationCode) {
        setDevOtpPreview(res.verificationCode);
      }
    } else {
      setEmailStatusNote('A 6-digit verification code has been sent to your email.');
    }

    setResendCooldown(60);
    setSuccessMsg('Account created successfully! Please enter your 6-digit verification code.');
    setAuthModalMode('verify_email');
  };

  // Sign In submit
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const res = await authService.login(email, password);
    setIsLoading(false);

    if (!res.success || !res.user || !res.token) {
      setErrorMsg(res.error || 'Invalid email or password.');
      return;
    }

    handleAccountSignedIn(res.user, res.token);
    setSuccessMsg('Signed in successfully!');
    setTimeout(() => {
      setIsAuthModalOpen(false);
      setErrorMsg('');
      setSuccessMsg('');
    }, 600);
  };

  // Email verification submit
  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetEmail = email || user?.email;
    if (!targetEmail) {
      setErrorMsg('No email address provided for verification.');
      return;
    }
    if (!verificationCode.trim() || verificationCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    const res = await authService.verifyEmail(targetEmail, verificationCode.trim());
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Invalid or expired verification code.');
      return;
    }

    handleEmailVerified();
    setSuccessMsg('Email successfully verified! Your account is fully secured.');
    setTimeout(() => {
      setIsAuthModalOpen(false);
      setVerificationCode('');
      setDevOtpPreview(null);
    }, 1000);
  };

  // Resend verification code
  const handleResendCode = async () => {
    const targetEmail = email || user?.email;
    if (!targetEmail) return;
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setErrorMsg('');
    const res = await authService.resendCode(targetEmail);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to resend code.');
      return;
    }

    setResendCooldown(60);
    if (res.emailStatus === 'unconfigured_dev_preview') {
      setEmailStatusNote('New code generated (Development / Preview mode).');
      if (res.verificationCode) {
        setDevOtpPreview(res.verificationCode);
      }
    } else {
      setEmailStatusNote('A new 6-digit code has been sent to your email.');
    }
    setSuccessMsg('New verification code sent!');
  };

  // Forgot Password request
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const res = await authService.forgotPassword(resetEmail);
    setIsLoading(false);

    if (res.resetCode) {
      setDevOtpPreview(res.resetCode);
    }
    setSuccessMsg(res.message || 'If an account exists, a reset code has been sent.');
    setAuthModalMode('reset_password');
  };

  // Reset Password submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetCode.trim() || resetCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit reset code.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await authService.resetPassword(resetEmail, resetCode.trim(), newPassword);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to reset password.');
      return;
    }

    setSuccessMsg('Password reset successfully! You can now sign in.');
    setTimeout(() => {
      setAuthModalMode('signin');
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setDevOtpPreview(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B10]/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#111720] border border-[#202833] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button (only if user is already established) */}
        {user && (
          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setIsSaveProgressModalOpen(false);
              setErrorMsg('');
              setSuccessMsg('');
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
          <p className="text-xs text-[#8B95A5] mt-1">Train your calculation speed & fluency.</p>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: FIRST-TIME WELCOME SCREEN */}
        {/* ======================================================== */}
        {currentView === 'welcome' && (
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-4">
              <p className="text-sm font-medium text-[#F5F7FA]">
                Improve arithmetic fluency, speed, and accuracy.
              </p>
              <p className="text-xs text-[#8B95A5]">
                Compete on 10 progressive levels or practice freely.
              </p>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full py-3 px-4 rounded-xl bg-[#0D1219] hover:bg-[#18202c] border border-[#202833] text-[#F5F7FA] font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2.5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#202833]" />
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-[#8B95A5] tracking-wider">
                or
              </span>
              <div className="flex-grow border-t border-[#202833]" />
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
              className="w-full py-3 px-4 rounded-xl bg-[#0D1219] hover:bg-[#18202c] text-[#F5F7FA] border border-[#202833] font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
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

        {/* ======================================================== */}
        {/* VIEW 2: GUEST ONBOARDING (NAME ONLY) */}
        {/* ======================================================== */}
        {currentView === 'guest' && (
          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-sm font-bold text-[#F5F7FA]">Continue as Guest</h3>
              <p className="text-xs text-[#8B95A5] mt-1">What should we call you?</p>
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
                Guest Mode runs completely offline without requiring an account.
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

        {/* ======================================================== */}
        {/* VIEW 3: CREATE ACCOUNT */}
        {/* ======================================================== */}
        {currentView === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3">
            <div className="text-center mb-2">
              <h3 className="text-sm font-bold text-[#F5F7FA]">Create Your Account</h3>
              <p className="text-xs text-[#8B95A5]">Save progress securely with cross-device cloud sync.</p>
            </div>

            {/* Google Sign In Option */}
            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0D1219] hover:bg-[#18202c] border border-[#202833] text-[#F5F7FA] font-medium text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#202833]" />
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-[#8B95A5] tracking-wider">
                or with email
              </span>
              <div className="flex-grow border-t border-[#202833]" />
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
                  placeholder="Confirm password"
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
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-500/20 mt-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
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

        {/* ======================================================== */}
        {/* VIEW 4: SIGN IN */}
        {/* ======================================================== */}
        {currentView === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-3">
            <div className="text-center mb-2">
              <h3 className="text-sm font-bold text-[#F5F7FA]">Welcome Back</h3>
              <p className="text-xs text-[#8B95A5]">Sign in to your CalcRush account.</p>
            </div>

            {/* Google Sign In Option */}
            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0D1219] hover:bg-[#18202c] border border-[#202833] text-[#F5F7FA] font-medium text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#202833]" />
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-[#8B95A5] tracking-wider">
                or with email
              </span>
              <div className="flex-grow border-t border-[#202833]" />
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot_password')}
                  className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
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
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-500/20 mt-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
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

        {/* ======================================================== */}
        {/* VIEW 5: EMAIL VERIFICATION (OTP) */}
        {/* ======================================================== */}
        {currentView === 'verify_email' && (
          <form onSubmit={handleVerifyEmailSubmit} className="space-y-4">
            <div className="text-center mb-2">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center mb-2">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F7FA]">Verify Your Email</h3>
              <p className="text-xs text-[#8B95A5] mt-1">
                Enter the 6-digit code sent to <span className="text-[#F5F7FA] font-medium">{email || user?.email}</span>
              </p>
            </div>

            {/* Email provider status notice */}
            {emailStatusNote && (
              <div className="p-3 rounded-xl bg-[#0D1219] border border-[#202833] text-xs text-[#8B95A5] space-y-1">
                <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold text-[11px]">
                  <Info className="w-3.5 h-3.5" />
                  <span>Email Service Status</span>
                </div>
                <p className="text-[11px] leading-relaxed">{emailStatusNote}</p>
                {devOtpPreview && (
                  <div className="mt-2 p-2 rounded bg-[#111720] border border-cyan-500/30 text-center">
                    <span className="text-[10px] text-[#8B95A5] block uppercase font-bold tracking-wider">
                      Preview Verification Code:
                    </span>
                    <span className="font-mono text-base font-extrabold text-cyan-400 tracking-widest">
                      {devOtpPreview}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1 text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                className="w-full py-3 px-4 rounded-xl bg-[#0D1219] border border-[#202833] text-[#F5F7FA] focus:border-cyan-400 outline-none text-center font-mono text-xl tracking-widest font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-bold text-sm transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Verifying Code...' : 'Verify Email'}
            </button>

            <div className="flex items-center justify-between pt-1 px-1 text-xs text-[#8B95A5]">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isLoading}
                className="hover:text-cyan-400 disabled:opacity-50 cursor-pointer flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="hover:text-[#F5F7FA] cursor-pointer"
              >
                Verify later
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 6: FORGOT PASSWORD */}
        {/* ======================================================== */}
        {currentView === 'forgot_password' && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="text-center mb-2">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F7FA]">Password Recovery</h3>
              <p className="text-xs text-[#8B95A5] mt-1">
                Enter your account email to receive a password reset code.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8B95A5]" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0D1219] border border-[#202833] text-xs text-[#F5F7FA] focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-bold text-sm transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Sending Request...' : 'Send Reset Code'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-xs text-[#8B95A5] hover:text-[#F5F7FA] cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 7: RESET PASSWORD (NEW PASSWORD) */}
        {/* ======================================================== */}
        {currentView === 'reset_password' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
            <div className="text-center mb-2">
              <h3 className="text-base font-bold text-[#F5F7FA]">Set New Password</h3>
              <p className="text-xs text-[#8B95A5] mt-1">
                Enter the 6-digit code and your new password.
              </p>
            </div>

            {devOtpPreview && (
              <div className="p-2.5 rounded-xl bg-[#0D1219] border border-cyan-500/30 text-center">
                <span className="text-[10px] text-[#8B95A5] block uppercase font-bold tracking-wider">
                  Development Reset Code:
                </span>
                <span className="font-mono text-base font-extrabold text-cyan-400 tracking-widest">
                  {devOtpPreview}
                </span>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                6-Digit Reset Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                className="w-full py-2.5 px-3 rounded-lg bg-[#0D1219] border border-[#202833] text-xs text-[#F5F7FA] font-mono tracking-widest text-center focus:border-cyan-400 outline-none font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8B95A5]" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0D1219] border border-[#202833] text-xs text-[#F5F7FA] focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8B95A5]" />
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0D1219] border border-[#202833] text-xs text-[#F5F7FA] focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-500/20 mt-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-xs text-[#8B95A5] hover:text-[#F5F7FA] cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 8: GUEST -> ACCOUNT MIGRATION */}
        {/* ======================================================== */}
        {currentView === 'save_progress' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#F5F7FA]">
                Save your CalcRush progress to your account?
              </h3>
              <p className="text-xs text-[#8B95A5]">
                Migrate your rating, sessions, mistake bank, and custom levels seamlessly.
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
              Save & Migrate Progress
            </button>

            <button
              onClick={() => {
                setIsSaveProgressModalOpen(false);
                setIsAuthModalOpen(false);
              }}
              className="w-full py-2.5 text-xs text-[#8B95A5] hover:text-[#F5F7FA] cursor-pointer"
            >
              Keep local Guest data only
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

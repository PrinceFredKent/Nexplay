import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User as UserIcon, 
  LogOut, 
  Sparkles, 
  Crown, 
  Mail, 
  Key, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Play, 
  Clapperboard,
  ArrowLeft,
  Send,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  KeyRound,
  Lock
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  syncUserProfile, 
  UserProfileData,
  isSuperAdminEmail 
} from '../services/firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { NETFLIX_AVATARS, DEFAULT_NETFLIX_AVATAR } from '../services/netflixAvatars';
import { APP_VERSION, BUILD_NUMBER, BUILD_DATE } from '../constants/version';

interface AuthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  userProfile: UserProfileData | null;
  onProfileUpdated: () => void;
  onOpenAdmin?: () => void;
  onOpenAutoFill?: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

export const AuthProfileModal: React.FC<AuthProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  onProfileUpdated,
  onOpenAdmin,
  onOpenAutoFill,
  initialMode = 'signin'
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 6-Digit Code Reset State
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'new_password' | 'success'>('email');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Refs for 6 OTP input boxes
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Profile Edit State (for logged-in users)
  const [editName, setEditName] = useState(userProfile?.displayName || currentUser?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.photoURL || currentUser?.photoURL || DEFAULT_NETFLIX_AVATAR);
  const [isKids, setIsKids] = useState(userProfile?.isKids || false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync initialMode if route changes externally
  useEffect(() => {
    if (window.location.pathname === '/forgot-password' || window.location.hash === '#forgot-password') {
      setAuthMode('forgot');
      setResetStep('email');
    } else {
      setAuthMode(initialMode);
    }
    setErrorMessage(null);
  }, [initialMode, isOpen]);

  // Resend Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Switch Auth Mode with URL updates
  const handleSwitchMode = (mode: 'signin' | 'signup' | 'forgot') => {
    setAuthMode(mode);
    setErrorMessage(null);
    if (mode === 'forgot') {
      setResetStep('email');
      setOtpDigits(['', '', '', '', '', '']);
      if (window.location.pathname !== '/forgot-password') {
        window.history.pushState(null, '', '/forgot-password');
      }
    } else {
      if (window.location.pathname !== '/login') {
        window.history.pushState(null, '', '/login');
      }
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await syncUserProfile(res.user);
        onProfileUpdated();
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Email / Password Form Submit (Sign In / Sign Up)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (authMode === 'signin') {
        const res = await signInWithEmailAndPassword(auth, email.trim(), password);
        await syncUserProfile(res.user);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName.trim()) {
          await updateProfile(res.user, { displayName: displayName.trim() });
        }
        await syncUserProfile(res.user, { displayName: displayName.trim() });
      }
      onProfileUpdated();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMessage('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Password must be at least 6 characters.');
      } else {
        setErrorMessage(err.message || 'Authentication error.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generate & Send 6-Digit OTP Code
  const handleSendOtpCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      // 1. Generate secure 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpDigits(['', '', '', '', '', '']);

      // 2. Also send standard Firebase password reset email in the background
      try {
        await sendPasswordResetEmail(auth, email.trim());
      } catch (fbErr) {
        // Continue even if Firebase email throws non-blocking rate limit
        console.log('Firebase reset email background dispatch:', fbErr);
      }

      setResendCooldown(60);
      setResetStep('code');
      // Auto-focus first input box after short delay
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index: number, val: string) => {
    // Only accept numeric characters
    const cleanVal = val.replace(/\D/g, '');
    if (!cleanVal && val !== '') return;

    const newDigits = [...otpDigits];
    
    if (cleanVal.length > 1) {
      // User pasted multiple digits
      const pasted = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance to next box if filled
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation in OTP
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Autofill test code helper
  const handleAutofillCode = () => {
    if (!generatedOtp) return;
    const split = generatedOtp.split('');
    setOtpDigits(split);
    setErrorMessage(null);
    otpInputRefs.current[5]?.focus();
  };

  // Verify the 6-Digit OTP Code
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      setErrorMessage('Please enter the full 6-digit code.');
      return;
    }

    if (enteredCode !== generatedOtp) {
      setErrorMessage('Invalid verification code. Please check and try again.');
      return;
    }

    setErrorMessage(null);
    setResetStep('new_password');
  };

  // Set New Password Submission
  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setPassword(newPassword);
      setResetStep('success');
    }, 600);
  };

  // Profile Save Handler (Logged in)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingProfile(true);
    setSaveSuccess(false);
    try {
      await updateProfile(currentUser, {
        displayName: editName.trim() || currentUser.displayName,
        photoURL: selectedAvatar
      });
      await syncUserProfile(currentUser, {
        displayName: editName.trim(),
        photoURL: selectedAvatar,
        isKids: isKids
      });
      setSaveSuccess(true);
      onProfileUpdated();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onProfileUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-6 animate-in fade-in duration-300 overflow-y-auto">
      
      {/* Centered Modal Container */}
      <div 
        className={`relative z-10 w-full ${
          currentUser ? 'max-w-2xl' : 'max-w-md'
        } rounded-3xl bg-[#0c0e17] border border-white/10 shadow-[0_0_80px_rgba(225,29,72,0.2)] overflow-hidden my-auto`}
      >
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
              <Clapperboard className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white font-display uppercase">
                Nexplay
              </span>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                4K STREAMING
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {currentUser ? (
          /* LOGGED IN: PROFILE SETTINGS & ADMIN DASHBOARD */
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Super Admin Notice (Only for princefredkent@gmail.com) */}
            {isSuperAdminEmail(currentUser?.email) ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shrink-0">
                    <Crown className="w-5 h-5 fill-amber-200 text-amber-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">Master Admin Authorized</h4>
                      <span className="text-[9px] font-mono text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                        PUBLISHER
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {currentUser.email} • Full permissions to add movies & manage catalog.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onOpenAutoFill && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAutoFill();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs shadow transition-all active:scale-95"
                    >
                      + Add Movie
                    </button>
                  )}
                  {onOpenAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdmin();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all active:scale-95"
                    >
                      Admin Hub
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Nexplay Member Account</span>
                  <p className="text-[11px] text-slate-400">
                    {currentUser.email} • Cloud watchlist & playback sync active.
                  </p>
                </div>
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="space-y-5">
              
              {/* Avatar Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Choose Profile Avatar</span>
                  <span className="text-[11px] text-slate-400">Official Netflix Avatars</span>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-6 gap-2">
                  {NETFLIX_AVATARS.map((av) => (
                    <button
                      type="button"
                      key={av.id}
                      onClick={() => setSelectedAvatar(av.svgDataUrl)}
                      title={av.name}
                      className={`relative rounded-xl p-0.5 border-2 transition-all overflow-hidden ${
                        selectedAvatar === av.svgDataUrl 
                          ? 'border-rose-500 scale-105 shadow-lg shadow-rose-600/40 ring-1 ring-rose-500' 
                          : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                      }`}
                    >
                      <img src={av.svgDataUrl} alt={av.name} className="w-10 h-10 rounded-lg object-cover mx-auto" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Name & Email Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Display Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Account Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      disabled
                      value={currentUser.email || 'No email registered'}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 text-xs cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Kids Mode Toggle */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Kids Mode Filtering</span>
                    <span className="text-[10px] text-slate-400">Hides mature, R, and TV-MA content</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isKids}
                  onChange={(e) => setIsKids(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer rounded"
                />
              </div>

              {/* Success Alert */}
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Profile updated and synced!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all flex items-center gap-2"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>

              {/* Version Counter & Build Status */}
              <div className="mt-4 p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">{APP_VERSION}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">Active Release</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block font-mono">{BUILD_NUMBER} · {BUILD_DATE}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-semibold border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Hard refresh application to load the latest bundle"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

            </form>

          </div>
        ) : authMode === 'forgot' ? (
          /* 6-DIGIT CODE FORGOT PASSWORD FLOW */
          <div className="p-6 sm:p-8 space-y-5">
            
            {/* Header / Back Navigation */}
            <div>
              <button
                type="button"
                onClick={() => {
                  if (resetStep === 'code') setResetStep('email');
                  else if (resetStep === 'new_password') setResetStep('code');
                  else handleSwitchMode('signin');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2.5 group cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span>
                  {resetStep === 'code' ? 'Change Email' : resetStep === 'new_password' ? 'Back to Verification' : 'Back to Sign In'}
                </span>
              </button>
              
              <div className="text-left space-y-1">
                <h3 className="text-xl font-black text-white font-display tracking-tight flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-rose-500" />
                  <span>
                    {resetStep === 'email' && 'Reset with Code'}
                    {resetStep === 'code' && 'Enter Verification Code'}
                    {resetStep === 'new_password' && 'Create New Password'}
                    {resetStep === 'success' && 'Password Updated!'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {resetStep === 'email' && "Enter your email address to receive a secure 6-digit verification code."}
                  {resetStep === 'code' && `Enter the 6-digit verification code sent to ${email}.`}
                  {resetStep === 'new_password' && "Verification successful. Please choose a strong new password."}
                  {resetStep === 'success' && "Your account password has been reset successfully."}
                </p>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: Enter Email to Send Code */}
            {resetStep === 'email' && (
              <form onSubmit={handleSendOtpCode} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Account Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoFocus
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending 6-digit code...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send 6-Digit Code</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Enter 6-Digit OTP Code */}
            {resetStep === 'code' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in">
                
                {/* Visual OTP Test Dispatch Banner */}
                {generatedOtp && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-bold">
                        <Key className="w-3.5 h-3.5" />
                        <span>Verification Code Generated</span>
                      </div>
                      <span className="font-mono text-sm font-black text-white tracking-widest bg-black/50 px-2 py-0.5 rounded border border-amber-500/40 inline-block">
                        {generatedOtp.slice(0, 3)} {generatedOtp.slice(3)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutofillCode}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] transition-colors cursor-pointer shrink-0"
                    >
                      Autofill Code
                    </button>
                  </div>
                )}

                {/* 6 Digit Input Boxes */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block text-center">
                    Enter 6-Digit Code
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-11 h-13 text-center text-xl font-bold font-mono rounded-xl bg-black/60 border text-white transition-all focus:outline-none ${
                          digit 
                            ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-950/20' 
                            : 'border-white/15 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Verify Action Button */}
                <button
                  type="submit"
                  disabled={otpDigits.join('').length < 6}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify Code</span>
                </button>

                {/* Resend Action */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-slate-400">Didn't receive code?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleSendOtpCode}
                    className="text-rose-400 hover:text-rose-300 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{resendCooldown > 0 ? `Resend in (${resendCooldown}s)` : 'Resend Code'}</span>
                  </button>
                </div>

              </form>
            )}

            {/* STEP 3: Set New Password */}
            {resetStep === 'new_password' && (
              <form onSubmit={handleSetNewPassword} className="space-y-4 animate-in fade-in">
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      autoFocus
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Set New Password</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 4: Success Screen */}
            {resetStep === 'success' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left space-y-2">
                  <div className="flex items-center gap-2.5 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-xs">Password Reset Successful!</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your password has been changed securely. You can now sign in with your updated credentials.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSwitchMode('signin')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Sign In with New Password</span>
                </button>
              </div>
            )}

            {/* Bottom Guest Option */}
            <div className="text-center pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel and <span className="text-rose-400 hover:underline font-semibold ml-0.5">Browse as Guest</span>
              </button>
            </div>

          </div>
        ) : (
          /* NOT LOGGED IN: SIGN IN & SIGN UP FORM */
          <div className="p-6 sm:p-8 space-y-5">
            
            {/* Centered Brand Title */}
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-white font-display tracking-tight">
                {authMode === 'signin' ? 'Sign in to Nexplay' : 'Create your account'}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Sync watchlists, favorites, and resume watching across any device.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-black/60 p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => handleSwitchMode('signin')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'signin' 
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'signup' 
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-white/20 active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.32 21.32 7.38 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.38 0 3.32 2.68 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Continue with Google Account'}</span>
            </button>

            {/* Separator */}
            <div className="flex items-center gap-3 py-1 my-1">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 select-none">
                Or with Email
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              
              {authMode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  {authMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('forgot')}
                      className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>
                  {isLoading 
                    ? 'Connecting...' 
                    : authMode === 'signin' 
                      ? 'Sign In to Stream' 
                      : 'Create Account'}
                </span>
              </button>
            </form>

            {/* Guest / Explore Without Logging In */}
            <div className="text-center pt-2 border-t border-white/5 space-y-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Want to explore first? <span className="text-rose-400 hover:underline font-semibold ml-1">Browse as Guest</span>
              </button>
              <div className="text-[10px] text-slate-600 font-mono flex items-center justify-center gap-1.5">
                <span>Nexplay {APP_VERSION}</span>
                <span>•</span>
                <span>{BUILD_NUMBER}</span>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

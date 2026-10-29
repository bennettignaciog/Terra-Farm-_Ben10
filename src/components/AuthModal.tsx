import React, { useState } from 'react';
import { useGameStore } from '../state/gameStore';
import { 
  googleSignIn, 
  emailSignIn, 
  emailSignUp, 
  guestSignIn, 
  linkGuestToEmail, 
  logout 
} from '../services/firebase';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  LogOut, 
  FolderOpen, 
  ShieldCheck, 
  UserPlus, 
  LogIn,
  RefreshCw,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { getLevelForPoints } from '../config/achievements';

export const AuthModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const openModal = useGameStore((state) => state.openModal);
  const currentUser = useGameStore((state) => state.currentUser);
  const setCurrentUser = useGameStore((state) => state.setCurrentUser);
  const farm = useGameStore((state) => state.farm);
  const isAutoSaveEnabled = useGameStore((state) => state.isAutoSaveEnabled);
  const setIsAutoSaveEnabled = useGameStore((state) => state.setIsAutoSaveEnabled);
  const lastSavedAt = useGameStore((state) => state.lastSavedAt);
  const saveCurrentProgress = useGameStore((state) => state.saveCurrentProgress);
  const showNotification = useGameStore((state) => state.showNotification);

  // Form states
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'guest'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upgrade guest state
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeEmail, setUpgradeEmail] = useState('');
  const [upgradePassword, setUpgradePassword] = useState('');
  const [upgradeName, setUpgradeName] = useState('');

  // Quick save state
  const [isSavingNow, setIsSavingNow] = useState(false);

  if (activeModal !== 'auth') return null;

  const playerLevel = getLevelForPoints(farm.ecoPoints || 0);

  const getCleanErrorMessage = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please verify and try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in instead.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Google sign-in was cancelled before completion.';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not active on this project. You have been connected as an authenticated player session.';
      case 'auth/network-request-failed':
        return 'Network connection failed. Please check your internet connection.';
      default:
        return err?.message || 'Authentication error. Please try again.';
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn(false);
      if (res?.user) {
        setCurrentUser(res.user);
        showNotification(`Welcome back, ${res.user.displayName || 'Farmer'}! 🌱`, 'success');
        try {
          await saveCurrentProgress();
        } catch (_) {}
        closeModal();
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setErrorMessage(getCleanErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (authMode === 'signup') {
        if (password.length < 6) {
          throw { code: 'auth/weak-password' };
        }
        const user = await emailSignUp(email, password, displayName || 'Regenerative Farmer');
        setCurrentUser(user);
        showNotification(`Welcome, ${user.displayName || 'Farmer'}! Account connected & progress saved. 🌱`, 'success');
        try {
          await saveCurrentProgress();
        } catch (_) {}
        closeModal();
      } else {
        const user = await emailSignIn(email, password);
        setCurrentUser(user);
        showNotification(`Signed in as ${user.displayName || user.email}! Progress synced. 🌱`, 'success');
        try {
          await saveCurrentProgress();
        } catch (_) {}
        closeModal();
      }
    } catch (err: any) {
      setErrorMessage(getCleanErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const guestName = displayName.trim() || `Farmer #${Math.floor(1000 + Math.random() * 9000)}`;
      const user = await guestSignIn(guestName);
      setCurrentUser(user);
      showNotification(`Playing as Guest: ${guestName}! Cloud saves enabled. 🌾`, 'success');
      try {
        await saveCurrentProgress();
      } catch (_) {}
      closeModal();
    } catch (err: any) {
      setErrorMessage(getCleanErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upgradeEmail.trim() || !upgradePassword) {
      setErrorMessage('Please provide an email and password to link your account.');
      return;
    }
    if (upgradePassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await linkGuestToEmail(upgradeEmail, upgradePassword, upgradeName);
      setCurrentUser(user);
      setIsUpgrading(false);
      showNotification('Guest account successfully upgraded to permanent account! 🎉', 'success');
    } catch (err: any) {
      setErrorMessage(getCleanErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logout();
      setCurrentUser(null);
      showNotification('Signed out. You can sign in anytime to restore your farm.', 'info');
    } catch (err: any) {
      showNotification('Sign out error: ' + err.message, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSave = async () => {
    setIsSavingNow(true);
    try {
      await saveCurrentProgress();
    } finally {
      setIsSavingNow(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-emerald-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/90 via-stone-900 to-amber-950/70 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shadow-inner shadow-emerald-500/20">
              🌱
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                <span>Farmer Account & Cloud Saves</span>
              </h2>
              <p className="text-xs text-stone-400">
                {currentUser 
                  ? 'Manage your cloud saves, account profile & sync' 
                  : 'Sign in to safely persist and restore your farm progress'}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* ========================================= */}
          {/* USER IS SIGNED IN ALREADY                 */}
          {/* ========================================= */}
          {currentUser ? (
            <div className="space-y-4">
              {/* User Profile Card */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Profile" 
                        className="w-full h-full rounded-xl object-cover" 
                      />
                    ) : (
                      currentUser.displayName?.charAt(0).toUpperCase() || 'F'
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-100 text-sm truncate">
                        {currentUser.displayName || 'Regenerative Farmer'}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase ${
                        currentUser.isAnonymous 
                          ? 'bg-amber-950/80 text-amber-300 border-amber-600/40' 
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {currentUser.isAnonymous ? 'Guest' : 'Cloud Account'}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 font-mono truncate mt-0.5">
                      {currentUser.isAnonymous 
                        ? `ID: ${currentUser.uid.slice(0, 14)}...` 
                        : currentUser.email || 'Email verified'}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1 justify-end">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{(farm.ecoPoints || 0).toLocaleString()} pts</span>
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">
                    {playerLevel.badge} Lvl {playerLevel.level}
                  </div>
                </div>
              </div>

              {/* Save Status & Instant Manual Save Action */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-stone-900 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-stone-200">Cloud Sync Status</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 flex items-center gap-1 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Connected
                  </span>
                </div>

                <div className="text-xs text-stone-400">
                  {lastSavedAt ? (
                    <span>Last saved to Cloud: <span className="font-mono text-stone-200">{new Date(lastSavedAt).toLocaleTimeString()}</span></span>
                  ) : (
                    <span>Save your ongoing farm to snapshot progress and restore anytime.</span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleManualSave}
                    disabled={isSavingNow}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSavingNow ? 'animate-spin' : ''}`} />
                    <span>{isSavingNow ? 'Saving Progress...' : 'Save Current Progress Now'}</span>
                  </button>

                  <button
                    onClick={() => {
                      closeModal();
                      openModal('database');
                    }}
                    className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 font-semibold text-xs flex items-center gap-1.5 border border-stone-700 transition-colors"
                    title="View and restore cloud saves"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-stone-400" />
                    <span>Manage Saves</span>
                  </button>
                </div>
              </div>

              {/* Auto-Save Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950/60 border border-stone-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-stone-200">Auto-Save every season</div>
                    <div className="text-[10px] text-stone-500">Automatically backup farm snapshot at Day 90 transition</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsAutoSaveEnabled(!isAutoSaveEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    isAutoSaveEnabled ? 'bg-emerald-600' : 'bg-stone-800'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isAutoSaveEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Upgrade Guest Account Section (If Anonymous) */}
              {currentUser.isAnonymous && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold">Upgrade to Permanent Account</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    You are currently playing as a guest. Link an email & password so you never lose your progress even if you clear your browser cache.
                  </p>

                  {!isUpgrading ? (
                    <button
                      onClick={() => setIsUpgrading(true)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Link Email & Password</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <form onSubmit={handleUpgradeGuest} className="space-y-2.5 pt-1">
                      <div>
                        <input
                          type="text"
                          placeholder="Farmer Display Name"
                          value={upgradeName}
                          onChange={(e) => setUpgradeName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          required
                          placeholder="Email address"
                          value={upgradeEmail}
                          onChange={(e) => setUpgradeEmail(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          required
                          placeholder="Create password (min 6 chars)"
                          value={upgradePassword}
                          onChange={(e) => setUpgradePassword(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Linking...' : 'Save & Link Account'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsUpgrading(false)}
                          className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs hover:bg-stone-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Sign Out Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-xl text-stone-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* ========================================= */
            /* USER IS NOT SIGNED IN: SHOW LOGIN/SIGNUP  */
            /* ========================================= */
            <div className="space-y-4">
              {/* 1. Fast Google 1-Click Button */}
              <div>
                <button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px bg-stone-800 flex-1" />
                <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Or use email</span>
                <div className="h-px bg-stone-800 flex-1" />
              </div>

              {/* Mode Switcher Tabs: Sign In vs Create Account */}
              <div className="flex p-1 rounded-xl bg-stone-950 border border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'signin'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'signup'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1 font-medium">
                      Farmer Display Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Maria the Permaculturist"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-600 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="farmer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-600 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 font-medium">
                    Password {authMode === 'signup' && <span className="text-[10px] text-stone-500">(minimum 6 characters)</span>}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 text-xs rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-600 focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/60 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : authMode === 'signup' ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Register & Start Saving</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Account</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 pt-1">
                <div className="h-px bg-stone-800 flex-1" />
                <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Or instant play</span>
                <div className="h-px bg-stone-800 flex-1" />
              </div>

              {/* 3. 1-Click Guest Access Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-950 to-emerald-950/30 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span>🌾 Play as Guest</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-200 border border-amber-500/40">1-Click</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    No credentials needed. Saves immediately to the cloud.
                  </div>
                </div>

                <button
                  onClick={handleGuestAuth}
                  disabled={isLoading}
                  className="py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shrink-0 transition-colors active:scale-95 disabled:opacity-50"
                >
                  Play Guest
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-stone-500 font-mono text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Firestore Zero-Trust Rules & Encryption</span>
          </span>
          <button
            onClick={closeModal}
            className="px-3 py-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Dice5,
  Shield,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { sound } from '../utils/audio';
import {
  checkUsernameAvailability,
  generateRandomAvatar,
  AVATAR_STYLES,
} from '../lib/firestoreService';

export const UsernameOnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    pendingWalletAddress,
    completeOnboarding,
    disconnectWallet,
  } = useApp();

  const [usernameInput, setUsernameInput] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [availability, setAvailability] = useState<{ available: boolean; reason?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize initial avatar when onboarding modal opens
  useEffect(() => {
    if (isOnboardingOpen && pendingWalletAddress) {
      setSelectedAvatar(generateRandomAvatar(pendingWalletAddress));
      setUsernameInput('');
      setAvailability(null);
      setIsSubmitting(false);
    }
  }, [isOnboardingOpen, pendingWalletAddress]);

  // Real-time username availability check (debounced)
  useEffect(() => {
    const trimmed = usernameInput.trim();
    if (!trimmed) {
      setAvailability(null);
      setIsChecking(false);
      return;
    }

    if (trimmed.length < 3) {
      setAvailability({ available: false, reason: 'Must be at least 3 characters' });
      setIsChecking(false);
      return;
    }

    if (trimmed.length > 20) {
      setAvailability({ available: false, reason: 'Cannot exceed 20 characters' });
      setIsChecking(false);
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setAvailability({
        available: false,
        reason: 'Only letters, numbers, hyphens and underscores allowed',
      });
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    const timer = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(trimmed, pendingWalletAddress || '');
        setAvailability(result);
      } catch {
        setAvailability({ available: true });
      } finally {
        setIsChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [usernameInput, pendingWalletAddress]);

  if (!isOnboardingOpen || !pendingWalletAddress) return null;

  const handleRollAvatar = () => {
    sound.playClick();
    const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
    const seed = `player_${Math.random().toString(36).substring(2, 10)}`;
    setSelectedAvatar(`https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`);
  };

  const handlePresetAvatar = (style: string) => {
    sound.playClick();
    setSelectedAvatar(`https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(pendingWalletAddress)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!availability?.available || isSubmitting || isChecking) return;

    sound.playClick();
    setIsSubmitting(true);
    try {
      await completeOnboarding(usernameInput.trim(), selectedAvatar);
    } catch (err) {
      console.error('Onboarding failed:', err);
      setIsSubmitting(false);
    }
  };

  const displayAddr = pendingWalletAddress
    ? `${pendingWalletAddress.slice(0, 6)}...${pendingWalletAddress.slice(-4)}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#080808] border-2 border-[#CCFF00] p-6 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#CCFF00] text-black flex items-center justify-center font-black text-xl shrink-0">
              X
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#CCFF00] font-mono block">
                First-Time Setup
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-display">
                Create Contender Profile
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              disconnectWallet();
            }}
            title="Disconnect Wallet"
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-black border border-white/10 hover:border-red-500/50 text-white/50 hover:text-red-400 text-[10px] font-mono uppercase transition shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cancel</span>
          </button>
        </div>

        {/* Connected Wallet Lock Info */}
        <div className="p-3 bg-black border border-white/15 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center space-x-2.5 min-w-0">
            <Shield className="w-4 h-4 text-[#CCFF00] shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] text-white/40 uppercase block font-bold">Connected Wallet</span>
              <span className="text-white font-bold truncate block">{displayAddr}</span>
            </div>
          </div>
          <span className="text-[9px] px-2 py-0.5 bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30 font-bold uppercase shrink-0">
            X Layer L2
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selector */}
          <div className="space-y-3">
            <label className="text-[11px] font-mono font-bold uppercase text-white/60 block">
              1. Choose Arena Avatar
            </label>
            <div className="flex items-center space-x-4 bg-black border border-white/10 p-3.5">
              <img
                src={selectedAvatar}
                alt="Selected Avatar"
                className="w-16 h-16 object-cover border-2 border-[#CCFF00] bg-[#0A0A0A] shrink-0"
              />
              <div className="space-y-2 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={handleRollAvatar}
                  className="w-full py-2 px-3 bg-[#0A0A0A] hover:bg-white/10 border border-white/20 text-white font-mono text-xs font-bold uppercase flex items-center justify-center space-x-2 transition"
                >
                  <Dice5 className="w-4 h-4 text-[#CCFF00]" />
                  <span>Roll Random Avatar</span>
                </button>

                {/* Preset Style Swatches */}
                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-1">
                  {AVATAR_STYLES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handlePresetAvatar(style)}
                      className="text-[9px] px-2 py-1 bg-black border border-white/10 hover:border-[#CCFF00] text-white/60 hover:text-white font-mono uppercase truncate"
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-bold uppercase text-white/60">
                2. Unique Contender Handle
              </label>
              <span className="text-[10px] text-white/40 font-mono">
                {usernameInput.length}/20 chars
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="e.g. SatoshiKnight, Valkyrie_99"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value.replace(/\s+/g, ''))}
                maxLength={20}
                required
                className={`w-full bg-black border px-3.5 py-3 text-sm text-white font-mono placeholder-white/30 focus:outline-none transition ${
                  availability?.available
                    ? 'border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]'
                    : availability?.available === false
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-white/20 focus:border-white'
                }`}
              />

              {/* Status Indicator */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                {isChecking && (
                  <div className="w-4 h-4 border-2 border-[#CCFF00] border-t-transparent animate-spin" />
                )}
                {!isChecking && availability?.available && (
                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />
                )}
                {!isChecking && availability?.available === false && (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>

            {/* Validation Message */}
            {availability && !isChecking && (
              <p
                className={`text-xs font-mono font-bold ${
                  availability.available ? 'text-[#CCFF00]' : 'text-red-400'
                }`}
              >
                {availability.available
                  ? '✓ Handle is available & verified unique'
                  : `✕ ${availability.reason}`}
              </p>
            )}
            {!availability && !isChecking && (
              <p className="text-[10px] text-white/40 font-mono">
                Letters, numbers, underscores and hyphens (3-20 characters).
              </p>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!availability?.available || isSubmitting || isChecking}
              className="w-full py-4 bg-[#CCFF00] hover:bg-white text-black font-black text-xs sm:text-sm uppercase tracking-tight transition flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-[#CCFF00]/10"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin" />
                  <span>Registering Profile in Central DB...</span>
                </div>
              ) : (
                <>
                  <span>Complete Onboarding & Enter Arena</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

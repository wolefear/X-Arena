import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Wallet,
  Trophy,
  Award,
  Sparkles,
  Flame,
  Zap,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Layers,
  Edit2,
  Check,
  RefreshCw,
  Copy,
  Dice5,
  X,
  Lock,
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { getTierColor } from '../../utils/elo';
import { checkUsernameAvailability, generateRandomAvatar } from '../../lib/firestoreService';

export const ProfileView: React.FC = () => {
  const {
    user,
    setUser,
    matchHistory,
    achievements,
    transactions,
    claimAchievementReward,
    claimFaucet,
    showToast,
    isConnected,
    setIsWalletModalOpen,
    updateUserIdentity,
    setCurrentView,
  } = useApp();

  // Profile Identity Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editUsername, setEditUsername] = useState<string>(user.username);
  const [editAvatar, setEditAvatar] = useState<string>(user.avatar);
  const [editBio, setEditBio] = useState<string>(user.bio || '');
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean;
    message: string;
    checked: boolean;
  }>({
    available: true,
    message: 'Current handle',
    checked: true,
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);

  // Profile Tab State
  const [profileTab, setProfileTab] = useState<'matches' | 'achievements' | 'transactions'>('matches');

  // Synchronize modal state when opened
  const openEditModal = () => {
    setEditUsername(user.username);
    setEditAvatar(user.avatar);
    setEditBio(user.bio || '');
    setUsernameStatus({
      available: true,
      message: 'Current handle',
      checked: true,
    });
    setIsEditModalOpen(true);
    sound.playClick();
  };

  // Debounced username availability checker
  useEffect(() => {
    if (!isEditModalOpen) return;

    const trimmed = editUsername.trim();
    if (!trimmed) {
      setUsernameStatus({
        available: false,
        message: 'Username cannot be empty.',
        checked: true,
      });
      return;
    }

    if (trimmed.toLowerCase() === user.username.toLowerCase()) {
      setUsernameStatus({
        available: true,
        message: 'Your current username.',
        checked: true,
      });
      return;
    }

    if (trimmed.length < 3) {
      setUsernameStatus({
        available: false,
        message: 'Username must be at least 3 characters.',
        checked: true,
      });
      return;
    }

    if (trimmed.length > 24) {
      setUsernameStatus({
        available: false,
        message: 'Username cannot exceed 24 characters.',
        checked: true,
      });
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setUsernameStatus({
        available: false,
        message: 'Only letters, numbers, underscores, and hyphens are allowed.',
        checked: true,
      });
      return;
    }

    setIsCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability(trimmed, user.walletAddress);
        setUsernameStatus({
          available: res.available,
          message: res.available ? 'Username is available!' : (res.reason || 'Username is unavailable.'),
          checked: true,
        });
      } catch (err) {
        setUsernameStatus({
          available: false,
          message: 'Error verifying handle availability.',
          checked: true,
        });
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [editUsername, isEditModalOpen, user.username, user.walletAddress]);

  // Roll new random avatar
  const handleRollAvatar = () => {
    sound.playClick();
    const newAvatar = generateRandomAvatar();
    setEditAvatar(newAvatar);
  };

  // Save changes to database and local state
  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameStatus.available && editUsername.trim().toLowerCase() !== user.username.toLowerCase()) {
      showToast('Please choose an available username first.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateUserIdentity(editUsername, editAvatar, editBio);
      if (res.success) {
        sound.playVictory();
        showToast('Identity & avatar updated and saved to database!', 'success');
        setIsEditModalOpen(false);
      } else {
        showToast(res.error || 'Failed to update username.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error saving profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const copyWalletToClipboard = () => {
    if (!user.walletAddress) return;
    navigator.clipboard?.writeText(user.walletAddress);
    setCopiedWallet(true);
    sound.playClick();
    showToast('Wallet address copied to clipboard!', 'info');
    setTimeout(() => setCopiedWallet(false), 2500);
  };

  const formatShortAddress = (addr?: string) => {
    if (!addr) return 'Not Connected';
    if (addr.length < 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-16 w-full max-w-full overflow-hidden">
      {/* Wallet Connection Status Alert if Disconnected */}
      {!isConnected && (
        <div className="border border-[#CCFF00]/40 bg-[#CCFF00]/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-mono font-black uppercase text-[#CCFF00] tracking-widest block">
              Wallet Disconnected
            </span>
            <p className="text-xs text-white/80 font-mono leading-relaxed">
              Connect your Web3 wallet on X Layer to link your on-chain account, sync real token balances, and record rated match history.
            </p>
          </div>
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="px-5 py-2.5 bg-[#CCFF00] hover:bg-white text-black font-black text-xs uppercase tracking-tight font-mono shrink-0 transition self-start sm:self-auto"
          >
            Connect Wallet &rarr;
          </button>
        </div>
      )}

      {/* Profile Top Banner — Full Responsive Mobile-First */}
      <div className="border border-white/10 bg-[#0A0A0A] p-4 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Avatar & Identifiers */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 min-w-0">
            <div className="relative shrink-0 group">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-18 h-18 sm:w-24 sm:h-24 object-cover border-2 border-white/20 shadow-xl bg-black"
              />
              <button
                onClick={openEditModal}
                title="Change Avatar & Username"
                className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-[#CCFF00] hover:bg-white text-black font-bold border-2 border-black transition shadow-lg"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 min-w-0 w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight font-display break-words">
                  {user.username}
                </h1>
                {user.isAdmin && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#CCFF00] text-black font-mono">
                    Admin
                  </span>
                )}
                <button
                  onClick={openEditModal}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/15 text-[10px] font-mono font-bold uppercase transition flex items-center space-x-1"
                >
                  <Edit2 className="w-3 h-3 text-[#CCFF00]" />
                  <span>Edit Identity</span>
                </button>
              </div>

              {/* Wallet Address with clean truncation and copy button */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 font-mono">
                <span className="text-white/80 font-bold">
                  {formatShortAddress(user.walletAddress)}
                </span>
                {user.walletAddress && (
                  <button
                    onClick={copyWalletToClipboard}
                    className="p-1 text-white/40 hover:text-[#CCFF00] transition"
                    title="Copy full wallet address"
                  >
                    {copiedWallet ? <Check className="w-3 h-3 text-[#CCFF00]" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
                <span className="text-[9px] px-1.5 py-0.5 bg-white/10 text-[#CCFF00] border border-white/10 font-bold uppercase">
                  X Layer zkEVM
                </span>
              </div>

              {/* Balances */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 text-xs font-mono">
                <span className="text-white/70">
                  Balance: <strong className="text-[#CCFF00] font-black font-mono">{user.balanceUsdc.toFixed(2)} USDC</strong>
                </span>
                <span className="text-white/50">
                  Gas: <strong className="text-white font-mono">{user.balanceOkb.toFixed(4)} OKB</strong>
                </span>
              </div>

              {user.bio && (
                <p className="text-xs text-white/60 italic font-mono pt-1 max-w-lg break-words">
                  "{user.bio}"
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0">
            <button
              onClick={openEditModal}
              className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-[#CCFF00] text-black text-xs font-mono font-black uppercase tracking-tight transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customize Profile & PFP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ratings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Chess Card */}
        <div className="border border-white/10 bg-[#0A0A0A] p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">♟️</span>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight font-display">
                  Chess Masters Rating
                </h3>
                <span className="text-[10px] text-white/40 uppercase font-mono">Ranked Elo Model</span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-white/10 text-white font-mono border border-white/15">
              {user.chessTier}
            </span>
          </div>

          <div className="flex items-baseline space-x-2 font-mono">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {user.chessRating} <span className="text-sm text-[#CCFF00]">XP</span>
            </span>
            <span className="text-xs text-white/40 font-mono">Peak: {user.chessPeakRating || user.chessRating} XP</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
            <div className="bg-black p-2.5 sm:p-3 border border-white/5">
              <span className="text-white/40 text-[10px] uppercase block">Record</span>
              <span className="font-bold text-white text-xs sm:text-sm">
                {user.chessStats?.wins || 0}W - {user.chessStats?.losses || 0}L
              </span>
            </div>
            <div className="bg-black p-2.5 sm:p-3 border border-white/5">
              <span className="text-white/40 text-[10px] uppercase block">Streak</span>
              <span className="font-bold text-[#CCFF00] text-xs sm:text-sm">
                {user.chessStats?.streak || 0} 🔥
              </span>
            </div>
            <div className="bg-black p-2.5 sm:p-3 border border-white/5">
              <span className="text-white/40 text-[10px] uppercase block">Draws</span>
              <span className="font-bold text-white/70 text-xs sm:text-sm">
                {user.chessStats?.draws || 0}
              </span>
            </div>
          </div>
        </div>

        {/* 2048 Card */}
        <div className="border border-white/10 bg-[#0A0A0A] p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight font-display">
                  2048 Velocity Rating
                </h3>
                <span className="text-[10px] text-white/40 uppercase font-mono">Ranked Velocity Model</span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-white/10 text-white font-mono border border-white/15">
              {user.tier2048}
            </span>
          </div>

          <div className="flex items-baseline space-x-2 font-mono">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {user.score2048Rating} <span className="text-sm text-[#CCFF00]">XP</span>
            </span>
            <span className="text-xs text-white/40 font-mono">Best: {user.bestScore2048 || 0}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
            <div className="bg-black p-2.5 sm:p-3 border border-white/5">
              <span className="text-white/40 text-[10px] uppercase block">Max Tile</span>
              <span className="font-bold text-[#CCFF00] text-xs sm:text-sm">
                {user.stats2048?.highestTile || 0}
              </span>
            </div>
            <div className="bg-black p-2.5 sm:p-3 border border-white/5">
              <span className="text-white/40 text-[10px] uppercase block">Runs Done</span>
              <span className="font-bold text-white text-xs sm:text-sm">
                {user.stats2048?.gamesPlayed || 0}
              </span>
            </div>
            <div className="bg-black p-2.5 sm:p-3 border border-white/5">
              <span className="text-white/40 text-[10px] uppercase block">Win Rate</span>
              <span className="font-bold text-white text-xs sm:text-sm">
                {user.stats2048?.gamesPlayed ? `${Math.round(((user.stats2048.wins2048 || 0) / user.stats2048.gamesPlayed) * 100)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Match History / Achievements / Transactions */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => {
              sound.playClick();
              setProfileTab('matches');
            }}
            className={`px-3 sm:px-4 py-2 text-xs font-mono font-bold uppercase transition ${
              profileTab === 'matches'
                ? 'bg-white text-black'
                : 'bg-black text-white/50 hover:text-white border border-white/10'
            }`}
          >
            ⚔️ Match History ({matchHistory.length})
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setProfileTab('achievements');
            }}
            className={`px-3 sm:px-4 py-2 text-xs font-mono font-bold uppercase transition ${
              profileTab === 'achievements'
                ? 'bg-white text-black'
                : 'bg-black text-white/50 hover:text-white border border-white/10'
            }`}
          >
            🏆 Achievements ({achievements.filter((a) => user.achievements?.includes(a.id)).length}/{achievements.length})
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setProfileTab('transactions');
            }}
            className={`px-3 sm:px-4 py-2 text-xs font-mono font-bold uppercase transition ${
              profileTab === 'transactions'
                ? 'bg-white text-black'
                : 'bg-black text-white/50 hover:text-white border border-white/10'
            }`}
          >
            ⛓️ X Layer Transactions ({transactions.length})
          </button>
        </div>

        {/* Tab 1: Match History */}
        {profileTab === 'matches' && (
          <div className="border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-xl">
            {matchHistory.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-10 h-10 bg-black border border-white/15 mx-auto flex items-center justify-center text-[#CCFF00]">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold uppercase text-white font-display">No Match Records Yet</h4>
                <p className="text-xs text-white/50 max-w-sm mx-auto font-mono">
                  You haven't played any rated matches yet. Enter Ranked Chess or 2048 to log your on-chain battle history!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setCurrentView('ranked')}
                    className="px-4 py-2 bg-[#CCFF00] hover:bg-white text-black text-xs font-bold font-mono uppercase transition"
                  >
                    Play Ranked Match &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-xs font-mono">
                  <thead className="bg-black text-white/40 uppercase text-[10px] border-b border-white/10">
                    <tr>
                      <th className="p-4">Game & Mode</th>
                      <th className="p-4">Opponent / Target</th>
                      <th className="p-4">Result</th>
                      <th className="p-4 text-right">XP Δ</th>
                      <th className="p-4 text-right">Moves / Score</th>
                      <th className="p-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {matchHistory.map((m) => (
                      <tr key={m.id} className="hover:bg-white/5 transition">
                        <td className="p-4 font-bold text-white flex items-center space-x-2">
                          <span>{m.game === 'chess' ? '♟️ Chess' : '⚡ 2048'}</span>
                          <span className="text-[10px] text-[#CCFF00] uppercase bg-black px-2 py-0.5 border border-white/10">
                            {m.mode}
                          </span>
                        </td>
                        <td className="p-4 text-white/80">{m.opponentName}</td>
                        <td className="p-4">
                          <span
                            className={`font-mono font-bold uppercase text-[10px] px-2 py-0.5 ${
                              m.result === 'win'
                                ? 'bg-[#CCFF00] text-black font-black'
                                : m.result === 'loss'
                                ? 'bg-red-900/40 text-red-300 border border-red-500/30'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            {m.result}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-xs">
                          <span className={m.ratingDelta >= 0 ? 'text-[#CCFF00]' : 'text-red-400'}>
                            {m.ratingDelta >= 0 ? `+${m.ratingDelta} XP` : `${m.ratingDelta} XP`}
                          </span>
                        </td>
                        <td className="p-4 text-right text-white/80">
                          {m.game === '2048' ? `Score: ${m.playerScore || 0}` : `${m.movesCount} Moves`}
                        </td>
                        <td className="p-4 text-right text-white/40 text-[10px]">
                          {m.date || 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Achievements */}
        {profileTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((ach) => {
              const isUnlocked = user.achievements?.includes(ach.id);
              const iconEmoji =
                ach.icon === 'Crown' ? '👑' :
                ach.icon === 'Sword' ? '⚔️' :
                ach.icon === 'Bot' ? '🤖' :
                ach.icon === 'Sparkles' ? '✨' :
                ach.icon === 'Zap' ? '⚡' :
                ach.icon === 'Trophy' ? '🏆' :
                ach.icon === 'Coins' ? '🪙' : '🎯';

              return (
                <div
                  key={ach.id}
                  className={`p-5 sm:p-6 border space-y-4 flex flex-col justify-between transition ${
                    isUnlocked
                      ? 'bg-[#0A0A0A] border-[#CCFF00]/50 shadow-lg shadow-[#CCFF00]/5'
                      : 'bg-black border-white/10 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{iconEmoji}</span>
                      {isUnlocked ? (
                        <span className="text-[10px] font-mono font-bold text-black bg-[#CCFF00] px-2 py-0.5 uppercase flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>UNLOCKED</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-white/40 uppercase">IN PROGRESS</span>
                      )}
                    </div>
                    <h4 className="text-base font-black text-white uppercase tracking-tight font-display">
                      {ach.title}
                    </h4>
                    <p className="text-xs text-white/60 leading-relaxed">{ach.description}</p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#CCFF00] font-black">+${ach.rewardUsdc} USDC</span>
                    {isUnlocked ? (
                      <span className="text-[#CCFF00] text-[11px] font-bold uppercase flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>CLAIMED</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => claimAchievementReward(ach.id)}
                        className="px-3.5 py-1.5 bg-[#CCFF00] text-black font-black text-xs uppercase tracking-tight hover:bg-white transition"
                      >
                        Unlock ({ach.xp} XP)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Transactions */}
        {profileTab === 'transactions' && (
          <div className="border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-xl">
            {transactions.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-10 h-10 bg-black border border-white/15 mx-auto flex items-center justify-center text-[#CCFF00]">
                  <Wallet className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold uppercase text-white font-display">No Transactions Yet</h4>
                <p className="text-xs text-white/50 max-w-sm mx-auto font-mono">
                  No on-chain deposits, gas faucets, or tournament claims logged for this session yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-black text-white/40 uppercase text-[10px] border-b border-white/10">
                    <tr>
                      <th className="p-4">Type & Action</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">X Layer Tx Hash</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((tx) => {
                      const txDisplayHash = (tx.hash || tx.txHash || tx.id || '0x').slice(0, 14);
                      const txType = (tx.type || 'TRANSACTION').replace(/_/g, ' ');

                      return (
                        <tr key={tx.id} className="hover:bg-white/5 transition">
                          <td className="p-4 font-bold text-white uppercase">{txType}</td>
                          <td className="p-4 font-bold text-[#CCFF00]">
                            {tx.amountUsdc > 0 ? `${tx.amountUsdc} USDC` : `${tx.amountOkb || 0} OKB`}
                          </td>
                          <td className="p-4 text-white/80 hover:text-[#CCFF00] cursor-pointer flex items-center space-x-1">
                            <span>{txDisplayHash}...</span>
                            <ExternalLink className="w-3 h-3" />
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] uppercase text-[#CCFF00] bg-black px-2 py-0.5 border border-[#CCFF00]/40">
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-4 text-right text-white/40 text-[10px]">
                            {tx.timestamp || 'Recent'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile & Avatar Customizer Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-white/20 w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#CCFF00] uppercase tracking-widest font-bold block">
                  Identity Customizer
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">
                  Edit Contender Profile
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-white/40 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIdentity} className="space-y-6">
              {/* Avatar Section */}
              <div className="space-y-3">
                <label className="text-xs font-mono font-bold text-white/70 uppercase block">
                  Profile Picture (PFP)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-black border border-white/10 p-4">
                  <div className="relative shrink-0">
                    <img
                      src={editAvatar}
                      alt="Avatar Preview"
                      className="w-20 h-20 object-cover border-2 border-[#CCFF00] shadow-lg bg-zinc-900"
                    />
                  </div>
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <button
                      type="button"
                      onClick={handleRollAvatar}
                      className="px-4 py-2 bg-white hover:bg-[#CCFF00] text-black font-black text-xs uppercase font-mono flex items-center justify-center space-x-2 w-full sm:w-auto transition shadow"
                    >
                      <Dice5 className="w-4 h-4" />
                      <span>🎲 Roll New Web3 PFP</span>
                    </button>
                    <p className="text-[10px] text-white/40 font-mono">
                      Generates unique on-chain algorithmic pixel, bot, and vector art.
                    </p>
                  </div>
                </div>

                {/* Custom Avatar URL input */}
                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                    Or Enter Custom Image URL
                  </label>
                  <input
                    type="url"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-black border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
              </div>

              {/* Username Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-white/70 uppercase block">
                    Choose Contender Handle
                  </label>
                  <span className="text-[10px] text-white/40 font-mono">
                    {editUsername.length}/24 chars
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    maxLength={24}
                    placeholder="e.g. SatoshiSlayer, GrandMaster_01"
                    className={`w-full bg-black border px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none transition ${
                      usernameStatus.available && editUsername.trim()
                        ? 'border-[#CCFF00] focus:border-[#CCFF00]'
                        : !usernameStatus.available
                        ? 'border-red-500/60 focus:border-red-500'
                        : 'border-white/20 focus:border-white'
                    }`}
                  />
                  <div className="absolute right-3 top-3">
                    {isCheckingUsername ? (
                      <RefreshCw className="w-4 h-4 text-[#CCFF00] animate-spin" />
                    ) : usernameStatus.available && editUsername.trim().length >= 3 ? (
                      <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />
                    ) : !usernameStatus.available ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : null}
                  </div>
                </div>

                {/* Live Availability Status Message */}
                <div
                  className={`text-[11px] font-mono flex items-center space-x-1.5 pt-0.5 ${
                    usernameStatus.available
                      ? 'text-[#CCFF00]'
                      : 'text-red-400'
                  }`}
                >
                  <span>{usernameStatus.message}</span>
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-white/70 uppercase block">
                  Bio / Battle Motto
                </label>
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={100}
                  placeholder="e.g. Climbing to Grandmaster on X Layer."
                  className="w-full bg-black border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 bg-black border border-white/20 text-white/70 hover:text-white text-xs font-mono uppercase font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isCheckingUsername || (!usernameStatus.available && editUsername.trim().toLowerCase() !== user.username.toLowerCase())}
                  className="px-6 py-2.5 bg-[#CCFF00] hover:bg-white text-black font-black text-xs font-mono uppercase tracking-tight transition disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Lock Identity</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

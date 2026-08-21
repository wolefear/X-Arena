import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  AIAgent,
  ArenaEvent,
  Challenge,
  LeaderboardEntry,
  Achievement,
  MatchRecord,
  Web3Transaction,
  GameType,
  GameMode,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_AI_AGENTS,
  INITIAL_EVENTS,
  INITIAL_CHALLENGES,
  INITIAL_LEADERBOARD,
  INITIAL_ACHIEVEMENTS,
  INITIAL_MATCH_HISTORY,
  INITIAL_TRANSACTIONS,
} from '../data/mockData';
import { sound } from '../utils/audio';
import { getChessTier } from '../utils/elo';
import { fetchOnChainBalances } from '../utils/web3OnChain';
import { connectInjectedWeb3Wallet } from '../utils/walletConnector';
import {
  subscribeLiveEvents,
  saveLiveEvent,
  saveMatchRecord as saveFirestoreMatchRecord,
  subscribeUserMatches,
  saveUserProfile,
  fetchUserProfile,
  subscribeLeaderboard,
  updateLeaderboardScore,
  generateRandomAvatar,
  claimUsername,
} from '../lib/firestoreService';

export const OWNER_ADMIN_WALLET = '0xeDf63F61FfD9B8dABEb1179F3Cd4D2968C6003Be';

export interface ForfeitModalState {
  isOpen: boolean;
  targetView: string | null;
  xpPenalty: number;
  isRanked: boolean;
  onConfirmCallback?: () => void;
}

export interface GameSessionState {
  isActive: boolean;
  game: GameType | null;
  mode: GameMode;
  movesCount: number;
  isGameOver: boolean;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  isConnected: boolean;
  isAdmin: boolean;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;
  connectWallet: (walletName: string, customAddress?: string) => Promise<void>;
  disconnectWallet: () => void;
  claimFaucet: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  requestNavigate: (view: string) => void;
  selectedGame: GameType;
  setSelectedGame: (game: GameType) => void;
  activeMode: GameMode;
  setActiveMode: (mode: GameMode) => void;
  gameDifficulty: 'easy' | 'medium' | 'hard' | 'master';
  setGameDifficulty: (diff: 'easy' | 'medium' | 'hard' | 'master') => void;
  aiAgents: AIAgent[];
  setAiAgents: React.Dispatch<React.SetStateAction<AIAgent[]>>;
  events: ArenaEvent[];
  setEvents: React.Dispatch<React.SetStateAction<ArenaEvent[]>>;
  challenges: Challenge[];
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
  leaderboard: LeaderboardEntry[];
  achievements: Achievement[];
  matchHistory: MatchRecord[];
  transactions: Web3Transaction[];
  soundMuted: boolean;
  toggleSound: () => void;
  toasts: Toast[];
  toast?: Toast;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  activeEventToPlay: ArenaEvent | null;
  setActiveEventToPlay: (evt: ArenaEvent | null) => void;
  activeChallengeToPlay: Challenge | null;
  setActiveChallengeToPlay: (chal: Challenge | null) => void;
  activeAiOpponent: AIAgent | null;
  setActiveAiOpponent: (ai: AIAgent | null) => void;
  addMatchRecord: (record: Omit<MatchRecord, 'id' | 'date'>) => void;
  joinEvent: (eventId: string) => boolean;
  completeChallenge: (challengeId: string) => void;
  claimAchievementReward: (achievementId: string) => void;
  createEvent: (newEvent: Partial<ArenaEvent>) => void;
  startMatchWithAi: (ai: AIAgent, game?: GameType, mode?: GameMode) => void;
  startQuickMatch: (game?: GameType, opponentName?: string, opponentRating?: number) => void;
  gameSession: GameSessionState;
  setGameSession: React.Dispatch<React.SetStateAction<GameSessionState>>;
  forfeitModalState: ForfeitModalState;
  promptForfeit: (targetView: string | null, customCallback?: () => void) => void;
  confirmForfeitAndLeave: () => void;
  cancelForfeit: () => void;
  updateUserIdentity: (newUsername: string, newAvatar: string, newBio?: string) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('xarena_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [isConnected, setIsConnected] = useState<boolean>(() => {
    const savedConnected = localStorage.getItem('xarena_connected');
    return savedConnected === 'true';
  });

  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedGame, setSelectedGame] = useState<GameType>('chess');
  const [activeMode, setActiveMode] = useState<GameMode>('play');
  const [gameDifficulty, setGameDifficulty] = useState<'easy' | 'medium' | 'hard' | 'master'>('medium');

  // Active game session state for navigation guards
  const [gameSession, setGameSession] = useState<GameSessionState>({
    isActive: false,
    game: null,
    mode: 'play',
    movesCount: 0,
    isGameOver: false,
  });

  const [forfeitModalState, setForfeitModalState] = useState<ForfeitModalState>({
    isOpen: false,
    targetView: null,
    xpPenalty: 50,
    isRanked: false,
  });
  
  const [aiAgents, setAiAgents] = useState<AIAgent[]>(INITIAL_AI_AGENTS);
  const [events, setEvents] = useState<ArenaEvent[]>(INITIAL_EVENTS);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>(INITIAL_MATCH_HISTORY);
  const [transactions, setTransactions] = useState<Web3Transaction[]>(INITIAL_TRANSACTIONS);
  
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [activeEventToPlay, setActiveEventToPlay] = useState<ArenaEvent | null>(null);
  const [activeChallengeToPlay, setActiveChallengeToPlay] = useState<Challenge | null>(null);
  const [activeAiOpponent, setActiveAiOpponent] = useState<AIAgent | null>(null);

  // Dynamic Admin verification: ONLY true if connected AND address matches OWNER_ADMIN_WALLET
  const isOwnerAdmin = Boolean(
    isConnected &&
      user.walletAddress &&
      user.walletAddress.trim().toLowerCase() === OWNER_ADMIN_WALLET.toLowerCase()
  );

  // Real-time Firestore synchronization for Events (Admin creations/deletions reflect immediately)
  useEffect(() => {
    const unsubscribe = subscribeLiveEvents((liveEvents) => {
      setEvents(liveEvents || []);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore synchronization for Leaderboard
  useEffect(() => {
    const unsubscribe = subscribeLeaderboard((liveLeaderboard) => {
      if (liveLeaderboard && liveLeaderboard.length > 0) {
        setLeaderboard(liveLeaderboard);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore synchronization for User Match History
  useEffect(() => {
    if (!user.walletAddress) {
      setMatchHistory([]);
      return;
    }
    const unsubscribe = subscribeUserMatches(user.walletAddress, (records) => {
      setMatchHistory(records || []);
    });
    return () => unsubscribe();
  }, [user.walletAddress]);

  // Sync and persist user session state
  useEffect(() => {
    // Keep user.isAdmin strictly synchronized with owner wallet check
    if (user.isAdmin !== isOwnerAdmin) {
      setUser((prev) => ({ ...prev, isAdmin: isOwnerAdmin }));
    }
    localStorage.setItem('xarena_user', JSON.stringify({ ...user, isAdmin: isOwnerAdmin }));
    localStorage.setItem('xarena_connected', isConnected ? 'true' : 'false');
    
    // Save to Firestore when connected
    if (isConnected && user.walletAddress) {
      saveUserProfile({ ...user, isAdmin: isOwnerAdmin });
    }
  }, [user, isConnected, isOwnerAdmin]);

  // Real on-chain balance synchronization hook
  useEffect(() => {
    if (!isConnected || !user.walletAddress || !user.walletAddress.startsWith('0x')) return;

    let isMounted = true;
    const syncBalances = async () => {
      try {
        const onChain = await fetchOnChainBalances(user.walletAddress);
        if (isMounted && onChain.isLive) {
          setUser((prev) => ({
            ...prev,
            balanceOkb: onChain.okb,
            balanceUsdc: onChain.usdc > 0 ? onChain.usdc : prev.balanceUsdc,
          }));
        }
      } catch (err) {
        console.warn('Background on-chain balance sync error:', err);
      }
    };

    syncBalances();
    const interval = setInterval(syncBalances, 25000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isConnected, user.walletAddress]);

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sound.setMuted(next);
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Safe Web3 Connection with MetaMask, OKX, WalletConnect & Owner Fast-Connect
  const connectWallet = async (walletName: string, customAddress?: string) => {
    try {
      let resolvedAddress = customAddress;

      if (!resolvedAddress) {
        const providerType = walletName.toLowerCase().includes('okx')
          ? 'okx'
          : walletName.toLowerCase().includes('metamask')
          ? 'metamask'
          : 'any';
        const realAddr = await connectInjectedWeb3Wallet(providerType);
        if (realAddr) {
          resolvedAddress = realAddr;
        }
      }

      if (!resolvedAddress) {
        throw new Error('No wallet address could be resolved.');
      }

      const isOwner = resolvedAddress.toLowerCase() === OWNER_ADMIN_WALLET.toLowerCase();
      const displayAddr = `${resolvedAddress.slice(0, 6)}...${resolvedAddress.slice(-4)}`;

      let onChainOkb = isOwner ? 25.0 : 0.0;
      let onChainUsdc = isOwner ? 1000.0 : 0.0;

      try {
        const onChain = await fetchOnChainBalances(resolvedAddress);
        if (onChain.isLive) {
          onChainOkb = onChain.okb;
          onChainUsdc = onChain.usdc;
        }
      } catch (e) {
        console.warn('On-chain balance fetch notice:', e);
      }

      // Try load existing Firestore profile
      const existingProfile = await fetchUserProfile(resolvedAddress);

      if (existingProfile) {
        const updated: UserProfile = {
          ...existingProfile,
          walletAddress: resolvedAddress,
          isAdmin: isOwner,
          balanceOkb: onChainOkb > 0 ? onChainOkb : (existingProfile.balanceOkb || (isOwner ? 25.0 : 0.0)),
          balanceUsdc: onChainUsdc > 0 ? onChainUsdc : (existingProfile.balanceUsdc || (isOwner ? 1000.0 : 0.0)),
        };
        setUser(updated);
        saveUserProfile(updated);
      } else {
        // Brand new contender joining: zero initial stats, fresh unique avatar
        const randomAvatar = generateRandomAvatar(resolvedAddress);
        const defaultUsername = isOwner ? 'X Arena Deployer (Admin)' : `Contender_${resolvedAddress.slice(2, 6)}`;
        const freshUser: UserProfile = {
          id: `usr_${resolvedAddress.toLowerCase()}`,
          walletAddress: resolvedAddress,
          username: defaultUsername,
          avatar: randomAvatar,
          title: isOwner ? 'Deployer & Arbiter' : 'Arena Contender',
          bio: 'Competitive contender on X Layer zkEVM.',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          balanceUsdc: onChainUsdc > 0 ? onChainUsdc : (isOwner ? 1000.0 : 0.0),
          balanceOkb: onChainOkb > 0 ? onChainOkb : (isOwner ? 25.0 : 0.0),
          totalPrizesWonUsdc: 0,
          globalRank: isOwner ? 1 : 0,
          chessRating: 1200,
          chessPeakRating: 1200,
          chessTier: 'Bronze',
          chessStats: { wins: 0, losses: 0, draws: 0, streak: 0 },
          score2048Rating: 1200,
          score2048PeakRating: 1200,
          bestScore2048: 0,
          stats2048: { gamesPlayed: 0, wins2048: 0, highestTile: 0, streak: 0 },
          achievements: [],
          isCreator: false,
          isAdmin: isOwner,
        };
        setUser(freshUser);
        await saveUserProfile(freshUser);
        await claimUsername(defaultUsername, undefined, resolvedAddress);
      }

      setIsConnected(true);
      setIsWalletModalOpen(false);
      showToast(
        isOwner
          ? `Owner Admin Verified: ${displayAddr}`
          : `Connected: ${displayAddr} on X Layer zkEVM!`,
        'success'
      );
    } catch (err: any) {
      console.warn('Web3 connection notice:', err);
      showToast(err?.message || 'Wallet connection was cancelled or rejected.', 'error');
    }
  };

  // Custom Username & Avatar Updater with Firestore Reservation
  const updateUserIdentity = async (
    newUsername: string,
    newAvatar: string,
    newBio?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmed = newUsername.trim();
    if (trimmed.length < 3 || trimmed.length > 24) {
      return { success: false, error: 'Username must be between 3 and 24 characters.' };
    }

    const claimRes = await claimUsername(trimmed, user.username, user.walletAddress);
    if (!claimRes.success) {
      return { success: false, error: claimRes.error || 'Username is already taken or unavailable.' };
    }

    const updatedUser: UserProfile = {
      ...user,
      username: trimmed,
      avatar: newAvatar || user.avatar,
      bio: newBio !== undefined ? newBio : user.bio,
    };

    setUser(updatedUser);
    localStorage.setItem('xarena_user', JSON.stringify(updatedUser));

    if (user.walletAddress) {
      await saveUserProfile(updatedUser);
    }

    return { success: true };
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setUser((prev) => ({
      ...prev,
      isAdmin: false,
    }));
    if (currentView === 'admin') {
      setCurrentView('home');
    }
    showToast('Wallet disconnected. Switched to public guest mode.', 'info');
  };

  // Safe Navigation Guard: Intercepts view change if user is in an active match
  const requestNavigate = (targetViewId: string) => {
    if (targetViewId === currentView) return;

    // Check if in an active game session with moves
    const isGameView = currentView === 'chess' || currentView === '2048';
    if (isGameView && gameSession.isActive && !gameSession.isGameOver && gameSession.movesCount > 0) {
      promptForfeit(targetViewId);
      return;
    }

    // Otherwise navigate immediately
    sound.playClick();
    setCurrentView(targetViewId);
  };

  const promptForfeit = (targetView: string | null, customCallback?: () => void) => {
    const isRanked = activeMode === 'ranked' || gameSession.mode === 'ranked';
    // Double XP loss penalty for forfeiting in ranked
    const xpPenalty = isRanked ? (selectedGame === 'chess' ? 50 : 60) : 0;

    setForfeitModalState({
      isOpen: true,
      targetView,
      xpPenalty,
      isRanked,
      onConfirmCallback: customCallback,
    });
  };

  const confirmForfeitAndLeave = () => {
    const isRanked = forfeitModalState.isRanked;
    const penalty = forfeitModalState.xpPenalty;
    const game = selectedGame;

    if (isRanked && penalty > 0) {
      // Deduct 2x XP loss for forfeiting
      setUser((prev) => {
        if (game === 'chess') {
          const newRating = Math.max(400, prev.chessRating - penalty);
          return {
            ...prev,
            chessRating: newRating,
            chessTier: getChessTier(newRating),
            chessStats: {
              ...prev.chessStats,
              losses: prev.chessStats.losses + 1,
              streak: 0,
            },
          };
        } else {
          const newRating = Math.max(400, prev.score2048Rating - penalty);
          return {
            ...prev,
            score2048Rating: newRating,
            stats2048: {
              ...prev.stats2048,
              gamesPlayed: prev.stats2048.gamesPlayed + 1,
              streak: 0,
            },
          };
        }
      });

      // Record forfeit loss in match history
      const forfeitRecord: MatchRecord = {
        id: `match_forfeit_${Date.now()}`,
        game,
        mode: 'ranked',
        date: 'Just now',
        opponentName: 'Match Abandoned (Forfeit)',
        isAiOpponent: false,
        result: 'loss',
        ratingDelta: -penalty,
        movesCount: gameSession.movesCount,
        durationSeconds: 30,
      };
      setMatchHistory((prev) => [forfeitRecord, ...prev]);

      showToast(`Match Forfeited! Incurred -${penalty} XP penalty (2x Loss).`, 'error');
      sound.playDefeat();
    } else {
      showToast('Game session abandoned.', 'info');
    }

    // Reset game session
    setGameSession({
      isActive: false,
      game: null,
      mode: 'play',
      movesCount: 0,
      isGameOver: true,
    });

    const target = forfeitModalState.targetView;
    const callback = forfeitModalState.onConfirmCallback;

    setForfeitModalState({
      isOpen: false,
      targetView: null,
      xpPenalty: 0,
      isRanked: false,
    });

    if (callback) {
      callback();
    } else if (target) {
      setCurrentView(target);
    }
  };

  const cancelForfeit = () => {
    setForfeitModalState({
      isOpen: false,
      targetView: null,
      xpPenalty: 0,
      isRanked: false,
    });
    showToast('Match resumed. Continue fighting for victory!', 'info');
  };

  const claimFaucet = () => {
    setUser((prev) => ({
      ...prev,
      balanceUsdc: prev.balanceUsdc + 50.0,
      balanceOkb: prev.balanceOkb + 1.0,
    }));
    const newTx: Web3Transaction = {
      id: `tx_${Date.now()}`,
      hash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      type: 'faucet',
      amountUsdc: 50.0,
      currency: 'USDC',
      status: 'confirmed',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      description: 'X Layer Faucet Claim (+50 USDC, +1 OKB)',
      explorerUrl: 'https://www.oklink.com/xlayer',
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast('Claimed 50.0 USDC & 1.0 OKB from X Layer Faucet!', 'success');
    sound.playVictory();
  };

  const addMatchRecord = (record: Omit<MatchRecord, 'id' | 'date'>) => {
    const newRecord: MatchRecord = {
      ...record,
      id: `match_${Date.now()}`,
      date: new Date().toISOString(),
    };

    setMatchHistory((prev) => [newRecord, ...prev]);

    // Persist match directly to Firestore
    if (user.walletAddress) {
      saveFirestoreMatchRecord(newRecord, user.walletAddress);
    }

    // Update user stats & ratings
    setUser((prev) => {
      if (record.game === 'chess') {
        const newRating = Math.max(400, prev.chessRating + record.ratingDelta);
        const newPeak = Math.max(prev.chessPeakRating, newRating);
        const wins = record.result === 'win' ? prev.chessStats.wins + 1 : prev.chessStats.wins;
        const losses = record.result === 'loss' ? prev.chessStats.losses + 1 : prev.chessStats.losses;
        const draws = record.result === 'draw' ? prev.chessStats.draws + 1 : prev.chessStats.draws;
        const streak = record.result === 'win' ? prev.chessStats.streak + 1 : 0;
        
        return {
          ...prev,
          chessRating: newRating,
          chessPeakRating: newPeak,
          chessTier: getChessTier(newRating),
          chessStats: { wins, losses, draws, streak },
          balanceUsdc: prev.balanceUsdc + (record.rewardsEarnedUsdc || 0),
          totalPrizesWonUsdc: prev.totalPrizesWonUsdc + (record.rewardsEarnedUsdc || 0),
        };
      } else {
        const newRating = Math.max(400, prev.score2048Rating + record.ratingDelta);
        const newPeak = Math.max(prev.score2048PeakRating, newRating);
        const bestScore = Math.max(prev.bestScore2048, record.playerScore || 0);
        const maxTile = Math.max(prev.stats2048.highestTile, record.highestTile || 0);
        const wins2048 = (record.highestTile || 0) >= 2048 ? prev.stats2048.wins2048 + 1 : prev.stats2048.wins2048;
        const streak = (record.highestTile || 0) >= 2048 ? prev.stats2048.streak + 1 : prev.stats2048.streak;

        return {
          ...prev,
          score2048Rating: newRating,
          score2048PeakRating: newPeak,
          bestScore2048: bestScore,
          stats2048: {
            gamesPlayed: prev.stats2048.gamesPlayed + 1,
            wins2048,
            highestTile: maxTile,
            streak,
          },
          balanceUsdc: prev.balanceUsdc + (record.rewardsEarnedUsdc || 0),
          totalPrizesWonUsdc: prev.totalPrizesWonUsdc + (record.rewardsEarnedUsdc || 0),
        };
      }
    });

    if (record.result === 'win') {
      sound.playVictory();
    }
  };

  const joinEvent = (eventId: string): boolean => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return false;

    // Check if already registered
    const alreadyJoined = targetEvent.participants.some((p) => p.userId === user.id);
    if (alreadyJoined) {
      showToast('You are already registered for this event! Good luck in the arena.', 'info');
      return true;
    }

    if (targetEvent.entryFeeUsdc > 0 && user.balanceUsdc < targetEvent.entryFeeUsdc) {
      showToast(`Insufficient balance (${user.balanceUsdc} USDC). Use Faucet or deposit USDC.`, 'error');
      return false;
    }

    // Deduct entry fee
    if (targetEvent.entryFeeUsdc > 0) {
      setUser((prev) => ({
        ...prev,
        balanceUsdc: prev.balanceUsdc - targetEvent.entryFeeUsdc,
      }));

      const newTx: Web3Transaction = {
        id: `tx_${Date.now()}`,
        hash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        type: 'event_entry',
        amountUsdc: targetEvent.entryFeeUsdc,
        currency: 'USDC',
        status: 'confirmed',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        description: `Entry Fee: ${targetEvent.title}`,
        explorerUrl: 'https://www.oklink.com/xlayer',
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    // Add to participants
    const updatedEvent: ArenaEvent = {
      ...targetEvent,
      currentParticipantsCount: targetEvent.currentParticipantsCount + 1,
      participants: [
        ...targetEvent.participants,
        {
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          walletAddress: user.walletAddress,
          score: 0,
          rank: targetEvent.participants.length + 1,
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? updatedEvent : ev))
    );

    saveLiveEvent(updatedEvent).catch((err) => {
      console.warn('Firestore update event on join error:', err);
    });

    showToast(`Successfully registered for ${targetEvent.title}! Entry confirmed on X Layer.`, 'success');
    sound.playVictory();
    return true;
  };

  const completeChallenge = (challengeId: string) => {
    const chal = challenges.find((c) => c.id === challengeId);
    if (!chal || chal.completed) return;

    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, completed: true } : c))
    );

    setUser((prev) => ({
      ...prev,
      balanceUsdc: prev.balanceUsdc + chal.rewardUsdc,
      totalPrizesWonUsdc: prev.totalPrizesWonUsdc + chal.rewardUsdc,
    }));

    showToast(`Challenge Completed! Claimed +${chal.rewardUsdc} USDC & +${chal.rewardXp} XP.`, 'success');
    sound.playVictory();
  };

  const claimAchievementReward = (achievementId: string) => {
    const ach = achievements.find((a) => a.id === achievementId);
    if (!ach) return;

    if (!user.achievements.includes(ach.id)) {
      setUser((prev) => ({
        ...prev,
        achievements: [...prev.achievements, ach.id],
        balanceUsdc: prev.balanceUsdc + (ach.rewardUsdc || 0),
        totalPrizesWonUsdc: prev.totalPrizesWonUsdc + (ach.rewardUsdc || 0),
      }));
      showToast(`Achievement Unlocked: Claimed +$${ach.rewardUsdc} USDC for "${ach.title}"!`, 'success');
      sound.playVictory();
    }
  };

  const createEvent = (newEventData: Partial<ArenaEvent>) => {
    const eventId = `evt_creator_${Date.now()}`;
    const fullEvent: ArenaEvent = {
      id: eventId,
      title: newEventData.title || 'Creator Invitational Tournament',
      game: newEventData.game || 'chess',
      mode: 'events',
      difficulty: newEventData.difficulty || 'medium',
      bannerGradient: newEventData.bannerGradient || 'from-indigo-950 via-slate-900 to-purple-950',
      description: newEventData.description || 'Community hosted tournament with smart contract escrow.',
      rules: newEventData.rules || ['Standard competitive rules', 'Automatic match scoring'],
      scoringSystem: newEventData.scoringSystem || 'Standard tournament score points.',
      entryFeeUsdc: newEventData.entryFeeUsdc || 0,
      prizePoolUsdc: newEventData.prizePoolUsdc || 100,
      creatorId: user.id,
      creatorName: user.username,
      creatorAvatar: user.avatar,
      isOfficial: false,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: newEventData.maxParticipants || 128,
      currentParticipantsCount: 1,
      participants: [
        {
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          walletAddress: user.walletAddress,
          score: 0,
          rank: 1,
          joinedAt: new Date().toISOString(),
        },
      ],
      prizeDistribution: [
        { place: '1st Place', amountUsdc: (newEventData.prizePoolUsdc || 100) * 0.6, percentage: 60 },
        { place: '2nd Place', amountUsdc: (newEventData.prizePoolUsdc || 100) * 0.3, percentage: 30 },
        { place: '3rd Place', amountUsdc: (newEventData.prizePoolUsdc || 100) * 0.1, percentage: 10 },
      ],
    };

    setEvents((prev) => [fullEvent, ...prev]);
    // Save live event to Firestore
    saveLiveEvent(fullEvent).catch((err) => {
      console.warn('Firestore event save error:', err);
    });
    showToast(`Created event "${fullEvent.title}" on X Layer!`, 'success');
    sound.playVictory();
  };

  const startMatchWithAi = (ai: AIAgent, game?: GameType, mode?: GameMode) => {
    setActiveAiOpponent(ai);
    const targetGame = game || (ai.game === 'all' ? selectedGame : ai.game);
    setSelectedGame(targetGame);
    setActiveMode(mode || 'play');
    setCurrentView(targetGame);
    showToast(`Challenging AI Agent ${ai.name} (${ai.rating} Elo)`, 'info');
  };

  const startQuickMatch = (game: GameType = 'chess', opponentName?: string, opponentRating?: number) => {
    setSelectedGame(game);
    setActiveMode('ranked');
    setActiveEventToPlay(null);
    setActiveChallengeToPlay(null);

    const matchedAgent = aiAgents.find((a) => a.game === game || a.game === 'all') || aiAgents[0];
    if (opponentName) {
      setActiveAiOpponent({
        ...matchedAgent,
        name: opponentName,
        rating: opponentRating || (game === 'chess' ? user.chessRating : user.score2048Rating),
      });
    } else {
      setActiveAiOpponent(matchedAgent);
    }

    setCurrentView(game);
    sound.playMatchFound();
    showToast(`Ranked match started: vs ${opponentName || matchedAgent.name}`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isConnected,
        isAdmin: isOwnerAdmin,
        isWalletModalOpen,
        setIsWalletModalOpen,
        connectWallet,
        disconnectWallet,
        claimFaucet,
        currentView,
        setCurrentView,
        requestNavigate,
        selectedGame,
        setSelectedGame,
        activeMode,
        setActiveMode,
        gameDifficulty,
        setGameDifficulty,
        aiAgents,
        setAiAgents,
        events,
        setEvents,
        challenges,
        setChallenges,
        leaderboard,
        achievements,
        matchHistory,
        transactions,
        soundMuted,
        toggleSound,
        toasts,
        showToast,
        activeEventToPlay,
        setActiveEventToPlay,
        activeChallengeToPlay,
        setActiveChallengeToPlay,
        activeAiOpponent,
        setActiveAiOpponent,
        addMatchRecord,
        joinEvent,
        completeChallenge,
        claimAchievementReward,
        createEvent,
        startMatchWithAi,
        startQuickMatch,
        gameSession,
        setGameSession,
        forfeitModalState,
        promptForfeit,
        confirmForfeitAndLeave,
        cancelForfeit,
        updateUserIdentity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

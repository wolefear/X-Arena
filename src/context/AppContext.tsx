import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  subscribeAllUsers,
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
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  pendingWalletAddress: string | null;
  completeOnboarding: (username: string, avatar: string) => Promise<void>;
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
  allUsers: UserProfile[];
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
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    const savedConnected = localStorage.getItem('xarena_connected');
    return savedConnected === 'true';
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const savedConnected = localStorage.getItem('xarena_connected') === 'true';
    const savedUser = localStorage.getItem('xarena_user');
    if (savedConnected && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return INITIAL_USER;
      }
    }
    return INITIAL_USER;
  });

  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [pendingWalletAddress, setPendingWalletAddress] = useState<string | null>(null);

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
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
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

  // Real-time Firestore synchronization for Events
  useEffect(() => {
    const unsubscribe = subscribeLiveEvents((liveEvents) => {
      setEvents(liveEvents || []);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore synchronization for ALL Users in Central Database
  useEffect(() => {
    const unsubscribe = subscribeAllUsers((usersList) => {
      setAllUsers(usersList || []);
    });
    return () => unsubscribe();
  }, []);

  // Convert all central database users into sorted Leaderboard Entries
  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    return allUsers.map((u, idx) => {
      const chessPlayed = (u.chessStats?.wins || 0) + (u.chessStats?.losses || 0) + (u.chessStats?.draws || 0);
      const chessWinRate = chessPlayed > 0 ? Math.round(((u.chessStats?.wins || 0) / chessPlayed) * 100) : 0;
      return {
        id: u.id || u.walletAddress,
        rank: idx + 1,
        userId: u.id || u.walletAddress,
        username: u.username || 'Contender',
        avatar: u.avatar || generateRandomAvatar(u.walletAddress),
        walletAddress: u.walletAddress,
        rating: u.chessRating || 1200,
        wins: u.chessStats?.wins || 0,
        losses: u.chessStats?.losses || 0,
        winRate: chessWinRate,
        tier: u.chessTier || 'Bronze',
        bestScore: u.bestScore2048 || 0,
        highestTile: u.stats2048?.highestTile || 0,
        prizesWonUsdc: u.totalPrizesWonUsdc || u.balanceUsdc || 0,
      };
    });
  }, [allUsers]);

  // Real-time Firestore synchronization for User Match History
  useEffect(() => {
    if (!isConnected || !user.walletAddress) {
      setMatchHistory([]);
      return;
    }
    const unsubscribe = subscribeUserMatches(user.walletAddress, (records) => {
      setMatchHistory(records || []);
    });
    return () => unsubscribe();
  }, [isConnected, user.walletAddress]);

  // Sync and persist user session state
  useEffect(() => {
    if (isConnected && user.walletAddress) {
      const updatedUser = { ...user, isAdmin: isOwnerAdmin };
      localStorage.setItem('xarena_user', JSON.stringify(updatedUser));
      localStorage.setItem('xarena_connected', 'true');
      saveUserProfile(updatedUser);
    } else {
      localStorage.removeItem('xarena_connected');
      localStorage.removeItem('xarena_user');
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
        console.warn('Background on-chain balance sync notice:', err);
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
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  /**
   * Connect Web3 Wallet: Detects Existing vs New Users
   */
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

      // Check central Firestore database for existing user profile
      const existingProfile = await fetchUserProfile(resolvedAddress);

      if (existingProfile) {
        // Existing user -> Restore profile directly
        const updated: UserProfile = {
          ...existingProfile,
          walletAddress: resolvedAddress,
          isAdmin: isOwner,
          balanceOkb: onChainOkb > 0 ? onChainOkb : (existingProfile.balanceOkb || (isOwner ? 25.0 : 0.0)),
          balanceUsdc: onChainUsdc > 0 ? onChainUsdc : (existingProfile.balanceUsdc || (isOwner ? 1000.0 : 0.0)),
        };
        setUser(updated);
        setIsConnected(true);
        setIsWalletModalOpen(false);
        setIsOnboardingOpen(false);
        setPendingWalletAddress(null);
        await saveUserProfile(updated);
        showToast(
          isOwner
            ? `Owner Admin Verified: ${displayAddr}`
            : `Welcome back, ${updated.username}! Connected: ${displayAddr}`,
          'success'
        );
      } else {
        // New user -> Open mandatory Username Onboarding Flow
        setIsWalletModalOpen(false);
        setPendingWalletAddress(resolvedAddress);
        setIsOnboardingOpen(true);
        sound.playNotification();
      }
    } catch (err: any) {
      console.warn('Web3 connection notice:', err);
      showToast(err?.message || 'Wallet connection was cancelled or rejected.', 'error');
    }
  };

  /**
   * Complete First-Time Username Onboarding Flow
   */
  const completeOnboarding = async (chosenUsername: string, chosenAvatar: string) => {
    if (!pendingWalletAddress) return;

    const resolvedAddress = pendingWalletAddress;
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
      console.warn('On-chain balance check notice:', e);
    }

    // 1. Claim username in registry
    const claimRes = await claimUsername(chosenUsername, undefined, resolvedAddress);
    if (!claimRes.success) {
      throw new Error(claimRes.error || 'Failed to claim username.');
    }

    // 2. Create fresh UserProfile document in central users collection
    const newUser: UserProfile = {
      id: `usr_${resolvedAddress.toLowerCase()}`,
      walletAddress: resolvedAddress,
      username: chosenUsername,
      avatar: chosenAvatar || generateRandomAvatar(resolvedAddress),
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
      tier2048: 'Bronze',
      stats2048: { gamesPlayed: 0, wins2048: 0, highestTile: 0, streak: 0 },
      achievements: [],
      isCreator: false,
      isAdmin: isOwner,
    };

    await saveUserProfile(newUser);
    setUser(newUser);
    setIsConnected(true);
    setIsOnboardingOpen(false);
    setPendingWalletAddress(null);

    sound.playVictory();
    showToast(`Profile created! Welcome to X Arena, ${chosenUsername}!`, 'success');
  };

  /**
   * Custom Profile Updater
   */
  const updateUserIdentity = async (
    newUsername: string,
    newAvatar: string,
    newBio?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmed = newUsername.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      return { success: false, error: 'Username must be between 3 and 20 characters.' };
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
    if (user.walletAddress) {
      await saveUserProfile(updatedUser);
    }

    return { success: true };
  };

  /**
   * Disconnect Wallet: Safely clears active session UI without deleting stored DB data
   */
  const disconnectWallet = () => {
    setIsConnected(false);
    setUser(INITIAL_USER);
    setIsOnboardingOpen(false);
    setPendingWalletAddress(null);
    localStorage.removeItem('xarena_connected');
    localStorage.removeItem('xarena_user');
    if (currentView === 'admin' || currentView === 'profile') {
      setCurrentView('home');
    }
    showToast('Wallet disconnected. Switched to guest mode.', 'info');
  };

  // Safe Navigation Guard
  const requestNavigate = (targetViewId: string) => {
    if (targetViewId === currentView) return;

    const isGameView = currentView === 'chess' || currentView === '2048';
    if (isGameView && gameSession.isActive && !gameSession.isGameOver && gameSession.movesCount > 0) {
      promptForfeit(targetViewId);
      return;
    }

    sound.playClick();
    setCurrentView(targetViewId);
  };

  const promptForfeit = (targetView: string | null, customCallback?: () => void) => {
    const isRanked = activeMode === 'ranked' || gameSession.mode === 'ranked';
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
      setUser((prev) => {
        let updated: UserProfile;
        if (game === 'chess') {
          const newRating = Math.max(400, prev.chessRating - penalty);
          updated = {
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
          updated = {
            ...prev,
            score2048Rating: newRating,
            stats2048: {
              ...prev.stats2048,
              streak: 0,
            },
          };
        }
        if (prev.walletAddress) {
          saveUserProfile(updated);
        }
        return updated;
      });
      showToast(`Ranked Match Forfeited: -${penalty} XP penalty applied.`, 'error');
    }

    setGameSession({
      isActive: false,
      game: null,
      mode: 'play',
      movesCount: 0,
      isGameOver: false,
    });

    const target = forfeitModalState.targetView;
    const cb = forfeitModalState.onConfirmCallback;

    setForfeitModalState({
      isOpen: false,
      targetView: null,
      xpPenalty: 0,
      isRanked: false,
    });

    if (cb) cb();
    if (target) setCurrentView(target);
  };

  const cancelForfeit = () => {
    setForfeitModalState({
      isOpen: false,
      targetView: null,
      xpPenalty: 0,
      isRanked: false,
    });
  };

  const claimFaucet = () => {
    if (!isConnected) {
      setIsWalletModalOpen(true);
      return;
    }
    setUser((prev) => {
      const updated = {
        ...prev,
        balanceUsdc: prev.balanceUsdc + 250,
        balanceOkb: prev.balanceOkb + 0.05,
      };
      if (prev.walletAddress) {
        saveUserProfile(updated);
      }
      return updated;
    });
    sound.playCash();
    showToast('Faucet Claimed: +250 USDC & +0.05 OKB gas!', 'success');
  };

  const addMatchRecord = (recordData: Omit<MatchRecord, 'id' | 'date'>) => {
    const newRecord: MatchRecord = {
      ...recordData,
      id: `match_${Date.now()}`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMatchHistory((prev) => [newRecord, ...prev.slice(0, 49)]);

    if (user.walletAddress) {
      saveFirestoreMatchRecord(newRecord, user.walletAddress);
    }

    // Update user stats and sync to Firestore
    setUser((prev) => {
      let updated: UserProfile = { ...prev };
      if (recordData.game === 'chess') {
        const isWin = recordData.result === 'win';
        const isLoss = recordData.result === 'loss';
        const isDraw = recordData.result === 'draw';
        const newRating = Math.max(400, prev.chessRating + recordData.ratingDelta);
        const newPeak = Math.max(prev.chessPeakRating, newRating);

        updated = {
          ...prev,
          chessRating: newRating,
          chessPeakRating: newPeak,
          chessTier: getChessTier(newRating),
          chessStats: {
            wins: prev.chessStats.wins + (isWin ? 1 : 0),
            losses: prev.chessStats.losses + (isLoss ? 1 : 0),
            draws: prev.chessStats.draws + (isDraw ? 1 : 0),
            streak: isWin ? prev.chessStats.streak + 1 : 0,
          },
          balanceUsdc: prev.balanceUsdc + (recordData.rewardsEarnedUsdc || 0),
          totalPrizesWonUsdc: prev.totalPrizesWonUsdc + (recordData.rewardsEarnedUsdc || 0),
        };
      } else if (recordData.game === '2048') {
        const isWin = recordData.result === 'win';
        const newRating = Math.max(400, prev.score2048Rating + recordData.ratingDelta);
        const newPeak = Math.max(prev.score2048PeakRating, newRating);
        const newBestScore = Math.max(prev.bestScore2048, recordData.playerScore || 0);
        const newHighestTile = Math.max(prev.stats2048.highestTile, recordData.highestTile || 0);

        updated = {
          ...prev,
          score2048Rating: newRating,
          score2048PeakRating: newPeak,
          bestScore2048: newBestScore,
          stats2048: {
            gamesPlayed: prev.stats2048.gamesPlayed + 1,
            wins2048: prev.stats2048.wins2048 + (isWin ? 1 : 0),
            highestTile: newHighestTile,
            streak: isWin ? prev.stats2048.streak + 1 : 0,
          },
          balanceUsdc: prev.balanceUsdc + (recordData.rewardsEarnedUsdc || 0),
          totalPrizesWonUsdc: prev.totalPrizesWonUsdc + (recordData.rewardsEarnedUsdc || 0),
        };
      }

      if (prev.walletAddress) {
        saveUserProfile(updated);
      }
      return updated;
    });
  };

  const joinEvent = (eventId: string): boolean => {
    if (!isConnected) {
      setIsWalletModalOpen(true);
      return false;
    }

    const event = events.find((e) => e.id === eventId);
    if (!event) return false;

    if (user.balanceUsdc < event.entryFeeUsdc) {
      showToast(`Insufficient USDC. Event requires $${event.entryFeeUsdc} USDC.`, 'error');
      return false;
    }

    setUser((prev) => {
      const updated = {
        ...prev,
        balanceUsdc: prev.balanceUsdc - event.entryFeeUsdc,
      };
      if (prev.walletAddress) {
        saveUserProfile(updated);
      }
      return updated;
    });

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const isAlreadyIn = e.participants.some((p) => p.userId === user.id || p.walletAddress === user.walletAddress);
          if (isAlreadyIn) return e;

          const updatedParticipants = [
            ...e.participants,
            {
              userId: user.id,
              username: user.username,
              avatar: user.avatar,
              walletAddress: user.walletAddress,
              score: 0,
              rank: e.participants.length + 1,
              joinedAt: new Date().toISOString(),
            },
          ];

          const updatedEvent: ArenaEvent = {
            ...e,
            currentParticipantsCount: updatedParticipants.length,
            participants: updatedParticipants,
            isUserRegistered: true,
          };

          saveLiveEvent(updatedEvent).catch((err) => {
            console.warn('Firestore event update notice:', err);
          });

          return updatedEvent;
        }
        return e;
      })
    );

    showToast(`Joined "${event.title}"! Good luck contender.`, 'success');
    sound.playVictory();
    return true;
  };

  const completeChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === challengeId && !c.completed) {
          setUser((u) => {
            const updated = {
              ...u,
              balanceUsdc: u.balanceUsdc + c.rewardUsdc,
              totalPrizesWonUsdc: u.totalPrizesWonUsdc + c.rewardUsdc,
              chessRating: c.game === 'chess' ? u.chessRating + c.rewardXp : u.chessRating,
              score2048Rating: c.game === '2048' ? u.score2048Rating + c.rewardXp : u.score2048Rating,
            };
            if (u.walletAddress) {
              saveUserProfile(updated);
            }
            return updated;
          });
          showToast(`Challenge Completed! +${c.rewardXp} XP & +$${c.rewardUsdc} USDC`, 'success');
          sound.playVictory();
          return { ...c, completed: true };
        }
        return c;
      })
    );
  };

  const claimAchievementReward = (achievementId: string) => {
    const ach = achievements.find((a) => a.id === achievementId);
    if (!ach) return;

    if (!user.achievements.includes(ach.id)) {
      setUser((prev) => {
        const updated = {
          ...prev,
          achievements: [...prev.achievements, ach.id],
          balanceUsdc: prev.balanceUsdc + (ach.rewardUsdc || 0),
          totalPrizesWonUsdc: prev.totalPrizesWonUsdc + (ach.rewardUsdc || 0),
        };
        if (prev.walletAddress) {
          saveUserProfile(updated);
        }
        return updated;
      });
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
    saveLiveEvent(fullEvent).catch((err) => {
      console.warn('Firestore event save notice:', err);
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
        isOnboardingOpen,
        setIsOnboardingOpen,
        pendingWalletAddress,
        completeOnboarding,
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
        allUsers,
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

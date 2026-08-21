import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { ArenaEvent, MatchRecord, UserProfile, LeaderboardEntry } from '../types';

/**
 * Avatar generators and presets
 */
export const AVATAR_STYLES = ['bottts', 'pixel-art', 'avataaars', 'shapes', 'thumbs'] as const;

export function generateRandomAvatar(customSeed?: string): string {
  const seed = customSeed || `player_${Math.random().toString(36).substring(2, 10)}`;
  const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

/**
 * Seed Profiles for Initial Central Database Population (Fresh Zeroed Baseline)
 */
export const SEED_USERS: UserProfile[] = [
  {
    id: 'usr_0x3a99281fe41209384812849012384918239081fe',
    walletAddress: '0x3a99281fe41209384812849012384918239081fe',
    username: 'Valkyrie_GM',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Arena Contender',
    bio: 'Competitive player on X Layer zkEVM.',
    joinedDate: 'August 2026',
    balanceUsdt: 0,
    balanceUsdc: 0,
    balanceOkb: 0,
    totalPrizesWonUsdc: 0,
    globalRank: 1,
    chessRating: 0,
    chessPeakRating: 0,
    chessTier: 'Bronze',
    chessStats: { wins: 0, losses: 0, draws: 0, streak: 0 },
    score2048Rating: 0,
    score2048PeakRating: 0,
    bestScore2048: 0,
    tier2048: 'Bronze',
    stats2048: { gamesPlayed: 0, wins2048: 0, highestTile: 0, streak: 0 },
    achievements: [],
    isCreator: false,
    isAdmin: false,
  },
  {
    id: 'usr_0x88f4902190184029184029184091284091849021',
    walletAddress: '0x88f4902190184029184029184091284091849021',
    username: 'SnakeGrid99',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    title: 'Arena Contender',
    bio: 'Competitive grid player on X Layer.',
    joinedDate: 'August 2026',
    balanceUsdt: 0,
    balanceUsdc: 0,
    balanceOkb: 0,
    totalPrizesWonUsdc: 0,
    globalRank: 2,
    chessRating: 0,
    chessPeakRating: 0,
    chessTier: 'Bronze',
    chessStats: { wins: 0, losses: 0, draws: 0, streak: 0 },
    score2048Rating: 0,
    score2048PeakRating: 0,
    bestScore2048: 0,
    tier2048: 'Bronze',
    stats2048: { gamesPlayed: 0, wins2048: 0, highestTile: 0, streak: 0 },
    achievements: [],
    isCreator: false,
    isAdmin: false,
  },
  {
    id: 'usr_0x71c4e8b109284091284091284091824091844e8b',
    walletAddress: '0x71c4e8b109284091284091284091824091844e8b',
    username: 'KrypToKnight',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    title: 'Arena Contender',
    bio: 'Chess enthusiast on X Arena.',
    joinedDate: 'August 2026',
    balanceUsdt: 0,
    balanceUsdc: 0,
    balanceOkb: 0,
    totalPrizesWonUsdc: 0,
    globalRank: 3,
    chessRating: 0,
    chessPeakRating: 0,
    chessTier: 'Bronze',
    chessStats: { wins: 0, losses: 0, draws: 0, streak: 0 },
    score2048Rating: 0,
    score2048PeakRating: 0,
    bestScore2048: 0,
    tier2048: 'Bronze',
    stats2048: { gamesPlayed: 0, wins2048: 0, highestTile: 0, streak: 0 },
    achievements: [],
    isCreator: false,
    isAdmin: false,
  },
  {
    id: 'usr_0x99a72bc1029480192840912840918204918272bc',
    walletAddress: '0x99a72bc1029480192840912840918204918272bc',
    username: 'QuantumPawn',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Arena Contender',
    bio: 'Tactical contender on X Arena.',
    joinedDate: 'August 2026',
    balanceUsdt: 0,
    balanceUsdc: 0,
    balanceOkb: 0,
    totalPrizesWonUsdc: 0,
    globalRank: 4,
    chessRating: 0,
    chessPeakRating: 0,
    chessTier: 'Bronze',
    chessStats: { wins: 0, losses: 0, draws: 0, streak: 0 },
    score2048Rating: 0,
    score2048PeakRating: 0,
    bestScore2048: 0,
    tier2048: 'Bronze',
    stats2048: { gamesPlayed: 0, wins2048: 0, highestTile: 0, streak: 0 },
    achievements: [],
    isCreator: false,
    isAdmin: false,
  },
];

/**
 * Username Uniqueness & Management
 */
export async function checkUsernameAvailability(
  username: string,
  currentWalletAddress?: string
): Promise<{ available: boolean; reason?: string }> {
  const cleaned = username.trim();
  if (!cleaned) {
    return { available: false, reason: 'Username cannot be empty.' };
  }
  if (cleaned.length < 3) {
    return { available: false, reason: 'Username must be at least 3 characters.' };
  }
  if (cleaned.length > 20) {
    return { available: false, reason: 'Username cannot exceed 20 characters.' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(cleaned)) {
    return { available: false, reason: 'Username can only contain letters, numbers, hyphens and underscores.' };
  }

  const lookupKey = cleaned.toLowerCase();
  const currentWallet = currentWalletAddress ? currentWalletAddress.trim().toLowerCase() : '';

  try {
    // 1. Check usernames registry collection
    const docSnap = await getDoc(doc(db, 'usernames', lookupKey));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const existingWallet = data?.walletAddress ? data.walletAddress.toLowerCase() : '';
      if (existingWallet && existingWallet !== currentWallet) {
        return { available: false, reason: `"${cleaned}" is already claimed by another contender.` };
      }
    }

    // 2. Check users collection
    const usersSnap = await getDocs(collection(db, 'users'));
    let taken = false;
    usersSnap.forEach((d) => {
      const u = d.data() as UserProfile;
      if (
        u.username &&
        u.username.trim().toLowerCase() === lookupKey &&
        u.walletAddress?.toLowerCase() !== currentWallet
      ) {
        taken = true;
      }
    });

    if (taken) {
      return { available: false, reason: `"${cleaned}" is already taken.` };
    }

    return { available: true };
  } catch (err) {
    console.warn('Firestore username check notice:', err);
    return { available: true };
  }
}

export async function claimUsername(
  newUsername: string,
  oldUsername?: string,
  walletAddress?: string
): Promise<{ success: boolean; error?: string }> {
  const check = await checkUsernameAvailability(newUsername, walletAddress);
  if (!check.available) {
    return { success: false, error: check.reason };
  }

  const wallet = walletAddress ? walletAddress.trim().toLowerCase() : 'guest';
  const newKey = newUsername.trim().toLowerCase();

  try {
    // 1. Claim new username doc in registry
    await setDoc(doc(db, 'usernames', newKey), {
      username: newUsername.trim(),
      usernameNormalized: newKey,
      walletAddress: wallet,
      updatedAt: Date.now(),
    });

    // 2. Release old username if changed
    if (oldUsername && oldUsername.trim().toLowerCase() !== newKey) {
      const oldKey = oldUsername.trim().toLowerCase();
      try {
        await deleteDoc(doc(db, 'usernames', oldKey));
      } catch (e) {
        console.warn('Old username release notice:', e);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error claiming username:', err);
    return { success: false, error: err?.message || 'Failed to reserve username in database.' };
  }
}

/**
 * 1. Events collection (Realtime sync for active tournaments)
 */
export function subscribeLiveEvents(callback: (events: ArenaEvent[]) => void) {
  try {
    const q = query(collection(db, 'events'));
    return onSnapshot(
      q,
      (snapshot) => {
        const events: ArenaEvent[] = [];
        snapshot.forEach((docSnap) => {
          events.push(docSnap.data() as ArenaEvent);
        });
        callback(events);
      },
      (error) => {
        console.warn('Firestore live events listener notice:', error);
        callback([]);
      }
    );
  } catch (e) {
    console.warn('Failed to subscribe live events:', e);
    return () => {};
  }
}

export async function saveLiveEvent(event: ArenaEvent): Promise<void> {
  try {
    await setDoc(doc(db, 'events', event.id), event, { merge: true });
  } catch (err) {
    console.error('Error saving live event to Firestore:', err);
    throw err;
  }
}

export async function deleteLiveEvent(eventId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'events', eventId));
  } catch (err) {
    console.error('Error deleting live event:', err);
    throw err;
  }
}

/**
 * 2. Matches collection
 */
export async function saveMatchRecord(match: MatchRecord, userId: string): Promise<void> {
  try {
    const matchId = match.id || `match_${Date.now()}`;
    await setDoc(doc(db, 'matches', matchId), {
      ...match,
      userId: userId.toLowerCase(),
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('Error saving match record to Firestore:', err);
  }
}

export function subscribeUserMatches(userId: string, callback: (matches: MatchRecord[]) => void) {
  if (!userId) return () => {};
  try {
    const q = query(collection(db, 'matches'), orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const records: MatchRecord[] = [];
        const target = userId.toLowerCase();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.userId === target) {
            records.push(data as MatchRecord);
          }
        });
        callback(records);
      },
      (err) => {
        console.warn('Match history subscription notice:', err);
      }
    );
  } catch (e) {
    return () => {};
  }
}

/**
 * 3. Central Users Collection & Real-Time Sync for Global Leaderboard
 */
let hasSeededInitialUsers = false;

export async function seedInitialUsersIfEmpty(): Promise<void> {
  if (hasSeededInitialUsers) return;
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    if (snapshot.empty) {
      for (const u of SEED_USERS) {
        const docId = u.walletAddress.toLowerCase();
        await setDoc(doc(db, 'users', docId), {
          ...u,
          usernameNormalized: u.username.toLowerCase(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        await setDoc(doc(db, 'usernames', u.username.toLowerCase()), {
          username: u.username,
          usernameNormalized: u.username.toLowerCase(),
          walletAddress: u.walletAddress.toLowerCase(),
          updatedAt: Date.now(),
        });
      }
    }
    hasSeededInitialUsers = true;
  } catch (err) {
    console.warn('Seed initial users notice:', err);
  }
}

/**
 * Reset all user gameplay progression across Firestore to fresh 0 baseline
 * Retains wallet addresses, usernames, avatars, bio, and joined date.
 */
export async function resetAllUsersProgressionInDatabase(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    if (!snapshot.empty) {
      for (const docSnap of snapshot.docs) {
        const u = docSnap.data() as UserProfile;
        const cleanedUser: Partial<UserProfile> = {
          chessRating: 0,
          chessPeakRating: 0,
          chessTier: 'Bronze',
          chessStats: { wins: 0, losses: 0, draws: 0, streak: 0 },
          score2048Rating: 0,
          score2048PeakRating: 0,
          bestScore2048: 0,
          tier2048: 'Bronze',
          stats2048: { gamesPlayed: 0, wins2048: 0, highestTile: 0, streak: 0 },
          totalPrizesWonUsdc: 0,
          totalPrizesWonUsdt: 0,
          achievements: [],
          isCreator: false,
          isAdmin: false,
        };
        await setDoc(doc(db, 'users', docSnap.id), cleanedUser, { merge: true });
      }
    }
  } catch (err) {
    console.warn('Database progression reset notice:', err);
  }
}

export function subscribeAllUsers(callback: (users: UserProfile[]) => void) {
  try {
    const q = query(collection(db, 'users'));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          seedInitialUsersIfEmpty().then(() => {
            callback(SEED_USERS);
          });
          return;
        }
        const usersList: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as UserProfile;
          if (data && data.walletAddress) {
            usersList.push(data);
          }
        });
        callback(usersList.length > 0 ? usersList : SEED_USERS);
      },
      (err) => {
        console.warn('Firestore users subscription notice:', err);
        callback(SEED_USERS);
      }
    );
  } catch (e) {
    console.warn('Failed to subscribe all users:', e);
    callback(SEED_USERS);
    return () => {};
  }
}

export async function saveUserProfile(user: UserProfile): Promise<void> {
  if (!user.walletAddress) return;
  try {
    const docId = user.walletAddress.toLowerCase();
    const payload = {
      ...user,
      id: user.id || `usr_${docId}`,
      walletAddress: user.walletAddress,
      usernameNormalized: user.username ? user.username.toLowerCase() : '',
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, 'users', docId), payload, { merge: true });
  } catch (err) {
    console.warn('Error saving user profile to Firestore:', err);
  }
}

export async function fetchUserProfile(walletAddress: string): Promise<UserProfile | null> {
  if (!walletAddress) return null;
  try {
    const docId = walletAddress.trim().toLowerCase();
    const snap = await getDoc(doc(db, 'users', docId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Error fetching user profile from Firestore:', err);
  }
  return null;
}

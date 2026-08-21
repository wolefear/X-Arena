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
  try {
    const docSnap = await getDoc(doc(db, 'usernames', lookupKey));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const current = currentWalletAddress ? currentWalletAddress.toLowerCase() : '';
      if (data?.walletAddress && data.walletAddress.toLowerCase() !== current) {
        return { available: false, reason: `"${cleaned}" is already taken by another contender.` };
      }
    }
    return { available: true };
  } catch (err) {
    console.warn('Firestore username check error:', err);
    // Allow if offline fallback
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

  const wallet = walletAddress ? walletAddress.toLowerCase() : 'guest';
  const newKey = newUsername.trim().toLowerCase();

  try {
    // 1. Claim new username doc
    await setDoc(doc(db, 'usernames', newKey), {
      username: newUsername.trim(),
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
        console.warn('Firestore live events listener error:', error);
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
        console.warn('Match history subscription note:', err);
      }
    );
  } catch (e) {
    return () => {};
  }
}

/**
 * 3. User Profiles
 */
export async function saveUserProfile(user: UserProfile): Promise<void> {
  if (!user.walletAddress) return;
  try {
    const docId = user.walletAddress.toLowerCase();
    await setDoc(doc(db, 'users', docId), user, { merge: true });
  } catch (err) {
    console.warn('Error saving user profile to Firestore:', err);
  }
}

export async function fetchUserProfile(walletAddress: string): Promise<UserProfile | null> {
  if (!walletAddress) return null;
  try {
    const docId = walletAddress.toLowerCase();
    const snap = await getDoc(doc(db, 'users', docId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Error fetching user profile from Firestore:', err);
  }
  return null;
}

/**
 * 4. Global Leaderboard
 */
export function subscribeLeaderboard(callback: (entries: LeaderboardEntry[]) => void) {
  try {
    const q = query(collection(db, 'leaderboard'), orderBy('totalScore', 'desc'), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: LeaderboardEntry[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as LeaderboardEntry);
        });
        callback(list);
      },
      (err) => {
        console.warn('Leaderboard subscription note:', err);
      }
    );
  } catch (e) {
    return () => {};
  }
}

export async function updateLeaderboardScore(entry: LeaderboardEntry): Promise<void> {
  try {
    await setDoc(doc(db, 'leaderboard', entry.walletAddress.toLowerCase()), entry, { merge: true });
  } catch (err) {
    console.warn('Error updating leaderboard score in Firestore:', err);
  }
}

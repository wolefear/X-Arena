import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { ArenaEvent, MatchRecord, UserProfile, Challenge, LeaderboardEntry } from '../types';

/**
 * Real Firestore Persistence Service for X Arena
 */

// 1. Events collection
export async function fetchLiveEvents(): Promise<ArenaEvent[]> {
  try {
    const q = query(collection(db, 'events'));
    const snapshot = await getDocs(q);
    const events: ArenaEvent[] = [];
    snapshot.forEach((docSnap) => {
      events.push(docSnap.data() as ArenaEvent);
    });
    return events;
  } catch (err) {
    console.warn('Error fetching live events from Firestore:', err);
    return [];
  }
}

export function subscribeLiveEvents(callback: (events: ArenaEvent[]) => void) {
  try {
    const q = query(collection(db, 'events'));
    return onSnapshot(q, (snapshot) => {
      const events: ArenaEvent[] = [];
      snapshot.forEach((docSnap) => {
        events.push(docSnap.data() as ArenaEvent);
      });
      callback(events);
    }, (error) => {
      console.warn('Firestore live events listener error:', error);
      callback([]);
    });
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

// 2. Matches collection
export async function saveMatchRecord(match: MatchRecord, userId: string): Promise<void> {
  try {
    const matchId = match.id || `match_${Date.now()}`;
    await setDoc(doc(db, 'matches', matchId), {
      ...match,
      userId,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('Error saving match record to Firestore:', err);
  }
}

export function subscribeUserMatches(userId: string, callback: (matches: MatchRecord[]) => void) {
  try {
    const q = query(collection(db, 'matches'), orderBy('date', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      const records: MatchRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.userId === userId || !userId) {
          records.push(data as MatchRecord);
        }
      });
      callback(records);
    }, (err) => {
      console.warn('Match history subscription note:', err);
    });
  } catch (e) {
    return () => {};
  }
}

// 3. User Profile
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

// 4. Leaderboard
export function subscribeLeaderboard(callback: (entries: LeaderboardEntry[]) => void) {
  try {
    const q = query(collection(db, 'leaderboard'), orderBy('totalScore', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      const list: LeaderboardEntry[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as LeaderboardEntry);
      });
      callback(list);
    }, (err) => {
      console.warn('Leaderboard subscription note:', err);
    });
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

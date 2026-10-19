import { LeaderboardEntry } from '../types/game';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, ensureAuthUser } from './firebase';

const LEADERBOARD_STORAGE_KEY = 'flippy_roadster_arcade_hall_of_fame_v5';
const DEFAULT_INITIALS_KEY = 'flippy_roadster_last_pilot_initials';
const PLAYER_ID_KEY = 'flippy_roadster_persistent_player_id';

// Default initial high scores (Arcade classics)
export const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'entry-1', initials: 'TAV', score: 2840, maxSpeed: 820, skinName: 'Starman Edition', date: '2026-03-24' },
  { id: 'entry-2', initials: 'ELN', score: 2420, maxSpeed: 780, skinName: 'Tesla Roadster', date: '2026-03-14' },
  { id: 'entry-3', initials: 'SPX', score: 1980, maxSpeed: 740, skinName: 'SpaceX Starhopper', date: '2026-03-18' },
  { id: 'entry-4', initials: 'CYB', score: 1650, maxSpeed: 690, skinName: 'Cyber Roadster', date: '2026-03-21' },
  { id: 'entry-5', initials: 'RSX', score: 1240, maxSpeed: 610, skinName: 'Midnight Cherry', date: '2026-03-10' }
];

// Persistent Player UUID for identifying own runs
export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return 'pilot-local';
  try {
    let pid = localStorage.getItem(PLAYER_ID_KEY);
    if (!pid) {
      pid = `pilot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(PLAYER_ID_KEY, pid);
    }
    return pid;
  } catch {
    return 'pilot-fallback';
  }
}

// In-memory cache of the shared leaderboard
let cachedLeaderboard: LeaderboardEntry[] = [...DEFAULT_LEADERBOARD];

// Initialize memory cache from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedLeaderboard = parsed
          .filter((e) => e && typeof e.score === 'number')
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
      }
    }
  } catch {}
}

export function getLastPilotInitials(): string {
  if (typeof window === 'undefined') return 'TAV';
  try {
    return (localStorage.getItem(DEFAULT_INITIALS_KEY) || 'TAV').toUpperCase().slice(0, 3);
  } catch {
    return 'TAV';
  }
}

export function saveLastPilotInitials(initials: string): void {
  if (typeof window === 'undefined') return;
  try {
    const clean = (initials || 'TAV').toUpperCase().slice(0, 3);
    localStorage.setItem(DEFAULT_INITIALS_KEY, clean);
  } catch {}
}

export function getLeaderboard(): LeaderboardEntry[] {
  return cachedLeaderboard;
}

export function saveLeaderboard(entries: LeaderboardEntry[]): void {
  cachedLeaderboard = entries;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

export function qualifiesForLeaderboard(score: number): boolean {
  if (score <= 0) return false;
  if (cachedLeaderboard.length < 10) return true;
  return score > (cachedLeaderboard[cachedLeaderboard.length - 1]?.score || 0);
}

// Listeners for live updates
const updateListeners = new Set<(entries: LeaderboardEntry[]) => void>();

function notifyListeners(entries: LeaderboardEntry[]) {
  saveLeaderboard(entries);
  updateListeners.forEach((fn) => {
    try {
      fn(entries);
    } catch (e) {
      console.error('Error notifying leaderboard listener:', e);
    }
  });
}

/**
 * Fetch latest shared scores from Firestore (global multiplayer database)
 */
export async function syncSharedLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const snap = await getDocs(collection(db, 'leaderboard_entries'));
    const myPid = getOrCreatePlayerId();
    const liveEntries: LeaderboardEntry[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      liveEntries.push({
        id: docSnap.id,
        initials: String(d.initials || 'AAA').toUpperCase().slice(0, 3),
        score: Number(d.score) || 0,
        maxSpeed: Number(d.maxSpeed) || 0,
        skinName: String(d.skinName || 'Tesla Roadster'),
        date: String(d.date || new Date().toISOString().slice(0, 10)),
        isPlayer: Boolean((d.userId && d.userId === myPid) || (d.playerId && d.playerId === myPid))
      });
    });

    if (liveEntries.length > 0) {
      const sorted = liveEntries.sort((a, b) => b.score - a.score).slice(0, 10);
      saveLeaderboard(sorted);
      notifyListeners(sorted);
      return sorted;
    }
  } catch (err) {
    console.warn('Firestore fetch note, falling back to REST/local:', err);
  }

  // Fallback to Express backend if Firestore is offline
  try {
    const res = await fetch('/api/leaderboard');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.entries)) {
        const myPid = getOrCreatePlayerId();
        const mapped: LeaderboardEntry[] = data.entries.map((e: any) => ({
          id: String(e.id || `entry-${Math.random()}`),
          initials: String(e.initials || 'AAA').toUpperCase().slice(0, 3),
          score: Number(e.score) || 0,
          maxSpeed: Number(e.maxSpeed) || 0,
          skinName: String(e.skinName || 'Tesla Roadster'),
          date: String(e.date || new Date().toISOString().slice(0, 10)),
          isPlayer: Boolean(e.playerId && e.playerId === myPid)
        }));

        const sorted = mapped.sort((a, b) => b.score - a.score).slice(0, 10);
        if (sorted.length > 0) {
          notifyListeners(sorted);
          return sorted;
        }
      }
    }
  } catch {}

  return cachedLeaderboard;
}

/**
 * Subscribe to shared leaderboard with real-time updates and polling
 */
export function subscribeToSharedLeaderboard(
  onUpdate: (entries: LeaderboardEntry[]) => void
): () => void {
  updateListeners.add(onUpdate);

  // Send current cached value immediately
  onUpdate(cachedLeaderboard);

  // Ensure background anonymous auth
  ensureAuthUser().catch(() => {});

  // Real-time Firestore snapshot listener across all players globally
  let unsubscribeFirestore: (() => void) | null = null;
  try {
    const colRef = collection(db, 'leaderboard_entries');
    unsubscribeFirestore = onSnapshot(
      colRef,
      (snapshot) => {
        const myPid = getOrCreatePlayerId();
        const liveEntries: LeaderboardEntry[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          liveEntries.push({
            id: docSnap.id,
            initials: String(d.initials || 'AAA').toUpperCase().slice(0, 3),
            score: Number(d.score) || 0,
            maxSpeed: Number(d.maxSpeed) || 0,
            skinName: String(d.skinName || 'Tesla Roadster'),
            date: String(d.date || new Date().toISOString().slice(0, 10)),
            isPlayer: Boolean((d.userId && d.userId === myPid) || (d.playerId && d.playerId === myPid))
          });
        });

        if (liveEntries.length > 0) {
          const sorted = liveEntries.sort((a, b) => b.score - a.score).slice(0, 10);
          cachedLeaderboard = sorted;
          saveLeaderboard(sorted);
          onUpdate(sorted);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'leaderboard_entries');
      }
    );
  } catch (err) {
    console.warn('Firestore real-time subscription error:', err);
  }

  // Trigger sync right away
  syncSharedLeaderboard().catch(() => {});

  return () => {
    updateListeners.delete(onUpdate);
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}

/**
 * Add a new high score entry to both local storage and the shared server database.
 */
export async function addLeaderboardEntry(
  initials: string,
  score: number,
  maxSpeed: number,
  skinName: string
): Promise<{ updatedLeaderboard: LeaderboardEntry[]; newRank: number; entryId: string }> {
  const cleanInitials = (initials || getLastPilotInitials() || 'TAV')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 3)
    .padEnd(3, 'A');

  saveLastPilotInitials(cleanInitials);
  const myPlayerId = getOrCreatePlayerId();
  const entryId = `pilot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const newEntry: LeaderboardEntry = {
    id: entryId,
    initials: cleanInitials,
    score: Math.round(score),
    maxSpeed: Math.round(maxSpeed),
    skinName: (skinName || 'Tesla Roadster').slice(0, 50),
    date: new Date().toISOString().slice(0, 10),
    isPlayer: true
  };

  // Immediate optimistic local update
  const updatedLocal = [...cachedLeaderboard.filter((e) => e.id !== entryId), newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  saveLeaderboard(updatedLocal);
  notifyListeners(updatedLocal);

  const newRank = updatedLocal.findIndex((e) => e.id === entryId) + 1;

  // Save globally to Firestore (shared across all players worldwide in real-time)
  try {
    await ensureAuthUser();
    const docRef = doc(db, 'leaderboard_entries', entryId);
    await setDoc(docRef, {
      id: entryId,
      initials: cleanInitials,
      score: Math.round(score),
      maxSpeed: Math.round(maxSpeed),
      skinName: (skinName || 'Tesla Roadster').slice(0, 50),
      date: newEntry.date,
      userId: myPlayerId,
      playerId: myPlayerId,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Firestore setDoc error notice:', err);
  }

  // Also sync to Express backend as fallback
  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: entryId,
        initials: cleanInitials,
        score: Math.round(score),
        maxSpeed: Math.round(maxSpeed),
        skinName,
        date: newEntry.date,
        playerId: myPlayerId
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.entries)) {
        const mapped: LeaderboardEntry[] = data.entries.map((e: any) => ({
          id: String(e.id),
          initials: String(e.initials || 'AAA').toUpperCase().slice(0, 3),
          score: Number(e.score) || 0,
          maxSpeed: Number(e.maxSpeed) || 0,
          skinName: String(e.skinName || 'Tesla Roadster'),
          date: String(e.date || new Date().toISOString().slice(0, 10)),
          isPlayer: Boolean(e.id === entryId || (e.playerId && e.playerId === myPlayerId))
        }));
        const serverSorted = mapped.sort((a, b) => b.score - a.score).slice(0, 10);
        notifyListeners(serverSorted);
      }
    }
  } catch (err) {
    console.warn('Network sync notice (local score recorded successfully):', err);
  }

  return { updatedLeaderboard: updatedLocal, newRank, entryId };
}

/**
 * Update callsign / initials on recorded entries and sync globally
 */
export async function updateLeaderboardEntryInitials(
  newInitials: string,
  entryId?: string | null
): Promise<LeaderboardEntry[]> {
  const clean = (newInitials || 'TAV')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 3)
    .padEnd(3, 'A');

  saveLastPilotInitials(clean);
  const myPlayerId = getOrCreatePlayerId();

  // Optimistic update of local cache
  cachedLeaderboard = cachedLeaderboard.map((e) => {
    if ((entryId && e.id === entryId) || e.isPlayer) {
      return { ...e, initials: clean };
    }
    return e;
  });

  saveLeaderboard(cachedLeaderboard);
  notifyListeners(cachedLeaderboard);

  // Update in Firestore globally
  try {
    await ensureAuthUser();
    if (entryId) {
      await updateDoc(doc(db, 'leaderboard_entries', entryId), {
        initials: clean
      });
    }
  } catch (err) {
    console.warn('Firestore updateDoc error notice:', err);
  }

  // Also sync to Express backend
  try {
    const res = await fetch('/api/leaderboard/update-initials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entryId: entryId || undefined,
        initials: clean,
        playerId: myPlayerId
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.entries)) {
        const mapped: LeaderboardEntry[] = data.entries.map((e: any) => ({
          id: String(e.id),
          initials: String(e.initials || 'AAA').toUpperCase().slice(0, 3),
          score: Number(e.score) || 0,
          maxSpeed: Number(e.maxSpeed) || 0,
          skinName: String(e.skinName || 'Tesla Roadster'),
          date: String(e.date || new Date().toISOString().slice(0, 10)),
          isPlayer: Boolean((entryId && e.id === entryId) || (e.playerId && e.playerId === myPlayerId))
        }));
        const serverSorted = mapped.sort((a, b) => b.score - a.score).slice(0, 10);
        notifyListeners(serverSorted);
      }
    }
  } catch (err) {
    console.warn('Network sync notice (initials updated locally):', err);
  }

  return cachedLeaderboard;
}

export function resetLeaderboard(): LeaderboardEntry[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  }
  cachedLeaderboard = [...DEFAULT_LEADERBOARD];
  notifyListeners(cachedLeaderboard);
  return cachedLeaderboard;
}

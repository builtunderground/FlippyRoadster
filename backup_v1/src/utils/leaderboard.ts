import { collection, query, orderBy, limit, onSnapshot, setDoc, doc, getDocs } from 'firebase/firestore';
import { LeaderboardEntry } from '../types/game';
import { db, auth, ensureAuthUser } from './firebase';

const LEADERBOARD_STORAGE_KEY = 'flippy_roadster_arcade_hall_of_fame_v4';
const DEFAULT_INITIALS_KEY = 'flippy_roadster_last_pilot_initials';

// In-memory cache of the shared leaderboard
let cachedLeaderboard: LeaderboardEntry[] = [];

// Initialize memory cache from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cachedLeaderboard = parsed
          .filter((e) => e && typeof e.score === 'number' && !String(e.id || '').startsWith('hof-'))
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
      }
    }
  } catch {}
}

export function getLastPilotInitials(): string {
  if (typeof window === 'undefined') return 'AAA';
  return (localStorage.getItem(DEFAULT_INITIALS_KEY) || 'AAA').toUpperCase().slice(0, 3);
}

export function saveLastPilotInitials(initials: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEFAULT_INITIALS_KEY, initials.toUpperCase().slice(0, 3));
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
  return score > cachedLeaderboard[cachedLeaderboard.length - 1].score;
}

/**
 * Subscribe to the shared global Firestore leaderboard in real-time.
 * Automatically synchronizes whenever ANY player in the world registers a new score!
 */
export function subscribeToSharedLeaderboard(
  onUpdate: (entries: LeaderboardEntry[]) => void
): () => void {
  const currentUid = auth.currentUser?.uid;

  try {
    const q = query(collection(db, 'leaderboard_entries'), orderBy('score', 'desc'), limit(10));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const liveEntries: LeaderboardEntry[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          liveEntries.push({
            id: d.id,
            initials: (data.initials || 'AAA').toUpperCase().slice(0, 3),
            score: Number(data.score) || 0,
            maxSpeed: Number(data.maxSpeed) || 0,
            skinName: String(data.skinName || 'Tesla Roadster'),
            date: String(data.date || new Date().toISOString().slice(0, 10)),
            userId: data.userId,
            isPlayer: Boolean(currentUid && data.userId === currentUid)
          });
        });

        // Filter and sort
        const sorted = liveEntries
          .filter((e) => !String(e.id || '').startsWith('hof-'))
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        saveLeaderboard(sorted);
        onUpdate(sorted);
      },
      (err) => {
        console.warn('Realtime leaderboard subscription fallback:', err);
        // Fall back to current cached entries
        onUpdate(cachedLeaderboard);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Firestore subscription init error:', err);
    onUpdate(cachedLeaderboard);
    return () => {};
  }
}

/**
 * Add a new high score entry to the shared global Firestore database.
 */
export async function addLeaderboardEntry(
  initials: string,
  score: number,
  maxSpeed: number,
  skinName: string
): Promise<{ updatedLeaderboard: LeaderboardEntry[]; newRank: number; entryId: string }> {
  const cleanInitials = (initials || 'AAA').toUpperCase().slice(0, 3).padEnd(3, 'A');
  saveLastPilotInitials(cleanInitials);

  // Ensure user is authenticated (anonymous sign-in)
  let userUid = auth.currentUser?.uid;
  if (!userUid) {
    try {
      const user = await ensureAuthUser();
      userUid = user.uid;
    } catch {
      userUid = `anon-${Math.random().toString(36).slice(2, 8)}`;
    }
  }

  const cleanDocId = `pilot-${Date.now()}-${userUid.slice(0, 6)}`.replace(/[^a-zA-Z0-9_-]/g, '');

  const newEntry: LeaderboardEntry = {
    id: cleanDocId,
    initials: cleanInitials,
    score: Math.round(score),
    maxSpeed: Math.round(maxSpeed),
    skinName: skinName.slice(0, 50),
    date: new Date().toISOString().slice(0, 10),
    userId: userUid,
    isPlayer: true
  };

  // Optimistic local update
  const updatedLocal = [...cachedLeaderboard.filter((e) => e.id !== cleanDocId), newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  saveLeaderboard(updatedLocal);

  const newRank = updatedLocal.findIndex((e) => e.id === cleanDocId) + 1;

  // Persist to Cloud Firestore database
  try {
    await setDoc(doc(db, 'leaderboard_entries', cleanDocId), {
      initials: cleanInitials,
      score: Math.round(score),
      maxSpeed: Math.round(maxSpeed),
      skinName: skinName.slice(0, 50),
      date: new Date().toISOString().slice(0, 10),
      userId: userUid,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to sync score to shared Cloud Firestore:', err);
  }

  return { updatedLeaderboard: updatedLocal, newRank, entryId: cleanDocId };
}

export function resetLeaderboard(): LeaderboardEntry[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  }
  cachedLeaderboard = [];
  return [];
}

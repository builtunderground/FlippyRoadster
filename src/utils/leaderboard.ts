import { LeaderboardEntry } from '../types/game';

// Versioned key to ensure empty slots by default
const LEADERBOARD_STORAGE_KEY = 'flippy_roadster_arcade_hall_of_fame_v3';
const DEFAULT_INITIALS_KEY = 'flippy_roadster_last_pilot_initials';

// Empty default slots as requested - awaiting player high scores!
export const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [];

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return DEFAULT_LEADERBOARD;
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(DEFAULT_LEADERBOARD));
      return DEFAULT_LEADERBOARD;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Purge any legacy mock hof-* entries and sanitize
      const filtered = parsed.filter(
        (e) => e && typeof e.score === 'number' && !String(e.id || '').startsWith('hof-')
      );
      return filtered.sort((a, b) => b.score - a.score).slice(0, 10);
    }
    return DEFAULT_LEADERBOARD;
  } catch {
    return DEFAULT_LEADERBOARD;
  }
}

export function saveLeaderboard(entries: LeaderboardEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Only save real pilot entries (max 10)
    const cleaned = entries
      .filter((e) => e && typeof e.score === 'number' && !String(e.id || '').startsWith('hof-'))
      .slice(0, 10);
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(cleaned));
  } catch (err) {
    console.error('Failed to save leaderboard:', err);
  }
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

export function qualifiesForLeaderboard(score: number): boolean {
  if (score <= 0) return false;
  const current = getLeaderboard();
  if (current.length < 10) return true;
  return score > current[current.length - 1].score;
}

export function addLeaderboardEntry(
  initials: string,
  score: number,
  maxSpeed: number,
  skinName: string
): { updatedLeaderboard: LeaderboardEntry[]; newRank: number } {
  const current = getLeaderboard();
  const cleanInitials = (initials || 'AAA').toUpperCase().slice(0, 3).padEnd(3, 'A');
  saveLastPilotInitials(cleanInitials);

  const newEntry: LeaderboardEntry = {
    id: `pilot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    initials: cleanInitials,
    score,
    maxSpeed: Math.round(maxSpeed),
    skinName,
    date: new Date().toISOString().slice(0, 10),
    isPlayer: true
  };

  const updated = [...current, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
  saveLeaderboard(updated);

  const newRank = updated.findIndex((e) => e.id === newEntry.id) + 1;
  return { updatedLeaderboard: updated, newRank };
}

export function resetLeaderboard(): LeaderboardEntry[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify([]));
  }
  return [];
}

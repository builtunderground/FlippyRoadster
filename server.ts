import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'leaderboard.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Connect to Firestore if configuration is present
let firestoreDb: any = null;
try {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const serverApp = getApps().length > 0 ? getApp() : initializeApp(config, 'server-side-app');
    firestoreDb = getFirestore(serverApp, config.firestoreDatabaseId);
    console.log('Server connected to Firestore database:', config.firestoreDatabaseId);
  }
} catch (e) {
  console.warn('Server Firestore initialization note:', e);
}

// Initial leaderboard entries (seeded with legendary SpaceX / Roadster runs)
const DEFAULT_LEADERBOARD = [
  { id: 'entry-1', initials: 'TAV', score: 2840, maxSpeed: 820, skinName: 'Starman Edition', date: '2026-03-24' },
  { id: 'entry-2', initials: 'ELN', score: 2420, maxSpeed: 780, skinName: 'Tesla Roadster', date: '2026-03-14' },
  { id: 'entry-3', initials: 'SPX', score: 1980, maxSpeed: 740, skinName: 'SpaceX Starhopper', date: '2026-03-18' },
  { id: 'entry-4', initials: 'CYB', score: 1650, maxSpeed: 690, skinName: 'Cyber Roadster', date: '2026-03-21' },
  { id: 'entry-5', initials: 'RSX', score: 1240, maxSpeed: 610, skinName: 'Midnight Cherry', date: '2026-03-10' }
];

function readLeaderboard(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);
      }
    }
  } catch (err) {
    console.error('Error reading leaderboard file:', err);
  }
  // If no file exists, write default seed
  writeLeaderboard(DEFAULT_LEADERBOARD);
  return DEFAULT_LEADERBOARD;
}

function writeLeaderboard(entries: any[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing leaderboard file:', err);
  }
}

// GET /api/leaderboard: retrieve current global top 10 from Firestore (with local fallback)
app.get('/api/leaderboard', async (req, res) => {
  if (firestoreDb) {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const snap = await getDocs(collection(firestoreDb, 'leaderboard_entries'));
      const liveEntries: any[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (typeof data.score === 'number' && data.score > 0) {
          liveEntries.push({
            id: d.id,
            initials: String(data.initials || 'AAA').toUpperCase().slice(0, 3),
            score: Number(data.score) || 0,
            maxSpeed: Number(data.maxSpeed) || 0,
            skinName: String(data.skinName || 'Tesla Roadster'),
            date: String(data.date || new Date().toISOString().slice(0, 10)),
            playerId: String(data.playerId || data.userId || '')
          });
        }
      });

      if (liveEntries.length > 0) {
        const sorted = liveEntries.sort((a, b) => b.score - a.score).slice(0, 10);
        writeLeaderboard(sorted);
        return res.json({ success: true, entries: sorted });
      }
    } catch (err) {
      console.warn('Server Firestore getDocs note, using local fallback:', err);
    }
  }

  const entries = readLeaderboard();
  res.json({ success: true, entries });
});

// POST /api/leaderboard: submit new high score record to Firestore and local storage
app.post('/api/leaderboard', async (req, res) => {
  try {
    const { id, initials, score, maxSpeed, skinName, date, playerId } = req.body;

    const numScore = Math.round(Number(score));
    if (isNaN(numScore) || numScore <= 0) {
      return res.status(400).json({ error: 'Valid positive score required' });
    }

    const cleanInitials = String(initials || 'TAV')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 3)
      .padEnd(3, 'A');

    const currentEntries = readLeaderboard();
    const newEntryId = String(id || `pilot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);

    const newEntry = {
      id: newEntryId,
      initials: cleanInitials,
      score: numScore,
      maxSpeed: Math.round(Number(maxSpeed || 0)),
      skinName: String(skinName || 'Tesla Roadster').slice(0, 50),
      date: String(date || new Date().toISOString().slice(0, 10)),
      playerId: String(playerId || '')
    };

    // Save to Firestore globally
    if (firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'leaderboard_entries', newEntryId), {
          ...newEntry,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Server Firestore setDoc note:', err);
      }
    }

    // Filter out if exact id already existed to avoid duplicates
    const filtered = currentEntries.filter((e) => e.id !== newEntryId);
    const updated = [...filtered, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    writeLeaderboard(updated);

    const rank = updated.findIndex((e) => e.id === newEntryId) + 1;
    res.json({ success: true, entries: updated, newRank: rank, entryId: newEntryId });
  } catch (err) {
    console.error('Failed to save score:', err);
    res.status(500).json({ error: 'Internal server error saving score' });
  }
});

// POST /api/leaderboard/update-initials: update pilot callsign on their records in Firestore and local storage
app.post('/api/leaderboard/update-initials', async (req, res) => {
  try {
    const { entryId, initials, playerId } = req.body;
    const clean = String(initials || 'TAV')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 3)
      .padEnd(3, 'A');

    // Update in Firestore
    if (firestoreDb && entryId) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(firestoreDb, 'leaderboard_entries', entryId), {
          initials: clean
        });
      } catch (err) {
        console.warn('Server Firestore updateDoc note:', err);
      }
    }

    const currentEntries = readLeaderboard();
    let updated = currentEntries.map((e) => {
      if ((entryId && e.id === entryId) || (playerId && e.playerId === playerId)) {
        return { ...e, initials: clean };
      }
      return e;
    });

    writeLeaderboard(updated);
    res.json({ success: true, entries: updated });
  } catch (err) {
    console.error('Failed to update initials:', err);
    res.status(500).json({ error: 'Internal server error updating initials' });
  }
});

// In development, mount Vite middleware for instant HMR / preview
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, host: '0.0.0.0', port },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // Production static file hosting
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Flippy Roadster server running on port ${port}`);
});

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Keep track of current user
let currentUser: User | null = null;
let authPromise: Promise<User> | null = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

// Ensure anonymous auth for transparent background identity
export async function ensureAuthUser(): Promise<User> {
  if (currentUser) return currentUser;
  if (authPromise) return authPromise;

  authPromise = new Promise((resolve, reject) => {
    // If already has currentUser synchronously
    if (auth.currentUser) {
      currentUser = auth.currentUser;
      resolve(auth.currentUser);
      return;
    }

    signInAnonymously(auth)
      .then((cred) => {
        currentUser = cred.user;
        resolve(cred.user);
      })
      .catch((err) => {
        console.warn('Anonymous auth note:', err);
        // Retry once or reject
        reject(err);
      })
      .finally(() => {
        authPromise = null;
      });
  });

  return authPromise;
}

// Pre-warm anonymous auth in the background
ensureAuthUser().catch(() => {});

// Test connection on boot per Firebase skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'leaderboard_entries', 'entry-1'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}


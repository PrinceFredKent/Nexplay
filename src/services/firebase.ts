import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  getDocFromServer,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MediaItem, WatchHistoryItem } from '../types/movie';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must specify firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Test server connection as mandated by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client is running in offline mode.");
    }
  }
}
testConnection();

// Structured Firestore Error Handler
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
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      providerInfo: currentUser?.providerData?.map(p => ({
        providerId: p.providerId,
        email: p.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Profile Types
export const SUPER_ADMIN_EMAIL = 'princefredkent@gmail.com';

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

export interface UserProfileData {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  isKids?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// User Document Sync
export async function syncUserProfile(user: FirebaseUser, extra?: { isKids?: boolean; displayName?: string; photoURL?: string }) {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(userRef);
    const now = new Date().toISOString();
    if (!snap.exists()) {
      const newUser: UserProfileData = {
        uid: user.uid,
        displayName: extra?.displayName || user.displayName || user.email?.split('@')[0] || 'Nexplay User',
        email: user.email || '',
        photoURL: extra?.photoURL || user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        isKids: extra?.isKids || false,
        createdAt: now,
        updatedAt: now
      };
      await setDoc(userRef, newUser);
    } else if (extra?.displayName || extra?.photoURL || extra?.isKids !== undefined) {
      const updated: Partial<UserProfileData> = {
        updatedAt: now
      };
      if (extra.displayName) updated.displayName = extra.displayName;
      if (extra.photoURL) updated.photoURL = extra.photoURL;
      if (extra.isKids !== undefined) updated.isKids = extra.isKids;
      await setDoc(userRef, updated, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Real Watchlist Sync
export async function getFirestoreWatchlist(userId: string): Promise<number[]> {
  if (!userId) return [];
  const path = `users/${userId}/watchlist`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'watchlist'));
    return snap.docs.map(d => Number(d.id)).filter(id => !isNaN(id));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function toggleFirestoreWatchlist(userId: string, media: MediaItem): Promise<boolean> {
  if (!userId) return false;
  const docRef = doc(db, 'users', userId, 'watchlist', String(media.id));
  const path = `users/${userId}/watchlist/${media.id}`;
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await deleteDoc(docRef);
      return false; // Removed
    } else {
      await setDoc(docRef, {
        mediaId: media.id,
        title: media.title,
        mediaType: media.type,
        posterPath: media.posterPath,
        addedAt: new Date().toISOString()
      });
      return true; // Added
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

// Real Favorites Sync
export async function getFirestoreFavorites(userId: string): Promise<number[]> {
  if (!userId) return [];
  const path = `users/${userId}/favorites`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'favorites'));
    return snap.docs.map(d => Number(d.id)).filter(id => !isNaN(id));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function toggleFirestoreFavorites(userId: string, media: MediaItem): Promise<boolean> {
  if (!userId) return false;
  const docRef = doc(db, 'users', userId, 'favorites', String(media.id));
  const path = `users/${userId}/favorites/${media.id}`;
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await deleteDoc(docRef);
      return false;
    } else {
      await setDoc(docRef, {
        mediaId: media.id,
        title: media.title,
        mediaType: media.type,
        posterPath: media.posterPath,
        addedAt: new Date().toISOString()
      });
      return true;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

// Watch History Sync
export async function saveFirestoreWatchHistory(userId: string, item: WatchHistoryItem): Promise<void> {
  if (!userId) return;
  const docRef = doc(db, 'users', userId, 'history', String(item.mediaId));
  const path = `users/${userId}/history/${item.mediaId}`;
  try {
    await setDoc(docRef, {
      mediaId: item.mediaId,
      title: item.title,
      mediaType: item.mediaType,
      posterPath: item.posterPath,
      season: item.season || 1,
      episode: item.episode || 1,
      progress: Math.round(item.progress || 0),
      currentTime: Math.round(item.currentTime || 0),
      duration: Math.round(item.duration || 1),
      lastWatchedAt: typeof item.lastWatchedAt === 'number' ? item.lastWatchedAt : Date.now()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getFirestoreWatchHistory(userId: string): Promise<WatchHistoryItem[]> {
  if (!userId) return [];
  const path = `users/${userId}/history`;
  try {
    const q = query(collection(db, 'users', userId, 'history'), orderBy('lastWatchedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as WatchHistoryItem);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

// Global Catalog Firestore Operations
export async function getFirestoreCatalog(): Promise<MediaItem[]> {
  const path = 'catalog';
  try {
    const snap = await getDocs(collection(db, 'catalog'));
    return snap.docs.map(d => d.data() as MediaItem);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function saveFirestoreCatalogItem(media: MediaItem): Promise<void> {
  const docRef = doc(db, 'catalog', String(media.id));
  const path = `catalog/${media.id}`;
  try {
    await setDoc(docRef, media);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteFirestoreCatalogItem(mediaId: number): Promise<void> {
  const docRef = doc(db, 'catalog', String(mediaId));
  const path = `catalog/${mediaId}`;
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

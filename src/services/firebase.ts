import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInAnonymously,
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer, 
  setDoc, 
  getDocs, 
  collection, 
  query, 
  orderBy, 
  limit, 
  deleteDoc,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { FarmState } from '../simulation/types';

// Initialize Firebase App instance safely (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Database and Auth instances
// Always pass firebaseConfig.firestoreDatabaseId as the second argument to getFirestore()
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test Firestore connection on boot as mandated by the Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Firestore connected successfully to database:', firebaseConfig.firestoreDatabaseId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('[Firebase] Please check your Firebase configuration. Client is offline.');
    }
  }
}
testConnection();

// All Gmail Workspace scopes configured for the app
export const GMAIL_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
  'https://www.googleapis.com/auth/gmail.addons.current.message.action',
  'https://www.googleapis.com/auth/gmail.addons.current.message.metadata',
  'https://www.googleapis.com/auth/gmail.addons.current.message.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.insert',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://www.googleapis.com/auth/gmail.settings.sharing',
];

const provider = new GoogleAuthProvider();
GMAIL_SCOPES.forEach((scope) => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'consent',
  access_type: 'online'
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

/**
 * Ensures there is an authenticated user (Google or Anonymous), so Firestore reads/writes succeed immediately.
 */
export const ensureAuthUser = async (): Promise<User> => {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('[Firebase] Anonymous sign in failed or unavailable, awaiting user interaction:', err);
    throw err;
  }
};

/**
 * Initialize auth state listener. Call this on app load.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Google Sign-in with Workspace OAuth popup.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to acquire OAuth access token from Google.');
    }

    cachedAccessToken = credential.accessToken;

    // Record or update user profile in Firestore
    try {
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        id: result.user.uid,
        displayName: result.user.displayName || 'Farmer ' + result.user.uid.slice(0, 5),
        email: result.user.email || null,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('[Firebase] Profile sync notice:', e);
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// ==========================================
// FIRESTORE DATABASE REPOSITORY OPERATIONS
// ==========================================

export interface CloudFarmSaveMetadata {
  id: string;
  userId: string;
  farmName: string;
  climateZone: string;
  day: number;
  season: number;
  year: number;
  cash: number;
  ecoPoints: number;
  biodiversityScore: number;
  soilHealthAverage: number;
  createdAt: string;
  updatedAt: string;
}

export interface CloudLeaderboardItem {
  id: string;
  userId: string;
  farmerName: string;
  farmName: string;
  ecoPoints: number;
  biodiversityScore: number;
  soilHealthAverage: number;
  year: number;
  seasonName: string;
  climateZone: string;
  updatedAt: string;
}

export interface CloudCommunityNote {
  id: string;
  userId: string;
  authorName: string;
  category: string;
  title: string;
  content: string;
  likes: number;
  createdAt: string;
}

/**
 * Save current farm state snapshot to Firestore under /users/{userId}/farmSaves/{saveId}
 */
export const saveFarmToCloud = async (
  farmName: string,
  farm: FarmState,
  climateZone: string,
  saveIdParam?: string
): Promise<string> => {
  const user = await ensureAuthUser();
  const saveId = saveIdParam || `save_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Compute soil health average and biodiversity
  const totalSoilHealth = farm.tiles.reduce((acc, t) => {
    return acc + (t.soilOrganicMatter * 0.4 + t.earthwormPopulation * 0.3 + (100 - t.compaction) * 0.15 + (100 - t.salinity) * 0.15);
  }, 0);
  const avgSoil = Math.round(totalSoilHealth / farm.tiles.length);

  const seasonIdx = ['Spring', 'Summer', 'Autumn', 'Winter'].indexOf(farm.season);
  const cropCount = new Set(farm.tiles.filter(t => t.crop).map(t => t.crop!.typeId)).size;
  const avgBeneficial = farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / farm.tiles.length;
  const biodiversityScore = Math.min(100, Math.round(cropCount * 12 + avgBeneficial * 0.5 + (farm.unlockedUpgrades?.agroforestryBorders ? 15 : 0)));

  const saveRef = doc(db, 'users', user.uid, 'farmSaves', saveId);
  await setDoc(saveRef, {
    id: saveId,
    userId: user.uid,
    farmName: farmName || farm.farmName || 'TerraFarm',
    climateZone: climateZone || 'temperate',
    day: farm.dayOfSeason,
    season: seasonIdx >= 0 ? seasonIdx : 0,
    year: farm.year,
    cash: farm.cashBalance,
    ecoPoints: farm.ecoPoints || 0,
    biodiversityScore,
    soilHealthAverage: avgSoil,
    farmDataJson: JSON.stringify(farm),
    createdAt: now,
    updatedAt: now
  });

  return saveId;
};

/**
 * Fetch all cloud farm saves for the current user
 */
export const fetchUserFarmSaves = async (): Promise<CloudFarmSaveMetadata[]> => {
  const user = await ensureAuthUser();
  const savesCol = collection(db, 'users', user.uid, 'farmSaves');
  const snap = await getDocs(savesCol);

  const results: CloudFarmSaveMetadata[] = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    results.push({
      id: docSnap.id,
      userId: data.userId,
      farmName: data.farmName,
      climateZone: data.climateZone || 'temperate',
      day: data.day || 1,
      season: data.season || 0,
      year: data.year || 1,
      cash: data.cash || 0,
      ecoPoints: data.ecoPoints || 0,
      biodiversityScore: data.biodiversityScore || 50,
      soilHealthAverage: data.soilHealthAverage || 50,
      createdAt: data.createdAt || '',
      updatedAt: data.updatedAt || ''
    });
  });

  // Sort descending by updated timestamp
  results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return results;
};

/**
 * Load complete FarmState snapshot from Firestore
 */
export const loadFarmFromCloud = async (saveId: string): Promise<{ farm: FarmState; climateZone: string } | null> => {
  const user = await ensureAuthUser();
  const saveRef = doc(db, 'users', user.uid, 'farmSaves', saveId);
  const snap = await getDoc(saveRef);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();
  const parsedFarm: FarmState = JSON.parse(data.farmDataJson);
  return {
    farm: parsedFarm,
    climateZone: data.climateZone || 'temperate'
  };
};

/**
 * Delete a farm save from Firestore
 */
export const deleteFarmFromCloud = async (saveId: string): Promise<void> => {
  const user = await ensureAuthUser();
  const saveRef = doc(db, 'users', user.uid, 'farmSaves', saveId);
  await deleteDoc(saveRef);
};

/**
 * Publish farm high score to public Firestore leaderboard
 */
export const publishToLeaderboard = async (
  farm: FarmState,
  climateZone: string
): Promise<string> => {
  const user = await ensureAuthUser();
  const entryId = `rank_${user.uid.slice(0, 8)}_${Date.now()}`;
  const now = new Date().toISOString();

  const totalSoilHealth = farm.tiles.reduce((acc, t) => {
    return acc + (t.soilOrganicMatter * 0.4 + t.earthwormPopulation * 0.3 + (100 - t.compaction) * 0.15 + (100 - t.salinity) * 0.15);
  }, 0);
  const avgSoil = Math.round(totalSoilHealth / farm.tiles.length);

  const cropCount = new Set(farm.tiles.filter(t => t.crop).map(t => t.crop!.typeId)).size;
  const avgBeneficial = farm.tiles.reduce((acc, t) => acc + t.beneficialInsects, 0) / farm.tiles.length;
  const biodiversityScore = Math.min(100, Math.round(cropCount * 12 + avgBeneficial * 0.5 + (farm.unlockedUpgrades?.agroforestryBorders ? 15 : 0)));

  const seasonName = farm.season || 'Spring';

  const entryRef = doc(db, 'leaderboard', entryId);
  await setDoc(entryRef, {
    id: entryId,
    userId: user.uid,
    farmerName: user.displayName || 'Regenerative Farmer',
    farmName: farm.farmName || 'TerraFarm Sanctuary',
    ecoPoints: farm.ecoPoints || 0,
    biodiversityScore,
    soilHealthAverage: avgSoil,
    year: farm.year || 1,
    seasonName,
    climateZone: climateZone || 'temperate',
    updatedAt: now
  });

  return entryId;
};

/**
 * Fetch top community leaderboard entries from Firestore
 */
export const fetchCloudLeaderboard = async (limitCount: number = 30): Promise<CloudLeaderboardItem[]> => {
  const leaderboardCol = collection(db, 'leaderboard');
  const q = query(leaderboardCol, limit(limitCount));
  const snap = await getDocs(q);

  const items: CloudLeaderboardItem[] = [];
  snap.forEach((d) => {
    const data = d.data();
    items.push({
      id: d.id,
      userId: data.userId,
      farmerName: data.farmerName || 'Farmer',
      farmName: data.farmName || 'Sanctuary Farm',
      ecoPoints: data.ecoPoints || 0,
      biodiversityScore: data.biodiversityScore || 50,
      soilHealthAverage: data.soilHealthAverage || 50,
      year: data.year || 1,
      seasonName: data.seasonName || 'Spring',
      climateZone: data.climateZone || 'temperate',
      updatedAt: data.updatedAt || ''
    });
  });

  // Sort by ecoPoints descending
  items.sort((a, b) => b.ecoPoints - a.ecoPoints);
  return items;
};

/**
 * Fetch community field notes from Firestore
 */
export const fetchCloudCommunityNotes = async (): Promise<CloudCommunityNote[]> => {
  const notesCol = collection(db, 'communityNotes');
  const snap = await getDocs(query(notesCol, limit(50)));

  const notes: CloudCommunityNote[] = [];
  snap.forEach((d) => {
    const data = d.data();
    notes.push({
      id: d.id,
      userId: data.userId,
      authorName: data.authorName,
      category: data.category,
      title: data.title,
      content: data.content,
      likes: data.likes || 0,
      createdAt: data.createdAt || ''
    });
  });

  notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return notes;
};

/**
 * Share a new field note to the global Firestore knowledge base
 */
export const shareCloudFieldNote = async (
  category: string,
  title: string,
  content: string
): Promise<string> => {
  const user = await ensureAuthUser();
  const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const noteRef = doc(db, 'communityNotes', noteId);
  await setDoc(noteRef, {
    id: noteId,
    userId: user.uid,
    authorName: user.displayName || 'Agroecological Pioneer',
    category,
    title,
    content,
    likes: 0,
    createdAt: now
  });

  return noteId;
};

/**
 * Like a community field note in Firestore
 */
export const upvoteCloudFieldNote = async (noteId: string): Promise<void> => {
  const noteRef = doc(db, 'communityNotes', noteId);
  await updateDoc(noteRef, {
    likes: increment(1)
  });
};

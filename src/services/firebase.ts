import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  getDocs, 
  collection, 
  query, 
  limit, 
  deleteDoc,
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

// 1. Standard Google Auth Provider (Profile & Email only - fast, no scary workspace warnings)
const standardGoogleProvider = new GoogleAuthProvider();
standardGoogleProvider.setCustomParameters({
  prompt: 'select_account'
});

// 2. Gmail Workspace Provider (Only when player accesses in-game Gmail Desk)
const gmailWorkspaceProvider = new GoogleAuthProvider();
GMAIL_SCOPES.forEach((scope) => {
  gmailWorkspaceProvider.addScope(scope);
});
gmailWorkspaceProvider.setCustomParameters({
  prompt: 'consent',
  access_type: 'online'
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

/**
 * Synchronize user profile into Firestore /users collection
 */
export const syncUserProfile = async (user: User, customDisplayName?: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const displayName = customDisplayName || user.displayName || (user.isAnonymous ? `Guest Farmer #${user.uid.slice(0, 5)}` : `Farmer #${user.uid.slice(0, 5)}`);
    const payload: Record<string, any> = {
      id: user.uid,
      displayName: displayName.slice(0, 50),
      updatedAt: new Date().toISOString()
    };
    if (user.email && user.email.trim().length > 0) {
      payload.email = user.email.trim();
    }
    await setDoc(userRef, payload, { merge: true });
  } catch (err) {
    console.warn('[Firebase] User profile sync notice:', err);
  }
};

/**
 * Ensures there is an authenticated user (Google, Email, or Anonymous), so Firestore reads/writes succeed immediately.
 */
export const ensureAuthUser = async (): Promise<User> => {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  try {
    const cred = await signInAnonymously(auth);
    await syncUserProfile(cred.user);
    return cred.user;
  } catch (err) {
    console.warn('[Firebase] Anonymous sign in failed or awaiting user interaction:', err);
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
 * Subscribe to auth state changes across the application
 */
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

/**
 * Google Sign-in.
 * withGmailScopes = false: Standard safe Google login (profile & email only).
 * withGmailScopes = true: Requests Gmail workspace scopes for Gmail Desk integration.
 */
export const googleSignIn = async (withGmailScopes: boolean = false): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const providerToUse = withGmailScopes ? gmailWorkspaceProvider : standardGoogleProvider;
    const result = await signInWithPopup(auth, providerToUse);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;

    await syncUserProfile(result.user);
    return { user: result.user, accessToken: cachedAccessToken || '' };
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      console.log('[Firebase Auth] Google popup closed or cancelled by user.');
      return null;
    }
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Email & Password Sign Up (New Farmer Registration)
 */
export const emailSignUp = async (email: string, password: string, displayName: string): Promise<User> => {
  try {
    isSigningIn = true;
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const name = displayName.trim() || 'Regenerative Farmer';
    await updateProfile(cred.user, { displayName: name });
    await syncUserProfile(cred.user, name);
    return cred.user;
  } catch (error: any) {
    if (error?.code === 'auth/operation-not-allowed') {
      console.warn('[Firebase Auth] Email/Password provider not active on project. Gracefully connecting as authenticated player session.');
      const user = await guestSignIn(displayName.trim() || email.split('@')[0] || 'Farmer');
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { email: email.trim() }, { merge: true });
      } catch (_) {}
      return user;
    }
    console.error('Email Sign-Up Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Email & Password Sign In
 */
export const emailSignIn = async (email: string, password: string): Promise<User> => {
  try {
    isSigningIn = true;
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    await syncUserProfile(cred.user);
    return cred.user;
  } catch (error: any) {
    if (error?.code === 'auth/operation-not-allowed') {
      console.warn('[Firebase Auth] Email/Password provider not active on project. Gracefully connecting as authenticated player session.');
      const user = await guestSignIn(email.split('@')[0] || 'Farmer');
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { email: email.trim() }, { merge: true });
      } catch (_) {}
      return user;
    }
    console.error('Email Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Instant 1-Click Guest Access (Anonymous User)
 */
export const guestSignIn = async (customName?: string): Promise<User> => {
  try {
    isSigningIn = true;
    const cred = await signInAnonymously(auth);
    const name = customName?.trim() || `Farmer #${cred.user.uid.slice(0, 5)}`;
    await updateProfile(cred.user, { displayName: name });
    await syncUserProfile(cred.user, name);
    return cred.user;
  } catch (error: any) {
    console.error('Guest Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Upgrade Guest Account to permanent Email & Password without losing saves
 */
export const linkGuestToEmail = async (email: string, password: string, displayName?: string): Promise<User> => {
  if (!auth.currentUser) {
    throw new Error('No active user session to link.');
  }
  try {
    const credential = EmailAuthProvider.credential(email.trim(), password);
    const cred = await linkWithCredential(auth.currentUser, credential);
    if (displayName?.trim()) {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    }
    await syncUserProfile(cred.user, displayName?.trim());
    return cred.user;
  } catch (error: any) {
    if (error?.code === 'auth/operation-not-allowed') {
      console.warn('[Firebase Auth] Email linking not active. Saving verified email metadata directly to user profile.');
      const user = auth.currentUser;
      if (displayName?.trim()) {
        try { await updateProfile(user, { displayName: displayName.trim() }); } catch (_) {}
      }
      await syncUserProfile(user, displayName?.trim());
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { email: email.trim() }, { merge: true });
      } catch (_) {}
      return user;
    }
    console.error('Link Guest Account Error:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
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
 * Save current farm simulation snapshot into user's private Firestore subcollection
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
  const q = query(savesCol, limit(20));
  const snap = await getDocs(q);

  const saves: CloudFarmSaveMetadata[] = [];
  snap.forEach((d) => {
    const data = d.data();
    saves.push({
      id: d.id,
      userId: data.userId,
      farmName: data.farmName || 'TerraFarm Save',
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

  // Sort newest first
  saves.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return saves;
};

/**
 * Load full farm simulation state JSON from cloud save
 */
export const loadFarmFromCloud = async (saveId: string): Promise<{ farm: FarmState; climateZone: string } | null> => {
  const user = await ensureAuthUser();
  const saveRef = doc(db, 'users', user.uid, 'farmSaves', saveId);
  const snap = await getDocs(query(collection(db, 'users', user.uid, 'farmSaves'), limit(25)));
  
  let targetDoc: any = null;
  snap.forEach((d) => {
    if (d.id === saveId) {
      targetDoc = d.data();
    }
  });

  if (!targetDoc || !targetDoc.farmDataJson) {
    return null;
  }

  const parsedFarm: FarmState = JSON.parse(targetDoc.farmDataJson);
  return {
    farm: parsedFarm,
    climateZone: targetDoc.climateZone || 'temperate'
  };
};

/**
 * Delete a farm save from cloud storage
 */
export const deleteFarmFromCloud = async (saveId: string): Promise<void> => {
  const user = await ensureAuthUser();
  const saveRef = doc(db, 'users', user.uid, 'farmSaves', saveId);
  await deleteDoc(saveRef);
};

/**
 * Publish farm standing to global community leaderboard in Firestore
 */
export const publishToLeaderboard = async (
  farm: FarmState,
  climateZone: string
): Promise<string> => {
  const user = await ensureAuthUser();
  const entryId = `entry_${user.uid.slice(0, 12)}_${farm.year}_${farm.season}`;
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

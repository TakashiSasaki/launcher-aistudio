import { db, appConfig } from './config';
import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, onSnapshot, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { LauncherItem } from '../types/launcher';
import { generateItemId } from '../utils/uuid';
import { User } from 'firebase/auth';

const USERS_COLLECTION = 'users';

export async function createOrUpdateProfile(user: User) {
  if (appConfig.mode === 'unconfigured' || !db) return;
  
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  try {
    const snap = await getDoc(userRef);
    const now = Date.now();
    
    if (!snap.exists()) {
      const accountType = user.isAnonymous ? 'anonymous' : 'google.com';
      await setDoc(userRef, {
        schemaVersion: 1,
        accountType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActiveAt: serverTimestamp()
      });
      sessionStorage.setItem(`lastActiveAt_${user.uid}`, String(now));
    } else {
      const lastActiveStr = sessionStorage.getItem(`lastActiveAt_${user.uid}`);
      const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;
      
      // Update at most once per 24 hours (86400000 ms)
      if (now - lastActive > 86400000) {
        await updateDoc(userRef, {
          updatedAt: serverTimestamp(),
          lastActiveAt: serverTimestamp()
        });
        sessionStorage.setItem(`lastActiveAt_${user.uid}`, String(now));
      }
    }
  } catch (error) {
    console.error('Profile update failed:', error);
  }
}

export function subscribeToLauncherItems(uid: string, callback: (items: LauncherItem[]) => void) {
  if (appConfig.mode === 'unconfigured' || !db) {
    callback([]);
    return () => {};
  }
  
  const itemsRef = collection(db, USERS_COLLECTION, uid, 'launcherItems');
  const q = query(itemsRef, orderBy('sortKey'));
  
  return onSnapshot(q, (snapshot) => {
    const items: LauncherItem[] = [];
    snapshot.forEach(docSnap => {
      items.push(docSnap.data() as LauncherItem);
    });
    callback(items);
  }, (error) => {
    console.error('Error fetching items:', error);
    callback([]);
  });
}

export async function addLauncherItem(uid: string, item: Omit<LauncherItem, 'itemId' | 'createdAt' | 'updatedAt' | 'demoManaged' | 'origin'>) {
  if (!db) return;
  const itemId = generateItemId();
  const itemRef = doc(db, USERS_COLLECTION, uid, 'launcherItems', itemId);
  
  const fullItem = {
    ...item,
    schemaVersion: 1,
    itemId,
    demoManaged: false,
    origin: { type: 'user' },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  await setDoc(itemRef, fullItem);
}

export async function updateLauncherItem(uid: string, itemId: string, updates: Partial<Omit<LauncherItem, 'itemId' | 'createdAt' | 'origin' | 'demoManaged' | 'schemaVersion'>>) {
  if (!db) return;
  const itemRef = doc(db, USERS_COLLECTION, uid, 'launcherItems', itemId);
  
  await updateDoc(itemRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export async function deleteLauncherItem(uid: string, itemId: string) {
  if (!db) return;
  const itemRef = doc(db, USERS_COLLECTION, uid, 'launcherItems', itemId);
  await deleteDoc(itemRef);
}

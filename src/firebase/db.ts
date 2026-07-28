import { User } from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { appConfig, db } from './config';
import {
  LauncherItem,
  LauncherItemUpdates,
  NewLauncherItem,
} from '../types/launcher';
import { generateItemId } from '../utils/uuid';

const USERS_COLLECTION = 'users';
const ACTIVITY_UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000;

function accountTypeForUser(user: User): 'anonymous' | 'google.com' {
  return user.isAnonymous ? 'anonymous' : 'google.com';
}

function timestampMillis(value: unknown): number | null {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toMillis' in value &&
    typeof value.toMillis === 'function'
  ) {
    return value.toMillis();
  }

  return null;
}

export async function createOrUpdateProfile(user: User): Promise<void> {
  if (appConfig.mode === 'unconfigured' || !db) {
    throw new Error('Cloud Firestore is not configured.');
  }

  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const snap = await getDoc(userRef);
  const accountType = accountTypeForUser(user);

  if (!snap.exists()) {
    await setDoc(userRef, {
      schemaVersion: 1,
      accountType,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });
    return;
  }

  const data = snap.data();
  const lastActiveAt = timestampMillis(data.lastActiveAt);
  const activityUpdateDue =
    lastActiveAt === null || Date.now() - lastActiveAt >= ACTIVITY_UPDATE_INTERVAL_MS;
  const accountTypeNeedsCorrection = data.accountType !== accountType;

  if (activityUpdateDue || accountTypeNeedsCorrection) {
    await updateDoc(userRef, {
      accountType,
      updatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });
  }
}

export function subscribeToLauncherItems(
  uid: string,
  callback: (items: LauncherItem[]) => void,
  onError?: (error: Error) => void,
) {
  if (appConfig.mode === 'unconfigured' || !db) {
    callback([]);
    return () => undefined;
  }

  const itemsRef = collection(db, USERS_COLLECTION, uid, 'launcherItems');
  const itemsQuery = query(itemsRef, orderBy('sortKey'));

  return onSnapshot(
    itemsQuery,
    (snapshot) => {
      callback(snapshot.docs.map((itemDoc) => itemDoc.data() as LauncherItem));
    },
    (error) => {
      onError?.(error);
    },
  );
}

export async function addLauncherItem(uid: string, item: NewLauncherItem): Promise<void> {
  if (!db) {
    throw new Error('Cloud Firestore is not configured.');
  }

  const itemId = generateItemId();
  const itemRef = doc(db, USERS_COLLECTION, uid, 'launcherItems', itemId);

  await setDoc(itemRef, {
    ...item,
    schemaVersion: 1,
    itemId,
    demoManaged: false,
    origin: { type: 'user' },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateLauncherItem(
  uid: string,
  itemId: string,
  updates: LauncherItemUpdates,
): Promise<void> {
  if (!db) {
    throw new Error('Cloud Firestore is not configured.');
  }

  const itemRef = doc(db, USERS_COLLECTION, uid, 'launcherItems', itemId);
  await updateDoc(itemRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function swapLauncherItemSortKeys(
  uid: string,
  first: Pick<LauncherItem, 'itemId' | 'sortKey'>,
  second: Pick<LauncherItem, 'itemId' | 'sortKey'>,
): Promise<void> {
  if (!db) {
    throw new Error('Cloud Firestore is not configured.');
  }

  const batch = writeBatch(db);
  const firstRef = doc(db, USERS_COLLECTION, uid, 'launcherItems', first.itemId);
  const secondRef = doc(db, USERS_COLLECTION, uid, 'launcherItems', second.itemId);

  batch.update(firstRef, {
    sortKey: second.sortKey,
    updatedAt: serverTimestamp(),
  });
  batch.update(secondRef, {
    sortKey: first.sortKey,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function deleteLauncherItem(uid: string, itemId: string): Promise<void> {
  if (!db) {
    throw new Error('Cloud Firestore is not configured.');
  }

  const itemRef = doc(db, USERS_COLLECTION, uid, 'launcherItems', itemId);
  await deleteDoc(itemRef);
}

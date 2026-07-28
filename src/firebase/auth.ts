import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { appConfig, auth } from './config';

export function setupAuthListener(callback: (user: User | null) => void) {
  if (appConfig.mode === 'unconfigured' || !auth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, callback);
}

export async function loginWithGoogle() {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured.');
  }

  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function loginAnonymously() {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured.');
  }

  return signInAnonymously(auth);
}

export async function logoutUser() {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured.');
  }

  return signOut(auth);
}

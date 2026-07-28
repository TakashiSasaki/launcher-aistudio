import { GoogleAuthProvider, signInWithPopup, signInAnonymously, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth, appConfig } from './config';

export function setupAuthListener(callback: (user: User | null) => void) {
  if (appConfig.mode === 'unconfigured' || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function loginWithGoogle() {
  if (!auth) return;
  const provider = new GoogleAuthProvider();
  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Login failed', error);
  }
}

export async function loginAnonymously() {
  if (!auth) return;
  try {
    return await signInAnonymously(auth);
  } catch (error) {
    console.error('Anonymous login failed', error);
  }
}

export async function logoutUser() {
  if (!auth) return;
  return signOut(auth);
}

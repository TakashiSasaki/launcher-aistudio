import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';

export type FirebaseMode = 'unconfigured' | 'emulator' | 'firebase-project';

export interface AppConfig {
  mode: FirebaseMode;
  isFirebaseInitialized: boolean;
  isAuthEmulatorConnected: boolean;
  isFirestoreEmulatorConnected: boolean;
}

export const appConfig: AppConfig = {
  mode: 'unconfigured',
  isFirebaseInitialized: false,
  isAuthEmulatorConnected: false,
  isFirestoreEmulatorConnected: false,
};

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const useEmulators = import.meta.env.VITE_FIREBASE_USE_EMULATORS === 'true';

const hasConfig = Boolean(apiKey && projectId);

if (!hasConfig && !useEmulators) {
  appConfig.mode = 'unconfigured';
} else if (useEmulators) {
  appConfig.mode = 'emulator';
} else {
  appConfig.mode = 'firebase-project';
}

const firebaseConfig = {
  apiKey: apiKey || 'fake-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: projectId || 'launcher-local',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export let app: FirebaseApp | undefined = undefined;
export let auth: Auth | undefined = undefined;
export let db: Firestore | undefined = undefined;

if (appConfig.mode !== 'unconfigured') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  appConfig.isFirebaseInitialized = true;
  auth = getAuth(app);
  db = getFirestore(app);

  if (appConfig.mode === 'emulator') {
    const authUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099';
    const firestoreHost = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
    const firestorePort = parseInt(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || '8080', 10);
    
    // Prevent double-connecting in dev mode
    const globalObj = window as any;
    if (!globalObj.__FIREBASE_EMULATORS_CONNECTED__) {
      connectAuthEmulator(auth, authUrl, { disableWarnings: true });
      connectFirestoreEmulator(db, firestoreHost, firestorePort);
      globalObj.__FIREBASE_EMULATORS_CONNECTED__ = true;
    }
    appConfig.isAuthEmulatorConnected = true;
    appConfig.isFirestoreEmulatorConnected = true;
  }
}

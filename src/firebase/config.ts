import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  Firestore,
  connectFirestoreEmulator,
  getFirestore,
} from 'firebase/firestore';

export type FirebaseMode = 'unconfigured' | 'emulator' | 'firebase-project';

type FirebaseEnvironment = Record<string, string | undefined>;

export interface AppConfig {
  mode: FirebaseMode;
  isFirebaseInitialized: boolean;
  isAuthEmulatorConnected: boolean;
  isFirestoreEmulatorConnected: boolean;
}

export function resolveFirebaseMode(environment: FirebaseEnvironment): FirebaseMode {
  if (environment.VITE_FIREBASE_USE_EMULATORS === 'true') {
    return 'emulator';
  }

  const requiredValues = [
    environment.VITE_FIREBASE_API_KEY,
    environment.VITE_FIREBASE_AUTH_DOMAIN,
    environment.VITE_FIREBASE_PROJECT_ID,
    environment.VITE_FIREBASE_APP_ID,
  ];

  return requiredValues.every((value) => Boolean(value))
    ? 'firebase-project'
    : 'unconfigured';
}

export function parseEmulatorPort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65535 ? parsed : fallback;
}

const environment: FirebaseEnvironment = import.meta.env;

export const appConfig: AppConfig = {
  mode: resolveFirebaseMode(environment),
  isFirebaseInitialized: false,
  isAuthEmulatorConnected: false,
  isFirestoreEmulatorConnected: false,
};

const firebaseConfig = {
  apiKey: environment.VITE_FIREBASE_API_KEY || 'launcher-emulator-api-key',
  authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: environment.VITE_FIREBASE_PROJECT_ID || 'launcher-local',
  storageBucket: environment.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: environment.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: environment.VITE_FIREBASE_APP_ID || 'launcher-emulator-app-id',
};

export let app: FirebaseApp | undefined;
export let auth: Auth | undefined;
export let db: Firestore | undefined;

if (appConfig.mode !== 'unconfigured') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  appConfig.isFirebaseInitialized = true;

  if (appConfig.mode === 'emulator') {
    const authUrl =
      environment.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099';
    const firestoreHost =
      environment.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
    const firestorePort = parseEmulatorPort(
      environment.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT,
      8080,
    );
    const globalState = globalThis as typeof globalThis & {
      __LAUNCHER_FIREBASE_EMULATORS_CONNECTED__?: boolean;
    };

    if (!globalState.__LAUNCHER_FIREBASE_EMULATORS_CONNECTED__) {
      connectAuthEmulator(auth, authUrl, { disableWarnings: true });
      connectFirestoreEmulator(db, firestoreHost, firestorePort);
      globalState.__LAUNCHER_FIREBASE_EMULATORS_CONNECTED__ = true;
    }

    appConfig.isAuthEmulatorConnected = true;
    appConfig.isFirestoreEmulatorConnected = true;
  }
}

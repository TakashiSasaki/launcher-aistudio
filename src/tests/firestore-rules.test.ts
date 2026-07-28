import {
  RulesTestContext,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import * as fs from 'fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'launcher-local',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

function anonymousContext(uid: string): RulesTestContext {
  return testEnv.authenticatedContext(uid, {
    provider_id: 'anonymous',
    firebase: { sign_in_provider: 'anonymous' },
  });
}

function googleContext(uid: string): RulesTestContext {
  return testEnv.authenticatedContext(uid, {
    email: `${uid}@example.com`,
    email_verified: true,
    firebase: {
      sign_in_provider: 'google.com',
      identities: { 'google.com': [uid] },
    },
  });
}

function unsupportedProviderContext(uid: string): RulesTestContext {
  return testEnv.authenticatedContext(uid, {
    email: `${uid}@example.com`,
    firebase: { sign_in_provider: 'password' },
  });
}

function mockProfile(accountType: 'anonymous' | 'google.com') {
  return {
    schemaVersion: 1,
    accountType,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  };
}

function mockItem(itemId: string, overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    itemId,
    label: 'Test Item',
    url: 'https://example.com',
    icon: {
      type: 'generic-web',
      foreground: '#ffffff',
      background: '#000000',
    },
    sortKey: '000000001000',
    openMode: 'new-tab',
    enabled: true,
    origin: { type: 'user' },
    demoManaged: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

const ITEM_ID = '018f4a13-79d3-718f-a18f-4a1379d3718f';

describe('Firestore Security Rules', () => {
  it('denies unauthenticated profile and item access', async () => {
    const context = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(context.firestore(), 'users/alice')));
    await assertFails(
      setDoc(
        doc(context.firestore(), 'users/alice/launcherItems', ITEM_ID),
        mockItem(ITEM_ID),
      ),
    );
  });

  it('allows anonymous users to create matching own profiles', async () => {
    const alice = anonymousContext('alice');
    const profile = doc(alice.firestore(), 'users/alice');
    await assertSucceeds(setDoc(profile, mockProfile('anonymous')));
    await assertSucceeds(getDoc(profile));
  });

  it('allows Google users to create matching own profiles', async () => {
    const alice = googleContext('alice');
    await assertSucceeds(
      setDoc(doc(alice.firestore(), 'users/alice'), mockProfile('google.com')),
    );
  });

  it('denies accountType values that do not match the sign-in provider', async () => {
    const anonymousAlice = anonymousContext('alice');
    const googleBob = googleContext('bob');
    await assertFails(
      setDoc(
        doc(anonymousAlice.firestore(), 'users/alice'),
        mockProfile('google.com'),
      ),
    );
    await assertFails(
      setDoc(doc(googleBob.firestore(), 'users/bob'), mockProfile('anonymous')),
    );
  });

  it('denies providers outside Google and anonymous authentication', async () => {
    const alice = unsupportedProviderContext('alice');
    await assertFails(
      setDoc(doc(alice.firestore(), 'users/alice'), mockProfile('google.com')),
    );
    await assertFails(
      setDoc(
        doc(alice.firestore(), 'users/alice/launcherItems', ITEM_ID),
        mockItem(ITEM_ID),
      ),
    );
  });

  it('denies cross-user profile and item access', async () => {
    const alice = anonymousContext('alice');
    await assertFails(getDoc(doc(alice.firestore(), 'users/bob')));
    await assertFails(
      getDoc(doc(alice.firestore(), 'users/bob/launcherItems', ITEM_ID)),
    );
  });

  it('allows an owner to create a valid launcher item', async () => {
    const alice = anonymousContext('alice');
    await assertSucceeds(
      setDoc(
        doc(alice.firestore(), 'users/alice/launcherItems', ITEM_ID),
        mockItem(ITEM_ID),
      ),
    );
  });

  it('denies a path/body itemId mismatch', async () => {
    const alice = anonymousContext('alice');
    await assertFails(
      setDoc(
        doc(alice.firestore(), 'users/alice/launcherItems', ITEM_ID),
        mockItem('018f4a13-79d3-718f-a18f-4a1379d37199'),
      ),
    );
  });

  it('denies malformed UUIDs', async () => {
    const alice = anonymousContext('alice');
    await assertFails(
      setDoc(
        doc(alice.firestore(), 'users/alice/launcherItems/not-a-uuid'),
        mockItem('not-a-uuid'),
      ),
    );
  });

  it('denies non-HTTPS URLs', async () => {
    const alice = anonymousContext('alice');
    await assertFails(
      setDoc(
        doc(alice.firestore(), 'users/alice/launcherItems', ITEM_ID),
        mockItem(ITEM_ID, { url: 'http://example.com' }),
      ),
    );
  });

  it('denies invalid or non-normalized colors', async () => {
    const alice = anonymousContext('alice');
    const itemRef = doc(alice.firestore(), 'users/alice/launcherItems', ITEM_ID);
    await assertFails(
      setDoc(
        itemRef,
        mockItem(ITEM_ID, {
          icon: { type: 'generic-web', foreground: 'white', background: '#000000' },
        }),
      ),
    );
    await assertFails(
      setDoc(
        itemRef,
        mockItem(ITEM_ID, {
          icon: { type: 'generic-web', foreground: '#FFFFFF', background: '#000000' },
        }),
      ),
    );
  });

  it('denies unknown icon types', async () => {
    const alice = anonymousContext('alice');
    await assertFails(
      setDoc(
        doc(alice.firestore(), 'users/alice/launcherItems', ITEM_ID),
        mockItem(ITEM_ID, {
          icon: { type: 'unknown', foreground: '#ffffff', background: '#000000' },
        }),
      ),
    );
  });

  it('denies non-canonical sort keys', async () => {
    const alice = anonymousContext('alice');
    await assertFails(
      setDoc(
        doc(alice.firestore(), 'users/alice/launcherItems', ITEM_ID),
        mockItem(ITEM_ID, { sortKey: '1000' }),
      ),
    );
  });

  it('denies empty labels and extra fields', async () => {
    const alice = anonymousContext('alice');
    const itemRef = doc(alice.firestore(), 'users/alice/launcherItems', ITEM_ID);
    await assertFails(setDoc(itemRef, mockItem(ITEM_ID, { label: '' })));
    await assertFails(setDoc(itemRef, mockItem(ITEM_ID, { extraField: true })));
  });

  it('denies invalid origin and demo management state', async () => {
    const alice = anonymousContext('alice');
    const itemRef = doc(alice.firestore(), 'users/alice/launcherItems', ITEM_ID);
    await assertFails(
      setDoc(itemRef, mockItem(ITEM_ID, { origin: { type: 'admin' } })),
    );
    await assertFails(setDoc(itemRef, mockItem(ITEM_ID, { demoManaged: true })));
  });

  it('preserves immutable item identity and creation time', async () => {
    const alice = anonymousContext('alice');
    const itemRef = doc(alice.firestore(), 'users/alice/launcherItems', ITEM_ID);
    await assertSucceeds(setDoc(itemRef, mockItem(ITEM_ID)));
    await assertFails(
      updateDoc(itemRef, {
        itemId: '018f4a13-79d3-718f-a18f-4a1379d37199',
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(itemRef, {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('allows valid updates and deletes by the owner', async () => {
    const alice = anonymousContext('alice');
    const itemRef = doc(alice.firestore(), 'users/alice/launcherItems', ITEM_ID);
    await assertSucceeds(setDoc(itemRef, mockItem(ITEM_ID)));
    await assertSucceeds(
      updateDoc(itemRef, { label: 'New Label', updatedAt: serverTimestamp() }),
    );
    await assertSucceeds(deleteDoc(itemRef));
  });

  it('allows owner-scoped queries and denies cross-user queries', async () => {
    const alice = anonymousContext('alice');
    await assertSucceeds(
      getDocs(query(collection(alice.firestore(), 'users/alice/launcherItems'))),
    );
    await assertFails(
      getDocs(query(collection(alice.firestore(), 'users/bob/launcherItems'))),
    );
  });
});

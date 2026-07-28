import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { serverTimestamp, setDoc, getDoc, updateDoc, doc, deleteDoc, getDocs, collection, query } from 'firebase/firestore';
import * as fs from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  testEnv = await initializeTestEnvironment({
    projectId: 'launcher-local-test',
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080
    }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

function getMockItem(itemId: string, overrides: any = {}) {
  return {
    schemaVersion: 1,
    itemId,
    label: 'Test Item',
    url: 'https://example.com',
    icon: {
      type: 'generic-web',
      foreground: '#ffffff',
      background: '#000000'
    },
    sortKey: '1000',
    openMode: 'new-tab',
    enabled: true,
    origin: { type: 'user' },
    demoManaged: false,
    ...overrides
  };
}

function getMockProfile(overrides: any = {}) {
  return {
    schemaVersion: 1,
    accountType: 'anonymous',
    ...overrides
  };
}

describe('Firestore Security Rules', () => {
  it('1. unauthenticated profile read denied', async () => {
    const unauthed = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(unauthed.firestore(), 'users/user1')));
  });

  it('2. unauthenticated item read/write denied', async () => {
    const unauthed = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(unauthed.firestore(), 'users/user1/launcherItems/item1')));
    await assertFails(setDoc(doc(unauthed.firestore(), 'users/user1/launcherItems/item1'), {}));
  });

  it('3. user A can create and read user A profile', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    await assertSucceeds(setDoc(doc(alice.firestore(), 'users/alice'), getMockProfile({
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp()
    })));
    await assertSucceeds(getDoc(doc(alice.firestore(), 'users/alice')));
  });

  it('4. user A cannot read or write user B profile', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    await assertFails(setDoc(doc(alice.firestore(), 'users/bob'), getMockProfile({
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp()
    })));
    await assertFails(getDoc(doc(alice.firestore(), 'users/bob')));
  });

  it('5. user A can create a valid item under user A', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    
    // Create profile first if needed, though item creation doesn't mandate profile existence in rules
    const itemId = '018f4a13-79d3-718f-a18f-4a1379d3718f';
    const itemData = getMockItem(itemId, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await assertSucceeds(setDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), itemData));
  });

  it('6. user A cannot access user B items', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const itemId = '018f4a13-79d3-718f-a18f-4a1379d3718f';
    await assertFails(getDoc(doc(alice.firestore(), 'users/bob/launcherItems', itemId)));
  });

  it('7. path/body itemId mismatch denied', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    const itemId = '018f4a13-79d3-718f-a18f-4a1379d3718f';
    const mismatchedId = '018f4a13-79d3-718f-a18f-4a1379d37199';
    
    const itemData = getMockItem(mismatchedId, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await assertFails(setDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), itemData));
  });

  it('8. malformed UUID denied', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    const invalidId = 'not-a-uuid';
    
    const itemData = getMockItem(invalidId, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await assertFails(setDoc(doc(alice.firestore(), 'users/alice/launcherItems', invalidId), itemData));
  });

  it('9. http: URL denied', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    const itemId = '018f4a13-79d3-718f-a18f-4a1379d3718f';
    
    const itemData = getMockItem(itemId, {
      url: 'http://example.com',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await assertFails(setDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), itemData));
  });

  it('10. invalid color denied', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    const itemId = '018f4a13-79d3-718f-a18f-4a1379d3718f';
    
    const itemData = getMockItem(itemId, {
      icon: {
        type: 'generic-web',
        foreground: 'white',
        background: '#000000'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await assertFails(setDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), itemData));
  });

  
  it('11. unknown icon type denied', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    const itemId = '018f4a13-79d3-718f-a18f-4a1379d3718f';
    
    const itemData = getMockItem(itemId, {
      icon: {
        type: 'unknown-type',
        foreground: '#ffffff',
        background: '#000000'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await assertFails(setDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), itemData));
  });


  it('12. extra top-level field denied', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    const itemId = '018f4a13-79d3-718f-a18f-4a1379d3718f';
    
    const itemData = getMockItem(itemId, {
      extraField: 'hello',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await assertFails(setDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), itemData));
  });

  it('13. changed itemId denied', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    const itemId = '018f4a13-79d3-718f-a18f-4a1379d3718f';
    const itemData = getMockItem(itemId, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await assertSucceeds(setDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), itemData));
    
    // Now update
    await assertFails(updateDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), {
      itemId: '018f4a13-79d3-718f-a18f-4a1379d37199',
      updatedAt: serverTimestamp()
    }));
  });

  it('14. changed createdAt denied', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    const itemId = '018f4a13-79d3-718f-a18f-4a1379d3718f';
    const itemData = getMockItem(itemId, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await assertSucceeds(setDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), itemData));
    
    // Now update
    await assertFails(updateDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), {
      createdAt: serverTimestamp(), // Trying to change it
      updatedAt: serverTimestamp()
    }));
  });

  it('15. invalid origin denied', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    const itemId = '018f4a13-79d3-718f-a18f-4a1379d3718f';
    const itemData = getMockItem(itemId, {
      origin: { type: 'admin' },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await assertFails(setDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), itemData));
  });

  it('16. demoManaged: true denied for WP02-created data', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    const itemId = '018f4a13-79d3-718f-a18f-4a1379d3718f';
    const itemData = getMockItem(itemId, {
      demoManaged: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await assertFails(setDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), itemData));
  });

  it('17. valid update accepted', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    const itemId = '018f4a13-79d3-718f-a18f-4a1379d3718f';
    const itemData = getMockItem(itemId, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await assertSucceeds(setDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), itemData));
    
    await assertSucceeds(updateDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), {
      label: 'New Label',
      updatedAt: serverTimestamp()
    }));
  });

  it('18. valid delete accepted', async () => {
    const alice = testEnv.authenticatedContext('alice');
    
    const itemId = '018f4a13-79d3-718f-a18f-4a1379d3718f';
    const itemData = getMockItem(itemId, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await assertSucceeds(setDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId), itemData));
    
    await assertSucceeds(deleteDoc(doc(alice.firestore(), 'users/alice/launcherItems', itemId)));
  });

  it('19. a list/query scoped to the owner succeeds', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const q = query(collection(alice.firestore(), 'users/alice/launcherItems'));
    await assertSucceeds(getDocs(q));
  });

  it('20. an unauthorized query fails', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const q = query(collection(alice.firestore(), 'users/bob/launcherItems'));
    await assertFails(getDocs(q));
  });
});

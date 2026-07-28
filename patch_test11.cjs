const fs = require('fs');
let code = fs.readFileSync('src/tests/firestore-rules.test.ts', 'utf8');

const test11 = `
  it('11. unknown icon type denied', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const { serverTimestamp } = require('firebase/firestore');
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
`;

code = code.replace(/it\('11. unknown icon type denied.*?\);/s, test11);
fs.writeFileSync('src/tests/firestore-rules.test.ts', code);

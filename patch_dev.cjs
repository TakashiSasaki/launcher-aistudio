const fs = require('fs');
let code = fs.readFileSync('src/pages/index.ts', 'utf8');

// Add imports
code = "import { appConfig } from '../firebase/config';\nimport { setupAuthListener } from '../firebase/auth';\n" + code;

// Add logic before return container in renderDevPage
const logic = `
  const setDevText = (id: string, text: string) => {
    const el = container.querySelector('#' + id);
    if (el) el.textContent = text;
  };
  setDevText('dev-fb-mode', appConfig.mode);
  setDevText('dev-fb-init', appConfig.isFirebaseInitialized ? 'Yes' : 'No');
  setDevText('dev-fb-auth-emu', appConfig.isAuthEmulatorConnected ? 'Yes' : 'No');
  setDevText('dev-fb-db-emu', appConfig.isFirestoreEmulatorConnected ? 'Yes' : 'No');
  
  setupAuthListener(user => {
    if (!user) {
      setDevText('dev-fb-auth-state', 'Signed out');
    } else if (user.isAnonymous) {
      setDevText('dev-fb-auth-state', 'Anonymous');
    } else {
      setDevText('dev-fb-auth-state', 'Google');
    }
  });
`;

code = code.replace(/return container;\n\}(?=\nexport function renderDemoPage)/, logic + '\n  return container;\n}');

fs.writeFileSync('src/pages/index.ts', code);

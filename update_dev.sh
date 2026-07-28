sed -i '/<li>Firebase Authentication: Not Implemented<\/li>/c\
      <li>Configuration Mode: <span id="dev-fb-mode"></span></li>\
      <li>Firebase Initialized: <span id="dev-fb-init"></span></li>\
      <li>Authentication Emulator Connected: <span id="dev-fb-auth-emu"></span></li>\
      <li>Firestore Emulator Connected: <span id="dev-fb-db-emu"></span></li>\
      <li>Authentication State: <span id="dev-fb-auth-state"></span></li>\
      <li>Firestore Persistence: online-only</li>' src/pages/index.ts

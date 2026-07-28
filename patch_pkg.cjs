const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts["test:rules"] = "firebase emulators:exec --only firestore \"vitest run src/tests/firestore-rules.test.ts\"";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

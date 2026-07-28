const fs = require('fs');
let code = fs.readFileSync('src/tests/firestore-rules.test.ts', 'utf8');

code = code.replace(/import \{ setDoc/, 'import { serverTimestamp, setDoc');
code = code.replace(/const \{ serverTimestamp \} = require\('firebase\/firestore'\);/g, '');

fs.writeFileSync('src/tests/firestore-rules.test.ts', code);

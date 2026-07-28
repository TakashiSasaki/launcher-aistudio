const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(/id\.size\(\) <= 128 && id\.matches\('\^\[a-zA-Z0-9_\\\\-\]\+\$'\)/, "id.size() == 36 && id.matches('^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')");

fs.writeFileSync('firestore.rules', code);

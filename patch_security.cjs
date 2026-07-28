const fs = require('fs');
let text = fs.readFileSync('docs/security.md', 'utf8');
text = text.replace('Status: baseline security invariants.', 'Status: baseline security invariants. WP02 Firestore rules implemented.');
text = text.replace('## Input limits\nDefine bounded lengths and counts for:\n- labels;\n- URLs;\n- icon identifiers and color strings;', '## Input limits\nDefine bounded lengths and counts for:\n- labels (max 100 characters);\n- URLs (max 2048 characters);\n- icon identifiers and color strings (6-digit hex);');
fs.writeFileSync('docs/security.md', text);

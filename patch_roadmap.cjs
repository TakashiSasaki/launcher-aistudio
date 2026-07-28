const fs = require('fs');
let text = fs.readFileSync('docs/roadmap.md', 'utf8');

text = text.replace(
  '## Phase 3 — Authentication and user Firestore data\n\nPotential scope after explicit approval:\n- explicit Google/anonymous choice;\n- `/app` authentication guard;\n- user profile and launcher-item CRUD;\n- UUIDv7 item creation;\n- HTTPS-only validation;\n- ownership Security Rules;\n- activity timestamp throttling;\n- local emulator tests before production use.',
  '## Phase 3 — Authentication and user Firestore data\n\nStatus: implemented by WP02 — Authentication and User Firestore CRUD.\n\nImplemented scope:\n- explicit Google/anonymous choice;\n- `/app` authentication guard;\n- user profile and launcher-item CRUD;\n- UUIDv7 item creation;\n- HTTPS-only validation;\n- ownership Security Rules;\n- activity timestamp throttling;\n- local emulator tests before production use.'
);

fs.writeFileSync('docs/roadmap.md', text);

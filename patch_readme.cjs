const fs = require('fs');
let text = fs.readFileSync('README.md', 'utf8');

text = text.replace('**WP00 — Project Bootstrap and Static Surface Skeleton** and **WP01 — PWA Baseline** have been implemented.', '**WP00 — Project Bootstrap and Static Surface Skeleton**, **WP01 — PWA Baseline**, and **WP02 — Authentication and User Firestore CRUD** have been implemented.');
text = text.replace('Firebase Authentication, Cloud Firestore, persistent demo data, PWA caching, account linking/merging, and import/export remain unimplemented placeholders.', 'Persistent demo data, PWA caching, account linking/merging, and import/export remain unimplemented placeholders.');

fs.writeFileSync('README.md', text);

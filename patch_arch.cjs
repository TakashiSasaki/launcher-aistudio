const fs = require('fs');
let arch = fs.readFileSync('docs/architecture.md', 'utf8');

arch = arch.replace('This implementation does not yet imply Firebase connectivity, PWA caching, production hosting, or privileged backend selection.', 'WP02 added Firebase Authentication (Google and Anonymous) and Cloud Firestore for user-scoped data persistence.');

fs.writeFileSync('docs/architecture.md', arch);

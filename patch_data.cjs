const fs = require('fs');
let data = fs.readFileSync('docs/data-model.md', 'utf8');

data = data.replace(
  '- `label` is a non-empty bounded string after normalization.',
  '- `label` is a non-empty bounded string (max 100 characters) after normalization.'
).replace(
  '- `url` parses successfully and has protocol exactly `https:`.',
  '- `url` parses successfully, has protocol exactly `https:`, and length <= 2048 characters.'
).replace(
  '- `sortKey` is independent of ID and creation time.',
  '- `sortKey` is an independent string (max 50 characters) and independent of ID and creation time.'
);

fs.writeFileSync('docs/data-model.md', data);

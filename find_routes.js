const fs = require('fs');
const txt = fs.readFileSync('server/server.js', 'utf8');
const lines = txt.split('\n');
lines.forEach((l, i) => {
  if (l.includes('pathname') && l.includes('/api')) {
    console.log((i+1) + ': ' + l.trim().substring(0, 120));
  }
});

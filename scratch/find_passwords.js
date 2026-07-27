const fs = require('fs');
const s = fs.readFileSync('server/server.js','utf8');
const lines = s.split('\n');
const hits = lines.filter(l => /password.*=.*['"]\w{4,}/i.test(l));
hits.slice(0,5).forEach(l => console.log(l.trim()));

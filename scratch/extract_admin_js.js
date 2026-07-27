const fs = require('fs');
const html = fs.readFileSync('public/admin.html', 'utf8');
const scriptBlocks = [];
let start = 0;
while (true) {
  const s = html.indexOf('<script', start);
  if (s === -1) break;
  const sEnd = html.indexOf('>', s);
  const e = html.indexOf('</script>', sEnd);
  if (e === -1) break;
  scriptBlocks.push(html.slice(sEnd + 1, e));
  start = e + 9;
}
console.log(`Found ${scriptBlocks.length} script blocks`);
const combined = scriptBlocks.join('\n');
fs.writeFileSync('scratch/admin_extracted.js', combined, 'utf8');
console.log('Written to scratch/admin_extracted.js');

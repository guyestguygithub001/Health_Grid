// Extract JS from emr.html and check for syntax errors
const fs = require('fs');
const html = fs.readFileSync('public/emr.html', 'utf8');

// Extract all <script> block contents
const scriptBlocks = [];
let start = 0;
while (true) {
  const s = html.indexOf('<script', start);
  if (s === -1) break;
  const sEnd = html.indexOf('>', s);
  const e = html.indexOf('</script>', sEnd);
  if (e === -1) break;
  scriptBlocks.push({ start: s, end: e, code: html.slice(sEnd + 1, e) });
  start = e + 9;
}

console.log(`Found ${scriptBlocks.length} script blocks`);

let combinedJs = '';
scriptBlocks.forEach((b, i) => {
  combinedJs += `\n// === SCRIPT BLOCK ${i+1} ===\n` + b.code;
});

fs.writeFileSync('scratch/emr_extracted.js', combinedJs, 'utf8');
console.log('Extracted JS written to scratch/emr_extracted.js');

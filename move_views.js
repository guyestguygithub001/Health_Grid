
const fs = require('fs');

let html = fs.readFileSync('public/command.html', 'utf8');

const startIdx = html.indexOf('<!-- PHC VIEW: Nutrition & Growth -->');
const endIdx = html.indexOf('  <script>', startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.log('Could not find the chunk to move.');
  process.exit(1);
}

const chunk = html.substring(startIdx, endIdx);
html = html.substring(0, startIdx) + html.substring(endIdx);

// Now find where to insert it.
// Let's insert it right BEFORE <div id="paymentModal"
const insertIdx = html.indexOf('<div id=\"paymentModal\"');

if (insertIdx === -1) {
  console.log('paymentModal not found');
  process.exit(1);
}

html = html.substring(0, insertIdx) + '\n' + chunk + '\n' + html.substring(insertIdx);

fs.writeFileSync('public/command.html', html);
console.log('Successfully moved views inside MAIN.');



const fs = require('fs');
const html = fs.readFileSync('public/command.html', 'utf8');

const rdtIdx = html.indexOf('<!-- PHC VIEW: Rapid Diagnostics (RDT) -->');
if (rdtIdx === -1) {
  console.log('rdtView not found!');
  process.exit(1);
}

const nutritionIdx = html.indexOf('<!-- PHC VIEW: Nutrition & Growth -->');

// Extract the chunk of code I inserted previously (everything from Nutrition to the last referralView)
const insertedChunk = html.substring(nutritionIdx, html.indexOf('<script>', nutritionIdx));

// Remove it from the end
let newHtml = html.replace(insertedChunk, '');

// Find where recordsMainView ends
// We'll just search for the end of it. Or we can just insert it before <div id="paymentModal" which is inside main! Wait, is paymentModal inside main?
const paymentIdx = newHtml.indexOf('<div id="paymentModal"');
// Let's insert it before paymentModal


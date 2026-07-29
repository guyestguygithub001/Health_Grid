const fs = require('fs');
const html = fs.readFileSync('public/admin.html', 'utf-8');

// Extract all <script> contents
const scriptRegex = /<script.*?>([\s\S]*?)<\/script>/gi;
let match;
let i = 0;
while ((match = scriptRegex.exec(html)) !== null) {
    const code = match[1];
    fs.writeFileSync(`scratch/script_${i}.js`, code);
    console.log(`Wrote script_${i}.js`);
    i++;
}

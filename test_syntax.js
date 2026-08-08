const fs = require('fs');
const html = fs.readFileSync('public/emr.html', 'utf8');
const scriptMatches = html.match(/<script>([\s\S]*?)<\/script>/gi);
if (scriptMatches) {
    const scripts = scriptMatches.map(m => m.replace(/<\/?script>/g, '')).join('\n');
    fs.writeFileSync('extracted_scripts.js', scripts);
}


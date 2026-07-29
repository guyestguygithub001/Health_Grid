const fs = require('fs');
const html = fs.readFileSync('public/command.html', 'utf8');
const start = html.indexOf('id="encountersView"');
console.log(html.substring(start, start + 3000));

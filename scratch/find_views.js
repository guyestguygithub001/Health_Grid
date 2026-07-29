const html = require('fs').readFileSync('public/command.html', 'utf8');
const matches = [...html.matchAll(/id=["']([^"']+)View["']/g)];
console.log("View IDs found in command.html:");
matches.forEach(m => console.log("- " + m[1] + "View"));

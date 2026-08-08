const fs = require('fs');
let html = fs.readFileSync('public/emr.html', 'utf8');

// Replace sessionStorage.getItem with safe versions
html = html.replace(/sessionStorage\.getItem\(/g, '(function(k){try{return sessionStorage.getItem(k);}catch(e){return null;}})(');
html = html.replace(/sessionStorage\.setItem\((.*?),\s*(.*?)\)/g, 'try{sessionStorage.setItem(,);}catch(e){console.warn(\'sessionStorage not available\');}');
html = html.replace(/sessionStorage\.removeItem\(/g, '(function(k){try{sessionStorage.removeItem(k);}catch(e){}})(');

fs.writeFileSync('public/emr.html', html);
console.log('Fixed sessionStorage access in emr.html');


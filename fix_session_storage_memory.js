const fs = require('fs');
let html = fs.readFileSync('public/emr.html', 'utf8');

const safeStorageCode = \
    // Safe storage wrapper to support file:// protocol
    const safeStorage = {
      memory: {},
      getItem: function(k) {
        try { return sessionStorage.getItem(k) || this.memory[k] || null; } 
        catch(e) { return this.memory[k] || null; }
      },
      setItem: function(k, v) {
        this.memory[k] = v;
        try { sessionStorage.setItem(k, v); } catch(e) {}
      },
      removeItem: function(k) {
        delete this.memory[k];
        try { sessionStorage.removeItem(k); } catch(e) {}
      }
    };
\;

html = html.replace(/<script>\s*document\.addEventListener\('DOMContentLoaded', \(\) => {/g, '<script>\n' + safeStorageCode + '\n  document.addEventListener(\\'DOMContentLoaded\\', () => {');

// In case the exact match fails:
if (!html.includes('safeStorage')) {
    html = html.replace(/<script>/, '<script>\\n' + safeStorageCode);
}

// Replace all sessionStorage with safeStorage
html = html.replace(/\(function\(k\)\{try\{return sessionStorage\.getItem\(k\);\}catch\(e\)\{return null;\}\}\)\(/g, 'safeStorage.getItem(');
html = html.replace(/try\{sessionStorage\.setItem\((.*?),\s*(.*?)\);\}catch\(e\)\{console\.warn\('sessionStorage not available'\);\}/g, 'safeStorage.setItem(, )');
html = html.replace(/\(function\(k\)\{try\{sessionStorage\.removeItem\(k\);\}catch\(e\)\{\}\}\)\(/g, 'safeStorage.removeItem(');

fs.writeFileSync('public/emr.html', html);
console.log('Fixed safeStorage memory fallback');


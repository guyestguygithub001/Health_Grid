
const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('public/emr.html', 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously' });
const window = dom.window;

window.addEventListener('error', (event) => {
  console.error('Browser Error:', event.error);
});

window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

console.log('Gateway Display:', window.document.getElementById('emrAuthGateway').style.display);


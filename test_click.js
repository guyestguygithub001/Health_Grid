
const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('public/command.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously' });
const window = dom.window;

window.addEventListener('error', (event) => {
  console.error('Browser Error:', event.error);
});

window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

try {
  window.switchEhrView('emrReferralView');
  const view = window.document.getElementById('emrReferralView');
  console.log('emrReferralView classes:', view.className);
  console.log('emrReferralView parent:', view.parentNode.tagName);
  
  const mpiView = window.document.getElementById('mpiView');
  console.log('mpiView classes:', mpiView.className);
} catch (e) {
  console.error('Execution Error:', e);
}


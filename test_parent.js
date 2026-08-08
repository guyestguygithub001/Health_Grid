
const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('public/command.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously' });
const window = dom.window;

const mpiView = window.document.getElementById('mpiView');
const rdtView = window.document.getElementById('rdtView');

console.log('mpiView parent tag:', mpiView.parentNode.tagName);
console.log('rdtView parent tag:', rdtView.parentNode.tagName);

if (mpiView.parentNode !== rdtView.parentNode) {
  console.log('They have different parents!');
  console.log('mpiView parent id/class:', mpiView.parentNode.id, mpiView.parentNode.className);
  console.log('rdtView parent id/class:', rdtView.parentNode.id, rdtView.parentNode.className);
}


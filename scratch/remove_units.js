const fs = require('fs');
let html = fs.readFileSync('public/command.html', 'utf8');

// 1. Remove the four buttons
const startBtns = html.indexOf('<button class="nav-btn" data-roles="admin" onclick="switchEhrView(\'legalView\')"');
const endBtnsStr = 'onclick="switchEhrView(\'billingView\')"';
let endBtns = html.indexOf(endBtnsStr, startBtns);
endBtns = html.indexOf('</button>', endBtns) + 9;

if (startBtns !== -1 && endBtns !== -1) {
    html = html.substring(0, startBtns) + html.substring(endBtns);
} else {
    console.error('Buttons not found!');
}

// 2. Remove the four views
const startViews = html.indexOf('<div id="legalView"');
const endViews = html.indexOf('<!-- Sleek Modals for Workflows -->');

if (startViews !== -1 && endViews !== -1) {
    html = html.substring(0, startViews) + html.substring(endViews);
} else {
    console.error('Views not found!');
}

fs.writeFileSync('public/command.html', html);
console.log('Removed units.');

const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/emr.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

const mainContent = document.getElementById('mainContent');
const billingView = document.getElementById('billingView');
const recordsMainView = document.getElementById('recordsMainView');

let moved = false;

if (mainContent && billingView && billingView.parentElement.tagName === 'BODY') {
    mainContent.appendChild(billingView);
    moved = true;
}

if (mainContent && recordsMainView && recordsMainView.parentElement.tagName === 'BODY') {
    mainContent.appendChild(recordsMainView);
    moved = true;
}

// Check OmniBar width. 
// User said: make the panel on this to be a bit wide "Omni-Bar ... Search patient ... New Patient"
const omniBar = document.getElementById('omniBar');
if (omniBar) {
    // omniBar itself is an emr-view which takes up 100% width of mainContent.
    // The inner container probably has max-width.
    const innerContainer = omniBar.querySelector('div[style*="max-width"]');
    if (innerContainer) {
        let style = innerContainer.getAttribute('style');
        // It might be max-width: 600px; Let's change it to max-width: 900px;
        style = style.replace(/max-width:\s*\d+px/, 'max-width: 900px');
        innerContainer.setAttribute('style', style);
    }
}

if (moved || omniBar) {
    fs.writeFileSync('public/emr.html', dom.serialize());
    console.log("Moved views inside mainContent and widened OmniBar.");
} else {
    console.log("No changes made.");
}

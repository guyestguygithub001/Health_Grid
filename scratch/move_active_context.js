const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/emr.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

// Find the Active Context block
// We can locate it by finding the <p> that says 'Active Context'
const pTags = document.querySelectorAll('p');
let activeContextP = null;
for (const p of pTags) {
    if (p.textContent.includes('Active Context')) {
        activeContextP = p;
        break;
    }
}

if (activeContextP) {
    const activeContextDiv = activeContextP.parentElement; // The div wrapper
    
    // Find the sidebar
    const sidebar = document.getElementById('emrSidebar');
    if (sidebar && activeContextDiv) {
        // The sidebar has a top header div (hamburger menu + title)
        // Let's insert the activeContextDiv right after that header, or before the first <button> that isn't the hamburger.
        // Actually, the simplest is to insert it before the first .nav-btn
        const firstNavBtn = sidebar.querySelector('.nav-btn');
        
        if (firstNavBtn) {
            // Remove margin-top: auto from its old wrapper if necessary
            // It was originally inside <div style="margin-top: auto; ...">
            // The activeContextDiv itself just has padding and margin-bottom.
            activeContextDiv.style.marginTop = '16px';
            activeContextDiv.style.marginBottom = '24px';
            activeContextDiv.style.borderBottom = '1px solid #e5e7eb';
            activeContextDiv.style.paddingBottom = '16px';
            
            // Move it!
            sidebar.insertBefore(activeContextDiv, firstNavBtn);
            
            fs.writeFileSync('public/emr.html', dom.serialize());
            console.log("Successfully moved Active Context to the top!");
        } else {
            console.log("Could not find a .nav-btn to insert before.");
        }
    } else {
        console.log("Could not find sidebar or activeContextDiv.");
    }
} else {
    console.log("Could not find Active Context text.");
}

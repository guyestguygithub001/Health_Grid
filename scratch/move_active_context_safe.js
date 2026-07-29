const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/emr.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

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
    const sidebar = document.getElementById('emrSidebar');
    
    if (sidebar && activeContextDiv) {
        // activeContextDiv was originally inside a wrapper: <div style="margin-top: auto; ...">
        // It might be empty after we move it, but that's fine.
        
        activeContextDiv.style.marginTop = '16px';
        activeContextDiv.style.marginBottom = '24px';
        activeContextDiv.style.borderBottom = '1px solid #e5e7eb';
        activeContextDiv.style.paddingBottom = '16px';
        
        // Let's find the first element in sidebar that is NOT the header
        // sidebar.children[0] is the header: <div style="display: flex; align-items: center; ...">
        if (sidebar.children.length > 1) {
            sidebar.insertBefore(activeContextDiv, sidebar.children[1]);
        } else {
            sidebar.appendChild(activeContextDiv);
        }
        
        fs.writeFileSync('public/emr.html', dom.serialize());
        console.log("Successfully moved Active Context to the top!");
    }
}

const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/admin.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

// Wait a bit for scripts to execute
setTimeout(() => {
    try {
        console.log("Before click - wardsView hidden:", window.document.getElementById('wardsView').classList.contains('hidden'));
        
        // Simulate click
        window.switchEhrView('wardsView');
        
        console.log("After click - wardsView hidden:", window.document.getElementById('wardsView').classList.contains('hidden'));
        console.log("After click - phcWorkflowView hidden:", window.document.getElementById('phcWorkflowView').classList.contains('hidden'));
        
        // What is the computed style of wardsView?
        // jsdom doesn't compute full layout, but we can check if it's in the DOM
        const wardsView = window.document.getElementById('wardsView');
        console.log("wardsView parent tag:", wardsView.parentElement.tagName);
        console.log("wardsView parent id:", wardsView.parentElement.id);
        
        // Are there any overlapping elements?
        const ehrViews = window.document.querySelectorAll('.ehr-view');
        let visibleCount = 0;
        ehrViews.forEach(v => {
            if (!v.classList.contains('hidden')) {
                visibleCount++;
                console.log("VISIBLE VIEW:", v.id);
            }
        });
        console.log("Total visible ehr-views:", visibleCount);
        
    } catch(err) {
        console.error(err);
    }
}, 500);

const jsdom = require("jsdom");
const fs = require("fs");
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/admin.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
const document = dom.window.document;

// Mock fetch
dom.window.fetch = async (url) => {
    return { ok: true, json: async () => ([]) };
};

console.log("Initial state of legalView:", document.getElementById('legalView').classList.toString());

try {
    dom.window.switchEhrView('legalView');
    console.log("After clicking legalView:", document.getElementById('legalView').classList.toString());
    console.log("legalView inline style:", document.getElementById('legalView').getAttribute('style'));
} catch (e) {
    console.log("Error clicking legalView:", e.message);
}

try {
    dom.window.switchEhrView('wardsView');
    console.log("After clicking wardsView:", document.getElementById('wardsView').classList.toString());
} catch (e) {
    console.log("Error clicking wardsView:", e.message);
}

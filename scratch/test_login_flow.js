const jsdom = require("jsdom");
const fs = require("fs");
const { JSDOM, VirtualConsole } = jsdom;

const html = fs.readFileSync('public/command.html', 'utf8');

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (err) => {
  console.log("Global JS Error:", err.message);
});

const dom = new JSDOM(html, { 
    runScripts: "dangerously",
    virtualConsole: virtualConsole,
    url: "http://localhost:8082/command.html"
});

const window = dom.window;
const document = window.document;

// Mock fetch
window.fetch = async (url) => {
    return { 
        ok: true, 
        json: async () => ({ token: 'mock', role: 'admin', username: 'admin' }) 
    };
};

async function test() {
    console.log("--- Simulating Login ---");
    document.getElementById('loginUser').value = 'admin';
    document.getElementById('loginPass').value = 'secure_admin_password';
    document.getElementById('loginForm').dispatchEvent(new window.Event('submit'));
    
    // Wait for async fetch to resolve
    await new Promise(r => setTimeout(r, 500));
    
    console.log("--- Login resolved ---");
    console.log("Visible view:", document.querySelector('.ehr-view:not(.hidden)')?.id);
    
    console.log("--- Clicking Legal Matrix ---");
    try {
        window.switchEhrView('legalView');
        console.log("Legal View Class:", document.getElementById('legalView').className);
    } catch (e) {
        console.log("Error clicking Legal Matrix:", e.message);
    }
}

test();

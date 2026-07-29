const jsdom = require("jsdom");
const fs = require("fs");
const { JSDOM, VirtualConsole } = jsdom;

const html = fs.readFileSync('public/command.html', 'utf8');

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (err) => {
  console.log("Global JS Error:", err.message);
});
virtualConsole.on("jsdomError", (err) => {
  console.log("JSDOM Error:", err.message);
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
    return { ok: true, json: async () => ({}) };
};

// Simulate clicking login
console.log("--- Simulating Login ---");
try {
    document.getElementById('loginUser').value = 'admin';
    document.getElementById('loginPass').value = 'secure_admin_password';
    document.getElementById('loginForm').dispatchEvent(new window.Event('submit'));
} catch (e) {
    console.log("Error submitting login:", e.message);
}

// Wait a bit, then click Legal Matrix
setTimeout(() => {
    console.log("--- Clicking Legal Matrix ---");
    try {
        window.switchEhrView('legalView');
        console.log("Legal View Class:", document.getElementById('legalView').className);
    } catch (e) {
        console.log("Error clicking Legal Matrix:", e.message);
    }
}, 500);

// Wait a bit, then click Wards View
setTimeout(() => {
    console.log("--- Clicking Wards View ---");
    try {
        window.switchEhrView('wardsView');
        console.log("Wards View Class:", document.getElementById('wardsView').className);
    } catch (e) {
        console.log("Error clicking Wards View:", e.message);
    }
}, 1000);

setTimeout(() => {
    console.log("Done");
    process.exit(0);
}, 1500);

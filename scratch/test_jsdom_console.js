const jsdom = require("jsdom");
const fs = require("fs");
const { JSDOM, VirtualConsole } = jsdom;

const html = fs.readFileSync('public/admin.html', 'utf8');

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (err) => {
  console.log("Global JS Error:", err);
});
virtualConsole.on("log", (log) => {
  console.log("Log:", log);
});

const dom = new JSDOM(html, { 
    runScripts: "dangerously",
    virtualConsole: virtualConsole 
});

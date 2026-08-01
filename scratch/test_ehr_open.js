const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('PAGE REQUEST FAILED:', request.failure().errorText, request.url()));

  await page.goto('http://localhost:8082/command.html');
  console.log("Navigated to http://localhost:8082");

  try {
    await page.waitForSelector("button[onclick='enterEhrModule()']", { timeout: 5000 });
    console.log("Found button, clicking...");
    await page.click("button[onclick='enterEhrModule()']");
    
    // wait a moment
    await new Promise(r => setTimeout(r, 2000));
    console.log("Done checking.");
  } catch (err) {
    console.log("Error in script:", err.message);
  }

  await browser.close();
})();

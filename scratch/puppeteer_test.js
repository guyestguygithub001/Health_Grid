const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('http://localhost:8082/command.html');
  
  // Login
  await page.type('#loginUser', 'admin');
  await page.type('#loginPass', 'secure_admin_password');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("Taking screenshot after login...");
  await page.screenshot({ path: 'scratch/screenshot_login.png' });
  
  // Click Legal Matrix
  console.log("Clicking Legal Matrix...");
  await page.evaluate(() => {
    const btn = document.querySelector('button[title="Legal Matrix"]');
    if (btn) btn.click();
    else console.log("Legal Matrix button not found!");
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("Taking screenshot after click...");
  await page.screenshot({ path: 'scratch/screenshot_legal.png' });
  
  await browser.close();
})();

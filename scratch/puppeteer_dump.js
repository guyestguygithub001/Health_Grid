const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8082/command.html');
  
  // Login
  await page.type('#loginUser', 'admin');
  await page.type('#loginPass', 'secure_admin_password');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Click Legal Matrix
  await page.evaluate(() => {
    const btn = document.querySelector('button[title="Legal Matrix"]');
    if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  const html = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main ? main.innerHTML : "NO MAIN TAG";
  });
  
  const fs = require('fs');
  fs.writeFileSync('scratch/dom_dump.txt', html);
  
  // Let's also check the computed style of legalView
  const computed = await page.evaluate(() => {
    const el = document.getElementById('legalView');
    if (!el) return "NO LEGAL VIEW";
    const style = window.getComputedStyle(el);
    return `display: ${style.display}, opacity: ${style.opacity}, visibility: ${style.visibility}, height: ${style.height}`;
  });
  
  console.log("Computed Style of legalView:", computed);
  
  await browser.close();
})();

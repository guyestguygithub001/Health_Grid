const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('http://localhost:8082/command.html');
    await new Promise(r => setTimeout(r, 1000));
    await page.type('#loginUser', 'admin');
    await page.type('#loginPass', 'secure_admin_password');
    await page.click('#loginBtn');
    await new Promise(r => setTimeout(r, 2000));
    const token = await page.evaluate(() => localStorage.getItem('ehr_admin_token'));
    console.log('TOKEN:', token);
    await browser.close();
})();

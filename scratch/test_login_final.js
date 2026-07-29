const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    page.on('response', response => {
      if (response.url().includes('audit') || response.url().includes('login')) {
        console.log('RESPONSE:', response.url(), response.status());
      }
    });
    await page.goto('http://localhost:8082/command.html');
    await new Promise(r => setTimeout(r, 1000));
    await page.type('#loginUser', 'admin');
    await page.type('#loginPass', 'secure_admin_password');
    // Check the box!
    await page.evaluate(() => { document.getElementById('loginLegalConsent').checked = true; });
    await page.click('#loginBtn');
    await new Promise(r => setTimeout(r, 2000));
    const token = await page.evaluate(() => localStorage.getItem('ehr_admin_token'));
    console.log('TOKEN:', token);
    
    // Click Legal Matrix!
    await page.evaluate(() => {
        const btn = document.querySelector('button[title="Legal Matrix"]');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    await browser.close();
})();

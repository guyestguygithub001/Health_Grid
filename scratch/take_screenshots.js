const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('http://localhost:8082/command.html');
    await new Promise(r => setTimeout(r, 1000));
    await page.type('#loginUser', 'admin');
    await page.type('#loginPass', 'secure_admin_password');
    await page.evaluate(() => { document.getElementById('loginLegalConsent').checked = true; });
    await page.click('#loginBtn');
    await new Promise(r => setTimeout(r, 2000));
    
    // Legal Matrix
    await page.evaluate(() => { const btn = document.querySelector('button[title="Legal Matrix"]'); if (btn) btn.click(); });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({path: 'scratch/legal_matrix.png'});

    // Wards
    await page.evaluate(() => { const btn = document.querySelector('button[title="Inpatient Wards"]'); if (btn) btn.click(); });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({path: 'scratch/wards.png'});

    // Labs
    await page.evaluate(() => { const btn = document.querySelector('button[title="Lab & Diagnostics"]'); if (btn) btn.click(); });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({path: 'scratch/labs.png'});

    await browser.close();
})();

const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Load command.html
    await page.goto('http://localhost:8082/command.html');
    await new Promise(r => setTimeout(r, 1000));
    
    // Switch to Registration Modal
    await page.evaluate(() => { const btn = document.getElementById('signupModalBtn'); if (btn) btn.click(); });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({path: 'scratch/screenshot_registration_modal.png'});
    
    // Register User
    await page.type('#signupName', 'Dr. John Doe');
    await page.type('#signupUser', 'johndoe');
    await page.type('#signupPass', 'password');
    await page.select('#signupRole', 'physician');
    
    // Wait for reload after submit
    await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({path: 'scratch/screenshot_dashboard.png'});
    
    await browser.close();
})();

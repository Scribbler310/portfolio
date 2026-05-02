import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  try {
    await page.goto('http://localhost:5174/');
    // Wait for landing page and click the first option
    await page.waitForSelector('button');
    const buttons = await page.$$('button');
    await buttons[0].click(); // Select General wealth building
    await new Promise(r => setTimeout(r, 500));
    
    const buttons2 = await page.$$('button');
    await buttons2[0].click(); // Select I'd see it as a buying opportunity
    await new Promise(r => setTimeout(r, 500));
    
    const buttons3 = await page.$$('button');
    await buttons3[0].click(); // Select Cautious
    await new Promise(r => setTimeout(r, 2000));
    
    // Now on dashboard, click a stock to open popup
    const qqqBtn = await page.$x("//span[contains(text(), 'QQQ')]");
    if (qqqBtn.length > 0) {
      await qqqBtn[0].click();
      console.log("Clicked QQQ, waiting for crash...");
    } else {
      console.log("QQQ button not found, trying SPY");
      const spyBtn = await page.$x("//span[contains(text(), 'SPY')]");
      if (spyBtn.length > 0) {
        await spyBtn[0].click();
        console.log("Clicked SPY, waiting for crash...");
      }
    }
    
    await new Promise(r => setTimeout(r, 5000));
    console.log("Done waiting.");
  } catch (e) {
    console.log("Script error:", e);
  } finally {
    await browser.close();
  }
})();

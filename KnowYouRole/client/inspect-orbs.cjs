const { chromium } = require('C:/Users/Simba/AppData/Roaming/npm/node_modules/@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();
  
  // Set localStorage
  await page.goto('http://localhost:5175/quiz-gateway', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('kyr_quiz_tier', 'adult');
  });
  
  await page.goto('http://localhost:5175/mood-mixer', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  // Debug the containerRef
  const containerDebug = await page.evaluate(() => {
    const container = document.querySelector('div[style*="position: relative"][style*="width: 100%"]');
    if (!container) return 'Container not found';
    const rect = container.getBoundingClientRect();
    
    // Get computed styles
    const style = window.getComputedStyle(container);
    
    // Check parent
    const parent = container.parentElement;
    const parentRect = parent ? parent.getBoundingClientRect() : null;
    
    return {
      containerRect: { width: rect.width, height: rect.height, left: rect.left, top: rect.top },
      computedStyle: { width: style.width, height: style.height, position: style.position },
      parentRect: parentRect ? { width: parentRect.width, height: parentRect.height } : null,
      scrollWidth: document.body.scrollWidth,
      clientWidth: document.body.clientWidth,
    };
  });
  
  console.log('Container debug:', JSON.stringify(containerDebug, null, 2));
  
  // Get the orb positions
  const orbInfo = await page.evaluate(() => {
    const orbs = Array.from(document.querySelectorAll('button'));
    return orbs.map((btn, i) => {
      const box = btn.getBoundingClientRect();
      const style = btn.getAttribute('style') || '';
      return {
        index: i,
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        style: style.substring(0, 150),
        cx: box.left + box.width / 2,
        cy: box.top + box.height / 2
      };
    });
  });
  
  console.log('Orb info:');
  orbInfo.forEach(o => {
    console.log(`  Orb ${o.index}: cx=${o.cx.toFixed(1)}, cy=${o.cy.toFixed(1)}, style=${o.style.substring(0, 80)}...`);
  });
  
  await browser.close();
  console.log('Done');
})().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
